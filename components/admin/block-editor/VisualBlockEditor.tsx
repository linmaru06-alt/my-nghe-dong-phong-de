"use client";

import React, { useState, useRef, useEffect } from "react";
import { EditorBlock, BlockType, createDefaultBlock } from "@/lib/blockEditor";
import { BlockCard } from "./BlockCard";

export interface VisualBlockEditorProps {
  blocks: EditorBlock[];
  onChange: (blocks: EditorBlock[]) => void;
}

export function VisualBlockEditor({ blocks, onChange }: VisualBlockEditorProps) {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

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
       data: { ...defaultBlock.data, ...data } 
    };
    onChange(updated);
  };

  const handleInsertBelow = (index: number, type: BlockType = "text") => {
    const newBlock = createDefaultBlock(type);
    let updated = [...blocks];
    
    if (index === -1) {
      // Chèn lên đầu tiên (Top)
      updated = [newBlock, ...blocks];
      onChange(updated);
      setFocusedIndex(0);
    } else {
      // Chèn vào vị trí được chỉ định
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

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...blocks];
    [updated[index], updated[index - 1]] = [updated[index - 1], updated[index]];
    onChange(updated);
  };

  const handleMoveDown = (index: number) => {
    if (index === blocks.length - 1) return;
    const updated = [...blocks];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    onChange(updated);
  };

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, position: number) => {
    dragItem.current = position;
    setIsDragging(true);
    // Needed for Firefox
    if (e.dataTransfer) {
       e.dataTransfer.effectAllowed = "move";
       e.dataTransfer.setData("text/html", e.currentTarget.innerHTML);
    }
  };

  const handleDragEnter = (e: React.DragEvent, position: number) => {
    dragOverItem.current = position;
    // We could force a re-render here to show the drop indicator, 
    // but Native HTML5 DND handles visual feedback okay enough.
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (dragItem.current !== null && dragOverItem.current !== null && dragItem.current !== dragOverItem.current) {
      const newBlocks = [...blocks];
      const draggedItemContent = newBlocks[dragItem.current];
      newBlocks.splice(dragItem.current, 1);
      newBlocks.splice(dragOverItem.current, 0, draggedItemContent);
      onChange(newBlocks);
    }
    dragItem.current = null;
    dragOverItem.current = null;
    setIsDragging(false);
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="relative flex items-center justify-center my-6">
         <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#C5A059]/30"></div>
         </div>
         <button type="button" onClick={() => handleInsertBelow(-1)} className="relative flex items-center gap-1.5 px-4 py-1.5 bg-[#C5A059] text-white text-[13px] font-semibold rounded-full hover:bg-[#b08d4f] transition-colors shadow-sm">
            <span className="text-white/80 font-normal">+</span> Thêm khối ở đầu bài viết
         </button>
      </div>      {blocks.map((block, idx) => (
        <BlockCard
          key={block.id}
          id={`block-${idx}`}
          block={block}
          index={idx}
          total={blocks.length}
          onUpdate={(data) => handleUpdate(idx, data)}
          onChangeType={(type, data) => handleChangeType(idx, type, data)}
          onInsertBelow={() => handleInsertBelow(idx)}
          onDelete={() => handleDelete(idx)}
          onDuplicate={() => handleDuplicate(idx)}
          onMoveUp={() => handleMoveUp(idx)}
          onMoveDown={() => handleMoveDown(idx)}
          onFocusPrevious={() => setFocusedIndex(Math.max(0, idx - 1))}
          // DND
          draggable
          onDragStart={(e) => handleDragStart(e, idx)}
          onDragEnter={(e) => handleDragEnter(e, idx)}
          onDragEnd={handleDragEnd}
          isDragOver={dragOverItem.current === idx}
        />
      ))}

      {/* Bottom Area to add new blocks easily */}
      <div className="relative flex items-center justify-center mt-8 mb-12">
         <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#C5A059]/30"></div>
         </div>
         <button type="button" onClick={() => handleInsertBelow(blocks.length - 1)} className="relative flex items-center gap-1.5 px-4 py-1.5 bg-[#C5A059] text-white text-[13px] font-semibold rounded-full hover:bg-[#b08d4f] transition-colors shadow-sm">
            <span className="text-white/80 font-normal">+</span> Thêm khối tại đây
         </button>
      </div>
    </div>
  );
}
