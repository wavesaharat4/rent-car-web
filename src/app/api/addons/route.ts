// src/app/api/addons/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET() {
  try {
    // ดึงข้อมูลอุปกรณ์เสริมทั้งหมด ที่ยังมีของเหลืออยู่ (Quantity > 0)
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT * FROM addon WHERE addonQuantity > 0"
    );

    // ส่งข้อมูลกลับไปให้หน้า Checkout แบบ Array
    return NextResponse.json(rows);

  } catch (err: any) {
    console.error("Fetch Addons Error:", err);
    return NextResponse.json(
      { message: err?.message ?? "Database error" },
      { status: 500 }
    );
  }
}