"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import SearchDropdown from "@/components/ui/SearchDropdown";
import MobileMenu from "@/components/layout/MobileMenu";
import settingsData from "@/data/settings.json";
import useCloseOnNavigate from "@/hooks/useCloseOnNavigate";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Tự động đóng search và menu khi điều hướng trang
  useCloseOnNavigate([
    () => setIsSearchOpen(false),
    () => setIsMobileMenuOpen(false),
  ]);

  // On home page, header can be transparent over hero
  const isHomePage = pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      if (scrollY > 60) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        const progress = Math.min(Math.max((scrollY / docHeight) * 100, 0), 100);
        setScrollProgress(progress);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Sản phẩm", href: "/san-pham" },
    { label: "Giới thiệu", href: "/gioi-thieu" },
    { label: "Bài viết", href: "/bai-viet" },
    { label: "Liên hệ", href: "/lien-he" },
  ];

  // If on admin routes, header is hidden or simplified
  if (pathname.startsWith("/admin")) {
    return null;
  }

  const isTransparent = isHomePage && !isScrolled;

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-40 transition-all duration-300 select-none",
          isTransparent
            ? "bg-transparent text-white py-4 md:py-5"
            : "bg-bg/95 backdrop-blur-md shadow-[0_4px_20px_rgba(107,63,31,0.08)] text-text py-2.5 md:py-3 border-b border-border/70"
        )}
      >
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
          <div className="flex items-center gap-8 lg:gap-12">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group shrink-0">
            <img
              src="/images/logo.png"
              alt="Mỹ Nghệ Đông Phong Logo"
              className={cn(
                "object-contain drop-shadow-sm transition-all duration-300 group-hover:scale-105",
                isScrolled ? "h-9 w-9 md:h-10 md:w-10" : "h-11 w-11"
              )}
            />
            <div className="flex flex-col">
              <span
                className={cn(
                  "font-serif text-lg md:text-xl font-bold tracking-wide leading-none transition-colors duration-200",
                  isTransparent ? "text-white" : "text-primary group-hover:text-primary-hover"
                )}
              >
                Mỹ Nghệ Đông Phong
              </span>
              <span
                className={cn(
                  "text-[10px] tracking-[0.18em] uppercase mt-1 font-semibold transition-colors duration-200",
                  isTransparent ? "text-[#E8BF87]" : "text-secondary"
                )}
              >
                Tinh Hoa Gỗ Quý Việt Nam
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-base font-medium transition-colors relative py-1",
                    isTransparent
                      ? isActive
                        ? "text-white font-semibold"
                        : "text-white hover:text-white/80"
                      : isActive
                      ? "text-primary font-semibold"
                      : "text-text hover:text-primary"
                  )}
                >
                  {link.label}
                  {isActive && (
                    <span
                      className={cn(
                        "absolute bottom-0 left-0 right-0 h-[2px] rounded-full transition-all duration-200",
                        isTransparent ? "bg-white" : "bg-primary"
                      )}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Search Trigger */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className={cn(
                "p-2 rounded-full transition-colors",
                isTransparent
                  ? "text-white hover:bg-white/10"
                  : "text-text hover:bg-accent-soft/60 hover:text-primary"
              )}
              aria-label="Tìm kiếm"
            >
              <Search className="w-5 h-5" />
            </button>



            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={cn(
                "p-2 rounded-full lg:hidden transition-colors",
                isTransparent
                  ? "text-white hover:bg-white/10"
                  : "text-text hover:bg-accent-soft/60"
              )}
              aria-label={isMobileMenuOpen ? "Đóng menu" : "Mở menu"}
            >
              <AnimatePresence mode="wait">
                {isMobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <X className="w-6 h-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Menu className="w-6 h-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* Golden Scroll Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-black/5 overflow-hidden pointer-events-none">
          <div
            className="h-full bg-gradient-to-r from-[#C5A059] via-[#F3E5AB] to-[#D4AF37] transition-[width] duration-150 ease-out shadow-[0_0_8px_rgba(212,175,55,0.7)]"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
      </header>

      {/* Modals & Drawers */}
      <SearchDropdown
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </>
  );
}

export default Header;
