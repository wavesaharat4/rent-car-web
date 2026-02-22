"use client";

import { Car, Search, Filter, Printer } from "lucide-react";

// ดูอย่างเดียว แก้ไขบ่ได้เด็ดขาด
const mockRentals = [
    { id: "RNT-2602-001", car: "Toyota Yaris Ativ", customer: "คิมเบอร์ลี่ แอน", duration: "3 วัน", price: 3600, date: "2026-02-23" },
    { id: "RNT-2602-002", car: "Honda Civic", customer: "ณเดชน์ คูกิมิยะ", duration: "7 วัน", price: 10800, date: "2026-02-22" },
];

export default function AccountingRentalsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                    <Car className="text-blue-600" size={32} />
                    รายการเช่ารถ (Rental Logs)
                </h1>
                <p className="text-slate-500 text-sm mt-2 font-medium">ดูประวัติการเช่ารถทั้งหมดในระบบ เพื่อนำไปประเมินบัญชี *สิทธิ์บัญชีดูลูกเดียว แก้ไม่ได้*</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-4 bg-slate-50/50">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="ค้นหารหัสใบเช่า..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition outline-none shadow-sm"
                            readOnly
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition shadow-sm text-sm">
                        <Filter size={16} /> กรองข้อมูล
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-black tracking-wider">
                            <tr>
                                <th scope="col" className="px-6 py-4">รหัสบิลเช่า</th>
                                <th scope="col" className="px-6 py-4">วันที่ทำรายการ</th>
                                <th scope="col" className="px-6 py-4">รุ่นรถ</th>
                                <th scope="col" className="px-6 py-4">ลูกค้า</th>
                                <th scope="col" className="px-6 py-4">ระยะเวลา</th>
                                <th scope="col" className="px-6 py-4 text-right">ยอดเก็บเงิน</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {mockRentals.map((rnt) => (
                                <tr key={rnt.id} className="hover:bg-blue-50/50 transition">
                                    <td className="px-6 py-4 font-bold text-slate-800">{rnt.id}</td>
                                    <td className="px-6 py-4 font-medium text-slate-500">{rnt.date}</td>
                                    <td className="px-6 py-4 text-slate-600 font-medium">{rnt.car}</td>
                                    <td className="px-6 py-4 text-slate-500">{rnt.customer}</td>
                                    <td className="px-6 py-4 font-bold text-slate-500">{rnt.duration}</td>
                                    <td className="px-6 py-4 font-black text-emerald-600 text-right">฿{rnt.price.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
