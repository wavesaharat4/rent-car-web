import Image from "next/image";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="bg-slate-50 min-h-screen font-sans text-blue-950 overflow-hidden relative">
      
      {/* ไม่มีการใช้ Background Glow ฟุ้งๆ แล้ว เพื่อความคลีน */}

      {/* 1. Hero Section (ภาพพื้นหลัง + Overlay สีเข้มแบบทึบแสง ไม่ไล่เฉด) */}
      <section className="relative w-full h-[60vh] min-h-[450px] flex flex-col items-center justify-center mt-16 md:mt-20">
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=1920&q=80')" }}
        >
          {/* ใช้สีน้ำเงินเข้มทึบแสงคลุมภาพ (Solid Overlay) */}
          <div className="absolute inset-0 bg-blue-950/85"></div>
        </div>

        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-white mb-6 tracking-tight drop-shadow-md">
            รู้จักกับ <span className="text-white">PhumJai</span> <span className="text-amber-500">Rent</span>
          </h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto font-light leading-relaxed">
            เราไม่ใช่แค่ผู้ให้บริการรถเช่า แต่เราคือ "เพื่อนร่วมทาง" ที่พร้อมมอบประสบการณ์การขับขี่ที่เหนือระดับ ปลอดภัย และตอบโจทย์ทุกไลฟ์สไตล์ของคุณ
          </p>
        </div>
      </section>

      {/* 2. Our Story Section (คงไว้เพราะการจัดวางสวยอยู่แล้ว แต่ปรับกล่องข้อความให้ชัดขึ้น) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* ฝั่งซ้าย: รูปภาพซ้อนทับ */}
          <div className="relative h-[500px] w-full hidden md:block">
            <div className="absolute top-0 right-0 w-4/5 h-[400px] rounded-3xl overflow-hidden shadow-2xl z-10 border-4 border-white">
              <img 
                src="https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1000&q=80" 
                alt="Luxury Car Trip" 
                className="w-full h-full object-cover hover:scale-105 transition duration-700"
              />
            </div>
            <div className="absolute bottom-0 left-0 w-3/5 h-[300px] rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-8 border-slate-50 z-20">
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80" 
                alt="Happy Customers" 
                className="w-full h-full object-cover hover:scale-105 transition duration-700"
              />
            </div>
            <div className="absolute top-8 left-8 w-24 h-24 border-t-4 border-l-4 border-amber-500 z-30"></div>
          </div>

          {/* ฝั่งขวา: เนื้อหา (เปลี่ยนจากกระจกฝ้า เป็นกล่องขาวคลีนๆ มีเงาชัดเจน) */}
          <div className="space-y-6 bg-white p-10 rounded-3xl shadow-xl border border-blue-50 relative">
            {/* เส้นตกแต่งสีทอง */}
            <div className="absolute top-0 left-10 w-20 h-1.5 bg-amber-500 rounded-b-full"></div>
            
            <h4 className="text-blue-600 font-bold tracking-widest uppercase text-sm mb-2 pt-4">Our Story</h4>
            <h2 className="text-3xl md:text-4xl font-extrabold text-blue-950 leading-tight">
              จุดเริ่มต้นของ <br /> <span className="text-amber-500">ความสมบูรณ์แบบ</span>
            </h2>
            <p className="text-slate-600 leading-relaxed font-medium text-lg mt-6">
              PhumJaiRent ก่อตั้งขึ้นจากความหลงใหลในการเดินทางและความเข้าใจอย่างลึกซึ้งว่า <strong>"รถยนต์"</strong> คือหัวใจสำคัญของทุกทริป เราเริ่มต้นจากรถยนต์เพียงไม่กี่คัน สู่การเป็นแพลตฟอร์มที่รวมรถยนต์คุณภาพพรีเมียมไว้มากที่สุด
            </p>
            <p className="text-slate-600 leading-relaxed font-light text-lg">
              ทุกขั้นตอนของเราถูกออกแบบมาเพื่อ <strong>"ลดความยุ่งยาก"</strong> และ <strong>"เพิ่มความสุข"</strong> ไม่ว่าคุณจะเช่ารถอีโคคาร์เพื่อขับในเมือง หรือรถตู้หรูสำหรับครอบครัว เราดูแลรถทุกคันเสมือนรถของเราเอง
            </p>
          </div>
        </div>
      </section>

      {/* 3. Company Stats (ใช้สีน้ำเงินเข้มทึบ Solid Color ตัดกับตัวเลขสีทอง) */}
      <section className="bg-blue-950 py-16 relative overflow-hidden">
        {/* ลาย Pattern จุดเล็กๆ จางๆ เพื่อให้ดูมี Texture ไม่เรียบเกินไป */}
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)", backgroundSize: "20px 20px" }}></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x-0 md:divide-x divide-blue-800">
            <div className="p-4 hover:-translate-y-2 transition-transform duration-300">
              <h3 className="text-4xl md:text-6xl font-extrabold text-amber-500 mb-2 font-mono">500+</h3>
              <p className="text-blue-100 font-medium uppercase tracking-wider text-sm">รถยนต์คุณภาพสูง</p>
            </div>
            <div className="p-4 hover:-translate-y-2 transition-transform duration-300">
              <h3 className="text-4xl md:text-6xl font-extrabold text-amber-500 mb-2 font-mono">10k+</h3>
              <p className="text-blue-100 font-medium uppercase tracking-wider text-sm">ลูกค้าที่ไว้วางใจ</p>
            </div>
            <div className="p-4 hover:-translate-y-2 transition-transform duration-300">
              <h3 className="text-4xl md:text-6xl font-extrabold text-amber-500 mb-2 font-mono">15+</h3>
              <p className="text-blue-100 font-medium uppercase tracking-wider text-sm">จุดรับ-ส่งทั่วประเทศ</p>
            </div>
            <div className="p-4 hover:-translate-y-2 transition-transform duration-300">
              <h3 className="text-4xl md:text-6xl font-extrabold text-amber-500 mb-2 font-mono">24/7</h3>
              <p className="text-blue-100 font-medium uppercase tracking-wider text-sm">บริการช่วยเหลือ</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Core Values (เปลี่ยนจากกล่อง Gradient ใหญ่ๆ เป็นการ์ดขาวคลีนๆ ตัดขอบน้ำเงินเข้ม) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10 bg-slate-50">
        <div className="text-center mb-16">
          <h4 className="text-blue-600 font-bold tracking-widest uppercase text-sm mb-3">Why Choose Us</h4>
          <h2 className="text-3xl md:text-4xl font-extrabold text-blue-950">มาตรฐานใหม่ของการเช่ารถ</h2>
          <div className="w-24 h-1.5 bg-amber-500 mx-auto mt-6 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Cards (ใช้พื้นขาว ตัดขอบน้ำเงิน มีเงาชัดเจน) */}
          {[
            { title: "ตรวจสอบสภาพ 36 จุด", desc: "รถทุกคันผ่านการตรวจเช็คสภาพอย่างละเอียดจากช่างผู้เชี่ยวชาญก่อนส่งมอบให้ลูกค้าเสมอ", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
            { title: "ดูแลตลอด 24 ชม.", desc: "อุ่นใจทุกเส้นทางด้วยบริการ Roadside Assistance และ Call Center ที่พร้อมช่วยเหลือคุณทุกเมื่อ", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
            { title: "ราคาโปร่งใส ไม่มีแฝง", desc: "หมดกังวลเรื่องค่าใช้จ่ายจุกจิก ราคาที่คุณเห็นรวมประกันภัยและภาษีเรียบร้อยแล้ว", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
            { title: "จองง่าย รวดเร็ว", desc: "ระบบจองออนไลน์ที่ใช้งานง่าย อนุมัติไวภายใน 15 นาที พร้อมรับรถได้ทันที", icon: "M13 10V3L4 14h7v7l9-11h-7z" }
          ].map((item, index) => (
            <div key={index} className="bg-white p-8 rounded-2xl border-2 border-blue-50 hover:border-blue-600 transition duration-300 group shadow-md hover:shadow-xl flex flex-col items-center text-center relative overflow-hidden">
              {/* แถบสีตกแต่งด้านบนการ์ด */}
              <div className="absolute top-0 left-0 w-full h-2 bg-blue-950 group-hover:bg-amber-500 transition-colors duration-300"></div>
              
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition duration-300">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-blue-950">{item.title}</h3>
              <p className="text-slate-500 font-light text-sm leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}

        </div>
      </section>

      {/* 5. Call to Action (ใช้สีน้ำเงินเข้มทึบ ตัดกับปุ่มสีทอง) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 relative z-10">
        <div className="bg-blue-950 rounded-[2rem] p-10 md:p-20 text-center shadow-2xl relative overflow-hidden">
          {/* ลายเส้นกราฟิกพื้นหลังจางๆ */}
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\\'60\\' height=\\'60\\' viewBox=\\'0 0 60 60\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'none\\' fill-rule=\\'evenodd\\'%3E%3Cg fill=\\'%23ffffff\\' fill-opacity=\\'1\\'%3E%3Cpath d=\\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')" }}></div>

          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">พร้อมเปิดประสบการณ์ใหม่<br/>ไปกับเราหรือยัง?</h2>
            <p className="text-blue-200 mb-10 font-light text-lg max-w-2xl mx-auto">เลือกรถที่ใช่ แล้วออกไปสร้างความทรงจำดีๆ ในทริปต่อไปของคุณ</p>
            
            {/* ปุ่มสีทองทึบ */}
            <Link 
              href="/cars" 
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-blue-950 px-10 py-4 rounded-full font-bold shadow-lg transition-all transform hover:-translate-y-1 hover:scale-105 group"
            >
              เริ่มค้นหารถเช่า
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}