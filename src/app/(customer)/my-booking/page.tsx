"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function MyBookingsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [bookings, setBookings] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // ถ้าเช็คแล้วพบว่าไม่ได้ล็อกอิน ให้เด้งกลับหน้าแรก
        if (status === "unauthenticated") {
            router.push("/");
        }

        // ถ้ามี session (ล็อกอินแล้ว) ให้ดึงข้อมูลการจอง
        if ((session?.user as any)?.id) {
    fetchBookings((session?.user as any).id);
}
    }, [session, status, router]);

    const fetchBookings = async (userId: string) => {
        try {
            const res = await fetch(`/api/customer/bookings?userId=${userId}`);
            if (res.ok) {
                const data = await res.json();
                setBookings(data);
            }
        } catch (error) {
            console.error("Error fetching bookings:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // 📌 ฟังก์ชันแปลงตัวเลข int (Timestamp) เป็นวันที่แบบไทยสวยๆ
    const formatDate = (timestamp: number) => {
        if (!timestamp) return "-";
        // สมมติว่าเก็บเป็นมิลลิวินาที (ถ้าเก็บเป็นวินาที ให้เอา timestamp * 1000)
        const date = new Date(timestamp); 
        return date.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // 📌 ฟังก์ชันเลือกสีป้ายสถานะ
    const getStatusBadge = (status: string) => {
        const lowerStatus = status?.toLowerCase() || '';
        if (lowerStatus === 'pending') return 'bg-orange-100 text-orange-600 border border-orange-200';
        if (lowerStatus === 'confirmed' || lowerStatus === 'active') return 'bg-green-100 text-green-600 border border-green-200';
        if (lowerStatus === 'completed') return 'bg-blue-100 text-blue-600 border border-blue-200';
        if (lowerStatus === 'cancelled') return 'bg-red-100 text-red-600 border border-red-200';
        return 'bg-slate-100 text-slate-600 border border-slate-200';
    };

    // ⏳ หน้าจอกำลังโหลด
    if (status === "loading" || isLoading) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="mt-4 text-slate-500 font-medium">กำลังโหลดข้อมูลการจองของคุณ...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-24 px-4 sm:px-6 lg:px-8 mt-10">
            <div className="max-w-5xl mx-auto">
                
                {/* 📌 Header */}
                <div className="mb-8 border-b border-slate-200 pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">การจองของฉัน</h1>
                        <p className="text-slate-500 mt-2">ตรวจสอบรายละเอียดและสถานะการเช่ารถของคุณได้ที่นี่</p>
                    </div>
                    <Link href="/cars" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full font-semibold transition-colors shadow-md">
                        + จองรถเพิ่ม
                    </Link>
                </div>

                {/* 📌 กรณีไม่มีประวัติการจอง */}
                {bookings.length === 0 ? (
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-16 text-center mt-10">
                        <div className="w-24 h-24 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-3">คุณยังไม่มีประวัติการจองรถ</h3>
                        <p className="text-slate-500 mb-8 max-w-md mx-auto">เริ่มต้นการเดินทางของคุณกับ PhumJai Rent เลือกรถที่ถูกใจและทำการจองได้เลยทันที</p>
                        <Link href="/cars" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3.5 rounded-full transition-all duration-300 shadow-lg hover:shadow-blue-500/30 transform hover:-translate-y-1">
                            ดูรถเช่าทั้งหมด
                        </Link>
                    </div>
                ) : (
                    /* 📌 กรณีมีข้อมูล (แสดงเป็น Grid) */
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {bookings.map((booking) => (
                            <div key={booking.bookID} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
                                
                                {/* ส่วนบน (รูป + สถานะ + ชื่อรถ) */}
                                <div className="p-6 pb-4 border-b border-slate-100">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                                            รหัสจอง: #{booking.bookID}
                                        </span>
                                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${getStatusBadge(booking.bookStatus)}`}>
                                            {booking.bookStatus?.toUpperCase() || 'ไม่ทราบสถานะ'}
                                        </span>
                                    </div>

                                    <div className="flex gap-4 items-center">
                                        {/* รูปรถ (ถ้าไม่มีจะใช้ div สีเทาแทน) */}
                                        <div className="w-24 h-20 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200 flex items-center justify-center">
                                            {booking.carPicture ? (
                                                <img src={booking.carPicture} alt="Car" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-xs text-slate-400">ไม่มีรูปภาพ</span>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                                                {booking.carBrand} {booking.carType}
                                            </h3>
                                            <p className="text-sm text-slate-500 mt-1">
                                                ค่าเช่า: ฿{booking.bookCarPrice?.toLocaleString() || 0} / วัน
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* ส่วนกลาง (รายละเอียดวันที่ และสถานที่) */}
                                <div className="p-6 flex-grow bg-slate-50/50">
                                    <div className="space-y-4 text-sm text-slate-600">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-0.5 text-blue-500">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs text-slate-400 font-semibold mb-0.5">รับรถ - คืนรถ</p>
                                                <p className="font-medium text-slate-800">{formatDate(booking.bookStart)}</p>
                                                <p className="font-medium text-slate-800">ถึง {formatDate(booking.bookEnd)}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <div className="mt-0.5 text-red-500">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs text-slate-400 font-semibold mb-0.5">สถานที่</p>
                                                <p className="font-medium text-slate-800">รับ: {booking.bookSProvice || '-'}</p>
                                                <p className="font-medium text-slate-800">คืน: {booking.bookEProvince || '-'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* ส่วนล่าง (ราคารวม) */}
                                <div className="p-6 pt-4 bg-white border-t border-slate-100 flex justify-between items-center">
                                    <div>
                                        <p className="text-xs text-slate-500 font-semibold">ยอดชำระสุทธิ</p>
                                        <p className="text-2xl font-black text-blue-700">฿{booking.bookTotalPrice?.toLocaleString() || 0}</p>
                                    </div>
                                </div>

                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}