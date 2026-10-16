import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import FengshuiToolClient from "./FengshuiToolClient";

export const metadata: Metadata = {
  title: "Tra Cứu Vòng Gỗ Hợp Mệnh Phong Thủy Theo Năm Sinh | Mỹ Nghệ Đông Phong",
  description:
    "Công cụ tra cứu Can Chi, Ngũ Hành Nạp Âm chuẩn xác. Khám phá các dòng linh mộc quý (Tử Đàn, Sưa Đỏ, Bách Xanh, Hoàng Đàn, Mun Sừng) tương sinh hộ mệnh vượng tài.",
  alternates: {
    canonical: "https://mynghedongphong.vn/cong-cu/tra-cuu-menh-go",
  },
  openGraph: {
    title: "Tra Cứu Vòng Gỗ Hợp Mệnh Phong Thủy Theo Năm Sinh | Mỹ Nghệ Đông Phong",
    description:
      "Giải mã Can Chi & Ngũ Hành: Khám phá loại gỗ quý tự nhiên trợ mệnh, trừ tà và chiêu tài lộc tốt nhất cho tuổi của bạn.",
    url: "https://mynghedongphong.vn/cong-cu/tra-cuu-menh-go",
    type: "website",
    images: [
      {
        url: "https://mynghedongphong.vn/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Tra Cứu Mệnh Gỗ Phong Thủy - Mỹ Nghệ Đông Phong",
      },
    ],
  },
};

export default function FengshuiToolPage() {
  // Schema WebPage & SoftwareApplication / WebApplication
  const toolSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Công Cụ Tra Cứu Mệnh Gỗ Phong Thủy",
    url: "https://mynghedongphong.vn/cong-cu/tra-cuu-menh-go",
    description:
      "Ứng dụng tra cứu ngũ hành bản mệnh theo năm sinh và gợi ý vật phẩm đồ gỗ quý phong thủy tương sinh trợ mệnh.",
    applicationCategory: "LifestyleApplication",
    operatingSystem: "All",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "VND",
    },
    author: {
      "@type": "Organization",
      name: "Mỹ Nghệ Đông Phong",
      url: "https://mynghedongphong.vn",
    },
  };

  return (
    <main className="bg-bg min-h-screen py-8 md:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(toolSchema) }}
      />

      <div className="container mx-auto px-4 md:px-6 max-w-5xl">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-[#5A4A42]">
          <Link href="/" className="hover:text-[#C5A059] transition-colors">
            Trang chủ
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#5A4A42]/60" />
          <span className="text-[#3D2314] font-semibold">Tra Cứu Mệnh Gỗ</span>
        </nav>

        {/* Client Interactive Tool */}
        <FengshuiToolClient />
      </div>
    </main>
  );
}
