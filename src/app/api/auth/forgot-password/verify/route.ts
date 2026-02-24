import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
    try {
        const { contact, otp } = await req.json();

        // 1. ค้นหาลูกค้าพร้อม OTP
        const query = "SELECT * FROM customer WHERE cusMail = ? OR cusPhone = ?";
        const [rows]: any = await db.query(query, [contact, contact]);

        if (rows.length === 0) {
            return NextResponse.json({ message: "ไม่พบผู้ใช้" }, { status: 404 });
        }

        const customer = rows[0];

        // 2. เช็คความถูกต้อง
        if (customer.resetToken !== otp) {
            return NextResponse.json({ message: "รหัส OTP ไม่ถูกต้อง" }, { status: 400 });
        }

        // เช็ควันหมดอายุ (ถ้าอยากทำ)
        if (new Date() > new Date(customer.resetTokenExpiry)) {
             return NextResponse.json({ message: "รหัส OTP หมดอายุแล้ว" }, { status: 400 });
        }

        return NextResponse.json({ message: "ยืนยัน OTP สำเร็จ" });

    } catch (error) {
        console.error("Verify Error:", error);
        return NextResponse.json({ message: "เกิดข้อผิดพลาด" }, { status: 500 });
    }
}