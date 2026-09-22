"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import PriceDisplay from "./PriceDisplay";

export interface ProductCardProps {
  id: string;
  slug: string;
  name: string;
  code: string;
  category: string;
  woodType: string;
  images: string[];
  sizes: { label: string; price: number | null }[];
  featured?: boolean;
}

export const ProductCard = React.memo(function ProductCard({
  id,
  slug,
  name,
  code,
  category,
  woodType,
  images,
  sizes,
  featured,
}: ProductCardProps) {
  const firstPrice = sizes && sizes.length > 0 ? sizes[0].price : null;
  const imageUrl = images && images.length > 0 ? images[0] : "/images/placeholder.svg";

  return (
    <Link
      href={`/san-pham/${slug}`}
      prefetch={true}
      className="group flex flex-col bg-surface hover:-translate-y-1 transition-all duration-500 overflow-hidden relative block h-full"
    >
      {/* Product Image Container */}
      <div className="relative aspect-square w-full bg-accent-soft/30 overflow-hidden block rounded-xl border border-border/40 group-hover:border-primary/20 transition-colors duration-500">
        <Image
          src={imageUrl}
          alt={name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover object-center opacity-95 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out"
        />

        {/* Badges on Image */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {featured && (
            <span className="text-[10px] font-medium uppercase tracking-widest px-2.5 py-1 bg-black/60 text-white backdrop-blur-md rounded-sm">
              Nổi bật
            </span>
          )}
        </div>
        <div className="absolute bottom-3 left-3 z-10">
          <span className="font-mono text-[10px] font-medium px-2 py-0.5 bg-white/90 text-text shadow-sm backdrop-blur-sm rounded-sm">
            {code}
          </span>
        </div>

        {/* Subtle overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      {/* Content */}
      <div className="pt-4 pb-2 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-1 mb-1.5">
            <span className="text-[11px] uppercase tracking-wider text-text-muted font-medium block truncate">
              {woodType}
            </span>
          </div>
          <h3 className="font-serif text-base font-medium text-text group-hover:text-primary transition-colors line-clamp-2 leading-snug tracking-wide">
            {name}
          </h3>
        </div>

        {/* Price Row */}
        <div className="mt-3">
          <PriceDisplay price={firstPrice} size="sm" />
        </div>
      </div>
    </Link>
  );
});

ProductCard.displayName = "ProductCard";
export default ProductCard;
