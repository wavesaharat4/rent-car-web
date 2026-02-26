"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { Search, Fuel, Settings2, Users, MapPin, Calendar, Map } from "lucide-react";
import { useSearchParams } from "next/navigation";

interface Car {
  carID: number;
  empID: number;
  carBrand: string;
  carType: string;
  carSeat: number;
  carGear: string;
  carPower: string;
  carDetail: string;
  carQuantity: number;
  carPrice: number;
  carProvince: string;
  carVIN: number;
  carPicture: string;
  carStatus: string;
  carPlate: string;
}

function CarsPageContent() {
  const searchParams = useSearchParams();

  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  // 🌟 รวม Location ให้เหลือตัวเดียว ดึงค่าจากหน้า Home (เผื่อลูกค้าเก่าใช้ pickup ก็ยังดึงได้)
  const [location, setLocation] = useState(searchParams.get("location") || searchParams.get("pickup") || "");
  const [startDate, setStartDate] = useState(searchParams.get("start") || "");
  const [endDate, setEndDate] = useState(searchParams.get("end") || "");

  // State สำหรับค้นหาและกรอง
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [sortBy, setSortBy] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const res = await fetch("/api/cars");
        const data = await res.json();
        setCars(data);
      } catch (error) {
        console.error("Failed to fetch cars:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCars();
  }, []);

  const filteredCars = useMemo(() => {
    let result = cars.filter((car) => car.carStatus === "Available");

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(
        (car) =>
          car.carBrand.toLowerCase().includes(lowerQuery) ||
          car.carDetail.toLowerCase().includes(lowerQuery) ||
          car.carProvince.toLowerCase().includes(lowerQuery),
      );
    }

    if (selectedBrand) result = result.filter((car) => car.carBrand === selectedBrand);
    if (selectedType) result = result.filter((car) => car.carType === selectedType);

    if (sortBy === "price_asc") {
      result.sort((a, b) => a.carPrice - b.carPrice);
    } else if (sortBy === "price_desc") {
      result.sort((a, b) => b.carPrice - a.carPrice);
    }

    return result;
  }, [cars, searchQuery, selectedBrand, selectedType, sortBy]);

  const totalPages = Math.ceil(filteredCars.length / itemsPerPage);
  const paginatedCars = filteredCars.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedBrand, selectedType, sortBy]);

  const activeCarsOnly = cars.filter((c) => c.carStatus === "Available");
  const brands = [...new Set(activeCarsOnly.map((car) => car.carBrand))];
  const types = [...new Set(activeCarsOnly.map((car) => car.carType))];

  return (
    <div className="bg-slate-50 min-h-screen pt-28 pb-20 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">เลือกรถที่คุณถูกใจ</h1>
            <p className="text-slate-500 mt-2">
              มีรถพร้อมให้บริการทั้งหมด <span className="font-bold text-blue-600">{filteredCars.length}</span> คัน
            </p>
          </div>
        </div>

        {/* 🌟 --- Booking Details Bar (แก้ไขข้อมูลได้จากตรงนี้เลย) --- */}
        <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200 mb-4 z-40 relative">
          <h2 className="text-sm font-bold text-blue-600 mb-4 uppercase tracking-wider flex items-center gap-2">
            <MapPin size={18} /> แก้ไขกำหนดการเดินทาง
          </h2>
          {/* ปรับ Grid ให้เป็น 3 ช่อง */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* สถานที่รับ-คืนรถ */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">สถานที่รับ-คืนรถ</label>
              <div className="relative">
                {/* ไอคอนแผนที่ด้านซ้าย (ใส่ pointer-events-none เพื่อให้คลิกทะลุไปโดนปุ่ม Select ได้) */}
                <Map className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-9 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium appearance-none cursor-pointer"
                >
                  <option value="">ระบุสถานที่</option>
                  <option value="สนามบินสุวรรณภูมิ">สนามบินสุวรรณภูมิ</option>
                  <option value="สนามบินดอนเมือง">สนามบินดอนเมือง</option>
                  <option value="เชียงใหม่">เชียงใหม่</option>
                  <option value="ภูเก็ต">ภูเก็ต</option>
                </select>

                {/* ไอคอนลูกศร Dropdown ด้านขวา */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m6 9 6 6 6-6"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* วันที่รับรถ */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">วันที่รับรถ</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium"
                />
              </div>
            </div>

            {/* วันที่คืนรถ */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">วันที่คืนรถ</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium"
                />
              </div>
            </div>
          </div>
        </div>

        {/* --- Search & Filter Bar --- */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-8 sticky top-24 z-30">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="ค้นหายี่ห้อ, รุ่น, จังหวัด..."
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 flex-[2]">
              <select value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)} className="px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="">ทุกยี่ห้อ</option>
                {brands.map((brand) => (<option key={brand} value={brand}>{brand}</option>))}
              </select>

              <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="">ทุกประเภท</option>
                {types.map((type) => (<option key={type} value={type}>{type}</option>))}
              </select>

              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none md:col-span-2">
                <option value="">เรียงตามแนะนำ</option>
                <option value="price_asc">ราคา: น้อยไปมาก</option>
                <option value="price_desc">ราคา: มากไปน้อย</option>
              </select>
            </div>
          </div>
        </div>

        {/* --- Loading State --- */}
        {loading && (
          <div className="text-center py-20">
            <div className="animate-spin w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"></div>
            <p className="text-slate-500">กำลังโหลดข้อมูลรถ...</p>
          </div>
        )}

        {/* --- Car List --- */}
        {!loading && (
          <div className="space-y-6">
            {paginatedCars.map((car) => (
              <div key={car.carID} className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-blue-300 transition-all duration-300 flex flex-col md:flex-row h-auto md:h-64">
                
                {/* รูปภาพด้านซ้าย */}
                <div className="w-full md:w-1/3 relative overflow-hidden bg-slate-100">
                  <img src={car.carPicture || "/images/car-placeholder.jpg"} alt={car.carBrand} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 left-3 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                    {car.carType}
                  </div>
                </div>

                {/* รายละเอียดด้านขวา */}
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-2xl font-bold text-slate-800 group-hover:text-blue-700 transition-colors">{car.carBrand}</h2>
                        <p className="text-slate-500 text-sm line-clamp-1 mt-1">{car.carDetail}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-400 mb-1">ราคาเช่าต่อวัน</p>
                        <p className="text-2xl font-black text-blue-600">฿{car.carPrice.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
                      <div className="flex items-center gap-2 text-slate-600 text-sm bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <Users size={16} className="text-blue-500" /><span>{car.carSeat} ที่นั่ง</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 text-sm bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <Settings2 size={16} className="text-blue-500" /><span>{car.carGear}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 text-sm bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <Fuel size={16} className="text-blue-500" /><span>{car.carPower}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 text-sm bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <MapPin size={16} className="text-blue-500" /><span className="truncate">{car.carProvince}</span>
                      </div>
                    </div>
                  </div>

                  {/* ปุ่มด้านล่าง */}
                  <div className="flex gap-3 mt-6 pt-4 border-t border-slate-100">
                    <Link href={`/cars/${car.carID}`} className="flex-1 py-3 text-center text-slate-700 bg-white border border-slate-300 rounded-xl font-bold text-sm hover:bg-slate-50 hover:text-slate-900 transition-all">
                      ดูรายละเอียด
                    </Link>
                    {/* 🌟 ผูกค่า location ล่าสุดเข้าไปใน URL ส่งไปหน้า Checkout! */}
                    <Link
                      href={`/checkout?carId=${car.carID}&pickup=${location}&dropoff=${location}&start=${startDate}&end=${endDate}`}
                      className="flex-1 py-3 text-center text-white bg-blue-600 border border-slate-300 rounded-xl font-bold text-sm hover:bg-blue-800 transition-all"
                    >
                      จองเลย
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- Pagination Controls --- */}
        {!loading && filteredCars.length > 0 && (
          <div className="mt-12 flex justify-center items-center gap-2">
            <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 disabled:opacity-50 hover:bg-slate-50 font-medium">ก่อนหน้า</button>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i + 1} onClick={() => setCurrentPage(i + 1)} className={`w-10 h-10 rounded-lg font-bold flex items-center justify-center transition-all ${currentPage === i + 1 ? "bg-blue-600 text-white shadow-md" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                  {i + 1}
                </button>
              ))}
            </div>
            <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 disabled:opacity-50 hover:bg-slate-50 font-medium">ถัดไป</button>
          </div>
        )}

        {!loading && filteredCars.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
            <h3 className="text-xl font-bold text-slate-800">ไม่พบรถพร้อมให้บริการ</h3>
            <p className="text-slate-500 mt-2">อาจจะไม่มีรถว่างในขณะนี้ หรือลองเปลี่ยนคำค้นหาดูนะครับ</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CarsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-32 text-center text-slate-500">กำลังเตรียมข้อมูล...</div>}>
      <CarsPageContent />
    </Suspense>
  );
}