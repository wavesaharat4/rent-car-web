// =============================================================
// 📦 API: /api/accounting/booking
// หน้าที่: ดึง + อัปเดตข้อมูลการจอง (Deep Join ทุกตาราง)
// - GET  → ดึง booking + customer + car + payment + addon ทั้งหมด
// - PUT  → แอดมินแก้สถานะจอง / สถานะจ่ายเงิน / เขียนโน้ตบัญชี
// =============================================================

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const year = searchParams.get("year");
    const month = searchParams.get("month");
    const day = searchParams.get("day");
    const status = searchParams.get("status");

    // --- เงื่อนไข Filter ---
    // เริ่มจาก 1=1 (ไม่มีเงื่อนไข) แล้วค่อยเพิ่มตามที่ user เลือก
    let condition = "1=1";
    const params: (string | number)[] = [];

    if (year && !isNaN(Number(year))) {
      condition += " AND YEAR(b.bookStart) = ?";
      params.push(Number(year));
    }
    if (month && !isNaN(Number(month)) && Number(month) >= 1 && Number(month) <= 12) {
      condition += " AND MONTH(b.bookStart) = ?";
      params.push(Number(month));
    }
    if (day && !isNaN(Number(day)) && Number(day) >= 1 && Number(day) <= 31) {
      condition += " AND DAY(b.bookStart) = ?";
      params.push(Number(day));
    }
    // กรองสถานะ เช่น "Pending", "Active,Completed"
    if (status && status !== "All") {
      const statuses = status.split(",").map(s => s.trim());
      condition += ` AND b.bookStatus IN (${statuses.map(() => "?").join(",")})`;
      params.push(...statuses);
    }

    // --- Query หลัก: Join ลูกค้า + รถ + การจ่ายเงิน ---
    const query = `
      SELECT 
          b.bookID, b.bookStatus, b.bookCarPrice, b.bookTotalPrice,
          b.bookStart, b.bookEnd, b.bookCreate, b.proID,
          b.bookSProvice, b.bookEProvince,
          c.cusFN, c.cusLN, c.cusPhone, c.cusMail,
          car.carBrand, car.carType, car.carPlate,
          p.payID, p.payMethod, p.payStatus, p.payAmount, p.payTime, p.payReference, p.payNote
      FROM booking b
      LEFT JOIN customer c ON b.cusID = c.cusID
      LEFT JOIN car car ON b.carID = car.carID
      LEFT JOIN payment p ON b.bookID = p.bookID
      WHERE ${condition}
      ORDER BY b.bookStart DESC
      LIMIT 1500
    `;
    const [bookingRows] = await db.query<RowDataPacket[]>(query, params);

    // --- ดึง Addon สำหรับทุก bookID ที่ได้มา ---
    // ทำแยกเพราะ 1 booking อาจมีหลาย addon (one-to-many)
    const bookIDs = [...new Set(bookingRows.map(r => r.bookID))];
    let addonMap: Record<number, Array<{ addonName: string; addonPrice: number; quantity: number }>> = {};

    if (bookIDs.length > 0) {
      const [addonRows] = await db.query<RowDataPacket[]>(
        `SELECT ba.bookID, a.addonName, a.addonPrice, ba.bookingaddQuan AS quantity
         FROM bookingaddon ba
         LEFT JOIN addon a ON ba.addonID = a.addonID
         WHERE ba.bookID IN (${bookIDs.map(() => "?").join(",")})`,
        bookIDs
      );

      // จัดกลุ่ม addon ตาม bookID เก็บใน Map
      addonRows.forEach((row) => {
        const bID = row.bookID as number;
        if (!addonMap[bID]) addonMap[bID] = [];
        addonMap[bID].push({
          addonName: row.addonName || "Addon",
          addonPrice: Number(row.addonPrice) || 0,
          quantity: Number(row.quantity) || 0,
        });
      });
    }

    // --- รวม addon เข้ากับข้อมูล booking แต่ละแถว ---
    const data = bookingRows.map((row) => ({
      ...row,
      addons: addonMap[row.bookID as number] || [],
    }));

    return NextResponse.json({ ok: true, data });
  } catch (error: unknown) {
    console.error("Get Bookings API Error:", error);
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "โหลดข้อมูลการจองไม่สำเร็จ" },
      { status: 500 }
    );
  }
}

// =============================================================
// PUT: แอดมินแก้สถานะการจอง / สถานะการจ่ายเงิน / เขียนโน้ตบัญชี
// body: { bookID, bookStatus?, payStatus?, payNote? }
// =============================================================
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { bookID, bookStatus, payStatus, payNote } = body;

    if (!bookID) {
      return NextResponse.json({ ok: false, message: "ระบุรหัสการจองไม่ถูกต้อง" }, { status: 400 });
    }

    // อัปเดตสถานะ booking ถ้ามีการส่งมา
    if (bookStatus) {
      await db.execute<ResultSetHeader>(
        "UPDATE booking SET bookStatus = ? WHERE bookID = ?",
        [bookStatus, bookID]
      );
    }

    // อัปเดตข้อมูล payment ถ้ามีการส่งมา
    if (payStatus !== undefined || payNote !== undefined) {
      const updates: string[] = [];
      const vals: (string | number)[] = [];
      if (payStatus !== undefined) { updates.push("payStatus = ?"); vals.push(payStatus); }
      if (payNote !== undefined) { updates.push("payNote = ?"); vals.push(payNote); }

      if (updates.length > 0) {
        vals.push(bookID);
        await db.execute<ResultSetHeader>(
          `UPDATE payment SET ${updates.join(", ")} WHERE bookID = ?`,
          vals
        );
      }
    }

    return NextResponse.json({ ok: true, message: "อัปเดตข้อมูลสำเร็จ" });
  } catch (error: unknown) {
    console.error("Update Booking API Error:", error);
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "อัปเดตข้อมูลไม่สำเร็จ" },
      { status: 500 }
    );
  }
}
