import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET() {
  try {
    const [rows] = await db.query(
      `SELECT
          CAST(carID AS SIGNED) AS carID,
          CAST(empID AS SIGNED) AS empID,
          carPlate, carBrand, carType, carModel, carSeat, carGear, carPower, carDetail,
          carPrice, carProvince, carVIN, carPicture, carStatus
        FROM car
        ORDER BY carID DESC`
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json({ message: "Error fetching cars" }, { status: 500 });
  }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

    const {
      empID,
      carPlate = null,
      carBrand = null,
      carType = null,
      carModel = null,
      carSeat = null,
      carGear = null,
      carPower = null,
      carDetail = null,
      carPrice = null,
      carProvince = null,
      carVIN = null,
      carPicture = null,
      carStatus = "Available",
    } = body ?? {};

        if (empID == null) {
            return NextResponse.json(
                { ok: false, message: "ต้องส่ง empID" },
                { status: 400 }
            );
        }
        if (carVIN == null || !Number.isFinite(Number(carVIN))) {
            return NextResponse.json(
                { ok: false, message: "carVIN ต้องเป็นตัวเลขเท่านั้น และห้ามเว้นว่าง" },
                { status: 400 }
            );
        }
        const [result]: any = await db.execute(
            `INSERT INTO car
        (empID, carPlate, carBrand, carType, carModel, carSeat, carGear, carPower, carDetail,
          carPrice, carProvince, carVIN, carPicture, carStatus)
        VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        empID,
        carPlate,
        carBrand,
        carType,
        carModel,
        carSeat,
        carGear,
        carPower,
        carDetail,
        carPrice,
        carProvince,
        Number(carVIN),
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

// 🌟 เพิ่มฟังก์ชัน PUT สำหรับอัปเดตสถานะรถ (ใช้งานในหน้า cs/cars)
export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const { carID, carStatus } = body;

        // เช็คว่าส่งข้อมูลมาครบไหม
        if (!carID || !carStatus) {
            return NextResponse.json(
                { ok: false, message: "ข้อมูลไม่ครบถ้วน (ต้องการ carID และ carStatus)" }, 
                { status: 400 }
            );
        }

        // อัปเดตสถานะลง Database
        const updateQuery = "UPDATE car SET carStatus = ? WHERE carID = ?";
        await db.execute(updateQuery, [carStatus, carID]);

        return NextResponse.json({ ok: true, message: "อัปเดตสถานะรถเรียบร้อยแล้ว" });

    } catch (error: any) {
        console.error("Update Car Status Error:", error);
        return NextResponse.json(
            { ok: false, message: error?.message ?? "เกิดข้อผิดพลาดในการอัปเดตสถานะ" }, 
            { status: 500 }
        );
    }
}