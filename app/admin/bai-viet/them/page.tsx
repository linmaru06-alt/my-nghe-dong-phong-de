import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import BlogForm from "@/components/admin/BlogForm";

export const metadata = {
  title: "Thêm Bài Viết Mới | Quản Trị Đông Phong",
};

export default function AdminAddPostPage() {
  return <BlogForm isEdit={false} />;
}
