import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
    try {
        const { contact, otp, newPassword } = await req.json();

        // 1. เช็คก่อนว่า OTP ยังถูกอยู่ไหม (กันคนยิง API มั่วๆ)
        const querySearch = "SELECT * FROM customer WHERE (cusMail = ? OR cusPhone = ?) AND resetToken = ?";
        const [rows]: any = await db.query(querySearch, [contact, contact, otp]);

        if (rows.length === 0) {
            return NextResponse.json({ message: "ข้อมูลไม่ถูกต้อง หรือ OTP หมดอายุ" }, { status: 400 });
        }

        const customer = rows[0];

        // 2. อัปเดตรหัสผ่านใหม่ และล้าง OTP ทิ้ง
        const queryUpdate = `
            UPDATE customer 
            SET cusPass = ?, resetToken = NULL, resetTokenExpiry = NULL 
            WHERE cusID = ?
        `;
        
        await db.query(queryUpdate, [newPassword, customer.cusID]);

        return NextResponse.json({ message: "เปลี่ยนรหัสผ่านสำเร็จ" });

    } catch (error) {
        console.error("Reset Error:", error);
        return NextResponse.json({ message: "เกิดข้อผิดพลาดในการเปลี่ยนรหัส" }, { status: 500 });
    }
}