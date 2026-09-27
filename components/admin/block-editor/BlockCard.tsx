"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  ChevronUp,
  ChevronDown,
  Copy,
  Trash2,
  Upload,
  Loader2,
  X,
  Plus,
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

export interface BlockCardProps {
  block: EditorBlock;
  index: number;
  total: number;
  onUpdate: (data: Record<string, any>) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

const TYPE_CONFIG: Record<
  BlockType,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  header: { label: "Header (Đầu mục)", icon: Sparkles, color: "text-amber-600 bg-amber-50" },
  heading: { label: "Heading (Tiêu đề)", icon: HeadingIcon, color: "text-blue-600 bg-blue-50" },
  text: { label: "Text (Đoạn văn)", icon: AlignLeft, color: "text-slate-600 bg-slate-50" },
  image: { label: "Image (Hình ảnh)", icon: ImageIcon, color: "text-emerald-600 bg-emerald-50" },
  layout: { label: "Layout (2 Cột)", icon: Columns, color: "text-indigo-600 bg-indigo-50" },
  section: { label: "Section (Hộp nổi bật)", icon: Box, color: "text-orange-600 bg-orange-50" },
  quote: { label: "Quote (Trích dẫn)", icon: QuoteIcon, color: "text-rose-600 bg-rose-50" },
  list: { label: "List (Danh sách)", icon: ListIcon, color: "text-cyan-600 bg-cyan-50" },
  table: { label: "Table (Bảng dữ liệu)", icon: TableIcon, color: "text-violet-600 bg-violet-50" },
  button: { label: "Button (Nút bấm CTA)", icon: MousePointerClick, color: "text-yellow-600 bg-yellow-50" },
  divider: { label: "Divider (Kẻ ngang)", icon: Minus, color: "text-gray-600 bg-gray-50" },
  footer: { label: "Footer (Đúc kết)", icon: BookOpen, color: "text-teal-600 bg-teal-50" },
};

export function BlockCard({
  block,
  index,
  total,
  onUpdate,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
}: BlockCardProps) {
  const [isUploading, setIsUploading] = useState(false);
  const config = TYPE_CONFIG[block.type] || TYPE_CONFIG.text;
  const Icon = config.icon;

  // Xử lý upload ảnh trực tiếp lên Supabase Storage
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
        toast.success("Tải ảnh thành công", "Ảnh đã được lưu trữ vĩnh viễn trên Supabase Storage.");
      } else {
        throw new Error(json.error || "Không thể tải ảnh");
      }
    } catch (err: any) {
      toast.error("Lỗi tải ảnh", err.message || "Vui lòng thử lại");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="group relative rounded-card border border-border bg-surface shadow-xs hover:border-primary/50 transition-all duration-200">
      {/* Block Top Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/60 bg-bg/40 rounded-t-card">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded ${config.color}`}>
            <Icon className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-text uppercase tracking-wider">
            {config.label}
          </span>
          <span className="text-[11px] text-text-muted">#{index + 1}</span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            disabled={index === 0}
            onClick={onMoveUp}
            title="Di chuyển lên trên"
            className="p-1 rounded hover:bg-border/60 text-text-muted hover:text-text disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            type="button"
            disabled={index === total - 1}
            onClick={onMoveDown}
            title="Di chuyển xuống dưới"
            className="p-1 rounded hover:bg-border/60 text-text-muted hover:text-text disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onDuplicate}
            title="Nhân bản khối này"
            className="p-1 rounded hover:bg-border/60 text-text-muted hover:text-text transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            title="Xóa khối này"
            className="p-1 rounded hover:bg-red-50 text-text-muted hover:text-red-600 transition-colors ml-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Block Content Editor Body */}
      <div className="p-4 sm:p-5">
        {/* 1. Header Block */}
        {block.type === "header" && (
          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-semibold text-text-muted uppercase block mb-1">
                Tiêu đề phần lớn (H2)
              </label>
              <input
                type="text"
                value={block.data.title || ""}
                onChange={(e) => onUpdate({ ...block.data, title: e.target.value })}
                placeholder="Nhập tiêu đề lớn..."
                className="w-full bg-bg border border-border rounded-btn px-3 py-2 text-base font-serif font-bold text-primary focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-text-muted uppercase block mb-1">
                Phụ đề mô tả ngắn
              </label>
              <input
                type="text"
                value={block.data.subtitle || ""}
                onChange={(e) => onUpdate({ ...block.data, subtitle: e.target.value })}
                placeholder="Dòng chữ tóm tắt in nghiêng trang nhã..."
                className="w-full bg-bg border border-border rounded-btn px-3 py-1.5 text-xs text-text-muted italic focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        )}

        {/* 2. Heading Block */}
        {block.type === "heading" && (
          <div className="flex items-center gap-3">
            <select
              value={block.data.level || 2}
              onChange={(e) => onUpdate({ ...block.data, level: Number(e.target.value) })}
              className="bg-bg border border-border rounded-btn px-2.5 py-2 text-xs font-semibold text-text focus:outline-none focus:border-primary"
            >
              <option value={2}>H2 (Mục lớn)</option>
              <option value={3}>H3 (Mục phụ)</option>
              <option value={4}>H4 (Mục nhỏ)</option>
            </select>
            <input
              type="text"
              value={block.data.text || ""}
              onChange={(e) => onUpdate({ ...block.data, text: e.target.value })}
              placeholder="Nhập tiêu đề phân đoạn..."
              className="flex-1 bg-bg border border-border rounded-btn px-3 py-2 text-sm font-bold text-primary focus:outline-none focus:border-primary"
            />
          </div>
        )}

        {/* 3. Text Block */}
        {block.type === "text" && (
          <div>
            <textarea
              rows={4}
              value={block.data.text || ""}
              onChange={(e) => onUpdate({ ...block.data, text: e.target.value })}
              placeholder="Nhập đoạn văn bản ở đây..."
              className="w-full bg-bg border border-border rounded-btn p-3 text-sm text-text focus:outline-none focus:border-primary leading-relaxed resize-y"
            />
          </div>
        )}

        {/* 4. Image Block */}
        {block.type === "image" && (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative w-full sm:w-48 aspect-16/10 rounded-lg overflow-hidden bg-bg border border-border flex items-center justify-center flex-shrink-0">
                {block.data.url ? (
                  <Image
                    src={block.data.url}
                    alt={block.data.alt || "Ảnh"}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="text-center p-2 text-text-muted">
                    <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-40" />
                    <span className="text-[11px]">Chưa chọn ảnh</span>
                  </div>
                )}
              </div>

              <div className="flex-1 w-full space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <label
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-btn bg-primary hover:bg-primary-hover text-white text-xs font-semibold cursor-pointer transition-colors ${
                      isUploading ? "opacity-60 pointer-events-none" : ""
                    }`}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Đang tải lên Supabase...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        <span>Tải ảnh từ máy</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isUploading}
                      onChange={handleUploadImage}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[11px] text-text-muted">Lưu tự động vào Supabase Storage</span>
                </div>

                <input
                  type="text"
                  value={block.data.url || ""}
                  onChange={(e) => onUpdate({ ...block.data, url: e.target.value })}
                  placeholder="Hoặc dán URL ảnh trực tiếp: https://..."
                  className="w-full bg-bg border border-border rounded-btn px-3 py-1.5 text-xs text-text focus:outline-none focus:border-primary font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[11px] font-semibold text-text-muted uppercase block mb-1">
                  Chú thích hiển thị dưới ảnh (Caption)
                </label>
                <input
                  type="text"
                  value={block.data.caption || ""}
                  onChange={(e) => onUpdate({ ...block.data, caption: e.target.value })}
                  placeholder="VD: Cận cảnh thớ gỗ mịn tít và ánh kim sa tự nhiên..."
                  className="w-full bg-bg border border-border rounded-btn px-3 py-1.5 text-xs text-text italic focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-text-muted uppercase block mb-1">
                  Thẻ mô tả SEO (Alt Text)
                </label>
                <input
                  type="text"
                  value={block.data.alt || ""}
                  onChange={(e) => onUpdate({ ...block.data, alt: e.target.value })}
                  placeholder="Mô tả cho Google hiểu bức ảnh..."
                  className="w-full bg-bg border border-border rounded-btn px-3 py-1.5 text-xs text-text focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>
        )}

        {/* 5. Layout (2 Columns) */}
        {block.type === "layout" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-text-muted border-b border-border/40 pb-2">
              <span>Bố cục 2 Cột song song</span>
              <div className="flex items-center gap-1 font-mono text-[11px]">
                <button
                  type="button"
                  onClick={() => onUpdate({ ...block.data, ratio: "50-50" })}
                  className={`px-2 py-0.5 rounded ${
                    block.data.ratio === "50-50" ? "bg-primary text-white" : "hover:bg-border/60"
                  }`}
                >
                  50 / 50
                </button>
                <button
                  type="button"
                  onClick={() => onUpdate({ ...block.data, ratio: "60-40" })}
                  className={`px-2 py-0.5 rounded ${
                    block.data.ratio === "60-40" ? "bg-primary text-white" : "hover:bg-border/60"
                  }`}
                >
                  60 / 40
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Left Column */}
              <div className="p-3 rounded-lg border border-border bg-bg/30 space-y-2">
                <span className="text-[11px] font-semibold text-primary uppercase block">
                  Cột Trái
                </span>
                <input
                  type="text"
                  value={block.data.leftTitle || ""}
                  onChange={(e) => onUpdate({ ...block.data, leftTitle: e.target.value })}
                  placeholder="Tiêu đề cột trái..."
                  className="w-full bg-bg border border-border rounded-btn px-2.5 py-1.5 text-xs font-bold text-text focus:outline-none focus:border-primary"
                />
                <textarea
                  rows={3}
                  value={block.data.leftContent || ""}
                  onChange={(e) => onUpdate({ ...block.data, leftContent: e.target.value })}
                  placeholder="Nội dung cột trái..."
                  className="w-full bg-bg border border-border rounded-btn p-2 text-xs text-text focus:outline-none focus:border-primary leading-relaxed"
                />
              </div>

              {/* Right Column */}
              <div className="p-3 rounded-lg border border-border bg-bg/30 space-y-2">
                <span className="text-[11px] font-semibold text-secondary uppercase block">
                  Cột Phải
                </span>
                <input
                  type="text"
                  value={block.data.rightTitle || ""}
                  onChange={(e) => onUpdate({ ...block.data, rightTitle: e.target.value })}
                  placeholder="Tiêu đề cột phải..."
                  className="w-full bg-bg border border-border rounded-btn px-2.5 py-1.5 text-xs font-bold text-text focus:outline-none focus:border-primary"
                />
                <textarea
                  rows={3}
                  value={block.data.rightContent || ""}
                  onChange={(e) => onUpdate({ ...block.data, rightContent: e.target.value })}
                  placeholder="Nội dung cột phải..."
                  className="w-full bg-bg border border-border rounded-btn p-2 text-xs text-text focus:outline-none focus:border-primary leading-relaxed"
                />
              </div>
            </div>
          </div>
        )}

        {/* 6. Section Box */}
        {block.type === "section" && (
          <div className="p-4 rounded-lg border-2 border-primary/30 bg-accent-soft/30 space-y-2">
            <input
              type="text"
              value={block.data.title || ""}
              onChange={(e) => onUpdate({ ...block.data, title: e.target.value })}
              placeholder="Tiêu đề khối nổi bật..."
              className="w-full bg-surface border border-border rounded-btn px-3 py-1.5 text-sm font-serif font-bold text-primary focus:outline-none focus:border-primary"
            />
            <textarea
              rows={3}
              value={block.data.content || ""}
              onChange={(e) => onUpdate({ ...block.data, content: e.target.value })}
              placeholder="Nội dung hộp nổi bật..."
              className="w-full bg-surface border border-border rounded-btn p-2.5 text-xs text-text focus:outline-none focus:border-primary leading-relaxed"
            />
          </div>
        )}

        {/* 7. Quote Block */}
        {block.type === "quote" && (
          <div className="border-l-4 border-primary pl-4 py-1 space-y-2">
            <textarea
              rows={2}
              value={block.data.quote || ""}
              onChange={(e) => onUpdate({ ...block.data, quote: e.target.value })}
              placeholder="Nhập câu trích dẫn hoặc lời dặn của nghệ nhân..."
              className="w-full bg-bg border border-border rounded-btn p-2 text-sm italic font-serif text-text focus:outline-none focus:border-primary"
            />
            <input
              type="text"
              value={block.data.author || ""}
              onChange={(e) => onUpdate({ ...block.data, author: e.target.value })}
              placeholder="Tên người nói (VD: Nghệ nhân Đông Phong)"
              className="w-full sm:w-64 bg-bg border border-border rounded-btn px-2.5 py-1 text-xs font-semibold text-primary focus:outline-none focus:border-primary"
            />
          </div>
        )}

        {/* 8. List Block */}
        {block.type === "list" && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <button
                type="button"
                onClick={() => onUpdate({ ...block.data, listType: "bullet" })}
                className={`px-2.5 py-1 text-xs rounded font-medium ${
                  block.data.listType === "bullet" ? "bg-primary text-white" : "border border-border"
                }`}
              >
                Chấm tròn (•)
              </button>
              <button
                type="button"
                onClick={() => onUpdate({ ...block.data, listType: "numbered" })}
                className={`px-2.5 py-1 text-xs rounded font-medium ${
                  block.data.listType === "numbered" ? "bg-primary text-white" : "border border-border"
                }`}
              >
                Đánh số (1, 2, 3)
              </button>
            </div>

            {(block.data.items || []).map((item: string, i: number) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs text-text-muted w-5 text-center font-mono">
                  {block.data.listType === "numbered" ? `${i + 1}.` : "•"}
                </span>
                <input
                  type="text"
                  value={item}
                  onChange={(e) => {
                    const next = [...block.data.items];
                    next[i] = e.target.value;
                    onUpdate({ ...block.data, items: next });
                  }}
                  className="flex-1 bg-bg border border-border rounded-btn px-2.5 py-1.5 text-xs text-text focus:outline-none focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => {
                    const next = block.data.items.filter((_: any, idx: number) => idx !== i);
                    onUpdate({ ...block.data, items: next });
                  }}
                  className="p-1 text-text-muted hover:text-red-500"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => {
                const next = [...(block.data.items || []), "Ý tiếp theo..."];
                onUpdate({ ...block.data, items: next });
              }}
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline mt-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm dòng mới</span>
            </button>
          </div>
        )}

        {/* 9. Table Block */}
        {block.type === "table" && (
          <div className="space-y-2 overflow-x-auto">
            <span className="text-[11px] text-text-muted block">Bảng dữ liệu và so sánh</span>
            <table className="w-full text-xs border border-border">
              <thead>
                <tr className="bg-bg">
                  {(block.data.headers || []).map((h: string, hi: number) => (
                    <th key={hi} className="p-1.5 border border-border">
                      <input
                        type="text"
                        value={h}
                        onChange={(e) => {
                          const nextH = [...block.data.headers];
                          nextH[hi] = e.target.value;
                          onUpdate({ ...block.data, headers: nextH });
                        }}
                        className="w-full font-bold bg-transparent border-0 focus:outline-none text-center"
                      />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(block.data.rows || []).map((row: string[], ri: number) => (
                  <tr key={ri}>
                    {row.map((cell: string, ci: number) => (
                      <td key={ci} className="p-1.5 border border-border">
                        <input
                          type="text"
                          value={cell}
                          onChange={(e) => {
                            const nextRows = [...block.data.rows];
                            nextRows[ri][ci] = e.target.value;
                            onUpdate({ ...block.data, rows: nextRows });
                          }}
                          className="w-full bg-transparent border-0 focus:outline-none"
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-text-muted uppercase block mb-1">
                Chữ trên nút (Label)
              </label>
              <input
                type="text"
                value={block.data.label || ""}
                onChange={(e) => onUpdate({ ...block.data, label: e.target.value })}
                placeholder="Nhắn Zalo Tư Vấn..."
                className="w-full bg-bg border border-border rounded-btn px-2.5 py-1.5 text-xs font-bold text-text focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-text-muted uppercase block mb-1">
                Đường dẫn liên kết (URL)
              </label>
              <input
                type="text"
                value={block.data.url || ""}
                onChange={(e) => onUpdate({ ...block.data, url: e.target.value })}
                placeholder="https://zalo.me/... hoặc /san-pham/..."
                className="w-full bg-bg border border-border rounded-btn px-2.5 py-1.5 text-xs text-text focus:outline-none focus:border-primary font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-text-muted uppercase block mb-1">
                Kiểu dáng nút
              </label>
              <select
                value={block.data.buttonStyle || "zalo"}
                onChange={(e) => onUpdate({ ...block.data, buttonStyle: e.target.value })}
                className="w-full bg-bg border border-border rounded-btn px-2.5 py-1.5 text-xs text-text focus:outline-none focus:border-primary"
              >
                <option value="zalo">Xanh Zalo (Nhắn Zalo)</option>
                <option value="hotline">Nâu Gỗ (Hotline Xưởng)</option>
                <option value="primary">Vàng Đồng Hoàng Gia</option>
              </select>
            </div>
          </div>
        )}

        {/* 11. Divider Block */}
        {block.type === "divider" && (
          <div className="py-2 text-center">
            <div className="h-px bg-border/80 w-full" />
            <span className="text-[10px] text-text-muted uppercase tracking-widest mt-1 block">
              Đường kẻ phân cách
            </span>
          </div>
        )}

        {/* 12. Footer Block */}
        {block.type === "footer" && (
          <div className="p-4 rounded-lg bg-surface border border-border space-y-2">
            <input
              type="text"
              value={block.data.title || ""}
              onChange={(e) => onUpdate({ ...block.data, title: e.target.value })}
              placeholder="Tiêu đề đúc kết..."
              className="w-full bg-bg border border-border rounded-btn px-3 py-1.5 text-sm font-serif font-bold text-primary focus:outline-none focus:border-primary"
            />
            <textarea
              rows={2}
              value={block.data.content || ""}
              onChange={(e) => onUpdate({ ...block.data, content: e.target.value })}
              placeholder="Lời kết và cam kết thương hiệu..."
              className="w-full bg-bg border border-border rounded-btn p-2.5 text-xs text-text focus:outline-none focus:border-primary leading-relaxed"
            />
          </div>
        )}
      </div>
    </div>
  );
}
