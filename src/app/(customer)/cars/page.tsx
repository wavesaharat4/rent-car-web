"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { Search, Fuel, Settings2, Users, MapPin, Calendar, Map } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

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
  const router = useRouter();
  const { status } = useSession();

  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  // ค่าจากหน้า Home
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

  const [bookingError, setBookingError] = useState(""); 

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

  // 🌟 1. ดึงสถานที่ ยี่ห้อ และประเภท จากรถ "ทั้งหมด" ใน Database (ไม่สนใจว่าว่างหรือไม่)
  const provinces = [...new Set(cars.map((car) => car.carProvince))].filter(Boolean);
  const brands = [...new Set(cars.map((car) => car.carBrand))].filter(Boolean);
  const types = [...new Set(cars.map((car) => car.carType))].filter(Boolean);

  // 🌟 2. อัปเดตการแสดงผลรถ ให้แสดง "เฉพาะรถที่ว่าง (Available)"
  const filteredCars = useMemo(() => {
    // กรองเอาเฉพาะที่ Available
    let result = cars.filter((car) => car.carStatus === "Available");

    // กรองตามสถานที่ที่เลือก
    if (location) {
      result = result.filter((car) => car.carProvince === location);
    }

    // กรองตามคำค้นหา
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
  }, [cars, location, searchQuery, selectedBrand, selectedType, sortBy]);

  const totalPages = Math.ceil(filteredCars.length / itemsPerPage);
  const paginatedCars = filteredCars.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [location, searchQuery, selectedBrand, selectedType, sortBy]);

  // ฟังก์ชันจัดการกดปุ่ม "จองเลย"
  const handleBooking = (carID: number) => {
    if (status !== "authenticated") {
      setBookingError("กรุณาเข้าสู่ระบบ (Login) ก่อนทำการจองรถครับ");
      return;
    }
    if (!startDate || !endDate) {
      setBookingError("กรุณาระบุวันที่ให้ครบถ้วนก่อนทำการจองครับ");
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      setBookingError("ระบุวันที่ไม่ถูกต้อง! วันที่คืนรถต้องไม่น้อยกว่าวันที่รับรถครับ");
      return;
    }
    router.push(`/checkout?carId=${carID}&pickup=${location}&dropoff=${location}&start=${startDate}&end=${endDate}`);
  };

  return (
    <div className="bg-slate-50 min-h-screen pt-28 pb-20 font-sans text-slate-800 relative">
      
      {/* แจ้งเตือน Modal */}
      {bookingError && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 md:p-8 animate-in zoom-in-95 duration-300">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-5 shadow-inner">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2">ไม่สามารถดำเนินการได้</h3>
              <p className="text-slate-500 text-sm mb-8 leading-relaxed">{bookingError}</p>
              <button
                onClick={() => setBookingError("")}
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
              >
                รับทราบ
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">เลือกรถที่คุณถูกใจ</h1>
            <p className="text-slate-500 mt-2">
              มีรถว่างพร้อมให้บริการ <span className="font-bold text-blue-600">{filteredCars.length}</span> คัน
            </p>
          </div>
        </div>

        {/* --- Booking Details Bar --- */}
        <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200 mb-4 z-40 relative">
          <h2 className="text-sm font-bold text-blue-600 mb-4 uppercase tracking-wider flex items-center gap-2">
            <MapPin size={18} /> แก้ไขกำหนดการเดินทาง
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">สถานที่รับ-คืนรถ <span className="text-red-500">*</span></label>
              <div className="relative">
                <Map className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-9 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium appearance-none cursor-pointer"
                >
                  <option value="">ระบุสถานที่ (ทั้งหมด)</option>
                  {provinces.map((prov) => (
                    <option key={prov} value={prov}>{prov}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">วันที่รับรถ <span className="text-red-500">*</span></label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">วันที่คืนรถ <span className="text-red-500">*</span></label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium" />
              </div>
            </div>
          </div>
        </div>

        {/* --- Search & Filter Bar --- */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-8 ">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input type="text" placeholder="ค้นหายี่ห้อ, รุ่น..." className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 flex-[2]">
              <select value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)} className="px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer">
                <option value="">ทุกยี่ห้อ</option>
                {brands.map((brand) => (<option key={brand} value={brand}>{brand}</option>))}
              </select>
              <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer">
                <option value="">ทุกประเภท</option>
                {types.map((type) => (<option key={type} value={type}>{type}</option>))}
              </select>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none md:col-span-2 cursor-pointer">
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
                <div className="w-full md:w-1/3 relative overflow-hidden bg-slate-100">
                  <img src={car.carPicture || "/images/car-placeholder.jpg"} alt={car.carBrand} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 left-3 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                    {car.carType}
                  </div>
                </div>
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
                  <div className="flex gap-3 mt-6 pt-4 border-t border-slate-100">
                    <Link 
                      href={`/cars/${car.carID}?start=${startDate}&end=${endDate}`} 
                      className="flex-1 py-3 text-center text-slate-700 bg-white border border-slate-300 rounded-xl font-bold text-sm hover:bg-slate-50 hover:text-slate-900 transition-all"
                    >
                      ดูรายละเอียด
                    </Link>
                    <button
                      onClick={() => handleBooking(car.carID)}
                      className="flex-1 py-3 text-center text-white bg-blue-600 border border-slate-300 rounded-xl font-bold text-sm hover:bg-blue-800 transition-all cursor-pointer"
                    >
                      จองเลย
                    </button>
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
            <h3 className="text-xl font-bold text-slate-800">ไม่พบรถที่ให้บริการ</h3>
            <p className="text-slate-500 mt-2">ไม่มีรถว่างในสถานที่ที่คุณเลือก ลองเปลี่ยนสถานที่หรือคำค้นหาดูนะครับ</p>
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