import SearchClient from "./SearchClient";
import { getPublishedProducts } from "@/lib/server/products";
import { getPublishedPosts } from "@/lib/server/posts";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Tìm Kiếm Sản Phẩm Và Bài Viết | Mỹ Nghệ Đông Phong",
  description: "Tra cứu nhanh các sản phẩm vòng tay gỗ quý, bút ký, gối đệm và kiến thức đồ gỗ tại Mỹ Nghệ Đông Phong.",
};

interface SearchPageProps {
  searchParams?: {
    q?: string;
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const [products, posts] = await Promise.all([
    getPublishedProducts(),
    getPublishedPosts(),
  ]);

  return (
    <main className="flex-1 w-full bg-bg">
      <SearchClient
        initialQuery={searchParams?.q || ""}
        initialProducts={products}
        initialPosts={posts}
      />
    </main>
  );
}

