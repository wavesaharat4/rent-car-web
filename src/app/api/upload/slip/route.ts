import { NextResponse } from "next/server";

// ===================================================================
// 📌 POST /api/upload/slip — อัพโหลดรูปสลิปไปเก็บที่ Supabase Storage
// ===================================================================

export async function POST(req: Request) {
    try {
        const supabaseUrl = process.env.SUPABASE_URL;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const bucket = process.env.SUPABASE_STORAGE_BUCKET || "phumjai rent";

        if (!supabaseUrl || !serviceRoleKey) {
            return NextResponse.json(
                { ok: false, message: "Supabase env ยังไม่ครบ" },
                { status: 500 }
            );
        }

        const form = await req.formData();
        const file = form.get("file");

        if (!(file instanceof File)) {
            return NextResponse.json(
                { ok: false, message: "ไม่พบไฟล์รูปสลิป" },
                { status: 400 }
            );
        }

        // ตั้งชื่อไฟล์ไม่ให้ซ้ำ (slip_1709012345678.jpg)
        const ext = file.name.split(".").pop() || "jpg";
        const fileName = `slips/slip_${Date.now()}.${ext}`;
        const encodedBucket = encodeURIComponent(bucket);
        const encodedPath = encodeURIComponent(fileName);

        const uploadUrl = `${supabaseUrl}/storage/v1/object/${encodedBucket}/${encodedPath}`;
        const arrayBuffer = await file.arrayBuffer();

        const uploadRes = await fetch(uploadUrl, {
            method: "POST",
            headers: {
                apikey: serviceRoleKey,
                Authorization: `Bearer ${serviceRoleKey}`,
                "x-upsert": "true",
                "Content-Type": file.type || "application/octet-stream",
            },
            body: Buffer.from(arrayBuffer),
        });

        if (!uploadRes.ok) {
            const msg = await uploadRes.text();
            return NextResponse.json(
                { ok: false, message: `อัปโหลดสลิปไม่สำเร็จ: ${msg}` },
                { status: 500 }
            );
        }

        // สร้าง Public URL สำหรับเข้าถึงรูปสลิป
        const publicUrl = `${supabaseUrl}/storage/v1/object/public/${encodedBucket}/${encodedPath}`;
        return NextResponse.json({ ok: true, url: publicUrl });
    } catch (err: any) {
        return NextResponse.json(
            { ok: false, message: err?.message ?? "Upload failed" },
            { status: 500 }
        );
    }
}
