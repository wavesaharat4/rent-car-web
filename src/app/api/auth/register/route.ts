import { NextResponse } from "next/server";
// import bcrypt from "bcryptjs"; // ปิดไว้ก่อน เพื่อให้ล็อคอินด้วยโค้ดเดิมได้
import { db } from "@/lib/db"; // ดึงจากไฟล์ db.ts ที่เราสร้างไว้

export async function POST(req: Request) {
  try {
    const { name, email, password, phone, birthDate } = await req.json();

    // แยก ชื่อ-นามสกุล ออกจากกัน (ถ้าพิมพ์มาคำเดียว นามสกุลจะเป็นขีด)
    const nameParts = name.trim().split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "-";

    // 1. ตรวจสอบว่าอีเมลซ้ำหรือไม่ (ค้นหาในตาราง customer)
    const [rows]: any = await db.execute(
      'SELECT id FROM customer WHERE email = ?',
      [email]
    );

    if (rows.length > 0) {
      return NextResponse.json({ message: "อีเมลนี้มีในระบบแล้ว กรุณาใช้อีเมลอื่น" }, { status: 400 });
    }

    // 2. รหัสผ่าน (ใช้แบบปกติไปก่อนตามหน้า Login ที่เราเขียนไว้)
    // ของจริงค่อยเปิดใช้: const hashedPassword = await bcrypt.hash(password, 10);
    const hashedPassword = password;

    // 3. บันทึกข้อมูลลงฐานข้อมูล (ตาราง customer)
    await db.execute(
      'INSERT INTO customer (first_name, last_name, email, password, phone, birth_date) VALUES (?, ?, ?, ?, ?, ?)',
      [firstName, lastName, email, hashedPassword, phone, birthDate]
    );

    return NextResponse.json({ message: "สมัครสมาชิกสำเร็จ" }, { status: 201 });
  } catch (error: any) {
    console.error("Register Error:", error);
    return NextResponse.json({ message: "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์" }, { status: 500 });
  }
}