"use client";

import React from "react";
import { usePathname } from "next/navigation";
import AdminSidebar from "@/components/layout/AdminSidebar";
import AdminAuthGuard from "@/components/admin/AdminAuthGuard";
import { cn } from "@/lib/utils";

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Trang đăng nhập hiển thị toàn màn hình không có thanh điều hướng Admin
  if (pathname === "/admin/login") {
    return <AdminAuthGuard>{children}</AdminAuthGuard>;
  }

  const isBlogEditor = pathname.includes("/bai-viet/them") || (pathname.includes("/bai-viet/") && !pathname.endsWith("/bai-viet"));

  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-[#F8F6F2] flex">
        <AdminSidebar />
        <main
          className={cn(
            "flex-1 lg:ml-64 min-h-screen overflow-x-auto",
            isBlogEditor ? "p-0" : "p-4 md:p-8"
          )}
        >
          {children}
        </main>
      </div>
    </AdminAuthGuard>
  );
}
