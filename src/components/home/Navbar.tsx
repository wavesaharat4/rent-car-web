"use client";

// 🌟 เพิ่ม useState เข้ามา
import { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react'; 
import { useRouter } from 'next/navigation'; 
import Swal from 'sweetalert2';

export default function Navbar() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // 🌟 State สำหรับเปิด/ปิดเมนูมือถือ
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleBookingClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (status === "unauthenticated" || !session) {
      e.preventDefault(); 
      
      Swal.fire({
        title: "กรุณาเข้าสู่ระบบ",
        text: "คุณต้องเข้าสู่ระบบก่อนเพื่อดูข้อมูลการจองของคุณ",
        icon: "warning",
        confirmButtonColor: "#2563eb",
        confirmButtonText: "ไปหน้าเข้าสู่ระบบ",
        showCancelButton: true,
        cancelButtonText: "ยกเลิก",
        customClass: { popup: 'rounded-2xl' }
      }).then((result) => {
        if (result.isConfirmed) {
          router.push('/login'); 
        }
      });
    }
  };

  // 🌟 ฟังก์ชันสำหรับเมนูมือถือ (กดแล้วให้ปิดเมนูก่อนค่อยทำงานต่อ)
  const handleMobileBookingClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    setIsMobileMenuOpen(false); // ปิดเมนูมือถือ
    handleBookingClick(e);      // เรียกใช้ฟังก์ชันเช็คการจองเดิม
  };

  return (
    <nav className="fixed w-full top-0 z-50 transition-all duration-300 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-[0_4px_30px_rgba(0,0,0,0.05)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20"> 
          
          {/* ฝั่งซ้าย: โลโก้ */}
          <div className="flex items-center">
            <Link href="/" className="text-3xl font-extrabold tracking-tighter flex items-center gap-1.5 group">
              <img src="/phumjailogo.png" alt="logo" className="h-10 md:h-15 w-auto object-contain"/>
              <span className="text-blue-800 transition-colors duration-300">PhumJai Rent</span>
            </Link>
          </div>

          {/* ฝั่งขวา: เมนู (Desktop) */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="relative text-slate-700 hover:text-blue-700 font-bold text-base transition-colors py-2 group">
              หน้าหลัก
              <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full rounded-full"></span>
            </Link>

            <Link href="/cars" className="relative text-slate-700 hover:text-blue-700 font-bold text-base transition-colors py-2 group">
              เช่ารถ
              <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full rounded-full"></span>
            </Link>

            <Link href="/promotion" className="relative text-slate-700 hover:text-blue-700 font-bold text-base transition-colors py-2 group">
              โปรโมชั่น
              <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full rounded-full"></span>
            </Link>

            <Link href="/about" className="relative text-slate-700 hover:text-blue-700 font-bold text-base transition-colors py-2 group">
              เกี่ยวกับเรา
              <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full rounded-full"></span>
            </Link> 

            <Link 
              href="/my-booking" 
              onClick={handleBookingClick} 
              className="relative text-slate-700 hover:text-blue-700 font-bold text-base transition-colors py-2 group"
            >
              การจองของฉัน
              <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full rounded-full"></span>
            </Link>         
            
            {status === 'loading' ? (
              <div className="w-32 h-10 bg-slate-200 animate-pulse rounded-full"></div>
            ) : session ? (
              <div className="flex items-center gap-2 bg-slate-50 px-2 py-1.5 rounded-full border border-slate-200 shadow-sm">
                <Link 
                  href="/profile" 
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-slate-200 transition-colors group cursor-pointer"
                >
                  <div className="bg-blue-100 p-1.5 rounded-full group-hover:bg-blue-200 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-base font-bold text-blue-950 group-hover:text-blue-700">
                    คุณ {session.user?.name}
                  </span>
                </Link>
                
                <div className="w-px h-6 bg-slate-300 mx-1"></div>

                <button 
                  onClick={() => signOut({ callbackUrl: '/login' })} 
                  className="text-base font-bold text-red-500 hover:bg-red-50 hover:text-red-700 rounded-full transition-colors px-3 py-1.5 cursor-pointer"
                >
                  ออกจากระบบ
                </button>
              </div>
            ) : (
              <Link 
                href="/login" 
                className="relative overflow-hidden group bg-blue-700 text-white px-6 py-2.5 rounded-full text-base font-bold shadow-lg hover:shadow-blue-600/30 transition-all duration-300 flex items-center gap-2 transform hover:-translate-y-0.5"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-600 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="relative z-10">เข้าสู่ระบบ / สมัครสมาชิก</span>
              </Link>
            )}
          </div>

          {/* 🌟 ปุ่ม Hamburger (จอมือถือ) */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-slate-700 hover:text-blue-600 focus:outline-none p-2"
            >
              {/* เช็ค state เพื่อสลับไอคอนระหว่าง ☰ (Hamburger) กับ ✕ (Close) */}
              {isMobileMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 🌟 เมนูแผงด้านล่างสำหรับมือถือ (จะแสดงเมื่อ isMobileMenuOpen = true) */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="bg-white px-4 pt-2 pb-6 space-y-2 border-t border-slate-100 shadow-xl">
          <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl font-bold transition-colors">หน้าหลัก</Link>
          <Link href="/cars" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl font-bold transition-colors">เช่ารถ</Link>
          <Link href="/promotion" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl font-bold transition-colors">โปรโมชั่น</Link>
          <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl font-bold transition-colors">เกี่ยวกับเรา</Link>
          <Link href="/my-booking" onClick={handleMobileBookingClick} className="block px-4 py-3 text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl font-bold transition-colors">การจองของฉัน</Link>

          {/* ส่วนของ Profile / Login สำหรับมือถือ */}
          <div className="pt-4 mt-2 border-t border-slate-100">
            {status === 'loading' ? (
              <div className="w-full h-12 bg-slate-200 animate-pulse rounded-xl"></div>
            ) : session ? (
              <div className="flex flex-col gap-2">
                <Link 
                  href="/profile" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-blue-900"
                >
                  <div className="bg-blue-100 p-1.5 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  คุณ {session.user?.name}
                </Link>
                <button 
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    signOut({ callbackUrl: '/login' });
                  }} 
                  className="w-full text-center px-4 py-3 text-red-500 hover:bg-red-50 font-bold rounded-xl transition-colors"
                >
                  ออกจากระบบ
                </button>
              </div>
            ) : (
              <Link 
                href="/login" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full text-center bg-blue-600 text-white px-4 py-3.5 rounded-xl font-bold shadow-md hover:bg-blue-700 transition-colors"
              >
                เข้าสู่ระบบ / สมัครสมาชิก
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}