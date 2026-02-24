import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const { contact, otp, newPassword } = await req.json();

        const customer = await prisma.customer.findFirst({
            where: { OR: [{ email: contact }, { phone: contact }] }
        });

        if (!customer || customer.resetToken !== otp) {
            return NextResponse.json({ message: "คำขอไม่ถูกต้อง" }, { status: 400 });
        }

        //const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.customer.update({
            where: { id: customer.id },
            data: {
                password: newPassword, // บันทึกรหัสจริงลงไป
                resetToken: null,
                resetTokenExpiry: null
            }
        });

        return NextResponse.json({ message: "เปลี่ยนรหัสผ่านสำเร็จ" });
    } catch (error) {
        return NextResponse.json({ message: "เกิดข้อผิดพลาด" }, { status: 500 });
    }
}