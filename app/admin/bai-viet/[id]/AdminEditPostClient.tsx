"use client";

import React from "react";
import Link from "next/link";
import BlogForm from "@/components/admin/BlogForm";
import { usePostsStore } from "@/lib/usePosts";

export interface AdminEditPostClientProps {
  id: string;
}

export default function AdminEditPostClient({ id }: AdminEditPostClientProps) {
  const { posts } = usePostsStore();
  const post = posts.find((p) => p.id === id);

  if (!post) {
    return (
      <div className="p-12 text-center bg-surface rounded-card border border-border">
        <h2 className="text-lg font-serif font-bold text-text mb-2">
          Không tìm thấy bài viết #{id}
        </h2>
        <p className="text-xs text-text-muted mb-4">
          Bài viết có thể đã bị xóa hoặc không tồn tại.
        </p>
        <Link
          href="/admin/bai-viet"
          className="text-xs font-semibold text-primary hover:underline"
        >
          ← Quay lại danh sách bài viết
        </Link>
      </div>
    );
  }

  return <BlogForm initialData={post as any} isEdit={true} />;
}
