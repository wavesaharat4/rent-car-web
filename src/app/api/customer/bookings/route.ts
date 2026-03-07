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

        // 📌 1. ดึงข้อมูลการจอง (booking) มาเชื่อมกับข้อมูลรถ (car)
        const query = `
            SELECT b.*, c.carBrand, c.carType, c.carPicture
            FROM booking b
            LEFT JOIN car c ON b.carID = c.carID
            WHERE b.cusID = ?
            ORDER BY b.bookID DESC
        `;
        const [bookings]: any = await db.query(query, [userId]);

        // ถ้าไม่มีประวัติการจองเลย ให้ส่ง Array ว่างกลับไปทันที
        if (bookings.length === 0) {
            return NextResponse.json([]);
        }

        // 📌 2. ดึงข้อมูล Addons ทั้งหมดที่อยู่ในกลุ่มการจองเหล่านี้
        // สกัดเอาเฉพาะ bookID ออกมาเป็น Array เพื่อเอาไปใส่ใน IN (...)
        const bookIDs = bookings.map((b: any) => b.bookID);
        
        const addonQuery = `
            SELECT ba.bookID, a.addonName, ba.bookingaddQuan as quantity, ba.bookaddPrice as price
            FROM bookingaddon ba
            JOIN addon a ON ba.addonID = a.addonID
            WHERE ba.bookID IN (?)
        `;
        const [addons]: any = await db.query(addonQuery, [bookIDs]);

        // 📌 3. ประกอบร่าง (Map) เอา Addons ยัดกลับเข้าไปใน Booking แต่ละอันให้ตรงกัน
        const formattedBookings = bookings.map((booking: any) => {
            // กรองเอาเฉพาะแอดออนที่มี bookID ตรงกับการจองคันนี้
            const bookingAddons = addons.filter((a: any) => a.bookID === booking.bookID);
            return {
                ...booking,
                addons: bookingAddons // 🌟 เพิ่มฟิลด์ addons เข้าไปใน Object ของการจอง
            };
        });

        // ส่งข้อมูลที่ประกอบร่างเสร็จสมบูรณ์กลับไปยังหน้าบ้าน
        return NextResponse.json(formattedBookings);

    } catch (error) {
        console.error("Get Bookings Error:", error);
        return NextResponse.json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลการจอง" }, { status: 500 });
    }
}