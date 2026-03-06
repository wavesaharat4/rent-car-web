import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// ===================================================================
// 📌 GET /api/bookings — ดึงข้อมูล booking (พร้อม Lazy Check หมดเวลา)
// ===================================================================
export async function GET(req: Request) {
  try {
    // 1. Lazy Check & Stock Recovery: 
    // ค้นหาการจองที่ Pending เกิน 1 ชม. เพื่อเอามาคืนสต็อกแอดออนก่อนจะยกเลิก
    const [expiredBookings]: any = await db.query(`
      SELECT b.bookID 
      FROM booking b 
      WHERE b.bookStatus = 'Pending' 
      AND b.bookCreate < DATE_SUB(NOW(), INTERVAL 1 HOUR)
    `);

    if (expiredBookings.length > 0) {
      for (const b of expiredBookings) {
        // คืนสต็อกแอดออนตามจำนวนที่เคยจองไว้
        await db.query(`
          UPDATE addon a
          JOIN bookingaddon ba ON a.addonID = ba.addonID
          SET a.addonQuantity = a.addonQuantity + ba.bookingaddQuan
          WHERE ba.bookID = ?
        `, [b.bookID]);
        
        // เปลี่ยนสถานะเป็น Cancelled
        await db.query(`UPDATE booking SET bookStatus = 'Cancelled' WHERE bookID = ?`, [b.bookID]);
      }
    }

    const { searchParams } = new URL(req.url);
    const cusID = searchParams.get("cusID");

    let query = `
      SELECT 
          b.*, 
          car.carBrand, car.carType, car.carPicture,
          p.payID, p.payMethod, p.payStatus, p.payAmount,
          cust.cusFN, cust.cusLN
      FROM booking b
      LEFT JOIN car ON b.carID = car.carID
      LEFT JOIN payment p ON b.bookID = p.bookID
      LEFT JOIN customer cust ON b.cusID = cust.cusID
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

// ===================================================================
// 📌 POST /api/bookings — สร้างการจองใหม่ & หักสต็อกแอดออน
// ===================================================================
export async function POST(req: Request) {
  let connection;
  try {
    const body = await req.json();
    const {
      cusID, carID, proID, bookCarPrice, bookTotalPrice,
      bookStart, bookEnd, bookSProvice, bookEProvince, addons
    } = body;

    connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // 1. INSERT booking
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

      // 2. จัดการแอดออนและหักสต็อก
      if (addons && addons.length > 0) {
        for (const item of addons) {
          // 🌟 2.1 ตรวจสอบสต็อกก่อนหัก (ป้องกันกรณีโดนแย่งกดบิลสุดท้ายพร้อมกัน)
          const [addonRow]: any = await connection.query(
            "SELECT addonQuantity, addonName FROM addon WHERE addonID = ? FOR UPDATE", 
            [item.addonID]
          );

          if (!addonRow[0] || addonRow[0].addonQuantity < item.quantity) {
            throw new Error(`ขออภัย อุปกรณ์ ${addonRow[0]?.addonName || ''} ไม่เพียงพอในขณะนี้`);
          }

          // 🌟 2.2 หักสต็อกแอดออน
          await connection.query(
            "UPDATE addon SET addonQuantity = addonQuantity - ? WHERE addonID = ?",
            [item.quantity, item.addonID]
          );

          // 2.3 บันทึกรายการลง bookingaddon
          await connection.query(
            `INSERT INTO bookingaddon (bookID, addonID, bookingaddQuan, bookaddPrice) 
             VALUES (?, ?, ?, ?)`,
            [newBookID, item.addonID, item.quantity, item.price]
          );
        }
      }

      await connection.commit();
      return NextResponse.json({ ok: true, bookID: newBookID });

    } catch (err: any) {
      if (connection) await connection.rollback();
      console.error("Internal Transaction Error:", err);
      return NextResponse.json({ ok: false, error: err.message }, { status: 400 }); // ส่ง Error 400 ถ้าสต็อกไม่พอ
    } finally {
      if (connection) connection.release();
    }
  } catch (error: any) {
    console.error("API Route Error:", error);
    return NextResponse.json({ ok: false, error: "ไม่สามารถดำเนินการจองได้ในขณะนี้" }, { status: 500 });
  }
}
// ===================================================================
// 📌 PUT /api/bookings — อัปเดตสถานะการจอง (สำหรับพนักงาน CS)
// ===================================================================
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