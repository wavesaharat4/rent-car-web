"use client";

import { useState, useEffect, useMemo } from "react";
import { Car, Search, CheckCircle2, Wrench, Ban, Loader2 } from "lucide-react";
import Swal from "sweetalert2";

// 1. Interface อ้างอิงจาก Database ตาราง car
interface CarDB {
    carID: number;
    carBrand: string;
    carModel: string;
    carType: string;
    carPrice: number;
    carStatus: string;
    carPicture: string;
}

export default function CSCarsPage() {
    const [cars, setCars] = useState<CarDB[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);

    // 2. ฟังก์ชันดึงข้อมูลรถจาก API
    const fetchCars = async () => {
        try {
            const response = await fetch('/api/cars');
            const data = await response.json();
            
            if (response.ok) {
                // รองรับทั้งแบบคืนค่า { data: [...] } และแบบ Array [...]
                setCars(data.data ? data.data : data);
            }
        } catch (error) {
            console.error("Failed to fetch cars:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCars();
    }, []);

    // 3. ฟังก์ชันอัปเดตสถานะรถ
    const handleStatusChange = async (carID: number, newStatus: string, carBrand: string, carModel: string) => {
        // ถามย้ำเพื่อความชัวร์ก่อนอัปเดต
        const result = await Swal.fire({
            title: 'ยืนยันการเปลี่ยนสถานะ?',
            text: `ต้องการเปลี่ยนสถานะรถ ${carBrand} ${carModel} เป็น "${newStatus}" ใช่หรือไม่?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#2563eb',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'ใช่, เปลี่ยนเลย',
            cancelButtonText: 'ยกเลิก',
            customClass: { popup: 'rounded-3xl' }
        });

        if (result.isConfirmed) {
            try {
                // ยิง API ไปอัปเดตข้อมูล
                const res = await fetch('/api/cars', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ carID, carStatus: newStatus })
                });

                if (res.ok) {
                    Swal.fire({
                        icon: 'success',
                        title: 'อัปเดตสำเร็จ',
                        showConfirmButton: false,
                        timer: 1500,
                        customClass: { popup: 'rounded-3xl' }
                    });
                    
                    // อัปเดต State บนหน้าจอโดยไม่ต้องรีเฟรชใหม่ทั้งหมด
                    setCars(prevCars => 
                        prevCars.map(car => 
                            car.carID === carID ? { ...car, carStatus: newStatus } : car
                        )
                    );
                } else {
                    throw new Error("Failed to update status");
                }
            } catch (error) {
                Swal.fire('ข้อผิดพลาด', 'ไม่สามารถอัปเดตสถานะรถได้', 'error');
            }
        }
    };

    // ฟังก์ชันกรองข้อมูลตามคำค้นหา
    const filteredCars = useMemo(() => {
        if (!searchTerm) return cars;
        const lowerQ = searchTerm.toLowerCase();
        return cars.filter(c => 
            (c.carBrand && c.carBrand.toLowerCase().includes(lowerQ)) || 
            (c.carModel && c.carModel.toLowerCase().includes(lowerQ))
        );
    }, [searchTerm, cars]);

    return (
        <div className="space-y-6 pb-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                        <Car className="text-blue-600" size={32} />
                        จัดการสถานะรถยนต์
                    </h1>
                    <p className="text-slate-500 text-sm mt-2 font-medium">อัพเดตสถานะรถ (ว่าง / ถูกเช่า / ส่งซ่อม) เพื่อให้ระบบทำงานถูกต้อง</p>
                </div>

                {/* ช่องค้นหารถ */}
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="ค้นหายี่ห้อ, รุ่น..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition outline-none shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
                    <p className="text-slate-500 font-bold">กำลังโหลดข้อมูลรถ...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredCars.length > 0 ? (
                        filteredCars.map((car) => {
                            // จัดการตัวพิมพ์เล็ก/ใหญ่ของ Status ให้ตรงกัน
                            const status = car.carStatus?.toLowerCase() || 'available';

                            return (
                                <div key={car.carID} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-[0_8px_30px_rgb(37,99,235,0.08)] hover:border-blue-200 transition-all duration-300 group flex flex-col">

                                    {/* รูปภาพรถ */}
                                    <div className="bg-slate-100 h-40 w-full relative overflow-hidden flex items-center justify-center">
                                        {car.carPicture ? (
                                            <img 
                                                src={car.carPicture} 
                                                alt={`${car.carBrand} ${car.carModel}`} 
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <span className="text-6xl">🚗</span>
                                        )}
                                        
                                        {/* ป้ายแสดงสถานะ */}
                                        <div className="absolute top-3 right-3 z-10">
                                            {status === "available" && <span className="flex items-center gap-1 bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-200 shadow-sm"><CheckCircle2 size={12} /> ว่าง</span>}
                                            {status === "rented" && <span className="flex items-center gap-1 bg-amber-100 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-full border border-amber-200 shadow-sm"><Car size={12} /> ลูกค้าเช่า</span>}
                                            {status === "repair" && <span className="flex items-center gap-1 bg-red-100 text-red-700 text-xs font-bold px-2.5 py-1 rounded-full border border-red-200 shadow-sm"><Wrench size={12} /> ซ่อมบำรุง</span>}
                                        </div>
                                    </div>

                                    <div className="p-5 flex flex-col flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{car.carType}</div>
                                            <div className="text-xs font-bold text-slate-400">ID: #{car.carID}</div>
                                        </div>
                                        <h3 className="text-lg font-black text-slate-800 mb-4">{car.carBrand} {car.carModel}</h3>
                                        
                                        <div className="flex justify-between items-center text-sm mt-auto mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                            <span className="text-slate-500 font-bold">ราคาเช่า/วัน</span>
                                            <span className="font-black text-blue-600 text-base">฿{car.carPrice?.toLocaleString()}</span>
                                        </div>

                                        {/* 🌟 Dropdown เปลี่ยนสถานะ */}
                                        <select 
                                            className="w-full bg-white border-2 border-slate-200 text-sm font-bold text-slate-700 rounded-xl px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 cursor-pointer hover:bg-slate-50" 
                                            value={car.carStatus}
                                            onChange={(e) => handleStatusChange(car.carID, e.target.value, car.carBrand, car.carModel)}
                                        >
                                            <option value="Available">Status: ว่าง (Available)</option>
                                            <option value="Rented">Status: ถูกเช่า (Rented)</option>
                                            <option value="Repair">Status: ส่งซ่อม (Repair)</option>
                                        </select>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-slate-300">
                            <p className="text-slate-500 font-bold text-lg">ไม่พบข้อมูลรถยนต์</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}