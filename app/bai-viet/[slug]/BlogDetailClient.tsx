"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { Sparkles, Tag } from "lucide-react";
import ReadingProgress from "@/components/ui/ReadingProgress";
import ProductCard from "@/components/product/ProductCard";
import postsData from "@/data/posts.json";
import productsData from "@/data/products.json";
import { ArticleContentRenderer } from "@/components/blog/ArticleContentRenderer";
import { extractTagsFromContent } from "@/lib/utils/tags";

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

  // Hashtags / Từ khóa thực thể
  const tags = useMemo(() => {
    if (!post) return [];
    return extractTagsFromContent(post.title, post.content, post.tags);
  }, [post]);

  const getCategoryName = (cat: string) => {
    switch (cat) {
      case 'kien-thuc-ve-go': return 'KIẾN THỨC VỀ GỖ';
      case 'vat-pham-phong-thuy': return 'VẬT PHẨM PHONG THỦY';
      case 'nghe-thuat-che-tac': return 'NGHỆ THUẬT CHẾ TÁC';
      case 'tin-tuc-su-kien': return 'TIN TỨC XƯỞNG ĐÔNG PHONG';
      default: return 'TIN TỨC, BÀI VIẾT';
    }
  };

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
    <div className="bg-white min-h-screen pb-20 md:pb-24">
      {/* Fixed Reading Progress Bar */}
      <ReadingProgress />

      <div className="container mx-auto px-4 md:px-8 py-6 md:py-12 max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
          {/* Main Article Content */}
          <article className="flex-1 lg:w-[70%]">
            <header className="mb-6">
              <div className="text-[12px] md:text-[13px] font-bold text-[#888] uppercase tracking-[0.05em] mb-2.5">
                {getCategoryName(post.category)}
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-[34px] font-bold text-[#111] mb-4 md:mb-5 leading-tight sm:leading-snug">
                {post.title}
              </h1>
              <div className="w-12 h-[3px] bg-[#ddd] mb-6 md:mb-8"></div>
            </header>

            {/* Featured Hero Image (Ảnh chụp thật từ tư liệu nghiên cứu chuyên ngành) */}
            {post.thumbnail && (
              <figure className="mb-8 rounded-2xl overflow-hidden border border-[#E8DFC8]/60 shadow-sm bg-[#FAF6F0]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.thumbnail}
                  alt={post.title}
                  className="w-full max-h-[500px] object-cover object-center"
                  loading="eager"
                />
                <figcaption className="text-center text-xs md:text-sm text-[#5A4A42] py-2.5 px-4 bg-[#FAF6F0] italic font-serif border-t border-[#E8DFC8]/40">
                  Ảnh chụp cận cảnh phôi mộc tự nhiên — Nguồn tư liệu chuyên ngành gỗ quý Đông Phong
                </figcaption>
              </figure>
            )}

            <div className="prose prose-lg max-w-none text-[#333] prose-headings:font-bold prose-headings:text-[#111] prose-a:text-[#337ab7] hover:prose-a:underline prose-li:marker:text-[#666]">
              <ArticleContentRenderer content={post.content} />
            </div>

            {/* Chủ đề & Hashtag tra cứu thông minh */}
            {tags.length > 0 && (
              <div className="mt-10 pt-6 border-t border-[#E8DFC8]">
                <div className="flex items-center gap-2 mb-3.5">
                  <Tag className="w-4 h-4 text-[#C5A059]" />
                  <span className="text-xs uppercase font-bold tracking-wider text-[#5A4A42]">
                    Chủ đề & Từ khóa liên quan
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/tim-kiem?q=${encodeURIComponent(tag)}`}
                      className="group inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium bg-[#FAF6F0] text-[#3D2314] border border-[#E8DFC8] hover:bg-[#C5A059] hover:text-white hover:border-[#C5A059] transition-all duration-200 shadow-2xs"
                    >
                      <span className="text-[#C5A059] group-hover:text-white font-bold">#</span>
                      <span>{tag}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </article>

          {/* Sidebar */}
          <aside className="w-full lg:w-[30%]">
            <div className="sticky top-28">
              <h3 className="font-bold text-[15px] text-[#111] mb-2 uppercase tracking-wide">
                BÀI VIẾT MỚI
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
      </div>
    </div>
  );
}
