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
  AlertCircle
} from "lucide-react";
import { usePostsStore } from "@/lib/usePosts";
import { slugify } from "@/lib/slugify";
import { toast } from "@/components/ui/Toast";
import { VisualBlockEditor } from "./block-editor/VisualBlockEditor";
import { markdownToBlocks, blocksToMarkdown, EditorBlock } from "@/lib/blockEditor";
import { ArticleContentRenderer } from "@/components/blog/ArticleContentRenderer";
import { AutoResizeTextarea } from "@/components/ui/AutoResizeTextarea";
import Link from "next/link";

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

  const [blocks, setBlocks] = useState<EditorBlock[]>(() => markdownToBlocks(formData.content || ""));
  const [editorMode, setEditorMode] = useState<"visual" | "markdown">("visual");
  const [showPreview, setShowPreview] = useState(false);
  const [showSettings, setShowSettings] = useState(true);
  const [isUploadingThumb, setIsUploadingThumb] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  
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
  }, [blocks, formData.content, editorMode]);

  // Debounced Auto Calculations
  useEffect(() => {
    const timer = setTimeout(() => {
      const contentStr = editorMode === "visual" ? blocksToMarkdown(blocks) : formData.content;
      
      // Auto Read Time
      if (!isReadingTimeManual) {
         const words = contentStr.trim().split(/\s+/).length;
         const calcReadingTime = Math.max(1, Math.ceil(words / 200));
         if (calcReadingTime !== formData.readingTime) {
            setFormData(prev => ({ ...prev, readingTime: calcReadingTime }));
         }
      }

      // Sync Content to formData so it's always fresh
      if (contentStr !== formData.content) {
         setFormData(prev => ({ ...prev, content: contentStr }));
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
        id: formData.id || `post-${Date.now()}`
      };
      if (isEdit && formData.id) {
        await updatePost(formData.id, payload);
      } else {
        if (!formData.id) {
            setFormData(prev => ({...prev, id: payload.id}));
        }
      }
      setLastSaved(new Date());
      setSaveStatus("Bản nháp");
    } catch (e) {
      setSaveStatus("Chưa lưu");
      toast.error("Lưu nháp thất bại, vui lòng thử lại");
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const title = e.target.value;
    const updates: Partial<BlogFormData> = { title };
    if (!isSlugManual && (!isEdit || formData.status === "draft")) {
      updates.slug = slugify(title);
    }
    setFormData((prev) => ({ ...prev, ...updates }));
    setSaveStatus("Chưa lưu");
  };

  const generateExcerpt = () => {
    const firstText = blocks.find(b => b.type === "text" && b.data.text);
    if (firstText && firstText.data.text) {
       const textStr = firstText.data.text as string;
       const excerpt = textStr.substring(0, 160) + (textStr.length > 160 ? "..." : "");
       setFormData(prev => ({ ...prev, excerpt }));
       toast.success("Đã áp dụng tóm tắt tự động");
    } else {
       toast.error("Chưa có đoạn văn bản nào để gợi ý");
    }
  };

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
        toast.success("Tải ảnh đại diện thành công");
      } else {
         throw new Error("Lỗi máy chủ");
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
        // Mock upload event
        handleThumbnailUpload({ target: { files: [file] } } as any);
     }
  };

  const validateAndPublish = async () => {
    const errors: { field: string; id: string }[] = [];
    if (!formData.title.trim()) errors.push({ field: "Tiêu đề bài viết", id: "input-title" });
    if (!formData.slug.trim()) errors.push({ field: "Đường dẫn (Slug)", id: "input-slug" });
    if (!formData.thumbnail) errors.push({ field: "Ảnh đại diện", id: "input-thumbnail" });
    
    const finalContent = editorMode === "visual" ? blocksToMarkdown(blocks) : formData.content;
    if (!finalContent.trim()) errors.push({ field: "Nội dung bài viết", id: "input-content" });

    if (errors.length > 0) {
      const firstError = errors[0];
      toast.error(
        "Không thể đăng bài",
        `Vui lòng bổ sung: ${errors.map((e) => e.field).join(", ")}`,
        5000
      );
      setShowSettings(true);
      setTimeout(() => {
        const el = document.getElementById(firstError.id);
        el?.focus();
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
        el?.classList.add("ring-2", "ring-red-500", "ring-offset-2");
        setTimeout(() => el?.classList.remove("ring-2", "ring-red-500", "ring-offset-2"), 2000);
      }, 100);
      return;
    }

    if (!formData.excerpt.trim()) {
       const confirmMsg = window.confirm("Bài viết chưa có tóm tắt ngắn (Excerpt). Bạn có chắc chắn muốn đăng?");
       if (!confirmMsg) return;
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
      setSaveStatus("Đã lưu lúc " + new Date().toLocaleTimeString("vi-VN", {hour: "2-digit", minute:"2-digit"}));
      toast.success("Đã xuất bản bài viết thành công!");
      router.push("/admin/bai-viet");
    } catch (error: any) {
      toast.error("Lỗi khi đăng bài", error.message);
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFBF7] -m-6 md:-m-8">
      {/* Sticky Top Bar */}
      <div className="sticky top-0 z-40 bg-[#FDFBF7]/90 backdrop-blur-md border-b border-border px-4 md:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/bai-viet" className="flex items-center gap-1.5 text-[13px] font-medium text-text-muted hover:text-text transition-colors">
             <ArrowLeft className="w-4 h-4" />
             <span className="hidden sm:inline">Quay lại danh sách</span>
          </Link>
          
          <div className="w-px h-4 bg-border hidden sm:block" />
          
          <div className="text-[13px] text-text-muted flex items-center gap-1.5 hidden sm:flex">
             <span className={`w-2 h-2 rounded-full inline-block ${saveStatus === "Chưa lưu" ? "bg-amber-500" : "bg-emerald-500"}`} />
             {saveStatus} {lastSaved && saveStatus !== "Chưa lưu" && saveStatus !== "Đang lưu..." ? `lúc ${lastSaved.toLocaleTimeString("vi-VN", {hour: "2-digit", minute:"2-digit"})}` : ""}
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <div className="flex items-center bg-surface border border-border rounded-md overflow-hidden mr-2">
             <button
                onClick={() => setEditorMode("visual")}
                className={`px-3 py-1.5 text-[13px] font-medium transition-colors ${editorMode === "visual" ? "bg-white text-primary shadow-sm" : "text-text-muted hover:text-text"}`}
             >
                Trực quan
             </button>
             <button
                onClick={() => setEditorMode("markdown")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium transition-colors ${editorMode === "markdown" ? "bg-white text-primary shadow-sm" : "text-text-muted hover:text-text"}`}
             >
                <Code className="w-3.5 h-3.5" />
                Markdown
             </button>
          </div>
          
          <button
            onClick={() => setShowPreview(true)}
            className="px-3 py-1.5 text-[13px] font-medium rounded-md border border-transparent text-primary hover:bg-surface transition-colors hidden sm:block"
          >
            Xem trước
          </button>
          
          <button
            onClick={() => handleAutoSave(editorMode === "visual" ? blocksToMarkdown(blocks) : formData.content)}
            className="px-3 py-1.5 text-[13px] font-medium rounded-md border border-primary text-primary hover:bg-surface transition-colors hidden sm:block"
          >
            Lưu nháp
          </button>

          <button
            disabled={isSaving}
            onClick={validateAndPublish}
            className="flex items-center gap-1.5 px-5 py-1.5 bg-[#3D2314] hover:bg-[#5C3A21] text-white text-[13px] font-semibold rounded-md transition-colors shadow-sm disabled:opacity-70 focus:ring-2 focus:ring-offset-2 focus:ring-[#3D2314]"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>Đăng bài</span>
          </button>
          
          <div className="w-px h-5 bg-border mx-1" />
          
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-1.5 rounded-md transition-colors focus:ring-2 focus:ring-offset-1 focus:ring-primary ${showSettings ? "bg-surface text-primary border border-border" : "text-text-muted hover:bg-surface border border-transparent"}`}
            title="Cài đặt bài viết"
            aria-label="Cài đặt bài viết"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Main Editor Area */}
        <div className="flex-1 overflow-y-auto" id="input-content">
          <div className="max-w-[720px] mx-auto px-6 py-10 md:py-16 pb-32">
            <AutoResizeTextarea
              id="input-title"
              value={formData.title}
              onChange={handleTitleChange}
              placeholder="Tiêu đề bài viết..."
              className="w-full bg-transparent text-[40px] font-serif font-bold text-primary focus:outline-none placeholder:text-text-muted/30 resize-none overflow-hidden block leading-[1.2] mb-10 transition-shadow rounded"
            />
            
            {editorMode === "visual" ? (
              <VisualBlockEditor blocks={blocks} onChange={(newBlocks) => {
                 setBlocks(newBlocks);
                 setSaveStatus("Chưa lưu");
              }} />
            ) : (
              <textarea
                value={formData.content}
                onChange={(e) => {
                  setFormData(p => ({...p, content: e.target.value}));
                  setSaveStatus("Chưa lưu");
                }}
                className="w-full min-h-[500px] bg-transparent font-mono text-[13px] leading-relaxed focus:outline-none resize-none"
                placeholder="Nội dung markdown..."
              />
            )}
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="w-full md:w-80 border-l border-border bg-white overflow-y-auto p-6 absolute md:relative right-0 inset-y-0 z-30 shadow-xl md:shadow-none bottom-0 top-auto md:top-0 h-[80vh] md:h-auto rounded-t-2xl md:rounded-none transition-all">
            <div className="flex items-center justify-between mb-6">
               <h3 className="text-[13px] font-bold text-primary uppercase tracking-wider">Cài đặt bài viết</h3>
               <button onClick={() => setShowSettings(false)} className="md:hidden p-1">
                 <X className="w-5 h-5" />
               </button>
            </div>
            
            <div className="space-y-6">
              {/* Thumbnail */}
              <div>
                <label className="text-[13px] text-text-muted mb-2 block">Ảnh đại diện <span className="text-red-500">*</span></label>
                <div 
                   id="input-thumbnail"
                   onDragOver={(e) => e.preventDefault()}
                   onDrop={handleThumbDrop}
                   className="relative aspect-[16/9] rounded-md overflow-hidden bg-surface border border-border flex items-center justify-center group focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent transition-all"
                >
                  {formData.thumbnail ? (
                    <>
                      <Image src={formData.thumbnail} alt="Thumbnail" fill className="object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                         <label className="px-3 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded text-white text-xs font-medium cursor-pointer transition-colors">
                            Đổi ảnh
                            <input type="file" accept="image/*" className="hidden" onChange={handleThumbnailUpload} disabled={isUploadingThumb}/>
                         </label>
                         <button onClick={() => setFormData(p => ({...p, thumbnail: ""}))} className="px-3 py-1.5 bg-red-500/80 hover:bg-red-600 backdrop-blur-sm rounded text-white text-xs font-medium transition-colors">Xóa</button>
                      </div>
                    </>
                  ) : (
                    <label className="cursor-pointer text-center w-full h-full flex flex-col items-center justify-center hover:bg-surface/80">
                      {isUploadingThumb ? <Loader2 className="w-5 h-5 animate-spin text-primary" /> : <ImageIcon className="w-6 h-6 text-border mb-1" />}
                      <span className="text-[11px] text-text-muted mt-1">Kéo thả hoặc click chọn file</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleThumbnailUpload} disabled={isUploadingThumb}/>
                    </label>
                  )}
                </div>
                {!showUrlInput ? (
                   <button onClick={() => setShowUrlInput(true)} className="text-[11px] text-primary hover:underline mt-2 block">Dùng URL ảnh</button>
                ) : (
                   <div className="flex gap-2 mt-2">
                      <input
                        type="text"
                        value={formData.thumbnail}
                        onChange={(e) => setFormData((prev) => ({ ...prev, thumbnail: e.target.value }))}
                        placeholder="Dán URL ảnh..."
                        className="flex-1 bg-surface border border-border rounded-md px-3 py-2 text-[13px] focus:outline-none focus:border-primary transition-colors"
                      />
                      <button onClick={() => setShowUrlInput(false)} className="p-2 text-text-muted hover:text-text"><X className="w-4 h-4"/></button>
                   </div>
                )}
              </div>

              {/* URL & Slug */}
              <div>
                <label className="text-[13px] text-text-muted mb-1 block">
                  <span>Đường dẫn (Slug)</span>
                </label>
                <input
                  id="input-slug"
                  type="text"
                  value={formData.slug}
                  onChange={(e) => {
                     setFormData((prev) => ({ ...prev, slug: e.target.value }));
                     setIsSlugManual(true);
                  }}
                  className="w-full bg-surface border border-border rounded-md px-3 py-2 text-[13px] font-mono focus:outline-none focus:border-primary transition-shadow"
                />
              </div>

              {/* Category */}
              <div>
                <label className="text-[13px] text-text-muted mb-1 block">Nhóm chủ đề</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                  className="w-full bg-surface border border-border rounded-md px-3 py-2 text-[13px] focus:outline-none focus:border-primary transition-colors"
                >
                  <option value="kien-thuc-ve-go">Kiến thức về gỗ</option>
                  <option value="huong-dan-lua-chon">Hướng dẫn lựa chọn</option>
                  <option value="bao-quan-san-pham">Bảo quản sản phẩm</option>
                </select>
              </div>

              {/* Excerpt */}
              <div>
                <label className="text-[13px] text-text-muted mb-1 flex justify-between">
                  <span>Tóm tắt ({formData.excerpt.length}/160)</span>
                  <button type="button" onClick={generateExcerpt} className="text-[11px] text-primary hover:underline flex items-center gap-1">
                     <Wand2 className="w-3 h-3" /> Dùng gợi ý
                  </button>
                </label>
                <textarea
                  rows={4}
                  value={formData.excerpt}
                  onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="Viết tóm tắt ngắn hoặc dùng gợi ý tự động..."
                  className="w-full bg-surface border border-border rounded-md p-2.5 text-[13px] focus:outline-none focus:border-primary resize-none transition-colors"
                />
              </div>
              
              {/* Read Time */}
              <div>
                 <label className="text-[13px] text-text-muted mb-1 block">Thời gian đọc (phút)</label>
                 <input 
                    type="number"
                    min="1"
                    value={formData.readingTime}
                    onChange={(e) => {
                       setFormData(p => ({...p, readingTime: Number(e.target.value) || 1}));
                       setIsReadingTimeManual(true);
                    }}
                    className="w-24 bg-surface border border-border rounded-md px-3 py-1.5 text-[13px] focus:outline-none focus:border-primary transition-colors"
                 />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Preview */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-[#FDFBF7] flex flex-col">
           <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-white shadow-sm">
             <div className="text-[13px] font-bold text-primary">Chế độ xem trước</div>
             <button onClick={() => setShowPreview(false)} className="px-4 py-1.5 bg-surface text-text-muted hover:text-text rounded-md border border-border text-[13px] font-medium transition-colors focus:ring-2 focus:ring-offset-1 focus:ring-primary">Đóng xem trước</button>
           </div>
           <div className="flex-1 overflow-y-auto">
             <div className="max-w-[720px] mx-auto px-6 py-12">
               <ArticleContentRenderer content={editorMode === "visual" ? blocksToMarkdown(blocks) : formData.content} />
             </div>
           </div>
        </div>
      )}
    </div>
  );
}

export default BlogForm;
