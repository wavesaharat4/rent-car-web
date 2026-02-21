// ไฟล์: app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { pool } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    // 1. ตรวจสอบว่าอีเมลซ้ำหรือไม่
    const [rows]: any = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (rows.length > 0) {
      return NextResponse.json({ message: "อีเมลนี้มีในระบบแล้ว" }, { status: 400 });
    }

    // 2. เข้ารหัสผ่านเพื่อความปลอดภัย
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. บันทึกข้อมูลลงฐานข้อมูล
    await pool.execute(
      'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
      [email, hashedPassword, name]
    );

    return NextResponse.json({ message: "สมัครสมาชิกสำเร็จ" }, { status: 201 });
  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json({ message: "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์" }, { status: 500 });
  }
}