import Image from "next/image";
import Navbar from '@/components/home/Navbar';
import Footer from "@/components/home/Footer";
import Link from 'next/link';

// 1. สร้าง Interface กำหนดหน้าตาข้อมูล
interface Car {
  id: number;
  name: string;
  price: number;
  type: string;
  img: string;
}

interface Promotion {
  id: number;
  title: string;
  desc: string;
  gradient: string;
}

// 2. ใส่ข้อมูล Mock Data
const recommendedCars: Car[] = [
  { id: 1, name: 'Toyota Yaris (Eco)', price: 800, type: 'รถเก๋ง 4 ที่นั่ง', img: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=800&q=80' },
  { id: 2, name: 'Honda HR-V (SUV)', price: 1500, type: 'รถอเนกประสงค์', img: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80' },
  { id: 3, name: 'BYD Atto 3 (EV)', price: 1800, type: 'รถพลังงานไฟฟ้า 100%', img: 'https://images.unsplash.com/photo-1672846727402-1fa8d338fbc9?auto=format&fit=crop&w=800&q=80' },
  { id: 4, name: 'Toyota Fortuner', price: 2500, type: 'รถครอบครัว 7 ที่นั่ง', img: 'https://images.unsplash.com/photo-1550482782-5f60dc8a7a85?auto=format&fit=crop&w=800&q=80' },
];

// ปรับสีโปรโมชั่นให้เป็นโทนน้ำเงินทั้งหมดไล่ระดับสวยๆ
const promotions: Promotion[] = [
  { id: 1, title: 'Exclusive 3+1', desc: 'เช่า 3 วัน ฟรี 1 วัน! คุ้มค่าสำหรับการเดินทางเหนือระดับ', gradient: 'from-blue-900 to-blue-950 border-blue-800' },
  { id: 2, title: 'Privilege Member', desc: 'สมัครสมาชิกวันนี้ รับส่วนลด 20% สำหรับการเช่าครั้งแรก', gradient: 'from-blue-700 to-blue-900 border-blue-600' },
  { id: 3, title: 'Green Luxury EV', desc: 'เช่ารถ EV วันนี้ รับสิทธิ์ชาร์จฟรีตามสถานีชั้นนำทั่วประเทศ', gradient: 'from-cyan-700 to-blue-900 border-cyan-600' },
];

export default function Home() {
  return (
    // เปลี่ยนพื้นหลังเป็นสีสว่าง (slate-50) และสีข้อความเป็นน้ำเงินเข้ม (blue-950)
    <div className="bg-slate-50 text-blue-950 min-h-screen font-sans selection:bg-blue-200">
      <main className="pb-20">
      
      {/* 1. Hero Section & Search Bar */}
      <section className="relative w-full h-[65vh] min-h-[550px] flex flex-col items-center justify-center">
        {/* Background Image (Overlay สีน้ำเงินเข้มเพื่อให้ข้อความขาวเด่นขึ้น) */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1920&q=80')" }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/60 to-blue-650/90"></div>
        </div>

        {/* Hero Text */}
        <div className="relative z-10 text-center px-4 mb-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 tracking-tight">
            ยกระดับการเดินทางไปกับ <span className="text-blue-700 transition-colors duration-300">PhumJai</span>
              <span className="text-slate-800 transition-colors duration-300"> Rent</span>
          </h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto font-light">
            บริการรถเช่าระดับพรีเมียม ตอบสนองทุกไลฟ์สไตล์ด้วยรถยนต์คุณภาพสูง พร้อมบริการตลอด 24 ชั่วโมง
          </p>
        </div>

        {/* Search Box Form (เปลี่ยนเป็นกล่องสีขาวดูสะอาดตา) */}
        <div className="relative z-10 bg-white p-2 md:p-3 rounded-3xl md:rounded-full w-[90%] max-w-5xl shadow-2xl flex flex-col md:flex-row gap-2 md:gap-4 items-center border border-blue-100">
          
          {/* สถานที่ */}
          <div className="flex-1 w-full px-5 py-3 border-b md:border-b-0 md:border-r border-blue-100">
            <label className="block text-xs text-blue-600 font-bold mb-1 uppercase tracking-wider">สถานที่รับรถ-คืนรถ</label>
            <select className="w-full text-blue-950 bg-transparent outline-none cursor-pointer appearance-none font-medium">
              <option value="">กรุณาระบุสถานที่</option>
              <option value="bkk">กรุงเทพมหานคร</option>
              <option value="cnx">เชียงใหม่</option>
              <option value="hkt">ภูเก็ต</option>
            </select>
          </div>

          {/* วันรับรถ */}
          <div className="flex-1 w-full px-5 py-3 border-b md:border-b-0 md:border-r border-blue-100">
            <label className="block text-xs text-blue-600 font-bold mb-1 uppercase tracking-wider">จากวันที่</label>
            <input type="datetime-local" className="w-full text-blue-950 bg-transparent outline-none cursor-pointer font-medium" />
          </div>

          {/* วันคืนรถ */}
          <div className="flex-1 w-full px-5 py-3">
            <label className="block text-xs text-blue-600 font-bold mb-1 uppercase tracking-wider">ถึงวันที่</label>
            <input type="datetime-local" className="w-full text-blue-950 bg-transparent outline-none cursor-pointer font-medium" />
          </div>

          {/* ปุ่มค้นหา (สีน้ำเงินเด่นๆ) */}
          <button className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full flex items-center justify-center transition-all duration-300 shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] md:aspect-square group">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:mr-0 mr-2 transform group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="md:hidden font-bold">ค้นหารถ</span>
          </button>
        </div>
      </section>

      {/* 2. Info Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="rounded-2xl overflow-hidden shadow-2xl relative group h-[450px]">
            <div className="absolute inset-0 bg-blue-600/5 group-hover:bg-transparent transition duration-500 z-10"></div>
            <img src="https://images.unsplash.com/photo-1617531653332-bd46c24f2068?auto=format&fit=crop&w=800&q=80" alt="Luxury Car Concept" className="w-full h-full object-cover transform group-hover:scale-105 transition duration-700" />
          </div>
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-blue-950 mb-6 leading-tight">
              ความสมบูรณ์แบบ<br/>ในทุก<span className="text-blue-600">การขับขี่</span>
            </h2>
            <p className="text-slate-600 text-lg mb-6 leading-relaxed font-light">
              สัมผัสประสบการณ์การเดินทางที่เหนือกว่า แพลตฟอร์มของเราคัดสรรเฉพาะรถยนต์สภาพเยี่ยม ไม่ว่าจะเป็นการเดินทางเพื่อธุรกิจใน <strong>กรุงเทพ</strong> หรือพักผ่อนใน <strong>เชียงใหม่ และภูเก็ต</strong> เราพร้อมมอบความหรูหราที่เข้าถึงได้
            </p>
            {/* เส้นแบ่งสีน้ำเงิน */}
            <div className="w-16 h-1.5 bg-blue-600 mb-6 rounded-full"></div>
            <h3 className="text-xl font-bold text-blue-950 mb-3">ยืดหยุ่น ไร้รอยต่อ</h3>
            <p className="text-slate-600 leading-relaxed font-light">
              เลือกแพ็กเกจที่ตรงใจคุณ ทั้งแบบรายวัน รายสัปดาห์ หรือรายเดือน พร้อมตัวเลือกรถพลังงานสะอาด (EV) ที่ช่วยให้คุณดูดีพร้อมรักษ์โลกไปในตัว
            </p>
          </div>
        </div>
      </section>

      {/* 3. Recommended Cars Section */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-extrabold text-blue-950">รถเช่าแนะนำ</h2>
            <p className="text-blue-600 mt-2 font-medium">สัมผัสความเหนือระดับในทุกเส้นทาง</p>
          </div>
          <Link href="/cars" className="text-blue-600 hover:text-blue-800 font-bold transition hidden md:flex items-center gap-2 group">
            ดูทั้งหมด 
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform group-hover:translate-x-1 transition" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>

        {/* การ์ดรถยนต์บนพื้นขาว */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recommendedCars.map((car) => (
            <div key={car.id} className="bg-white rounded-2xl overflow-hidden border border-blue-100 hover:border-blue-300 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group">
              <div className="h-48 overflow-hidden relative bg-slate-100">
                <img src={car.img} alt={car.name} className="w-full h-full object-cover transform group-hover:scale-110 transition duration-700 mix-blend-multiply" />
              </div>
              <div className="p-6 flex flex-col flex-1">
                <p className="text-xs text-blue-500 font-bold uppercase tracking-wider mb-2">{car.type}</p>
                <h3 className="text-xl font-bold text-blue-950 mb-4">{car.name}</h3>
                <div className="mt-auto flex justify-between items-end border-t border-slate-100 pt-5">
                  <div>
                    <p className="text-slate-500 text-xs font-medium mb-1">เริ่มต้น</p>
                    <p className="text-blue-950 font-extrabold"><span className="text-2xl text-blue-600">฿{car.price}</span> / วัน</p>
                  </div>
                  <button className="border-2 border-blue-600 text-blue-600 px-4 py-2 rounded-xl text-sm hover:bg-blue-600 hover:text-white transition-all font-bold">จองเลย</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <Link href="/cars" className="block text-center mt-10 text-blue-600 font-bold md:hidden">ดูคอลเลกชันทั้งหมด &rarr;</Link>
      </section>

      {/* 4. Promotions Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-extrabold text-blue-950 mb-10 text-center">สิทธิพิเศษสำหรับคุณ</h2>
        {/* การ์ดโปรโมชั่นยังคงใช้สีเข้มไล่ระดับ เพื่อให้สะดุดตา */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {promotions.map((promo) => (
            <div key={promo.id} className={`bg-gradient-to-br ${promo.gradient} border rounded-2xl p-8 text-white relative overflow-hidden group cursor-pointer hover:-translate-y-2 transition-all duration-300 shadow-xl`}>
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-3 text-white tracking-tight">{promo.title}</h3>
                <p className="text-blue-100 font-light leading-relaxed">{promo.desc}</p>
              </div>
              {/* เอฟเฟกต์แสงตกแต่ง */}
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:bg-blue-400/20 transition duration-500"></div>
            </div>
          ))}
        </div>
      </section>
      </main>
    </div>
  );
}