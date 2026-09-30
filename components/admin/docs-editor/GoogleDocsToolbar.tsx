"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Cloud,
  CloudUpload,
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
  ChevronDown,
  Settings,
  Eye,
  Send,
  Loader2,
  Sparkles,
  Quote,
  Minus,
  MessageCircle,
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

  // Real Editor Functional Actions
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onFormatText: (format: "bold" | "italic" | "underline" | "strike" | "link" | "highlight" | "color", value?: string) => void;
  onChangeActiveBlockType: (type: BlockType, level?: number) => void;
  onConvertToList: (listType: "checklist" | "bullet" | "numbered") => void;
  onAlignText: (align: "left" | "center" | "right" | "justify") => void;
  onInsertTable: (rows?: number, cols?: number) => void;
  onTriggerImageUpload: () => void;
  onInsertBlock: (type: BlockType, data?: any) => void;
  currentStyle: string;
  fontSize: number;
  onFontSizeChange: (delta: number) => void;
  zoom: string;
  onZoomChange: (newZoom: string) => void;
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
  canUndo,
  canRedo,
  onFormatText,
  onChangeActiveBlockType,
  onConvertToList,
  onAlignText,
  onInsertTable,
  onTriggerImageUpload,
  onInsertBlock,
  currentStyle,
  fontSize,
  onFontSizeChange,
  zoom,
  onZoomChange,
}: GoogleDocsToolbarProps) {
  const [showStyleMenu, setShowStyleMenu] = useState(false);
  const [showColorMenu, setShowColorMenu] = useState(false);
  const [showHighlightMenu, setShowHighlightMenu] = useState(false);
  const [showInsertMenu, setShowInsertMenu] = useState(false);
  const [showZoomMenu, setShowZoomMenu] = useState(false);
  const [showAlignMenu, setShowAlignMenu] = useState(false);

  const textColors = [
    { name: "Đen mộc tiêu chuẩn", value: "#1F1610" },
    { name: "Nâu gỗ Đông Phong", value: "#3D2314" },
    { name: "Gỗ Trắc / Tử đàn", value: "#5C3A21" },
    { name: "Vàng đồng hoàng kim", value: "#C5A059" },
    { name: "Đỏ sưa phong thủy", value: "#B91C1C" },
    { name: "Xanh ngọc bách xanh", value: "#047857" },
    { name: "Xanh lam Google Docs", value: "#1A73E8" },
  ];

  const highlightColors = [
    { name: "Bỏ màu highlight", value: "transparent" },
    { name: "Vàng nhạt kinh điển", value: "#FEF08A" },
    { name: "Cam gỗ ấm", value: "#FED7AA" },
    { name: "Xanh ngọc dịu", value: "#A7F3D0" },
    { name: "Hồng hoàng gia", value: "#FBCFE8" },
    { name: "Xanh dương nhạt", value: "#BAE6FD" },
  ];

  const zoomLevels = ["75%", "90%", "100%", "125%", "150%"];

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
                <span className="flex items-center gap-1 text-amber-600 font-medium">
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
          onMouseDown={(e) => e.preventDefault()}
          onClick={onUndo}
          disabled={!canUndo}
          className="p-1.5 rounded hover:bg-black/5 disabled:opacity-30 transition-colors"
          title="Hoàn tác (Ctrl+Z)"
        >
          <Undo2 className="w-4 h-4" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={onRedo}
          disabled={!canRedo}
          className="p-1.5 rounded hover:bg-black/5 disabled:opacity-30 transition-colors"
          title="Làm lại (Ctrl+Y)"
        >
          <Redo2 className="w-4 h-4" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => window.print()}
          className="p-1.5 rounded hover:bg-black/5 transition-colors hidden md:block"
          title="In tài liệu (Ctrl+P)"
        >
          <Printer className="w-4 h-4" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onFormatText("bold")}
          className="p-1.5 rounded hover:bg-black/5 transition-colors hidden md:block"
          title="Sơn định dạng (In đậm)"
        >
          <Paintbrush className="w-4 h-4" />
        </button>

        {/* Zoom Selector Dropdown */}
        <div className="relative hidden lg:block">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setShowZoomMenu(!showZoomMenu)}
            className="flex items-center px-1.5 py-1 rounded hover:bg-black/5 text-xs font-medium gap-1 text-[#1F1F1F]"
            title="Thu phóng tài liệu"
          >
            <span>{zoom}</span>
            <ChevronDown className="w-3 h-3 text-[#70757A]" />
          </button>

          {showZoomMenu && (
            <div className="absolute top-full left-0 mt-1 w-24 bg-white border border-[#DADCE0] rounded-lg shadow-xl z-50 py-1 text-xs">
              {zoomLevels.map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onZoomChange(lvl);
                    setShowZoomMenu(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 hover:bg-[#F1F3F4] ${lvl === zoom ? "font-bold text-[#1A73E8]" : "text-[#1F1F1F]"}`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-px h-4 bg-[#B4B9C2] mx-1" />

        {/* Styles Dropdown (Văn bản thường / Tiêu đề 1 H2 / Tiêu đề 2 H3 / Tiêu đề 3 H4) */}
        <div className="relative">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setShowStyleMenu(!showStyleMenu)}
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-black/5 text-xs font-semibold text-[#1F1F1F] transition-colors"
            title="Định dạng kiểu văn bản"
          >
            <span className="w-28 text-left truncate">{currentStyle}</span>
            <ChevronDown className="w-3 h-3 text-[#70757A]" />
          </button>

          {showStyleMenu && (
            <div className="absolute top-full left-0 mt-1 w-52 bg-white border border-[#DADCE0] rounded-lg shadow-xl z-50 py-1.5 text-xs">
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChangeActiveBlockType("text");
                  setShowStyleMenu(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-[#F1F3F4] text-[#1F1F1F] flex items-center justify-between"
              >
                <span>Văn bản thường</span>
                <span className="text-[10px] text-[#70757A]">Normal</span>
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChangeActiveBlockType("heading", 2);
                  setShowStyleMenu(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-[#F1F3F4] text-[#3D2314] font-serif font-bold text-sm flex items-center justify-between border-t border-[#ECEFF3]"
              >
                <span>Tiêu đề 1 (H2)</span>
                <span className="text-[10px] text-[#70757A] font-sans font-normal">Mục lớn</span>
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChangeActiveBlockType("heading", 3);
                  setShowStyleMenu(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-[#F1F3F4] text-[#5C3A21] font-serif font-bold text-xs flex items-center justify-between"
              >
                <span>Tiêu đề 2 (H3)</span>
                <span className="text-[10px] text-[#70757A] font-sans font-normal">Mục con</span>
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChangeActiveBlockType("heading", 4);
                  setShowStyleMenu(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-[#F1F3F4] text-[#5C3A21] font-serif font-bold text-xs flex items-center justify-between"
              >
                <span>Tiêu đề 3 (H4)</span>
                <span className="text-[10px] text-[#70757A] font-sans font-normal">Mục nhỏ</span>
              </button>
            </div>
          )}
        </div>

        <div className="w-px h-4 bg-[#B4B9C2] mx-1" />

        {/* Font Family Display */}
        <div className="flex items-center px-2 py-1 rounded hover:bg-black/5 cursor-pointer text-xs font-medium gap-1 hidden xl:flex text-[#1F1F1F]">
          <span>Be Vietnam Pro</span>
          <ChevronDown className="w-3 h-3 text-[#70757A]" />
        </div>

        {/* Font Size controls */}
        <div className="flex items-center gap-0.5 bg-white/80 border border-[#DADCE0] rounded px-1 py-0.5 text-xs font-semibold">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onFontSizeChange(-1)}
            className="w-4 h-4 flex items-center justify-center hover:bg-black/5 rounded text-[#444746]"
            title="Giảm cỡ chữ"
          >
            -
          </button>
          <span className="w-5 text-center text-[#1F1F1F]">{fontSize}</span>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onFontSizeChange(1)}
            className="w-4 h-4 flex items-center justify-center hover:bg-black/5 rounded text-[#444746]"
            title="Tăng cỡ chữ"
          >
            +
          </button>
        </div>

        <div className="w-px h-4 bg-[#B4B9C2] mx-1" />

        {/* Bold, Italic, Underline */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onFormatText("bold")}
          className="p-1.5 rounded hover:bg-black/10 active:bg-[#D3E3FD] transition-colors"
          title="In đậm chữ đang chọn (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onFormatText("italic")}
          className="p-1.5 rounded hover:bg-black/10 active:bg-[#D3E3FD] transition-colors"
          title="In nghiêng chữ đang chọn (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onFormatText("underline")}
          className="p-1.5 rounded hover:bg-black/10 active:bg-[#D3E3FD] transition-colors"
          title="Gạch chân chữ đang chọn (Ctrl+U)"
        >
          <Underline className="w-4 h-4" />
        </button>

        {/* Text Color Dropdown */}
        <div className="relative">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setShowColorMenu(!showColorMenu)}
            className="p-1.5 rounded hover:bg-black/5 transition-colors flex flex-col items-center"
            title="Đổi màu chữ đang chọn"
          >
            <span className="font-bold text-xs leading-none">A</span>
            <div className="w-3.5 h-0.5 bg-[#3D2314] mt-0.5 rounded-full" />
          </button>

          {showColorMenu && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-[#DADCE0] rounded-lg shadow-xl z-50 p-2">
              <div className="text-[10px] font-semibold text-[#5F6368] uppercase mb-1.5">Màu chữ gỗ quý</div>
              <div className="space-y-1">
                {textColors.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      onFormatText("color", c.value);
                      setShowColorMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-2 py-1 text-xs hover:bg-[#F1F3F4] rounded text-left"
                  >
                    <span className="w-3.5 h-3.5 rounded-full border border-black/15 shadow-2xs" style={{ backgroundColor: c.value }} />
                    <span className="truncate text-[#1F1F1F]">{c.name}</span>
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
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setShowHighlightMenu(!showHighlightMenu)}
            className="p-1.5 rounded hover:bg-black/5 transition-colors"
            title="Đánh dấu nền (Highlight) cho chữ đang chọn"
          >
            <Highlighter className="w-4 h-4 text-[#D97706]" />
          </button>

          {showHighlightMenu && (
            <div className="absolute top-full left-0 mt-1 w-40 bg-white border border-[#DADCE0] rounded-lg shadow-xl z-50 p-2">
              <div className="text-[10px] font-semibold text-[#5F6368] uppercase mb-1.5">Màu nền highlight</div>
              <div className="grid grid-cols-6 gap-1.5">
                {highlightColors.map((h) => (
                  <button
                    key={h.value}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      onFormatText("highlight", h.value);
                      setShowHighlightMenu(false);
                    }}
                    title={h.name}
                    className="w-5 h-5 rounded border border-black/15 flex items-center justify-center hover:scale-110 transition-transform"
                    style={{ backgroundColor: h.value }}
                  >
                    {h.value === "transparent" && <Minus className="w-2.5 h-2.5 text-red-500" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-4 bg-[#B4B9C2] mx-1" />

        {/* Insert Link */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onFormatText("link")}
          className="p-1.5 rounded hover:bg-black/5 transition-colors"
          title="Chèn liên kết URL (Ctrl+K)"
        >
          <Link2 className="w-4 h-4" />
        </button>

        {/* Insert Image (Triggers File Picker) */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={onTriggerImageUpload}
          className="p-1.5 rounded hover:bg-black/5 transition-colors"
          title="Chọn ảnh từ máy tính (Hoặc dán ảnh Ctrl+V)"
        >
          <ImageIcon className="w-4 h-4" />
        </button>

        {/* Insert Table (3x3 Table) */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onInsertTable(3, 3)}
          className="p-1.5 rounded hover:bg-black/5 transition-colors"
          title="Chèn bảng biểu 3x3 vào bài viết"
        >
          <TableIcon className="w-4 h-4" />
        </button>

        <div className="w-px h-4 bg-[#B4B9C2] mx-1" />

        {/* Alignment Controls (Left, Center, Right, Justify) */}
        <div className="relative">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setShowAlignMenu(!showAlignMenu)}
            className="p-1.5 rounded hover:bg-black/5 transition-colors flex items-center gap-0.5"
            title="Căn lề khối văn bản"
          >
            <AlignLeft className="w-4 h-4" />
            <ChevronDown className="w-2.5 h-2.5 text-[#70757A]" />
          </button>

          {showAlignMenu && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-[#DADCE0] rounded-lg shadow-xl z-50 flex items-center p-1 gap-1">
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onAlignText("left");
                  setShowAlignMenu(false);
                }}
                className="p-1.5 hover:bg-[#F1F3F4] rounded"
                title="Căn trái"
              >
                <AlignLeft className="w-4 h-4 text-[#1F1F1F]" />
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onAlignText("center");
                  setShowAlignMenu(false);
                }}
                className="p-1.5 hover:bg-[#F1F3F4] rounded"
                title="Căn giữa"
              >
                <AlignCenter className="w-4 h-4 text-[#1F1F1F]" />
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onAlignText("right");
                  setShowAlignMenu(false);
                }}
                className="p-1.5 hover:bg-[#F1F3F4] rounded"
                title="Căn phải"
              >
                <AlignRight className="w-4 h-4 text-[#1F1F1F]" />
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onAlignText("justify");
                  setShowAlignMenu(false);
                }}
                className="p-1.5 hover:bg-[#F1F3F4] rounded"
                title="Căn đều hai bên"
              >
                <AlignJustify className="w-4 h-4 text-[#1F1F1F]" />
              </button>
            </div>
          )}
        </div>

        <div className="w-px h-4 bg-[#B4B9C2] mx-1" />

        {/* Checklist, Bullet List, Numbered List */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onConvertToList("checklist")}
          className="p-1.5 rounded hover:bg-black/5 transition-colors text-[#1A73E8]"
          title="Chuyển thành danh sách việc cần làm (Checklist)"
        >
          <ListChecks className="w-4 h-4" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onConvertToList("bullet")}
          className="p-1.5 rounded hover:bg-black/5 transition-colors"
          title="Chuyển thành danh sách dấu đầu dòng (Bullet)"
        >
          <List className="w-4 h-4" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onConvertToList("numbered")}
          className="p-1.5 rounded hover:bg-black/5 transition-colors"
          title="Chuyển thành danh sách đánh số (1, 2, 3)"
        >
          <ListOrdered className="w-4 h-4" />
        </button>

        <div className="w-px h-4 bg-[#B4B9C2] mx-1" />

        {/* More Blocks Dropdown (Quote, Section, Divider, Zalo CTA) */}
        <div className="relative">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setShowInsertMenu(!showInsertMenu)}
            className="flex items-center gap-1 px-2.5 py-1 rounded hover:bg-black/5 text-xs font-semibold text-[#1A73E8] transition-colors"
            title="Chèn các khối đặc biệt"
          >
            <span>+ Chèn khối</span>
            <ChevronDown className="w-3 h-3" />
          </button>

          {showInsertMenu && (
            <div className="absolute top-full right-0 mt-1 w-56 bg-white border border-[#DADCE0] rounded-xl shadow-2xl z-50 py-1.5 text-xs">
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onInsertBlock("quote");
                  setShowInsertMenu(false);
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-[#F1F3F4] flex items-center gap-2.5 text-[#1F1F1F]"
              >
                <Quote className="w-4 h-4 text-[#C5A059]" />
                <div>
                  <div className="font-semibold">Trích dẫn nghệ nhân</div>
                  <div className="text-[10px] text-[#70757A]">Danh ngôn & triết lý gỗ quý</div>
                </div>
              </button>

              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onInsertBlock("section");
                  setShowInsertMenu(false);
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-[#F1F3F4] flex items-center gap-2.5 text-[#1F1F1F]"
              >
                <Sparkles className="w-4 h-4 text-amber-600" />
                <div>
                  <div className="font-semibold">Hộp điểm nhấn phong thủy</div>
                  <div className="text-[10px] text-[#70757A]">Làm nổi bật kiến thức quan trọng</div>
                </div>
              </button>

              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onInsertBlock("divider");
                  setShowInsertMenu(false);
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-[#F1F3F4] flex items-center gap-2.5 text-[#1F1F1F]"
              >
                <Minus className="w-4 h-4 text-[#70757A]" />
                <div>
                  <div className="font-semibold">Đường kẻ ngang phân cách</div>
                  <div className="text-[10px] text-[#70757A]">Ngắt đoạn thẩm mỹ</div>
                </div>
              </button>

              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onInsertBlock("button", { label: "Nhắn Zalo Nhận Tư Vấn Trực Tiếp", url: "https://zalo.me/0968888972", buttonStyle: "zalo" });
                  setShowInsertMenu(false);
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-[#F1F3F4] flex items-center gap-2.5 text-[#0068FF] font-medium border-t border-[#ECEFF3]"
              >
                <MessageCircle className="w-4 h-4" />
                <div>
                  <div className="font-semibold">Nút kêu gọi Zalo</div>
                  <div className="text-[10px] text-[#70757A]">Chuyển đổi khách hàng tư vấn</div>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GoogleDocsToolbar;
