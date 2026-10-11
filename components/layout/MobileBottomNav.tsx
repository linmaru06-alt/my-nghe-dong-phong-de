"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Package, BookOpen, Info, Headphones } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileBottomNav() {
  const pathname = usePathname();

  // Hide in admin routes or product detail routes (where dedicated sticky action bar is mounted)
  if (pathname.startsWith("/admin") || (pathname.startsWith("/san-pham/") && pathname !== "/san-pham")) {
    return null;
  }

  const navItems = [
    { label: "Trang chủ", href: "/", icon: Home },
    { label: "Sản phẩm", href: "/san-pham", icon: Package },
    { label: "Bài viết", href: "/bai-viet", icon: BookOpen },
    { label: "Giới thiệu", href: "/gioi-thieu", icon: Info },
    { label: "Liên hệ", href: "/lien-he", icon: Headphones },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-surface-lowest/95 backdrop-blur-xl border-t border-border/70 shadow-[0_-4px_20px_rgba(44,26,14,0.08)] pb-safe">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-16 h-12 transition-all duration-200 group relative",
                isActive ? "text-primary font-semibold" : "text-text-muted hover:text-primary"
              )}
            >
              {isActive && (
                <span className="absolute top-0 w-8 h-0.5 bg-primary rounded-full" />
              )}
              <Icon className={cn("w-5 h-5 transition-transform group-active:scale-90", isActive && "stroke-[2.5px]")} />
              <span className="text-[10px] leading-tight mt-1 truncate">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default MobileBottomNav;
