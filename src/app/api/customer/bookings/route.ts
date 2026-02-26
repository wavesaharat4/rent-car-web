import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
    try {
        // รับค่า userId (cusID) จาก URL Parameter
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json({ message: "ไม่พบ User ID" }, { status: 400 });
        }

        // 📌 คำสั่ง SQL: ดึงข้อมูลการจอง (booking) มาเชื่อมกับข้อมูลรถ (car)
        const query = `
            SELECT b.*, c.carBrand, c.carType, c.carPicture
            FROM booking b
            LEFT JOIN car c ON b.carID = c.carID
            WHERE b.cusID = ?
            ORDER BY b.bookID DESC
        `;
        const [rows]: any = await db.query(query, [userId]);

        return NextResponse.json(rows);

    } catch (error) {
        console.error("Get Bookings Error:", error);
        return NextResponse.json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลการจอง" }, { status: 500 });
    }
}