"use client";

import { Users, Search, Mail, Phone, CalendarCheck, ShieldCheck } from "lucide-react";

// ดึงข้อมูลลูกค้าจำลองเด้อ
const mockCustomers = [
    { id: "CUST-001", name: "คิมเบอร์ลี่ แอน", email: "kim@example.com", phone: "081-234-5678", bookings: 12, status: "VIP" },
    { id: "CUST-002", name: "ณเดชน์ คูกิมิยะ", email: "nadech@example.com", phone: "089-876-5432", bookings: 5, status: "Member" },
    { id: "CUST-003", name: "ญาญ่า อุรัสยา", email: "yaya@example.com", phone: "085-555-4433", bookings: 1, status: "New" },
    { id: "CUST-004", name: "มาริโอ้ เมาเร่อ", email: "mario@example.com", phone: "086-777-8899", bookings: 0, status: "New" },
];

export default function CSCustomersPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                        <Users className="text-blue-600" size={32} />
                        จัดการข้อมูลลูกค้า (Customers)
                    </h1>
                    <p className="text-slate-500 text-sm mt-2 font-medium">เบิ่งประวัติลูกค้า ให้บริการและดูแลฐานข้อมูลลูกค้าหลักเด้อ</p>
                </div>
            </div>

            {/* แถบค้นหา */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-2">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="ค้นหาชื่อ, เบอร์โทร หรือ อีเมลลูกค้า..."
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl text-slate-700 font-medium focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition outline-none"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {mockCustomers.map((cust) => (
                    <div key={cust.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center hover:shadow-md transition group">
                        {/* รูป Profile ขำๆ */}
                        <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-3xl font-black mb-4 border-4 border-blue-50 group-hover:scale-110 transition-transform">
                            {cust.name.charAt(0)}
                        </div>

                        <h3 className="font-black text-slate-800 text-lg mb-1">{cust.name}</h3>

                        {/* ป้ายสถานะลูกค้า */}
                        <div className="mb-4">
                            <span className={`px-3 py-1 text-xs font-black tracking-widest rounded-full border shadow-sm ${cust.status === 'VIP' ? 'bg-amber-100 text-amber-600 border-amber-200' :
                                    cust.status === 'Member' ? 'bg-blue-100 text-blue-600 border-blue-200' :
                                        'bg-slate-100 text-slate-600 border-slate-200'
                                }`}>
                                {cust.status === 'VIP' ? '🌟 VIP' : cust.status === 'Member' ? '🟢 MEMBER' : '⚪ NEW'}
                            </span>
                        </div>

                        <div className="w-full space-y-2 text-sm text-left mb-6">
                            <div className="flex items-center gap-2 text-slate-500 bg-slate-50 p-2 rounded-lg"><Mail size={16} className="text-slate-400" /> {cust.email}</div>
                            <div className="flex items-center gap-2 text-slate-500 bg-slate-50 p-2 rounded-lg"><Phone size={16} className="text-slate-400" /> {cust.phone}</div>
                            <div className="flex items-center gap-2 text-slate-500 bg-slate-50 p-2 rounded-lg"><CalendarCheck size={16} className="text-blue-500" /> จองไปแล้ว <strong className="text-slate-800 ml-auto">{cust.bookings} ครั้ง</strong></div>
                        </div>

                        <button className="w-full mt-auto py-2.5 rounded-xl border-2 border-slate-100 text-slate-600 font-bold hover:bg-slate-50 hover:text-blue-600 hover:border-blue-100 transition flex justify-center items-center gap-2">
                            <ShieldCheck size={18} /> ดูประวัติเต็มๆ
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
