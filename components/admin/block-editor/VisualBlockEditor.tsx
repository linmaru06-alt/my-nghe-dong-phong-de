"use client";

import React, { useState } from "react";
import { EditorBlock, BlockType, createDefaultBlock } from "@/lib/blockEditor";
import { BlockCard } from "./BlockCard";
import { HoverDropzone } from "./HoverDropzone";
import { BlockPickerModal } from "./BlockPickerModal";
import { Plus } from "lucide-react";

export interface VisualBlockEditorProps {
  blocks: EditorBlock[];
  onChange: (blocks: EditorBlock[]) => void;
}

export function VisualBlockEditor({ blocks, onChange }: VisualBlockEditorProps) {
  const [pickerIndex, setPickerIndex] = useState<number | null>(null);

  const handleOpenPicker = (index: number) => {
    setPickerIndex(index);
  };

  const handleClosePicker = () => {
    setPickerIndex(null);
  };

  const handleSelectBlock = (type: BlockType) => {
    if (pickerIndex === null) return;

    const newBlock = createDefaultBlock(type);
    const updated = [...blocks];
    updated.splice(pickerIndex, 0, newBlock);
    onChange(updated);
    setPickerIndex(null);
  };

  const handleUpdate = (index: number, data: Record<string, any>) => {
    const updated = [...blocks];
    updated[index] = { ...updated[index], data };
    onChange(updated);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...blocks];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    onChange(updated);
  };

  const handleMoveDown = (index: number) => {
    if (index === blocks.length - 1) return;
    const updated = [...blocks];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    onChange(updated);
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
      // Giữ lại ít nhất 1 khối
      onChange([createDefaultBlock("text")]);
      return;
    }
    const updated = blocks.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="space-y-1">
      {/* 1. Điểm chèn ở đầu bài viết */}
      <HoverDropzone
        isFirst={true}
        label="+ Thêm khối ở đầu bài viết"
        onOpenPicker={() => handleOpenPicker(0)}
      />

      {/* 2. Danh sách các khối */}
      {blocks.map((block, idx) => (
        <React.Fragment key={block.id || idx}>
          <BlockCard
            block={block}
            index={idx}
            total={blocks.length}
            onUpdate={(data) => handleUpdate(idx, data)}
            onMoveUp={() => handleMoveUp(idx)}
            onMoveDown={() => handleMoveDown(idx)}
            onDuplicate={() => handleDuplicate(idx)}
            onDelete={() => handleDelete(idx)}
          />

          {/* Điểm chèn di chuột giữa các khối */}
          <HoverDropzone
            label="+ Thêm khối tại đây"
            onOpenPicker={() => handleOpenPicker(idx + 1)}
          />
        </React.Fragment>
      ))}

      {/* Empty State nếu không có khối */}
      {blocks.length === 0 && (
        <div className="p-8 border-2 border-dashed border-border rounded-card text-center bg-bg/40">
          <p className="text-sm text-text-muted mb-3">Bài viết hiện chưa có khối nào.</p>
          <button
            type="button"
            onClick={() => handleOpenPicker(0)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-btn bg-primary text-white text-xs font-semibold hover:bg-primary-hover shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm khối đầu tiên</span>
          </button>
        </div>
      )}

      {/* 3. Modal chọn 12 khối khi bấm dấu (+) */}
      <BlockPickerModal
        isOpen={pickerIndex !== null}
        onClose={handleClosePicker}
        onSelectBlock={handleSelectBlock}
      />
    </div>
  );
}
