"use client";

import { useState } from "react";
import { Car, Search, Edit2, CheckCircle2, Wrench, Ban } from "lucide-react";
import Image from "next/image";

// ข้อมูลจำลองของรถในสต๊อก (จำลองจาก Database แหลหลอๆ)
const mockCars = [
    { id: "CAR-001", brand: "Toyota", model: "Yaris Ativ", type: "Sedan", price: 1200, status: "available", image: "🚗" },
    { id: "CAR-002", brand: "Honda", model: "Civic", type: "Sedan", price: 1800, status: "rented", image: "🚙" },
    { id: "CAR-003", brand: "Toyota", model: "Fortuner", type: "SUV", price: 2500, status: "repair", image: "🚘" },
    { id: "CAR-004", brand: "Nissan", model: "Almera", type: "Sedan", price: 1000, status: "available", image: "🚕" },
];

export default function CSCarsPage() {
    const [searchTerm, setSearchTerm] = useState("");

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                        <Car className="text-blue-600" size={32} />
                        จัดการสถานะรถยนต์
                    </h1>
                    <p className="text-slate-500 text-sm mt-2 font-medium">อัพเดตสถานะรถ (ว่าง / ถูกเช่า / ส่งซ่อม) เพื่อให้ระบบทำงานถูกต้อง</p>
                </div>

                {/* ช่องส่องรถ */}
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="ค้นหารุ่นรถ, ทะเบียน..."
                        className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition outline-none shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* กริดแสดงรถ */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {mockCars.filter(c => c.brand.toLowerCase().includes(searchTerm.toLowerCase()) || c.model.toLowerCase().includes(searchTerm.toLowerCase())).map((car) => (
                    <div key={car.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow group">

                        {/* โชว์รูปรถ (ใช้ Emoji ขัดตาทัพไปก่อนเด้อ) */}
                        <div className="bg-slate-50 h-32 flex items-center justify-center text-6xl relative">
                            {car.image}
                            {/* ป้ายแสดงสถานะ */}
                            <div className="absolute top-3 right-3">
                                {car.status === "available" && <span className="flex items-center gap-1 bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-200 shadow-sm"><CheckCircle2 size={12} /> ว่าง</span>}
                                {car.status === "rented" && <span className="flex items-center gap-1 bg-amber-100 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-full border border-amber-200 shadow-sm"><Car size={12} /> ลูกค้าเช่า</span>}
                                {car.status === "repair" && <span className="flex items-center gap-1 bg-red-100 text-red-700 text-xs font-bold px-2.5 py-1 rounded-full border border-red-200 shadow-sm"><Wrench size={12} /> ซ่อมบำรุง</span>}
                            </div>
                        </div>

                        <div className="p-5">
                            <div className="text-xs font-bold text-slate-400 mb-1">{car.type}</div>
                            <h3 className="text-lg font-black text-slate-800 mb-2">{car.brand} {car.model}</h3>
                            <div className="flex justify-between items-center text-sm mb-4">
                                <span className="text-slate-500 font-medium">ราคาเช่า/วัน</span>
                                <span className="font-bold text-blue-600">฿{car.price}</span>
                            </div>

                            {/* ปุ่มเปลี่ยนสถานะ */}
                            <select className="w-full bg-slate-50 border border-slate-200 text-sm font-bold text-slate-700 rounded-xl px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" defaultValue={car.status}>
                                <option value="available">ตั้งเป็น: ว่าง</option>
                                <option value="rented">ตั้งเป็น: ถูกเช่า</option>
                                <option value="repair">ตั้งเป็น: ส่งซ่อม</option>
                            </select>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
