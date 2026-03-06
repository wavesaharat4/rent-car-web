import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";

export const dynamic = 'force-dynamic';

// 🌟 GET: ดึงข้อมูลโปรโมชั่น
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const fetchAll = searchParams.get("all") === "true";

    let query = `SELECT * FROM promotion WHERE proStatus = 'active' AND NOW() BETWEEN proStart AND proEnd`;
    
    // ถ้าเป็นหน้าจัดการของพนักงาน ให้ดึงมาทั้งหมด
    if (fetchAll) {
      query = `SELECT * FROM promotion ORDER BY proID DESC`;
    }

    const [rows] = await db.query<RowDataPacket[]>(query);
    return NextResponse.json(rows);

  } catch (err: any) {
    console.error("Fetch Promotions Error:", err);
    return NextResponse.json({ message: err?.message ?? "Database error" }, { status: 500 });
  }
}

// 🌟 POST: เพิ่มโปรโมชั่นใหม่
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      proName, proCode, proDetail, proType, proValue, 
      proMin, proMax, proStart, proEnd, proStatus = 'active', proPic = '' 
    } = body;

    // ตรวจสอบข้อมูลเบื้องต้น
    if (!proName || !proCode || !proType || proValue === undefined || !proStart || !proEnd) {
      return NextResponse.json({ ok: false, error: "กรุณากรอกข้อมูลสำคัญให้ครบถ้วน" }, { status: 400 });
    }

    const [result]: any = await db.query(
      `INSERT INTO promotion 
      (proName, proCode, proDetail, proType, proValue, proMin, proMax, proStart, proEnd, proStatus, proPic) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [proName, proCode, proDetail, proType, proValue, proMin || 0, proMax || null, proStart, proEnd, proStatus, proPic]
    );

    return NextResponse.json({ ok: true, insertId: result.insertId, message: "เพิ่มโปรโมชั่นสำเร็จ" });

  } catch (err: any) {
    console.error("Create Promotion Error:", err);
    // ดักจับกรณีสร้าง Code ซ้ำ (ถ้าตั้ง proCode เป็น Unique ไว้)
    if (err.code === 'ER_DUP_ENTRY') {
       return NextResponse.json({ ok: false, error: "รหัสโค้ดนี้มีอยู่ในระบบแล้ว" }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: err?.message ?? "Database error" }, { status: 500 });
  }
}