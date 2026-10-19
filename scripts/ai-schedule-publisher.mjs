/**
 * scripts/ai-schedule-publisher.mjs
 * Hệ thống xuất bản bài viết tự động theo 3 Khung Giờ Vàng — Mỹ Nghệ Đông Phong
 * Áp dụng tiêu chuẩn Copywriting đỉnh cao (Marketing Skills & GEO Search):
 * 
 * - Ca 1 (07:30 VN): Kiến thức danh mộc & Bách khoa gỗ quý thế giới (kien-thuc-ve-go)
 * - Ca 2 (11:30 VN): Bảo quản sản phẩm & Kỹ thuật dưỡng mộc (bao-quan-san-pham)
 * - Ca 3 (20:30 VN): Cẩm nang Phong thủy Ngũ Hành theo năm sinh & nghề nghiệp (huong-dan-lua-chon)
 * 
 * NGUYÊN TẮC CỐT LÕI V3.0:
 * 1. 100% Ảnh chụp thật TÌM KIẾM TRỰC TIẾP TRÊN MẠNG (từ báo chí & trang mộc chuyên ngành). TUYỆT ĐỐI KHÔNG DÙNG ẢNH AI.
 * 2. Mở bài bằng Hook sắc bén (Cut Throat-Clearing), KHÔNG mở bài bằng câu chào rập khuôn nghệ nhân.
 * 3. BỎ HOÀN TOÀN BẢNG SO SÁNH <table> (tránh tràn màn hình mobile, tránh rập khuôn khô cứng).
 * 4. Bố cục linh hoạt theo dòng chảy tâm lý (PAS Flow), nghiêm cấm viết độn chữ (Padding).
 * 5. Khối Hỏi - Đáp (FAQ) 3-4 câu dứt khoát cuối bài đón đầu Google AI Overviews Top 0.
 * 6. Chèn 2-3 liên kết nội bộ tự nhiên dẫn về sản phẩm / chuyên mục.
 * 7. Xoay vòng 5 mẫu Lời Kêu Gọi Zalo (Frictionless CTAs) giảm rào cản tâm lý mua hàng.
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

// 5 Mẫu Lời Kêu Gọi Zalo (Frictionless CTAs) giảm rào cản tâm lý mua hàng
const ZALO_CTA_TEMPLATES = [
  {
    type: "size-tay",
    text: "Chưa cần mua hàng, nếu quý bạn hữu còn phân vân kích thước hạt 10mm, 12mm hay 14mm vừa vặn với cổ tay mình, hãy nhắn ngay Zalo gửi ảnh cổ tay để nghệ nhân Đông Phong tư vấn đo size chuẩn xác hoàn toàn miễn phí."
  },
  {
    type: "ngu-hanh-nam-sinh",
    text: "Mỗi người sinh ra mang một nạp âm riêng biệt. Nhắn Zalo năm sinh âm lịch của bạn, xưởng sẽ tra cứu trực tiếp bảng ngũ hành và gợi ý chất gỗ tương sinh, vượng tài nhất."
  },
  {
    type: "qua-tang-doi-tac",
    text: "Quà tặng gỗ quý cần sự tinh tế tuyệt đối. Hãy gửi ngành nghề và độ tuổi người nhận qua Zalo, nghệ nhân sẽ gợi ý mẫu vật phẩm xứng tầm vị thế và trọn vẹn ý nghĩa phong thủy."
  },
  {
    type: "tham-dinh-that-gia",
    text: "Nếu bạn đang sở hữu một chuỗi hạt gỗ nhưng chưa rõ phôi mộc tự nhiên hay đã xử lý hóa chất, cứ gửi ảnh cận cảnh vân gỗ qua Zalo, nghệ nhân xưởng Đông Phong sẵn lòng thẩm định giúp bạn hoàn toàn miễn phí."
  },
  {
    type: "trai-nghiem-phoi-moc",
    text: "Trăm nghe không bằng một thấy. Hãy nhắn Zalo để nghệ nhân quay video cận cảnh từng thớ gỗ mộc thô trước khi tiện hạt và lên nước mộc thủ công dành riêng cho bạn."
  }
];

/**
 * Tự động tìm kiếm ảnh chụp thật trên mạng cho bài viết (Không dùng ảnh cố định Supabase)
 * Tìm kiếm đa nguồn: DuckDuckGo Image API + Web Scraping báo chí / trang mộc uy tín
 */
export async function findRealWebImage(title, woodTypes = []) {
  console.log(`[Web-Image-Search] 🔍 Đang tìm kiếm ảnh thật trên mạng cho: "${title}"...`);
  const queries = [];
  const lowerTitle = title.toLowerCase();

  const woodMap = [
    { key: "hoàng đàn", query: "gỗ hoàng đàn tuyết lạng sơn" },
    { key: "tử đàn", query: "vòng gỗ tử đàn tiểu diệp kim sa" },
    { key: "sưa đỏ", query: "vòng gỗ sưa đỏ bắc bộ vân mây" },
    { key: "bách xanh", query: "vòng gỗ bách xanh chìm nước mộc châu" },
    { key: "mun sừng", query: "gỗ mun sừng khánh hòa đen bóng" },
    { key: "huyết long", query: "vòng gỗ huyết long thấu quang" },
    { key: "trầm hương", query: "vòng trầm hương tự nhiên" },
    { key: "trắc", query: "vòng gỗ trắc đỏ đen tự nhiên" },
    { key: "cẩm lai", query: "bi lăn tay gỗ cẩm lai" }
  ];

  for (const item of woodMap) {
    if (lowerTitle.includes(item.key) || woodTypes.some((w) => w.toLowerCase().includes(item.key))) {
      queries.push(item.query);
      queries.push(`gỗ ${item.key} phôi mộc`);
    }
  }

  if (lowerTitle.includes("dụng thần") || lowerTitle.includes("hỷ thần") || lowerTitle.includes("mệnh")) {
    queries.push("vòng tay gỗ phong thủy tự nhiên cao cấp");
    queries.push("chuỗi hạt gỗ quý phong thủy");
  }

  if (lowerTitle.includes("bảo quản") || lowerTitle.includes("độ bền") || lowerTitle.includes("5 năm")) {
    queries.push("vòng gỗ phong thủy lên nước bóng đẹp");
    queries.push("kinh nghiệm đeo vòng gỗ quý lên nước");
  }

  if (queries.length === 0) {
    queries.push(`${title.slice(0, 35)} gỗ quý`);
  }

  const uniqueQueries = [...new Set(queries)];

  for (const q of uniqueQueries) {
    // 1. Thử qua DDG Image Search API
    try {
      const tokenRes = await fetch(`https://duckduckgo.com/?q=${encodeURIComponent(q)}&iax=images&ia=images`, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        },
        signal: AbortSignal.timeout(4000)
      });
      const html = await tokenRes.text();
      const vqdMatch = html.match(/vqd=([a-zA-Z0-9_-]+)/) || html.match(/vqd:\s*"([a-zA-Z0-9_-]+)"/);
      if (vqdMatch) {
        const vqd = vqdMatch[1];
        const apiRes = await fetch(`https://duckduckgo.com/i.js?l=wt-wt&o=json&q=${encodeURIComponent(q)}&vqd=${vqd}`, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Referer": "https://duckduckgo.com/"
          },
          signal: AbortSignal.timeout(4000)
        });
        const data = await apiRes.json();
        if (data.results && data.results.length > 0) {
          const candidates = data.results.filter((item) => {
            const url = (item.image || "").toLowerCase();
            return (
              url.startsWith("https://") &&
              !url.includes("logo") &&
              !url.includes("icon") &&
              !url.includes("avatar") &&
              !url.includes("shopee") &&
              !url.includes("lazada") &&
              (item.width ? item.width >= 400 : true)
            );
          });
          if (candidates.length > 0) {
            const chosen = candidates[Math.floor(Math.random() * Math.min(3, candidates.length))];
            console.log(`[Web-Image-Search] 🎯 Tìm thấy ảnh thật từ web API: ${chosen.image}`);
            return chosen.image;
          }
        }
      }
    } catch {}

    // 2. Thử qua DDG HTML Web Search + trích xuất trang web thật
    try {
      const searchRes = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(q)}`, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        },
        signal: AbortSignal.timeout(4000)
      });
      if (searchRes.ok) {
        const searchHtml = await searchRes.text();
        const uddgMatches = searchHtml.match(/uddg=([^&"']+)/gi) || [];
        for (const m of uddgMatches.slice(0, 4)) {
          const pageUrl = decodeURIComponent(m.replace("uddg=", ""));
          if (
            pageUrl.includes("youtube.") ||
            pageUrl.includes("facebook.") ||
            pageUrl.includes("shopee.") ||
            pageUrl.includes("lazada.")
          ) continue;

          try {
            const pageRes = await fetch(pageUrl, {
              headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
              },
              signal: AbortSignal.timeout(4000)
            });
            if (pageRes.ok) {
              const pageHtml = await pageRes.text();
              const ogMatch = pageHtml.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
                              pageHtml.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
              let imgUrl = ogMatch ? ogMatch[1] : null;
              if (!imgUrl) {
                const imgTag = pageHtml.match(/<img[^>]+(?:src|data-src)=["'](https?:\/\/[^"']+\.(?:jpg|jpeg|png|webp)[^"']*)["']/i);
                if (imgTag) imgUrl = imgTag[1];
              }
              if (imgUrl && imgUrl.startsWith("http")) {
                const lower = imgUrl.toLowerCase();
                if (!lower.includes("logo") && !lower.includes("icon") && !lower.includes("favicon")) {
                  console.log(`[Web-Image-Search] 🎯 Lấy ảnh thật từ website [${pageUrl}]:\n   ${imgUrl}`);
                  return imgUrl;
                }
              }
            }
          } catch {}
        }
      }
    } catch {}
  }

  // Backup pool các ảnh thật chất lượng cao từ web
  const webBackupPool = [
    "https://nhagohoangphuc.vn/uploads/go-sua-la-gi-3.jpg.webp",
    "https://dogoquangthich.com/wp-content/uploads/2019/06/Go-Hoang-Dan.jpg",
    "https://vuavonggo.com/wp-content/uploads/vong-go-bach-xanh-ban-lach-vua-vong-go-11.jpg",
    "https://vuavonggo.com/wp-content/uploads/Vong-go-huyet-long-thau-quang-ban-lach-vua-vong-go-07.jpg",
    "https://dogogiaan.com/wp-content/uploads/2019/04/Vong-go-sua-do-Viet-Nam-cover-2_result.jpg"
  ];
  return webBackupPool[Math.floor(Math.random() * webBackupPool.length)];
}

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
 * Xác định khung giờ hiện tại theo múi giờ Việt Nam (UTC+7) hoặc theo tham số dòng lệnh
 * - Ca 1: 05:00 - 10:00 VN -> Slot 1 (Kiến thức danh mộc & Gỗ quý thế giới)
 * - Ca 2: 10:00 - 15:00 VN -> Slot 2 (Bảo quản sản phẩm & Dưỡng mộc)
 * - Ca 3: 15:00 - 24:00 (hoặc trước 05:00) VN -> Slot 3 (Hướng dẫn lựa chọn / Phong thủy ngũ hành)
 */
function getCurrentSlot() {
  const args = process.argv.slice(2);
  const slotArg = args.find((a) => a.startsWith("--slot="));
  if (slotArg) {
    const parsed = parseInt(slotArg.split("=")[1], 10);
    if ([1, 2, 3].includes(parsed)) return parsed;
  }

  // Chuyển đổi chính xác sang múi giờ Việt Nam (UTC+7)
  const vnDate = new Date(Date.now() + 7 * 60 * 60 * 1000);
  const vnHour = vnDate.getUTCHours();

  if (vnHour >= 5 && vnHour < 10) return 1;
  if (vnHour >= 10 && vnHour < 15) return 2;
  return 3;
}

function extractAndParseJson(text) {
  if (!text) throw new Error("Phản hồi rỗng từ Gemini");
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch (err1) {
    const startIdx = cleaned.indexOf("{");
    const endIdx = cleaned.lastIndexOf("}");
    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      const sub = cleaned.slice(startIdx, endIdx + 1);
      try {
        return JSON.parse(sub);
      } catch (err2) {
        const fixed = sub
          .replace(/[\u0000-\u001F]+/g, (match) => (match.includes("\n") ? "\\n" : " "))
          .replace(/,\s*([}\]])/g, "$1");
        return JSON.parse(fixed);
      }
    }
    throw err1;
  }
}

/**
 * Lựa chọn ngẫu nhiên CTA Zalo không trùng lặp và loại bỏ bảng <table> nếu AI vô tình sinh ra
 */
function postProcessContent(rawContent, category) {
  let content = rawContent || "";

  // 1. NGHIÊM CẤM THẺ <table>: Chuyển đổi table thành danh sách sạch đẹp nếu có
  if (content.includes("<table")) {
    console.warn("[Post-Process] Phát hiện thẻ <table> trong nội dung — đang tiến hành dọn dẹp loại bỏ bảng...");
    content = content
      .replace(/<table[^>]*>[\s\S]*?<\/table>/gi, (tableHtml) => {
        const rows = tableHtml.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || [];
        const items = [];
        for (const row of rows) {
          const cells = row.match(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi) || [];
          const textList = cells.map((c) => c.replace(/<[^>]*>/g, "").trim()).filter(Boolean);
          if (textList.length >= 2) {
            items.push(`<li><strong>${textList[0]}:</strong> ${textList.slice(1).join(" — ")}</li>`);
          } else if (textList.length === 1) {
            items.push(`<li>${textList[0]}</li>`);
          }
        }
        return items.length ? `<ul>${items.join("")}</ul>` : "";
      });
  }

  // 2. Chèn tự nhiên 2-3 liên kết nội bộ nếu bài viết chưa có đủ
  const hasProductLink = content.includes("/san-pham/");

  if (!hasProductLink) {
    if (content.includes("vòng tay")) {
      content = content.replace(/(vòng tay gỗ(?: quý| phong thủy)?)/i, '<a href="/san-pham/vong-tay">$1</a>');
    } else if (content.includes("bút ký")) {
      content = content.replace(/(bút ký(?: phong thủy| gỗ)?)/i, '<a href="/san-pham/but-ky">$1</a>');
    }
  }

  // 3. Tự động loại bỏ đánh số thứ tự ở đầu các tiêu đề <h2>, <h3> (VD: <h2>1. ..., <h3>Phần 1: ...)
  content = content.replace(/<(h[2-4])[^>]*>\s*(\d+[\.\)]|\bPhần\s+\d+[:\.]?)\s*/gi, '<$1>');

  // 4. Đảm bảo có CTA Zalo chuẩn và số Hotline Đông Phong
  const randomCta = ZALO_CTA_TEMPLATES[Math.floor(Math.random() * ZALO_CTA_TEMPLATES.length)];
  const ctaBlock = `
<div class="my-8 p-6 bg-[#FAF6F0] border-l-4 border-[#C5A059] rounded-r-xl shadow-sm">
  <p class="font-serif font-bold text-lg text-[#3D2314] mb-2">Lời tâm sự từ xưởng mộc Mỹ Nghệ Đông Phong</p>
  <p class="text-[#5A4A42] leading-relaxed mb-4">${randomCta.text}</p>
  <div class="flex flex-wrap gap-4 items-center">
    <a href="https://zalo.me/0961668612" target="_blank" rel="noopener noreferrer" class="inline-flex items-center px-5 py-2.5 bg-[#C5A059] hover:bg-[#b08b46] text-white font-medium rounded-lg transition-colors">
      Nhắn Zalo Nghệ Nhân (0961.668.612)
    </a>
    <a href="tel:0961668612" class="inline-flex items-center px-4 py-2 text-[#3D2314] hover:text-[#C5A059] font-medium transition-colors">
      Hotline: 0961.668.612
    </a>
  </div>
</div>
`.trim();

  if (!content.includes("zalo.me") && !content.includes("0961")) {
    content += `\n${ctaBlock}`;
  }

  return content;
}

/**
 * Xử lý tạo bài viết theo Content Pillar thế hệ mới (Marketing Skills V3.0)
 */
async function generatePillarArticle(category, slotName) {
  if (!GEMINI_API_KEY) {
    throw new Error("Thiếu GEMINI_API_KEY trong .env.local hoặc GitHub Secrets");
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
    selectedTopic = matchedPillar.topics[Math.floor(Math.random() * matchedPillar.topics.length)];
  }

  console.log(`[Pillar-Engine] Đã chọn chủ đề: "${selectedTopic.title}" (Cấp độ: ${selectedTopic.level || "Chuyên sâu"})`);

  const prompt = `
Bạn là Chuyên gia thẩm định và nghiên cứu đồ gỗ quý cao cấp tại thương hiệu "Mỹ Nghệ Đông Phong".
Hãy biên soạn một bài viết cẩm nang CHUYÊN ĐỀ PHÂN TÍCH CHUYÊN SÂU, DỄ HIỂU VÀ MẠCH LẠC dựa trên chủ đề sau:

【CHỦ ĐỀ】: "${selectedTopic.title}"
【CHUYÊN MỤC】: ${category} (${matchedPillar.purpose})
【TỪ KHÓA TÌM KIẾM CỦA KHÁCH】: ${selectedTopic.researchKeywords.join(", ")}

【BỘ TIÊU CHUẨN BIÊN SOẠN V4.0 — VĂN XUÔI XÚC CẢM NGHỆ NHÂN — TUYỆT ĐỐI TUÂN THỦ】:
1. PHONG THÁI & VĂN PHONG XÚC CẢM:
   - 100% THÂN BÀI VIẾT THÀNH CÁC ĐOẠN VĂN XUÔI LIỀN MẠCH, CÓ NHỊP THỞ ÊM ÁI, CÓ HÌNH ẢNH GIÁC QUAN (đầm tay, đanh thép, mịn như lụa, men ngọc patina, thơm ngọt sâu...).
   - TUYỆT ĐỐI CẤM phong cách "Báo cáo kỹ thuật gạch đầu dòng" hoặc "Slide thuyết trình/checklist" (CẤM dùng danh sách <ul><li><strong>Tiêu đề:</strong> ...</li></ul> làm thân bài).
   - TUYỆT ĐỐI CẤM các từ ngữ hàn lâm máy móc ("Cơ chế vật lý", "Xét về mặt cơ học ứng dụng", "Chỉ số vật lý", "Sau đây là các tiêu chí:").
   - Hãy chuyển hóa tri thức và dữ liệu khoa học thành lời giải thích cho cảm giác cầm nắm và trải nghiệm thực tế đời sống.

2. CHIỀU SÂU TRI THỨC ĐỘC BẢN:
   - Luôn giải thích bản chất mộc học bằng câu chuyện và góc nhìn của người thợ xưởng mộc (tại sao gỗ lên tuyết, tại sao chìm nước, tại sao phôi già có giá trị cao, thời tiết hanh khô nồm ẩm tác động thế nào đến thớ gỗ).
   - Mỗi phần nội dung là một câu chuyện mộc mạc, sâu sắc, cuốn hút người đọc từ đầu đến cuối.

3. MỞ BÀI SẮC BÉN (ANSWER-FIRST / HOOK):
   - TUYỆT ĐỐI KHÔNG mở bài bằng câu chào rập khuôn: "Chào mừng quý vị...", "Hôm nay chúng ta sẽ tìm hiểu...".
   - Vào thẳng bản chất: Mở đầu bằng một câu hỏi cốt lõi, một nghịch lý hoặc quan niệm sai lầm rất phổ biến của người mua gỗ phong thủy.
   - Đoạn mở đầu (40-60 từ) trả lời trực tiếp vấn đề để công cụ tìm kiếm AI (Google AI Overviews, Perplexity) dễ trích xuất Top 0.

4. BỐ CỤC THÂN BÀI & TIÊU ĐỀ TỰ NHIÊN:
   - TUYỆT ĐỐI CẤM DÙNG THẺ BẢNG HTML (<table>)!
   - Chia 3 - 4 phần với các tiêu đề <h2> tự nhiên, hấp dẫn, thi vị và giàu chiều sâu.
   - TUYỆT ĐỐI KHÔNG đánh số thứ tự ở đầu các tiêu đề <h2>, <h3> (CẤM viết "1. ", "2. ", "Phần 1: ").
   - ĐỘ DÀI MỤC TIÊU: 800 - 1.200 TỪ THỰC TẾ, viết câu nào chắc câu đó, tuyệt đối không viết độn chữ rỗng tuếch.

5. MỤC HỎI - ĐÁP ĐÓN ĐẦU AI OVERVIEWS (FAQ):
   - Ở cuối bài (trước phần kết), bắt buộc có một mục <h2> mang tên "Những câu hỏi thường gặp" hoặc "Giải đáp nhanh thắc mắc từ người chơi gỗ".
   - Bao gồm đúng 3 - 4 câu hỏi thực tế nhất mà khách hàng hay băn khoăn (dùng thẻ <h3> cho câu hỏi).
   - Mỗi câu trả lời ngắn gọn, trực diện từ 2 - 3 câu dứt khoát, khoa học để Google AI Overviews dễ trích xuất Top 0.

6. LIÊN KẾT NỘI BỘ (INTERNAL LINKS):
   - Tự nhiên lồng ghép 2-3 liên kết nội bộ trong bài viết:
     * <a href="/san-pham/vong-tay">vòng tay gỗ quý phong thủy</a>
     * <a href="/san-pham/but-ky">bút ký phong thủy</a>
     * <a href="/san-pham/goi-go">gối gỗ thư giãn</a>
     * <a href="/san-pham/bi-lan-tay">bi lăn tay dưỡng sinh</a>
     * <a href="/bai-viet">cẩm nang kiến thức gỗ Đông Phong</a>

7. QUY TẮC HÌNH ẢNH:
   - TUYỆT ĐỐI KHÔNG đề cập ảnh do AI tạo. Khẳng định 100% phôi gỗ mộc tự nhiên, vân gỗ thật từ xưởng thủ công.

XUẤT RA DUY NHẤT MỘT KHỐI JSON HỢP LỆ VỚI CẤU TRÚC SAU (KHÔNG BỌC TRONG \`\`\`json):
{
  "title": "Tiêu đề hấp dẫn, chuẩn phong thái nghệ nhân đồ gỗ quý (dưới 70 ký tự)",
  "excerpt": "Đoạn tóm tắt súc tích 50-70 từ trả lời trực diện vấn đề",
  "content": "Toàn bộ bài viết định dạng HTML chuẩn (h2, h3, p, ul, li, strong, blockquote, a) ĐẠT 800 - 1.200 TỪ THỰC TẾ, KHÔNG CÓ BẢNG TABLE",
  "woodTypesMentioned": ["Tử Đàn", "Bách Xanh"],
  "suggestedProductCategories": ["vong-tay", "but-ky"]
}
`.trim();

  const modelCandidates = [
    "gemini-3.8-flash",
    "gemini-3.5-flash",
    "gemini-3.5-flash-lite",
    "gemini-flash-latest"
  ];

  let result = null;

  for (const mName of modelCandidates) {
    try {
      console.log(`[Pillar-Engine] Đang gọi mô hình Gemini: ${mName}...`);
      const model = genAI.getGenerativeModel({
        model: mName,
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      });
      const res = await model.generateContent(prompt);
      const text = res.response.text().trim();
      const parsed = extractAndParseJson(text);

      const textOnly = (parsed.content || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
      const wordCount = textOnly ? textOnly.split(" ").length : 0;

      if (parsed.title && parsed.content && wordCount >= 650) {
        parsed.wordCount = wordCount;
        parsed.content = postProcessContent(parsed.content, category);
        result = parsed;
        console.log(`[Pillar-Engine] ✅ Tạo thành công bài viết với ${wordCount} từ qua model ${mName}`);
        break;
      } else {
        console.warn(`[Pillar-Engine] Model ${mName} trả về chưa đủ điều kiện (từ: ${wordCount})`);
      }
    } catch (err) {
      console.warn(`[Pillar-Engine] Thử model ${mName} thất bại: ${err.message}`);
      continue;
    }
  }

  if (!result) {
    throw new Error("Không thể tạo nội dung bài viết qua Gemini AI sau khi thử tất cả model candidates.");
  }

  // TÌM KIẾM ẢNH THẬT TRÊN MẠNG DỰA THEO CHỦ ĐỀ VÀ LOẠI GỖ (KHÔNG DÙNG SUPABASE CỐ ĐỊNH)
  const selectedThumb = await findRealWebImage(result.title, result.woodTypesMentioned || []);

  // Chèn trực tiếp ảnh thật vào thân bài viết (sau đoạn mở đầu)
  let finalContent = result.content;
  if (selectedThumb && !finalContent.includes("<img")) {
    const heroFigure = `\n<figure class="my-6 md:my-8 rounded-2xl overflow-hidden border border-[#E8DFC8]/60 shadow-sm bg-[#FAF6F0] text-center"><img src="${selectedThumb}" alt="${result.title}" class="w-full max-h-[500px] object-cover object-center mx-auto" /><figcaption class="text-center text-xs md:text-sm text-[#5A4A42] py-2.5 px-4 italic font-serif border-t border-[#E8DFC8]/40">Ảnh chụp cận cảnh thớ gỗ tự nhiên — Tư liệu nghiên cứu chuyên ngành đồ gỗ quý</figcaption></figure>\n`;
    const firstPIdx = finalContent.indexOf("</p>");
    if (firstPIdx !== -1) {
      finalContent = finalContent.slice(0, firstPIdx + 4) + heroFigure + finalContent.slice(firstPIdx + 4);
    } else {
      finalContent = heroFigure + finalContent;
    }
  }

  const postSlug = slugify(result.title);
  const vnDateStr = new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString().split("T")[0];
  const newPost = {
    id: `pillar-${Date.now()}`,
    slug: postSlug,
    title: result.title,
    category: category,
    excerpt: result.excerpt,
    content: finalContent,
    thumbnail: selectedThumb,
    relatedProducts: ["vt-001", "vt-002"],
    status: "published",
    publishedAt: vnDateStr,
    readingTime: Math.max(3, Math.ceil(result.wordCount / 180)),
  };

  // Lưu vào data/posts.json
  posts.unshift(newPost);
  await fs.writeFile(path.join(process.cwd(), "data", "posts.json"), JSON.stringify(posts, null, 2), "utf-8");
  console.log(`[Pillar-Engine] Đã ghi bài viết mới vào data/posts.json (Tổng số bài: ${posts.length})`);

  // Đồng bộ lên Supabase nếu có key
  if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const { error: supaErr } = await supabase.from("posts").upsert({
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
        read_time: newPost.readingTime,
        related_products: newPost.relatedProducts,
      });
      if (supaErr) {
        console.error("[Pillar-Engine] ❌ Lỗi Supabase upsert:", supaErr.message);
      } else {
        console.log("[Pillar-Engine] ✅ Đã đồng bộ bài viết thành công lên Supabase");
      }
    } catch (dbErr) {
      console.warn("[Pillar-Engine] Cảnh báo kết nối Supabase:", dbErr.message);
    }
  }

  return newPost;
}

async function main() {
  const slot = getCurrentSlot();
  console.log("=================================================================");
  console.log(`⏱️ MỸ NGHỆ ĐÔNG PHONG — LỊCH XUẤT BẢN 3 CA VÀNG: SLOT ${slot}`);
  console.log("=================================================================");

  const scheduleRaw = await fs.readFile(path.join(process.cwd(), "data", "publishing-schedule.json"), "utf-8");
  const scheduleData = JSON.parse(scheduleRaw);
  const slotsList = scheduleData.activeSlots || [];
  const currentSlotConfig = slotsList.find((s) => s.slot === slot) || slotsList[0];

  const targetCategory = currentSlotConfig.category;

  console.log(`- Thời gian dự kiến: ${currentSlotConfig.time} VN`);
  console.log(`- Khung giờ: Ca ${slot} — ${currentSlotConfig.name}`);
  console.log(`- Chuyên mục mục tiêu: ${targetCategory}`);
  console.log(`- Động cơ: ${currentSlotConfig.engine} (100% Content Pillar V3.0)`);
  console.log(`- Tiêu chuẩn: Ảnh thật kiếm trên mạng, Không bảng table, Hook mở bài, FAQ Google AI Overviews\n`);

  const newPost = await generatePillarArticle(targetCategory, currentSlotConfig.name);
  console.log("\n=================================================================");
  console.log(`🎉 XUẤT BẢN THÀNH CÔNG BÀI VIẾT CA ${slot}:`);
  console.log(`   - Tiêu đề: ${newPost.title}`);
  console.log(`   - Đường dẫn: /bai-viet/${newPost.slug}`);
  console.log(`   - Chuyên mục: ${newPost.category}`);
  console.log(`   - Ảnh đại diện thật từ web: ${newPost.thumbnail}`);
  console.log(`   - Thời gian đọc dự kiến: ${newPost.readingTime} phút`);
  console.log("=================================================================");
}

main().catch((err) => {
  console.error("❌ Lỗi xuất bản:", err);
  process.exit(1);
});
