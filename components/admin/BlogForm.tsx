"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Send,
  Image as ImageIcon,
  X,
  Loader2,
  Settings,
  Code,
  ArrowLeft,
  Wand2,
  AlertCircle,
  Clock,
  Tag,
  ShieldCheck,
  MessageCircle,
  Phone,
  Sparkles,
  BookOpen,
  Eye,
} from "lucide-react";
import { usePostsStore } from "@/lib/usePosts";
import { slugify } from "@/lib/slugify";
import { toast } from "@/components/ui/Toast";
import { VisualBlockEditor } from "./block-editor/VisualBlockEditor";
import { markdownToBlocks, blocksToMarkdown, EditorBlock, BlockType, createDefaultBlock } from "@/lib/blockEditor";
import { ArticleContentRenderer } from "@/components/blog/ArticleContentRenderer";
import { AutoResizeTextarea } from "@/components/ui/AutoResizeTextarea";
import { GoogleDocsToolbar } from "./docs-editor/GoogleDocsToolbar";
import { GoogleDocsRuler } from "./docs-editor/GoogleDocsRuler";

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
  tags?: string[];
}

export interface BlogFormProps {
  initialData?: BlogFormData;
  isEdit?: boolean;
}

export function BlogForm({ initialData, isEdit = false }: BlogFormProps) {
  const router = useRouter();
  const { addPost, updatePost } = usePostsStore();

  const [formData, setFormData] = useState<BlogFormData>(
    initialData || {
      title: "",
      slug: "",
      category: "kien-thuc-ve-go",
      excerpt: "",
      content: "",
      thumbnail: "",
      readingTime: 1,
      status: "draft",
      tags: ["Đồ gỗ phong thủy", "Gỗ quý tự nhiên", "Mỹ Nghệ Đông Phong"],
    }
  );

  const [blocks, setBlocks] = useState<EditorBlock[]>(() => markdownToBlocks(formData.content || ""));
  const [editorMode, setEditorMode] = useState<"visual" | "markdown">("visual");
  const [showPreview, setShowPreview] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isUploadingThumb, setIsUploadingThumb] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [tagInput, setTagInput] = useState("");

  const [saveStatus, setSaveStatus] = useState<string>("Chưa lưu");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Sync States
  const [isSlugManual, setIsSlugManual] = useState(!!initialData?.slug && isEdit);
  const [isReadingTimeManual, setIsReadingTimeManual] = useState(false);

  // BeforeUnload Warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (saveStatus === "Chưa lưu") {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [saveStatus]);

  // Ctrl+S Shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleAutoSave(editorMode === "visual" ? blocksToMarkdown(blocks) : formData.content);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocks, formData.content, editorMode]);

  // Debounced Auto Calculations & Auto Save
  useEffect(() => {
    const timer = setTimeout(() => {
      const contentStr = editorMode === "visual" ? blocksToMarkdown(blocks) : formData.content;

      // Auto Read Time
      if (!isReadingTimeManual) {
        const words = contentStr.trim().split(/\s+/).filter(Boolean).length;
        const calcReadingTime = Math.max(1, Math.ceil(words / 200));
        if (calcReadingTime !== formData.readingTime) {
          setFormData((prev) => ({ ...prev, readingTime: calcReadingTime }));
        }
      }

      // Sync Content to formData so it's always fresh
      if (contentStr !== formData.content) {
        setFormData((prev) => ({ ...prev, content: contentStr }));
      }

      // Auto Save
      if (formData.title && (formData.title !== initialData?.title || contentStr !== initialData?.content)) {
        handleAutoSave(contentStr);
      }
    }, 3000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocks, formData.title, editorMode, isReadingTimeManual]);

  const handleAutoSave = async (currentContent: string) => {
    if (!formData.title) return;
    setSaveStatus("Đang lưu...");
    try {
      const payload = {
        ...formData,
        content: currentContent,
        id: formData.id || `post-${Date.now()}`,
      };
      if (isEdit && formData.id) {
        await updatePost(formData.id, payload);
      } else {
        if (!formData.id) {
          setFormData((prev) => ({ ...prev, id: payload.id }));
        }
      }
      setLastSaved(new Date());
      setSaveStatus("Bản nháp");
    } catch (e) {
      setSaveStatus("Chưa lưu");
      toast.error("Lưu nháp thất bại, vui lòng thử lại");
    }
  };

  const handleTitleChange = (val: string) => {
    const updates: Partial<BlogFormData> = { title: val };
    if (!isSlugManual && (!isEdit || formData.status === "draft")) {
      updates.slug = slugify(val);
    }
    setFormData((prev) => ({ ...prev, ...updates }));
    setSaveStatus("Chưa lưu");
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      toast.error("Ảnh quá lớn", "Vui lòng chọn ảnh dưới 8MB");
      return;
    }

    setIsUploadingThumb(true);
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("folder", "blog");

      const res = await fetch("/api/admin/upload", { method: "POST", body: data });
      const json = await res.json();
      if (res.ok && json.success && json.url) {
        setFormData((prev) => ({ ...prev, thumbnail: json.url }));
        toast.success("Tải ảnh bìa thành công");
      } else {
        throw new Error(json.error || "Lỗi máy chủ");
      }
    } catch (err: any) {
      toast.error("Lỗi tải ảnh bìa", err.message);
    } finally {
      setIsUploadingThumb(false);
      e.target.value = "";
    }
  };

  const handleThumbDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      handleThumbnailUpload({ target: { files: [file] } } as any);
    }
  };

  // Global Clipboard Paste (`Ctrl + V`) on the whole document
  const handleDocumentPaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const file = item.getAsFile();
        if (!file) return;

        toast.info("Đang tự động tải ảnh từ Clipboard...");
        try {
          const data = new FormData();
          data.append("file", file);
          data.append("folder", "blog");

          const res = await fetch("/api/admin/upload", { method: "POST", body: data });
          const json = await res.json();
          if (res.ok && json.success && json.url) {
            const newBlock = createDefaultBlock("image");
            newBlock.data = {
              url: json.url,
              alt: "Ảnh minh họa bài viết",
              caption: "",
            };
            setBlocks((prev) => [...prev, newBlock]);
            setSaveStatus("Chưa lưu");
            toast.success("Đã chèn ảnh từ clipboard vào bài viết!");
          } else {
            throw new Error(json.error || "Không thể tải ảnh");
          }
        } catch (err: any) {
          toast.error("Lỗi khi dán ảnh", err.message);
        }
        return;
      }
    }
  };

  // Insert block via Docs Toolbar
  const handleInsertBlockFromToolbar = (type: BlockType, data?: any) => {
    const newBlock = createDefaultBlock(type);
    if (data) {
      newBlock.data = { ...newBlock.data, ...data };
    }
    setBlocks((prev) => [...prev, newBlock]);
    setSaveStatus("Chưa lưu");
    toast.success(`Đã thêm khối ${type}`);
  };

  // Insert Table via Toolbar
  const handleInsertTableFromToolbar = (rows: number = 3, cols: number = 3) => {
    const headers = Array.from({ length: cols }, (_, i) => `Cột ${i + 1}`);
    const tableRows = Array.from({ length: rows - 1 }, () => Array.from({ length: cols }, () => ""));
    const newBlock = createDefaultBlock("table");
    newBlock.data = { headers, rows: tableRows };
    setBlocks((prev) => [...prev, newBlock]);
    setSaveStatus("Chưa lưu");
    toast.success("Đã chèn bảng biểu 3x3 vào bài viết");
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      const currentTags = formData.tags || [];
      if (!currentTags.includes(tagInput.trim())) {
        setFormData((prev) => ({ ...prev, tags: [...(prev.tags || []), tagInput.trim()] }));
        setSaveStatus("Chưa lưu");
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: (prev.tags || []).filter((t) => t !== tagToRemove),
    }));
    setSaveStatus("Chưa lưu");
  };

  const validateAndPublish = async () => {
    const errors: { field: string; id: string }[] = [];
    if (!formData.title.trim()) errors.push({ field: "Tiêu đề bài viết", id: "input-title" });
    if (!formData.slug.trim()) errors.push({ field: "Đường dẫn (Slug)", id: "input-slug" });
    if (!formData.thumbnail) errors.push({ field: "Ảnh bìa bài viết", id: "input-thumbnail" });

    const finalContent = editorMode === "visual" ? blocksToMarkdown(blocks) : formData.content;
    if (!finalContent.trim()) errors.push({ field: "Nội dung bài viết", id: "input-content" });

    if (errors.length > 0) {
      const firstError = errors[0];
      toast.error(
        "Không thể đăng bài",
        `Vui lòng bổ sung: ${errors.map((e) => e.field).join(", ")}`,
        5000
      );
      if (firstError.id === "input-slug") {
        setShowSettings(true);
      }
      setTimeout(() => {
        const el = document.getElementById(firstError.id);
        el?.focus();
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
      return;
    }

    setIsSaving(true);
    const postPayload = {
      ...formData,
      content: finalContent,
      status: "published" as const,
      id: formData.id || `post-${Date.now()}`,
      publishedAt: (formData as any).publishedAt || new Date().toISOString().split("T")[0],
    };

    try {
      if (isEdit && formData.id) {
        await updatePost(formData.id, postPayload);
      } else {
        await addPost(postPayload as any);
      }
      setSaveStatus("Đã lưu lúc " + new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }));
      toast.success("Đã xuất bản bài viết thành công!");
      router.push("/admin/bai-viet");
    } catch (error: any) {
      toast.error("Lỗi khi đăng bài", error.message);
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F0F4F9] -m-6 md:-m-8">
      {/* 1. GOOGLE DOCS TOPBAR & TOOLBAR */}
      <GoogleDocsToolbar
        title={formData.title}
        onTitleChange={handleTitleChange}
        saveStatus={saveStatus}
        lastSaved={lastSaved}
        isSaving={isSaving}
        onSaveDraft={() => handleAutoSave(editorMode === "visual" ? blocksToMarkdown(blocks) : formData.content)}
        onPublish={validateAndPublish}
        onPreview={() => setShowPreview(true)}
        showSettings={showSettings}
        onToggleSettings={() => setShowSettings(!showSettings)}
        onInsertBlock={handleInsertBlockFromToolbar}
        onInsertTable={handleInsertTableFromToolbar}
        onChangeActiveBlockType={(type, level) => {
          if (type === "heading") {
            handleInsertBlockFromToolbar("heading", { level: level || 2, text: "" });
          } else {
            handleInsertBlockFromToolbar("text");
          }
        }}
      />

      {/* 2. GOOGLE DOCS RULER */}
      <GoogleDocsRuler />

      {/* 3. WORKSPACE CANVAS (Single Pageless Paper Sheet) */}
      <div className="flex-1 overflow-y-auto relative flex justify-center py-6 px-3 sm:px-6">
        {/* THE SINGLE PAGELESS DOCUMENT SHEET (Tờ giấy duy nhất - Co giãn vô tận) */}
        <div
          onPaste={handleDocumentPaste}
          className="w-full max-w-[850px] bg-white shadow-[0_1px_3px_rgba(60,64,67,0.15),0_4px_8px_rgba(60,64,67,0.1)] rounded-sm min-h-[1100px] flex flex-col justify-between transition-all px-8 sm:px-14 md:px-18 py-10 md:py-14"
        >
          {/* ============================================================== */}
          {/* PHẦN 1: HEADER (Đầu trang tài liệu)                           */}
          {/* ============================================================== */}
          <header className="space-y-6 pb-8 border-b border-[#E1E5EA]">
            {/* Ảnh bìa bài viết (Cover Image) */}
            <div
              id="input-thumbnail"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleThumbDrop}
              className="relative w-full aspect-[21/9] sm:aspect-[2.4/1] rounded-lg overflow-hidden bg-[#FAF8F5] border border-[#DADCE0] flex items-center justify-center group/cover shadow-xs"
            >
              {formData.thumbnail ? (
                <>
                  <Image src={formData.thumbnail} alt="Ảnh bìa bài viết" fill className="object-cover" priority />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/cover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <label className="px-3.5 py-1.5 bg-white/90 hover:bg-white text-[#1F1F1F] rounded-full text-xs font-semibold cursor-pointer shadow transition-all">
                      Đổi ảnh bìa
                      <input type="file" accept="image/*" className="hidden" onChange={handleThumbnailUpload} disabled={isUploadingThumb} />
                    </label>
                    <button
                      type="button"
                      onClick={() => setFormData((p) => ({ ...p, thumbnail: "" }))}
                      className="px-3.5 py-1.5 bg-red-600/90 hover:bg-red-600 text-white rounded-full text-xs font-semibold shadow transition-all"
                    >
                      Xóa bìa
                    </button>
                  </div>
                </>
              ) : (
                <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center hover:bg-[#F1F3F4] transition-colors p-4">
                  {isUploadingThumb ? (
                    <Loader2 className="w-6 h-6 animate-spin text-[#1A73E8]" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-[#70757A] mb-1.5" />
                  )}
                  <span className="text-xs font-semibold text-[#1F1F1F]">+ Thêm ảnh bìa bài viết (Cover)</span>
                  <span className="text-[11px] text-[#5F6368] mt-0.5">Kéo thả ảnh hoặc click để tải lên từ máy tính</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleThumbnailUpload} disabled={isUploadingThumb} />
                </label>
              )}
            </div>

            {/* Tiêu đề H1 lớn (Article Title) */}
            <div>
              <AutoResizeTextarea
                id="input-title"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Tiêu đề bài viết..."
                className="w-full bg-transparent text-[32px] sm:text-[38px] md:text-[44px] font-serif font-bold text-[#3D2314] focus:outline-none placeholder:text-[#5F6368]/30 resize-none overflow-hidden block leading-[1.25] tracking-tight transition-shadow"
              />
            </div>

            {/* Dải Metadata: Chuyên mục, Sapo, Tác giả, Thời gian đọc */}
            <div className="space-y-4 pt-2">
              <div className="flex flex-wrap items-center gap-3 text-xs">
                {/* Category Selector */}
                <div className="flex items-center gap-1.5 bg-[#EDF2FA] text-[#1A73E8] px-3 py-1 rounded-full font-medium border border-[#D3E3FD]">
                  <BookOpen className="w-3.5 h-3.5" />
                  <select
                    value={formData.category}
                    onChange={(e) => {
                      setFormData((p) => ({ ...p, category: e.target.value }));
                      setSaveStatus("Chưa lưu");
                    }}
                    className="bg-transparent font-semibold text-xs outline-none cursor-pointer"
                  >
                    <option value="kien-thuc-ve-go">Kiến Thức Về Gỗ</option>
                    <option value="vat-pham-phong-thuy">Vật Phẩm Phong Thủy</option>
                    <option value="nghe-thuat-che-tac">Nghệ Thuật Chế Tác</option>
                    <option value="tin-tuc-su-kien">Tin Tức Xưởng Đông Phong</option>
                  </select>
                </div>

                <div className="flex items-center gap-1 text-[#5F6368]">
                  <Clock className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>Ước tính: {formData.readingTime} phút đọc</span>
                </div>

                <div className="text-[#5F6368]">
                  <span>Tác giả: <strong>Nghệ nhân Đông Phong</strong></span>
                </div>
              </div>

              {/* Sapo / Tóm tắt mở đầu bài viết */}
              <div>
                <AutoResizeTextarea
                  value={formData.excerpt}
                  onChange={(e) => {
                    setFormData((p) => ({ ...p, excerpt: e.target.value }));
                    setSaveStatus("Chưa lưu");
                  }}
                  placeholder="Đoạn văn mở đầu (Sapo) tóm tắt ngắn gọn ý chính của bài viết..."
                  className="w-full bg-[#FAF8F5] border border-[#E8DFC8]/60 rounded-lg p-3 text-sm md:text-base font-serif italic text-[#5A4A42] focus:outline-none focus:border-[#C5A059] resize-none overflow-hidden leading-relaxed placeholder:text-[#5F6368]/40"
                />
              </div>
            </div>
          </header>

          {/* ============================================================== */}
          {/* PHẦN 2: BODY (Nội dung chính — Co giãn vô tận theo số lượng chữ)*/}
          {/* ============================================================== */}
          <main className="flex-1 py-8" id="input-content">
            {editorMode === "visual" ? (
              <VisualBlockEditor
                blocks={blocks}
                onChange={(newBlocks) => {
                  setBlocks(newBlocks);
                  setSaveStatus("Chưa lưu");
                }}
              />
            ) : (
              <textarea
                value={formData.content}
                onChange={(e) => {
                  setFormData((p) => ({ ...p, content: e.target.value }));
                  setSaveStatus("Chưa lưu");
                }}
                className="w-full min-h-[600px] bg-transparent font-mono text-sm leading-relaxed focus:outline-none resize-none p-2 border border-[#DADCE0] rounded-lg"
                placeholder="Nội dung markdown..."
              />
            )}
          </main>

          {/* ============================================================== */}
          {/* PHẦN 3: FOOTER (Chân trang bám đáy tài liệu)                   */}
          {/* ============================================================== */}
          <footer className="pt-8 mt-10 border-t border-[#E1E5EA] space-y-6">
            {/* Lời kết & Cam kết chất lượng gỗ Đông Phong */}
            <div className="p-6 rounded-xl border border-[#E8DFC8] bg-[#FAF8F5] text-center space-y-2.5">
              <div className="w-8 h-8 mx-auto rounded-full bg-[#C5A059]/20 flex items-center justify-center text-[#C5A059]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-serif font-bold text-base md:text-lg text-[#3D2314]">
                Mỹ Nghệ Đông Phong — Giữ Hồn Gỗ Quý
              </h4>
              <p className="text-xs md:text-sm text-[#5A4A42] max-w-xl mx-auto leading-relaxed">
                100% gỗ tự nhiên nguyên khối tuyển chọn kỹ lưỡng. Chế tác thủ công giữ trọn vẹn hương thảo mộc và sắc nước tự nhiên.
              </p>
              <div className="flex items-center justify-center gap-4 pt-2">
                <a
                  href="https://zalo.me/0968888972"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0068FF] text-white rounded-full text-xs font-semibold hover:bg-[#0052cc] transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Tư vấn qua Zalo</span>
                </a>
                <a
                  href="tel:0968888972"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#3D2314] text-white rounded-full text-xs font-semibold hover:bg-[#5C3A21] transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Hotline: 0968.888.972</span>
                </a>
              </div>
            </div>

            {/* Thẻ Tags SEO */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="text-xs font-semibold text-[#5F6368] flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" />
                Thẻ từ khóa:
              </span>
              {(formData.tags || []).map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 bg-[#F1F3F4] text-[#1F1F1F] px-2.5 py-1 rounded-full text-xs hover:bg-[#E5E9EC] transition-colors"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-red-600 transition-colors p-0.5"
                    title="Xóa thẻ này"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="+ Thêm tag và ấn Enter..."
                className="bg-transparent border-b border-[#DADCE0] text-xs px-2 py-0.5 focus:outline-none focus:border-[#1A73E8]"
              />
            </div>
          </footer>
        </div>

        {/* 4. SLIDE-OUT SETTINGS DRAWER (Khi click vào biểu tượng bánh răng) */}
        {showSettings && (
          <div className="w-80 border-l border-[#DADCE0] bg-white shadow-2xl fixed right-0 inset-y-0 z-50 overflow-y-auto p-6 transition-all flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-[#ECEFF3]">
                <h3 className="text-sm font-bold text-[#1F1F1F] uppercase tracking-wider flex items-center gap-1.5">
                  <Settings className="w-4 h-4 text-[#C5A059]" />
                  Cài đặt bài viết
                </h3>
                <button
                  type="button"
                  onClick={() => setShowSettings(false)}
                  className="p-1 rounded-full hover:bg-[#F1F3F4] text-[#5F6368]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Chế độ soạn thảo */}
              <div>
                <label className="text-xs font-semibold text-[#5F6368] mb-1.5 block">Chế độ soạn thảo</label>
                <div className="grid grid-cols-2 gap-2 bg-[#F1F3F4] p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setEditorMode("visual")}
                    className={`py-1.5 text-xs font-semibold rounded-md transition-all ${
                      editorMode === "visual" ? "bg-white text-[#1A73E8] shadow-xs" : "text-[#5F6368]"
                    }`}
                  >
                    Trực quan
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorMode("markdown")}
                    className={`py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1 ${
                      editorMode === "markdown" ? "bg-white text-[#1A73E8] shadow-xs" : "text-[#5F6368]"
                    }`}
                  >
                    <Code className="w-3.5 h-3.5" />
                    Markdown
                  </button>
                </div>
              </div>

              {/* Slug URL */}
              <div>
                <label className="text-xs font-semibold text-[#5F6368] mb-1.5 flex justify-between">
                  <span>Đường dẫn (Slug URL)</span>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((p) => ({ ...p, slug: slugify(p.title) }));
                      setIsSlugManual(false);
                      toast.success("Đã tạo lại slug theo tiêu đề");
                    }}
                    className="text-[11px] text-[#1A73E8] hover:underline flex items-center gap-0.5"
                  >
                    <Wand2 className="w-3 h-3" /> Tự động
                  </button>
                </label>
                <input
                  id="input-slug"
                  type="text"
                  value={formData.slug}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, slug: e.target.value }));
                    setIsSlugManual(true);
                  }}
                  className="w-full bg-[#FAF8F5] border border-[#DADCE0] rounded px-3 py-1.5 text-xs font-mono text-[#1F1F1F] focus:border-[#1A73E8] outline-none"
                />
              </div>

              {/* Ngày xuất bản */}
              <div>
                <label className="text-xs font-semibold text-[#5F6368] mb-1.5 block">Ngày hiển thị bài viết</label>
                <input
                  type="date"
                  value={(formData as any).publishedAt || new Date().toISOString().split("T")[0]}
                  onChange={(e) => setFormData((prev) => ({ ...prev, publishedAt: e.target.value }))}
                  className="w-full bg-[#FAF8F5] border border-[#DADCE0] rounded px-3 py-1.5 text-xs text-[#1F1F1F] focus:border-[#1A73E8] outline-none"
                />
              </div>

              {/* Trạng thái bài viết */}
              <div>
                <label className="text-xs font-semibold text-[#5F6368] mb-1.5 block">Trạng thái phát hành</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value as any }))}
                  className="w-full bg-[#FAF8F5] border border-[#DADCE0] rounded px-3 py-1.5 text-xs text-[#1F1F1F] focus:border-[#1A73E8] outline-none"
                >
                  <option value="draft">Bản nháp (Chưa công khai)</option>
                  <option value="published">Đã đăng (Công khai trên web)</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-[#ECEFF3]">
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="w-full py-2 bg-[#F1F3F4] hover:bg-[#E5E9EC] text-[#1F1F1F] text-xs font-semibold rounded-lg transition-colors"
              >
                Đóng cài đặt
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 5. FULLSCREEN PREVIEW MODAL */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-[#FDFBF7] flex flex-col">
          <div className="flex items-center justify-between px-6 py-3 border-b border-[#DADCE0] bg-white shadow-xs">
            <div className="text-sm font-bold text-[#3D2314] flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#C5A059]" />
              <span>Chế độ xem trước bài viết</span>
            </div>
            <button
              onClick={() => setShowPreview(false)}
              className="px-4 py-1.5 bg-[#EDF2FA] text-[#1F1F1F] hover:bg-[#DDE3EA] rounded-full text-xs font-semibold transition-colors"
            >
              Đóng xem trước
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-[760px] mx-auto px-6 py-12 space-y-6">
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#3D2314] leading-tight">
                {formData.title || "Chưa có tiêu đề"}
              </h1>
              {formData.thumbnail && (
                <div className="relative w-full aspect-[21/9] rounded-xl overflow-hidden shadow-md">
                  <Image src={formData.thumbnail} alt={formData.title} fill className="object-cover" />
                </div>
              )}
              {formData.excerpt && (
                <p className="font-serif italic text-base md:text-lg text-[#5A4A42] p-4 bg-[#FAF8F5] rounded-xl border-l-4 border-[#C5A059]">
                  {formData.excerpt}
                </p>
              )}
              <ArticleContentRenderer content={editorMode === "visual" ? blocksToMarkdown(blocks) : formData.content} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BlogForm;
