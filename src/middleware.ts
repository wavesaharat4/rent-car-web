import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// ใช้ withAuth หุ้ม Middleware ของเราไว้
export default withAuth(
  function middleware(request) {
    const path = request.nextUrl.pathname;
    
    // ดึง Role จาก Token ของ NextAuth ได้เลย ปลอดภัย 100%
    const userRole = request.nextauth.token?.role as string;

    // ถ้ายูสเซอร์เป็น CUSTOMER ให้เตะโด่งไปหน้า Login
    if (userRole === 'CUSTOMER' || !userRole) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // --- ระบบแยกสิทธิ์ (RBAC) ---
    if (path.startsWith('/admin') && userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (path.startsWith('/manager') && userRole !== 'MANAGER') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (path.startsWith('/cs') && userRole !== 'CS') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (path.startsWith('/panel') && userRole !== 'PANEL') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (path.startsWith('/accounting') && userRole !== 'ACCOUNTING') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (path.startsWith('/finance') && userRole !== 'FINANCE') {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // ถ้าสิทธิ์ถูกต้องให้ผ่านไปได้
    return NextResponse.next();
  },
  {
    callbacks: {
      // อนุญาตให้ Middleware ทำงานก็ต่อเมื่อมี Token เท่านั้น (แปลว่า Login แล้ว)
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/login', // ถ้าเข้าหน้าพนักงานแต่ยังไม่ Login (ไม่มี Token) ให้เด้งมาที่นี่
    }
  }
);

// กำหนดให้ Middleware ทำงานเฉพาะ URL ชุดพนักงานที่ระบุไว้
export const config = {
  matcher: [
    '/admin/:path*', 
    '/manager/:path*', 
    '/cs/:path*', 
    '/panel/:path*', 
    '/accounting/:path*', 
    '/finance/:path*'
  ],
};