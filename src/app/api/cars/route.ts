import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await db.query(
      `SELECT
          CAST(carID AS SIGNED) AS carID,
          CAST(empID AS SIGNED) AS empID,
          carBrand, carType, carSeat, carGear, carPower, carDetail,
          carQuantity, carPrice, carProvince, carVIN, carPicture, carStatus
       FROM car
       ORDER BY carID DESC`
    );

    return NextResponse.json({ ok: true, data: rows });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, message: err?.message ?? "DB error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      empID,
      carBrand = null,
      carType = null,
      carSeat = null,
      carGear = null,
      carPower = null,
      carDetail = null,
      carQuantity = null,
      carPrice = null,
      carProvince = null,
      carVIN = null,
      carPicture = null,
      carStatus = "ACTIVE",
    } = body ?? {};

    if (empID == null) {
      return NextResponse.json(
        { ok: false, message: "ต้องส่ง empID" },
        { status: 400 }
      );
    }

    const [result]: any = await db.execute(
      `INSERT INTO car
        (empID, carBrand, carType, carSeat, carGear, carPower, carDetail,
         carQuantity, carPrice, carProvince, carVIN, carPicture, carStatus)
       VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        empID,
        carBrand,
        carType,
        carSeat,
        carGear,
        carPower,
        carDetail,
        carQuantity,
        carPrice,
        carProvince,
        carVIN,
        carPicture,
        carStatus,
      ]
    );

    return NextResponse.json({ ok: true, carID: result.insertId });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, message: err?.message ?? "DB error" },
      { status: 500 }
    );
  }
}