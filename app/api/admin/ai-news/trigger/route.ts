import { NextRequest, NextResponse } from "next/server";
import { runAutoNewsCuration } from "@/lib/server/ai-auto-news";
import { verifyAdminToken, ADMIN_COOKIE_NAME } from "@/lib/auth-token";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Endpoint kích hoạt cào & đăng bài tức thì từ trang Quản trị Admin
 */
export async function POST(request: NextRequest) {
  try {
    // Xác thực quyền Admin qua Cookie
    const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const { valid } = await verifyAdminToken(token);

    // Cho phép chạy tự do nếu ở môi trường phát triển cục bộ (localhost)
    const isDev = process.env.NODE_ENV === "development";

    if (!valid && !isDev) {
      return NextResponse.json({ error: "Yêu cầu quyền Quản trị viên" }, { status: 401 });
    }

    let body: any = {};
    try {
      body = await request.json();
    } catch {}

    const maxArticles = typeof body.maxArticles === "number" ? body.maxArticles : 2;
    const autoPublish = body.autoPublish !== false;

    console.log(`[Admin Trigger] Bắt đầu kích hoạt cào tin (maxArticles: ${maxArticles}, autoPublish: ${autoPublish})...`);

    const result = await runAutoNewsCuration({
      autoPublish,
      maxArticles,
    });

    return NextResponse.json({
      message: `Đã xử lý xong: xuất bản ${result.publishedCount} bài, bỏ qua ${result.skippedCount} bài.`,
      ...result,
    });
  } catch (error: any) {
    console.error("[Admin Trigger] Lỗi kích hoạt cào tin:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi khi xử lý cào tin" },
      { status: 500 }
    );
  }
}
