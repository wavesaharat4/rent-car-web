import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// 📌 1. ฟังก์ชันดึงข้อมูล (GET) ตอนโหลดหน้าเว็บ
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const email = searchParams.get("email");

        // 🌟 กรณีที่ 1: ถ้ามี email ส่งมา = ดึงข้อมูลลูกค้าแค่ "คนเดียว" (สำหรับหน้า Profile ลูกค้า)
        if (email) {
            const query = "SELECT * FROM customer WHERE cusMail = ?";
            const [rows]: any = await db.query(query, [email]);

            if (rows.length === 0) {
                return NextResponse.json({ message: "ไม่พบข้อมูลลูกค้า" }, { status: 404 });
            }
            return NextResponse.json(rows[0]);
        }

        // 🌟 กรณีที่ 2: ถ้าไม่มี email ส่งมาเลย = ดึงข้อมูลลูกค้า "ทั้งหมด" (สำหรับหน้ารายชื่อของพนักงาน CS)
        const queryAll = "SELECT * FROM customer ORDER BY cusCreate DESC";
        const [allRows]: any = await db.query(queryAll);

        // ส่งกลับไปเป็น Array ก้อนใหญ่
        return NextResponse.json(allRows);

    } catch (error) {
        console.error("Get Profile Error:", error);
        return NextResponse.json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูล" }, { status: 500 });
    }
}

// 📌 2. ฟังก์ชันอัปเดตข้อมูล (PUT) ปล่อยไว้เหมือนเดิมได้เลยครับ...
// export async function PUT(req: Request) { ... }

// 📌 2. ฟังก์ชันอัปเดตข้อมูล (PUT) ตอนกดปุ่มบันทึก
export async function PUT(req: Request) {
    try {
        // 🌟 เพิ่ม cusPassport เข้ามารับค่า
        const { cusID, cusFN, cusLN, cusPhone, cusAddress, cusGender, cusDL, cusPassport } = await req.json();

        // 🌟 เพิ่ม cusPassport = ? ในคำสั่ง SQL
        const queryUpdate = `
            UPDATE customer 
            SET cusFN = ?, cusLN = ?, cusPhone = ?, cusAddress = ?, cusGender = ?, cusDL = ?, cusPassport = ?
            WHERE cusID = ?
        `;

        // 🌟 เพิ่มตัวแปร cusPassport ลงไปใน Array
        await db.query(queryUpdate, [cusFN, cusLN, cusPhone, cusAddress, cusGender, cusDL, cusPassport, cusID]);

        return NextResponse.json({ message: "อัปเดตข้อมูลสำเร็จ" });

    } catch (error) {
        console.error("Update Profile Error:", error);
        return NextResponse.json({ message: "เกิดข้อผิดพลาดในการอัปเดตข้อมูล" }, { status: 500 });
    }
}