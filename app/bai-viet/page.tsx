import type { Metadata } from "next";
import BlogClient from "./BlogClient";
import { getPublishedPosts } from "@/lib/server/posts";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Cẩm Nang & Kiến Thức Gỗ Quý | Mỹ Nghệ Đông Phong",
  description:
    "Tổng hợp bài viết chuyên sâu về nhận biết gỗ Tử Đàn, Sưa đỏ, Nu bách xanh, cách chọn kích thước hạt vòng tay phong thủy chuẩn xác.",
};

interface BlogPageProps {
  searchParams?: {
    tab?: string;
  };
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const posts = await getPublishedPosts();

  return (
    <main className="flex-1 w-full bg-bg">
      <BlogClient initialTab={searchParams?.tab || ""} initialPosts={posts} />
    </main>
  );
}

