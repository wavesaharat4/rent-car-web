"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Plus, Shield, Edit, UserPlus, X, RefreshCw } from "lucide-react";

type EmployeeRow = {
  empID: number;
  empFN: string | null;
  empLN: string | null;
  empMail: string | null;
  empPass: string | null;
  empPhone: string | null;
  empDOB: string | null;
  empRole: string | null;
  empStatus: string | null;
  empCreate: string | null;
  empUpdate: string | null;
};

type EmployeeForm = {
  empFN: string;
  empLN: string;
  empMail: string;
  empPass: string;
  empPhone: string;
  empDOB: string;
  empRole: string;
  empStatus: string;
};

const initialForm: EmployeeForm = {
  empFN: "",
  empLN: "",
  empMail: "",
  empPass: "",
  empPhone: "",
  empDOB: "",
  empRole: "staff",
  empStatus: "active",
};

const roles = ["admin", "manager", "staff", "cs", "panel", "accounting", "finance"];

const text = (v: string | null) => (v == null ? "" : v);
const readError = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

const toEmployee = (row: unknown): EmployeeRow => {
  const record = (row ?? {}) as Record<string, unknown>;
  return {
    empID: Number(record.empID),
    empFN: typeof record.empFN === "string" ? record.empFN : null,
    empLN: typeof record.empLN === "string" ? record.empLN : null,
    empMail: typeof record.empMail === "string" ? record.empMail : null,
    empPass: typeof record.empPass === "string" ? record.empPass : null,
    empPhone: typeof record.empPhone === "string" ? record.empPhone : null,
    empDOB: typeof record.empDOB === "string" ? record.empDOB : null,
    empRole: typeof record.empRole === "string" ? record.empRole : null,
    empStatus: typeof record.empStatus === "string" ? record.empStatus : null,
    empCreate: typeof record.empCreate === "string" ? record.empCreate : null,
    empUpdate: typeof record.empUpdate === "string" ? record.empUpdate : null,
  };
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
    second: "2-digit",
    hour12: false,
  });
};

export default function AdminUsersPage() {
  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<EmployeeForm>(initialForm);

  const filteredEmployees = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return employees;

    return employees.filter((emp) => {
      const fullName = `${text(emp.empFN)} ${text(emp.empLN)}`.trim().toLowerCase();
      return (
        fullName.includes(q) ||
        text(emp.empMail).toLowerCase().includes(q) ||
        text(emp.empRole).toLowerCase().includes(q) ||
        text(emp.empStatus).toLowerCase().includes(q)
      );
    });
  }, [employees, searchTerm]);

  async function loadEmployees() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/employees", { cache: "no-store" });
      const json = await res.json();

      if (!Array.isArray(json)) {
        throw new Error(json?.message || "โหลดข้อมูลพนักงานไม่สำเร็จ");
      }

      const normalized: EmployeeRow[] = json.map((row: unknown) => toEmployee(row));

      setEmployees(normalized);
    } catch (e: unknown) {
      setError(readError(e, "โหลดข้อมูลพนักงานไม่สำเร็จ"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEmployees();
  }, []);

  function startAdd() {
    setEditId(null);
    setForm(initialForm);
    setError(null);
  }

  function startEdit(emp: EmployeeRow) {
    setEditId(emp.empID);
    setForm({
      empFN: text(emp.empFN),
      empLN: text(emp.empLN),
      empMail: text(emp.empMail),
      empPass: text(emp.empPass),
      empPhone: text(emp.empPhone),
      empDOB: text(emp.empDOB).slice(0, 10),
      empRole: text(emp.empRole) || "staff",
      empStatus: text(emp.empStatus) || "active",
    });
    setError(null);
  }

  async function submitForm() {
    setError(null);

    if (!form.empFN.trim() || !form.empLN.trim() || !form.empMail.trim() || !form.empPass.trim()) {
      setError("กรอกชื่อ, นามสกุล, อีเมล และรหัสผ่านให้ครบ");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        empFN: form.empFN.trim(),
        empLN: form.empLN.trim(),
        empMail: form.empMail.trim(),
        empPass: form.empPass.trim(),
        empPhone: form.empPhone.trim() || null,
        empDOB: form.empDOB || null,
        empRole: form.empRole,
        empStatus: form.empStatus,
      };

      const url = editId == null ? "/api/employees" : `/api/employees/${editId}`;
      const method = editId == null ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json?.ok) {
        throw new Error(json?.message || "บันทึกข้อมูลพนักงานไม่สำเร็จ");
      }

      if (editId == null) {
        setForm(initialForm);
      }
      setEditId(null);
      await loadEmployees();
    } catch (e: unknown) {
      setError(readError(e, "บันทึกข้อมูลพนักงานไม่สำเร็จ"));
    } finally {
      setSaving(false);
    }
  }

  async function inactivateEmployee(empID: number) {
    const confirmed = window.confirm("ต้องการเปลี่ยนสถานะพนักงานเป็น inactive ใช่หรือไม่?");
    if (!confirmed) return;

    setError(null);
    try {
      const res = await fetch(`/api/employees/${empID}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json?.ok) {
        throw new Error(json?.message || "อัปเดตสถานะไม่สำเร็จ");
      }
      await loadEmployees();
    } catch (e: unknown) {
      setError(readError(e, "อัปเดตสถานะไม่สำเร็จ"));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <Shield className="text-blue-600" size={32} />
            จัดการข้อมูลพนักงาน
          </h1>
          <p className="text-slate-500 text-sm mt-2 font-medium">
            เพิ่ม/แก้ไขข้อมูลพนักงาน ตำแหน่ง และสถานะ โดยระบบจะบันทึกเวลาอัตโนมัติทุกครั้ง
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadEmployees}
            className="flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl font-bold transition"
          >
            <RefreshCw size={16} />
            รีเฟรช
          </button>
          <button
            onClick={startAdd}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-blue-500/30 hover:shadow-lg hover:-translate-y-0.5 whitespace-nowrap"
          >
            <Plus size={20} />
            <span>เพิ่มพนักงาน</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-black text-slate-800 flex items-center gap-2">
            <UserPlus size={20} className="text-blue-600" />
            {editId == null ? "ฟอร์มเพิ่มพนักงาน" : `แก้ไขพนักงาน #${editId}`}
          </h2>
          {editId != null && (
            <button
              onClick={startAdd}
              className="inline-flex items-center gap-1 text-sm font-bold text-slate-500 hover:text-slate-700"
            >
              <X size={16} />
              ยกเลิกการแก้ไข
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="ชื่อ *"
            className="px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-200"
            value={form.empFN}
            onChange={(e) => setForm((p) => ({ ...p, empFN: e.target.value }))}
          />
          <input
            type="text"
            placeholder="นามสกุล *"
            className="px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-200"
            value={form.empLN}
            onChange={(e) => setForm((p) => ({ ...p, empLN: e.target.value }))}
          />
          <input
            type="email"
            placeholder="อีเมล *"
            className="px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-200"
            value={form.empMail}
            onChange={(e) => setForm((p) => ({ ...p, empMail: e.target.value }))}
          />
          <input
            type="text"
            placeholder="รหัสผ่าน *"
            className="px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-200"
            value={form.empPass}
            onChange={(e) => setForm((p) => ({ ...p, empPass: e.target.value }))}
          />
          <input
            type="text"
            placeholder="เบอร์โทร"
            className="px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-200"
            value={form.empPhone}
            onChange={(e) => setForm((p) => ({ ...p, empPhone: e.target.value }))}
          />
          <input
            type="date"
            className="px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-200"
            value={form.empDOB}
            onChange={(e) => setForm((p) => ({ ...p, empDOB: e.target.value }))}
          />
          <select
            className="px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-200"
            value={form.empRole}
            onChange={(e) => setForm((p) => ({ ...p, empRole: e.target.value }))}
          >
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          <select
            className="px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-200"
            value={form.empStatus}
            onChange={(e) => setForm((p) => ({ ...p, empStatus: e.target.value }))}
          >
            <option value="active">active</option>
            <option value="inactive">inactive</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={submitForm}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold disabled:opacity-60"
          >
            {saving ? "กำลังบันทึก..." : editId == null ? "เพิ่มพนักงาน" : "อัปเดตพนักงาน"}
          </button>
        </div>

        {error && (
          <div className="text-sm font-bold text-rose-600 bg-rose-50 border border-rose-200 px-3 py-2 rounded-xl">
            {error}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-2">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="ค้นหาจากชื่อ, อีเมล, ตำแหน่ง, สถานะ"
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl text-slate-700 font-medium focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-black tracking-wider">
              <tr>
                <th className="px-4 py-3">empID</th>
                <th className="px-4 py-3">ชื่อ-นามสกุล</th>
                <th className="px-4 py-3">empMail</th>
                <th className="px-4 py-3">empPhone</th>
                <th className="px-4 py-3">empRole</th>
                <th className="px-4 py-3">empStatus</th>
                <th className="px-4 py-3">empCreate</th>
                <th className="px-4 py-3">empUpdate</th>
                <th className="px-4 py-3 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && (
                <tr>
                  <td className="px-4 py-4 text-slate-500" colSpan={9}>
                    กำลังโหลดข้อมูล...
                  </td>
                </tr>
              )}

              {!loading && filteredEmployees.length === 0 && (
                <tr>
                  <td className="px-4 py-4 text-slate-500" colSpan={9}>
                    ไม่พบข้อมูลพนักงาน
                  </td>
                </tr>
              )}

              {!loading &&
                filteredEmployees.map((emp) => {
                  const fullName = `${text(emp.empFN)} ${text(emp.empLN)}`.trim();
                  const isActive = text(emp.empStatus).toLowerCase() === "active";

                  return (
                    <tr key={emp.empID} className="hover:bg-blue-50/40 transition-colors">
                      <td className="px-4 py-3 font-bold text-slate-700">{emp.empID}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800">{fullName || "-"}</td>
                      <td className="px-4 py-3">{text(emp.empMail) || "-"}</td>
                      <td className="px-4 py-3">{text(emp.empPhone) || "-"}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 rounded-md bg-slate-100 border border-slate-200 text-xs font-bold uppercase">
                          {text(emp.empRole) || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={isActive ? "text-emerald-600 font-bold" : "text-rose-600 font-bold"}>
                          {text(emp.empStatus) || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">{formatDateTime(emp.empCreate)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{formatDateTime(emp.empUpdate)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex gap-2">
                          <button
                            onClick={() => startEdit(emp)}
                            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="แก้ไข"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => inactivateEmployee(emp.empID)}
                            className="px-3 py-1.5 text-xs rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 font-bold"
                            title="เปลี่ยนสถานะเป็น inactive"
                          >
                            Inactive
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
