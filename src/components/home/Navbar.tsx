"use client"; // เพิ่มบรรทัดนี้เพราะเราอาจจะต้องใช้ Effect หรือ State ในอนาคต

import Link from 'next/link';
import { ImageResponse } from 'next/server';

export default function Navbar() {
  return (
    // เปลี่ยนจาก sticky เป็น fixed และใส่ effect กระจกฝ้า (backdrop-blur-xl)
    <nav className="fixed w-full top-0 z-50 transition-all duration-300 bg-white/70 backdrop-blur-xl border-b border-white/40 shadow-[0_4px_30px_rgba(0,0,0,0.05)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20"> {/* ขยายความสูงเป็น h-20 ให้ดูโปร่งขึ้น */}
          
          {/* ฝั่งซ้าย: โลโก้ */}
          <div className="flex items-center">
            <Link href="/" className="text-3xl font-extrabold tracking-tighter flex items-center gap-1.5 group">
              <img src="/phumjailogo.png" alt="logo" className=" h-10 md:h-15 w-auto object-contain"/>
              <span className="text-blue-800 transition-colors duration-300">PhumJai</span>
              <span className="text-white transition-colors duration-300">Rent</span>
              {/* ลูกเล่น: จุดสีทองกะพริบ ให้ดูเหมือนระบบทำงานอยู่ */}
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse mt-2"></div>
            </Link>
          </div>

          {/* ฝั่งขวา: เมนู (ซ่อนในจอมือถือ) */}
          <div className="hidden md:flex items-center space-x-8">
            
            {/* ลูกเล่น: เส้นวิ่งขีดเส้นใต้เวลา Hover */}
            <Link href="/" className="relative text-slate-700 hover:text-blue-700 font-bold text-sm transition-colors py-2 group">
              หน้าหลัก
              <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full rounded-full"></span>
            </Link>

            <Link href="/cars" className="relative text-slate-700 hover:text-blue-700 font-bold text-sm transition-colors py-2 group">
              เช่ารถ
              <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full rounded-full"></span>
            </Link>

            <Link href="/promotion" className="relative text-slate-700 hover:text-blue-700 font-bold text-sm transition-colors py-2 group">
              โปรโมชั่น
              <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full rounded-full"></span>
            </Link>

            <Link href="/about" className="relative text-slate-700 hover:text-blue-700 font-bold text-sm transition-colors py-2 group">
              เกี่ยวกับเรา
              <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full rounded-full"></span>
            </Link>          
            
            {/* ปุ่ม Login: เปลี่ยนเป็นปุ่มโค้งมน มีเงา และไอคอนขยับได้ */}
            <Link 
              href="/login" 
              className="relative overflow-hidden group bg-blue-700 text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-lg hover:shadow-blue-600/30 transition-all duration-300 flex items-center gap-2 transform hover:-translate-y-0.5"
            >
              {/* แสง Gradient เวลา Hover */}
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-600 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              
              <span className="relative z-10">เข้าสู่ระบบ / สมัครสมาชิก</span>
              
            </Link>
          </div>

          {/* ปุ่ม Hamburger สำหรับจอมือถือ (แสดงเฉพาะหน้าจอเล็ก) */}
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