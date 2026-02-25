// src/app/api/cars/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET() {
  try {
    // ดึงข้อมูลรถทั้งหมดที่สถานะเป็น 'active' (พร้อมใช้งาน)
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT * FROM car ORDER BY carID DESC"
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json({ message: "Error fetching cars" }, { status: 500 });
  }
}