import React from "react";
import BlogForm from "@/components/admin/BlogForm";

export const metadata = {
  title: "Thêm Bài Viết Mới | Quản Trị Đông Phong",
};

export default function AdminAddPostPage() {
  return <BlogForm isEdit={false} />;
}
