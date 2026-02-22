"use client";

import { Wallet, Download, Calendar } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
    { name: "สัปดาห์ 1", income: 45000 },
    { name: "สัปดาห์ 2", income: 52000 },
    { name: "สัปดาห์ 3", income: 38000 },
    { name: "สัปดาห์ 4", income: 65000 },
];

export default function AccountingIncomePage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                        <Wallet className="text-blue-600" size={32} />
                        รายงานรายได้ (Income Report)
                    </h1>
                    <p className="text-slate-500 text-sm mt-2 font-medium">ดูรายงานเงินเข้าทั้งหมดของร้าน *สิทธิ์บัญชีดูลูกเดียว แก้ไม่ได้*</p>
                </div>
                <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-bold transition shadow-md whitespace-nowrap">
                    <Download size={18} /> Export CSV
                </button>
            </div>

            {/* กราฟสะสมรายได้ */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                    <Calendar size={20} className="text-blue-600" /> กราฟรายได้ประจำเดือน
                </h2>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dx={-10} tickFormatter={(val) => `฿${val / 1000}k`} />
                            <Tooltip cursor={{ stroke: '#e2e8f0', strokeWidth: 1 }} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            <Line type="monotone" dataKey="income" stroke="#3b82f6" strokeWidth={4} dot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }} activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
