// =============================================================
// 📦 API: /api/accounting/income
// หน้าที่: จัดการข้อมูลรายรับ (income) จากตาราง transaction
// - GET  → ดึงรายรับทั้งหมดที่ tranType = 'income'
// - POST → เพิ่มรายรับใหม่ลง DB โดยตรง (แอดมินกรอกเอง)
// =============================================================

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";

// --- ตัวแปรช่วยเก็บชื่อตาราง (cache ไว้ไม่ต้องหาใหม่ทุกครั้ง) ---
const REQUIRED_COLUMNS = [
  "tranID", "empID", "tranType", "tranCategory", "tranAmount", "tranDate", "tranDetail",
] as const;
const THAI_NOW_SQL = "CONVERT_TZ(UTC_TIMESTAMP(), '+00:00', '+07:00')";
let cachedTableName: string | null = null;

type TableRow = RowDataPacket & { tableName: string };
type IncomeRow = RowDataPacket & {
  tranID: number | string;
  empID: number | string | null;
  tranType: string | null;
  tranCategory: string | null;
  tranAmount: number | string | null;
  tranDate: string | null;
  tranDetail: string | null;
};

// --- ฟังก์ชันช่วยแปลงค่าต่างๆ ให้ปลอดภัย ---
const toFiniteNumber = (value: unknown): number | null => {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const normalizeText = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
};

const formatSqlDateTime = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const hour = `${date.getHours()}`.padStart(2, "0");
  const minute = `${date.getMinutes()}`.padStart(2, "0");
  const second = `${date.getSeconds()}`.padStart(2, "0");
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
};

// เอาไว้แปลงวันที่จาก input แบบ "2024-01-15T10:30" → "2024-01-15 10:30:00"
const normalizeDateTimeInput = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  const withSpace = trimmed.replace("T", " ");
  const date = new Date(trimmed);
  if (!Number.isNaN(date.getTime())) {
    return formatSqlDateTime(date);
  }

  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(withSpace)) {
    return `${withSpace}:00`;
  }
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(withSpace)) {
    return withSpace;
  }
  return null;
};

// --- ฟังก์ชันหาชื่อตาราง transaction อัตโนมัติ ---
// เผื่อบาง DB ตั้งชื่อต่างกัน เช่น transaction, transactions, tran
async function resolveTransactionTable() {
  if (cachedTableName) return cachedTableName;

  const [rows] = await db.query<TableRow[]>(
    `SELECT table_name AS tableName
     FROM information_schema.columns
     WHERE table_schema = DATABASE()
       AND column_name IN (${REQUIRED_COLUMNS.map(() => "?").join(", ")})
     GROUP BY table_name
     HAVING COUNT(DISTINCT column_name) = ?
     ORDER BY
       CASE
         WHEN table_name IN ('transaction', 'transactions', 'tran') THEN 0
         ELSE 1
       END,
       table_name ASC
     LIMIT 1`,
    [...REQUIRED_COLUMNS, REQUIRED_COLUMNS.length]
  );

  const tableName = rows[0]?.tableName?.trim();
  if (!tableName || !/^[A-Za-z0-9_]+$/.test(tableName)) {
    throw new Error("ไม่พบตารางรายการธุรกรรมที่รองรับคอลัมน์รายรับ");
  }

  cachedTableName = tableName;
  return tableName;
}

// =============================================================
// GET: ดึงรายรับทั้งหมด (tranType = 'income')
// ใช้โชว์ในตาราง + กราฟ + Export CSV
// =============================================================
export async function GET() {
  try {
    const tableName = await resolveTransactionTable();

    // ดึงรายรับทั้งหมด เรียงจากใหม่ → เก่า
    const [rows] = await db.query<IncomeRow[]>(
      `SELECT
          CAST(tranID AS SIGNED) AS tranID,
          CAST(empID AS SIGNED) AS empID,
          tranType,
          tranCategory,
          CAST(tranAmount AS DECIMAL(10,2)) AS tranAmount,
          tranDate,
          tranDetail
       FROM \`${tableName}\`
       WHERE LOWER(COALESCE(tranType, '')) = 'income'
       ORDER BY tranDate DESC, tranID DESC
       LIMIT 500`
    );

    // แปลงข้อมูลให้เป็น format ที่ Frontend ใช้ง่ายๆ
    const normalized = rows.map((row) => ({
      tranID: Number(row.tranID) || 0,
      empID: row.empID == null ? null : Number(row.empID),
      tranType: row.tranType || "income",
      tranCategory: row.tranCategory || "",
      tranAmount: Number(row.tranAmount) || 0,
      tranDate: row.tranDate,
      tranDetail: row.tranDetail || "",
    }));

    return NextResponse.json({ ok: true, data: normalized });
  } catch (error: unknown) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "โหลดรายรับไม่สำเร็จ" },
      { status: 500 }
    );
  }
}

// =============================================================
// POST: เพิ่มรายรับใหม่ (แอดมินกรอกเอง เช่น รับเงินสดจากลูกค้า)
// ต้องส่ง body: { empID, tranCategory, tranAmount, tranDate?, tranDetail? }
// =============================================================
export async function POST(req: Request) {
  try {
    const tableName = await resolveTransactionTable();
    const body = await req.json();

    const empID = toFiniteNumber(body?.empID);
    const tranCategory = normalizeText(body?.tranCategory);
    const tranAmount = toFiniteNumber(body?.tranAmount);
    const tranDetail = normalizeText(body?.tranDetail);
    const tranDate = normalizeDateTimeInput(body?.tranDate);

    // ตรวจสอบข้อมูลก่อนบันทึก
    if (!empID || empID <= 0) {
      return NextResponse.json({ ok: false, message: "empID ไม่ถูกต้อง กรุณาเข้าสู่ระบบใหม่" }, { status: 400 });
    }
    if (!tranCategory) {
      return NextResponse.json({ ok: false, message: "กรุณาระบุประเภทรายรับ" }, { status: 400 });
    }
    if (!tranAmount || tranAmount <= 0) {
      return NextResponse.json({ ok: false, message: "จำนวนเงินต้องมากกว่า 0" }, { status: 400 });
    }

    // สร้าง SQL Insert
    const values: (string | number | null)[] = [empID, tranCategory, tranAmount, tranDetail];
    const dateSql = tranDate ? "?" : THAI_NOW_SQL;
    if (tranDate) {
      values.splice(3, 0, tranDate);
    }

    const [result] = await db.execute<ResultSetHeader>(
      `INSERT INTO \`${tableName}\`
        (empID, tranType, tranCategory, tranAmount, tranDate, tranDetail)
       VALUES (?, 'income', ?, ?, ${dateSql}, ?)`,
      values
    );

    return NextResponse.json({ ok: true, tranID: result.insertId });
  } catch (error: unknown) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "เพิ่มรายรับไม่สำเร็จ" },
      { status: 500 }
    );
  }
}
