import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // 👈 import จากไฟล์ db.ts ของคุณ
import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";

// Config Nodemailer เหมือนเดิม
const transporterOptions: SMTPTransport.Options = {
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER || "",
        pass: process.env.EMAIL_PASS || "",
    },
};
const transporter = nodemailer.createTransport(transporterOptions);

export async function POST(req: Request) {
    try {
        const { contact } = await req.json();

        // 1. ค้นหาลูกค้า (ใช้ SQL แทน Prisma)
        const querySearch = "SELECT * FROM customer WHERE cusMail = ? OR cusPhone = ?";
        const [rows]: any = await db.query(querySearch, [contact, contact]);

        if (rows.length === 0) {
            return NextResponse.json({ message: "ไม่พบข้อมูลลูกค้าในระบบ" }, { status: 404 });
        }

        const customer = rows[0]; // ดึงข้อมูลคนแรกที่เจอ

        // 2. สร้าง OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 นาที

        // 3. อัปเดตลง Database (SQL Update)
        const queryUpdate = "UPDATE customer SET resetToken = ?, resetTokenExpiry = ? WHERE cusID = ?";
        await db.query(queryUpdate, [otp, expiry, customer.cusID]);

        // 4. ส่งเมล (เหมือนเดิม)
        await transporter.sendMail({
            from: `"Rent Car System" <${process.env.EMAIL_USER}>`,
            to: customer.cusMail, // ✅ ใช้ชื่อ field ตาม DB จริง
            subject: "รหัส OTP สำหรับรีเซ็ตรหัสผ่าน",
            html: `
                <div style="font-family: sans-serif; padding: 20px;">
                    <h2>รหัส OTP ของคุณคือ: <b>${otp}</b></h2>
                    <p>รหัสนี้จะหมดอายุภายใน 5 นาที</p>
                </div>
            `,
        });

        return NextResponse.json({ message: "ส่งรหัส OTP สำเร็จ" });

    } catch (error) {
        console.error("MySQL Error:", error);
        return NextResponse.json({ message: "เกิดข้อผิดพลาด" }, { status: 500 });
    }
}