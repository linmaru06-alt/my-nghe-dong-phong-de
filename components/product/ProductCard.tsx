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
  slug,
  name,
  code,
  woodType,
  images,
  sizes,
}: ProductCardProps) {
  const firstPrice = sizes && sizes.length > 0 ? sizes[0].price : null;
  // TODO: replace with clean product photo — current asset looks like a UI screenshot
  // Most product images in products.json are AI-generated (aida-public) placeholders.
  // Many URLs are reused across different products. Replace with real product photography.
  const imageUrl = images && images.length > 0 ? images[0] : "/images/placeholder.svg";

  return (
    <Link
      href={`/san-pham/${slug}`}
      prefetch={true}
      className="group flex flex-col h-full w-full"
    >
      {/* Product Image Container */}
      <div className="relative w-full aspect-square overflow-hidden mb-4 bg-[#f5efe6]">
        <Image
          src={imageUrl}
          alt={name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
        />
      </div>

      {/* Content */}
      <div className="flex flex-col">
        <h3 className="font-serif text-lg md:text-xl text-primary group-hover:text-[#B32025] transition-colors line-clamp-2">
          {name}
        </h3>
        
        <div className="mt-2.5 mb-1.5 flex items-center">
          <span className="inline-block bg-[#3D2314] text-[#E8BF87] text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-[1px] uppercase">
            {firstPrice ? "CÓ SẴN" : "LIÊN HỆ"}
          </span>
        </div>
        
        <p className="text-[12px] text-primary mt-1 font-medium">
          Mỹ Nghệ Đông Phong
        </p>
        <div className="text-[11px] text-text-muted mt-0.5 flex flex-wrap items-center gap-1">
          <span>{code}</span>
          <span>&middot;</span>
          <span>{woodType}</span>
          {firstPrice ? (
            <>
              <span>&middot;</span>
              <PriceDisplay price={firstPrice} size="sm" className="font-semibold text-primary" />
            </>
          ) : null}
        </div>
      </div>
    </Link>
  );
});

ProductCard.displayName = "ProductCard";
export default ProductCard;
