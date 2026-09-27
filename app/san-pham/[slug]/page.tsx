import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetailClient from "./ProductDetailClient";
import { getAllProducts, getProductBySlug } from "@/lib/server/products";

export const dynamicParams = true;
export const revalidate = 0;

interface PageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  const products = await getAllProducts();
  return products.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    return {
      title: "Không tìm thấy tác phẩm | Mỹ Nghệ Đông Phong",
    };
  }

  const firstImage = product.images?.[0] || "/images/placeholder.svg";

  return {
    title: `${product.name} (${product.code}) | Mỹ Nghệ Đông Phong`,
    description: product.description?.slice(0, 160) || "",
    openGraph: {
      title: `${product.name} — Mỹ Nghệ Đông Phong`,
      description: product.description?.slice(0, 160) || "",
      images: [{ url: firstImage }],
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  // Tạo dữ liệu có cấu trúc Schema.org chuẩn Google Rich Results
  const prices =
    product.sizes
      ?.map((s) => s.price)
      .filter((p): p is number => typeof p === "number" && p > 0) || [];
  const minPrice = prices.length > 0 ? Math.min(...prices) : 1200000;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : minPrice;

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image:
      product.images && product.images.length > 0
        ? product.images
        : ["https://mynghedongphong.vn/images/logo.png"],
    description:
      product.description ||
      `${product.name} chế tác từ phôi ${product.woodType} tự nhiên cao cấp tại Mỹ Nghệ Đông Phong.`,
    sku: product.code,
    mpn: product.code,
    brand: {
      "@type": "Brand",
      name: "Mỹ Nghệ Đông Phong",
    },
    material: product.woodType,
    category: product.category,
    offers: {
      "@type": "AggregateOffer",
      url: `https://mynghedongphong.vn/san-pham/${product.slug}`,
      priceCurrency: "VND",
      lowPrice: minPrice,
      highPrice: maxPrice,
      offerCount: product.sizes?.length || 1,
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  return (
    <main className="flex-1 w-full">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <ProductDetailClient product={product} />
    </main>
  );
}
