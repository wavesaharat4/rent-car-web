import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// 📌 1. ดึงข้อมูลการจองทั้งหมด (ใช้ JOIN เพื่อเอาชื่อลูกค้าและรุ่นรถมาด้วย)
export async function GET() {
    try {
        const query = `
            SELECT 
                b.bookID, 
                b.bookStart, 
                b.bookEnd, 
                b.bookStatus, 
                b.bookTotalPrice,
                c.cusFN, 
                c.cusLN,
                cr.carBrand
            FROM booking b
            LEFT JOIN customer c ON b.cusID = c.cusID
            LEFT JOIN car cr ON b.carID = cr.carID
            ORDER BY b.bookID DESC
        `;
        
        // หมายเหตุ: ตรงคำว่า `cars cr` ให้เช็คชื่อตารางรถของคุณด้วยนะครับว่าชื่อ cars หรือ car
        const [rows]: any = await db.query(query);

        return NextResponse.json({ ok: true, data: rows });

    } catch (error) {
        console.error("Get Bookings Error:", error);
        return NextResponse.json({ ok: false, message: "เกิดข้อผิดพลาดในการดึงข้อมูลการจอง" }, { status: 500 });
    }
}

// 📌 2. อัปเดตสถานะการจอง (ใช้ตอนที่พนักงาน CS กดปุ่มใน SweetAlert2)
export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const { bookID, bookStatus } = body;

        if (!bookID || !bookStatus) {
            return NextResponse.json({ ok: false, message: "ข้อมูลไม่ครบถ้วน" }, { status: 400 });
        }

        const updateQuery = `
            UPDATE booking 
            SET bookStatus = ? 
            WHERE bookID = ?
        `;
        
        await db.query(updateQuery, [bookStatus, bookID]);

        return NextResponse.json({ ok: true, message: "อัปเดตสถานะเรียบร้อยแล้ว" });

    } catch (error) {
        console.error("Update Booking Status Error:", error);
        return NextResponse.json({ ok: false, message: "เกิดข้อผิดพลาดในการอัปเดตสถานะ" }, { status: 500 });
    }
}