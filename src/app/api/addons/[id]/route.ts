import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// 🌟 PUT: สำหรับแอดมิน "แก้ไข" ข้อมูลอุปกรณ์เสริม
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // 🌟 1. ใส่ await ตรงนี้เพื่อแกะค่า id ออกมาจาก Promise
    const { id: addonID } = await params;
    
    const body = await req.json();
    const { addonName, addonDetail, addonQuantity, addonPrice, addonStatus, addonMaxLimit } = body;

    // อัปเดตข้อมูลรวมถึง Status (เผื่ออยากกดเปิดใช้งานใหม่)
    const [result]: any = await db.query(
      `UPDATE addon 
       SET addonName = ?, addonDetail = ?, addonQuantity = ?, addonPrice = ?, addonStatus = ?, addonMaxLimit = ? 
       WHERE addonID = ?`,
      [addonName, addonDetail, addonQuantity, addonPrice, addonStatus || 'Active', addonMaxLimit, addonID]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ ok: false, error: "ไม่พบข้อมูลที่ต้องการแก้ไข" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, message: "แก้ไขข้อมูลสำเร็จ" });

  } catch (err: any) {
    console.error("Update Addon Error:", err);
    return NextResponse.json({ ok: false, error: err?.message ?? "Database error" }, { status: 500 });
  }
}

// 🌟 DELETE: Soft Delete ระงับการแสดงผลโดยปรับสถานะเป็น Inactive
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // 🌟 2. ใส่ await ตรงนี้ด้วยเช่นกัน
    const { id: addonID } = await params;

    // เปลี่ยนสถานะเป็น 'Inactive' แทนการลบข้อมูลจริง
    const [result]: any = await db.query(
      `UPDATE addon SET addonStatus = 'Inactive' WHERE addonID = ?`,
      [addonID]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ ok: false, error: "ไม่พบข้อมูลที่ต้องการระงับ" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, message: "ระงับการแสดงผลเรียบร้อยแล้ว" });

  } catch (err: any) {
    console.error("Delete Addon Error:", err);
    return NextResponse.json({ ok: false, error: err?.message ?? "Database error" }, { status: 500 });
  }
}