"use client";

import { useEffect, useMemo, useState } from "react";
import { Wallet, Download, Calendar, RefreshCw } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type BookingRow = {
  bookID: number;
  bookStart: string | null;
  bookStatus: string | null;
  bookTotalPrice: number | string | null;
  carBrand: string | null;
  carType: string | null;
  cusFN: string | null;
  cusLN: string | null;
};

type ChartPoint = {
  day: string;
  income: number;
};

const ALLOWED_STATUSES = new Set(["COMPLETED", "ACTIVE", "CONFIRMED"]);

const toNumber = (value: unknown) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const monthLabel = (date = new Date()) =>
  date.toLocaleDateString("th-TH", { month: "long", year: "numeric" });

const dateLabel = (value: string | null) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("th-TH", { year: "numeric", month: "2-digit", day: "2-digit" });
};

export default function AccountingIncomePage() {
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthBookings = useMemo(() => {
    return bookings.filter((b) => {
      const status = (b.bookStatus || "").trim().toUpperCase();
      if (!ALLOWED_STATUSES.has(status)) return false;
      if (!b.bookStart) return false;

      const d = new Date(b.bookStart);
      if (Number.isNaN(d.getTime())) return false;
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
  }, [bookings, currentMonth, currentYear]);

  const totalIncome = useMemo(
    () => monthBookings.reduce((sum, b) => sum + toNumber(b.bookTotalPrice), 0),
    [monthBookings]
  );

  const avgPerBooking = monthBookings.length > 0 ? totalIncome / monthBookings.length : 0;

  const chartData = useMemo(() => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const dayTotals = new Map<number, number>();

    monthBookings.forEach((b) => {
      if (!b.bookStart) return;
      const d = new Date(b.bookStart);
      if (Number.isNaN(d.getTime())) return;
      const day = d.getDate();
      dayTotals.set(day, (dayTotals.get(day) || 0) + toNumber(b.bookTotalPrice));
    });

    const points: ChartPoint[] = [];
    for (let day = 1; day <= daysInMonth; day += 1) {
      points.push({
        day: String(day),
        income: dayTotals.get(day) || 0,
      });
    }
    return points;
  }, [monthBookings, currentMonth, currentYear]);

  const recentBookings = useMemo(() => {
    return [...monthBookings]
      .sort((a, b) => {
        const ad = new Date(a.bookStart || 0).getTime();
        const bd = new Date(b.bookStart || 0).getTime();
        return bd - ad;
      })
      .slice(0, 6);
  }, [monthBookings]);

  async function loadBookings() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/bookings", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok || !json?.ok || !Array.isArray(json?.data)) {
        throw new Error(json?.error || "โหลดข้อมูลการจองไม่สำเร็จ");
      }
      setBookings(json.data as BookingRow[]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "โหลดข้อมูลการจองไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  function exportCsv() {
    const headers = ["bookID", "bookStart", "bookStatus", "car", "customer", "bookTotalPrice"];
    const rows = monthBookings.map((b) => [
      b.bookID,
      b.bookStart || "",
      b.bookStatus || "",
      `${b.carBrand || ""} ${b.carType || ""}`.trim(),
      `${b.cusFN || ""} ${b.cusLN || ""}`.trim(),
      toNumber(b.bookTotalPrice),
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `income-report-${currentYear}-${String(currentMonth + 1).padStart(2, "0")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  useEffect(() => {
    loadBookings();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <Wallet className="text-blue-600" size={32} />
            รายงานยอดการจองเดือนปัจจุบัน
          </h1>
          <p className="text-slate-500 text-sm mt-2 font-medium">
            สรุปยอดจากรายการจองสถานะ Completed, Active, Confirmed ของเดือน {monthLabel()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadBookings}
            disabled={loading}
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-bold transition shadow-sm"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            รีเฟรช
          </button>
          <button
            onClick={exportCsv}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-bold transition shadow-md whitespace-nowrap"
          >
            <Download size={18} /> Export CSV
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-slate-500 text-sm font-bold">ยอดรวมเดือนนี้</p>
          <p className="text-3xl font-black text-emerald-600 mt-2">฿{totalIncome.toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-slate-500 text-sm font-bold">จำนวนการจอง</p>
          <p className="text-3xl font-black text-slate-800 mt-2">{monthBookings.length.toLocaleString()} รายการ</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-slate-500 text-sm font-bold">เฉลี่ยต่อการจอง</p>
          <p className="text-3xl font-black text-blue-600 mt-2">฿{Math.round(avgPerBooking).toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
          <Calendar size={20} className="text-blue-600" /> กราฟยอดจองรายวัน ({monthLabel()})
        </h2>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b", fontWeight: 600 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} dx={-10} tickFormatter={(val) => `฿${Math.round(val / 1000)}k`} />
              <Tooltip
                cursor={{ stroke: "#e2e8f0", strokeWidth: 1 }}
                contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                formatter={(value) => [`฿${toNumber(value).toLocaleString()}`, "ยอดจอง"]}
                labelFormatter={(label) => `วันที่ ${label}`}
              />
              <Line type="monotone" dataKey="income" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: "#3b82f6", stroke: "#fff", strokeWidth: 2 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 text-sm font-black text-slate-700">
          รายการจองล่าสุดของเดือนนี้
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-black tracking-wider">
              <tr>
                <th className="px-6 py-4">เลขจอง</th>
                <th className="px-6 py-4">วันที่จอง</th>
                <th className="px-6 py-4">รถ</th>
                <th className="px-6 py-4">ลูกค้า</th>
                <th className="px-6 py-4 text-right">ยอดจอง</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {!loading && recentBookings.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-500 font-medium">
                    ไม่พบข้อมูลการจองในเดือนปัจจุบัน
                  </td>
                </tr>
              )}
              {recentBookings.map((b) => (
                <tr key={b.bookID} className="hover:bg-blue-50/50 transition">
                  <td className="px-6 py-4 font-bold text-slate-800">RNT-{b.bookID}</td>
                  <td className="px-6 py-4 font-medium text-slate-500">{dateLabel(b.bookStart)}</td>
                  <td className="px-6 py-4 text-slate-600 font-medium">
                    {[b.carBrand, b.carType].filter(Boolean).join(" ") || "-"}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {[b.cusFN, b.cusLN].filter(Boolean).join(" ") || "-"}
                  </td>
                  <td className="px-6 py-4 text-right font-black text-emerald-600">
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
