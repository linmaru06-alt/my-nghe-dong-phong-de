import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Clock, Calendar, ArrowRight } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";

export interface BlogCardProps {
  id: string;
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  thumbnail: string;
  publishedAt: string;
  readingTime: number;
}

export const BlogCard = React.memo(function BlogCard({
  slug,
  title,
  category,
  excerpt,
  thumbnail,
  publishedAt,
  readingTime,
}: BlogCardProps) {
  const categoryLabels: Record<string, string> = {
    "kien-thuc-ve-go": "Kiến thức gỗ",
    "huong-dan-lua-chon": "Hướng dẫn chọn",
    "bao-quan-san-pham": "Bảo quản gỗ",
  };

  return (
    <article className="group flex flex-col rounded-xl bg-surface shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-500 overflow-hidden border border-transparent hover:border-primary/20">
      {/* Thumbnail */}
      <Link
        href={`/bai-viet/${slug}`}
        className="relative aspect-[16/10] w-full bg-accent-soft/40 overflow-hidden block"
      >
        <Image
          src={thumbnail || "/images/placeholder.svg"}
          alt={title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover opacity-95 group-hover:opacity-100 group-hover:scale-110 transition-transform duration-700 ease-out"
        />
        <div className="absolute top-4 left-4 z-10">
          <Badge variant="wood" className="text-[11px] shadow-sm tracking-wide">
            {categoryLabels[category] || category}
          </Badge>
        </div>
        {/* Subtle gradient overlay for better contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </Link>

      {/* Details */}
      <div className="p-5 md:p-6 flex-1 flex flex-col justify-between relative bg-surface">
        <div>
          {/* Metadata Row */}
          <div className="flex items-center gap-3 text-[11px] uppercase tracking-wider text-text-muted mb-3 font-medium">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(publishedAt)}
            </span>
            <span className="text-border">•</span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {readingTime} phút đọc
            </span>
          </div>

          <Link href={`/bai-viet/${slug}`}>
            <h3 className="font-serif text-lg md:text-xl font-medium text-text group-hover:text-primary transition-colors line-clamp-2 leading-snug tracking-wide mb-3">
              {title}
            </h3>
          </Link>

          <p className="text-sm text-text-muted line-clamp-3 leading-relaxed font-light">
            {excerpt}
          </p>
        </div>

        <div className="mt-5 pt-4 border-t border-border/30 relative">
          <Link
            href={`/bai-viet/${slug}`}
            className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide text-primary group-hover:text-secondary transition-colors"
          >
            <span>Đọc bài viết</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5" />
          </Link>
        </div>
      </div>
    </article>
  );
});

BlogCard.displayName = "BlogCard";
export default BlogCard;
