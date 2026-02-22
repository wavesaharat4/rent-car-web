"use client";

import { Send, FileText, UploadCloud, MessageSquare } from "lucide-react";

export default function ManagerRequestsPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                    <Send className="text-blue-600" size={32} />
                    ส่ง และ ขอรายงาน (Reports Request)
                </h1>
                <p className="text-slate-500 text-sm mt-2 font-medium">ส่งรีพอร์ตสรุปให้ฝ่ายบริหาร หรือขอรีพอร์ตเพิ่มเติมจากระบบ</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                    <FileText size={20} className="text-blue-600" /> ฟอร์มขอรายงานสรุป (Custom Report Request)
                </h2>

                <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">หัวข้อรายงาน (Report Title)</label>
                        <input type="text" placeholder="เช่น ขอรายงานเจาะลึกรถเสียเดือนที่ผ่านมา" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-sm text-sm" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">ประเภทข้อมูล (Data Type)</label>
                            <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-sm text-sm font-medium text-slate-600">
                                <option>รายงานเกี่ยวกับการเงิน/รายได้</option>
                                <option>รายงานพฤติกรรมลูกค้า</option>
                                <option>รายงานสภาพรถ/ซ่อมบำรุง</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">รูปแบบไฟล์ที่ต้องการ (Export Format)</label>
                            <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-sm text-sm font-medium text-slate-600">
                                <option>PDF Document (.pdf)</option>
                                <option>Excel Spreadsheet (.xlsx)</option>
                                <option>CSV File (.csv)</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">รายละเอียดเพิ่มเติม (Details)</label>
                        <textarea rows={4} placeholder="ระบุช่วงเวลา หรือเงื่อนไขของข้อมูลที่อยากได้เป็นพิเศษ..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-sm text-sm resize-none"></textarea>
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                        <button className="px-6 py-2.5 rounded-xl text-slate-500 font-bold hover:bg-slate-100 transition">ยกเลิก</button>
                        <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all shadow-md shadow-blue-500/30">
                            <UploadCloud size={18} /> ส่งคำขอรายงาน
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
