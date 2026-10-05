/**
 * scripts/ai-news-agent.js
 * Script CLI để chạy thử hoặc tích hợp chạy bằng cron node bên ngoài
 * Kế thừa toàn bộ động cơ AIHOT + Next.js Server Layer
 */
import dotenv from "dotenv";
import { runAutoNewsCuration } from "../lib/server/ai-auto-news.ts";

dotenv.config({ path: ".env.local" });
dotenv.config();

async function main() {
  console.log("=================================================");
  console.log("🚀 MỸ NGHỆ ĐÔNG PHONG — AI AUTO NEWS AGENT (FULL-AUTO)");
  console.log("=================================================");

  try {
    const res = await runAutoNewsCuration({
      autoPublish: true,
      maxArticles: 1,
    });

    console.log("\nKẾT QUẢ THỰC THI:");
    console.log(`- Số bài đã tự động xuất bản: ${res.publishedCount}`);
    console.log(`- Số bài đã quét và bỏ qua: ${res.skippedCount}`);
    if (res.publishedArticles?.length) {
      console.log("- Danh sách bài mới:");
      res.publishedArticles.forEach((a, i) => {
        console.log(`  ${i + 1}. ${a.title} (/bai-viet/${a.slug})`);
      });
    }
  } catch (err) {
    console.error("Lỗi thực thi:", err);
    process.exit(1);
  }
}

main();
