import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from "@/lib/db"; // 🌟 นำเข้า db ที่เราตั้งค่าไว้
import { RowDataPacket } from "mysql2"; // 🌟 นำเข้า Type สำหรับ MySQL

// 🟢 รองรับ Next.js 15
export default async function CarDetailPage({ params }: { params: Promise<{ id: string }> }) {

  // รอแกะค่า id ออกมาจาก URL
  const resolvedParams = await params;
  const carId = parseInt(resolvedParams.id);

  // 🌟 1. ค้นหารถจาก Database ด้วย carID
  const [rows] = await db.query<RowDataPacket[]>(
    "SELECT * FROM car WHERE carID = ?",
    [carId]
  );

  // 🌟 2. ถ้าไม่เจอรถใน Database ให้เด้งไปหน้า 404
  if (rows.length === 0) {
    notFound();
  }

  // 🌟 3. ดึงข้อมูลรถคันแรกที่หาเจอมาเก็บในตัวแปร car
  const car = rows[0];

  return (
    <div className="bg-slate-50 min-h-screen pt-28 pb-20 font-sans text-blue-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Breadcrumb (ลิงก์ย้อนกลับ) */}
        <div className="mb-6 flex items-center text-sm font-medium text-slate-500">
          <Link href="/" className="hover:text-blue-600 transition-colors">หน้าหลัก</Link>
          <span className="mx-2">/</span>
          <Link href="/cars" className="hover:text-blue-600 transition-colors">รถทั้งหมด</Link>
          <span className="mx-2">/</span>
          <span className="text-blue-950">{car.carBrand}</span>
        </div>

        {/* ส่วนแสดงข้อมูลหลัก */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* ฝั่งซ้าย: รูปภาพรถ */}
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

            {/* ข้อมูลทั่วไป */}
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-blue-100 mt-6">
              <h2 className="text-2xl font-extrabold text-blue-950 mb-4">รายละเอียดรถยนต์</h2>
              <p className="text-slate-600 leading-relaxed font-light mb-8">
                {car.carDetail}
              </p>

              {/* สเปกรถแบบ Grid */}
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

          {/* ฝั่งขวา: การ์ดราคาและการจอง */}
          <div className="lg:sticky lg:top-28">
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl shadow-blue-900/5 border border-blue-100">
              <h1 className="text-3xl font-extrabold text-blue-950 mb-2">{car.carBrand}</h1>
              <p className="text-blue-600 font-bold uppercase tracking-wider text-sm mb-6">{car.carType} Class</p>

              <div className="flex items-end gap-2 mb-6 pb-6 border-b border-slate-100">
                <span className="text-4xl font-extrabold text-blue-950">฿{car.carPrice.toLocaleString()}</span>
                <span className="text-slate-500 font-medium mb-1">/ วัน</span>
              </div>

              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-xs text-blue-900 font-bold mb-1 uppercase tracking-wider">วันรับรถ</label>
                  <input type="date" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-sm font-medium" />
                </div>
                <div>
                  <label className="block text-xs text-blue-900 font-bold mb-1 uppercase tracking-wider">วันคืนรถ</label>
                  <input type="date" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-sm font-medium" />
                </div>
              </div>

              <Link
                href={`/checkout?carId=${car.carID}`}
                className="block w-full text-center bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
              >
                ดำเนินการจองรถ
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}