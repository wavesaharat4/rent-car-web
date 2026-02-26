import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || "car-images";

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
        { ok: false, message: "ไม่พบไฟล์รูป" },
        { status: 400 }
      );
    }

    const filePath = file.name;
    const encodedBucket = encodeURIComponent(bucket);
    const encodedPath = encodeURIComponent(filePath);

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
        { ok: false, message: `อัปโหลด Supabase ไม่สำเร็จ: ${msg}` },
        { status: 500 }
      );
    }

    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${encodedBucket}/${encodedPath}`;
    return NextResponse.json({ ok: true, url: publicUrl, path: filePath });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, message: err?.message ?? "Upload failed" },
      { status: 500 }
    );
  }
}
