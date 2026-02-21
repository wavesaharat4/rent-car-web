"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';

// 1. กำหนด Interface ของข้อมูลรถ
interface Car {
  id: number;
  name: string;
  brand: string;
  type: string;
  seats: number;
  price: number;
  img: string;
}

// 2. ข้อมูล Mock Data สำหรับทดสอบระบบกรอง
const allCars: Car[] = [
  { id: 1, name: 'Toyota Yaris', brand: 'Toyota', type: 'Eco', seats: 4, price: 800, img: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=800&q=80' },
  { id: 2, name: 'Honda HR-V', brand: 'Honda', type: 'SUV', seats: 5, price: 1500, img: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80' },
  { id: 3, name: 'BYD Atto 3', brand: 'BYD', type: 'EV', seats: 5, price: 1800, img: 'https://images.unsplash.com/photo-1672846727402-1fa8d338fbc9?auto=format&fit=crop&w=800&q=80' },
  { id: 4, name: 'Toyota Fortuner', brand: 'Toyota', type: 'SUV', seats: 7, price: 2500, img: 'https://images.unsplash.com/photo-1550482782-5f60dc8a7a85?auto=format&fit=crop&w=800&q=80' },
  { id: 5, name: 'Honda Civic', brand: 'Honda', type: 'Sedan', seats: 5, price: 1200, img: 'https://images.unsplash.com/photo-1610647752706-3bb12232b3ab?auto=format&fit=crop&w=800&q=80' },
  { id: 6, name: 'BMW 3 Series', brand: 'BMW', type: 'Luxury', seats: 5, price: 3500, img: 'https://images.unsplash.com/photo-1555353540-64fd1b1958b1?auto=format&fit=crop&w=800&q=80' },
  { id: 7, name: 'Toyota Alphard', brand: 'Toyota', type: 'Van', seats: 7, price: 4500, img: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80' },
];

export default function CarsPage() {
  // 3. สร้าง State เก็บค่าตัวกรองที่ผู้ใช้เลือก
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedSeats, setSelectedSeats] = useState('');
  const [sortBy, setSortBy] = useState('');

  // 4. คำนวณข้อมูลรถใหม่เมื่อตัวกรองเปลี่ยน
  const filteredCars = useMemo(() => {
    let result = [...allCars];

    if (selectedBrand) result = result.filter(car => car.brand === selectedBrand);
    if (selectedType) result = result.filter(car => car.type === selectedType);
    if (selectedSeats) result = result.filter(car => car.seats === parseInt(selectedSeats));

    if (sortBy === 'price_asc') {
      result.sort((a, b) => a.price - b.price); // ถูกไปแพง
    } else if (sortBy === 'price_desc') {
      result.sort((a, b) => b.price - a.price); // แพงไปถูก
    }

    return result;
  }, [selectedBrand, selectedType, selectedSeats, sortBy]);

  return (
    <div className="bg-slate-50 min-h-screen pt-28 pb-20 font-sans selection:bg-blue-200 text-blue-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* หัวข้อหน้า */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-blue-950">คอลเลกชันรถยนต์ทั้งหมด</h1>
          <p className="text-blue-600 mt-2 font-medium">ค้นหารถที่ตรงกับไลฟ์สไตล์และการเดินทางของคุณ</p>
        </div>

        {/* แถบตัวกรอง (Filter Bar) */}
        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-blue-100 mb-10 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full md:w-auto flex-1">
            
            <div className="flex flex-col">
              <label className="text-xs text-blue-600 font-bold mb-1 uppercase">ยี่ห้อ</label>
              <select 
                value={selectedBrand} 
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-sm font-medium text-blue-950"
              >
                <option value="">ทุกยี่ห้อ</option>
                <option value="Toyota">Toyota</option>
                <option value="Honda">Honda</option>
                <option value="BYD">BYD</option>
                <option value="BMW">BMW</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-xs text-blue-600 font-bold mb-1 uppercase">ประเภท</label>
              <select 
                value={selectedType} 
                onChange={(e) => setSelectedType(e.target.value)}
                className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-sm font-medium text-blue-950"
              >
                <option value="">ทุกประเภท</option>
                <option value="Eco">Eco Car</option>
                <option value="Sedan">Sedan</option>
                <option value="SUV">SUV</option>
                <option value="EV">EV (ไฟฟ้า)</option>
                <option value="Luxury">Luxury</option>
                <option value="Van">รถตู้/MPV</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-xs text-blue-600 font-bold mb-1 uppercase">จำนวนที่นั่ง</label>
              <select 
                value={selectedSeats} 
                onChange={(e) => setSelectedSeats(e.target.value)}
                className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-sm font-medium text-blue-950"
              >
                <option value="">ทั้งหมด</option>
                <option value="4">4 ที่นั่ง</option>
                <option value="5">5 ที่นั่ง</option>
                <option value="7">7 ที่นั่ง</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-xs text-blue-600 font-bold mb-1 uppercase">เรียงตามราคา</label>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-sm font-medium text-blue-950"
              >
                <option value="">แนะนำ</option>
                <option value="price_asc">ราคา: ต่ำไปสูง</option>
                <option value="price_desc">ราคา: สูงไปต่ำ</option>
              </select>
            </div>
          </div>

          <button 
            onClick={() => {
              setSelectedBrand('');
              setSelectedType('');
              setSelectedSeats('');
              setSortBy('');
            }}
            className="w-full md:w-auto px-6 py-2.5 text-sm font-bold text-blue-600 border-2 border-blue-100 hover:bg-blue-50 hover:border-blue-200 rounded-xl transition-all h-fit self-end"
          >
            ล้างค่า
          </button>
        </div>

        {/* แสดงจำนวนผลลัพธ์ */}
        <div className="mb-6">
          <p className="text-slate-500 font-medium text-sm">พบรถทั้งหมด <span className="text-blue-700 font-bold text-lg">{filteredCars.length}</span> คัน</p>
        </div>

        {/* ตารางแสดงผล */}
        {filteredCars.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCars.map((car) => (
              <div key={car.id} className="bg-white rounded-2xl overflow-hidden border border-blue-100 hover:border-blue-300 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group">
                <div className="h-48 overflow-hidden relative bg-slate-100">
                  <img src={car.img} alt={car.name} className="w-full h-full object-cover transform group-hover:scale-110 transition duration-700 mix-blend-multiply" />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-blue-950 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                    {car.seats} ที่นั่ง
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-xs text-blue-500 font-bold uppercase tracking-wider">{car.type}</p>
                    <p className="text-xs text-slate-400 font-medium">{car.brand}</p>
                  </div>
                  <h3 className="text-xl font-bold text-blue-950 mb-4">{car.name}</h3>
                  <div className="mt-auto flex justify-between items-end border-t border-slate-100 pt-4">
                    <div>
                      <p className="text-slate-500 text-xs font-medium mb-1">เริ่มต้น</p>
                      <p className="text-blue-950 font-extrabold"><span className="text-2xl text-blue-600">฿{car.price}</span> / วัน</p>
                    </div>
                    {/* ปุ่มลิงก์ไปหน้ารายละเอียดรถ */}
                    <Link href={`/cars/${car.id}`} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-blue-700 transition-all font-bold shadow-md shadow-blue-600/20 transform hover:-translate-y-0.5">
                      ดูรายละเอียด
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-16 text-center border border-dashed border-blue-200 flex flex-col items-center justify-center">
            <svg className="w-16 h-16 text-blue-200 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-bold text-blue-950 mb-2">ไม่พบรถที่ค้นหา</h3>
            <p className="text-slate-500">ลองเปลี่ยนเงื่อนไขการกรอง หรือกดปุ่ม "ล้างค่า" เพื่อดูรถทั้งหมด</p>
          </div>
        )}
      </div>
    </div>
  );
}