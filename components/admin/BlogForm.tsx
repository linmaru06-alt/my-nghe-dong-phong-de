"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Send,
  Image as ImageIcon,
  X,
  Loader2,
  Settings,
  Code,
  ArrowLeft,
  Wand2,
  Monitor,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Eye,
  Save,
  Check,
} from "lucide-react";
import { usePostsStore } from "@/lib/usePosts";
import { slugify } from "@/lib/slugify";
import { toast } from "@/components/ui/Toast";
import { VisualBlockEditor } from "./block-editor/VisualBlockEditor";
import { markdownToBlocks, blocksToMarkdown, EditorBlock } from "@/lib/blockEditor";
import { ArticleContentRenderer } from "@/components/blog/ArticleContentRenderer";
import { AutoResizeTextarea } from "@/components/ui/AutoResizeTextarea";

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

// ═══════════════════════════════════════════════════════
// Tiện ích tính thời gian tương đối cho nhãn trạng thái lưu
// ═══════════════════════════════════════════════════════
function formatRelativeTime(date: Date | null): string {
  if (!date) return "";
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diffSec < 10) return "vừa xong";
  if (diffSec < 60) return `${diffSec} giây trước`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} giờ trước`;
  return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
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
    }
  );

  const [blocks, setBlocks] = useState<EditorBlock[]>(() =>
    markdownToBlocks(formData.content || "")
  );
  const [editorMode, setEditorMode] = useState<"visual" | "markdown">("visual");
  const [showPreview, setShowPreview] = useState(false);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [showSettings, setShowSettings] = useState(false);
  const [showChecklistModal, setShowChecklistModal] = useState(false);

  // Mở settings panel mặc định trên desktop
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 1280) {
      setShowSettings(true);
    }
  }, []);

  const [isUploadingThumb, setIsUploadingThumb] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isEditingReadingTime, setIsEditingReadingTime] = useState(false);

  // Trạng thái lưu: "saved" | "saving" | "unsaved"
  const [saveState, setSaveState] = useState<"saved" | "saving" | "unsaved">("unsaved");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [, setTick] = useState(0);

  // Sync States
  const [isSlugManual, setIsSlugManual] = useState(!!initialData?.slug && isEdit);
  const [isReadingTimeManual, setIsReadingTimeManual] = useState(false);

  // Bộ đếm thời gian cập nhật hiển thị relative time định kỳ mỗi 20 giây
  useEffect(() => {
    const timer = setInterval(() => {
      setTick((t) => t + 1);
    }, 20000);
    return () => clearInterval(timer);
  }, []);

  // Cảnh báo BeforeUnload khi có thay đổi chưa lưu
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (saveState === "unsaved") {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [saveState]);

  // Phím tắt Ctrl+S / Cmd+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSaveDraft();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocks, formData, editorMode]);

  // Hàm thực hiện lưu nháp
  const handleSaveDraft = async () => {
    if (!formData.title.trim()) {
      toast.error("Chưa có tiêu đề", "Vui lòng nhập tiêu đề bài viết trước khi lưu nháp");
      return;
    }

    setSaveState("saving");
    const currentContent = editorMode === "visual" ? blocksToMarkdown(blocks) : formData.content;

    try {
      const payload: BlogFormData = {
        ...formData,
        content: currentContent,
        id: formData.id || `post-${Date.now()}`,
        status: "draft",
      };

      if (isEdit && formData.id) {
        await updatePost(formData.id, payload);
      } else {
        if (!formData.id) {
          setFormData((prev) => ({ ...prev, id: payload.id }));
        }
        await addPost(payload as any);
      }

      setLastSaved(new Date());
      setSaveState("saved");
      toast.success("Đã lưu bản nháp thành công");
    } catch (e: any) {
      setSaveState("unsaved");
      toast.error("Lưu nháp thất bại", e.message);
    }
  };

  // Debounced Auto Calculations & Sync (3 giây)
  useEffect(() => {
    const timer = setTimeout(() => {
      const contentStr = editorMode === "visual" ? blocksToMarkdown(blocks) : formData.content;

      // Tính toán thời gian đọc tự động: Math.ceil(số từ / 200)
      if (!isReadingTimeManual) {
        const words = contentStr.trim() ? contentStr.trim().split(/\s+/).length : 0;
        const calcReadingTime = Math.max(1, Math.ceil(words / 200));
        if (calcReadingTime !== formData.readingTime) {
          setFormData((prev) => ({ ...prev, readingTime: calcReadingTime }));
        }
      }

      // Sync Content to formData
      if (contentStr !== formData.content) {
        setFormData((prev) => ({ ...prev, content: contentStr }));
      }
    }, 1000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocks, editorMode, isReadingTimeManual]);

  // Tự động lưu nháp debounce 3 giây khi có nội dung và tiêu đề
  useEffect(() => {
    if (!formData.title.trim()) return;
    if (saveState !== "unsaved") return;

    const timer = setTimeout(() => {
      const currentContent = editorMode === "visual" ? blocksToMarkdown(blocks) : formData.content;
      // Chỉ auto-save ngầm không hiển thị toast ồn ào
      setSaveState("saving");
      const payload = {
        ...formData,
        content: currentContent,
        id: formData.id || `post-${Date.now()}`,
        status: "draft" as const,
      };

      const savePromise = isEdit && formData.id
        ? updatePost(formData.id, payload)
        : addPost(payload as any);

      savePromise
        .then(() => {
          if (!formData.id) {
            setFormData((prev) => ({ ...prev, id: payload.id }));
          }
          setLastSaved(new Date());
          setSaveState("saved");
        })
        .catch(() => {
          setSaveState("unsaved");
        });
    }, 3000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocks, formData.title, formData.slug, formData.excerpt, formData.thumbnail, saveState]);

  // Xử lý thay đổi tiêu đề
  const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const title = e.target.value;
    const updates: Partial<BlogFormData> = { title };
    if (!isSlugManual && (!isEdit || formData.status === "draft")) {
      updates.slug = slugify(title);
    }
    setFormData((prev) => ({ ...prev, ...updates }));
    setSaveState("unsaved");
  };

  // Tự động gợi ý tóm tắt từ đoạn văn đầu tiên
  const generateExcerpt = () => {
    const firstText = blocks.find((b) => b.type === "text" && b.data.text);
    if (firstText && firstText.data.text) {
      const textStr = firstText.data.text as string;
      const excerpt = textStr.substring(0, 160) + (textStr.length > 160 ? "..." : "");
      setFormData((prev) => ({ ...prev, excerpt }));
      setSaveState("unsaved");
      toast.success("Đã áp dụng tóm tắt tự động");
    } else {
      toast.error("Chưa có đoạn văn bản nào để gợi ý");
    }
  };

  // Upload thumbnail
  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ảnh quá lớn", "Vui lòng chọn ảnh dưới 5MB");
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
        setSaveState("unsaved");
        toast.success("Tải ảnh đại diện thành công");
      } else {
        throw new Error(json.error || "Lỗi máy chủ khi tải ảnh");
      }
    } catch (err: any) {
      toast.error("Lỗi tải ảnh", err.message);
    } finally {
      setIsUploadingThumb(false);
      e.target.value = "";
    }
  };

  // Kéo thả thumbnail
  const handleThumbDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      handleThumbnailUpload({ target: { files: [file] } } as any);
    }
  };

  // Dán thumbnail từ clipboard
  const handleThumbPaste = (e: React.ClipboardEvent) => {
    const files = Array.from(e.clipboardData.files);
    const img = files.find((f) => f.type.startsWith("image/"));
    if (img) {
      e.preventDefault();
      handleThumbnailUpload({ target: { files: [img] } } as any);
    }
  };

  // Kiểm tra checklist trước khi đăng bài
  const getPublishChecklist = () => {
    const finalContent = editorMode === "visual" ? blocksToMarkdown(blocks) : formData.content;
    return [
      {
        id: "input-title",
        label: "Tiêu đề bài viết",
        isComplete: !!formData.title.trim(),
        required: true,
        inSettings: false,
        hint: "Cần có tiêu đề rõ ràng để định danh bài viết",
      },
      {
        id: "input-slug",
        label: "Đường dẫn bài viết (Slug)",
        isComplete: !!formData.slug.trim(),
        required: true,
        inSettings: true,
        hint: "Đường dẫn thân thiện cho công cụ tìm kiếm",
      },
      {
        id: "input-thumbnail",
        label: "Ảnh đại diện (16:9)",
        isComplete: !!formData.thumbnail,
        required: true,
        inSettings: true,
        hint: "Ảnh thớ gỗ hoặc tác phẩm sắc nét để chia sẻ",
      },
      {
        id: "input-content",
        label: "Nội dung bài viết",
        isComplete: finalContent.trim().length > 20,
        required: true,
        inSettings: false,
        hint: "Ít nhất 1-2 phân đoạn nội dung chất lượng",
      },
      {
        id: "input-excerpt",
        label: "Tóm tắt ngắn (Khuyến nghị)",
        isComplete: !!formData.excerpt.trim(),
        required: false,
        inSettings: true,
        hint: "Hiển thị mô tả bài viết trên Google và Zalo/Facebook",
      },
    ];
  };

  // Xử lý khi nhấn nút Đăng bài
  const handlePublishClick = () => {
    const checklist = getPublishChecklist();
    const hasMissingRequired = checklist.some((item) => item.required && !item.isComplete);
    const isMissingExcerpt = !checklist.find((item) => item.id === "input-excerpt")?.isComplete;

    if (hasMissingRequired || isMissingExcerpt) {
      setShowChecklistModal(true);
      return;
    }

    // Nếu đã hoàn thiện đầy đủ 100% -> Đăng ngay
    executePublish();
  };

  // Điều hướng và highlight ô bị thiếu
  const handleFixField = (fieldId: string, inSettings: boolean) => {
    setShowChecklistModal(false);
    if (inSettings) {
      setShowSettings(true);
    }

    setTimeout(() => {
      const el = document.getElementById(fieldId);
      if (el) {
        el.focus();
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("ring-2", "ring-[#C5A059]", "ring-offset-2");
        setTimeout(() => {
          el.classList.remove("ring-2", "ring-[#C5A059]", "ring-offset-2");
        }, 2500);
      }
    }, 150);
  };

  // Thực thi đăng bài thực tế
  const executePublish = async () => {
    setIsSaving(true);
    setShowChecklistModal(false);

    const finalContent = editorMode === "visual" ? blocksToMarkdown(blocks) : formData.content;
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
      setSaveState("saved");
      setLastSaved(new Date());
      toast.success("Xuất bản bài viết thành công!");
      router.push("/admin/bai-viet");
    } catch (error: any) {
      toast.error("Lỗi khi đăng bài", error.message);
      setIsSaving(false);
    }
  };

  const checklist = getPublishChecklist();
  const allRequiredValid = checklist.every((i) => !i.required || i.isComplete);

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFBF7] -m-6 md:-m-8 font-sans selection:bg-[#C5A059]/20 selection:text-[#3D2314]">
      {/* ═══════════════════════════════════════════════════════ */}
      {/* 1. TOP BAR DÍNH (STICKY) PHÍA TRÊN                     */}
      {/* ═══════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-40 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-border/70 px-4 md:px-6 py-2.5 flex items-center justify-between transition-all">
        {/* Lề trái: Quay lại & Trạng thái lưu */}
        <div className="flex items-center gap-3 md:gap-4 min-w-0">
          <Link
            href="/admin/bai-viet"
            className="flex items-center gap-1.5 text-[13px] font-medium text-text-muted hover:text-[#3D2314] transition-colors shrink-0"
            title="Quay lại danh sách bài viết"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Quay lại danh sách</span>
          </Link>

          <div className="w-px h-4 bg-border/70 hidden sm:block shrink-0" />

          {/* Trạng thái lưu trực quan */}
          <div className="text-[12px] md:text-[13px] text-text-muted flex items-center gap-1.5 truncate">
            {saveState === "saving" && (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C5A059] shrink-0" />
                <span>Đang lưu...</span>
              </>
            )}
            {saveState === "unsaved" && (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 animate-pulse" />
                <span className="text-amber-700 font-medium">Chưa lưu</span>
              </>
            )}
            {saveState === "saved" && (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-emerald-700">
                  Bản nháp · Đã lưu {formatRelativeTime(lastSaved)}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Lề phải: Chế độ soạn thảo, Xem trước, Lưu nháp, Đăng bài & Cài đặt */}
        <div className="flex items-center gap-2 md:gap-2.5 shrink-0">
          {/* Segmented control Trực quan / Markdown */}
          <div className="flex items-center bg-surface border border-border/80 rounded-lg p-0.5 mr-1 hidden sm:flex">
            <button
              type="button"
              onClick={() => setEditorMode("visual")}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                editorMode === "visual"
                  ? "bg-white text-primary shadow-xs"
                  : "text-text-muted hover:text-text"
              }`}
            >
              Trực quan
            </button>
            <button
              type="button"
              onClick={() => setEditorMode("markdown")}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                editorMode === "markdown"
                  ? "bg-white text-primary shadow-xs"
                  : "text-text-muted hover:text-text"
              }`}
            >
              <Code className="w-3 h-3" />
              <span>Markdown</span>
            </button>
          </div>

          {/* Nút Xem trước (Ghost/Outline) */}
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium rounded-lg border border-border/80 bg-white text-text hover:bg-surface hover:border-border transition-all shadow-xs"
            title="Xem trước bài viết"
          >
            <Eye className="w-3.5 h-3.5 text-text-muted" />
            <span className="hidden md:inline">Xem trước</span>
          </button>

          {/* Nút Lưu nháp (Ghost/Outline) */}
          <button
            type="button"
            onClick={handleSaveDraft}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium rounded-lg border border-border/80 bg-white text-text hover:bg-surface hover:border-border transition-all shadow-xs"
            title="Lưu bản nháp (Ctrl+S)"
          >
            <Save className="w-3.5 h-3.5 text-text-muted" />
            <span className="hidden md:inline">Lưu nháp</span>
          </button>

          {/* Nút Đăng bài (Nút Chính, Nâu Đậm) */}
          <button
            type="button"
            disabled={isSaving}
            onClick={handlePublishClick}
            className="flex items-center gap-1.5 px-4 md:px-5 py-1.5 bg-[#3D2314] hover:bg-[#2A160C] text-white text-[13px] font-semibold rounded-lg transition-all shadow-sm disabled:opacity-70 focus:ring-2 focus:ring-offset-2 focus:ring-[#3D2314]"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#C5A059]" />
            ) : (
              <Send className="w-3.5 h-3.5 text-[#C5A059]" />
            )}
            <span>Đăng bài</span>
          </button>

          <div className="w-px h-4 bg-border/70 mx-0.5" />

          {/* Nút Bánh Răng Cài Đặt */}
          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-lg transition-colors focus:ring-2 focus:ring-offset-1 focus:ring-primary ${
              showSettings
                ? "bg-surface text-[#3D2314] border border-border shadow-xs"
                : "text-text-muted hover:bg-surface border border-transparent"
            }`}
            title="Cài đặt bài viết"
            aria-label="Cài đặt bài viết"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* 2. KHUNG NỘI DUNG TRUNG TÂM & PANEL CÀI ĐẶT             */}
      {/* ═══════════════════════════════════════════════════════ */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Vùng soạn thảo ở giữa: Rộng tối đa ~720px, canh giữa, nền phẳng */}
        <main className="flex-1 overflow-y-auto" id="input-content">
          <div className="max-w-[720px] mx-auto px-4 md:px-6 py-8 md:py-14 pb-32">
            {/* Tiêu đề bài viết: Serif ~40px, không viền, placeholder mờ */}
            <AutoResizeTextarea
              id="input-title"
              value={formData.title}
              onChange={handleTitleChange}
              placeholder="Tiêu đề bài viết..."
              className="w-full bg-transparent text-[32px] sm:text-[38px] md:text-[42px] font-serif font-bold text-[#3D2314] focus:outline-none placeholder:text-text-muted/25 resize-none overflow-hidden block leading-[1.2] mb-8 transition-shadow rounded"
            />

            {/* Trình soạn thảo Block / Markdown */}
            {editorMode === "visual" ? (
              <VisualBlockEditor
                blocks={blocks}
                onChange={(newBlocks) => {
                  setBlocks(newBlocks);
                  setSaveState("unsaved");
                }}
              />
            ) : (
              <textarea
                value={formData.content}
                onChange={(e) => {
                  setFormData((p) => ({ ...p, content: e.target.value }));
                  setSaveState("unsaved");
                }}
                className="w-full min-h-[550px] bg-transparent font-mono text-[14px] leading-relaxed text-text focus:outline-none resize-none p-2 border border-border/40 rounded-xl"
                placeholder="Nhập nội dung markdown chuẩn của bài viết..."
              />
            )}
          </div>
        </main>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* 3. PANEL CÀI ĐẶT BÀI VIẾT (SIDEBAR / BOTTOM SHEET)    */}
        {/* ═══════════════════════════════════════════════════════ */}
        {showSettings && (
          <>
            {/* Mobile backdrop */}
            <div
              className="xl:hidden fixed inset-0 bg-black/30 z-40 transition-opacity backdrop-blur-xs"
              onClick={() => setShowSettings(false)}
            />

            <aside className="fixed xl:relative z-50 xl:z-30 bottom-0 xl:bottom-auto inset-x-0 xl:inset-x-auto xl:right-0 w-full xl:w-80 border-t xl:border-t-0 xl:border-l border-border/80 bg-white overflow-y-auto p-5 md:p-6 shadow-2xl xl:shadow-none h-[82vh] xl:h-auto rounded-t-2xl xl:rounded-none flex flex-col transition-transform">
              {/* Header panel */}
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-[#C5A059]" />
                  <h3 className="text-base font-bold text-primary font-serif">
                    Cài đặt bài viết
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSettings(false)}
                  className="xl:hidden p-1.5 rounded-md text-text-muted hover:bg-surface transition-colors"
                  aria-label="Đóng bảng cài đặt"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-5 text-left">
                {/* 1. Nhóm chủ đề */}
                <div>
                  <label className="text-[13px] text-text-muted mb-1.5 block font-medium">
                    Nhóm chủ đề <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, category: e.target.value }));
                      setSaveState("unsaved");
                    }}
                    className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-[13px] text-text focus:outline-none focus:border-primary transition-colors"
                  >
                    <option value="kien-thuc-ve-go">Kiến thức về gỗ quý</option>
                    <option value="huong-dan-lua-chon">Hướng dẫn lựa chọn & thẩm định</option>
                    <option value="bao-quan-san-pham">Bảo quản & Phong thủy đời sống</option>
                  </select>
                </div>

                {/* 2. Đường dẫn (Slug) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[13px] text-text-muted font-medium">
                      Đường dẫn (Slug) <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData((p) => ({ ...p, slug: slugify(p.title) }));
                        setIsSlugManual(false);
                        setSaveState("unsaved");
                        toast.success("Đã tạo lại đường dẫn từ tiêu đề");
                      }}
                      className="text-[11px] text-[#C5A059] hover:underline flex items-center gap-1 font-medium"
                      title="Tạo lại slug tự động từ tiêu đề"
                    >
                      <Wand2 className="w-3 h-3" />
                      <span>Tạo lại</span>
                    </button>
                  </div>
                  <input
                    id="input-slug"
                    type="text"
                    value={formData.slug}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, slug: e.target.value }));
                      setIsSlugManual(true);
                      setSaveState("unsaved");
                    }}
                    placeholder="duong-dan-bai-viet"
                    className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-[13px] font-mono text-text focus:outline-none focus:border-primary transition-shadow"
                  />
                  <span className="text-[10px] text-text-muted mt-1 block">
                    Định dạng: /bai-viet/{formData.slug || "..."}
                  </span>
                </div>

                {/* 3. Tóm tắt ngắn (Excerpt) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[13px] text-text-muted font-medium">
                      Tóm tắt ngắn{" "}
                      <span
                        className={`text-xs ${
                          formData.excerpt.length > 160
                            ? "text-amber-600 font-semibold"
                            : "text-text-muted/70"
                        }`}
                      >
                        ({formData.excerpt.length}/160)
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={generateExcerpt}
                      className="text-[11px] text-[#C5A059] hover:underline flex items-center gap-1 font-medium"
                      title="Lấy đoạn văn đầu tiên làm tóm tắt"
                    >
                      <Wand2 className="w-3 h-3" />
                      <span>Dùng gợi ý</span>
                    </button>
                  </div>
                  <textarea
                    id="input-excerpt"
                    rows={3}
                    value={formData.excerpt}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, excerpt: e.target.value }));
                      setSaveState("unsaved");
                    }}
                    placeholder="Mô tả súc tích cho bài viết (tối ưu 160 ký tự cho SEO)..."
                    className="w-full bg-surface border border-border rounded-lg p-2.5 text-[13px] text-text focus:outline-none focus:border-primary resize-none transition-colors"
                  />
                </div>

                {/* 4. Ảnh đại diện (16:9) */}
                <div>
                  <label className="text-[13px] text-text-muted mb-1.5 block font-medium">
                    Ảnh đại diện <span className="text-red-500">*</span>
                  </label>
                  <div
                    id="input-thumbnail"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleThumbDrop}
                    onPaste={handleThumbPaste}
                    tabIndex={0}
                    className="relative aspect-[16/9] rounded-lg overflow-hidden bg-surface border border-border flex items-center justify-center group focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent transition-all outline-none"
                  >
                    {formData.thumbnail ? (
                      <>
                        <Image
                          src={formData.thumbnail}
                          alt="Thumbnail"
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2.5">
                          <label className="px-3 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-md text-white text-xs font-medium cursor-pointer transition-colors">
                            Đổi ảnh
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleThumbnailUpload}
                              disabled={isUploadingThumb}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData((p) => ({ ...p, thumbnail: "" }));
                              setSaveState("unsaved");
                            }}
                            className="px-3 py-1.5 bg-red-500/80 hover:bg-red-600 backdrop-blur-sm rounded-md text-white text-xs font-medium transition-colors"
                          >
                            Xóa
                          </button>
                        </div>
                      </>
                    ) : (
                      <label className="cursor-pointer text-center w-full h-full flex flex-col items-center justify-center p-3 hover:bg-surface/80 transition-colors">
                        {isUploadingThumb ? (
                          <Loader2 className="w-5 h-5 animate-spin text-[#C5A059]" />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-border mb-1" />
                        )}
                        <span className="text-[11px] text-text-muted mt-1 font-medium">
                          Kéo thả, dán ảnh hoặc click chọn file
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleThumbnailUpload}
                          disabled={isUploadingThumb}
                        />
                      </label>
                    )}
                  </div>

                  {!showUrlInput ? (
                    <button
                      type="button"
                      onClick={() => setShowUrlInput(true)}
                      className="text-[11px] text-primary hover:underline mt-1.5 block"
                    >
                      Dùng URL ảnh ngoài
                    </button>
                  ) : (
                    <div className="flex gap-1.5 mt-2">
                      <input
                        type="text"
                        value={formData.thumbnail}
                        onChange={(e) => {
                          setFormData((prev) => ({ ...prev, thumbnail: e.target.value }));
                          setSaveState("unsaved");
                        }}
                        placeholder="https://..."
                        className="flex-1 bg-surface border border-border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-primary"
                      />
                      <button
                        type="button"
                        onClick={() => setShowUrlInput(false)}
                        className="p-1.5 text-text-muted hover:text-text"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* 5. Thời gian đọc (Nhãn hiển thị + Ghi đè) */}
                <div className="pt-2 border-t border-border/50">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[13px] text-text-muted font-medium">
                      Thời gian đọc
                    </label>
                    {isReadingTimeManual && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsReadingTimeManual(false);
                          const words = (
                            editorMode === "visual"
                              ? blocksToMarkdown(blocks)
                              : formData.content
                          )
                            .trim()
                            .split(/\s+/).length;
                          const calc = Math.max(1, Math.ceil(words / 200));
                          setFormData((p) => ({ ...p, readingTime: calc }));
                          setSaveState("unsaved");
                        }}
                        className="text-[11px] text-[#C5A059] hover:underline"
                      >
                        Tự tính lại
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-border rounded-lg text-[13px] font-medium text-primary">
                      <Clock className="w-3.5 h-3.5 text-[#C5A059]" />
                      <span>~{formData.readingTime} phút đọc</span>
                    </div>

                    {!isEditingReadingTime ? (
                      <button
                        type="button"
                        onClick={() => setIsEditingReadingTime(true)}
                        className="text-[11px] text-text-muted hover:text-primary transition-colors underline"
                      >
                        Ghi đè
                      </button>
                    ) : (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="1"
                          value={formData.readingTime}
                          onChange={(e) => {
                            const val = Math.max(1, parseInt(e.target.value) || 1);
                            setFormData((p) => ({ ...p, readingTime: val }));
                            setIsReadingTimeManual(true);
                            setSaveState("unsaved");
                          }}
                          className="w-14 bg-white border border-border rounded px-2 py-1 text-xs focus:outline-none focus:border-primary"
                        />
                        <button
                          type="button"
                          onClick={() => setIsEditingReadingTime(false)}
                          className="px-2 py-1 bg-surface text-primary text-xs rounded font-medium border border-border"
                        >
                          Xong
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </aside>
          </>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* 4. MODAL CHECKLIST KIỂM TRA TRƯỚC KHI ĐĂNG BÀI         */}
      {/* ═══════════════════════════════════════════════════════ */}
      {showChecklistModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-border animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/50">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#C5A059]" />
                <h3 className="font-serif font-bold text-lg text-primary">
                  Kiểm tra trước khi xuất bản
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowChecklistModal(false)}
                className="p-1 rounded-md text-text-muted hover:bg-surface"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-text-muted mb-4">
              Vui lòng hoàn tất các mục bắt buộc bên dưới để bài viết hiển thị hoàn hảo nhất trên website và mạng xã hội:
            </p>

            <div className="space-y-2.5 mb-6">
              {checklist.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 rounded-xl border flex items-start justify-between gap-3 transition-colors ${
                    item.isComplete
                      ? "bg-emerald-50/50 border-emerald-200/80"
                      : item.required
                      ? "bg-red-50/50 border-red-200/80"
                      : "bg-amber-50/50 border-amber-200/80"
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {item.isComplete ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : item.required ? (
                      <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="text-[13px] font-semibold text-text flex items-center gap-1.5">
                        <span>{item.label}</span>
                        {item.required ? (
                          <span className="text-[10px] text-red-600 bg-red-100/60 px-1.5 py-0.2 rounded font-normal">
                            Bắt buộc
                          </span>
                        ) : (
                          <span className="text-[10px] text-amber-700 bg-amber-100/60 px-1.5 py-0.2 rounded font-normal">
                            Khuyến nghị
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-text-muted mt-0.5">{item.hint}</div>
                    </div>
                  </div>

                  {!item.isComplete && (
                    <button
                      type="button"
                      onClick={() => handleFixField(item.id, item.inSettings)}
                      className="text-xs font-semibold text-primary underline shrink-0 hover:text-[#C5A059] transition-colors"
                    >
                      Bổ sung ngay
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowChecklistModal(false)}
                className="px-4 py-2 text-xs font-medium text-text-muted hover:text-text rounded-lg transition-colors"
              >
                Quay lại sửa
              </button>

              <button
                type="button"
                disabled={!allRequiredValid || isSaving}
                onClick={executePublish}
                className="flex items-center gap-1.5 px-5 py-2 bg-[#3D2314] hover:bg-[#2A160C] text-white text-xs font-semibold rounded-lg shadow-sm disabled:opacity-50 transition-colors"
              >
                {isSaving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5 text-[#C5A059]" />
                )}
                <span>Xác nhận xuất bản ngay</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════ */}
      {/* 5. MODAL XEM TRƯỚC (DESKTOP & MOBILE SWITCHER)         */}
      {/* ═══════════════════════════════════════════════════════ */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-[#FDFBF7] flex flex-col animate-in fade-in duration-150">
          <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-border bg-white shadow-xs">
            <div className="text-[13px] font-bold text-primary font-serif hidden sm:block">
              Xem trước bài viết: Mỹ Nghệ Đông Phong
            </div>

            {/* Switcher Desktop / Mobile */}
            <div className="flex items-center bg-surface border border-border/80 rounded-lg overflow-hidden mx-auto sm:mx-0 p-0.5">
              <button
                type="button"
                onClick={() => setPreviewMode("desktop")}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded transition-colors ${
                  previewMode === "desktop"
                    ? "bg-white text-primary shadow-xs"
                    : "text-text-muted hover:text-text"
                }`}
                title="Xem trên máy tính"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Desktop (720px)</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode("mobile")}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded transition-colors ${
                  previewMode === "mobile"
                    ? "bg-white text-primary shadow-xs"
                    : "text-text-muted hover:text-text"
                }`}
                title="Xem trên điện thoại"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile (375px)</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowPreview(false)}
              className="px-4 py-1.5 bg-surface text-text hover:text-primary rounded-lg border border-border text-xs font-medium transition-colors"
            >
              Đóng xem trước
            </button>
          </div>

          <div className="flex-1 overflow-y-auto bg-surface/30 p-4 md:p-8 flex justify-center">
            <div
              className={`transition-all duration-300 bg-white min-h-full rounded-xl shadow-lg border border-border/60 ${
                previewMode === "desktop"
                  ? "w-full max-w-[720px] p-6 md:p-10"
                  : "w-full max-w-[375px] p-4 md:p-6"
              }`}
            >
              {/* Header preview: Tiêu đề, meta, ảnh đại diện */}
              <div className="mb-8 border-b border-border/50 pb-6">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#C5A059] bg-[#C5A059]/10 px-2.5 py-1 rounded-full inline-block mb-3">
                  {formData.category === "kien-thuc-ve-go"
                    ? "Kiến thức về gỗ"
                    : formData.category === "huong-dan-lua-chon"
                    ? "Hướng dẫn lựa chọn"
                    : "Bảo quản sản phẩm"}
                </span>

                <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#3D2314] leading-tight mb-3">
                  {formData.title || "Chưa có tiêu đề bài viết"}
                </h1>

                <div className="flex items-center gap-4 text-xs text-text-muted mb-5">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>~{formData.readingTime} phút đọc</span>
                  </span>
                  <span>·</span>
                  <span>Tác giả: Nghệ nhân Đông Phong</span>
                </div>

                {formData.thumbnail && (
                  <div className="relative aspect-[16/9] rounded-xl overflow-hidden shadow-sm my-4 border border-border/40">
                    <Image
                      src={formData.thumbnail}
                      alt={formData.title || "Thumbnail"}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                {formData.excerpt && (
                  <p className="text-[15px] font-serif italic text-[#5A4A42] leading-relaxed border-l-2 border-[#C5A059] pl-3 my-4">
                    {formData.excerpt}
                  </p>
                )}
              </div>

              {/* Nội dung bài viết thực tế qua ArticleContentRenderer */}
              <ArticleContentRenderer
                content={editorMode === "visual" ? blocksToMarkdown(blocks) : formData.content}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BlogForm;
