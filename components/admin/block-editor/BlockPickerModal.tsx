"use client";

import React from "react";
import {
  Heading,
  AlignLeft,
  Image as ImageIcon,
  Columns,
  Box,
  Quote,
  List,
  Table,
  MousePointerClick,
  Minus,
  Sparkles,
  BookOpen,
  X,
} from "lucide-react";
import { BlockType } from "@/lib/blockEditor";

export interface BlockPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBlock: (type: BlockType) => void;
}

interface BlockDefinition {
  type: BlockType;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  tag: string;
}

const BLOCK_DEFINITIONS: BlockDefinition[] = [
  {
    type: "header",
    title: "Header (Đầu mục)",
    description: "Tiêu đề lớn kèm dòng phụ đề trang trọng mở đầu phần",
    icon: Sparkles,
    tag: "Khung sườn",
  },
  {
    type: "heading",
    title: "Heading (Tiêu đề)",
    description: "Tiêu đề phân đoạn H2, H3, H4 tạo nhịp điệu đọc",
    icon: Heading,
    tag: "Cơ bản",
  },
  {
    type: "text",
    title: "Text (Đoạn văn)",
    description: "Đoạn văn bản thông thường dãn dòng chuẩn êm mắt",
    icon: AlignLeft,
    tag: "Cơ bản",
  },
  {
    type: "image",
    title: "Image (Hình ảnh)",
    description: "Ảnh chụp gỗ kèm chú thích, tải lên Supabase Storage",
    icon: ImageIcon,
    tag: "Media",
  },
  {
    type: "layout",
    title: "Layout (2 Cột)",
    description: "Chia nội dung song song (Ảnh - Chữ hoặc 2 Cột so sánh)",
    icon: Columns,
    tag: "Bố cục",
  },
  {
    type: "section",
    title: "Section (Khối hộp)",
    description: "Đóng khung làm nổi bật nội dung phong thủy hoặc lưu ý",
    icon: Box,
    tag: "Khung sườn",
  },
  {
    type: "quote",
    title: "Quote (Trích dẫn)",
    description: "Khối trích dẫn lời khuyên tâm huyết của nghệ nhân",
    icon: Quote,
    tag: "Nổi bật",
  },
  {
    type: "list",
    title: "List (Danh sách)",
    description: "Danh sách gạch đầu dòng hoặc đánh số 1-2-3 dễ nhớ",
    icon: List,
    tag: "Cơ bản",
  },
  {
    type: "table",
    title: "Table (Bảng dữ liệu)",
    description: "Bảng lưới so sánh kích thước, thớ gỗ thật - giả",
    icon: Table,
    tag: "Bảng biểu",
  },
  {
    type: "button",
    title: "Button (Nút bấm CTA)",
    description: "Nút bấm dẫn link tư vấn Zalo hoặc xem sản phẩm",
    icon: MousePointerClick,
    tag: "Tương tác",
  },
  {
    type: "divider",
    title: "Divider (Vạch ngăn)",
    description: "Đường kẻ mờ phân chia tinh tế giữa các phần",
    icon: Minus,
    tag: "Bố cục",
  },
  {
    type: "footer",
    title: "Footer (Đúc kết)",
    description: "Khối tổng kết cuối bài kèm cam kết thương hiệu",
    icon: BookOpen,
    tag: "Khung sườn",
  },
];

export function BlockPickerModal({ isOpen, onClose, onSelectBlock }: BlockPickerModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-surface rounded-card border border-border shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-bg/50">
          <div>
            <h3 className="font-serif text-lg font-bold text-primary">
              Chọn Khối Muốn Chèn Vào Vị Trí Này
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              Bấm vào khối bất kỳ để chèn ngay vào khe hở bạn vừa chọn
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-btn hover:bg-border/60 text-text-muted hover:text-text transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Blocks Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {BLOCK_DEFINITIONS.map((def) => {
            const Icon = def.icon;
            return (
              <button
                key={def.type}
                type="button"
                onClick={() => {
                  onSelectBlock(def.type);
                  onClose();
                }}
                className="group flex items-start gap-3 p-3.5 rounded-card border border-border hover:border-primary/60 hover:bg-accent-soft/40 transition-all text-left active:scale-[0.98]"
              >
                <div className="p-2.5 rounded-lg bg-surface border border-border group-hover:border-primary group-hover:bg-primary group-hover:text-white text-primary transition-colors flex-shrink-0 shadow-xs">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-medium text-sm text-text group-hover:text-primary transition-colors truncate">
                      {def.title}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-bg text-text-muted border border-border/60">
                      {def.tag}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">
                    {def.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border bg-bg/40 text-center text-xs text-text-muted">
          Mẹo: Bạn có thể di chuyển lên ⬆️ xuống ⬇️ hoặc xóa khối bất cứ lúc nào sau khi chèn.
        </div>
      </div>
    </div>
  );
}
