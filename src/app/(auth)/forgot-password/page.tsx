"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("ส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ไปยังอีเมลของคุณแล้ว (กรุณาตรวจสอบในกล่องจดหมาย)");
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อระบบ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-[400px] bg-white p-10 rounded-2xl shadow-sm border border-slate-100">
        
        {/* Icon & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-blue-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">ลืมรหัสผ่าน?</h2>
          <p className="text-slate-500 text-sm mt-3 leading-relaxed">
            กรุณากรอกอีเมลที่ใช้สมัครสมาชิก <br />เพื่อรับลิงก์ตั้งรหัสผ่านใหม่
          </p>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-medium text-center animate-in fade-in duration-300">
            {error}
          </div>
        )}
        
        {message && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-100 text-blue-700 rounded-xl text-xs font-medium text-center animate-in fade-in duration-300 leading-normal">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-widest ml-1">
              อีเมล
            </label>
            <input
              type="email"
              required
              placeholder="name@example.com"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white hover:border-slate-300 placeholder:text-slate-300"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-blue-500/20 disabled:bg-slate-300 disabled:scale-100 disabled:shadow-none"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>กำลังส่งลิงก์...</span>
              </div>
            ) : "ยืนยันการส่ง"}
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-10 text-center">
          <Link href="/login" className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors group">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 transition-transform group-hover:-translate-x-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            กลับไปหน้าเข้าสู่ระบบ
          </Link>
        </div>
      </div>
    </div>
  );
}