"use client";

import React, { useState, useRef, useEffect } from "react";
import { EditorBlock, BlockType, createDefaultBlock } from "@/lib/blockEditor";
import { BlockCard } from "./BlockCard";
import { Plus } from "lucide-react";
import { toast } from "@/components/ui/Toast";

export interface VisualBlockEditorProps {
  blocks: EditorBlock[];
  onChange: (blocks: EditorBlock[]) => void;
}

export function VisualBlockEditor({ blocks, onChange }: VisualBlockEditorProps) {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [dragFromIndex, setDragFromIndex] = useState<number | null>(null);
  const [dropIndicatorIndex, setDropIndicatorIndex] = useState<number | null>(null);
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

  const handleInsertBelow = (index: number, type: BlockType = "text") => {
    const newBlock = createDefaultBlock(type);
    if (index === -1) {
      // Chèn lên đầu tiên (Top)
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
  // Dán / kéo thả ảnh trực tiếp vào bài viết
  // ═══════════════════════════════════════════════════════
  const handleImageUpload = async (file: File, insertAtIndex: number) => {
    if (!file.type.startsWith("image/")) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Ảnh quá lớn", "Vui lòng chọn ảnh dưới 10MB");
      return;
    }

    // Tạo block ảnh tạm (placeholder) ngay lập tức
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
        // Tìm block placeholder theo ID rồi cập nhật URL thật
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
      // Xóa block placeholder nếu upload thất bại
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
    if (dragFromIndex !== null) return; // Đang kéo thả block, không phải file
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find((f) => f.type.startsWith("image/"));
    if (imageFile) {
      e.preventDefault();
      e.stopPropagation();
      const insertAt = focusedIndex !== null ? focusedIndex : blocks.length - 1;
      handleImageUpload(imageFile, insertAt);
    }
  };

  // Kiểm tra xem vị trí thả có phải là no-op (thả lại chỗ cũ) không
  const isNoopDrop =
    dragFromIndex !== null &&
    (dropIndicatorIndex === dragFromIndex ||
      dropIndicatorIndex === dragFromIndex + 1);

  return (
    <div
      ref={editorRef}
      className="relative pb-20"
      onPaste={handlePaste}
      onDragOver={(e) => {
        if (dragFromIndex === null && e.dataTransfer.types.includes("Files")) {
          e.preventDefault();
        }
      }}
      onDrop={handleFileDrop}
    >
      {/* Vùng chèn khối ở đầu bài — hiện nút + khi hover */}
      <div className="group/top flex items-center justify-center py-3 -mt-2">
        <button
          type="button"
          onClick={() => handleInsertBelow(-1)}
          className="opacity-0 group-hover/top:opacity-100 p-1.5 text-text-muted/40 hover:text-[#C5A059] hover:bg-[#C5A059]/10 rounded-md transition-all"
          title="Thêm khối ở đầu bài viết"
          aria-label="Thêm khối ở đầu bài viết"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Danh sách khối */}
      {blocks.map((block, idx) => (
        <React.Fragment key={block.id}>
          {/* Chỉ báo vị trí thả (drop indicator) */}
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
              onInsertBelow={() => handleInsertBelow(idx)}
              onDelete={() => handleDelete(idx)}
              onDuplicate={() => handleDuplicate(idx)}
              onFocusPrevious={() => setFocusedIndex(Math.max(0, idx - 1))}
              onFocus={() => setFocusedIndex(idx)}
              onDragStart={() => setDragFromIndex(idx)}
              onDragEnd={handleBlockDragEnd}
              isDragging={dragFromIndex === idx}
            />
          </div>
        </React.Fragment>
      ))}

      {/* Chỉ báo vị trí thả ở cuối danh sách */}
      {dragFromIndex !== null && dropIndicatorIndex === blocks.length && !isNoopDrop && (
        <div className="h-[3px] bg-[#C5A059] rounded-full mx-6 my-1 transition-all shadow-sm shadow-[#C5A059]/30" />
      )}

      {/* Nút thêm khối cuối bài — nhẹ nhàng, dạng dashed */}
      <div className="flex items-center justify-center pt-8 pb-4">
        <button
          type="button"
          onClick={() => handleInsertBelow(blocks.length - 1)}
          className="flex items-center gap-1.5 px-4 py-2 text-[13px] text-text-muted/50 hover:text-[#C5A059] hover:bg-[#C5A059]/5 border border-dashed border-transparent hover:border-[#C5A059]/30 rounded-lg transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          Thêm khối tại đây
        </button>
      </div>
    </div>
  );
}
