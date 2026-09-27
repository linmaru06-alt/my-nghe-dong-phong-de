"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, LayoutGrid } from "lucide-react";
// TODO: replace with clean product photo — current asset looks like a UI screenshot
// All category images in categories.json are AI-generated (aida-public) placeholders.
// Replace each category's "image" field with real photography of the actual products.
import categoriesData from "@/data/categories.json";
import productsData from "@/data/products.json";
import ScrollReveal, { ScrollRevealGroup } from "@/components/ui/ScrollReveal";

import type { Product } from "@/lib/server/products";

export interface CategoryGridProps {
  products?: Product[];
}

export function CategoryGrid({ products }: CategoryGridProps) {
  const productsList = products || productsData;
  const getCount = (catId: string) => {
    return productsList.filter((p) => p.category === catId && p.status !== "draft").length;
  };

  return (
    <>
      {/* ─── MOBILE VIEW (Stitch Screen 11: Mobile 1B - Danh mục chế tác) ─── */}
      <section className="block md:hidden px-4 py-6 select-none border-b border-border/40">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-serif text-lg font-bold text-primary">Danh mục chế tác</h2>
            <p className="text-xs text-text-muted">Tuyển chọn nghệ phẩm thủ công</p>
          </div>
          <Link
            href="/san-pham"
            className="inline-flex items-center gap-0.5 text-xs font-semibold text-secondary hover:text-primary transition-colors"
          >
            <span>Xem tất cả</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Chips Carousel */}
        <div className="flex items-start gap-3.5 overflow-x-auto pb-2 pt-1 scrollbar-none -mx-4 px-4">
          {/* Item: Tất cả */}
          <Link
            href="/san-pham"
            className="flex flex-col items-center gap-1 shrink-0 group"
          >
            <div className="w-16 h-16 rounded-full border-2 border-[#C5A059]/60 p-[2px] shrink-0 group-active:scale-95 transition-transform">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-primary to-[#5C3A21] flex items-center justify-center shadow-inner">
                <LayoutGrid className="w-6 h-6 text-[#E8BF87]" />
              </div>
            </div>
            <span className="text-[12px] font-medium tracking-wide text-primary mt-1">Tất cả</span>
          </Link>

          {/* Dynamic Categories */}
          {categoriesData.map((cat) => (
            <Link
              key={cat.id}
              href={`/san-pham?category=${cat.id}`}
              className="flex flex-col items-center gap-1 shrink-0 group"
            >
              <div className="w-16 h-16 rounded-full border border-border/80 p-[2px] shrink-0 group-active:scale-95 transition-transform">
                <div className="w-full h-full rounded-full overflow-hidden relative bg-[#f5efe6]">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
              </div>
              <span className="text-[11px] font-medium tracking-wide text-text-muted max-w-[72px] text-center leading-snug mt-1">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── DESKTOP VIEW (Stitch Screen 15: Desktop 1 - 4-Column Grid) ─── */}
      <section id="danh-muc" className="hidden md:block w-full max-w-[1320px] mx-auto px-4 md:px-8 py-16 md:py-24 select-none overflow-hidden">
        {/* Section Header with Scroll Reveal */}
        <ScrollReveal direction="up" delay={0}>
          <div className="mb-10 pb-2">
            <h3 className="text-[10px] md:text-[11px] font-bold tracking-widest text-[#B32025] uppercase mb-3">
              MỸ NGHỆ ĐÔNG PHONG
            </h3>
            <h2 className="font-serif text-3xl md:text-4xl text-primary font-normal mb-4">
              Danh Mục Sản Phẩm
            </h2>
            <p className="text-sm text-text-muted">
              Khám phá các tuyệt tác đồ gỗ mỹ nghệ phong thủy và chế tác gia dụng cao cấp từ gỗ tự nhiên lâu năm.
            </p>
          </div>
        </ScrollReveal>

        {/* Grid: 4 cols on desktop with Staggered Scroll Reveal */}
        <ScrollRevealGroup
          staggerDelay={60}
          direction="up"
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 gap-y-12"
        >
          {categoriesData.map((cat) => {
            const count = getCount(cat.id);

            return (
              <div key={cat.id} className="h-full">
                <Link
                  href={`/san-pham?category=${cat.id}`}
                  className="group flex flex-col h-full w-full"
                >
                  {/* Image */}
                  <div className="relative w-full aspect-square overflow-hidden mb-4 bg-[#f5efe6]">
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      sizes="(max-width: 1024px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                  </div>
                  
                  {/* Content */}
                  <div className="flex flex-col">
                    <h3 className="font-serif text-lg md:text-xl text-primary group-hover:text-[#B32025] transition-colors">
                      {cat.name}
                    </h3>
                    
                    <div className="mt-2.5 mb-1.5 flex items-center">
                      <span className="inline-block bg-[#3D2314] text-[#E8BF87] text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-[1px] uppercase">
                        {count > 0 ? "CÓ SẴN" : "LIÊN HỆ"}
                      </span>
                    </div>
                    
                    <p className="text-[12px] text-primary mt-1 font-medium">
                      Mỹ Nghệ Đông Phong
                    </p>
                    <p className="text-[11px] text-text-muted mt-0.5 line-clamp-1">
                      {count} sản phẩm &middot; {cat.description}
                    </p>
                  </div>
                </Link>
              </div>
            );
          })}
        </ScrollRevealGroup>

        {/* View all link */}
        <ScrollReveal direction="up" delay={200}>
          <div className="mt-14 border-t border-border/40 pt-6">
            <Link
              href="/san-pham"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#B32025] hover:text-[#8a181c] transition-colors"
            >
              <span>Xem tất cả danh mục</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}

export default CategoryGrid;
