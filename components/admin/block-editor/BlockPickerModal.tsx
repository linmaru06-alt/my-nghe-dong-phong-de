"use client";

import React, { useState, useEffect, useRef } from "react";
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
  Search,
  X,
} from "lucide-react";
import { BlockType } from "@/lib/blockEditor";

export interface BlockPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBlock: (type: BlockType) => void;
  insertPositionName?: string;
}

interface BlockDefinition {
  type: BlockType;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: "basic" | "media" | "layout" | "action";
  keywords: string;
}

const BLOCK_DEFINITIONS: BlockDefinition[] = [
  // Cơ bản
  {
    type: "text",
    title: "Đoạn văn (Text)",
    description: "Văn bản thường, khoảng cách dòng thoáng êm mắt",
    icon: AlignLeft,
    category: "basic",
    keywords: "text doan van ban paragraph chu",
  },
  {
    type: "heading",
    title: "Tiêu đề (Heading)",
    description: "Tiêu đề phân đoạn H2, H3, H4 tạo cấu trúc bài viết",
    icon: HeadingIcon,
    category: "basic",
    keywords: "heading tieu de h2 h3 h4 title",
  },
  {
    type: "quote",
    title: "Trích dẫn (Quote)",
    description: "Khối trích dẫn lời khuyên tâm huyết của nghệ nhân",
    icon: QuoteIcon,
    category: "basic",
    keywords: "quote trich dan loi noi cham ngon",
  },
  {
    type: "list",
    title: "Danh sách (List)",
    description: "Danh sách gạch đầu dòng hoặc đánh số 1-2-3",
    icon: ListIcon,
    category: "basic",
    keywords: "list danh sach gach dau dong",
  },
  {
    type: "divider",
    title: "Đường kẻ (Line)",
    description: "Đường phân cách mộc mạc giữa các phân đoạn",
    icon: Minus,
    category: "basic",
    keywords: "divider ke ngang line separator",
  },

  // Đa phương tiện
  {
    type: "image",
    title: "Hình ảnh (Image)",
    description: "Ảnh chụp thớ gỗ, phôi gỗ cận cảnh kèm chú thích",
    icon: ImageIcon,
    category: "media",
    keywords: "image hinh anh photo picture tho go",
  },

  // Bố cục & Phong thủy
  {
    type: "section",
    title: "Khối phong thủy (Section)",
    description: "Hộp đóng khung nổi bật giá trị phong thủy & lưu ý",
    icon: Box,
    category: "layout",
    keywords: "section khoi hop phong thuy callout noi bat",
  },
  {
    type: "layout",
    title: "Bố cục 2 cột (Columns)",
    description: "Chia đôi nội dung song song (50-50, 60-40 so sánh)",
    icon: Columns,
    category: "layout",
    keywords: "layout bo cuc 2 cot chia cot so sanh",
  },
  {
    type: "table",
    title: "Bảng dữ liệu (Table)",
    description: "Bảng so sánh kích thước hạt, thớ gỗ thật - giả",
    icon: TableIcon,
    category: "layout",
    keywords: "table bang bieu thong so du lieu",
  },

  // Kêu gọi hành động
  {
    type: "button",
    title: "Nút liên hệ (CTA Button)",
    description: "Nút bấm chuyển đổi nhanh Zalo, Hotline tư vấn",
    icon: MousePointerClick,
    category: "action",
    keywords: "button nut bam cta zalo hotline lien he",
  },
];

const CATEGORIES = [
  { id: "all", label: "Tất cả" },
  { id: "basic", label: "Cơ bản" },
  { id: "media", label: "Hình ảnh" },
  { id: "layout", label: "Cấu trúc & Phong thủy" },
  { id: "action", label: "Kêu gọi hành động" },
];

function removeDiacritics(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

export function BlockPickerModal({
  isOpen,
  onClose,
  onSelectBlock,
  insertPositionName,
}: BlockPickerModalProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSearchQuery("");
      setActiveCategory("all");
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredBlocks = BLOCK_DEFINITIONS.filter((block) => {
    const matchesCategory =
      activeCategory === "all" || block.category === activeCategory;
    if (!matchesCategory) return false;

    if (!searchQuery.trim()) return true;
    const q = removeDiacritics(searchQuery);
    return (
      removeDiacritics(block.title).includes(q) ||
      removeDiacritics(block.description).includes(q) ||
      removeDiacritics(block.keywords).includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div
        className="bg-[#FDFBF7] border border-[#C5A059]/40 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Squarespace style */}
        <div className="px-6 py-4 border-b border-border/70 flex items-center justify-between bg-white">
          <div>
            <h3 className="font-serif font-bold text-lg text-[#3D2314]">
              Thêm khối nội dung (Add Content Block)
            </h3>
            <p className="text-xs text-[#5A4A42]">
              {insertPositionName
                ? `Chèn vào ${insertPositionName}`
                : "Chọn loại khối để bổ sung vào mạch bài viết"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-[#3D2314] hover:bg-surface transition-colors"
            title="Đóng (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thanh tìm kiếm & Tabs danh mục */}
        <div className="px-6 pt-4 pb-3 border-b border-border/50 bg-white space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[#C5A059] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm khối (ví dụ: ảnh, 2 cột, tiêu đề, zalo...)..."
              className="w-full bg-[#FAF6F0] border border-border/70 rounded-xl pl-9 pr-4 py-2 text-[13px] text-[#1F1610] focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  activeCategory === cat.id
                    ? "bg-[#3D2314] text-[#C5A059] shadow-xs"
                    : "text-[#5A4A42] hover:bg-surface hover:text-[#3D2314]"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid các khối nội dung phong cách Squarespace */}
        <div className="p-6 overflow-y-auto flex-1 bg-[#FDFBF7]">
          {filteredBlocks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredBlocks.map((item) => {
                const ItemIcon = item.icon;
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => {
                      onSelectBlock(item.type);
                      onClose();
                    }}
                    className="group text-left p-3.5 rounded-xl border border-border/70 bg-white hover:border-[#C5A059] hover:shadow-md hover:bg-[#FAF6F0]/60 transition-all flex items-start gap-3.5"
                  >
                    <div className="p-2.5 rounded-xl bg-[#FAF6F0] text-[#3D2314] group-hover:bg-[#3D2314] group-hover:text-[#C5A059] transition-colors shrink-0 border border-border/40">
                      <ItemIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-[13px] text-[#3D2314] group-hover:text-[#3D2314] flex items-center justify-between">
                        <span>{item.title}</span>
                      </div>
                      <p className="text-[12px] text-[#5A4A42] mt-0.5 leading-relaxed line-clamp-2">
                        {item.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-text-muted">
              <p className="text-sm">Không tìm thấy khối nội dung nào phù hợp</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("all");
                }}
                className="mt-2 text-xs text-[#C5A059] hover:underline font-medium"
              >
                Xem tất cả các khối
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border/60 bg-white flex items-center justify-between text-xs text-text-muted">
          <span>Gợi ý: Bạn cũng có thể gõ <strong className="text-[#3D2314]">/</strong> trực tiếp trong dòng văn bản để chèn nhanh.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded text-text-muted hover:text-text"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

export default BlockPickerModal;
