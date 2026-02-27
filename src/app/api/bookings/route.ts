import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      cusID, carID, proID, bookStatus, bookCarPrice, bookTotalPrice,
      bookStart, bookEnd, bookSProvice, bookEProvince, addons
    } = body;

    // เริ่มต้น Transaction เพื่อให้มั่นใจว่าข้อมูลบันทึกสำเร็จทั้ง 2 ตาราง
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // 1. บันทึกลงตาราง booking
      const [bookResult]: any = await connection.query(
        `INSERT INTO booking (cusID, carID, proID, bookStatus, bookCarPrice, bookTotalPrice, bookStart, bookEnd, bookSProvice, bookEProvince) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [cusID, carID, proID || null, bookStatus, bookCarPrice, bookTotalPrice, bookStart, bookEnd, bookSProvice, bookEProvince]
      );

      const newBookID = bookResult.insertId;

      // 2. บันทึกลงตาราง bookingaddon (ถ้ามีอุปกรณ์เสริม)
      if (addons && addons.length > 0) {
        for (const item of addons) {
          await connection.query(
            `INSERT INTO bookingaddon (bookID, addonID, bookingaddQuan, bookaddPrice) 
             VALUES (?, ?, ?, ?)`,
            [newBookID, item.addonID, item.quantity, item.price]
          );
        }
      }
      //อัปสถานะรถ
      await connection.query(
        `UPDATE car SET carStatus = 'Unavailable' WHERE carID = ?`,
        [carID]
      );

      // ยืนยันการบันทึกข้อมูลทั้งหมดลง Database
      await connection.commit();

      return NextResponse.json({ ok: true, bookID: newBookID });

    } catch (err: any) {
      // หากขั้นตอนใดผิดพลาด ให้ยกเลิกทั้งหมด (รถจะไม่ถูกเปลี่ยนสถานะ และการจองจะไม่ถูกสร้าง)
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