"use client";

import { BarChart3, TrendingUp, Users, CarFront, ThaiBaht } from "lucide-react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, AreaChart, Area
} from "recharts";

// ข้อมูลจำลองสำหรับกราฟเด้อ (เดี๋ยวตั่วแบคเอนสิพ่น JSON มาให้แบบนี่ล่ะ)
const revenueData = [
    { name: 'มกราคม', income: 40000, bookings: 24 },
    { name: 'กุมภาพันธ์', income: 30000, bookings: 18 },
    { name: 'มีนาคม', income: 55000, bookings: 35 },
    { name: 'เมษายน', income: 85000, bookings: 50 },
    { name: 'พฤษภาคม', income: 45000, bookings: 28 },
    { name: 'มิถุนายน', income: 60000, bookings: 38 },
];

export default function ManagerReportsPage() {
    return (
        <div className="space-y-8">

            {/* ส่วนหัวหน้าจอ Manager ซงสิหล่อๆจักหน่อย */}
            <div>
                <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                    <BarChart3 className="text-blue-600" size={32} />
                    ภาพรวมของกิจการ (Dashboard)
                </h1>
                <p className="text-slate-500 text-sm mt-2 font-medium">สรุปยอดเช่า รายได้ และสถิติต่างๆ ที่เฮ็ดให้ผู้จัดการหูตาสว่าง</p>
            </div>

            {/* ควอเตอร์สรุปยอด ยัดใส่ Grid งามๆ เด้อ */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* การ์ดที่ 1: รายได้ */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start justify-between group hover:border-blue-200 transition-colors">
                    <div>
                        <p className="text-sm font-bold text-slate-500 mb-1">รายได้เดือนนี้</p>
                        <h3 className="text-2xl font-black text-slate-800">฿315,000</h3>
                        <p className="text-xs font-bold text-green-500 flex items-center mt-2 gap-1">
                            <TrendingUp size={14} /> +12% เทียบกับเดือนก่อน
                        </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                        <span className="text-blue-600 font-black text-xl group-hover:text-white transition-colors">฿</span>
                    </div>
                </div>

                {/* การ์ดที่ 2: จำนวนจอง */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start justify-between group hover:border-emerald-200 transition-colors">
                    <div>
                        <p className="text-sm font-bold text-slate-500 mb-1">ยอดจองรถรวม</p>
                        <h3 className="text-2xl font-black text-slate-800">193 ครั้ง</h3>
                        <p className="text-xs font-bold text-green-500 flex items-center mt-2 gap-1">
                            <TrendingUp size={14} /> +5% เทียบกับเดือนก่อน
                        </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
                        <CarFront className="text-emerald-500 group-hover:text-white transition-colors" size={24} />
                    </div>
                </div>

                {/* การ์ดที่ 3: ลูกค้าใหม่ */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start justify-between group hover:border-purple-200 transition-colors">
                    <div>
                        <p className="text-sm font-bold text-slate-500 mb-1">ลูกค้าใหม่</p>
                        <h3 className="text-2xl font-black text-slate-800">+48 คน</h3>
                        <p className="text-xs font-bold text-slate-400 mt-2">ภายใน 30 วันที่ผ่านมา</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center group-hover:bg-purple-500 transition-colors">
                        <Users className="text-purple-500 group-hover:text-white transition-colors" size={22} />
                    </div>
                </div>

                {/* การ์ดที่ 4: ความพึงพอใจเป้าหมาย */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl shadow-lg shadow-blue-500/20 text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="relative z-10">
                        <p className="text-blue-100 font-bold text-sm mb-1">คะแนนรีวิวเฉลี่ย</p>
                        <h3 className="text-3xl font-black">4.8 <span className="text-lg text-blue-200 font-medium">/ 5.0</span></h3>
                    </div>
                    <div className="relative z-10 mt-3 flex items-center gap-1 text-blue-100 text-xs font-semibold">
                        ⭐⭐⭐⭐⭐ สุดจัดปลัดบอก
                    </div>
                    {/* ลายเส้นตกแต่งให้งามๆ */}
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="absolute -left-6 -bottom-6 w-24 h-24 bg-indigo-400/20 rounded-full blur-xl"></div>
                </div>

            </div>

            {/* ส่วนแสดงกราฟ (Charts) ใช้ Recharts เด้อ สิได้หน้าตาสวยๆ แอนิเมชันปังๆ */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* กราฟหลัก ใหญ่ๆ เบิ้มๆ */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="mb-6 flex justify-between items-center">
                        <h2 className="text-lg font-black text-slate-800">แนวโน้มรายได้ 6 เดือนย้อนหลัง</h2>
                        <select className="bg-slate-50 border border-slate-200 text-sm font-bold text-slate-600 rounded-lg px-3 py-1 outline-none">
                            <option>ปี 2026</option>
                            <option>ปี 2025</option>
                        </select>
                    </div>

                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    {/* กำหนด Gradient สีน้ำเงินไล่ลงมาสวยๆ */}
                                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} dx={-10} tickFormatter={(value) => `฿${value / 1000}k`} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                                    itemStyle={{ fontWeight: 700 }}
                                />
                                <Area type="monotone" dataKey="income" name="เงินเข้า (บาท)" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* กราฟด่านข้าง สถิติการจอง */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="mb-6">
                        <h2 className="text-lg font-black text-slate-800">สถิติการจองรถ</h2>
                        <p className="text-xs font-semibold text-slate-500">จำนวนการเปิดบิลเช่ารถตลอด 6 เดือน</p>
                    </div>

                    <div className="h-[280px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={revenueData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} />
                                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                                <Bar dataKey="bookings" name="ยอดจอง (ครั้ง)" fill="#0ea5e9" radius={[4, 4, 0, 0]} maxBarSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>
        </div>
    );
}
