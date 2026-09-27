"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProductCard from "@/components/product/ProductCard";
import ScrollReveal, { ScrollRevealGroup } from "@/components/ui/ScrollReveal";
import type { Product } from "@/lib/server/products";
import productsData from "@/data/products.json";

interface FeaturedProductsProps {
  products?: Product[];
  totalCount?: number;
}

export function FeaturedProducts({ products, totalCount }: FeaturedProductsProps) {
  // Lấy sản phẩm nổi bật từ props nếu có, fallback lọc từ file tĩnh
  const featured =
    products && products.length > 0
      ? products.filter((p) => p.featured).slice(0, 8)
      : productsData.filter((p) => p.featured).slice(0, 8);

  const displayTotal = totalCount !== undefined ? totalCount : products?.length || productsData.length;

  return (
    <section className="py-16 md:py-24 bg-surface select-none overflow-hidden">
      <div className="w-full max-w-[1320px] mx-auto px-4 md:px-8">
        {/* Section Header with Scroll Reveal */}
        <ScrollReveal direction="up" delay={0}>
          <div className="mb-10 pb-2">
            <h3 className="text-[10px] md:text-[11px] font-bold tracking-widest text-[#B32025] uppercase mb-3">
              BỘ SƯU TẬP TUYỂN CHỌN
            </h3>
            <h2 className="font-serif text-3xl md:text-4xl text-primary font-normal mb-4">
              Tác Phẩm Nổi Bật
            </h2>
            <p className="text-sm text-text-muted max-w-3xl">
              Những phôi gỗ lâu năm có vân hoa độc đáo, thớ gỗ đanh chắc và hương thơm quý phái được chế tác thủ công tinh xảo.
            </p>
          </div>
        </ScrollReveal>

        {/* Product Grid with Staggered Scroll Reveal */}
        <ScrollRevealGroup
          staggerDelay={70}
          direction="up"
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 gap-y-12"
        >
          {featured.map((product) => (
            <div key={product.id} className="h-full">
              <ProductCard {...product} />
            </div>
          ))}
        </ScrollRevealGroup>

        {/* View all link */}
        <ScrollReveal direction="up" delay={200}>
          <div className="mt-14 border-t border-border/40 pt-6">
            <Link
              href="/san-pham"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#B32025] hover:text-[#8a181c] transition-colors"
            >
              <span>Xem tất cả bộ sưu tập</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

export default FeaturedProducts;
