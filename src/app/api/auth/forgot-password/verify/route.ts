import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { contact, otp } = await req.json();

    const customer = await prisma.customer.findFirst({
      where: { OR: [{ email: contact }, { phone: contact }] }
    });

    if (!customer || customer.resetToken !== otp || new Date() > customer.resetTokenExpiry!) {
      return NextResponse.json({ message: "รหัส OTP ไม่ถูกต้องหรือหมดอายุ" }, { status: 400 });
    }

    return NextResponse.json({ message: "OTP ถูกต้อง" });
  } catch (error) {
    return NextResponse.json({ message: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}