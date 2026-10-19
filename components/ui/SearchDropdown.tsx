"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowRight, BookOpen, Package, Sparkles, Tag } from "lucide-react";
import { useProductsStore } from "@/lib/useProducts";
import { usePostsStore } from "@/lib/usePosts";
import { formatPrice } from "@/lib/formatPrice";
import { POPULAR_HASHTAGS } from "@/lib/utils/tags";

export interface SearchDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

// Bóc tách dấu tiếng Việt phục vụ tìm kiếm thông minh
function removeVietnameseTones(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

// Làm nổi bật từ khóa khớp trong kết quả tìm kiếm
function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <span>{text}</span>;
  const normText = removeVietnameseTones(text);
  const normQuery = removeVietnameseTones(query.trim());
  const index = normText.indexOf(normQuery);
  if (index === -1) return <span>{text}</span>;

  const before = text.substring(0, index);
  const match = text.substring(index, index + query.trim().length);
  const after = text.substring(index + query.trim().length);

  return (
    <span>
      {before}
      <strong className="text-amber-800 font-bold bg-[#C5A059]/25 px-1 rounded-sm text-primary">
        {match}
      </strong>
      {after}
    </span>
  );
}

export function SearchDropdown({ isOpen, onClose }: SearchDropdownProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const { products } = useProductsStore();
  const { posts } = usePostsStore();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = "hidden";
    } else {
      setQuery("");
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Thuật toán tìm kiếm thông minh không dấu
  const trimmed = query.trim();
  const normalizedQuery = useMemo(() => removeVietnameseTones(trimmed), [trimmed]);

  const filteredProducts = useMemo(() => {
    if (!normalizedQuery) return [];
    return products
      .filter((p) => {
        if (p.status === "draft") return false;
        const nameNorm = removeVietnameseTones(p.name);
        const codeNorm = removeVietnameseTones(p.code);
        const woodNorm = removeVietnameseTones(p.woodType);
        const catNorm = removeVietnameseTones(p.category);
        return (
          nameNorm.includes(normalizedQuery) ||
          codeNorm.includes(normalizedQuery) ||
          woodNorm.includes(normalizedQuery) ||
          catNorm.includes(normalizedQuery)
        );
      })
      .slice(0, 5);
  }, [products, normalizedQuery]);

  const filteredPosts = useMemo(() => {
    if (!normalizedQuery) return [];
    return posts
      .filter((p) => {
        if (p.status === "draft") return false;
        const titleNorm = removeVietnameseTones(p.title);
        const excerptNorm = removeVietnameseTones(p.excerpt || "");
        const tagsNorm = p.tags ? removeVietnameseTones(p.tags.join(" ")) : "";
        const contentNorm = removeVietnameseTones((p.content || "").slice(0, 1500));
        return (
          titleNorm.includes(normalizedQuery) ||
          excerptNorm.includes(normalizedQuery) ||
          tagsNorm.includes(normalizedQuery) ||
          contentNorm.includes(normalizedQuery)
        );
      })
      .slice(0, 4);
  }, [posts, normalizedQuery]);


  const hasResults = filteredProducts.length > 0 || filteredPosts.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trimmed) {
      onClose();
      router.push(`/tim-kiem?q=${encodeURIComponent(trimmed)}`);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 md:p-12 overflow-y-auto">
          {/* Backdrop mờ */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#1F1610]/60 backdrop-blur-xs transition-opacity"
          />

          {/* Modal tìm kiếm */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -16 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-2xl bg-[#FAF6F0] rounded-2xl shadow-[0_20px_50px_rgba(44,26,14,0.2)] border border-[#C5A059]/40 overflow-hidden z-10 my-auto md:my-8"
          >
            {/* Input Bar */}
            <form
              onSubmit={handleSubmit}
              className="relative flex items-center border-b border-[#C5A059]/30 px-4 py-3.5 bg-white/70"
            >
              <Search className="w-5 h-5 text-[#C5A059] mr-3 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm vòng tay, bút ký, loại gỗ (tử đàn, sưa, bách xanh...)..."
                className="w-full bg-transparent text-sm sm:text-base text-[#1F1610] placeholder:text-[#5A4A42]/60 focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="p-1 rounded-full text-[#5A4A42] hover:text-[#1F1610] mr-2"
                  aria-label="Xóa tìm kiếm"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="text-[11px] font-semibold px-2 py-1 rounded-md bg-[#FAF6F0] border border-[#C5A059]/40 text-[#5C3A21] hover:bg-[#C5A059]/20 transition"
              >
                ESC
              </button>
            </form>

            {/* Results Area */}
            <div className="max-h-[65vh] overflow-y-auto p-4 sm:p-5 space-y-6">
              {!trimmed ? (
                <div className="py-6 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-[#5C3A21] uppercase tracking-wider mb-3">
                    <Sparkles className="w-4 h-4 text-[#C5A059]" />
                    <span>Chủ đề và Hashtag tìm kiếm nhanh</span>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
                    {POPULAR_HASHTAGS.map((item) => (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => setQuery(item.query)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs bg-white/80 border border-[#C5A059]/30 text-[#3D2314] hover:border-[#C5A059] hover:bg-[#C5A059]/15 transition-all shadow-2xs active:scale-95"
                      >
                        <Tag className="w-3 h-3 text-[#C5A059]" />
                        <span>#{item.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : !hasResults ? (
                <div className="py-12 text-center text-[#5A4A42]">
                  <p className="text-base font-serif font-bold text-[#2A160C] mb-1">
                    Không tìm thấy kết quả cho &quot;{trimmed}&quot;
                  </p>
                  <p className="text-xs max-w-sm mx-auto">
                    Bạn thử gõ tên không dấu như <em>&quot;tu dan&quot;</em> hoặc <em>&quot;bach xanh&quot;</em> xem nhé!
                  </p>
                </div>
              ) : (
                <>
                  {/* Products Section */}
                  {filteredProducts.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#5C3A21] uppercase tracking-wider mb-3">
                        <Package className="w-3.5 h-3.5 text-[#C5A059]" />
                        <span>Tác phẩm gỗ quý ({filteredProducts.length})</span>
                      </div>
                      <div className="space-y-2">
                        {filteredProducts.map((p) => {
                          const firstPrice = p.sizes[0]?.price;
                          return (
                            <Link
                              key={p.id}
                              href={`/san-pham/${p.slug}`}
                              onClick={onClose}
                              className="flex items-center gap-3.5 p-2.5 rounded-xl bg-white/70 hover:bg-white border border-[#C5A059]/20 hover:border-[#C5A059]/60 transition-all group shadow-2xs"
                            >
                              <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-[#2A160C]/5 shrink-0 border border-[#C5A059]/30">
                                <Image
                                  src={p.images[0] || "/images/placeholder.svg"}
                                  alt={p.name}
                                  fill
                                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-[11px] font-mono font-bold text-[#C5A059] bg-[#3D2314]/5 px-1.5 py-0.5 rounded">
                                    {p.code}
                                  </span>
                                  <h4 className="text-sm font-medium text-[#1F1610] group-hover:text-[#5C3A21] transition-colors truncate">
                                    <HighlightMatch text={p.name} query={trimmed} />
                                  </h4>
                                </div>
                                <p className="text-xs text-[#5A4A42] mt-0.5 truncate">
                                  Gỗ: <HighlightMatch text={p.woodType} query={trimmed} />
                                </p>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="text-xs sm:text-sm font-semibold text-[#5C3A21]">
                                  {formatPrice(firstPrice)}
                                </span>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Posts Section */}
                  {filteredPosts.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#5C3A21] uppercase tracking-wider mb-3">
                        <BookOpen className="w-3.5 h-3.5 text-[#C5A059]" />
                        <span>Kiến thức và Chia sẻ ({filteredPosts.length})</span>
                      </div>
                      <div className="space-y-2">
                        {filteredPosts.map((post) => (
                          <Link
                            key={post.id}
                            href={`/bai-viet/${post.slug}`}
                            onClick={onClose}
                            className="block p-3 rounded-xl bg-white/70 hover:bg-white border border-[#C5A059]/20 hover:border-[#C5A059]/60 transition-all group"
                          >
                            <h4 className="text-sm font-medium text-[#1F1610] group-hover:text-[#5C3A21] transition-colors line-clamp-1">
                              <HighlightMatch text={post.title} query={trimmed} />
                            </h4>
                            <p className="text-xs text-[#5A4A42] line-clamp-1 mt-1">
                              <HighlightMatch text={post.excerpt} query={trimmed} />
                            </p>
                            {post.tags && post.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {post.tags.slice(0, 3).map((tag: string) => (
                                  <span
                                    key={tag}
                                    className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#FAF6F0] border border-[#C5A059]/30 text-[#5C3A21]"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Footer */}
            {trimmed && hasResults && (
              <div className="p-3 bg-white/50 border-t border-[#C5A059]/30 text-center">
                <Link
                  href={`/tim-kiem?q=${encodeURIComponent(trimmed)}`}
                  onClick={onClose}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5C3A21] hover:text-[#2A160C] transition"
                >
                  <span>Xem tất cả kết quả cho &quot;{trimmed}&quot;</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default SearchDropdown;
