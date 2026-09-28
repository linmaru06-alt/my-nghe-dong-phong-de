"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  Send, 
  ImageIcon, 
  X, 
  Loader2,
  Settings,
  Code,
  ArrowLeft
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
  
  // Status string for top bar
  const [saveStatus, setSaveStatus] = useState<"Chưa lưu" | "Đang lưu..." | "Bản nháp">("Chưa lưu");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  // Debounced Auto Save & Calculations
  useEffect(() => {
    const timer = setTimeout(() => {
      // Auto-calc reading time
      const contentStr = editorMode === "visual" ? blocksToMarkdown(blocks) : formData.content;
      const words = contentStr.trim().split(/\s+/).length;
      const calcReadingTime = Math.max(1, Math.ceil(words / 200));
      
      // Auto-excerpt from first text block if empty
      let autoExcerpt = formData.excerpt;
      if (!autoExcerpt && blocks.length > 0) {
        const firstText = blocks.find(b => b.type === "text" && b.data.text);
        if (firstText) {
          const textStr = firstText.data.text as string;
          autoExcerpt = textStr.substring(0, 160) + (textStr.length > 160 ? "..." : "");
        }
      }

      setFormData(prev => ({
        ...prev,
        content: contentStr,
        readingTime: calcReadingTime,
        excerpt: autoExcerpt
      }));
      
      if (formData.title && (formData.title !== initialData?.title || contentStr !== initialData?.content)) {
        handleAutoSave(contentStr);
      }
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [blocks, formData.title, editorMode]);

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
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const title = e.target.value;
    const updates: Partial<BlogFormData> = { title };
    if (!isEdit) {
      updates.slug = slugify(title);
    }
    setFormData((prev) => ({ ...prev, ...updates }));
    setSaveStatus("Chưa lưu");
  };

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
        toast.success("Tải ảnh đại diện thành công");
      }
    } catch (err: any) {
      toast.error("Lỗi tải ảnh", err.message);
    } finally {
      setIsUploadingThumb(false);
      e.target.value = "";
    }
  };

  const validateAndPublish = async () => {
    const errors = [];
    if (!formData.title.trim()) errors.push("Tiêu đề bài viết");
    if (!formData.slug.trim()) errors.push("Đường dẫn (Slug)");
    if (!formData.thumbnail) errors.push("Ảnh đại diện");
    
    if (errors.length > 0) {
      toast.error("Vui lòng hoàn thiện các trường sau trước khi đăng:", errors.join(", "));
      setShowSettings(true);
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
             <span className="w-2 h-2 rounded-full bg-primary/40 inline-block" />
             {saveStatus} {lastSaved ? `· Đã lưu lúc ${lastSaved.toLocaleTimeString("vi-VN", {hour: "2-digit", minute:"2-digit"})}` : ""}
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
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[720px] mx-auto px-6 py-10 md:py-16 pb-32">
            <AutoResizeTextarea
              value={formData.title}
              onChange={handleTitleChange}
              placeholder="Tiêu đề bài viết..."
              className="w-full bg-transparent text-[40px] font-serif font-bold text-primary focus:outline-none placeholder:text-text-muted/30 resize-none overflow-hidden block leading-[1.2] mb-10"
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
          <div className="w-full md:w-80 border-l border-border bg-white overflow-y-auto p-6 absolute md:relative right-0 inset-y-0 z-30 shadow-xl md:shadow-none bottom-0 top-auto md:top-0 h-[80vh] md:h-auto rounded-t-2xl md:rounded-none">
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
                <div className="relative aspect-[16/9] rounded-md overflow-hidden bg-surface border border-border flex items-center justify-center group focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent">
                  {formData.thumbnail ? (
                    <>
                      <Image src={formData.thumbnail} alt="Thumbnail" fill className="object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                         <button onClick={() => setFormData(p => ({...p, thumbnail: ""}))} className="p-1.5 bg-white rounded-full text-red-600 focus:outline-none focus:ring-2 focus:ring-red-600"><X className="w-4 h-4"/></button>
                      </div>
                    </>
                  ) : (
                    <label className="cursor-pointer text-center w-full h-full flex flex-col items-center justify-center hover:bg-surface/80">
                      {isUploadingThumb ? <Loader2 className="w-5 h-5 animate-spin text-primary" /> : <ImageIcon className="w-6 h-6 text-border mb-1" />}
                      <span className="text-[11px] text-text-muted mt-1">Click để chọn file</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleThumbnailUpload} disabled={isUploadingThumb}/>
                    </label>
                  )}
                </div>
                {!showUrlInput ? (
                   <button onClick={() => setShowUrlInput(true)} className="text-[11px] text-primary hover:underline mt-2 block">Dùng URL ảnh</button>
                ) : (
                   <input
                     type="text"
                     value={formData.thumbnail}
                     onChange={(e) => setFormData((prev) => ({ ...prev, thumbnail: e.target.value }))}
                     placeholder="Dán URL ảnh..."
                     className="w-full bg-surface border border-border rounded-md px-3 py-2 text-[13px] focus:outline-none focus:border-primary mt-2 transition-colors"
                   />
                )}
              </div>

              {/* URL & Slug */}
              <div>
                <label className="text-[13px] text-text-muted mb-1 flex justify-between">
                  <span>Đường dẫn (Slug)</span>
                  <button type="button" onClick={() => setFormData(p => ({...p, slug: slugify(p.title)}))} className="text-[11px] text-primary hover:underline">Tạo lại</button>
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                  className="w-full bg-surface border border-border rounded-md px-3 py-2 text-[13px] font-mono focus:outline-none focus:border-primary transition-colors"
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
                </label>
                <textarea
                  rows={4}
                  value={formData.excerpt}
                  onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="Gợi ý tự động từ đoạn đầu..."
                  className="w-full bg-surface border border-border rounded-md p-2.5 text-[13px] focus:outline-none focus:border-primary resize-none transition-colors"
                />
              </div>
              
              {/* Read Time */}
              <div>
                 <span className="text-[11px] bg-surface border border-border px-2.5 py-1.5 rounded-full text-text-muted font-medium inline-block">
                   ~{formData.readingTime} phút đọc
                 </span>
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
