"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react"; // 🌟 Import useSession เพื่อดึงข้อมูล User ที่ล็อกอิน

// ==========================================
// 1. กำหนด Interface ตามโครงสร้าง Database
// ==========================================
interface CarDB {
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

interface AddonDB {
  addonID: number;
  addonName: string;
  addonDetail: string;
  addonPrice: number;
  addonQuantity: number;
}

interface PromoDB {
  proID: number;
  proName: string;
  proCode: string;
  proType: "percent" | "amount";
  proValue: number;
  proMin: number;
  proMax: number;
}

// ==========================================
// 2. Component หลัก
// ==========================================
function CheckoutContent() {
  const searchParams = useSearchParams();
  // 🌟 1. เพิ่มการดึง status มาจาก useSession ด้วย
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
  // ==========================================
  // 🌟 useEffect ที่ 1 : ดึงข้อมูล รถ, อุปกรณ์, โปรโมชั่น (ทำทันทีที่โหลดหน้า)
  // ==========================================
  useEffect(() => {
    const fetchCarData = async () => {
      if (!carIdParam) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const carRes = await fetch(`/api/cars/${carIdParam}`);
        if (carRes.ok) {
          const carJson = await carRes.json();
          if (carJson.ok) setCar(carJson.data);
        }

        const addonRes = await fetch("/api/addons");
        if (addonRes.ok) {
          const addonText = await addonRes.text();
          if (addonText) setAddonsData(JSON.parse(addonText));
        }

        const promoRes = await fetch("/api/promotions");
        if (promoRes.ok) {
          const promoText = await promoRes.text();
          if (promoText) setPromosData(JSON.parse(promoText));
        }
      } catch (error) {
        console.error("Error fetching car data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCarData();
  }, [carIdParam]); // ผูกกับแค่ carIdParam ไม่เกี่ยวกับ session

  // ==========================================
  // 🌟 useEffect ที่ 2 : ดึงข้อมูล Profile (ทำเมื่อ session โหลดเสร็จเท่านั้น)
  // ==========================================
  useEffect(() => {
    const fetchProfile = async () => {
      if (status === "authenticated" && session?.user?.email) {
        try {
          // 🌟 แก้ไขตรงนี้: เพิ่ม { cache: 'no-store' } เพื่อบังคับให้ดึงข้อมูลใหม่เสมอ ห้ามจำ!
          const profileRes = await fetch(
            `/api/customer/profile?email=${session.user.email}`,
            { cache: "no-store" },
          );

          const sessionNameParts = (session?.user?.name || "")
            .trim()
            .split(" ");
          const fallbackFirstName = sessionNameParts[0] || "";
          const fallbackLastName = sessionNameParts.slice(1).join(" ") || "";

          if (profileRes.ok) {
            const profileData = await profileRes.json();
            setUserData(profileData);

            // นำข้อมูลทั้งหมดจาก Database มาใส่ใน Form
            setFormData((prev) => ({
              ...prev,
              email: profileData.cusMail || session?.user?.email || "",
              firstName: profileData.cusFN || fallbackFirstName,
              lastName: profileData.cusLN || fallbackLastName,
              phone: profileData.cusPhone || "",
              address: profileData.cusAddress || "",
              gender: profileData.cusGender || "ไม่ระบุ",
              driverLicense: profileData.cusDL || "",
              passport: profileData.cusPassport || "",
            }));
          } else {
            setFormData((prev) => ({
              ...prev,
              email: session?.user?.email || "",
              firstName: fallbackFirstName,
              lastName: fallbackLastName,
            }));
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
        }
      }
    };

    fetchProfile();
  }, [session, status]);

  // ==========================================
  // 4. คำนวณวันและราคา (Real-time)
  // ==========================================
  const days = useMemo(() => {
    if (!startDateStr || !endDateStr) return 1;
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
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

  const updateAddonCount = (id: number, delta: number, max: number) => {
    setAddonsCounts((prev) => {
      const current = prev[id] || 0;
      const next = current + delta;
      if (next < 0 || next > max) return prev;
      return { ...prev, [id]: next };
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // 🌟 ฟังก์ชันจัดการปุ่ม "ยืนยันเพื่อไปหน้าชำระเงิน" (ตรวจใบขับขี่/พาสปอร์ต)
  const handleProceedToPayment = async () => {
    // ล้าง Error เก่าก่อนทุกครั้งที่กดปุ่ม
    setErrorMessage("");

    // 1. ตรวจสอบว่าข้อมูลพื้นฐานครบไหม (ชื่อ, นามสกุล, เบอร์โทร, ที่อยู่)
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.phone ||
      !formData.address
    ) {
      setErrorMessage(
        "กรุณากรอกข้อมูลส่วนตัว (ชื่อ, นามสกุล, เบอร์โทรศัพท์ และที่อยู่) ให้ครบถ้วน",
      );
      return;
    }

    // 2. ตรวจสอบใบขับขี่หรือพาสปอร์ต (ต้องมีอย่างน้อย 1 อย่าง)
    if (!formData.driverLicense && !formData.passport) {
      setErrorMessage(
        "ต้องระบุ 'หมายเลขใบขับขี่' หรือ 'หมายเลขพาสปอร์ต' อย่างน้อย 1 อย่างเพื่อดำเนินการจอง",
      );
      return;
    }

    // 3. ถ้าผ่านเงื่อนไข ให้อัปเดตข้อมูลทั้งหมดกลับลง Database
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
        console.error("Failed to save data to Database", error);
      }
    }

    // 4. พาไปหน้าชำระเงิน
    setStep(5);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc]">
        <div className="animate-spin w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full mb-4"></div>
        <p className="text-slate-500 font-medium">กำลังเตรียมข้อมูลการจอง...</p>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] text-center">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          ไม่พบข้อมูลรถ
        </h1>
        <p className="text-slate-500 mb-6">
          รถคันนี้อาจไม่มีอยู่ในระบบ หรือ URL ไม่ถูกต้อง
        </p>
        <Link
          href="/cars"
          className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold"
        >
          กลับไปเลือกรถใหม่
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] pt-10 pb-24 font-sans text-slate-800 relative">
      {/* ================= TOP STEPPER ================= */}
      {step < 6 && (
        <div className="bg-white border-b border-slate-200 top-0 z-30 shadow-sm hidden md:block">
          <div className="max-w-[1200px] mx-auto px-4 flex items-center justify-between gap-4 py-4">
            {/* กล่องรับ-คืนรถ */}
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
                      {pickupLocation}
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
                      {dropoffLocation}
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
            {/* กล่องรถ */}
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
            {/* กล่อง Step 3 */}
            <div
              className={`flex items-center gap-3 flex-1 p-3 rounded-2xl transition-all shadow-[0_2px_15px_-3px_rgba(37,99,235,0.08)] ${step === 3 ? "bg-blue-600 text-white border-transparent" : "bg-white border border-slate-100 text-slate-700"}`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shrink-0 ${step === 3 ? "bg-white text-blue-600" : "bg-blue-600 text-white"}`}
              >
                3
              </div>
              <div
                className="font-bold text-sm cursor-pointer"
                onClick={() => setStep(3)}
              >
                ประกันและอุปกรณ์เสริม
              </div>
            </div>
            {/* กล่อง Step 4 */}
            <div
              className={`flex items-center gap-3 flex-1 p-3 rounded-2xl transition-all shadow-[0_2px_15px_-3px_rgba(37,99,235,0.08)] ${step === 4 ? "bg-blue-600 text-white border-transparent" : "bg-white border border-slate-100 text-slate-700"}`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shrink-0 ${step === 4 ? "bg-white text-blue-600" : "bg-white border-2 border-slate-200 text-slate-400"}`}
              >
                4
              </div>
              <div
                className={`font-bold text-sm ${step === 4 ? "text-white" : "text-slate-400"}`}
              >
                ข้อมูลการชำระเงิน
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-[1000px] mx-auto px-4 mt-10">
        {/* ================= HEADER ================= */}
        {step < 6 && (
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              {step > 3 ? (
                <button
                  onClick={() => setStep(step - 1)}
                  className="text-blue-600 font-bold hover:bg-blue-100 bg-blue-50 p-3 rounded-xl transition-colors cursor-pointer"
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
              ) : (
                <Link
                  href="/"
                  className="text-blue-600 font-bold hover:bg-blue-100 bg-blue-50 p-3 rounded-xl transition-colors cursor-pointer"
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
                </Link>
              )}
              <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">
                {step === 3
                  ? "ประกันและอุปกรณ์เสริม"
                  : "ตรวจสอบและดำเนินการจอง"}
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

        {/* ================= STEP 3: ADDONS ================= */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {addonsData.map((addon) => (
                <div
                  key={addon.addonID}
                  className="bg-white border border-slate-200 rounded-[28px] overflow-hidden hover:border-blue-400 hover:shadow-[0_8px_30px_rgb(37,99,235,0.12)] transition-all relative flex flex-col group p-6 md:p-8"
                >
                  <div className="flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-black text-slate-800 text-xl">
                        {addon.addonName}
                      </h3>
                      <div className="bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1 rounded-full">
                        บริการเสริม
                      </div>
                    </div>
                    <p className="text-sm text-slate-500 leading-relaxed mb-8 flex-1">
                      {addon.addonDetail}
                    </p>
                    <div className="flex items-end justify-between mt-auto pt-4 border-t border-slate-100">
                      <div>
                        <div className="font-black text-blue-600 text-2xl">
                          {addon.addonPrice} ฿{" "}
                          <span className="text-sm font-bold text-slate-500">
                            / วัน
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center bg-slate-50 rounded-2xl p-1.5 border border-slate-200 shadow-inner">
                        <button
                          onClick={() =>
                            updateAddonCount(
                              addon.addonID,
                              -1,
                              addon.addonQuantity,
                            )
                          }
                          className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-white hover:shadow-sm rounded-xl transition-all font-bold text-lg cursor-pointer"
                        >
                          −
                        </button>
                        <span className="font-black text-slate-800 text-lg w-12 text-center">
                          {addonCounts[addon.addonID] || 0}
                        </span>
                        <button
                          onClick={() =>
                            updateAddonCount(
                              addon.addonID,
                              1,
                              addon.addonQuantity,
                            )
                          }
                          className="w-10 h-10 flex items-center justify-center text-blue-600 hover:bg-white hover:shadow-sm rounded-xl transition-all font-bold text-xl cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {addonsData.length === 0 && (
                <div className="col-span-1 md:col-span-2 text-center py-10 bg-white rounded-3xl border border-slate-200">
                  <p className="text-slate-500 font-bold">
                    ไม่มีอุปกรณ์เสริมให้เลือกในขณะนี้
                  </p>
                </div>
              )}
            </div>
            <div className="mt-10 flex justify-end">
              <button
                onClick={() => setStep(4)}
                className="bg-blue-600 text-white font-bold py-4 px-14 rounded-2xl hover:bg-blue-700 transition-all shadow-[0_8px_20px_rgba(37,99,235,0.3)] flex items-center gap-3 cursor-pointer text-lg"
              >
                ถัดไป <span>&rarr;</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 4: REVIEW & PAYMENT ================= */}
        {step === 4 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="mb-6">
              <h2 className="text-2xl font-black text-slate-800 mb-2">
                ตรวจสอบการจองของคุณ
              </h2>
              <p className="text-sm text-slate-500 font-medium">
                ตรวจสอบการจองของคุณและชำระเงินและยืนยันตัวตนให้เสร็จสิ้นภายใน 8
                นาที
              </p>
            </div>

            {/* 🌟 1. สรุปรถที่เลือก */}
            <div className="bg-white rounded-3xl border border-slate-200 mb-6 overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-white">
                <h3 className="font-black text-lg text-slate-800">
                  รถที่เลือก
                </h3>
              </div>
              <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-8">
                <div className="md:col-span-4 relative">
                  <div className="w-full aspect-[4/3] relative rounded-xl overflow-hidden bg-slate-50">
                    <Image
                      src={car.carPicture || "/images/car-placeholder.jpg"}
                      alt={car.carBrand}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
                <div className="md:col-span-8 flex flex-col">
                  <h2 className="text-xl font-black text-slate-800 mb-3">
                    {car.carBrand}
                  </h2>
                  <div className="space-y-2 text-sm text-slate-700 flex-1 border-t border-slate-100 pt-4">
                    <div className="flex justify-between items-center">
                      <span>อัตราค่าบริการ (สำหรับ {days} วัน)</span>
                      <div className="text-right">
                        <span className="font-bold block">
                          {carPriceTotal.toLocaleString()} บาท
                        </span>
                      </div>
                    </div>
                    {addonsTotal > 0 && (
                      <div className="flex justify-between items-center pt-2">
                        <span>อุปกรณ์เสริมเพิ่มเติม</span>
                        <span className="font-bold">
                          {addonsTotal.toLocaleString()} บาท
                        </span>
                      </div>
                    )}
                    <div className="pt-4 mt-2 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-500">รับรถ</span>
                        <span className="font-bold text-right">
                          {pickupLocation}, {startDateStr || "-"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">คืนรถ</span>
                        <span className="font-bold text-right">
                          {dropoffLocation}, {endDateStr || "-"}
                        </span>
                      </div>
                    </div>
                    <div className="pt-4 mt-6 border-t-2 border-dashed border-slate-200 space-y-3">
                      {selectedPromo && (
                        <div className="flex justify-between items-center text-red-500">
                          <span className="font-bold">
                            ส่วนลด ({selectedPromo.proCode})
                          </span>
                          <span className="font-black">
                            -{discountAmount.toLocaleString()} บาท
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center text-slate-500">
                        <span className="font-medium">ภาษี (7%)</span>
                        <span className="font-bold">
                          +{vatAmount.toLocaleString()} บาท
                        </span>
                      </div>
                      <div className="flex justify-between items-end pt-3 mt-3 border-t border-slate-100">
                        <span className="font-black text-slate-800 text-lg">
                          ยอดรวมสุทธิ
                        </span>
                        <span className="font-black text-blue-600 text-2xl">
                          {grandTotal.toLocaleString()}{" "}
                          <span className="text-lg">บาท</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 🌟 2. Promo Code Section */}
            <div className="bg-white rounded-3xl border border-slate-200 mb-8 overflow-hidden p-6 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex-1 w-full">
                {selectedPromo ? (
                  <div className="flex items-center justify-between bg-blue-50 border border-blue-100 p-3 rounded-xl max-w-sm">
                    <span className="text-blue-700 font-bold text-sm">
                      🎫 {selectedPromo.proName}
                    </span>
                    <button
                      onClick={() => setSelectedPromo(null)}
                      className="text-red-500 font-bold text-xs hover:bg-red-50 p-1 rounded"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="text-slate-500 text-sm font-medium">
                    ℹ️ กรุณาเลือกโค้ดโปรโมชั่น
                  </div>
                )}
              </div>
              <button
                onClick={() => setIsPromoModalOpen(true)}
                className="bg-black text-white font-bold py-3 px-10 rounded-xl hover:-translate-y-1 shadow-md"
              >
                + เลือกโค้ด
              </button>
            </div>

            {/* 🌟 3. ข้อมูลของคุณ (ดึงจาก DB อัตโนมัติ) */}
            <div className="mb-8">
              <h2 className="text-2xl font-black text-slate-800 mb-4">
                ข้อมูลของคุณ
              </h2>
              <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8">
                <form className="space-y-6">
                  <div>
                    <label className="text-sm font-bold text-slate-800 mb-2 block">
                      อีเมล
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      readOnly
                      className="w-full px-4 py-3.5 bg-slate-100 border border-slate-300 rounded-xl text-slate-500 cursor-not-allowed"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-bold text-slate-800 mb-2 block">
                        ชื่อ (First Name){" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="ระบุชื่อ"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-800 mb-2 block">
                        นามสกุล (Last Name){" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="ระบุนามสกุล"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-bold text-slate-800 mb-2 block">
                        เบอร์โทรศัพท์ <span className="text-red-500">*</span>
                      </label>
                      <div className="flex">
                        <select
                          name="phonePrefix"
                          value={formData.phonePrefix}
                          onChange={handleInputChange}
                          className="px-3 bg-slate-50 border border-slate-300 border-r-0 rounded-l-xl outline-none"
                        >
                          <option value="+66">+</option>
                        </select>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3.5 bg-white border border-slate-300 rounded-r-xl focus:ring-2 focus:ring-blue-500 outline-none"
                          placeholder="08X-XXX-XXXX"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-800 mb-2 block">
                        เพศ
                      </label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                      >
                        <option value="ไม่ระบุ">ไม่ระบุ</option>
                        <option value="ชาย">ชาย</option>
                        <option value="หญิง">หญิง</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-bold text-slate-800 mb-2 block">
                      ที่อยู่ปัจจุบัน <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="ระบุที่อยู่จัดส่งเอกสาร/ใบกำกับภาษี"
                    ></textarea>
                  </div>

                  {/* 🌟 ช่องใส่ใบขับขี่ และ พาสปอร์ต */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                    <div>
                      <label className="text-sm font-bold text-slate-800 mb-2 block">
                        หมายเลขใบขับขี่ (ถ้ามี)
                      </label>
                      {/* ถ้า Error เรื่องใบขับขี่ จะทำกรอบแดงเตือนให้รู้ */}
                      <input
                        type="text"
                        name="driverLicense"
                        value={formData.driverLicense}
                        onChange={handleInputChange}
                        placeholder="กรอกหมายเลขใบขับขี่"
                        className={`w-full px-4 py-3.5 bg-white border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-colors ${!formData.driverLicense && !formData.passport && errorMessage.includes("ใบขับขี่") ? "border-red-300 bg-red-50" : "border-slate-300"}`}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-800 mb-2 block">
                        หมายเลขพาสปอร์ต (ถ้ามี)
                      </label>
                      <input
                        type="text"
                        name="passport"
                        value={formData.passport}
                        onChange={handleInputChange}
                        placeholder="กรอกหมายเลขพาสปอร์ต"
                        className={`w-full px-4 py-3.5 bg-white border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-colors ${!formData.driverLicense && !formData.passport && errorMessage.includes("พาสปอร์ต") ? "border-red-300 bg-red-50" : "border-slate-300"}`}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-red-500 font-medium">
                    ** ต้องกรอกหมายเลขใบขับขี่ หรือ หมายเลขพาสปอร์ต อย่างน้อย 1
                    อย่าง เพื่อดำเนินการจอง
                  </p>
                  {/* 🚨 กล่องแสดง Error Message แสนสวย */}
                  {errorMessage && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl flex items-start gap-3 animate-in fade-in duration-300">
                      <svg
                        className="w-5 h-5 text-red-500 mt-0.5 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                      <div>
                        <h4 className="text-red-800 font-bold text-sm">
                          ไม่สามารถดำเนินการต่อได้
                        </h4>
                        <p className="text-red-600 text-sm mt-1">
                          {errorMessage}
                        </p>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            </div>

            <div className="mt-10 flex justify-end pb-10">
              {/* 🌟 เปลี่ยนไปใช้ฟังก์ชัน handleProceedToPayment เพื่อตรวจข้อมูลก่อนไปหน้า 5 */}
              <button
                onClick={handleProceedToPayment}
                className="bg-blue-600 text-white font-bold py-4 px-14 rounded-2xl hover:bg-blue-700 transition-all shadow-lg cursor-pointer text-lg"
              >
                ยืนยันเพื่อไปหน้าชำระเงิน &rarr;
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 5: PAYMENT METHOD ================= */}
        {step === 5 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="mb-8">
              <button
                onClick={() => setStep(4)}
                className="text-blue-600 font-bold hover:bg-blue-50 px-4 py-2 rounded-xl mb-4 -ml-4 flex items-center gap-2"
              >
                &larr; ย้อนกลับไปแก้ไขข้อมูล
              </button>
              <h2 className="text-3xl font-black text-slate-800 mb-2">
                เลือกช่องทางการชำระเงิน
              </h2>
            </div>
            {/* UI ชำระเงินเดิมของคุณ ... */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
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
              </div>
              <div className="lg:col-span-5">
                <div className="bg-slate-900 text-white rounded-[32px] p-6 md:p-8 sticky top-32">
                  <h3 className="text-xl font-black mb-6 border-b border-slate-700/50 pb-4">
                    สรุปการชำระเงิน
                  </h3>
                  <div className="pt-6 border-t border-slate-700/50">
                    <span className="block text-slate-400 text-sm">
                      ยอดชำระสุทธิ
                    </span>
                    <div className="text-4xl font-black text-white">
                      {grandTotal.toLocaleString()} ฿
                    </div>
                  </div>
                  <button
                    onClick={() => setStep(6)}
                    className="w-full bg-blue-600 py-4 text-lg rounded-2xl font-black mt-8 hover:bg-blue-500"
                  >
                    ชำระเงินและยืนยันการจอง
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 6: SUCCESS ================= */}
        {step === 6 && (
          <div className="animate-in zoom-in-95 duration-500 max-w-2xl mx-auto mt-4 pb-20">
            <div className="bg-white rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden text-center py-12 px-6">
              <h2 className="text-4xl font-black text-green-500 mb-4">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="bg-white w-full max-w-[600px] rounded-[32px] overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-black text-2xl text-slate-800">
                โค้ดส่วนลดของคุณ
              </h3>
              <button
                onClick={() => setIsPromoModalOpen(false)}
                className="text-slate-400 text-2xl"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto bg-slate-50">
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
                    className={`bg-white border-2 rounded-2xl p-5 flex justify-between items-center cursor-pointer transition-all ${!canUse ? "opacity-50" : isSelected ? "border-blue-600 shadow-md" : "border-slate-200 hover:border-blue-300"}`}
                  >
                    <div>
                      <h4 className="font-black text-blue-600 text-xl">
                        {promo.proCode}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        ขั้นต่ำ {promo.proMin.toLocaleString()} ฿
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="block text-xl font-black text-red-500">
                        -
                        {promo.proType === "amount"
                          ? `${promo.proValue} ฿`
                          : `${promo.proValue}%`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 🌟 สร้าง Component หลักสำหรับ Export ครอบ Suspense ป้องกัน Error
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
