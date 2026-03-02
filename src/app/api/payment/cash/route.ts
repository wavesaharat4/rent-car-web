import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// ===================================================================
// 📌 POST /api/payment/cash
// ลูกค้าเลือกจ่ายเงินสดหน้าร้าน → สร้าง payment (pending)
// booking ยังเป็น Pending รอพนักงานกดยืนยัน
// ===================================================================

export async function POST(req: Request) {
    try {
        const { bookID, payAmount } = await req.json();

        if (!bookID || !payAmount) {
            return NextResponse.json(
                { ok: false, error: "ข้อมูลไม่ครบ กรุณาส่ง bookID และ payAmount" },
                { status: 400 }
            );
        }

        // ===== 1. เช็คว่า booking ยังเป็น Pending + เช็คเวลา =====
        const [bookRows]: any = await db.query(
            `SELECT b.*, TIMESTAMPDIFF(MINUTE, b.bookCreate, NOW()) AS minutesSinceCreate
       FROM booking b WHERE b.bookID = ?`,
            [bookID]
        );
        if (bookRows.length === 0) {
            return NextResponse.json({ ok: false, error: "ไม่พบข้อมูลการจอง" }, { status: 404 });
        }
        const booking = bookRows[0];
        if (booking.bookStatus !== "Pending") {
            return NextResponse.json(
                { ok: false, error: `การจองนี้มีสถานะ "${booking.bookStatus}" แล้ว` },
                { status: 400 }
            );
        }

        // ===== 2. เช็ค timeout 1 ชม. (ใช้เวลาจาก DB กัน timezone ไม่ตรง) =====
        const diffMinutes = booking.minutesSinceCreate || 0;
        if (diffMinutes > 60) {
            await db.query("UPDATE booking SET bookStatus = 'Cancelled' WHERE bookID = ?", [bookID]);
            return NextResponse.json(
                { ok: false, error: "หมดเวลาชำระเงิน (เกิน 1 ชั่วโมง) การจองถูกยกเลิกแล้ว" },
                { status: 400 }
            );
        }
        // ===== 3. INSERT payment แบบ cash / pending =====
        await db.query(
            `INSERT INTO payment (bookID, payMethod, payStatus, payAmount)
       VALUES (?, 'cash', 'pending', ?)`,
            [bookID, payAmount]
        );

        return NextResponse.json({
            ok: true,
            message: "บันทึกการเลือกจ่ายเงินสดสำเร็จ กรุณาชำระเงินที่หน้าร้าน",
        });
    } catch (error: any) {
        console.error("Cash Payment Error:", error);
        return NextResponse.json(
            { ok: false, error: "เกิดข้อผิดพลาด: " + error.message },
            { status: 500 }
        );
    }
}
