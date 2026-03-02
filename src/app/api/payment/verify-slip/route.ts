import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// ===================================================================
// 📌 POST /api/payment/verify-slip
// ตรวจสลิปผ่าน SlipOK API แล้วบันทึกลง DB
// Flow: รับรูป → ยิง SlipOK → ตรวจชื่อ/เวลา → INSERT payment → UPDATE booking
// ===================================================================

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { bookID, imageUrl, cusName, expectedAmount } = body;
        // bookID       = ID การจอง
        // imageUrl     = URL รูปสลิปจาก Supabase
        // cusName      = ชื่อลูกค้าที่จอง (เอามาเทียบกับชื่อคนโอน)
        // expectedAmount = ยอดเงินที่ต้องจ่าย

        if (!bookID || !imageUrl || !expectedAmount) {
            return NextResponse.json(
                { ok: false, error: "ข้อมูลไม่ครบ กรุณาส่ง bookID, imageUrl, expectedAmount" },
                { status: 400 }
            );
        }

        // ===== 1. เช็คว่า booking นี้ยังเป็น Pending อยู่ไหม + เช็คเวลา =====
        const [bookRows]: any = await db.query(
            `SELECT b.*, TIMESTAMPDIFF(MINUTE, b.bookCreate, NOW()) AS minutesSinceCreate
             FROM booking b WHERE b.bookID = ?`,
            [bookID]
        );
        if (bookRows.length === 0) {
            return NextResponse.json({ ok: false, error: "ไม่พบข้อมูลการจอง" }, { status: 404 });
        }
        const booking = bookRows[0];
        if (booking.bookStatus !== "Pending") {
            return NextResponse.json(
                { ok: false, error: `การจองนี้มีสถานะ "${booking.bookStatus}" แล้ว ไม่สามารถชำระเงินซ้ำได้` },
                { status: 400 }
            );
        }

        // ===== 2. เช็คว่าเกิน 1 ชั่วโมงหรือยัง (ใช้เวลาจาก DB กัน timezone ไม่ตรง) =====
        const diffMinutes = booking.minutesSinceCreate || 0;
        if (diffMinutes > 60) {
            await db.query("UPDATE booking SET bookStatus = 'Cancelled' WHERE bookID = ?", [bookID]);
            return NextResponse.json(
                { ok: false, error: "หมดเวลาชำระเงิน (เกิน 1 ชั่วโมง) การจองถูกยกเลิกแล้ว" },
                { status: 400 }
            );
        }

        const now = Date.now();

        // ===== 3. ยิง SlipOK API ตรวจสลิป =====
        const slipokBranchId = process.env.SLIPOK_BRANCH_ID;
        const slipokApiKey = process.env.SLIPOK_API_KEY;

        if (!slipokBranchId || !slipokApiKey) {
            return NextResponse.json(
                { ok: false, error: "ยังไม่ได้ตั้งค่า SlipOK API (ติดต่อแอดมิน)" },
                { status: 500 }
            );
        }

        const slipokRes = await fetch(
            `https://api.slipok.com/api/line/apikey/${slipokBranchId}`,
            {
                method: "POST",
                headers: {
                    "x-authorization": slipokApiKey,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    url: imageUrl,
                    log: true, // 🔥 เปิด log เพื่อกันสลิปซ้ำ + เช็คบัญชีร้าน
                    amount: Number(expectedAmount), // 🔥 เช็คยอดเงิน
                }),
            }
        );

        const slipokData = await slipokRes.json();

        // ===== 4. กรณี SlipOK คืน Error =====
        if (!slipokRes.ok || slipokData.success === false) {
            const code = slipokData.code;
            let userMessage = "สลิปไม่ถูกต้อง";

            // แปลง Error Code ของ SlipOK เป็นข้อความภาษาไทย
            switch (code) {
                case 1005: userMessage = "ไฟล์ไม่ใช่ไฟล์ภาพ กรุณาอัพโหลดเฉพาะ .jpg .jpeg .png .webp"; break;
                case 1006: userMessage = "รูปภาพไม่ถูกต้อง"; break;
                case 1007: userMessage = "ไม่พบ QR Code ในรูป หรือ QR หมดอายุ"; break;
                case 1008: userMessage = "QR Code นี้ไม่ใช่สลิปชำระเงิน"; break;
                case 1010: userMessage = slipokData.message || "กรุณารอตรวจสอบสลิปอีกครั้งในไม่กี่นาที (ธนาคาร Delay)"; break;
                case 1011: userMessage = "QR Code หมดอายุ หรือไม่มีรายการจริง"; break;
                case 1012: userMessage = "❌ สลิปซ้ำ! สลิปนี้เคยใช้แล้ว"; break;
                case 1013: userMessage = `❌ ยอดเงินไม่ตรง! ต้องโอน ${Number(expectedAmount).toLocaleString()} บาท`; break;
                case 1014: userMessage = "❌ บัญชีผู้รับไม่ตรงกับบัญชีร้าน!"; break;
                default: userMessage = slipokData.message || "สลิปไม่ถูกต้อง กรุณาลองใหม่"; break;
            }

            return NextResponse.json(
                { ok: false, error: userMessage, slipokCode: code },
                { status: 400 }
            );
        }

        // ===== 5. SlipOK ผ่าน → ตรวจเพิ่มเติมเอง =====
        const slipData = slipokData.data;

        // 5a. ตรวจชื่อคนโอน (partial match กับชื่อผู้จอง)
        if (cusName) {
            const senderDisplay = (slipData.sender?.displayName || "").toLowerCase();
            const senderName = (slipData.sender?.name || "").toLowerCase();
            const customerName = cusName.toLowerCase().trim();

            // แยกชื่อลูกค้าเป็นคำๆ แล้วเช็คว่ามีคำไหนตรงกับชื่อในสลิปบ้าง
            const nameParts = customerName.split(/\s+/);
            const nameMatch = nameParts.some(
                (part: string) =>
                    part.length >= 2 && (senderDisplay.includes(part) || senderName.includes(part))
            );

            if (!nameMatch) {
                return NextResponse.json(
                    {
                        ok: false,
                        error: `❌ ชื่อผู้โอนไม่ตรงกับผู้จอง! สลิป: "${slipData.sender?.displayName}" | ผู้จอง: "${cusName}"`,
                    },
                    { status: 400 }
                );
            }
        }

        // 5b. ตรวจเวลาสลิป ห่างจากปัจจุบันไม่เกิน 1 ชั่วโมง
        if (slipData.transTimestamp) {
            const slipTime = new Date(slipData.transTimestamp).getTime();
            const timeDiffMinutes = Math.abs(now - slipTime) / (1000 * 60);
            if (timeDiffMinutes > 60) {
                return NextResponse.json(
                    { ok: false, error: "❌ สลิปนี้เก่าเกินไป (เกิน 1 ชั่วโมง) กรุณาโอนใหม่" },
                    { status: 400 }
                );
            }
        }

        // ===== 6. ทุกอย่างผ่าน → บันทึกลง DB =====
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            // 6a. INSERT ลงตาราง payment
            await connection.query(
                `INSERT INTO payment (bookID, payMethod, payStatus, payAmount, payImage, payReference, senderName, payTime)
         VALUES (?, 'slip', 'approved', ?, ?, ?, ?, ?)`,
                [
                    bookID,
                    slipData.amount,
                    imageUrl,
                    slipData.transRef,
                    slipData.sender?.displayName || null,
                    slipData.transTimestamp ? new Date(slipData.transTimestamp) : new Date(),
                ]
            );

            // 6b. UPDATE booking → Confirmed + ล็อกรถ
            await connection.query(
                "UPDATE booking SET bookStatus = 'Confirmed' WHERE bookID = ?",
                [bookID]
            );
            await connection.query(
                "UPDATE car SET carStatus = 'Unavailable' WHERE carID = ?",
                [booking.carID]
            );

            await connection.commit();

            return NextResponse.json({
                ok: true,
                message: "✅ ชำระเงินสำเร็จ! การจองได้รับการยืนยันแล้ว",
                transRef: slipData.transRef,
                senderName: slipData.sender?.displayName,
                amount: slipData.amount,
            });
        } catch (dbErr: any) {
            await connection.rollback();

            // เช็คว่าเป็น Duplicate transRef (กันสลิปซ้ำระดับ DB)
            if (dbErr.code === "ER_DUP_ENTRY") {
                return NextResponse.json(
                    { ok: false, error: "❌ สลิปนี้เคยใช้ชำระเงินแล้ว (ซ้ำ)" },
                    { status: 400 }
                );
            }
            throw dbErr;
        } finally {
            connection.release();
        }
    } catch (error: any) {
        console.error("Verify Slip Error:", error);
        return NextResponse.json(
            { ok: false, error: "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์: " + error.message },
            { status: 500 }
        );
    }
}
