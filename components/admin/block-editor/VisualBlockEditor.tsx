
"use client";

import React, { useState, useEffect, useRef } from "react";
import { EditorBlock, BlockType, createDefaultBlock } from "@/lib/blockEditor";
import { BlockCard } from "./BlockCard";
import { BlockPickerModal } from "./BlockPickerModal";
import { Search } from "lucide-react";

export interface VisualBlockEditorProps {
  blocks: EditorBlock[];
  onChange: (blocks: EditorBlock[]) => void;
}

export function VisualBlockEditor({ blocks, onChange }: VisualBlockEditorProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [slashMenuOpen, setSlashMenuOpen] = useState<{ index: number; top: number; left: number } | null>(null);

  // Focus effect for new blocks
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Logic handle slash menu open on empty text block
      const target = e.target as HTMLTextAreaElement;
      if (target && target.tagName === "TEXTAREA" && e.key === "/" && target.value === "") {
        e.preventDefault();
        const rect = target.getBoundingClientRect();
        
        // Find index of block
        let blockIndex = -1;
        const blockElements = editorRef.current?.querySelectorAll("[data-block-index]");
        if (blockElements) {
          blockElements.forEach((el) => {
            if (el.contains(target)) {
              blockIndex = Number(el.getAttribute("data-block-index"));
            }
          });
        }
        
        if (blockIndex !== -1) {
          setSlashMenuOpen({ index: blockIndex, top: rect.bottom + window.scrollY, left: rect.left + window.scrollX });
        }
      }
      
      // Close slash menu on ESC
      if (e.key === "Escape") {
        setSlashMenuOpen(null);
      }
    };
    
    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => document.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);
  
  const handleUpdate = (index: number, data: Record<string, any>) => {
    const updated = [...blocks];
    updated[index] = { ...updated[index], data };
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
      onChange([createDefaultBlock("text")]);
      return;
    }
    const updated = blocks.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleInsertBelow = (index: number) => {
    const newBlock = createDefaultBlock("text");
    const updated = [...blocks];
    updated.splice(index + 1, 0, newBlock);
    onChange(updated);
    
    // Attempt focus on next render
    setTimeout(() => {
      const nextBlockEl = document.querySelector(`[data-block-index="${index + 1}"] textarea`) as HTMLTextAreaElement;
      if (nextBlockEl) {
        nextBlockEl.focus();
      }
    }, 50);
  };

  const handleChangeType = (index: number, type: BlockType) => {
    const updated = [...blocks];
    const newBlock = createDefaultBlock(type);
    updated[index] = { ...newBlock, id: updated[index].id };
    // Try to preserve text if possible
    if (updated[index].data && newBlock.data && type !== "image" && type !== "layout" && type !== "divider" && type !== "table") {
      updated[index].data.text = updated[index].data.text || "";
    }
    onChange(updated);
  };

  // Drag and Drop
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setDragImage(e.currentTarget as HTMLElement, 20, 20);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const updated = [...blocks];
    const [moved] = updated.splice(draggedIndex, 1);
    updated.splice(index, 0, moved);
    
    onChange(updated);
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-1 relative" ref={editorRef}>
      {blocks.length === 0 && (
        <div className="py-10 text-center opacity-50 cursor-pointer" onClick={() => handleInsertBelow(-1)}>
          Nh?p vào dây d? b?t d?u vi?t...
        </div>
      )}
      
      {blocks.map((block, idx) => (
        <div key={block.id || idx} data-block-index={idx}>
          <BlockCard
            block={block}
            index={idx}
            total={blocks.length}
            onUpdate={(data) => handleUpdate(idx, data)}
            onDuplicate={() => handleDuplicate(idx)}
            onDelete={() => handleDelete(idx)}
            onInsertBelow={() => handleInsertBelow(idx)}
            onChangeType={(type) => handleChangeType(idx, type)}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragEnd={handleDragEnd}
            isDragging={draggedIndex === idx}
          />
        </div>
      ))}
      
      {/* Slash Menu Popover */}
      {slashMenuOpen && (
        <div 
          className="fixed z-50 w-64 bg-white rounded-xl shadow-2xl border border-border overflow-hidden"
          style={{ top: slashMenuOpen.top + 10, left: slashMenuOpen.left }}
        >
           <div className="p-2 border-b border-border bg-bg/50">
             <div className="flex items-center gap-2 bg-surface border border-border px-2 py-1.5 rounded-lg">
               <Search className="w-4 h-4 text-text-muted" />
               <input type="text" placeholder="Tìm kh?i..." className="bg-transparent text-sm w-full focus:outline-none" autoFocus />
             </div>
           </div>
           <div className="max-h-64 overflow-y-auto p-1 py-2">
             <div className="px-3 pb-1 text-xs font-semibold text-text-muted uppercase">Kh?i co b?n</div>
             <button onClick={() => { handleChangeType(slashMenuOpen.index, "text"); setSlashMenuOpen(null); }} className="w-full text-left px-3 py-2 hover:bg-surface rounded-md text-sm text-text flex items-center gap-2">Ch? (Text)</button>
             <button onClick={() => { handleChangeType(slashMenuOpen.index, "heading"); handleUpdate(slashMenuOpen.index, {level: 2, text: ""}); setSlashMenuOpen(null); }} className="w-full text-left px-3 py-2 hover:bg-surface rounded-md text-sm text-text flex items-center gap-2">Tiêu d? (H2)</button>
             <button onClick={() => { handleChangeType(slashMenuOpen.index, "heading"); handleUpdate(slashMenuOpen.index, {level: 3, text: ""}); setSlashMenuOpen(null); }} className="w-full text-left px-3 py-2 hover:bg-surface rounded-md text-sm text-text flex items-center gap-2">Tiêu d? ph? (H3)</button>
             <button onClick={() => { handleChangeType(slashMenuOpen.index, "image"); setSlashMenuOpen(null); }} className="w-full text-left px-3 py-2 hover:bg-surface rounded-md text-sm text-text flex items-center gap-2">Hình ?nh</button>
             <button onClick={() => { handleChangeType(slashMenuOpen.index, "list"); setSlashMenuOpen(null); }} className="w-full text-left px-3 py-2 hover:bg-surface rounded-md text-sm text-text flex items-center gap-2">Danh sách</button>
             <button onClick={() => { handleChangeType(slashMenuOpen.index, "quote"); setSlashMenuOpen(null); }} className="w-full text-left px-3 py-2 hover:bg-surface rounded-md text-sm text-text flex items-center gap-2">Trích d?n</button>
             
             <div className="px-3 pt-3 pb-1 text-xs font-semibold text-text-muted uppercase">Giao di?n (Nâng cao)</div>
             <button onClick={() => { handleChangeType(slashMenuOpen.index, "layout"); setSlashMenuOpen(null); }} className="w-full text-left px-3 py-2 hover:bg-surface rounded-md text-sm text-text flex items-center gap-2">2 C?t song song</button>
             <button onClick={() => { handleChangeType(slashMenuOpen.index, "section"); setSlashMenuOpen(null); }} className="w-full text-left px-3 py-2 hover:bg-surface rounded-md text-sm text-text flex items-center gap-2">H?p n?i b?t</button>
             <button onClick={() => { handleChangeType(slashMenuOpen.index, "button"); setSlashMenuOpen(null); }} className="w-full text-left px-3 py-2 hover:bg-surface rounded-md text-sm text-text flex items-center gap-2">Nút hành d?ng (CTA)</button>
             <button onClick={() => { handleChangeType(slashMenuOpen.index, "table"); setSlashMenuOpen(null); }} className="w-full text-left px-3 py-2 hover:bg-surface rounded-md text-sm text-text flex items-center gap-2">B?ng so sánh</button>
             <button onClick={() => { handleChangeType(slashMenuOpen.index, "divider"); setSlashMenuOpen(null); }} className="w-full text-left px-3 py-2 hover:bg-surface rounded-md text-sm text-text flex items-center gap-2">Ðu?ng phân cách</button>
           </div>
        </div>
      )}
    </div>
  );
}

