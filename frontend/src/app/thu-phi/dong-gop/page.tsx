"use client";
import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getAllHoKhau,
    createPhieuThu,
    createKhoanThu,
    getAllThuPhi,
    updatePhieuThu,
    deleteKhoanThu,
    getKhoanThuTuNguyen,
    deletePhieuThu
} from "../api";
import {
    Heart, Plus, ChevronDown, ChevronUp, User, Trash2, X, AlertCircle, Clock, CheckCircle
} from "lucide-react";
import { toast } from "sonner";

export default function QuanLyDongGop() {
    const queryClient = useQueryClient();

    // --- UI STATES ---
    const [expandedCampaignId, setExpandedCampaignId] = useState<string | null>(null);
    const [isCreateCampaignOpen, setIsCreateCampaignOpen] = useState(false);
    const [isDonateModalOpen, setIsDonateModalOpen] = useState(false);

    // --- FORM STATES ---
    const [newCampaignName, setNewCampaignName] = useState("");
    const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
    const [selectedHoKhauId, setSelectedHoKhauId] = useState("");
    const [donationAmount, setDonationAmount] = useState<number>(50000);
    const [donationNote, setDonationNote] = useState("");
    const [donationStatus, setDonationStatus] = useState("Đã thu");

    // --- HELPER: Chuẩn hóa ID để so sánh chính xác ---
    const formatId = (obj: any) => {
        if (!obj) return "";
        const id = obj._id || obj.id || obj;
        return String(id);
    };

    // --- 1. FETCH DATA ---
    const { data: activeHoKhau = [], isLoading: isLoadingHK } = useQuery({
        queryKey: ["ho-khau-active"],
        queryFn: async () => {
            const res = await getAllHoKhau();
            const data = Array.isArray(res) ? res : [];
            return data.filter((hk: any) => hk.trangThai === "Đang hoạt động");
        },
    });

    const { data: dsKhoanThu = [] } = useQuery({
        queryKey: ["khoan-thu-tu-nguyen"],
        queryFn: async () => {
            const res = await getKhoanThuTuNguyen();
            return Array.isArray(res) ? res : res?.data || [];
        }
    });

    const { data: dsPhieuThu = [] } = useQuery({
        queryKey: ["thu-phi-history"],
        queryFn: async () => {
            const res = await getAllThuPhi();
            return Array.isArray(res) ? res : res?.data || [];
        }
    });

    // --- 2. XỬ LÝ DỮ LIỆU (Sửa logic so sánh ID) ---
    const campaigns = useMemo(() => {
        return dsKhoanThu.map((kt: any) => {
            const ktId = formatId(kt);

            // Lấy tất cả phiếu thu thuộc về chiến dịch này và thuộc về hộ đang hoạt động
            const validDonations = dsPhieuThu.filter((pt: any) => {
                const ptHoKhauId = formatId(pt.hoKhauId);
                const isFromActiveHK = activeHoKhau.some(hk => formatId(hk) === ptHoKhauId);
                const belongsToThisCampaign = pt.chiTietThu?.some((detail: any) => formatId(detail.khoanThuId) === ktId);
                return isFromActiveHK && belongsToThisCampaign;
            });

            const totalMoney = validDonations.reduce((sum: number, pt: any) => {
                if (pt.trangThai !== "Đã thu") return sum;
                const detail = pt.chiTietThu.find((d: any) => formatId(d.khoanThuId) === ktId);
                return sum + (Number(detail?.soTien) || 0);
            }, 0);

            return { ...kt, donations: validDonations, totalMoney };
        }).sort((a: any, b: any) => b.totalMoney - a.totalMoney);
    }, [dsKhoanThu, dsPhieuThu, activeHoKhau]);

    // --- 3. MUTATIONS ---
    const donateMutation = useMutation({
        mutationFn: async () => {
            const hk = activeHoKhau.find((h: any) => formatId(h) === selectedHoKhauId);
            if (!hk) throw new Error("Vui lòng chọn hộ khẩu");

            const payload = {
                hoKhauId: formatId(hk),
                maPhieuThu: `DG-${Date.now()}`,
                tenChuHo: hk.chuHo?.hoTen || "N/A",
                diaChi: String(hk.diaChi || "Hà Nội"),
                soNhanKhau: Number(hk.thanhVien?.length || 1),
                nam: new Date().getFullYear(),
                kyThu: selectedCampaign.tenKhoanThu,
                ngayThu: new Date().toISOString(),
                trangThai: donationStatus,
                chiTietThu: [{
                    khoanThuId: formatId(selectedCampaign),
                    tenKhoanThu: selectedCampaign.tenKhoanThu,
                    soTien: Number(donationAmount),
                    ghiChu: donationNote
                }],
                tongTien: Number(donationAmount)
            };
            return await createPhieuThu(payload);
        },
        onSuccess: () => {
            toast.success("Ghi nhận thành công!");
            setIsDonateModalOpen(false);
            setSelectedHoKhauId("");
            setDonationNote("");
            queryClient.invalidateQueries({ queryKey: ["thu-phi-history"] });
        }
    });

    const payMutation = useMutation({
        mutationFn: async (id: string) => await updatePhieuThu(id, {
            trangThai: "Đã thu",
            ngayThu: new Date().toISOString()
        }),
        onSuccess: () => {
            toast.success("Đã thu tiền!");
            queryClient.invalidateQueries({ queryKey: ["thu-phi-history"] });
        }
    });

    const createCampaignMutation = useMutation({
        mutationFn: async () => await createKhoanThu({
            tenKhoanThu: newCampaignName,
            soTien: 0,
            loaiKhoanThu: "Tự nguyện",
            moTa: "Quyên góp từ thiện",
            ngayBatDau: new Date().toISOString()
        }),
        onSuccess: () => {
            toast.success("Đã tạo chiến dịch!");
            setIsCreateCampaignOpen(false);
            setNewCampaignName("");
            queryClient.invalidateQueries({ queryKey: ["khoan-thu-tu-nguyen"] });
        }
    });

    const deleteCampaignMutation = useMutation({
        mutationFn: async (id: string) => {
            const target = campaigns.find((c: any) => formatId(c) === id);
            if (target?.donations.length > 0) {
                await Promise.all(target.donations.map((d: any) => deletePhieuThu(formatId(d))));
            }
            return await deleteKhoanThu(id);
        },
        onSuccess: () => {
            toast.success("Đã xóa chiến dịch!");
            queryClient.invalidateQueries({ queryKey: ["khoan-thu-tu-nguyen"] });
            queryClient.invalidateQueries({ queryKey: ["thu-phi-history"] });
        }
    });

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Heart className="text-red-500 fill-red-500" /> Quản Lý Đóng Góp
                    </h1>
                    <p className="text-gray-500 text-sm">Chỉ tính toán cho hộ khẩu <b>Đang hoạt động</b></p>
                </div>
                <button
                    onClick={() => setIsCreateCampaignOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-xl shadow-lg hover:scale-105 transition-all"
                >
                    <Plus size={20} /> Tạo Chiến Dịch
                </button>
            </div>

            {/* Campaign List */}
            <div className="space-y-4">
                {campaigns.map((camp: any) => {
                    const campId = formatId(camp);
                    const isExpanded = expandedCampaignId === campId;
                    return (
                        <div key={campId} className={`bg-white rounded-xl border transition-all ${isExpanded ? "ring-2 ring-red-100 border-red-200 shadow-md" : "border-gray-200"}`}>
                            <div onClick={() => setExpandedCampaignId(isExpanded ? null : campId)} className="p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-full ${isExpanded ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-500"}`}>
                                        <Heart size={24} className={isExpanded ? "fill-red-600" : ""} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold">{camp.tenKhoanThu}</h3>
                                        <p className="text-[10px] text-green-600 font-bold uppercase tracking-wider">
                                            {camp.donations.length} lượt đóng góp
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">Thực nhận</p>
                                        <p className="text-xl font-extrabold text-red-600">{camp.totalMoney.toLocaleString()} ₫</p>
                                    </div>
                                    <div className="flex items-center gap-2 border-l pl-4">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if(confirm("Xóa chiến dịch sẽ mất toàn bộ dữ liệu?")) deleteCampaignMutation.mutate(campId);
                                            }}
                                            className="p-2 text-gray-400 hover:text-red-500"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                        {isExpanded ? <ChevronUp /> : <ChevronDown />}
                                    </div>
                                </div>
                            </div>

                            {isExpanded && (
                                <div className="p-6 border-t bg-gray-50/40">
                                    <div className="flex justify-between mb-4 items-center">
                                        <h4 className="font-bold text-gray-700 flex items-center gap-2"><User size={18}/> Danh sách đóng góp</h4>
                                        <button
                                            onClick={() => { setSelectedCampaign(camp); setIsDonateModalOpen(true); }}
                                            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm flex items-center gap-2"
                                        >
                                            <Plus size={16} /> Ghi nhận mới
                                        </button>
                                    </div>
                                    <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-100 text-gray-500 font-bold text-[10px] uppercase">
                                                <tr>
                                                    <th className="p-3 text-left">Chủ hộ</th>
                                                    <th className="p-3 text-center">Trạng thái</th>
                                                    <th className="p-3 text-right">Số tiền</th>
                                                    <th className="p-3"></th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {camp.donations.length === 0 ? (
                                                    <tr><td colSpan={4} className="p-6 text-center text-gray-400 italic">Chưa có dữ liệu.</td></tr>
                                                ) : camp.donations.map((d: any) => (
                                                    <tr key={formatId(d)} className="hover:bg-gray-50">
                                                        <td className="p-3 font-medium text-gray-800">{d.tenChuHo}</td>
                                                        <td className="p-3 text-center">
                                                            {d.trangThai === "Đã thu" ?
                                                                <span className="bg-green-100 text-green-700 px-2 py-1 rounded-md text-[10px] font-bold">ĐÃ THU</span> :
                                                                <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-md text-[10px] font-bold">CHƯA THU</span>
                                                            }
                                                        </td>
                                                        <td className="p-3 text-right font-bold text-gray-900">{d.tongTien.toLocaleString()} ₫</td>
                                                        <td className="p-3 text-right">
                                                            {d.trangThai !== "Đã thu" && (
                                                                <button
                                                                    onClick={() => payMutation.mutate(formatId(d))}
                                                                    className="text-[10px] bg-blue-600 text-white px-2 py-1 rounded font-bold"
                                                                >
                                                                    THU TIỀN
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* MODAL ĐÓNG GÓP */}
            {isDonateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-6 border-b pb-4">
                            <h3 className="text-xl font-extrabold text-red-600">{selectedCampaign?.tenKhoanThu}</h3>
                            <button onClick={() => setIsDonateModalOpen(false)}><X /></button>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Chọn hộ gia đình (*)</label>
                                <select
                                    className="w-full border-2 border-gray-100 p-3 rounded-xl outline-none"
                                    value={selectedHoKhauId}
                                    onChange={(e) => setSelectedHoKhauId(e.target.value)}
                                >
                                    <option value="">-- Danh sách hộ hoạt động --</option>
                                    {activeHoKhau.map((hk: any) => (
                                        <option key={formatId(hk)} value={formatId(hk)}>
                                            {hk.maHoKhau} - {hk.chuHo?.hoTen}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Số tiền (₫)</label>
                                <input
                                    type="number"
                                    className="w-full border-2 border-red-50 p-4 rounded-xl text-2xl font-black text-red-600"
                                    value={donationAmount}
                                    onChange={(e) => setDonationAmount(Number(e.target.value))}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setDonationStatus("Đã thu")}
                                    className={`p-3 rounded-xl border-2 font-bold ${donationStatus === "Đã thu" ? "bg-green-50 border-green-500 text-green-700" : "border-gray-100 text-gray-400"}`}
                                >
                                    Đã thu tiền
                                </button>
                                <button
                                    onClick={() => setDonationStatus("Chưa thu")}
                                    className={`p-3 rounded-xl border-2 font-bold ${donationStatus === "Chưa thu" ? "bg-orange-50 border-orange-500 text-orange-700" : "border-gray-100 text-gray-400"}`}
                                >
                                    Ghi nợ (Chưa thu)
                                </button>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end gap-3">
                            <button onClick={() => setIsDonateModalOpen(false)} className="px-5 py-2.5 text-gray-400 font-bold">HỦY</button>
                            <button
                                onClick={() => donateMutation.mutate()}
                                disabled={!selectedHoKhauId || donationAmount <= 0}
                                className="px-10 py-2.5 bg-red-600 text-white rounded-xl font-black shadow-lg disabled:opacity-30"
                            >
                                XÁC NHẬN
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Tạo Chiến Dịch */}
            {isCreateCampaignOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
                        <h3 className="text-xl font-black mb-4 uppercase">Chiến dịch mới</h3>
                        <input
                            className="w-full border-2 border-gray-100 p-4 rounded-xl mb-4 outline-none font-bold"
                            placeholder="Tên chiến dịch..."
                            value={newCampaignName}
                            onChange={(e) => setNewCampaignName(e.target.value)}
                        />
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setIsCreateCampaignOpen(false)} className="px-4 py-2 font-bold text-gray-400">Hủy</button>
                            <button
                                onClick={() => createCampaignMutation.mutate()}
                                disabled={!newCampaignName}
                                className="px-8 py-2 bg-black text-white rounded-xl font-black disabled:opacity-20"
                            >
                                TẠO
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
