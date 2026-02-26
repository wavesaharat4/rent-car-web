"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Swal from "sweetalert2";

export default function ProfilePage() {
    const { data: session, status, update } = useSession();
    const [isLoading, setIsLoading] = useState(true);

    // 📌 1. เพิ่ม cusDL เข้าไปใน State
    const [formData, setFormData] = useState({
        cusID: "",
        cusFN: "",
        cusLN: "",
        cusMail: "",
        cusPhone: "",
        cusAddress: "",
        cusGender: "male",
        cusDL: "", // 👈 เพิ่มช่องเลขใบขับขี่
    });

    useEffect(() => {
        if (session?.user?.email) {
            fetchProfileData(session.user.email);
        }
    }, [session]);

    const fetchProfileData = async (email: string) => {
        try {
            const res = await fetch(`/api/customer/profile?email=${email}`);
            if (res.ok) {
                const data = await res.json();
                setFormData({
                    cusID: data.cusID,
                    cusFN: data.cusFN || "",
                    cusLN: data.cusLN || "",
                    cusMail: data.cusMail || email,
                    cusPhone: data.cusPhone || "",
                    cusAddress: data.cusAddress || "",
                    cusGender: data.cusGender || "male",
                    cusDL: data.cusDL || "", // 👈 ดึงข้อมูลใบขับขี่เดิมมาแสดง (ถ้ามี)
                });
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const getAvatar = () => {
        if (formData.cusGender === "female") {
            return "https://cdn-icons-png.flaticon.com/512/4140/4140047.png";
        }
        return "https://cdn-icons-png.flaticon.com/512/4140/4140048.png";

    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch("/api/customer/profile", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        });

        if (res.ok) {
            await update({ name: `${formData.cusFN} ${formData.cusLN}` });

            Swal.fire({
                title: "บันทึกสำเร็จ!",
                text: "ข้อมูลโปรไฟล์ของคุณถูกอัปเดตเรียบร้อยแล้ว",
                icon: "success",
                confirmButtonColor: "#2563eb",
                confirmButtonText: "ตกลง",
                customClass: { popup: 'rounded-2xl' }
            });
        } else {
            Swal.fire({
                title: "ผิดพลาด!",
                text: "เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง",
                icon: "error",
                confirmButtonColor: "#ef4444",
                confirmButtonText: "ปิด",
                customClass: { popup: 'rounded-2xl' }
            });
        }
    };

    if (status === "loading" || isLoading) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="mt-4 text-slate-500 font-medium">กำลังโหลดข้อมูลโปรไฟล์...</p>
            </div>
        );
    }

    if (status === "unauthenticated") {
        return (
            <div className="min-h-screen flex justify-center items-center bg-slate-50">
                <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md border border-red-100">
                    <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 mb-2">ไม่สามารถเข้าถึงได้</h2>
                    <p className="text-slate-500 mb-6">กรุณาเข้าสู่ระบบก่อนเข้าชมหน้าโปรไฟล์ของคุณ</p>
                    <a href="/login" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-full transition-colors">ไปหน้าเข้าสู่ระบบ</a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">

                <div className="h-40 bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500"></div>

                <div className="px-8 pb-10 sm:px-12">
                    <div className="relative flex justify-center -mt-20 mb-8">
                        <div className="relative">
                            <img
                                src={getAvatar()}
                                alt="Profile"
                                className="w-36 h-36 rounded-full border-8 border-white shadow-lg object-cover bg-slate-50 transition-all duration-300"
                            />
                            <div className="absolute bottom-3 right-3 w-5 h-5 bg-green-500 border-4 border-white rounded-full"></div>
                        </div>
                    </div>

                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">โปรไฟล์ของฉัน</h1>
                        <p className="text-slate-500 mt-2">จัดการข้อมูลส่วนตัวและที่อยู่สำหรับติดต่อของคุณ</p>
                    </div>

                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-5">
                            <h2 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-4">ข้อมูลส่วนบุคคล</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-slate-700 text-sm font-semibold mb-2">ชื่อ</label>
                                    <input type="text" name="cusFN" value={formData.cusFN} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow text-slate-800" required placeholder="กรอกชื่อ" />
                                </div>
                                <div>
                                    <label className="block text-slate-700 text-sm font-semibold mb-2">นามสกุล</label>
                                    <input type="text" name="cusLN" value={formData.cusLN} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow text-slate-800" required placeholder="กรอกนามสกุล" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-slate-700 text-sm font-semibold mb-2">อีเมล (ไม่สามารถแก้ไขได้)</label>
                                    <input type="email" name="cusMail" value={formData.cusMail} disabled className="w-full px-4 py-3 bg-slate-200 border border-slate-300 rounded-xl text-slate-500 cursor-not-allowed" />
                                </div>
                                <div>
                                    <label className="block text-slate-700 text-sm font-semibold mb-2">เบอร์โทรศัพท์</label>
                                    <input type="text" name="cusPhone" value={formData.cusPhone} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow text-slate-800" required placeholder="08X-XXX-XXXX" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* 📌 2. ช่องกรอกเลขใบขับขี่ */}
                                <div>
                                    <label className="block text-slate-700 text-sm font-semibold mb-2">เลขที่ใบอนุญาตขับขี่</label>
                                    <input type="text" name="cusDL" value={formData.cusDL} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow text-slate-800" placeholder="ระบุเลขใบขับขี่ของคุณ" />
                                </div>
                                <div>
                                    <label className="block text-slate-700 text-sm font-semibold mb-2">เพศ</label>
                                    <select name="cusGender" value={formData.cusGender} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow text-slate-800 cursor-pointer appearance-none">
                                        <option value="male">ชาย (Male)</option>
                                        <option value="female">หญิง (Female)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                            <h2 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-4">ที่อยู่ปัจจุบัน</h2>
                            <div>
                                <label className="block text-slate-700 text-sm font-semibold mb-2">รายละเอียดที่อยู่</label>
                                <textarea
                                    name="cusAddress"
                                    value={formData.cusAddress}
                                    onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow text-slate-800 resize-none"
                                    placeholder="บ้านเลขที่, หมู่บ้าน, ถนน, ซอย, จังหวัด..."
                                ></textarea>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/30 flex justify-center items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                บันทึกการเปลี่ยนแปลง
                            </button>
                        </div>
                    </form>

                </div>
            </div>
        </div>
    );
}