"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation"; // 🌟 เพิ่ม useSearchParams
import { useSession, getSession } from "next-auth/react";
import Swal from "sweetalert2";

export default function BookingClient({ car }: { car: any }) {
  const router = useRouter();
  const searchParams = useSearchParams(); // 🌟 ดึงค่าจาก URL
  const { status } = useSession();

  // 🌟 ตั้งค่าเริ่มต้น โดยดึงมาจาก URL พารามิเตอร์ (ถ้ามี)
  const [startDate, setStartDate] = useState(searchParams.get("start") || "");
  const [endDate, setEndDate] = useState(searchParams.get("end") || "");

  const [bookingError, setBookingError] = useState("");

  const handleBooking = () => {
    // 1. เช็คว่าล็อกอินหรือยัง
    if (status !== "authenticated") {
      Swal.fire({
        title: "กรุณาเข้าสู่ระบบ",
        text: "กรุณาเข้าสู่ระบบ (Login) ก่อนทำการจองรถครับ",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#2563eb", // สีปุ่มยืนยัน
        cancelButtonColor: "#6b7280", // สีปุ่มยกเลิก
        confirmButtonText: "ไปหน้าเข้าสู่ระบบ",
        cancelButtonText: "ยกเลิก",
        customClass: { popup: 'rounded-2xl' } // ขอบมนสวยงาม
      }).then((result) => {
        if (result.isConfirmed) {
          router.push('/login'); // พาไปหน้า Login เมื่อกดตกลง
        }
      });
      return; // 🛑 หยุดการทำงานตรงนี้ ไม่ให้โค้ดส่วนอื่นด้านล่างรันต่อ
    }

    // 2. เช็คว่าเลือกวันที่ครบไหม
    if (!startDate || !endDate) {
      setBookingError("กรุณาระบุ 'วันที่รับรถ' และ 'วันที่คืนรถ' ให้ครบถ้วนก่อนทำการจองครับ");
      return;
    }

    // 3. เช็คว่าวันคืนรถ ต้องไม่น้อยกว่าวันรับรถ และต้องเช่าอย่างน้อย 1 วัน
    const startObj = new Date(startDate);
    const endObj = new Date(endDate);
    const now = new Date();

    if (startObj < now) {
      setBookingError("ไม่สามารถจองรถย้อนหลังได้ครับ");
      return;
    }

    if (startObj >= endObj) {
      setBookingError("ระบุวันที่ไม่ถูกต้อง! วันและเวลาคืนรถต้องมากกว่าวันรับรถครับ");
      return;
    }

    const diffTime = endObj.getTime() - startObj.getTime();
    if (diffTime < 24 * 60 * 60 * 1000) {
      setBookingError("ต้องเช่ารถขั้นต่ำ 1 วัน (24 ชั่วโมง) ครับ");
      return;
    }

    // ผ่านทุกเงื่อนไข -> ส่งไปหน้า Checkout (แนบสถานที่ของรถคันนี้ไปด้วย)
    const location = car.carProvince;
    router.push(`/checkout?carId=${car.carID}&pickup=${location}&dropoff=${location}&start=${startDate}&end=${endDate}`);
  };

  return (
    <>
      {/* 🌟 แจ้งเตือนแบบ Modal (Pop-up) */}
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

      {/* 🌟 การ์ดราคาและการจองฝั่งขวา */}
      <div className="lg:sticky lg:top-28 z-40">
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl shadow-blue-900/5 border border-blue-100">
          <h1 className="text-3xl font-extrabold text-blue-950 mb-2">{car.carBrand}</h1>
          <p className="text-blue-600 font-bold uppercase tracking-wider text-sm mb-6">{car.carType} Class</p>

          <div className="flex items-end gap-2 mb-6 pb-6 border-b border-slate-100">
            <span className="text-4xl font-extrabold text-blue-950">฿{car.carPrice.toLocaleString()}</span>
            <span className="text-slate-500 font-medium mb-1">/ วัน</span>
          </div>

          <div className="space-y-4 mb-8">
            {/* สถานที่รับรถ (ล็อคค่าจาก DB เลย) */}
            <div>
              <label className="block text-xs text-blue-900 font-bold mb-1 uppercase tracking-wider">รับและคืนรถที่</label>
              <div className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold text-slate-500 cursor-not-allowed">
                {car.carProvince}
              </div>
            </div>

            <div>
              <label className="block text-xs text-blue-900 font-bold mb-1 uppercase tracking-wider">วัน-เวลารับรถ</label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={`w-full p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium ${bookingError.includes('วันที่') && !startDate ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
              />
            </div>
            <div>
              <label className="block text-xs text-blue-900 font-bold mb-1 uppercase tracking-wider">วัน-เวลาคืนรถ</label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={`w-full p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium ${bookingError.includes('วันที่') && !endDate ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
              />
            </div>
          </div>

          <button
            onClick={handleBooking}
            className="block w-full text-center bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 cursor-pointer"
          >
            ดำเนินการจองรถ
          </button>
        </div>
      </div>
    </>
  );
}