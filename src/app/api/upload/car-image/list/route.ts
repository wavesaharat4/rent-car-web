import { NextResponse } from "next/server";

type SupabaseObject = {
  name?: string;
  id?: string;
  metadata?: {
    mimetype?: string;
  } | null;
};

export async function GET() {
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

    const encodedBucket = encodeURIComponent(bucket);
    const listUrl = `${supabaseUrl}/storage/v1/object/list/${encodedBucket}`;
    const listRes = await fetch(listUrl, {
      method: "POST",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prefix: "",
        limit: 100,
        offset: 0,
        sortBy: { column: "name", order: "desc" },
      }),
    });

    if (!listRes.ok) {
      const msg = await listRes.text();
      return NextResponse.json(
        { ok: false, message: `โหลดรายการรูปไม่สำเร็จ: ${msg}` },
        { status: 500 }
      );
    }

    const rows = (await listRes.json()) as SupabaseObject[];
    const urls = rows
      .filter((row) => !!row?.name)
      .filter((row) => !(row.name as string).endsWith("/"))
      .map(
        (row) =>
          `${supabaseUrl}/storage/v1/object/public/${encodedBucket}/${encodeURIComponent(
            row.name as string
          )}`
      );

    return NextResponse.json({ ok: true, data: urls });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, message: err?.message ?? "Load image list failed" },
      { status: 500 }
    );
  }
}
