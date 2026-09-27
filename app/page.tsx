import HeroSection from "@/components/home/HeroSection";
import CategoryGrid from "@/components/home/CategoryGrid";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import ContactBanner from "@/components/home/ContactBanner";
import LatestArticles from "@/components/home/LatestArticles";
import { getPublishedProducts } from "@/lib/server/products";
import { getLatestPosts } from "@/lib/server/posts";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Mỹ Nghệ Đông Phong — Tuyệt Tác Đồ Gỗ Quý Mỹ Nghệ & Phong Thủy",
  description:
    "Xưởng chế tác thủ công mộc cao cấp: Vòng tay Tử Đàn, Sưa Đỏ, Nu Bách Xanh, Bút ký phong thủy & gối đệm gỗ quý. Tư vấn Zalo và hotline trực tiếp.",
};

export default async function HomePage() {
  const products = await getPublishedProducts();
  const posts = await getLatestPosts(3);

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Mỹ Nghệ Đông Phong",
    url: "https://mynghedongphong.vn",
    logo: "https://mynghedongphong.vn/images/logo.png",
    description:
      "Xưởng chế tác thủ công mộc cao cấp: Vòng tay Tử Đàn, Sưa Đỏ, Nu Bách Xanh, Bút ký phong thủy & gối đệm gỗ quý.",
    telephone: "0968888972",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+84968888972",
      contactType: "customer service",
      availableLanguage: ["Vietnamese"],
    },
    sameAs: [
      "https://www.facebook.com/phong.nk.12",
      "https://zalo.me/0968888972",
      "https://vn.shp.ee/JdnPvA3B",
    ],
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Mỹ Nghệ Đông Phong",
    url: "https://mynghedongphong.vn",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://mynghedongphong.vn/san-pham?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <main className="flex-1 flex flex-col w-full">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <HeroSection />
      <CategoryGrid products={products} />
      <FeaturedProducts products={products} totalCount={products.length} />
      <LatestArticles posts={posts} />
      <ContactBanner />
    </main>
  );
}

