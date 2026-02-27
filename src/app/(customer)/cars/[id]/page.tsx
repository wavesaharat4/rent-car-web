import { Suspense } from 'react'; 
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from "@/lib/db"; 
import { RowDataPacket } from "mysql2"; 
import BookingClient from './BookingClient';

export default async function CarDetailPage({ params }: { params: Promise<{ id: string }> }) {

  const resolvedParams = await params;
  const carId = parseInt(resolvedParams.id);

  const [rows] = await db.query<RowDataPacket[]>(
    "SELECT * FROM car WHERE carID = ?",
    [carId]
  );

  if (rows.length === 0) {
    notFound();
  }

  const car = rows[0];

  return (
    <div className="bg-slate-50 min-h-screen pt-28 pb-20 font-sans text-blue-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <div className="mb-6 flex items-center text-sm font-medium text-slate-500">
          <Link href="/" className="hover:text-blue-600 transition-colors">หน้าหลัก</Link>
          <span className="mx-2">/</span>
          <Link href="/cars" className="hover:text-blue-600 transition-colors">รถทั้งหมด</Link>
          <span className="mx-2">/</span>
          <span className="text-blue-950">{car.carBrand}</span>
        </div>

        {/* ส่วนแสดงข้อมูลหลัก */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* ฝั่งซ้าย: รูปภาพรถและรายละเอียด */}
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-3xl overflow-hidden shadow-lg border border-blue-100 bg-white aspect-[16/10] relative">
              <img 
                src={car.carPicture || "/images/car-placeholder.jpg"} 
                alt={car.carBrand} 
                className="w-full h-full object-cover" 
              />
              <div className="absolute top-4 left-4 bg-blue-600 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-md">
                {car.carType}
              </div>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-blue-100 mt-6">
              <h2 className="text-2xl font-extrabold text-blue-950 mb-4">รายละเอียดรถยนต์</h2>
              <p className="text-slate-600 leading-relaxed font-light mb-8">
                {car.carDetail}
              </p>

              <h3 className="text-lg font-bold text-blue-950 mb-4">ข้อมูลจำเพาะ (Specifications)</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center">
                  <span className="text-xs text-slate-500 font-medium mb-1">จำนวนที่นั่ง</span>
                  <span className="text-sm font-bold text-blue-950">{car.carSeat} ที่นั่ง</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center">
                  <span className="text-xs text-slate-500 font-medium mb-1">ระบบเกียร์</span>
                  <span className="text-sm font-bold text-blue-950">{car.carGear}</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center">
                  <span className="text-xs text-slate-500 font-medium mb-1">พลังงาน</span>
                  <span className="text-sm font-bold text-blue-950">{car.carPower}</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center">
                  <span className="text-xs text-slate-500 font-medium mb-1">จังหวัด</span>
                  <span className="text-sm font-bold text-blue-950">{car.carProvince}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 🌟 2. ฝั่งขวา: เรียกใช้ Client Component (ส่งข้อมูลรถ car เข้าไปด้วย) */}
          <Suspense fallback={<div className="bg-white p-8 rounded-3xl shadow-xl h-[400px] animate-pulse">กำลังโหลดระบบจอง...</div>}>
            <BookingClient car={car} />
          </Suspense>

        </div>
      </div>
    </div>
  );
}