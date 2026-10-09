"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Package,
  BookOpen,
  FileCheck,
  FileClock,
  Plus,
  ArrowRight,
} from "lucide-react";
import StatusBadge from "@/components/admin/StatusBadge";
import { useProductsStore } from "@/lib/useProducts";
import { usePostsStore } from "@/lib/usePosts";
import { formatPrice } from "@/lib/formatPrice";

export default function AdminDashboardPage() {
  const { products } = useProductsStore();
  const { posts } = usePostsStore();

  const totalProducts = products.length;
  const publishedProducts = products.filter((p) => p.status === "published").length;
  const draftProducts = products.filter((p) => p.status === "draft").length;
  const totalPosts = posts.length;

  const stats = [
    {
      label: "Tổng tác phẩm",
      value: totalProducts,
      icon: Package,
      color: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      label: "Đang phát hành",
      value: publishedProducts,
      icon: FileCheck,
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      label: "Bản nháp",
      value: draftProducts,
      icon: FileClock,
      color: "bg-amber-50 text-amber-700 border-amber-200",
    },
    {
      label: "Blog cẩm nang",
      value: totalPosts,
      icon: BookOpen,
      color: "bg-purple-50 text-purple-700 border-purple-200",
    },
  ];

  const recentProducts = products.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-primary">
            Tổng Quan Quản Trị
          </h1>
          <p className="text-xs md:text-sm text-text-muted mt-1">
            Hệ thống quản lý nội dung đồ gỗ mỹ nghệ & phong thủy Đông Phong.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/san-pham/them"
            className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-btn text-xs font-bold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm sản phẩm</span>
          </Link>

          <Link
            href="/admin/bai-viet/them"
            className="inline-flex items-center gap-1.5 bg-surface border border-border hover:border-primary text-text px-4 py-2 rounded-btn text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm blog</span>
          </Link>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((st, i) => {
          const Icon = st.icon;
          return (
            <div
              key={i}
              className="p-5 rounded-card bg-surface border border-border shadow-xs flex items-center justify-between"
            >
              <div>
                <span className="text-xs text-text-muted font-medium block mb-1">
                  {st.label}
                </span>
                <span className="font-serif text-2xl md:text-3xl font-bold text-text">
                  {st.value}
                </span>
              </div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${st.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Products Table */}
      <div className="bg-surface rounded-card border border-border shadow-xs p-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
          <h2 className="font-serif text-base font-bold text-text">
            Sản Phẩm Gần Đây
          </h2>
          <Link
            href="/admin/san-pham"
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            <span>Xem tất cả ({totalProducts})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs font-semibold text-text-muted uppercase border-b border-border">
                <th className="py-3 px-2">Ảnh</th>
                <th className="py-3 px-3">Tác phẩm</th>
                <th className="py-3 px-3">Loại gỗ</th>
                <th className="py-3 px-3">Đơn giá</th>
                <th className="py-3 px-3">Trạng thái</th>
                <th className="py-3 px-2 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {recentProducts.map((p) => {
                const firstPrice = p.sizes[0]?.price;
                return (
                  <tr key={p.id} className="hover:bg-bg/50">
                    <td className="py-2.5 px-2">
                      <div className="relative w-10 h-10 rounded overflow-hidden bg-bg border border-border">
                        <Image
                          src={p.images[0] || "/images/placeholder.jpg"}
                          alt={p.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-mono text-[10px] text-secondary font-bold block">
                        {p.code}
                      </span>
                      <span className="font-medium text-text text-xs line-clamp-1">
                        {p.name}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-xs text-text-muted">
                      {p.woodType}
                    </td>
                    <td className="py-2.5 px-3 text-xs font-semibold text-primary">
                      {formatPrice(firstPrice)}
                    </td>
                    <td className="py-2.5 px-3">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="py-2.5 px-2 text-right">
                      <Link
                        href={`/admin/san-pham/${p.id}`}
                        className="text-xs text-primary hover:underline font-semibold"
                      >
                        Sửa
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
