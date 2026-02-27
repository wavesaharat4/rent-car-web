"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

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
}
export interface PromoDB {
  proID: number;
  proName: string;
  proCode: string;
  proType: "percent" | "amount";
  proValue: number;
  proMin: number;
  proMax: number;
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
  const [paymentMethod, setPaymentMethod] = useState("creditCard");

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
        const [carRes, addonRes, promoRes] = await Promise.all([
          fetch(`/api/cars/${carIdParam}`),
          fetch("/api/addons"),
          fetch("/api/promotions"),
        ]);
        if (carRes.ok) {
          const carJson = await carRes.json();
          if (carJson.ok) setCar(carJson.data);
        }
        if (addonRes.ok) setAddonsData(JSON.parse(await addonRes.text()));
        if (promoRes.ok) setPromosData(JSON.parse(await promoRes.text()));
      } catch (error) {
        console.error(error);
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

  const confirmBooking = async () => {
    setLoading(true);
    try {
      // เตรียมข้อมูล Addons ที่ถูกเลือก (เฉพาะอันที่มีจำนวน > 0)
      const selectedAddons = Object.entries(addonCounts)
        .filter(([_, count]) => count > 0)
        .map(([id, count]) => {
          const addon = addonsData.find((a) => a.addonID === Number(id));
          return {
            addonID: Number(id),
            quantity: count,
            price: addon ? addon.addonPrice : 0,
          };
        });

      const bookingData = {
        cusID: userData.cusID,
        carID: car?.carID,
        proID: selectedPromo?.proID || null,
        bookStatus: "Pending", // หรือ "Success" ตามสถานะเริ่มต้นที่คุณต้องการ
        bookCarPrice: carPriceTotal,
        bookTotalPrice: grandTotal,
        bookStart: startDateStr,
        bookEnd: endDateStr,
        bookSProvice: car?.carProvince,
        bookEProvince: car?.carProvince,
        addons: selectedAddons,
      };

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });

      const result = await res.json();
      if (result.ok) {
        setStep(6); // ไปหน้าสำเร็จ
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล: " + result.error);
      }
    } catch (error) {
      console.error("Confirm Booking Error:", error);
      alert("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    } finally {
      setLoading(false);
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
                      {startDateStr || "-"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5 font-medium">
                      คืนรถ
                    </span>
                    <p className="font-bold text-slate-700 truncate text-sm">
                      {car.carProvince}
                    </p>
                    <span className="text-slate-500">{endDateStr || "-"}</span>
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

        {/* Step 5: เลือกช่องทางชำระเงิน */}
        {step === 5 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-10">
              <div className="lg:col-span-7 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  <div
                    onClick={() => setPaymentMethod("creditCard")}
                    className={`p-5 rounded-[24px] border-2 cursor-pointer ${paymentMethod === "creditCard" ? "border-blue-600 bg-blue-50/30" : "border-slate-200 bg-white"}`}
                  >
                    <span
                      className={`text-lg font-black ${paymentMethod === "creditCard" ? "text-blue-700" : "text-slate-700"}`}
                    >
                      บัตรเครดิต / เดบิต
                    </span>
                  </div>
                  <div
                    onClick={() => setPaymentMethod("promptPay")}
                    className={`p-5 rounded-[24px] border-2 cursor-pointer ${paymentMethod === "promptPay" ? "border-blue-600 bg-blue-50/30" : "border-slate-200 bg-white"}`}
                  >
                    <span
                      className={`text-lg font-black ${paymentMethod === "promptPay" ? "text-blue-700" : "text-slate-700"}`}
                    >
                      สแกน QR พร้อมเพย์
                    </span>
                  </div>
                </div>

                {/* เนื้อหาจำลองการชำระเงิน */}
                {paymentMethod === "promptPay" && (
                  <div className="bg-white rounded-[28px] border border-slate-200 p-8 md:p-12 text-center flex flex-col items-center">
                    <div className="bg-[#113566] text-white py-2 px-8 rounded-full mb-8 font-bold">
                      Thai QR Payment
                    </div>
                    <div className="w-full max-w-[320px] aspect-square bg-slate-100 rounded-3xl border-8 border-slate-50 flex items-center justify-center mb-8">
                      <span className="font-bold text-slate-400">
                        QR Code จำลอง
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="lg:col-span-5">
                <div className="bg-[#0f172a] text-white rounded-[32px] p-6 md:p-8 sticky top-32">
                  <h3 className="text-xl font-black mb-6 border-b border-slate-700/50 pb-4">
                    สรุปการชำระเงิน
                  </h3>

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-slate-300">
                      <span>ค่าเช่ารถและบริการเสริม</span>
                      <span className="font-bold">
                        {(carPriceTotal + addonsTotal).toLocaleString()} ฿
                      </span>
                    </div>
                    {selectedPromo && (
                      <div className="flex justify-between text-emerald-400">
                        <span>ส่วนลด</span>
                        <span className="font-bold">
                          -{discountAmount.toLocaleString()} ฿
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-300">
                      <span>ภาษี (7%)</span>
                      <span className="font-bold">
                        +{vatAmount.toLocaleString()} ฿
                      </span>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-700/50">
                    <span className="block text-slate-400 text-sm">
                      ยอดชำระสุทธิ
                    </span>
                    <div className="text-4xl font-black text-white">
                      {grandTotal.toLocaleString()}{" "}
                      <span className="text-lg">฿</span>
                    </div>
                  </div>

                  <button
                    onClick={confirmBooking}
                    className="w-full bg-blue-600 py-4 text-lg rounded-2xl font-black mt-8 hover:bg-blue-500 transition-colors shadow-[0_4px_20px_rgba(37,99,235,0.4)]"
                  >
                    ชำระเงินและยืนยันการจอง
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="text-center py-20 animate-in zoom-in-95 duration-500 max-w-2xl mx-auto">
            <div className="bg-white rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden py-12 px-6">
              <h2 className="text-4xl text-green-500 font-black mb-4">
                การจองสำเร็จ!
              </h2>
              <p className="text-slate-500 mb-8">
                ใบเสร็จได้ถูกส่งไปที่อีเมล {formData.email || "ของคุณ"} แล้ว
              </p>
              <Link
                href="/cars"
                className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold"
              >
                กลับไปหน้าเลือกรถ
              </Link>
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
                const canUse = carPriceTotal + addonsTotal >= promo.proMin;

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
