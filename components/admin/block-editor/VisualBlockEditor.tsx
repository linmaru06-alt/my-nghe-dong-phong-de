"use client";

import React, { useState, useRef, useEffect } from "react";
import { EditorBlock, BlockType, createDefaultBlock } from "@/lib/blockEditor";
import { BlockCard } from "./BlockCard";
import { BlockPickerModal } from "./BlockPickerModal";
import { Plus } from "lucide-react";
import { toast } from "@/components/ui/Toast";

export interface VisualBlockEditorProps {
  blocks: EditorBlock[];
  onChange: (blocks: EditorBlock[]) => void;
}

// ═══════════════════════════════════════════════════════
// Squarespace Insertion Point Component
// Đường kẻ ngang xuất hiện nút (+) tròn khi hover
// ═══════════════════════════════════════════════════════
interface SquarespaceInsertLineProps {
  onInsertClick: () => void;
  label?: string;
  isFirst?: boolean;
}

function SquarespaceInsertLine({
  onInsertClick,
  label = "Chèn khối",
  isFirst = false,
}: SquarespaceInsertLineProps) {
  return (
    <div
      className={`group/insert relative py-2.5 z-10 transition-all ${
        isFirst ? "my-0" : "-my-2.5"
      }`}
    >
      {/* Đường kẻ và nút tròn (+) nổi bật khi hover */}
      <div className="relative flex items-center justify-center">
        {/* Đường dẫn hướng ngang */}
        <div className="absolute inset-x-0 h-[1.5px] bg-transparent group-hover/insert:bg-[#C5A059]/40 transition-colors duration-150" />

        {/* Nút tròn (+) phong cách Squarespace */}
        <button
          type="button"
          onClick={onInsertClick}
          className="relative opacity-0 group-hover/insert:opacity-100 w-6 h-6 rounded-full bg-white border border-[#C5A059] text-[#3D2314] hover:bg-[#3D2314] hover:text-[#C5A059] flex items-center justify-center shadow-sm transition-all duration-150 transform scale-75 group-hover/insert:scale-100 hover:scale-110 focus:opacity-100"
          title={`Thêm khối (${label})`}
          aria-label={`Thêm khối (${label})`}
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
}

export function VisualBlockEditor({ blocks, onChange }: VisualBlockEditorProps) {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [dragFromIndex, setDragFromIndex] = useState<number | null>(null);
  const [dropIndicatorIndex, setDropIndicatorIndex] = useState<number | null>(null);
  
  // Quản lý Modal Squarespace Block Palette
  const [pickerOpen, setPickerOpen] = useState(false);
  const [insertTargetIndex, setInsertTargetIndex] = useState<number>(-1);

  const editorRef = useRef<HTMLDivElement>(null);
  const blocksRef = useRef(blocks);

  useEffect(() => {
    blocksRef.current = blocks;
  }, [blocks]);

  // Focus management
  useEffect(() => {
    if (focusedIndex !== null) {
      const el = document.getElementById(`block-${focusedIndex}`);
      if (el) {
        const input = el.querySelector("textarea, input") as HTMLElement;
        if (input) input.focus();
      }
    }
  }, [focusedIndex]);

  const handleUpdate = (index: number, data: Record<string, any>) => {
    const updated = [...blocks];
    updated[index] = { ...updated[index], data };
    onChange(updated);
  };

  const handleChangeType = (index: number, type: BlockType, data?: any) => {
    const updated = [...blocks];
    const defaultBlock = createDefaultBlock(type);
    updated[index] = {
      ...updated[index],
      type,
      data: { ...defaultBlock.data, ...data },
    };
    onChange(updated);
  };

  // Mở Squarespace Block Picker tại vị trí chỉ định
  const handleOpenPicker = (index: number) => {
    setInsertTargetIndex(index);
    setPickerOpen(true);
  };

  // Chèn block được chọn từ picker
  const handleSelectBlockFromPicker = (type: BlockType) => {
    const newBlock = createDefaultBlock(type);
    if (insertTargetIndex === -1) {
      onChange([newBlock, ...blocks]);
      setFocusedIndex(0);
    } else {
      const updated = [...blocks];
      updated.splice(insertTargetIndex + 1, 0, newBlock);
      onChange(updated);
      setFocusedIndex(insertTargetIndex + 1);
    }
    setPickerOpen(false);
  };

  const handleInsertBelow = (index: number, type: BlockType = "text") => {
    const newBlock = createDefaultBlock(type);
    if (index === -1) {
      onChange([newBlock, ...blocks]);
      setFocusedIndex(0);
    } else {
      const updated = [...blocks];
      updated.splice(index + 1, 0, newBlock);
      onChange(updated);
      setFocusedIndex(index + 1);
    }
  };

  const handleDuplicate = (index: number) => {
    const target = blocks[index];
    const clone: EditorBlock = {
      ...target,
      id: "b_" + Math.random().toString(36).substring(2, 9),
      data: JSON.parse(JSON.stringify(target.data)),
    };
    const updated = [...blocks];
    updated.splice(index + 1, 0, clone);
    onChange(updated);
  };

  const handleDelete = (index: number) => {
    if (blocks.length <= 1) {
      onChange([createDefaultBlock("text")]);
      return;
    }
    const updated = blocks.filter((_, i) => i !== index);
    onChange(updated);
    if (index > 0) {
      setFocusedIndex(index - 1);
    }
  };

  // ═══════════════════════════════════════════════════════
  // Drag and Drop — chỉ báo vị trí thả (drop indicator)
  // ═══════════════════════════════════════════════════════
  const handleBlockDragOver = (e: React.DragEvent, index: number) => {
    if (dragFromIndex === null) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    const rect = e.currentTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const newIndicator = e.clientY < midY ? index : index + 1;

    if (newIndicator !== dropIndicatorIndex) {
      setDropIndicatorIndex(newIndicator);
    }
  };

  const handleBlockDragEnd = () => {
    if (
      dragFromIndex !== null &&
      dropIndicatorIndex !== null &&
      dropIndicatorIndex !== dragFromIndex &&
      dropIndicatorIndex !== dragFromIndex + 1
    ) {
      const updated = [...blocks];
      const [moved] = updated.splice(dragFromIndex, 1);
      const adjustedIndex =
        dropIndicatorIndex > dragFromIndex
          ? dropIndicatorIndex - 1
          : dropIndicatorIndex;
      updated.splice(adjustedIndex, 0, moved);
      onChange(updated);
    }
    setDragFromIndex(null);
    setDropIndicatorIndex(null);
  };

  // ═══════════════════════════════════════════════════════
  // Dán / kéo thả ảnh trực tiếp
  // ═══════════════════════════════════════════════════════
  const handleImageUpload = async (file: File, insertAtIndex: number) => {
    if (!file.type.startsWith("image/")) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Ảnh quá lớn", "Vui lòng chọn ảnh dưới 10MB");
      return;
    }

    const imageBlock = createDefaultBlock("image");
    const blockId = imageBlock.id;
    imageBlock.data._uploading = true;
    imageBlock.data.url = "";
    imageBlock.data.alt = file.name;

    const updated = [...blocksRef.current];
    updated.splice(insertAtIndex + 1, 0, imageBlock);
    onChange(updated);

    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "blog");

      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const json = await res.json();

      if (res.ok && json.success && json.url) {
        const current = blocksRef.current;
        const idx = current.findIndex((b) => b.id === blockId);
        if (idx !== -1) {
          const updatedBlocks = [...current];
          updatedBlocks[idx] = {
            ...updatedBlocks[idx],
            data: { ...updatedBlocks[idx].data, url: json.url, _uploading: false },
          };
          onChange(updatedBlocks);
        }
        toast.success("Tải ảnh thành công");
      } else {
        throw new Error(json.error || "Không thể tải ảnh");
      }
    } catch (err: any) {
      const current = blocksRef.current;
      onChange(current.filter((b) => b.id !== blockId));
      toast.error("Lỗi tải ảnh", err.message);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const files = Array.from(e.clipboardData.files);
    const imageFile = files.find((f) => f.type.startsWith("image/"));
    if (imageFile) {
      e.preventDefault();
      const insertAt = focusedIndex !== null ? focusedIndex : blocks.length - 1;
      handleImageUpload(imageFile, insertAt);
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    if (dragFromIndex !== null) return;
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find((f) => f.type.startsWith("image/"));
    if (imageFile) {
      e.preventDefault();
      e.stopPropagation();
      const insertAt = focusedIndex !== null ? focusedIndex : blocks.length - 1;
      handleImageUpload(imageFile, insertAt);
    }
  };

  const isNoopDrop =
    dragFromIndex !== null &&
    (dropIndicatorIndex === dragFromIndex ||
      dropIndicatorIndex === dragFromIndex + 1);

  return (
    <div
      ref={editorRef}
      className="relative pb-24"
      onPaste={handlePaste}
      onDragOver={(e) => {
        if (dragFromIndex === null && e.dataTransfer.types.includes("Files")) {
          e.preventDefault();
        }
      }}
      onDrop={handleFileDrop}
    >
      {/* Điểm chèn đầu bài viết (Squarespace Insertion Point - Top) */}
      <SquarespaceInsertLine
        isFirst={true}
        label="đầu bài"
        onInsertClick={() => handleOpenPicker(-1)}
      />

      {/* Danh sách khối */}
      {blocks.map((block, idx) => (
        <React.Fragment key={block.id}>
          {/* Chỉ báo vị trí thả khi kéo (Drop Indicator) */}
          {dragFromIndex !== null && dropIndicatorIndex === idx && !isNoopDrop && (
            <div className="h-[3px] bg-[#C5A059] rounded-full mx-6 my-1 transition-all shadow-sm shadow-[#C5A059]/30" />
          )}

          <div onDragOver={(e) => handleBlockDragOver(e, idx)}>
            <BlockCard
              id={`block-${idx}`}
              block={block}
              index={idx}
              total={blocks.length}
              onUpdate={(data) => handleUpdate(idx, data)}
              onChangeType={(type, data) => handleChangeType(idx, type, data)}
              onInsertBelow={() => handleOpenPicker(idx)}
              onDelete={() => handleDelete(idx)}
              onDuplicate={() => handleDuplicate(idx)}
              onFocusPrevious={() => setFocusedIndex(Math.max(0, idx - 1))}
              onFocus={() => setFocusedIndex(idx)}
              onDragStart={() => setDragFromIndex(idx)}
              onDragEnd={handleBlockDragEnd}
              isDragging={dragFromIndex === idx}
            />
          </div>

          {/* Điểm chèn giữa các khối (Squarespace Insertion Point) */}
          <SquarespaceInsertLine
            label={`sau khối ${idx + 1}`}
            onInsertClick={() => handleOpenPicker(idx)}
          />
        </React.Fragment>
      ))}

      {/* Chỉ báo vị trí thả ở cuối danh sách */}
      {dragFromIndex !== null && dropIndicatorIndex === blocks.length && !isNoopDrop && (
        <div className="h-[3px] bg-[#C5A059] rounded-full mx-6 my-1 transition-all shadow-sm shadow-[#C5A059]/30" />
      )}

      {/* Nút thêm khối cuối bài phong cách Squarespace */}
      <div className="flex items-center justify-center pt-8 pb-4">
        <button
          type="button"
          onClick={() => handleOpenPicker(blocks.length - 1)}
          className="flex items-center gap-2 px-5 py-2.5 text-[13px] font-medium text-[#5C3A21] hover:text-[#3D2314] hover:bg-[#C5A059]/10 border border-[#C5A059]/40 hover:border-[#C5A059] rounded-xl transition-all shadow-xs"
        >
          <Plus className="w-4 h-4 text-[#C5A059]" />
          <span>Thêm khối nội dung (Add Block)</span>
        </button>
      </div>

      {/* Squarespace Block Palette Flyout Modal */}
      <BlockPickerModal
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelectBlock={handleSelectBlockFromPicker}
        insertPositionName={
          insertTargetIndex === -1
            ? "Đầu bài viết"
            : `Vị trí sau khối #${insertTargetIndex + 1}`
        }
      />
    </div>
  );
}

export default VisualBlockEditor;
