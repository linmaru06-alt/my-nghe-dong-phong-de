"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, Phone, MessageCircle, Search, ShoppingBag, Facebook } from "lucide-react";
import categoriesData from "@/data/categories.json";
import settingsData from "@/data/settings.json";

export interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const router = useRouter();
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [isPostsOpen, setIsPostsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const phone = settingsData.brand.phone;
  const zaloLink = settingsData.brand.zaloLink;
  const shopeeLink =
    (settingsData as any).brand?.shopeeLink ||
    (settingsData as any).shopeeLink ||
    "https://vn.shp.ee/JdnPvA3B";
  const facebookLink =
    (settingsData as any).brand?.facebook ||
    (settingsData as any).facebook ||
    settingsData.socialLinks?.facebook ||
    "https://www.facebook.com/phong.nk.12";

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onClose();
      router.push(`/tim-kiem?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const blogCategories = [
    { label: "Kiến thức về gỗ", href: "/bai-viet?tab=kien-thuc-ve-go" },
    { label: "Hướng dẫn lựa chọn", href: "/bai-viet?tab=huong-dan-lua-chon" },
    { label: "Bảo quản sản phẩm", href: "/bai-viet?tab=bao-quan-san-pham" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-text/50 backdrop-blur-sm"
          />

          {/* Drawer Menu Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="relative w-full max-w-sm h-full bg-surface shadow-2xl flex flex-col z-10 overflow-y-auto"
          >
            {/* Top Bar */}
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src="/images/logo.png"
                  alt="Mỹ Nghệ Đông Phong"
                  className="w-10 h-10 object-contain drop-shadow-sm"
                />
                <div>
                  <span className="font-serif text-base font-bold text-primary block leading-none">
                    Mỹ Nghệ Đông Phong
                  </span>
                  <span className="text-[10px] text-secondary tracking-widest uppercase font-semibold">
                    Tinh Hoa Gỗ Quý
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full hover:bg-bg text-text-muted hover:text-text transition-colors"
                aria-label="Đóng menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-4 border-b border-border/60">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm sản phẩm, bài viết..."
                  className="w-full bg-bg border border-border rounded-btn pl-9 pr-4 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary"
                />
                <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </form>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 py-2 divide-y divide-border/60">
              <Link
                href="/"
                onClick={onClose}
                className="flex items-center justify-between px-5 py-3.5 text-sm font-medium text-text hover:text-primary hover:bg-bg transition-colors"
              >
                <span>Trang chủ</span>
              </Link>

              {/* Products Dropdown */}
              <div>
                <button
                  type="button"
                  onClick={() => setIsProductsOpen(!isProductsOpen)}
                  className="w-full flex items-center justify-between px-5 py-3.5 text-sm font-medium text-text hover:text-primary hover:bg-bg transition-colors"
                >
                  <span>Sản phẩm</span>
                  <motion.div
                    animate={{ rotate: isProductsOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-4 h-4 text-text-muted" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {isProductsOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden bg-bg/50 px-6 py-2 space-y-1 border-y border-border/40"
                    >
                      <Link
                        href="/san-pham"
                        onClick={onClose}
                        className="block py-2 text-xs font-semibold text-primary"
                      >
                        → Xem tất cả sản phẩm
                      </Link>
                      {categoriesData.map((cat) => (
                        <Link
                          key={cat.id}
                          href={`/san-pham?category=${cat.id}`}
                          onClick={onClose}
                          className="flex items-center py-2 text-xs text-text-muted hover:text-primary transition-colors font-medium"
                        >
                          <span>{cat.name}</span>
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Blog Dropdown */}
              <div>
                <button
                  type="button"
                  onClick={() => setIsPostsOpen(!isPostsOpen)}
                  className="w-full flex items-center justify-between px-5 py-3.5 text-sm font-medium text-text hover:text-primary hover:bg-bg transition-colors"
                >
                  <span>Bài viết kiến thức</span>
                  <motion.div
                    animate={{ rotate: isPostsOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-4 h-4 text-text-muted" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {isPostsOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden bg-bg/50 px-6 py-2 space-y-1 border-y border-border/40"
                    >
                      <Link
                        href="/bai-viet"
                        onClick={onClose}
                        className="block py-2 text-xs font-semibold text-primary"
                      >
                        → Xem tất cả bài viết
                      </Link>
                      {blogCategories.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={onClose}
                          className="block py-2 text-xs text-text-muted hover:text-primary transition-colors"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link
                href="/gioi-thieu"
                onClick={onClose}
                className="flex items-center justify-between px-5 py-3.5 text-sm font-medium text-text hover:text-primary hover:bg-bg transition-colors"
              >
                <span>Giới thiệu thương hiệu</span>
              </Link>

              <Link
                href="/lien-he"
                onClick={onClose}
                className="flex items-center justify-between px-5 py-3.5 text-sm font-medium text-text hover:text-primary hover:bg-bg transition-colors"
              >
                <span>Liên hệ & Tư vấn</span>
              </Link>
            </nav>

            {/* Bottom Actions */}
            <div className="p-5 border-t border-border space-y-2.5 bg-bg">
              <a
                href={`tel:${phone.replace(/\s+/g, "")}`}
                className="flex items-center justify-center gap-2 py-2.5 rounded-btn border border-border text-sm font-medium text-text hover:border-primary hover:text-primary transition-colors"
              >
                <Phone className="w-4 h-4 text-[#B84E29]" />
                <span>Hotline: {phone}</span>
              </a>

              <a
                href={zaloLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white py-2.5 rounded-btn text-sm font-bold shadow-sm transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Nhắn Zalo Tư Vấn ({phone})</span>
              </a>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <a
                  href={shopeeLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-btn bg-[#EE4D2D]/10 text-[#EE4D2D] hover:bg-[#EE4D2D] hover:text-white border border-[#EE4D2D]/30 text-xs font-semibold transition-colors"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Shopee</span>
                </a>

                <a
                  href={facebookLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-btn bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2] hover:text-white border border-[#1877F2]/30 text-xs font-semibold transition-colors"
                >
                  <Facebook className="w-3.5 h-3.5" />
                  <span>Facebook</span>
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default MobileMenu;
