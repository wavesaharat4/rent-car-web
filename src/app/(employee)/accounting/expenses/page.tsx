"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { Fuel, Receipt, RefreshCw, Save, Search, Wrench } from "lucide-react";

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

const DEFAULT_CATEGORY = "ค่าน้ำมัน";

const nowForInput = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  const local = new Date(now.getTime() - offset);
  return local.toISOString().slice(0, 16);
};

const initialForm = (): ExpenseForm => ({
  tranCategory: DEFAULT_CATEGORY,
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

const formatDateTime = (value: string | null) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("th-TH", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

const readError = (err: unknown, fallback: string) =>
  err instanceof Error ? err.message : fallback;

export default function AccountingExpensesPage() {
  const { data: session } = useSession();
  const [expenses, setExpenses] = useState<ExpenseRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState<ExpenseForm>(initialForm);

  const empID = parseEmpID((session?.user as { id?: unknown } | undefined)?.id);

  const filteredExpenses = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return expenses;

    return expenses.filter((exp) => {
      return (
        String(exp.tranID).includes(q) ||
        exp.tranCategory.toLowerCase().includes(q) ||
        exp.tranDetail.toLowerCase().includes(q) ||
        formatDateTime(exp.tranDate).toLowerCase().includes(q)
      );
    });
  }, [expenses, searchTerm]);

  const totalExpense = useMemo(
    () => filteredExpenses.reduce((sum, row) => sum + row.tranAmount, 0),
    [filteredExpenses]
  );

  async function loadExpenses() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/accounting/expenses", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok || !json?.ok || !Array.isArray(json?.data)) {
        throw new Error(json?.message || "โหลดข้อมูลรายจ่ายไม่สำเร็จ");
      }
      setExpenses(json.data as ExpenseRow[]);
    } catch (err: unknown) {
      setError(readError(err, "โหลดข้อมูลรายจ่ายไม่สำเร็จ"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadExpenses();
  }, []);

  async function submitExpense() {
    setError(null);
    setSuccess(null);

    const category = form.tranCategory.trim();
    const detail = form.tranDetail.trim();
    const amount = Number(form.tranAmount);

    if (!empID) {
      setError("ไม่พบรหัสพนักงานใน session กรุณาเข้าสู่ระบบใหม่");
      return;
    }

    if (!category) {
      setError("กรุณาเลือกหรือกรอกประเภทรายจ่าย");
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      setError("กรุณากรอกจำนวนเงินให้ถูกต้อง");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/accounting/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          empID,
          tranCategory: category,
          tranAmount: amount,
          tranDate: form.tranDate || null,
          tranDetail: detail || null,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json?.ok) {
        throw new Error(json?.message || "เพิ่มรายจ่ายไม่สำเร็จ");
      }

      setSuccess(`บันทึกรายจ่ายสำเร็จ (Tran ID: ${json.tranID ?? "-"})`);
      setForm(initialForm());
      await loadExpenses();
    } catch (err: unknown) {
      setError(readError(err, "เพิ่มรายจ่ายไม่สำเร็จ"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
          <Receipt className="text-blue-600" size={32} />
          รายงานรายจ่าย (Expenses)
        </h1>
        <p className="text-slate-500 text-sm mt-2 font-medium">
          ดูรายการรายจ่ายทั้งหมดและเพิ่มรายการรายจ่ายใหม่ได้จากหน้านี้
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-4">
        <h2 className="font-black text-slate-800">เพิ่มรายจ่าย</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <select
            value={form.tranCategory}
            onChange={(e) => setForm((prev) => ({ ...prev, tranCategory: e.target.value }))}
            className="px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="ค่าน้ำมัน">ค่าน้ำมัน</option>
            <option value="ค่าซ่อมบำรุงรถ">ค่าซ่อมบำรุงรถ</option>
            <option value="ค่าอะไหล่">ค่าอะไหล่</option>
            <option value="ค่าใช้จ่ายสำนักงาน">ค่าใช้จ่ายสำนักงาน</option>
            <option value="อื่นๆ">อื่นๆ</option>
          </select>

          <input
            type="number"
            min="0"
            step="0.01"
            value={form.tranAmount}
            onChange={(e) => setForm((prev) => ({ ...prev, tranAmount: e.target.value }))}
            placeholder="จำนวนเงิน (บาท)"
            className="px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-200"
          />

          <input
            type="datetime-local"
            value={form.tranDate}
            onChange={(e) => setForm((prev) => ({ ...prev, tranDate: e.target.value }))}
            className="px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-200"
          />

          <button
            onClick={submitExpense}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-5 py-2.5 rounded-xl font-bold transition"
          >
            <Save size={16} />
            {saving ? "กำลังบันทึก..." : "บันทึกรายจ่าย"}
          </button>
        </div>

        <textarea
          value={form.tranDetail}
          onChange={(e) => setForm((prev) => ({ ...prev, tranDetail: e.target.value }))}
          rows={3}
          placeholder="รายละเอียดรายจ่าย (ไม่บังคับ)"
          className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-200"
        />

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700 text-sm font-semibold">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700 text-sm font-semibold">
            {success}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50">
          <div className="relative w-full max-w-sm">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="ค้นหารายจ่าย..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition outline-none shadow-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="text-sm font-bold text-slate-700">
              รวม: <span className="text-rose-600">฿{totalExpense.toLocaleString()}</span>
            </div>
            <button
              onClick={loadExpenses}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold border border-slate-200 rounded-xl text-slate-700 bg-white hover:bg-slate-50"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              รีเฟรช
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-black tracking-wider">
              <tr>
                <th scope="col" className="px-6 py-4">
                  รหัสรายจ่าย
                </th>
                <th scope="col" className="px-6 py-4">
                  วันที่ทำรายการ
                </th>
                <th scope="col" className="px-6 py-4">
                  ประเภท
                </th>
                <th scope="col" className="px-6 py-4">
                  รายละเอียด
                </th>
                <th scope="col" className="px-6 py-4 text-right">
                  ยอดเงินจ่ายออก
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {!loading && filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-500 font-medium">
                    ไม่พบข้อมูลรายจ่าย
                  </td>
                </tr>
              )}

              {filteredExpenses.map((exp) => (
                <tr key={exp.tranID} className="hover:bg-rose-50/50 transition">
                  <td className="px-6 py-4 font-bold text-slate-800">EXP-{exp.tranID}</td>
                  <td className="px-6 py-4 font-medium text-slate-500">
                    {formatDateTime(exp.tranDate)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`flex w-fit items-center gap-1.5 px-2.5 py-1 text-[10px] font-black tracking-widest rounded-md border shadow-sm ${
                        exp.tranCategory.includes("ซ่อม")
                          ? "bg-amber-100 text-amber-700 border-amber-200"
                          : "bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      {exp.tranCategory.includes("ซ่อม") && <Wrench size={12} />}
                      {exp.tranCategory.includes("น้ำมัน") && <Fuel size={12} />}
                      {exp.tranCategory}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-medium">{exp.tranDetail || "-"}</td>
                  <td className="px-6 py-4 font-black text-rose-600 text-right">
                    - ฿{exp.tranAmount.toLocaleString()}
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
