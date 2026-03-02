import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ResultSetHeader } from "mysql2";

const THAI_NOW_SQL = "CONVERT_TZ(UTC_TIMESTAMP(), '+00:00', '+07:00')";

const parseEmpId = (raw: string) => {
  const id = Number.parseInt(raw, 10);
  return Number.isNaN(id) ? null : id;
};

type Ctx = { params: Promise<{ id: string }> };

const textOrNull = (value: unknown) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
};

export async function PATCH(req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const empID = parseEmpId(id);

    if (empID == null) {
      return NextResponse.json(
        { ok: false, message: `empID ไม่ถูกต้อง: ${id}` },
        { status: 400 }
      );
    }

    const body = await req.json();

    const allowed = [
      "empFN",
      "empLN",
      "empMail",
      "empPass",
      "empPhone",
      "empDOB",
      "empRole",
      "empStatus",
    ] as const;

    const sets: string[] = [];
    const values: unknown[] = [];

    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(body, key)) {
        const normalized = textOrNull(body[key]);
        const value =
          key === "empRole" || key === "empStatus"
            ? normalized == null
              ? null
              : normalized.toLowerCase()
            : normalized;
        sets.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (sets.length === 0) {
      return NextResponse.json(
        { ok: false, message: "ไม่มีข้อมูลให้แก้ไข" },
        { status: 400 }
      );
    }

    const [result] = await db.execute<ResultSetHeader>(
      `UPDATE employee
       SET ${sets.join(", ")}, empUpdate = ${THAI_NOW_SQL}
       WHERE empID = ?`,
      [...values, empID]
    );

    if (!result?.affectedRows) {
      return NextResponse.json(
        { ok: false, message: "ไม่พบพนักงานคนนี้" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    return NextResponse.json(
      { ok: false, message: err instanceof Error ? err.message : "DB error" },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const empID = parseEmpId(id);

    if (empID == null) {
      return NextResponse.json(
        { ok: false, message: `empID ไม่ถูกต้อง: ${id}` },
        { status: 400 }
      );
    }

    const [result] = await db.execute<ResultSetHeader>(
      `UPDATE employee
       SET empStatus = 'inactive', empUpdate = ${THAI_NOW_SQL}
       WHERE empID = ?`,
      [empID]
    );

    if (!result?.affectedRows) {
      return NextResponse.json(
        { ok: false, message: "ไม่พบพนักงานคนนี้" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    return NextResponse.json(
      { ok: false, message: err instanceof Error ? err.message : "DB error" },
      { status: 500 }
    );
  }
}
