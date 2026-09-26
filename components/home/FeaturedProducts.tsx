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
    <section className="py-20 md:py-32 bg-surface select-none overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header with Scroll Reveal */}
        <ScrollReveal direction="up" delay={0}>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div className="max-w-2xl">
              <span className="text-[11px] font-medium tracking-[0.2em] text-text-muted uppercase block mb-3">
                Bộ Sưu Tập Tuyển Chọn
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-medium text-primary tracking-wide mb-4">
                Tác Phẩm Nổi Bật
              </h2>
              <p className="text-base text-text-muted font-light leading-relaxed">
                Những phôi gỗ lâu năm có vân hoa độc đáo, thớ gỗ đanh chắc và hương thơm quý phái.
              </p>
            </div>

            <Link
              href="/san-pham"
              className="inline-flex items-center gap-2 text-[13px] font-semibold tracking-wide text-primary hover:text-secondary transition-colors group flex-shrink-0 pb-1 border-b border-transparent hover:border-secondary"
            >
              <span>Xem tất cả bộ sưu tập</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5" />
            </Link>
          </div>
        </ScrollReveal>

        {/* Product Grid with Staggered Scroll Reveal */}
        <ScrollRevealGroup
          staggerDelay={70}
          direction="up"
          className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12 md:gap-x-10 md:gap-y-20"
        >
          {featured.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </ScrollRevealGroup>
      </div>
    </section>
  );
}

export default FeaturedProducts;
