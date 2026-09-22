"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, LayoutGrid } from "lucide-react";
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
          <div className="text-center max-w-xl mx-auto mb-12 md:mb-16">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary">
              Danh Mục Sản Phẩm
            </h2>
            <div className="w-16 h-0.5 mx-auto mt-2.5 mb-3 bg-secondary" />
            <p className="text-sm md:text-base text-text-muted leading-relaxed">
              Khám phá các tuyệt tác đồ gỗ mỹ nghệ phong thủy và chế tác gia dụng cao cấp từ gỗ tự nhiên lâu năm.
            </p>
          </div>
        </ScrollReveal>

        {/* Grid: 4 cols on desktop with Staggered Scroll Reveal */}
        <ScrollRevealGroup
          staggerDelay={60}
          direction="up"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
        >
          {categoriesData.map((cat) => {
            const count = getCount(cat.id);

            return (
              <div key={cat.id} className="h-full">
                <Link
                  href={`/san-pham?category=${cat.id}`}
                  className="group flex flex-col relative rounded-xl overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 h-full w-full"
                >
                  {/* Image Background */}
                  <div className="absolute inset-0 z-0 bg-[#2C1A0E]">
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      sizes="(max-width: 1024px) 50vw, 25vw"
                      className="object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                  </div>
                  
                  {/* Gradient Overlay for Text */}
                  <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-500" />
                  
                  {/* Content Overlay */}
                  <div className="relative z-20 flex flex-col justify-end p-5 md:p-6 h-full aspect-[4/5]">
                    <h3 className="font-serif text-xl md:text-2xl text-white font-medium tracking-wide drop-shadow-md group-hover:text-[#E8BF87] transition-colors duration-300">
                      {cat.name}
                    </h3>
                    
                    {/* The description and link are hidden by default, and reveal on hover using max-height or opacity */}
                    <div className="overflow-hidden max-h-0 opacity-0 group-hover:max-h-[100px] group-hover:opacity-100 group-hover:mt-2 transition-all duration-500 ease-in-out">
                      <p className="text-sm text-white/90 line-clamp-2">
                        {cat.description}
                      </p>
                      <span className="inline-flex items-center gap-1.5 text-xs text-[#E8BF87] font-semibold mt-3">
                        <span>Khám phá {count} tác phẩm</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}

          {/* 8th Card: View All */}
          <div className="h-full">
            <Link
              href="/san-pham"
              className="group flex flex-col items-center justify-center p-6 rounded-xl text-center border border-secondary/30 bg-surface/50 hover:bg-primary hover:border-primary hover:-translate-y-1 transition-all duration-500 h-full aspect-[4/5] shadow-sm hover:shadow-xl"
            >
              <span className="w-16 h-16 rounded-full bg-bg flex items-center justify-center text-primary shadow-sm group-hover:scale-110 group-hover:bg-white/10 group-hover:text-white transition-all duration-500 mb-4">
                <LayoutGrid className="w-7 h-7" />
              </span>
              <h3 className="font-serif text-xl text-primary group-hover:text-white font-medium tracking-wide transition-colors">
                Xem Tất Cả<br />Danh Mục
              </h3>
              <p className="text-xs text-text-muted group-hover:text-white/80 mt-2 max-w-[200px] transition-colors">
                Hơn {productsData.length} tác phẩm và mẫu quà tặng
              </p>
              <span className="inline-flex items-center gap-1.5 text-xs text-secondary group-hover:text-[#E8BF87] font-semibold mt-5 transition-colors">
                <span>Khám phá ngay</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </div>
        </ScrollRevealGroup>
      </section>
    </>
  );
}

export default CategoryGrid;
