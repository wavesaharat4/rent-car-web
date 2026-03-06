"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import Link from "next/link";
import { useRouter } from "next/navigation"; // 🌟 1. นำเข้า useRouter สำหรับเปลี่ยนหน้า

// ... (Interface และ Mock Data ปล่อยไว้เหมือนเดิม) ...
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
  const router = useRouter(); // 🌟 เรียกใช้งาน router

  // State สำหรับเก็บข้อมูลสถานที่จาก DB
  const [provinces, setProvinces] = useState<string[]>([]);
  const [recommendedCars, setRecommendedCars] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 🌟 2. State สำหรับเก็บค่าฟอร์มค้นหาและ Error Modal
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
          const uniqueProvinces = [...new Set(data.map((car: any) => car.carProvince))].filter(Boolean) as string[];
          setProvinces(uniqueProvinces);

          const availableCars = data.filter((car: any) => car.carStatus === "Available");
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

  // 🌟 3. ฟังก์ชันตรวจสอบก่อนค้นหา
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault(); // ป้องกันไม่ให้ฟอร์มรีเฟรชหน้าเว็บ

    // เช็คว่าเลือกข้อมูลครบไหม
    if (!location || !startDate || !endDate) {
      setSearchError("กรุณาระบุ 'สถานที่รับ-คืนรถ' และ 'วันที่' ให้ครบถ้วนเพื่อค้นหารถครับ");
      return;
    }

    // เช็คว่าวันคืนรถ ต้องไม่น้อยกว่าวันรับรถ และต้องเช่าอย่างน้อย 1 วัน (24 ชั่วโมง)
    const startObj = new Date(startDate);
    const endObj = new Date(endDate);
    const now = new Date();

    if (startObj < now) {
      setSearchError("ไม่สามารถจองรถย้อนหลังได้ครับ");
      return;
    }

    if (startObj >= endObj) {
      setSearchError("ระบุวันที่ไม่ถูกต้อง! วันและเวลาคืนรถต้องมากกว่าวันรับรถครับ");
      return;
    }

    const diffTime = endObj.getTime() - startObj.getTime();
    if (diffTime < 24 * 60 * 60 * 1000) {
      setSearchError("ต้องเช่ารถขั้นต่ำ 1 วัน (24 ชั่วโมง) ครับ");
      return;
    }

    // ผ่านทุกเงื่อนไข (ไม่ต้องเช็คล็อกอิน) -> พาไปหน้า /cars พร้อมส่งค่า
    router.push(`/cars?location=${location}&start=${startDate}&end=${endDate}`);
  };

  return (
    <div className="bg-slate-50 text-blue-950 min-h-screen font-sans selection:bg-blue-200 relative">

      {/* 🌟 4. แจ้งเตือนแบบ Modal (Pop-up) สำหรับหน้า Home */}
      {searchError && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 md:p-8 animate-in zoom-in-95 duration-300">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-5 shadow-inner">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2">ข้อมูลไม่ครบถ้วน</h3>
              <p className="text-slate-500 text-sm mb-8 leading-relaxed">{searchError}</p>
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
        {/* 1. Hero Section & Search Bar */}
        <section className="relative w-full h-[65vh] min-h-[550px] flex flex-col items-center justify-center">
          <div
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: "url('https://bzkhhkqkausplbsjsyay.supabase.co/storage/v1/object/public/phumjai%20rent/webpage/26_FRD_MME_FRDNPERA0001_gt_velblue.avif')",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-blue-700/60 to-gray-900"></div>
          </div>

          <div className="relative z-10 text-center px-4 mb-10">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 tracking-tight">
              ยกระดับการเดินทางไปกับ PhumJai Rent
            </h1>
            <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto font-light">
              บริการรถเช่าระดับพรีเมียม ตอบสนองทุกไลฟ์สไตล์ด้วยรถยนต์คุณภาพสูง พร้อมบริการตลอด 24 ชั่วโมง
            </p>
          </div>

          {/* 🌟 5. เปลี่ยนมาใช้ onSubmit={handleSearch} แทน action="/cars" */}
          <form
            onSubmit={handleSearch}
            className="relative z-10 bg-white p-2 md:p-3 rounded-3xl md:rounded-full w-[90%] max-w-5xl shadow-2xl flex flex-col md:flex-row gap-2 md:gap-4 items-center border border-blue-100"
          >
            <div className="flex-1 w-full px-5 py-3 border-b md:border-b-0 md:border-r border-blue-100">
              <label className="block text-xs text-blue-600 font-bold mb-1 uppercase tracking-wider">
                สถานที่รับ-คืนรถ
              </label>
              {/* ผูก value และ onChange กับ State ลบ required ออกเพื่อให้ Modal ทำงาน */}
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
                      <option key={prov} value={prov}>{prov}</option>
                    ))}
                  </>
                )}
              </select>
            </div>

            <div className="flex-1 w-full px-5 py-3 border-b md:border-b-0 md:border-r border-blue-100">
              <label className="block text-xs text-blue-600 font-bold mb-1 uppercase tracking-wider">วัน-เวลารับรถ</label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full text-blue-950 bg-transparent outline-none cursor-pointer font-medium"
              />
            </div>

            <div className="flex-1 w-full px-5 py-3">
              <label className="block text-xs text-blue-600 font-bold mb-1 uppercase tracking-wider">วัน-เวลาคืนรถ</label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full text-blue-950 bg-transparent outline-none cursor-pointer font-medium"
              />
            </div>

            <button type="submit" className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full flex items-center justify-center transition-all duration-300 shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] md:aspect-square group cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:mr-0 mr-2 transform group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="md:hidden font-bold">ค้นหารถ</span>
            </button>
          </form>
        </section>

        {/* 2. Info Section */}
        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="rounded-2xl overflow-hidden shadow-2xl relative group h-[450px]">
              <div className="absolute inset-0 bg-blue-600/5 group-hover:bg-transparent transition duration-500 z-10"></div>
              <img src="https://www.astonmartin.com/-/media/top-gear-award-2026/tga-desk-still-new.jpg?mw=1920&rev=-1&hash=7ABA0E79D5DB0A500009322935948B7B" alt="Luxury Car Concept" className="w-full h-full object-cover transform group-hover:scale-105 transition duration-700" />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-blue-950 mb-6 leading-tight">
                ความสมบูรณ์แบบ<br />ในทุก<span className="text-blue-600">การขับขี่</span>
              </h2>
              <p className="text-slate-600 text-lg mb-6 leading-relaxed font-light">
                สัมผัสประสบการณ์การเดินทางที่เหนือกว่า แพลตฟอร์มของเราคัดสรรเฉพาะรถยนต์สภาพเยี่ยม ไม่ว่าจะเป็นการเดินทางเพื่อธุรกิจใน <strong>กรุงเทพ</strong> หรือพักผ่อนใน <strong>เชียงใหม่ และภูเก็ต</strong> เราพร้อมมอบความหรูหราที่เข้าถึงได้
              </p>
              <div className="w-16 h-1.5 bg-blue-600 mb-6 rounded-full"></div>
              <h3 className="text-xl font-bold text-blue-950 mb-3">ยืดหยุ่น ไร้รอยต่อ</h3>
              <p className="text-slate-600 leading-relaxed font-light">
                เลือกแพ็กเกจที่ตรงใจคุณ ทั้งแบบรายวัน รายสัปดาห์ หรือรายเดือน พร้อมตัวเลือกรถพลังงานสะอาด (EV) ที่ช่วยให้คุณดูดีพร้อมรักษ์โลกไปในตัว
              </p>
            </div>
          </div>
        </section>

        {/* 3. Recommended Cars Section */}
        <section className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-extrabold text-blue-950">รถเช่าแนะนำ</h2>
              <p className="text-blue-600 mt-2 font-medium">สัมผัสความเหนือระดับในทุกเส้นทาง</p>
            </div>
            <Link href="/cars" className="text-blue-600 hover:text-blue-800 font-bold transition hidden md:flex items-center gap-2 group">
              ดูทั้งหมด
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform group-hover:translate-x-1 transition" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>

          {isLoading ? (
            <div className="text-center py-10"><p className="text-slate-500">กำลังโหลดรถแนะนำ...</p></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendedCars.map((car) => (
                <div key={car.carID} className="bg-white rounded-2xl overflow-hidden border border-blue-100 hover:border-blue-300 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group">
                  <div className="h-48 overflow-hidden relative bg-slate-100">
                    <img src={car.carPicture || "/images/car-placeholder.jpg"} alt={car.carBrand} className="w-full h-full object-cover transform group-hover:scale-110 transition duration-700 mix-blend-multiply" />
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <p className="text-xs text-blue-500 font-bold uppercase tracking-wider mb-2">{car.carType}</p>
                    <h3 className="text-xl font-bold text-blue-950 mb-4 truncate">{car.carBrand}</h3>
                    <div className="mt-auto flex justify-between items-end border-t border-slate-100 pt-5">
                      <div>
                        <p className="text-slate-500 text-xs font-medium mb-1">เริ่มต้น</p>
                        <p className="text-blue-950 font-extrabold"><span className="text-2xl text-blue-600">฿{car.carPrice.toLocaleString()}</span> / วัน</p>
                      </div>
                      {/* 🌟 ให้ลิงก์แนะนำส่งค่าวันที่ปัจจุบันไปด้วย เผื่อลูกค้ากดจากตรงนี้ */}
                      <Link href={`/cars/${car.carID}?start=${startDate}&end=${endDate}`} className="border-2 border-blue-600 text-blue-600 px-4 py-2 rounded-xl text-sm hover:bg-blue-600 hover:text-white transition-all font-bold">
                        จองเลย
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <Link href="/cars" className="block text-center mt-10 text-blue-600 font-bold md:hidden">
            ดูคอลเลกชันทั้งหมด &rarr;
          </Link>
        </section>

        {/* 4. Promotions Section */}
        <section className="max-w-7xl mx-auto px-6 py-20">
          <h2 className="text-3xl font-extrabold text-blue-950 mb-10 text-center">สิทธิพิเศษสำหรับคุณ</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {promotions.map((promo) => (
              <div key={promo.id} className={`bg-gradient-to-br ${promo.gradient} border rounded-2xl p-8 text-white relative overflow-hidden group cursor-pointer hover:-translate-y-2 transition-all duration-300 shadow-xl`}>
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-3 text-white tracking-tight">{promo.title}</h3>
                  <p className="text-blue-100 font-light leading-relaxed">{promo.desc}</p>
                </div>
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:bg-blue-400/20 transition duration-500"></div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}