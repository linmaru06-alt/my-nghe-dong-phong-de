
"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  Copy,
  Trash2,
  Upload,
  Loader2,
  X,
  Plus,
  MoreVertical,
  GripVertical,
  Heading as HeadingIcon,
  AlignLeft,
  ImageIcon,
  Columns,
  Box,
  Quote as QuoteIcon,
  List as ListIcon,
  Table as TableIcon,
  MousePointerClick,
  Minus,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { EditorBlock, BlockType } from "@/lib/blockEditor";
import { toast } from "@/components/ui/Toast";
import { AutoResizeTextarea } from "@/components/ui/AutoResizeTextarea";

export interface BlockCardProps {
  block: EditorBlock;
  index: number;
  total: number;
  onUpdate: (data: Record<string, any>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onInsertBelow: () => void;
  onChangeType: (type: BlockType) => void;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  onDragEnd: (e: React.DragEvent) => void;
  isDragging?: boolean;
}

export function BlockCard({
  block,
  index,
  total,
  onUpdate,
  onDuplicate,
  onDelete,
  onInsertBelow,
  onChangeType,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  isDragging
}: BlockCardProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // X? lý upload ?nh tr?c ti?p lên Supabase Storage
  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
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
        onUpdate({ ...block.data, url: json.url });
        toast.success("T?i ?nh thành công", "?nh dã du?c luu tr? vinh vi?n.");
      } else {
        throw new Error(json.error || "Không th? t?i ?nh");
      }
    } catch (err: any) {
      toast.error("L?i t?i ?nh", err.message || "Vui lòng th? l?i");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  // Shortcut handling
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onInsertBelow();
    }
    if (e.key === "Backspace" && (e.target as any).value === "") {
      e.preventDefault();
      onDelete();
    }
    
    // Markdown shortcuts for Text blocks
    if (block.type === "text" && e.key === " ") {
      const val = (e.target as any).value;
      if (val === "##") {
        e.preventDefault();
        onChangeType("heading");
        onUpdate({ level: 2, text: "" });
      } else if (val === "###") {
        e.preventDefault();
        onChangeType("heading");
        onUpdate({ level: 3, text: "" });
      } else if (val === "####") {
        e.preventDefault();
        onChangeType("heading");
        onUpdate({ level: 4, text: "" });
      } else if (val === "-") {
        e.preventDefault();
        onChangeType("list");
        onUpdate({ listType: "bullet", items: [""] });
      } else if (val === ">") {
        e.preventDefault();
        onChangeType("quote");
        onUpdate({ quote: "", author: "" });
      }
    }
  };

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div 
      className={`group relative py-1 sm:py-2 transition-all duration-200 ${isDragging ? "opacity-30" : "opacity-100"}`}
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={(e) => onDrop(e, index)}
      onDragEnd={onDragEnd}
    >
      {/* Side handles (visible on hover) */}
      <div className="absolute -left-12 top-2 bottom-0 w-12 flex opacity-0 group-hover:opacity-100 transition-opacity flex-col items-end pr-2 pt-1 z-10 gap-1">
        <button 
          type="button"
          onClick={onInsertBelow}
          className="p-1 rounded text-text-muted hover:text-text hover:bg-surface"
          title="Thêm kh?i (Enter)"
        >
          <Plus className="w-4 h-4" />
        </button>
        <div className="relative" ref={menuRef}>
          <button 
            type="button"
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 rounded text-text-muted hover:text-text hover:bg-surface cursor-grab active:cursor-grabbing"
            title="Tùy ch?n kh?i (Kéo d? di chuy?n)"
          >
            <GripVertical className="w-4 h-4" />
          </button>
          
          {showMenu && (
            <div className="absolute left-0 top-full mt-1 w-48 bg-white border border-border shadow-lg rounded-md py-1 z-20">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-text-muted uppercase tracking-wider">Ð?i thành</div>
              <button type="button" onClick={() => {onChangeType("text"); setShowMenu(false)}} className="w-full text-left px-3 py-1.5 text-sm hover:bg-surface flex items-center gap-2"><AlignLeft className="w-3.5 h-3.5"/> Ðo?n van</button>
              <button type="button" onClick={() => {onChangeType("heading"); onUpdate({level: 2, text: block.data.text || ""}); setShowMenu(false)}} className="w-full text-left px-3 py-1.5 text-sm hover:bg-surface flex items-center gap-2"><HeadingIcon className="w-3.5 h-3.5"/> Tiêu d? (H2)</button>
              <button type="button" onClick={() => {onChangeType("image"); setShowMenu(false)}} className="w-full text-left px-3 py-1.5 text-sm hover:bg-surface flex items-center gap-2"><ImageIcon className="w-3.5 h-3.5"/> ?nh</button>
              <button type="button" onClick={() => {onChangeType("quote"); setShowMenu(false)}} className="w-full text-left px-3 py-1.5 text-sm hover:bg-surface flex items-center gap-2"><QuoteIcon className="w-3.5 h-3.5"/> Trích d?n</button>
              <button type="button" onClick={() => {onChangeType("list"); setShowMenu(false)}} className="w-full text-left px-3 py-1.5 text-sm hover:bg-surface flex items-center gap-2"><ListIcon className="w-3.5 h-3.5"/> Danh sách</button>
              <div className="h-px bg-border my-1" />
              <button type="button" onClick={() => {onDuplicate(); setShowMenu(false)}} className="w-full text-left px-3 py-1.5 text-sm hover:bg-surface flex items-center gap-2"><Copy className="w-3.5 h-3.5"/> Nhân dôi</button>
              <button type="button" onClick={() => {onDelete(); setShowMenu(false)}} className="w-full text-left px-3 py-1.5 text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"><Trash2 className="w-3.5 h-3.5"/> Xóa</button>
            </div>
          )}
        </div>
      </div>

      {/* Block Content */}
      <div className="relative outline-none">
        {/* 1. Header Block */}
        {block.type === "header" && (
          <div className="space-y-1 my-6">
            <AutoResizeTextarea
              value={block.data.title || ""}
              onChange={(e) => onUpdate({ ...block.data, title: e.target.value })}
              onKeyDown={handleKeyDown}
              placeholder="Tiêu d? ph?n l?n (H2)..."
              className="w-full bg-transparent text-2xl md:text-3xl font-serif font-bold text-primary focus:outline-none placeholder:text-text-muted/40 resize-none overflow-hidden block"
            />
            <AutoResizeTextarea
              value={block.data.subtitle || ""}
              onChange={(e) => onUpdate({ ...block.data, subtitle: e.target.value })}
              onKeyDown={handleKeyDown}
              placeholder="Ph? d? mô t? ng?n trang nhã..."
              className="w-full bg-transparent text-base md:text-lg text-text-muted italic focus:outline-none placeholder:text-text-muted/40 resize-none overflow-hidden block"
            />
          </div>
        )}

        {/* 2. Heading Block */}
        {block.type === "heading" && (
          <div className="relative my-4">
             {/* Ch? hi?n dropdown khi focus ho?c qua menu - T?m th?i làm don gi?n là hidden và hi?n khi active/hover nh? */}
            <AutoResizeTextarea
              value={block.data.text || ""}
              onChange={(e) => onUpdate({ ...block.data, text: e.target.value })}
              onKeyDown={handleKeyDown}
              placeholder="Tiêu d? (H2, H3, H4)..."
              className={`w-full bg-transparent font-serif font-bold focus:outline-none placeholder:text-text-muted/40 resize-none overflow-hidden block ${block.data.level === 3 ? "text-xl md:text-2xl text-wood-deep" : block.data.level === 4 ? "text-lg md:text-xl text-wood-deep" : "text-2xl md:text-3xl text-primary"}`}
            />
          </div>
        )}

        {/* 3. Text Block */}
        {block.type === "text" && (
          <AutoResizeTextarea
            value={block.data.text || ""}
            onChange={(e) => onUpdate({ ...block.data, text: e.target.value })}
            onKeyDown={handleKeyDown}
            placeholder="Gõ \"/\" d? xem l?nh ho?c b?t d?u vi?t..."
            className="w-full bg-transparent text-base md:text-[17px] text-[#1F1610] leading-[1.7] focus:outline-none placeholder:text-text-muted/40 resize-none overflow-hidden block min-h-[30px]"
          />
        )}

        {/* 4. Image Block */}
        {block.type === "image" && (
          <div className="my-4 space-y-2">
            {!block.data.url ? (
              <div className="relative w-full aspect-[16/9] rounded-lg bg-surface border-2 border-dashed border-border flex flex-col items-center justify-center hover:bg-surface/80 transition-colors">
                <ImageIcon className="w-8 h-8 text-text-muted mb-2 opacity-50" />
                <span className="text-sm font-medium text-text-muted">Nh?n ho?c kéo th? ?nh vào dây</span>
                <label className="absolute inset-0 w-full h-full cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    disabled={isUploading}
                    onChange={handleUploadImage}
                    className="hidden"
                  />
                </label>
                {isUploading && (
                  <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-lg backdrop-blur-sm">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                )}
              </div>
            ) : (
              <div className="relative w-full rounded-lg overflow-hidden group/img">
                <img
                  src={block.data.url}
                  alt={block.data.alt || "?nh"}
                  className="w-full h-auto object-cover rounded-lg"
                />
                {/* Image Overlay Controls */}
                <div className="absolute top-2 right-2 flex items-center gap-2 opacity-0 group-hover/img:opacity-100 transition-opacity">
                  <label className="p-1.5 rounded-full bg-white/90 shadow-sm text-text hover:bg-white cursor-pointer transition-colors" title="Ð?i ?nh">
                    <Upload className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isUploading}
                      onChange={handleUploadImage}
                      className="hidden"
                    />
                  </label>
                  <button 
                    type="button"
                    onClick={() => onUpdate({ ...block.data, url: "" })}
                    className="p-1.5 rounded-full bg-white/90 shadow-sm text-red-600 hover:bg-white cursor-pointer transition-colors" 
                    title="Xóa ?nh"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <AutoResizeTextarea
                value={block.data.caption || ""}
                onChange={(e) => onUpdate({ ...block.data, caption: e.target.value })}
                onKeyDown={handleKeyDown}
                placeholder="Chú thích ?nh (caption)..."
                className="w-full bg-transparent text-sm italic text-center text-text-muted focus:outline-none placeholder:text-text-muted/40 resize-none overflow-hidden block"
              />
            </div>
          </div>
        )}

        {/* 5. Layout (2 Columns) */}
        {block.type === "layout" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
            <div className="space-y-2">
              <AutoResizeTextarea
                value={block.data.leftTitle || ""}
                onChange={(e) => onUpdate({ ...block.data, leftTitle: e.target.value })}
                onKeyDown={handleKeyDown}
                placeholder="Tiêu d? c?t trái..."
                className="w-full bg-transparent text-lg font-bold text-primary focus:outline-none placeholder:text-text-muted/40 resize-none overflow-hidden block"
              />
              <AutoResizeTextarea
                value={block.data.leftContent || ""}
                onChange={(e) => onUpdate({ ...block.data, leftContent: e.target.value })}
                onKeyDown={handleKeyDown}
                placeholder="N?i dung c?t trái..."
                className="w-full bg-transparent text-base leading-[1.7] text-[#1F1610] focus:outline-none placeholder:text-text-muted/40 resize-none overflow-hidden block"
              />
            </div>
            <div className="space-y-2">
              <AutoResizeTextarea
                value={block.data.rightTitle || ""}
                onChange={(e) => onUpdate({ ...block.data, rightTitle: e.target.value })}
                onKeyDown={handleKeyDown}
                placeholder="Tiêu d? c?t ph?i..."
                className="w-full bg-transparent text-lg font-bold text-primary focus:outline-none placeholder:text-text-muted/40 resize-none overflow-hidden block"
              />
              <AutoResizeTextarea
                value={block.data.rightContent || ""}
                onChange={(e) => onUpdate({ ...block.data, rightContent: e.target.value })}
                onKeyDown={handleKeyDown}
                placeholder="N?i dung c?t ph?i..."
                className="w-full bg-transparent text-base leading-[1.7] text-[#1F1610] focus:outline-none placeholder:text-text-muted/40 resize-none overflow-hidden block"
              />
            </div>
          </div>
        )}

        {/* 6. Section Box */}
        {block.type === "section" && (
          <div className="p-5 md:p-6 rounded-xl border-l-4 border-primary bg-surface/50 my-6 shadow-sm">
            <AutoResizeTextarea
              value={block.data.title || ""}
              onChange={(e) => onUpdate({ ...block.data, title: e.target.value })}
              onKeyDown={handleKeyDown}
              placeholder="Tiêu d? n?i b?t..."
              className="w-full bg-transparent text-lg font-serif font-bold text-primary focus:outline-none placeholder:text-text-muted/40 resize-none overflow-hidden block mb-2"
            />
            <AutoResizeTextarea
              value={block.data.content || ""}
              onChange={(e) => onUpdate({ ...block.data, content: e.target.value })}
              onKeyDown={handleKeyDown}
              placeholder="N?i dung h?p n?i b?t..."
              className="w-full bg-transparent text-base leading-[1.7] text-[#1F1610] focus:outline-none placeholder:text-text-muted/40 resize-none overflow-hidden block"
            />
          </div>
        )}

        {/* 7. Quote Block */}
        {block.type === "quote" && (
          <div className="border-l-[3px] border-primary pl-4 py-1 my-5 space-y-3">
            <AutoResizeTextarea
              value={block.data.quote || ""}
              onChange={(e) => onUpdate({ ...block.data, quote: e.target.value })}
              onKeyDown={handleKeyDown}
              placeholder="Trích d?n (Quote)..."
              className="w-full bg-transparent text-lg italic text-[#1F1610] leading-[1.7] focus:outline-none placeholder:text-text-muted/40 resize-none overflow-hidden block"
            />
            <AutoResizeTextarea
              value={block.data.author || ""}
              onChange={(e) => onUpdate({ ...block.data, author: e.target.value })}
              onKeyDown={handleKeyDown}
              placeholder="Tác gi? (Ví d?: — Ngh? nhân Ðông Phong)"
              className="w-full bg-transparent text-sm font-semibold text-text-muted focus:outline-none placeholder:text-text-muted/40 resize-none overflow-hidden block"
            />
          </div>
        )}

        {/* 8. List Block */}
        {block.type === "list" && (
          <div className="my-3 space-y-1 pl-1">
            {(block.data.items || [""]).map((item: string, i: number) => (
              <div key={i} className="flex items-start gap-2 group/item">
                <span className="text-base text-text-muted pt-1 select-none">
                  {block.data.listType === "numbered" ? `${i + 1}.` : "•"}
                </span>
                <AutoResizeTextarea
                  value={item}
                  onChange={(e) => {
                    const next = [...(block.data.items || [])];
                    next[i] = e.target.value;
                    onUpdate({ ...block.data, items: next });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      const next = [...(block.data.items || [])];
                      next.splice(i + 1, 0, "");
                      onUpdate({ ...block.data, items: next });
                    } else if (e.key === "Backspace" && (e.target as any).value === "") {
                      e.preventDefault();
                      if ((block.data.items || []).length > 1) {
                        const next = [...(block.data.items || [])].filter((_, idx) => idx !== i);
                        onUpdate({ ...block.data, items: next });
                      } else {
                        onDelete();
                      }
                    }
                  }}
                  placeholder="M?c danh sách..."
                  className="flex-1 bg-transparent text-base md:text-[17px] leading-[1.7] text-[#1F1610] focus:outline-none placeholder:text-text-muted/40 resize-none overflow-hidden block pt-[2px]"
                />
              </div>
            ))}
          </div>
        )}

        {/* 9. Table Block */}
        {block.type === "table" && (
          <div className="my-5 overflow-x-auto">
            <table className="w-full text-base border-collapse">
              <thead>
                <tr className="bg-surface/50 border-b border-border">
                  {(block.data.headers || ["C?t 1", "C?t 2"]).map((h: string, hi: number) => (
                    <th key={hi} className="p-3 border-r border-border last:border-r-0 text-left font-semibold">
                      <input
                        type="text"
                        value={h}
                        onChange={(e) => {
                          const nextH = [...block.data.headers];
                          nextH[hi] = e.target.value;
                          onUpdate({ ...block.data, headers: nextH });
                        }}
                        placeholder="Tiêu d? c?t..."
                        className="w-full bg-transparent focus:outline-none"
                      />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(block.data.rows || [["",""]]).map((row: string[], ri: number) => (
                  <tr key={ri} className="border-b border-border last:border-b-0">
                    {row.map((cell: string, ci: number) => (
                      <td key={ci} className="p-3 border-r border-border last:border-r-0 align-top">
                        <AutoResizeTextarea
                          value={cell}
                          onChange={(e) => {
                            const nextRows = [...block.data.rows];
                            nextRows[ri][ci] = e.target.value;
                            onUpdate({ ...block.data, rows: nextRows });
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && e.shiftKey) {
                              // new line in cell
                            } else if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              // add row below
                              const nextRows = [...block.data.rows];
                              const cols = block.data.headers.length;
                              nextRows.splice(ri + 1, 0, Array(cols).fill(""));
                              onUpdate({ ...block.data, rows: nextRows });
                            }
                          }}
                          placeholder="..."
                          className="w-full bg-transparent focus:outline-none resize-none overflow-hidden block"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 10. Button Block */}
        {block.type === "button" && (
          <div className="my-5 text-center">
            <input
              type="text"
              value={block.data.label || ""}
              onChange={(e) => onUpdate({ ...block.data, label: e.target.value })}
              placeholder="Nút hành d?ng (Ví d?: Nh?n d? xem ngay)..."
              className="inline-block px-6 py-3 rounded-full text-center font-bold text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 transition-all min-w-[200px]"
              style={{
                backgroundColor: block.data.buttonStyle === "zalo" ? "#0068FF" : block.data.buttonStyle === "hotline" ? "var(--wood-deep)" : "var(--gold-dark)"
              }}
            />
            <div className="mt-2 text-center">
              <input
                 type="text"
                 value={block.data.url || ""}
                 onChange={(e) => onUpdate({ ...block.data, url: e.target.value })}
                 placeholder="URL dích: https://zalo.me/..."
                 className="bg-transparent text-sm text-text-muted text-center border-b border-border/50 focus:border-primary focus:outline-none"
              />
            </div>
            <div className="mt-2 text-center text-xs">
               <select
                  value={block.data.buttonStyle || "primary"}
                  onChange={(e) => onUpdate({ ...block.data, buttonStyle: e.target.value })}
                  className="bg-transparent text-text-muted focus:outline-none"
                >
                  <option value="primary">Màu Vàng Ð?ng</option>
                  <option value="zalo">Màu Zalo (Xanh)</option>
                  <option value="hotline">Màu Nâu G?</option>
                </select>
            </div>
          </div>
        )}

        {/* 11. Divider Block */}
        {block.type === "divider" && (
          <div className="py-6 flex items-center justify-center">
            <div className="w-1/3 h-px bg-border/60"></div>
            <div className="px-3 text-border/60 text-lg">?</div>
            <div className="w-1/3 h-px bg-border/60"></div>
          </div>
        )}

        {/* 12. Footer Block */}
        {block.type === "footer" && (
          <div className="p-6 rounded-xl border border-border bg-bg/50 my-8 shadow-sm">
            <AutoResizeTextarea
              value={block.data.title || ""}
              onChange={(e) => onUpdate({ ...block.data, title: e.target.value })}
              onKeyDown={handleKeyDown}
              placeholder="L?i k?t..."
              className="w-full bg-transparent text-lg font-serif font-bold text-primary focus:outline-none placeholder:text-text-muted/40 resize-none overflow-hidden block mb-2"
            />
            <AutoResizeTextarea
              value={block.data.content || ""}
              onChange={(e) => onUpdate({ ...block.data, content: e.target.value })}
              onKeyDown={handleKeyDown}
              placeholder="Cam k?t và k?t lu?n bài vi?t..."
              className="w-full bg-transparent text-base leading-[1.7] text-[#1F1610] focus:outline-none placeholder:text-text-muted/40 resize-none overflow-hidden block"
            />
          </div>
        )}
      </div>
    </div>
  );
}

