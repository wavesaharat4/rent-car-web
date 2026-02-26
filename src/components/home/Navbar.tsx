"use client";

import Link from 'next/link';
// 1. นำเข้า useSession และ signOut จาก next-auth
import { useSession, signOut } from 'next-auth/react'; 

//นำเข้า useRouter และ Swal สำหรับทำแจ้งเตือน
import { useRouter } from 'next/navigation'; 
import Swal from 'sweetalert2';

export default function Navbar() {
  // 2. เรียกใช้งาน Session เพื่อเช็คว่ามีคนล็อคอินอยู่หรือไม่
  const { data: session, status } = useSession();
  const router = useRouter();

  //ฟังก์ชันดักจับการคลิก Link "การจองของฉัน"
  const handleBookingClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (status === "unauthenticated" || !session) {
      e.preventDefault(); // 🛑 หยุด! ไม่ให้ <Link> พาไปหน้า /my-bookings
      
      // โชว์แจ้งเตือน
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
          router.push('/login'); // พากลับไปหน้า Login
        }
      });
    }
    // ✅ ถ้าล็อกอินแล้ว ปล่อยให้ <Link> ทำงานพุ่งไปหน้า /my-bookings ตามปกติ
  };

  return (
    <nav className="fixed w-full top-0 z-50 transition-all duration-300 bg-white/70 backdrop-blur-xl border-b border-white/40 shadow-[0_4px_30px_rgba(0,0,0,0.05)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20"> 
          
          {/* ฝั่งซ้าย: โลโก้ */}
          <div className="flex items-center">
            <Link href="/" className="text-3xl font-extrabold tracking-tighter flex items-center gap-1.5 group">
              <img src="/phumjailogo.png" alt="logo" className="h-10 md:h-15 w-auto object-contain"/>
              <span className="text-blue-800 transition-colors duration-300">PhumJai Rent</span>

            </Link>
          </div>

          {/* ฝั่งขวา: เมนู */}
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

            {/* ปุ่ม "การจองของฉัน" */}
            <Link 
              href="/my-booking" 
              onClick={handleBookingClick} 
              className="relative text-slate-700 hover:text-blue-700 font-bold text-base transition-colors py-2 group"
            >
              การจองของฉัน
              <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full rounded-full"></span>
            </Link>         
            
            {/* 3. เช็คสถานะการล็อคอินตรงนี้ */}
            {status === 'loading' ? (
              // 3.1 สถานะกำลังโหลด: โชว์กล่องกะพริบ (Skeleton)
              <div className="w-32 h-10 bg-slate-200 animate-pulse rounded-full"></div>
            ) : session ? (
              // 3.2 ล็อคอินแล้ว: โชว์ปุ่มโปรไฟล์ + ปุ่มออกจากระบบ
            <div className="flex items-center gap-2 bg-slate-50 px-2 py-1.5 rounded-full border border-slate-200 shadow-sm">
              
              {/* 📌 ปุ่มไปหน้าโปรไฟล์ (คลิกที่ชื่อได้เลย) */}
              <Link 
                href="/profile" 
                className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-slate-200 transition-colors group cursor-pointer"
              >
                {/* ไอคอนรูปคน */}
                <div className="bg-blue-100 p-1.5 rounded-full group-hover:bg-blue-200 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-base font-bold text-blue-950 group-hover:text-blue-700">
                  คุณ {session.user?.name}
                </span>
              </Link>
              
              <div className="w-px h-6 bg-slate-300 mx-1"></div> {/* เส้นคั่น */}

              {/* ปุ่มออกจากระบบ */}
              <button 
                onClick={() => signOut({ callbackUrl: '/login' })} 
                className="text-base font-bold text-red-500 hover:bg-red-50 hover:text-red-700 rounded-full transition-colors px-3 py-1.5 cursor-pointer"
              >
                ออกจากระบบ
              </button>
            </div>
            ) : (
              // 3.3 ยังไม่ล็อคอิน: โชว์ปุ่ม Login เหมือนเดิม
              <Link 
                href="/login" 
                className="relative overflow-hidden group bg-blue-700 text-white px-6 py-2.5 rounded-full text-base font-bold shadow-lg hover:shadow-blue-600/30 transition-all duration-300 flex items-center gap-2 transform hover:-translate-y-0.5"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-600 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="relative z-10">เข้าสู่ระบบ / สมัครสมาชิก</span>
              </Link>
            )}
          </div>

          {/* ปุ่ม Hamburger (จอมือถือ) */}
          <div className="md:hidden flex items-center">
            <button className="text-slate-700 hover:text-blue-600 focus:outline-none">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
          
        </div>
      </div>
    </nav>
  );
}