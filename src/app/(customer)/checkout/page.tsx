"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import Swal from "sweetalert2";

// นำเข้า Component
import StepAddons from "@/components/checkout/StepAddons";
import StepReview from "@/components/checkout/StepReview";

export interface CarDB {
  carID: number;
  carBrand: string;
  carType: string;
  carSeat: number;
  carGear: string;
  carPower: string;
  carDetail: string;
  carPrice: number;
  carPicture: string;
  carProvince: string;
}
export interface AddonDB {
  addonID: number;
  addonName: string;
  addonDetail: string;
  addonPrice: number;
  addonQuantity: number;
  addonMaxLimit: number;
}
export interface PromoDB {
  proID: number;
  proName: string;
  proCode: string;
  proType: "percent" | "amount";
  proValue: number;
  proMin: number;
  proMax: number;
  proStart: string;   // 🌟 เพิ่มเข้ามา
  proEnd: string;     // 🌟 เพิ่มเข้ามา
  proStatus: string;  // 🌟 เพิ่มเข้ามา (ตัวที่ทำให้เกิด Error)
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();

  const carIdParam = searchParams.get("carId");
  const pickupLocation = searchParams.get("pickup") || "ไม่ระบุ";
  const dropoffLocation = searchParams.get("dropoff") || "ไม่ระบุ";
  const startDateStr = searchParams.get("start") || "";
  const endDateStr = searchParams.get("end") || "";

  const [step, setStep] = useState(3);
  const [loading, setLoading] = useState(true);

  const [car, setCar] = useState<CarDB | null>(null);
  const [addonsData, setAddonsData] = useState<AddonDB[]>([]);
  const [promosData, setPromosData] = useState<PromoDB[]>([]);
  const [userData, setUserData] = useState<any>(null);

  const [addonCounts, setAddonsCounts] = useState<Record<number, number>>({});
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [selectedPromo, setSelectedPromo] = useState<PromoDB | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"slip" | "cash">("slip");
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [paymentResult, setPaymentResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [bookID, setBookID] = useState<number | null>(null);
  const [paymentDone, setPaymentDone] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phonePrefix: "+66",
    phone: "",
    address: "",
    gender: "ไม่ระบุ",
    driverLicense: "",
    passport: "",
    needTaxInvoice: false,
    flightInfo: "",
    flightNumber: "",
  });
  const [errorMessage, setErrorMessage] = useState("");

  // ==================== Fetch Data ====================
  useEffect(() => {
    const fetchCarData = async () => {
      if (!carIdParam) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        // 🌟 1. เติม ?t=... ต่อท้าย URL เพื่อหลอกเบราว์เซอร์ว่าเป็นลิงก์ใหม่เสมอ (ทะลวง Cache 100%)
        const timestamp = new Date().getTime(); 
        
        const [carRes, addonRes, promoRes] = await Promise.all([
          fetch(`/api/cars/${carIdParam}`, { cache: "no-store" }),
          fetch("/api/addons", { cache: "no-store" }),
          fetch(`/api/promotions?t=${timestamp}`, { cache: "no-store" }), // 👈 ทะลวง Cache ตรงนี้
        ]);
        
        if (carRes.ok) {
          const carJson = await carRes.json();
          if (carJson.ok) setCar(carJson.data);
        }
        
        if (addonRes.ok) {
          const rawAddons = JSON.parse(await addonRes.text());
          // 🌟 [แก้ไขตรงนี้] กรองเอาเฉพาะแอดออนที่จำนวนยังเหลือมากกว่า 0
          const availableAddons = Array.isArray(rawAddons) 
            ? rawAddons.filter((a: AddonDB) => a.addonQuantity > 0)
            : [];
          setAddonsData(availableAddons);
        }
        
        if (promoRes.ok) {
          const promoJson = await promoRes.json();
          let allPromos = [];
          if (Array.isArray(promoJson)) {
            allPromos = promoJson;
          } else if (promoJson.ok && promoJson.data) {
            allPromos = promoJson.data;
          }

          // 🌟 [แก้ไขตรงนี้] กรองเอาเฉพาะอันที่ active ก่อนเซ็ตลง State
          const activePromos = allPromos.filter(
            (p: PromoDB) => p.proStatus?.toLowerCase() === 'active'
          );
          setPromosData(activePromos);
        }
      } catch (error) {
        console.error("Fetch Data Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCarData();
  }, [carIdParam]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (status === "authenticated" && session?.user?.email) {
        try {
          const profileRes = await fetch(
            `/api/customer/profile?email=${session.user.email}`,
            { cache: "no-store" },
          );
          const names = (session?.user?.name || "").trim().split(" ");

          if (profileRes.ok) {
            const data = await profileRes.json();
            setUserData(data);
            setFormData((prev) => ({
              ...prev,
              email: data.cusMail || session.user?.email || "",
              firstName: data.cusFN || names[0] || "",
              lastName: data.cusLN || names.slice(1).join(" ") || "",
              phone: data.cusPhone || "",
              address: data.cusAddress || "",
              driverLicense: data.cusDL || "",
              passport: data.cusPassport || "",
            }));
          }
        } catch (error) {
          console.error(error);
        }
      }
    };
    fetchProfile();
  }, [session, status]);

  // ==================== Calculations ====================
  const days = useMemo(() => {
    if (!startDateStr || !endDateStr) return 1;
    return Math.max(
      1,
      Math.ceil(
        Math.abs(
          new Date(endDateStr).getTime() - new Date(startDateStr).getTime(),
        ) /
        (1000 * 60 * 60 * 24),
      ),
    );
  }, [startDateStr, endDateStr]);

  const carPriceTotal = (car?.carPrice || 0) * days;
  const addonsTotal = Object.entries(addonCounts).reduce(
    (total, [id, count]) => {
      const addon = addonsData.find((a) => a.addonID === Number(id));
      return total + (addon ? addon.addonPrice * count * days : 0);
    },
    0,
  );

  const subTotalBeforeDiscount = carPriceTotal + addonsTotal;
  const discountAmount = useMemo(() => {
    if (!selectedPromo) return 0;
    if (selectedPromo.proType === "percent") {
      const discount = (subTotalBeforeDiscount * selectedPromo.proValue) / 100;
      return selectedPromo.proMax && discount > selectedPromo.proMax
        ? selectedPromo.proMax
        : discount;
    }
    return selectedPromo.proValue;
  }, [selectedPromo, subTotalBeforeDiscount]);

  const subTotal = subTotalBeforeDiscount - discountAmount;
  const vatAmount = Math.round(subTotal * 0.07);
  const grandTotal = subTotal + vatAmount;

  const handleProceedToPayment = async () => {
    setErrorMessage("");
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.phone ||
      !formData.address
    ) {
      setErrorMessage("กรุณากรอกข้อมูลส่วนตัวให้ครบถ้วน");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (!formData.driverLicense && !formData.passport) {
      setErrorMessage("ต้องระบุใบขับขี่หรือพาสปอร์ตอย่างใดอย่างหนึ่ง");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (userData) {
      try {
        await fetch("/api/customer/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cusID: userData.cusID,
            cusFN: formData.firstName,
            cusLN: formData.lastName,
            cusPhone: formData.phone,
            cusAddress: formData.address,
            cusGender: formData.gender,
            cusDL: formData.driverLicense,
            cusPassport: formData.passport,
          }),
        });
      } catch (error) {
        console.error("Failed to save data", error);
      }
    }
    setStep(5);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 📌 สร้าง Booking ก่อน (ยังไม่จ่ายเงิน = Pending)
  const createBooking = async (): Promise<number | null> => {
    const selectedAddons = Object.entries(addonCounts)
      .filter(([_, count]) => count > 0)
      .map(([id, count]) => {
        const addon = addonsData.find((a) => a.addonID === Number(id));
        return { addonID: Number(id), quantity: count, price: addon ? addon.addonPrice : 0 };
      });

    try {
      // เพิ่ม timeout 15 วินาที กันค้าง
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          cusID: userData.cusID,
          carID: car?.carID,
          proID: selectedPromo?.proID || null,
          bookCarPrice: carPriceTotal,
          bookTotalPrice: grandTotal,
          bookStart: startDateStr,
          bookEnd: endDateStr,
          bookSProvice: car?.carProvince,
          bookEProvince: car?.carProvince,
          addons: selectedAddons,
        }),
      });
      clearTimeout(timeoutId);

      const result = await res.json();
      if (result.ok) {
        setBookID(result.bookID);
        return result.bookID;
      }
      await Swal.fire({
        icon: "error",
        title: "สร้างการจองไม่สำเร็จ",
        text: result.error || "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์",
        confirmButtonColor: "#2563eb",
      });
      return null;
    } catch (err: any) {
      console.error("Create Booking Error:", err);
      await Swal.fire({
        icon: "error",
        title: "สร้างการจองไม่สำเร็จ",
        text: err.name === "AbortError"
          ? "การเชื่อมต่อใช้เวลานานเกินไป กรุณาลองใหม่"
          : "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาลองใหม่",
        confirmButtonColor: "#2563eb",
      });
      return null;
    }
  };

  // 📌 จัดการเลือกไฟล์สลิป (แสดง Preview)
  const handleSlipFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSlipFile(file);
      setSlipPreview(URL.createObjectURL(file));
      setPaymentResult(null);
    }
  };

  // 📌 ยิงตรวจสลิป (อัพ Supabase → ตรวจ SlipOK → บันทึก DB)
  const handleVerifySlip = async () => {
    if (!slipFile) return Swal.fire({ icon: "warning", title: "กรุณาเลือกรูปสลิปก่อน", confirmButtonColor: "#2563eb" });
    setVerifying(true);
    setPaymentResult(null);

    try {
      // สร้าง booking ก่อน (ถ้ายังไม่มี)
      let currentBookID = bookID;
      if (!currentBookID) {
        currentBookID = await createBooking();
        if (!currentBookID) { setVerifying(false); return; }
      }

      // 1. อัพโหลดรูปสลิปไป Supabase
      const uploadForm = new FormData();
      uploadForm.append("file", slipFile);
      const uploadRes = await fetch("/api/upload/slip", { method: "POST", body: uploadForm });
      const uploadData = await uploadRes.json();
      if (!uploadData.ok) {
        setPaymentResult({ ok: false, message: "อัพโหลดรูปสลิปไม่สำเร็จ: " + uploadData.message });
        Swal.fire({ icon: "error", title: "อัพโหลดสลิปไม่สำเร็จ", text: uploadData.message, confirmButtonColor: "#2563eb" });
        setVerifying(false);
        return;
      }

      // 2. ส่งไปตรวจสลิป
      const cusName = `${userData?.cusFN || ""} ${userData?.cusLN || ""}`.trim();
      const verifyRes = await fetch("/api/payment/verify-slip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookID: currentBookID,
          imageUrl: uploadData.url,
          cusName: cusName,
          expectedAmount: grandTotal,
        }),
      });
      const verifyData = await verifyRes.json();

      if (verifyData.ok) {
        // ✅ สลิปผ่าน → แสดง Swal สำเร็จ แล้ว redirect ไปหน้าการจองของฉัน
        setPaymentResult({ ok: true, message: verifyData.message });
        setPaymentDone(true);
        await Swal.fire({
          icon: "success",
          title: "ชำระเงินสำเร็จ!",
          html: `
            <p style="margin-bottom:8px">การจองหมายเลข <b>#${currentBookID}</b> ได้รับการยืนยันแล้ว</p>
            <p style="color:#64748b;font-size:14px">เลขอ้างอิง: ${verifyData.transRef || "-"}</p>
            <p style="color:#64748b;font-size:14px">ชื่อผู้โอน: ${verifyData.senderName || "-"}</p>
            <p style="color:#64748b;font-size:14px">จำนวน: ${Number(verifyData.amount || grandTotal).toLocaleString()} บาท</p>
          `,
          confirmButtonText: "ไปหน้าการจองของฉัน",
          confirmButtonColor: "#2563eb",
          allowOutsideClick: false,
        });
        router.push("/my-booking");
      } else {
        // ❌ สลิปไม่ผ่าน → แสดง error ชัดเจน + ให้ส่งสลิปใหม่ได้
        setPaymentResult({ ok: false, message: verifyData.error });
        // รีเซ็ตสลิปเพื่อให้ส่งใหม่ได้
        setSlipFile(null);
        setSlipPreview(null);
        Swal.fire({
          icon: "error",
          title: "สลิปไม่ผ่านการตรวจสอบ",
          html: `<p style="color:#dc2626;font-weight:bold">${verifyData.error}</p><p style="color:#64748b;font-size:14px;margin-top:8px">กรุณาอัพโหลดสลิปใหม่อีกครั้ง</p>`,
          confirmButtonText: "ลองใหม่",
          confirmButtonColor: "#2563eb",
        });
      }
    } catch (err) {
      console.error(err);
      setPaymentResult({ ok: false, message: "เกิดข้อผิดพลาดในการตรวจสลิป" });
      Swal.fire({ icon: "error", title: "เกิดข้อผิดพลาด", text: "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาลองใหม่", confirmButtonColor: "#2563eb" });
    } finally {
      setVerifying(false);
    }
  };

  

  // ==================== RENDER ====================
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  if (!car)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc]">
        <h1>ไม่พบข้อมูลรถ</h1>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#f8fafc] pt-10 pb-24 font-sans text-slate-800">
      {/* 🌟🌟🌟 TOP STEPPER 🌟🌟🌟 */}
      {step < 6 && (
        <div className="bg-white border-b border-slate-200 top-0 z-30 shadow-sm hidden md:block">
          <div className="max-w-[1200px] mx-auto px-4 flex items-center justify-between gap-4 py-4">
            {/* Step 1: สถานที่และวันที่ */}
            <div className="flex items-center gap-3 flex-1 bg-white p-3 rounded-2xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(37,99,235,0.08)]">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg shrink-0">
                1
              </div>
              <div className="text-xs truncate flex-1">
                <div className="flex gap-4">
                  <div>
                    <span className="text-slate-400 block mb-0.5 font-medium">
                      รับรถ
                    </span>
                    <p className="font-bold text-slate-700 truncate text-sm">
                      {car.carProvince}
                    </p>
                    <span className="text-slate-500">
                      {startDateStr ? new Date(startDateStr).toLocaleString("th-TH", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "-"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5 font-medium">
                      คืนรถ
                    </span>
                    <p className="font-bold text-slate-700 truncate text-sm">
                      {car.carProvince}
                    </p>
                    <span className="text-slate-500">
                      {endDateStr ? new Date(endDateStr).toLocaleString("th-TH", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "-"}
                    </span>
                  </div>
                </div>
              </div>
              <Link
                href="/cars"
                className="ml-auto text-blue-600 p-2 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer shrink-0"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-4 h-4"
                >
                  <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32l8.4-8.4z" />
                </svg>
              </Link>
            </div>

            {/* Step 2: รถที่เลือก */}
            <div className="flex items-center gap-3 flex-1 bg-white p-3 rounded-2xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(37,99,235,0.08)]">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg shrink-0">
                2
              </div>
              <div className="text-xs truncate flex-1">
                <span className="text-slate-400 block mb-0.5 font-medium">
                  รถ
                </span>
                <p className="font-bold text-slate-700 text-sm truncate">
                  {car.carBrand}
                </p>
                <span className="text-slate-500 font-medium">
                  {carPriceTotal.toLocaleString()} บาท
                </span>
              </div>
              <button
                onClick={() => window.history.back()}
                className="ml-auto text-blue-600 p-2 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer shrink-0"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-4 h-4"
                >
                  <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32l8.4-8.4z" />
                </svg>
              </button>
            </div>

            {/* 🌟 Step 3: ประกันและอุปกรณ์เสริม (กดแก้ได้ถ้ายืนอยู่ Step 4, 5) */}
            <div
              onClick={() => step > 3 && setStep(3)} // 🌟 ถ้าเลย Step 3 ไปแล้ว ให้คลิกกลับมาได้
              className={`flex items-center gap-3 flex-1 p-3 rounded-2xl transition-all shadow-[0_2px_15px_-3px_rgba(37,99,235,0.08)] ${step === 3 ? "bg-blue-600 text-white border-transparent" : "bg-white border border-slate-100 text-slate-700"} ${step > 3 ? "cursor-pointer hover:bg-blue-50" : ""}`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shrink-0 ${step === 3 ? "bg-white text-blue-600" : "bg-blue-600 text-white"}`}
              >
                3
              </div>
              <div className="font-bold text-sm truncate flex-1">
                ประกันและอุปกรณ์เสริม
              </div>
              {/* 🌟 แสดงไอคอนดินสอ เฉพาะตอนที่ผ่านมาแล้ว */}
              {step > 3 && (
                <button className="ml-auto text-blue-600 p-2 hover:bg-blue-100 rounded-xl transition-colors cursor-pointer shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-4 h-4"
                  >
                    <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32l8.4-8.4z" />
                  </svg>
                </button>
              )}
            </div>

            {/* 🌟 Step 4: ข้อมูลการชำระเงิน (กดแก้ได้ถ้ายืนอยู่ Step 5) */}
            <div
              onClick={() => step > 4 && setStep(4)} // 🌟 ถ้าอยู่ Step 5 ให้คลิกกลับมา Step 4 ได้
              className={`flex items-center gap-3 flex-1 p-3 rounded-2xl transition-all shadow-[0_2px_15px_-3px_rgba(37,99,235,0.08)] ${step === 4 ? "bg-blue-600 text-white border-transparent" : step > 4 ? "bg-white border border-slate-100 text-slate-700 cursor-pointer hover:bg-blue-50" : "bg-white border-2 border-slate-200 text-slate-400"}`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shrink-0 ${step === 4 ? "bg-white text-blue-600" : step > 4 ? "bg-blue-600 text-white" : "bg-white text-slate-400 border-2 border-slate-200"}`}
              >
                4
              </div>
              <div
                className={`font-bold text-sm truncate flex-1 ${step >= 4 ? "" : "text-slate-400"}`}
              >
                ข้อมูลส่วนตัว
              </div>
              {/* 🌟 แสดงไอคอนดินสอ เฉพาะตอนที่ผ่านมาแล้ว (เช่นอยู่หน้าชำระเงิน Step 5) */}
              {step > 4 && (
                <button className="ml-auto text-blue-600 p-2 hover:bg-blue-100 rounded-xl transition-colors cursor-pointer shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-4 h-4"
                  >
                    <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32l8.4-8.4z" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-[1000px] mx-auto px-4 mt-10">
        {/* ================= HEADER หลัก ================= */}
        {step < 6 && (
          <div className="flex items-center justify-between mb-8 animate-in fade-in duration-300">
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  if (step === 3) {
                    router.push(
                      `/cars?start=${startDateStr}&end=${endDateStr}`,
                    ); // หรือจะใช้ router.back() ก็ได้ครับ
                  } else {
                    setStep(step - 1);
                  }
                }}
                className="p-3 rounded-xl transition-colors text-blue-600 font-bold hover:bg-blue-100 bg-blue-50 cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 19.5L8.25 12l7.5-7.5"
                  />
                </svg>
              </button>
              <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">
                {step === 3
                  ? "ประกันและอุปกรณ์เสริม"
                  : step === 4
                    ? "ตรวจสอบและดำเนินการจอง"
                    : "ช่องทางการชำระเงิน"}
              </h1>
            </div>
            <div className="text-right">
              <div className="text-2xl md:text-3xl font-black text-blue-600">
                {grandTotal.toLocaleString()}{" "}
                <span className="text-xl">บาท</span>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEPS CONTENT ================= */}
        {step === 3 && (
          <StepAddons
            addonsData={addonsData}
            addonCounts={addonCounts}
            updateAddonCount={(id: any, d: any, m: any) =>
              setAddonsCounts((p) => ({
                ...p,
                [id]: Math.min(Math.max((p[id] || 0) + d, 0), m),
              }))
            }
            setStep={setStep}
          />
        )}

        {step === 4 && (
          <StepReview
            car={car}
            days={days}
            carPriceTotal={carPriceTotal}
            addonsTotal={addonsTotal}
            pickupLocation={pickupLocation}
            startDateStr={startDateStr}
            dropoffLocation={dropoffLocation}
            endDateStr={endDateStr}
            selectedPromo={selectedPromo}
            discountAmount={discountAmount}
            vatAmount={vatAmount}
            grandTotal={grandTotal}
            addonCounts={addonCounts} // 👈 เพิ่ม
            addonsData={addonsData}
            setIsPromoModalOpen={setIsPromoModalOpen}
            formData={formData}
            handleInputChange={(e: any) =>
              setFormData((p) => ({ ...p, [e.target.name]: e.target.value }))
            }
            errorMessage={errorMessage}
            handleProceedToPayment={handleProceedToPayment}
            setStep={setStep}
          />
        )}

        {/* ================= Step 5: ช่องทางชำระเงินจริง ================= */}
        {step === 5 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-10 ">

              {/* ===== ฝั่งซ้าย: เลือกวิธีจ่ายเงิน ===== */}
              <div className="lg:col-span-7 space-y-6 ">

                {/* 🔹 ปุ่มเลือก 2 แบบ: สลิป / เงินสด */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  {/* ปุ่ม: โอนเงิน (สลิป) */}
                  <div
                    onClick={() => !paymentDone && setPaymentMethod("slip")}
                    className={`p-5 rounded-[24px] border-2 cursor-pointer transition-all duration-200 ${paymentMethod === "slip"
                      ? "border-blue-600 bg-blue-50/50 shadow-lg shadow-blue-100"
                      : "border-slate-200 bg-white hover:border-blue-300"
                      } ${paymentDone ? "opacity-60 pointer-events-none" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      {/* ไอคอนธนาคาร */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${paymentMethod === "slip" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
                        }`}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                        </svg>
                      </div>
                      <div>
                        <span className={`text-lg font-black block ${paymentMethod === "slip" ? "text-blue-700" : "text-slate-700"}`}>
                          โอนเงิน / สลิป
                        </span>
                        <span className="text-xs text-slate-400">สแกน QR แล้วแนบสลิป</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ========== เนื้อหา: โอนเงินผ่านสลิป ========== */}
                {paymentMethod === "slip" && (
                  <div className="space-y-6">
                    {/* QR Code สำหรับโอนเงิน */}
                    <div className="bg-white rounded-[28px] border border-slate-200 p-8 md:p-10 text-center flex flex-col items-center">
                      <div className="bg-[#113566] text-white py-2 px-8 rounded-full mb-6 font-bold text-sm tracking-wide">
                        สแกน QR เพื่อโอนเงิน
                      </div>
                      {/* รูป QR จริง */}
                      <div className="w-full max-w-[280px] rounded-3xl overflow-hidden border-4 border-slate-100 mb-4 shadow-lg">
                        <img src="/qrpayakkaraphon.webp" alt="QR PromptPay" className="w-full h-auto" />
                      </div>
                      <p className="text-slate-500 text-sm mt-2">โอนเงินจำนวน <span className="font-black text-blue-600 text-lg">{grandTotal.toLocaleString()}</span> บาท</p>
                      <p className="text-slate-400 text-xs mt-1">แล้วแนบสลิปด้านล่าง</p>
                    </div>

                    {/* อัพโหลดสลิป */}
                    <div className="bg-white rounded-[28px] border border-slate-200 p-6 md:p-8">
                      <h4 className="font-black text-lg text-slate-800 mb-4 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-600">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                        </svg>
                        แนบสลิปการโอนเงิน
                      </h4>

                      {/* กล่องเลือกไฟล์ */}
                      <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-200">
                        {slipPreview ? (
                          <img src={slipPreview} alt="สลิป" className="max-h-44 rounded-xl object-contain" />
                        ) : (
                          <div className="flex flex-col items-center text-slate-400">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 mb-2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 003.75 21z" />
                            </svg>
                            <span className="font-bold">คลิกเพื่อเลือกรูปสลิป</span>
                            <span className="text-xs mt-1">รองรับ JPG, PNG, WEBP</span>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/jfif"
                          className="hidden"
                          onChange={handleSlipFileChange}
                          disabled={paymentDone}
                        />
                      </label>

                      {/* ปุ่มตรวจสลิป */}
                      {slipFile && !paymentDone && (
                        <button
                          onClick={handleVerifySlip}
                          disabled={verifying}
                          className="w-full bg-blue-600 text-white py-4 text-lg rounded-2xl font-black mt-6 hover:bg-blue-500 transition-colors shadow-[0_4px_20px_rgba(37,99,235,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                        >
                          {verifying ? (
                            <>
                              <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                              กำลังตรวจสอบสลิป...
                            </>
                          ) : (
                            "ตรวจสอบและชำระเงิน"
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* ===== แสดงผลลัพธ์การตรวจสลิป / การเลือกเงินสด ===== */}
                {paymentResult && (
                  <div className={`rounded-2xl p-5 border-2 flex items-start gap-3 animate-in fade-in duration-300 ${paymentResult.ok
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                    : "bg-red-50 border-red-200 text-red-800"
                    }`}>
                    {paymentResult.ok ? (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5">
                        <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-red-500 shrink-0 mt-0.5">
                        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clipRule="evenodd" />
                      </svg>
                    )}
                    <p className="font-bold text-sm leading-relaxed">{paymentResult.message}</p>
                  </div>
                )}
              </div>

              {/* ===== ฝั่งขวา: สรุปยอดเงิน ===== */}
              <div className="lg:col-span-5">
                <div className="bg-[#0f172a] text-white rounded-[32px] p-6 md:p-8 sticky top-32">
                  <h3 className="text-xl font-black mb-6 border-b border-slate-700/50 pb-4">
                    สรุปการชำระเงิน
                  </h3>
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-slate-300">
                      <span>ค่าเช่ารถและบริการเสริม</span>
                      <span className="font-bold">{(carPriceTotal + addonsTotal).toLocaleString()} ฿</span>
                    </div>
                    {selectedPromo && (
                      <div className="flex justify-between text-emerald-400">
                        <span>ส่วนลด</span>
                        <span className="font-bold">-{discountAmount.toLocaleString()} ฿</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-300">
                      <span>ภาษี (7%)</span>
                      <span className="font-bold">+{vatAmount.toLocaleString()} ฿</span>
                    </div>
                  </div>
                  <div className="pt-6 border-t border-slate-700/50">
                    <span className="block text-slate-400 text-sm">ยอดชำระสุทธิ</span>
                    <div className="text-4xl font-black text-white">
                      {grandTotal.toLocaleString()} <span className="text-lg">฿</span>
                    </div>
                  </div>
                  {/* แสดงวิธีที่เลือก */}
                  <div className="mt-6 pt-4 border-t border-slate-700/50 flex items-center gap-2 text-slate-400 text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                    </svg>
                    {paymentMethod === "slip" ? "ชำระด้วยการโอนเงิน (สลิป)" : "ชำระเงินสดหน้าร้าน"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= Step 6: ผลลัพธ์การจอง ================= */}
        {step === 6 && (
          <div className="text-center py-20 animate-in zoom-in-95 duration-500 max-w-2xl mx-auto">
            <div className="bg-white rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden py-12 px-6">
              {/* ไอคอนสำเร็จ */}
              <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-emerald-500">
                  <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                </svg>
              </div>

              {paymentMethod === "slip" ? (
                <>
                  <h2 className="text-3xl text-emerald-600 font-black mb-3">ชำระเงินสำเร็จ!</h2>
                  <p className="text-slate-500 mb-2">การจองของคุณได้รับการยืนยันเรียบร้อยแล้ว</p>
                  <p className="text-slate-400 text-sm mb-8">หมายเลขการจอง: <span className="font-black text-blue-600">#{bookID}</span></p>
                </>
              ) : (
                <>
                  <h2 className="text-3xl text-blue-600 font-black mb-3">บันทึกการจองสำเร็จ!</h2>
                  <p className="text-slate-500 mb-2">กรุณานำเงิน <span className="font-black text-blue-600">{grandTotal.toLocaleString()}</span> บาท มาชำระที่หน้าร้าน</p>
                  <p className="text-slate-400 text-sm mb-2">หมายเลขการจอง: <span className="font-black text-blue-600">#{bookID}</span></p>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-700 text-sm font-bold mt-4 mb-8 inline-block">
                    ⏰ กรุณาชำระเงินภายใน 1 ชั่วโมง มิฉะนั้นการจองจะถูกยกเลิกอัตโนมัติ
                  </div>
                </>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
                <Link
                  href="/cars"
                  className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-500 transition-colors"
                >
                  กลับไปหน้าเลือกรถ
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ================= PROMO MODAL ================= */}
      {isPromoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-300">
          {/* Backdrop with Blur */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsPromoModalOpen(false)}
          ></div>

          {/* Modal Container */}
          <div className="bg-white w-full max-w-[550px] rounded-t-[32px] sm:rounded-[32px] overflow-hidden shadow-2xl relative z-10 animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-300">
            {/* Header */}
            <div className="p-6 bg-white flex justify-between items-center border-b border-slate-100 relative">
              <div>
                <h3 className="font-black text-2xl text-slate-800 leading-tight">
                  โค้ดส่วนลด
                </h3>
                <p className="text-slate-500 text-sm mt-1">
                  เลือกคูปองที่คุณต้องการใช้
                </p>
              </div>
              <button
                onClick={() => setIsPromoModalOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                {/* X Icon SVG */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            </div>

            {/* Content - Scrollable Area */}
            <div className="p-4 sm:p-6 space-y-4 max-h-[60vh] overflow-y-auto bg-slate-50/50 custom-scrollbar">
              {promosData.map((promo) => {
                const isSelected = selectedPromo?.proID === promo.proID;
                
                // 🌟 ปรับปรุงการเช็คเงื่อนไข canUse:
                // เนื่องจากเรากรอง 'active' มาตั้งแต่ตอน Fetch แล้ว ตรงนี้ไม่ต้องเช็คซ้ำ
                // เช็คแค่วันหมดอายุ และยอดขั้นต่ำ
                const isNotExpired = new Date(promo.proEnd) >= new Date(); 
                const meetsMinSpend = carPriceTotal + addonsTotal >= promo.proMin;
                
                // ถ้ายังไม่หมดอายุ และยอดถึงขั้นต่ำ = ใช้ได้
                const canUse = meetsMinSpend && isNotExpired; 

                return (
                  <div
                    key={promo.proID}
                    onClick={() => {
                      if (canUse) {
                        setSelectedPromo(promo);
                        setIsPromoModalOpen(false);
                      }
                    }}
                    className={`
                relative group rounded-2xl p-5 border-2 transition-all duration-200 ease-in-out overflow-hidden
                ${canUse ? "cursor-pointer hover:-translate-y-1 hover:shadow-md bg-white" : "opacity-60 grayscale cursor-not-allowed bg-slate-50"}
                ${isSelected ? "border-blue-500 bg-blue-50/50 shadow-sm" : canUse ? "border-slate-200 hover:border-blue-300" : "border-slate-100"}
              `}
                  >
                    {/* Subtle Background Decoration for Selected/Hover state */}
                    <div
                      className={`absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-blue-100 rounded-full opacity-0 transition-opacity group-hover:opacity-30 ${isSelected ? "opacity-50" : ""}`}
                    ></div>

                    <div className="relative flex justify-between items-center gap-4">
                      {/* Left Side: Icon & Info */}
                      <div className="flex items-start gap-4 flex-1">
                        {/* Ticket Icon Container */}
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${canUse ? (isSelected ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-500") : "bg-slate-200 text-slate-400"}`}
                        >
                          {/* Ticket SVG Icon */}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="w-6 h-6"
                          >
                            <path
                              fillRule="evenodd"
                              d="M1.5 6.375c0-1.036.84-1.875 1.875-1.875h17.25c1.035 0 1.875.84 1.875 1.875v3.026a.75.75 0 01-.375.65 2.249 2.249 0 000 3.898.75.75 0 01.375.65v3.026c0 1.035-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 011.5 17.625v-3.026a.75.75 0 01.374-.65 2.249 2.249 0 000-3.898.75.75 0 01-.374-.65V6.375zm15-1.125a.75.75 0 01.75.75v.75a.75.75 0 01-1.5 0V6a.75.75 0 01.75-.75zm.75 4.5a.75.75 0 00-1.5 0v.75a.75.75 0 001.5 0v-.75zm-.75 3a.75.75 0 01.75.75v.75a.75.75 0 01-1.5 0v-.75a.75.75 0 01.75-.75zm.75 4.5a.75.75 0 00-1.5 0V18a.75.75 0 001.5 0v-.75zM6 12a.75.75 0 01.75-.75H12a.75.75 0 010 1.5H6.75A.75.75 0 016 12zm.75 2.25a.75.75 0 000 1.5h3a.75.75 0 000-1.5h-3z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>

                        <div className="space-y-0.5">
                          <h4 className="font-black text-lg text-slate-800 leading-tight">
                            {promo.proCode}
                          </h4>
                          <p className="text-sm font-medium text-slate-600">
                            {promo.proName}{" "}
                            {/* สมมติว่ามี field นี้ ถ้าไม่มีให้ลบออกครับ */}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-slate-500 pt-1">
                            {!canUse && (
                              /* Lock Icon for disabled state */
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                className="w-3 h-3"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                            <span>
                              ขั้นต่ำ {promo.proMin.toLocaleString()} ฿
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right Side: Value & Status */}
                      <div className="text-right flex flex-col items-end justify-between self-stretch">
                        <span
                          className={`block text-2xl font-black leading-none ${canUse ? "text-blue-600" : "text-slate-400"}`}
                        >
                          <span className="text-sm font-bold mr-0.5">-</span>
                          {promo.proType === "amount"
                            ? `${promo.proValue.toLocaleString()}`
                            : `${promo.proValue}`}
                          <span className="text-sm font-bold ml-1">
                            {promo.proType === "amount" ? "฿" : "%"}
                          </span>
                        </span>

                        {/* Selected Checkmark Indicator */}
                        {isSelected && canUse && (
                          <div className="flex items-center gap-1 text-sm font-bold text-blue-600 animate-in fade-in">
                            {/* Check SVG */}
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              className="w-5 h-5"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span>ใช้แล้ว</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {promosData.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-12 h-12 mx-auto mb-3 text-slate-300"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H4.5a1.5 1.5 0 01-1.5-1.5v-8.25M21 11.25c0-1.313-.736-2.428-1.79-3.038M21 11.25c-1.054.61-1.79 1.725-1.79 3.038m0-6.076c1.054-.61 2.16-1.038 3.29-1.038.565 0 1.13.107 1.69.317m-3.29 1.038c-1.054.61-2.16 1.038-3.29 1.038m3.29-1.038l-.001.001M15.812 5.172c.564-.21 1.129-.317 1.694-.317 1.13 0 2.236.428 3.29 1.038M4.5 11.25c0-1.313.736-2.428 1.79-3.038M4.5 11.25c1.054.61 1.79 1.725 1.79 3.038m0-6.076c-1.054-.61-2.16-1.038-3.29-1.038-.565 0-1.13.107-1.69.317m3.29 1.038c1.054.61 2.16 1.038 3.29 1.038m-3.29-1.038l.001.001M8.188 5.172c-.564-.21-1.129-.317-1.694-.317-1.13 0-2.236.428-3.29 1.038M12 5.25a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"
                    />
                  </svg>
                  <p>ยังไม่มีโค้ดส่วนลดในขณะนี้</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
