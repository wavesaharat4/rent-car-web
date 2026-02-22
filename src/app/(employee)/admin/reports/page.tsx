"use client";

import { BarChart3, TrendingUp, AlertCircle, Laptop } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const performanceData = [
    { time: "00:00", activeUsers: 2, errors: 0 },
    { time: "04:00", activeUsers: 5, errors: 1 },
    { time: "08:00", activeUsers: 45, errors: 2 },
    { time: "12:00", activeUsers: 120, errors: 5 },
    { time: "16:00", activeUsers: 85, errors: 1 },
    { time: "20:00", activeUsers: 30, errors: 0 },
];

export default function AdminReportsPage() {
    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                    <BarChart3 className="text-blue-600" size={32} />
                    รายงานประสิทธิภาพระบบ (System Status)
                </h1>
                <p className="text-slate-500 text-sm mt-2 font-medium">ภาพรวมการเฮ็ดงานของเซิร์ฟเวอร์ และสถิติคนเข้าใช้งานระบบรายชั่วโมง</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 p-6 rounded-2xl shadow-lg shadow-indigo-500/20 text-white">
                    <h3 className="text-indigo-100 text-sm font-bold flex items-center gap-2"><Laptop size={18} /> ผู้ใช้งานขณะนี้</h3>
                    <p className="text-4xl font-black mt-3">125 <span className="text-lg font-medium text-indigo-200">คน</span></p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="text-slate-500 text-sm font-bold flex items-center gap-2"><TrendingUp size={18} /> Uptime เซิร์ฟเวอร์</h3>
                    <p className="text-4xl font-black mt-3 text-emerald-500">99.98<span className="text-lg font-medium">%</span></p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="text-slate-500 text-sm font-bold flex items-center gap-2"><AlertCircle size={18} /> Error (วันนี้)</h3>
                    <p className="text-4xl font-black mt-3 text-red-500">9 <span className="text-lg font-medium text-slate-400">ครั้ง</span></p>
                </div>
            </div>

            {/* กราฟปังๆ */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                    <BarChart3 size={20} className="text-blue-600" /> ปริมาณการเข้าใช้งานระบบ (Active Traffic)
                </h2>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={performanceData}>
                            <defs>
                                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dx={-10} />
                            <Tooltip cursor={{ fill: '#f8fafc', stroke: '#e2e8f0', strokeWidth: 1, strokeDasharray: '3 3' }} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                            <Area type="monotone" dataKey="activeUsers" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
