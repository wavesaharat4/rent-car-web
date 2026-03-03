import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";

const REQUIRED_COLUMNS = [
  "tranID",
  "empID",
  "tranType",
  "tranCategory",
  "tranAmount",
  "tranDate",
  "tranDetail",
] as const;

const THAI_NOW_SQL = "CONVERT_TZ(UTC_TIMESTAMP(), '+00:00', '+07:00')";
let cachedTableName: string | null = null;

type TableRow = RowDataPacket & {
  tableName: string;
};

type ExpenseRow = RowDataPacket & {
  tranID: number | string;
  empID: number | string | null;
  tranType: string | null;
  tranCategory: string | null;
  tranAmount: number | string | null;
  tranDate: string | null;
  tranDetail: string | null;
};

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
    throw new Error("ไม่พบตารางรายการธุรกรรมที่รองรับคอลัมน์รายจ่าย");
  }

  cachedTableName = tableName;
  return tableName;
}

export async function GET(req: Request) {
  try {
    const tableName = await resolveTransactionTable();
    const { searchParams } = new URL(req.url);
    const q = normalizeText(searchParams.get("q"))?.toLowerCase() || "";

    const filters: string[] = ["LOWER(COALESCE(tranType, '')) = 'expense'"];
    const params: unknown[] = [];

    if (q) {
      filters.push(
        `(CAST(tranID AS CHAR) LIKE ? OR
          LOWER(COALESCE(tranCategory, '')) LIKE ? OR
          LOWER(COALESCE(tranDetail, '')) LIKE ? OR
          DATE_FORMAT(tranDate, '%Y-%m-%d %H:%i:%s') LIKE ?)`
      );
      const like = `%${q}%`;
      params.push(like, like, like, like);
    }

    const [rows] = await db.query<ExpenseRow[]>(
      `SELECT
          CAST(tranID AS SIGNED) AS tranID,
          CAST(empID AS SIGNED) AS empID,
          tranType,
          tranCategory,
          CAST(tranAmount AS DECIMAL(10,2)) AS tranAmount,
          tranDate,
          tranDetail
       FROM \`${tableName}\`
       WHERE ${filters.join(" AND ")}
       ORDER BY tranDate DESC, tranID DESC
       LIMIT 300`,
      params
    );

    const normalized = rows.map((row) => ({
      tranID: Number(row.tranID) || 0,
      empID: row.empID == null ? null : Number(row.empID),
      tranType: row.tranType || "expense",
      tranCategory: row.tranCategory || "",
      tranAmount: Number(row.tranAmount) || 0,
      tranDate: row.tranDate,
      tranDetail: row.tranDetail || "",
    }));

    return NextResponse.json({ ok: true, data: normalized });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "โหลดรายจ่ายไม่สำเร็จ",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const tableName = await resolveTransactionTable();
    const body = await req.json();

    const empID = toFiniteNumber(body?.empID);
    const tranCategory = normalizeText(body?.tranCategory);
    const tranAmount = toFiniteNumber(body?.tranAmount);
    const tranDetail = normalizeText(body?.tranDetail);
    const tranDate = normalizeDateTimeInput(body?.tranDate);

    if (!empID || empID <= 0) {
      return NextResponse.json(
        { ok: false, message: "empID ไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    if (!tranCategory) {
      return NextResponse.json(
        { ok: false, message: "กรุณาระบุประเภทรายจ่าย" },
        { status: 400 }
      );
    }

    if (!tranAmount || tranAmount <= 0) {
      return NextResponse.json(
        { ok: false, message: "จำนวนเงินต้องมากกว่า 0" },
        { status: 400 }
      );
    }

    const values: unknown[] = [empID, tranCategory, tranAmount, tranDetail];
    const dateSql = tranDate ? "?" : THAI_NOW_SQL;
    if (tranDate) {
      values.splice(3, 0, tranDate);
    }

    const [result] = await db.execute<ResultSetHeader>(
      `INSERT INTO \`${tableName}\`
        (empID, tranType, tranCategory, tranAmount, tranDate, tranDetail)
       VALUES (?, 'expense', ?, ?, ${dateSql}, ?)`,
      values
    );

    return NextResponse.json({ ok: true, tranID: result.insertId });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "เพิ่มรายจ่ายไม่สำเร็จ",
      },
      { status: 500 }
    );
  }
}
