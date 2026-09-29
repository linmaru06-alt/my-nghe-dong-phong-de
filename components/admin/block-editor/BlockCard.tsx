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
const BLOCK_TYPES: { type: BlockType; label: string; icon: any; keywords?: string }[] = [
  { type: "text", label: "Đoạn văn", icon: AlignLeft, keywords: "paragraph van ban" },
  { type: "heading", label: "Tiêu đề", icon: HeadingIcon, keywords: "heading tieu de h2 h3" },
  { type: "image", label: "Hình ảnh", icon: ImageIcon, keywords: "hinh anh photo" },
  { type: "list", label: "Danh sách", icon: ListIcon, keywords: "list danh sach" },
  { type: "quote", label: "Trích dẫn", icon: QuoteIcon, keywords: "trich dan blockquote" },
  { type: "section", label: "Khối nổi bật", icon: Box, keywords: "section khoi noi bat" },
  { type: "layout", label: "Bố cục 2 cột", icon: Columns, keywords: "layout bo cuc 2 cot" },
  { type: "table", label: "Bảng biểu", icon: TableIcon, keywords: "bang bieu table" },
  { type: "button", label: "Nút bấm", icon: MousePointerClick, keywords: "nut bam cta" },
  { type: "divider", label: "Kẻ ngang", icon: Minus, keywords: "ke ngang separator" },
];

// ═══════════════════════════════════════════════════════
// Props
// ═══════════════════════════════════════════════════════
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
  const [isUploading, setIsUploading] = useState(false);

  // ───── Refs ─────
  const blockRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const activeTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const selectionRangeRef = useRef<{ start: number; end: number }>({ start: 0, end: 0 });

  // ───── Lọc slash menu (không phân biệt dấu tiếng Việt) ─────
  const filteredItems = BLOCK_TYPES.filter((m) => {
    if (!slashQuery) return true;
    const q = removeDiacritics(slashQuery.toLowerCase());
    return (
      removeDiacritics(m.label.toLowerCase()).includes(q) ||
      m.type.toLowerCase().includes(q) ||
      (m.keywords && removeDiacritics(m.keywords).includes(q))
    );
  });

  // ───── Đóng menu khi click ra ngoài ─────
  useEffect(() => {
    if (!showMenu) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showMenu]);

  // ═══════════════════════════════════════════════════════
  // Upload ảnh cho block Hình ảnh
  // ═══════════════════════════════════════════════════════
  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
        setSlashIndex((prev) => (prev + 1) % filteredItems.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSlashIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
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

    // Enter → tạo block mới bên dưới (nếu con trỏ ở cuối dòng)
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
  // Text change — bật slash menu, chuyển block bằng markdown shortcut
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

    // Markdown shortcuts
    if (val === "## ") { onChangeType("heading", { level: 2 }); return; }
    if (val === "### ") { onChangeType("heading", { level: 3 }); return; }
    if (val === "> ") { onChangeType("quote", { quote: "" }); return; }
    if (val === "- ") { onChangeType("list", { listType: "bullet", items: [""] }); return; }

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
      className={`group/block relative pl-8 md:pl-10 transition-all duration-150 ${
        isDragging ? "opacity-30 scale-[0.98]" : ""
      }`}
      onFocus={onFocus}
    >
      {/* ────── Left Gutter: + và ⋮⋮ ────── */}
      <div className="absolute left-0 top-1 flex items-center gap-0 opacity-0 group-hover/block:opacity-100 focus-within:opacity-100 transition-opacity duration-150 z-10">
        <button
          type="button"
          onClick={onInsertBelow}
          className="p-1 rounded hover:bg-[#C5A059]/10 text-text-muted/40 hover:text-[#C5A059] transition-colors"
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
          className="p-1 rounded hover:bg-[#C5A059]/10 text-text-muted/40 hover:text-[#C5A059] transition-colors cursor-grab active:cursor-grabbing"
          title="Kéo để sắp xếp · Bấm để mở menu"
          aria-label="Kéo để sắp xếp hoặc bấm để mở menu"
        >
          <GripVertical className="w-[18px] h-[18px]" />
        </button>
      </div>

      {/* ────── Vùng nội dung khối — sạch sẽ, không viền ────── */}
      <div className="relative rounded-lg py-1.5 px-1 transition-all duration-150 focus-within:bg-white/70 focus-within:shadow-[0_0_0_1.5px_rgba(197,160,89,0.12)]">

        {/* Floating Toolbar — hiện khi bôi đen chữ */}
        {showToolbar && (
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-30 flex items-center gap-0.5 bg-[#2A160C] text-white rounded-lg shadow-xl shadow-black/20 px-1 py-0.5">
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); applyInlineFormat("bold"); }}
              className="px-2.5 py-1.5 text-[13px] font-bold hover:bg-white/15 rounded transition-colors"
              title="Đậm (Ctrl+B)"
            >
              B
            </button>
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); applyInlineFormat("italic"); }}
              className="px-2.5 py-1.5 text-[13px] italic hover:bg-white/15 rounded transition-colors"
              title="Nghiêng (Ctrl+I)"
            >
              I
            </button>
            <div className="w-px h-4 bg-white/20 mx-0.5" />
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); applyInlineFormat("link"); }}
              className="px-2 py-1.5 hover:bg-white/15 rounded transition-colors"
              title="Chèn liên kết (Ctrl+K)"
            >
              <LinkIcon className="w-3.5 h-3.5" />
            </button>
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
              placeholder="Gõ / để chèn block..."
              className="w-full bg-transparent border-none rounded-none p-0 text-[17px] text-text focus:outline-none focus:ring-0 leading-[1.7] resize-none overflow-hidden placeholder:text-text-muted/25"
            />

            {/* Slash Menu */}
            {showSlashMenu && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-border/80 rounded-xl shadow-2xl z-50 max-h-72 overflow-y-auto">
                <div className="px-3 py-2 text-[11px] font-medium text-text-muted border-b border-border/40 bg-surface/30">
                  Chèn khối — gõ để lọc
                </div>
                {filteredItems.map((item, i) => {
                  const ItemIcon = item.icon;
                  return (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() => { onChangeType(item.type, { text: "" }); setShowSlashMenu(false); }}
                      className={`w-full text-left px-3 py-2.5 flex items-center gap-3 transition-colors ${
                        i === slashIndex ? "bg-[#C5A059]/10 text-[#3D2314]" : "hover:bg-surface/50 text-text"
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg ${i === slashIndex ? "bg-[#C5A059] text-white" : "bg-surface text-text-muted"}`}>
                        <ItemIcon className="w-4 h-4" />
                      </div>
                      <span className="text-[13px] font-medium">{item.label}</span>
                    </button>
                  );
                })}
                {filteredItems.length === 0 && (
                  <div className="px-3 py-4 text-center text-sm text-text-muted">Không tìm thấy khối nào</div>
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
            <select
              value={block.data.level || 2}
              onChange={(e) => onUpdate({ ...block.data, level: Number(e.target.value) })}
              className="absolute -left-1 top-0 bg-surface border border-border rounded px-1 py-0.5 text-[10px] font-bold text-text-muted focus:outline-none focus:border-[#C5A059] opacity-0 group-hover/heading:opacity-100 focus:opacity-100 transition-opacity w-12 z-10"
            >
              <option value={2}>H2</option>
              <option value={3}>H3</option>
              <option value={4}>H4</option>
            </select>
            <AutoResizeTextarea
              value={block.data.text || ""}
              onChange={(e) => onUpdate({ ...block.data, text: e.target.value })}
              onKeyDown={handleKeyDown}
              onSelect={handleTextSelect}
              placeholder="Nhập tiêu đề..."
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
                  <Image src={block.data.url} alt={block.data.alt || "Ảnh"} fill className="object-cover" />
                  <label className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center cursor-pointer transition-opacity duration-200 text-white text-xs font-medium">
                    Đổi ảnh
                    <input type="file" accept="image/*" className="hidden" onChange={handleUploadImage} disabled={isUploading} />
                  </label>
                </>
              ) : (
                <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center hover:bg-surface/80 transition-colors">
                  {isUploading || block.data._uploading ? (
                    <Loader2 className="w-6 h-6 animate-spin text-[#C5A059]" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-border mb-2" />
                  )}
                  <span className="text-[12px] text-text-muted">
                    {isUploading || block.data._uploading ? "Đang tải ảnh lên..." : "Click hoặc kéo thả ảnh vào đây"}
                  </span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleUploadImage} disabled={isUploading} />
                </label>
              )}
            </div>
            {block.data.url && (
              <input
                type="text"
                value={block.data.caption || ""}
                onChange={(e) => onUpdate({ ...block.data, caption: e.target.value })}
                placeholder="Chú thích ảnh..."
                className="w-full bg-transparent text-center text-sm text-text-muted italic focus:outline-none focus:text-text border-none p-0 placeholder:text-text-muted/25"
              />
            )}
          </div>
        )}

        {/* ══════════════════════════════════════ */}
        {/*  4. QUOTE BLOCK                       */}
        {/* ══════════════════════════════════════ */}
        {block.type === "quote" && (
          <div className="border-l-[3px] border-[#C5A059] pl-4 py-1 space-y-2">
            <AutoResizeTextarea
              value={block.data.quote || ""}
              onChange={(e) => onUpdate({ ...block.data, quote: e.target.value })}
              onKeyDown={handleKeyDown}
              onSelect={handleTextSelect}
              placeholder="Nhập câu trích dẫn..."
              className="w-full bg-transparent border-none p-0 text-[17px] italic font-serif text-text focus:outline-none focus:ring-0 resize-none overflow-hidden placeholder:text-text-muted/25 leading-[1.7]"
            />
            <input
              type="text"
              value={block.data.author || ""}
              onChange={(e) => onUpdate({ ...block.data, author: e.target.value })}
              placeholder="— Tên người nói"
              className="w-full sm:w-64 bg-transparent border-none px-0 py-1 text-xs font-semibold text-[#C5A059] focus:outline-none placeholder:text-text-muted/25"
            />
          </div>
        )}

        {/* ══════════════════════════════════════ */}
        {/*  5. LIST BLOCK                        */}
        {/* ══════════════════════════════════════ */}
        {block.type === "list" && (
          <div className="space-y-0.5">
            {(block.data.items || []).map((item: string, i: number) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-base text-text-muted mt-[5px] select-none w-5 text-right shrink-0">
                  {block.data.listType === "numbered" ? `${i + 1}.` : "•"}
                </span>
                <AutoResizeTextarea
                  value={item}
                  onChange={(e) => {
                    const next = [...block.data.items];
                    next[i] = e.target.value;
                    onUpdate({ ...block.data, items: next });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      const next = [...block.data.items];
                      next.splice(i + 1, 0, "");
                      onUpdate({ ...block.data, items: next });
                    } else if (e.key === "Backspace" && item === "") {
                      e.preventDefault();
                      if (block.data.items.length === 1) {
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
        {/*  6. SPECIAL BLOCKS (Section, Table,   */}
        {/*     Button, Layout, Header, Footer,   */}
        {/*     Divider)                           */}
        {/* ══════════════════════════════════════ */}
        {["section", "table", "button", "layout", "header", "footer", "divider"].includes(block.type) && (
          <div className="py-1">
            {block.type === "divider" ? (
              <hr className="border-t border-border/40 my-6" />
            ) : (
              <div className="py-4 px-4 bg-surface/30 border border-dashed border-border/40 rounded-lg flex flex-col items-center justify-center text-center">
                {(() => {
                  const info = BLOCK_TYPES.find((b) => b.type === block.type);
                  const InfoIcon = info?.icon || Box;
                  return (
                    <>
                      <InfoIcon className="w-5 h-5 text-[#C5A059]/50 mb-1.5" />
                      <span className="text-[12px] font-semibold text-text-muted/60">{info?.label || block.type}</span>
                      <span className="text-[11px] text-text-muted/40 mt-0.5">Dữ liệu được bảo toàn — xem ở chế độ Preview</span>
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ────── Dropdown Menu (khi bấm ⋮⋮) ────── */}
      {showMenu && (
        <div
          ref={menuRef}
          className="absolute left-0 top-full mt-1 w-56 bg-white border border-border/80 rounded-xl shadow-2xl z-50 overflow-hidden"
        >
          <div className="px-3 py-2 text-[11px] font-medium text-text-muted border-b border-border/40 bg-surface/30">
            Đổi loại khối
          </div>
          <div className="max-h-52 overflow-y-auto py-1">
            {BLOCK_TYPES.map((item) => {
              const ItemIcon = item.icon;
              const isActive = block.type === item.type;
              return (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => { if (!isActive) onChangeType(item.type); setShowMenu(false); }}
                  className={`w-full text-left px-3 py-2 flex items-center gap-2.5 text-[13px] transition-colors ${
                    isActive ? "bg-[#C5A059]/10 text-[#3D2314] font-medium" : "hover:bg-surface/50 text-text"
                  }`}
                >
                  <ItemIcon className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-[#C5A059]" : ""}`} />
                  {item.label}
                  {isActive && <span className="ml-auto text-[10px] text-[#C5A059]">✓</span>}
                </button>
              );
            })}
          </div>
          <div className="border-t border-border/40 py-1">
            <button
              type="button"
              onClick={() => { onDuplicate(); setShowMenu(false); }}
              className="w-full text-left px-3 py-2 flex items-center gap-2.5 text-[13px] text-text hover:bg-surface/50 transition-colors"
            >
              <Copy className="w-3.5 h-3.5 shrink-0" />
              Nhân đôi
            </button>
            <button
              type="button"
              onClick={() => { onDelete(); setShowMenu(false); }}
              className="w-full text-left px-3 py-2 flex items-center gap-2.5 text-[13px] text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5 shrink-0" />
              Xóa khối
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
