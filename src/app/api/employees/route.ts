import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";

type EmployeeRow = RowDataPacket & {
  empID: number;
  empFN: string | null;
  empLN: string | null;
  empMail: string | null;
  empPass: string | null;
  empPhone: string | null;
  empDOB: string | null;
  empRole: string | null;
  empStatus: string | null;
  empCreate: string | null;
  empUpdate: string | null;
};

const textOrNull = (value: unknown) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
};

export async function GET() {
  try {
    const [rows] = await db.query<EmployeeRow[]>(
      `SELECT
          CAST(empID AS SIGNED) AS empID,
          empFN, empLN, empMail, empPass, empPhone, empDOB, empRole, empStatus, empCreate, empUpdate
       FROM employee
       ORDER BY empID DESC`
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json({ ok: false, message: "Error fetching employees" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const empFN = textOrNull(body?.empFN);
    const empLN = textOrNull(body?.empLN);
    const empMail = textOrNull(body?.empMail);
    const empPass = textOrNull(body?.empPass);
    const empPhone = textOrNull(body?.empPhone);
    const empDOB = textOrNull(body?.empDOB);
    const empRole = (textOrNull(body?.empRole) || "staff").toLowerCase();
    const empStatus = (textOrNull(body?.empStatus) || "active").toLowerCase();

    if (!empFN || !empLN || !empMail || !empPass) {
      return NextResponse.json(
        { ok: false, message: "ต้องกรอก empFN, empLN, empMail, empPass ให้ครบ" },
        { status: 400 }
      );
    }

    const [exists] = await db.query<RowDataPacket[]>(
      "SELECT empID FROM employee WHERE empMail = ? LIMIT 1",
      [empMail]
    );
    if (exists.length > 0) {
      return NextResponse.json({ ok: false, message: "อีเมลนี้ถูกใช้งานแล้ว" }, { status: 409 });
    }

    const [result] = await db.execute<ResultSetHeader>(
      `INSERT INTO employee
        (empFN, empLN, empMail, empPass, empPhone, empDOB, empRole, empStatus, empCreate, empUpdate)
       VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [empFN, empLN, empMail, empPass, empPhone, empDOB, empRole, empStatus]
    );

    return NextResponse.json({ ok: true, empID: result.insertId });
  } catch (err: unknown) {
    return NextResponse.json(
      { ok: false, message: err instanceof Error ? err.message : "DB error" },
      { status: 500 }
    );
  }
}
