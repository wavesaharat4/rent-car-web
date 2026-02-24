import { NextResponse } from "next/server";
// import bcrypt from "bcryptjs"; // ปิดไว้ก่อน เพื่อให้ล็อคอินด้วยโค้ดเดิมได้
import { db } from "@/lib/db"; 

export async function POST(req: Request) {
  try {
    const { name, email, password, phone, birthDate } = await req.json();

    const nameParts = name.trim().split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "-";

    // 1. ตรวจสอบว่าอีเมลซ้ำหรือไม่ (เปลี่ยน id เป็น cusID, email เป็น cusMail)
    const [rows]: any = await db.execute(
      'SELECT cusID FROM customer WHERE cusMail = ?',
      [email]
    );

    if (rows.length > 0) {
      return NextResponse.json({ message: "อีเมลนี้มีในระบบแล้ว กรุณาใช้อีเมลอื่น" }, { status: 400 });
    }

    const hashedPassword = password;

    // 3. บันทึกข้อมูลลงฐานข้อมูล (เปลี่ยนชื่อคอลัมน์ให้ตรงกับ DB ใหม่)
    await db.execute(
      'INSERT INTO customer (cusFN, cusLN, cusMail, cusPass, cusPhone, cusDOB) VALUES (?, ?, ?, ?, ?, ?)',
      [firstName, lastName, email, hashedPassword, phone, birthDate]
    );

    return NextResponse.json({ message: "สมัครสมาชิกสำเร็จ" }, { status: 201 });
  } catch (error: any) {
    console.error("Register Error:", error);
    return NextResponse.json({ message: "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์" }, { status: 500 });
  }
}