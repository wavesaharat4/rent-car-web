"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [contact, setContact] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const requestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    const res = await fetch("/api/auth/forgot-password/request", {
      method: "POST", body: JSON.stringify({ contact })
    });
    setLoading(false);
    if (res.ok) setStep(2);
    else { const d = await res.json(); setError(d.message); }
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    const res = await fetch("/api/auth/forgot-password/verify", {
      method: "POST", body: JSON.stringify({ contact, otp })
    });
    setLoading(false);
    if (res.ok) setStep(3);
    else { const d = await res.json(); setError(d.message); }
  };

  const resetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    const res = await fetch("/api/auth/forgot-password/reset", {
      method: "POST", body: JSON.stringify({ contact, otp, newPassword })
    });
    setLoading(false);
    if (res.ok) setStep(4);
    else { const d = await res.json(); setError(d.message); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm border w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-slate-800">
          {step === 1 && "ลืมรหัสผ่าน"}
          {step === 2 && "ยืนยัน OTP"}
          {step === 3 && "ตั้งรหัสใหม่"}
          {step === 4 && "สำเร็จ!"}
        </h2>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center mb-4">{error}</div>}

        {step === 1 && (
          <form onSubmit={requestOtp} className="space-y-4">
            <input type="text" placeholder="อีเมลที่ใช้สมัครสมาชิก" value={contact} onChange={e => setContact(e.target.value)} className="w-full p-3 border rounded-xl" required />
            <button disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 disabled:bg-slate-300">
              {loading ? "กำลังส่ง..." : "ส่งรหัส OTP"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={verifyOtp} className="space-y-4">
            <p className="text-sm text-center text-slate-500">กรอกรหัส 6 หลักที่ได้รับทางอีเมล</p>
            <input type="text" placeholder="XXXXXX" maxLength={6} value={otp} onChange={e => setOtp(e.target.value)} className="w-full p-3 border rounded-xl text-center text-2xl tracking-widest" required />
            <button disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 disabled:bg-slate-300">
              {loading ? "ตรวจสอบ..." : "ยืนยัน OTP"}
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={resetPassword} className="space-y-4">
            <input type="password" placeholder="รหัสผ่านใหม่" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full p-3 border rounded-xl" required />
            <button disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 disabled:bg-slate-300">
              {loading ? "บันทึก..." : "เปลี่ยนรหัสผ่าน"}
            </button>
          </form>
        )}

        {step === 4 && (
          <div className="text-center">
            <div className="text-green-500 text-5xl mb-4">✓</div>
            <p className="mb-6 text-slate-600">เปลี่ยนรหัสผ่านเรียบร้อยแล้ว</p>
            <Link href="/login" className="block w-full bg-slate-900 text-white py-3 rounded-xl font-bold">เข้าสู่ระบบ</Link>
          </div>
        )}
      </div>
    </div>
  );
}