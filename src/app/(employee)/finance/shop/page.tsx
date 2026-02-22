"use client";

import { Building2, Save, MapPin, Calculator } from "lucide-react";

export default function FinanceShopPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                        <Building2 className="text-blue-600" size={32} />
                        จัดการข้อมูลร้านค้า / สาขา (Shop Details)
                    </h1>
                    <p className="text-slate-500 text-sm mt-2 font-medium">ดูและตั้งค่าเลขที่บัญชี ภาษี สำหรับการออกบิล</p>
                </div>
                <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold transition shadow-md whitespace-nowrap">
                    <Save size={18} /> บันทึก
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="font-black text-lg text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                        <Calculator size={20} className="text-slate-400" /> เลขประจำตัวผู้เสียภาษี
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Company Tax ID</label>
                            <input type="text" defaultValue="0105559012345" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition font-bold text-slate-800" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">ชื่อจดทะเบียนบริษัท</label>
                            <input type="text" defaultValue="บริษัท ภูมิใจเรนทคาร์ จำกัด" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition font-bold text-slate-800" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="font-black text-lg text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                        <MapPin size={20} className="text-slate-400" /> ที่อยู่สาขาหลักที่ออกบิล
                    </h3>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Billing Address</label>
                        <textarea rows={5} defaultValue="123/45 ถนนสุขุมวิท แขวงคลองเตยเหนือ เขตวัฒนา กรุงเทพมหานคร 10110" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition font-bold text-slate-800 resize-none"></textarea>
                    </div>
                </div>
            </div>
        </div>
    );
}
