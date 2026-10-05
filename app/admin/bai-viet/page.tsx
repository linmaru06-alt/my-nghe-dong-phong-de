"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Search, Edit2, Trash2, Eye, Sparkles } from "lucide-react";
import StatusBadge from "@/components/admin/StatusBadge";
import { usePostsStore } from "@/lib/usePosts";
import { formatDate } from "@/lib/utils";

export default function AdminPostsPage() {
  const { posts, deletePost, loadPosts } = usePostsStore();
  const [isCurating, setIsCurating] = useState(false);
  const [curateMessage, setCurateMessage] = useState<string | null>(null);

  React.useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const handleTriggerAiNews = async () => {
    if (isCurating) return;
    setIsCurating(true);
    setCurateMessage("Đang cào bài báo thật và biên soạn chuyên sâu...");
    try {
      const res = await fetch("/api/admin/ai-news/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ maxArticles: 1, autoPublish: true }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCurateMessage(`✅ Xuất bản thành công ${data.publishedCount} bài viết mới với ảnh Cloudinary!`);
        await loadPosts();
      } else {
        setCurateMessage(`⚠️ ${data.error || data.message || "Không có tin mới phù hợp"}`);
      }
    } catch (err: any) {
      setCurateMessage(`❌ Lỗi kết nối: ${err.message}`);
    } finally {
      setIsCurating(false);
      setTimeout(() => setCurateMessage(null), 8000);
    }
  };

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      if (selectedCategory && p.category !== selectedCategory) return false;
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        return (
          p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [posts, selectedCategory, search]);

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa bài viết "${title}"?`)) {
      deletePost(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-primary">
            Quản Lý Bài Viết & Cẩm Nang
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Tổng số: {posts.length} bài viết kiến thức gỗ quý.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleTriggerAiNews}
            disabled={isCurating}
            className="inline-flex items-center gap-1.5 bg-amber-700 hover:bg-amber-800 text-white px-3.5 py-2.5 rounded-btn text-xs font-bold shadow-sm transition-colors disabled:opacity-50"
            title="Tự động cào tin bài báo mới nhất và biên soạn 800-1200 từ"
          >
            <Sparkles className={`w-4 h-4 ${isCurating ? "animate-spin" : ""}`} />
            <span>{isCurating ? "Đang cào & biên soạn..." : "Cào tin tức AI"}</span>
          </button>

          <Link
            href="/admin/bai-viet/them"
            className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-btn text-xs font-bold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm bài viết mới</span>
          </Link>
        </div>
      </div>

      {curateMessage && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs rounded-lg animate-in fade-in">
          {curateMessage}
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-surface p-4 rounded-card border border-border flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tiêu đề bài viết..."
            className="w-full bg-bg border border-border rounded-btn pl-9 pr-3 py-1.5 text-xs text-text focus:outline-none focus:border-primary"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-bg border border-border rounded-btn px-3 py-1.5 text-xs text-text focus:outline-none cursor-pointer"
        >
          <option value="">Tất cả nhóm bài viết</option>
          <option value="kien-thuc-ve-go">Kiến thức về gỗ</option>
          <option value="huong-dan-lua-chon">Hướng dẫn lựa chọn</option>
          <option value="bao-quan-san-pham">Bảo quản sản phẩm</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-surface rounded-card border border-border overflow-x-auto shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-border bg-bg text-text-muted uppercase font-semibold">
              <th className="py-3 px-3">Thumbnail</th>
              <th className="py-3 px-3">Tiêu đề bài viết</th>
              <th className="py-3 px-3">Chủ đề</th>
              <th className="py-3 px-3">Thời gian đọc</th>
              <th className="py-3 px-3">Ngày phát hành</th>
              <th className="py-3 px-3">Trạng thái</th>
              <th className="py-3 px-3 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {filtered.map((post) => (
              <tr key={post.id} className="hover:bg-bg/50 transition-colors">
                <td className="py-2.5 px-3">
                  <div className="relative w-14 h-10 rounded overflow-hidden bg-bg border border-border flex-shrink-0">
                    <Image
                      src={post.thumbnail || "/images/placeholder.svg"}
                      alt={post.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                </td>

                <td className="py-2.5 px-3 max-w-[280px]">
                  <span className="font-bold text-text line-clamp-1">
                    {post.title}
                  </span>
                  <span className="text-[11px] text-text-muted line-clamp-1 mt-0.5">
                    {post.excerpt}
                  </span>
                </td>

                <td className="py-2.5 px-3 capitalize text-text-muted">
                  {post.category.replace(/-/g, " ")}
                </td>

                <td className="py-2.5 px-3 text-text-muted">
                  {post.readingTime} phút
                </td>

                <td className="py-2.5 px-3 text-text-muted">
                  {formatDate(post.publishedAt)}
                </td>

                <td className="py-2.5 px-3">
                  <StatusBadge status={post.status} />
                </td>

                <td className="py-2.5 px-3 text-right">
                  <div className="inline-flex items-center gap-2">
                    <Link
                      href={`/bai-viet/${post.slug}`}
                      target="_blank"
                      title="Xem bài viết ngoài trang"
                      className="p-1 rounded text-text-muted hover:text-primary transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Link>

                    <Link
                      href={`/admin/bai-viet/${post.id}`}
                      title="Chỉnh sửa"
                      className="p-1 rounded text-text-muted hover:text-blue-600 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleDelete(post.id, post.title)}
                      title="Xóa bài viết"
                      className="p-1 rounded text-text-muted hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
