import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET() {
    try {
        // ดึงข้อมูลรถทั้งหมดที่สถานะเป็น 'active' (พร้อมใช้งาน)
        const [rows] = await db.query<RowDataPacket[]>(
            "SELECT * FROM car ORDER BY carID DESC"
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
            carSeat = null,
            carGear = null,
            carPower = null,
            carDetail = null,
            carQuantity = null,
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
        (empID, carPlate, carBrand, carType, carSeat, carGear, carPower, carDetail,
         carQuantity, carPrice, carProvince, carVIN, carPicture, carStatus)
       VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                empID,
                carPlate,
                carBrand,
                carType,
                carSeat,
                carGear,
                carPower,
                carDetail,
                carQuantity,
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