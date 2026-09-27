"use client";

import React from "react";
import { motion } from "framer-motion";
import BlogCard, { BlogCardProps } from "./BlogCard";
import Skeleton from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";

export interface BlogGridProps {
  posts: BlogCardProps[];
  isLoading?: boolean;
}

export function BlogGrid({ posts, isLoading = false }: BlogGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} variant="blog-card" />
        ))}
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <EmptyState
        title="Chưa có bài viết nào"
        description="Chúng tôi đang chuẩn bị các nội dung kiến thức chuyên sâu về gỗ quý."
      />
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8"
    >
      {posts.map((post) => (
        <motion.div key={post.id} variants={item} className="h-full">
          <BlogCard {...post} />
        </motion.div>
      ))}
    </motion.div>
  );
}

export default BlogGrid;
