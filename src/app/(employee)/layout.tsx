"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react"; // 🌟 1. นำเข้า useSession และ signOut
import {
    Users,
    FileText,
    BarChart3,
    Car,
    CalendarDays,
    Wallet,
    LogOut,
    Menu,
    X,
    UserCircle,
    Settings,
    Shield,
    Send,
    Wrench,
    Receipt,
    CreditCard,
    Building2,
    ShoppingCart
} from "lucide-react";
import Image from "next/image";

// ฟังก์ชันสำหรับจัดเมนูตาม Role
const getMenuItems = (role: string) => {
    const menus = [];

    // 1. ผู้ดูแลระบบ (System Admin)
    if (role === "ADMIN") {
        menus.push(
            { name: "จัดการสิทธิ์ผู้ใช้", path: "/admin/users", icon: <Shield size={20} /> },
            { name: "ดู Log การใช้งาน", path: "/admin/logs", icon: <FileText size={20} /> },
            { name: "ดูรายงานระบบ", path: "/admin/reports", icon: <BarChart3 size={20} /> },
            { name: "ตั้งค่าระบบ", path: "/admin/settings", icon: <Settings size={20} /> }
        );
    }

    // 2. ผู้จัดการ (Manager)
    if (role === "MANAGER") {
        menus.push(
            { name: "ประมวลผลรายงานรวม", path: "/manager/reports", icon: <BarChart3 size={20} /> },
            { name: "ส่งข้อมูลขอรายงาน", path: "/manager/requests", icon: <Send size={20} /> }
        );
    }

    // 3. ฝ่ายดูแลลูกค้า / รถ (CS)
    if (role === "CS") {
        menus.push(
            { name: "ข้อมูลลูกค้า", path: "/cs/customers", icon: <Users size={20} /> },
            { name: "จัดการนัด&จองรถ", path: "/cs/bookings", icon: <CalendarDays size={20} /> },
            { name: "สถานะยานพาหนะ", path: "/cs/cars", icon: <Car size={20} /> }
        );
    }

    // 4. Panel Admin
    if (role === "PANEL") {
        menus.push(
            { name: "จัดการรายละเอียดรถ", path: "/panel/cars", icon: <Wrench size={20} /> }
        );
    }

    // 5. ฝ่ายบัญชี (Accounting)
    if (role === "ACCOUNTING") {
        menus.push(
            { name: "รายการเช่ารถ", path: "/accounting/rentals", icon: <Car size={20} /> },
            { name: "รายงานรายได้", path: "/accounting/income", icon: <Wallet size={20} /> },
            { name: "รายงานรายจ่าย", path: "/accounting/expenses", icon: <Receipt size={20} /> },
            { name: "รายการชำระเงิน", path: "/accounting/payments", icon: <CreditCard size={20} /> }
        );
    }

    // 6. ระบบการเงิน (Finance)
    if (role === "FINANCE") {
        menus.push(
            { name: "ข้อมูลร้านค้า", path: "/finance/shop", icon: <Building2 size={20} /> },
            { name: "ข้อมูลคำสั่งซื้อ", path: "/finance/orders", icon: <ShoppingCart size={20} /> },
            { name: "จัดการบิลชำระเงิน", path: "/finance/payments", icon: <CreditCard size={20} /> }
        );
    }

    return menus;
};

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // 🌟 2. ดึงข้อมูล Session จาก Token
    const { data: session, status } = useSession();

    // 🌟 3. แสดงหน้า Loading ระหว่างรอ NextAuth แกะ Token
    if (status === "loading") {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-medium animate-pulse">กำลังตรวจสอบสิทธิ์การเข้าถึง...</p>
                </div>
            </div>
        );
    }

    // 🌟 4. ดึง Role และ Name ออกมาตรงๆ จาก Session (ไม่ต้องใช้ useEffect อ่านคุกกี้แล้ว)
    const role = String((session?.user as any)?.role || "GUEST").toUpperCase();
    const userName = session?.user?.name || "ไม่ทราบชื่อ";

    const menuItems = getMenuItems(role);

    const handleLogout = async () => {
        // 🌟 5. ใช้คำสั่ง signOut ของ NextAuth มันจะล้าง Token ให้เองอย่างสะอาดหมดจด
        await signOut({ callbackUrl: "/login" });
    };

    return (
        <div className="flex bg-slate-50 min-h-screen text-slate-800 font-sans">
            {/* Sidebar ด้านข้าง */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-blue-900 to-indigo-900 text-white transition-transform transform shadow-2xl ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static md:flex md:flex-col h-screen`}>

                {/* หัว Sidebar */}
                <div className="flex items-center justify-between p-6 border-b border-blue-800/50">
                    <div className="flex items-center gap-3">
                        <div className="bg-white p-1 rounded-lg">
                            <Image src="/phumjailogo.png" alt="PhumJai Logo" width={32} height={32} className="w-8 h-8 object-contain" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black tracking-wider text-white">PhumJai Rent</h1>
                            <p className="text-xs text-blue-200 font-medium tracking-widest">EMPLOYEE PANEL</p>
                        </div>
                    </div>
                    <button onClick={() => setSidebarOpen(false)} className="md:hidden text-white/70 hover:text-white p-1 rounded-lg hover:bg-blue-800">
                        <X size={24} />
                    </button>
                </div>

                {/* ข้อมูลพนักงาน */}
                <div className="p-6 pb-2 border-b border-blue-800/50">
                    <div className="flex items-center gap-3 mb-4 bg-white/10 p-3 rounded-xl border border-white/5 backdrop-blur-sm">
                        <UserCircle size={40} className="text-blue-200" />
                        <div>
                            <p className="text-sm font-bold text-white leading-none mb-1">{userName}</p>
                            <span className="text-[10px] bg-blue-500/80 text-white px-2.5 py-1 rounded-full font-black border border-blue-400 shadow-sm tracking-widest">{role}</span>
                        </div>
                    </div>
                </div>

                {/* รายการเมนู */}
                <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5 custom-scrollbar">
                    <div className="text-[11px] font-black text-blue-300 uppercase tracking-widest mb-3 px-3">เมนูระบบ</div>
                    {menuItems.map((item) => {
                        const isActive = pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                href={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden
                  ${isActive
                                        ? "bg-white text-blue-900 font-bold shadow-md"
                                        : "text-blue-100 hover:bg-blue-800 hover:text-white hover:font-semibold"
                                    }
                `}
                                onClick={() => setSidebarOpen(false)}
                            >
                                {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-indigo-500 rounded-r-md"></div>}
                                <span className={`${isActive ? "text-blue-600" : "text-blue-300 group-hover:text-blue-100"} transition-colors`}>{item.icon}</span>
                                <span className="text-sm tracking-wide">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* ปุ่ม Logout */}
                <div className="p-4 border-t border-blue-800/50">
                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl text-sm font-bold bg-white/5 text-white hover:bg-red-500 hover:text-white transition-all duration-300 border border-transparent hover:border-red-400 hover:shadow-lg hover:shadow-red-500/20"
                    >
                        <LogOut size={18} />
                        <span className="tracking-wide">ออกจากระบบปลอดภัย</span>
                    </button>
                </div>
            </aside>

            {/* ส่วนเนื้อหาหลัก */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Navbar มือถือ */}
                <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-40 lg:hidden shadow-sm">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="p-2 -ml-2 rounded-xl text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors focus:ring-2 focus:ring-blue-100"
                        >
                            <Menu size={24} />
                        </button>
                        <h2 className="text-lg font-black text-slate-800 tracking-tight">ระบบจัดการหลังบ้าน</h2>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200 uppercase">
                            {userName ? userName.charAt(0) : "U"}
                        </div>
                    </div>
                </header>

                {/* เนื้อหา Children */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-6 md:p-8 relative">
                    <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none"></div>
                    <div className="max-w-7xl mx-auto relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}