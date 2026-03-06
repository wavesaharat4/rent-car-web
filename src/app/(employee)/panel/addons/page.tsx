"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Package,
  Search,
  AlertCircle,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"; // 🌟 นำเข้าไอคอนลูกศร
import Swal from "sweetalert2";

// สร้าง Type สำหรับ Addon
interface Addon {
  addonID: number;
  addonName: string;
  addonDetail: string;
  addonQuantity: number;
  addonPrice: number;
  addonMaxLimit: number;
  addonStatus: "Active" | "Inactive";
}

export default function AddonManagementPage() {
  const [addons, setAddons] = useState<Addon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // 🌟 State สำหรับการแบ่งหน้า (Pagination)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // แสดงหน้าละ 10 รายการ

  // State สำหรับจัดการ Modal (Popup)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editingId, setEditingId] = useState<number | null>(null);

  // State สำหรับฟอร์ม
  const [formData, setFormData] = useState({
    addonName: "",
    addonDetail: "",
    addonQuantity: 0,
    addonPrice: 0,
    addonMaxLimit: 1,
    addonStatus: "Active",
  });
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAddons = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/addons?all=true");
      const data = await res.json();
      if (Array.isArray(data)) {
        setAddons(data);
      } else {
        setAddons([]);
      }
    } catch (error) {
      console.error("Failed to fetch addons:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAddons();
  }, []);

  // 🌟 เมื่อมีการพิมพ์ค้นหา ให้กลับไปที่หน้า 1 เสมอ
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleOpenAdd = () => {
    setModalMode("add");
    setEditingId(null);
    setFormData({
      addonName: "",
      addonDetail: "",
      addonQuantity: 0,
      addonPrice: 0,
      addonMaxLimit: 1,
      addonStatus: "Active",
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (addon: Addon) => {
    setModalMode("edit");
    setEditingId(addon.addonID);
    setFormData({
      addonName: addon.addonName,
      addonDetail: addon.addonDetail || "",
      addonQuantity: addon.addonQuantity,
      addonPrice: addon.addonPrice,
      addonMaxLimit: addon.addonMaxLimit,
      addonStatus: addon.addonStatus,
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ["addonQuantity", "addonPrice", "addonMaxLimit"].includes(name)
        ? Number(value)
        : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    if (
      !formData.addonName ||
      formData.addonPrice < 0 ||
      formData.addonQuantity < 0
    ) {
      setFormError("กรุณากรอกข้อมูลให้ครบถ้วน และตัวเลขห้ามติดลบ");
      setIsSubmitting(false);
      return;
    }

    try {
      const url =
        modalMode === "add" ? "/api/addons" : `/api/addons/${editingId}`;
      const method = modalMode === "add" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (res.ok) {
        setIsModalOpen(false);
        fetchAddons();

        Swal.fire({
          title: "บันทึกข้อมูลสำเร็จ!",
          text:
            modalMode === "add"
              ? "เพิ่มอุปกรณ์เสริมใหม่เข้าสู่ระบบแล้ว"
              : "อัปเดตข้อมูลอุปกรณ์เสริมเรียบร้อยแล้ว",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
          timerProgressBar: true,
          iconColor: "#10b981",
          customClass: {
            popup: "rounded-3xl shadow-2xl border border-slate-100 font-sans",
            title: "text-2xl font-bold text-slate-800",
          },
        });
      } else {
        setFormError(result.error || "เกิดข้อผิดพลาดในการบันทึก");
      }
    } catch (error) {
      setFormError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (addonID: number, addonName: string) => {
    const confirmResult = await Swal.fire({
      title: "ยืนยันการระงับการแสดงผล?",
      html: `คุณต้องการระงับ <b>${addonName}</b> ใช่หรือไม่?<br><span class="text-sm text-red-500">ลูกค้าจะไม่สามารถจองอุปกรณ์นี้ได้อีก แต่ประวัติเก่าจะยังอยู่</span>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#94a3b8",
      confirmButtonText: "ใช่, ระงับเลย!",
      cancelButtonText: "ยกเลิก",
      reverseButtons: true,
      customClass: {
        popup: "rounded-3xl shadow-2xl border border-slate-100 font-sans",
        title: "text-xl font-bold text-slate-800",
        confirmButton: "rounded-xl font-bold px-6 py-2.5",
        cancelButton: "rounded-xl font-bold px-6 py-2.5",
      },
    });

    if (confirmResult.isConfirmed) {
      try {
        const res = await fetch(`/api/addons/${addonID}`, {
          method: "DELETE",
        });
        const result = await res.json();

        if (res.ok) {
          fetchAddons();
          Swal.fire({
            title: "ระงับสำเร็จ!",
            text: `เปลี่ยนสถานะ ${addonName} เป็น Inactive แล้ว`,
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
            customClass: {
              popup: "rounded-3xl shadow-2xl border border-slate-100 font-sans",
              title: "text-xl font-bold text-slate-800",
            },
          });
        } else {
          Swal.fire({
            title: "เกิดข้อผิดพลาด",
            text: result.error || "ไม่สามารถระงับข้อมูลได้",
            icon: "error",
            confirmButtonColor: "#3b82f6",
            customClass: { popup: "rounded-3xl font-sans" },
          });
        }
      } catch (error) {
        Swal.fire({
          title: "เชื่อมต่อล้มเหลว",
          text: "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้",
          icon: "error",
          confirmButtonColor: "#3b82f6",
          customClass: { popup: "rounded-3xl font-sans" },
        });
      }
    }
  };

  // 🌟 ประมวลผลข้อมูล (ค้นหา -> เรียงลำดับ -> แบ่งหน้า)
  const processedAddons = addons
    // 1. ค้นหา
    .filter((a) => a.addonName.toLowerCase().includes(searchTerm.toLowerCase()))
    // 2. เรียงลำดับจาก ID น้อยไปมาก (Ascending)
    .sort((a, b) => a.addonID - b.addonID);

  // 3. คำนวณจำนวนหน้าทั้งหมด
  const totalPages = Math.ceil(processedAddons.length / itemsPerPage);

  // 4. ตัดข้อมูลมาแสดงเฉพาะหน้าที่เลือก
  const currentAddons = processedAddons.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800">
            จัดการอุปกรณ์เสริม
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            เพิ่ม แก้ไข สถานะและราคาของอุปกรณ์เสริมในระบบ
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={20} />
          เพิ่มอุปกรณ์เสริม
        </button>
      </div>

      {/* Filter / Search Section */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-3">
        <Search className="text-slate-400" size={20} />
        <input
          type="text"
          placeholder="ค้นหาชื่ออุปกรณ์เสริม..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent border-none outline-none text-sm text-slate-700 placeholder:text-slate-400"
        />
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 font-bold text-slate-600 text-sm">รหัส</th>
                <th className="p-4 font-bold text-slate-600 text-sm">
                  ชื่ออุปกรณ์
                </th>
                <th className="p-4 font-bold text-slate-600 text-sm">
                  รายละเอียด
                </th>
                <th className="p-4 font-bold text-slate-600 text-sm text-right">
                  จำนวนคงเหลือ
                </th>
                <th className="p-4 font-bold text-slate-600 text-sm text-right">
                  ราคา/วัน (฿)
                </th>
                <th className="p-4 font-bold text-slate-600 text-sm text-center">
                  สถานะ
                </th>
                <th className="p-4 font-bold text-slate-600 text-sm text-center">
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    กำลังโหลดข้อมูล...
                  </td>
                </tr>
              ) : currentAddons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    ไม่พบข้อมูลอุปกรณ์เสริม
                  </td>
                </tr>
              ) : (
                // 🌟 ใช้ currentAddons แทน filteredAddons
                currentAddons.map((addon) => (
                  <tr
                    key={addon.addonID}
                    className={`hover:bg-slate-50/50 transition-colors ${addon.addonStatus === "Inactive" ? "opacity-60 bg-slate-50/30" : ""}`}
                  >
                    <td className="p-4 text-sm text-slate-600 font-medium">
                      #{addon.addonID}
                    </td>
                    <td className="p-4 text-sm font-bold text-slate-800">
                      {addon.addonName}
                    </td>
                    <td className="p-4 text-sm text-slate-500 max-w-xs truncate">
                      {addon.addonDetail || "-"}
                    </td>
                    <td className="p-4 text-sm text-right font-medium">
                      {addon.addonQuantity} ชิ้น
                    </td>
                    <td className="p-4 text-sm font-bold text-slate-800 text-right">
                      {addon.addonPrice.toLocaleString()}
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-full font-bold text-xs ${
                          addon.addonStatus === "Active"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-200 text-slate-500"
                        }`}
                      >
                        {addon.addonStatus === "Active"
                          ? "เปิดใช้งาน"
                          : "ระงับ"}
                      </span>
                    </td>
                    <td className="p-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleOpenEdit(addon)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-flex"
                        title="แก้ไขข้อมูล (สามารถเปิดใช้งานใหม่ได้ที่นี่)"
                      >
                        <Edit size={18} />
                      </button>

                      {addon.addonStatus === "Active" && (
                        <button
                          onClick={() =>
                            handleDelete(addon.addonID, addon.addonName)
                          }
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors inline-flex ml-1"
                          title="ระงับการแสดงผล"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 🌟 Pagination Controls (ปุ่มเปลี่ยนหน้า) */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50/50">
            <p className="text-sm text-slate-500 font-medium">
              แสดง{" "}
              <span className="font-bold text-slate-800">
                {(currentPage - 1) * itemsPerPage + 1}
              </span>{" "}
              ถึง{" "}
              <span className="font-bold text-slate-800">
                {Math.min(currentPage * itemsPerPage, processedAddons.length)}
              </span>{" "}
              จากทั้งหมด{" "}
              <span className="font-bold text-slate-800">
                {processedAddons.length}
              </span>{" "}
              รายการ
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="text-sm font-bold text-slate-700 px-3">
                หน้า {currentPage} / {totalPages}
              </div>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal (Popup) สำหรับเพิ่ม/แก้ไข */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-800">
                {modalMode === "add"
                  ? "เพิ่มอุปกรณ์เสริมใหม่"
                  : "แก้ไขข้อมูลอุปกรณ์เสริม"}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium flex items-center gap-2">
                  <AlertCircle size={16} />
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  ชื่ออุปกรณ์เสริม <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="addonName"
                  value={formData.addonName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="เช่น คาร์ซีทเด็ก, GPS"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  รายละเอียด
                </label>
                <textarea
                  name="addonDetail"
                  value={formData.addonDetail}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  placeholder="รายละเอียดเพิ่มเติม (ถ้ามี)"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">
                    จำนวนคงเหลือ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="addonQuantity"
                    value={formData.addonQuantity}
                    onChange={handleChange}
                    min="0"
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">
                    ราคา/วัน (฿) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="addonPrice"
                    value={formData.addonPrice}
                    onChange={handleChange}
                    min="0"
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">
                    โควต้าสูงสุดต่อบิล <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="addonMaxLimit"
                    value={formData.addonMaxLimit}
                    onChange={handleChange}
                    min="1"
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  สถานะ <span className="text-red-500">*</span>
                </label>
                <select
                  name="addonStatus"
                  value={formData.addonStatus}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                >
                  <option value="Active">เปิดใช้งาน (Active)</option>
                  <option value="Inactive">ระงับการแสดงผล (Inactive)</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
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
