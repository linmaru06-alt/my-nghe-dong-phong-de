import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlogDetailClient from "./BlogDetailClient";
import { getAllPosts, getPostBySlug } from "@/lib/server/posts";

export const dynamicParams = true;
export const revalidate = 0;

interface PageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    return {
      title: "Không tìm thấy bài viết | Mỹ Nghệ Đông Phong",
    };
  }

  const thumb = post.thumbnail || "/images/placeholder.svg";

  return {
    title: `${post.title} | Mỹ Nghệ Đông Phong`,
    description: post.excerpt?.slice(0, 160) || "",
    openGraph: {
      title: `${post.title} — Mỹ Nghệ Đông Phong`,
      description: post.excerpt?.slice(0, 160) || "",
      images: [{ url: thumb }],
    },
  };
}

export default async function BlogDetailPage({ params }: PageProps) {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  // Schema.org BlogPosting chuẩn Google & tăng độ uy tín E-E-A-T
  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt || post.title,
    image: post.thumbnail ? [post.thumbnail] : ["https://mynghedongphong.vn/images/logo.png"],
    datePublished: post.publishedAt || new Date().toISOString(),
    author: {
      "@type": "Person",
      name: "Nghệ nhân Đông Phong",
      jobTitle: "Nghệ nhân điêu khắc mộc truyền thống",
      worksFor: {
        "@type": "Organization",
        name: "Mỹ Nghệ Đông Phong",
      },
    },
    publisher: {
      "@type": "Organization",
      name: "Mỹ Nghệ Đông Phong",
      logo: {
        "@type": "ImageObject",
        url: "https://mynghedongphong.vn/images/logo.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://mynghedongphong.vn/bai-viet/${post.slug}`,
    },
  };

  return (
    <main className="flex-1 w-full">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />
      <BlogDetailClient post={post} />
    </main>
  );
}

