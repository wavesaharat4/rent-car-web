import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport"; // 1. นำเข้า Type เพิ่มเติม

const prisma = new PrismaClient();

const transporterOptions: SMTPTransport.Options = {
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        // เติม || "" หรือ as string ลงไปท้ายชื่อตัวแปรครับ
        user: process.env.EMAIL_USER || "", 
        pass: process.env.EMAIL_PASS || "",
    },
};

const transporter = nodemailer.createTransport(transporterOptions);

export async function POST(req: Request) {
    try {
        const { contact } = await req.json();

        // หา User (อ้างอิงตามชื่อรุ่นที่คุณมีใน schema.prisma)
        const customer = await prisma.customer.findFirst({
            where: { OR: [{ email: contact }, { phone: contact }] }
        });

        if (!customer) {
            return NextResponse.json({ message: "ไม่พบผู้ใช้นี้ในระบบ" }, { status: 404 });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 นาที

        await prisma.customer.update({
            where: { id: customer.id },
            data: { resetToken: otp, resetTokenExpiry: expiry }
        });

        // 3. ส่งเมลด้วย Nodemailer
        await transporter.sendMail({
            from: `"PhumJai Rent" <${process.env.EMAIL_CUSTOMER}>`,
            to: customer.email, // ส่งหาใครก็ได้แล้วตอนนี้!
            subject: "รหัสยืนยันการเปลี่ยนรหัสผ่าน (OTP)",
            html: `
                <div style="font-family: sans-serif; padding: 20px;">
                    <h2>รหัส OTP ของคุณคือ: <span style="color: blue;">${otp}</span></h2>
                    <p>รหัสนี้จะหมดอายุภายใน 5 นาที</p>
                </div>
            `,
        });

        return NextResponse.json({ message: "ส่งรหัส OTP สำเร็จ" });
    } catch (error) {
        console.error("Gmail Error:", error);
        return NextResponse.json({ message: "ส่งเมลไม่สำเร็จ" }, { status: 500 });
    }
}