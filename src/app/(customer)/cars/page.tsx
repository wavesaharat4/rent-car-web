"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Search, Filter, Fuel, Settings2, Users, MapPin } from "lucide-react";

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
  carStatus: string; // เราจะใช้ค่านี้ในการกรอง
  carPlate: string;
}

export default function CarsPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

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

  // 🌟 Logic การกรอง: เพิ่มบรรทัดแรกสุดเพื่อกรองสถานะ
  const filteredCars = useMemo(() => {
    // 1. กรองเอาเฉพาะรถที่พร้อมใช้งาน (Active) เท่านั้น
    let result = cars.filter((car) => car.carStatus === "Available");

    // 2. ค้นหาจากชื่อรถ
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(
        (car) =>
          car.carBrand.toLowerCase().includes(lowerQuery) ||
          car.carDetail.toLowerCase().includes(lowerQuery) ||
          car.carProvince.toLowerCase().includes(lowerQuery),
      );
    }

    // 3. กรองตามตัวเลือก
    if (selectedBrand)
      result = result.filter((car) => car.carBrand === selectedBrand);
    if (selectedType)
      result = result.filter((car) => car.carType === selectedType);

    // 4. เรียงลำดับ
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

  // สร้างรายการตัวเลือกสำหรับ Dropdown (เฉพาะที่มีใน active cars)
  // เพื่อไม่ให้ลูกค้าเลือกยี่ห้อที่มีแต่รถเสีย
  const activeCarsOnly = cars.filter((c) => c.carStatus === "active");
  const brands = [...new Set(activeCarsOnly.map((car) => car.carBrand))];
  const types = [...new Set(activeCarsOnly.map((car) => car.carType))];

  return (
    <div className="bg-slate-50 min-h-screen pt-28 pb-20 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              เลือกรถที่คุณถูกใจ
            </h1>
            <p className="text-slate-500 mt-2">
              มีรถพร้อมให้บริการทั้งหมด{" "}
              <span className="font-bold text-blue-600">
                {filteredCars.length}
              </span>{" "}
              คัน
            </p>
          </div>
        </div>

        {/* --- Search & Filter Bar --- */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 mb-8 sticky top-24 z-30">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* ช่องค้นหา */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="ค้นหายี่ห้อ, รุ่น, จังหวัด..."
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* กลุ่ม Dropdown */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 flex-[2]">
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">ทุกยี่ห้อ</option>
                {brands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>

              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">ทุกประเภท</option>
                {types.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none md:col-span-2"
              >
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

        {/* --- Car List (Horizontal Cards) --- */}
        {!loading && (
          <div className="space-y-6">
            {paginatedCars.map((car) => (
              <div
                key={car.carID}
                className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-blue-300 transition-all duration-300 flex flex-col md:flex-row h-auto md:h-64"
              >
                {/* 1. รูปภาพด้านซ้าย */}
                <div className="w-full md:w-1/3 relative overflow-hidden bg-slate-100">
                  <img
                    src={car.carPicture || "/images/car-placeholder.jpg"}
                    alt={car.carBrand}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                    {car.carType}
                  </div>
                </div>

                {/* 2. รายละเอียดด้านขวา */}
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-2xl font-bold text-slate-800 group-hover:text-blue-700 transition-colors">
                          {car.carBrand}
                        </h2>
                        <p className="text-slate-500 text-sm line-clamp-1 mt-1">
                          {car.carDetail}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-400 mb-1">
                          ราคาเช่าต่อวัน
                        </p>
                        <p className="text-2xl font-black text-blue-600">
                          ฿{car.carPrice.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Badge คุณสมบัติรถ */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
                      <div className="flex items-center gap-2 text-slate-600 text-sm bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <Users size={16} className="text-blue-500" />
                        <span>{car.carSeat} ที่นั่ง</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 text-sm bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <Settings2 size={16} className="text-blue-500" />
                        <span>{car.carGear}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 text-sm bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <Fuel size={16} className="text-blue-500" />
                        <span>{car.carPower}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 text-sm bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <MapPin size={16} className="text-blue-500" />
                        <span className="truncate">{car.carProvince}</span>
                      </div>
                    </div>
                  </div>

                  {/* 3. ปุ่มแยกกันด้านล่าง */}
                  <div className="flex gap-3 mt-6 pt-4 border-t border-slate-100">
                    <Link
                      href={`/cars/${car.carID}`}
                      className="flex-1 py-3 text-center text-slate-700 bg-white border border-slate-300 rounded-xl font-bold text-sm hover:bg-slate-50 hover:text-slate-900 transition-all"
                    >
                      ดูรายละเอียด
                    </Link>
                    <Link
                      href={`/checkout?carId=${car.carID}`}
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
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 disabled:opacity-50 hover:bg-slate-50 font-medium"
            >
              ก่อนหน้า
            </button>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-10 h-10 rounded-lg font-bold flex items-center justify-center transition-all ${
                    currentPage === i + 1
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 disabled:opacity-50 hover:bg-slate-50 font-medium"
            >
              ถัดไป
            </button>
          </div>
        )}

        {/* กรณีหาไม่เจอ */}
        {!loading && filteredCars.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
            <h3 className="text-xl font-bold text-slate-800">
              ไม่พบรถพร้อมให้บริการ
            </h3>
            <p className="text-slate-500 mt-2">
              อาจจะไม่มีรถว่างในขณะนี้ หรือลองเปลี่ยนคำค้นหาดูนะครับ
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
