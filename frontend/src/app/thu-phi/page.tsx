'use client';
import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllThuPhi,
  getKhoanThuBatBuoc,
  getKhoanThuTuNguyen,
  deletePhieuThu,
  createKhoanThu,
  updatePhieuThu,
} from './api';
import {
  Search,
  CheckCircle,
  Clock,
  Wallet,
  Heart,
  Eye,
  X,
  Trash2,
  Plus,
  Banknote,
  AlertCircle, // Icon cảnh báo nợ
} from 'lucide-react';
import { toast } from 'sonner';

export default function QuanLyThuPhi() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addType, setAddType] = useState<'Bắt buộc' | 'Tự nguyện'>('Bắt buộc');

  const [formData, setFormData] = useState({
    tenKhoanThu: '',
    soTien: '',
    ngayBatDau: new Date().toISOString().split('T')[0],
  });

  const [detailModal, setDetailModal] = useState<{
    isOpen: boolean;
    type: 'bat-buoc' | 'tu-nguyen' | 'dang-no' | null;
    title: string;
    data: any[];
  }>({
    isOpen: false,
    type: null,
    title: '',
    data: [],
  });

  // 1. DATA FETCHING
  const { data: listBatBuocDef = [] } = useQuery({
    queryKey: ['khoan-thu-bat-buoc'],
    queryFn: async () => {
      const res = await getKhoanThuBatBuoc();
      return Array.isArray(res) ? res : res?.data || [];
    },
  });

  const { data: listTuNguyenDef = [] } = useQuery({
    queryKey: ['khoan-thu-tu-nguyen'],
    queryFn: async () => {
      const res = await getKhoanThuTuNguyen();
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

  // 2. MUTATIONS
  const createKhoanThuMutation = useMutation({
    mutationFn: async (payload: any) => await createKhoanThu(payload),
    onSuccess: () => {
      toast.success('Đã thêm khoản thu mới!');
      queryClient.invalidateQueries({ queryKey: ['khoan-thu-bat-buoc'] });
      queryClient.invalidateQueries({ queryKey: ['khoan-thu-tu-nguyen'] });
      setIsAddModalOpen(false);
      setFormData({ tenKhoanThu: '', soTien: '', ngayBatDau: new Date().toISOString().split('T')[0] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => await deletePhieuThu(id),
    onSuccess: () => {
      toast.success('Đã xóa phiếu thu!');
      queryClient.invalidateQueries({ queryKey: ['thu-phi-history'] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: any }) =>
      await updatePhieuThu(id, payload),
    onSuccess: () => {
      toast.success('Xác nhận thu tiền thành công!');
      queryClient.invalidateQueries({ queryKey: ['thu-phi-history'] });
    },
  });

  // 3. HANDLERS
  const handleThuNo = (phieu: any) => {
    const id = phieu._id || phieu.id;
    updateStatusMutation.mutate({
      id,
      payload: { trangThai: 'Đã thu', ngayThu: new Date().toISOString() },
    });
  };

  // 4. LOGIC THỐNG KÊ (GIỮ NGUYÊN)
  const stats = useMemo(() => {
    let totalBatBuoc = 0; let totalTuNguyen = 0; let totalDangNo = 0;
    const listDetailBatBuoc: any[] = []; const listDetailTuNguyen: any[] = []; const listDetailDangNo: any[] = [];
    const batBuocIds = new Set(listBatBuocDef.map((k: any) => k._id || k.id));
    const tuNguyenIds = new Set(listTuNguyenDef.map((k: any) => k._id || k.id));

    dsPhieuThu.forEach((pt: any) => {
      pt.chiTietThu?.forEach((detail: any) => {
        const amount = Number(detail.soTien) || 0;
        const detailItem = { ...detail, maPhieu: pt.maPhieuThu, tenChuHo: pt.tenChuHo, ngayThu: pt.ngayThu, trangThai: pt.trangThai };
        if (pt.trangThai === 'Đã thu') {
          if (batBuocIds.has(detail.khoanThuId)) { totalBatBuoc += amount; listDetailBatBuoc.push(detailItem); }
          else { totalTuNguyen += amount; listDetailTuNguyen.push(detailItem); }
        } else {
          totalDangNo += amount; listDetailDangNo.push(detailItem);
        }
      });
    });
    return { totalBatBuoc, totalTuNguyen, totalDangNo, listDetailBatBuoc, listDetailTuNguyen, listDetailDangNo };
  }, [dsPhieuThu, listBatBuocDef, listTuNguyenDef]);

  const filteredData = dsPhieuThu.filter((item: any) => {
    const term = searchTerm.toLowerCase();
    return item.tenChuHo?.toLowerCase().includes(term) || item.kyThu?.toLowerCase().includes(term);
  });

  return (
    <div className="p-8 bg-slate-50 min-h-screen space-y-8">
      {/* HEADER */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Quản Lý Thu Phí</h1>
          <p className="text-slate-500 mt-1">Theo dõi trạng thái đóng phí và công nợ của cư dân</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => { setAddType('Bắt buộc'); setIsAddModalOpen(true); }} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl shadow-sm hover:bg-indigo-700 transition-all flex items-center gap-2 font-semibold">
            <Plus size={18} /> Phí Định Kỳ
          </button>
          <button onClick={() => { setAddType('Tự nguyện'); setIsAddModalOpen(true); }} className="px-5 py-2.5 bg-rose-500 text-white rounded-xl shadow-sm hover:bg-rose-600 transition-all flex items-center gap-2 font-semibold">
            <Heart size={18} /> Quỹ Đóng Góp
          </button>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Đã thu phí cố định" amount={stats.totalBatBuoc} color="blue" icon={<Wallet />} onClick={() => {}} />
        <StatCard title="Đã thu đóng góp" amount={stats.totalTuNguyen} color="rose" icon={<Heart />} onClick={() => {}} />
        <StatCard title="Tổng nợ cư dân" amount={stats.totalDangNo} color="orange" icon={<AlertCircle />} onClick={() => {}} isDebt />
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            Danh sách phiếu thu <span className="text-xs font-normal bg-slate-100 px-2 py-1 rounded-md text-slate-500">{filteredData.length} phiếu</span>
          </h2>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
              placeholder="Tìm tên chủ hộ, mã phiếu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100 text-[11px] text-slate-500 uppercase tracking-wider font-bold">
              <tr>
                <th className="p-4">Chủ hộ</th>
                <th className="p-4">Kỳ thu</th>
                <th className="p-4">Nội dung</th>
                <th className="p-4 text-right">Tổng tiền</th>
                <th className="p-4 text-center">Trạng thái</th>
                <th className="p-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredData.map((item: any) => {
                const isPaid = item.trangThai === 'Đã thu';
                return (
                  <tr key={item._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                          {item.tenChuHo?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-700">{item.tenChuHo}</p>
                          <p className="text-[10px] text-slate-400 font-mono">#{item.maPhieuThu?.slice(-6)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600 text-sm font-medium">{item.kyThu}</td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {item.chiTietThu?.map((ct: any, i: number) => (
                          <span key={i} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] text-slate-500">
                            {ct.tenKhoanThu}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className={`p-4 text-right font-bold ${isPaid ? 'text-slate-900' : 'text-orange-600'}`}>
                      {Number(item.tongTien).toLocaleString()}₫
                    </td>
                    <td className="p-4 text-center">
                      {isPaid ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[11px] font-bold border border-emerald-100">
                          <CheckCircle size={14} /> ĐÃ NỘP
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-[11px] font-bold border border-orange-100 animate-pulse">
                          <Clock size={14} /> CÒN NỢ
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        {!isPaid && (
                          <button
                            onClick={() => handleThuNo(item)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-all shadow-sm"
                          >
                            <Banknote size={14} /> Thu tiền
                          </button>
                        )}
                        <button
                          onClick={() => deleteMutation.mutate(item._id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {/* ... Giữ nguyên các Modal ở cuối như code cũ của bạn ... */}
    </div>
  );
}

// Sub-component cho Card thống kê
function StatCard({ title, amount, color, icon, isDebt }: any) {
  const colors: any = {
    blue: 'text-blue-600 bg-blue-50 border-blue-100',
    rose: 'text-rose-600 bg-rose-50 border-rose-100',
    orange: 'text-orange-600 bg-orange-50 border-orange-100',
  };
  return (
    <div className={`bg-white p-6 rounded-2xl border shadow-sm flex justify-between items-start transition-transform hover:scale-[1.02]`}>
      <div>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">{title}</p>
        <h3 className={`text-2xl font-black ${colors[color].split(' ')[0]}`}>
          {amount.toLocaleString()} <span className="text-sm font-normal">₫</span>
        </h3>
        {isDebt && amount > 0 && (
          <p className="text-[10px] mt-2 text-orange-500 font-medium flex items-center gap-1">
            <AlertCircle size={10} /> Cần đôn đốc thu hồi
          </p>
        )}
      </div>
      <div className={`p-3 rounded-xl ${colors[color].split(' ').slice(1).join(' ')}`}>
        {React.cloneElement(icon, { size: 24 })}
      </div>
    </div>
  );
}
