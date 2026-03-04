"use client";

import { Wallet, Receipt, CreditCard, PiggyBank, FileText, BarChart3 } from "lucide-react";
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
    { name: "จ.", amount: 12000 },
    { name: "อ.", amount: 15000 },
    { name: "พ.", amount: 8000 },
    { name: "พฤ.", amount: 22000 },
    { name: "ศ.", amount: 35000 },
    { name: "ส.", amount: 48000 },
    { name: "อา.", amount: 42000 }
];

const mockBills = [
    { id: "INV-1001", customer: "คิมเบอร์ลี่ แอน", date: "2026-02-22", amount: 3600, status: "paid" },
    { id: "INV-1002", customer: "ณเดชน์ คูกิมิยะ", date: "2026-02-21", amount: 10800, status: "paid" },
    { id: "INV-1003", customer: "ญาญ่า อุรัสยา", date: "2026-02-21", amount: 7500, status: "pending" },
];

export default function AccountingPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                    <Wallet className="text-blue-600" size={32} />
                    จัดการรายได้และบิล
                </h1>
                <p className="text-slate-500 text-sm mt-2 font-medium">เบิ่งเรื่องเงินๆ ทองๆ ให้มันชัดๆ อย่าให่ขาดทุนเด้อจ้า</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-700 to-blue-900 p-6 rounded-2xl shadow-lg shadow-blue-500/20 text-white">
                    <h3 className="text-blue-100 text-sm font-bold mb-1 flex items-center gap-2"><PiggyBank size={18} /> ยอดรวมสุทธิเดือนนี้</h3>
                    <p className="text-3xl font-black mt-2">฿315,000</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-slate-800">
                    <h3 className="text-slate-500 text-sm font-bold mb-1 flex items-center gap-2"><Receipt size={18} /> เก็บเงินได้แล้ว</h3>
                    <p className="text-3xl font-black mt-2 text-emerald-500">฿250,000</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-slate-800">
                    <h3 className="text-slate-500 text-sm font-bold mb-1 flex items-center gap-2"><CreditCard size={18} /> รอชำระ (ค้างจ่าย)</h3>
                    <p className="text-3xl font-black mt-2 text-red-500">฿65,000</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* กราฟรายได้ */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                        <BarChart3 size={20} className="text-blue-600" /> รายได้รายสัปดาห์
                    </h2>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <RechartsBarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dx={-10} tickFormatter={(val) => `฿${val / 1000}k`} />
                                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="amount" name="รายได้สะสม" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={50} />
                            </RechartsBarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* ตารางบิล */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                            <FileText size={20} className="text-blue-600" /> ใบแจ้งหนี้ล่าสุด
                        </h2>
                        <button className="text-sm font-bold text-blue-600 hover:text-blue-800 transition">ดูทั้งหมด</button>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                        {mockBills.map((bill) => (
                            <div key={bill.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition bg-slate-50/30">
                                <div>
                                    <h4 className="font-bold text-slate-800 mb-1">{bill.customer}</h4>
                                    <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
                                        <span>{bill.id}</span>
                                        <span>วันที่ {bill.date}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-slate-800 mb-1">฿{bill.amount.toLocaleString()}</p>
                                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-sm ${bill.status === "paid" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                                        }`}>
                                        {bill.status === "paid" ? "จ่ายแล้วเด้อ" : "รอจ่าย"}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
