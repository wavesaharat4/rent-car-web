"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

// ข้อมูลจำลองอุปกรณ์เสริม
const ADDONS_DATA = [
  {
    id: "baby-seat",
    name: "BABY SEAT",
    description: "“SAFETY FIRST เพราะเราใส่ใจ ความปลอดภัย ในการเดินทาง” คาร์ซีท รุ่นใหม่ ปลอดภัยมากขึ้น ด้วยระบบ Double Lock เข็มขัดนิรภัยถึง 5 จุด สำหรับเด็กอายุ 6 เดือน – 5 ปี",
    price: 200,
    imageSrc: "https://placehold.co/400x300/e2e8f0/64748b.png?text=Baby+Seat",
    max: 2, 
  },
  {
    id: "gps",
    name: "GPS NAVIGATOR",
    description: "เครื่องนำทาง GPS พร้อมอัปเดตแผนที่ล่าสุด หน้าจอสัมผัสใช้งานง่าย ค้นหาสถานที่แม่นยำ หมดกังวลเรื่องหลงทาง",
    price: 150,
    imageSrc: "https://placehold.co/400x300/e2e8f0/64748b.png?text=GPS+Device",
    max: 1,
  },
];

// ข้อมูลจำลองโค้ดส่วนลด 
const PROMO_CODES = [
  { 
    code: "NEWUSER200", 
    title: "ลูกค้าใหม่ลดทันที", 
    description: "ต้อนรับการจองครั้งแรกกับเรา",
    discount: 200, 
    minSpend: 1000,
    imageSrc: "https://placehold.co/200x200/eff6ff/2563eb.png?text=NEW"
  },
  { 
    code: "SUMMER500", 
    title: "รับลมร้อน ลดกระหน่ำ", 
    description: "ส่วนลดสุดคุ้มเมื่อยอดเช่าถึงกำหนด",
    discount: 500, 
    minSpend: 3000,
    imageSrc: "https://placehold.co/200x200/fffbeb/f59e0b.png?text=HOT"
  },
  { 
    code: "VALENTINE200", 
    title: "รถ Premium ต้อนรับ Valentine Day", 
    description: "ลดพิเศษสำหรับรถตู้และรถพรีเมียม",
    discount: 200, 
    minSpend: 0,
    imageSrc: "https://placehold.co/200x200/fce7f3/10b981.png?text=VDAY"
  },
];

export default function CheckoutPage() {
  const [step, setStep] = useState(3);
  const [addonCounts, setAddonCounts] = useState<Record<string, number>>({});
  
  // State สำหรับจัดการโค้ดส่วนลด 
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [selectedPromo, setSelectedPromo] = useState<any>(null);
  
  // State สำหรับเลือกวิธีชำระเงิน
  const [paymentMethod, setPaymentMethod] = useState("creditCard");

  // State สำหรับเก็บข้อมูลฟอร์มผู้จอง
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    phonePrefix: "+66",
    phone: "",
    driverLicense: "",
    passport: "",
    needTaxInvoice: false,
    flightInfo: "",
    flightNumber: ""
  });

  // ข้อมูลจำลองการจอง
  const carName = "Toyota Commuter";
  const carPriceTotal = 5100; 
  const carPricePerDay = 1700;
  const days = 3;

  // คำนวณราคาอุปกรณ์เสริมรวม
  const addonsTotal = Object.entries(addonCounts).reduce((total, [id, count]) => {
    const addon = ADDONS_DATA.find(a => a.id === id);
    return total + (addon ? addon.price * count * days : 0);
  }, 0);

 // คำนวณส่วนลด ยอดก่อนภาษี ภาษี และยอดรวมสุทธิ
  const discountAmount = selectedPromo ? selectedPromo.discount : 0;
  const subTotal = carPriceTotal + addonsTotal - discountAmount; // ยอดรวมก่อนภาษี
  const vatAmount = Math.round(subTotal * 0.07); // คำนวณภาษี 7%
  const grandTotal = subTotal + vatAmount; // ยอดรวมสุทธิ (รวมภาษีแล้ว)

  // ฟังก์ชันเพิ่ม-ลดอุปกรณ์
  const updateAddonCount = (id: string, delta: number, max: number) => {
    setAddonCounts(prev => {
      const current = prev[id] || 0;
      const next = current + delta;
      if (next < 0 || next > max) return prev;
      return { ...prev, [id]: next };
    });
  };

  // ฟังก์ชันจัดการการพิมพ์ฟอร์ม
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pt-10 pb-24 font-sans text-slate-800 relative">
      
      {/* ================= TOP STEPPER ================= */}
      {step < 6 && (
        <div className="bg-white border-b border-slate-200  top-0 z-30 shadow-sm hidden md:block">
          <div className="max-w-[1200px] mx-auto px-4 flex items-center justify-between gap-4 py-4">
            
            <div className="flex items-center gap-3 flex-1 bg-white p-3 rounded-2xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(37,99,235,0.08)]">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg shrink-0">1</div>
              <div className="text-xs truncate flex-1">
                <div className="flex gap-4">
                  <div>
                    <span className="text-slate-400 block mb-0.5 font-medium">รับรถ</span>
                    <p className="font-bold text-slate-700 truncate text-sm">กรุงเทพ - สนามบิน...</p>
                    <span className="text-slate-500">23 ก.พ. 2026, 07:00</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5 font-medium">คืนรถ</span>
                    <p className="font-bold text-slate-700 truncate text-sm">กรุงเทพ - สนามบิน...</p>
                    <span className="text-slate-500">26 ก.พ. 2026, 07:00</span>
                  </div>
                </div>
              </div>
              <Link href="/" className="ml-auto text-blue-600 p-2 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32l8.4-8.4z" /></svg>
              </Link>
            </div>

            <div className="flex items-center gap-3 flex-1 bg-white p-3 rounded-2xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(37,99,235,0.08)]">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg shrink-0">2</div>
              <div className="text-xs truncate flex-1">
                <span className="text-slate-400 block mb-0.5 font-medium">รถ</span>
                <p className="font-bold text-slate-700 text-sm truncate">{carName}</p>
                <span className="text-slate-500 font-medium">{carPriceTotal.toLocaleString()} บาท</span>
              </div>
              <button onClick={() => window.history.back()} className="ml-auto text-blue-600 p-2 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32l8.4-8.4z" /></svg>
              </button>
            </div>

            <div className={`flex items-center gap-3 flex-1 p-3 rounded-2xl transition-all shadow-[0_2px_15px_-3px_rgba(37,99,235,0.08)] ${step === 3 ? 'bg-blue-600 text-white border-transparent' : 'bg-white border border-slate-100 text-slate-700'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shrink-0 ${step === 3 ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'}`}>3</div>
              <div className="font-bold text-sm cursor-pointer" onClick={() => setStep(3)}>ประกันและอุปกรณ์เสริม</div>
              {step > 3 && (
                <button onClick={() => setStep(3)} className="ml-auto text-blue-600 p-2 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32l8.4-8.4z" /></svg>
                </button>
              )}
            </div>

            <div className={`flex items-center gap-3 flex-1 p-3 rounded-2xl transition-all shadow-[0_2px_15px_-3px_rgba(37,99,235,0.08)] ${step === 4 ? 'bg-blue-600 text-white border-transparent' : 'bg-white border border-slate-100 text-slate-700'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shrink-0 ${step === 4 ? 'bg-white text-blue-600' : 'bg-white border-2 border-slate-200 text-slate-400'}`}>4</div>
              <div className={`font-bold text-sm ${step === 4 ? 'text-white' : 'text-slate-400'}`}>ข้อมูลการชำระเงิน</div>
            </div>
            
          </div>
        </div>
      )}

      <div className="max-w-[1000px] mx-auto px-4 mt-10">
        
        {/* ================= HEADER ================= */}
        {step < 6 && (
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              {step > 3 ? (
                <button onClick={() => setStep(step - 1)} className="text-blue-600 font-bold hover:bg-blue-100 bg-blue-50 p-3 rounded-xl transition-colors cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </button>
              ) : (
                <Link href="/" className="text-blue-600 font-bold hover:bg-blue-100 bg-blue-50 p-3 rounded-xl transition-colors cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </Link>
              )}
              <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">
                {step === 3 ? "ประกันและอุปกรณ์เสริม" : "ตรวจสอบและดำเนินการจอง"}
              </h1>
            </div>
            <div className="text-right">
              <div className="text-2xl md:text-3xl font-black text-blue-600">
                {grandTotal.toLocaleString()} <span className="text-xl">บาท</span>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 3: ADDONS ================= */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {ADDONS_DATA.map((addon) => (
                <div key={addon.id} className="bg-white border border-slate-200 rounded-[28px] overflow-hidden hover:border-blue-400 hover:shadow-[0_8px_30px_rgb(37,99,235,0.12)] transition-all relative flex flex-col group">
                  <div className="w-full h-[220px] relative bg-slate-100 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent z-10"></div>
                    <Image src={addon.imageSrc} alt={addon.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm">
                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                      <span className="text-xs font-bold text-slate-700">แนะนำ</span>
                    </div>
                    <h3 className="absolute bottom-4 left-5 z-20 font-black text-white text-2xl drop-shadow-md">{addon.name}</h3>
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    <p className="text-sm text-slate-500 leading-relaxed mb-8 flex-1">{addon.description}</p>
                    <div className="flex items-end justify-between mt-auto pt-4 border-t border-slate-100">
                      <div>
                        <div className="font-black text-blue-600 text-2xl">
                          {addon.price} THB <span className="text-sm font-bold text-slate-500">/ ชิ้น / วัน</span>
                        </div>
                      </div>
                      <div className="flex items-center bg-slate-50 rounded-2xl p-1.5 border border-slate-200 shadow-inner">
                        <button onClick={() => updateAddonCount(addon.id, -1, addon.max)} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-white hover:shadow-sm rounded-xl transition-all font-bold text-lg cursor-pointer">−</button>
                        <span className="font-black text-slate-800 text-lg w-12 text-center">{addonCounts[addon.id] || 0}</span>
                        <button onClick={() => updateAddonCount(addon.id, 1, addon.max)} className="w-10 h-10 flex items-center justify-center text-blue-600 hover:bg-white hover:shadow-sm rounded-xl transition-all font-bold text-xl cursor-pointer">+</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-10 flex justify-end">
              <button onClick={() => setStep(4)} className="bg-blue-600 text-white font-bold py-4 px-14 rounded-2xl hover:bg-blue-700 hover:-translate-y-1 transition-all shadow-[0_8px_20px_rgba(37,99,235,0.3)] flex items-center gap-3 cursor-pointer text-lg">
                ถัดไป <span>&rarr;</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 4: REVIEW & PAYMENT ================= */}
        {step === 4 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            
            {/* Header ของ Step 4 */}
            <div className="mb-6">
              <h2 className="text-2xl font-black text-slate-800 mb-2">ตรวจสอบการจองของคุณ</h2>
              <p className="text-sm text-slate-500 font-medium">ตรวจสอบการจองของคุณและชำระเงินและยืนยันตัวตนให้เสร็จสิ้นภายใน 8 นาที มิฉะนั้นเซสชันการจองนี้อาจหมดอายุ</p>
            </div>

            {/* 🌟 1. สรุปรถที่เลือก (ปรับปรุงใหม่ตามแบบ) */}
            <div className="bg-white rounded-3xl border border-slate-200 mb-6 overflow-hidden">
              {/* Card Header */}
              <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-white">
                <h3 className="font-black text-lg text-slate-800">รถที่เลือก</h3>
                <span className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  ยอดรวม : {grandTotal.toLocaleString()} บาท 
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4 text-blue-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                  </svg>
                </span>
              </div>

              {/* Card Body */}
              <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Left: รูปภาพ */}
                <div className="md:col-span-4 relative">
                  <div className="absolute top-2 -left-2 bg-blue-600 text-white text-[10px] font-black w-14 h-14 rounded-full flex flex-col items-center justify-center text-center leading-tight shadow-lg border-[3px] border-white z-10 transform -rotate-12">
                    <span>SUPER</span><span>SAVE</span>
                  </div>
                  <div className="w-full aspect-[4/3] relative rounded-xl overflow-hidden bg-slate-50">
                     <Image src="https://placehold.co/600x450/f8fafc/64748b.png?text=Toyota+Commuter" alt="Car" fill className="object-cover" />
                  </div>
                </div>

                {/* Right: รายละเอียด */}
                <div className="md:col-span-8 flex flex-col">
                  <h2 className="text-xl font-black text-slate-800 mb-3">{carName} <span className="text-sm font-normal text-slate-500">(หรือเทียบเท่า)</span></h2>
                  
                  {/* Icons Spec */}
                  <div className="flex flex-wrap gap-4 text-slate-600 text-sm font-bold mb-4">
                    <span className="flex items-center gap-1.5"><span className="text-lg">👥</span> 11</span>
                    <span className="flex items-center gap-1.5"><span className="text-lg">🧳</span> 3</span>
                    <span className="flex items-center gap-1.5"><span className="text-lg">⚙️</span> M</span>
                    <span className="flex items-center gap-1.5"><span className="text-lg">❄️</span> A/C</span>
                    <span className="flex items-center gap-1.5"><span className="text-lg">🧑‍✈️</span> 21</span>
                  </div>

                  {/* Features (Checkmarks) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-2 gap-x-4 mb-6 border-b border-slate-100 pb-6 text-sm text-slate-700 font-medium">
                    <div className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-green-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                      ศูนย์ช่วยเหลือทางโทรศัพท์ตลอด 24 ชม.
                    </div>
                    <div className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-green-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                      รวมประกันภัยพื้นฐาน
                    </div>
                    <div className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-green-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                      ไมล์ไม่จำกัด
                    </div>
                  </div>

                  {/* ราคาและวันที่ */}
                  <div className="space-y-2 text-sm text-slate-700 flex-1">
                    
                    <div className="flex justify-between items-center">
                      <span>อัตราค่าบริการ (สำหรับ {days} วัน)</span>
                      <div className="text-right">
                        <span className="font-bold block">{carPriceTotal.toLocaleString()} บาท</span>
                        <span className="text-xs text-slate-400 font-medium">{carPricePerDay.toLocaleString()} บาท / วัน</span>
                      </div>
                    </div>

                    {addonsTotal > 0 && (
                      <div className="flex justify-between items-center pt-2">
                        <span>อุปกรณ์เสริมเพิ่มเติม</span>
                        <span className="font-bold">{addonsTotal.toLocaleString()} บาท</span>
                      </div>
                    )}

                    <div className="pt-4 mt-2 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-500">รับรถ</span>
                        <span className="font-bold text-right">กรุงเทพ - สาขาท่าอากาศยานดอนเมือง, 23 ก.พ. 2026, 07:00</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">คืนรถ</span>
                        <span className="font-bold text-right">กรุงเทพ - สาขาท่าอากาศยานดอนเมือง, 26 ก.พ. 2026, 07:00</span>
                      </div>
                    </div>

                    {/* 🌟 ส่วนสรุปราคาท้ายสุด */}
                    <div className="pt-4 mt-6 border-t-2 border-dashed border-slate-200 space-y-3">
                      {selectedPromo && (
                        <div className="flex justify-between items-center text-red-500">
                          <span className="font-bold">ส่วนลดโปรโมชั่น ({selectedPromo.code})</span>
                          <span className="font-black">-{discountAmount.toLocaleString()} บาท</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center text-slate-500">
                        <span className="font-medium">ภาษีมูลค่าเพิ่ม (7%)</span>
                        <span className="font-bold">+{vatAmount.toLocaleString()} บาท</span>
                      </div>
                      <div className="flex justify-between items-end pt-3 mt-3 border-t border-slate-100">
                        <span className="font-black text-slate-800 text-lg">ยอดรวมสุทธิ</span>
                        <span className="font-black text-blue-600 text-2xl">{grandTotal.toLocaleString()} <span className="text-lg">บาท</span></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 🌟 2. Promo Code Section (แบบ Accordion โชว์คูปองด้านใน) */}
            <div className="bg-white rounded-3xl border border-slate-200 mb-8 overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-white">
                <h3 className="font-black text-lg text-slate-800">โค้ดโปรโมชั่น</h3>
                <span className="font-bold text-slate-600 text-sm flex items-center gap-2">
                  ส่วนลด : {discountAmount.toLocaleString()} บาท 
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4 text-blue-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                  </svg>
                </span>
              </div>
              <div className="p-6 bg-slate-50/50 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex-1 w-full">
                  {selectedPromo ? (
                    <div className="flex items-center justify-between bg-blue-50 border border-blue-100 p-3 rounded-xl w-full max-w-sm">
                      <div className="flex items-center gap-3">
                        <span className="text-blue-600 text-xl">🎫</span>
                        <span className="text-blue-700 font-bold text-sm">{selectedPromo.title}</span>
                      </div>
                      <button onClick={() => setSelectedPromo(null)} className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center font-bold text-xs hover:bg-red-600 transition-colors cursor-pointer shrink-0">
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 text-slate-500 text-sm font-medium">
                      <span className="text-blue-600 text-xl">ℹ️</span> กรุณาเลือกโค้ดโปรโมชั่น
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => setIsPromoModalOpen(true)}
                  className="w-full md:w-auto bg-black text-white font-bold py-3 px-10 rounded-xl hover:-translate-y-1 transition-all shadow-[0_8px_20px_rgba(37,99,235,0.3)] cursor-pointer shadow-md whitespace-nowrap"
                >
                  + เลือกโค้ด
                </button>
              </div>
            </div>

            {/* 🌟 3. ข้อมูลของคุณ (อยู่ด้านล่างตามที่ขอ) */}
            <div className="mb-8">
              <div className="mb-4">
                <h2 className="text-2xl font-black text-slate-800">ข้อมูลของคุณ</h2>
                <p className="text-sm text-slate-500 font-medium">กรุณากรอกข้อมูลเป็นภาษาอังกฤษเท่านั้น</p>
              </div>
              
              <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8">
                <form className="space-y-6">
                  <div>
                    <label className="text-sm font-bold text-slate-800 mb-2 block">อีเมล <span className="text-red-500">*</span></label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className="w-full px-4 py-3.5 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors shadow-sm" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-bold text-slate-800 mb-2 block">ชื่อ <span className="text-red-500">*</span></label>
                      <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="w-full px-4 py-3.5 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors shadow-sm" />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-800 mb-2 block">โทรศัพท์ <span className="text-red-500">*</span></label>
                      <div className="flex shadow-sm rounded-xl">
                        <select name="phonePrefix" value={formData.phonePrefix} onChange={handleInputChange} className="px-3 py-3.5 bg-slate-50 border border-slate-300 border-r-0 rounded-l-xl text-slate-700 font-medium focus:outline-none focus:border-blue-500 cursor-pointer">
                          <option value="+66">+</option>
                        </select>
                        <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required className="w-full px-4 py-3.5 bg-white border border-slate-300 rounded-r-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-bold text-slate-800 mb-2 block">หมายเลขใบขับขี่</label>
                      <input type="text" name="driverLicense" value={formData.driverLicense} onChange={handleInputChange} className="w-full px-4 py-3.5 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors shadow-sm" />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-800 mb-2 block">หมายเลขพาสปอร์ต</label>
                      <input type="text" name="passport" value={formData.passport} onChange={handleInputChange} className="w-full px-4 py-3.5 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors shadow-sm" />
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="flex items-center gap-3 cursor-pointer group w-fit">
                      <div className="relative flex items-center justify-center">
                        <input type="checkbox" name="needTaxInvoice" checked={formData.needTaxInvoice} onChange={handleInputChange} className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded cursor-pointer checked:bg-blue-600 checked:border-blue-600 transition-colors" />
                        <svg className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">ฉันต้องการรับใบกำกับภาษี</span>
                    </label>
                  </div>
                </form>
              </div>
            </div>

            {/* 🌟 4. ข้อมูลการเดินทาง (อยู่ล่างสุด) */}
            <div className="mb-8">
              <div className="mb-4">
                <h2 className="text-2xl font-black text-slate-800">ข้อมูลการเดินทาง</h2>
                <p className="text-sm text-slate-500 font-medium">หากคุณจำเป็นต้องให้เจ้าหน้าที่มาต้อนรับคุณที่สนามบินและ/หรือต้องเผื่อเวลาสำหรับการมาถึงล่าช้า โปรดระบุหมายเลขเที่ยวบินของคุณ</p>
              </div>
              
              <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-bold text-slate-800 mb-2 block">ข้อมูลเที่ยวบิน</label>
                    <input type="text" name="flightInfo" value={formData.flightInfo} onChange={handleInputChange} className="w-full px-4 py-3.5 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors shadow-sm" />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-800 mb-2 block">หมายเลขเที่ยวบิน</label>
                    <input type="text" name="flightNumber" value={formData.flightNumber} onChange={handleInputChange} className="w-full px-4 py-3.5 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors shadow-sm" />
                  </div>
                </div>
              </div>
            </div>

            {/* แก้ไขปุ่มท้ายสุดของ Step 4 */}
            <div className="mt-10 flex justify-end pb-10">
              <button 
                onClick={() => setStep(5)} 
                className="bg-blue-600 text-white font-bold py-4 px-14 rounded-2xl hover:bg-blue-700 hover:-translate-y-1 transition-all shadow-[0_8px_20px_rgba(37,99,235,0.3)] flex items-center gap-3 cursor-pointer text-lg"
              >
                ยืนยันเพื่อไปหน้าชำระเงิน <span>&rarr;</span>
              </button>
            </div>
            
          </div>
        )}

        {/* ================= STEP 5: PAYMENT METHOD ================= */}
        {step === 5 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            
            {/* Header: ย้อนกลับ & หัวข้อ */}
            <div className="mb-8">
              <button onClick={() => setStep(4)} className="text-blue-600 font-bold hover:bg-blue-50 px-4 py-2 rounded-xl transition-colors cursor-pointer inline-flex items-center gap-2 mb-4 -ml-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                ย้อนกลับไปแก้ไขข้อมูล
              </button>
              <h2 className="text-3xl font-black text-slate-800 mb-2">เลือกช่องทางการชำระเงิน</h2>
              <p className="text-sm text-slate-500 font-medium flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" /></svg>
                ทำรายการอย่างปลอดภัยด้วยระบบเข้ารหัสมาตรฐานสากล (SSL 256-bit)
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* ฝั่งซ้าย: แบบฟอร์มชำระเงิน (สัดส่วนใหญ่กว่า 7/12) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* ตัวเลือกช่องทาง (ปรับดีไซน์เป็นการ์ด) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  <div 
                    onClick={() => setPaymentMethod("creditCard")}
                    className={`relative flex flex-col p-5 rounded-[24px] border-2 transition-all cursor-pointer overflow-hidden ${paymentMethod === "creditCard" ? "border-blue-600 bg-blue-50/30 shadow-[0_8px_20px_rgba(37,99,235,0.08)]" : "border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm"}`}
                  >
                    {paymentMethod === "creditCard" && (
                      <div className="absolute top-4 right-4 bg-blue-600 text-white p-1 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" /></svg>
                      </div>
                    )}
                    
                    <span className={`text-lg font-black ${paymentMethod === "creditCard" ? "text-blue-700" : "text-slate-700"}`}>บัตรเครดิต / เดบิต</span>
                    <span className="text-xs text-slate-500 font-medium mt-1">Visa, Mastercard, JCB</span>
                  </div>

                  <div 
                    onClick={() => setPaymentMethod("promptPay")}
                    className={`relative flex flex-col p-5 rounded-[24px] border-2 transition-all cursor-pointer overflow-hidden ${paymentMethod === "promptPay" ? "border-blue-600 bg-blue-50/30 shadow-[0_8px_20px_rgba(37,99,235,0.08)]" : "border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm"}`}
                  >
                    {paymentMethod === "promptPay" && (
                      <div className="absolute top-4 right-4 bg-blue-600 text-white p-1 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" /></svg>
                      </div>
                    )}
                    
                    <span className={`text-lg font-black ${paymentMethod === "promptPay" ? "text-blue-700" : "text-slate-700"}`}>สแกน QR พร้อมเพย์</span>
                    <span className="text-xs text-slate-500 font-medium mt-1">ฟรีค่าธรรมเนียม อนุมัติทันที</span>
                  </div>
                </div>

                {/* ฟอร์มบัตรเครดิต */}
                {paymentMethod === "creditCard" && (
                  <div className="bg-white rounded-[28px] border border-slate-200 p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-300 shadow-sm">
                    <form className="space-y-6">
                      <div>
                        <label className="text-sm font-bold text-slate-800 mb-2 block">หมายเลขบัตรเครดิต</label>
                        <div className="relative">
                          <input type="text" placeholder="0000 0000 0000 0000" maxLength={19} className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono text-lg transition-colors" />
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" /></svg>
                          </div>
                          {/* โลโก้บัตรจำลอง (ขวา) */}
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1.5 opacity-60">
                            <div className="w-8 h-5 bg-blue-600 rounded-sm"></div>
                            <div className="w-8 h-5 bg-red-500 rounded-sm"></div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="text-sm font-bold text-slate-800 mb-2 block">วันหมดอายุ <span className="text-slate-400 font-normal">(MM/YY)</span></label>
                          <input type="text" placeholder="MM/YY" maxLength={5} className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-center font-mono text-lg transition-colors" />
                        </div>
                        <div>
                          <label className="text-sm font-bold text-slate-800 mb-2 block flex items-center gap-2">
                            รหัสหลังบัตร (CVV)
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-slate-400"><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>
                          </label>
                          <input type="text" placeholder="123" maxLength={3} className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-center font-mono text-lg transition-colors" />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-bold text-slate-800 mb-2 block">ชื่อบนบัตร</label>
                        <input type="text" placeholder="ระบุชื่อภาษาอังกฤษตามหน้าบัตร" className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 uppercase transition-colors" />
                      </div>
                    </form>
                  </div>
                )}

                {/* ฟอร์ม PromptPay (QR Code - ขยายรูปใหญ่ขึ้น) */}
                {paymentMethod === "promptPay" && (
                  <div className="bg-white rounded-[28px] border border-slate-200 p-8 md:p-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-300 shadow-sm flex flex-col items-center">
                    
                    {/* แถบ Thai QR */}
                    <div className="bg-[#113566] text-white flex items-center gap-2 py-2 px-8 rounded-full mb-8 shadow-md">
                      <span className="font-bold text-lg tracking-wider">Thai QR Payment</span>
                    </div>

                    {/* กล่อง QR Code ที่ใหญ่ขึ้นมาก */}
                    <div className="w-full max-w-[320px] aspect-square bg-white rounded-3xl border-8 border-slate-50 p-4 shadow-[0_10px_40px_rgba(0,0,0,0.06)] relative overflow-hidden flex items-center justify-center mb-8">
                      {/* ใช้ placeholder ขนาดใหญ่ */}
                      <Image src="https://placehold.co/600x600/ffffff/0f172a.png?text=Scan+QR+Code" alt="QR Code" fill className="object-cover p-2" />
                      
                      {/* ดีไซน์สี่เหลี่ยมมุมจอ (Scanner corners) */}
                      <div className="absolute top-4 left-4 w-10 h-10 border-t-4 border-l-4 border-blue-500 rounded-tl-xl"></div>
                      <div className="absolute top-4 right-4 w-10 h-10 border-t-4 border-r-4 border-blue-500 rounded-tr-xl"></div>
                      <div className="absolute bottom-4 left-4 w-10 h-10 border-b-4 border-l-4 border-blue-500 rounded-bl-xl"></div>
                      <div className="absolute bottom-4 right-4 w-10 h-10 border-b-4 border-r-4 border-blue-500 rounded-br-xl"></div>
                    </div>

                    <div className="bg-blue-50 px-6 py-4 rounded-2xl w-full max-w-[320px]">
                      <p className="text-slate-600 font-medium text-sm">ยอดชำระสุทธิ</p>
                      <p className="font-black text-blue-700 text-3xl mt-1">{grandTotal.toLocaleString()} <span className="text-lg">บาท</span></p>
                    </div>

                    <p className="text-sm font-bold text-slate-500 mt-6 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      โปรดสแกนและชำระเงินภายใน <span className="text-red-500 font-black">14:59</span> นาที
                    </p>
                  </div>
                )}
              </div>

              {/* ฝั่งขวา: สรุปยอดก่อนจ่าย (สัดส่วน 5/12) */}
              <div className="lg:col-span-5">
                <div className="bg-slate-900 text-white rounded-[32px] p-6 md:p-8 lg:p-10 sticky top-32 shadow-2xl relative overflow-hidden">
                  
                  {/* Decorative Circle Background */}
                  <div className="absolute -top-20 -right-20 w-64 h-64  rounded-full blur-3xl pointer-events-none"></div>

                  <h3 className="text-xl font-black mb-8 pb-4 border-b border-slate-700/50 relative z-10">สรุปการชำระเงิน</h3>
                  
                  <div className="space-y-5 mb-8 text-sm md:text-base text-slate-300 relative z-10 font-medium">
                    <div className="flex justify-between items-center">
                      <span>ค่าเช่ารถและบริการเสริม</span>
                      <span className="font-bold text-white">{(carPriceTotal + addonsTotal).toLocaleString()} ฿</span>
                    </div>
                    
                    {selectedPromo && (
                      <div className="flex justify-between items-center text-emerald-400">
                        <span>ส่วนลด ({selectedPromo.code})</span>
                        <span className="font-bold">-{discountAmount.toLocaleString()} ฿</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <span>ยอดก่อนภาษี</span>
                      <span className="font-bold text-white">{subTotal.toLocaleString()} ฿</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span>ภาษีมูลค่าเพิ่ม (7%)</span>
                      <span className="font-bold text-white">+{vatAmount.toLocaleString()} ฿</span>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-700/50 relative z-10">
                    <span className="block text-slate-400 text-sm font-bold mb-2">ยอดที่ต้องชำระสุทธิ</span>
                    <div className="flex items-end justify-between">
                      <div className="text-4xl lg:text-5xl font-black text-white">{grandTotal.toLocaleString()}</div>
                      <span className="text-xl font-bold text-blue-400 mb-1">THB</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => setStep(6)} 
                    className="relative z-10 w-full bg-blue-600 text-white font-black py-4 md:py-5 text-lg rounded-2xl hover:bg-blue-500 hover:-translate-y-1 transition-all mt-10 shadow-[0_10px_30px_rgba(37,99,235,0.4)] cursor-pointer"
                  >
                    ชำระเงินและยืนยันการจอง
                  </button>

                  <p className="text-xs text-slate-400 text-center mt-6 relative z-10 leading-relaxed">
                    โดยการคลิกปุ่มนี้ คุณยอมรับ <a href="#" className="text-blue-400 hover:underline">เงื่อนไขการให้บริการ</a> และ <a href="#" className="text-blue-400 hover:underline">นโยบายความเป็นส่วนตัว</a> ของเรา
                  </p>
                </div>
              </div>

            </div>
          </div>
        )}
        {/* ================= STEP 6: SUCCESS PAGE ================= */}
        {step === 6 && (
          <div className="animate-in zoom-in-95 duration-500 max-w-2xl mx-auto mt-4 pb-20">
            <div className="bg-white rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden relative">
              
              {/* Header สีเขียว */}
              <div className="bg-green-500 text-white text-center py-10 px-6 relative overflow-hidden">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto relative z-10 shadow-lg mb-4 text-green-500">
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                </div>
                <h2 className="text-3xl font-black relative z-10">การจองสำเร็จ!</h2>
                <p className="text-green-100 font-medium relative z-10 mt-2">
                  หมายเลขการจอง: TR-{(Math.random() * 1000000).toFixed(0)}
                </p>
              </div>

              {/* รายละเอียดบิล */}
              <div className="p-8 md:p-10 bg-white">
                <p className="text-center text-slate-500 font-medium mb-8">
                  เราได้ส่งรายละเอียดการจองและใบเสร็จรับเงินไปที่<br/>
                  {/* ดึงอีเมลจากฟอร์มที่ลูกค้าเพิ่งพิมพ์มาโชว์ */}
                  <span className="font-bold text-slate-800">{formData.email || "อีเมลของคุณ"}</span> แล้ว
                </p>

                {/* กล่องสรุปข้อมูลแบบใบเสร็จ (Receipt) */}
                <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50/50 space-y-4">
                  <h3 className="font-black text-slate-800 border-b border-slate-200 pb-3 mb-3">สรุปข้อมูลการจอง</h3>
                  
                  <div className="flex justify-between items-start">
                    <span className="text-slate-500 text-sm">ผู้จอง</span>
                    {/* ดึงชื่อและเบอร์จากฟอร์ม */}
                    <span className="font-bold text-slate-800 text-right">
                      {formData.name || "ไม่ระบุชื่อ"}<br/>
                      <span className="text-xs text-slate-500">{formData.phonePrefix} {formData.phone}</span>
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-start pt-2">
                    <span className="text-slate-500 text-sm">รถที่เช่า</span>
                    <span className="font-bold text-slate-800 text-right">
                      {carName}<br/>
                      <span className="text-xs text-slate-500">{days} วัน</span>
                    </span>
                  </div>

                  <div className="flex justify-between items-start pt-2">
                    <span className="text-slate-500 text-sm">สถานที่รับ-คืนรถ</span>
                    <span className="font-bold text-slate-800 text-right text-sm">
                      สนามบินดอนเมือง<br/>
                      <span className="text-xs text-slate-500">23 ก.พ. - 26 ก.พ. 2026</span>
                    </span>
                  </div>

                  <div className="flex justify-between items-end pt-4 border-t-2 border-dashed border-slate-200 mt-2">
                    <span className="text-slate-500 text-sm font-bold">ยอดชำระสุทธิ</span>
                    <span className="font-black text-blue-600 text-2xl">{grandTotal.toLocaleString()} ฿</span>
                  </div>
                </div>

                {/* ปุ่มกลับหน้าหลักและปุ่มปริ้น (เพิ่ม print:hidden เพื่อซ่อนปุ่มตอนปริ้นออกกระดาษ) */}
                <div className="mt-8 flex flex-col sm:flex-row gap-3 print:hidden">
                  <Link href="/" className="flex-1 flex items-center justify-center text-center py-4 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors cursor-pointer">
                    กลับหน้าหลัก
                  </Link>
                  <button 
                    onClick={() => window.print()} 
                    className="flex-1 flex items-center justify-center gap-2 text-center py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30 cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0v3.396c0 .605.32 1.164.84 1.455m9.66 0c.52-.291.84-.85.84-1.455V6.75" />
                    </svg>
                    พิมพ์ / บันทึกเป็น PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* 🌟 ================= PROMO CODE MODAL ================= 🌟 */}
      {isPromoModalOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsPromoModalOpen(false)}></div>
          <div className="fixed inset-x-0 bottom-0 md:top-1/2 md:-translate-y-1/2 md:bottom-auto z-50 mx-auto w-full max-w-[600px] bg-white md:rounded-[32px] rounded-t-[32px] shadow-2xl animate-in slide-in-from-bottom-full md:slide-in-from-bottom-8 md:zoom-in-95 duration-300 pb-safe">
            <div className="md:hidden w-full flex justify-center pt-4 pb-2 cursor-pointer" onClick={() => setIsPromoModalOpen(false)}>
              <div className="w-12 h-1.5 bg-slate-200 rounded-full"></div>
            </div>
            <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="font-black text-2xl text-slate-800">โค้ดส่วนลดของคุณ</h3>
                <p className="text-sm text-slate-500 font-medium mt-1">เลือกใช้คูปอง 1 ใบต่อการทำรายการ</p>
              </div>
              <button onClick={() => setIsPromoModalOpen(false)} className="text-slate-400 hover:text-slate-800 p-2 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6 md:p-8 space-y-4 max-h-[60vh] overflow-y-auto bg-slate-50/50">
              {PROMO_CODES.map((promo) => {
                const isSelected = selectedPromo?.code === promo.code;
                const canUse = (carPriceTotal + addonsTotal) >= promo.minSpend;
                return (
                  <div 
                    key={promo.code} 
                    className={`bg-white border-2 rounded-2xl overflow-hidden transition-all flex flex-col sm:flex-row ${!canUse ? 'border-slate-100 opacity-60 cursor-not-allowed' : isSelected ? 'border-blue-600 shadow-md shadow-blue-500/10' : 'border-slate-100 hover:border-blue-300 cursor-pointer shadow-sm hover:shadow-md'}`}
                    onClick={() => { if (canUse) { setSelectedPromo(promo); setIsPromoModalOpen(false); } }}
                  >
                    <div className="w-full sm:w-[140px] h-[100px] sm:h-auto bg-slate-100 relative shrink-0">
                      <Image src={promo.imageSrc} alt={promo.code} fill className="object-cover" />
                    </div>
                    <div className="flex-1 p-4 md:p-5 flex flex-col justify-center">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-black text-blue-600 text-xl">{promo.code}</h4>
                          <p className="text-sm font-bold text-slate-800 mt-0.5">{promo.title}</p>
                        </div>
                        <div className="shrink-0 text-right ml-4">
                          <span className="block text-xl font-black text-red-500">-{promo.discount}฿</span>
                        </div>
                      </div>
                      <div className="flex items-end justify-between mt-auto">
                        <p className="text-xs text-slate-500 font-medium">ขั้นต่ำ {promo.minSpend.toLocaleString()} ฿</p>
                        <div className="shrink-0">
                          {isSelected ? (
                            <div className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1">ใช้งานอยู่ <span className="text-[10px]">✔️</span></div>
                          ) : !canUse ? (
                            <div className="bg-slate-100 text-slate-400 text-xs font-bold px-4 py-2 rounded-xl">ยอดไม่ถึง</div>
                          ) : (
                            <div className="text-blue-600 bg-blue-50 text-xs font-bold px-4 py-2 rounded-xl border border-blue-100 hover:bg-blue-100 transition-colors">เลือกคูปอง</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            {selectedPromo && (
              <div className="p-6 border-t border-slate-100 bg-white text-center rounded-b-[32px]">
                <button onClick={() => { setSelectedPromo(null); setIsPromoModalOpen(false); }} className="text-slate-500 font-bold text-sm hover:text-red-500 hover:underline cursor-pointer transition-colors">
                  นำโค้ดส่วนลดออก
                </button>
              </div>
            )}
          </div>
        </>
      )}

    </div>
  );
}