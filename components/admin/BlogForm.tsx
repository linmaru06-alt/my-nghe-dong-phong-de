"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Save, Send, Eye, Upload, Image as ImageIcon, X, Loader2, LayoutTemplate, FileCode } from "lucide-react";
import { usePostsStore } from "@/lib/usePosts";
import { slugify } from "@/lib/slugify";
import { toast } from "@/components/ui/Toast";
import { VisualBlockEditor } from "./block-editor/VisualBlockEditor";
import { markdownToBlocks, blocksToMarkdown, EditorBlock } from "@/lib/blockEditor";
import { ArticleContentRenderer } from "@/components/blog/ArticleContentRenderer";

export interface BlogFormData {
  id?: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
  thumbnail: string;
  readingTime: number;
  status: "published" | "draft";
  publishedAt?: string;
}

export interface BlogFormProps {
  initialData?: BlogFormData;
  isEdit?: boolean;
}

export function BlogForm({ initialData, isEdit = false }: BlogFormProps) {
  const router = useRouter();
  const { addPost, updatePost } = usePostsStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [formData, setFormData] = useState<BlogFormData>(
    initialData || {
      title: "",
      slug: "",
      category: "kien-thuc-ve-go",
      excerpt: "",
      content: "## 1. Giới thiệu tổng quan\n\nNội dung chi tiết bài viết...",
      thumbnail: "",
      readingTime: 5,
      status: "published",
    }
  );

  const [editorMode, setEditorMode] = useState<"visual" | "markdown" | "preview">("visual");
  const [blocks, setBlocks] = useState<EditorBlock[]>(() => markdownToBlocks(formData.content));
  const [isUploadingThumb, setIsUploadingThumb] = useState(false);
  const [isUploadingContentImg, setIsUploadingContentImg] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    const updates: Partial<BlogFormData> = { title };
    if (!isEdit) {
      updates.slug = slugify(title);
    }
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  // Đồng bộ thay đổi từ khối trực quan sang Markdown & thời gian đọc
  const handleBlocksChange = (newBlocks: EditorBlock[]) => {
    setBlocks(newBlocks);
    const newContent = blocksToMarkdown(newBlocks);
    const words = newContent.trim().split(/\s+/).length;
    const readingTime = Math.max(1, Math.ceil(words / 200));
    setFormData((prev) => ({ ...prev, content: newContent, readingTime }));
  };

  // Chuyển tab và tự động parse lại dữ liệu nếu cần
  const handleSwitchTab = (tab: "visual" | "markdown" | "preview") => {
    if (tab === "visual" && editorMode === "markdown") {
      setBlocks(markdownToBlocks(formData.content));
    } else if (tab === "markdown" && editorMode === "visual") {
      const md = blocksToMarkdown(blocks);
      setFormData((prev) => ({ ...prev, content: md }));
    }
    setEditorMode(tab);
  };

  // Estimate reading time from words khi gõ trực tiếp trong tab Markdown
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const content = e.target.value;
    const words = content.trim().split(/\s+/).length;
    const readingTime = Math.max(1, Math.ceil(words / 200));
    setFormData((prev) => ({ ...prev, content, readingTime }));
  };

  // Upload thumbnail image to backend /api/admin/upload
  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingThumb(true);
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("folder", "blog");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: data,
      });

      const json = await res.json();
      if (res.ok && json.success && json.url) {
        setFormData((prev) => ({ ...prev, thumbnail: json.url }));
        toast.success("Tải ảnh đại diện thành công", "Ảnh đã được lưu vào thư mục hệ thống.");
      } else {
        throw new Error(json.error || "Không thể tải ảnh lên máy chủ");
      }
    } catch (err: any) {
      console.error("Lỗi tải ảnh thumbnail:", err);
      toast.error("Lỗi tải ảnh", err.message || "Vui lòng thử lại với file ảnh khác");
    } finally {
      setIsUploadingThumb(false);
      e.target.value = "";
    }
  };

  // Upload image to insert directly into content
  const handleContentImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingContentImg(true);
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("folder", "blog");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: data,
      });

      const json = await res.json();
      if (res.ok && json.success && json.url) {
        const altText = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
        const imageMarkdown = `\n\n![${altText}](${json.url})\n\n`;

        // Insert at cursor position if available
        if (textareaRef.current) {
          const start = textareaRef.current.selectionStart || formData.content.length;
          const end = textareaRef.current.selectionEnd || formData.content.length;
          const newContent =
            formData.content.substring(0, start) +
            imageMarkdown +
            formData.content.substring(end);
          setFormData((prev) => ({ ...prev, content: newContent }));
        } else {
          setFormData((prev) => ({
            ...prev,
            content: prev.content + imageMarkdown,
          }));
        }

        toast.success("Đã chèn ảnh vào bài viết", "Ảnh đã được tải lên và gắn vào nội dung.");
      } else {
        throw new Error(json.error || "Không thể tải ảnh");
      }
    } catch (err: any) {
      toast.error("Lỗi tải ảnh nội dung", err.message);
    } finally {
      setIsUploadingContentImg(false);
      e.target.value = "";
    }
  };

  const handleSave = async (statusToSet?: "published" | "draft") => {
    if (!formData.title.trim()) {
      alert("Vui lòng nhập tiêu đề bài viết");
      return;
    }

    setIsSaving(true);
    const finalStatus = statusToSet || formData.status;
    const finalContent = editorMode === "visual" ? blocksToMarkdown(blocks) : formData.content;
    const postPayload = {
      ...formData,
      content: finalContent,
      status: finalStatus,
      id: formData.id || `post-${Date.now()}`,
      publishedAt:
        (formData as any).publishedAt ||
        new Date().toISOString().split("T")[0],
    };

    try {
      if (isEdit && formData.id) {
        await updatePost(formData.id, postPayload);
      } else {
        await addPost(postPayload as any);
      }

      toast.success(
        finalStatus === "published" ? "Đã xuất bản bài viết thành công!" : "Đã lưu bản nháp thành công!",
        "Dữ liệu và ảnh đã tự động đồng bộ ngay lập tức lên trang chính và trang bài viết."
      );

      setTimeout(() => {
        router.push("/admin/bai-viet");
      }, 600);
    } catch (error: any) {
      toast.error("Lỗi khi lưu bài viết", error.message || "Vui lòng thử lại");
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-16 relative">
      {/* Main Form Fields */}
      <div className="bg-surface p-6 md:p-8 rounded-card border border-border shadow-xs space-y-6">
        <h2 className="font-serif text-lg font-bold text-primary border-b border-border pb-3">
          Nội Dung Bài Viết
        </h2>

        <div>
          <label className="text-xs font-semibold text-text uppercase tracking-wider block mb-1.5">
            Tiêu đề bài viết *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={handleTitleChange}
            required
            placeholder="VD: Cẩm nang phân biệt gỗ Tử Đàn Ấn Độ và Tử Đàn Nam Phi"
            className="w-full bg-bg border border-border rounded-btn px-3.5 py-2.5 text-text focus:outline-none focus:border-primary font-serif font-bold text-base"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-text uppercase tracking-wider block mb-1.5">
              Đường dẫn (Slug) *
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, slug: e.target.value }))
              }
              className="w-full font-mono text-xs bg-bg border border-border rounded-btn px-3.5 py-2.5 text-text focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-text uppercase tracking-wider block mb-1.5">
              Nhóm chủ đề *
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, category: e.target.value }))
              }
              className="w-full bg-bg border border-border rounded-btn px-3.5 py-2.5 text-sm text-text focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="kien-thuc-ve-go">Kiến thức về gỗ</option>
              <option value="huong-dan-lua-chon">Hướng dẫn lựa chọn</option>
              <option value="bao-quan-san-pham">Bảo quản sản phẩm</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-text uppercase tracking-wider block mb-1.5">
              Thời gian đọc (ước tính)
            </label>
            <input
              type="number"
              value={formData.readingTime}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  readingTime: Number(e.target.value),
                }))
              }
              className="w-full bg-bg border border-border rounded-btn px-3.5 py-2.5 text-sm text-text focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Thumbnail Image Picker & Uploader */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-text uppercase tracking-wider block">
            Ảnh đại diện bài viết (Thumbnail)
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
            {/* Image Preview Box */}
            <div className="sm:col-span-4 relative aspect-16/10 rounded-lg overflow-hidden bg-bg border-2 border-dashed border-border flex flex-col items-center justify-center group">
              {formData.thumbnail ? (
                <>
                  <Image
                    src={formData.thumbnail}
                    alt="Thumbnail preview"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, thumbnail: "" }))}
                      className="p-1.5 rounded-full bg-white/90 text-red-600 hover:bg-white transition-colors"
                      title="Xóa ảnh này"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center p-4 text-text-muted">
                  <ImageIcon className="w-8 h-8 mx-auto mb-1.5 opacity-50" />
                  <span className="text-xs">Chưa có ảnh đại diện</span>
                </div>
              )}
            </div>

            {/* Upload Controls */}
            <div className="sm:col-span-8 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <label className={`inline-flex items-center gap-2 px-4 py-2 rounded-btn bg-primary hover:bg-primary-hover text-white text-xs font-semibold cursor-pointer shadow-xs transition-colors ${isUploadingThumb ? 'opacity-60 pointer-events-none' : ''}`}>
                  {isUploadingThumb ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang tải ảnh lên...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Tải ảnh từ máy tính / điện thoại</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    disabled={isUploadingThumb}
                    onChange={handleThumbnailUpload}
                    className="hidden"
                  />
                </label>
                <span className="text-[11px] text-text-muted">Chấp nhận JPG, PNG, WebP tối đa 10MB</span>
              </div>

              <div>
                <span className="text-[11px] text-text-muted block mb-1">Hoặc dán URL ảnh trực tuyến:</span>
                <input
                  type="text"
                  value={formData.thumbnail}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, thumbnail: e.target.value }))
                  }
                  placeholder="https://... hoặc /images/blog/..."
                  className="w-full bg-bg border border-border rounded-btn px-3 py-1.5 text-xs text-text focus:outline-none focus:border-primary font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-text uppercase tracking-wider block mb-1.5">
            Tóm tắt ngắn (Excerpt)
          </label>
          <textarea
            rows={2}
            value={formData.excerpt}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, excerpt: e.target.value }))
            }
            placeholder="Tóm tắt ngắn 1-2 câu hiển thị ngoài trang danh sách..."
            className="w-full bg-bg border border-border rounded-btn p-3 text-sm text-text focus:outline-none focus:border-primary"
          />
        </div>

        {/* Visual Block Editor / Markdown / Preview Modes */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div>
              <label className="text-xs font-semibold text-text uppercase tracking-wider block">
                Nội dung bài viết
              </label>
              <p className="text-[11px] text-text-muted mt-0.5">
                Di chuyển chuột vào giữa các dòng/khối và bấm <span className="font-semibold text-primary">(+)</span> để chèn bất kỳ mẫu nào (Heading, Ảnh, 2 Cột, Khối hộp, v.v.)
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-bg border border-border rounded-btn shadow-xs">
              <button
                type="button"
                onClick={() => handleSwitchTab("visual")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-all ${
                  editorMode === "visual"
                    ? "bg-primary text-white shadow-xs"
                    : "text-text-muted hover:text-text hover:bg-surface"
                }`}
              >
                <LayoutTemplate className="w-3.5 h-3.5" />
                <span>Trực quan (Khối)</span>
              </button>

              <button
                type="button"
                onClick={() => handleSwitchTab("markdown")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-all ${
                  editorMode === "markdown"
                    ? "bg-primary text-white shadow-xs"
                    : "text-text-muted hover:text-text hover:bg-surface"
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>Mã nguồn (Markdown)</span>
              </button>

              <button
                type="button"
                onClick={() => handleSwitchTab("preview")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-all ${
                  editorMode === "preview"
                    ? "bg-primary text-white shadow-xs"
                    : "text-text-muted hover:text-text hover:bg-surface"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Xem trước</span>
              </button>
            </div>
          </div>

          {/* Mode 1: Visual Block Editor */}
          {editorMode === "visual" && (
            <div className="bg-bg/40 p-4 md:p-6 rounded-card border border-border">
              <VisualBlockEditor blocks={blocks} onChange={handleBlocksChange} />
            </div>
          )}

          {/* Mode 2: Markdown Editor */}
          {editorMode === "markdown" && (
            <div className="space-y-2">
              <div className="flex justify-end">
                <label className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium border border-border hover:border-primary text-text cursor-pointer transition-colors ${isUploadingContentImg ? 'opacity-60 pointer-events-none' : ''}`}>
                  {isUploadingContentImg ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                      <span className="text-[11px]">Đang chèn...</span>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-3.5 h-3.5 text-primary" />
                      <span>+ Chèn ảnh vào Markdown</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    disabled={isUploadingContentImg}
                    onChange={handleContentImageUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <textarea
                ref={textareaRef}
                rows={16}
                value={formData.content}
                onChange={handleContentChange}
                placeholder="Sử dụng cú pháp Markdown: ## Tiêu đề h2, ### Tiêu đề h3, ![Ảnh minh họa](/url), > Trích dẫn..."
                className="w-full font-mono text-xs bg-bg border border-border rounded-btn p-4 text-text focus:outline-none focus:border-primary leading-relaxed"
              />
            </div>
          )}

          {/* Mode 3: Preview */}
          {editorMode === "preview" && (
            <div className="p-6 md:p-8 rounded-card border border-border bg-[#FDFBF7] shadow-xs">
              <div className="max-w-3xl mx-auto">
                <ArticleContentRenderer content={formData.content} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sticky Bottom Actions */}
      <div className="sticky bottom-4 z-30 p-4 rounded-card bg-surface/95 backdrop-blur-md border border-border shadow-xl flex items-center justify-between">
        <button
          type="button"
          onClick={() => window.open(`/bai-viet/${formData.slug}?preview=true`, "_blank")}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-btn border border-border hover:border-primary text-xs font-semibold text-text transition-colors"
        >
          <Eye className="w-4 h-4" />
          <span>Xem trước bài viết</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={isSaving}
            onClick={() => handleSave("draft")}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-btn border border-border hover:border-primary text-xs font-semibold text-text transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>Lưu nháp</span>
          </button>

          <button
            type="button"
            disabled={isSaving}
            onClick={() => handleSave("published")}
            className="inline-flex items-center gap-1.5 px-6 py-2 rounded-btn bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all shadow-sm disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang đẩy lên trang chính...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Đăng bài viết</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default BlogForm;

