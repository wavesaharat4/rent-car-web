import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";

// GET: ดึงข้อมูล
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const fetchAll = searchParams.get("all") === "true";

    // ดึงเฉพาะของที่เปิดใช้งานอยู่
    let query = "SELECT * FROM addon WHERE addonStatus = 'Active'";
    
    // ถ้าเป็นแอดมิน ให้ดึงข้อมูลทั้งหมด (ทั้ง Active และ Inactive)
    if (fetchAll) {
      query = "SELECT * FROM addon ORDER BY addonID DESC";
    }

    const [rows] = await db.query<RowDataPacket[]>(query);
    return NextResponse.json(rows);

  } catch (err: any) {
    console.error("Fetch Addons Error:", err);
    return NextResponse.json({ message: err?.message ?? "Database error" }, { status: 500 });
  }
}

//  POST: สำหรับแอดมิน "เพิ่ม" อุปกรณ์เสริมใหม่
export async function POST(req: Request) {
  try {
    const body = await req.json();
    // 🌟 1. รับค่า addonMaxLimit เพิ่ม
    const { addonName, addonDetail, addonQuantity, addonPrice, addonStatus = 'Active', addonMaxLimit } = body;

    if (!addonName || addonQuantity === undefined || addonPrice === undefined) {
      return NextResponse.json({ ok: false, error: "กรุณากรอกข้อมูลให้ครบถ้วน" }, { status: 400 });
    }

    // 🌟 2. เพิ่ม addonMaxLimit ลงในคำสั่ง INSERT
    const [result]: any = await db.query(
      `INSERT INTO addon (addonName, addonDetail, addonQuantity, addonPrice, addonStatus, addonMaxLimit) VALUES (?, ?, ?, ?, ?, ?)`,
      [addonName, addonDetail, addonQuantity, addonPrice, addonStatus, addonMaxLimit]
    );

    return NextResponse.json({ ok: true, insertId: result.insertId, message: "เพิ่มข้อมูลสำเร็จ" });

  } catch (err: any) {
    console.error("Create Addon Error:", err);
    return NextResponse.json({ ok: false, error: err?.message ?? "Database error" }, { status: 500 });
  }
}