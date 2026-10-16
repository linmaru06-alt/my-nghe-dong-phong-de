"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
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

  // Active block selection & document zoom
  const [activeBlockIndex, setActiveBlockIndex] = useState<number | null>(0);
  const [selectionInfo, setSelectionInfo] = useState<{ start: number; end: number }>({ start: 0, end: 0 });
  const [zoom, setZoom] = useState<string>("100%");
  const hiddenImageInputRef = useRef<HTMLInputElement>(null);

  // History stack for Undo/Redo
  const [history, setHistory] = useState<EditorBlock[][]>(() => [markdownToBlocks(formData.content || "")]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  const pushHistory = (newBlocks: EditorBlock[]) => {
    setHistory((prev) => {
      const next = prev.slice(0, historyIndex + 1);
      return [...next, newBlocks];
    });
    setHistoryIndex((prev) => prev + 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const nextIdx = historyIndex - 1;
      setHistoryIndex(nextIdx);
      setBlocks(history[nextIdx]);
      setSaveStatus("Chưa lưu");
      toast.info("Đã hoàn tác (Undo)");
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      setBlocks(history[nextIdx]);
      setSaveStatus("Chưa lưu");
      toast.info("Đã làm lại (Redo)");
    }
  };

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

      if (res.status === 413) {
        throw new Error("Ảnh quá lớn (vượt quá giới hạn máy chủ)");
      }

      let json;
      try {
        json = await res.json();
      } catch (parseError) {
        throw new Error(`Lỗi máy chủ (${res.status}): Không thể đọc phản hồi`);
      }

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

          if (res.status === 413) {
            throw new Error("Ảnh quá lớn (vượt quá giới hạn máy chủ)");
          }

          let json;
          try {
            json = await res.json();
          } catch (parseError) {
            throw new Error(`Lỗi máy chủ (${res.status}): Không thể đọc phản hồi`);
          }

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
    const targetIdx = activeBlockIndex !== null && activeBlockIndex >= 0 && activeBlockIndex < blocks.length
      ? activeBlockIndex + 1
      : blocks.length;
    const newBlocks = [...blocks];
    newBlocks.splice(targetIdx, 0, newBlock);
    setBlocks(newBlocks);
    pushHistory(newBlocks);
    setActiveBlockIndex(targetIdx);
    setSaveStatus("Chưa lưu");
    toast.success(`Đã thêm khối ${type}`);
  };

  // Insert Table via Toolbar
  const handleInsertTableFromToolbar = (rows: number = 3, cols: number = 3) => {
    const headers = Array.from({ length: cols }, (_, i) => `Cột ${i + 1}`);
    const tableRows = Array.from({ length: Math.max(1, rows - 1) }, () => Array.from({ length: cols }, () => ""));
    const newBlock = createDefaultBlock("table");
    newBlock.data = { headers, rows: tableRows };
    const targetIdx = activeBlockIndex !== null && activeBlockIndex >= 0 && activeBlockIndex < blocks.length
      ? activeBlockIndex + 1
      : blocks.length;
    const newBlocks = [...blocks];
    newBlocks.splice(targetIdx, 0, newBlock);
    setBlocks(newBlocks);
    pushHistory(newBlocks);
    setActiveBlockIndex(targetIdx);
    setSaveStatus("Chưa lưu");
    toast.success(`Đã chèn bảng biểu ${rows}x${cols} vào bài viết`);
  };

  // Image Upload triggered from Docs Toolbar
  const handleToolbarImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      toast.error("Ảnh quá lớn", "Vui lòng chọn ảnh dưới 8MB");
      return;
    }

    toast.info("Đang tải ảnh lên máy chủ...");
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("folder", "blog");

      const res = await fetch("/api/admin/upload", { method: "POST", body: data });
      
      if (res.status === 413) {
        throw new Error("Ảnh quá lớn (vượt quá giới hạn máy chủ)");
      }

      let json;
      try {
        json = await res.json();
      } catch (parseError) {
        throw new Error(`Lỗi máy chủ (${res.status}): Không thể đọc phản hồi`);
      }

      if (res.ok && json.success && json.url) {
        const newBlock = createDefaultBlock("image");
        newBlock.data = {
          url: json.url,
          alt: "Ảnh minh họa bài viết",
          caption: "",
        };

        const targetIdx = activeBlockIndex !== null && activeBlockIndex >= 0 && activeBlockIndex < blocks.length
          ? activeBlockIndex + 1
          : blocks.length;
        const newBlocks = [...blocks];
        newBlocks.splice(targetIdx, 0, newBlock);
        setBlocks(newBlocks);
        pushHistory(newBlocks);
        setActiveBlockIndex(targetIdx);
        setSaveStatus("Chưa lưu");
        toast.success("Đã chèn ảnh vào bài viết!");
      } else {
        throw new Error(json.error || "Không thể tải ảnh");
      }
    } catch (err: any) {
      toast.error("Lỗi tải ảnh", err.message);
    } finally {
      e.target.value = "";
    }
  };

  // 1. Text Formatting (Bold, Italic, Underline, Strike, Link, Highlight, Color, FontName)
  const handleFormatText = (
    format: "bold" | "italic" | "underline" | "strike" | "link" | "highlight" | "color" | "fontName",
    value?: string
  ) => {
    // With true WYSIWYG contentEditable, we just execute commands directly on the browser selection.
    // The contentEditable's onInput handler will automatically sync the generated HTML to the block state.
    // We use window.getSelection() because when using inputs like the Color Picker,
    // the contenteditable loses focus, but the browser preserves the window selection.
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      if (format === "color") {
        document.execCommand("foreColor", false, value || "#3D2314");
      } else if (format === "fontName") {
        document.execCommand("fontName", false, value || "sans-serif");
      } else if (format === "highlight") {
        document.execCommand("hiliteColor", false, value || "transparent");
        document.execCommand("backColor", false, value || "transparent");
      } else if (format === "link") {
        const url = prompt("Nhập đường dẫn liên kết:", "https://");
        if (url) {
          document.execCommand("createLink", false, url);
        }
      } else if (format === "strike") {
        document.execCommand("strikeThrough", false, "");
      } else {
        // bold, italic, underline
        document.execCommand(format, false, "");
      }
      
      // Find the actual contenteditable node that was modified and force a React state sync
      const node = selection.anchorNode;
      const editableNode = node?.nodeType === 3 
        ? node.parentElement?.closest('[contenteditable="true"]') 
        : (node as Element)?.closest?.('[contenteditable="true"]');
        
      if (editableNode) {
        editableNode.dispatchEvent(new Event('input', { bubbles: true }));
      }
      
      setSaveStatus("Chưa lưu");
    } else {
      toast.info("Vui lòng click vào đoạn văn hoặc bôi đen chữ để áp dụng định dạng");
    }
  };

  // 2. Change Active Block Type (Normal text, Heading 1/2/3, Quote)
  const handleChangeActiveBlockType = (type: BlockType, level?: number) => {
    const targetIdx = activeBlockIndex !== null && activeBlockIndex >= 0 && activeBlockIndex < blocks.length
      ? activeBlockIndex
      : null;

    if (targetIdx !== null) {
      const current = blocks[targetIdx];
      const prevText = current.data.text || current.data.quote || "";
      const defaultBlock = createDefaultBlock(type);
      const updated: EditorBlock = {
        ...current,
        type,
        data: {
          ...defaultBlock.data,
          text: prevText,
          ...(level ? { level } : {}),
          align: current.data.align || "left",
        },
      };
      const newBlocks = [...blocks];
      newBlocks[targetIdx] = updated;
      setBlocks(newBlocks);
      pushHistory(newBlocks);
      setSaveStatus("Chưa lưu");
      toast.success(`Đã đổi thành ${type === "heading" ? `Tiêu đề H${level || 2}` : "Đoạn văn"}`);
    } else {
      handleInsertBlockFromToolbar(type, level ? { level, text: "" } : { text: "" });
    }
  };

  // 3. Convert or create list (Checklist, Bullet, Numbered)
  const handleConvertToList = (listType: "checklist" | "bullet" | "numbered") => {
    const targetIdx = activeBlockIndex !== null && activeBlockIndex >= 0 && activeBlockIndex < blocks.length
      ? activeBlockIndex
      : blocks.length - 1;

    if (targetIdx >= 0 && blocks[targetIdx]) {
      const current = blocks[targetIdx];
      let items: any[] = [];

      if (current.type === "list") {
        const rawItems = current.data.items || [];
        if (listType === "checklist") {
          items = rawItems.map((it: any) =>
            typeof it === "object" ? it : { checked: false, text: String(it) }
          );
        } else {
          items = rawItems.map((it: any) =>
            typeof it === "object" ? it.text || "" : String(it)
          );
        }
      } else {
        const text = current.data.text || current.data.quote || "";
        const lines = text.split("\n").filter(Boolean);
        const sourceLines = lines.length > 0 ? lines : [""];

        if (listType === "checklist") {
          items = sourceLines.map((line: string) => ({ checked: false, text: line }));
        } else {
          items = sourceLines;
        }
      }

      const updated: EditorBlock = {
        ...current,
        type: "list",
        data: {
          listType,
          items,
        },
      };
      const newBlocks = [...blocks];
      newBlocks[targetIdx] = updated;
      setBlocks(newBlocks);
      pushHistory(newBlocks);
      setSaveStatus("Chưa lưu");
      toast.success(
        `Đã chuyển thành ${
          listType === "checklist"
            ? "Danh sách tích chọn"
            : listType === "numbered"
            ? "Danh sách đánh số"
            : "Danh sách dấu chấm"
        }`
      );
    } else {
      const defaultItems = listType === "checklist" ? [{ checked: false, text: "" }] : [""];
      const newBlock = createDefaultBlock("list");
      newBlock.data = { listType, items: defaultItems };
      const newBlocks = [...blocks, newBlock];
      setBlocks(newBlocks);
      pushHistory(newBlocks);
      setActiveBlockIndex(newBlocks.length - 1);
      setSaveStatus("Chưa lưu");
      toast.success("Đã thêm danh sách mới");
    }
  };

  // 4. Align text (Left, Center, Right, Justify)
  const handleAlignText = (align: "left" | "center" | "right" | "justify") => {
    const targetIdx = activeBlockIndex !== null && activeBlockIndex >= 0 && activeBlockIndex < blocks.length
      ? activeBlockIndex
      : 0;

    if (blocks[targetIdx]) {
      const updated = {
        ...blocks[targetIdx],
        data: {
          ...blocks[targetIdx].data,
          align,
        },
      };
      const newBlocks = [...blocks];
      newBlocks[targetIdx] = updated;
      setBlocks(newBlocks);
      pushHistory(newBlocks);
      setSaveStatus("Chưa lưu");
      const alignName =
        align === "center"
          ? "giữa"
          : align === "right"
          ? "phải"
          : align === "justify"
          ? "đều 2 bên"
          : "trái";
      toast.success(`Đã căn ${alignName}`);
    }
  };

  // 5. Font Size changes (+ / -)
  const handleFontSizeChange = (delta: number) => {
    const targetIdx = activeBlockIndex !== null && activeBlockIndex >= 0 && activeBlockIndex < blocks.length
      ? activeBlockIndex
      : 0;

    if (blocks[targetIdx]) {
      const currentSize = blocks[targetIdx].data.fontSize || 16;
      const nextSize = Math.max(12, Math.min(48, currentSize + delta));
      const updated = {
        ...blocks[targetIdx],
        data: {
          ...blocks[targetIdx].data,
          fontSize: nextSize,
        },
      };
      const newBlocks = [...blocks];
      newBlocks[targetIdx] = updated;
      setBlocks(newBlocks);
      pushHistory(newBlocks);
      setSaveStatus("Chưa lưu");
    }
  };

  // Calculate current block styles for Docs Toolbar state
  const currentActiveBlock = activeBlockIndex !== null && blocks[activeBlockIndex] ? blocks[activeBlockIndex] : null;
  const currentStyle = currentActiveBlock?.type === "heading"
    ? currentActiveBlock.data.level === 3
      ? "Tiêu đề 2 (H3)"
      : currentActiveBlock.data.level === 4
      ? "Tiêu đề 3 (H4)"
      : "Tiêu đề 1 (H2)"
    : currentActiveBlock?.type === "quote"
    ? "Trích dẫn"
    : "Văn bản thường";

  const currentFontSize = currentActiveBlock?.data?.fontSize || 16;

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
      let isSuccess = false;
      if (isEdit && formData.id) {
        isSuccess = await updatePost(formData.id, postPayload);
      } else {
        isSuccess = await addPost(postPayload as any);
      }

      setSaveStatus("Đã lưu lúc " + new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }));

      if (isSuccess) {
        toast.success("Đã xuất bản bài viết thành công lên trang web!");
      } else {
        toast.warning(
          "Đã lưu an toàn trên máy cục bộ",
          "Máy chủ phản hồi chậm hoặc đang đồng bộ. Dữ liệu bài viết đã được bảo vệ trên trình duyệt của bạn."
        );
      }

      router.push("/admin/bai-viet");
    } catch (error: any) {
      toast.error("Lỗi khi đăng bài", error.message);
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F0F4F9]">
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
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onFormatText={handleFormatText}
        onChangeActiveBlockType={handleChangeActiveBlockType}
        onConvertToList={handleConvertToList}
        onAlignText={handleAlignText}
        onInsertTable={handleInsertTableFromToolbar}
        onTriggerImageUpload={() => hiddenImageInputRef.current?.click()}
        onInsertBlock={handleInsertBlockFromToolbar}
        currentStyle={currentStyle}
        fontSize={currentFontSize}
        onFontSizeChange={handleFontSizeChange}
        zoom={zoom}
        onZoomChange={(newZoom) => setZoom(newZoom)}
      />

      {/* Hidden file input for toolbar image insertion */}
      <input
        ref={hiddenImageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleToolbarImageUpload}
      />


      {/* 3. WORKSPACE CANVAS (Single Pageless Paper Sheet) */}
      <div className="flex-1 overflow-y-auto relative flex justify-center py-6 px-3 sm:px-6">
        {/* THE SINGLE PAGELESS DOCUMENT SHEET (Tờ giấy duy nhất - Co giãn vô tận) */}
        <div
          onPaste={handleDocumentPaste}
          style={{
            transform: `scale(${parseInt(zoom, 10) / 100})`,
            transformOrigin: "top center",
            transition: "transform 0.2s ease-in-out",
          }}
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

            {/* Dải Metadata: Sapo */}
            <div className="space-y-4 pt-2">
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
                activeBlockIndex={activeBlockIndex}
                onSelectBlock={(idx, start, end) => {
                  setActiveBlockIndex(idx);
                  if (typeof start === "number" && typeof end === "number") {
                    setSelectionInfo({ start, end });
                  }
                }}
                onChange={(newBlocks) => {
                  setBlocks(newBlocks);
                  pushHistory(newBlocks);
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

              {/* Chuyên mục */}
              <div>
                <label className="text-xs font-semibold text-[#5F6368] mb-1.5 block">Chuyên mục</label>
                <select
                  value={formData.category}
                  onChange={(e) => {
                    setFormData((p) => ({ ...p, category: e.target.value }));
                    setSaveStatus("Chưa lưu");
                  }}
                  className="w-full bg-[#FAF8F5] border border-[#DADCE0] rounded px-3 py-1.5 text-xs text-[#1F1F1F] focus:border-[#1A73E8] outline-none"
                >
                  <option value="kien-thuc-ve-go">Kiến Thức Về Gỗ</option>
                  <option value="vat-pham-phong-thuy">Vật Phẩm Phong Thủy</option>
                  <option value="nghe-thuat-che-tac">Nghệ Thuật Chế Tác</option>
                  <option value="tin-tuc-su-kien">Tin Tức Xưởng Đông Phong</option>
                </select>
              </div>

              {/* Tác giả */}
              <div>
                <label className="text-xs font-semibold text-[#5F6368] mb-1.5 block">Tác giả</label>
                <input
                  type="text"
                  value="Nghệ nhân Đông Phong"
                  disabled
                  className="w-full bg-[#F1F3F4] border border-[#DADCE0] rounded px-3 py-1.5 text-xs text-[#5F6368] cursor-not-allowed outline-none"
                />
              </div>

              {/* Thời gian đọc */}
              <div>
                <label className="text-xs font-semibold text-[#5F6368] mb-1.5 flex justify-between">
                  <span>Thời gian đọc (phút)</span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsReadingTimeManual(false);
                      toast.success("Đã bật tự động tính thời gian đọc");
                    }}
                    className="text-[11px] text-[#1A73E8] hover:underline flex items-center gap-0.5"
                  >
                    <Wand2 className="w-3 h-3" /> Tự động
                  </button>
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.readingTime}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, readingTime: parseInt(e.target.value) || 1 }));
                    setIsReadingTimeManual(true);
                    setSaveStatus("Chưa lưu");
                  }}
                  className="w-full bg-[#FAF8F5] border border-[#DADCE0] rounded px-3 py-1.5 text-xs text-[#1F1F1F] focus:border-[#1A73E8] outline-none"
                />
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
