import { NextResponse } from "next/server";
import { getAllPosts, savePosts } from "@/lib/server/posts";

// GET /api/admin/posts - Lấy danh sách bài viết trực tiếp từ Server Data Layer
export async function GET() {
  try {
    const posts = await getAllPosts();
    return NextResponse.json({ success: true, data: posts });
  } catch (error: any) {
    console.error("[API /api/admin/posts GET] Lỗi đọc bài viết:", error);
    return NextResponse.json(
      { success: false, error: "Không thể đọc dữ liệu bài viết từ đĩa" },
      { status: 500 }
    );
  }
}

// POST /api/admin/posts - Lưu & ghi đè danh sách bài viết và revalidate trang chủ & blog
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { posts } = body;

    if (!Array.isArray(posts)) {
      return NextResponse.json(
        { success: false, error: "Dữ liệu posts gửi lên phải là một danh sách (mảng) hợp lệ" },
        { status: 400 }
      );
    }

    const result = await savePosts(posts);

    return NextResponse.json({
      success: true,
      message: "Đã lưu và đồng bộ thành công bài viết lên trang chính",
      total: result.total,
    });
  } catch (error: any) {
    console.error("[API /api/admin/posts POST] Lỗi ghi file:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi khi ghi dữ liệu bài viết vào đĩa" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/posts?id=xxx - Xóa chính xác bài viết theo ID
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Thiếu tham số id bài viết cần xóa" },
        { status: 400 }
      );
    }

    const { deletePostById } = await import("@/lib/server/posts");
    await deletePostById(id);

    return NextResponse.json({
      success: true,
      message: `Đã xóa bài viết ${id} thành công`,
    });
  } catch (error: any) {
    console.error("[API /api/admin/posts DELETE] Lỗi xóa bài viết:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi khi xóa bài viết" },
      { status: 500 }
    );
  }
}

