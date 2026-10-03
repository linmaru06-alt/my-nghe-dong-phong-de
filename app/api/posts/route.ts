import { NextResponse } from "next/server";
import { getPublishedPosts, getPostBySlug } from "@/lib/server/posts";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET /api/posts - API công khai lấy danh sách bài viết đã xuất bản
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const limit = searchParams.get("limit");

    if (slug) {
      const post = await getPostBySlug(slug);
      if (!post || post.status !== "published") {
        return NextResponse.json(
          { success: false, error: "Không tìm thấy bài viết" },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: post });
    }

    let posts = await getPublishedPosts();

    if (category) {
      posts = posts.filter((p) => p.category === category);
    }

    if (search) {
      const q = search.toLowerCase().trim();
      posts = posts.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q) ||
          p.content.toLowerCase().includes(q)
      );
    }

    if (limit) {
      const count = parseInt(limit, 10);
      if (!isNaN(count) && count > 0) {
        posts = posts.slice(0, count);
      }
    }

    return NextResponse.json({
      success: true,
      data: posts,
      total: posts.length,
    });
  } catch (error: any) {
    console.error("[API /api/posts GET] Lỗi lấy danh sách bài viết:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi hệ thống khi tải bài viết" },
      { status: 500 }
    );
  }
}
