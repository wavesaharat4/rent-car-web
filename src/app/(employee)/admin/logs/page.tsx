"use client";

import { Activity, Clock, ShieldAlert, CheckCircle, Info } from "lucide-react";

// ดึงข้อมูลจำลองล็อกประวัติเด้อจ้า
const mockLogs = [
    { id: "LOG-001", user: "สมชาย เข็มกลัด", action: "เพิ่มพนักงานใหม่ (CS)", time: "2 นาทีที่แล้ว", type: "success" },
    { id: "LOG-002", user: "สมหญิง ใจดี", action: "ดูรายงานยอดเช่าเดือนกุมภาพันธ์", time: "15 นาทีที่แล้ว", type: "info" },
    { id: "LOG-003", user: "System", action: "ล็อกอินล้มเหลว (IP: 192.168.1.55)", time: "1 ชั่วโมงที่แล้ว", type: "warning" },
    { id: "LOG-004", user: "สายฝน ทนแดด", action: "อัพเดตสถานะรถ Honda Civic (ซ่อมบำรุง)", time: "3 ชั่วโมงที่แล้ว", type: "info" },
    { id: "LOG-005", user: "ดำรง มั่นคง", action: "ออกจากระบบ", time: "5 ชั่วโมงที่แล้ว", type: "info" },
];

export default function AdminLogsPage() {
    return (
        <div className="space-y-6">
            {/* ส่วนหัว */}
            <div>
                <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                    <Activity className="text-blue-600" size={32} />
                    ประวัติการใช้งานระบบ (System Logs)
                </h1>
                <p className="text-slate-500 text-sm mt-2 font-medium">เบิ่งความเคลื่อนไหวในระบบ ผู้ใด๋เฮ็ดหยัง ตอนใด๋ ฮู้เบิด!</p>
            </div>

            {/* ควบคุมตาราง log */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <h2 className="font-bold text-slate-800 flex items-center gap-2">
                        <Clock size={18} className="text-slate-500" /> อัพเดตล่าสุด
                    </h2>
                    <button className="text-xs font-bold text-blue-600 hover:text-blue-800 transition">รีเฟรชข้อมูล</button>
                </div>

                {/* ร่ายรายการยาวๆเด้อ */}
                <div className="divide-y divide-slate-100">
                    {mockLogs.map((log) => (
                        <div key={log.id} className="p-4 md:p-5 hover:bg-slate-50 transition-colors flex items-start gap-4">
                            {/* ไอคอนตามประเภท */}
                            <div className="pt-1">
                                {log.type === "success" && <CheckCircle className="text-emerald-500" size={20} />}
                                {log.type === "info" && <Info className="text-blue-500" size={20} />}
                                {log.type === "warning" && <ShieldAlert className="text-amber-500" size={20} />}
                            </div>

                            <div className="flex-1">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 md:gap-4 mb-1">
                                    <p className="font-bold text-slate-800 text-sm">{log.action}</p>
                                    <span className="text-xs font-bold text-slate-400 whitespace-nowrap">{log.time}</span>
                                </div>
                                <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
                                    <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{log.id}</span>
                                    <span>ผู้ดำเนินการ: <span className="font-bold text-slate-700">{log.user}</span></span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
