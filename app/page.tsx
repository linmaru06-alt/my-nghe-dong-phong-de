import HeroSection from "@/components/home/HeroSection";
import CategoryGrid from "@/components/home/CategoryGrid";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import ContactBanner from "@/components/home/ContactBanner";
import { getPublishedProducts } from "@/lib/server/products";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Mỹ Nghệ Đông Phong — Tuyệt Tác Đồ Gỗ Quý Mỹ Nghệ & Phong Thủy",
  description:
    "Xưởng chế tác thủ công mộc cao cấp: Vòng tay Tử Đàn, Sưa Đỏ, Nu Bách Xanh, Bút ký phong thủy & gối đệm gỗ quý. Tư vấn Zalo và hotline trực tiếp.",
};

export default async function HomePage() {
  const products = await getPublishedProducts();

  return (
    <main className="flex-1 flex flex-col w-full">
      <HeroSection />
      <CategoryGrid products={products} />
      <FeaturedProducts products={products} totalCount={products.length} />

      <ContactBanner />
    </main>
  );
}

