// =============================================================
// 📦 API: /api/accounting/income/pending
// หน้าที่: จัดการรายการรอตรวจสอบ (Pending Payments)
// - GET: ดึงรายการ payment ที่ payStatus = 'pending'
// - PUT: อนุมัติ (Approve) หรือ ปฏิเสธ (Reject)
//   (ถ้า Approve จะแอบเอาไปบันทึกลงตาราง transaction ด้วย)
// =============================================================

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

// =============================================================
// GET: ดึงรายการรอตรวจสอบทั้งหมด
// =============================================================
export async function GET(req: Request) {
  try {
    const query = `
      SELECT 
        p.payID, p.bookID, p.payMethod, p.payStatus, p.payAmount,
        p.payImage, p.payReference, p.senderName, p.payTime, p.payNote,
        b.bookStatus, b.bookStart, b.bookEnd,
        c.cusFN, c.cusLN
      FROM payment p
      JOIN booking b ON p.bookID = b.bookID
      JOIN customer c ON b.cusID = c.cusID
      WHERE p.payStatus IN ('pending', 'approved')
        AND NOT EXISTS (
          SELECT 1 FROM \`transaction\` t 
          WHERE t.tranDetail LIKE CONCAT('%BKN-', p.bookID, '%')
        )
      ORDER BY p.payCreatedAt DESC
    `;
    const [rows] = await db.query<RowDataPacket[]>(query);

    return NextResponse.json({ ok: true, data: rows });
  } catch (err: any) {
    console.error("Get Pending Payments Error:", err);
    return NextResponse.json(
      { ok: false, message: err.message || "Failed to fetch pending payments" },
      { status: 500 }
    );
  }
}

// =============================================================
// PUT: จัดการ Approve หรือ Reject
// ต้องส่ง { payID, action: 'approve' | 'reject', empID }
// =============================================================
export async function PUT(req: Request) {
  let connection;
  try {
    const body = await req.json();
    const { payID, action, empID } = body;

    if (!payID || !action || !empID) {
      return NextResponse.json(
        { ok: false, message: "ข้อมูลไม่ครบถ้วน (payID, action, empID)" },
        { status: 400 }
      );
    }

    if (action !== "approve" && action !== "reject") {
      return NextResponse.json(
        { ok: false, message: "action ต้องเป็น 'approve' หรือ 'reject'" },
        { status: 400 }
      );
    }

    // ดึงข้อมูล payment เดิมขึ้นมาดูก่อนว่ามีอยู่จริงและ pending อยู่ไหม
    const [pRows] = await db.query<RowDataPacket[]>(
      `SELECT * FROM payment WHERE payID = ?`,
      [payID]
    );

    if (pRows.length === 0) {
      return NextResponse.json({ ok: false, message: "ไม่พบข้อมูล Payment นี้" }, { status: 404 });
    }

    const payData = pRows[0];
    if (payData.payStatus === "rejected") {
      return NextResponse.json({ ok: false, message: "รายการนี้ถูกปฏิเสธไปแล้ว" }, { status: 400 });
    }

    // --- เริ่มกระบวนการ Transaction ของ SQL เพื่อให้ปลอดภัย ---
    // (ถ้าเกิดพังกลางคัน จะได้ยกเลิกทั้งหมด ไม่บันทึกครึ่งๆ กลางๆ)
    connection = await db.getConnection();
    await connection.beginTransaction();

    if (action === "approve") {
      // 1. อัปเดต payment เป็น 'approved'
      await connection.execute(`UPDATE payment SET payStatus = 'approved' WHERE payID = ?`, [payID]);

      // 2. อัปเดต booking เป็น 'Confirmed' (ถ้าเดิมเป็น Pending) 
      // หรือไม่ต้องอัปเดตถ้ามัน Active/Completed ไปแล้ว
      await connection.execute(
        `UPDATE booking SET bookStatus = 'Confirmed' WHERE bookID = ? AND bookStatus = 'Pending'`,
        [payData.bookID]
      );

      // 3. เช็คว่ามีใน transaction หรือยัง (กันกดเบิ้ล)
      const [tranExist] = await connection.query<RowDataPacket[]>(
        `SELECT tranID FROM \`transaction\` WHERE tranDetail LIKE CONCAT('%BKN-', ?, '%')`,
        [payData.bookID]
      );

      if (tranExist.length === 0) {
        // บันทึกรายรับลงตาราง transaction อัตโนมัติ!
        const detail = `รายรับจากการเช่ารถ (Booking: BKN-${payData.bookID}, Method: ${payData.payMethod})`;
        
        await connection.execute<ResultSetHeader>(
          `INSERT INTO \`transaction\` 
            (empID, tranType, tranCategory, tranAmount, tranDate, tranDetail)
           VALUES (?, 'income', 'ค่าเช่ารถ', ?, CONVERT_TZ(UTC_TIMESTAMP(), '+00:00', '+07:00'), ?)`,
          [empID, payData.payAmount, detail]
        );
      }

    } else if (action === "reject") {
      // 1. อัปเดต payment เป็น 'rejected'
      await connection.execute(`UPDATE payment SET payStatus = 'rejected' WHERE payID = ?`, [payID]);
      
      // 2. ถ้าปฏิเสธยอดเงิน ให้ตั้งสถานะ Booking กลับไปเป็น Pending หรือ Cancelled 
      await connection.execute(`UPDATE booking SET bookStatus = 'Cancelled' WHERE bookID = ?`, [payData.bookID]);
    }

    // ยืนยันการเปลี่ยนแปลงทั้งหมด!
    await connection.commit();

    return NextResponse.json({ ok: true, message: `ทำการ ${action} เรียบร้อยแล้ว` });
  } catch (err: any) {
    if (connection) await connection.rollback(); // ถอยกลับการกระทำทั้งหมด
    console.error("Approve/Reject Error:", err);
    return NextResponse.json(
      { ok: false, message: err.message || "เกิดข้อผิดพลาดในการตรวจสอบ" },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release(); // คืน connection
  }
}
