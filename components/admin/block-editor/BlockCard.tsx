"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
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
  ChevronUp,
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
  onMoveUp: () => void;
  onMoveDown: () => void;
  onFocusPrevious: () => void;
  
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnter?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  isDragOver?: boolean;
}

const SLASH_MENU_ITEMS: { type: BlockType; label: string; icon: any }[] = [
  { type: "text", label: "Đoạn văn", icon: AlignLeft },
  { type: "heading", label: "Tiêu đề", icon: HeadingIcon },
  { type: "image", label: "Hình ảnh", icon: ImageIcon },
  { type: "list", label: "Danh sách", icon: ListIcon },
  { type: "quote", label: "Trích dẫn", icon: QuoteIcon },
  { type: "section", label: "Khối nổi bật", icon: Box },
  { type: "layout", label: "Bố cục 2 cột", icon: Columns },
  { type: "table", label: "Bảng biểu", icon: TableIcon },
  { type: "button", label: "Nút bấm", icon: MousePointerClick },
  { type: "divider", label: "Kẻ ngang", icon: Minus },
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
  onMoveUp,
  onMoveDown,
  onFocusPrevious,
  draggable,
  onDragStart,
  onDragEnter,
  onDragEnd,
  isDragOver
}: BlockCardProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashQuery, setSlashQuery] = useState("");
  const [slashIndex, setSlashIndex] = useState(0);

  const filteredMenuItems = SLASH_MENU_ITEMS.filter(m => 
     m.label.toLowerCase().includes(slashQuery.toLowerCase()) || 
     m.type.toLowerCase().includes(slashQuery.toLowerCase())
  );

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
        onUpdate({ ...block.data, url: json.url });
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showSlashMenu) {
      if (e.key === "ArrowDown") {
         e.preventDefault();
         setSlashIndex(prev => (prev + 1) % filteredMenuItems.length);
         return;
      }
      if (e.key === "ArrowUp") {
         e.preventDefault();
         setSlashIndex(prev => (prev - 1 + filteredMenuItems.length) % filteredMenuItems.length);
         return;
      }
      if (e.key === "Enter") {
         e.preventDefault();
         const selected = filteredMenuItems[slashIndex];
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
    
    // Markdown formatting shortcuts
    if (e.metaKey || e.ctrlKey) {
       if (e.key === 'b' || e.key === 'i' || e.key === 'k') {
          e.preventDefault();
          const el = e.currentTarget;
          const start = el.selectionStart;
          const end = el.selectionEnd;
          const text = el.value;
          const selected = text.substring(start, end);
          let wrapped = "";
          
          if (e.key === 'b') wrapped = `**${selected}**`;
          if (e.key === 'i') wrapped = `*${selected}*`;
          if (e.key === 'k') wrapped = `[${selected || "text"}](url)`;
          
          const newText = text.substring(0, start) + wrapped + text.substring(end);
          onUpdate({ ...block.data, text: newText });
          
          // Restore cursor position inside the wrapper
          setTimeout(() => {
             el.focus();
             if (e.key === 'k') el.setSelectionRange(start + wrapped.length - 4, start + wrapped.length - 1);
             else el.setSelectionRange(start + wrapped.length, start + wrapped.length);
          }, 0);
          return;
       }
    }

    if (e.key === "Enter" && !e.shiftKey) {
       // Insert block below if at the end of text
       const el = e.currentTarget;
       if (el.selectionStart === el.value.length) {
          e.preventDefault();
          onInsertBelow();
       }
    } else if (e.key === "Backspace") {
       if ((block.data.text || "") === "") {
          e.preventDefault();
          onDelete();
          onFocusPrevious();
       }
    }
  };

  const handleTextChange = (val: string) => {
     // Check for slash menu
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

     onUpdate({ ...block.data, text: val });
  };

  // Close options menu when clicking outside
  useEffect(() => {
     if (!showOptions) return;
     const handleClick = () => setShowOptions(false);
     document.addEventListener("click", handleClick);
     return () => document.removeEventListener("click", handleClick);
  }, [showOptions]);

  const blockInfo = SLASH_MENU_ITEMS.find(m => m.type === block.type);
  const blockLabel = blockInfo?.label || block.type.toUpperCase();
  const Icon = blockInfo?.icon || Box;

  return (
    <div 
       id={id}
       className={`w-full transition-all border border-[#E5E0D8] rounded-xl bg-white/60 shadow-[0_2px_10px_rgba(0,0,0,0.02)] mb-4 overflow-hidden focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 ${isDragOver ? "border-t-2 border-primary" : ""}`}
       onDragEnter={onDragEnter}
    >
      {/* Header */}
      <div 
         draggable={draggable}
         onDragStart={onDragStart}
         onDragEnd={onDragEnd}
         className="flex items-center justify-between px-4 py-2 border-b border-[#E5E0D8]/60 bg-[#FAF8F5]/80 cursor-grab active:cursor-grabbing"
      >
         <div className="flex items-center gap-2">
            <Icon className="w-3.5 h-3.5 text-[#88A3CD]" />
            <span className="text-[#1F1610] font-bold text-[11px] uppercase tracking-widest">{block.type.toUpperCase()} ({blockLabel})</span>
            <span className="text-text-muted/60 text-[11px] font-mono">#{index + 1}</span>
         </div>
         <div className="flex items-center gap-1.5 text-text-muted" onMouseDown={e => e.stopPropagation()}>
            <button type="button" onClick={onMoveUp} disabled={index === 0} className="p-1 hover:text-[#C5A059] disabled:opacity-30 disabled:hover:text-text-muted transition-colors rounded">
               <ChevronUp className="w-4 h-4" />
            </button>
            <button type="button" onClick={onMoveDown} disabled={index === total - 1} className="p-1 hover:text-[#C5A059] disabled:opacity-30 disabled:hover:text-text-muted transition-colors rounded">
               <ChevronDown className="w-4 h-4" />
            </button>
            <div className="w-px h-3 bg-border mx-1"></div>
            <button type="button" onClick={onDuplicate} className="p-1 hover:text-primary transition-colors rounded" title="Nhân đôi khối">
               <Copy className="w-4 h-4" />
            </button>
            <button type="button" onClick={onDelete} className="p-1 hover:text-red-500 transition-colors rounded" title="Xóa khối này">
               <Trash2 className="w-4 h-4" />
            </button>
         </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 relative">
        
        {/* 1. TEXT BLOCK */}
        {block.type === "text" && (
           <div className="relative">
             <AutoResizeTextarea
               value={block.data.text || ""}
               onChange={(e) => handleTextChange(e.target.value)}
               onKeyDown={handleKeyDown}
               placeholder="Gõ / để chèn block..."
               className="w-full bg-transparent border-none rounded-none p-0 text-[17px] text-text focus:outline-none focus:ring-0 leading-[1.7] resize-none overflow-hidden placeholder:text-text-muted/40"
             />
             
             {/* Slash Menu */}
             {showSlashMenu && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-surface border border-border rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
                   <div className="px-3 py-2 text-[11px] font-semibold text-text-muted uppercase bg-bg/50 border-b border-border">Chèn khối cơ bản</div>
                   {filteredMenuItems.map((item, i) => {
                      const Icon = item.icon;
                      return (
                         <button
                            key={item.type}
                            type="button"
                            onClick={() => { onChangeType(item.type, { text: "" }); setShowSlashMenu(false); }}
                            className={`w-full text-left px-3 py-2.5 flex items-center gap-3 transition-colors ${i === slashIndex ? "bg-primary/5 text-primary" : "hover:bg-bg text-text"}`}
                         >
                            <div className={`p-1.5 rounded-md ${i === slashIndex ? "bg-primary text-white" : "bg-bg text-text-muted"}`}>
                               <Icon className="w-4 h-4" />
                            </div>
                            <span className="text-[13px] font-medium">{item.label}</span>
                         </button>
                      )
                   })}
                   {filteredMenuItems.length === 0 && (
                      <div className="px-3 py-4 text-center text-sm text-text-muted">Không tìm thấy khối nào</div>
                   )}
                </div>
             )}
           </div>
        )}

        {/* 2. HEADING BLOCK */}
        {block.type === "heading" && (
          <div className="flex items-center gap-3 relative group/heading">
            <select
              value={block.data.level || 2}
              onChange={(e) => onUpdate({ ...block.data, level: Number(e.target.value) })}
              className="absolute -left-16 bg-surface border border-border rounded px-1 py-1 text-xs font-semibold text-text focus:outline-none focus:border-primary opacity-0 group-hover/heading:opacity-100 focus-within:opacity-100 transition-opacity w-14"
            >
              <option value={2}>H2</option>
              <option value={3}>H3</option>
              <option value={4}>H4</option>
            </select>
            <AutoResizeTextarea
               value={block.data.text || ""}
               onChange={(e) => onUpdate({ ...block.data, text: e.target.value })}
               onKeyDown={handleKeyDown}
               placeholder="Nhập tiêu đề..."
               className={`w-full bg-transparent border-none rounded-none p-0 font-serif font-bold text-primary focus:outline-none focus:ring-0 resize-none overflow-hidden placeholder:text-text-muted/40 ${block.data.level === 3 ? "text-xl" : block.data.level === 4 ? "text-lg" : "text-2xl"}`}
             />
          </div>
        )}

        {/* 3. IMAGE BLOCK */}
        {block.type === "image" && (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="relative w-full sm:w-64 aspect-[16/10] rounded-lg overflow-hidden bg-bg border border-border flex items-center justify-center flex-shrink-0 group/img">
                {block.data.url ? (
                  <>
                    <Image src={block.data.url} alt={block.data.alt || "Ảnh"} fill className="object-cover" />
                    <label className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 flex items-center justify-center cursor-pointer transition-opacity text-white text-xs font-medium">
                       Đổi ảnh
                       <input type="file" accept="image/*" className="hidden" onChange={handleUploadImage} disabled={isUploading}/>
                    </label>
                  </>
                ) : (
                  <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center hover:bg-surface/80">
                    {isUploading ? <Loader2 className="w-6 h-6 animate-spin text-primary" /> : <ImageIcon className="w-8 h-8 text-border mb-2" />}
                    <span className="text-[11px] text-text-muted">Click hoặc kéo thả ảnh vào đây</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleUploadImage} disabled={isUploading}/>
                  </label>
                )}
              </div>
              <div className="flex-1 w-full space-y-2">
                <input
                  type="text"
                  value={block.data.url || ""}
                  onChange={(e) => onUpdate({ ...block.data, url: e.target.value })}
                  placeholder="Hoặc dán URL ảnh trực tiếp..."
                  className="w-full bg-transparent border-b border-border/50 px-0 py-1.5 text-xs text-text focus:outline-none focus:border-primary font-mono"
                />
                <input
                  type="text"
                  value={block.data.caption || ""}
                  onChange={(e) => onUpdate({ ...block.data, caption: e.target.value })}
                  placeholder="Chú thích ảnh (Caption)..."
                  className="w-full bg-transparent border-b border-border/50 px-0 py-1.5 text-sm text-text italic focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>
        )}

        {/* 4. QUOTE BLOCK */}
        {block.type === "quote" && (
          <div className="border-l-4 border-primary pl-4 py-1 space-y-2">
             <AutoResizeTextarea
               value={block.data.quote || ""}
               onChange={(e) => onUpdate({ ...block.data, quote: e.target.value })}
               onKeyDown={handleKeyDown}
               placeholder="Nhập câu trích dẫn..."
               className="w-full bg-transparent border-none p-0 text-[17px] italic font-serif text-text focus:outline-none focus:ring-0 resize-none overflow-hidden placeholder:text-text-muted/40"
             />
             <input
               type="text"
               value={block.data.author || ""}
               onChange={(e) => onUpdate({ ...block.data, author: e.target.value })}
               placeholder="Tên người nói..."
               className="w-full sm:w-64 bg-transparent border-b border-border/50 px-0 py-1 text-xs font-semibold text-primary focus:outline-none focus:border-primary"
             />
          </div>
        )}

        {/* 5. LIST BLOCK */}
        {block.type === "list" && (
          <div className="space-y-1">
            {(block.data.items || []).map((item: string, i: number) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-base text-text mt-1 select-none">
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
                  placeholder="Mục danh sách..."
                  className="flex-1 bg-transparent border-none p-0 text-[17px] text-text focus:outline-none focus:ring-0 resize-none overflow-hidden placeholder:text-text-muted/40 pt-1"
                />
              </div>
            ))}
          </div>
        )}

        {/* FALLBACK FOR OTHERS (Section, Table, Button, Layout, Header, Footer) */}
        {["section", "table", "button", "layout", "header", "footer", "divider"].includes(block.type) && (
           <div className="p-3 bg-surface border border-border border-dashed rounded flex flex-col items-center justify-center text-center opacity-60 hover:opacity-100 transition-opacity">
              <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted mb-2">KHỐI ĐẶC BIỆT: {block.type}</span>
              <span className="text-[13px] text-text">Dữ liệu khối này vẫn được bảo toàn. Đang hiển thị ở chế độ thu gọn.</span>
           </div>
        )}
      </div>
    </div>
  );
}
