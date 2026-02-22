"use client";

import { ShoppingCart, Search, Receipt } from "lucide-react";

const mockOrders = [
    { id: "ORD-2026-001", customer: "คิมเบอร์ลี่ แอน", amount: 3600, status: "pending", method: "PromptPay", date: "2026-02-23" },
    { id: "ORD-2026-002", customer: "ณเดชน์ คูกิมิยะ", amount: 10800, status: "paid", method: "Credit Card", date: "2026-02-22" },
];

export default function FinanceOrdersPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                        <ShoppingCart className="text-blue-600" size={32} />
                        ข้อมูลคำสั่งซื้อ (Order Details)
                    </h1>
                    <p className="text-slate-500 text-sm mt-2 font-medium">ดูคำสั่งซื้อทั้งหมดที่เกิดขึ้นในระบบ เพื่อตรวจสอบยอดเงิน</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-4 bg-slate-50/50">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="ค้นหารหัสคำสั่งซื้อ..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition outline-none shadow-sm"
                            readOnly
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-black tracking-wider">
                            <tr>
                                <th scope="col" className="px-6 py-4">รหัสคำสั่งซื้อ</th>
                                <th scope="col" className="px-6 py-4">วันที่ทำรายการ</th>
                                <th scope="col" className="px-6 py-4">ลูกค้า</th>
                                <th scope="col" className="px-6 py-4">วิธีการชำระเงิน</th>
                                <th scope="col" className="px-6 py-4">ยอดชำระ</th>
                                <th scope="col" className="px-6 py-4 text-right">สถานะบิล</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {mockOrders.map((ord) => (
                                <tr key={ord.id} className="hover:bg-blue-50/50 transition">
                                    <td className="px-6 py-4 font-bold text-slate-800 flex items-center gap-2"><Receipt size={16} className="text-slate-400" /> {ord.id}</td>
                                    <td className="px-6 py-4 font-medium text-slate-500">{ord.date}</td>
                                    <td className="px-6 py-4 text-slate-600 font-bold">{ord.customer}</td>
                                    <td className="px-6 py-4 text-slate-500 text-xs font-bold tracking-wider">{ord.method}</td>
                                    <td className="px-6 py-4 font-black text-blue-600">฿{ord.amount.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-right">
                                        <span className={`px-3 py-1 text-[10px] uppercase font-black tracking-wider rounded-md border shadow-sm ${ord.status === 'paid' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-amber-100 text-amber-700 border-amber-200'
                                            }`}>
                                            {ord.status === 'paid' ? 'ชำระแล้ว' : 'รอชำระ'}
                                        </span>
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
