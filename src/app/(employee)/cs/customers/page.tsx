"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Users, Search, Mail, Phone, ShieldCheck, Loader2 } from "lucide-react";

// 1. Interface อ้างอิงจากตาราง Customer (เอา bookingsCount ออกแล้ว)
interface CustomerDB {
    cusID: number;
    cusFN: string;
    cusLN: string;
    cusMail: string;
    cusPhone: string;
    cusStatus: string;
}

export default function CSCustomersPage() {
    const [customers, setCustomers] = useState<CustomerDB[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);

    // 2. ดึงข้อมูลจาก API
    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                // 🌟 ยิงไปที่ API profile โดย "ไม่ใส่" ?email ต่อท้าย เพื่อให้มันดึงลูกค้าทั้งหมด
                const response = await fetch('/api/customer/profile');

                if (!response.ok) {
                    throw new Error("Failed to fetch customers data");
                }

                // 🌟 ข้อมูลที่ได้กลับมาจะเป็น Array ทันทีตามที่เราเขียนไว้ในข้อ 1
                const data = await response.json();

                if (Array.isArray(data)) {
                    setCustomers(data);
                } else {
                    console.error("รูปแบบข้อมูลไม่ถูกต้อง", data);
                }

            } catch (error) {
                console.error("Error fetching customers:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCustomers();
    }, []);

    // 3. ฟังก์ชันกรองข้อมูลแบบ Real-time
    const filteredCustomers = useMemo(() => {
        if (!searchQuery) return customers;

        const lowerQ = searchQuery.toLowerCase();
        return customers.filter((cust) =>
            (cust.cusFN && cust.cusFN.toLowerCase().includes(lowerQ)) ||
            (cust.cusLN && cust.cusLN.toLowerCase().includes(lowerQ)) ||
            (cust.cusMail && cust.cusMail.toLowerCase().includes(lowerQ)) ||
            (cust.cusPhone && cust.cusPhone.includes(lowerQ))
        );
    }, [customers, searchQuery]);

    const formatPhone = (phone: string) => {
        if (!phone) return "-";
        if (phone.length === 10) {
            return `${phone.slice(0, 3)}-${phone.slice(3, 6)}-${phone.slice(6)}`;
        }
        return phone;
    };

    return (
        <div className="space-y-6 pb-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                        <Users className="text-blue-600" size={32} />
                        จัดการข้อมูลลูกค้า (Customers)
                    </h1>
                    
                </div>
            </div>

            {/* แถบค้นหา */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-2 relative z-10">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="ค้นหาชื่อ, นามสกุล, เบอร์โทร หรือ อีเมลลูกค้า..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl text-slate-700 font-medium focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition outline-none"
                    />
                </div>
            </div>

            {/* สถานะ Loading */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
                    <p className="text-slate-500 font-bold">กำลังโหลดข้อมูลลูกค้า...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    {filteredCustomers.length > 0 ? (
                        filteredCustomers.map((cust) => {
                            const fullName = `${cust.cusFN || ''} ${cust.cusLN || ''}`.trim();

                            return (
                                <div key={cust.cusID} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center hover:shadow-[0_8px_30px_rgb(37,99,235,0.08)] hover:border-blue-200 transition-all duration-300 group">
                                    <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-3xl font-black mb-4 border-4 border-blue-50 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shrink-0">
                                        {cust.cusFN ? cust.cusFN.charAt(0).toUpperCase() : '?'}
                                    </div>

                                    <h3 className="font-black text-slate-800 text-lg mb-1 w-full truncate">{fullName || "ไม่มีชื่อ"}</h3>

                                    <div className="mb-4">
                                        <span className={`px-3 py-1 text-xs font-black tracking-widest rounded-full border shadow-sm uppercase ${cust.cusStatus === 'VIP' ? 'bg-amber-100 text-amber-600 border-amber-200' :
                                            cust.cusStatus === 'Member' ? 'bg-blue-100 text-blue-600 border-blue-200' :
                                                'bg-slate-100 text-slate-600 border-slate-200'
                                            }`}>
                                            {cust.cusStatus === 'VIP' ? 'VIP' : cust.cusStatus === 'Member' ? 'MEMBER' : 'NEW'}
                                        </span>
                                    </div>

                                    <div className="w-full space-y-2 text-sm text-left mb-6">
                                        <div className="flex items-center gap-2 text-slate-500 bg-slate-50 p-2 rounded-lg min-w-0" title={cust.cusMail}>
                                            <Mail size={16} className="text-slate-400 shrink-0" />
                                            <span className="truncate">{cust.cusMail || "ไม่มีอีเมล"}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-500 bg-slate-50 p-2 rounded-lg min-w-0">
                                            <Phone size={16} className="text-slate-400 shrink-0" />
                                            <span className="truncate">{formatPhone(cust.cusPhone)}</span>
                                        </div>
                                    </div>

                                    <Link
                                        href={`/cs/customers/${cust.cusID}`}
                                        className="w-full mt-auto py-2.5 rounded-xl border-2 border-slate-100 text-slate-600 font-bold hover:bg-slate-50 hover:text-blue-600 hover:border-blue-100 transition flex justify-center items-center gap-2"
                                    >
                                        <ShieldCheck size={18} /> ดูประวัติ
                                    </Link>
                                </div>
                            );
                        })
                    ) : (
                        <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-slate-300">
                            <p className="text-slate-500 font-bold text-lg">ไม่พบข้อมูลลูกค้าที่ค้นหา</p>
                            <p className="text-slate-400 text-sm mt-1">ลองเปลี่ยนคำค้นหาเป็นชื่อ นามสกุล หรือเบอร์โทรศัพท์ดูนะครับ</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}