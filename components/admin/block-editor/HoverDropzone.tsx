"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";

export interface HoverDropzoneProps {
  onOpenPicker: () => void;
  label?: string;
  isFirst?: boolean;
}

export function HoverDropzone({
  onOpenPicker,
  label = "Thêm khối tại đây",
  isFirst = false,
}: HoverDropzoneProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative py-2 my-1 transition-all group select-none"
    >
      {/* Invisible larger hit area for smooth hover */}
      <div className="absolute inset-0 cursor-pointer" onClick={onOpenPicker} />

      {/* Visual Line & Button */}
      <div
        className={`flex items-center justify-center transition-all duration-200 ${
          isHovered
            ? "opacity-100 scale-100"
            : isFirst
            ? "opacity-60 hover:opacity-100"
            : "opacity-0 hover:opacity-100"
        }`}
      >
        {/* Left Line */}
        <div
          className={`flex-1 h-[2px] transition-colors ${
            isHovered ? "bg-accent-gold" : "bg-border/60"
          }`}
        />

        {/* Plus Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenPicker();
          }}
          className={`relative z-10 mx-3 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shadow-xs transition-all active:scale-95 ${
            isHovered
              ? "bg-accent-gold text-white shadow-md scale-105"
              : "bg-surface text-text-muted border border-border"
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{label}</span>
        </button>

        {/* Right Line */}
        <div
          className={`flex-1 h-[2px] transition-colors ${
            isHovered ? "bg-accent-gold" : "bg-border/60"
          }`}
        />
      </div>
    </div>
  );
}
