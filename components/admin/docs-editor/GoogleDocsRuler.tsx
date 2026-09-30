"use client";

import React from "react";

export function GoogleDocsRuler() {
  const units = Array.from({ length: 18 }, (_, i) => i + 1);

  return (
    <div className="w-full bg-[#EDF2FA] border-b border-[#E1E5EA] select-none py-1 overflow-x-auto hidden sm:block">
      <div className="max-w-[850px] mx-auto relative px-8 flex items-center h-4">
        {/* Left Margin Indicator (Google Docs Blue cursor) */}
        <div 
          className="absolute left-8 top-0 flex flex-col items-center z-10 cursor-ew-resize group"
          title="Lề trái: 2.5cm"
        >
          <div className="w-2.5 h-1 bg-[#1A73E8] rounded-t-sm" />
          <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-[#1A73E8]" />
        </div>

        {/* Ruler Track */}
        <div className="w-full flex items-center justify-between border-t border-[#B4B9C2] relative pt-0.5">
          {units.map((num) => (
            <div key={num} className="relative flex-1 flex flex-col items-center">
              {/* Main Number Tick */}
              <div className="w-px h-2 bg-[#70757A] -mt-1" />
              <span className="text-[9px] font-sans font-medium text-[#5F6368] leading-none mt-0.5">
                {num}
              </span>
              
              {/* Quarter ticks */}
              <div className="absolute left-1/4 top-0 w-px h-1 bg-[#B4B9C2] -mt-0.5" />
              <div className="absolute left-1/2 top-0 w-px h-1.5 bg-[#9AA0A6] -mt-0.5" />
              <div className="absolute left-3/4 top-0 w-px h-1 bg-[#B4B9C2] -mt-0.5" />
            </div>
          ))}
        </div>

        {/* Right Margin Indicator (Google Docs Blue cursor) */}
        <div 
          className="absolute right-8 top-0 flex flex-col items-center z-10 cursor-ew-resize group"
          title="Lề phải: 2.5cm"
        >
          <div className="w-2.5 h-1 bg-[#1A73E8] rounded-t-sm" />
          <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-[#1A73E8]" />
        </div>
      </div>
    </div>
  );
}

export default GoogleDocsRuler;
