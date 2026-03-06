"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Ticket, Search, AlertCircle, Trash2, ChevronLeft, ChevronRight, Upload, ImageIcon } from "lucide-react";
import Swal from "sweetalert2";
import Image from "next/image"; 

interface Promotion {
  proID: number;
  proName: string;
  proCode: string;
  proDetail: string;
  proType: 'percent' | 'amount';
  proValue: number;
  proMin: number;
  proMax: number;
  proStart: string;
  proEnd: string;
  proStatus: 'active' | 'inactive';
  proPic: string;
}

const formatDateTimeForInput = (dateString: string) => {
  if (!dateString) return "";
  const d = new Date(dateString);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16); 
};

export default function PromotionManagementPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    proName: "", proCode: "", proDetail: "", proType: "amount",
    proValue: 0, proMin: 0, proMax: "", proStart: "", proEnd: "", proStatus: "active", proPic: ""
  });
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const fetchPromotions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/promotions?all=true");
      const data = await res.json();
      setPromotions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchPromotions(); }, []);
  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  const handleOpenAdd = () => {
    setModalMode("add");
    setEditingId(null);
    setFormData({
      proName: "", proCode: "", proDetail: "", proType: "amount",
      proValue: 0, proMin: 0, proMax: "", proStart: "", proEnd: "", proStatus: "active", proPic: ""
    });
    setImageFile(null);
    setImagePreview(null);
    setFormError("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (pro: Promotion) => {
    setModalMode("edit");
    setEditingId(pro.proID);
    setFormData({
      ...pro,
      proMax: pro.proMax === null ? "" : String(pro.proMax),
      proStart: formatDateTimeForInput(pro.proStart),
      proEnd: formatDateTimeForInput(pro.proEnd),
    });
    setImageFile(null);
    setImagePreview(pro.proPic || null); 
    setFormError("");
    setIsModalOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ["proValue", "proMin"].includes(name) ? Number(value) : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setFormError("ขนาดรูปภาพใหญ่เกินไป (จำกัด 5MB)");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setFormError(""); 
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    if (!formData.proName || !formData.proCode || !formData.proStart || !formData.proEnd) {
      setFormError("กรุณากรอกข้อมูลที่มีเครื่องหมาย * ให้ครบถ้วน");
      setIsSubmitting(false); return;
    }

    let finalPicUrl = formData.proPic;

    if (imageFile) {
      const uploadData = new FormData();
      uploadData.append("file", imageFile);

      try {
        const uploadRes = await fetch("/api/upload/promotion", {
          method: "POST",
          body: uploadData, 
        });
        
        const uploadResult = await uploadRes.json();

        if (!uploadRes.ok || !uploadResult.ok) {
          throw new Error(uploadResult.message || "อัปโหลดรูปภาพล้มเหลว");
        }
        
        finalPicUrl = uploadResult.url; 

      } catch (error: any) {
        setFormError("เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ: " + error.message);
        setIsSubmitting(false);
        return; 
      }
    }

    // รวมข้อมูลและรายละเอียดทั้งหมดส่งไปบันทึก
    const payload = { 
      ...formData, 
      proMax: formData.proMax === "" ? null : Number(formData.proMax),
      proPic: finalPicUrl 
    };

    try {
      const url = modalMode === "add" ? "/api/promotions" : `/api/promotions/${editingId}`;
      const res = await fetch(url, {
        method: modalMode === "add" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();

      if (res.ok) {
        setIsModalOpen(false);
        fetchPromotions();
        Swal.fire({
          title: "สำเร็จ!", text: "บันทึกข้อมูลโปรโมชั่นเรียบร้อยแล้ว", icon: "success",
          timer: 2000, showConfirmButton: false, timerProgressBar: true,
          customClass: { popup: 'rounded-3xl shadow-2xl border border-slate-100 font-sans' }
        });
      } else {
        setFormError(result.error);
      }
    } catch (error) {
      setFormError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (proID: number, proCode: string) => {
    const confirmResult = await Swal.fire({
      title: "ยืนยันการระงับ?", html: `ต้องการระงับโค้ด <b>${proCode}</b> หรือไม่?`, icon: "warning",
      showCancelButton: true, confirmButtonColor: "#ef4444", cancelButtonColor: "#94a3b8",
      confirmButtonText: "ระงับเลย", cancelButtonText: "ยกเลิก", reverseButtons: true,
      customClass: { popup: 'rounded-3xl font-sans' }
    });

    if (confirmResult.isConfirmed) {
      const res = await fetch(`/api/promotions/${proID}`, { method: 'DELETE' });
      if (res.ok) {
        fetchPromotions();
        Swal.fire({ title: "ระงับสำเร็จ", icon: "success", timer: 1500, showConfirmButton: false });
      }
    }
  };

  const processedData = promotions
    .filter((p) => p.proCode.toLowerCase().includes(searchTerm.toLowerCase()) || p.proName.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => b.proID - a.proID);

  const totalPages = Math.ceil(processedData.length / itemsPerPage);
  const currentData = processedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800">จัดการโปรโมชั่น</h1>
          <p className="text-sm text-slate-500 mt-1">เพิ่ม แก้ไข แคมเปญและโค้ดส่วนลดของร้าน</p>
        </div>
        <button onClick={handleOpenAdd} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-sm">
          <Plus size={20} /> สร้างโปรโมชั่น
        </button>
      </div>

      {/* Filter / Search Section */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-3">
        <Search className="text-slate-400" size={20} />
        <input type="text" placeholder="ค้นหาชื่อแคมเปญ หรือ โค้ดส่วนลด..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-transparent outline-none text-sm text-slate-700" />
      </div>

      {/* Table Section (เอาคอลัมน์รูปออกแล้ว) */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 text-slate-600 text-sm font-bold">โค้ด (Code)</th>
                <th className="p-4 text-slate-600 text-sm font-bold">ชื่อแคมเปญ</th>
                <th className="p-4 text-slate-600 text-sm font-bold text-right">ส่วนลด</th>
                <th className="p-4 text-slate-600 text-sm font-bold">ระยะเวลา</th>
                <th className="p-4 text-slate-600 text-sm font-bold text-center">สถานะ</th>
                <th className="p-4 text-slate-600 text-sm font-bold text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan={6} className="p-8 text-center text-slate-500">กำลังโหลด...</td></tr>
              ) : currentData.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-slate-500"><Ticket className="w-12 h-12 mx-auto mb-2 text-slate-300"/>ไม่พบข้อมูลโปรโมชั่น</td></tr>
              ) : (
                currentData.map((pro) => {
                  const isActive = pro.proStatus === 'active';
                  const isExpired = new Date(pro.proEnd) < new Date();
                  return (
                    <tr key={pro.proID} className={`hover:bg-slate-50/50 transition-colors ${!isActive ? 'opacity-60 bg-slate-50/30' : ''}`}>
                      <td className="p-4"><span className="bg-blue-50 text-blue-700 font-black px-3 py-1 rounded-lg border border-blue-100">{pro.proCode}</span></td>
                      <td className="p-4 font-bold text-slate-800 text-sm">{pro.proName}</td>
                      <td className="p-4 text-right font-bold text-red-500">
                        {pro.proType === 'percent' ? `${pro.proValue}%` : `${pro.proValue.toLocaleString()} ฿`}
                      </td>
                      <td className="p-4 text-xs text-slate-500">
                        {new Date(pro.proStart).toLocaleDateString("th-TH")} - {new Date(pro.proEnd).toLocaleDateString("th-TH")}
                        {isExpired && <span className="ml-2 text-red-500 font-bold">(หมดอายุ)</span>}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-3 py-1 rounded-full font-bold text-xs ${isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"}`}>
                          {isActive ? 'ใช้งานอยู่' : 'ระงับ'}
                        </span>
                      </td>
                      <td className="p-4 text-center whitespace-nowrap">
                        <button onClick={() => handleOpenEdit(pro)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit size={18} /></button>
                        {isActive && (
                          <button onClick={() => handleDelete(pro.proID, pro.proCode)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg ml-1 transition-colors"><Trash2 size={18} /></button>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50/50">
            <p className="text-sm text-slate-500 font-medium">รวม <span className="font-bold text-slate-800">{processedData.length}</span> รายการ</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition-colors shadow-sm"><ChevronLeft size={18}/></button>
              <span className="text-sm font-bold text-slate-700 px-3">หน้า {currentPage} / {totalPages}</span>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition-colors shadow-sm"><ChevronRight size={18}/></button>
            </div>
          </div>
        )}
      </div>

      {/* Modal (Popup) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-800">{modalMode === "add" ? "สร้างโปรโมชั่นใหม่" : "แก้ไขโปรโมชั่น"}</h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 custom-scrollbar">
              {formError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium flex items-center gap-2">
                  <AlertCircle size={18}/> {formError}
                </div>
              )}

              {/* อัปโหลดรูปภาพ */}
              <div className="border-b border-slate-100 pb-5 mb-5">
                <label className="block text-sm font-bold text-slate-700 mb-3">รูปภาพแบนเนอร์โปรโมชั่น</label>
                <div className="flex items-center gap-5">
                  <div className="w-40 h-24 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden relative group shrink-0 shadow-inner">
                    {imagePreview ? (
                      <Image 
                        src={imagePreview} 
                        alt="Preview" 
                        fill 
                        className="object-cover"
                        sizes="160px"
                      />
                    ) : (
                      <ImageIcon className="text-slate-300" size={32} />
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <label className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 cursor-pointer hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm font-bold text-sm focus-within:ring-2 focus-within:ring-blue-200">
                      <Upload size={18} className="text-blue-600" />
                      {imagePreview ? "เปลี่ยนรูปภาพ" : "เลือกรูปภาพแบนเนอร์"}
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageChange} 
                        className="sr-only" 
                      />
                    </label>
                    <p className="text-xs text-slate-500">แนะนำขนาด 800x400px (หรือสัดส่วน 2:1). ไฟล์ JPG, PNG ไม่เกิน 5MB</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">ชื่อแคมเปญ <span className="text-red-500">*</span></label>
                  <input type="text" name="proName" value={formData.proName} onChange={handleChange} required 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400" placeholder="เช่น ฉลองเปิดร้านใหม่" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">โค้ด (สำหรับให้ลูกค้ากรอก) <span className="text-red-500">*</span></label>
                  <input type="text" name="proCode" value={formData.proCode} onChange={handleChange} required 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all uppercase font-bold text-blue-700 placeholder:text-slate-400 placeholder:font-normal" placeholder="เช่น PHUMJAI100" />
                </div>
              </div>

              {/* 🌟 ช่องกรอกรายละเอียดโปรโมชั่น (สามารถแก้ไขและเซฟลง DB ได้) */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">รายละเอียดและเงื่อนไขโปรโมชั่น</label>
                <textarea name="proDetail" value={formData.proDetail} onChange={handleChange} rows={2}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none placeholder:text-slate-400"
                  placeholder="เช่น สงวนสิทธิ์สำหรับลูกค้าใหม่เท่านั้น..."
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">ประเภทส่วนลด <span className="text-red-500">*</span></label>
                  <select name="proType" value={formData.proType} onChange={handleChange} 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer">
                    <option value="amount">ลดเป็นจำนวนเงิน (บาท)</option>
                    <option value="percent">ลดเป็นเปอร์เซ็นต์ (%)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">มูลค่าส่วนลด <span className="text-red-500">*</span></label>
                  <input type="number" name="proValue" value={formData.proValue} onChange={handleChange} required min="0" 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="0" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                <div>
                  <label className="block text-sm font-bold text-slate-500 mb-1">ยอดจองขั้นต่ำ (฿)</label>
                  <input type="number" name="proMin" value={formData.proMin} onChange={handleChange} min="0" 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400" placeholder="0 (เว้นว่างได้)" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-500 mb-1">ลดสูงสุด (฿) <span className="text-xs font-normal">(เฉพาะลดแบบ %)</span></label>
                  <input type="number" name="proMax" value={formData.proMax} onChange={handleChange} min="0" placeholder="ไม่จำกัด (เว้นว่างได้)" 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all Placeholder:text-slate-400" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">เริ่มวันที่ <span className="text-red-500">*</span></label>
                  <input type="datetime-local" name="proStart" value={formData.proStart} onChange={handleChange} required 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">สิ้นสุดวันที่ <span className="text-red-500">*</span></label>
                  <input type="datetime-local" name="proEnd" value={formData.proEnd} onChange={handleChange} required 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">สถานะ</label>
                <select name="proStatus" value={formData.proStatus} onChange={handleChange} 
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer">
                  <option value="active">เปิดใช้งาน (Active)</option>
                  <option value="inactive">ระงับ (Inactive)</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3 sticky bottom-0 bg-white pb-2">
                <button type="button" onClick={() => setIsModalOpen(false)} 
                  className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors">
                  ยกเลิก
                </button>
                <button type="submit" disabled={isSubmitting} 
                  className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {isSubmitting && <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>}
                  {isSubmitting ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}