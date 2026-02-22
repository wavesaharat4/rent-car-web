"use client";

import { Settings, Save, Server, Shield, Globe } from "lucide-react";

export default function AdminSettingsPage() {
    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                        <Settings className="text-blue-600" size={32} />
                        ตั้งค่าระบบ
                    </h1>
                    <p className="text-slate-500 text-sm mt-2 font-medium">ปรับแต่งการทำงานของเซิร์ฟเวอร์ และความปลอดภัย</p>
                </div>
                <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold transition shadow-md whitespace-nowrap">
                    <Save size={18} /> บันทึกการตั้งค่า
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* กล่องตั้งค่าเซิร์ฟเวอร์ */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
                        <Server className="text-blue-600" size={20} />
                        <h2 className="font-bold text-slate-800">Database & Server</h2>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">MySQL Host</label>
                            <input type="text" defaultValue="localhost" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">API Timeout (Seconds)</label>
                            <input type="number" defaultValue="30" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none" />
                        </div>
                    </div>
                </div>

                {/* กล่องตั้งค่าความปลอดภัย */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
                        <Shield className="text-blue-600" size={20} />
                        <h2 className="font-bold text-slate-800">Security</h2>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <label className="block text-sm font-bold text-slate-700">บังคับใช้ 2FA สำหรับพนักงาน</label>
                                <p className="text-xs text-slate-500 font-medium mt-1">เพิ่มความปลอดภัยไปอีกขั้นเวลาล็อคอิน</p>
                            </div>
                            <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                                <input type="checkbox" name="toggle" id="toggle1" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer" defaultChecked />
                                <label htmlFor="toggle1" className="toggle-label block overflow-hidden h-6 rounded-full bg-blue-500 cursor-pointer"></label>
                            </div>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                            <div>
                                <label className="block text-sm font-bold text-slate-700">ลบล็อกระบบอัตโนมัติ (เกิน 30 วัน)</label>
                            </div>
                            <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                                <input type="checkbox" name="toggle" id="toggle2" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer" />
                                <label htmlFor="toggle2" className="toggle-label block overflow-hidden h-6 rounded-full bg-slate-300 cursor-pointer"></label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
