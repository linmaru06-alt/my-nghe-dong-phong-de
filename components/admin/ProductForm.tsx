"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Eye, Save, Send, Loader2 } from "lucide-react";

import ImageUploader from "./ImageUploader";
import categoriesData from "@/data/categories.json";
import woodTypesData from "@/data/woodTypes.json";
import { useProductsStore } from "@/lib/useProducts";
import { slugify } from "@/lib/slugify";
import { toast } from "@/components/ui/Toast";

export interface ProductFormData {
  id?: string;
  name: string;
  slug: string;
  code: string;
  category: string;
  woodType: string;
  description: string;
  preservation: string;
  shipping: string;
  sizes: { label: string; price: number | null }[];
  images: string[];
  featured: boolean;
  status: "published" | "draft";
}

export interface ProductFormProps {
  initialData?: ProductFormData;
  isEdit?: boolean;
}

export function ProductForm({ initialData, isEdit = false }: ProductFormProps) {
  const router = useRouter();
  const { addProduct, updateProduct } = useProductsStore();

  const [formData, setFormData] = useState<ProductFormData>(
    initialData || {
      name: "",
      slug: "",
      code: "",
      category: categoriesData[0]?.id || "vong-tay",
      woodType: woodTypesData[0]?.name || "Gỗ Tử Đàn",
      description: "",
      preservation: "",
      shipping: "",
      sizes: [{ label: "Chuẩn", price: 1200000 }],
      images: [],
      featured: false,
      status: "published",
    }
  );

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Auto generate code and slug when name changes if not in edit mode
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const updates: Partial<ProductFormData> = { name };
    if (!isEdit) {
      updates.slug = slugify(name);
      if (!formData.code) {
        const prefix = formData.category.slice(0, 2).toUpperCase();
        updates.code = `${prefix}-${Math.floor(100 + Math.random() * 900)}`;
      }
    }
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  // Add new size row
  const handleAddSize = () => {
    setFormData((prev) => ({
      ...prev,
      sizes: [...prev.sizes, { label: "12mm", price: null }],
    }));
  };

  // Remove size row
  const handleRemoveSize = (index: number) => {
    if (formData.sizes.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.filter((_, i) => i !== index),
    }));
  };

  // Update size row
  const handleUpdateSize = (
    index: number,
    field: "label" | "price",
    value: any
  ) => {
    const updated = [...formData.sizes];
    updated[index] = { ...updated[index], [field]: value };
    setFormData((prev) => ({ ...prev, sizes: updated }));
  };

  const handleSave = async (statusToSet?: "published" | "draft") => {
    if (!formData.name.trim()) {
      alert("Vui lòng nhập tên sản phẩm");
      return;
    }

    setIsSaving(true);
    const finalStatus = statusToSet || formData.status;
    const productPayload = {
      ...formData,
      status: finalStatus,
      id: formData.id || `prod-${Date.now()}`,
      createdAt: (formData as any).createdAt || new Date().toISOString().split("T")[0],
      images:
        formData.images.length > 0
          ? formData.images
          : ["/images/placeholder.jpg"],
    };

    try {
      if (isEdit && formData.id) {
        await updateProduct(formData.id, productPayload);
      } else {
        await addProduct(productPayload as any);
      }

      toast.success(
        finalStatus === "published" ? "Đã xuất bản tác phẩm thành công!" : "Đã lưu bản nháp thành công!",
        "Dữ liệu đã tự động đồng bộ ngay lập tức lên trang chủ và danh mục sản phẩm."
      );

      setTimeout(() => {
        router.push("/admin/san-pham");
      }, 600);
    } catch (err: any) {
      toast.error("Lỗi khi lưu sản phẩm", err.message || "Vui lòng thử lại");
      setIsSaving(false);
    }
  };


  const handlePreview = () => {
    if (typeof window !== "undefined") {
      // Save draft into session or local storage for preview
      localStorage.setItem("admin_preview_product", JSON.stringify(formData));
      window.open(`/san-pham/${formData.slug}?preview=true`, "_blank");
    }
  };

  return (
    <div className="space-y-8 pb-16 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-700 text-white px-5 py-3 rounded-btn shadow-xl text-sm font-semibold animate-in fade-in duration-200">
          {toastMessage}
        </div>
      )}

      {/* Main 2-Col Form Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Col (7 cols) - Form Fields */}
        <div className="lg:col-span-7 space-y-6 bg-surface p-6 md:p-8 rounded-card border border-border shadow-xs">
          <h2 className="font-serif text-lg font-bold text-primary border-b border-border pb-3">
            Thông Tin Sản Phẩm
          </h2>

          {/* Name & Slug */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-text uppercase tracking-wider block mb-1.5">
                Tên tác phẩm *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={handleNameChange}
                required
                placeholder="VD: Vòng Tay Gỗ Tử Đàn Ấn Độ 14mm"
                className="w-full bg-bg border border-border rounded-btn px-3.5 py-2.5 text-sm text-text focus:outline-none focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-text uppercase tracking-wider block mb-1.5">
                  Mã SKU *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))
                  }
                  required
                  placeholder="VD: VT-001"
                  className="w-full font-mono font-semibold bg-bg border border-border rounded-btn px-3.5 py-2.5 text-sm text-text focus:outline-none focus:border-primary uppercase"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-text uppercase tracking-wider block mb-1.5">
                  Đường dẫn (Slug) *
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, slug: e.target.value }))
                  }
                  required
                  placeholder="vong-tay-go-tu-dan"
                  className="w-full font-mono text-xs bg-bg border border-border rounded-btn px-3.5 py-2.5 text-text focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Category & Wood Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-text uppercase tracking-wider block mb-1.5">
                Danh mục *
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, category: e.target.value }))
                }
                className="w-full bg-bg border border-border rounded-btn px-3.5 py-2.5 text-sm text-text focus:outline-none focus:border-primary cursor-pointer"
              >
                {categoriesData.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-text uppercase tracking-wider block mb-1.5">
                Loại gỗ quý *
              </label>
              <select
                value={formData.woodType}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, woodType: e.target.value }))
                }
                className="w-full bg-bg border border-border rounded-btn px-3.5 py-2.5 text-sm text-text focus:outline-none focus:border-primary cursor-pointer"
              >
                {woodTypesData.map((wood) => (
                  <option key={wood.name} value={wood.name}>
                    {wood.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-text uppercase tracking-wider block mb-1.5">
              Mô tả chi tiết tác phẩm
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Đặc điểm thớ vân, hương thơm, nguồn gốc phôi gỗ..."
              className="w-full bg-bg border border-border rounded-btn p-3 text-sm text-text focus:outline-none focus:border-primary leading-relaxed"
            />
          </div>

          {/* Dynamic Sizes & Prices */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-text uppercase tracking-wider">
                Kích cỡ và Báo giá
              </label>
              <button
                type="button"
                onClick={handleAddSize}
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                <Plus className="w-3.5 h-3.5" /> Thêm cỡ
              </button>
            </div>

            <div className="space-y-2.5">
              {formData.sizes.map((size, index) => {
                const isContact = size.price === null;

                return (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-2.5 rounded-lg bg-bg border border-border"
                  >
                    <input
                      type="text"
                      value={size.label}
                      onChange={(e) =>
                        handleUpdateSize(index, "label", e.target.value)
                      }
                      placeholder="Quy cách (VD: 12mm)"
                      className="w-1/3 bg-surface border border-border rounded-btn px-3 py-1.5 text-xs text-text focus:outline-none"
                    />

                    <div className="flex-1 flex items-center gap-2">
                      <input
                        type="number"
                        disabled={isContact}
                        value={size.price ?? ""}
                        onChange={(e) =>
                          handleUpdateSize(
                            index,
                            "price",
                            e.target.value ? Number(e.target.value) : null
                          )
                        }
                        placeholder={isContact ? "Liên hệ báo giá" : "Giá VNĐ"}
                        className="w-full bg-surface border border-border rounded-btn px-3 py-1.5 text-xs text-text disabled:opacity-50 focus:outline-none"
                      />

                      <label className="flex items-center gap-1 text-[11px] text-text-muted whitespace-nowrap cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isContact}
                          onChange={(e) =>
                            handleUpdateSize(
                              index,
                              "price",
                              e.target.checked ? null : 1000000
                            )
                          }
                          className="rounded text-primary focus:ring-0"
                        />
                        <span>Liên hệ</span>
                      </label>
                    </div>

                    {formData.sizes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSize(index)}
                        className="p-1 text-text-muted hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Col (5 cols) - Media & Publishing Settings */}
        <div className="lg:col-span-5 space-y-6">
          {/* Publishing Card */}
          <div className="bg-surface p-6 rounded-card border border-border shadow-xs space-y-4">
            <h3 className="font-serif text-base font-bold text-text border-b border-border pb-2">
              Trạng Thái Và Hiển Thị
            </h3>

            <div>
              <label className="text-xs font-semibold text-text-muted block mb-2">
                Trạng thái phát hành:
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    checked={formData.status === "published"}
                    onChange={() =>
                      setFormData((prev) => ({ ...prev, status: "published" }))
                    }
                    className="text-primary focus:ring-0"
                  />
                  <span>Đã đăng (Công khai)</span>
                </label>

                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    checked={formData.status === "draft"}
                    onChange={() =>
                      setFormData((prev) => ({ ...prev, status: "draft" }))
                    }
                    className="text-primary focus:ring-0"
                  />
                  <span>Bản nháp</span>
                </label>
              </div>
            </div>

            <div className="pt-2 border-t border-border/60">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, featured: e.target.checked }))
                  }
                  className="rounded text-primary focus:ring-0"
                />
                <span className="font-medium text-text">
                  Ghim nổi bật trên trang chủ ⭐
                </span>
              </label>
            </div>
          </div>

          {/* Media Uploader Card */}
          <div className="bg-surface p-6 rounded-card border border-border shadow-xs">
            <ImageUploader
              images={formData.images}
              onChange={(images) => setFormData((prev) => ({ ...prev, images }))}
            />
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="sticky bottom-4 z-30 p-4 rounded-card bg-surface/95 backdrop-blur-md border border-border shadow-xl flex items-center justify-between">
        <button
          type="button"
          onClick={handlePreview}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-btn border border-border hover:border-primary text-xs font-semibold text-text transition-colors"
        >
          <Eye className="w-4 h-4" />
          <span>Xem trước</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={isSaving}
            onClick={() => handleSave("draft")}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-btn border border-border hover:border-primary text-xs font-semibold text-text transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>Lưu nháp</span>
          </button>

          <button
            type="button"
            disabled={isSaving}
            onClick={() => handleSave("published")}
            className="inline-flex items-center gap-1.5 px-6 py-2 rounded-btn bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all shadow-sm disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang đẩy lên trang chính...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Đăng sản phẩm</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}

export default ProductForm;
