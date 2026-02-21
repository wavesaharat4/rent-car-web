import Navbar from "@/components/home/Navbar"; // ปรับ path ให้ตรงกับโฟลเดอร์ของคุณ
import Footer from "@/components/home/Footer"; 

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-50 pt-10">
        {children} 
      </div>
      <Footer />
    </>
  );
}