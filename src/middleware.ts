import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // เอิ้นเช็คว่า URL ปัจจุบันแมนหลังบ้านของพนักงานบ่
  const isEmployeeRoute = path.startsWith('/admin') ||
    path.startsWith('/manager') ||
    path.startsWith('/cs') ||
    path.startsWith('/panel') ||
    path.startsWith('/accounting') ||
    path.startsWith('/finance');

  if (isEmployeeRoute) {
    // ดึง Role จากคุกกี้มาเช็ค (ของแท้ต้องดึงจาก Token เด้อ)
    const userRole = request.cookies.get('role')?.value || 'ADMIN';

    // ถ้ายูสเซอร์เป็น CUSTOMER หรือ GUEST ให้เตะโด่งไปหน้า Login โลด
    if (userRole === 'CUSTOMER' || userRole === 'GUEST') {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // --- ระบบแยกสิทธิ์ (RBAC) กั้นไว้ตาม Role Level 0 ---
    // 1. System Admin
    if (path.startsWith('/admin') && userRole !== 'ADMIN') return NextResponse.redirect(new URL('/login', request.url));

    // 2. Manager
    if (path.startsWith('/manager') && userRole !== 'MANAGER') return NextResponse.redirect(new URL('/login', request.url));

    // 3. Customer Service
    if (path.startsWith('/cs') && userRole !== 'CS') return NextResponse.redirect(new URL('/login', request.url));

    // 4. Panel Admin
    if (path.startsWith('/panel') && userRole !== 'PANEL') return NextResponse.redirect(new URL('/login', request.url));

    // 5. Accounting
    if (path.startsWith('/accounting') && userRole !== 'ACCOUNTING') return NextResponse.redirect(new URL('/login', request.url));

    // 6. Finance
    if (path.startsWith('/finance') && userRole !== 'FINANCE') return NextResponse.redirect(new URL('/login', request.url));

    // ถ้าสิทธิ์ถืกต้องกะปล่อยให้เข้าไปดูหน้าหล่อๆได้เลย
  }

  return NextResponse.next();
}

// กำหนดให้ Middleware เฮ็ดงานเฉพาะ URL ชุดพนักงานที่ระบุไว้เด้อ
export const config = {
  matcher: ['/admin/:path*', '/manager/:path*', '/cs/:path*', '/panel/:path*', '/accounting/:path*', '/finance/:path*'],
};