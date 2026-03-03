"use client";

import { useEffect, useMemo, useState } from "react";
import { Car, RefreshCw, Search } from "lucide-react";

type BookingRow = {
  bookID: number;
  bookStart: string | null;
  bookEnd: string | null;
  bookSProvice: string | null;
  bookEProvince: string | null;
  bookStatus: string | null;
  bookTotalPrice: number | string | null;
  carBrand: string | null;
  carType: string | null;
  cusFN: string | null;
  cusLN: string | null;
};

const ALLOWED_STATUSES = new Set(["COMPLETED", "ACTIVE", "CONFIRMED"]);

const toNumber = (value: unknown) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const formatDate = (value: string | null) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const getDurationDays = (start: string | null, end: string | null) => {
  if (!start || !end) return "-";
  const s = new Date(start);
  const e = new Date(end);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return "-";
  const ms = e.getTime() - s.getTime();
  const days = Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
  return `${days} วัน`;
};

const getMonthLabel = (date = new Date()) =>
  date.toLocaleDateString("th-TH", { month: "long", year: "numeric" });

export default function AccountingRentalsPage() {
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const currentMonthBookings = useMemo(() => {
    return bookings.filter((b) => {
      const status = (b.bookStatus || "").trim().toUpperCase();
      if (!ALLOWED_STATUSES.has(status)) return false;

      if (!b.bookStart) return false;
      const d = new Date(b.bookStart);
      if (Number.isNaN(d.getTime())) return false;
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
  }, [bookings, currentMonth, currentYear]);

  const filteredBookings = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return currentMonthBookings;

    return currentMonthBookings.filter((b) => {
      const carName = `${b.carBrand ?? ""} ${b.carType ?? ""}`.trim().toLowerCase();
      const customer = `${b.cusFN ?? ""} ${b.cusLN ?? ""}`.trim().toLowerCase();
      const provinces = `${b.bookSProvice ?? ""} ${b.bookEProvince ?? ""}`.trim().toLowerCase();
      return (
        String(b.bookID).includes(q) ||
        carName.includes(q) ||
        customer.includes(q) ||
        provinces.includes(q) ||
        formatDate(b.bookStart).toLowerCase().includes(q)
      );
    });
  }, [currentMonthBookings, search]);

  const totalAmount = useMemo(
    () => filteredBookings.reduce((sum, b) => sum + toNumber(b.bookTotalPrice), 0),
    [filteredBookings]
  );

  async function loadBookings() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/bookings", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok || !json?.ok || !Array.isArray(json?.data)) {
        throw new Error(json?.error || "โหลดข้อมูลการเช่าไม่สำเร็จ");
      }
      setBookings(json.data as BookingRow[]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "โหลดข้อมูลการเช่าไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBookings();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
          <Car className="text-blue-600" size={32} />
          รายการเช่ารถ (Rental Logs)
        </h1>
        <p className="text-slate-500 text-sm mt-2 font-medium">
          แสดงรถและลูกค้าที่จองในเดือนปัจจุบัน ({getMonthLabel()})
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="ค้นหารถ/ลูกค้า/เลขจอง..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition outline-none shadow-sm"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm font-bold text-slate-700">
              ยอดรวม: <span className="text-emerald-600">฿{totalAmount.toLocaleString()}</span>
            </div>
            <button
              onClick={loadBookings}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition shadow-sm text-sm disabled:opacity-60"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              รีเฟรช
            </button>
          </div>
        </div>

        {error && (
          <div className="mx-5 mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-black tracking-wider">
              <tr>
                <th scope="col" className="px-6 py-4">
                  เลขจอง
                </th>
                <th scope="col" className="px-6 py-4">
                  วันที่เริ่มเช่า
                </th>
                <th scope="col" className="px-6 py-4">
                  รถที่จอง
                </th>
                <th scope="col" className="px-6 py-4">
                  ลูกค้า
                </th>
                <th scope="col" className="px-6 py-4">
                  จังหวัด
                </th>
                <th scope="col" className="px-6 py-4">
                  ระยะเวลา
                </th>
                <th scope="col" className="px-6 py-4 text-right">
                  ยอดชำระ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {!loading && filteredBookings.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-slate-500 font-medium">
                    ไม่พบรายการจองในเดือนปัจจุบัน
                  </td>
                </tr>
              )}

              {filteredBookings.map((b) => (
                <tr key={b.bookID} className="hover:bg-blue-50/50 transition">
                  <td className="px-6 py-4 font-bold text-slate-800">RNT-{b.bookID}</td>
                  <td className="px-6 py-4 font-medium text-slate-500">{formatDate(b.bookStart)}</td>
                  <td className="px-6 py-4 text-slate-600 font-medium">
                    {[b.carBrand, b.carType].filter(Boolean).join(" ") || "-"}
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {[b.cusFN, b.cusLN].filter(Boolean).join(" ") || "-"}
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {(b.bookSProvice || "-") + " -> " + (b.bookEProvince || "-")}
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-500">
                    {getDurationDays(b.bookStart, b.bookEnd)}
                  </td>
                  <td className="px-6 py-4 font-black text-emerald-600 text-right">
                    ฿{toNumber(b.bookTotalPrice).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
