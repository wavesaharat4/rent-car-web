"use client";

import { Receipt, Search, Fuel, Wrench } from "lucide-react";

// ดูอย่างเดียว แก้ไขบ่ได้เด็ดขาด
const mockExpenses = [
    { id: "EXP-2026-001", type: "ค่าซ่อมบำรุงรถ", description: "เปลี่ยนถ่ายน้ำมันเครื่อง Honda Civic", amount: 2500, date: "2026-02-23" },
    { id: "EXP-2026-002", type: "ค่าน้ำมัน", description: "เติมน้ำมัน Toyota Yaris กอนส่งมอบลูกค้า", amount: 800, date: "2026-02-22" },
];

export default function AccountingExpensesPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                    <Receipt className="text-blue-600" size={32} />
                    รายงานรายจ่าย (Expenses)
                </h1>
                <p className="text-slate-500 text-sm mt-2 font-medium">ดูประวัติรายการจ่ายเงินออกทั้งหมดของร้าน *สิทธิ์บัญชีดูลูกเดียว แก้ไม่ได้*</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-4 bg-slate-50/50">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="ค้นหารายจ่าย..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition outline-none shadow-sm"
                            readOnly
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-black tracking-wider">
                            <tr>
                                <th scope="col" className="px-6 py-4">รหัสรายจ่าย</th>
                                <th scope="col" className="px-6 py-4">วันที่ทำรายการ</th>
                                <th scope="col" className="px-6 py-4">ประเภท</th>
                                <th scope="col" className="px-6 py-4">รายละเอียด</th>
                                <th scope="col" className="px-6 py-4 text-right">ยอดเงินจ่ายออก</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {mockExpenses.map((exp) => (
                                <tr key={exp.id} className="hover:bg-rose-50/50 transition">
                                    <td className="px-6 py-4 font-bold text-slate-800">{exp.id}</td>
                                    <td className="px-6 py-4 font-medium text-slate-500">{exp.date}</td>
                                    <td className="px-6 py-4">
                                        <span className={`flex w-fit items-center gap-1.5 px-2.5 py-1 text-[10px] font-black tracking-widest rounded-md border shadow-sm ${exp.type.includes('ซ่อมบำรุง') ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-slate-100 text-slate-700 border-slate-200'
                                            }`}>
                                            {exp.type.includes('ซ่อมบำรุง') && <Wrench size={12} />}
                                            {exp.type.includes('น้ำมัน') && <Fuel size={12} />}
                                            {exp.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 font-medium">{exp.description}</td>
                                    <td className="px-6 py-4 font-black text-rose-600 text-right">- ฿{exp.amount.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
