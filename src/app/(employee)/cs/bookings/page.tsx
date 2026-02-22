"use client";

import { CalendarDays, MapPin, Clock, Search } from "lucide-react";

const mockBookings = [
    { id: "BK-2401", customer: "คิมเบอร์ลี่ แอน", car: "Toyota Yaris Ativ", startDate: "2026-03-01", endDate: "2026-03-03", status: "pending", total: 3600 },
    { id: "BK-2402", customer: "ณเดชน์ คูกิมิยะ", car: "Honda Civic", startDate: "2026-02-28", endDate: "2026-03-05", status: "active", total: 10800 },
    { id: "BK-2403", customer: "ญาญ่า อุรัสยา", car: "Toyota Fortuner", startDate: "2026-02-20", endDate: "2026-02-22", status: "completed", total: 7500 },
];

export default function CSBookingsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                    <CalendarDays className="text-blue-600" size={32} />
                    จัดการการจองของลูกค้า
                </h1>
                <p className="text-slate-500 text-sm mt-2 font-medium">ดูแลใบจอง คอนเฟิร์มบิล และเบิ่งภาพรวมการเช่ารถทั้งหมดเด้อ</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-4 bg-slate-50/50">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="ค้นหาเลขบิล หรือชื่อลูกค้า..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition outline-none shadow-sm"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-black tracking-wider">
                            <tr>
                                <th scope="col" className="px-6 py-4">รหัสจอง</th>
                                <th scope="col" className="px-6 py-4">ลูกค้าลูกค้า</th>
                                <th scope="col" className="px-6 py-4">รถที่เช่า</th>
                                <th scope="col" className="px-6 py-4">ระยะเวลา</th>
                                <th scope="col" className="px-6 py-4">ยอดรวม</th>
                                <th scope="col" className="px-6 py-4">สถานะ</th>
                                <th scope="col" className="px-6 py-4 text-right">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {mockBookings.map((bk) => (
                                <tr key={bk.id} className="hover:bg-blue-50/50 transition">
                                    <td className="px-6 py-4 font-bold text-slate-800">{bk.id}</td>
                                    <td className="px-6 py-4 font-semibold text-slate-700">{bk.customer}</td>
                                    <td className="px-6 py-4 text-slate-500 font-medium">{bk.car}</td>
                                    <td className="px-6 py-4 text-slate-500 text-xs">
                                        <div className="flex items-center gap-1.5"><CalendarDays size={14} /> {bk.startDate} </div>
                                        <div className="flex items-center gap-1.5 mt-1"><Clock size={14} /> {bk.endDate}</div>
                                    </td>
                                    <td className="px-6 py-4 font-black text-blue-600">฿{bk.total.toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${bk.status === 'pending' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                                                bk.status === 'active' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                                                    'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                            }`}>
                                            {bk.status === 'pending' ? 'รอรับรถ' : bk.status === 'active' ? 'กำลังเช่า' : 'คืนรถแล้ว'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-sm font-bold text-blue-600 hover:text-blue-800 transition">อัพเดตสถานะ</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
