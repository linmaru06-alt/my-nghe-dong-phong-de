"use client";

import React, { useState, useEffect } from "react";
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
  Save,
  Check,
  ExternalLink,
  FileText,
  Sliders,
  Globe,
} from "lucide-react";
import { usePostsStore } from "@/lib/usePosts";
import { slugify } from "@/lib/slugify";
import { toast } from "@/components/ui/Toast";
import { VisualBlockEditor } from "./block-editor/VisualBlockEditor";
import { markdownToBlocks, blocksToMarkdown, EditorBlock } from "@/lib/blockEditor";
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
// Tiện ích tính thời gian tương đối
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

  // Squarespace In-Place Viewport Mode: "desktop" | "mobile"
  const [viewportMode, setViewportMode] = useState<"desktop" | "mobile">("desktop");

  // Squarespace Tabbed Post Settings Modal
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState<"content" | "options" | "seo">("content");

  const [isUploadingThumb, setIsUploadingThumb] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isEditingReadingTime, setIsEditingReadingTime] = useState(false);

  // Trạng thái lưu
  const [saveState, setSaveState] = useState<"saved" | "saving" | "unsaved">("unsaved");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [, setTick] = useState(0);

  // Sync States
  const [isSlugManual, setIsSlugManual] = useState(!!initialData?.slug && isEdit);
  const [isReadingTimeManual, setIsReadingTimeManual] = useState(false);

  // Ticker cập nhật relative time
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 20000);
    return () => clearInterval(timer);
  }, []);

  // Cảnh báo BeforeUnload
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

  // Phím tắt Ctrl+S
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

  // Hàm Lưu Nháp
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

  // Debounced Auto Calculations
  useEffect(() => {
    const timer = setTimeout(() => {
      const contentStr = editorMode === "visual" ? blocksToMarkdown(blocks) : formData.content;

      // Tính thời gian đọc = Math.ceil(tổng từ / 200)
      if (!isReadingTimeManual) {
        const words = contentStr.trim() ? contentStr.trim().split(/\s+/).length : 0;
        const calcReadingTime = Math.max(1, Math.ceil(words / 200));
        if (calcReadingTime !== formData.readingTime) {
          setFormData((prev) => ({ ...prev, readingTime: calcReadingTime }));
        }
      }

      if (contentStr !== formData.content) {
        setFormData((prev) => ({ ...prev, content: contentStr }));
      }
    }, 1000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocks, editorMode, isReadingTimeManual]);

  // Debounce Auto Save (3 giây)
  useEffect(() => {
    if (!formData.title.trim() || saveState !== "unsaved") return;

    const timer = setTimeout(() => {
      const currentContent = editorMode === "visual" ? blocksToMarkdown(blocks) : formData.content;
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

  // Tiêu đề thay đổi
  const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const title = e.target.value;
    const updates: Partial<BlogFormData> = { title };
    if (!isSlugManual && (!isEdit || formData.status === "draft")) {
      updates.slug = slugify(title);
    }
    setFormData((prev) => ({ ...prev, ...updates }));
    setSaveState("unsaved");
  };

  // Gợi ý tóm tắt
  const generateExcerpt = () => {
    const firstText = blocks.find((b) => b.type === "text" && b.data.text);
    if (firstText && firstText.data.text) {
      const textStr = firstText.data.text as string;
      const excerpt = textStr.substring(0, 160) + (textStr.length > 160 ? "..." : "");
      setFormData((prev) => ({ ...prev, excerpt }));
      setSaveState("unsaved");
      toast.success("Đã trích xuất tóm tắt tự động");
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

  const handleThumbDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      handleThumbnailUpload({ target: { files: [file] } } as any);
    }
  };

  const handleThumbPaste = (e: React.ClipboardEvent) => {
    const files = Array.from(e.clipboardData.files);
    const img = files.find((f) => f.type.startsWith("image/"));
    if (img) {
      e.preventDefault();
      handleThumbnailUpload({ target: { files: [img] } } as any);
    }
  };

  // Checklist kiểm tra chất lượng bài viết trước khi xuất bản
  const getPublishChecklist = () => {
    const finalContent = editorMode === "visual" ? blocksToMarkdown(blocks) : formData.content;
    return [
      {
        id: "input-title",
        label: "Tiêu đề bài viết",
        isComplete: !!formData.title.trim(),
        required: true,
      },
      {
        id: "input-slug",
        label: "Đường dẫn URL chuẩn SEO",
        isComplete: !!formData.slug.trim(),
        required: true,
      },
      {
        id: "input-thumbnail",
        label: "Ảnh đại diện (16:9)",
        isComplete: !!formData.thumbnail,
        required: true,
      },
      {
        id: "input-content",
        label: "Nội dung bài viết",
        isComplete: finalContent.trim().length > 20,
        required: true,
      },
      {
        id: "input-excerpt",
        label: "Tóm tắt ngắn (SEO snippet)",
        isComplete: !!formData.excerpt.trim(),
        required: false,
      },
    ];
  };

  // Thực thi xuất bản bài viết
  const executePublish = async () => {
    const checklist = getPublishChecklist();
    const missing = checklist.filter((i) => i.required && !i.isComplete);

    if (missing.length > 0) {
      toast.error(
        "Chưa thể xuất bản",
        `Vui lòng bổ sung: ${missing.map((m) => m.label).join(", ")}`
      );
      setShowSettingsModal(true);
      setActiveSettingsTab("content");
      return;
    }

    setIsSaving(true);
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
      {/* 1. SQUARESPACE MINIMAL STICKY TOP BAR                  */}
      {/* ═══════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-40 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-border/80 px-4 md:px-8 py-3 flex items-center justify-between transition-all">
        {/* Lề trái: Quay lại & Lưu nháp */}
        <div className="flex items-center gap-3 md:gap-4 shrink-0">
          <Link
            href="/admin/bai-viet"
            className="flex items-center gap-1.5 text-[13px] font-medium text-[#5A4A42] hover:text-[#3D2314] transition-colors"
            title="Quay lại danh sách"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Quay lại danh sách</span>
          </Link>

          <div className="w-px h-4 bg-border/70 hidden sm:block" />

          {/* Trạng thái lưu thời gian thực */}
          <div className="text-[12px] md:text-[13px] text-[#5A4A42] flex items-center gap-1.5">
            {saveState === "saving" && (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C5A059]" />
                <span className="text-[#3D2314]">Đang lưu...</span>
              </>
            )}
            {saveState === "unsaved" && (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-amber-800 font-medium">Chưa lưu</span>
              </>
            )}
            {saveState === "saved" && (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-emerald-800">
                  Đã lưu {formatRelativeTime(lastSaved)}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Giữa: Viewport Switcher phong cách Squarespace (Desktop 🖥 / Mobile 📱) */}
        <div className="flex items-center bg-[#FAF6F0] border border-border/80 rounded-xl p-0.5 shadow-2xs">
          <button
            type="button"
            onClick={() => setViewportMode("desktop")}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              viewportMode === "desktop"
                ? "bg-[#3D2314] text-[#C5A059] shadow-xs"
                : "text-[#5A4A42] hover:text-[#3D2314]"
            }`}
            title="Xem & soạn thảo theo tỉ lệ Desktop"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Desktop</span>
          </button>
          <button
            type="button"
            onClick={() => setViewportMode("mobile")}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              viewportMode === "mobile"
                ? "bg-[#3D2314] text-[#C5A059] shadow-xs"
                : "text-[#5A4A42] hover:text-[#3D2314]"
            }`}
            title="Xem & soạn thảo theo tỉ lệ Mobile (iPhone)"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Mobile</span>
          </button>
        </div>

        {/* Lề phải: Chế độ Markdown, Cài đặt bài viết ⚙ & Nút Xuất bản */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          {/* Segmented control Markdown */}
          <div className="flex items-center bg-[#FAF6F0] border border-border/80 rounded-lg p-0.5 hidden lg:flex">
            <button
              type="button"
              onClick={() => setEditorMode("visual")}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                editorMode === "visual"
                  ? "bg-white text-[#3D2314] shadow-2xs font-semibold"
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
                  ? "bg-white text-[#3D2314] shadow-2xs font-semibold"
                  : "text-text-muted hover:text-text"
              }`}
            >
              <Code className="w-3 h-3" />
              <span>Markdown</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleSaveDraft}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium rounded-xl border border-border/80 bg-white text-[#3D2314] hover:bg-[#FAF6F0] transition-colors shadow-2xs"
            title="Lưu bản nháp (Ctrl+S)"
          >
            <Save className="w-3.5 h-3.5 text-[#5A4A42]" />
            <span>Lưu nháp</span>
          </button>

          {/* Nút Cài Đặt Bài Viết (Squarespace Post Settings) */}
          <button
            type="button"
            onClick={() => setShowSettingsModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium rounded-xl border border-[#C5A059]/40 bg-[#FAF6F0] hover:bg-white text-[#3D2314] transition-all shadow-2xs"
            title="Cài đặt bài viết phong cách Squarespace"
          >
            <Settings className="w-3.5 h-3.5 text-[#C5A059]" />
            <span className="hidden sm:inline">Cài đặt bài</span>
          </button>

          {/* Nút Chính: Xuất bản (Publish) */}
          <button
            type="button"
            disabled={isSaving}
            onClick={executePublish}
            className="flex items-center gap-1.5 px-4 md:px-5 py-1.5 bg-[#3D2314] hover:bg-[#2A160C] text-white text-[13px] font-semibold rounded-xl transition-all shadow-sm disabled:opacity-70 focus:ring-2 focus:ring-offset-2 focus:ring-[#3D2314]"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#C5A059]" />
            ) : (
              <Send className="w-3.5 h-3.5 text-[#C5A059]" />
            )}
            <span>Xuất bản</span>
          </button>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* 2. KHUNG SOẠN THẢO TRỰC TIẾP TRÊN TRANG (CANVAS)       */}
      {/* ═══════════════════════════════════════════════════════ */}
      <main className="flex-1 overflow-y-auto py-8 px-4 flex justify-center bg-[#FDFBF7]">
        <div
          className={`transition-all duration-300 w-full ${
            viewportMode === "desktop"
              ? "max-w-[760px] px-2 md:px-6"
              : "max-w-[390px] border-4 border-stone-800 rounded-[38px] p-5 shadow-2xl bg-[#FDFBF7] ring-8 ring-stone-900/10 my-4"
          }`}
        >
          {/* Mô phỏng loa & camera iPhone khi ở Mobile view */}
          {viewportMode === "mobile" && (
            <div className="flex justify-center mb-6">
              <div className="w-24 h-4 bg-stone-800 rounded-full" />
            </div>
          )}

          {/* Tiêu đề bài viết: Serif ~40px, mượt mà như tạp chí */}
          <AutoResizeTextarea
            id="input-title"
            value={formData.title}
            onChange={handleTitleChange}
            placeholder="Tiêu đề bài viết..."
            className={`w-full bg-transparent font-serif font-bold text-[#3D2314] focus:outline-none placeholder:text-text-muted/30 resize-none overflow-hidden block leading-[1.2] mb-8 transition-shadow rounded ${
              viewportMode === "mobile"
                ? "text-[26px]"
                : "text-[34px] sm:text-[40px] md:text-[44px]"
            }`}
          />

          {/* Khối soạn thảo Block Editor / Markdown */}
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
              className="w-full min-h-[550px] bg-transparent font-mono text-[14px] leading-relaxed text-[#1F1610] focus:outline-none resize-none p-3 border border-border/60 rounded-xl"
              placeholder="Nhập nội dung markdown chuẩn của bài viết..."
            />
          )}
        </div>
      </main>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* 3. SQUARESPACE TABBED POST SETTINGS MODAL               */}
      {/* ═══════════════════════════════════════════════════════ */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div
            className="bg-[#FDFBF7] border border-[#C5A059]/40 rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col md:flex-row max-h-[88vh] animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cột trái: Tab Menu phong cách Squarespace */}
            <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-border/80 bg-white p-5 flex flex-col justify-between shrink-0">
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-7 h-7 rounded-lg bg-[#3D2314] text-[#C5A059] flex items-center justify-center font-serif font-bold text-sm">
                    ĐP
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-sm text-[#3D2314]">
                      Cài đặt bài viết
                    </h3>
                    <p className="text-[11px] text-[#5A4A42]">Post Settings</p>
                  </div>
                </div>

                <nav className="space-y-1">
                  <button
                    type="button"
                    onClick={() => setActiveSettingsTab("content")}
                    className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      activeSettingsTab === "content"
                        ? "bg-[#3D2314] text-[#C5A059] shadow-xs"
                        : "text-[#5A4A42] hover:bg-surface hover:text-[#3D2314]"
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>Nội dung & Ảnh đại diện</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveSettingsTab("options")}
                    className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      activeSettingsTab === "options"
                        ? "bg-[#3D2314] text-[#C5A059] shadow-xs"
                        : "text-[#5A4A42] hover:bg-surface hover:text-[#3D2314]"
                    }`}
                  >
                    <Sliders className="w-4 h-4" />
                    <span>Đường dẫn & Danh mục</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveSettingsTab("seo")}
                    className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      activeSettingsTab === "seo"
                        ? "bg-[#3D2314] text-[#C5A059] shadow-xs"
                        : "text-[#5A4A42] hover:bg-surface hover:text-[#3D2314]"
                    }`}
                  >
                    <Globe className="w-4 h-4" />
                    <span>Tối ưu SEO & Mô phỏng</span>
                  </button>
                </nav>
              </div>

              <div className="pt-4 border-t border-border/50 text-[11px] text-[#5A4A42] hidden md:block">
                <span>Trạng thái: </span>
                <strong className="text-[#3D2314] capitalize">
                  {formData.status === "published" ? "Đã đăng" : "Bản nháp"}
                </strong>
              </div>
            </div>

            {/* Cột phải: Nội dung từng Tab */}
            <div className="flex-1 flex flex-col overflow-hidden bg-[#FDFBF7]">
              {/* Header Tab */}
              <div className="px-6 py-4 border-b border-border/70 flex items-center justify-between bg-white shrink-0">
                <h4 className="font-serif font-bold text-base text-[#3D2314]">
                  {activeSettingsTab === "content" && "Nội dung & Hình ảnh đại diện"}
                  {activeSettingsTab === "options" && "Đường dẫn & Phân loại bài viết"}
                  {activeSettingsTab === "seo" && "Tối ưu tìm kiếm Google (SEO Snippet)"}
                </h4>
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="p-1 rounded-lg text-text-muted hover:text-[#3D2314] hover:bg-surface transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body Tab */}
              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                {/* ────── TAB 1: NỘI DUNG & ẢNH ĐẠI DIỆN ────── */}
                {activeSettingsTab === "content" && (
                  <div className="space-y-5">
                    {/* Ảnh đại diện 16:9 */}
                    <div>
                      <label className="text-[13px] text-[#3D2314] font-semibold mb-1.5 block">
                        Ảnh đại diện bài viết (16:9) <span className="text-red-500">*</span>
                      </label>
                      <div
                        id="input-thumbnail"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleThumbDrop}
                        onPaste={handleThumbPaste}
                        className="relative aspect-[16/9] rounded-xl overflow-hidden bg-[#FAF6F0] border border-border flex items-center justify-center group focus-within:ring-2 focus-within:ring-[#C5A059]"
                      >
                        {formData.thumbnail ? (
                          <>
                            <Image
                              src={formData.thumbnail}
                              alt="Thumbnail"
                              fill
                              className="object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2.5">
                              <label className="px-3.5 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg text-white text-xs font-semibold cursor-pointer transition-colors">
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
                                className="px-3.5 py-1.5 bg-red-600/80 hover:bg-red-700 backdrop-blur-sm rounded-lg text-white text-xs font-semibold transition-colors"
                              >
                                Xóa
                              </button>
                            </div>
                          </>
                        ) : (
                          <label className="cursor-pointer text-center w-full h-full flex flex-col items-center justify-center p-4 hover:bg-surface/80 transition-colors">
                            {isUploadingThumb ? (
                              <Loader2 className="w-6 h-6 animate-spin text-[#C5A059]" />
                            ) : (
                              <ImageIcon className="w-8 h-8 text-border mb-2" />
                            )}
                            <span className="text-[13px] text-[#3D2314] font-medium">
                              Kéo thả, dán ảnh (Ctrl+V) hoặc click chọn file
                            </span>
                            <span className="text-[11px] text-text-muted mt-0.5">
                              Tỉ lệ khuyến nghị 16:9, dung lượng dưới 5MB
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
                          className="text-[11px] text-[#C5A059] hover:underline mt-1.5 block font-medium"
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
                            className="flex-1 bg-white border border-border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-[#C5A059]"
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

                    {/* Tóm tắt ngắn (Excerpt) */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[13px] text-[#3D2314] font-semibold">
                          Tóm tắt bài viết (Excerpt){" "}
                          <span
                            className={`text-xs ${
                              formData.excerpt.length > 160
                                ? "text-amber-700 font-bold"
                                : "text-[#5A4A42]"
                            }`}
                          >
                            ({formData.excerpt.length}/160)
                          </span>
                        </label>
                        <button
                          type="button"
                          onClick={generateExcerpt}
                          className="text-[11px] text-[#C5A059] hover:underline flex items-center gap-1 font-semibold"
                        >
                          <Wand2 className="w-3 h-3" />
                          <span>Dùng gợi ý tự động</span>
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
                        placeholder="Mô tả súc tích cho bài viết (khoảng 160 ký tự)..."
                        className="w-full bg-white border border-border rounded-xl p-3 text-[13px] text-[#1F1610] focus:outline-none focus:border-[#C5A059] resize-none transition-colors"
                      />
                    </div>

                    {/* Thời gian đọc & Tác giả */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border/50">
                      <div>
                        <label className="text-[12px] text-[#5A4A42] block mb-1 font-medium">
                          Thời gian đọc
                        </label>
                        <div className="flex items-center gap-2">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF6F0] border border-border rounded-lg text-xs font-semibold text-[#3D2314]">
                            <Clock className="w-3.5 h-3.5 text-[#C5A059]" />
                            <span>~{formData.readingTime} phút đọc</span>
                          </div>
                          {!isEditingReadingTime ? (
                            <button
                              type="button"
                              onClick={() => setIsEditingReadingTime(true)}
                              className="text-[11px] text-[#C5A059] hover:underline"
                            >
                              Ghi đè
                            </button>
                          ) : (
                            <input
                              type="number"
                              min="1"
                              value={formData.readingTime}
                              onChange={(e) => {
                                const v = Math.max(1, parseInt(e.target.value) || 1);
                                setFormData((p) => ({ ...p, readingTime: v }));
                                setIsReadingTimeManual(true);
                                setSaveState("unsaved");
                              }}
                              className="w-14 bg-white border border-border rounded px-2 py-1 text-xs"
                            />
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="text-[12px] text-[#5A4A42] block mb-1 font-medium">
                          Tác giả bài viết
                        </label>
                        <div className="text-xs font-semibold text-[#3D2314] px-3 py-1.5 bg-[#FAF6F0] rounded-lg border border-border">
                          Nghệ nhân Mỹ Nghệ Đông Phong
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ────── TAB 2: ĐƯỜNG DẪN & DANH MỤC ────── */}
                {activeSettingsTab === "options" && (
                  <div className="space-y-5">
                    {/* Slug */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[13px] text-[#3D2314] font-semibold">
                          Đường dẫn bài viết (URL Slug) <span className="text-red-500">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData((p) => ({ ...p, slug: slugify(p.title) }));
                            setIsSlugManual(false);
                            setSaveState("unsaved");
                            toast.success("Đã tạo lại đường dẫn từ tiêu đề");
                          }}
                          className="text-[11px] text-[#C5A059] hover:underline flex items-center gap-1 font-semibold"
                        >
                          <Wand2 className="w-3 h-3" />
                          <span>Tạo lại từ tiêu đề</span>
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
                        className="w-full bg-white border border-border rounded-xl px-3 py-2 text-[13px] font-mono text-[#3D2314] focus:outline-none focus:border-[#C5A059]"
                      />
                      <div className="text-[11px] text-[#5A4A42] mt-1.5 flex items-center gap-1">
                        <ExternalLink className="w-3 h-3 text-[#C5A059]" />
                        <span>https://mynghedongphong.com/bai-viet/{formData.slug || "..."}</span>
                      </div>
                    </div>

                    {/* Danh mục */}
                    <div>
                      <label className="text-[13px] text-[#3D2314] font-semibold mb-1.5 block">
                        Nhóm chủ đề danh mục <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => {
                          setFormData((prev) => ({ ...prev, category: e.target.value }));
                          setSaveState("unsaved");
                        }}
                        className="w-full bg-white border border-border rounded-xl px-3 py-2.5 text-[13px] text-[#3D2314] focus:outline-none focus:border-[#C5A059]"
                      >
                        <option value="kien-thuc-ve-go">Kiến thức về gỗ quý</option>
                        <option value="huong-dan-lua-chon">Hướng dẫn lựa chọn & thẩm định</option>
                        <option value="bao-quan-san-pham">Bảo quản & Phong thủy đời sống</option>
                      </select>
                    </div>

                    {/* Trạng thái bài viết */}
                    <div>
                      <label className="text-[13px] text-[#3D2314] font-semibold mb-1.5 block">
                        Trạng thái hiển thị
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setFormData((p) => ({ ...p, status: "draft" }))}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            formData.status === "draft"
                              ? "border-[#C5A059] bg-[#FAF6F0] text-[#3D2314]"
                              : "border-border bg-white text-[#5A4A42]"
                          }`}
                        >
                          <div className="font-semibold text-xs">Bản nháp (Draft)</div>
                          <div className="text-[11px] text-text-muted mt-0.5">Chỉ hiển thị trong admin</div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setFormData((p) => ({ ...p, status: "published" }))}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            formData.status === "published"
                              ? "border-[#C5A059] bg-[#FAF6F0] text-[#3D2314]"
                              : "border-border bg-white text-[#5A4A42]"
                          }`}
                        >
                          <div className="font-semibold text-xs">Đã xuất bản (Published)</div>
                          <div className="text-[11px] text-text-muted mt-0.5">Hiển thị cho độc giả website</div>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ────── TAB 3: TỐI ƯU SEO & MÔ PHỎNG GOOGLE ────── */}
                {activeSettingsTab === "seo" && (
                  <div className="space-y-6">
                    {/* Google SERP Snippet Preview */}
                    <div>
                      <div className="text-[12px] font-semibold text-[#5A4A42] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-[#C5A059]" />
                        <span>Mô phỏng kết quả tìm kiếm Google (Search Snippet Preview)</span>
                      </div>
                      <div className="p-4 bg-white border border-border/80 rounded-xl shadow-xs space-y-1">
                        <div className="text-xs text-[#202124] flex items-center gap-1">
                          <span className="font-medium">mynghedongphong.com</span>
                          <span className="text-[#5f6368]">› bai-viet › {formData.slug || "..."}</span>
                        </div>
                        <h5 className="text-[17px] text-[#1a0dab] font-normal leading-snug hover:underline cursor-pointer">
                          {formData.title || "Tiêu đề bài viết Mỹ Nghệ Đông Phong"} | Mỹ Nghệ Đông Phong
                        </h5>
                        <p className="text-[13px] text-[#4d5156] leading-relaxed line-clamp-2">
                          {formData.excerpt ||
                            "Đồ gỗ phong thủy và kiến thức gỗ quý thủ công tinh hoa từ xưởng chế tác Mỹ Nghệ Đông Phong..."}
                        </p>
                      </div>
                    </div>

                    {/* Checklist chất lượng trước khi xuất bản */}
                    <div className="pt-2">
                      <div className="text-[12px] font-semibold text-[#5A4A42] uppercase tracking-wider mb-2.5">
                        Kiểm tra các tiêu chuẩn xuất bản
                      </div>
                      <div className="space-y-2">
                        {checklist.map((item) => (
                          <div
                            key={item.id}
                            className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                              item.isComplete
                                ? "bg-emerald-50/60 border-emerald-200/80 text-emerald-900"
                                : item.required
                                ? "bg-red-50/60 border-red-200/80 text-red-900"
                                : "bg-amber-50/60 border-amber-200/80 text-amber-900"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {item.isComplete ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <AlertCircle className="w-4 h-4 text-amber-600" />
                              )}
                              <span className="font-medium">{item.label}</span>
                            </div>
                            <span className="text-[11px] font-semibold">
                              {item.isComplete
                                ? "Đã đạt"
                                : item.required
                                ? "Bắt buộc bổ sung"
                                : "Khuyến khích"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Modal */}
              <div className="px-6 py-3.5 border-t border-border/70 bg-white flex items-center justify-between shrink-0">
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#5A4A42] hover:text-[#3D2314] rounded-lg transition-colors"
                >
                  Đóng cài đặt
                </button>

                <button
                  type="button"
                  disabled={!allRequiredValid || isSaving}
                  onClick={() => {
                    setShowSettingsModal(false);
                    executePublish();
                  }}
                  className="flex items-center gap-1.5 px-5 py-2 bg-[#3D2314] hover:bg-[#2A160C] text-white text-xs font-semibold rounded-xl shadow-xs disabled:opacity-50 transition-all"
                >
                  <Send className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>Lưu & Xuất bản bài viết</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BlogForm;
