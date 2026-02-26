import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";

const parseCarId = (raw: string) => {
  const id = parseInt(raw, 10);
  return Number.isNaN(id) ? null : id;
};

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params; // ✅ ต้อง await
    const carID = parseCarId(id);

    if (carID == null) {
      return NextResponse.json(
        { ok: false, message: `carID ไม่ถูกต้อง: ${id}` },
        { status: 400 }
      );
    }

    const body = await req.json();

    const allowed = [
      "empID",
      "carPlate",
      "carBrand",
      "carType",
      "carSeat",
      "carGear",
      "carPower",
      "carDetail",
      "carPrice",
      "carProvince",
      "carVIN",
      "carPicture",
      "carStatus",
    ] as const;

    const sets: string[] = [];
    const values: any[] = [];

    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(body, key)) {
        sets.push(`${key} = ?`);
        values.push(body[key]);
      }
    }

    if (sets.length === 0) {
      return NextResponse.json(
        { ok: false, message: "ไม่มีข้อมูลให้แก้ไข" },
        { status: 400 }
      );
    }

    const [result]: any = await db.execute(
      `UPDATE car SET ${sets.join(", ")} WHERE carID = ?`,
      [...values, carID]
    );

    if (!result?.affectedRows) {
      return NextResponse.json(
        { ok: false, message: "ไม่พบรถคันนี้" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, message: err?.message ?? "DB error" },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params; // ✅ ต้อง await
    const carID = parseCarId(id);

    if (carID == null) {
      return NextResponse.json(
        { ok: false, message: `carID ไม่ถูกต้อง: ${id}` },
        { status: 400 }
      );
    }

    const [result]: any = await db.execute(
      `UPDATE car SET carStatus = 'Retired' WHERE carID = ?`,
      [carID]
    );

    if (!result?.affectedRows) {
      return NextResponse.json(
        { ok: false, message: "ไม่พบรถคันนี้" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, message: err?.message ?? "DB error" },
      { status: 500 }
    );
  }
}
export async function GET(req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const carID = parseCarId(id);

    if (carID == null) {
      return NextResponse.json(
        { ok: false, message: `carID ไม่ถูกต้อง: ${id}` },
        { status: 400 }
      );
    }

    // ดึงข้อมูลจากฐานข้อมูลตาม carID
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT * FROM car WHERE carID = ?",
      [carID]
    );

    // ถ้าไม่เจอรถ
    if (rows.length === 0) {
      return NextResponse.json(
        { ok: false, message: "ไม่พบข้อมูลรถคันนี้" },
        { status: 404 }
      );
    }

    // ส่งข้อมูลรถคันแรกกลับไป
    return NextResponse.json({ ok: true, data: rows[0] });

  } catch (err: any) {
    console.error("Fetch Car Error:", err);
    return NextResponse.json(
      { ok: false, message: err?.message ?? "DB error" },
      { status: 500 }
    );
  }
}

