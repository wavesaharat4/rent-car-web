import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";
// 🌟 บังคับ Next.js ดึงใหม่ทุกครั้ง
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 🌟 ดึงโปรโมชั่นที่สถานะเป็น 'active' และเวลาปัจจุบัน (NOW) ต้องอยู่ระหว่าง proStart ถึง proEnd
    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT * FROM promotion 
       WHERE proStatus = 'active' 
       AND NOW() BETWEEN proStart AND proEnd`
    );

    // ส่งข้อมูลกลับไปเป็น Array
    return NextResponse.json(rows);

  } catch (err: any) {
    console.error("Fetch Promotions Error:", err);
    return NextResponse.json(
      { message: err?.message ?? "Database error" },
      { status: 500 }
    );
  }
}