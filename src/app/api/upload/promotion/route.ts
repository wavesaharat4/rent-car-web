import { NextResponse } from "next/server";

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
                { ok: false, message: "ไม่พบไฟล์รูปโปรโมชั่น" },
                { status: 400 }
            );
        }

        const ext = file.name.split(".").pop() || "jpg";
        const fileName = `promo_${Date.now()}.${ext}`; 

        const encodedBucket = encodeURIComponent(bucket);
        
        // 🌟 แก้ไขการสร้าง Path เพื่อให้มันเข้าไปอยู่ในโฟลเดอร์ promotions จริงๆ 
        // (ไม่ใช้ encodeURIComponent กับเครื่องหมาย / )
        const path = `promotions/${encodeURIComponent(fileName)}`;

        const uploadUrl = `${supabaseUrl}/storage/v1/object/${encodedBucket}/${path}`;
        
        // 🌟 ดึงข้อมูลไฟล์
        const arrayBuffer = await file.arrayBuffer();

        const uploadRes = await fetch(uploadUrl, {
            method: "POST",
            headers: {
                apikey: serviceRoleKey,
                Authorization: `Bearer ${serviceRoleKey}`,
                "x-upsert": "true",
                "Content-Type": file.type || "application/octet-stream",
            },
            // 🌟 ส่ง arrayBuffer ตรงๆ เลย (ไม่ใช้ Buffer.from ป้องกัน Server Error)
            body: arrayBuffer, 
        });

        if (!uploadRes.ok) {
            const msg = await uploadRes.text();
            return NextResponse.json(
                { ok: false, message: `อัปโหลดสลิปไม่สำเร็จ: ${msg}` },
                { status: 500 }
            );
        }

        // สร้าง Public URL
        const publicUrl = `${supabaseUrl}/storage/v1/object/public/${encodedBucket}/${path}`;
        return NextResponse.json({ ok: true, url: publicUrl });
        
    } catch (err: any) {
        console.error("API Upload Error:", err);
        return NextResponse.json(
            { ok: false, message: err?.message ?? "Upload failed" },
            { status: 500 }
        );
    }
}   