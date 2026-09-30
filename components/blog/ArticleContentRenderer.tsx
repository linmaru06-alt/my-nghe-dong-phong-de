"use client";

import React, { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import {
  Sparkles,
  Quote,
  ShieldCheck,
  MessageCircle,
  Phone,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import { markdownToBlocks, EditorBlock } from "@/lib/blockEditor";

export interface ArticleContentRendererProps {
  content: string;
}

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

export function ArticleContentRenderer({ content }: ArticleContentRendererProps) {
  const blocks = useMemo<EditorBlock[]>(() => {
    return markdownToBlocks(content);
  }, [content]);

  return (
    <div className="space-y-6 text-[#1F1610] leading-relaxed">
      {blocks.map((block) => {
        switch (block.type) {
          case "header": {
            const headingId = slugifyHeading(block.data.title || "");
            return (
              <div
                key={block.id}
                id={headingId}
                className="my-8 pb-4 border-b border-[#C5A059]/40 scroll-mt-24"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-1.5 h-5 bg-[#C5A059] rounded-full inline-block" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#C5A059]">
                    Phần Trọng Tâm
                  </span>
                </div>
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#3D2314]">
                  {block.data.title}
                </h2>
                {block.data.subtitle && (
                  <p className="mt-2 text-sm md:text-base text-[#5A4A42] font-serif italic">
                    {block.data.subtitle}
                  </p>
                )}
              </div>
            );
          }

          case "heading": {
            const level = Number(block.data.level) || 2;
            const headingId = slugifyHeading(block.data.text || "");

            if (level === 2) {
              return (
                <h2
                  key={block.id}
                  id={headingId}
                  className="font-serif text-2xl md:text-3xl font-bold text-[#3D2314] mt-10 mb-4 pb-2 border-b border-border/70 scroll-mt-24"
                >
                  {block.data.text}
                </h2>
              );
            }
            if (level === 3) {
              return (
                <h3
                  key={block.id}
                  id={headingId}
                  className="font-serif text-xl md:text-2xl font-bold text-[#5C3A21] mt-8 mb-3 scroll-mt-24"
                >
                  {block.data.text}
                </h3>
              );
            }
            return (
              <h4
                key={block.id}
                id={headingId}
                className="font-serif text-lg font-bold text-[#5C3A21] mt-6 mb-2 scroll-mt-24"
              >
                {block.data.text}
              </h4>
            );
          }

          case "text": {
            return (
              <div key={block.id} className="prose prose-stone max-w-none text-[#2A160C] text-sm md:text-base leading-relaxed">
                <ReactMarkdown>{block.data.text || ""}</ReactMarkdown>
              </div>
            );
          }

          case "image": {
            if (!block.data.url) return null;
            return (
              <figure key={block.id} className="my-8 block text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={block.data.url}
                  alt={block.data.alt || "Ảnh bài viết Mỹ Nghệ Đông Phong"}
                  className="rounded-card max-w-full h-auto mx-auto shadow-md border border-border/80 object-cover"
                  loading="lazy"
                />
                {block.data.caption && (
                  <figcaption className="text-center text-xs md:text-sm text-[#5A4A42] mt-2.5 italic font-serif">
                    {block.data.caption}
                  </figcaption>
                )}
              </figure>
            );
          }

          case "layout": {
            const ratio = block.data.ratio || "50-50";
            let gridCols = "grid-cols-1 md:grid-cols-2";
            let leftSpan = "";
            let rightSpan = "";

            if (ratio === "60-40") {
              gridCols = "grid-cols-1 md:grid-cols-12";
              leftSpan = "md:col-span-7";
              rightSpan = "md:col-span-5";
            } else if (ratio === "40-60") {
              gridCols = "grid-cols-1 md:grid-cols-12";
              leftSpan = "md:col-span-5";
              rightSpan = "md:col-span-7";
            }

            return (
              <div
                key={block.id}
                className={`my-8 grid ${gridCols} gap-5 p-6 rounded-card bg-[#FAF6F0] border border-[#E8DFC8]/60 shadow-xs`}
              >
                <div className={`p-4 rounded-lg bg-white/70 border border-border/50 ${leftSpan}`}>
                  {block.data.leftTitle && (
                    <h4 className="font-serif font-bold text-base md:text-lg text-[#3D2314] mb-2 pb-1.5 border-b border-[#C5A059]/30">
                      {block.data.leftTitle}
                    </h4>
                  )}
                  <div className="prose prose-stone text-xs md:text-sm text-[#3D2C21] leading-relaxed">
                    <ReactMarkdown>{block.data.leftContent || ""}</ReactMarkdown>
                  </div>
                </div>

                <div className={`p-4 rounded-lg bg-white/70 border border-border/50 ${rightSpan}`}>
                  {block.data.rightTitle && (
                    <h4 className="font-serif font-bold text-base md:text-lg text-[#3D2314] mb-2 pb-1.5 border-b border-[#C5A059]/30">
                      {block.data.rightTitle}
                    </h4>
                  )}
                  <div className="prose prose-stone text-xs md:text-sm text-[#3D2C21] leading-relaxed">
                    <ReactMarkdown>{block.data.rightContent || ""}</ReactMarkdown>
                  </div>
                </div>
              </div>
            );
          }

          case "section": {
            return (
              <div
                key={block.id}
                className="my-8 p-6 md:p-7 rounded-card bg-[#FDFBF7] border-l-4 border-l-[#C5A059] border border-[#E8DFC8] shadow-xs"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1 rounded bg-[#C5A059]/15 text-[#C5A059]">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h3 className="font-serif font-bold text-base md:text-lg text-[#3D2314]">
                    {block.data.title || "Điểm Nhấn Quan Trọng"}
                  </h3>
                </div>
                <div className="prose prose-stone text-sm md:text-base text-[#2A160C] leading-relaxed pl-1">
                  <ReactMarkdown>{block.data.content || ""}</ReactMarkdown>
                </div>
              </div>
            );
          }

          case "quote": {
            return (
              <blockquote
                key={block.id}
                className="my-8 relative p-6 md:p-8 rounded-card bg-[#FAF6F0] border-l-4 border-l-[#3D2314] border border-border/60 shadow-xs"
              >
                <Quote className="w-8 h-8 text-[#C5A059]/30 absolute top-4 right-4 pointer-events-none" />
                <p className="font-serif italic text-base md:text-lg text-[#2A160C] leading-relaxed mb-3">
                  &ldquo;{block.data.quote}&rdquo;
                </p>
                {block.data.author && (
                  <div className="flex items-center gap-2 text-xs md:text-sm font-semibold text-[#C5A059] uppercase tracking-wider">
                    <span>—</span>
                    <span>{block.data.author}</span>
                  </div>
                )}
              </blockquote>
            );
          }

          case "list": {
            const isNumbered = block.data.listType === "numbered";
            const isChecklist = block.data.listType === "checklist";
            const items: any[] = Array.isArray(block.data.items) ? block.data.items : [];

            if (isChecklist) {
              return (
                <div key={block.id} className="my-6 space-y-2.5 pl-2">
                  {items.map((it, idx) => {
                    const isChecked = typeof it === "object" ? !!it.checked : false;
                    const text = typeof it === "object" ? it.text : String(it);
                    return (
                      <div key={idx} className="flex items-start gap-3">
                        <span className={`shrink-0 w-4 h-4 rounded border mt-1 flex items-center justify-center text-[10px] ${isChecked ? "bg-[#3D2314] border-[#3D2314] text-white" : "border-border bg-white"}`}>
                          {isChecked ? "✓" : ""}
                        </span>
                        <span className={`text-sm md:text-base leading-relaxed flex-1 ${isChecked ? "line-through text-text-muted opacity-70" : "text-[#2A160C]"}`}>
                          {text}
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            }

            return (
              <div key={block.id} className="my-6">
                {isNumbered ? (
                  <ol className="space-y-2.5 text-sm md:text-base text-[#2A160C] pl-2">
                    {items.map((it, idx) => {
                      const text = typeof it === "object" ? it.text : String(it);
                      return (
                        <li key={idx} className="flex items-start gap-3">
                          <span className="shrink-0 w-6 h-6 rounded-full bg-[#FAF6F0] border border-[#C5A059] text-[#3D2314] font-serif font-bold text-xs flex items-center justify-center mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="leading-relaxed flex-1">{text}</span>
                        </li>
                      );
                    })}
                  </ol>
                ) : (
                  <ul className="space-y-2.5 text-sm md:text-base text-[#2A160C] pl-2">
                    {items.map((it, idx) => {
                      const text = typeof it === "object" ? it.text : String(it);
                      return (
                        <li key={idx} className="flex items-start gap-3">
                          <CheckCircle2 className="w-4 h-4 text-[#C5A059] shrink-0 mt-1" />
                          <span className="leading-relaxed flex-1">{text}</span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          }

          case "table": {
            const headers: string[] = block.data.headers || [];
            const rows: string[][] = block.data.rows || [];
            if (headers.length === 0) return null;

            return (
              <div key={block.id} className="my-8 overflow-x-auto rounded-card border border-border shadow-xs">
                <table className="w-full text-left text-xs md:text-sm text-[#2A160C]">
                  <thead className="bg-[#3D2314] text-white font-serif uppercase tracking-wider text-[11px] md:text-xs">
                    <tr>
                      {headers.map((h, i) => (
                        <th key={i} className="px-4 py-3 border-r border-white/10 last:border-r-0">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 bg-white">
                    {rows.map((row, rIdx) => (
                      <tr key={rIdx} className={rIdx % 2 === 0 ? "bg-[#FDFBF7]" : "bg-white"}>
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="px-4 py-3 border-r border-border/40 last:border-r-0">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }

          case "button": {
            const style = block.data.buttonStyle || "primary";
            const label = block.data.label || "Xem chi tiết";
            const url = block.data.url || "https://zalo.me/0968888972";

            let btnClasses = "bg-[#3D2314] hover:bg-[#5C3A21] text-white";
            let IconBtn = ExternalLink;

            if (style === "zalo") {
              btnClasses = "bg-[#0068FF] hover:bg-[#0052cc] text-white shadow-md";
              IconBtn = MessageCircle;
            } else if (style === "hotline") {
              btnClasses = "bg-[#B91C1C] hover:bg-[#991B1B] text-white shadow-md";
              IconBtn = Phone;
            }

            return (
              <div key={block.id} className="my-8 text-center">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2.5 px-6 py-3 rounded-btn font-bold text-sm transition-all transform hover:-translate-y-0.5 ${btnClasses}`}
                >
                  <IconBtn className="w-4 h-4" />
                  <span>{label}</span>
                </a>
              </div>
            );
          }

          case "divider": {
            return (
              <div key={block.id} className="my-10 relative flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/80" />
                </div>
                <div className="relative px-4 bg-surface text-[#C5A059] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rotate-45 bg-[#C5A059]" />
                  <span className="w-2 h-2 rotate-45 bg-[#3D2314]" />
                  <span className="w-1.5 h-1.5 rotate-45 bg-[#C5A059]" />
                </div>
              </div>
            );
          }

          case "footer": {
            return (
              <div
                key={block.id}
                className="my-10 p-6 md:p-8 rounded-card bg-[#FAF6F0] border-2 border-[#C5A059]/40 shadow-card text-center"
              >
                <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-[#C5A059]/15 flex items-center justify-center text-[#C5A059]">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="font-serif font-bold text-xl md:text-2xl text-[#3D2314] mb-3">
                  {block.data.title || "Lời Kết & Cam Kết Chất Lượng"}
                </h3>
                <div className="prose prose-stone max-w-2xl mx-auto text-sm md:text-base text-[#5A4A42] leading-relaxed mb-5">
                  <ReactMarkdown>{block.data.content || ""}</ReactMarkdown>
                </div>
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#C5A059] uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Mỹ Nghệ Đông Phong — Giữ Hồn Gỗ Quý</span>
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          }

          default:
            return null;
        }
      })}
    </div>
  );
}
