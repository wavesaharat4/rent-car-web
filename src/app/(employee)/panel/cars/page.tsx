"use client";

import { Wrench, Edit, ShieldAlert, Plus, Save } from "lucide-react";

const mockCarsDetail = [
    { id: "CAR-001", brand: "Toyota Yaris Ativ", plate: "1กข-1234 กทม.", odo: "45,000 km", prevMaint: "2025-10-10", nextMaint: "2026-04-10" },
    { id: "CAR-002", brand: "Honda Civic RS", plate: "9ฮฮ-9999 กทม.", odo: "12,000 km", prevMaint: "2026-01-05", nextMaint: "2026-07-05" },
];

export default function PanelCarsPage() {
    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                        <Wrench className="text-blue-600" size={32} />
                        จัดการรายละเอียดรถ (Vehicle Panel)
                    </h1>
                    <p className="text-slate-500 text-sm mt-2 font-medium">ดูและแก้ไขข้อมูลเชิงลึกของรถ เช่น เลขไมล์, ป้ายทะเบียน, ระยะซ่อมบำรุงเด้อ</p>
                </div>
                <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold transition shadow-md whitespace-nowrap">
                    <Plus size={18} /> ลงทะเบียนรถใหม่
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {mockCarsDetail.map((car) => (
                    <div key={car.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col md:flex-row gap-6 md:items-center">

                        {/* ข้อมูลพื้นฐาน รถ */}
                        <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-3">
                                <span className="bg-slate-100 text-slate-500 px-2.5 py-1 text-xs font-black rounded">{car.id}</span>
                                <h3 className="font-black text-xl text-slate-800">{car.brand}</h3>
                            </div>
                            <div className="inline-block border-2 border-slate-800 rounded-md bg-white">
                                <div className="px-4 py-1.5 font-bold tracking-widest text-slate-800 text-lg border-b border-slate-200 text-center">{car.plate.split(' ')[0]}</div>
                                <div className="px-4 py-0.5 text-[10px] font-bold text-center bg-slate-50 text-slate-600">{car.plate.split(' ')[1]}</div>
                            </div>
                        </div>

                        {/* ฟอร์มแก้ไขอย่างด่วน (ดุเดือดสไตล์ Panel) */}
                        <div className="flex-1 grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">เลขไมล์สะสม (ODO)</label>
                                <input type="text" defaultValue={car.odo} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-sm text-sm font-bold text-slate-700" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">วันเช็คระยะครั้งถัดไป</label>
                                <input type="date" defaultValue={car.nextMaint} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-sm text-sm font-bold text-slate-700" />
                            </div>
                        </div>

                        {/* ปุ่ม Action */}
                        <div className="md:w-32 flex flex-col gap-2">
                            <button className="w-full flex justify-center items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-xl text-sm font-bold transition shadow-sm">
                                <Save size={16} /> บันทึก
                            </button>
                            <button className="w-full flex justify-center items-center gap-2 bg-white border border-rose-200 text-rose-500 hover:bg-rose-50 hover:border-rose-300 py-2.5 rounded-xl text-sm font-bold transition">
                                <ShieldAlert size={16} /> ปลดระวาง
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
