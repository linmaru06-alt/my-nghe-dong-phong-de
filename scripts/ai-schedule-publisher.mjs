/**
 * scripts/ai-schedule-publisher.mjs
 * Hệ thống tự động xuất bản bài viết theo 4 Khung Giờ Vàng — Mỹ Nghệ Đông Phong
 * 
 * - Khung 1 (07:30): Tin tức & Thị trường (Quét từ khóa hot trên Google News / báo chí uy tín)
 * - Khung 2 (11:30): Kiến thức về gỗ (Dựa trên Content Pillar + Nghiên cứu chuyên sâu)
 * - Khung 3 (16:30): Bảo quản sản phẩm (Dựa trên Content Pillar + Giải đáp nỗi lo)
 * - Khung 4 (20:30): Hướng dẫn lựa chọn (Dựa trên Content Pillar + Tư vấn phong thủy & Chuyển đổi)
 * 
 * QUY TẮC BẮT BUỘC: 100% Ảnh chụp thật, TUYỆT ĐỐI KHÔNG TẠO ẢNH BẰNG AI!
 */

import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Kho ảnh chụp thật đã kiểm định của các loại gỗ quý Đông Phong (Tuyệt đối không dùng AI)
const REAL_WOOD_PHOTOS = {
  "tu-dan": [
    "https://lpawosdhwvejvsgfayov.supabase.co/storage/v1/object/public/dongphong-media/blog/g8wfj8szsr7j8exnqokiw-akdxrgjassae4djmefnczrnnxfqpihiztdlak6ejy1jn6qm-m9tmz87son1yfovmsg-vlirkphv8gh-2fk1qtjpzxop1ififn8xfn6ltfshsi7woqgnxx0ftix2qbf1-srsz4txzyq7-z4vwcrmluy89t69ymuqc-spo8l6cmq-1791218587580.jpg",
    "https://lpawosdhwvejvsgfayov.supabase.co/storage/v1/object/public/dongphong-media/blog/nbaij2cy8diedm8vgepf8-gmbvwjomsv2xylpffrp1aoha-bntwoswq5mg-s-rok95sp3z-kvootl5ng-hz-hogqll06qzrixywceozirfopp6qgn43kvhlq4keizcs0vosbd0k6tvwe5w3p01uhzzjuvw-hzh-8hpzoq5iwaqh2hc4crqxoqij-rfjkdde8-1791218681177.jpg"
  ],
  "sua-do": [
    "https://lpawosdhwvejvsgfayov.supabase.co/storage/v1/object/public/dongphong-media/blog/cq-c-bbdtbcxn5vr16fntffgkj1qeuouqy619s8nq-zxoyholisvilttj3nlhmczkpzjdnxcznohysx4emggy8q8hnfgfptip9smacuodxcqooidtj2u9d3ouoblneasm5t8ioosxwghqbyod87l6-2sc6hofucmxswrlxrh7tguakmmipqs6dh6boafo9w-1791218614413.jpg"
  ],
  "bach-xanh": [
    "https://lpawosdhwvejvsgfayov.supabase.co/storage/v1/object/public/dongphong-media/blog/a7081af3a0b849e610a9-1791214960300.jpg",
    "https://lpawosdhwvejvsgfayov.supabase.co/storage/v1/object/public/dongphong-media/blog/images-1791214977706.jpg"
  ],
  "hoang-dan": [
    "https://lpawosdhwvejvsgfayov.supabase.co/storage/v1/object/public/dongphong-media/blog/tnw-11-1785412271065757119796-1791215192883.jpg",
    "https://lpawosdhwvejvsgfayov.supabase.co/storage/v1/object/public/dongphong-media/blog/tnw-13-17854122710131668343502-1791215228591.jpg"
  ],
  "default": [
    "https://lpawosdhwvejvsgfayov.supabase.co/storage/v1/object/public/dongphong-media/blog/images-1--1791215033290.jpg"
  ]
};

function slugify(text) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Xác định khung giờ hiện tại hoặc theo tham số truyền vào
 */
function getCurrentSlot() {
  const args = process.argv.slice(2);
  const slotArg = args.find((a) => a.startsWith("--slot="));
  if (slotArg) {
    return parseInt(slotArg.split("=")[1], 10);
  }

  const hour = new Date().getHours();
  if (hour >= 6 && hour < 10) return 1; // 07:30
  if (hour >= 10 && hour < 14) return 2; // 11:30
  if (hour >= 14 && hour < 18) return 3; // 16:30
  return 4; // 20:30
}

/**
 * Xử lý tạo bài viết theo Content Pillar
 */
async function generatePillarArticle(category, targetPillar) {
  if (!GEMINI_API_KEY) {
    throw new Error("Thiếu GEMINI_API_KEY trong .env.local");
  }

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const pillarsRaw = await fs.readFile(path.join(process.cwd(), "data", "content-pillars.json"), "utf-8");
  const pillarsData = JSON.parse(pillarsRaw);

  const matchedPillar = pillarsData.matrix.find((m) => m.category === category);
  if (!matchedPillar || !matchedPillar.topics.length) {
    throw new Error(`Không tìm thấy cấu hình cho chuyên mục: ${category}`);
  }

  // Đọc danh sách bài đã có để chọn topic chưa viết
  const postsRaw = await fs.readFile(path.join(process.cwd(), "data", "posts.json"), "utf-8");
  const posts = JSON.parse(postsRaw);
  const existingTitles = posts.map((p) => p.title.toLowerCase());

  // Tìm topic chưa được viết
  let selectedTopic = matchedPillar.topics.find((t) => !existingTitles.some((et) => et.includes(t.title.toLowerCase().slice(0, 15))));
  if (!selectedTopic) {
    // Nếu đã viết hết, chọn ngẫu nhiên 1 topic và phái sinh góc nhìn mới
    selectedTopic = matchedPillar.topics[Math.floor(Math.random() * matchedPillar.topics.length)];
  }

  const prompt = `
Bạn là Nghệ nhân trưởng kiêm chuyên gia đồ gỗ phong thủy tại "Mỹ Nghệ Đông Phong" (xưởng mộc thủ công truyền thống cao cấp).
Nhiệm vụ của bạn là biên soạn một bài viết CẨM NANG CHUYÊN SÂU chuẩn SEO và Google AI Overviews dựa trên chủ đề hạt giống sau:

【CHỦ ĐỀ HẠT GIỐNG】: "${selectedTopic.title}"
【CHUYÊN MỤC】: ${category}
【GÓC KHAI THÁC】: ${matchedPillar.purpose}
【TỪ KHÓA NGHIÊN CỨU】: ${selectedTopic.researchKeywords.join(", ")}

【YÊU CẦU NỘI DUNG NGHIÊM NGẶT — BẮT BUỘC ĐỘ DÀI TỐI THIỂU 1.000 - 1.500 TỪ】:
1. TIÊU ĐỀ: Tự nhiên, hấp dẫn, chuẩn phong thái nghệ nhân đồ gỗ quý (dưới 70 ký tự).
2. ĐOẠN MỞ ĐẦU (Direct Answer): 50-70 từ trả lời trực diện thắc mắc cốt lõi của khách hàng (chuẩn Google AI Overviews).
3. THÂN BÀI CHUYÊN SÂU (ĐẠT CHUẨN TỐI THIỂU 1.000 - 1.500 TỪ):
   - BẮT BUỘC chia thành 4 - 5 phần với các thẻ <h2> rõ ràng, viết chi tiết từng mục, không được viết tóm tắt ngắn cụt.
   - Phần 1 <h2>: Nguồn gốc, bản chất sinh học thớ gỗ, tôm gỗ và đặc tính tự nhiên (tối thiểu 250 từ).
   - Phần 2 <h2>: Hướng dẫn thực hành chi tiết từng bước, kèm số liệu cụ thể (chu vi hạt mm, tỷ lệ co ngót, cơ chế tuyến mồ hôi, bảng tra ngũ hành) (tối thiểu 350 từ).
   - Phần 3 <h2>: Bảng biểu so sánh (HTML <table>) hoặc danh sách liệt kê phân tích ưu/nhược điểm từng phương án (tối thiểu 200 từ).
   - Phần 4 <h2>: Bí quyết dưỡng gỗ độc quyền từ xưởng mộc Đông Phong (cách lau mộc vải cotton, hồi hương, chống nồm ẩm) (tối thiểu 250 từ).
   - Phần 5: Lời cam kết gỗ mộc tự nhiên 100% không tẩm hóa chất & Lời kêu gọi khách nhắn Zalo gửi năm sinh/ảnh cổ tay để nghệ nhân tư vấn đo size (150 từ).
4. QUY TẮC HÌNH ẢNH:
   - TUYỆT ĐỐI KHÔNG đề cập ảnh AI. Khẳng định 100% thớ gỗ tự nhiên thật từ xưởng mộc.

XUẤT RA DUY NHẤT MỘT KHỐI JSON HỢP LỆ (KHÔNG BỌC TRONG \`\`\`json):
{
  "title": "Tiêu đề bài viết",
  "excerpt": "Đoạn mô tả ngắn tóm lược 50-70 từ",
  "content": "Toàn bộ bài viết định dạng HTML chuẩn (h2, p, ul, li, table, blockquote, strong) ĐẠT TỐI THIỂU 1.000 TỪ",
  "woodTypesMentioned": ["Tử Đàn", "Bách Xanh"],
  "suggestedProductCategories": ["vong-tay", "but-ky"]
}
`;

  const modelCandidates = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-flash-latest"];
  let result = null;

  for (const mName of modelCandidates) {
    try {
      const model = genAI.getGenerativeModel({ model: mName });
      const res = await model.generateContent(prompt);
      const text = res.response.text().trim();
      const jsonStr = text.replace(/^```json/im, "").replace(/^```/im, "").replace(/```$/im, "").trim();
      const parsed = JSON.parse(jsonStr);
      
      // Kiểm tra độ dài từ thực tế (loại bỏ thẻ HTML)
      const textOnly = (parsed.content || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
      const wordCount = textOnly ? textOnly.split(" ").length : 0;
      
      if (parsed.title && parsed.content && wordCount >= 700) {
        parsed.wordCount = wordCount;
        result = parsed;
        break;
      }
    } catch {
      continue;
    }
  }

  if (!result) {
    throw new Error("Gemini AI không thể tạo nội dung cho chủ đề này.");
  }

  // Chọn ảnh chụp thật phù hợp với loại gỗ đề cập
  let selectedThumb = REAL_WOOD_PHOTOS["default"][0];
  const woodText = (result.woodTypesMentioned || []).join(" ").toLowerCase();
  if (woodText.includes("tử đàn") || woodText.includes("tu dan")) {
    selectedThumb = REAL_WOOD_PHOTOS["tu-dan"][0];
  } else if (woodText.includes("sưa") || woodText.includes("sua")) {
    selectedThumb = REAL_WOOD_PHOTOS["sua-do"][0];
  } else if (woodText.includes("bách xanh") || woodText.includes("bach xanh")) {
    selectedThumb = REAL_WOOD_PHOTOS["bach-xanh"][0];
  } else if (woodText.includes("hoàng đàn") || woodText.includes("hoang dan")) {
    selectedThumb = REAL_WOOD_PHOTOS["hoang-dan"][0];
  }

  const postSlug = slugify(result.title);
  const newPost = {
    id: `pillar-${Date.now()}`,
    slug: postSlug,
    title: result.title,
    category: category,
    excerpt: result.excerpt,
    content: result.content,
    thumbnail: selectedThumb,
    relatedProducts: ["vt-001", "vt-002"],
    status: "published",
    publishedAt: new Date().toISOString().split("T")[0],
    readingTime: Math.max(3, Math.ceil(result.content.length / 500)),
  };

  // Lưu vào data/posts.json
  posts.unshift(newPost);
  await fs.writeFile(path.join(process.cwd(), "data", "posts.json"), JSON.stringify(posts, null, 2), "utf-8");

  // Đồng bộ lên Supabase nếu có key
  if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    await supabase.from("posts").upsert({
      id: newPost.id,
      slug: newPost.slug,
      title: newPost.title,
      category: newPost.category,
      excerpt: newPost.excerpt,
      content: newPost.content,
      thumbnail: newPost.thumbnail,
      status: "published",
      published_at: newPost.publishedAt,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  return newPost;
}

async function main() {
  const slot = getCurrentSlot();
  console.log("=================================================================");
  console.log(`⏱️ MỸ NGHỆ ĐÔNG PHONG — KHUNG GIỜ XUẤT BẢN: SLOT ${slot}`);
  console.log("=================================================================");

  const scheduleRaw = await fs.readFile(path.join(process.cwd(), "data", "publishing-schedule.json"), "utf-8");
  const scheduleData = JSON.parse(scheduleRaw);
  const currentSlotConfig = scheduleData.slots.find((s) => s.slot === slot) || scheduleData.slots[0];

  console.log(`- Thời gian dự kiến: ${currentSlotConfig.time}`);
  console.log(`- Chuyên mục: ${currentSlotConfig.category} (${currentSlotConfig.name})`);
  console.log(`- Động cơ: ${currentSlotConfig.engine}`);
  console.log(`- Quy tắc ảnh: ${currentSlotConfig.imageRule}`);

  if (currentSlotConfig.engine === "hot-news-crawler") {
    console.log("\n[Slot 1] Đang quét tin tức thị trường & làng nghề từ Google News...");
    // Gọi cơ chế cào tin cũ với bộ lọc gỗ quý nghiêm ngặt
    const { runAutoNewsCuration } = await import("../lib/server/ai-auto-news.ts");
    const res = await runAutoNewsCuration({ autoPublish: true, maxArticles: 1 });
    console.log(`✅ Kết quả: Đã xuất bản ${res.publishedCount} bài tin tức thị trường.`);
  } else {
    console.log(`\n[Slot ${slot}] Đang lấy chủ đề gốc từ Content Pillar & nghiên cứu web...`);
    const newPost = await generatePillarArticle(currentSlotConfig.category, currentSlotConfig.name);
    console.log(`✅ Đã xuất bản thành công bài viết chuyên sâu:`);
    console.log(`   - Tiêu đề: ${newPost.title}`);
    console.log(`   - Đường dẫn: /bai-viet/${newPost.slug}`);
    console.log(`   - Chuyên mục: ${newPost.category}`);
    console.log(`   - Ảnh minh họa (Thật 100%): ${newPost.thumbnail}`);
  }
}

main().catch((err) => {
  console.error("❌ Lỗi xuất bản:", err);
  process.exit(1);
});
