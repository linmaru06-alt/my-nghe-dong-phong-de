"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, ArrowLeft, Sparkles } from "lucide-react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Badge from "@/components/ui/Badge";
import ReadingProgress from "@/components/ui/ReadingProgress";
import TableOfContents, { TocItem } from "@/components/blog/TableOfContents";
import ProductCard from "@/components/product/ProductCard";
import BlogCard from "@/components/blog/BlogCard";
import postsData from "@/data/posts.json";
import productsData from "@/data/products.json";
import { formatDate } from "@/lib/utils";
import { ArticleContentRenderer } from "@/components/blog/ArticleContentRenderer";


export interface BlogDetailClientProps {
  post?: any;
  slug?: string;
}

export default function BlogDetailClient({ post: propPost, slug }: BlogDetailClientProps) {
  const post =
    propPost ||
    (slug
      ? postsData.find(
          (p) =>
            p.slug.toLowerCase() === decodeURIComponent(slug).trim().toLowerCase() ||
            p.id.toLowerCase() === decodeURIComponent(slug).trim().toLowerCase()
        )
      : null);

  // Extract headings from markdown content for TOC
  const tocItems: TocItem[] = useMemo(() => {
    if (!post?.content) return [];
    const lines = post.content.split("\n");
    const items: TocItem[] = [];

    lines.forEach((line: string) => {
      const h2Match = line.match(/^##\s+(.+)$/);
      if (h2Match) {
        const text = h2Match[1].trim();
        const id = text
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-");
        items.push({ id, text, level: 2 });
      }

      const h3Match = line.match(/^###\s+(.+)$/);
      if (h3Match) {
        const text = h3Match[1].trim();
        const id = text
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-");
        items.push({ id, text, level: 3 });
      }
    });

    return items;
  }, [post?.content]);

  // Related products
  const relatedProducts = useMemo(() => {
    if (!post?.relatedProducts || post.relatedProducts.length === 0) return [];
    return productsData.filter((p) => post.relatedProducts.includes(p.id));
  }, [post?.relatedProducts]);

  // Related posts (same category, excluding current)
  const relatedPosts = useMemo(() => {
    if (!post) return [];
    return postsData
      .filter((p) => p.category === post.category && p.id !== post.id)
      .slice(0, 3);
  }, [post]);

  if (!post) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-serif font-bold text-primary mb-2">
          Không tìm thấy bài viết yêu cầu
        </h2>
        <p className="text-xs text-text-muted mb-6">
          Bài viết có thể đã được cập nhật đường dẫn hoặc chuyển danh mục.
        </p>
        <Link
          href="/bai-viet"
          className="px-6 py-2.5 rounded-btn bg-primary text-white text-xs font-bold shadow-sm hover:bg-primary-hover transition-colors"
        >
          Xem cẩm nang bài viết
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-bg min-h-screen pb-16 md:pb-24">
      {/* Fixed Reading Progress Bar */}
      <ReadingProgress />

      <div className="container mx-auto px-4 md:px-6 py-6 md:py-10">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Bài viết", href: "/bai-viet" },
            { label: post.title },
          ]}
        />

        {/* Back link */}
        <div className="my-4">
          <Link
            href="/bai-viet"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại cẩm nang bài viết</span>
          </Link>
        </div>

        {/* Article Header */}
        <header className="max-w-4xl mx-auto text-center py-6 md:py-10 border-b border-border mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Badge variant="wood">Cẩm nang đồ gỗ</Badge>
            <span className="text-xs text-text-muted flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(post.publishedAt)}
            </span>
            <span className="text-xs text-text-muted flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {post.readingTime} phút đọc
            </span>
          </div>

          <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl font-bold text-primary leading-tight mb-6">
            {post.title}
          </h1>

          <p className="text-base md:text-lg text-text-muted max-w-2xl mx-auto leading-relaxed italic">
            &quot;{post.excerpt}&quot;
          </p>
        </header>

        {/* Main Content Layout (Sidebar TOC + Article Body) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 max-w-6xl mx-auto">
          {/* Article Body (8 cols) */}
          <article className="lg:col-span-8 bg-surface p-6 md:p-10 rounded-card border border-border shadow-card">
            {/* Featured Image */}
            <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden mb-8 bg-accent-soft/30">
              <Image
                src={post.thumbnail}
                alt={post.title}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 65vw"
              />
            </div>

            {/* Rich Block & Markdown Renderer */}
            <ArticleContentRenderer content={post.content} />
          </article>

          {/* Desktop Table of Contents Sidebar (4 cols) */}
          <div className="hidden lg:block lg:col-span-4">
            <TableOfContents items={tocItems} />
          </div>
        </div>

        {/* Related Products in this article */}
        {relatedProducts.length > 0 && (
          <section className="max-w-6xl mx-auto mt-16 pt-10 border-t border-border">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-secondary" />
              <h3 className="font-serif text-2xl font-bold text-primary">
                Tác Phẩm Được Đề Cập Trong Bài Viết
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} {...p} />
              ))}
            </div>
          </section>
        )}

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="max-w-6xl mx-auto mt-16 pt-10 border-t border-border">
            <h3 className="font-serif text-2xl font-bold text-primary mb-6">
              Bài Viết Liên Quan Cùng Chủ Đề
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((rp) => (
                <BlogCard key={rp.id} {...rp} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
