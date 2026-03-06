import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// 🌟 PUT: แก้ไขข้อมูลโปรโมชั่น
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: proID } = await params; // Next.js 15 ต้องใช้ await
    const body = await req.json();
    
    const { 
      proName, proCode, proDetail, proType, proValue, 
      proMin, proMax, proStart, proEnd, proStatus, proPic 
    } = body;

    // บันทึกข้อมูล โดย proPic จะเป็น URL ที่ได้จากการอัปโหลดไฟล์ (หรือค่าว่างถ้าไม่ได้เลือก)
    const [result]: any = await db.query(
      `UPDATE promotion 
       SET proName=?, proCode=?, proDetail=?, proType=?, proValue=?, 
           proMin=?, proMax=?, proStart=?, proEnd=?, proStatus=?, proPic=?
       WHERE proID=?`,
      [proName, proCode, proDetail, proType, proValue, proMin || 0, proMax || null, proStart, proEnd, proStatus, proPic || '', proID]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ ok: false, error: "ไม่พบข้อมูลที่ต้องการแก้ไข" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, message: "แก้ไขข้อมูลสำเร็จ" });

  } catch (err: any) {
    console.error("Update Promotion Error:", err);
    if (err.code === 'ER_DUP_ENTRY') return NextResponse.json({ ok: false, error: "รหัสโค้ดนี้มีคนใช้แล้ว" }, { status: 400 });
    return NextResponse.json({ ok: false, error: err?.message ?? "Database error" }, { status: 500 });
  }
}

// 🌟 DELETE: ระงับโปรโมชั่น (เปลี่ยนสถานะเป็น inactive)
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: proID } = await params;

    const [result]: any = await db.query(
      `UPDATE promotion SET proStatus = 'inactive' WHERE proID = ?`,
      [proID]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ ok: false, error: "ไม่พบข้อมูลที่ต้องการระงับ" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, message: "ระงับโปรโมชั่นเรียบร้อยแล้ว" });

  } catch (err: any) {
    console.error("Delete Promotion Error:", err);
    return NextResponse.json({ ok: false, error: err?.message ?? "Database error" }, { status: 500 });
  }
}