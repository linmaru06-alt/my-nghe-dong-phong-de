"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Package, BookOpen, MessageCircle, Tag } from "lucide-react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import ProductGrid from "@/components/product/ProductGrid";
import BlogGrid from "@/components/blog/BlogGrid";
import productsData from "@/data/products.json";
import postsData from "@/data/posts.json";
import categoriesData from "@/data/categories.json";
import settingsData from "@/data/settings.json";
import { POPULAR_HASHTAGS } from "@/lib/utils/tags";

import type { Product } from "@/lib/server/products";
import type { Post } from "@/lib/server/posts";

export interface SearchClientProps {
  initialQuery?: string;
  initialProducts?: Product[];
  initialPosts?: Post[];
}

function removeVietnameseTones(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

export default function SearchClient({
  initialQuery = "",
  initialProducts,
  initialPosts,
}: SearchClientProps) {
  const router = useRouter();
  const q = initialQuery;
  const [searchInput, setSearchInput] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<"products" | "posts">("products");

  const productsList = initialProducts || productsData;
  const postsList: Post[] = initialPosts || (postsData as unknown as Post[]);

  useEffect(() => {
    setSearchInput(initialQuery);
  }, [initialQuery]);

  const trimmed = (initialQuery || searchInput).trim();
  const normQuery = useMemo(() => removeVietnameseTones(trimmed), [trimmed]);

  // Search logic
  const matchedProducts = useMemo(() => {
    if (!normQuery) return [];
    return productsList.filter(
      (p) =>
        p.status === "published" &&
        (removeVietnameseTones(p.name).includes(normQuery) ||
          removeVietnameseTones(p.code).includes(normQuery) ||
          removeVietnameseTones(p.woodType).includes(normQuery) ||
          removeVietnameseTones(p.description || "").includes(normQuery))
    );
  }, [normQuery, productsList]);

  const matchedPosts = useMemo(() => {
    if (!normQuery) return [];
    return postsList.filter(
      (p) =>
        p.status === "published" &&
        (removeVietnameseTones(p.title).includes(normQuery) ||
          removeVietnameseTones(p.excerpt || "").includes(normQuery) ||
          (p.tags && p.tags.some((t: string) => removeVietnameseTones(t).includes(normQuery))) ||
          removeVietnameseTones((p.content || "").slice(0, 2000)).includes(normQuery))
    );
  }, [normQuery, postsList]);

  // Tự động chuyển tab thông minh nếu chỉ có kết quả ở 1 bên
  useEffect(() => {
    if (matchedProducts.length === 0 && matchedPosts.length > 0) {
      setActiveTab("posts");
    } else if (matchedProducts.length > 0 && matchedPosts.length === 0) {
      setActiveTab("products");
    }
  }, [matchedProducts.length, matchedPosts.length]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      router.push(`/tim-kiem?q=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
      <Breadcrumb items={[{ label: "Tìm kiếm" }]} />

      {/* Header & Search Bar */}
      <div className="max-w-3xl mb-10">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-4">
          Kết Quả Tìm Kiếm
        </h1>
        {q ? (
          <p className="text-sm text-text-muted mb-6">
            Tìm thấy{" "}
            <strong className="text-primary font-bold">
              {matchedProducts.length + matchedPosts.length}
            </strong>{" "}
            kết quả phù hợp cho từ khóa &quot;<span className="text-primary font-semibold">{q}</span>&quot;
          </p>
        ) : (
          <p className="text-sm text-text-muted mb-6">
            Nhập tên tác phẩm, mã sản phẩm hoặc loại gỗ để tra cứu nhanh.
          </p>
        )}

        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Nhập tên vòng tay, bút ký, loại gỗ (Tử Đàn, Sưa, Hoàng Đàn, Bách Xanh...)..."
            className="w-full bg-surface border border-border rounded-btn pl-11 pr-24 py-3 text-base text-text focus:outline-none focus:border-primary shadow-sm"
          />
          <Search className="w-5 h-5 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-4 py-2 rounded-btn transition-colors"
          >
            Tìm kiếm
          </button>
        </form>

        {/* Chủ đề & Hashtag phổ biến */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-2">
          <span className="text-xs text-[#5A4A42] font-semibold flex items-center gap-1">
            <Tag className="w-3.5 h-3.5 text-[#C5A059]" />
            Hashtags phổ biến:
          </span>
          {POPULAR_HASHTAGS.map((item) => (
            <Link
              key={item.name}
              href={`/tim-kiem?q=${encodeURIComponent(item.query)}`}
              className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#FAF6F0] text-[#3D2314] border border-[#E8DFC8] hover:bg-[#C5A059] hover:text-white hover:border-[#C5A059] transition-all duration-200 shadow-2xs"
            >
              #{item.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Tabs Filter */}
      {q && (
        <div className="flex items-center gap-4 border-b border-border mb-8 select-none">
          <button
            type="button"
            onClick={() => setActiveTab("products")}
            className={`flex items-center gap-2 py-3 px-2 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === "products"
                ? "border-primary text-primary"
                : "border-transparent text-text-muted hover:text-text"
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Sản phẩm ({matchedProducts.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("posts")}
            className={`flex items-center gap-2 py-3 px-2 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === "posts"
                ? "border-primary text-primary"
                : "border-transparent text-text-muted hover:text-text"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Bài viết cẩm nang ({matchedPosts.length})</span>
          </button>
        </div>
      )}

      {/* Results Content */}
      {q ? (
        activeTab === "products" ? (
          matchedProducts.length > 0 ? (
            <ProductGrid products={matchedProducts} />
          ) : (
            <div className="text-center py-16 bg-surface rounded-card border border-border p-8">
              <Package className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-50" />
              <h3 className="font-serif text-lg font-bold text-text mb-2">
                Không tìm thấy sản phẩm phù hợp
              </h3>
              <p className="text-sm text-text-muted max-w-md mx-auto mb-6">
                Bạn có thể thử tìm với tên ngắn hơn, hoặc chọn trực tiếp theo danh mục bên dưới:
              </p>
              <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
                {categoriesData.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/san-pham?category=${cat.id}`}
                    className="px-4 py-2 rounded-pill text-xs bg-bg border border-border hover:border-primary hover:text-primary transition-colors font-medium inline-block"
                  >
                    <span>{cat.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          )
        ) : matchedPosts.length > 0 ? (
          <BlogGrid posts={matchedPosts} />
        ) : (
          <div className="text-center py-16 bg-surface rounded-card border border-border p-8">
            <BookOpen className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-50" />
            <h3 className="font-serif text-lg font-bold text-text mb-2">
              Không có bài viết phù hợp
            </h3>
            <p className="text-sm text-text-muted">
              Xem tất cả bài viết kiến thức tại chuyên mục Cẩm Nang.
            </p>
            <Link
              href="/bai-viet"
              className="inline-block mt-4 text-xs font-bold text-primary hover:underline"
            >
              Xem danh sách bài viết →
            </Link>
          </div>
        )
      ) : (
        /* Empty Query State: Suggestions */
        <div className="py-12 text-center max-w-xl mx-auto">
          <p className="text-sm text-text-muted mb-4 font-medium">Gợi ý danh mục chế tác:</p>
          <div className="flex flex-wrap justify-center gap-2.5 mb-8">
            {categoriesData.map((cat) => (
              <Link
                key={cat.id}
                href={`/san-pham?category=${cat.id}`}
                className="px-4 py-2 rounded-pill text-xs font-semibold bg-surface border border-border hover:border-primary hover:text-primary transition-all shadow-xs inline-block"
              >
                <span>{cat.name}</span>
              </Link>
            ))}
          </div>

          <div className="p-6 rounded-card bg-accent-soft/40 border border-border text-center">
            <p className="text-sm font-serif font-bold text-primary mb-2">
              Không tìm thấy sản phẩm bạn cần?
            </p>
            <p className="text-xs text-text-muted mb-4">
              Nghệ nhân Đông Phong nhận chế tác vòng tay và đồ mộc riêng theo kích cỡ yêu cầu.
            </p>
            <a
              href={settingsData.brand.zaloLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-pill bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Gửi Mẫu Qua Zalo</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
