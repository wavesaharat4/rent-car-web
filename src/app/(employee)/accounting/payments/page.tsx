"use client";

import { CreditCard, Search, FileText } from "lucide-react";

// ดูอย่างเดียว
const mockPayments = [
    { id: "PAY-2026-001", orderId: "ORD-2026-001", amount: 3600, status: "pending", date: "2026-02-23 14:00" },
    { id: "PAY-2026-002", orderId: "ORD-2026-002", amount: 10800, status: "completed", date: "2026-02-22 09:30" },
];

export default function AccountingPaymentsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                    <CreditCard className="text-blue-600" size={32} />
                    รายการชำระเงิน (Payment Logs)
                </h1>
                <p className="text-slate-500 text-sm mt-2 font-medium">ดูประวัติลูกค้าโอนเงิน หรือรูดบัตร *สิทธิ์บัญชีดูลูกเดียว แก้ไม่ได้*</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-4 bg-slate-50/50">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="ค้นหารหัส PAY-..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition outline-none shadow-sm"
                            readOnly
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-black tracking-wider">
                            <tr>
                                <th scope="col" className="px-6 py-4">Transaction ID</th>
                                <th scope="col" className="px-6 py-4">อ้างอิงรหัสสั่งซื้อ</th>
                                <th scope="col" className="px-6 py-4">วัน-เวลา</th>
                                <th scope="col" className="px-6 py-4">สถานะ</th>
                                <th scope="col" className="px-6 py-4 text-right">ยอดรับเข้า</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {mockPayments.map((pay) => (
                                <tr key={pay.id} className="hover:bg-blue-50/50 transition">
                                    <td className="px-6 py-4 font-bold text-slate-800 flex items-center gap-2"><FileText size={16} className="text-slate-400" /> {pay.id}</td>
                                    <td className="px-6 py-4 font-medium text-slate-500">{pay.orderId}</td>
                                    <td className="px-6 py-4 text-slate-500">{pay.date}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-[10px] bg-slate-100 font-black tracking-widest rounded-md border shadow-sm ${pay.status === 'completed' ? 'text-emerald-600 border-emerald-200' : 'text-amber-600 border-amber-200'
                                            }`}>
                                            {pay.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-black text-emerald-600 text-right">฿{pay.amount.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
