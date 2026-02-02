'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllHoKhau,
  createPhieuThu,
  getKhoanThuBatBuoc,
  getAllThuPhi,
  deleteKhoanThu,
  deletePhieuThu,
} from '../api';
import {
  CheckCircle2,
  DollarSign,
  Layers,
  Trash2,
  AlertCircle,
  Search,
  Filter,
  Calendar,
  Users,
  ChevronRight,
  Receipt,
  Home,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';

export default function QuanLyCacKhoanThu() {
  const queryClient = useQueryClient();

  // --- STATE ---
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [activeKhoanThu, setActiveKhoanThu] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => 2024 + i);
  }, []);

  // --- HELPERS ---
  const getCleanId = (obj: any) => {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    return obj._id || obj.id || String(obj);
  };

  // --- DATA FETCHING ---
  const { data: dsHoKhau = [] } = useQuery({
    queryKey: ['ho-khau'],
    queryFn: async () => {
      const res = await getAllHoKhau();
      return Array.isArray(res) ? res : [];
    },
  });

  const { data: dsKhoanThu = [], isLoading: isLoadingKhoanThu } = useQuery({
    queryKey: ['khoan-thu-bat-buoc'],
    queryFn: async () => {
      const res = await getKhoanThuBatBuoc();
      return Array.isArray(res) ? res : res?.data || [];
    },
  });

  const { data: dsPhieuThu = [] } = useQuery({
    queryKey: ['thu-phi-history'],
    queryFn: async () => {
      const res = await getAllThuPhi();
      return Array.isArray(res) ? res : res?.data || [];
    },
  });

  useEffect(() => {
    if (!activeKhoanThu && dsKhoanThu.length > 0) setActiveKhoanThu(dsKhoanThu[0]);
  }, [dsKhoanThu, activeKhoanThu]);

  const calculateFee = useCallback(
    (hoKhau: any) => {
      if (!activeKhoanThu) return { tongTien: 0, kyThuLabel: '' };
      const donGia = Number(activeKhoanThu.soTien || 0);
      const tenKhoan = activeKhoanThu.tenKhoanThu?.toLowerCase() || '';
      const soNK = hoKhau.thanhVien?.length || 0;

      if (tenKhoan.includes('vệ sinh')) {
        return { tongTien: donGia * soNK * 12, kyThuLabel: `Năm ${selectedYear}` };
      }
      return { tongTien: donGia * soNK, kyThuLabel: `Tháng ${selectedMonth}/${selectedYear}` };
    },
    [activeKhoanThu, selectedMonth, selectedYear]
  );

  const paymentStatusMap = useMemo(() => {
    const map = new Map();
    dsPhieuThu.forEach((pt: any) => {
      const hkId = getCleanId(pt.hoKhauId);
      pt.chiTietThu?.forEach((ct: any) => {
        const ktId = getCleanId(ct.khoanThuId);
        const key = `${hkId}-${ktId}-${pt.kyThu}`;
        map.set(key, pt.trangThai);
      });
    });
    return map;
  }, [dsPhieuThu]);

  // --- MUTATIONS ---
  const thuPhiMutation = useMutation({
    mutationFn: async (payload: any) => await createPhieuThu(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['thu-phi-history'] });
    },
  });

  // --- HÀM XỬ LÝ CHÍNH (ĐÃ FIX THEO LỖI TRONG ẢNH) ---
  const handleThuPhiLe = async (hoKhau: any, status: 'Đã thu' | 'Chưa thu' = 'Đã thu') => {
    if (!activeKhoanThu) return toast.error("Vui lòng chọn loại phí");

    const { tongTien, kyThuLabel } = calculateFee(hoKhau);
    const ktId = getCleanId(activeKhoanThu);
    const hkId = getCleanId(hoKhau);

    // Chuẩn bị payload theo đúng yêu cầu Validation của Backend
    const payload = {
      hoKhauId: hkId,
      maPhieuThu: `PT-${ktId.slice(-4)}-${Date.now().toString().slice(-6)}`,
      tenChuHo: hoKhau.chuHo?.hoTen || 'N/A',
      diaChi: String(hoKhau.diaChi || hoKhau.chuHo?.diaChi || "Địa chỉ chưa cập nhật"),
      soNhanKhau: hoKhau.thanhVien?.length || 0, // THÊM TRƯỜNG NÀY (Sửa lỗi: soNhanKhau must be a number)
      nam: selectedYear,
      kyThu: kyThuLabel,
      trangThai: status,
      chiTietThu: [{
        khoanThuId: ktId,
        tenKhoanThu: activeKhoanThu.tenKhoanThu,
        soTien: tongTien
      }],
      tongTien,
      ngayThu: new Date().toISOString()
    };

    const promise = thuPhiMutation.mutateAsync(payload);
    toast.promise(promise, {
      loading: status === 'Đã thu' ? 'Đang ghi nhận thu tiền...' : 'Đang ghi nhận nợ...',
      success: 'Thao tác thành công!',
      error: (err) => {
        // Hiển thị lỗi chi tiết từ backend nếu có
        const serverMsg = err.response?.data?.message;
        return Array.isArray(serverMsg) ? serverMsg.join(', ') : (serverMsg || 'Lỗi kết nối server');
      },
    });
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden text-[#1E293B]">
      {/* SIDEBAR */}
      <aside className="w-80 bg-white border-r border-slate-200 flex flex-col shadow-sm">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-indigo-600 rounded-xl shadow-indigo-200">
              <Layers className="text-white" size={20} />
            </div>
            <h2 className="text-xl font-extrabold">Danh mục phí</h2>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Tìm hộ gia đình..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 space-y-2">
          {isLoadingKhoanThu ? (
             <div className="p-4 text-center text-slate-400">Đang tải...</div>
          ) : (
            dsKhoanThu.map((kt: any) => (
              <div
                key={getCleanId(kt)}
                onClick={() => setActiveKhoanThu(kt)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  getCleanId(activeKhoanThu) === getCleanId(kt)
                    ? 'bg-indigo-50 border-indigo-200 shadow-sm'
                    : 'bg-white border-transparent hover:bg-slate-50'
                }`}
              >
                <p className="font-bold text-slate-700">{kt.tenKhoanThu}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs font-semibold text-indigo-600">
                    {Number(kt.soTien).toLocaleString()} đ
                  </span>
                  <ChevronRight size={14} className="text-slate-300" />
                </div>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="px-10 py-6 flex justify-between items-center bg-white border-b">
          <div>
            <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
              {activeKhoanThu?.tenKhoanThu || 'Chọn loại phí'}
            </h1>
            <p className="text-slate-500 text-sm flex items-center gap-2">
              <Calendar size={14} /> Hệ thống quản lý thu phí 2026
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="bg-transparent px-3 py-1.5 font-bold text-slate-600 outline-none cursor-pointer"
            >
              {Array.from({ length: 12 }, (_, i) => <option key={i+1} value={i+1}>Tháng {i+1}</option>)}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-transparent px-3 py-1.5 font-bold text-slate-600 outline-none cursor-pointer border-l"
            >
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-8">
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="p-5 text-[11px] font-bold text-slate-400 uppercase">Hộ Gia Đình</th>
                  <th className="p-5 text-center text-[11px] font-bold text-slate-400 uppercase">Nhân khẩu</th>
                  <th className="p-5 text-right text-[11px] font-bold text-slate-400 uppercase">Phải nộp</th>
                  <th className="p-5 text-center text-[11px] font-bold text-slate-400 uppercase">Trạng thái</th>
                  <th className="p-5 text-center text-[11px] font-bold text-slate-400 uppercase">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {dsHoKhau
                  .filter(hk => (hk.thanhVien?.length || 0) > 0 &&
                         (hk.chuHo?.hoTen?.toLowerCase().includes(searchTerm.toLowerCase())))
                  .map((hk: any) => {
                    const { tongTien, kyThuLabel } = calculateFee(hk);
                    const status = paymentStatusMap.get(`${getCleanId(hk)}-${getCleanId(activeKhoanThu)}-${kyThuLabel}`);

                    return (
                      <tr key={getCleanId(hk)} className="hover:bg-slate-50/50 transition-all">
                        <td className="p-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                              <Home size={18} />
                            </div>
                            <div>
                              <p className="font-bold text-slate-800">{hk.chuHo?.hoTen}</p>
                              <p className="text-[10px] font-mono text-slate-400 uppercase">#{getCleanId(hk).slice(-6)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-5 text-center">
                          <span className="bg-slate-100 px-2.5 py-1 rounded-lg text-xs font-bold text-slate-600">
                            {hk.thanhVien?.length}
                          </span>
                        </td>
                        <td className="p-5 text-right font-black text-indigo-600">
                          {tongTien.toLocaleString()} đ
                        </td>
                        <td className="p-5 text-center">
                          {status === 'Đã thu' ? (
                            <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-[10px] font-bold border border-emerald-100">
                              <CheckCircle2 size={12} /> ĐÃ NỘP
                            </span>
                          ) : status === 'Chưa thu' ? (
                            <span className="inline-flex items-center gap-1 text-amber-600 bg-amber-50 px-3 py-1 rounded-full text-[10px] font-bold border border-amber-100">
                              <Clock size={12} /> ĐANG NỢ
                            </span>
                          ) : (
                            <span className="text-slate-300 text-[10px] italic">Chưa lập phiếu</span>
                          )}
                        </td>
                        <td className="p-5">
                          <div className="flex justify-center gap-2">
                            {status !== 'Đã thu' ? (
                              <>
                                <button
                                  onClick={() => handleThuPhiLe(hk, 'Đã thu')}
                                  className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all active:scale-95"
                                >
                                  Thu tiền
                                </button>
                                <button
                                  onClick={() => handleThuPhiLe(hk, 'Chưa thu')}
                                  className="text-slate-400 hover:text-amber-600 text-[11px] font-medium"
                                >
                                  Ghi nợ
                                </button>
                              </>
                            ) : (
                              <CheckCircle2 className="text-emerald-500" size={20} />
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
