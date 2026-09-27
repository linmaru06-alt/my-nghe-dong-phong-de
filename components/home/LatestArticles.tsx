import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import ScrollReveal, { ScrollRevealGroup } from "@/components/ui/ScrollReveal";
import type { Post } from "@/lib/server/posts";

interface LatestArticlesProps {
  posts: Post[];
}

export function LatestArticles({ posts }: LatestArticlesProps) {
  if (!posts || posts.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-[#FDFBF7] select-none overflow-hidden">
      <div className="w-full max-w-[1320px] mx-auto px-4 md:px-8">
        <ScrollRevealGroup
          staggerDelay={70}
          direction="up"
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {posts.map((post) => {
            const date = new Date(post.publishedAt || Date.now());
            // Format like: "12 September 2026"
            const dateStr = date.toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric"
            });

            return (
              <div key={post.id} className="h-full">
                <Link
                  href={`/bai-viet/${post.slug}`}
                  className="group flex flex-col h-full w-full bg-white border border-border/40 hover:shadow-lg transition-shadow duration-300"
                >
                  {/* Image */}
                  <div className="relative w-full aspect-square overflow-hidden bg-[#f5efe6] border-b border-border/40">
                    <Image
                      src={post.thumbnail || "/images/placeholder.svg"}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                  </div>
                  
                  {/* Content Wrapper */}
                  <div className="p-6 flex flex-col flex-1">
                    <span className="text-[#C5A059] text-[10px] uppercase font-bold tracking-wider mb-3 block">
                      {dateStr}
                    </span>
                    <h3 className="font-serif text-lg md:text-xl text-primary group-hover:text-[#B32025] transition-colors line-clamp-2 mb-3">
                      {post.title}
                    </h3>
                    <p className="text-sm text-text-muted line-clamp-3 mb-6 flex-1">
                      {post.excerpt}
                    </p>
                    
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#B32025] group-hover:text-[#8a181c] transition-colors mt-auto">
                      <span>Đọc bài viết</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </Link>
              </div>
            );
          })}
        </ScrollRevealGroup>

        {/* Bottom Link */}
        <ScrollReveal direction="up" delay={200}>
          <div className="mt-14">
            <Link
              href="/bai-viet"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#B32025] hover:text-[#8a181c] transition-colors font-bold"
            >
              <span>Xem tất cả bài viết</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

export default LatestArticles;
