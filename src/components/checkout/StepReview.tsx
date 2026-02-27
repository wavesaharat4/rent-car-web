import Image from "next/image";

export default function StepReview({
  car,
  days,
  carPriceTotal,
  addonsTotal,
  pickupLocation,
  startDateStr,
  dropoffLocation,
  endDateStr,
  selectedPromo,
  discountAmount,
  vatAmount,
  grandTotal,
  setIsPromoModalOpen,
  formData,
  handleInputChange,
  errorMessage,
  handleProceedToPayment,
  // 🌟 เพิ่ม Props 2 ตัวนี้เพื่อให้ดึงข้อมูลแอดออนมาแสดงได้
  addonCounts,
  addonsData,
}: any) {
  return (
    <div className="animate-in fade-in slide-in-from-right-8 duration-500">
      {/* ข้อความแจ้งเตือนด้านบน */}
      <div className="mb-6">
        <h2 className="text-2xl font-black text-slate-800 mb-2">
          ตรวจสอบการจองของคุณ
        </h2>
        <p className="text-sm text-slate-500 font-medium">
          ตรวจสอบการจองของคุณและชำระเงินและยืนยันตัวตนให้เสร็จสิ้นภายใน 8 นาที
        </p>
      </div>

      {/* 1. สรุปรถ */}
      <div className="bg-white rounded-3xl border border-slate-200 mb-6 overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-white">
          <h3 className="font-black text-lg text-slate-800">รถที่เลือก</h3>
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
            <div className="space-y-3 text-sm text-slate-700 flex-1 border-t border-slate-100 pt-4">
              {/* รายการค่าเช่ารถหลัก */}
              <div className="flex justify-between items-center">
                <span className="font-medium text-slate-600">
                  ค่าเช่ารถ สำหรับ {days} วัน
                </span>
                <span className="font-bold">
                  {carPriceTotal.toLocaleString()} บาท
                </span>
              </div>

              {/* 🌟 รายละเอียดอุปกรณ์เสริมรายรายการ */}
              {Object.entries(addonCounts).some(([_, count]: any) => count > 0) && (
                <div className="bg-slate-50/50 rounded-2xl p-4 space-y-3 border border-slate-100">
                  <p className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                    อุปกรณ์เสริมที่เลือก:
                  </p>
                  {Object.entries(addonCounts).map(([id, count]: any) => {
                    if (count <= 0) return null;
                    const addon = addonsData.find(
                      (a: any) => a.addonID === Number(id)
                    );
                    if (!addon) return null;

                    const itemTotal = addon.addonPrice * count * days;

                    return (
                      <div key={id} className="flex justify-between items-start">
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-800">
                            • {addon.addonName} (x{count})
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {addon.addonPrice.toLocaleString()} ฿ × {count} ชิ้น ×{" "}
                            {days} วัน
                          </span>
                        </div>
                        <span className="font-bold text-slate-700">
                          {itemTotal.toLocaleString()} บาท
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* สถานที่รับ-คืน */}
              <div className="pt-2 space-y-2 border-t border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-500">รับรถ</span>
                  <span className="font-bold">
                    {car.carProvince}, {startDateStr || "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">คืนรถ</span>
                  <span className="font-bold">
                    {car.carProvince}, {endDateStr || "-"}
                  </span>
                </div>
              </div>

              {/* ส่วนลด ภาษี และยอดสุทธิ */}
              <div className="pt-4 mt-2 border-t-2 border-dashed border-slate-200 space-y-3">
                {selectedPromo && (
                  <div className="flex justify-between items-center text-emerald-600 font-bold">
                    <span>ส่วนลด ({selectedPromo.proCode})</span>
                    <span>-{discountAmount.toLocaleString()} บาท</span>
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

      {/* 2. Promo Code */}
      <div className="bg-white rounded-3xl border border-slate-200 mb-8 p-6 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="flex-1 w-full flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold">
            %
          </div>
          {selectedPromo ? (
            <div className="flex items-center gap-2">
              <span className="text-blue-700 font-bold text-sm">
                🎫 ใช้โค้ด: {selectedPromo.proCode}
              </span>
              <span className="text-xs text-slate-400">
                (ลดไป {discountAmount.toLocaleString()} บาท)
              </span>
            </div>
          ) : (
            <div className="text-slate-500 text-sm font-medium">
              กรุณาเลือกโค้ดโปรโมชั่น
            </div>
          )}
        </div>
        <button
          onClick={() => setIsPromoModalOpen(true)}
          className="bg-black text-white font-bold py-3 px-10 rounded-xl hover:-translate-y-1 transition-all shadow-md"
        >
          + เลือกโค้ด
        </button>
      </div>

      {/* 3. Form ข้อมูลของคุณ */}
      <div className="mb-8">
        <h2 className="text-2xl font-black text-slate-800 mb-4">
          ข้อมูลของคุณ
        </h2>
        <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm">
          {errorMessage && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl flex items-start gap-3 mb-6 animate-in fade-in">
              <h4 className="text-red-800 font-bold text-sm">
                ไม่สามารถดำเนินการต่อได้: {errorMessage}
              </h4>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="text-sm font-bold block mb-2 text-slate-700">
                อีเมล <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                readOnly
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed outline-none"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-bold block mb-2 text-slate-700">
                  ชื่อ (First Name) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="ระบุชื่อจริง"
                  className="w-full px-4 py-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                />
              </div>
              <div>
                <label className="text-sm font-bold block mb-2 text-slate-700">
                  นามสกุล (Last Name) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="ระบุนามสกุล"
                  className="w-full px-4 py-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-bold block mb-2 text-slate-700">
                  เบอร์โทรศัพท์ <span className="text-red-500">*</span>
                </label>
                <div className="flex shadow-sm rounded-xl overflow-hidden border border-slate-300">
                  <select
                    name="phonePrefix"
                    className="px-3 bg-slate-50 border-r border-slate-300 outline-none text-sm font-medium"
                  >
                    <option value="+66">+66</option>
                  </select>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="08X-XXX-XXXX"
                    className="w-full px-4 py-3.5 outline-none focus:bg-white transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-bold block mb-2 text-slate-700">
                  เพศ
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer shadow-sm transition-all"
                >
                  <option value="ไม่ระบุ">ไม่ระบุ</option>
                  <option value="ชาย">ชาย</option>
                  <option value="หญิง">หญิง</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-bold block mb-2 text-slate-700">
                ที่อยู่ปัจจุบัน <span className="text-red-500">*</span>
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows={3}
                placeholder="ระบุที่อยู่ปัจจุบันของคุณ"
                className="w-full px-4 py-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all resize-none"
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
              <div>
                <label className="text-sm font-bold block mb-2 text-slate-700">
                  หมายเลขใบขับขี่ (ถ้ามี)
                </label>
                <input
                  type="text"
                  name="driverLicense"
                  value={formData.driverLicense}
                  onChange={handleInputChange}
                  placeholder="เช่น 12345678"
                  className="w-full px-4 py-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all"
                />
              </div>
              <div>
                <label className="text-sm font-bold block mb-2 text-slate-700">
                  หมายเลขพาสปอร์ต (ถ้ามี)
                </label>
                <input
                  type="text"
                  name="passport"
                  value={formData.passport}
                  onChange={handleInputChange}
                  placeholder="เช่น AA1234567"
                  className="w-full px-4 py-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all"
                />
              </div>
            </div>
            <p className="text-[11px] text-red-500 font-medium bg-red-50 p-2 rounded-lg inline-block">
              ** ต้องกรอกหมายเลขใบขับขี่ หรือ หมายเลขพาสปอร์ต อย่างน้อย 1 อย่าง
              เพื่อดำเนินการจอง
            </p>
          </div>
        </div>
      </div>

      <div className="mt-10 flex justify-end pb-10">
        <button
          onClick={handleProceedToPayment}
          className="bg-blue-600 text-white font-bold py-4 px-14 rounded-2xl hover:bg-blue-700 transition-all shadow-lg active:scale-95 flex items-center gap-2"
        >
          ยืนยันเพื่อไปหน้าชำระเงิน
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
              d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}