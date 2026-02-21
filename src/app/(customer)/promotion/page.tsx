"use client";

import { useState } from 'react';
import Link from 'next/link';

// 1. ข้อมูลโปรโมชั่น (รวมทั้งหมดไว้ที่เดียว)
const promotions = [
  {
    id: 1,
    tag: 'NEW MEMBER',
    title: 'ต้อนรับสมาชิกใหม่ ลดทันที 20%',
    desc: 'เริ่มต้นการเดินทางสุดพรีเมียมไปกับเรา สมัครสมาชิกวันนี้รับส่วนลด 20% สำหรับการเช่ารถครั้งแรก ไม่มีขั้นต่ำ พร้อมสิทธิพิเศษอัปเกรดรุ่นรถฟรี (ขึ้นอยู่กับรถที่ว่างในวันเดินทาง)',
    code: 'NEWBIE20',
    valid: '31 ธ.ค. 2026',
    img: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1600&q=80'
  },
  {
    id: 2,
    tag: 'WEEKEND',
    title: 'Weekend Getaway เช่า 3 จ่าย 2',
    desc: 'หลีกหนีความวุ่นวายในเมืองหลวงไปพักผ่อนช่วงสุดสัปดาห์ เช่ารถวันศุกร์ถึงอาทิตย์ (3 วัน) จ่ายในราคาเพียง 2 วันเท่านั้น คุ้มค่าที่สุดสำหรับทริปสั้นๆ ของคุณและคนรู้ใจ',
    code: 'FREEWKND',
    valid: '30 มิ.ย. 2026',
    img: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1600&q=80'
  },
  {
    id: 3,
    tag: 'ECO & EV',
    title: 'รักษ์โลกไปกับ EV ลดเพิ่ม 15%',
    desc: 'ร่วมเป็นส่วนหนึ่งในการสร้างโลกสีเขียว เมื่อเลือกเช่ารถยนต์พลังงานไฟฟ้า (EV) 100% ทุกรุ่น รับส่วนลดทันที 15% พร้อมรับสิทธิ์ชาร์จไฟฟ้าฟรีที่สถานีพันธมิตรทั่วประเทศ',
    code: 'ECODRIVE15',
    valid: '31 ธ.ค. 2026',
    img: 'https://images.unsplash.com/photo-1672846727402-1fa8d338fbc9?auto=format&fit=crop&w=1600&q=80'
  },
  {
    id: 4,
    tag: 'LONG TERM',
    title: 'เช่ารายเดือน ลดสูงสุด 40%',
    desc: 'ทางเลือกที่คุ้มกว่าการซื้อรถ! บริการเช่ารถรายเดือนที่ช่วยคุณประหยัดกว่าการเช่ารายวันถึง 40% ไม่มีข้อผูกมัดระยะยาว ฟรีค่าบำรุงรักษา พร้อมบริการรถทดแทนถึงที่',
    code: 'MONTHLY40',
    valid: 'ไม่มีวันหมดอายุ',
    img: 'https://images.unsplash.com/photo-1550482782-5f60dc8a7a85?auto=format&fit=crop&w=1600&q=80'
  }
];

export default function PromotionPage() {
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleCopyCode = (id: number, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-white min-h-screen pt-28 font-sans text-blue-950">
      
      {/* 1. Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold text-blue-950 mb-6 tracking-tight">
          สิทธิพิเศษสำหรับคุณ 
        </h1>
        <p className="text-xl text-slate-500 max-w-3xl mx-auto font-light leading-relaxed">
          ยกระดับทุกการเดินทางของคุณให้คุ้มค่ามากยิ่งขึ้น ด้วยข้อเสนอสุดพิเศษที่ออกแบบมาเพื่อตอบโจทย์ทุกไลฟ์สไตล์จาก PhumJaiRent
        </p>
      </section>

      {/* 2. Full-Width Sections (เลื่อนดูยาวๆ หน้าเดียวจบ) */}
      <div>
        {promotions.map((promo, index) => (
          <section 
            key={promo.id} 
            // สลับสีพื้นหลัง ขาว สลับ เทาอ่อน
            className={`py-24 md:py-32 ${index % 2 === 1 ? 'bg-slate-50' : 'bg-white'}`}
          >
            <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-16 items-center ${
              // สลับตำแหน่ง ซ้าย-ขวา
              index % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'
            }`}>
              
              {/* ฝั่งรูปภาพ */}
              <div className="w-full lg:w-1/2 relative group">
                <div className="aspect-[4/3] w-full rounded-[2rem] overflow-hidden shadow-2xl relative">
                  <img 
                    src={promo.img} 
                    alt={promo.title} 
                    className="w-full h-full object-cover transform group-hover:scale-105 transition duration-1000"
                  />
                  <div className="absolute inset-0 bg-blue-900/10 mix-blend-multiply"></div>
                </div>
                <div className={`absolute -z-10 w-full h-full bg-[radial-gradient(circle,_#cbd5e1_2px,_transparent_2px)] [background-size:24px_24px] ${index % 2 === 1 ? '-top-10 -right-10' : '-top-10 -left-10'}`}></div>
              </div>

              {/* ฝั่งเนื้อหา */}
              <div className="w-full lg:w-1/2 flex flex-col justify-center">
                <span className="text-amber-500 font-extrabold tracking-widest uppercase text-sm mb-4">
                  {promo.tag}
                </span>
                <h2 className="text-4xl lg:text-5xl font-extrabold text-blue-950 leading-tight mb-6">
                  {promo.title}
                </h2>
                <div className="w-20 h-1.5 bg-blue-600 mb-8 rounded-full"></div>
                
                <p className="text-lg text-slate-500 font-light leading-relaxed mb-10">
                  {promo.desc}
                </p>

                {/* กล่อง Copy Code */}
                <div className="bg-white border-2 border-blue-50 rounded-2xl p-6 shadow-xl shadow-blue-900/5 flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
                  <div className="text-center sm:text-left">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-2">รหัสส่วนลด</p>
                    <p className="text-3xl font-extrabold text-blue-950 tracking-wider font-mono">{promo.code}</p>
                  </div>
                  
                  <button 
                    onClick={() => handleCopyCode(promo.id, promo.code)}
                    className={`w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                      copiedId === promo.id
                        ? 'bg-green-500 text-white shadow-lg shadow-green-500/30 transform -translate-y-1'
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-600 hover:text-white'
                    }`}
                  >
                    {copiedId === promo.id ? (
                      <>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        คัดลอกสำเร็จ!
                      </>
                    ) : (
                      'คัดลอกโค้ด'
                    )}
                  </button>
                </div>

                {/* ปุ่มจองรถ & วันหมดอายุ */}
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <Link 
                    href="/cars" 
                    className="w-full sm:w-auto px-10 py-4 bg-blue-950 text-white font-bold rounded-full hover:bg-amber-500 hover:text-blue-950 transition-colors shadow-lg shadow-blue-950/20 text-center"
                  >
                    เลือกรถเพื่อใช้สิทธิ์ &rarr;
                  </Link>
                  <p className="text-sm text-slate-400 font-medium flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    หมดเขต: {promo.valid}
                  </p>
                </div>

              </div>
            </div>
          </section>
        ))}
      </div>

    </div>
  );
}