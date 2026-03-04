"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Swal from 'sweetalert2';

export default function PromotionPage() {
  const [promotions, setPromotions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();
  const { data: session, status } = useSession();

  // 📌 ดึงข้อมูลจาก API
  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        setIsLoading(true);

        // 🌟 1. ทะลวง Cache ของเบราว์เซอร์
        const timestamp = new Date().getTime();
        const res = await fetch(`/api/promotions?t=${timestamp}`, {
          cache: 'no-store'
        });

        const result = await res.json();

        let allPromos = [];
        if (Array.isArray(result)) {
          allPromos = result;
        } else if (result.ok && result.data) {
          allPromos = result.data;
        }

        // 🌟 2. กรองเอาเฉพาะที่ 'active' และ 'ยังไม่หมดอายุ'
        const activePromos = allPromos.filter((promo: any) => {
          const isStatusActive = promo.proStatus?.toLowerCase() === 'active';
          const isNotExpired = new Date(promo.proEnd) >= new Date();
          return isStatusActive && isNotExpired;
        });

        // 🌟 3. เซ็ตค่าลง State ด้วย setPromotions (แก้ชื่อให้ตรงกับด้านบนแล้ว)
        setPromotions(activePromos);

      } catch (error) {
        console.error("Error fetching promotions:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPromotions();
  }, []);

  const formatMoney = (num: number) => Number(num).toLocaleString('th-TH');

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // 🌟 ฟังก์ชันจัดการตอนกดปุ่ม "ใช้สิทธิ์"
  const handleUsePromotion = (e: React.MouseEvent, proName: string) => {
    e.preventDefault();

    if (status === "unauthenticated" || !session) {
      Swal.fire({
        title: "กรุณาเข้าสู่ระบบ",
        text: "คุณต้องเข้าสู่ระบบก่อนเพื่อใช้สิทธิ์โปรโมชั่นนี้",
        icon: "warning",
        confirmButtonColor: "#2563eb",
        confirmButtonText: "ไปหน้าเข้าสู่ระบบ",
        showCancelButton: true,
        cancelButtonText: "ยกเลิก",
        customClass: { popup: 'rounded-3xl' }
      }).then((result) => {
        if (result.isConfirmed) {
          router.push('/login');
        }
      });
    } else {
      Swal.fire({
        title: 'เตรียมพร้อมออกเดินทาง!',
        text: `สิทธิ์ "${proName}" ของท่านพร้อมใช้งานแล้ว`,
        icon: 'success',
        showConfirmButton: false,
        timer: 2000,
        customClass: { popup: 'rounded-3xl' }
      }).then(() => {
        router.push('/cars');
      });
    }
  };

  if (isLoading) {
    return (
      <div className="bg-slate-50 min-h-screen pt-28 pb-20 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium mt-4">กำลังโหลดสิทธิพิเศษสำหรับคุณ...</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pt-24 pb-24 font-sans overflow-hidden">

      {/* ================= 1. HEADER SECTION ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 text-center">
        <h1 className="text-4xl md:text-5xl font-black text-blue-950 mb-4 tracking-tight drop-shadow-sm">
          สิทธิพิเศษ & โค้ดส่วนลด
        </h1>
        <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto font-medium">
          ยกระดับทุกการเดินทางของคุณให้คุ้มค่ายิ่งขึ้น ด้วยข้อเสนอสุดพิเศษจากเรา
        </p>
      </section>

      {/* ================= 2. PROMOTION LIST (ZIG-ZAG LAYOUT) ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">

        {promotions.map((promo, index) => {
          const isActive = promo.proStatus?.toLowerCase() === 'active';
          const isPercent = promo.proType === 'percent';

          // ข้อความเงื่อนไข
          const discountValueText = isPercent ? `${promo.proValue}%` : `฿${formatMoney(promo.proValue)}`;
          const minSpendText = promo.proMin > 0 ? `ขั้นต่ำ ฿${formatMoney(promo.proMin)}` : 'ไม่มีขั้นต่ำ';
          const maxDiscountText = (isPercent && promo.proMax > 0) ? `สูงสุด ฿${formatMoney(promo.proMax)}` : '';

          // สุ่มรูปภาพ (จำลอง)
          const defaultImages = [
            'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1672846727402-1fa8d338fbc9?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1550482782-5f60dc8a7a85?auto=format&fit=crop&w=1200&q=80'
          ];
          // 🌟 [แก้ไขตรงนี้] เช็คว่ามี proPic ไหม ถ้ามีใช้ proPic ถ้าไม่มีให้ใช้ defaultImages
          const displayImage = promo.proPic || defaultImages[index % defaultImages.length];

          // เช็คว่าเป็นแถวคู่หรือคี่ เพื่อสลับซ้ายขวา
          const isEven = index % 2 === 0;

          return (
            <div
              key={promo.proID}
              className={`flex flex-col gap-8 md:gap-12 items-center ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'
                } ${!isActive ? 'opacity-70 grayscale-[40%]' : ''}`}
            >

              {/* 🖼️ ฝั่งรูปภาพ (Banner) - 50% */}
              <div className="w-full lg:w-1/2 relative group">
                <div className="relative aspect-[4/3] w-full rounded-[2rem] overflow-hidden shadow-2xl shadow-blue-900/10">
                  <img
                    src={displayImage}
                    alt={promo.proName}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-950/60 to-transparent mix-blend-multiply"></div>

                  {/* ป้ายสถานะบนรูป */}
                  <div className="absolute top-6 right-6">
                    <span className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-lg backdrop-blur-md ${isActive ? 'bg-blue-600 text-white' : 'bg-slate-800/80 text-white'
                      }`}>
                      {isActive ? 'AVAILABLE NOW' : 'EXPIRED'}
                    </span>
                  </div>
                </div>

                {/* ลายจุดตกแต่ง (Dots Pattern) */}
                <div className={`absolute -z-10 w-full h-full bg-[radial-gradient(circle,_#cbd5e1_2px,_transparent_2px)] [background-size:24px_24px] ${isEven ? '-bottom-8 -right-8' : '-bottom-8 -left-8'}`}></div>
              </div>

              {/* 📝 ฝั่งเนื้อหา และ คูปอง (Content & Ticket) - 50% */}
              <div className="w-full lg:w-1/2 flex flex-col justify-center">

                {/* 1. ส่วนหัวข้อและคำอธิบาย */}
                <span className="text-blue-600 font-black tracking-widest uppercase text-sm mb-3">
                  Special Offer
                </span>
                <h2 className="text-3xl md:text-4xl font-black text-blue-950 leading-tight mb-4">
                  {promo.proName}
                </h2>
                <div className="w-16 h-1.5 bg-blue-500 mb-6 rounded-full"></div>
                <p className="text-lg text-slate-500 font-medium leading-relaxed mb-8">
                  {promo.proDetail}
                </p>

                {/* 2. กล่องคูปอง (E-commerce Style) สีน้ำเงิน */}
                <div className="relative flex w-full max-w-md h-[120px] bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 mb-4">
                  {/* รอยเจาะคูปอง */}
                  <div className="absolute -top-3 left-[25%] -translate-x-1/2 w-6 h-6 bg-slate-50 rounded-full border-b border-slate-100 z-10"></div>
                  <div className="absolute -bottom-3 left-[25%] -translate-x-1/2 w-6 h-6 bg-slate-50 rounded-full border-t border-slate-100 z-10"></div>

                  {/* ซ้าย: เปอร์เซ็นต์/ราคา (25%) */}
                  <div className="w-[25%] bg-gradient-to-b from-blue-600 to-blue-800 flex flex-col items-center justify-center p-2 rounded-l-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.2),_transparent_50%)]"></div>
                    <span className="text-3xl font-black text-white drop-shadow-md z-10">
                      {isPercent ? '%' : '฿'}
                    </span>
                    <span className="text-[10px] font-bold text-blue-100 tracking-widest mt-1 z-10 uppercase">
                      DISCOUNT
                    </span>
                  </div>

                  {/* ขวา: รายละเอียดคูปองและปุ่ม (75%) */}
                  <div className="w-[75%] p-4 flex flex-col justify-center rounded-r-xl border-l-2 border-dashed border-slate-200">
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <h4 className="text-xl font-black text-blue-950 leading-none">
                          ส่วนลด {discountValueText}
                        </h4>
                        <p className="text-xs text-slate-500 font-semibold mt-1.5">
                          {minSpendText} {maxDiscountText ? `• ${maxDiscountText}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-end justify-between mt-auto">
                      <div className="bg-blue-50 px-2.5 py-1 rounded text-xs font-bold text-blue-700 tracking-wider font-mono">
                        {promo.proCode}
                      </div>

                      {isActive ? (
                        <button
                          onClick={(e) => handleUsePromotion(e, promo.proName)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-bold text-sm shadow-[0_4px_12px_rgba(37,99,235,0.3)] transition-transform active:scale-95 flex items-center gap-1 cursor-pointer"
                        >
                          ใช้สิทธิ์
                        </button>
                      ) : (
                        <button disabled className="bg-slate-200 text-slate-400 px-5 py-2 rounded-lg font-bold text-sm cursor-not-allowed">
                          หมดเขต
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* วันหมดอายุ */}
                <p className="text-sm text-slate-400 font-medium flex items-center gap-2 ml-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  ใช้สิทธิ์ได้ถึงวันที่ {formatDate(promo.proEnd)}
                </p>

              </div>
            </div>
          );
        })}

        {/* กรณีไม่มีโปรโมชั่น */}
        {promotions.length === 0 && (
          <div className="text-center py-24 bg-white rounded-[2rem] border border-slate-200 shadow-sm">
            <svg className="w-20 h-20 text-slate-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
            </svg>
            <p className="text-slate-500 text-lg font-medium">ยังไม่มีสิทธิพิเศษในขณะนี้ รอติดตามเร็วๆ นี้นะครับ</p>
          </div>
        )}
      </section>

    </div>
  );
}