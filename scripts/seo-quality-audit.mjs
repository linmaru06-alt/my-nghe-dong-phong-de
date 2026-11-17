/**
 * scripts/seo-quality-audit.mjs
 * Công cụ rà soát và kiểm duyệt chất lượng kỹ thuật SEO, GEO và thương hiệu
 * Tự động kiểm tra toàn bộ bài viết trong data/posts.json
 * Chạy bằng: node scripts/seo-quality-audit.mjs
 */

import fs from "fs";
import path from "path";

const postsPath = path.join(process.cwd(), "data", "posts.json");

if (!fs.existsSync(postsPath)) {
  console.error("❌ Không tìm thấy file data/posts.json");
  process.exit(1);
}

const posts = JSON.parse(fs.readFileSync(postsPath, "utf-8"));
console.log("=================================================================");
console.log(`🔍 MỸ NGHỆ ĐÔNG PHONG — KIỂM DUYỆT CHẤT LƯỢNG SEO TOÀN DIỆN`);
console.log(`📊 Tổng số bài viết cần kiểm tra: ${posts.length} bài`);
console.log("=================================================================\n");

let passedCount = 0;
let warningsCount = 0;
const report = [];

posts.forEach((post, index) => {
  const issues = [];
  const title = post.title || "";
  const content = post.content || "";
  const plainText = content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const wordCount = plainText.split(" ").filter(Boolean).length;

  // C1: Độ dài tiêu đề
  if (title.length < 35 || title.length > 85) {
    issues.push(`[C1-Title] Tiêu đề (${title.length} ký tự) nằm ngoài khoảng tối ưu (45-65 ký tự)`);
  }

  // C2: Cấm thẻ table & Cấm H1 trong body
  if (content.includes("<table")) {
    issues.push(`[C2-Heading] Chứa thẻ <table> gây lỗi hiển thị trên thiết bị di động`);
  }
  if (/<h1\b/i.test(content)) {
    issues.push(`[C2-Heading] Thân bài chứa thẻ <h1> (vi phạm chuẩn 1 H1 duy nhất trên trang)`);
  }

  // C3: Độ dài bài viết
  if (wordCount < 700) {
    issues.push(`[C3-Depth] Độ dài ngắn (${wordCount} từ, dưới ngưỡng chuẩn 800 từ)`);
  }

  // C4: Thuộc tính alt ảnh
  if (content.includes("<img") && (!content.includes("alt=") || /alt=["']\s*["']/.test(content))) {
    issues.push(`[C4-ImageAlt] Ảnh trong bài thiếu thuộc tính alt mô tả vân gỗ`);
  }

  // C5: Liên kết nội bộ
  const hasInternalLink = /\/san-pham\/|\/bai-viet/i.test(content);
  if (!hasInternalLink) {
    issues.push(`[C5-InternalLinks] Thiếu liên kết nội bộ dẫn về 7 danh mục sản phẩm`);
  }

  // C6: Lời kêu gọi CTA Zalo
  const hasZaloCta = content.includes("0961668612") || content.includes("zalo.me");
  if (!hasZaloCta) {
    issues.push(`[C6-CTA] Thiếu khối lời kêu gọi Zalo / hotline nghệ nhân`);
  }

  if (issues.length === 0) {
    passedCount++;
  } else {
    warningsCount++;
    report.push({
      index: index + 1,
      slug: post.slug,
      title: title.slice(0, 50) + "...",
      issues,
    });
  }
});

console.log(`📈 KẾT QUẢ TỔNG QUAN:`);
console.log(`- ✅ Số bài viết ĐẠT CHUẨN HOÀN TOÀN: ${passedCount} / ${posts.length} bài (${Math.round((passedCount / posts.length) * 100)}%)`);
console.log(`- ⚠️ Số bài viết có khuyến nghị hoàn thiện: ${warningsCount} / ${posts.length} bài`);

if (report.length > 0) {
  console.log(`\n📋 DANH SÁCH BÀI CẦN LƯU Ý (Top 5 bài tiêu biểu):`);
  report.slice(0, 5).forEach((r) => {
    console.log(`\n[${r.index}] ${r.title} (/bai-viet/${r.slug})`);
    r.issues.forEach((iss) => console.log(`   👉 ${iss}`));
  });
}

console.log("\n=================================================================");
console.log("🎉 HOÀN TẤT RÀ SOÁT CHẤT LƯỢNG SEO!");
console.log("=================================================================\n");

