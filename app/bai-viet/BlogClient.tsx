"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Badge from "@/components/ui/Badge";
import BlogGrid from "@/components/blog/BlogGrid";
import BlogSidebar from "@/components/blog/BlogSidebar";
import postsData from "@/data/posts.json";
import { formatDate } from "@/lib/utils";

const tabs = [
  { id: "", label: "Tất cả bài viết" },
  { id: "kien-thuc-ve-go", label: "Kiến thức về gỗ" },
  { id: "huong-dan-lua-chon", label: "Hướng dẫn lựa chọn" },
  { id: "bao-quan-san-pham", label: "Bảo quản sản phẩm" },
];

import type { Post } from "@/lib/server/posts";

export interface BlogClientProps {
  initialTab?: string;
  initialPosts?: Post[];
}

export default function BlogClient({ initialTab = "", initialPosts }: BlogClientProps) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const posts = initialPosts || postsData;

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Lọc bài viết
  const filteredPosts = activeTab
    ? posts.filter((p) => p.category === activeTab && p.status === "published")
    : posts.filter((p) => p.status === "published");

  // Bài viết tiêu điểm đầu tiên
  const featuredPost = filteredPosts[0];
  const remainingPosts = filteredPosts.slice(1);


  return (
    <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
      {/* Breadcrumb */}
      <Breadcrumb items={[{ label: "Bài viết & Cẩm nang" }]} />

      {/* Page Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-10 max-w-2xl"
      >
        <h1 className="text-3xl md:text-5xl font-serif font-medium text-primary mb-4 tracking-wide">
          Cẩm Nang & Văn Hóa Đồ Gỗ
        </h1>
        <p className="text-base text-text-muted leading-relaxed font-light">
          Góc chia sẻ kiến thức chuyên sâu về nhận biết danh mộc, ý nghĩa phong thủy và kinh nghiệm giữ vân gỗ bền đẹp theo năm tháng.
        </p>
      </motion.div>

      {/* Tabs Filter (Editorial Style) */}
      <div className="flex items-center gap-8 overflow-x-auto scrollbar-none mb-12 select-none border-b border-border/50">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`relative pb-3 text-[13px] font-medium tracking-wide whitespace-nowrap transition-colors duration-300 ${
                isActive ? "text-primary" : "text-text-muted hover:text-primary"
              }`}
            >
              {tab.label}
              {isActive && (
                <motion.div
                  layoutId="blogTabIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                  initial={false}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Main Layout: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
        {/* Left Column: Articles (8 cols) */}
        <div className="lg:col-span-8 space-y-10">
          {/* Featured Post Card (Big) */}
          {/* Featured Post Card (Editorial Split Layout) */}
          {featuredPost && (
            <motion.article 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="group flex flex-col md:flex-row bg-surface rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-shadow duration-500 border border-transparent hover:border-primary/20"
            >
              {/* Image Side */}
              <Link
                href={`/bai-viet/${featuredPost.slug}`}
                className="relative md:w-1/2 aspect-[16/10] md:aspect-auto overflow-hidden block"
              >
                <Image
                  src={featuredPost.thumbnail || "/images/placeholder.svg"}
                  alt={featuredPost.title}
                  fill
                  priority
                  className="object-cover opacity-95 group-hover:opacity-100 group-hover:scale-105 transition-transform duration-700 ease-out"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute top-4 left-4 z-10">
                  <Badge variant="gold" className="shadow-sm tracking-wide">Tiêu điểm</Badge>
                </div>
              </Link>

              {/* Content Side */}
              <div className="md:w-1/2 p-6 md:p-8 lg:p-10 flex flex-col justify-center">
                <div className="flex items-center gap-3 text-[11px] uppercase tracking-wider text-text-muted mb-4 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(featuredPost.publishedAt)}
                  </span>
                  <span className="text-border">•</span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {featuredPost.readingTime} phút đọc
                  </span>
                </div>

                <Link href={`/bai-viet/${featuredPost.slug}`}>
                  <h2 className="font-serif text-2xl lg:text-3xl font-medium text-text group-hover:text-primary transition-colors leading-snug tracking-wide mb-4">
                    {featuredPost.title}
                  </h2>
                </Link>

                <p className="text-sm text-text-muted leading-relaxed line-clamp-3 font-light mb-8">
                  {featuredPost.excerpt}
                </p>

                <div className="mt-auto">
                  <Link
                    href={`/bai-viet/${featuredPost.slug}`}
                    className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide text-primary hover:text-secondary group/link transition-colors"
                  >
                    <span>Đọc bài viết chi tiết</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/link:translate-x-1.5" />
                  </Link>
                </div>
              </div>
            </motion.article>
          )}

          {/* Remaining Articles Grid (2 cols) */}
          {remainingPosts.length > 0 && (
            <div>
              <h3 className="font-serif text-xl font-bold text-primary mb-6">
                Bài Viết Mới Nhất
              </h3>
              <BlogGrid posts={remainingPosts} />
            </div>
          )}
        </div>

        {/* Right Column: Sidebar (4 cols) */}
        <div className="lg:col-span-4">
          <div className="sticky top-24">
            <BlogSidebar />
          </div>
        </div>
      </div>
    </div>
  );
}
