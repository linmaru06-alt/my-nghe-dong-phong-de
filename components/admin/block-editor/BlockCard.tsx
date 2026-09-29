"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  Plus,
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
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import { EditorBlock, BlockType } from "@/lib/blockEditor";
import { toast } from "@/components/ui/Toast";
import { AutoResizeTextarea } from "@/components/ui/AutoResizeTextarea";

// ═══════════════════════════════════════════════════════
// Tiện ích bỏ dấu tiếng Việt cho tìm kiếm slash menu
// ═══════════════════════════════════════════════════════
function removeDiacritics(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

// ═══════════════════════════════════════════════════════
// Danh sách loại khối — dùng chung cho Slash Menu và Menu ⋮⋮
// ═══════════════════════════════════════════════════════
export const BLOCK_TYPES: { type: BlockType; label: string; desc: string; icon: any; keywords?: string }[] = [
  { type: "text", label: "Đoạn văn", desc: "Văn bản thuần túy, mượt mà", icon: AlignLeft, keywords: "paragraph van ban doan van" },
  { type: "heading", label: "Tiêu đề", desc: "H2, H3 phân đoạn bài viết", icon: HeadingIcon, keywords: "heading tieu de h2 h3 h4" },
  { type: "image", label: "Hình ảnh", desc: "Ảnh cận cảnh thớ gỗ, phôi gỗ", icon: ImageIcon, keywords: "hinh anh photo picture" },
  { type: "section", label: "Khối nổi bật", desc: "Hộp ghi chú phong thủy & điểm nhấn", icon: Box, keywords: "section khoi noi bat hop hop chu callout" },
  { type: "layout", label: "Bố cục 2 cột", desc: "So sánh hoặc chia đôi thông tin", icon: Columns, keywords: "layout bo cuc 2 cot chia cot" },
  { type: "quote", label: "Trích dẫn", desc: "Lời nói nghệ nhân, triết lý mộc", icon: QuoteIcon, keywords: "trich dan blockquote loi khuyen" },
  { type: "list", label: "Danh sách", desc: "Danh sách dấu chấm hoặc đánh số", icon: ListIcon, keywords: "list danh sach gach dau dong" },
  { type: "button", label: "Nút bấm CTA", desc: "Nút liên hệ Zalo / Hotline", icon: MousePointerClick, keywords: "nut bam cta button lien he" },
  { type: "table", label: "Bảng biểu", desc: "Bảng phân biệt và thông số", icon: TableIcon, keywords: "bang bieu table so sanh" },
  { type: "divider", label: "Đường kẻ ngang", desc: "Phân cách nhẹ giữa các phần", icon: Minus, keywords: "ke ngang separator divider line" },
];

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
  // ───── State ─────
  const [showMenu, setShowMenu] = useState(false);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashQuery, setSlashQuery] = useState("");
  const [slashIndex, setSlashIndex] = useState(0);
  const [showToolbar, setShowToolbar] = useState(false);
  const [showTypeSwitcherInToolbar, setShowTypeSwitcherInToolbar] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // ───── Refs ─────
  const blockRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const activeTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const selectionRangeRef = useRef<{ start: number; end: number }>({ start: 0, end: 0 });

  // ───── Lọc slash menu ─────
  const filteredItems = BLOCK_TYPES.filter((m) => {
    if (!slashQuery) return true;
    const q = removeDiacritics(slashQuery.toLowerCase());
    return (
      removeDiacritics(m.label.toLowerCase()).includes(q) ||
      m.type.toLowerCase().includes(q) ||
      (m.keywords && removeDiacritics(m.keywords).includes(q))
    );
  });

  // ───── Click outside để đóng menu ─────
  useEffect(() => {
    if (!showMenu && !showToolbar) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        setShowToolbar(false);
        setShowTypeSwitcherInToolbar(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showMenu, showToolbar]);

  // ═══════════════════════════════════════════════════════
  // Upload ảnh cho block Hình ảnh
  // ═══════════════════════════════════════════════════════
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

  // ═══════════════════════════════════════════════════════
  // Floating Toolbar — hiện khi bôi đen chữ
  // ═══════════════════════════════════════════════════════
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

  // ═══════════════════════════════════════════════════════
  // Keyboard handler — phím tắt, slash menu, Enter/Backspace
  // ═══════════════════════════════════════════════════════
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Điều hướng Slash Menu
    if (showSlashMenu) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSlashIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSlashIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        const selected = filteredItems[slashIndex];
        if (selected) {
          onChangeType(selected.type, { text: "" });
          setShowSlashMenu(false);
        }
        return;
      }
      if (e.key === "Escape") {
        setShowSlashMenu(false);
        return;
      }
    }

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

    // Backspace ở block rỗng → xóa block, lùi con trỏ về block trước
    if (e.key === "Backspace") {
      const textKey = block.type === "quote" ? "quote" : "text";
      if ((block.data[textKey] || "") === "") {
        e.preventDefault();
        onDelete();
        onFocusPrevious();
      }
    }
  };

  // ═══════════════════════════════════════════════════════
  // Text change — gõ slash menu, markdown shortcuts
  // ═══════════════════════════════════════════════════════
  const handleTextChange = (val: string) => {
    if (val.startsWith("/")) {
      setShowSlashMenu(true);
      setSlashQuery(val.substring(1));
      setSlashIndex(0);
      onUpdate({ ...block.data, text: val });
      return;
    } else {
      setShowSlashMenu(false);
    }

    // Markdown shortcuts tự động chuyển loại khối
    if (val === "## ") { onChangeType("heading", { level: 2, text: "" }); return; }
    if (val === "### ") { onChangeType("heading", { level: 3, text: "" }); return; }
    if (val === "#### ") { onChangeType("heading", { level: 4, text: "" }); return; }
    if (val === "> ") { onChangeType("quote", { quote: "" }); return; }
    if (val === "- " || val === "* ") { onChangeType("list", { listType: "bullet", items: [""] }); return; }
    if (val === "1. ") { onChangeType("list", { listType: "numbered", items: [""] }); return; }
    if (val === "---") { onChangeType("divider", { style: "solid" }); return; }

    onUpdate({ ...block.data, text: val });
  };

  // ═══════════════════════════════════════════════════════
  // Drag handle
  // ═══════════════════════════════════════════════════════
  const handleDragStart = (e: React.DragEvent) => {
    if (blockRef.current) {
      e.dataTransfer.setDragImage(blockRef.current, 20, 20);
    }
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", "");
    onDragStart();
  };

  // ═══════════════════════════════════════════════════════
  // Render
  // ═══════════════════════════════════════════════════════
  return (
    <div
      ref={blockRef}
      id={id}
      className={`group/block relative pl-8 md:pl-10 my-1 transition-all duration-150 ${
        isDragging ? "opacity-30 scale-[0.98]" : ""
      }`}
      onFocus={() => {
        setIsFocused(true);
        onFocus();
      }}
      onBlur={() => setIsFocused(false)}
    >
      {/* ────── Left Gutter: + và ⋮⋮ ────── */}
      <div className="absolute left-0 top-1 flex items-center gap-0.5 opacity-0 group-hover/block:opacity-100 focus-within:opacity-100 transition-opacity duration-150 z-20">
        <button
          type="button"
          onClick={onInsertBelow}
          className="p-1 rounded hover:bg-[#C5A059]/15 text-text-muted/40 hover:text-[#C5A059] transition-colors"
          title="Thêm khối bên dưới"
          aria-label="Thêm khối bên dưới"
        >
          <Plus className="w-[18px] h-[18px]" />
        </button>
        <button
          type="button"
          draggable
          onDragStart={handleDragStart}
          onDragEnd={onDragEnd}
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className="p-1 rounded hover:bg-[#C5A059]/15 text-text-muted/40 hover:text-[#C5A059] transition-colors cursor-grab active:cursor-grabbing"
          title="Kéo để sắp xếp · Bấm để mở menu"
          aria-label="Kéo để sắp xếp hoặc bấm để mở menu"
        >
          <GripVertical className="w-[18px] h-[18px]" />
        </button>
      </div>

      {/* ────── Vùng nội dung khối — không viền thô, mượt mà như Notion ────── */}
      <div className="relative rounded-lg py-1 px-1 transition-all duration-150 focus-within:bg-white/60 focus-within:shadow-[0_0_0_1.5px_rgba(197,160,89,0.12)]">

        {/* Floating Toolbar — hiện khi bôi đen chữ */}
        {showToolbar && (
          <div
            ref={toolbarRef}
            className="absolute -top-11 left-1/2 -translate-x-1/2 z-40 flex items-center gap-0.5 bg-[#2A160C] text-white rounded-lg shadow-xl shadow-black/25 px-1.5 py-1"
          >
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
              title="Chèn liên kết (Ctrl+K)"
            >
              <LinkIcon className="w-3.5 h-3.5" />
            </button>

            <div className="w-px h-4 bg-white/20 mx-1" />

            {/* Đổi loại khối từ floating toolbar */}
            <div className="relative">
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  setShowTypeSwitcherInToolbar(!showTypeSwitcherInToolbar);
                }}
                className="flex items-center gap-1 px-2 py-1 text-xs hover:bg-white/15 rounded transition-colors text-amber-200"
                title="Đổi loại khối"
              >
                <span>Đổi loại</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {showTypeSwitcherInToolbar && (
                <div className="absolute top-full left-0 mt-1.5 w-40 bg-[#2A160C] border border-white/10 rounded-lg shadow-xl py-1 z-50">
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      onChangeType("text");
                      setShowToolbar(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-white/90 hover:bg-white/10 transition-colors"
                  >
                    Đoạn văn
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      onChangeType("heading", { level: 2 });
                      setShowToolbar(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-white/90 hover:bg-white/10 transition-colors"
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
                    className="w-full text-left px-3 py-1.5 text-xs text-white/90 hover:bg-white/10 transition-colors"
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
                    className="w-full text-left px-3 py-1.5 text-xs text-white/90 hover:bg-white/10 transition-colors"
                  >
                    Trích dẫn
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      onChangeType("list");
                      setShowToolbar(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-white/90 hover:bg-white/10 transition-colors"
                  >
                    Danh sách
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════ */}
        {/*  1. TEXT BLOCK                         */}
        {/* ══════════════════════════════════════ */}
        {block.type === "text" && (
          <div className="relative">
            <AutoResizeTextarea
              value={block.data.text || ""}
              onChange={(e) => handleTextChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onSelect={handleTextSelect}
              placeholder="Gõ / để chèn khối..."
              className="w-full bg-transparent border-none rounded-none p-0 text-[17px] text-text focus:outline-none focus:ring-0 leading-[1.7] resize-none overflow-hidden placeholder:text-text-muted/25"
            />

            {/* Slash Menu */}
            {showSlashMenu && (
              <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-border/80 rounded-xl shadow-2xl z-50 max-h-72 overflow-y-auto p-1.5">
                <div className="px-2.5 py-1.5 text-[11px] font-medium text-text-muted border-b border-border/40 bg-surface/30 rounded-t-lg mb-1">
                  Chèn khối (gõ để lọc, Enter chọn, Esc đóng)
                </div>
                {filteredItems.map((item, i) => {
                  const ItemIcon = item.icon;
                  return (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() => {
                        onChangeType(item.type, { text: "" });
                        setShowSlashMenu(false);
                      }}
                      className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center gap-3 transition-colors ${
                        i === slashIndex ? "bg-[#C5A059]/15 text-[#3D2314]" : "hover:bg-surface/60 text-text"
                      }`}
                    >
                      <div className={`p-2 rounded-lg shrink-0 ${i === slashIndex ? "bg-[#C5A059] text-white" : "bg-surface text-text-muted"}`}>
                        <ItemIcon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-semibold text-text">{item.label}</div>
                        <div className="text-[11px] text-text-muted truncate">{item.desc}</div>
                      </div>
                    </button>
                  );
                })}
                {filteredItems.length === 0 && (
                  <div className="px-3 py-4 text-center text-sm text-text-muted">Không tìm thấy khối nào phù hợp</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════ */}
        {/*  2. HEADING BLOCK                     */}
        {/* ══════════════════════════════════════ */}
        {block.type === "heading" && (
          <div className="relative group/heading">
            {/* Pill level selector chỉ hiện khi hover hoặc focus */}
            <div className="flex items-center gap-1.5 mb-1.5 opacity-0 group-hover/heading:opacity-100 focus-within:opacity-100 transition-opacity">
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
              className={`w-full bg-transparent border-none rounded-none p-0 font-serif font-bold text-primary focus:outline-none focus:ring-0 resize-none overflow-hidden placeholder:text-text-muted/25 ${
                block.data.level === 3 ? "text-xl" : block.data.level === 4 ? "text-lg" : "text-2xl"
              }`}
            />
          </div>
        )}

        {/* ══════════════════════════════════════ */}
        {/*  3. IMAGE BLOCK                       */}
        {/* ══════════════════════════════════════ */}
        {block.type === "image" && (
          <div className="space-y-2">
            <div className="relative aspect-[16/10] rounded-lg overflow-hidden bg-surface border border-border/40 flex items-center justify-center group/img">
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
                <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center hover:bg-surface/80 transition-colors">
                  {isUploading || block.data._uploading ? (
                    <Loader2 className="w-6 h-6 animate-spin text-[#C5A059]" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-border mb-2" />
                  )}
                  <span className="text-[12px] text-text-muted font-medium">
                    {isUploading || block.data._uploading ? "Đang tải ảnh lên..." : "Click hoặc kéo thả file ảnh vào đây"}
                  </span>
                  <span className="text-[10px] text-text-muted/60 mt-0.5">Hoặc bấm Ctrl+V ở bất kỳ đâu để dán ảnh</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleUploadImage} disabled={isUploading} />
                </label>
              )}
            </div>
            {block.data.url && (
              <input
                type="text"
                value={block.data.caption || ""}
                onChange={(e) => onUpdate({ ...block.data, caption: e.target.value })}
                placeholder="Chú thích ảnh (ví dụ: Cận cảnh vân gỗ nu bách xanh già cỗi)..."
                className="w-full bg-transparent text-center text-sm text-text-muted italic focus:outline-none focus:text-text border-none p-0 placeholder:text-text-muted/25"
              />
            )}
          </div>
        )}

        {/* ══════════════════════════════════════ */}
        {/*  4. QUOTE BLOCK                       */}
        {/* ══════════════════════════════════════ */}
        {block.type === "quote" && (
          <div className="border-l-[3.5px] border-[#C5A059] pl-4 py-1.5 space-y-2">
            <AutoResizeTextarea
              value={block.data.quote || ""}
              onChange={(e) => onUpdate({ ...block.data, quote: e.target.value })}
              onKeyDown={handleKeyDown}
              onSelect={handleTextSelect}
              placeholder="Nhập câu trích dẫn hoặc triết lý mộc..."
              className="w-full bg-transparent border-none p-0 text-[17px] italic font-serif text-text focus:outline-none focus:ring-0 resize-none overflow-hidden placeholder:text-text-muted/25 leading-[1.7]"
            />
            <input
              type="text"
              value={block.data.author || ""}
              onChange={(e) => onUpdate({ ...block.data, author: e.target.value })}
              placeholder="— Tác giả / Nghệ nhân Đông Phong"
              className="w-full sm:w-64 bg-transparent border-none px-0 py-0.5 text-xs font-semibold text-[#C5A059] focus:outline-none placeholder:text-text-muted/30"
            />
          </div>
        )}

        {/* ══════════════════════════════════════ */}
        {/*  5. LIST BLOCK                        */}
        {/* ══════════════════════════════════════ */}
        {block.type === "list" && (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 mb-1 opacity-0 group-hover/block:opacity-100 focus-within:opacity-100 transition-opacity">
              <span className="text-[11px] font-semibold text-[#C5A059] uppercase tracking-wider">Loại danh sách:</span>
              <button
                type="button"
                onClick={() => onUpdate({ ...block.data, listType: block.data.listType === "numbered" ? "bullet" : "numbered" })}
                className="px-2 py-0.5 text-[11px] bg-surface hover:bg-surface/80 text-text-muted rounded border border-border/50 font-medium transition-colors"
              >
                {block.data.listType === "numbered" ? "1. Đang đánh số (chuyển sang dấu chấm •)" : "• Đang dấu chấm (chuyển sang số 1.)"}
              </button>
            </div>

            {(block.data.items || [""]).map((item: string, i: number) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-base text-text-muted mt-[4px] select-none w-5 text-right shrink-0">
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
                  className="flex-1 bg-transparent border-none p-0 text-[17px] text-text focus:outline-none focus:ring-0 resize-none overflow-hidden placeholder:text-text-muted/25 leading-[1.7]"
                />
              </div>
            ))}
          </div>
        )}

        {/* ══════════════════════════════════════ */}
        {/*  6. SECTION BLOCK (Khối Hộp Callout)   */}
        {/* ══════════════════════════════════════ */}
        {block.type === "section" && (
          <div className="bg-[#FAF6F0] border-l-4 border-[#C5A059] rounded-r-xl p-4 my-2 space-y-2 shadow-xs">
            <div className="flex items-center gap-2 text-[#C5A059] text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Khối điểm nhấn phong thủy</span>
            </div>
            <input
              type="text"
              value={block.data.title || ""}
              onChange={(e) => onUpdate({ ...block.data, title: e.target.value })}
              placeholder="Tiêu đề khối nổi bật..."
              className="w-full bg-transparent border-none p-0 font-serif font-bold text-lg text-primary focus:outline-none placeholder:text-text-muted/30"
            />
            <AutoResizeTextarea
              value={block.data.content || ""}
              onChange={(e) => onUpdate({ ...block.data, content: e.target.value })}
              onSelect={handleTextSelect}
              placeholder="Nhập nội dung chia sẻ chuyên sâu hoặc giá trị phong thủy..."
              className="w-full bg-transparent border-none p-0 text-[15px] text-text leading-relaxed focus:outline-none focus:ring-0 resize-none overflow-hidden placeholder:text-text-muted/30"
            />
          </div>
        )}

        {/* ══════════════════════════════════════ */}
        {/*  7. LAYOUT BLOCK (Bố cục 2 cột)       */}
        {/* ══════════════════════════════════════ */}
        {block.type === "layout" && (
          <div className="bg-[#FAF6F0]/60 border border-border/60 rounded-xl p-4 my-2 space-y-3">
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-primary">
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
                        ? "bg-[#C5A059] text-white font-medium"
                        : "bg-surface text-text-muted hover:text-text"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Cột trái */}
              <div className="bg-white/80 rounded-lg p-3 border border-border/40 space-y-1.5">
                <input
                  type="text"
                  value={block.data.leftTitle || ""}
                  onChange={(e) => onUpdate({ ...block.data, leftTitle: e.target.value })}
                  placeholder="Tiêu đề cột trái..."
                  className="w-full bg-transparent font-serif font-bold text-[15px] text-primary focus:outline-none border-b border-border/30 pb-1"
                />
                <AutoResizeTextarea
                  value={block.data.leftContent || ""}
                  onChange={(e) => onUpdate({ ...block.data, leftContent: e.target.value })}
                  placeholder="Nội dung cột trái..."
                  className="w-full bg-transparent text-[14px] text-text leading-relaxed focus:outline-none resize-none p-0"
                />
              </div>

              {/* Cột phải */}
              <div className="bg-white/80 rounded-lg p-3 border border-border/40 space-y-1.5">
                <input
                  type="text"
                  value={block.data.rightTitle || ""}
                  onChange={(e) => onUpdate({ ...block.data, rightTitle: e.target.value })}
                  placeholder="Tiêu đề cột phải..."
                  className="w-full bg-transparent font-serif font-bold text-[15px] text-primary focus:outline-none border-b border-border/30 pb-1"
                />
                <AutoResizeTextarea
                  value={block.data.rightContent || ""}
                  onChange={(e) => onUpdate({ ...block.data, rightContent: e.target.value })}
                  placeholder="Nội dung cột phải..."
                  className="w-full bg-transparent text-[14px] text-text leading-relaxed focus:outline-none resize-none p-0"
                />
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════ */}
        {/*  8. BUTTON BLOCK (Nút bấm CTA)        */}
        {/* ══════════════════════════════════════ */}
        {block.type === "button" && (
          <div className="bg-surface/40 border border-dashed border-border/60 rounded-xl p-4 my-2 space-y-3 text-center">
            <div className="inline-flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-all ${
                  block.data.buttonStyle === "zalo"
                    ? "bg-[#0068FF] text-white hover:bg-[#0052cc]"
                    : block.data.buttonStyle === "hotline"
                    ? "bg-[#A93226] text-white hover:bg-[#922B21]"
                    : "bg-[#3D2314] text-[#C5A059] border border-[#C5A059]/40 hover:bg-[#2A160C]"
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
                  className="w-full bg-white border border-border rounded px-2.5 py-1 text-xs focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-[11px] text-text-muted block mb-1">Đường dẫn liên kết</label>
                <input
                  type="text"
                  value={block.data.url || ""}
                  onChange={(e) => onUpdate({ ...block.data, url: e.target.value })}
                  placeholder="https://zalo.me/..."
                  className="w-full bg-white border border-border rounded px-2.5 py-1 text-xs focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-[11px] text-text-muted block mb-1">Kiểu nút</label>
                <select
                  value={block.data.buttonStyle || "primary"}
                  onChange={(e) => onUpdate({ ...block.data, buttonStyle: e.target.value })}
                  className="w-full bg-white border border-border rounded px-2 py-1 text-xs focus:outline-none focus:border-primary"
                >
                  <option value="primary">Mộc Quý Đông Phong</option>
                  <option value="zalo">Zalo Xanh</option>
                  <option value="hotline">Hotline Đỏ Gỗ</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════ */}
        {/*  9. TABLE BLOCK (Bảng biểu)           */}
        {/* ══════════════════════════════════════ */}
        {block.type === "table" && (
          <div className="my-3 overflow-x-auto border border-border rounded-xl p-3 bg-white space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-text-muted border-b border-border/40 pb-2">
              <span>Bảng so sánh & thông số</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const currentRows: string[][] = block.data.rows || [];
                    const headers: string[] = block.data.headers || ["Cột 1", "Cột 2"];
                    const newRow = new Array(headers.length).fill("Dữ liệu mới");
                    onUpdate({ ...block.data, rows: [...currentRows, newRow] });
                  }}
                  className="px-2 py-1 bg-surface hover:bg-surface/80 text-[11px] rounded text-primary font-medium"
                >
                  + Thêm hàng
                </button>
              </div>
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
                        className="w-full bg-transparent font-bold text-primary focus:outline-none"
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

        {/* ══════════════════════════════════════ */}
        {/*  10. DIVIDER BLOCK (Kẻ ngang)         */}
        {/* ══════════════════════════════════════ */}
        {block.type === "divider" && (
          <div className="py-3 flex items-center justify-center">
            <hr className="w-full border-t border-border/60" />
          </div>
        )}

        {/* ══════════════════════════════════════ */}
        {/*  11. HEADER / FOOTER BLOCKS           */}
        {/* ══════════════════════════════════════ */}
        {(block.type === "header" || block.type === "footer") && (
          <div className="bg-surface/40 border border-border/50 rounded-xl p-4 my-2 space-y-2">
            <span className="text-[11px] font-semibold text-[#C5A059] uppercase tracking-wider block">
              {block.type === "header" ? "Phần tiêu đề quan trọng" : "Lời kết & Cam kết chất lượng"}
            </span>
            <input
              type="text"
              value={block.data.title || ""}
              onChange={(e) => onUpdate({ ...block.data, title: e.target.value })}
              placeholder="Tiêu đề..."
              className="w-full bg-transparent font-serif font-bold text-lg text-primary focus:outline-none"
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
              className="w-full bg-transparent text-[15px] text-text leading-relaxed focus:outline-none resize-none p-0"
            />
          </div>
        )}
      </div>

      {/* ────── Dropdown Menu (khi bấm ⋮⋮) ────── */}
      {showMenu && (
        <div
          ref={menuRef}
          className="absolute left-0 top-full mt-1 w-60 bg-white border border-border/80 rounded-xl shadow-2xl z-50 overflow-hidden"
        >
          <div className="px-3 py-2 text-[11px] font-medium text-text-muted border-b border-border/40 bg-surface/30">
            Đổi loại khối
          </div>
          <div className="max-h-56 overflow-y-auto py-1">
            {BLOCK_TYPES.map((item) => {
              const ItemIcon = item.icon;
              const isActive = block.type === item.type;
              return (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => {
                    if (!isActive) onChangeType(item.type);
                    setShowMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 flex items-center gap-2.5 text-[13px] transition-colors ${
                    isActive ? "bg-[#C5A059]/15 text-[#3D2314] font-medium" : "hover:bg-surface/50 text-text"
                  }`}
                >
                  <ItemIcon className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-[#C5A059]" : "text-text-muted"}`} />
                  <span>{item.label}</span>
                  {isActive && <span className="ml-auto text-[10px] text-[#C5A059]">✓</span>}
                </button>
              );
            })}
          </div>
          <div className="border-t border-border/40 py-1">
            <button
              type="button"
              onClick={() => {
                onDuplicate();
                setShowMenu(false);
              }}
              className="w-full text-left px-3 py-2 flex items-center gap-2.5 text-[13px] text-text hover:bg-surface/50 transition-colors"
            >
              <Copy className="w-3.5 h-3.5 shrink-0 text-text-muted" />
              <span>Nhân đôi khối</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onDelete();
                setShowMenu(false);
              }}
              className="w-full text-left px-3 py-2 flex items-center gap-2.5 text-[13px] text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5 shrink-0 text-red-500" />
              <span>Xóa khối này</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
