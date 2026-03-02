import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// ===================================================================
// 📌 POST /api/payment/confirm-cash
// พนักงานกดยืนยันว่าลูกค้าจ่ายเงินสดแล้ว
// → UPDATE payment → approved, UPDATE booking → Confirmed, ล็อกรถ
// ===================================================================

export async function POST(req: Request) {
    try {
        const { payID, payNote } = await req.json();

        if (!payID) {
            return NextResponse.json(
                { ok: false, error: "กรุณาส่ง payID" },
                { status: 400 }
            );
        }

        // ===== 1. ดึง payment มาเช็ค =====
        const [payRows]: any = await db.query(
            "SELECT * FROM payment WHERE payID = ?",
            [payID]
        );
        if (payRows.length === 0) {
            return NextResponse.json({ ok: false, error: "ไม่พบข้อมูลการชำระเงิน" }, { status: 404 });
        }
        const payment = payRows[0];

        if (payment.payStatus !== "pending") {
            return NextResponse.json(
                { ok: false, error: `รายการนี้มีสถานะ "${payment.payStatus}" แล้ว` },
                { status: 400 }
            );
        }

        // ===== 2. อัปเดตทั้ง payment + booking + car ใน Transaction =====
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            // อัป payment → approved
            await connection.query(
                "UPDATE payment SET payStatus = 'approved', payNote = ? WHERE payID = ?",
                [payNote || "พนักงานยืนยันรับเงินสดแล้ว", payID]
            );

            // อัป booking → Confirmed
            await connection.query(
                "UPDATE booking SET bookStatus = 'Confirmed' WHERE bookID = ?",
                [payment.bookID]
            );

            // ดึง carID จาก booking แล้วล็อกรถ
            const [bookRows]: any = await connection.query(
                "SELECT carID FROM booking WHERE bookID = ?",
                [payment.bookID]
            );
            if (bookRows.length > 0) {
                await connection.query(
                    "UPDATE car SET carStatus = 'Unavailable' WHERE carID = ?",
                    [bookRows[0].carID]
                );
            }

            await connection.commit();

            return NextResponse.json({
                ok: true,
                message: "✅ ยืนยันรับเงินสดสำเร็จ! การจองเปลี่ยนเป็น Confirmed แล้ว",
            });
        } catch (err: any) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    } catch (error: any) {
        console.error("Confirm Cash Error:", error);
        return NextResponse.json(
            { ok: false, error: "เกิดข้อผิดพลาด: " + error.message },
            { status: 500 }
        );
    }
}
