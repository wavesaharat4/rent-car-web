import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// ===================================================================
// 📌 POST /api/bookings — สร้างการจองใหม่ (สถานะ Pending)
// ⚠️ ยังไม่ล็อกรถ! รอจ่ายเงินผ่านแล้วค่อยล็อก (ใน verify-slip / confirm-cash)
// ===================================================================

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      cusID, carID, proID, bookCarPrice, bookTotalPrice,
      bookStart, bookEnd, bookSProvice, bookEProvince, addons
    } = body;

    // เริ่ม Transaction
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // 1. INSERT booking → สถานะ Pending เสมอ (ยังไม่จ่ายเงิน)
      // ถ้าไม่มี proID จะไม่ใส่ในคำสั่ง SQL (กัน NOT NULL error)
      const hasPromo = proID !== null && proID !== undefined;
      const insertSQL = hasPromo
        ? `INSERT INTO booking (cusID, carID, proID, bookStatus, bookCarPrice, bookTotalPrice, bookStart, bookEnd, bookSProvice, bookEProvince) 
           VALUES (?, ?, ?, 'Pending', ?, ?, ?, ?, ?, ?)`
        : `INSERT INTO booking (cusID, carID, bookStatus, bookCarPrice, bookTotalPrice, bookStart, bookEnd, bookSProvice, bookEProvince) 
           VALUES (?, ?, 'Pending', ?, ?, ?, ?, ?, ?)`;
      const insertParams = hasPromo
        ? [cusID, carID, proID, bookCarPrice, bookTotalPrice, bookStart, bookEnd, bookSProvice, bookEProvince]
        : [cusID, carID, bookCarPrice, bookTotalPrice, bookStart, bookEnd, bookSProvice, bookEProvince];

      const [bookResult]: any = await connection.query(insertSQL, insertParams);

      const newBookID = bookResult.insertId;

      // 2. INSERT bookingaddon (ถ้ามี)
      if (addons && addons.length > 0) {
        for (const item of addons) {
          await connection.query(
            `INSERT INTO bookingaddon (bookID, addonID, bookingaddQuan, bookaddPrice) 
             VALUES (?, ?, ?, ?)`,
            [newBookID, item.addonID, item.quantity, item.price]
          );
        }
      }

      // ⚠️ ไม่ UPDATE car เป็น Unavailable แล้ว! รอจ่ายเงินก่อน

      await connection.commit();
      return NextResponse.json({ ok: true, bookID: newBookID });

    } catch (err: any) {
      if (connection) await connection.rollback();
      console.error("Internal Transaction Error:", err);
      return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
    } finally {
      if (connection) connection.release();
    }
  } catch (error: any) {
    console.error("API Route Error:", error);
    return NextResponse.json({ ok: false, error: "ไม่สามารถเชื่อมต่อฐานข้อมูลได้" }, { status: 500 });
  }
}

// ===================================================================
// 📌 GET /api/bookings — ดึงข้อมูล booking (พร้อม Lazy Check หมดเวลา)
// ===================================================================

export async function GET(req: Request) {
  try {
    // Lazy Check: ยกเลิก booking ที่เป็น Pending เกิน 1 ชั่วโมง
    await db.query(`
      UPDATE booking 
      SET bookStatus = 'Cancelled' 
      WHERE bookStatus = 'Pending' 
        AND bookCreate < DATE_SUB(NOW(), INTERVAL 1 HOUR)
    `);

    // ดึงข้อมูลทั้งหมด (หรือตาม query param)
    const { searchParams } = new URL(req.url);
    const cusID = searchParams.get("cusID");

    let query = `
      SELECT b.*, c.carBrand, c.carType, c.carPicture,
             p.payID, p.payMethod, p.payStatus, p.payAmount
      FROM booking b
      LEFT JOIN car c ON b.carID = c.carID
      LEFT JOIN payment p ON b.bookID = p.bookID
    `;
    const params: any[] = [];

    if (cusID) {
      query += " WHERE b.cusID = ?";
      params.push(cusID);
    }
    query += " ORDER BY b.bookID DESC";

    const [rows]: any = await db.query(query, params);
    return NextResponse.json({ ok: true, data: rows });

  } catch (error: any) {
    console.error("Get Bookings Error:", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
