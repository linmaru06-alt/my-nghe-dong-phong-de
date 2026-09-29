"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  GripVertical,
  Heading as HeadingIcon,
  AlignLeft,
  Image as ImageIcon,
  Columns,
  Box,
  Quote as QuoteIcon,
  List as ListIcon,
  Table as TableIcon,
  MousePointerClick,
  Minus,
  Copy,
  Trash2,
  Loader2,
  Link as LinkIcon,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { EditorBlock, BlockType } from "@/lib/blockEditor";
import { toast } from "@/components/ui/Toast";
import { AutoResizeTextarea } from "@/components/ui/AutoResizeTextarea";

export interface BlockCardProps {
  id: string;
  block: EditorBlock;
  index: number;
  total: number;
  onUpdate: (data: Record<string, any>) => void;
  onChangeType: (type: BlockType, data?: any) => void;
  onInsertBelow: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onFocusPrevious: () => void;
  onFocus: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  isDragging: boolean;
}

export function BlockCard({
  id,
  block,
  index,
  total,
  onUpdate,
  onChangeType,
  onInsertBelow,
  onDelete,
  onDuplicate,
  onFocusPrevious,
  onFocus,
  onDragStart,
  onDragEnd,
  isDragging,
}: BlockCardProps) {
  const [showToolbar, setShowToolbar] = useState(false);
  const [showTypeSwitcherInToolbar, setShowTypeSwitcherInToolbar] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const blockRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const activeTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const selectionRangeRef = useRef<{ start: number; end: number }>({ start: 0, end: 0 });

  // Đóng floating toolbar khi click ra ngoài
  useEffect(() => {
    if (!showToolbar) return;
    const handler = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        setShowToolbar(false);
        setShowTypeSwitcherInToolbar(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showToolbar]);

  // Upload ảnh
  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Ảnh quá lớn", "Vui lòng chọn ảnh dưới 10MB");
      return;
    }

    setIsUploading(true);
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("folder", "blog");

      const res = await fetch("/api/admin/upload", { method: "POST", body: data });
      const json = await res.json();
      if (res.ok && json.success && json.url) {
        onUpdate({ ...block.data, url: json.url, _uploading: false });
        toast.success("Tải ảnh thành công");
      } else {
        throw new Error(json.error || "Không thể tải ảnh");
      }
    } catch (err: any) {
      toast.error("Lỗi tải ảnh", err.message);
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  // Floating Contextual Toolbar (Squarespace Style)
  const handleTextSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const ta = e.currentTarget;
    if (ta.selectionStart !== ta.selectionEnd) {
      activeTextareaRef.current = ta;
      selectionRangeRef.current = { start: ta.selectionStart, end: ta.selectionEnd };
      setShowToolbar(true);
    } else {
      setShowToolbar(false);
      setShowTypeSwitcherInToolbar(false);
    }
  };

  const applyInlineFormat = (type: "bold" | "italic" | "link") => {
    const ta = activeTextareaRef.current;
    if (!ta) return;

    const { start, end } = selectionRangeRef.current;
    const text = ta.value;
    const selected = text.substring(start, end);

    let wrapped = "";
    if (type === "bold") wrapped = `**${selected}**`;
    if (type === "italic") wrapped = `*${selected}*`;
    if (type === "link") wrapped = `[${selected || "text"}](url)`;

    const newText = text.substring(0, start) + wrapped + text.substring(end);
    const dataKey = block.type === "quote" ? "quote" : "text";
    onUpdate({ ...block.data, [dataKey]: newText });

    setTimeout(() => {
      ta.focus();
      if (type === "link") {
        ta.setSelectionRange(start + wrapped.length - 4, start + wrapped.length - 1);
      } else {
        ta.setSelectionRange(start + wrapped.length, start + wrapped.length);
      }
    }, 10);
    setShowToolbar(false);
  };

  // Keyboard handler: phím tắt markdown và điều hướng
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Phím tắt Markdown: Ctrl/Cmd + B, I, K
    if (e.metaKey || e.ctrlKey) {
      if (e.key === "b" || e.key === "i" || e.key === "k") {
        e.preventDefault();
        const el = e.currentTarget;
        const start = el.selectionStart;
        const end = el.selectionEnd;
        const text = el.value;
        const selected = text.substring(start, end);
        let wrapped = "";

        if (e.key === "b") wrapped = `**${selected}**`;
        if (e.key === "i") wrapped = `*${selected}*`;
        if (e.key === "k") wrapped = `[${selected || "text"}](url)`;

        const newText = text.substring(0, start) + wrapped + text.substring(end);
        const dataKey = block.type === "quote" ? "quote" : "text";
        onUpdate({ ...block.data, [dataKey]: newText });

        setTimeout(() => {
          el.focus();
          if (e.key === "k") el.setSelectionRange(start + wrapped.length - 4, start + wrapped.length - 1);
          else el.setSelectionRange(start + wrapped.length, start + wrapped.length);
        }, 0);
        return;
      }
    }

    // Enter → tạo block mới bên dưới nếu không bấm Shift
    if (e.key === "Enter" && !e.shiftKey) {
      const el = e.currentTarget;
      if (el.selectionStart === el.value.length) {
        e.preventDefault();
        onInsertBelow();
      }
    }

    // Backspace ở block rỗng → xóa block, lùi con trỏ về trước
    if (e.key === "Backspace") {
      const textKey = block.type === "quote" ? "quote" : "text";
      if ((block.data[textKey] || "") === "") {
        e.preventDefault();
        onDelete();
        onFocusPrevious();
      }
    }
  };

  // Markdown shortcuts
  const handleTextChange = (val: string) => {
    if (val === "## ") { onChangeType("heading", { level: 2, text: "" }); return; }
    if (val === "### ") { onChangeType("heading", { level: 3, text: "" }); return; }
    if (val === "#### ") { onChangeType("heading", { level: 4, text: "" }); return; }
    if (val === "> ") { onChangeType("quote", { quote: "" }); return; }
    if (val === "- " || val === "* ") { onChangeType("list", { listType: "bullet", items: [""] }); return; }
    if (val === "1. ") { onChangeType("list", { listType: "numbered", items: [""] }); return; }
    if (val === "---") { onChangeType("divider", { style: "solid" }); return; }

    onUpdate({ ...block.data, text: val });
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (blockRef.current) {
      e.dataTransfer.setDragImage(blockRef.current, 20, 20);
    }
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", "");
    onDragStart();
  };

  return (
    <div
      ref={blockRef}
      id={id}
      className={`group/block relative my-2 transition-all duration-150 rounded-xl ${
        isDragging ? "opacity-30 scale-[0.98]" : ""
      } ${
        isFocused
          ? "ring-1 ring-[#C5A059]/40 bg-white/40 shadow-xs"
          : "hover:ring-1 hover:ring-border/80"
      }`}
      onFocus={() => {
        setIsFocused(true);
        onFocus();
      }}
      onBlur={() => setIsFocused(false)}
    >
      {/* ────── Squarespace Block Action Bar (Góc trên phải khi hover) ────── */}
      <div className="absolute right-2 top-2 z-20 flex items-center gap-1 opacity-0 group-hover/block:opacity-100 focus-within:opacity-100 transition-opacity bg-white/90 backdrop-blur-xs border border-border/80 rounded-lg p-0.5 shadow-xs">
        <button
          type="button"
          draggable
          onDragStart={handleDragStart}
          onDragEnd={onDragEnd}
          className="p-1 rounded text-text-muted hover:text-[#3D2314] hover:bg-surface transition-colors cursor-grab active:cursor-grabbing"
          title="Kéo thả để sắp xếp khối"
        >
          <GripVertical className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={onDuplicate}
          className="p-1 rounded text-text-muted hover:text-[#3D2314] hover:bg-surface transition-colors"
          title="Nhân đôi khối"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={onDelete}
          className="p-1 rounded text-text-muted hover:text-red-600 hover:bg-red-50 transition-colors"
          title="Xóa khối này"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ────── Vùng nội dung khối ────── */}
      <div className="relative p-2 md:p-3">
        {/* Floating Contextual Toolbar (hiện khi bôi đen văn bản) */}
        {showToolbar && (
          <div
            ref={toolbarRef}
            className="absolute -top-11 left-1/2 -translate-x-1/2 z-40 flex items-center gap-0.5 bg-[#2A160C] text-white rounded-lg shadow-xl shadow-black/25 px-1.5 py-1"
          >
            {/* Format Selector Dropdown */}
            <div className="relative">
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  setShowTypeSwitcherInToolbar(!showTypeSwitcherInToolbar);
                }}
                className="flex items-center gap-1 px-2 py-1 text-xs hover:bg-white/15 rounded transition-colors text-[#C5A059] font-medium"
              >
                <span>{block.type === "heading" ? `H${block.data.level || 2}` : "Đoạn văn"}</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {showTypeSwitcherInToolbar && (
                <div className="absolute top-full left-0 mt-1.5 w-36 bg-[#2A160C] border border-white/10 rounded-lg shadow-xl py-1 z-50">
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      onChangeType("text");
                      setShowToolbar(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-white/90 hover:bg-white/10"
                  >
                    Đoạn văn (Text)
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      onChangeType("heading", { level: 2 });
                      setShowToolbar(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-white/90 hover:bg-white/10"
                  >
                    Tiêu đề H2
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      onChangeType("heading", { level: 3 });
                      setShowToolbar(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-white/90 hover:bg-white/10"
                  >
                    Tiêu đề H3
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      onChangeType("quote");
                      setShowToolbar(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-white/90 hover:bg-white/10"
                  >
                    Trích dẫn (Quote)
                  </button>
                </div>
              )}
            </div>

            <div className="w-px h-4 bg-white/20 mx-1" />

            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); applyInlineFormat("bold"); }}
              className="px-2.5 py-1 text-[13px] font-bold hover:bg-white/15 rounded transition-colors"
              title="Đậm (Ctrl+B)"
            >
              B
            </button>
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); applyInlineFormat("italic"); }}
              className="px-2.5 py-1 text-[13px] italic hover:bg-white/15 rounded transition-colors"
              title="Nghiêng (Ctrl+I)"
            >
              I
            </button>
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); applyInlineFormat("link"); }}
              className="px-2 py-1 hover:bg-white/15 rounded transition-colors"
              title="Chèn link (Ctrl+K)"
            >
              <LinkIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 1. TEXT BLOCK */}
        {block.type === "text" && (
          <AutoResizeTextarea
            value={block.data.text || ""}
            onChange={(e) => handleTextChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onSelect={handleTextSelect}
            placeholder="Bắt đầu viết nội dung ở đây..."
            className="w-full bg-transparent border-none rounded-none p-0 text-[17px] text-[#1F1610] focus:outline-none focus:ring-0 leading-[1.7] resize-none overflow-hidden placeholder:text-text-muted/30"
          />
        )}

        {/* 2. HEADING BLOCK */}
        {block.type === "heading" && (
          <div className="relative group/heading">
            <div className="flex items-center gap-1.5 mb-1 opacity-0 group-hover/heading:opacity-100 focus-within:opacity-100 transition-opacity">
              <span className="text-[11px] font-semibold text-[#C5A059] uppercase tracking-wider">Cấp tiêu đề:</span>
              <div className="inline-flex rounded-md p-0.5 bg-surface border border-border/60">
                <button
                  type="button"
                  onClick={() => onUpdate({ ...block.data, level: 2 })}
                  className={`px-2 py-0.5 text-xs rounded font-bold transition-colors ${
                    (block.data.level || 2) === 2 ? "bg-white text-primary shadow-xs" : "text-text-muted hover:text-text"
                  }`}
                >
                  H2
                </button>
                <button
                  type="button"
                  onClick={() => onUpdate({ ...block.data, level: 3 })}
                  className={`px-2 py-0.5 text-xs rounded font-bold transition-colors ${
                    block.data.level === 3 ? "bg-white text-primary shadow-xs" : "text-text-muted hover:text-text"
                  }`}
                >
                  H3
                </button>
                <button
                  type="button"
                  onClick={() => onUpdate({ ...block.data, level: 4 })}
                  className={`px-2 py-0.5 text-xs rounded font-bold transition-colors ${
                    block.data.level === 4 ? "bg-white text-primary shadow-xs" : "text-text-muted hover:text-text"
                  }`}
                >
                  H4
                </button>
              </div>
            </div>

            <AutoResizeTextarea
              value={block.data.text || ""}
              onChange={(e) => onUpdate({ ...block.data, text: e.target.value })}
              onKeyDown={handleKeyDown}
              onSelect={handleTextSelect}
              placeholder="Nhập tiêu đề phân đoạn..."
              className={`w-full bg-transparent border-none rounded-none p-0 font-serif font-bold text-[#3D2314] focus:outline-none focus:ring-0 resize-none overflow-hidden placeholder:text-text-muted/30 ${
                block.data.level === 3 ? "text-xl" : block.data.level === 4 ? "text-lg" : "text-2xl"
              }`}
            />
          </div>
        )}

        {/* 3. IMAGE BLOCK */}
        {block.type === "image" && (
          <div className="space-y-2">
            <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-surface border border-border/50 flex items-center justify-center group/img">
              {block.data.url ? (
                <>
                  <Image src={block.data.url} alt={block.data.alt || "Ảnh bài viết"} fill className="object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center gap-3 transition-opacity duration-200">
                    <label className="px-3 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-md cursor-pointer transition-colors text-white text-xs font-medium">
                      Đổi ảnh
                      <input type="file" accept="image/*" className="hidden" onChange={handleUploadImage} disabled={isUploading} />
                    </label>
                    <button
                      type="button"
                      onClick={() => onUpdate({ ...block.data, url: "" })}
                      className="px-3 py-1.5 bg-red-500/80 hover:bg-red-600 backdrop-blur-sm rounded-md transition-colors text-white text-xs font-medium"
                    >
                      Xóa ảnh
                    </button>
                  </div>
                </>
              ) : (
                <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center hover:bg-surface/80 transition-colors p-4">
                  {isUploading || block.data._uploading ? (
                    <Loader2 className="w-6 h-6 animate-spin text-[#C5A059]" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-border mb-2" />
                  )}
                  <span className="text-[13px] text-[#3D2314] font-medium">
                    {isUploading || block.data._uploading ? "Đang tải ảnh lên..." : "Click hoặc kéo thả file ảnh vào đây"}
                  </span>
                  <span className="text-[11px] text-text-muted mt-1">Hoặc dán ảnh trực tiếp (Ctrl+V)</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleUploadImage} disabled={isUploading} />
                </label>
              )}
            </div>
            {block.data.url && (
              <input
                type="text"
                value={block.data.caption || ""}
                onChange={(e) => onUpdate({ ...block.data, caption: e.target.value })}
                placeholder="Chú thích ảnh (ví dụ: Vân gỗ bách xanh già cỗi tại xưởng)..."
                className="w-full bg-transparent text-center text-sm text-text-muted italic focus:outline-none focus:text-[#1F1610] border-none p-0 placeholder:text-text-muted/30"
              />
            )}
          </div>
        )}

        {/* 4. QUOTE BLOCK */}
        {block.type === "quote" && (
          <div className="border-l-[3.5px] border-[#C5A059] pl-4 py-1 space-y-2">
            <AutoResizeTextarea
              value={block.data.quote || ""}
              onChange={(e) => onUpdate({ ...block.data, quote: e.target.value })}
              onKeyDown={handleKeyDown}
              onSelect={handleTextSelect}
              placeholder="Nhập câu trích dẫn hoặc triết lý mộc..."
              className="w-full bg-transparent border-none p-0 text-[18px] italic font-serif text-[#3D2314] focus:outline-none focus:ring-0 resize-none overflow-hidden placeholder:text-text-muted/30 leading-[1.7]"
            />
            <input
              type="text"
              value={block.data.author || ""}
              onChange={(e) => onUpdate({ ...block.data, author: e.target.value })}
              placeholder="— Nghệ nhân Đông Phong"
              className="w-full sm:w-64 bg-transparent border-none px-0 py-0.5 text-xs font-semibold text-[#C5A059] focus:outline-none placeholder:text-text-muted/30"
            />
          </div>
        )}

        {/* 5. LIST BLOCK */}
        {block.type === "list" && (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 mb-1 opacity-0 group-hover/block:opacity-100 focus-within:opacity-100 transition-opacity">
              <span className="text-[11px] font-semibold text-[#C5A059] uppercase tracking-wider">Kiểu danh sách:</span>
              <button
                type="button"
                onClick={() => onUpdate({ ...block.data, listType: block.data.listType === "numbered" ? "bullet" : "numbered" })}
                className="px-2 py-0.5 text-[11px] bg-surface hover:bg-surface/80 text-text-muted rounded border border-border/50 font-medium transition-colors"
              >
                {block.data.listType === "numbered" ? "1. Đánh số (click chuyển dấu •)" : "• Dấu chấm (click chuyển số 1.)"}
              </button>
            </div>

            {(block.data.items || [""]).map((item: string, i: number) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-base text-text-muted mt-[3px] select-none w-5 text-right shrink-0">
                  {block.data.listType === "numbered" ? `${i + 1}.` : "•"}
                </span>
                <AutoResizeTextarea
                  value={item}
                  onChange={(e) => {
                    const next = [...(block.data.items || [""])];
                    next[i] = e.target.value;
                    onUpdate({ ...block.data, items: next });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      const next = [...(block.data.items || [""])];
                      next.splice(i + 1, 0, "");
                      onUpdate({ ...block.data, items: next });
                    } else if (e.key === "Backspace" && item === "") {
                      e.preventDefault();
                      if ((block.data.items || []).length <= 1) {
                        onDelete();
                        onFocusPrevious();
                      } else {
                        const next = block.data.items.filter((_: any, idx: number) => idx !== i);
                        onUpdate({ ...block.data, items: next });
                      }
                    }
                  }}
                  onSelect={handleTextSelect}
                  placeholder="Mục danh sách..."
                  className="flex-1 bg-transparent border-none p-0 text-[17px] text-[#1F1610] focus:outline-none focus:ring-0 resize-none overflow-hidden placeholder:text-text-muted/30 leading-[1.7]"
                />
              </div>
            ))}
          </div>
        )}

        {/* 6. SECTION BLOCK (Khối Hộp Phong Thủy) */}
        {block.type === "section" && (
          <div className="bg-[#FAF6F0] border-l-4 border-[#C5A059] rounded-r-xl p-4 my-1 space-y-2 shadow-xs">
            <div className="flex items-center gap-2 text-[#C5A059] text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Khối điểm nhấn phong thủy</span>
            </div>
            <input
              type="text"
              value={block.data.title || ""}
              onChange={(e) => onUpdate({ ...block.data, title: e.target.value })}
              placeholder="Tiêu đề khối nổi bật..."
              className="w-full bg-transparent border-none p-0 font-serif font-bold text-lg text-[#3D2314] focus:outline-none placeholder:text-text-muted/30"
            />
            <AutoResizeTextarea
              value={block.data.content || ""}
              onChange={(e) => onUpdate({ ...block.data, content: e.target.value })}
              onSelect={handleTextSelect}
              placeholder="Nhập nội dung chia sẻ chuyên sâu hoặc giá trị phong thủy..."
              className="w-full bg-transparent border-none p-0 text-[15px] text-[#5A4A42] leading-relaxed focus:outline-none focus:ring-0 resize-none overflow-hidden placeholder:text-text-muted/30"
            />
          </div>
        )}

        {/* 7. LAYOUT BLOCK (Bố Cục 2 Cột) */}
        {block.type === "layout" && (
          <div className="bg-[#FAF6F0]/60 border border-border/70 rounded-xl p-4 my-1 space-y-3">
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#3D2314]">
                <Columns className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>Bố cục 2 cột song song</span>
              </div>
              <div className="flex items-center gap-1">
                {(["50-50", "60-40", "40-60"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => onUpdate({ ...block.data, ratio: r })}
                    className={`px-2 py-0.5 text-[11px] rounded transition-colors ${
                      (block.data.ratio || "50-50") === r
                        ? "bg-[#3D2314] text-[#C5A059] font-medium"
                        : "bg-surface text-text-muted hover:text-text"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-3 border border-border/40 space-y-1.5">
                <input
                  type="text"
                  value={block.data.leftTitle || ""}
                  onChange={(e) => onUpdate({ ...block.data, leftTitle: e.target.value })}
                  placeholder="Tiêu đề cột trái..."
                  className="w-full bg-transparent font-serif font-bold text-[15px] text-[#3D2314] focus:outline-none border-b border-border/30 pb-1"
                />
                <AutoResizeTextarea
                  value={block.data.leftContent || ""}
                  onChange={(e) => onUpdate({ ...block.data, leftContent: e.target.value })}
                  placeholder="Nội dung cột trái..."
                  className="w-full bg-transparent text-[14px] text-[#5A4A42] leading-relaxed focus:outline-none resize-none p-0"
                />
              </div>

              <div className="bg-white rounded-lg p-3 border border-border/40 space-y-1.5">
                <input
                  type="text"
                  value={block.data.rightTitle || ""}
                  onChange={(e) => onUpdate({ ...block.data, rightTitle: e.target.value })}
                  placeholder="Tiêu đề cột phải..."
                  className="w-full bg-transparent font-serif font-bold text-[15px] text-[#3D2314] focus:outline-none border-b border-border/30 pb-1"
                />
                <AutoResizeTextarea
                  value={block.data.rightContent || ""}
                  onChange={(e) => onUpdate({ ...block.data, rightContent: e.target.value })}
                  placeholder="Nội dung cột phải..."
                  className="w-full bg-transparent text-[14px] text-[#5A4A42] leading-relaxed focus:outline-none resize-none p-0"
                />
              </div>
            </div>
          </div>
        )}

        {/* 8. BUTTON BLOCK (Nút CTA) */}
        {block.type === "button" && (
          <div className="bg-surface/40 border border-dashed border-border/70 rounded-xl p-4 my-1 space-y-3 text-center">
            <div className="inline-flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-all ${
                  block.data.buttonStyle === "zalo"
                    ? "bg-[#0068FF] text-white"
                    : block.data.buttonStyle === "hotline"
                    ? "bg-[#A93226] text-white"
                    : "bg-[#3D2314] text-[#C5A059] border border-[#C5A059]/40"
                }`}
              >
                <MousePointerClick className="w-4 h-4" />
                <span>{block.data.label || "Nhắn Zalo Nhận Tư Vấn"}</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-border/40 text-left">
              <div>
                <label className="text-[11px] text-text-muted block mb-1">Chữ hiển thị trên nút</label>
                <input
                  type="text"
                  value={block.data.label || ""}
                  onChange={(e) => onUpdate({ ...block.data, label: e.target.value })}
                  placeholder="Nhãn nút..."
                  className="w-full bg-white border border-border rounded px-2.5 py-1 text-xs focus:outline-none focus:border-[#C5A059]"
                />
              </div>
              <div>
                <label className="text-[11px] text-text-muted block mb-1">Đường dẫn liên kết</label>
                <input
                  type="text"
                  value={block.data.url || ""}
                  onChange={(e) => onUpdate({ ...block.data, url: e.target.value })}
                  placeholder="https://zalo.me/..."
                  className="w-full bg-white border border-border rounded px-2.5 py-1 text-xs focus:outline-none focus:border-[#C5A059]"
                />
              </div>
              <div>
                <label className="text-[11px] text-text-muted block mb-1">Kiểu nút</label>
                <select
                  value={block.data.buttonStyle || "primary"}
                  onChange={(e) => onUpdate({ ...block.data, buttonStyle: e.target.value })}
                  className="w-full bg-white border border-border rounded px-2 py-1 text-xs focus:outline-none focus:border-[#C5A059]"
                >
                  <option value="primary">Mộc Quý Đông Phong</option>
                  <option value="zalo">Zalo Xanh</option>
                  <option value="hotline">Hotline Đỏ Gỗ</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* 9. TABLE BLOCK */}
        {block.type === "table" && (
          <div className="my-2 overflow-x-auto border border-border/70 rounded-xl p-3 bg-white space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-[#5A4A42] border-b border-border/40 pb-2">
              <span>Bảng so sánh & thông số</span>
              <button
                type="button"
                onClick={() => {
                  const currentRows: string[][] = block.data.rows || [];
                  const headers: string[] = block.data.headers || ["Cột 1", "Cột 2"];
                  const newRow = new Array(headers.length).fill("Dữ liệu mới");
                  onUpdate({ ...block.data, rows: [...currentRows, newRow] });
                }}
                className="px-2 py-1 bg-surface hover:bg-surface/80 text-[11px] rounded text-[#3D2314] font-medium"
              >
                + Thêm hàng
              </button>
            </div>

            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-surface/60">
                  {(block.data.headers || ["Tiêu chí", "Gỗ Tự Nhiên Đông Phong"]).map((h: string, hi: number) => (
                    <th key={hi} className="p-2 border border-border text-left">
                      <input
                        type="text"
                        value={h}
                        onChange={(e) => {
                          const next = [...(block.data.headers || [])];
                          next[hi] = e.target.value;
                          onUpdate({ ...block.data, headers: next });
                        }}
                        className="w-full bg-transparent font-bold text-[#3D2314] focus:outline-none"
                      />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(block.data.rows || [["Vân mộc", "Vân sống tự nhiên"]]).map((row: string[], ri: number) => (
                  <tr key={ri} className="hover:bg-surface/30">
                    {row.map((cell: string, ci: number) => (
                      <td key={ci} className="p-2 border border-border">
                        <input
                          type="text"
                          value={cell}
                          onChange={(e) => {
                            const nextRows = [...(block.data.rows || [])];
                            nextRows[ri] = [...nextRows[ri]];
                            nextRows[ri][ci] = e.target.value;
                            onUpdate({ ...block.data, rows: nextRows });
                          }}
                          className="w-full bg-transparent focus:outline-none"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 10. DIVIDER BLOCK */}
        {block.type === "divider" && (
          <div className="py-4 flex items-center justify-center">
            <hr className="w-full border-t border-border/80" />
          </div>
        )}

        {/* 11. HEADER / FOOTER BLOCKS */}
        {(block.type === "header" || block.type === "footer") && (
          <div className="bg-[#FAF6F0]/60 border border-border/60 rounded-xl p-4 my-1 space-y-2">
            <span className="text-[11px] font-semibold text-[#C5A059] uppercase tracking-wider block">
              {block.type === "header" ? "Phần tiêu đề quan trọng" : "Lời kết & Cam kết chất lượng"}
            </span>
            <input
              type="text"
              value={block.data.title || ""}
              onChange={(e) => onUpdate({ ...block.data, title: e.target.value })}
              placeholder="Tiêu đề..."
              className="w-full bg-transparent font-serif font-bold text-lg text-[#3D2314] focus:outline-none"
            />
            <AutoResizeTextarea
              value={block.data.subtitle || block.data.content || ""}
              onChange={(e) =>
                onUpdate({
                  ...block.data,
                  [block.type === "header" ? "subtitle" : "content"]: e.target.value,
                })
              }
              placeholder="Nội dung mô tả hoặc lời kết..."
              className="w-full bg-transparent text-[15px] text-[#5A4A42] leading-relaxed focus:outline-none resize-none p-0"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default BlockCard;
