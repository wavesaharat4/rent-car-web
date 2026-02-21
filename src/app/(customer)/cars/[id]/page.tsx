import Link from 'next/link';
import { notFound } from 'next/navigation';

interface CarDetail {
  id: number;
  name: string;
  brand: string;
  type: string;
  seats: number;
  transmission: string;
  fuel: string;
  price: number;
  img: string;
  description: string;
}

const allCars: CarDetail[] = [
  { id: 1, name: 'Toyota Yaris', brand: 'Toyota', type: 'Eco', seats: 4, transmission: 'Auto', fuel: 'เบนซิน', price: 800, img: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=1200&q=80', description: 'รถยนต์อีโคคาร์ขนาดกะทัดรัด ขับขี่คล่องตัวในเมือง ประหยัดน้ำมันเป็นเลิศ เหมาะสำหรับการเดินทาง 1-2 คน หรือครอบครัวขนาดเล็ก' },
  { id: 2, name: 'Honda HR-V', brand: 'Honda', type: 'SUV', seats: 5, transmission: 'Auto', fuel: 'ไฮบริด (e:HEV)', price: 1500, img: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80', description: 'รถอเนกประสงค์สไตล์สปอร์ตพรีเมียม พื้นที่ห้องโดยสารกว้างขวาง มาพร้อมเทคโนโลยีความปลอดภัยครบครัน เหมาะสำหรับการเดินทางไกล' },
  { id: 3, name: 'BYD Atto 3', brand: 'BYD', type: 'EV', seats: 5, transmission: 'Auto', fuel: 'ไฟฟ้า 100%', price: 1800, img: 'https://images.unsplash.com/photo-1672846727402-1fa8d338fbc9?auto=format&fit=crop&w=1200&q=80', description: 'รถยนต์ไฟฟ้า 100% ดีไซน์ล้ำสมัย อัตราเร่งดีเยี่ยม เป็นมิตรต่อสิ่งแวดล้อม วิ่งได้ไกลต่อการชาร์จ 1 ครั้ง' },
];

// 🟢 อัปเดตให้รองรับ Next.js 15 โดยใส่ async และ Promise
export default async function CarDetailPage({ params }: { params: Promise<{ id: string }> }) {
  
  // รอแกะค่า id ออกมาจาก URL
  const resolvedParams = await params;
  const carId = parseInt(resolvedParams.id);

  // ค้นหารถจาก ID
  const car = allCars.find(c => c.id === carId);

  if (!car) {
    notFound();
  }

  return (
    <div className="bg-slate-50 min-h-screen pt-28 pb-20 font-sans text-blue-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb (ลิงก์ย้อนกลับ) */}
        <div className="mb-6 flex items-center text-sm font-medium text-slate-500">
          <Link href="/" className="hover:text-blue-600 transition-colors">หน้าหลัก</Link>
          <span className="mx-2">/</span>
          <Link href="/cars" className="hover:text-blue-600 transition-colors">รถทั้งหมด</Link>
          <span className="mx-2">/</span>
          <span className="text-blue-950">{car.name}</span>
        </div>

        {/* ส่วนแสดงข้อมูลหลัก (แบ่ง 2 ฝั่ง ซ้ายรูป ขวารายละเอียด) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* ฝั่งซ้าย: รูปภาพรถ */}
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-3xl overflow-hidden shadow-lg border border-blue-100 bg-white aspect-[16/10] relative">
              <img src={car.img} alt={car.name} className="w-full h-full object-cover" />
              <div className="absolute top-4 left-4 bg-blue-600 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-md">
                {car.brand}
              </div>
            </div>
            
            {/* ข้อมูลทั่วไป */}
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-blue-100 mt-6">
              <h2 className="text-2xl font-extrabold text-blue-950 mb-4">รายละเอียดรถยนต์</h2>
              <p className="text-slate-600 leading-relaxed font-light mb-8">
                {car.description}
              </p>
              
              {/* สเปกรถแบบ Grid */}
              <h3 className="text-lg font-bold text-blue-950 mb-4">ข้อมูลจำเพาะ (Specifications)</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center">
                  <span className="text-xs text-slate-500 font-medium mb-1">จำนวนที่นั่ง</span>
                  <span className="text-sm font-bold text-blue-950">{car.seats} ที่นั่ง</span>
                </div>
                
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center">
                  <span className="text-xs text-slate-500 font-medium mb-1">ระบบเกียร์</span>
                  <span className="text-sm font-bold text-blue-950">{car.transmission}</span>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center">
                  <span className="text-xs text-slate-500 font-medium mb-1">พลังงาน</span>
                  <span className="text-sm font-bold text-blue-950">{car.fuel}</span>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center">
                  <span className="text-xs text-slate-500 font-medium mb-1">ประเภทรถ</span>
                  <span className="text-sm font-bold text-blue-950">{car.type}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ฝั่งขวา: การ์ดราคาและการจอง */}
          <div className="lg:sticky lg:top-28">
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl shadow-blue-900/5 border border-blue-100">
              <h1 className="text-3xl font-extrabold text-blue-950 mb-2">{car.name}</h1>
              <p className="text-blue-600 font-bold uppercase tracking-wider text-sm mb-6">{car.type} Class</p>
              
              <div className="flex items-end gap-2 mb-6 pb-6 border-b border-slate-100">
                <span className="text-4xl font-extrabold text-blue-950">฿{car.price}</span>
                <span className="text-slate-500 font-medium mb-1">/ วัน</span>
              </div>

              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-xs text-blue-900 font-bold mb-1 uppercase tracking-wider">วันรับรถ</label>
                  <input type="date" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-sm font-medium" />
                </div>
                <div>
                  <label className="block text-xs text-blue-900 font-bold mb-1 uppercase tracking-wider">วันคืนรถ</label>
                  <input type="date" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-sm font-medium" />
                </div>
              </div>

              <Link href="" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold flex items-center justify-center transition-all shadow-lg shadow-blue-600/30 transform hover:-translate-y-1">
                ดำเนินการจองรถ
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}