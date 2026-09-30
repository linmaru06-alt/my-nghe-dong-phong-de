"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Cloud,
  CloudUpload,
  Check,
  Undo2,
  Redo2,
  Printer,
  Paintbrush,
  Bold,
  Italic,
  Underline,
  Link2,
  Image as ImageIcon,
  Table as TableIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  ListChecks,
  Indent,
  Outdent,
  RemoveFormatting,
  ChevronDown,
  Settings,
  Eye,
  Send,
  Loader2,
  Sparkles,
  Quote,
  Minus,
  MessageCircle,
  HelpCircle,
  Strikethrough,
  Highlighter,
} from "lucide-react";
import { BlockType } from "@/lib/blockEditor";

export interface GoogleDocsToolbarProps {
  title: string;
  onTitleChange: (title: string) => void;
  saveStatus: string;
  lastSaved: Date | null;
  isSaving: boolean;
  onSaveDraft: () => void;
  onPublish: () => void;
  onPreview: () => void;
  showSettings: boolean;
  onToggleSettings: () => void;

  // Editor Actions
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onInsertBlock: (type: BlockType, data?: any) => void;
  onFormatText?: (format: "bold" | "italic" | "underline" | "strike" | "link" | "highlight" | "color", value?: string) => void;
  onChangeActiveBlockType?: (type: BlockType, level?: number) => void;
  onInsertTable?: (rows?: number, cols?: number) => void;
  currentStyle?: string;
}

export function GoogleDocsToolbar({
  title,
  onTitleChange,
  saveStatus,
  lastSaved,
  isSaving,
  onSaveDraft,
  onPublish,
  onPreview,
  showSettings,
  onToggleSettings,
  onUndo,
  onRedo,
  canUndo = true,
  canRedo = false,
  onInsertBlock,
  onFormatText,
  onChangeActiveBlockType,
  onInsertTable,
  currentStyle = "Văn bản thường",
}: GoogleDocsToolbarProps) {
  const [showStyleMenu, setShowStyleMenu] = useState(false);
  const [showColorMenu, setShowColorMenu] = useState(false);
  const [showHighlightMenu, setShowHighlightMenu] = useState(false);
  const [showInsertMenu, setShowInsertMenu] = useState(false);
  const [fontSize, setFontSize] = useState<number>(11);
  const [zoom, setZoom] = useState<string>("100%");

  const textColors = [
    { name: "Mặc định (Đen mộc)", value: "#1F1610" },
    { name: "Nâu gỗ Đông Phong", value: "#3D2314" },
    { name: "Gỗ Trắc / Tử đàn", value: "#5C3A21" },
    { name: "Vàng đồng hoàng kim", value: "#C5A059" },
    { name: "Đỏ sưa phong thủy", value: "#B91C1C" },
    { name: "Xanh ngọc bách xanh", value: "#047857" },
  ];

  const highlightColors = [
    { name: "Không màu", value: "transparent" },
    { name: "Vàng nhạt", value: "#FEF08A" },
    { name: "Cam gỗ", value: "#FED7AA" },
    { name: "Xanh ngọc", value: "#A7F3D0" },
    { name: "Hồng hoàng gia", value: "#FBCFE8" },
  ];

  return (
    <div className="sticky top-0 z-50 bg-[#F9FBFD] border-b border-[#E1E5EA] shadow-xs select-none">
      {/* 1. TOP HEADER ROW: Back, Title, Save Status, Action Buttons */}
      <div className="px-4 py-2 flex items-center justify-between gap-3 border-b border-[#ECEFF3]">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Link
            href="/admin/bai-viet"
            className="p-1.5 rounded-full hover:bg-[#E5E9EC] text-[#444746] transition-colors"
            title="Quay lại danh sách bài viết"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          {/* Doc Title Input (Google Docs style) */}
          <div className="flex flex-col flex-1 min-w-0">
            <input
              type="text"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Tài liệu không có tiêu đề"
              className="text-[17px] font-semibold text-[#1F1F1F] bg-transparent border border-transparent hover:border-[#DADCE0] focus:border-[#1A73E8] focus:bg-white rounded px-2 py-0.5 outline-none transition-all truncate"
            />
            
            {/* Status & Cloud Sync Indicator */}
            <div className="flex items-center gap-2 px-2 text-[11px] text-[#5F6368]">
              {saveStatus === "Đang lưu..." ? (
                <span className="flex items-center gap-1 text-amber-600">
                  <CloudUpload className="w-3.5 h-3.5 animate-pulse" />
                  Đang lưu thay đổi...
                </span>
              ) : (
                <span className="flex items-center gap-1 text-emerald-700">
                  <Cloud className="w-3.5 h-3.5" />
                  {saveStatus === "Chưa lưu" ? (
                    <span className="text-amber-600">Bản nháp có thay đổi chưa lưu</span>
                  ) : (
                    <span>Đã lưu vào bộ nhớ {lastSaved ? `lúc ${lastSaved.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}` : ""}</span>
                  )}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onPreview}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#444746] bg-[#EDF2FA] hover:bg-[#DDE3EA] rounded-full transition-colors hidden sm:flex"
            title="Xem trước giao diện người đọc"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Xem trước</span>
          </button>

          <button
            type="button"
            onClick={onSaveDraft}
            className="px-3.5 py-1.5 text-xs font-semibold text-[#1F1610] bg-white border border-[#DADCE0] hover:bg-[#F8F9FA] rounded-full transition-colors shadow-xs hidden sm:block"
            title="Lưu lại bản nháp hiện tại"
          >
            Lưu nháp
          </button>

          <button
            type="button"
            disabled={isSaving}
            onClick={onPublish}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-[#3D2314] hover:bg-[#5C3A21] text-white text-xs font-semibold rounded-full transition-all shadow-sm disabled:opacity-60"
            title="Xuất bản bài viết lên website"
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span>Đăng bài</span>
          </button>

          <div className="w-px h-5 bg-[#DADCE0] mx-0.5" />

          <button
            type="button"
            onClick={onToggleSettings}
            className={`p-2 rounded-full transition-colors ${showSettings ? "bg-[#D3E3FD] text-[#041E49]" : "hover:bg-[#E5E9EC] text-[#444746]"}`}
            title="Cài đặt bài viết (Ảnh bìa, Chuyên mục, SEO)"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. GOOGLE DOCS TOOLBAR ROW */}
      <div className="px-3 py-1.5 flex items-center gap-0.5 overflow-x-auto text-[#444746] bg-[#EDF2FA] border-t border-[#E1E5EA]">
        {/* Undo / Redo */}
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          className="p-1.5 rounded hover:bg-black/5 disabled:opacity-30 transition-colors"
          title="Hoàn tác (Ctrl+Z)"
        >
          <Undo2 className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onRedo}
          disabled={!canRedo}
          className="p-1.5 rounded hover:bg-black/5 disabled:opacity-30 transition-colors"
          title="Làm lại (Ctrl+Y)"
        >
          <Redo2 className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => window.print()}
          className="p-1.5 rounded hover:bg-black/5 transition-colors hidden md:block"
          title="In tài liệu (Ctrl+P)"
        >
          <Printer className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => onFormatText && onFormatText("bold")}
          className="p-1.5 rounded hover:bg-black/5 transition-colors hidden md:block"
          title="Sơn định dạng"
        >
          <Paintbrush className="w-4 h-4" />
        </button>

        {/* Zoom Selector */}
        <div className="flex items-center px-1 py-1 rounded hover:bg-black/5 cursor-pointer text-xs font-medium gap-1 hidden lg:flex">
          <span>{zoom}</span>
          <ChevronDown className="w-3 h-3 text-[#70757A]" />
        </div>

        <div className="w-px h-4 bg-[#B4B9C2] mx-1" />

        {/* Styles Dropdown (Văn bản thường / Tiêu đề 1 / Tiêu đề 2 / Tiêu đề 3) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowStyleMenu(!showStyleMenu)}
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-black/5 text-xs font-medium text-[#1F1F1F] transition-colors"
            title="Định dạng kiểu văn bản"
          >
            <span className="w-24 text-left truncate">{currentStyle}</span>
            <ChevronDown className="w-3 h-3 text-[#70757A]" />
          </button>

          {showStyleMenu && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-[#DADCE0] rounded-lg shadow-lg z-50 py-1.5 text-xs">
              <button
                type="button"
                onClick={() => {
                  onChangeActiveBlockType?.("text");
                  setShowStyleMenu(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-[#F1F3F4] text-[#1F1F1F]"
              >
                Văn bản thường
              </button>
              <button
                type="button"
                onClick={() => {
                  onChangeActiveBlockType?.("heading", 2);
                  setShowStyleMenu(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-[#F1F3F4] text-[#1F1F1F] font-serif font-bold text-sm"
              >
                Tiêu đề 1 (H2)
              </button>
              <button
                type="button"
                onClick={() => {
                  onChangeActiveBlockType?.("heading", 3);
                  setShowStyleMenu(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-[#F1F3F4] text-[#1F1F1F] font-serif font-bold text-xs"
              >
                Tiêu đề 2 (H3)
              </button>
              <button
                type="button"
                onClick={() => {
                  onChangeActiveBlockType?.("heading", 4);
                  setShowStyleMenu(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-[#F1F3F4] text-[#1F1F1F] font-serif font-bold text-xs"
              >
                Tiêu đề 3 (H4)
              </button>
            </div>
          )}
        </div>

        <div className="w-px h-4 bg-[#B4B9C2] mx-1" />

        {/* Font Family Display */}
        <div className="flex items-center px-2 py-1 rounded hover:bg-black/5 cursor-pointer text-xs font-medium gap-1 hidden xl:flex">
          <span>Be Vietnam Pro</span>
          <ChevronDown className="w-3 h-3 text-[#70757A]" />
        </div>

        {/* Font Size controls */}
        <div className="flex items-center gap-0.5 bg-white/70 border border-[#DADCE0] rounded px-1 py-0.5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setFontSize(Math.max(8, fontSize - 1))}
            className="w-4 h-4 flex items-center justify-center hover:bg-black/5 rounded text-[#444746]"
            title="Giảm cỡ chữ"
          >
            -
          </button>
          <span className="w-5 text-center text-[#1F1F1F]">{fontSize}</span>
          <button
            type="button"
            onClick={() => setFontSize(Math.min(72, fontSize + 1))}
            className="w-4 h-4 flex items-center justify-center hover:bg-black/5 rounded text-[#444746]"
            title="Tăng cỡ chữ"
          >
            +
          </button>
        </div>

        <div className="w-px h-4 bg-[#B4B9C2] mx-1" />

        {/* Bold, Italic, Underline, Strikethrough */}
        <button
          type="button"
          onClick={() => onFormatText?.("bold")}
          className="p-1.5 rounded hover:bg-black/5 transition-colors"
          title="In đậm (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => onFormatText?.("italic")}
          className="p-1.5 rounded hover:bg-black/5 transition-colors"
          title="In nghiêng (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => onFormatText?.("underline")}
          className="p-1.5 rounded hover:bg-black/5 transition-colors"
          title="Gạch chân (Ctrl+U)"
        >
          <Underline className="w-4 h-4" />
        </button>

        {/* Text Color Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowColorMenu(!showColorMenu)}
            className="p-1.5 rounded hover:bg-black/5 transition-colors flex flex-col items-center"
            title="Màu văn bản"
          >
            <span className="font-bold text-xs leading-none">A</span>
            <div className="w-3.5 h-0.5 bg-[#3D2314] mt-0.5 rounded-full" />
          </button>

          {showColorMenu && (
            <div className="absolute top-full left-0 mt-1 w-44 bg-white border border-[#DADCE0] rounded-lg shadow-lg z-50 p-2">
              <div className="text-[10px] font-semibold text-[#5F6368] uppercase mb-1.5">Màu chữ gỗ quý</div>
              <div className="space-y-1">
                {textColors.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => {
                      onFormatText?.("color", c.value);
                      setShowColorMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-2 py-1 text-xs hover:bg-[#F1F3F4] rounded text-left"
                  >
                    <span className="w-3.5 h-3.5 rounded-full border border-black/10" style={{ backgroundColor: c.value }} />
                    <span className="truncate">{c.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Highlight Color */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowHighlightMenu(!showHighlightMenu)}
            className="p-1.5 rounded hover:bg-black/5 transition-colors"
            title="Màu đánh dấu nổi bật"
          >
            <Highlighter className="w-4 h-4 text-[#D97706]" />
          </button>

          {showHighlightMenu && (
            <div className="absolute top-full left-0 mt-1 w-36 bg-white border border-[#DADCE0] rounded-lg shadow-lg z-50 p-2">
              <div className="text-[10px] font-semibold text-[#5F6368] uppercase mb-1.5">Màu nền highlight</div>
              <div className="grid grid-cols-5 gap-1.5">
                {highlightColors.map((h) => (
                  <button
                    key={h.value}
                    type="button"
                    onClick={() => {
                      onFormatText?.("highlight", h.value);
                      setShowHighlightMenu(false);
                    }}
                    title={h.name}
                    className="w-6 h-6 rounded border border-black/10 flex items-center justify-center hover:scale-110 transition-transform"
                    style={{ backgroundColor: h.value }}
                  >
                    {h.value === "transparent" && <Minus className="w-3 h-3 text-red-500" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-4 bg-[#B4B9C2] mx-1" />

        {/* Insert Link & Image & Table */}
        <button
          type="button"
          onClick={() => onFormatText?.("link")}
          className="p-1.5 rounded hover:bg-black/5 transition-colors"
          title="Chèn đường liên kết (Ctrl+K)"
        >
          <Link2 className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => onInsertBlock("image")}
          className="p-1.5 rounded hover:bg-black/5 transition-colors"
          title="Chèn hình ảnh (Hoặc copy ảnh bấm Ctrl+V vào trang)"
        >
          <ImageIcon className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => onInsertTable ? onInsertTable(3, 3) : onInsertBlock("table")}
          className="p-1.5 rounded hover:bg-black/5 transition-colors"
          title="Chèn bảng biểu (Table 3x3)"
        >
          <TableIcon className="w-4 h-4" />
        </button>

        <div className="w-px h-4 bg-[#B4B9C2] mx-1" />

        {/* Alignment */}
        <button
          type="button"
          onClick={() => onFormatText?.("color")}
          className="p-1.5 rounded hover:bg-black/5 transition-colors"
          title="Căn trái"
        >
          <AlignLeft className="w-4 h-4" />
        </button>

        <button
          type="button"
          className="p-1.5 rounded hover:bg-black/5 transition-colors hidden sm:block"
          title="Căn giữa"
        >
          <AlignCenter className="w-4 h-4" />
        </button>

        <button
          type="button"
          className="p-1.5 rounded hover:bg-black/5 transition-colors hidden sm:block"
          title="Căn phải"
        >
          <AlignRight className="w-4 h-4" />
        </button>

        <div className="w-px h-4 bg-[#B4B9C2] mx-1" />

        {/* Checklist, Bullet List, Numbered List */}
        <button
          type="button"
          onClick={() => onInsertBlock("list", { listType: "checklist", items: [{ checked: false, text: "Việc cần thực hiện..." }] })}
          className="p-1.5 rounded hover:bg-black/5 transition-colors text-[#1A73E8]"
          title="Danh sách kiểm tra (Checklist)"
        >
          <ListChecks className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => onInsertBlock("list", { listType: "bullet" })}
          className="p-1.5 rounded hover:bg-black/5 transition-colors"
          title="Danh sách dấu đầu dòng"
        >
          <List className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => onInsertBlock("list", { listType: "numbered" })}
          className="p-1.5 rounded hover:bg-black/5 transition-colors"
          title="Danh sách đánh số thứ tự"
        >
          <ListOrdered className="w-4 h-4" />
        </button>

        <div className="w-px h-4 bg-[#B4B9C2] mx-1" />

        {/* More Blocks Dropdown (Quote, Section, Divider, Zalo CTA) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowInsertMenu(!showInsertMenu)}
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-black/5 text-xs font-semibold text-[#1A73E8] transition-colors"
            title="Chèn các khối đặc biệt"
          >
            <span>+ Chèn khối</span>
            <ChevronDown className="w-3 h-3" />
          </button>

          {showInsertMenu && (
            <div className="absolute top-full right-0 mt-1 w-52 bg-white border border-[#DADCE0] rounded-lg shadow-xl z-50 py-1 text-xs">
              <button
                type="button"
                onClick={() => {
                  onInsertBlock("quote");
                  setShowInsertMenu(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-[#F1F3F4] flex items-center gap-2.5 text-[#1F1F1F]"
              >
                <Quote className="w-4 h-4 text-[#C5A059]" />
                <span>Trích dẫn nghệ nhân</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onInsertBlock("section");
                  setShowInsertMenu(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-[#F1F3F4] flex items-center gap-2.5 text-[#1F1F1F]"
              >
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Hộp điểm nhấn phong thủy</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onInsertBlock("divider");
                  setShowInsertMenu(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-[#F1F3F4] flex items-center gap-2.5 text-[#1F1F1F]"
              >
                <Minus className="w-4 h-4 text-[#70757A]" />
                <span>Đường kẻ ngang phân cách</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onInsertBlock("button", { label: "Nhắn Zalo Nhận Tư Vấn Trực Tiếp", url: "https://zalo.me/0968888972", buttonStyle: "zalo" });
                  setShowInsertMenu(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-[#F1F3F4] flex items-center gap-2.5 text-[#0068FF] font-medium"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Nút kêu gọi Zalo</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GoogleDocsToolbar;
