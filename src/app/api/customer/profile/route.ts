import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// 📌 1. ฟังก์ชันดึงข้อมูล (GET) ตอนโหลดหน้าเว็บ
export async function GET(req: Request) {
    try {
        // รับค่า email จาก URL Parameter
        const { searchParams } = new URL(req.url);
        const email = searchParams.get("email");

        if (!email) {
            return NextResponse.json({ message: "ไม่พบ Email" }, { status: 400 });
        }

        // ค้นหาข้อมูลลูกค้าด้วย Email
        const query = "SELECT * FROM customer WHERE cusMail = ?";
        const [rows]: any = await db.query(query, [email]);

        if (rows.length === 0) {
            return NextResponse.json({ message: "ไม่พบข้อมูลลูกค้า" }, { status: 404 });
        }

        return NextResponse.json(rows[0]);

    } catch (error) {
        console.error("Get Profile Error:", error);
        return NextResponse.json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูล" }, { status: 500 });
    }
}

// 📌 2. ฟังก์ชันอัปเดตข้อมูล (PUT) ตอนกดปุ่มบันทึก
export async function PUT(req: Request) {
    try {
        // 👈 เพิ่ม cusDL เข้ามารับค่าที่ส่งมาจากหน้าเว็บ
        const { cusID, cusFN, cusLN, cusPhone, cusAddress, cusGender, cusDL } = await req.json();

        // 👈 เพิ่ม cusDL = ? ในคำสั่ง SQL
        const queryUpdate = `
            UPDATE customer 
            SET cusFN = ?, cusLN = ?, cusPhone = ?, cusAddress = ?, cusGender = ?, cusDL = ?
            WHERE cusID = ?
        `;
        
        // 👈 เพิ่มตัวแปร cusDL ลงไปใน Array ให้ตรงกับเครื่องหมาย ? 
        await db.query(queryUpdate, [cusFN, cusLN, cusPhone, cusAddress, cusGender, cusDL, cusID]);

        return NextResponse.json({ message: "อัปเดตข้อมูลสำเร็จ" });

    } catch (error) {
        console.error("Update Profile Error:", error);
        return NextResponse.json({ message: "เกิดข้อผิดพลาดในการอัปเดตข้อมูล" }, { status: 500 });
    }
}