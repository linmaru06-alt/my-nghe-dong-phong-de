"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MessageCircle, Phone, Sparkles, Maximize2, Copy } from "lucide-react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Badge from "@/components/ui/Badge";
import PriceDisplay from "@/components/product/PriceDisplay";
import SizeSelector from "@/components/product/SizeSelector";
import ContactCTA from "@/components/product/ContactCTA";
import Accordion from "@/components/ui/Accordion";
import ImageLightbox from "@/components/ui/ImageLightbox";
import ProductCard from "@/components/product/ProductCard";
import productsData from "@/data/products.json";
import categoriesData from "@/data/categories.json";
import settingsData from "@/data/settings.json";
import { createZaloLink } from "@/lib/formatPrice";
import { toast } from "@/components/ui/Toast";

export interface ProductDetailClientProps {
  product?: any;
  slug?: string;
}

export default function ProductDetailClient({ product: propProduct, slug }: ProductDetailClientProps) {
  // Use passed product or search safely by slug
  const product =
    propProduct ||
    (slug
      ? productsData.find(
          (p) =>
            p.slug.toLowerCase() === decodeURIComponent(slug).trim().toLowerCase() ||
            p.id.toLowerCase() === decodeURIComponent(slug).trim().toLowerCase()
        )
      : null);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-serif font-bold text-primary mb-2">
          Không tìm thấy tác phẩm yêu cầu
        </h2>
        <p className="text-xs text-text-muted mb-6">
          Tác phẩm này có thể đã được cập nhật đường dẫn hoặc chuyển danh mục.
        </p>
        <Link
          href="/san-pham"
          className="px-6 py-2.5 rounded-btn bg-primary text-white text-xs font-bold shadow-sm hover:bg-primary-hover transition-colors"
        >
          Xem danh mục sản phẩm
        </Link>
      </div>
    );
  }

  // Safe images list
  const productImages =
    product.images && product.images.length > 0
      ? product.images
      : ["/images/placeholder.svg"];

  // Category name
  const categoryInfo = categoriesData.find((c) => c.id === product.category);

  // Active size price
  const productSizes = product.sizes || [];
  const activeSize = productSizes[selectedSizeIndex] || productSizes[0];
  const activePrice = activeSize?.price ?? null;

  // Images formatted for Lightbox
  const lightboxImages = productImages.map((img: string) => ({
    url: img,
    alt: `${product.name} - ${product.woodType}`,
  }));

  // Related products (same category, excluding current)
  const relatedProducts = productsData
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const accordionItems = [
    {
      id: "mo-ta",
      title: "Mô Tả Và Đặc Tính Gỗ",
      defaultOpen: true,
      content: (
        <div className="space-y-3">
          <p>{product.description}</p>
          <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
            <div className="p-2.5 rounded bg-bg border border-border/60">
              <span className="text-text-muted block">Loại danh mộc:</span>
              <span className="font-semibold text-text">{product.woodType}</span>
            </div>
            <div className="p-2.5 rounded bg-bg border border-border/60">
              <span className="text-text-muted block">Mã sản phẩm:</span>
              <span className="font-mono font-bold text-primary">{product.code}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "bao-quan",
      title: "Hướng Dẫn Bảo Quản Vân Gỗ",
      defaultOpen: false,
      content: (
        <p>
          {product.preservation ||
            "Tránh tiếp xúc trực tiếp với hóa chất tẩy rửa mạnh hoặc ngâm nước lâu. Đeo hoặc dùng thường xuyên để tinh dầu gỗ tự nhiên tiết ra, giúp thớ gỗ càng lên nước bóng mịn sẫm màu."}
        </p>
      ),
    },
    {
      id: "giao-hang",
      title: "Chính Sách Giao Nhận Và Đổi Trả",
      defaultOpen: false,
      content: (
        <ul className="list-disc list-inside space-y-1 text-xs leading-relaxed">
          <li>Quý khách được mở hộp kiểm tra đúng vân mộc trước khi thanh toán.</li>
          <li>Đổi mới trong 7 ngày nếu có lỗi rạn nứt tự nhiên từ thớ gỗ phôi.</li>
          <li>Tặng kèm hộp gấm sang trọng và dây xâu dự phòng (đối với vòng tay).</li>
        </ul>
      ),
    },
  ];

  const zaloUrl = createZaloLink(
    settingsData.brand.zaloLink,
    product.code,
    `${product.name} (${activeSize?.label || ""})`
  );

  const handleCopySku = () => {
    try {
      navigator.clipboard.writeText(product.code);
      toast.success(
        `Đã sao chép mã SKU: ${product.code}`,
        "Gửi mã này qua Zalo để nghệ nhân Đông Phong báo giá và quay video trực tiếp."
      );
    } catch {
      toast.info(`Mã sản phẩm: ${product.code}`);
    }
  };

  return (
    <div className="bg-bg min-h-screen py-8 md:py-12">
      <div className="container mx-auto px-4 md:px-6">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Sản phẩm", href: "/san-pham" },
            {
              label: categoryInfo?.name || "Danh mục",
              href: `/san-pham?category=${product.category}`,
            },
            { label: product.name },
          ]}
        />

        {/* Product Main Section (2 Cols Desktop) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 mt-6">
          {/* Left Column: Image Gallery (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Main Big Image */}
            <div
              onClick={() => setIsLightboxOpen(true)}
              className="relative aspect-square w-full rounded-card overflow-hidden bg-accent-soft/30 border border-border shadow-sm cursor-zoom-in group"
            >
              <Image
                src={productImages[selectedImageIndex] || "/images/placeholder.svg"}
                alt={product.name}
                fill
                priority
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 55vw"
              />
              <button
                type="button"
                className="absolute bottom-3 right-3 p-2 rounded-full bg-text/75 text-white backdrop-blur-xs opacity-80 group-hover:opacity-100 transition-opacity"
                aria-label="Phóng to ảnh"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              <div className="absolute top-3 left-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopySku();
                  }}
                  title="Bấm để sao chép mã sản phẩm"
                  className="font-mono text-xs font-bold px-2.5 py-1 rounded-pill bg-[#1F1610]/85 text-white backdrop-blur-xs flex items-center gap-1.5 hover:bg-[#3D2314] border border-white/20 transition shadow-sm active:scale-95"
                >
                  <span>{product.code}</span>
                  <Copy className="w-3 h-3 text-[#C5A059]" />
                </button>
              </div>
            </div>

            {/* Thumbnail Carousel */}
            {productImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none select-none">
                {productImages.map((img: string, index: number) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                      selectedImageIndex === index
                        ? "border-primary shadow-sm scale-105"
                        : "border-border opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} thumb ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Details & Actions (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Category & SKU Badges */}
              <div className="flex items-center gap-2">
                <Badge variant="wood">{product.woodType}</Badge>
                {categoryInfo && (
                  <Badge variant="category">
                    {categoryInfo.name}
                  </Badge>
                )}
              </div>

              {/* Title */}
              <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-primary leading-tight">
                {product.name}
              </h1>

              {/* Price Display */}
              <div className="p-4 rounded-card bg-surface border border-border/70 flex items-center justify-between">
                <div>
                  <span className="text-xs text-text-muted block">Thời giá thỉnh tác phẩm:</span>
                  <PriceDisplay price={activePrice} size="lg" />
                </div>
                <span className="text-xs text-secondary font-medium flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Gỗ quý tự nhiên
                </span>
              </div>

              {/* Size Selector */}
              <SizeSelector
                sizes={product.sizes}
                selectedIndex={selectedSizeIndex}
                onSelectSize={setSelectedSizeIndex}
              />

              {/* Main CTA Block */}
              <div>
                <ContactCTA
                  productCode={product.code}
                  productName={product.name}
                  selectedSize={activeSize?.label}
                />
              </div>

              {/* Accordions */}
              <div className="pt-4 border-t border-border">
                <Accordion items={accordionItems} />
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 md:mt-24 pt-12 border-t border-border select-none">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-secondary block">
                  Cùng Danh Mục
                </span>
                <h2 className="text-2xl font-serif font-bold text-primary">
                  Tác Phẩm Liên Quan
                </h2>
              </div>
              <Link
                href={`/san-pham?category=${product.category}`}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Xem tất cả →
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((rp) => (
                <ProductCard key={rp.id} {...rp} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Image Lightbox Modal */}
      <ImageLightbox
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        images={lightboxImages}
        initialIndex={selectedImageIndex}
      />

      {/* ─── MOBILE STICKY CONTACT UTILITY BAR (Stitch Screen 13: Mobile 4 - Chi Tiết Sản Phẩm App) ─── */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-surface/95 backdrop-blur-xl border-t border-border shadow-[0_-4px_20px_rgba(107,63,31,0.12)] px-4 py-2.5 pb-safe flex flex-col gap-1.5">
        <div className="flex items-center justify-between px-0.5 text-[11px]">
          <button
            type="button"
            onClick={handleCopySku}
            className="font-mono text-[#C5A059] font-bold inline-flex items-center gap-1 hover:underline active:scale-95"
            title="Bấm để sao chép mã sản phẩm"
          >
            <span>Mã SP: {product.code}</span>
            <Copy className="w-3 h-3 text-[#C5A059]" />
          </button>
          <span className="inline-flex items-center gap-1 text-[#005620] font-semibold shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3EE26C] animate-pulse" />
            Sẵn sàng quay video trực tiếp
          </span>
        </div>

        {/* Dual Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Direct Zalo Inquiry (Flex 3) */}
          <a
            href={zaloUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-[3] h-11 rounded-btn bg-[#06C755] hover:bg-[#05a847] active:scale-[0.98] text-white flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(6,199,85,0.3)] transition-all font-bold text-xs"
          >
            <MessageCircle className="w-4 h-4 fill-white text-zalo" />
            <span>Nhắn Zalo Soi Vân Video</span>
          </a>

          {/* Direct Phone Hotline (Flex 2) */}
          <a
            href={`tel:${settingsData.brand.phone.replace(/\s+/g, "")}`}
            className="flex-[2] h-11 rounded-btn bg-surface border border-border hover:border-primary active:scale-[0.98] text-primary flex items-center justify-center gap-1.5 shadow-xs transition-all font-bold text-xs"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>{settingsData.brand.phone}</span>
          </a>
        </div>
      </div>
    </div>
  );
}
