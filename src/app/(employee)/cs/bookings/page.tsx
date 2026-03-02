"use client";

import { useState, useMemo, useEffect } from "react";
import { CalendarDays, Clock, Search, Loader2, X, Car, CheckCircle2, XCircle } from "lucide-react";
import Swal from 'sweetalert2';

interface BookingDB {
    bookID: number;
    cusFN: string;
    cusLN: string;
    carBrand: string;
    bookStart: string;
    bookEnd: string;
    bookStatus: string;
    bookTotalPrice: number;
}

export default function CSBookingsPage() {
    const [bookings, setBookings] = useState<BookingDB[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);

    // 🌟 State สำหรับเปิด/ปิด และเก็บข้อมูลของ Modal อัปเดตสถานะ
    const [updateModal, setUpdateModal] = useState({ isOpen: false, bookID: 0, currentStatus: '' });
    const [selectedStatus, setSelectedStatus] = useState<string>("");
    const [isSaving, setIsSaving] = useState(false);

    // ฟังก์ชันดึงข้อมูลจาก API
    const fetchBookings = async () => {
        try {
            const response = await fetch('/api/bookings');
            const data = await response.json();
            
            if (response.ok) {
                setBookings(data.data ? data.data : data);
            }
        } catch (error) {
            console.error("Failed to fetch bookings:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    // ฟังก์ชันกรองข้อมูล
    const filteredBookings = useMemo(() => {
        if (!searchQuery) return bookings;
        
        const lowerCaseQuery = searchQuery.toLowerCase();
        return bookings.filter(bk => 
            String(bk.bookID).includes(lowerCaseQuery) || 
            (bk.cusFN && bk.cusFN.toLowerCase().includes(lowerCaseQuery)) ||
            (bk.cusLN && bk.cusLN.toLowerCase().includes(lowerCaseQuery)) ||
            (bk.carBrand && bk.carBrand.toLowerCase().includes(lowerCaseQuery))
        );
    }, [searchQuery, bookings]);

    // 🌟 เปิดหน้าต่าง Modal Custom
    const openUpdateModal = (bookID: number, status: string) => {
        // แปลงสถานะให้เป็นตัวพิมพ์ใหญ่ตัวแรกเสมอเผื่อกรณีข้อมูลมาแปลกๆ
        const formattedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
        setUpdateModal({ isOpen: true, bookID, currentStatus: formattedStatus });
        setSelectedStatus(formattedStatus);
    };

    // 🌟 ฟังก์ชันบันทึกข้อมูลไปยัง API
    const handleSaveStatus = async () => {
        if (!selectedStatus || selectedStatus === updateModal.currentStatus) {
            setUpdateModal({ ...updateModal, isOpen: false });
            return;
        }

        setIsSaving(true);
        try {
            const res = await fetch('/api/bookings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookID: updateModal.bookID, bookStatus: selectedStatus })
            });

            if (res.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'อัปเดตสถานะสำเร็จ',
                    showConfirmButton: false,
                    timer: 1500,
                    customClass: { popup: 'rounded-3xl' }
                });
                fetchBookings(); // รีเฟรชตาราง
                setUpdateModal({ ...updateModal, isOpen: false });
            } else {
                throw new Error("Failed to update");
            }
        } catch (error) {
            Swal.fire('ข้อผิดพลาด', 'ไม่สามารถอัปเดตสถานะได้', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    // 🌟 ข้อมูลตัวเลือกสถานะ (ใช้สร้างหน้าตา Card ใน Modal)
    const statusOptions = [
        { id: 'Pending', label: 'รอรับรถ (Pending)', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', activeRing: 'ring-amber-500 border-amber-500' },
        { id: 'Active', label: 'กำลังเช่า (Active)', icon: Car, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', activeRing: 'ring-blue-500 border-blue-500' },
        { id: 'Completed', label: 'คืนรถแล้ว (Completed)', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', activeRing: 'ring-emerald-500 border-emerald-500' },
        { id: 'Cancelled', label: 'ยกเลิกการจอง (Cancelled)', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', activeRing: 'ring-red-500 border-red-500' },
    ];

    return (
        <div className="space-y-6 pb-10">
            <div>
                <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                    <CalendarDays className="text-blue-600" size={32} />
                    จัดการการจองของลูกค้า
                </h1>
                <p className="text-slate-500 text-sm mt-2 font-medium">ดูแลใบจอง คอนเฟิร์มบิล และเบิ่งภาพรวมการเช่ารถทั้งหมดเด้อ</p>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-4 bg-slate-50/50">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="ค้นหาเลขบิล, ชื่อลูกค้า หรือ รุ่นรถ..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition outline-none shadow-sm"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
                            <p className="text-slate-500 font-bold">กำลังโหลดข้อมูลการจอง...</p>
                        </div>
                    ) : (
                        <table className="w-full text-left text-sm text-slate-600 min-w-[900px]">
                            <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-black tracking-wider border-b border-slate-200">
                                <tr>
                                    <th scope="col" className="px-6 py-5">รหัสจอง</th>
                                    <th scope="col" className="px-6 py-5">ชื่อลูกค้า</th>
                                    <th scope="col" className="px-6 py-5">รถที่เช่า</th>
                                    <th scope="col" className="px-6 py-5">ระยะเวลา</th>
                                    <th scope="col" className="px-6 py-5">ยอดรวม</th>
                                    <th scope="col" className="px-6 py-5">สถานะ</th>
                                    <th scope="col" className="px-6 py-5 text-right">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {filteredBookings.length > 0 ? (
                                    filteredBookings.map((bk) => {
                                        const isPending = bk.bookStatus?.toLowerCase() === 'pending';
                                        const isActive = bk.bookStatus?.toLowerCase() === 'active';
                                        const isCompleted = bk.bookStatus?.toLowerCase() === 'completed';
                                        const isCancelled = bk.bookStatus?.toLowerCase() === 'cancelled';

                                        return (
                                            <tr key={bk.bookID} className="hover:bg-blue-50/50 transition">
                                                <td className="px-6 py-4 font-black text-slate-800">#{bk.bookID}</td>
                                                <td className="px-6 py-4 font-bold text-slate-700">{bk.cusFN} {bk.cusLN}</td>
                                                <td className="px-6 py-4 text-slate-500 font-bold">{bk.carBrand || "ไม่ระบุรุ่น"}</td>
                                                <td className="px-6 py-4 text-slate-500 text-xs whitespace-nowrap">
                                                    <div className="flex items-center gap-1.5"><CalendarDays size={14} className="text-blue-500"/> {formatDate(bk.bookStart)} </div>
                                                    <div className="flex items-center gap-1.5 mt-1"><Clock size={14} className="text-rose-500"/> {formatDate(bk.bookEnd)}</div>
                                                </td>
                                                <td className="px-6 py-4 font-black text-blue-600">฿{bk.bookTotalPrice?.toLocaleString() || 0}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1.5 text-xs font-black rounded-full uppercase tracking-wider ${
                                                        isPending ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                                                        isActive ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                                                        isCompleted ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                                                        isCancelled ? 'bg-red-100 text-red-700 border border-red-200' :
                                                        'bg-slate-100 text-slate-600 border-slate-200'
                                                    }`}>
                                                        {isPending ? 'รอรับรถ' : isActive ? 'กำลังเช่า' : isCompleted ? 'คืนรถแล้ว' : isCancelled ? 'ยกเลิก' : bk.bookStatus}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button 
                                                        onClick={() => openUpdateModal(bk.bookID, bk.bookStatus || 'Pending')}
                                                        className="text-sm font-bold text-blue-600 hover:text-blue-800 transition py-2 px-4 bg-slate-50 border border-slate-200 hover:border-blue-300 hover:bg-blue-50 rounded-xl whitespace-nowrap"
                                                    >
                                                        อัปเดตสถานะ
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-16 text-center text-slate-500 font-medium">
                                            ไม่พบข้อมูลการจองที่ค้นหา
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* 🌟 หน้าต่างอัปเดตสถานะที่สร้างขึ้นใหม่ (Custom Modal) */}
            {updateModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        
                        {/* Modal Header */}
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                            <div>
                                <h3 className="text-xl font-black text-slate-800">อัปเดตสถานะการจอง</h3>
                                <p className="text-sm text-slate-500 font-medium mt-0.5">บิลหมายเลข <span className="text-blue-600 font-bold">#{updateModal.bookID}</span></p>
                            </div>
                            <button 
                                onClick={() => setUpdateModal({ ...updateModal, isOpen: false })} 
                                className="text-slate-400 hover:text-red-500 bg-slate-50 hover:bg-red-50 p-2 rounded-full transition"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body (ตัวเลือกสถานะ) */}
                        <div className="p-6 space-y-3 bg-slate-50/50">
                            {statusOptions.map((opt) => {
                                const isSelected = selectedStatus === opt.id;
                                const Icon = opt.icon;
                                return (
                                    <div 
                                        key={opt.id}
                                        onClick={() => setSelectedStatus(opt.id)}
                                        className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex items-center gap-4 ${
                                            isSelected 
                                                ? `bg-white ${opt.activeRing} shadow-md` 
                                                : `bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50`
                                        }`}
                                    >
                                        <div className={`p-2.5 rounded-xl ${opt.bg} ${opt.color}`}>
                                            <Icon size={24} />
                                        </div>
                                        <div className="flex-1">
                                            <span className={`font-black text-lg ${isSelected ? opt.color : 'text-slate-700'}`}>
                                                {opt.label}
                                            </span>
                                        </div>
                                        {/* วงกลม Checkbox */}
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                                            isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                                        }`}>
                                            {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-slate-100 bg-white flex gap-4">
                            <button 
                                onClick={() => setUpdateModal({ ...updateModal, isOpen: false })} 
                                className="flex-1 py-3.5 font-bold text-slate-600 bg-white border-2 border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-800 transition"
                            >
                                ยกเลิก
                            </button>
                            <button 
                                onClick={handleSaveStatus} 
                                disabled={isSaving || selectedStatus === updateModal.currentStatus}
                                className="flex-1 py-3.5 font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:shadow-none flex justify-center items-center gap-2"
                            >
                                {isSaving ? <Loader2 className="animate-spin" size={20} /> : 'บันทึกสถานะ'}
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
}