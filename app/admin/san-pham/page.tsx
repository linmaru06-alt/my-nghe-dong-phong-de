"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Search, Edit2, Trash2, Star, Eye } from "lucide-react";
import StatusBadge from "@/components/admin/StatusBadge";
import Pagination from "@/components/ui/Pagination";
import { useProductsStore } from "@/lib/useProducts";
import categoriesData from "@/data/categories.json";
import { formatPrice } from "@/lib/formatPrice";
import { toast } from "@/components/ui/Toast";

const ITEMS_PER_PAGE = 10;

export default function AdminProductsPage() {
  const { products, deleteProduct, toggleFeatured, loadProducts } = useProductsStore();

  React.useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Filter products
  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (selectedCategory && p.category !== selectedCategory) return false;
      if (selectedStatus && p.status !== selectedStatus) return false;
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        return (
          p.name.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q) ||
          p.woodType.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [products, selectedCategory, selectedStatus, search]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa tác phẩm "${name}"?`)) {
      deleteProduct(id);
      toast.success(`Đã xóa "${name}"`, "Dữ liệu đã được cập nhật vào data/products.json");
    }
  };

  const handleToggleFeatured = (id: string, name: string, currentFeatured: boolean) => {
    toggleFeatured(id);
    toast.info(
      currentFeatured ? `Đã bỏ ghim nổi bật "${name}"` : `★ Đã ghim "${name}" lên trang chủ!`,
      "Đã đồng bộ vào data/products.json"
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-primary">
            Quản Lý Sản Phẩm
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Tổng số: {products.length} tác phẩm đồ gỗ quý.
          </p>
        </div>

        <Link
          href="/admin/san-pham/them"
          className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-btn text-xs font-bold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm sản phẩm mới</span>
        </Link>
      </div>

      {/* Toolbar Filters */}
      <div className="bg-surface p-4 rounded-card border border-border flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Tìm theo tên, mã SKU..."
            className="w-full bg-bg border border-border rounded-btn pl-9 pr-3 py-1.5 text-xs text-text focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-bg border border-border rounded-btn px-3 py-1.5 text-xs text-text focus:outline-none cursor-pointer"
          >
            <option value="">Tất cả danh mục</option>
            {categoriesData.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-bg border border-border rounded-btn px-3 py-1.5 text-xs text-text focus:outline-none cursor-pointer"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="published">Đã đăng</option>
            <option value="draft">Bản nháp</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-surface rounded-card border border-border overflow-x-auto shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-border bg-bg text-text-muted uppercase font-semibold">
              <th className="py-3 px-3">Ảnh</th>
              <th className="py-3 px-3">Tác phẩm và Mã</th>
              <th className="py-3 px-3">Danh mục</th>
              <th className="py-3 px-3">Loại gỗ</th>
              <th className="py-3 px-3">Đơn giá</th>
              <th className="py-3 px-3 text-center">Nổi bật</th>
              <th className="py-3 px-3">Trạng thái</th>
              <th className="py-3 px-3 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {paginated.map((product) => {
              const firstPrice = product.sizes[0]?.price;

              return (
                <tr key={product.id} className="hover:bg-bg/50 transition-colors">
                  <td className="py-2.5 px-3">
                    <div className="relative w-12 h-12 rounded overflow-hidden bg-bg border border-border flex-shrink-0">
                      <Image
                        src={product.images[0] || "/images/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </td>

                  <td className="py-2.5 px-3 max-w-[200px]">
                    <span className="font-mono text-[10px] text-secondary font-bold block">
                      {product.code}
                    </span>
                    <span className="font-bold text-text line-clamp-1">
                      {product.name}
                    </span>
                  </td>

                  <td className="py-2.5 px-3 capitalize text-text-muted">
                    {product.category.replace(/-/g, " ")}
                  </td>

                  <td className="py-2.5 px-3 text-text-muted">
                    {product.woodType}
                  </td>

                  <td className="py-2.5 px-3 font-semibold text-primary">
                    {formatPrice(firstPrice)}
                  </td>

                  {/* Featured Toggle */}
                  <td className="py-2.5 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleToggleFeatured(product.id, product.name, product.featured)}
                      title={product.featured ? "Bỏ ghim nổi bật" : "Ghim lên trang chủ"}
                      className={`p-1.5 rounded-full transition-colors ${
                        product.featured
                          ? "bg-amber-100 text-amber-600"
                          : "text-border hover:text-amber-500"
                      }`}
                    >
                      <Star className={`w-4 h-4 ${product.featured ? "fill-current" : ""}`} />
                    </button>
                  </td>

                  <td className="py-2.5 px-3">
                    <StatusBadge status={product.status} />
                  </td>

                  <td className="py-2.5 px-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      <Link
                        href={`/san-pham/${product.slug}`}
                        target="_blank"
                        title="Xem trang sản phẩm"
                        className="p-1 rounded text-text-muted hover:text-primary transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>

                      <Link
                        href={`/admin/san-pham/${product.id}`}
                        title="Chỉnh sửa"
                        className="p-1 rounded text-text-muted hover:text-blue-600 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleDelete(product.id, product.name)}
                        title="Xóa tác phẩm"
                        className="p-1 rounded text-text-muted hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        scrollToTop={false}
      />
    </div>
  );
}
