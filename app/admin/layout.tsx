import React from "react";
import AdminLayoutClient from "@/components/admin/AdminLayoutClient";

export const metadata = {
  title: "Quản Trị CMS",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
