"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, CarFront, Banknote, Users, TrendingUp } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

type Period = "daily" | "weekly" | "monthly";

type TrendItem = {
  periodKey: string;
  revenue: number;
  bookings: number;
};

type ProvinceBookingItem = {
  province: string;
  bookings: number;
};

type Summary = {
  totalRevenue: number;
  totalBookings: number;
  uniqueCustomers: number;
};

type ReportResponse = {
  period: Period;
  province: string;
  date?: string | null;
  month?: string | null;
  summary: Summary;
  trend: TrendItem[];
  provinceBookings: ProvinceBookingItem[];
  provinces: string[];
  updatedAt: string;
};

type ErrorResponse = {
  message?: string;
  error?: string;
  code?: string;
};

const periodOptions: Array<{ value: Period; label: string }> = [
  { value: "daily", label: "รายวัน" },
  { value: "weekly", label: "รายเดือน)" },
  { value: "monthly", label: "รายปั" },
];

const numberFmt = new Intl.NumberFormat("th-TH");
const currencyFmt = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});
const getTodayInputDate = (): string => {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};
const getCurrentMonthInput = (): string => getTodayInputDate().slice(0, 7);
const getRecentMonthOptions = (count: number): Array<{ value: string; label: string }> => {
  const base = new Date();
  const options: Array<{ value: string; label: string }> = [];
  for (let i = 0; i < count; i += 1) {
    const d = new Date(base.getFullYear(), base.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("th-TH", { month: "long", year: "numeric" });
    options.push({ value, label });
  }
  return options;
};
const filterControlClass =
  "w-full box-border [field-sizing:fixed] bg-white border border-slate-200 text-sm font-semibold text-slate-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500";
const filterSlotClass = "flex-none w-[180px] min-w-[180px] max-w-[180px]";

const formatXAxisLabel = (periodKey: string, period: Period): string => {
  const d = new Date(periodKey);
  if (Number.isNaN(d.getTime())) return periodKey;

  if (period === "daily") {
    return d.toLocaleDateString("th-TH", { day: "2-digit", month: "short" });
  }
  if (period === "weekly") {
    return `สัปดาห์ ${d.toLocaleDateString("th-TH", { day: "2-digit", month: "short" })}`;
  }
  return d.toLocaleDateString("th-TH", { month: "short", year: "2-digit" });
};

export default function ManagerReportsPage() {
  const [period, setPeriod] = useState<Period>("monthly");
  const [province, setProvince] = useState("all");
  const [selectedDate, setSelectedDate] = useState<string>(getTodayInputDate());
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonthInput());
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const monthOptions = useMemo(() => getRecentMonthOptions(24), []);

  useEffect(() => {
    const controller = new AbortController();

    const loadReport = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          period,
          province,
        });
        if (period === "daily" && selectedDate) {
          params.set("date", selectedDate);
        }
        if (period === "weekly" && selectedMonth) {
          params.set("month", selectedMonth);
        }
        const res = await fetch(`/api/manager/reports?${params.toString()}`, {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!res.ok) {
          let payload: ErrorResponse | null = null;
          try {
            payload = (await res.json()) as ErrorResponse;
          } catch {
            payload = null;
          }
          const serverMessage =
            [payload?.message, payload?.error, payload?.code].filter(Boolean).join(" | ") ||
            "โหลดรายงานไม่สำเร็จ";
          throw new Error(serverMessage);
        }
        const json = (await res.json()) as ReportResponse;
        setReport(json);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        console.error(err);
        const msg = err instanceof Error ? err.message : "ไม่สามารถโหลดข้อมูลรายงานได้";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    loadReport();
    return () => controller.abort();
  }, [period, province, selectedDate, selectedMonth]);

  const chartData = useMemo(
    () =>
      (report?.trend ?? []).map((item) => ({
        ...item,
        label: formatXAxisLabel(item.periodKey, period),
      })),
    [report?.trend, period]
  );
  const isDailyProvinceView = period === "daily";
  const bookingChartData = useMemo(
    () =>
      isDailyProvinceView
        ? (report?.provinceBookings ?? []).map((item) => ({
          label: item.province,
          bookings: item.bookings,
        }))
        : chartData,
    [isDailyProvinceView, report?.provinceBookings, chartData]
  );

  const summary = report?.summary ?? {
    totalRevenue: 0,
    totalBookings: 0,
    uniqueCustomers: 0,
  };
  const avgRevenuePerBooking =
    summary.totalBookings > 0 ? summary.totalRevenue / summary.totalBookings : 0;
  const updatedAtText = report?.updatedAt
    ? new Date(report.updatedAt).toLocaleString("th-TH")
    : "-";

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <BarChart3 className="text-blue-600" size={32} />
            รายงานยอดขายผู้จัดการ
          </h1>
          <p className="text-slate-500 text-sm mt-2 font-medium">
            ดูยอดขายตามวัน สัปดาห์ เดือน และกรองตามจังหวัด
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className={filterSlotClass}>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as Period)}
              className={filterControlClass}
            >
              {periodOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className={filterSlotClass}>
            <select
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              className={filterControlClass}
            >
              <option value="all">ทุกจังหวัด</option>
              {(report?.provinces ?? []).map((prov) => (
                <option key={prov} value={prov}>
                  {prov}
                </option>
              ))}
            </select>
          </div>

          {period === "daily" && (
            <div className={filterSlotClass}>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className={filterControlClass}
              />
            </div>
          )}

          {period === "weekly" && (
            <div className={filterSlotClass}>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className={filterControlClass}
              >
                {monthOptions.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm font-semibold p-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start justify-between">
          <div>
            <p className="text-sm font-bold text-slate-500 mb-1">ยอดขายรวม</p>
            <h3 className="text-2xl font-black text-slate-800">
              {currencyFmt.format(summary.totalRevenue)}
            </h3>
            <p className="text-xs font-semibold text-slate-500 mt-2">ตามตัวกรองที่เลือก</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
            <Banknote className="text-blue-600" size={22} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start justify-between">
          <div>
            <p className="text-sm font-bold text-slate-500 mb-1">จำนวนการจอง</p>
            <h3 className="text-2xl font-black text-slate-800">
              {numberFmt.format(summary.totalBookings)} ครั้ง
            </h3>
            <p className="text-xs font-semibold text-slate-500 mt-2">ไม่นับรายการยกเลิก</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
            <CarFront className="text-emerald-600" size={22} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start justify-between">
          <div>
            <p className="text-sm font-bold text-slate-500 mb-1">ลูกค้าที่ใช้งาน</p>
            <h3 className="text-2xl font-black text-slate-800">
              {numberFmt.format(summary.uniqueCustomers)} คน
            </h3>
            <p className="text-xs font-semibold text-slate-500 mt-2">ลูกค้าไม่ซ้ำในช่วงที่เลือก</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
            <Users className="text-purple-600" size={22} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl shadow-lg shadow-blue-500/20 text-white">
          <p className="text-blue-100 text-sm font-bold mb-1">รายได้เฉลี่ยต่อ 1 การจอง</p>
          <h3 className="text-3xl font-black">{currencyFmt.format(avgRevenuePerBooking)}</h3>
          <p className="mt-3 text-blue-100 text-xs font-semibold flex items-center gap-1">
            <TrendingUp size={14} /> คำนวณจากยอดขายรวม / จำนวนจอง
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-800">แนวโน้มยอดขาย</h2>
            <span className="text-xs font-semibold text-slate-500">
              {loading ? "กำลังโหลด..." : `อัปเดต ${updatedAtText}`}
            </span>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#64748b", fontWeight: 600 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#64748b", fontWeight: 600 }}
                  dx={-10}
                  tickFormatter={(value) => `${Math.round(value / 1000)}k`}
                />
                <Tooltip
                  formatter={(value: number | string | undefined) =>
                    currencyFmt.format(Number(value ?? 0))
                  }
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="ยอดขาย"
                  stroke="#2563eb"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorIncome)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="mb-6">
            <h2 className="text-lg font-black text-slate-800">จำนวนการจอง</h2>
            <p className="text-xs font-semibold text-slate-500">
              {isDailyProvinceView ? "แยกตามจังหวัดของวันที่เลือก" : "แยกตามช่วงเวลาที่เลือก"}
            </p>
          </div>

          <div className="h-[280px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={bookingChartData}
                margin={{ top: 0, right: 0, left: isDailyProvinceView ? 0 : -25, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#64748b", fontWeight: 600 }}
                />
                <Tooltip
                  formatter={(value: number | string | undefined) =>
                    `${numberFmt.format(Number(value ?? 0))} ครั้ง`
                  }
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                  }}
                />
                <Bar
                  dataKey="bookings"
                  name={isDailyProvinceView ? "ยอดจองรายจังหวัด" : "ยอดจอง"}
                  fill="#0ea5e9"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
