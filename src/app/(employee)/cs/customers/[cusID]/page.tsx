"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Swal from "sweetalert2";
import {
    ArrowLeft, User, Mail, Phone, MapPin, Calendar,
    CreditCard, ShieldCheck, Clock, FileText, Trash2, Edit3
} from "lucide-react";

interface CustomerDetailDB {
    cusID: number;
    cusFN: string;
    cusLN: string;
    cusMail: string;
    cusPhone: string;
    cusDOB: string;
    cusPassport: string;
    cusDL: string;
    cusAddress: string;
    cusStatus: string;
    cusCreate: string;
    cusUpdate: string;
    cusGender: string;
}

export default function CustomerDetailPage() {
    const params = useParams();
    const router = useRouter();
    const cusID = params.cusID;

    const [customer, setCustomer] = useState<CustomerDetailDB | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchCustomerDetail = async () => {
        if (!cusID) return;
        try {
            const response = await fetch(`/api/customer/${cusID}`);
            if (!response.ok) throw new Error("Failed to fetch customer detail");

            const data = await response.json();
            if (data.ok) {
                setCustomer(data.data);
            } else {
                setCustomer(data);
            }
        } catch (error) {
            console.error("Error fetching customer details:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomerDetail();
    }, [cusID]);

    // 🌟 ฟังก์ชันอัปเดตสถานะลูกค้า
    const handleUpdateStatus = async () => {
        if (!customer) return;

        const { value: newStatus } = await Swal.fire({
            title: `อัปเดตสถานะลูกค้า`,
            input: 'select',
            inputOptions: {
                'Active': '🟢 ใช้งานปกติ (Active)',
                'Inactive': '⚪ ระงับชั่วคราว (Inactive)',
                'Banned': '🔴 แบน (Banned)'
            },
            inputValue: customer.cusStatus || 'Active',
            showCancelButton: true,
            confirmButtonColor: "#2563eb",
            confirmButtonText: "บันทึก",
            cancelButtonText: "ยกเลิก",
            customClass: { popup: 'rounded-3xl' }
        });

        if (newStatus && newStatus !== customer.cusStatus) {
            try {
                const res = await fetch(`/api/customer/${cusID}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ cusStatus: newStatus })
                });

                if (res.ok) {
                    Swal.fire({ icon: 'success', title: 'อัปเดตสถานะสำเร็จ', showConfirmButton: false, timer: 1500, customClass: { popup: 'rounded-3xl' } });
                    setCustomer({ ...customer, cusStatus: newStatus });
                } else {
                    throw new Error("Failed to update status");
                }
            } catch (error) {
                Swal.fire('ข้อผิดพลาด', 'ไม่สามารถอัปเดตสถานะได้', 'error');
            }
        }
    };

    // 🌟 2. ฟังก์ชันลบข้อมูลลูกค้า (ปรับให้โชว์ Error จาก API)
    const handleDeleteCustomer = async () => {
        const result = await Swal.fire({
            title: 'ยืนยันการลบข้อมูล?',
            text: `คุณต้องการลบข้อมูลของ ${customer?.cusFN} ใช่หรือไม่? (ไม่สามารถกู้คืนได้)`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444', 
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'ยืนยันลบข้อมูล',
            cancelButtonText: 'ยกเลิก',
            customClass: { popup: 'rounded-3xl' }
        });

        if (result.isConfirmed) {
            try {
                const res = await fetch(`/api/customer/${cusID}`, {
                    method: 'DELETE'
                });

                // ดึงข้อมูลที่ API ตอบกลับมา (รวมถึงข้อความ Error 1451 ที่เราเพิ่งเขียน)
                const data = await res.json(); 

                if (res.ok) {
                    await Swal.fire({ icon: 'success', title: 'ลบข้อมูลสำเร็จ', showConfirmButton: false, timer: 1500, customClass: { popup: 'rounded-3xl' } });
                    router.push('/cs/customers');
                } else {
                    // ถ้าลบไม่สำเร็จ (เช่น ติด Foreign Key) ให้โยนข้อความจาก API ไปเข้า catch
                    throw new Error(data.message || "Failed to delete customer");
                }
            } catch (error: any) {
                // 🌟 โชว์ข้อความแจ้งเตือนที่ได้มาจาก API
                Swal.fire({
                    icon: 'error',
                    title: 'ลบข้อมูลไม่สำเร็จ',
                    text: error.message,
                    customClass: { popup: 'rounded-3xl' }
                });
            }
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('th-TH', {
            year: 'numeric', month: 'long', day: 'numeric'
        }).format(date);
    };

    const formatPhone = (phone: string) => {
        if (phone?.length === 10) return `${phone.slice(0, 3)}-${phone.slice(3, 6)}-${phone.slice(6)}`;
        return phone || "-";
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] w-full">
                <div className="animate-spin w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full mb-4"></div>
                <p className="text-slate-500 font-bold">กำลังโหลดข้อมูลลูกค้า...</p>
            </div>
        );
    }

    if (!customer) {
        return (
            <div className="text-center py-20 w-full">
                <h2 className="text-2xl font-bold text-slate-800">ไม่พบข้อมูลลูกค้า</h2>
                <Link href="/cs/customers" className="text-blue-600 mt-4 inline-block hover:underline font-bold">กลับไปหน้ารายชื่อลูกค้า</Link>
            </div>
        );
    }

    return (
        <div className="w-full max-w-5xl mx-auto space-y-6 pb-12 px-4 md:px-6">

            {/* Header (เหลือแค่ปุ่มย้อนกลับและหัวข้อ) */}
            <div className="flex flex-wrap items-center gap-4 bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 w-full">
                <Link href="/cs/customers" className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition text-slate-500 shrink-0">
                    <ArrowLeft size={20} />
                </Link>
                <div className="min-w-0 flex-1">
                    <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight truncate">
                        ข้อมูลลูกค้า : {customer.cusFN} {customer.cusLN}
                    </h1>
                    <p className="text-sm text-slate-500 font-medium mt-1 truncate">รายละเอียดข้อมูลส่วนบุคคลและประวัติการใช้บริการ</p>
                </div>
            </div>

            <div className="flex flex-col gap-6 w-full">

                {/* 1. Profile & System Info */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">

                    {/* Profile Card */}
                    <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6 w-full">
                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 text-blue-600 flex items-center justify-center text-4xl sm:text-5xl font-black border-4 border-white shadow-md relative shrink-0">
                            {customer.cusFN.charAt(0)}

                            {/* ป้ายสถานะ */}
                            <span
                                className={`absolute -bottom-2 sm:-bottom-1 px-3 py-1 text-[10px] font-black tracking-widest rounded-full border shadow-sm uppercase ${customer.cusStatus?.toLowerCase() === 'active' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                                        customer.cusStatus?.toLowerCase() === 'banned' ? 'bg-red-100 text-red-700 border-red-200' :
                                            'bg-slate-100 text-slate-600 border-slate-200'
                                    }`}
                            >
                                {customer.cusStatus || 'ACTIVE'}
                            </span>
                        </div>

                        <div className="flex-1 min-w-0 w-full space-y-4 pt-2">
                            {/* 🌟 ย้ายปุ่มเปลี่ยนสถานะมาอยู่ในบรรทัดเดียวกับชื่อ */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <h2 className="text-xl md:text-2xl font-black text-slate-800 truncate">{customer.cusFN} {customer.cusLN}</h2>
                                <button
                                    onClick={handleUpdateStatus}
                                    className="flex items-center justify-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-100 py-2 px-4 rounded-xl font-bold text-sm transition-all shadow-sm w-full sm:w-auto shrink-0"
                                >
                                    <Edit3 size={16} /> เปลี่ยนสถานะ
                                </button>
                            </div>

                            <div className="space-y-3 pt-2">
                                <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 w-full">
                                    <div className="bg-white p-1.5 rounded-lg shadow-sm shrink-0"><Phone size={16} className="text-blue-500" /></div>
                                    <span className="font-bold text-sm truncate">{formatPhone(customer.cusPhone)}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 w-full">
                                    <div className="bg-white p-1.5 rounded-lg shadow-sm shrink-0"><Mail size={16} className="text-blue-500" /></div>
                                    <span className="font-bold text-sm truncate">{customer.cusMail}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* System Info Card */}
                    <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 w-full flex flex-col justify-center">
                        <h3 className="font-bold text-slate-800 mb-5 flex items-center gap-2">
                            <Clock size={18} className="text-slate-400" /> ข้อมูลระบบ
                        </h3>
                        <div className="space-y-4 text-sm w-full">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-slate-50 p-4 rounded-xl w-full gap-2">
                                <span className="text-slate-500 font-medium">รหัสลูกค้า</span>
                                <span className="font-black text-blue-600 sm:text-right">#{customer.cusID}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center px-2 w-full gap-1">
                                <span className="text-slate-500 font-medium">สมัครใช้งานเมื่อ</span>
                                <span className="font-bold text-slate-700 sm:text-right">{formatDate(customer.cusCreate)}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center px-2 w-full gap-1">
                                <span className="text-slate-500 font-medium">อัปเดตล่าสุด</span>
                                <span className="font-bold text-slate-700 sm:text-right">{formatDate(customer.cusUpdate)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Personal Detail */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden w-full">
                    <div className="p-5 md:p-6 border-b border-slate-100 bg-white flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0"><User size={20} /></div>
                        <h3 className="font-black text-lg text-slate-800">ข้อมูลส่วนตัว (Personal Detail)</h3>
                    </div>
                    <div className="p-5 md:p-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6 bg-slate-50/30 w-full">
                        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm w-full">
                            <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                <User size={14} /> เพศ (Gender)
                            </label>
                            <p className="font-black text-slate-800 text-lg truncate">{customer.cusGender || "ไม่ระบุ"}</p>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm w-full">
                            <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                <Calendar size={14} /> วันเกิด (DOB)
                            </label>
                            <p className="font-black text-slate-800 text-lg truncate">{formatDate(customer.cusDOB)}</p>
                        </div>
                        <div className="md:col-span-2 xl:col-span-1 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm w-full">
                            <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                <MapPin size={14} /> ที่อยู่ (Address)
                            </label>
                            <p className="font-bold text-slate-700 leading-relaxed break-words whitespace-normal">{customer.cusAddress || "ไม่ได้ระบุที่อยู่"}</p>
                        </div>
                    </div>
                </div>

                {/* 3. Verification Documents */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden w-full">
                    <div className="p-5 md:p-6 border-b border-slate-100 bg-white flex items-center gap-3">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg shrink-0"><ShieldCheck size={20} /></div>
                        <h3 className="font-black text-lg text-slate-800">เอกสารยืนยันตัวตน (Verification)</h3>
                    </div>
                    <div className="p-5 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 bg-slate-50/30 w-full">

                        {/* ใบขับขี่ */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-blue-300 transition-colors w-full">
                            <div className="absolute -right-6 -top-6 text-slate-50 group-hover:text-blue-50 transition-colors">
                            </div>
                            <div className="relative z-10 w-full">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0"><CreditCard className="text-slate-600" size={16} /></div>
                                    <span className="font-bold text-slate-500 text-sm">เลขที่ใบขับขี่ (Driving License)</span>
                                </div>
                                <p className="text-xl lg:text-2xl font-black text-slate-800 tracking-widest bg-slate-50 py-4 px-5 rounded-xl border border-slate-100 truncate w-full">
                                    {customer.cusDL || "ไม่มีข้อมูล"}
                                </p>
                            </div>
                        </div>

                        {/* พาสปอร์ต */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-blue-300 transition-colors w-full">
                            <div className="absolute -right-6 -top-6 text-slate-50 group-hover:text-blue-50 transition-colors">
                            </div>
                            <div className="relative z-10 w-full">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0"><FileText className="text-slate-600" size={16} /></div>
                                    <span className="font-bold text-slate-500 text-sm">พาสปอร์ต (Passport)</span>
                                </div>
                                <p className="text-xl lg:text-2xl font-black text-slate-800 tracking-widest bg-slate-50 py-4 px-5 rounded-xl border border-slate-100 truncate w-full">
                                    {customer.cusPassport || "ไม่มีข้อมูล"}
                                </p>
                            </div>
                        </div>

                    </div>
                </div>

                {/* 🌟 4. Danger Zone (ปุ่มลบข้อมูล ย้ายมาล่างสุด) */}
                <div className="pt-8 pb-4 flex justify-end border-t border-slate-200 mt-4">
                    <button
                        onClick={handleDeleteCustomer}
                        className="flex items-center justify-center gap-2 bg-white text-red-500 hover:bg-red-50 hover:text-red-600 border-2 border-red-100 hover:border-red-200 py-3 px-6 rounded-xl font-bold text-base transition-all shadow-sm w-full sm:w-auto"
                    >
                        <Trash2 size={18} /> ลบข้อมูลลูกค้า
                    </button>
                </div>

            </div>
        </div>
    );
}