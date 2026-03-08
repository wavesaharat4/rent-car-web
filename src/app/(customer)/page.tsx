"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Promotion {
  id: number;
  title: string;
  desc: string;
  gradient: string;
}

const promotions: Promotion[] = [
  {
    id: 1,
    title: "Exclusive 3+1",
    desc: "เช่า 3 วัน ฟรี 1 วัน! คุ้มค่าสำหรับการเดินทางเหนือระดับ",
    gradient: "from-blue-900 to-blue-950 border-blue-800",
  },
  {
    id: 2,
    title: "Privilege Member",
    desc: "สมัครสมาชิกวันนี้ รับส่วนลด 20% สำหรับการเช่าครั้งแรก",
    gradient: "from-blue-700 to-blue-900 border-blue-600",
  },
  {
    id: 3,
    title: "Green Luxury EV",
    desc: "เช่ารถ EV วันนี้ รับสิทธิ์ชาร์จฟรีตามสถานีชั้นนำทั่วประเทศ",
    gradient: "from-cyan-700 to-blue-900 border-cyan-600",
  },
];

export default function Home() {
  const router = useRouter();

  // State สำหรับเก็บข้อมูลสถานที่จาก DB
  const [provinces, setProvinces] = useState<string[]>([]);
  const [recommendedCars, setRecommendedCars] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State สำหรับเก็บค่าฟอร์มค้นหาและ Error Modal
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchError, setSearchError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/cars");
        if (res.ok) {
          const data = await res.json();
          const uniqueProvinces = [
            ...new Set(data.map((car: any) => car.carProvince)),
          ].filter(Boolean) as string[];
          setProvinces(uniqueProvinces);

          const availableCars = data.filter(
            (car: any) => car.carStatus === "Available",
          );
          setRecommendedCars(availableCars.slice(0, 4));
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (!location || !startDate || !endDate) {
      setSearchError(
        "กรุณาระบุ 'สถานที่รับ-คืนรถ' และ 'วันที่' ให้ครบถ้วนเพื่อค้นหารถครับ",
      );
      return;
    }

    const startObj = new Date(startDate);
    startObj.setHours(0, 0, 0, 0);

    const endObj = new Date(endDate);
    endObj.setHours(0, 0, 0, 0);

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (startObj < now) {
      setSearchError("ไม่สามารถจองรถย้อนหลังได้ครับ");
      return;
    }

    if (startObj >= endObj) {
      setSearchError(
        "ระบุวันที่ไม่ถูกต้อง! วันคืนรถต้องเป็นวันถัดไปจากวันรับรถครับ",
      );
      return;
    }

    router.push(`/cars?location=${location}&start=${startDate}&end=${endDate}`);
  };

  return (
    <div className="bg-slate-50 text-blue-950 min-h-screen font-sans selection:bg-blue-200 relative">
      {/* Modal Error */}
      {searchError && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 md:p-8 animate-in zoom-in-95 duration-300">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-5 shadow-inner">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                  className="w-8 h-8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2">
                ข้อมูลไม่ครบถ้วน
              </h3>
              <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                {searchError}
              </p>
              <button
                onClick={() => setSearchError("")}
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
              >
                รับทราบ
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="pb-20">
        {/* 1. Hero Section */}
        <section className="relative w-full h-[65vh] min-h-[550px] flex flex-col items-center justify-center">
          <div
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage:
                "url('https://bzkhhkqkausplbsjsyay.supabase.co/storage/v1/object/public/phumjai%20rent/webpage/26_FRD_MME_FRDNPERA0001_gt_velblue.avif')",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-blue-700/60 to-gray-900"></div>
          </div>

          <div className="relative z-10 text-center px-4 mb-10">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 tracking-tight">
              ยกระดับการเดินทางไปกับ PhumJai Rent
            </h1>
            <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto font-light">
              บริการรถเช่าระดับพรีเมียม ตอบสนองทุกไลฟ์สไตล์ด้วยรถยนต์คุณภาพสูง
              พร้อมบริการตลอด 24 ชั่วโมง
            </p>
          </div>

          <form
            onSubmit={handleSearch}
            className="relative z-10 bg-white p-2 md:p-3 rounded-3xl md:rounded-full w-[90%] max-w-5xl shadow-2xl flex flex-col md:flex-row gap-2 md:gap-4 items-center border border-blue-100"
          >
            <div className="flex-1 w-full px-5 py-3 border-b md:border-b-0 md:border-r border-blue-100">
              <label className="block text-xs text-blue-600 font-bold mb-1 uppercase tracking-wider">
                สถานที่รับ-คืนรถ
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full text-blue-950 bg-transparent outline-none cursor-pointer appearance-none font-medium"
              >
                {isLoading ? (
                  <option value="">กำลังโหลดสถานที่...</option>
                ) : (
                  <>
                    <option value="">ระบุสถานที่ (ทั้งหมด)</option>
                    {provinces.map((prov) => (
                      <option key={prov} value={prov}>
                        {prov}
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>
            <div className="flex-1 w-full px-5 py-3 border-b md:border-b-0 md:border-r border-blue-100">
              <label className="block text-xs text-blue-600 font-bold mb-1 uppercase tracking-wider">
                วัน-เวลารับรถ
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full text-blue-950 bg-transparent outline-none cursor-pointer font-medium"
              />
            </div>
            <div className="flex-1 w-full px-5 py-3">
              <label className="block text-xs text-blue-600 font-bold mb-1 uppercase tracking-wider">
                วัน-เวลาคืนรถ
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full text-blue-950 bg-transparent outline-none cursor-pointer font-medium"
              />
            </div>
            <button
              type="submit"
              className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full flex items-center justify-center transition-all duration-300 shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] md:aspect-square group cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 md:mr-0 mr-2 transform group-hover:scale-110 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <span className="md:hidden font-bold">ค้นหารถ</span>
            </button>
          </form>
        </section>

       {/* 🌟 2. Info Section (อัปเกรดดีไซน์ใหม่แบบ Premium Video) */}
        <section className="max-w-7xl mx-auto px-6 py-24 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* ฝั่งซ้าย: วิดีโอพร้อมลูกเล่น */}
            <div className="relative group w-full h-[450px] md:h-[550px] rounded-[2.5rem] overflow-hidden shadow-2xl">
              
              {/* วิดีโอพื้นหลัง (เล่นอัตโนมัติ วนลูป ปิดเสียง) */}
              {/* 💡 แนะนำ: ให้นำวิดีโอของตัวเองไปอัปโหลดลง Supabase แล้วเอาลิงก์มาใส่แทนตรง src นี้นะครับ */}
              <video 
                autoPlay 
                loop 
                muted 
                playsInline 
                className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000 ease-out"
              >
                <source 
                  src="https://bzkhhkqkausplbsjsyay.supabase.co/storage/v1/object/public/phumjai%20rent/video/VideoCar888za.mp4" 
                  type="video/mp4" 
                />
                ขออภัย เบราว์เซอร์ของคุณไม่รองรับการแสดงผลวิดีโอ
              </video>

              {/* Overlay ไล่สีดำบางๆ ให้ดูมีมิติ */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent pointer-events-none"></div>
              
            </div>

            {/* ฝั่งขวา: เนื้อหาและข้อความ */}
            <div className="flex flex-col justify-center">
              {/* ป้าย Tag เล็กๆ ด้านบน */}
              <span className="inline-block px-4 py-1.5 bg-blue-50 text-blue-600 font-bold rounded-full text-sm mb-6 w-max border border-blue-100 shadow-sm">
                The PhumJai Experience
              </span>
              
              <h2 className="text-4xl md:text-5xl font-extrabold text-blue-950 mb-6 leading-tight tracking-tight">
                ความสมบูรณ์แบบ<br />ในทุก<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">การขับขี่</span>
              </h2>
              
              <p className="text-slate-600 text-lg mb-8 leading-relaxed font-light">
                สัมผัสประสบการณ์การเดินทางที่เหนือกว่า แพลตฟอร์มของเราคัดสรรเฉพาะรถยนต์สภาพเยี่ยม ไม่ว่าจะเป็นการเดินทางเพื่อธุรกิจใน <strong>กรุงเทพ</strong> หรือพักผ่อนใน <strong>เชียงใหม่ และภูเก็ต</strong> เราพร้อมมอบความหรูหราที่เข้าถึงได้
              </p>
              
              {/* เส้นคั่นบางๆ */}
              <div className="w-full h-px bg-slate-200 mb-8"></div>
              
              {/* ปรับหัวข้อย่อยให้เป็นแบบรายการ (List) พร้อมไอคอน */}
              <div className="flex flex-col gap-5 mb-10">
                <div className="flex items-start gap-4">
                  <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-blue-950 mb-1">ยืดหยุ่น ไร้รอยต่อ</h3>
                    <p className="text-slate-500 font-light text-sm md:text-base leading-relaxed">
                      เลือกแพ็กเกจที่ตรงใจคุณ ทั้งแบบรายวัน รายสัปดาห์ หรือรายเดือน
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-blue-950 mb-1">พลังงานสะอาด (EV Options)</h3>
                    <p className="text-slate-500 font-light text-sm md:text-base leading-relaxed">
                      พร้อมตัวเลือกรถพลังงานไฟฟ้า 100% ที่ช่วยให้คุณดูดีพร้อมรักษ์โลกไปในตัว
                    </p>
                  </div>
                </div>
              </div>

              {/* ปุ่ม Call-to-action */}
              <div>
                <Link href="/cars" className="inline-flex items-center justify-center px-8 py-3.5 bg-blue-950 text-white font-bold rounded-full hover:bg-blue-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 group">
                  เริ่มการเดินทางของคุณ
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>

            </div>
          </div>
        </section>

        {/* 3. Recommended Cars Section */}
        <section className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-extrabold text-blue-950">
                รถเช่าแนะนำ
              </h2>
              <p className="text-blue-600 mt-2 font-medium">
                สัมผัสความเหนือระดับในทุกเส้นทาง
              </p>
            </div>
            <Link
              href="/cars"
              className="text-blue-600 hover:text-blue-800 font-bold transition hidden md:flex items-center gap-2 group"
            >
              ดูทั้งหมด
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 transform group-hover:translate-x-1 transition"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
          </div>

          {isLoading ? (
            <div className="text-center py-10">
              <p className="text-slate-500">กำลังโหลดรถแนะนำ...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendedCars.map((car) => (
                <div
                  key={car.carID}
                  className="bg-white rounded-2xl overflow-hidden border border-blue-100 hover:border-blue-300 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
                >
                  <div className="h-48 overflow-hidden relative bg-slate-100">
                    <img
                      src={car.carPicture || "/images/car-placeholder.jpg"}
                      alt={car.carBrand}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition duration-700 mix-blend-multiply"
                    />
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <p className="text-xs text-blue-500 font-bold uppercase tracking-wider mb-2">
                      {car.carType}
                    </p>
                    <h3 className="text-xl font-bold text-blue-950 mb-3 truncate">
                      {car.carBrand}
                    </h3>

                    <div className="flex flex-wrap items-center gap-2 mb-4 text-xs text-slate-600 font-medium">
                      <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                        <svg
                          className="w-4 h-4 text-blue-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                          />
                        </svg>
                        <span>{car.carSeat || 4} ที่นั่ง</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                        <svg
                          className="w-4 h-4 text-blue-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <span>{car.carGear || "Auto"}</span>
                      </div>
                    </div>

                    <div className="mt-auto flex justify-between items-end border-t border-slate-100 pt-5">
                      <div>
                        <p className="text-slate-500 text-xs font-medium mb-1">
                          เริ่มต้น
                        </p>
                        <p className="text-blue-950 font-extrabold">
                          <span className="text-2xl text-blue-600">
                            ฿{car.carPrice.toLocaleString()}
                          </span>{" "}
                          / วัน
                        </p>
                      </div>
                      <Link
                        href={`/cars/${car.carID}?start=${startDate}&end=${endDate}`}
                        className="border-2 border-blue-600 text-blue-600 px-4 py-2 rounded-xl text-sm hover:bg-blue-600 hover:text-white transition-all font-bold"
                      >
                        จองเลย
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <Link
            href="/cars"
            className="block text-center mt-10 text-blue-600 font-bold md:hidden"
          >
            ดูคอลเลกชันทั้งหมด &rarr;
          </Link>
        </section>

        {/* 🌟 Section: จุดเด่นของเรา (Premium Deep Blue Theme - Optimized 🚀) */}
        <section className="w-full bg-gradient-to-b from-blue-950 via-[#0a1526] to-slate-900 py-24 relative overflow-hidden border-y border-blue-900">
          {/* พื้นหลัง: เปลี่ยนจากลายเส้นหน่วงๆ มาใช้ Radial Gradient เบาๆ ตรงกลางแทน */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(37,99,235,0.1)_0%,transparent_70%)] pointer-events-none"></div>

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            {/* หัวข้อ */}
            <div className="text-center max-w-3xl mx-auto mb-14 md:mb-14">
              <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight drop-shadow-md">
                จุดเด่นของเรา
              </h2>
              <p className="text-blue-100/80 text-lg font-light leading-relaxed">
                ค้นพบโลกแห่งความสะดวกสบาย ความปลอดภัย
                และการบริการที่ปรับแต่งได้ตามใจคุณ
                ปูทางไปสู่การเดินทางที่น่าจดจำและโซลูชันการเดินทางที่ไร้รอยต่อ
              </p>
            </div>

            {/* Layout แบบ 3 คอลัมน์ */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8 items-center">
              {/* คอลัมน์ซ้าย (Left Features) */}
              <div className="flex flex-col gap-12 md:gap-16">
                {/* ข้อ 1 */}
                <div className="flex flex-col sm:flex-row items-start gap-5 group/item cursor-default">
                  {/* ลบ backdrop-blur-md ออก และลดความซับซ้อนของ Hover Effect ให้เบาลง */}
                  <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex-shrink-0 transition-colors duration-300 group-hover/item:bg-blue-600/20 group-hover/item:border-blue-500/50 shadow-sm">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-8 h-8 text-blue-400 group-hover/item:text-blue-300 transition-colors"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2 group-hover/item:text-blue-300 transition-colors">
                      รถสภาพสมบูรณ์พร้อมใช้
                    </h3>
                    <p className="text-blue-100/70 font-light leading-relaxed text-sm md:text-base">
                      รถทุกคันของเราได้รับการดูแลรักษาในสภาพสมบูรณ์แบบ
                      เพื่อให้คุณขับขี่ได้อย่างไร้กังวล
                    </p>
                  </div>
                </div>

                {/* ข้อ 2 */}
                <div className="flex flex-col sm:flex-row items-start gap-5 group/item cursor-default">
                  <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex-shrink-0 transition-colors duration-300 group-hover/item:bg-blue-600/20 group-hover/item:border-blue-500/50 shadow-sm">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-8 h-8 text-blue-400 group-hover/item:text-blue-300 transition-colors"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2 group-hover/item:text-blue-300 transition-colors">
                      เงื่อนไขการเช่าที่ยืดหยุ่น
                    </h3>
                    <p className="text-blue-100/70 font-light leading-relaxed text-sm md:text-base">
                      เปิดกว้างสำหรับผู้ขับขี่ทุกคน
                      เพียงคุณมีใบอนุญาตขับขี่ที่ถูกต้องและตรงตามเงื่อนไข
                    </p>
                  </div>
                </div>
              </div>

              {/* คอลัมน์กลาง (รูปรถแบบจัดเต็ม - ลดการเบลอ) */}
              <div className="flex justify-center items-center relative py-16 lg:py-0 order-first lg:order-none group w-full min-h-[300px] lg:min-h-[400px]">
                {/* 🌟 1. ลดการใช้ Blur มหาศาล เปลี่ยนมาใช้รูป Radial ของ Tailwind แทน จะเบาเครื่องมาก */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-[radial-gradient(circle,rgba(59,130,246,0.25)_0%,transparent_70%)] pointer-events-none transition-all duration-700 group-hover:scale-110 z-0"></div>

                {/* 🌟 2. เงาตกกระทบที่พื้น (ลด Blur ลง) */}
                <div className="absolute bottom-[-10px] md:bottom-2 left-1/2 transform -translate-x-1/2 w-[60%] h-4 bg-black/80 blur-[8px] rounded-[100%] pointer-events-none z-0 transition-all duration-700 group-hover:w-[50%] group-hover:blur-[10px] group-hover:opacity-60"></div>

                {/* 🌟 3. กรอบใส่รูปภาพ */}
                <div className="relative z-10 w-full max-w-[500px] lg:max-w-[600px] aspect-[16/9] lg:scale-110 transition-transform duration-500 group-hover:scale-125 lg:group-hover:scale-[1.2]">
                  <Image
                    src="https://bzkhhkqkausplbsjsyay.supabase.co/storage/v1/object/public/phumjai%20rent/benz%20(3).png"
                    alt="PhumJai Rent Premium Car"
                    fill
                    className="object-contain drop-shadow-[0_15px_15px_rgba(0,0,0,0.4)]"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    unoptimized={true}
                  />
                </div>
              </div>

              {/* คอลัมน์ขวา (Right Features) */}
              <div className="flex flex-col gap-12 md:gap-16">
                {/* ข้อ 3 */}
                <div className="flex flex-col sm:flex-row-reverse lg:flex-row-reverse items-start gap-5 lg:text-right group/item cursor-default">
                  <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex-shrink-0 transition-colors duration-300 group-hover/item:bg-blue-600/20 group-hover/item:border-blue-500/50 shadow-sm">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-8 h-8 text-blue-400 group-hover/item:text-blue-300 transition-colors"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2 group-hover/item:text-blue-300 transition-colors">
                      ประสบการณ์ระดับ V.I.P
                    </h3>
                    <p className="text-blue-100/70 font-light leading-relaxed text-sm md:text-base">
                      ไม่ว่าความต้องการของคุณจะเป็นแบบไหน
                      เราพร้อมบริการด้วยออปชันเสริมมากมาย
                    </p>
                  </div>
                </div>

                {/* ข้อ 4 */}
                <div className="flex flex-col sm:flex-row-reverse lg:flex-row-reverse items-start gap-5 lg:text-right group/item cursor-default">
                  <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex-shrink-0 transition-colors duration-300 group-hover/item:bg-blue-600/20 group-hover/item:border-blue-500/50 shadow-sm">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-8 h-8 text-blue-400 group-hover/item:text-blue-300 transition-colors"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2 group-hover/item:text-blue-300 transition-colors">
                      การันตีได้รถชัวร์ 100%
                    </h3>
                    <p className="text-blue-100/70 font-light leading-relaxed text-sm md:text-base">
                      ด้วยทีมงานที่พร้อมช่วยเหลือตลอด 24/7
                      เรารับประกันความพร้อมของรถและการจองที่รวดเร็ว
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Promotions Section (ดีไซน์ใหม่พรีเมียม) */}
        <section className="max-w-7xl mx-auto px-6 py-24 relative">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-blue-950 mb-6 tracking-tight">
              สิทธิพิเศษสำหรับคุณ
            </h2>
            <div className="w-20 h-1.5 bg-blue-600 mx-auto rounded-full"></div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {promotions.map((promo, index) => (
              <div
                key={promo.id}
                className="group relative bg-white rounded-[2rem] p-8 md:p-10 border border-slate-100 hover:border-blue-100 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(37,99,235,0.15)] overflow-hidden z-10 cursor-pointer flex flex-col h-full"
              >
                {/* 🌟 ลูกเล่นแสง Gradient มุมขวาบน (ดึงสีมาจากข้อมูล promo) */}
                <div
                  className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${promo.gradient} opacity-[0.08] rounded-bl-full -z-10 transition-transform duration-700 group-hover:scale-[1.5] group-hover:opacity-[0.15]`}
                ></div>

                {/* 🌟 ไอคอนตามแต่ละโปรโมชัน */}
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 bg-gradient-to-br ${promo.gradient} text-white shadow-lg shadow-blue-900/20 transform group-hover:-rotate-3 transition-transform duration-300`}
                >
                  {/* แสดงไอคอนต่างกันตาม index */}
                  {index === 0 && ( // โปร 3+1 (รูปของขวัญ/ปฏิทิน)
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-8 h-8"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                      />
                    </svg>
                  )}
                  {index === 1 && ( // สมาชิก (รูปมงกุฎ/ดาว)
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-8 h-8"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                      />
                    </svg>
                  )}
                  {index === 2 && ( // รถ EV (รูปสายฟ้า)
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-8 h-8"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  )}
                  {/* เผื่อมีโปรโมชันที่ 4 เพิ่มมาในอนาคต */}
                  {index > 2 && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-8 h-8"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                      />
                    </svg>
                  )}
                </div>

                {/* 🌟 เนื้อหา */}
                <h3 className="text-2xl font-extrabold text-blue-950 mb-4 group-hover:text-blue-600 transition-colors">
                  {promo.title}
                </h3>
                <p className="text-slate-500 font-light leading-relaxed mb-8 flex-grow">
                  {promo.desc}
                </p>

                {/* 🌟 Text Link หลอกๆ ด้านล่างเพื่อให้ดูน่าคลิก */}
                <div className="flex items-center text-sm font-bold text-blue-600 mt-auto pt-4 border-t border-slate-50 group-hover:border-blue-50 transition-colors">
                  <span>รับสิทธิ์เลย</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4 ml-2 transform group-hover:translate-x-2 transition-transform duration-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
