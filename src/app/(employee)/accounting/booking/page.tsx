// =============================================================
// 📊 หน้า: ศูนย์รวมข้อมูลการจอง (Booking Analytics)
// แสดงข้อมูลทั้งหมดจาก booking + payment + customer + car + addon
// - กราฟ SVG สรุปสัดส่วนสถานะ (Pie) + แนวโน้มรายได้ (Area)
// - ตารางข้อมูลเชิงลึก กรองได้ทุกมิติ
// - Modal จัดการ: แก้สถานะจอง, สถานะจ่ายเงิน, ดู Addon, เขียนโน้ต
// - ปุ่ม Export CSV ดาวน์โหลดข้อมูลทั้งหมด
// =============================================================
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarRange,
  Download,
  RefreshCw,
  Car,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Settings,
  X,
  Save,
  Package,
  CheckCircle2,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// --- ข้อมูล 1 addon ที่มากับ booking ---
type AddonInfo = {
  addonName: string;
  addonPrice: number;
  quantity: number;
};

// --- ข้อมูล 1 แถวการจอง (Deep Join แล้ว) ---
type BookingDetail = {
  bookID: number;
  bookStatus: "Pending" | "Confirmed" | "Active" | "Completed" | "Cancelled";
  bookCarPrice: number | string | null;
  bookTotalPrice: number | string | null;
  bookStart: string;
  bookEnd: string;
  bookCreate: string;
  bookSProvice: string | null;
  bookEProvince: string | null;
  cusFN: string;
  cusLN: string;
  cusPhone: string;
  cusMail: string;
  carBrand: string;
  carType: string;
  carPlate: string;
  payID: number | null;
  payMethod: string | null;
  payStatus: string | null;
  payAmount: number | string | null;
  payTime: string | null;
  payReference: string | null;
  payNote: string | null;
  proID: number | null;
  addons: AddonInfo[];
};

// --- ฟังก์ชันช่วยต่างๆ ---

// แปลงค่าเป็นตัวเลข ถ้าแปลงไม่ได้คืน 0
const toNum = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

// แปลงวันที่ให้อ่านง่าย เช่น "7 มี.ค. 2569 10:30"
const fmtDate = (v: string | null) => {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// สีประจำสถานะแต่ละแบบ
const STATUS_COLORS: Record<string, string> = {
  Completed: "#10b981",
  Active: "#3b82f6",
  Confirmed: "#f59e0b",
  Pending: "#64748b",
  Cancelled: "#ef4444",
};

// =============================================================
// 🎨 Component หลัก
// =============================================================
export default function AccountingBookingPage() {
  const [bookings, setBookings] = useState<BookingDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // --- ตัวกรอง ---
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(
    now.getFullYear().toString(),
  );
  const [selectedMonth, setSelectedMonth] = useState(
    (now.getMonth() + 1).toString(),
  );
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");

  // --- Modal จัดการ ---
  const [editRow, setEditRow] = useState<BookingDetail | null>(null);
  const [editBookStatus, setEditBookStatus] = useState("");
  const [editPayStatus, setEditPayStatus] = useState("");
  const [editPayNote, setEditPayNote] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // --- ตัวเลือกวัน (คำนวณจากเดือนที่เลือก) ---
  const years = [
    now.getFullYear(),
    now.getFullYear() - 1,
    now.getFullYear() - 2,
  ];
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const daysInMonth = useMemo(
    () => new Date(Number(selectedYear), Number(selectedMonth), 0).getDate(),
    [selectedYear, selectedMonth],
  );
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // =============================================================
  // 📡 ดึงข้อมูลจาก API (จะถูกเรียกทุกครั้งที่ filter เปลี่ยน)
  // =============================================================
  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const url = new URL("/api/accounting/booking", window.location.origin);
      if (selectedYear) url.searchParams.append("year", selectedYear);
      if (selectedMonth) url.searchParams.append("month", selectedMonth);
      if (selectedDay) url.searchParams.append("day", selectedDay);
      if (selectedStatus && selectedStatus !== "All")
        url.searchParams.append("status", selectedStatus);

      const res = await fetch(url.toString(), { cache: "no-store" });
      const json = await res.json();
      if (!res.ok || !json?.ok)
        throw new Error(json?.message || "โหลดข้อมูลไม่สำเร็จ");
      setBookings(json.data as BookingDetail[]);
    } catch (e: unknown) {
      setError(
        e instanceof Error ? e.message : "เกิดข้อผิดพลาดในการโหลดข้อมูล",
      );
    } finally {
      setLoading(false);
    }
  }

  // โหลดใหม่ทุกครั้งที่ filter เปลี่ยน
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear, selectedMonth, selectedDay, selectedStatus]);

  // =============================================================
  // ✏️ เปิด Modal แก้ไข: ใส่ค่าเดิมเข้าไปในฟอร์ม
  // =============================================================
  function openEdit(b: BookingDetail) {
    setEditRow(b);
    setEditBookStatus(b.bookStatus);
    setEditPayStatus(b.payStatus || "pending");
    setEditPayNote(b.payNote || "");
  }

  // =============================================================
  // 💾 บันทึกการแก้ไข → เรียก PUT /api/accounting/booking
  // =============================================================
  async function saveEdit() {
    if (!editRow) return;
    setSavingEdit(true);
    try {
      const res = await fetch("/api/accounting/booking", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookID: editRow.bookID,
          bookStatus:
            editBookStatus !== editRow.bookStatus ? editBookStatus : undefined,
          payStatus:
            editPayStatus !== (editRow.payStatus || "pending")
              ? editPayStatus
              : undefined,
          payNote:
            editPayNote !== (editRow.payNote || "") ? editPayNote : undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok)
        throw new Error(json.message || "อัปเดตไม่สำเร็จ");

      setEditRow(null);
      setToast("✅ อัปเดตข้อมูลการจองสำเร็จ!");
      setTimeout(() => setToast(null), 4000);
      loadData();
    } catch (e: unknown) {
      alert("เกิดข้อผิดพลาด: " + (e instanceof Error ? e.message : ""));
    } finally {
      setSavingEdit(false);
    }
  }

  // =============================================================
  // 📊 คำนวณข้อมูลสำหรับกราฟ
  // =============================================================

  // นับจำนวนการจองแต่ละสถานะ → ใช้ทำ Pie Chart
  const statusStats = useMemo(() => {
    return bookings.reduce(
      (acc, b) => {
        acc[b.bookStatus] = (acc[b.bookStatus] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
  }, [bookings]);

  const pieData = Object.keys(statusStats).map((s) => ({
    name: s,
    value: statusStats[s],
    color: STATUS_COLORS[s] || "#cbd5e1",
  }));

  // รวมยอดเงินรายวัน/รายชั่วโมง → ใช้ทำ Area Chart
  const chartData = useMemo(() => {
    const map = new Map<number, number>();
    if (selectedDay) {
      for (let h = 0; h < 24; h++) map.set(h, 0); // เตรียม 24 ชั่วโมง
    } else {
      days.forEach((d) => map.set(d, 0)); // เตรียมทุกวันในเดือน
    }

    bookings.forEach((b) => {
      if (!b.bookStart || b.bookStatus === "Cancelled") return;
      const d = new Date(b.bookStart);
      const key = selectedDay ? d.getHours() : d.getDate();
      map.set(key, (map.get(key) || 0) + toNum(b.bookTotalPrice));
    });

    return Array.from(map.entries())
      .map(([key, amount]) => ({
        label: selectedDay ? `${key}:00` : `${key}`,
        amount,
      }))
      .sort((a, b) => parseInt(a.label) - parseInt(b.label));
  }, [bookings, days, selectedDay]);

  // คำนวณยอดรวมๆ สำหรับแสดงในการ์ด
  const totalVal = bookings
    .filter((b) => b.bookStatus !== "Cancelled")
    .reduce((s, b) => s + toNum(b.bookTotalPrice), 0);
  const totalApproved = bookings
    .filter((b) => b.payStatus === "approved" && b.bookStatus !== "Cancelled")
    .reduce((s, b) => s + toNum(b.payAmount), 0);

  // =============================================================
  function exportCsv() {
    const h = [
      "BookID",
      "สถานะ",
      "ลูกค้า",
      "เบอร์",
      "รถ",
      "ทะเบียน",
      "เริ่ม",
      "จบ",
      "ยอดรวม",
      "สถานะจ่าย",
      "ยอดจ่าย",
      "Addon",
    ];
    const rows = bookings.map((b) => [
      `RNT-${b.bookID}`,
      b.bookStatus,
      `${b.cusFN} ${b.cusLN}`,
      `'${b.cusPhone}`,
      `${b.carBrand} ${b.carType}`,
      b.carPlate,
      b.bookStart,
      b.bookEnd,
      toNum(b.bookTotalPrice),
      b.payStatus || "N/A",
      toNum(b.payAmount),
      b.addons.map((a) => `${a.addonName}x${a.quantity}`).join("; ") || "-",
    ]);
    const csv = [
      h.join(","),
      ...rows.map((r) =>
        r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","),
      ),
    ].join("\n");

    // 🌟 แก้ไข: เติม "\uFEFF" เข้าไปข้างหน้าตัวแปร csv
    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `booking-report-${selectedYear}-${selectedMonth}${selectedDay ? `-${selectedDay}` : ""}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // =============================================================
  // 🎨 Render UI
  // =============================================================
  return (
    <div className="space-y-6 pb-20">
      {/* ===== Header + Filter Bar ===== */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <CalendarRange className="text-blue-600" size={32} />
            ศูนย์รวมข้อมูลการจอง
          </h1>
          <p className="text-slate-500 text-sm mt-2 font-medium">
            ดูเจาะลึกรายการเช่ารถ จัดการสถานะ Addon และสรุปยอดทุกมิติ
          </p>
        </div>

        {/* แถบกรอง: ปี | เดือน | วัน | สถานะ | รีเฟรช */}
        <div className="flex flex-wrap items-center gap-2 p-2 bg-white border border-slate-200 rounded-2xl shadow-sm w-fit">
          <select
            className="bg-transparent border-none text-sm font-bold text-slate-700 px-3 py-2 outline-none cursor-pointer"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <div className="w-[1px] h-6 bg-slate-200" />
          <select
            className="bg-transparent border-none text-sm font-bold text-slate-700 px-3 py-2 outline-none cursor-pointer"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            {months.map((m) => (
              <option key={m} value={m}>
                เดือน {m}
              </option>
            ))}
          </select>
          <div className="w-[1px] h-6 bg-slate-200" />
          <select
            className="bg-transparent border-none text-sm font-bold text-slate-700 px-3 py-2 outline-none cursor-pointer"
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
          >
            <option value="">ทุกวัน</option>
            {days.map((d) => (
              <option key={d} value={d}>
                วันที่ {d}
              </option>
            ))}
          </select>
          <div className="w-[1px] h-6 bg-slate-200" />
          <select
            className="bg-transparent border-none text-sm font-bold text-blue-700 px-3 py-2 outline-none cursor-pointer min-w-[110px]"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="All">ทุกสถานะ</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition ml-1"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* ===== Toast / Error ===== */}
      {toast && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-5 py-3.5 text-blue-700 text-sm font-bold flex items-center gap-3 shadow-sm">
          <CheckCircle2 size={20} className="text-blue-600 shrink-0" /> {toast}
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {error}
        </div>
      )}

      {/* ===== 4 การ์ดสรุป ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition">
          <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
            <Car size={24} />
          </div>
          <div>
            <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">
              จำนวนการจองรวม
            </p>
            <p className="text-2xl font-black text-slate-800 mt-1">
              {bookings.length.toLocaleString()}
            </p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition">
          <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">
              Active + Completed
            </p>
            <p className="text-2xl font-black text-slate-800 mt-1">
              {(statusStats.Completed || 0) + (statusStats.Active || 0)}
            </p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition">
          <div className="bg-amber-100 p-3 rounded-xl text-amber-600">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">
              Pending + Confirmed
            </p>
            <p className="text-2xl font-black text-slate-800 mt-1">
              {(statusStats.Pending || 0) + (statusStats.Confirmed || 0)}
            </p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-rose-100 flex items-center gap-4 hover:shadow-md transition">
          <div className="bg-rose-100 p-3 rounded-xl text-rose-600">
            <XCircle size={24} />
          </div>
          <div>
            <p className="text-rose-500 text-[11px] font-bold uppercase tracking-wider">
              ยกเลิก
            </p>
            <p className="text-2xl font-black text-rose-600 mt-1">
              {bookings.length > 0
                ? Math.round(
                    ((statusStats.Cancelled || 0) / bookings.length) * 100,
                  )
                : 0}
              %
            </p>
          </div>
        </div>
      </div>

      {/* ===== กราฟ Area + Pie ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area Chart: แนวโน้มรายได้ */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
            <FileText size={20} className="text-blue-600" />
            แนวโน้มยอดจอง ({selectedDay ? "รายชั่วโมง" : "รายวัน"})
          </h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="bookGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#64748b", fontWeight: 600 }}
                  dy={10}
                  minTickGap={20}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  dx={-10}
                  tickFormatter={(v) => `฿${Math.round(v / 1000)}k`}
                />
                <Tooltip
                  cursor={{ stroke: "#e2e8f0", strokeWidth: 1 }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  }}
                  formatter={(value) => [
                    `฿${toNum(value).toLocaleString()}`,
                    "ยอดรวมจอง",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#2563eb"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#bookGrad)"
                  activeDot={{
                    r: 6,
                    fill: "#2563eb",
                    stroke: "#fff",
                    strokeWidth: 3,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          {/* สรุปยอดด้านล่างกราฟ */}
          <div className="mt-4 flex flex-wrap gap-8 justify-center pt-4 border-t border-slate-100">
            <div className="text-center">
              <p className="text-emerald-600 text-[11px] font-bold uppercase tracking-wider">
                ยอดจองทั้งหมด (Booking)
              </p>
              <p className="text-2xl font-black text-emerald-600 mt-1">
                ฿{totalVal.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Pie Chart: สัดส่วนสถานะ */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-black text-slate-800 mb-2 flex items-center gap-2">
            <CheckCircle size={20} className="text-blue-600" /> สัดส่วนสถานะ
          </h2>
          <div className="h-[300px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, i) => (
                    <Cell key={`c-${i}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    fontWeight: "bold",
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ fontSize: "12px", fontWeight: "bold" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ===== ตารางข้อมูลดิบ ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-lg font-black text-slate-800">
              ตารางรายการจองทั้งหมด
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              กดปุ่มจัดการเพื่อดูรายละเอียดเพิ่มเติมและแก้ไขสถานะได้
            </p>
          </div>
          <button
            onClick={exportCsv}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold transition shadow-sm whitespace-nowrap text-sm"
          >
            <Download size={16} /> Export CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 text-[10px] uppercase font-black tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">RNT ID</th>
                <th className="px-4 py-3">สถานะ</th>
                <th className="px-4 py-3">ลูกค้า</th>
                <th className="px-4 py-3">รถ / วันเวลา</th>
                <th className="px-4 py-3">Addon</th>
                <th className="px-4 py-3 text-right">ยอดรวม</th>
                <th className="px-4 py-3 text-right">สถานะจ่าย</th>
                <th className="px-4 py-3 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-10 text-center text-slate-500 font-medium"
                  >
                    กำลังโหลดข้อมูล...
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-10 text-center text-slate-500 font-medium"
                  >
                    ไม่พบข้อมูลการจอง
                  </td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <tr
                    key={b.bookID}
                    className="hover:bg-blue-50/30 transition group"
                  >
                    <td className="px-4 py-4 align-top">
                      <span className="font-bold text-slate-800">
                        RNT-{b.bookID}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-1">
                        {fmtDate(b.bookCreate)}
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <span
                        className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider inline-flex items-center whitespace-nowrap border"
                        style={{
                          borderColor: `${STATUS_COLORS[b.bookStatus]}30`,
                          backgroundColor: `${STATUS_COLORS[b.bookStatus]}15`,
                          color: STATUS_COLORS[b.bookStatus],
                        }}
                      >
                        {b.bookStatus}
                      </span>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="font-bold text-slate-700">
                        {b.cusFN} {b.cusLN}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {b.cusPhone || "-"}
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top text-xs">
                      <div className="font-bold text-slate-800">
                        {b.carBrand} {b.carType}
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium mt-0.5 bg-slate-100 w-fit px-1.5 py-0.5 rounded">
                        ทะเบียน {b.carPlate}
                      </div>
                      <div className="text-[10px] text-slate-600 mt-1 leading-tight">
                        เริ่ม{" "}
                        <span className="font-bold">
                          {fmtDate(b.bookStart)}
                        </span>
                        <br />
                        จบ{" "}
                        <span className="font-bold">{fmtDate(b.bookEnd)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top text-xs">
                      {b.addons.length > 0 ? (
                        <div className="space-y-1">
                          {b.addons.map((ad, i) => (
                            <div
                              key={i}
                              className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1"
                            >
                              <Package size={10} /> {ad.addonName} x
                              {ad.quantity}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[10px]">-</span>
                      )}
                    </td>
                    <td className="px-4 py-4 align-top text-right">
                      <div className="font-black text-slate-800">
                        ฿{toNum(b.bookTotalPrice).toLocaleString()}
                      </div>
                      {b.proID && (
                        <span className="text-[9px] bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded uppercase font-bold mt-1 inline-block">
                          Promo
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 align-top text-right">
                      <div className="text-sm font-black text-emerald-600">
                        {b.payAmount
                          ? `฿${toNum(b.payAmount).toLocaleString()}`
                          : "-"}
                      </div>
                      <div
                        className={`text-[10px] uppercase tracking-wider mt-1 font-bold inline-block px-1.5 py-0.5 rounded ${b.payStatus === "approved" ? "bg-emerald-100 text-emerald-700" : b.payStatus === "rejected" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"}`}
                      >
                        {b.payStatus || "N/A"}
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top text-center">
                      <button
                        onClick={() => openEdit(b)}
                        className="p-2 bg-slate-100 text-slate-600 hover:bg-blue-600 hover:text-white rounded-xl transition shadow-sm opacity-100 lg:opacity-0 group-hover:opacity-100"
                        title="จัดการ"
                      >
                        <Settings size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== Modal จัดการ (ขนาดใหญ่ โชว์ Addon + สรุป + แก้ไขสถานะ) ===== */}
      {editRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            {/* หัว Modal สีน้ำเงิน */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 flex justify-between items-center sticky top-0 z-10">
              <div>
                <h2 className="text-lg font-black text-white">
                  จัดการข้อมูลการจอง
                </h2>
                <p className="text-blue-200 text-xs mt-0.5 font-medium">
                  RNT-{editRow.bookID} • {editRow.cusFN} {editRow.cusLN}
                </p>
              </div>
              <button
                onClick={() => setEditRow(null)}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* สรุปข้อมูลสำคัญ */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">
                    ยอดรวมบิล
                  </p>
                  <p className="font-black text-slate-800 mt-1">
                    ฿{toNum(editRow.bookTotalPrice).toLocaleString()}
                  </p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">
                    ยอดชำระ
                  </p>
                  <p className="font-black text-emerald-600 mt-1">
                    ฿{toNum(editRow.payAmount).toLocaleString()}
                  </p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">
                    วิธีจ่าย
                  </p>
                  <p className="font-black text-slate-700 mt-1 uppercase">
                    {editRow.payMethod || "-"}
                  </p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">
                    เวลาชำระ
                  </p>
                  <p className="font-bold text-slate-700 mt-1 text-xs">
                    {fmtDate(editRow.payTime)}
                  </p>
                </div>
              </div>

              {/* ข้อมูลรถ + ลูกค้า */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                  <p className="text-[10px] text-blue-400 font-bold uppercase">
                    รถที่จอง
                  </p>
                  <p className="font-black text-blue-800 mt-1">
                    {editRow.carBrand} {editRow.carType}
                  </p>
                  <p className="text-xs text-blue-600 mt-0.5">
                    ทะเบียน {editRow.carPlate}
                  </p>
                </div>
                <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                  <p className="text-[10px] text-blue-400 font-bold uppercase">
                    ลูกค้า
                  </p>
                  <p className="font-black text-blue-800 mt-1">
                    {editRow.cusFN} {editRow.cusLN}
                  </p>
                  <p className="text-xs text-blue-600 mt-0.5">
                    {editRow.cusPhone}{" "}
                    {editRow.cusMail ? `• ${editRow.cusMail}` : ""}
                  </p>
                </div>
              </div>

              {/* Addon ที่สั่งมาด้วย */}
              {editRow.addons.length > 0 && (
                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                  <h3 className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Package size={14} /> รายการ Add-on เพิ่มเติม
                  </h3>
                  <div className="space-y-2">
                    {editRow.addons.map((ad, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center text-sm bg-white px-3 py-2 rounded-lg border border-indigo-100"
                      >
                        <span className="font-bold text-indigo-800">
                          {ad.addonName}{" "}
                          <span className="text-indigo-400">
                            x{ad.quantity}
                          </span>
                        </span>
                        <span className="font-black text-indigo-700">
                          ฿{(ad.addonPrice * ad.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ฟอร์มแก้ไข */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                    สถานะการจอง (Booking Status)
                  </label>
                  <select
                    value={editBookStatus}
                    onChange={(e) => setEditBookStatus(e.target.value)}
                    className="w-full bg-white border border-slate-200 px-3 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm text-slate-800 shadow-sm"
                  >
                    <option value="Pending">Pending (รอยืนยัน)</option>
                    <option value="Confirmed">Confirmed (ยืนยันแล้ว)</option>
                    <option value="Active">Active (กำลังเช่ารถ)</option>
                    <option value="Completed">Completed (เสร็จสิ้น)</option>
                    <option value="Cancelled">Cancelled (ยกเลิก)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                    สถานะการชำระเงิน (Pay Status)
                  </label>
                  <select
                    value={editPayStatus}
                    onChange={(e) => setEditPayStatus(e.target.value)}
                    className="w-full bg-white border border-slate-200 px-3 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm text-slate-800 shadow-sm"
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                    บันทึกบัญชี (Pay Note)
                  </label>
                  <textarea
                    value={editPayNote}
                    onChange={(e) => setEditPayNote(e.target.value)}
                    rows={3}
                    placeholder="แอดมินสามารถเพิ่มบันทึกเพิ่มเติมได้..."
                    className="w-full bg-white border border-slate-200 px-3 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm text-slate-700 shadow-sm"
                  />
                </div>
              </div>

              {/* ปุ่มกดในModal */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setEditRow(null)}
                  className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition flex-1"
                  disabled={savingEdit}
                >
                  ยกเลิก
                </button>
                <button
                  onClick={saveEdit}
                  disabled={savingEdit}
                  className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition shadow-md flex-[2] flex justify-center items-center gap-2"
                >
                  {savingEdit ? (
                    <>
                      <RefreshCw className="animate-spin" size={18} /> บันทึก...
                    </>
                  ) : (
                    <>
                      <Save size={18} /> ยืนยันการเปลี่ยนแปลง
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
