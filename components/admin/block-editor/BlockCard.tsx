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
  Sparkles,
  Copy,
  Trash2,
  Loader2,
  CheckSquare,
  Square,
  PlusCircle,
  MinusCircle,
  ExternalLink,
  MessageCircle,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { EditorBlock, BlockType } from "@/lib/blockEditor";
import { toast } from "@/components/ui/Toast";
import { AutoResizeTextarea } from "@/components/ui/AutoResizeTextarea";
import { RichContentEditable } from "@/components/ui/RichContentEditable";

export interface BlockCardProps {
  id: string;
  block: EditorBlock;
  index: number;
  total: number;
  onUpdate: (data: Record<string, any>) => void;
  onChangeType: (type: BlockType, data?: any) => void;
  onInsertBelow: (type?: BlockType, data?: any) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onFocusPrevious: () => void;
  onSelectBlock?: (index: number, start?: number, end?: number) => void;

  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnter?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  isDragOver?: boolean;
}

const SLASH_MENU_ITEMS: { type: BlockType; label: string; icon: any; data?: any }[] = [
  { type: "text", label: "Äoáº¡n vÄƒn (Normal)", icon: AlignLeft },
  { type: "heading", label: "TiĂªu Ä‘á» lá»›n (H2)", icon: HeadingIcon, data: { level: 2 } },
  { type: "heading", label: "TiĂªu Ä‘á» phá»¥ (H3)", icon: HeadingIcon, data: { level: 3 } },
  { type: "image", label: "HĂ¬nh áº£nh (Ctrl+V Ä‘á»ƒ dĂ¡n)", icon: ImageIcon },
  { type: "table", label: "Báº£ng biá»ƒu (Table)", icon: TableIcon },
  { type: "list", label: "Danh sĂ¡ch kiá»ƒm tra (Checklist)", icon: CheckSquare, data: { listType: "checklist", items: [{ checked: false, text: "" }] } },
  { type: "list", label: "Danh sĂ¡ch dáº¥u cháº¥m (Bullet)", icon: ListIcon, data: { listType: "bullet", items: [""] } },
  { type: "list", label: "Danh sĂ¡ch Ä‘Ă¡nh sá»‘ (1, 2, 3)", icon: ListIcon, data: { listType: "numbered", items: [""] } },
  { type: "quote", label: "TrĂ­ch dáº«n nghá»‡ nhĂ¢n", icon: QuoteIcon },
  { type: "section", label: "Khá»‘i ná»•i báº­t phong thá»§y", icon: Box },
  { type: "layout", label: "Bá»‘ cá»¥c 2 cá»™t song song", icon: Columns },
  { type: "button", label: "NĂºt báº¥m Zalo / Hotline", icon: MousePointerClick },
  { type: "divider", label: "ÄÆ°á»ng káº» ngang phĂ¢n cĂ¡ch", icon: Minus },
];

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
  onSelectBlock,
  draggable,
  onDragStart,
  onDragEnter,
  onDragEnd,
  isDragOver,
}: BlockCardProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashQuery, setSlashQuery] = useState("");
  const [slashIndex, setSlashIndex] = useState(0);

  const filteredMenuItems = SLASH_MENU_ITEMS.filter(
    (m) =>
      m.label.toLowerCase().includes(slashQuery.toLowerCase()) ||
      m.type.toLowerCase().includes(slashQuery.toLowerCase())
  );

  // Upload image handler
  const handleUploadImageFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lĂ²ng chá»n tá»‡p hĂ¬nh áº£nh");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      toast.error("áº¢nh quĂ¡ lá»›n", "Vui lĂ²ng chá»n áº£nh dÆ°á»›i 8MB");
      return;
    }

    setIsUploading(true);
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("folder", "blog");

      const res = await fetch("/api/admin/upload", { method: "POST", body: data });

      if (res.status === 413) {
        throw new Error("áº¢nh quĂ¡ lá»›n (vÆ°á»£t quĂ¡ giá»›i háº¡n mĂ¡y chá»§)");
      }

      let json;
      try {
        json = await res.json();
      } catch (parseError) {
        throw new Error(`Lá»—i mĂ¡y chá»§ (${res.status}): KhĂ´ng thá»ƒ Ä‘á»c pháº£n há»“i`);
      }

      if (res.ok && json.success && json.url) {
        onUpdate({ ...block.data, url: json.url });
        toast.success("Táº£i áº£nh thĂ nh cĂ´ng");
      } else {
        throw new Error(json.error || "KhĂ´ng thá»ƒ táº£i áº£nh");
      }
    } catch (err: any) {
      toast.error("Lá»—i táº£i áº£nh", err.message);
    } finally {
      setIsUploading(false);
    }
  };

  // Clipboard Paste Image (`Ctrl + V`)
  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const file = item.getAsFile();
        if (!file) return;

        toast.info("Äang tá»± Ä‘á»™ng táº£i áº£nh tá»« Clipboard...");
        setIsUploading(true);

        try {
          const data = new FormData();
          data.append("file", file);
          data.append("folder", "blog");

          const res = await fetch("/api/admin/upload", { method: "POST", body: data });
          
          if (res.status === 413) {
            throw new Error("áº¢nh quĂ¡ lá»›n (vÆ°á»£t quĂ¡ giá»›i háº¡n mĂ¡y chá»§)");
          }

          let json;
          try {
            json = await res.json();
          } catch (parseError) {
            throw new Error(`Lá»—i mĂ¡y chá»§ (${res.status}): KhĂ´ng thá»ƒ Ä‘á»c pháº£n há»“i`);
          }

          if (res.ok && json.success && json.url) {
            if (block.type === "text" && !(block.data.text || "").trim()) {
              onChangeType("image", { url: json.url, alt: "áº¢nh minh há»a bĂ i viáº¿t", caption: "" });
            } else {
              onInsertBelow("image", { url: json.url, alt: "áº¢nh minh há»a bĂ i viáº¿t", caption: "" });
            }
            toast.success("ÄĂ£ dĂ¡n vĂ  táº£i áº£nh thĂ nh cĂ´ng!");
          } else {
            throw new Error(json.error || "KhĂ´ng thá»ƒ táº£i áº£nh lĂªn mĂ¡y chá»§");
          }
        } catch (err: any) {
          toast.error("Lá»—i khi dĂ¡n áº£nh", err.message);
        } finally {
          setIsUploading(false);
        }
        return;
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showSlashMenu) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSlashIndex((prev) => (prev + 1) % filteredMenuItems.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSlashIndex((prev) => (prev - 1 + filteredMenuItems.length) % filteredMenuItems.length);
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        const selected = filteredMenuItems[slashIndex];
        if (selected) {
          onChangeType(selected.type, { text: "", ...(selected.data || {}) });
          setShowSlashMenu(false);
        }
        return;
      }
      if (e.key === "Escape") {
        setShowSlashMenu(false);
        return;
      }
    }

    // For RichContentEditable, browser handles Ctrl+B, Ctrl+I, Ctrl+U natively.
    // We only need to handle Ctrl+K if we want custom link UI, but let's just let the toolbar handle it or fallback to native.
    if (e.metaKey || e.ctrlKey) {
      if (e.key === "b" || e.key === "i" || e.key === "u") {
        // Native contentEditable handles this, so we don't preventDefault
        return;
      }
    }

    // Space key: naturally preserved without blocking
    // Enter key: Split or insert new paragraph
    if (e.key === "Enter" && !e.shiftKey) {
      const el = e.currentTarget as any;
      
      // If it's an AutoResizeTextarea (has selectionStart)
      if (typeof el.selectionStart === "number") {
        const start = el.selectionStart;
        const text = el.value || "";

        if (start === text.length) {
          e.preventDefault();
          onInsertBelow("text", { text: "" });
        } else if (start < text.length) {
          e.preventDefault();
          const before = text.substring(0, start);
          const after = text.substring(start);
          if (block.type === "quote") onUpdate({ ...block.data, quote: before });
          else if (block.type === "section") onUpdate({ ...block.data, content: before });
          else onUpdate({ ...block.data, text: before });
          
          onInsertBelow("text", { text: after });
        }
      } else {
        // If it's a RichContentEditable (contenteditable div)
        // We let the browser handle Enter to create <br> or <div> natively inside the block
        // Block splitting for rich text is complex, so we just let it be a multi-line block
        // unless they explicitly want a new block, they can click the + button.
        // Wait, Notion creates a new block on Enter. 
        // For simplicity, we just allow multi-line in the same block, or they can use Shift+Enter.
        // Actually, let's just let it be native.
      }
    } else if (e.key === "Backspace") {
      let currentText = "";
      if (block.type === "quote") currentText = block.data.quote || "";
      else if (block.type === "section") currentText = block.data.content || "";
      else {
        // For text/heading blocks, it might contain HTML like <br>
        const raw = block.data.text || "";
        currentText = raw.replace(/<[^>]*>/g, "").trim();
      }

      if (currentText === "") {
        e.preventDefault();
        onDelete();
        onFocusPrevious();
      }
    }
  };

  const handleTextChange = (val: string) => {
    // Slash command trigger
    if (val.startsWith("/")) {
      setShowSlashMenu(true);
      setSlashQuery(val.substring(1));
      setSlashIndex(0);
      onUpdate({ ...block.data, text: val });
      return;
    } else {
      setShowSlashMenu(false);
    }

    // Quick Markdown transformations
    if (val === "## ") {
      onChangeType("heading", { level: 2 });
      return;
    }
    if (val === "### ") {
      onChangeType("heading", { level: 3 });
      return;
    }
    if (val === "> ") {
      onChangeType("quote", { quote: "" });
      return;
    }
    if (val === "- ") {
      onChangeType("list", { listType: "bullet", items: [""] });
      return;
    }
    if (val === "1. ") {
      onChangeType("list", { listType: "numbered", items: [""] });
      return;
    }
    if (val === "[] " || val === "[ ] ") {
      onChangeType("list", { listType: "checklist", items: [{ checked: false, text: "" }] });
      return;
    }

    onUpdate({ ...block.data, text: val });
  };

  // Close menus on outside click
  useEffect(() => {
    if (!showOptions) return;
    const handleClick = () => setShowOptions(false);
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [showOptions]);

  return (
    <div
      id={id}
      className={`group flex items-start gap-1 w-full transition-all relative ${
        isDragOver ? "border-t-2 border-[#1A73E8] pt-2" : ""
      }`}
      onDragEnter={onDragEnter}
    >
      {/* Left Gutter: Drag Handle & Quick Actions */}
      <div className="w-9 flex-shrink-0 flex items-center justify-end opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity gap-0.5 pt-1 select-none">
        <button
          type="button"
          onClick={() => onInsertBelow("text")}
          className="p-1 rounded hover:bg-black/5 text-[#5F6368] hover:text-[#1F1F1F] transition-colors"
          title="ThĂªm Ä‘oáº¡n vÄƒn bĂªn dÆ°á»›i (Enter)"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>

        <div className="relative">
          <div
            draggable={draggable}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onClick={(e) => {
              e.stopPropagation();
              setShowOptions(!showOptions);
            }}
            className="p-1 rounded hover:bg-black/5 text-[#5F6368] hover:text-[#1F1F1F] transition-colors cursor-grab active:cursor-grabbing"
            title="KĂ©o tháº£ di chuyá»ƒn khá»‘i / TĂ¹y chá»n"
          >
            <GripVertical className="w-3.5 h-3.5" />
          </div>

          {/* Options Dropdown */}
          {showOptions && (
            <div
              className="absolute top-full left-0 mt-1 w-48 bg-white border border-[#DADCE0] rounded-lg shadow-xl z-50 py-1 text-xs"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-3 py-1 font-semibold text-[#5F6368] uppercase text-[10px]">TĂ¹y chá»n khá»‘i</div>
              <button
                type="button"
                onClick={() => {
                  onDuplicate();
                  setShowOptions(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-[#F1F3F4] flex items-center gap-2 text-[#1F1F1F]"
              >
                <Copy className="w-3.5 h-3.5" /> NhĂ¢n Ä‘Ă´i khá»‘i
              </button>
              <button
                type="button"
                onClick={() => {
                  onChangeType("text");
                  setShowOptions(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-[#F1F3F4] flex items-center gap-2 text-[#1F1F1F]"
              >
                <AlignLeft className="w-3.5 h-3.5" /> Chuyá»ƒn thĂ nh VÄƒn báº£n
              </button>
              <button
                type="button"
                onClick={() => {
                  onDelete();
                  setShowOptions(false);
                }}
                className="w-full text-left px-3 py-1.5 text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <Trash2 className="w-3.5 h-3.5" /> XĂ³a khá»‘i nĂ y
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative min-w-0 py-0.5">
        {/* 1. TEXT / PARAGRAPH BLOCK */}
        {block.type === "text" && (
          <div className="relative">
            <RichContentEditable
              id={`block-input-${index}`}
              html={block.data.text || ""}
              onChange={(val) => handleTextChange(val)}
              onKeyDown={handleKeyDown as any}
              onPaste={handlePaste as any}
              onFocus={() => onSelectBlock?.(index)}
              onSelect={() => onSelectBlock?.(index)}
              style={{
                textAlign: block.data.align || "left",
                fontSize: block.data.fontSize ? `${block.data.fontSize}px` : undefined,
              }}
              placeholder=""
              className="w-full bg-transparent border-none rounded-none p-0 text-[16px] text-[#1F1610] focus:outline-none focus:ring-0 leading-[1.8] min-h-[1.8em] font-sans tracking-normal break-words"
            />

            {/* Slash Menu */}
            {showSlashMenu && (
              <div className="absolute top-full left-0 mt-1 w-72 bg-white border border-[#DADCE0] rounded-xl shadow-2xl z-50 max-h-72 overflow-y-auto p-1 text-xs">
                <div className="px-3 py-1.5 text-[10px] font-bold text-[#5F6368] uppercase border-b border-[#ECEFF3] mb-1">
                  ChĂ¨n pháº§n tá»­ nhanh
                </div>
                {filteredMenuItems.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.type + (item.label || "")}
                      type="button"
                      onClick={() => {
                        onChangeType(item.type, { text: "", ...(item.data || {}) });
                        setShowSlashMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center gap-2.5 rounded-lg transition-colors ${
                        i === slashIndex ? "bg-[#EDF2FA] text-[#1A73E8]" : "hover:bg-[#F8F9FA] text-[#1F1F1F]"
                      }`}
                    >
                      <div className={`p-1.5 rounded-md ${i === slashIndex ? "bg-[#1A73E8] text-white" : "bg-[#F1F3F4] text-[#444746]"}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-medium text-[13px]">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 2. HEADING BLOCK (H2, H3, H4) */}
        {block.type === "heading" && (
          <div className="relative group/heading">
            <RichContentEditable
              id={`block-heading-${index}`}
              html={block.data.text || ""}
              onChange={(val) => onUpdate({ ...block.data, text: val })}
              onKeyDown={handleKeyDown as any}
              onPaste={handlePaste as any}
              onFocus={() => onSelectBlock?.(index)}
              onSelect={() => onSelectBlock?.(index)}
              style={{
                textAlign: block.data.align || "left",
                fontSize: block.data.fontSize ? `${block.data.fontSize}px` : undefined,
              }}
              placeholder=""
              className={`w-full bg-transparent border-none rounded-none p-0 font-serif font-bold text-[#3D2314] focus:outline-none focus:ring-0 min-h-[1.4em] break-words ${
                block.data.level === 3 ? "text-xl md:text-2xl mt-4 mb-2" : block.data.level === 4 ? "text-lg md:text-xl mt-3 mb-1" : "text-2xl md:text-3xl mt-6 mb-3 pb-1 border-b border-[#C5A059]/40"
              }`}
            />
          </div>
        )}

        {/* 3. IMAGE BLOCK (Hiá»ƒn thá»‹ thuáº§n tĂºy hĂ¬nh áº£nh, khĂ´ng thá»«a thĂ£i) */}
        {block.type === "image" && (
          <div className="my-4 group/image-block relative">
            {block.data.url ? (
              <div className="relative flex flex-col items-center">
                {/* Khung chá»©a áº£nh tá»± nhiĂªn, vá»«a váº·n khá»• giáº¥y */}
                <div className="relative max-w-full rounded-lg overflow-hidden border border-[#E8DFC8]/40 shadow-xs bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={block.data.url}
                    alt={block.data.alt || "áº¢nh minh há»a bĂ i viáº¿t"}
                    className="max-h-[650px] w-auto max-w-full object-contain mx-auto rounded-lg select-none"
                    loading="lazy"
                  />

                  {/* NĂºt thao tĂ¡c nhanh chá»‰ hiá»‡n khi rĂª chuá»™t lĂªn áº£nh */}
                  <div className="absolute top-2.5 right-2.5 opacity-0 group-hover/image-block:opacity-100 transition-opacity flex items-center gap-1.5 bg-black/60 backdrop-blur-xs p-1 rounded-lg shadow-md">
                    <label
                      className="p-1.5 text-white/90 hover:text-white hover:bg-white/20 rounded cursor-pointer transition-colors"
                      title="Thay Ä‘á»•i áº£nh khĂ¡c"
                    >
                      <ImageIcon className="w-4 h-4" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleUploadImageFile(file);
                        }}
                        disabled={isUploading}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={onDelete}
                      className="p-1.5 text-white/90 hover:text-red-400 hover:bg-white/20 rounded transition-colors"
                      title="XĂ³a áº£nh"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* ChĂº thĂ­ch áº£nh tá»‘i giáº£n (chá»‰ hiá»‡n náº¿u ngÆ°á»i dĂ¹ng cĂ³ nháº­p caption) */}
                {block.data.caption && (
                  <p className="mt-2 text-center text-xs text-[#5F6368] italic font-serif">
                    {block.data.caption}
                  </p>
                )}
              </div>
            ) : (
              /* Khung táº£i áº£nh gá»n nháº¹ khi chÆ°a cĂ³ áº£nh */
              <label className="cursor-pointer w-full py-8 border-2 border-dashed border-[#DADCE0] hover:border-[#C5A059] rounded-xl flex flex-col items-center justify-center bg-[#FAF8F5]/60 hover:bg-[#FAF8F5] transition-all">
                {isUploading ? (
                  <Loader2 className="w-7 h-7 animate-spin text-[#1A73E8]" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-[#70757A] mb-2" />
                )}
                <span className="text-xs font-semibold text-[#1F1F1F]">Click Ä‘á»ƒ chá»n áº£nh tá»« mĂ¡y tĂ­nh</span>
                <span className="text-[11px] text-[#5F6368] mt-0.5">(Hoáº·c copy áº£nh vĂ  báº¥m Ctrl + V)</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUploadImageFile(file);
                  }}
                  disabled={isUploading}
                />
              </label>
            )}
          </div>
        )}

        {/* 4. TABLE BLOCK (Interactive editable grid with row/col controls) */}
        {block.type === "table" && (
          <div className="my-4 border border-[#DADCE0] rounded-xl overflow-hidden shadow-xs bg-white">
            {/* Table Control Bar */}
            <div className="bg-[#EDF2FA] px-3 py-2 border-b border-[#DADCE0] flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-semibold text-[#1F1F1F] flex items-center gap-1.5">
                <TableIcon className="w-4 h-4 text-[#1A73E8]" />
                Báº£ng biá»ƒu chuáº©n Google Docs
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    const headers = block.data.headers || ["TiĂªu Ä‘á» 1", "TiĂªu Ä‘á» 2"];
                    const rows = block.data.rows || [["", ""]];
                    const newRow = new Array(headers.length).fill("");
                    onUpdate({ ...block.data, rows: [...rows, newRow] });
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-[#F1F3F4] text-[#1A73E8] border border-[#DADCE0] rounded font-medium shadow-2xs"
                  title="ThĂªm hĂ ng má»›i"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>+ HĂ ng</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const rows = block.data.rows || [];
                    if (rows.length > 1) {
                      onUpdate({ ...block.data, rows: rows.slice(0, -1) });
                    } else {
                      toast.info("Báº£ng cáº§n cĂ³ Ă­t nháº¥t 1 hĂ ng dá»¯ liá»‡u");
                    }
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-red-50 text-red-600 border border-[#DADCE0] rounded font-medium shadow-2xs"
                  title="XĂ³a hĂ ng cuá»‘i"
                >
                  <MinusCircle className="w-3.5 h-3.5" />
                  <span>- HĂ ng</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const headers = block.data.headers || ["TiĂªu Ä‘á» 1"];
                    const rows = block.data.rows || [[""]];
                    const newHeaders = [...headers, `Cá»™t ${headers.length + 1}`];
                    const newRows = rows.map((r: string[]) => [...r, ""]);
                    onUpdate({ ...block.data, headers: newHeaders, rows: newRows });
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-[#F1F3F4] text-[#1A73E8] border border-[#DADCE0] rounded font-medium shadow-2xs"
                  title="ThĂªm cá»™t má»›i"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>+ Cá»™t</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const headers = block.data.headers || [];
                    const rows = block.data.rows || [];
                    if (headers.length > 1) {
                      const newHeaders = headers.slice(0, -1);
                      const newRows = rows.map((r: string[]) => r.slice(0, -1));
                      onUpdate({ ...block.data, headers: newHeaders, rows: newRows });
                    } else {
                      toast.info("Báº£ng cáº§n cĂ³ Ă­t nháº¥t 1 cá»™t");
                    }
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-red-50 text-red-600 border border-[#DADCE0] rounded font-medium shadow-2xs"
                  title="XĂ³a cá»™t cuá»‘i"
                >
                  <MinusCircle className="w-3.5 h-3.5" />
                  <span>- Cá»™t</span>
                </button>
              </div>
            </div>

            {/* Editable Table Matrix */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-[#3D2314] text-white">
                    {(block.data.headers || []).map((h: string, hIdx: number) => (
                      <th key={hIdx} className="p-2 border-r border-[#5C3A21] last:border-r-0">
                        <input
                          type="text"
                          value={h}
                          onChange={(e) => {
                            const newH = [...block.data.headers];
                            newH[hIdx] = e.target.value;
                            onUpdate({ ...block.data, headers: newH });
                          }}
                          placeholder={`Cá»™t ${hIdx + 1}`}
                          className="w-full bg-transparent text-white font-serif font-bold uppercase text-[11px] focus:outline-none focus:bg-white/20 px-1 py-0.5 rounded"
                        />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E1E5EA]">
                  {(block.data.rows || []).map((row: string[], rIdx: number) => (
                    <tr key={rIdx} className={rIdx % 2 === 0 ? "bg-white" : "bg-[#FAF8F5]"}>
                      {row.map((cell: string, cIdx: number) => (
                        <td key={cIdx} className="p-2 border-r border-[#E1E5EA] last:border-r-0">
                          <input
                            type="text"
                            value={cell}
                            onChange={(e) => {
                              const newRows = block.data.rows.map((r: string[]) => [...r]);
                              newRows[rIdx][cIdx] = e.target.value;
                              onUpdate({ ...block.data, rows: newRows });
                            }}
                            placeholder="Nháº­p ná»™i dung Ă´..."
                            className="w-full bg-transparent text-[#1F1610] focus:outline-none focus:bg-[#EDF2FA] px-1 py-0.5 rounded"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. LIST BLOCK (Checklist, Bulleted, Numbered) */}
        {block.type === "list" && (
          <div className="space-y-1.5 my-2">
            {(block.data.items || []).map((item: any, i: number) => {
              const isChecklist = block.data.listType === "checklist";
              const isNumbered = block.data.listType === "numbered";
              const isChecked = typeof item === "object" ? !!item.checked : false;
              const textVal = typeof item === "object" ? item.text || "" : String(item);

              return (
                <div key={i} className="flex items-start gap-2.5">
                  {/* Icon indicator */}
                  {isChecklist ? (
                    <button
                      type="button"
                      onClick={() => {
                        const next = [...block.data.items];
                        next[i] = { checked: !isChecked, text: textVal };
                        onUpdate({ ...block.data, items: next });
                      }}
                      className="mt-1 text-[#1A73E8] hover:text-[#041E49] transition-colors"
                      title={isChecked ? "Bá» chá»n" : "TĂ­ch hoĂ n thĂ nh"}
                    >
                      {isChecked ? <CheckSquare className="w-4 h-4 text-emerald-600" /> : <Square className="w-4 h-4 text-[#70757A]" />}
                    </button>
                  ) : isNumbered ? (
                    <span className="font-serif font-bold text-xs text-[#3D2314] w-5 text-right mt-1 select-none">
                      {i + 1}.
                    </span>
                  ) : (
                    <span className="text-base text-[#C5A059] mt-0.5 select-none">â€¢</span>
                  )}

                  {/* Editable line */}
                  <AutoResizeTextarea
                    value={textVal}
                    onChange={(e) => {
                      const next = [...block.data.items];
                      if (isChecklist) {
                        next[i] = { checked: isChecked, text: e.target.value };
                      } else {
                        next[i] = e.target.value;
                      }
                      onUpdate({ ...block.data, items: next });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        const next = [...block.data.items];
                        next.splice(i + 1, 0, isChecklist ? { checked: false, text: "" } : "");
                        onUpdate({ ...block.data, items: next });
                      } else if (e.key === "Backspace" && textVal === "") {
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
                    placeholder="Má»¥c danh sĂ¡ch..."
                    className={`flex-1 bg-transparent border-none p-0 text-[16px] leading-[1.7] focus:outline-none focus:ring-0 resize-none overflow-hidden placeholder:text-[#5F6368]/40 ${
                      isChecked ? "line-through text-[#5F6368] opacity-70" : "text-[#1F1610]"
                    }`}
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* 6. QUOTE BLOCK */}
        {block.type === "quote" && (
          <div className="border-l-4 border-[#3D2314] bg-[#FAF8F5] p-4 rounded-r-xl my-4 space-y-2">
            <AutoResizeTextarea
              value={block.data.quote || ""}
              onChange={(e) => onUpdate({ ...block.data, quote: e.target.value })}
              onKeyDown={handleKeyDown}
              placeholder="Nháº­p cĂ¢u trĂ­ch dáº«n cá»§a nghá»‡ nhĂ¢n..."
              className="w-full bg-transparent border-none p-0 text-[17px] italic font-serif text-[#2A160C] focus:outline-none focus:ring-0 resize-none overflow-hidden placeholder:text-[#5F6368]/40 leading-relaxed"
            />
            <div className="flex items-center gap-2 pt-1 border-t border-[#E8DFC8]/60">
              <span className="text-xs text-[#C5A059] font-bold">â€”</span>
              <input
                type="text"
                value={block.data.author || ""}
                onChange={(e) => onUpdate({ ...block.data, author: e.target.value })}
                placeholder="TĂªn nghá»‡ nhĂ¢n / tĂ¡c giáº£ trĂ­ch dáº«n..."
                className="w-full sm:w-64 bg-transparent border-b border-[#C5A059]/40 text-xs font-semibold text-[#3D2314] focus:outline-none focus:border-[#3D2314] py-0.5"
              />
            </div>
          </div>
        )}

        {/* 7. SECTION / CALLOUT BLOCK */}
        {block.type === "section" && (
          <div className="border-l-4 border-[#C5A059] bg-[#FDFBF7] border border-[#E8DFC8] p-5 rounded-xl my-4 space-y-2 shadow-2xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C5A059]" />
              <input
                type="text"
                value={block.data.title || ""}
                onChange={(e) => onUpdate({ ...block.data, title: e.target.value })}
                placeholder="TiĂªu Ä‘á» há»™p Ä‘iá»ƒm nháº¥n phong thá»§y..."
                className="w-full bg-transparent text-sm md:text-base font-serif font-bold text-[#3D2314] focus:outline-none"
              />
            </div>
            <AutoResizeTextarea
              value={block.data.content || ""}
              onChange={(e) => onUpdate({ ...block.data, content: e.target.value })}
              onKeyDown={handleKeyDown}
              placeholder="Ná»™i dung kiáº¿n thá»©c quan trá»ng vá» gá»— quĂ½..."
              className="w-full bg-transparent border-none p-0 text-sm text-[#2A160C] focus:outline-none focus:ring-0 resize-none overflow-hidden leading-relaxed"
            />
          </div>
        )}

        {/* 8. BUTTON / CTA BLOCK */}
        {block.type === "button" && (
          <div className="my-5 p-4 rounded-xl border border-dashed border-[#DADCE0] bg-[#FAF8F5] text-center space-y-3">
            <div className="flex items-center justify-center gap-2">
              <input
                type="text"
                value={block.data.label || ""}
                onChange={(e) => onUpdate({ ...block.data, label: e.target.value })}
                placeholder="TĂªn nĂºt báº¥m (VĂ­ dá»¥: Nháº¯n Zalo Nháº­n BĂ¡o GiĂ¡)..."
                className="bg-white border border-[#DADCE0] rounded px-3 py-1.5 text-xs font-bold text-[#1F1F1F] text-center w-72 focus:outline-none focus:border-[#1A73E8]"
              />
              <select
                value={block.data.buttonStyle || "zalo"}
                onChange={(e) => onUpdate({ ...block.data, buttonStyle: e.target.value })}
                className="bg-white border border-[#DADCE0] rounded px-2 py-1.5 text-xs text-[#1F1F1F] focus:outline-none"
              >
                <option value="zalo">Kiá»ƒu Zalo (Xanh dÆ°Æ¡ng)</option>
                <option value="hotline">Kiá»ƒu Hotline (Äá»)</option>
                <option value="primary">Kiá»ƒu NĂ¢u gá»— ÄĂ´ng Phong</option>
              </select>
            </div>
            <input
              type="text"
              value={block.data.url || ""}
              onChange={(e) => onUpdate({ ...block.data, url: e.target.value })}
              placeholder="ÄÆ°á»ng dáº«n liĂªn káº¿t (URL)..."
              className="w-80 bg-white border border-[#DADCE0] rounded px-3 py-1 text-xs text-[#5F6368] text-center font-mono focus:outline-none"
            />
          </div>
        )}

        {/* 9. DIVIDER BLOCK */}
        {block.type === "divider" && (
          <div className="my-6 relative flex items-center justify-center select-none py-2">
            <div className="w-full border-t border-[#DADCE0]" />
            <span className="absolute px-3 bg-white text-[#C5A059] text-xs font-serif">â– â– â–</span>
          </div>
        )}

        {/* 10. LAYOUT (2 Columns) */}
        {block.type === "layout" && (
          <div className="my-4 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl border border-[#DADCE0] bg-[#FAF8F5]">
            <div className="p-3 bg-white rounded-lg border border-[#E1E5EA] space-y-2">
              <input
                type="text"
                value={block.data.leftTitle || ""}
                onChange={(e) => onUpdate({ ...block.data, leftTitle: e.target.value })}
                placeholder="TiĂªu Ä‘á» cá»™t trĂ¡i..."
                className="w-full bg-transparent font-serif font-bold text-sm text-[#3D2314] border-b border-[#E1E5EA] pb-1 focus:outline-none"
              />
              <AutoResizeTextarea
                value={block.data.leftContent || ""}
                onChange={(e) => onUpdate({ ...block.data, leftContent: e.target.value })}
                placeholder="Ná»™i dung cá»™t trĂ¡i..."
                className="w-full bg-transparent border-none p-0 text-xs text-[#2A160C] focus:outline-none resize-none leading-relaxed"
              />
            </div>
            <div className="p-3 bg-white rounded-lg border border-[#E1E5EA] space-y-2">
              <input
                type="text"
                value={block.data.rightTitle || ""}
                onChange={(e) => onUpdate({ ...block.data, rightTitle: e.target.value })}
                placeholder="TiĂªu Ä‘á» cá»™t pháº£i..."
                className="w-full bg-transparent font-serif font-bold text-sm text-[#3D2314] border-b border-[#E1E5EA] pb-1 focus:outline-none"
              />
              <AutoResizeTextarea
                value={block.data.rightContent || ""}
                onChange={(e) => onUpdate({ ...block.data, rightContent: e.target.value })}
                placeholder="Ná»™i dung cá»™t pháº£i..."
                className="w-full bg-transparent border-none p-0 text-xs text-[#2A160C] focus:outline-none resize-none leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* 11. FOOTER SUMMARY BLOCK */}
        {block.type === "footer" && (
          <div className="my-6 p-6 rounded-xl border-2 border-[#C5A059]/40 bg-[#FAF8F5] text-center space-y-3">
            <div className="w-8 h-8 mx-auto rounded-full bg-[#C5A059]/20 flex items-center justify-center text-[#C5A059]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={block.data.title || ""}
              onChange={(e) => onUpdate({ ...block.data, title: e.target.value })}
              placeholder="TiĂªu Ä‘á» Lá»i káº¿t & Cam káº¿t cháº¥t lÆ°á»£ng..."
              className="w-full text-center bg-transparent font-serif font-bold text-lg text-[#3D2314] focus:outline-none"
            />
            <AutoResizeTextarea
              value={block.data.content || ""}
              onChange={(e) => onUpdate({ ...block.data, content: e.target.value })}
              placeholder="Ná»™i dung cam káº¿t gá»— quĂ½ tá»± nhiĂªn..."
              className="w-full bg-transparent border-none p-0 text-xs md:text-sm text-[#5A4A42] text-center focus:outline-none resize-none leading-relaxed"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default BlockCard;
