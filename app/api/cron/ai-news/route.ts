import { NextRequest, NextResponse } from "next/server";
import { runAutoNewsCuration } from "@/lib/server/ai-auto-news";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Hỗ trợ Vercel Pro/Hobby function execution window

/**
 * Endpoint dành riêng cho Vercel Cron Job tự động chạy lúc 06:00 sáng mỗi ngày
 * Schedule trong vercel.json: "0 23 * * *" (UTC)
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Xác thực bảo mật với CRON_SECRET nếu có thiết lập trên Vercel
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.warn("[Cron AI-News] Từ chối truy cập: Sai hoặc thiếu CRON_SECRET");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[Cron AI-News] Bắt đầu chu trình tự động quét tin và đăng bài...");

    // 2. Kích hoạt động cơ cào tin và tự động xuất bản (Full-Auto)
    const result = await runAutoNewsCuration({
      autoPublish: true,
      maxArticles: 2,
    });

    return NextResponse.json({
      message: `Đã tự động cào và xuất bản thành công ${result.publishedCount} bài viết.`,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[Cron AI-News] Lỗi trong quá trình chạy tự động:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Lỗi không xác định khi chạy AI Auto-News Cron",
      },
      { status: 500 }
    );
  }
}
