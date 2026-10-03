import fs from "fs/promises";
import path from "path";
import Parser from "rss-parser";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getAllPosts, savePosts, type Post } from "@/lib/server/posts";
import { supabaseAdmin } from "@/lib/supabase";

interface NewsSource {
  name: string;
  url: string;
}

interface RawNewsItem {
  title: string;
  link: string;
  content: string;
  pubDate?: string;
  sourceName: string;
}

interface ProcessedArticle {
  title: string;
  excerpt: string;
  content: string;
  relevanceScore: number;
  woodTypesMentioned?: string[];
  suggestedProductSkus?: string[];
}

function slugify(text: string): string {
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
 * Thu thập tin tức từ các nguồn RSS chuyên ngành và Google News
 */
async function fetchRawNews(sourcesPath: string, maxItemsPerSource = 5): Promise<RawNewsItem[]> {
  const parser = new Parser({
    timeout: 10000,
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 DongPhongNewsAgent/1.0",
    },
  });

  let sources: NewsSource[] = [];
  try {
    const raw = await fs.readFile(sourcesPath, "utf-8");
    sources = JSON.parse(raw);
  } catch {
    sources = [
      {
        name: "Google News - Gỗ Quý & Đồ Gỗ Phong Thủy",
        url: "https://news.google.com/rss/search?q=%22g%E1%BB%97+qu%C3%BD%22+OR+%22g%E1%BB%97+s%C6%B0a%22+OR+%22g%E1%BB%97+t%E1%BB%AD+%C4%91%C3%A0n%22&hl=vi&gl=VN&ceid=VN:vi",
      },
      {
        name: "VnExpress Đời Sống",
        url: "https://vnexpress.net/rss/doi-song.rss",
      },
    ];
  }

  const allItems: RawNewsItem[] = [];

  for (const src of sources) {
    try {
      console.log(`[AI Auto-News] Đang quét nguồn: ${src.name}`);
      const feed = await parser.parseURL(src.url);
      const items = (feed.items || []).slice(0, maxItemsPerSource);

      for (const it of items) {
        if (it.title && it.link) {
          allItems.push({
            title: it.title.trim(),
            link: it.link.trim(),
            content: it.contentSnippet || it.content || it.summary || "",
            pubDate: it.pubDate,
            sourceName: src.name,
          });
        }
      }
    } catch (err: any) {
      console.warn(`[AI Auto-News] Bỏ qua nguồn ${src.name}: ${err.message}`);
    }
  }

  return allItems;
}

/**
 * Prompt Suite kế thừa từ AIHOT: Chống ảo giác + Đưa câu trả lời lên đầu (GEO) + Tiêu đề tự chứa nghĩa
 */
function buildAihotPrompt(item: RawNewsItem): string {
  return `
Bạn là Trưởng Ban Biên Tập của thương hiệu "Mỹ Nghệ Đông Phong" (thương hiệu đồ gỗ quý, thủ công mỹ nghệ và phong thủy cao cấp).
Dưới đây là một tin tức mới thu thập được:
- Nguồn tin: ${item.sourceName}
- Tiêu đề gốc: ${item.title}
- Tóm tắt/Nội dung gốc: ${item.content}
- Đường dẫn: ${item.link}

HÃY TUÂN THỦ NGHIÊM NGẶT 3 BỘ QUY TẮC CỐT LÕI (KẾ THỪA TỪ AIHOT):

【QUY TẮC 1: CHỐNG ẢO GIÁC - ANTI-HALLUCINATION】
1. Nghiêm cấm bịa đặt các số liệu, đặc tính sinh học, niên đại cây hoặc công dụng tâm linh mà nguồn tin gốc KHÔNG ĐỀ CẬP.
2. Không tự ý phán đoán tuổi gỗ nếu bài gốc không nêu rõ.
3. Nếu bài viết không liên quan đến: Đồ gỗ quý, Thủ công mỹ nghệ, Điêu khắc mộc, Kiến trúc nội thất, Làng nghề truyền thống, hoặc Phong thủy đời sống, trả về ĐÚNG chữ: "SKIP".

【QUY TẮC 2: CÂU TRẢ LỜI ĐẶT LÊN ĐẦU - ANSWER-FIRST SUMMARY (CHUẨN GEO)】
- Đoạn mở đầu (excerpt) bắt buộc từ 40 - 70 từ, trả lời trực diện: "Ai làm gì, sự kiện/kết quả cốt lõi là gì?".
- Tuyệt đối KHÔNG mở đầu bằng các câu sáo rỗng như: "Bài viết này giới thiệu...", "Theo thông tin từ...", "Chúng ta hãy cùng tìm hiểu...".

【QUY TẮC 3: TIÊU ĐỀ TỰ CHỨA NGHĨA - SELF-CONTAINED TITLE】
- Tiêu đề phải nêu bật chủ thể cụ thể (loại gỗ quý, tác phẩm, kỹ nghệ, làng nghề), hấp dẫn, chuẩn phong vị tinh hoa đồ gỗ cao cấp.

【ĐÁNH GIÁ CHẤT LƯỢNG (RELEVANCE SCORE)】
- Chấm điểm độ phù hợp từ 1 đến 10 với thương hiệu Mỹ Nghệ Đông Phong.

NẾU BÀI PHÙ HỢP (Điểm >= 7), HÃY XUẤT RA DUY NHẤT MỘT KHỐI JSON (KHÔNG BỌC TRONG \`\`\`json):
{
  "title": "Tiêu đề tự chứa nghĩa, chuẩn văn phong trang nhã",
  "excerpt": "Đoạn tóm tắt trực diện 40-70 từ trả lời ngay nội dung cốt lõi",
  "content": "Nội dung bài viết chi tiết, diễn giải lưu loát với định dạng HTML chuẩn (gồm các thẻ <h2>, <p>, <ul>, <li>, <blockquote>). Khuyên người đọc chú trọng giá trị gỗ thật tự nhiên.",
  "relevanceScore": 8,
  "woodTypesMentioned": ["Tử Đàn", "Sưa", "Bách Xanh"],
  "suggestedProductCategories": ["vong-tay", "but-ky"]
}
`;
}

/**
 * Gọi Gemini AI xử lý bài viết
 */
async function processWithGemini(
  genAI: GoogleGenerativeAI,
  item: RawNewsItem
): Promise<ProcessedArticle | null> {
  const prompt = buildAihotPrompt(item);

  // Thử model gemini-1.5-flash trước, nếu lỗi chuyển gemini-pro
  const modelCandidates = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];

  for (const modelName of modelCandidates) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const res = await model.generateContent(prompt);
      const text = res.response.text().trim();

      if (!text || text.includes("SKIP") || text === "SKIP") {
        return null;
      }

      const jsonStr = text
        .replace(/^```json/im, "")
        .replace(/^```/im, "")
        .replace(/```$/im, "")
        .trim();

      const parsed: ProcessedArticle = JSON.parse(jsonStr);
      if (parsed.title && parsed.content && (parsed.relevanceScore || 0) >= 7) {
        return parsed;
      }
      return null;
    } catch (err: any) {
      console.warn(`[AI Auto-News] Thử model ${modelName} thất bại: ${err.message}`);
    }
  }

  return null;
}

/**
 * Gợi ý mã SKU sản phẩm liên quan dựa trên loại gỗ
 */
function findRelatedProductIds(
  woodTypes: string[] = [],
  availableProducts: any[] = []
): string[] {
  const matchedIds = new Set<string>();

  for (const wood of woodTypes) {
    const lowerWood = wood.toLowerCase();
    for (const prod of availableProducts) {
      const prodWood = (prod.woodType || "").toLowerCase();
      const prodName = (prod.name || "").toLowerCase();

      if (prodWood.includes(lowerWood) || prodName.includes(lowerWood)) {
        matchedIds.add(prod.id);
      }
    }
  }

  return Array.from(matchedIds).slice(0, 3);
}

/**
 * ĐỘNG CƠ TỰ ĐỘNG CÀO VÀ ĐĂNG BÀI 100% (FULL AUTO)
 */
export async function runAutoNewsCuration(options: {
  autoPublish?: boolean;
  maxArticles?: number;
  sourcesPath?: string;
} = {}): Promise<{
  success: boolean;
  publishedCount: number;
  skippedCount: number;
  publishedArticles: Array<{ id: string; title: string; slug: string }>;
  error?: string;
}> {
  const autoPublish = options.autoPublish !== false; // Mặc định true (Tự động đăng)
  const maxArticles = options.maxArticles || 3;
  const sourcesPath =
    options.sourcesPath || path.join(process.cwd(), "scripts", "news-sources.json");

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("[AI Auto-News] Thiếu GEMINI_API_KEY trong biến môi trường");
    return {
      success: false,
      publishedCount: 0,
      skippedCount: 0,
      publishedArticles: [],
      error: "Vui lòng cấu hình GEMINI_API_KEY trong .env.local",
    };
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  // 1. Đọc danh sách bài viết hiện có để chống trùng lặp
  const existingPosts = await getAllPosts();
  const existingSlugs = new Set(existingPosts.map((p) => p.slug.toLowerCase()));
  const existingTitles = new Set(existingPosts.map((p) => p.title.toLowerCase()));

  // Đọc danh sách sản phẩm để gắn liên kết SKU tự động
  let productsList: any[] = [];
  try {
    const prodFile = await fs.readFile(
      path.join(process.cwd(), "data", "products.json"),
      "utf-8"
    );
    productsList = JSON.parse(prodFile);
  } catch {}

  // 2. Thu thập tin tức từ các nguồn
  const rawItems = await fetchRawNews(sourcesPath, 8);
  console.log(`[AI Auto-News] Thu thập được ${rawItems.length} tin thô từ các nguồn.`);

  const newPostsToSave: Post[] = [];
  let skipped = 0;

  for (const item of rawItems) {
    if (newPostsToSave.length >= maxArticles) break;

    const baseSlug = slugify(item.title);
    if (existingSlugs.has(baseSlug) || existingTitles.has(item.title.toLowerCase())) {
      skipped++;
      continue;
    }

    console.log(`[AI Auto-News] Đang phân tích tin: "${item.title}"`);
    const processed = await processWithGemini(genAI, item);

    if (processed) {
      let finalSlug = slugify(processed.title);
      if (existingSlugs.has(finalSlug)) {
        finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
      }

      const relatedIds = findRelatedProductIds(
        processed.woodTypesMentioned,
        productsList
      );

      const wordCount = processed.content.replace(/<[^>]*>/g, "").split(/\s+/).length;
      const readingTime = Math.max(3, Math.ceil(wordCount / 200));

      const newPost: Post = {
        id: `ai-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        title: processed.title,
        slug: finalSlug,
        category: "tin-tuc",
        excerpt: processed.excerpt,
        content: processed.content,
        thumbnail:
          "/assets/images/articles/default.webp",
        relatedProducts: relatedIds.length > 0 ? relatedIds : ["vt-001", "vt-002"],
        status: autoPublish ? "published" : "draft",
        publishedAt: new Date().toISOString().split("T")[0],
        readingTime,
      };

      newPostsToSave.push(newPost);
      existingSlugs.add(finalSlug);
      existingTitles.add(processed.title.toLowerCase());
      console.log(`[AI Auto-News] ✅ ĐÃ TẠO BÀI VIẾT: "${newPost.title}" (Status: ${newPost.status})`);
    } else {
      skipped++;
    }

    // Delay 1.5s giữa các lần gọi Gemini để bảo vệ rate limit
    await new Promise((r) => setTimeout(r, 1500));
  }

  if (newPostsToSave.length === 0) {
    console.log("[AI Auto-News] Không có tin tức mới nào đạt tiêu chuẩn.");
    return {
      success: true,
      publishedCount: 0,
      skippedCount: skipped,
      publishedArticles: [],
    };
  }

  // 3. TỰ ĐỘNG ĐĂNG BÀI: Lưu bài viết mới lên đầu danh sách và đồng bộ Supabase + Cloudinary + Cache
  const mergedPosts = [...newPostsToSave, ...existingPosts];
  await savePosts(mergedPosts);

  // 4. Ghi nhận log nếu có Supabase
  try {
    const isSupabaseConfigured = Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
        !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")
    );
    if (isSupabaseConfigured) {
      await supabaseAdmin.from("ai_news_logs").insert({
        items_scanned: rawItems.length,
        items_accepted: newPostsToSave.length,
        items_skipped: skipped,
        model_used: "gemini-1.5-flash",
        status: "success",
      });
    }
  } catch {}

  console.log(`[AI Auto-News] 🎉 HOÀN TẤT: Đã tự động xuất bản ${newPostsToSave.length} bài viết mới lên website!`);

  return {
    success: true,
    publishedCount: newPostsToSave.length,
    skippedCount: skipped,
    publishedArticles: newPostsToSave.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
    })),
  };
}
