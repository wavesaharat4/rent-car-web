// =============================================================
// 📊 หน้า: จัดการรายรับ (Income Dashboard)
// ดึงข้อมูลจากตาราง transaction (tranType = 'income') เท่านั้น
// - กราฟ Area Chart สีน้ำเงิน (กรองช่วงเดือนได้)
// - ตาราง + ค้นหา + Export CSV
// - ปุ่ม "เพิ่มรายรับ" เด้ง Modal สีน้ำเงิน-ขาว
// =============================================================
"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Wallet, Plus, Download, Calendar, RefreshCw, Search, X, Save, CheckCircle2,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

// --- ประเภทข้อมูลจาก DB ---
type IncomeRow = {
  tranID: number;
  empID: number | null;
  tranType: string;
  tranCategory: string;
  tranAmount: number;
  tranDate: string | null;
  tranDetail: string;
};

type IncomeForm = {
  tranCategory: string;
  tranAmount: string;
  tranDate: string;
  tranDetail: string;
};

// --- ฟังก์ชันช่วย ---
const toNumber = (value: unknown) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const nowForInput = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  const local = new Date(now.getTime() - offset);
  return local.toISOString().slice(0, 16);
};

const initialForm = (): IncomeForm => ({
  tranCategory: "ค่าเช่ารถ",
  tranAmount: "",
  tranDate: nowForInput(),
  tranDetail: "",
});

const parseEmpID = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const n = Number.parseInt(value, 10);
    return Number.isFinite(n) ? n : null;
  }
  return null;
};

// แปลงวันที่ให้อ่านง่ายแบบไทย
const formatDateTime = (value: string | null) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("th-TH", {
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hour12: false,
  });
};

// แกน Y แบบ Log Scale: ขั้นบันได 0 → 50 → 100 → 500 → 1k → 5k → 10k → 100k → 500k → 1M
const Y_TICKS = [0, 50, 100, 500, 1000, 5000, 10000, 100000, 500000, 1000000];

// หาค่า max ที่เหมาะสมสำหรับแกน Y
const getBestYMax = (maxVal: number) => {
  for (const t of Y_TICKS) {
    if (t >= maxVal) return t;
  }
  return Y_TICKS[Y_TICKS.length - 1];
};

// format ตัวเลขแกน Y ให้อ่านง่าย
const fmtYAxis = (val: number) => {
  if (val >= 1000000) return `฿${val / 1000000}M`;
  if (val >= 1000) return `฿${val / 1000}k`;
  return `฿${val}`;
};

// =============================================================
// 🎨 Component หลัก
// =============================================================
export default function AccountingIncomePage() {
  const { data: session } = useSession();

  const [incomes, setIncomes] = useState<IncomeRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<IncomeForm>(initialForm);

  // --- ตัวกรองเดือน/ปี สำหรับกราฟ ---
  const now = new Date();
  const [filterYear, setFilterYear] = useState(now.getFullYear());
  const [filterMonth, setFilterMonth] = useState(now.getMonth() + 1); // 1-12

  const empID = parseEmpID((session?.user as { id?: unknown } | undefined)?.id);

  // --- กรองปีเดือนในข้อมูล + ตัวค้นหา ---
  const filteredByDate = useMemo(() => {
    return incomes.filter((row) => {
      if (!row.tranDate) return false;
      const d = new Date(row.tranDate);
      if (Number.isNaN(d.getTime())) return false;
      return d.getFullYear() === filterYear && d.getMonth() + 1 === filterMonth;
    });
  }, [incomes, filterYear, filterMonth]);

  const filteredIncomes = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return filteredByDate;
    return filteredByDate.filter((row) =>
      String(row.tranID).includes(q) ||
      row.tranCategory.toLowerCase().includes(q) ||
      row.tranDetail.toLowerCase().includes(q) ||
      formatDateTime(row.tranDate).toLowerCase().includes(q)
    );
  }, [filteredByDate, searchTerm]);

  const totalIncome = useMemo(
    () => filteredIncomes.reduce((sum, row) => sum + row.tranAmount, 0),
    [filteredIncomes]
  );

  // --- สร้างข้อมูลกราฟรายวัน ---
  const chartData = useMemo(() => {
    const daysInMonth = new Date(filterYear, filterMonth, 0).getDate();
    const dayMap = new Map<number, number>();
    for (let d = 1; d <= daysInMonth; d++) dayMap.set(d, 0);

    filteredByDate.forEach((row) => {
      if (!row.tranDate) return;
      const d = new Date(row.tranDate);
      if (Number.isNaN(d.getTime())) return;
      const day = d.getDate();
      dayMap.set(day, (dayMap.get(day) || 0) + row.tranAmount);
    });

    return Array.from(dayMap.entries())
      .map(([day, amount]) => ({ label: `${day}`, amount }))
      .sort((a, b) => Number(a.label) - Number(b.label));
  }, [filteredByDate, filterYear, filterMonth]);

  const chartMax = useMemo(() => {
    const maxVal = Math.max(...chartData.map(d => d.amount), 0);
    return getBestYMax(maxVal * 1.15);
  }, [chartData]);

  const yTicks = useMemo(() => Y_TICKS.filter(t => t <= chartMax), [chartMax]);

  // =============================================================
  // 📡 ดึงข้อมูลรายรับจาก API
  // =============================================================
  async function loadIncomes() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/accounting/income", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok || !json?.ok || !Array.isArray(json?.data)) {
        throw new Error(json?.message || "โหลดข้อมูลรายรับไม่สำเร็จ");
      }
      setIncomes(json.data as IncomeRow[]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "โหลดข้อมูลรายรับไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadIncomes(); }, []);

  // =============================================================
  // 💾 บันทึกรายรับใหม่ลง DB
  // =============================================================
  async function submitIncome() {
    setError(null);
    setSuccess(null);
    const category = form.tranCategory.trim();
    const detail = form.tranDetail.trim();
    const amount = Number(form.tranAmount);

    if (!empID) { setError("ไม่พบรหัสพนักงาน กรุณาเข้าสู่ระบบใหม่"); return; }
    if (!category) { setError("กรุณาเลือกหรือกรอกประเภทรายรับ"); return; }
    if (!Number.isFinite(amount) || amount <= 0) { setError("กรุณากรอกจำนวนเงินที่ถูกต้อง"); return; }

    setSaving(true);
    try {
      const res = await fetch("/api/accounting/income", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ empID, tranCategory: category, tranAmount: amount, tranDate: form.tranDate || null, tranDetail: detail || null }),
      });
      const json = await res.json();
      if (!res.ok || !json?.ok) throw new Error(json?.message || "เพิ่มรายรับไม่สำเร็จ");

      setSuccess(`✅ บันทึกรายรับสำเร็จ (ID: ${json.tranID ?? "-"})`);
      setForm(initialForm());
      setShowModal(false);
      await loadIncomes();
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "เพิ่มรายรับไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  }

  // =============================================================
  // 📥 Export CSV
  // =============================================================
  function exportCsv() {
    const headers = ["TranID", "วันที่", "ประเภท", "จำนวนเงิน", "รายละเอียด"];
    const rows = filteredIncomes.map((row) => [
      row.tranID, row.tranDate || "", row.tranCategory || "", row.tranAmount, row.tranDetail || "",
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `income-report-${filterYear}-${String(filterMonth).padStart(2, "0")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ตัวเลือกเดือนภาษาไทย
  const MONTHS = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
  const YEARS = [now.getFullYear(), now.getFullYear() - 1, now.getFullYear() - 2];

  // =============================================================
  // 🎨 Render UI
  // =============================================================
  return (
    <div className="space-y-6 pb-20">
      {/* ===== Header ===== */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <Wallet className="text-blue-600" size={32} />
            จัดการรายรับ (Income)
          </h1>
          <p className="text-slate-500 text-sm mt-2 font-medium">
            ข้อมูลรายรับจริงจากตาราง Transaction (tranType = income)
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => { setShowModal(true); setError(null); setSuccess(null); }} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition shadow-md">
            <Plus size={18} /> เพิ่มรายรับ
          </button>
          <button onClick={exportCsv} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2.5 rounded-xl font-bold transition shadow-sm">
            <Download size={16} /> Export CSV
          </button>
          <button onClick={loadIncomes} disabled={loading} className="flex items-center justify-center w-10 h-10 bg-white border border-slate-200 text-slate-600 rounded-full hover:bg-slate-50 shadow-sm transition">
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* ===== Toast ===== */}
      {success && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-5 py-3.5 text-blue-700 text-sm font-bold flex items-center gap-3 shadow-sm">
          <CheckCircle2 size={20} className="text-blue-600 shrink-0" /> {success}
        </div>
      )}
      {error && !showModal && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-3.5 text-rose-700 text-sm font-bold shadow-sm">{error}</div>
      )}

      {/* ===== 3 การ์ดสรุป ===== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition">
          <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">รายรับรวม ({MONTHS[filterMonth - 1]} {filterYear})</p>
          <p className="text-3xl font-black text-emerald-600 mt-2">฿{totalIncome.toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition">
          <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">จำนวนรายการ</p>
          <p className="text-3xl font-black text-slate-800 mt-2">{filteredIncomes.length.toLocaleString()} รายการ</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition">
          <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">เฉลี่ยต่อรายการ</p>
          <p className="text-3xl font-black text-blue-600 mt-2">
            ฿{filteredIncomes.length > 0 ? Math.round(totalIncome / filteredIncomes.length).toLocaleString() : "0"}
          </p>
        </div>
      </div>

      {/* ===== กราฟ Area Chart + ตัวกรองเดือน ===== */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <Calendar size={20} className="text-blue-600" /> กราฟยอดรายรับรายวัน
          </h2>
          {/* ตัวเลือกเดือน/ปี */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5">
            <select value={filterYear} onChange={e => setFilterYear(Number(e.target.value))} className="bg-transparent border-none text-sm font-bold text-slate-700 px-2 py-1 outline-none cursor-pointer">
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <div className="w-[1px] h-5 bg-slate-200" />
            <select value={filterMonth} onChange={e => setFilterMonth(Number(e.target.value))} className="bg-transparent border-none text-sm font-bold text-blue-600 px-2 py-1 outline-none cursor-pointer">
              {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
          </div>
        </div>
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#64748b", fontWeight: 600 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#64748b" }} dx={-10}
                domain={[0, chartMax]}
                ticks={yTicks}
                tickFormatter={fmtYAxis}
              />
              <Tooltip
                cursor={{ stroke: "#e2e8f0", strokeWidth: 1 }}
                contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                formatter={(value) => [`฿${toNumber(value).toLocaleString()}`, "ยอดรายรับ"]}
                labelFormatter={(label) => `วันที่ ${label}`}
              />
              <Area type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#incomeGrad)"
                activeDot={{ r: 6, fill: "#2563eb", stroke: "#fff", strokeWidth: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ===== ตาราง + ค้นหา ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="ค้นหารายรับ (TranID, หมวดหมู่, รายละเอียด...)" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition outline-none shadow-sm" />
          </div>
          <div className="bg-blue-50 border border-blue-100 text-blue-700 px-4 py-2.5 rounded-xl text-sm font-black whitespace-nowrap shadow-sm">
            ยอดรวม: ฿{totalIncome.toLocaleString()}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-100 text-slate-700 text-[11px] uppercase font-black tracking-wider">
              <tr>
                <th className="px-6 py-4">รหัส</th>
                <th className="px-6 py-4">วันที่</th>
                <th className="px-6 py-4">ประเภท</th>
                <th className="px-6 py-4">รายละเอียด</th>
                <th className="px-6 py-4 text-right">จำนวนเงิน</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {!loading && filteredIncomes.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-500 font-medium">ไม่พบข้อมูลรายรับ</td></tr>
              )}
              {filteredIncomes.map((row) => (
                <tr key={row.tranID} className="hover:bg-blue-50/50 transition">
                  <td className="px-6 py-4 font-bold text-slate-800">INC-{row.tranID}</td>
                  <td className="px-6 py-4 font-medium text-slate-500">{formatDateTime(row.tranDate)}</td>
                  <td className="px-6 py-4">
                    <span className="bg-blue-100 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-md text-[10px] font-black tracking-wider uppercase">{row.tranCategory}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-medium text-xs max-w-[250px] break-words">{row.tranDetail || "-"}</td>
                  <td className="px-6 py-4 font-black text-emerald-600 text-right">+ ฿{row.tranAmount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== Modal เพิ่มรายรับ ===== */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 flex justify-between items-center">
              <h2 className="text-lg font-black text-white flex items-center gap-2"><Plus size={20} /> เพิ่มรายรับใหม่</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">ประเภทรายรับ</label>
                <select value={form.tranCategory} onChange={(e) => setForm((p) => ({ ...p, tranCategory: e.target.value }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-200 font-bold text-slate-700">
                  <option value="ค่าเช่ารถ">ค่าเช่ารถ</option>
                  <option value="ค่ามัดจำ">ค่ามัดจำ</option>
                  <option value="ค่าบริการเสริม">ค่าบริการเสริม</option>
                  <option value="ค่าปรับ">ค่าปรับ</option>
                  <option value="รายรับอื่นๆ">รายรับอื่นๆ</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">จำนวนเงิน (บาท)</label>
                <input type="number" min="0" step="0.01" value={form.tranAmount} onChange={(e) => setForm((p) => ({ ...p, tranAmount: e.target.value }))} placeholder="เช่น 5000" className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-200 font-bold text-blue-700 text-lg" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">วันที่ทำรายการ</label>
                <input type="datetime-local" value={form.tranDate} onChange={(e) => setForm((p) => ({ ...p, tranDate: e.target.value }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-200 font-medium text-slate-700" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">รายละเอียด (ไม่บังคับ)</label>
                <textarea value={form.tranDetail} onChange={(e) => setForm((p) => ({ ...p, tranDetail: e.target.value }))} rows={3} placeholder="เช่น รับค่าเช่ารถ Honda Civic..." className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-200 text-sm" />
              </div>
              {error && <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700 text-sm font-semibold">{error}</div>}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition flex-1" disabled={saving}>ยกเลิก</button>
                <button onClick={submitIncome} disabled={saving} className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition shadow-md flex-[2] flex justify-center items-center gap-2">
                  {saving ? (<><RefreshCw className="animate-spin" size={18} /> กำลังบันทึก...</>) : (<><Save size={18} /> บันทึกรายรับ</>)}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
