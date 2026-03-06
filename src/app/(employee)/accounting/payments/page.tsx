"use client";

import { useEffect, useState, useMemo } from "react";
import { CreditCard, Search, FileText, FileImage, CheckCircle, Clock, XCircle, ArrowUpDown, ArrowDown, ArrowUp, X } from "lucide-react";

interface Payment {
    payID: number;
    bookID: number;
    payMethod: "slip" | "cash";
    payStatus: "pending" | "approved" | "rejected" | "completed";
    payAmount: string | number;
    payImage: string | null;
    payReference: string | null;
    senderName: string | null;
    payTime: string | null;
    payNote: string | null;
    payCreatedAt: string;
}

export default function AccountingPaymentsPage() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);

    // ค้นหาและตัวกรอง
    const [searchQuery, setSearchQuery] = useState("");
    const [filterMethod, setFilterMethod] = useState("all");
    const [filterStatus, setFilterStatus] = useState("all");

    // การเรียงลำดับ (Sort)
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
        key: "payCreatedAt",
        direction: "desc"
    });

    // Modal ดูสลิป
    const [selectedSlip, setSelectedSlip] = useState<{ image: string | null; ref: string | null; sender: string | null; amount: string | number; time: string | null; note: string | null, method: string }>({
        image: null, ref: null, sender: null, amount: 0, time: null, note: null, method: ""
    });
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const res = await fetch("/api/accounting/payments");
                if (res.ok) {
                    const data = await res.json();
                    setPayments(data);
                }
            } catch (error) {
                console.error("Error fetching payments:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPayments();
    }, []);

    const handleSort = (key: string) => {
        let direction: "asc" | "desc" = "asc";
        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }
        setSortConfig({ key, direction });
    };

    const filteredAndSortedPayments = useMemo(() => {
        let result = [...payments];

        // 1. ค้นหาผ่าน Search (รหัสจ่ายเงิน หรือ รหัสการจอง หรือ ชื่อคนโอน)
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                (p) =>
                    p.payID.toString().includes(query) ||
                    p.bookID.toString().includes(query) ||
                    (p.payReference && p.payReference.toLowerCase().includes(query)) ||
                    (p.senderName && p.senderName.toLowerCase().includes(query))
            );
        }

        // 2. กรองตามวิธีจ่าย
        if (filterMethod !== "all") {
            result = result.filter((p) => p.payMethod === filterMethod);
        }

        // 3. กรองตามสถานะ
        if (filterStatus !== "all") {
            result = result.filter((p) => p.payStatus === filterStatus);
        }

        // 4. เรียงข้อมูล (Sort)
        result.sort((a, b) => {
            let aValue: any = a[sortConfig.key as keyof Payment];
            let bValue: any = b[sortConfig.key as keyof Payment];

            if (sortConfig.key === "payAmount") {
                aValue = parseFloat(aValue as string);
                bValue = parseFloat(bValue as string);
            } else if (sortConfig.key === "payCreatedAt" || sortConfig.key === "payTime") {
                aValue = new Date(aValue || 0).getTime();
                bValue = new Date(bValue || 0).getTime();
            }

            if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
            return 0;
        });

        return result;
    }, [payments, searchQuery, filterMethod, filterStatus, sortConfig]);

    const openSlipModal = (pay: Payment) => {
        setSelectedSlip({
            image: pay.payImage,
            ref: pay.payReference,
            sender: pay.senderName,
            amount: pay.payAmount,
            time: pay.payTime,
            note: pay.payNote,
            method: pay.payMethod
        });
        setIsModalOpen(true);
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case "approved":
            case "completed":
                return "bg-emerald-50 text-emerald-600 border border-emerald-200";
            case "rejected":
                return "bg-rose-50 text-rose-600 border border-rose-200";
            default:
                return "bg-amber-50 text-amber-600 border border-amber-200";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "approved":
            case "completed":
                return <CheckCircle size={14} className="mr-1" />;
            case "rejected":
                return <XCircle size={14} className="mr-1" />;
            default:
                return <Clock size={14} className="mr-1" />;
        }
    };

    const formatDateTime = (dateStr: string | null) => {
        if (!dateStr) return "-";
        return new Date(dateStr).toLocaleString("th-TH", {
            year: "numeric", month: "short", day: "numeric",
            hour: "2-digit", minute: "2-digit"
        });
    };

    const formatCurrency = (amount: string | number) => {
        return parseFloat(amount as string).toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const SortIcon = ({ columnKey }: { columnKey: string }) => {
        if (sortConfig.key !== columnKey) return <ArrowUpDown size={14} className="text-slate-300 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />;
        return sortConfig.direction === "asc" ?
            <ArrowUp size={14} className="text-blue-600 ml-1" /> :
            <ArrowDown size={14} className="text-blue-600 ml-1" />;
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-blue-950 tracking-tight flex items-center gap-3">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
                            <CreditCard size={28} />
                        </div>
                        ประวัติการชำระเงิน
                    </h1>
                    <p className="text-slate-500 text-sm mt-2 font-medium">ดูประวัติลูกค้าโอนเงิน หรือชำระผ่านเงินสด</p>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-5 flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="ค้นหาตามรหัสจ่าย บัญชีสั่งซื้อ หรือชื่อคนโอน..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition outline-none"
                    />
                </div>

                <div className="flex gap-3 overflow-x-auto pb-2 lg:pb-0">
                    <select
                        value={filterMethod}
                        onChange={(e) => setFilterMethod(e.target.value)}
                        className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 outline-none cursor-pointer focus:ring-2 focus:ring-blue-500 transition min-w-[140px]"
                    >
                        <option value="all">วิธีจ่ายทั้งหมด</option>
                        <option value="slip">ชำระผ่านสลิป</option>
                        <option value="cash">เงินสดหน้าร้าน</option>
                    </select>

                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 outline-none cursor-pointer focus:ring-2 focus:ring-blue-500 transition min-w-[140px]"
                    >
                        <option value="all">สถานะทั้งหมด</option>
                        <option value="pending">💡 รอตรวจสอบ (Pending)</option>
                        <option value="approved">✅ รับยอดแล้ว (Approved)</option>
                        <option value="rejected">❌ ยกเลิก/สลิปปลอม (Rejected)</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600 whitespace-nowrap">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-black tracking-wider border-b border-slate-100">
                            <tr>
                                <th scope="col" className="px-6 py-4 cursor-pointer group" onClick={() => handleSort("payID")}>
                                    <div className="flex items-center"> รหัสชำระ <SortIcon columnKey="payID" /> </div>
                                </th>
                                <th scope="col" className="px-6 py-4 cursor-pointer group" onClick={() => handleSort("bookID")}>
                                    <div className="flex items-center"> รหัสการจอง <SortIcon columnKey="bookID" /> </div>
                                </th>
                                <th scope="col" className="px-6 py-4 cursor-pointer group" onClick={() => handleSort("payCreatedAt")}>
                                    <div className="flex items-center"> วันทำรายการ <SortIcon columnKey="payCreatedAt" /> </div>
                                </th>
                                <th scope="col" className="px-6 py-4">วิธีการ / โอนโดย</th>
                                <th scope="col" className="px-6 py-4">สถานะ</th>
                                <th scope="col" className="px-6 py-4 text-right cursor-pointer group" onClick={() => handleSort("payAmount")}>
                                    <div className="flex items-center justify-end"> ยอดเงิน <SortIcon columnKey="payAmount" /> </div>
                                </th>
                                <th scope="col" className="px-6 py-4 text-center">หลักฐาน</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white text-[13px] font-medium">
                            {filteredAndSortedPayments.length > 0 ? (
                                filteredAndSortedPayments.map((pay) => (
                                    <tr key={pay.payID} className="hover:bg-blue-50/40 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-blue-950 flex items-center gap-2">
                                                <FileText size={16} className="text-slate-400" /> #{pay.payID}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-slate-500 font-bold bg-slate-100 px-2.5 py-1 rounded-md">B-{pay.bookID}</span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">
                                            {formatDateTime(pay.payCreatedAt)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-700 capitalize">
                                                    {pay.payMethod === "slip" ? "โอนเงิน (สลิป)" : "เงินสดหน้าร้าน"}
                                                </span>
                                                <span className="text-slate-400 text-xs mt-0.5 truncate max-w-[150px]">
                                                    {pay.senderName || pay.payReference || "-"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1.5 text-[11px] font-black uppercase tracking-wider rounded-xl ${getStatusStyle(pay.payStatus)}`}>
                                                {getStatusIcon(pay.payStatus)} {pay.payStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-black text-blue-700 text-right text-[15px]">
                                            ฿{formatCurrency(pay.payAmount)}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => openSlipModal(pay)}
                                                className="inline-flex items-center justify-center p-2.5 bg-slate-100 hover:bg-blue-100 text-slate-500 hover:text-blue-600 rounded-xl transition-colors shrink-0"
                                                title="ดูหลักฐาน"
                                            >
                                                <FileImage size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-16 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                                                <FileText size={24} className="text-slate-400" />
                                            </div>
                                            <p className="font-bold text-slate-700">ไม่พบรายการชำระเงิน</p>
                                            <p className="text-xs text-slate-400 mt-1">ลองค้นหาด้วยคำอื่น หรือเปลี่ยนตัวกรองดูนะครับ</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal ดูหลักฐาน (สลิป) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50">
                            <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                                <FileImage className="text-blue-600" /> หลักฐานการชำระเงิน
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto">
                            <div className="flex flex-col gap-6">
                                {/* Image / Placeholder */}
                                <div className="bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center overflow-hidden min-h-[350px] relative">
                                    {selectedSlip.image ? (
                                        <img
                                            src={selectedSlip.image}
                                            alt="Payment Slip"
                                            className="w-full h-auto object-contain max-h-[500px]"
                                        />
                                    ) : (
                                        <div className="text-center text-slate-400 flex flex-col items-center">
                                            <CreditCard size={48} className="mb-3 opacity-30" />
                                            <p className="font-bold">ไม่มีรูปภาพหลักฐาน</p>
                                            <p className="text-xs mt-1">({selectedSlip.method === "cash" ? "ชำระด้วยเงินสดหน้าร้าน" : "ไม่มีการอัปโหลด"})</p>
                                        </div>
                                    )}
                                </div>

                                {/* Details */}
                                <div className="bg-blue-50/50 rounded-2xl p-5 border border-blue-100 space-y-4">
                                    <div>
                                        <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">ยอดเงิน</p>
                                        <p className="text-2xl font-black text-blue-700">฿{formatCurrency(selectedSlip.amount)}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase mb-1">โอนโดย / ชื่อบัญชี</p>
                                            <p className="text-sm font-bold text-slate-700">{selectedSlip.sender || "-"}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase mb-1">เวลาตามสลิป</p>
                                            <p className="text-sm font-bold text-slate-700">{formatDateTime(selectedSlip.time)}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <p className="text-xs font-bold text-slate-400 uppercase mb-1">เลขอ้างอิงธนาคาร (Ref)</p>
                                            <p className="text-sm font-bold text-slate-700 font-mono tracking-tight bg-white px-2 py-1 rounded inline-block border border-slate-200">
                                                {selectedSlip.ref || "-"}
                                            </p>
                                        </div>
                                        {selectedSlip.note && (
                                            <div className="col-span-2">
                                                <p className="text-xs font-bold text-slate-400 uppercase mb-1">หมายเหตุระบบ</p>
                                                <p className="text-sm text-rose-600 font-medium bg-rose-50 p-2 rounded-lg border border-rose-100">
                                                    {selectedSlip.note}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-slate-100 bg-white">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition shadow-md"
                            >
                                ปิดหน้าต่าง
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
