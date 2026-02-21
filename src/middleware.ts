import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // ตรวจสอบว่ากำลังพยายามเข้าหน้าหลังบ้าน (/dashboard) ใช่หรือไม่
  if (path.startsWith('/dashboard')) {
    
    // สมมติว่าเราเช็คจาก Token/Cookie ว่าคนนี้เป็นใคร (ของจริงดึงจากระบบ Login)
    // ตรงนี้ผมจำลองว่ามี Cookie ชื่อ role เก็บค่า 'CUSTOMER' ไว้
    const userRole = request.cookies.get('role')?.value || 'GUEST';

    // ถ้าเป็นลูกค้า (CUSTOMER) หรือยังไม่ได้ล็อกอิน (GUEST)
    if (userRole === 'CUSTOMER' || userRole === 'GUEST') {
      // เตะกลับไปหน้าแรกทันที! ไม่อนุญาตให้เข้า
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    // ถ้าเป็น ADMIN หรือ STAFF โค้ดจะปล่อยผ่านให้เข้าหน้าหลังบ้านได้ปกติ
  }

  return NextResponse.next();
}

// กำหนดให้ Middleware นี้ทำงานเฉพาะ URL ที่ขึ้นต้นด้วย /dashboard
export const config = {
  matcher: ['/dashboard/:path*'],
};