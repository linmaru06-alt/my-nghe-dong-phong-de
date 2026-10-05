
import fs from "fs/promises";
import path from "path";
import Parser from "rss-parser";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getAllPosts, savePosts, type Post } from "@/lib/server/posts";
import { supabaseAdmin } from "@/lib/supabase";
import { crawlFullArticle } from "@/lib/server/article-crawler";

const CURATED_WOOD_IMAGES: Record<string, string> = {
  "bach-xanh":
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCCNKBoBrwOVLNiOqQ8du_TmY5jBOS0MshjNuG1MdshoWGLypsTb-F9wxVkgBG1t6SCw6icr3PLdI-jfAm_AluCifaVI2rgr2Ga33BwtZgSbXGvCUcwmgT-j_h78V4vqykKtMIHQ7Ftofa2WDl8PVK42pBCLIRikOefIvSYD0dxIAwJJTu7HpGGVA6IYeFHNEXVr6bIN_kKOz0s006qv8Yu5OY7nxlbLxr_gPBoHKXfqFjco5OZYRvZAA",
  "tu-dan":
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAAKSe5vnL2SBorGy44O6b058sBu3A6PBVavoMl6Em4Q7FxueSYXQJ-OYz1dBhas22gmAuDK3Ag27pjiPFzYtgrnVGzIjmlPlgLkQGi4EmysuHp7mXhyQgdb6E6nAAAzh7hzRFjhPE6Gn8WN1vhHMDr3-dDeQm_KnpiMptIjTtMwib-7OydRmpsCyVIupIMC_ZLI2FXlduTjXOQmZUAJWj8fBcJz7-pSbPWlaFUg6R4f8fXLzQ-Hibn1Q",
  "sua-do":
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDCLQJSGdzaUzbEkMos_gG-Lv-rr3CSwjE2etFuYUNOfx0eCiXkCoYPmcxswPcSPurehR927s_SWSA194dvIczQefMExkza4lS9aT67RlZln9n-zVT8zSZvMpCxCVW_I2KZZ13sHfsiTCtmqOXHuZguG_AH4Pe3WnkgOHKO6jxPpTQG9Lc1onk9PFr2ErRTff7PoyINdXZCXcTVuOk-edSMohvHfr9aHfIn_z256Ozn0Mhypti_f7jm7A",
  "hoang-dan":
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAAKSe5vnL2SBorGy44O6b058sBu3A6PBVavoMl6Em4Q7FxueSYXQJ-OYz1dBhas22gmAuDK3Ag27pjiPFzYtgrnVGzIjmlPlgLkQGi4EmysuHp7mXhyQgdb6E6nAAAzh7hzRFjhPE6Gn8WN1vhHMDr3-dDeQm_KnpiMptIjTtMwib-7OydRmpsCyVIupIMC_ZLI2FXlduTjXOQmZUAJWj8fBcJz7-pSbPWlaFUg6R4f8fXLzQ-Hibn1Q",
  "kien-truc":
    "https://lh3.googleusercontent.com/aida-public/AB6AXuA0ZQTkMxoeFqbUb51lzz1AWErlK8e8YqLdwyuV4VJhgCI6QwEibA2s7vaIeMR-r6rVV3viNAWKTq8y3eR9jq_tmV5BhOHoNtA54qsNxbsxhqUFZ7VbvmKkLCnVafZbWgIq-WfpeK20LradYiSqBqZgFL5XA4LqXodTe4Nk3_30SvhuGdAqdtDwUVuwuLFiPDO-KKfveLVWqHTu1WVMx8dmwtwC3RBJsP69PNC97pbAfZ1m8rq-Zqucew",
  "default":
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCCNKBoBrwOVLNiOqQ8du_TmY5jBOS0MshjNuG1MdshoWGLypsTb-F9wxVkgBG1t6SCw6icr3PLdI-jfAm_AluCifaVI2rgr2Ga33BwtZgSbXGvCUcwmgT-j_h78V4vqykKtMIHQ7Ftofa2WDl8PVK42pBCLIRikOefIvSYD0dxIAwJJTu7HpGGVA6IYeFHNEXVr6bIN_kKOz0s006qv8Yu5OY7nxlbLxr_gPBoHKXfqFjco5OZYRvZAA",
};

/**
 * Ưu tiên 100% ảnh thật từ bài báo gốc. Chỉ dùng ảnh mẫu nếu bài báo hoàn toàn không có ảnh
 */
function selectSmartThumbnail(item: RawNewsItem, processed: ProcessedArticle): string {
  if (item.imageUrl && item.imageUrl.startsWith("http")) {
    return item.imageUrl;
  }
  const text = (processed.title + " " + (processed.woodTypesMentioned || []).join(" ")).toLowerCase();
  if (text.includes("bách xanh") || text.includes("bach xanh")) return CURATED_WOOD_IMAGES["bach-xanh"];
  if (text.includes("tử đàn") || text.includes("tu dan")) return CURATED_WOOD_IMAGES["tu-dan"];
  if (text.includes("sưa") || text.includes("sua")) return CURATED_WOOD_IMAGES["sua-do"];
  if (text.includes("hoàng đàn") || text.includes("hoang dan")) return CURATED_WOOD_IMAGES["hoang-dan"];
  if (text.includes("nhà cổ") || text.includes("kiến trúc") || text.includes("đốc phủ sứ") || text.includes("cột gỗ")) {
    return CURATED_WOOD_IMAGES["kien-truc"];
  }
  return CURATED_WOOD_IMAGES["default"];
}

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
  imageUrl?: string;
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
 * Thu thập tin tức từ các nguồn báo chính thống uy tín của Việt Nam
 */
async function fetchRawNews(sourcesPath: string, maxItemsPerSource = 5): Promise<RawNewsItem[]> {
  const parser = new Parser({
    timeout: 10000,
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 DongPhongNewsAgent/2.0",
    },
  });

  let sources: NewsSource[] = [];
  try {
    const raw = await fs.readFile(sourcesPath, "utf-8");
    sources = JSON.parse(raw);
  } catch {
    sources = [
      {
        name: "Dân Trí - Văn Hóa & Đời Sống",
        url: "https://dantri.com.vn/rss/van-hoa.rss",
      },
      {
        name: "Dân Trí - Đời Sống",
        url: "https://dantri.com.vn/rss/doi-song.rss",
      },
      {
        name: "VnExpress - Đời Sống",
        url: "https://vnexpress.net/rss/doi-song.rss",
      },
      {
        name: "VnExpress - Khoa Học & Môi Trường",
        url: "https://vnexpress.net/rss/khoa-hoc.rss",
      },
      {
        name: "Thanh Niên - Văn Hóa",
        url: "https://thanhnien.vn/rss/van-hoa.rss",
      },
      {
        name: "Google News - Gỗ Quý & Đồ Gỗ Phong Thủy",
        url: "https://news.google.com/rss/search?q=%22g%E1%BB%97+qu%C3%BD%22+OR+%22g%E1%BB%97+s%C6%B0a%22+OR+%22g%E1%BB%97+t%E1%BB%AD+%C4%91%C3%A0n%22&hl=vi&gl=VN&ceid=VN:vi",
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
          let imgUrl = "";
          if (it.enclosure && (it.enclosure as any).url) {
            imgUrl = (it.enclosure as any).url;
          } else if (it.content) {
            const match = it.content.match(/<img[^>]+src=["']([^"']+)["']/i);
            if (match) imgUrl = match[1];
          }
          allItems.push({
            title: it.title.trim(),
            link: it.link.trim(),
            content: it.contentSnippet || it.content || it.summary || "",
            pubDate: it.pubDate,
            sourceName: src.name,
            imageUrl: imgUrl || undefined,
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
 * Prompt Suite: Tác giả Nghệ nhân Đông Phong — Biên soạn chuyên sâu 800 - 1.200 từ chuẩn E-E-A-T & GEO
 */
function buildAihotPrompt(item: RawNewsItem): string {
  return `
Bạn là Nghệ nhân trưởng kiêm Trưởng Ban Biên Tập của thương hiệu "Mỹ Nghệ Đông Phong" (thương hiệu đồ gỗ quý, thủ công mỹ nghệ và phong thủy cao cấp).
Dưới đây là TOÀN VĂN NỘI DUNG VÀ THÔNG TIN BÀI BÁO THẬT thu thập được:
- Nguồn tin gốc: ${item.sourceName}
- Tiêu đề bài báo gốc: ${item.title}
- Toàn văn bài báo gốc:
"""
${item.content}
"""
- Đường dẫn bài báo: ${item.link}
- Ảnh thực tế của bài báo: ${item.imageUrl || "Không có ảnh"}

HÃY TUÂN THỦ NGHIÊM NGẶT CÁC BỘ QUY TẮC CỐT LÕI ĐỂ BIÊN SOẠN BÀI VIẾT ĐẲNG CẤP:

【QUY TẮC 1: ĐỘ DÀI VÀ CHIỀU SÂU CHUYÊN GIA (BẮT BUỘC 800 - 1.200 TỪ)】
- Bài viết PHẢI ĐỦ DÀI, CHI TIẾT (TỐI THIỂU 800 TỪ), tuyệt đối không viết tóm tắt ngắn ngủn vài trăm từ.
- Khai thác tối đa các chi tiết, số liệu, năm tháng, con người, địa danh và sự kiện thực tế có trong bài báo gốc.
- Phân tích dưới góc nhìn chuyên sâu của một nghệ nhân mộc truyền thống am hiểu tường tận về các loại gỗ quý (Tử đàn, Sưa đỏ, Bách xanh, Hoàng đàn, Mun sừng, Trắc...).

【QUY TẮC 2: CẤU TRÚC 5 PHẦN CHUẨN MỰC (ĐỊNH DẠNG HTML)】
Bài viết bắt buộc phải có đủ 5 phần với các thẻ <h2>, <p>, <ul>, <li>, <blockquote>:
1. <h2> mở đầu: Trực diện 50 - 70 từ (chuẩn GEO Answer-First) giải thích ngay cốt lõi sự kiện/tác phẩm.
2. <h2>: Nguồn gốc, niên đại lịch sử và câu chuyện thực tế từ bài báo.
3. <h2>: Góc nhìn nghệ nhân mộc: Bóc tách chất gỗ, tom gỗ, thớ gỗ, đường vân, mộng thắt cổ truyền và lý do gỗ trường tồn qua thời gian.
4. <h2>: Giá trị phong thủy, năng lượng vượng khí và hương thơm tự nhiên của gỗ quý đối với không gian sống của gia chủ.
5. <h2>: Lời khuyên dưỡng gỗ & gìn giữ tinh hoa từ Mỹ Nghệ Đông Phong (cách giữ vân, bảo quản tự nhiên, nói không với hóa chất độc hại).

【QUY TẮC 3: ĐÁNH GIÁ ĐỘ PHÙ HỢP】
- Nếu bài viết hoàn toàn không liên quan đến: Đồ gỗ quý, Thủ công mỹ nghệ, Kiến trúc mộc, Di sản văn hóa, Làng nghề truyền thống, Cây gỗ quý, hoặc Phong thủy đời sống, hãy trả về ĐÚNG chữ: "SKIP".
- Điểm phù hợp (relevanceScore) từ 1 đến 10. Chỉ xuất bản bài có điểm >= 7.

【ĐỊNH DẠNG ĐẦU RA】
XUẤT RA DUY NHẤT MỘT KHỐI JSON HỢP LỆ (KHÔNG BỌC TRONG \`\`\`json):
{
  "title": "Tiêu đề tự chứa nghĩa, trang nhã, cuốn hút người sành gỗ",
  "excerpt": "Đoạn mở đầu trực diện 50-70 từ trả lời ngay nội dung cốt lõi",
  "content": "Toàn văn bài viết chuyên sâu tối thiểu 800 - 1.200 từ với đầy đủ các thẻ <h2>, <p>, <ul>, <li>, <blockquote>",
  "relevanceScore": 8,
  "woodTypesMentioned": ["Tử Đàn", "Sưa", "Bách Xanh"],
  "suggestedProductCategories": ["vong-tay", "but-ky", "bi-lan-tay"]
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

  // Danh sách model Google Gemini thế hệ mới nhất
  const modelCandidates = [
    "gemini-3.5-flash-lite",
    "gemini-3.1-flash-lite",
    "gemini-3.8-flash",
    "gemini-flash-latest",
  ];

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

    let extraImages: { url: string; caption: string }[] = [];
    try {
      console.log(`[AI Auto-News] 🌐 Đang cào toàn văn bài báo gốc từ: ${item.link}`);
      const crawled = await crawlFullArticle(item.link);
      if (crawled.fullContent && crawled.wordCount >= 60) {
        item.content = crawled.fullContent;
        console.log(`[AI Auto-News] 📄 Cào thành công ${crawled.wordCount} từ bài báo gốc.`);
      }
      if (crawled.permanentImageUrl) {
        item.imageUrl = crawled.permanentImageUrl;
        console.log(`[AI Auto-News] 🖼️ Ảnh bài báo gốc đã rehost thành công: ${crawled.permanentImageUrl}`);
      } else if (crawled.leadImage) {
        item.imageUrl = crawled.leadImage;
      }
      if (crawled.inArticleImages && crawled.inArticleImages.length > 0) {
        extraImages = crawled.inArticleImages;
      }
    } catch (crawlErr: any) {
      console.warn(`[AI Auto-News] Lỗi khi cào bài báo ${item.link}:`, crawlErr.message);
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

      const articleThumbnail = selectSmartThumbnail(item, processed);
      let enrichedContent = processed.content;

      // 1. Chèn ảnh đại diện chính vào sau thẻ </h2> đầu tiên
      if (!enrichedContent.includes("<figure") && !enrichedContent.includes("<img")) {
        enrichedContent = enrichedContent.replace(
          "</h2>",
          `</h2><figure class="my-6 text-center"><img src="${articleThumbnail}" alt="${processed.title}" class="rounded-xl w-full max-h-[460px] object-cover shadow-sm mx-auto" /><figcaption class="text-xs text-text-muted mt-2 italic font-light">Hình ảnh ghi nhận thực tế từ bài viết gốc kết hợp tư liệu gỗ quý Mỹ Nghệ Đông Phong</figcaption></figure>`
        );
      }

      // 2. Chèn ảnh chụp thực tế bổ sung (nếu bài báo gốc có nhiều ảnh thật)
      if (extraImages.length > 0 && extraImages[0].url) {
        const secondImg = extraImages[0];
        let idx = -1;
        let count = 0;
        while ((idx = enrichedContent.indexOf("</h2>", idx + 1)) !== -1) {
          count++;
          if (count === 3) {
            const insertPos = idx + 5;
            const figureHtml = `\n<figure class="my-6 text-center"><img src="${secondImg.url}" alt="${secondImg.caption || processed.title}" class="rounded-xl w-full max-h-[460px] object-cover shadow-sm mx-auto" /><figcaption class="text-xs text-text-muted mt-2 italic font-light">${secondImg.caption || "Cận cảnh chi tiết tác phẩm thủ công truyền thống"}</figcaption></figure>\n`;
            enrichedContent = enrichedContent.slice(0, insertPos) + figureHtml + enrichedContent.slice(insertPos);
            break;
          }
        }
      }
      const newPost: Post = {
        id: `ai-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        title: processed.title,
        slug: finalSlug,
        category: "tin-tuc",
        excerpt: processed.excerpt,
        content: enrichedContent,
        thumbnail: articleThumbnail,
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
        model_used: "gemini-3.8-flash",
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
