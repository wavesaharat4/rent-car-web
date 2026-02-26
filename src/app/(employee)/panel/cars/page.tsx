"use client";

import { useEffect, useMemo, useState } from "react";
import { Wrench, ShieldAlert, Plus, Save, RefreshCw, X } from "lucide-react";

type CarRow = {
  carID: number;
  empID: number;
  carPlate: string | null; 
  carBrand: string | null;
  carType: string | null;
  carSeat: number | null;
  carGear: string | null;
  carPower: string | null;
  carDetail: string | null;
  carPrice: number | null;
  carProvince: string | null;
  carVIN: number | null;
  carPicture: string | null;
  carStatus: string | null;
};

const s = (v: any) => (v == null ? "" : String(v));
const textOrNull = (v: string) => {
  const t = v.trim();
  return t ? t : null;
};
const numOrNull = (v: string) => {
  const t = v.trim();
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
};
const isDigitsOnly = (v: string) => /^\d+$/.test(v.trim());

const toNumOrNull = (v: any) => (v == null || v === "" ? null : Number(v));
const toNum = (v: any) => Number(v);

export default function PanelCarsPage() {
  const [cars, setCars] = useState<CarRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [extra, setExtra] = useState<Record<number, { odo?: string; nextMaint?: string }>>({});
  const [openAdd, setOpenAdd] = useState(false);
  const [newCar, setNewCar] = useState({
    empID: "",
    carPlate: "",
    carBrand: "",
    carType: "",
    carSeat: "",
    carGear: "",
    carPower: "",
    carDetail: "",
    carProvince: "",
    carVIN: "",
    carPrice: "",
    carQuantity: "",
  });

  const activeCars = useMemo(
    () => cars.filter((c) => (c.carStatus ?? "").toLowerCase() !== "retired"),
    [cars]
  );
  const isNewCarVinInvalid = !isDigitsOnly(newCar.carVIN);

  async function loadCars() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/cars", { cache: "no-store" });
      const json = await res.json();

      // 🌟 จุดที่แก้: เช็คว่าถ้าเป็น Array ตรงๆ ก็ใช้งานได้เลย แต่ถ้าเป็นแบบของเพื่อนก็ให้ดึง .data มาใช้
      let carsData = [];
      if (Array.isArray(json)) {
        carsData = json; // แบบของคุณ
      } 
      else {
        throw new Error(json.message || "โหลดข้อมูลไม่สำเร็จ");
      }

      // ✅ normalize: กัน carID/empID เป็น string หรือ null
      const normalized: CarRow[] = carsData.map((r: any) => ({
        carID: toNum(r.carID),
        empID: toNum(r.empID),
        carPlate: r.carPlate ?? null,
        carBrand: r.carBrand ?? null,
        carType: r.carType ?? null,
        carSeat: r.carSeat == null ? null : toNum(r.carSeat),
        carGear: r.carGear ?? null,
        carPower: r.carPower ?? null,
        carDetail: r.carDetail ?? null,
        carQuantity: toNumOrNull(r.carQuantity),
        carPrice: toNumOrNull(r.carPrice),
        carProvince: r.carProvince ?? null,
        carVIN: toNumOrNull(r.carVIN),
        carPicture: r.carPicture ?? null,
        carStatus: r.carStatus ?? null,
      }));

      setCars(normalized);
    } catch (e: any) {
      setError(e?.message ?? "โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCars();
  }, []);

  function updateCarLocal(carID: number, patch: Partial<CarRow>) {
    setCars((prev) => prev.map((c) => (c.carID === carID ? { ...c, ...patch } : c)));
  }

  async function saveCar(car: CarRow) {
    const id = parseInt(String((car as any).carID), 10);
    if (Number.isNaN(id)) {
      setError(`carID ไม่ถูกต้อง (หน้าเว็บ): ${String((car as any).carID)}`);
      return;
    }
    if (car.carVIN != null && !Number.isFinite(Number(car.carVIN))) {
      setError("carVIN ต้องเป็นตัวเลขเท่านั้น");
      return;
    }

    setSavingId(id);
    setError(null);

    try {
      const res = await fetch(`/api/cars/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          empID: car.empID,
          carPlate: car.carPlate,
          carBrand: car.carBrand,
          carType: car.carType,
          carSeat: car.carSeat,
          carGear: car.carGear,
          carPower: car.carPower,
          carDetail: car.carDetail,
          carPrice: car.carPrice,
          carProvince: car.carProvince,
          carVIN: car.carVIN,
          carPicture: car.carPicture,
          carStatus: car.carStatus,
        }),
      });

      const json = await res.json();
      if (!json.ok) throw new Error(json.message || "บันทึกไม่สำเร็จ");
    } catch (e: any) {
      setError(e?.message ?? "บันทึกไม่สำเร็จ");
    } finally {
      setSavingId(null);
    }
  }

  async function retireCar(carID: number) {
    const id = parseInt(String(carID), 10);
    if (Number.isNaN(id)) {
      setError(`carID ไม่ถูกต้อง (หน้าเว็บ): ${String(carID)}`);
      return;
    }

    setError(null);
    updateCarLocal(id, { carStatus: "Retired" });

    try {
      const res = await fetch(`/api/cars/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.ok) throw new Error(json.message || "ปลดระวางไม่สำเร็จ");
    } catch (e: any) {
      updateCarLocal(id, { carStatus: "Available" });
      setError(e?.message ?? "ปลดระวางไม่สำเร็จ");
    }
  }

  async function addCar() {
    setError(null);
    try {
      if (isNewCarVinInvalid) {
        throw new Error("carVIN ต้องเป็นตัวเลขเท่านั้น และห้ามเว้นว่าง");
      }

      const payload = {
        empID: Number(newCar.empID),
        carPlate: textOrNull(newCar.carPlate),
        carBrand: textOrNull(newCar.carBrand),
        carType: textOrNull(newCar.carType),
        carSeat: numOrNull(newCar.carSeat),
        carGear: textOrNull(newCar.carGear),
        carPower: textOrNull(newCar.carPower),
        carDetail: textOrNull(newCar.carDetail),
        carProvince: textOrNull(newCar.carProvince),
        carVIN: Number(newCar.carVIN.trim()),
        carPrice: numOrNull(newCar.carPrice),
        carQuantity: numOrNull(newCar.carQuantity),
        carStatus: "Available",
      };

      if (!Number.isFinite(payload.empID)) {
        throw new Error("กรอก empID เป็นตัวเลขก่อนเด้อ");
      }

      const res = await fetch("/api/cars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!json.ok) throw new Error(json.message || "เพิ่มรถไม่สำเร็จ");

      setOpenAdd(false);
      setNewCar({
        empID: "",
        carPlate: "",
        carBrand: "",
        carType: "",
        carSeat: "",
        carGear: "",
        carPower: "",
        carDetail: "",
        carProvince: "",
        carVIN: "",
        carPrice: "",
        carQuantity: "",
      });
      await loadCars();
    } catch (e: any) {
      setError(e?.message ?? "เพิ่มรถไม่สำเร็จ");
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <Wrench className="text-blue-600" size={32} />
            จัดการรายละเอียดรถ (Vehicle Panel)
          </h1>
          <p className="text-slate-500 text-sm mt-2 font-medium">
            ดึงจาก DB จริง แก้ไข/บันทึก/ปลดระวางได้เลย (ODO/เช็คระยะเป็นข้อมูลเสริมจนกว่าจะเพิ่มคอลัมน์ใน DB)
          </p>

          {error && (
            <div className="mt-3 text-sm font-bold text-rose-600 bg-rose-50 border border-rose-200 px-3 py-2 rounded-xl">
              {error}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadCars}
            className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl font-bold transition whitespace-nowrap"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            รีเฟรช
          </button>

          <button
            onClick={() => setOpenAdd(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold transition shadow-md whitespace-nowrap"
          >
            <Plus size={18} /> ลงทะเบียนรถใหม่
          </button>
        </div>
      </div>

      {openAdd && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between">
            <h2 className="font-black text-slate-800 text-lg">ลงทะเบียนรถใหม่</h2>
            <button
              onClick={() => setOpenAdd(false)}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-700 font-bold"
            >
              <X size={18} /> ปิด
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">empID *</label>
              <input
                value={newCar.empID}
                onChange={(e) => setNewCar((p) => ({ ...p, empID: e.target.value }))}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">ป้ายทะเบียน (carPlate)</label>
              <input
                value={newCar.carPlate}
                onChange={(e) => setNewCar((p) => ({ ...p, carPlate: e.target.value }))}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">ยี่ห้อรถ (carBrand)</label>
              <input
                value={newCar.carBrand}
                onChange={(e) => setNewCar((p) => ({ ...p, carBrand: e.target.value }))}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">ชนิดรถ (carType)</label>
              <input
                value={newCar.carType}
                onChange={(e) => setNewCar((p) => ({ ...p, carType: e.target.value }))}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">จำนวนที่นั่ง (carSeat)</label>
              <input
                type="number"
                value={newCar.carSeat}
                onChange={(e) => setNewCar((p) => ({ ...p, carSeat: e.target.value }))}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">เกียร์ (carGear)</label>
              <input
                value={newCar.carGear}
                onChange={(e) => setNewCar((p) => ({ ...p, carGear: e.target.value }))}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">เครื่องยนต์ (carPower)</label>
              <input
                value={newCar.carPower}
                onChange={(e) => setNewCar((p) => ({ ...p, carPower: e.target.value }))}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">
                รายละเอียด (carDetail)
              </label>
              <textarea
                rows={3}
                value={newCar.carDetail}
                onChange={(e) => setNewCar((p) => ({ ...p, carDetail: e.target.value }))}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">จังหวัด</label>
              <input
                value={newCar.carProvince}
                onChange={(e) => setNewCar((p) => ({ ...p, carProvince: e.target.value }))}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">VIN</label>
              <input
                value={newCar.carVIN}
                onChange={(e) => setNewCar((p) => ({ ...p, carVIN: e.target.value }))}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              {isNewCarVinInvalid && (
                <p className="mt-1 text-xs font-bold text-rose-600">
                  carVIN ต้องเป็นตัวเลขเท่านั้น และห้ามเว้นว่าง
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">ราคา/วัน</label>
              <input
                value={newCar.carPrice}
                onChange={(e) => setNewCar((p) => ({ ...p, carPrice: e.target.value }))}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              onClick={addCar}
              disabled={isNewCarVinInvalid}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-bold transition shadow-sm"
            >
              <Save size={16} /> เพิ่มรถ
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {activeCars.map((car) => {
          const carTag = `CAR-${String(car.carID).padStart(3, "0")}`;
          const plateBottom = car.carProvince ?? "-";

          return (
            <div
              key={car.carID}
              className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col md:flex-row gap-6 md:items-center"
            >
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <span className="bg-slate-100 text-slate-500 px-2.5 py-1 text-xs font-black rounded">
                    {carTag}
                  </span>
                  <h3 className="font-black text-xl text-slate-800">{car.carBrand ?? "-"}</h3>
                </div>

                <div className="inline-block border-2 border-slate-800 rounded-md bg-white">
                  <input
                    type="text"
                    value={s(car.carPlate)}
                    onChange={(e) => updateCarLocal(car.carID, { carPlate: e.target.value })}
                    placeholder="null"
                    className="w-32 px-3 py-1.5 font-bold tracking-widest text-slate-800 text-lg border-b border-slate-200 text-center outline-none bg-white"
                  />
                  <div className="px-4 py-0.5 text-[10px] font-bold text-center bg-slate-50 text-slate-600">
                    {plateBottom}
                  </div>
                </div>

                <div className="text-xs font-bold text-slate-500">
                  VIN: <span className="text-slate-700">{car.carVIN ?? "-"}</span> • ราคา/วัน:{" "}
                  <span className="text-slate-700">{car.carPrice ?? "-"}</span>
                </div>
              </div>

              <div className="flex-1 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">
                    ยี่ห้อรถ (carBrand)
                  </label>
                  <input
                    type="text"
                    value={s(car.carBrand)}
                    onChange={(e) => updateCarLocal(car.carID, { carBrand: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-sm text-sm font-bold text-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">
                    ชนิดรถ (carType)
                  </label>
                  <input
                    type="text"
                    value={s(car.carType)}
                    onChange={(e) => updateCarLocal(car.carID, { carType: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-sm text-sm font-bold text-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">
                    จำนวนที่นั่ง (carSeat)
                  </label>
                  <input
                    type="number"
                    value={s(car.carSeat)}
                    onChange={(e) => updateCarLocal(car.carID, { carSeat: numOrNull(e.target.value) })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-sm text-sm font-bold text-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">
                    เกียร์ (carGear)
                  </label>
                  <input
                    type="text"
                    value={s(car.carGear)}
                    onChange={(e) => updateCarLocal(car.carID, { carGear: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-sm text-sm font-bold text-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">
                    เครื่องยนต์ (carPower)
                  </label>
                  <input
                    type="text"
                    value={s(car.carPower)}
                    onChange={(e) => updateCarLocal(car.carID, { carPower: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-sm text-sm font-bold text-slate-700"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">
                    รายละเอียด (carDetail)
                  </label>
                  <textarea
                    rows={2}
                    value={s(car.carDetail)}
                    onChange={(e) => updateCarLocal(car.carID, { carDetail: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-sm text-sm font-bold text-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">
                    จังหวัด (carProvince)
                  </label>
                  <input
                    type="text"
                    value={s(car.carProvince)}
                    onChange={(e) => updateCarLocal(car.carID, { carProvince: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-sm text-sm font-bold text-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">
                    เลขไมล์สะสม (ODO) *ยังไม่ผูก DB*
                  </label>
                  <input
                    type="text"
                    value={extra[car.carID]?.odo ?? ""}
                    onChange={(e) =>
                      setExtra((p) => ({ ...p, [car.carID]: { ...p[car.carID], odo: e.target.value } }))
                    }
                    placeholder="เช่น 45,000 km"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-sm text-sm font-bold text-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">
                    วันเช็คระยะครั้งถัดไป *ยังไม่ผูก DB*
                  </label>
                  <input
                    type="date"
                    value={extra[car.carID]?.nextMaint ?? ""}
                    onChange={(e) =>
                      setExtra((p) => ({ ...p, [car.carID]: { ...p[car.carID], nextMaint: e.target.value } }))
                    }
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-sm text-sm font-bold text-slate-700"
                  />
                </div>
              </div>

              <div className="md:w-32 flex flex-col gap-2">
                <button
                  onClick={() => saveCar(car)}
                  disabled={savingId === car.carID}
                  className="w-full flex justify-center items-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed text-white py-2.5 rounded-xl text-sm font-bold transition shadow-sm"
                >
                  <Save size={16} /> {savingId === car.carID ? "กำลังบันทึก..." : "บันทึก"}
                </button>

                <button
                  onClick={() => retireCar(car.carID)}
                  className="w-full flex justify-center items-center gap-2 bg-white border border-rose-200 text-rose-500 hover:bg-rose-50 hover:border-rose-300 py-2.5 rounded-xl text-sm font-bold transition"
                >
                  <ShieldAlert size={16} /> ปลดระวาง
                </button>
              </div>
            </div>
          );
        })}

        {!loading && activeCars.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center">
            <div className="font-black text-slate-800 text-lg">ยังไม่มีรถในระบบ</div>
            <div className="text-slate-500 text-sm font-bold mt-1">กด “ลงทะเบียนรถใหม่” เพื่อเพิ่มรถ</div>
          </div>
        )}
      </div>
    </div>
  );
}
