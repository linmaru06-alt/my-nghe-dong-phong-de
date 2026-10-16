import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlogDetailClient from "./BlogDetailClient";
import { getAllPosts, getPostBySlug } from "@/lib/server/posts";
import { extractTagsFromContent } from "@/lib/utils/tags";

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
  const postUrl = `https://mynghedongphong.vn/bai-viet/${post.slug}`;
  const metaDesc = post.excerpt?.slice(0, 160) || `${post.title} - Kiến thức đồ gỗ quý phong thủy thủ công Mỹ Nghệ Đông Phong.`;
  const tags = extractTagsFromContent(post.title, post.content, post.tags);

  return {
    title: `${post.title} | Mỹ Nghệ Đông Phong`,
    description: metaDesc,
    keywords: tags.join(", "),
    alternates: {
      canonical: postUrl,
    },
    openGraph: {
      title: `${post.title} — Mỹ Nghệ Đông Phong`,
      description: metaDesc,
      url: postUrl,
      type: "article",
      publishedTime: post.publishedAt,
      authors: ["Nghệ nhân Đông Phong"],
      images: [
        {
          url: thumb,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${post.title} | Mỹ Nghệ Đông Phong`,
      description: metaDesc,
      images: [thumb],
    },
  };
}

export default async function BlogDetailPage({ params }: PageProps) {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const tags = extractTagsFromContent(post.title, post.content, post.tags);

  // Schema.org BlogPosting chuẩn Google & tăng độ uy tín E-E-A-T & AI Engine Entities
  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt || post.title,
    image: post.thumbnail ? [post.thumbnail] : ["https://mynghedongphong.vn/images/logo.png"],
    datePublished: post.publishedAt || new Date().toISOString(),
    keywords: tags.join(", "),
    about: tags.map((tag) => ({
      "@type": "Thing",
      name: tag,
    })),
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

  // Tự động bóc tách các câu hỏi FAQ (h3) và câu trả lời (p) để tối ưu AI Search (Perplexity, ChatGPT, Google AI Overviews)
  const faqRegex = /<h3[^>]*>([\s\S]*?)<\/h3>\s*<p[^>]*>([\s\S]*?)<\/p>/gi;
  const faqItems: Array<{ question: string; answer: string }> = [];
  let match;
  while ((match = faqRegex.exec(post.content || "")) !== null) {
    const q = match[1].replace(/<[^>]*>/g, "").trim();
    const a = match[2].replace(/<[^>]*>/g, "").trim();
    if (q && a && !q.toLowerCase().includes("lời tâm sự")) {
      faqItems.push({ question: q, answer: a });
    }
  }

  const schemas: any[] = [blogSchema];

  if (faqItems.length > 0) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqItems.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    });
  }

  return (
    <main className="flex-1 w-full">
      {schemas.map((s, idx) => (
        <script
          key={idx}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }}
        />
      ))}
      <BlogDetailClient post={post} />
    </main>
  );
}

