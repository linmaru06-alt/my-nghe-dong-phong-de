"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import ReadingProgress from "@/components/ui/ReadingProgress";
import ProductCard from "@/components/product/ProductCard";
import postsData from "@/data/posts.json";
import productsData from "@/data/products.json";
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

  // Related products
  const relatedProducts = useMemo(() => {
    if (!post?.relatedProducts || post.relatedProducts.length === 0) return [];
    return productsData.filter((p) => post.relatedProducts.includes(p.id));
  }, [post?.relatedProducts]);

  // Recent posts
  const recentPosts = useMemo(() => {
    if (!post) return [];
    return [...postsData]
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .filter((p) => p.id !== post.id)
      .slice(0, 5);
  }, [post]);

  const getCategoryName = (cat: string) => {
    switch (cat) {
      case 'kien-thuc-ve-go': return 'KIẾN THỨC VỀ GỖ';
      case 'vat-pham-phong-thuy': return 'VẬT PHẨM PHONG THỦY';
      case 'nghe-thuat-che-tac': return 'NGHỆ THUẬT CHẾ TÁC';
      case 'tin-tuc-su-kien': return 'TIN TỨC XƯỞNG ĐÔNG PHONG';
      default: return 'TIN TỨC, BLOG';
    }
  };

  if (!post) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-serif font-bold text-primary mb-2">
          Không tìm thấy blog yêu cầu
        </h2>
        <p className="text-xs text-text-muted mb-6">
          Blog có thể đã được cập nhật đường dẫn hoặc chuyển danh mục.
        </p>
        <Link
          href="/bai-viet"
          className="px-6 py-2.5 rounded-btn bg-primary text-white text-xs font-bold shadow-sm hover:bg-primary-hover transition-colors"
        >
          Xem cẩm nang blog
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pb-16 md:pb-24">
      {/* Fixed Reading Progress Bar */}
      <ReadingProgress />

      <div className="container mx-auto px-4 md:px-8 py-8 md:py-12 max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          {/* Main Article Content */}
          <article className="flex-1 lg:w-[70%]">
            <header className="mb-6">
              <div className="text-[13px] font-bold text-[#888] uppercase tracking-[0.05em] mb-3">
                {getCategoryName(post.category)}
              </div>
              <h1 className="text-3xl md:text-[34px] font-bold text-[#111] mb-5 leading-tight">
                {post.title}
              </h1>
              <div className="w-12 h-[3px] bg-[#ddd] mb-8"></div>
            </header>

            <div className="prose prose-lg max-w-none text-[#333] prose-headings:font-bold prose-headings:text-[#111] prose-a:text-[#337ab7] hover:prose-a:underline prose-li:marker:text-[#666]">
              <ArticleContentRenderer content={post.content} />
            </div>
          </article>

          {/* Sidebar */}
          <aside className="w-full lg:w-[30%]">
            <div className="sticky top-28">
              <h3 className="font-bold text-[15px] text-[#111] mb-2 uppercase tracking-wide">
                BLOG MỚI
              </h3>
              <div className="w-8 h-[2px] bg-[#ccc] mb-5"></div>
              
              <ul className="flex flex-col">
                {recentPosts.map((rp) => (
                  <li key={rp.id} className="border-b border-[#eee] last:border-0 py-3.5 first:pt-0">
                    <Link href={`/bai-viet/${rp.slug}`} className="text-[#337ab7] text-[15px] hover:underline leading-relaxed block">
                      {rp.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>

        {/* Related Products in this article */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 pt-10 border-t border-[#eee]">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-[#C5A059]" />
              <h3 className="font-serif text-2xl font-bold text-[#111]">
                Tác Phẩm Được Đề Cập Trong Blog
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} {...p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
