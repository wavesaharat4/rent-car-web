"use client";

import { CreditCard, Search, CheckCircle2 } from "lucide-react";

const mockPayments = [
    { id: "PAY-2026-001", orderId: "ORD-2026-001", amount: 3600, status: "pending" },
    { id: "PAY-2026-002", orderId: "ORD-2026-002", amount: 10800, status: "completed" },
];

export default function FinancePaymentsPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                        <CreditCard className="text-blue-600" size={32} />
                        จัดการบิลชำระเงิน (Payments & Billing)
                    </h1>
                    <p className="text-slate-500 text-sm mt-2 font-medium">กระทบยอดและ<strong>แก้ไขสถานะการชำระเงิน</strong>เมื่อลูกค้าโอนเงิน</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {mockPayments.map((pay) => (
                    <div key={pay.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col hover:border-blue-200 transition">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <span className="bg-slate-100 text-slate-500 px-2.5 py-1 text-xs font-black tracking-widest rounded border border-slate-200">{pay.id}</span>
                                <p className="text-xs font-bold text-slate-400 mt-2">อ้างอิง: {pay.orderId}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-black text-2xl text-blue-600 tracking-tighter">฿{pay.amount.toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="mt-auto pt-4 border-t border-slate-100">
                            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">แก้ไขสถานะการชำระเงิน</label>
                            <select className="w-full bg-slate-50 border border-slate-200 text-sm font-bold text-slate-700 rounded-xl px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" defaultValue={pay.status}>
                                <option value="pending">รอการชำระเงิน</option>
                                <option value="completed">ได้รับเงินแล้ว (Completed)</option>
                                <option value="refunded">คืนเงิน (Refunded)</option>
                                <option value="failed">ชำระไม่สำเร็จ</option>
                            </select>
                        </div>

                        <button className={`w-full mt-4 flex justify-center items-center gap-2 py-3 rounded-xl text-sm font-bold transition shadow-sm ${pay.status === 'completed' ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                            }`}>
                            <CheckCircle2 size={18} /> {pay.status === 'completed' ? 'ล็อกบิลแล้ว' : 'ยืนยันการรับเงิน'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
