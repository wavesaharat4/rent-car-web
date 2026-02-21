import Navbar from "@/components/home/Navbar"; // ปรับ path ให้ตรงกับโฟลเดอร์ของคุณ
import Footer from "@/components/home/Footer"; 

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children} {/* ตัว children นี้คือหน้าเพจต่างๆ เช่น page.tsx หรือ cars/page.tsx */}
      <Footer />
    </>
  );
}