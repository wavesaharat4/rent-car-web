import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// 🌟 บังคับ Next.js ดึงใหม่ทุกครั้ง
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const query = `SELECT * FROM promotion ORDER BY proID DESC`;
    const [rows]: any = await db.query(query);
    
    return NextResponse.json({ ok: true, data: rows });
  } catch (error: any) {
    console.error("Get Promotions Error:", error);
    return NextResponse.json({ ok: false, error: "ไม่สามารถดึงข้อมูลโปรโมชั่นได้" }, { status: 500 });
  }
}