"use client";

import { useState } from "react";
import { Search, Plus, Shield, Trash2, Edit } from "lucide-react";

// สร้างข้อมูลจำลองของพนักงานในระบบ (เดี๋ยวตอนเชื่อม DB กะเปลี่ยนดึงจาก MySQL เด้อบาดหนิ)
const mockEmployees = [
    { id: 1, name: "สมชาย เข็มกลัด", email: "somchai@pjr.com", role: "ADMIN", status: "Active" },
    { id: 2, name: "สมหญิง ใจดี", email: "ying@pjr.com", role: "MANAGER", status: "Active" },
    { id: 3, name: "สายฝน ทนแดด", email: "saifon@pjr.com", role: "CS", status: "Active" },
    { id: 4, name: "ดำรง มั่นคง", email: "damrong@pjr.com", role: "ACCOUNTING", status: "Inactive" },
    { id: 5, name: "ยิ่งยง ยอดบัวงาม", email: "yingyong@pjr.com", role: "PANEL", status: "Active" },
    { id: 6, name: "สายัณห์ สัญญา", email: "sayan@pjr.com", role: "FINANCE", status: "Active" },
];

export default function AdminUsersPage() {
    const [searchTerm, setSearchTerm] = useState("");

    return (
        <div className="space-y-6">
            {/* ส่วนหัวหน้าจอ */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                        <Shield className="text-blue-600" size={32} />
                        จัดการสิทธิ์ผู้ใช้งานระบบ
                    </h1>
                    <p className="text-slate-500 text-sm mt-2 font-medium">เพิ่ม ลด แก้ไข สิทธิ์พนักงานตาม Level 0 DFD (Admin, Manager, CS, Panel, Accounting, Finance)</p>
                </div>

                {/* ปุ่มสร้างพนักงานใหม่ */}
                <button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-blue-500/30 hover:shadow-lg hover:-translate-y-0.5 whitespace-nowrap">
                    <Plus size={20} />
                    <span>เพิ่มพนักงาน</span>
                </button>
            </div>

            {/* แถบค้นหา */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-2">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="ค้นหาชื่อ, อีเมล หรือ ตำแหน่งพนักงานเด้อ..."
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl text-slate-700 font-medium focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* ตารางแสดงผล */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-black tracking-wider">
                            <tr>
                                <th scope="col" className="px-6 py-4">#ID</th>
                                <th scope="col" className="px-6 py-4">ชื่อ - นามสกุล</th>
                                <th scope="col" className="px-6 py-4">อีเมลติดต่อ</th>
                                <th scope="col" className="px-6 py-4">ตำแหน่ง (Role)</th>
                                <th scope="col" className="px-6 py-4">สถานะ</th>
                                <th scope="col" className="px-6 py-4 text-right">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {mockEmployees.filter(emp => emp.name.includes(searchTerm) || emp.role.includes(searchTerm.toUpperCase())).map((emp) => (
                                <tr key={emp.id} className="hover:bg-blue-50/50 transition-colors group">
                                    <td className="px-6 py-4 font-bold text-slate-400">EMP-{emp.id.toString().padStart(3, '0')}</td>
                                    <td className="px-6 py-4 font-bold text-slate-800">{emp.name}</td>
                                    <td className="px-6 py-4 font-medium text-slate-500">{emp.email}</td>
                                    <td className="px-6 py-4">
                                        {/* จัดสี Badge ตามตำแหน่งให้เบิ่งง่ายๆ หล่อๆ */}
                                        <span className={`px-2.5 py-1 text-xs font-black tracking-wider rounded-md border ${emp.role === 'ADMIN' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                                                emp.role === 'MANAGER' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                                    emp.role === 'CS' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                                                        emp.role === 'ACCOUNTING' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                                            emp.role === 'FINANCE' ? 'bg-pink-100 text-pink-700 border-pink-200' :
                                                                'bg-slate-100 text-slate-700 border-slate-200'
                                            }`}>
                                            {emp.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`flex items-center gap-1.5 text-xs font-bold ${emp.status === 'Active' ? 'text-emerald-500' : 'text-slate-400'}`}>
                                            <span className={`w-2 h-2 rounded-full ${emp.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                                            {emp.status === 'Active' ? 'ทำงานอยู่' : 'ระงับชั่วคราว'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="แก้ไขข้อมูล">
                                                <Edit size={16} />
                                            </button>
                                            <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="ลบพนักงาน">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
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
