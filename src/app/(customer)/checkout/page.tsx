"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

// ==========================================
// 1. กำหนด Interface ตามโครงสร้าง Database
// ==========================================
interface CarDB {
  carID: number;
  carBrand: string;
  carType: string;
  carSeat: number;
  carGear: string;
  carPower: string;
  carDetail: string;
  carPrice: number;
  carPicture: string;
  carProvince: string;
}

interface AddonDB {
  addonID: number;
  addonName: string;
  addonDetail: string;
  addonPrice: number;
  addonQuantity: number;
}

interface PromoDB {
  proID: number;
  proName: string;
  proCode: string;
  proType: 'percent' | 'amount';
  proValue: number;
  proMin: number;
  proMax: number;
}

// ==========================================
// 2. Component หลัก (ต้องครอบ Suspense ป้องกัน Error)
// ==========================================
function CheckoutContent() {
  const searchParams = useSearchParams();
  
  // ดึงค่าสถานที่และวันที่จาก URL (ที่ส่งมาจากหน้าจองรถ)
  const carIdParam = searchParams.get("carId");
  const pickupLocation = searchParams.get("pickup") || "ไม่ระบุ";
  const dropoffLocation = searchParams.get("dropoff") || "ไม่ระบุ";
  const startDateStr = searchParams.get("start") || "";
  const endDateStr = searchParams.get("end") || "";

  // State สำหรับ UI และฟอร์ม
  const [step, setStep] = useState(3);
  const [loading, setLoading] = useState(true);
  
  // State สำหรับเก็บข้อมูลจาก API
  const [car, setCar] = useState<CarDB | null>(null);
  const [addonsData, setAddonsData] = useState<AddonDB[]>([]);
  const [promosData, setPromosData] = useState<PromoDB[]>([]);

  const [addonCounts, setAddonCounts] = useState<Record<number, number>>({});
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [selectedPromo, setSelectedPromo] = useState<PromoDB | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("creditCard");

  const [formData, setFormData] = useState({
    email: "", name: "", phonePrefix: "+66", phone: "", 
    driverLicense: "", passport: "", needTaxInvoice: false, 
    flightInfo: "", flightNumber: ""
  });

  // ==========================================
  // 3. ดึงข้อมูลจาก API เมื่อหน้าเว็บโหลด
  // ==========================================
  useEffect(() => {
    const fetchData = async () => {
      if (!carIdParam) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        // ดึงข้อมูลรถ
        const carRes = await fetch(`/api/cars/${carIdParam}`);
        const carJson = await carRes.json();
        if (carJson.ok) setCar(carJson.data);

        // ดึงอุปกรณ์เสริม
        const addonRes = await fetch('/api/addons');
        const addonJson = await addonRes.json();
        setAddonsData(addonJson);

        // ดึงโปรโมชั่น
        const promoRes = await fetch('/api/promotions');
        const promoJson = await promoRes.json();
        setPromosData(promoJson);

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [carIdParam]);

  // ==========================================
  // 4. คำนวณวันและราคา (Real-time)
  // ==========================================
  const days = useMemo(() => {
    if (!startDateStr || !endDateStr) return 1;
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1; // อย่างน้อย 1 วัน
  }, [startDateStr, endDateStr]);

  const carPriceTotal = (car?.carPrice || 0) * days;

  const addonsTotal = Object.entries(addonCounts).reduce((total, [id, count]) => {
    const addon = addonsData.find(a => a.addonID === Number(id));
    return total + (addon ? addon.addonPrice * count * days : 0);
  }, 0);

  const subTotalBeforeDiscount = carPriceTotal + addonsTotal;

  // คำนวณส่วนลด (รองรับทั้งบาทและเปอร์เซ็นต์)
  const discountAmount = useMemo(() => {
    if (!selectedPromo) return 0;
    if (selectedPromo.proType === 'percent') {
      const discount = (subTotalBeforeDiscount * selectedPromo.proValue) / 100;
      // เช็คว่าลดเกิน proMax (ลดสูงสุด) หรือไม่
      return selectedPromo.proMax && discount > selectedPromo.proMax ? selectedPromo.proMax : discount;
    }
    return selectedPromo.proValue;
  }, [selectedPromo, subTotalBeforeDiscount]);

  const subTotal = subTotalBeforeDiscount - discountAmount;
  const vatAmount = Math.round(subTotal * 0.07);
  const grandTotal = subTotal + vatAmount;

  // ฟังก์ชันต่างๆ
  const updateAddonCount = (id: number, delta: number, max: number) => {
    setAddonCounts(prev => {
      const current = prev[id] || 0;
      const next = current + delta;
      if (next < 0 || next > max) return prev;
      return { ...prev, [id]: next };
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc]">
        <div className="animate-spin w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full mb-4"></div>
        <p className="text-slate-500 font-medium">กำลังเตรียมข้อมูลการจอง...</p>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] text-center">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">ไม่พบข้อมูลรถ</h1>
        <p className="text-slate-500 mb-6">รถคันนี้อาจไม่มีอยู่ในระบบ หรือ URL ไม่ถูกต้อง</p>
        <Link href="/cars" className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold">กลับไปเลือกรถใหม่</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] pt-10 pb-24 font-sans text-slate-800 relative">
      
      {/* ================= TOP STEPPER ================= */}
      {step < 6 && (
        <div className="bg-white border-b border-slate-200 top-0 z-30 shadow-sm hidden md:block">
          <div className="max-w-[1200px] mx-auto px-4 flex items-center justify-between gap-4 py-4">
            
            <div className="flex items-center gap-3 flex-1 bg-white p-3 rounded-2xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(37,99,235,0.08)]">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg shrink-0">1</div>
              <div className="text-xs truncate flex-1">
                <div className="flex gap-4">
                  <div>
                    <span className="text-slate-400 block mb-0.5 font-medium">รับรถ</span>
                    <p className="font-bold text-slate-700 truncate text-sm">{pickupLocation}</p>
                    <span className="text-slate-500">{startDateStr || "-"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5 font-medium">คืนรถ</span>
                    <p className="font-bold text-slate-700 truncate text-sm">{dropoffLocation}</p>
                    <span className="text-slate-500">{endDateStr || "-"}</span>
                  </div>
                </div>
              </div>
              <Link href="/cars" className="ml-auto text-blue-600 p-2 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32l8.4-8.4z" /></svg>
              </Link>
            </div>

            <div className="flex items-center gap-3 flex-1 bg-white p-3 rounded-2xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(37,99,235,0.08)]">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg shrink-0">2</div>
              <div className="text-xs truncate flex-1">
                <span className="text-slate-400 block mb-0.5 font-medium">รถ</span>
                <p className="font-bold text-slate-700 text-sm truncate">{car.carBrand}</p>
                <span className="text-slate-500 font-medium">{carPriceTotal.toLocaleString()} บาท</span>
              </div>
              <button onClick={() => window.history.back()} className="ml-auto text-blue-600 p-2 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32l8.4-8.4z" /></svg>
              </button>
            </div>

            <div className={`flex items-center gap-3 flex-1 p-3 rounded-2xl transition-all shadow-[0_2px_15px_-3px_rgba(37,99,235,0.08)] ${step === 3 ? 'bg-blue-600 text-white border-transparent' : 'bg-white border border-slate-100 text-slate-700'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shrink-0 ${step === 3 ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'}`}>3</div>
              <div className="font-bold text-sm cursor-pointer" onClick={() => setStep(3)}>ประกันและอุปกรณ์เสริม</div>
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
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                </button>
              ) : (
                <Link href="/" className="text-blue-600 font-bold hover:bg-blue-100 bg-blue-50 p-3 rounded-xl transition-colors cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
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
              {addonsData.map((addon) => (
                <div key={addon.addonID} className="bg-white border border-slate-200 rounded-[28px] overflow-hidden hover:border-blue-400 hover:shadow-[0_8px_30px_rgb(37,99,235,0.12)] transition-all relative flex flex-col group">
                  <div className="w-full h-[220px] relative bg-slate-100 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent z-10"></div>
                    <h3 className="absolute bottom-4 left-5 z-20 font-black text-white text-2xl drop-shadow-md">{addon.addonName}</h3>
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    <p className="text-sm text-slate-500 leading-relaxed mb-8 flex-1">{addon.addonDetail}</p>
                    <div className="flex items-end justify-between mt-auto pt-4 border-t border-slate-100">
                      <div>
                        <div className="font-black text-blue-600 text-2xl">
                          {addon.addonPrice} THB <span className="text-sm font-bold text-slate-500">/ ชิ้น / วัน</span>
                        </div>
                      </div>
                      <div className="flex items-center bg-slate-50 rounded-2xl p-1.5 border border-slate-200 shadow-inner">
                        <button onClick={() => updateAddonCount(addon.addonID, -1, addon.addonQuantity)} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-white hover:shadow-sm rounded-xl transition-all font-bold text-lg cursor-pointer">−</button>
                        <span className="font-black text-slate-800 text-lg w-12 text-center">{addonCounts[addon.addonID] || 0}</span>
                        <button onClick={() => updateAddonCount(addon.addonID, 1, addon.addonQuantity)} className="w-10 h-10 flex items-center justify-center text-blue-600 hover:bg-white hover:shadow-sm rounded-xl transition-all font-bold text-xl cursor-pointer">+</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* กรณีไม่มี Addon โชว์ในระบบ */}
              {addonsData.length === 0 && (
                 <div className="col-span-1 md:col-span-2 text-center py-10 bg-white rounded-3xl border border-slate-200">
                    <p className="text-slate-500 font-bold">ไม่มีอุปกรณ์เสริมให้เลือกในขณะนี้</p>
                 </div>
              )}
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
            
            <div className="mb-6">
              <h2 className="text-2xl font-black text-slate-800 mb-2">ตรวจสอบการจองของคุณ</h2>
              <p className="text-sm text-slate-500 font-medium">ตรวจสอบการจองของคุณและชำระเงินและยืนยันตัวตนให้เสร็จสิ้นภายใน 8 นาที มิฉะนั้นเซสชันการจองนี้อาจหมดอายุ</p>
            </div>

            {/* 🌟 1. สรุปรถที่เลือก */}
            <div className="bg-white rounded-3xl border border-slate-200 mb-6 overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-white">
                <h3 className="font-black text-lg text-slate-800">รถที่เลือก</h3>
                <span className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  ยอดรวม : {grandTotal.toLocaleString()} บาท 
                </span>
              </div>

              <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-8">
                <div className="md:col-span-4 relative">
                  <div className="w-full aspect-[4/3] relative rounded-xl overflow-hidden bg-slate-50">
                     <Image src={car.carPicture || "/images/car-placeholder.jpg"} alt={car.carBrand} fill className="object-cover" />
                  </div>
                </div>

                <div className="md:col-span-8 flex flex-col">
                  <h2 className="text-xl font-black text-slate-800 mb-3">{car.carBrand} <span className="text-sm font-normal text-slate-500">({car.carType})</span></h2>
                  
                  <div className="flex flex-wrap gap-4 text-slate-600 text-sm font-bold mb-4">
                    <span className="flex items-center gap-1.5"><span className="text-lg">👥</span> {car.carSeat}</span>
                    <span className="flex items-center gap-1.5"><span className="text-lg">⚙️</span> {car.carGear}</span>
                    <span className="flex items-center gap-1.5"><span className="text-lg">⚡</span> {car.carPower}</span>
                  </div>

                  <div className="space-y-2 text-sm text-slate-700 flex-1 border-t border-slate-100 pt-4">
                    <div className="flex justify-between items-center">
                      <span>อัตราค่าบริการ (สำหรับ {days} วัน)</span>
                      <div className="text-right">
                        <span className="font-bold block">{carPriceTotal.toLocaleString()} บาท</span>
                        <span className="text-xs text-slate-400 font-medium">{car.carPrice.toLocaleString()} บาท / วัน</span>
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
                        <span className="font-bold text-right">{pickupLocation}, {startDateStr || "-"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">คืนรถ</span>
                        <span className="font-bold text-right">{dropoffLocation}, {endDateStr || "-"}</span>
                      </div>
                    </div>

                    <div className="pt-4 mt-6 border-t-2 border-dashed border-slate-200 space-y-3">
                      {selectedPromo && (
                        <div className="flex justify-between items-center text-red-500">
                          <span className="font-bold">ส่วนลดโปรโมชั่น ({selectedPromo.proCode})</span>
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

            {/* 🌟 2. Promo Code Section */}
            <div className="bg-white rounded-3xl border border-slate-200 mb-8 overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-white">
                <h3 className="font-black text-lg text-slate-800">โค้ดโปรโมชั่น</h3>
                <span className="font-bold text-slate-600 text-sm">
                  ส่วนลด : {discountAmount.toLocaleString()} บาท 
                </span>
              </div>
              <div className="p-6 bg-slate-50/50 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex-1 w-full">
                  {selectedPromo ? (
                    <div className="flex items-center justify-between bg-blue-50 border border-blue-100 p-3 rounded-xl w-full max-w-sm">
                      <div className="flex items-center gap-3">
                        <span className="text-blue-600 text-xl">🎫</span>
                        <span className="text-blue-700 font-bold text-sm">{selectedPromo.proName}</span>
                      </div>
                      <button onClick={() => setSelectedPromo(null)} className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center font-bold text-xs hover:bg-red-600">✕</button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 text-slate-500 text-sm font-medium">
                      <span className="text-blue-600 text-xl">ℹ️</span> กรุณาเลือกโค้ดโปรโมชั่น
                    </div>
                  )}
                </div>
                <button onClick={() => setIsPromoModalOpen(true)} className="w-full md:w-auto bg-black text-white font-bold py-3 px-10 rounded-xl hover:-translate-y-1 shadow-md">
                  + เลือกโค้ด
                </button>
              </div>
            </div>

            {/* 🌟 3. ข้อมูลของคุณ */}
            <div className="mb-8">
              <h2 className="text-2xl font-black text-slate-800 mb-4">ข้อมูลของคุณ</h2>
              <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8">
                <form className="space-y-6">
                  <div>
                    <label className="text-sm font-bold text-slate-800 mb-2 block">อีเมล <span className="text-red-500">*</span></label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className="w-full px-4 py-3.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-bold text-slate-800 mb-2 block">ชื่อ <span className="text-red-500">*</span></label>
                      <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="w-full px-4 py-3.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-800 mb-2 block">โทรศัพท์ <span className="text-red-500">*</span></label>
                      <div className="flex">
                        <select name="phonePrefix" value={formData.phonePrefix} onChange={handleInputChange} className="px-3 bg-slate-50 border border-slate-300 border-r-0 rounded-l-xl">
                          <option value="+66">+</option>
                        </select>
                        <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required className="w-full px-4 py-3.5 bg-white border border-slate-300 rounded-r-xl" />
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            <div className="mt-10 flex justify-end pb-10">
              <button onClick={() => setStep(5)} className="bg-blue-600 text-white font-bold py-4 px-14 rounded-2xl hover:bg-blue-700 transition-all shadow-[0_8px_20px_rgba(37,99,235,0.3)]">
                ยืนยันเพื่อไปหน้าชำระเงิน &rarr;
              </button>
            </div>
            
          </div>
        )}

        {/* ================= STEP 5: PAYMENT METHOD ================= */}
        {step === 5 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="mb-8">
              <button onClick={() => setStep(4)} className="text-blue-600 font-bold hover:bg-blue-50 px-4 py-2 rounded-xl mb-4 -ml-4 flex items-center gap-2">
                &larr; ย้อนกลับไปแก้ไขข้อมูล
              </button>
              <h2 className="text-3xl font-black text-slate-800 mb-2">เลือกช่องทางการชำระเงิน</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7 space-y-6">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  <div onClick={() => setPaymentMethod("creditCard")} className={`p-5 rounded-[24px] border-2 cursor-pointer ${paymentMethod === "creditCard" ? "border-blue-600 bg-blue-50/30" : "border-slate-200 bg-white"}`}>
                    <span className={`text-lg font-black ${paymentMethod === "creditCard" ? "text-blue-700" : "text-slate-700"}`}>บัตรเครดิต / เดบิต</span>
                  </div>
                  <div onClick={() => setPaymentMethod("promptPay")} className={`p-5 rounded-[24px] border-2 cursor-pointer ${paymentMethod === "promptPay" ? "border-blue-600 bg-blue-50/30" : "border-slate-200 bg-white"}`}>
                    <span className={`text-lg font-black ${paymentMethod === "promptPay" ? "text-blue-700" : "text-slate-700"}`}>สแกน QR พร้อมเพย์</span>
                  </div>
                </div>

                {paymentMethod === "creditCard" && (
                  <div className="bg-white rounded-[28px] border border-slate-200 p-6 md:p-8">
                    <p className="text-center text-slate-500 font-bold py-10">(จำลองแบบฟอร์มบัตรเครดิต)</p>
                  </div>
                )}

                {paymentMethod === "promptPay" && (
                  <div className="bg-white rounded-[28px] border border-slate-200 p-8 md:p-12 text-center flex flex-col items-center">
                    <div className="bg-[#113566] text-white py-2 px-8 rounded-full mb-8 font-bold">Thai QR Payment</div>
                    <div className="w-full max-w-[320px] aspect-square bg-slate-100 rounded-3xl border-8 border-slate-50 flex items-center justify-center mb-8">
                      <span className="font-bold text-slate-400">QR Code จำลอง</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="lg:col-span-5">
                <div className="bg-slate-900 text-white rounded-[32px] p-6 md:p-8 sticky top-32">
                  <h3 className="text-xl font-black mb-6 border-b border-slate-700/50 pb-4">สรุปการชำระเงิน</h3>
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between"><span>ค่าเช่ารถและบริการเสริม</span><span className="font-bold">{(carPriceTotal + addonsTotal).toLocaleString()} ฿</span></div>
                    {selectedPromo && <div className="flex justify-between text-emerald-400"><span>ส่วนลด</span><span className="font-bold">-{discountAmount.toLocaleString()} ฿</span></div>}
                    <div className="flex justify-between"><span>ภาษี (7%)</span><span className="font-bold">+{vatAmount.toLocaleString()} ฿</span></div>
                  </div>
                  <div className="pt-6 border-t border-slate-700/50">
                    <span className="block text-slate-400 text-sm">ยอดชำระสุทธิ</span>
                    <div className="text-4xl font-black text-white">{grandTotal.toLocaleString()} ฿</div>
                  </div>
                  <button onClick={() => setStep(6)} className="w-full bg-blue-600 py-4 text-lg rounded-2xl font-black mt-8 hover:bg-blue-500">
                    ชำระเงินและยืนยันการจอง
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 6: SUCCESS ================= */}
        {step === 6 && (
          <div className="animate-in zoom-in-95 duration-500 max-w-2xl mx-auto mt-4 pb-20">
            <div className="bg-white rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden text-center py-12 px-6">
              <h2 className="text-4xl font-black text-green-500 mb-4">การจองสำเร็จ!</h2>
              <p className="text-slate-500 mb-8">ใบเสร็จได้ถูกส่งไปที่อีเมล {formData.email || "ของคุณ"} แล้ว</p>
              <Link href="/cars" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold">กลับไปหน้าเลือกรถ</Link>
            </div>
          </div>
        )}
      </div>

      {/* ================= PROMO MODAL ================= */}
      {isPromoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="bg-white w-full max-w-[600px] rounded-[32px] overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-black text-2xl text-slate-800">โค้ดส่วนลดของคุณ</h3>
              <button onClick={() => setIsPromoModalOpen(false)} className="text-slate-400 text-2xl">✕</button>
            </div>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto bg-slate-50">
              {promosData.map((promo) => {
                const isSelected = selectedPromo?.proID === promo.proID;
                const canUse = (carPriceTotal + addonsTotal) >= promo.proMin;
                return (
                  <div key={promo.proID} onClick={() => { if (canUse) { setSelectedPromo(promo); setIsPromoModalOpen(false); } }} 
                       className={`bg-white border-2 rounded-2xl p-5 flex justify-between items-center cursor-pointer transition-all ${!canUse ? 'opacity-50' : isSelected ? 'border-blue-600 shadow-md' : 'border-slate-200 hover:border-blue-300'}`}>
                    <div>
                      <h4 className="font-black text-blue-600 text-xl">{promo.proCode}</h4>
                      <p className="text-sm font-bold text-slate-800 mt-1">{promo.proName}</p>
                      <p className="text-xs text-slate-500 mt-1">ขั้นต่ำ {promo.proMin.toLocaleString()} ฿</p>
                    </div>
                    <div className="text-right">
                      <span className="block text-xl font-black text-red-500">-{promo.proType === 'amount' ? `${promo.proValue} ฿` : `${promo.proValue}%`}</span>
                    </div>
                  </div>
                )
              })}
              {promosData.length === 0 && <p className="text-center text-slate-500 font-bold py-10">ไม่มีโค้ดส่วนลดในขณะนี้</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 🌟 สร้าง Component หลักสำหรับ Export ครอบ Suspense ป้องกัน Error
export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}