import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const query = `
            SELECT 
                p.payID,
                p.bookID,
                p.payMethod,
                p.payStatus,
                p.payAmount,
                p.payImage,
                p.payReference,
                p.senderName,
                p.payTime,
                p.payNote,
                p.payCreatedAt
            FROM payment p
            ORDER BY p.payCreatedAt DESC
        `;
        const [rows] = await db.query(query);
        return NextResponse.json(rows);
    } catch (error: any) {
        console.error("Failed to fetch payments:", error);
        return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 });
    }
}
