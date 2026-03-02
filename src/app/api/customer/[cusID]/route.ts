// ไฟล์: src/app/api/customer/[cusID]/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db"; 

// 📌 1. ฟังก์ชันดึงข้อมูล (GET)
export async function GET(req: Request, { params }: { params: Promise<{ cusID: string }> }) {
    try {
        const resolvedParams = await params;
        const cusID = resolvedParams.cusID;

        if (!cusID) return NextResponse.json({ message: "ไม่พบรหัสลูกค้า (cusID)" }, { status: 400 });

        const query = "SELECT * FROM customer WHERE cusID = ?";
        const [rows]: any = await db.query(query, [cusID]);

        if (rows.length === 0) return NextResponse.json({ message: "ไม่พบข้อมูลลูกค้า" }, { status: 404 });

        return NextResponse.json(rows[0]);

    } catch (error) {
        console.error("Get Customer Detail Error:", error);
        return NextResponse.json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลลูกค้า" }, { status: 500 });
    }
}

// 📌 2. ฟังก์ชันอัปเดตสถานะ (PUT)
export async function PUT(req: Request, { params }: { params: Promise<{ cusID: string }> }) {
    try {
        const resolvedParams = await params;
        const cusID = resolvedParams.cusID;
        
        const body = await req.json();
        const { cusStatus } = body;

        if (!cusID || !cusStatus) {
            return NextResponse.json({ message: "ข้อมูลไม่ครบถ้วน" }, { status: 400 });
        }

        const query = "UPDATE customer SET cusStatus = ? WHERE cusID = ?";
        await db.query(query, [cusStatus, cusID]);

        return NextResponse.json({ ok: true, message: "อัปเดตสถานะสำเร็จ" });

    } catch (error) {
        console.error("Update Customer Status Error:", error);
        return NextResponse.json({ message: "เกิดข้อผิดพลาดในการอัปเดตสถานะ" }, { status: 500 });
    }
}

// 📌 3. ฟังก์ชันลบข้อมูลลูกค้า (DELETE)
export async function DELETE(req: Request, { params }: { params: Promise<{ cusID: string }> }) {
    try {
        const resolvedParams = await params;
        const cusID = resolvedParams.cusID;

        if (!cusID) {
            return NextResponse.json({ message: "ไม่พบรหัสลูกค้า" }, { status: 400 });
        }

        /* ⚠️ (Force Delete): 
        ถ้าต้องการบังคับลบจริงๆ (ลบใบจองของลูกค้าคนนี้ทิ้งให้หมดก่อนลบลูกค้า)  
        */
        // await db.query("DELETE FROM booking WHERE cusID = ?", [cusID]);

        // คำสั่งลบลูกค้า
        const query = "DELETE FROM customer WHERE cusID = ?";
        await db.query(query, [cusID]);

        return NextResponse.json({ ok: true, message: "ลบข้อมูลลูกค้าสำเร็จ" });

    } catch (error: any) {
        console.error("Delete Customer Error:", error);

        // 🌟 ดักจับ Error 1451 (Foreign Key Constraint fails)
        if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.errno === 1451) {
            return NextResponse.json({ 
                ok: false, 
                message: "ไม่สามารถลบได้! เนื่องจากลูกค้ารายนี้มีประวัติการจองรถอยู่ในระบบ" // ต้องลบประวัติการจองของลูกค้าคนนี้ก่อนถึงจะลบลูกค้าได้
            }, { status: 400 });
        }

        return NextResponse.json({ ok: false, message: "เกิดข้อผิดพลาดในการลบข้อมูล" }, { status: 500 });
    }
}