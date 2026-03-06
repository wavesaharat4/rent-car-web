// =============================================================
// 📊 หน้า: จัดการรายจ่าย (Expenses Dashboard) — ธีมน้ำเงิน-ขาว
// ดึงจาก transaction (tranType = 'expense')
// โครงสร้าง UI ล้อกับ Income เป๊ะ
// =============================================================
"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Receipt, Plus, Download, Calendar, RefreshCw, Search, X, Save, CheckCircle2,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

type ExpenseRow = {
  tranID: number;
  empID: number | null;
  tranType: string;
  tranCategory: string;
  tranAmount: number;
  tranDate: string | null;
  tranDetail: string;
};

type ExpenseForm = {
  tranCategory: string;
  tranAmount: string;
  tranDate: string;
  tranDetail: string;
};

const toNumber = (value: unknown) => { const n = Number(value); return Number.isFinite(n) ? n : 0; };

const nowForInput = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 16);
};

const initialForm = (): ExpenseForm => ({ tranCategory: "ค่าน้ำมัน", tranAmount: "", tranDate: nowForInput(), tranDetail: "" });

const parseEmpID = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") { const n = Number.parseInt(value, 10); return Number.isFinite(n) ? n : null; }
  return null;
};

const formatDateTime = (value: string | null) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("th-TH", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false });
};

// แกน Y ขั้นบันได (เหมือน Income)
const Y_TICKS = [0, 50, 100, 500, 1000, 5000, 10000, 100000, 500000, 1000000];
const getBestYMax = (maxVal: number) => { for (const t of Y_TICKS) { if (t >= maxVal) return t; } return Y_TICKS[Y_TICKS.length - 1]; };
const fmtYAxis = (val: number) => { if (val >= 1000000) return `฿${val / 1000000}M`; if (val >= 1000) return `฿${val / 1000}k`; return `฿${val}`; };

// =============================================================
export default function AccountingExpensesPage() {
  const { data: session } = useSession();

  const [expenses, setExpenses] = useState<ExpenseRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<ExpenseForm>(initialForm);

  const now = new Date();
  const [filterYear, setFilterYear] = useState(now.getFullYear());
  const [filterMonth, setFilterMonth] = useState(now.getMonth() + 1);

  const empID = parseEmpID((session?.user as { id?: unknown } | undefined)?.id);

  // --- กรองตามปี/เดือน ---
  const filteredByDate = useMemo(() => {
    return expenses.filter((row) => {
      if (!row.tranDate) return false;
      const d = new Date(row.tranDate);
      if (Number.isNaN(d.getTime())) return false;
      return d.getFullYear() === filterYear && d.getMonth() + 1 === filterMonth;
    });
  }, [expenses, filterYear, filterMonth]);

  const filteredExpenses = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return filteredByDate;
    return filteredByDate.filter((row) =>
      String(row.tranID).includes(q) || row.tranCategory.toLowerCase().includes(q) ||
      row.tranDetail.toLowerCase().includes(q) || formatDateTime(row.tranDate).toLowerCase().includes(q)
    );
  }, [filteredByDate, searchTerm]);

  const totalExpense = useMemo(() => filteredExpenses.reduce((sum, row) => sum + row.tranAmount, 0), [filteredExpenses]);

  // --- กราฟรายวัน ---
  const chartData = useMemo(() => {
    const daysInMonth = new Date(filterYear, filterMonth, 0).getDate();
    const dayMap = new Map<number, number>();
    for (let d = 1; d <= daysInMonth; d++) dayMap.set(d, 0);

    filteredByDate.forEach((row) => {
      if (!row.tranDate) return;
      const d = new Date(row.tranDate);
      if (Number.isNaN(d.getTime())) return;
      dayMap.set(d.getDate(), (dayMap.get(d.getDate()) || 0) + row.tranAmount);
    });

    return Array.from(dayMap.entries()).map(([day, amount]) => ({ label: `${day}`, amount })).sort((a, b) => Number(a.label) - Number(b.label));
  }, [filteredByDate, filterYear, filterMonth]);

  const chartMax = useMemo(() => getBestYMax(Math.max(...chartData.map(d => d.amount), 0) * 1.15), [chartData]);
  const yTicks = useMemo(() => Y_TICKS.filter(t => t <= chartMax), [chartMax]);

  // =============================================================
  async function loadExpenses() {
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/accounting/expenses", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok || !json?.ok || !Array.isArray(json?.data)) throw new Error(json?.message || "โหลดข้อมูลรายจ่ายไม่สำเร็จ");
      setExpenses(json.data as ExpenseRow[]);
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "โหลดข้อมูลรายจ่ายไม่สำเร็จ"); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadExpenses(); }, []);

  // =============================================================
  async function submitExpense() {
    setError(null); setSuccess(null);
    const category = form.tranCategory.trim();
    const detail = form.tranDetail.trim();
    const amount = Number(form.tranAmount);

    if (!empID) { setError("ไม่พบรหัสพนักงาน กรุณาเข้าสู่ระบบใหม่"); return; }
    if (!category) { setError("กรุณาเลือกหรือกรอกประเภทรายจ่าย"); return; }
    if (!Number.isFinite(amount) || amount <= 0) { setError("กรุณากรอกจำนวนเงินที่ถูกต้อง"); return; }

    setSaving(true);
    try {
      const res = await fetch("/api/accounting/expenses", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ empID, tranCategory: category, tranAmount: amount, tranDate: form.tranDate || null, tranDetail: detail || null }),
      });
      const json = await res.json();
      if (!res.ok || !json?.ok) throw new Error(json?.message || "เพิ่มรายจ่ายไม่สำเร็จ");

      setSuccess(`✅ บันทึกรายจ่ายสำเร็จ (ID: ${json.tranID ?? "-"})`);
      setForm(initialForm()); setShowModal(false);
      await loadExpenses();
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "เพิ่มรายจ่ายไม่สำเร็จ"); }
    finally { setSaving(false); }
  }

  // =============================================================
  function exportCsv() {
    const headers = ["TranID", "วันที่", "ประเภท", "จำนวนเงิน", "รายละเอียด"];
    const rows = filteredExpenses.map((row) => [row.tranID, row.tranDate || "", row.tranCategory || "", row.tranAmount, row.tranDetail || ""]);
    const csv = [headers.join(","), ...rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `expenses-report-${filterYear}-${String(filterMonth).padStart(2, "0")}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  const MONTHS = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
  const YEARS = [now.getFullYear(), now.getFullYear() - 1, now.getFullYear() - 2];

  // =============================================================
  // 🎨 Render UI — สไตล์น้ำเงิน-ขาว เหมือนหน้า Income
  // =============================================================
  return (
    <div className="space-y-6 pb-20">
      {/* ===== Header ===== */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <Receipt className="text-blue-600" size={32} />
            จัดการรายจ่าย (Expenses)
          </h1>
          <p className="text-slate-500 text-sm mt-2 font-medium">
            ข้อมูลรายจ่ายจริงจากตาราง Transaction (tranType = expense)
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => { setShowModal(true); setError(null); setSuccess(null); }} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition shadow-md">
            <Plus size={18} /> เพิ่มรายจ่าย
          </button>
          <button onClick={exportCsv} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2.5 rounded-xl font-bold transition shadow-sm">
            <Download size={16} /> Export CSV
          </button>
          <button onClick={loadExpenses} disabled={loading} className="flex items-center justify-center w-10 h-10 bg-white border border-slate-200 text-slate-600 rounded-full hover:bg-slate-50 shadow-sm transition">
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Toast */}
      {success && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-5 py-3.5 text-blue-700 text-sm font-bold flex items-center gap-3 shadow-sm">
          <CheckCircle2 size={20} className="text-blue-600 shrink-0" /> {success}
        </div>
      )}
      {error && !showModal && <div className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-3.5 text-rose-700 text-sm font-bold shadow-sm">{error}</div>}

      {/* ===== 3 การ์ดสรุป — สีน้ำเงิน ===== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition">
          <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">รายจ่ายรวม ({MONTHS[filterMonth - 1]} {filterYear})</p>
          <p className="text-3xl font-black text-blue-600 mt-2">฿{totalExpense.toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition">
          <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">จำนวนรายการ</p>
          <p className="text-3xl font-black text-slate-800 mt-2">{filteredExpenses.length.toLocaleString()} รายการ</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition">
          <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">เฉลี่ยต่อรายการ</p>
          <p className="text-3xl font-black text-blue-600 mt-2">
            ฿{filteredExpenses.length > 0 ? Math.round(totalExpense / filteredExpenses.length).toLocaleString() : "0"}
          </p>
        </div>
      </div>

      {/* ===== กราฟ Area Chart สีน้ำเงิน + ตัวกรองเดือน ===== */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <Calendar size={20} className="text-blue-600" /> กราฟยอดรายจ่ายรายวัน
          </h2>
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
                <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#64748b", fontWeight: 600 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#64748b" }} dx={-10}
                domain={[0, chartMax]} ticks={yTicks} tickFormatter={fmtYAxis}
              />
              <Tooltip
                cursor={{ stroke: "#e2e8f0", strokeWidth: 1 }}
                contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                formatter={(value) => [`฿${toNumber(value).toLocaleString()}`, "ยอดรายจ่าย"]}
                labelFormatter={(label) => `วันที่ ${label}`}
              />
              <Area type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#expGrad)"
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
            <input type="text" placeholder="ค้นหารายจ่าย (TranID, หมวดหมู่, รายละเอียด...)" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition outline-none shadow-sm" />
          </div>
          <div className="bg-blue-50 border border-blue-100 text-blue-700 px-4 py-2.5 rounded-xl text-sm font-black whitespace-nowrap shadow-sm">
            ยอดรวม: ฿{totalExpense.toLocaleString()}
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
              {!loading && filteredExpenses.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-500 font-medium">ไม่พบข้อมูลรายจ่าย</td></tr>
              )}
              {filteredExpenses.map((row) => (
                <tr key={row.tranID} className="hover:bg-blue-50/50 transition">
                  <td className="px-6 py-4 font-bold text-slate-800">EXP-{row.tranID}</td>
                  <td className="px-6 py-4 font-medium text-slate-500">{formatDateTime(row.tranDate)}</td>
                  <td className="px-6 py-4">
                    <span className="bg-blue-100 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-md text-[10px] font-black tracking-wider uppercase">{row.tranCategory}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-medium text-xs max-w-[250px] break-words">{row.tranDetail || "-"}</td>
                  <td className="px-6 py-4 font-black text-blue-700 text-right">- ฿{row.tranAmount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== Modal เพิ่มรายจ่าย — สีน้ำเงิน-ขาว ===== */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 flex justify-between items-center">
              <h2 className="text-lg font-black text-white flex items-center gap-2"><Plus size={20} /> เพิ่มรายจ่ายใหม่</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">ประเภทรายจ่าย</label>
                <select value={form.tranCategory} onChange={(e) => setForm((p) => ({ ...p, tranCategory: e.target.value }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-200 font-bold text-slate-700">
                  <option value="ค่าน้ำมัน">ค่าน้ำมัน</option>
                  <option value="ค่าซ่อมบำรุงรถ">ค่าซ่อมบำรุงรถ</option>
                  <option value="ค่าอะไหล่">ค่าอะไหล่</option>
                  <option value="ค่าใช้จ่ายสำนักงาน">ค่าใช้จ่ายสำนักงาน</option>
                  <option value="อื่นๆ">อื่นๆ</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">จำนวนเงิน (บาท)</label>
                <input type="number" min="0" step="0.01" value={form.tranAmount} onChange={(e) => setForm((p) => ({ ...p, tranAmount: e.target.value }))} placeholder="เช่น 1500"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-200 font-bold text-blue-700 text-lg" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">วันที่ทำรายการ</label>
                <input type="datetime-local" value={form.tranDate} onChange={(e) => setForm((p) => ({ ...p, tranDate: e.target.value }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-200 font-medium text-slate-700" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">รายละเอียด (ไม่บังคับ)</label>
                <textarea value={form.tranDetail} onChange={(e) => setForm((p) => ({ ...p, tranDetail: e.target.value }))} rows={3} placeholder="เช่น เปลี่ยนยางรถ Toyota Yaris..." className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-200 text-sm" />
              </div>
              {error && <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700 text-sm font-semibold">{error}</div>}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition flex-1" disabled={saving}>ยกเลิก</button>
                <button onClick={submitExpense} disabled={saving} className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition shadow-md flex-[2] flex justify-center items-center gap-2">
                  {saving ? (<><RefreshCw className="animate-spin" size={18} /> กำลังบันทึก...</>) : (<><Save size={18} /> บันทึกรายจ่าย</>)}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
