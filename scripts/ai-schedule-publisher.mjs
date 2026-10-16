/**
 * scripts/ai-schedule-publisher.mjs
 * Hệ thống xuất bản bài viết tự động theo 3 Khung Giờ Vàng — Mỹ Nghệ Đông Phong
 * Áp dụng tiêu chuẩn Copywriting đỉnh cao (Marketing Skills & GEO Search):
 * 
 * - Ca 1 (07:30 VN): Bảo quản sản phẩm & Kỹ thuật mộc (bao-quan-san-pham)
 * - Ca 2 (11:30 VN): Kiến thức danh mộc & Nhận biết thật - giả (kien-thuc-ve-go)
 * - Ca 3 (20:30 VN): Cẩm nang Phong thủy Ngũ Hành theo năm sinh & nghề nghiệp (huong-dan-lua-chon)
 * 
 * NGUYÊN TẮC CỐT LÕI V3.0:
 * 1. 100% Ảnh chụp mộc thật từ Supabase Storage / Xưởng Đông Phong. TUYỆT ĐỐI KHÔNG DÙNG ẢNH AI.
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
  "mun-sung": [
    "https://lpawosdhwvejvsgfayov.supabase.co/storage/v1/object/public/dongphong-media/blog/g8wfj8szsr7j8exnqokiw-akdxrgjassae4djmefnczrnnxfqpihiztdlak6ejy1jn6qm-m9tmz87son1yfovmsg-vlirkphv8gh-2fk1qtjpzxop1ififn8xfn6ltfshsi7woqgnxx0ftix2qbf1-srsz4txzyq7-z4vwcrmluy89t69ymuqc-spo8l6cmq-1791218587580.jpg"
  ],
  "huyet-long": [
    "https://lpawosdhwvejvsgfayov.supabase.co/storage/v1/object/public/dongphong-media/blog/cq-c-bbdtbcxn5vr16fntffgkj1qeuouqy619s8nq-zxoyholisvilttj3nlhmczkpzjdnxcznohysx4emggy8q8hnfgfptip9smacuodxcqooidtj2u9d3ouoblneasm5t8ioosxwghqbyod87l6-2sc6hofucmxswrlxrh7tguakmmipqs6dh6boafo9w-1791218614413.jpg"
  ],
  "trac-do": [
    "https://lpawosdhwvejvsgfayov.supabase.co/storage/v1/object/public/dongphong-media/blog/cq-c-bbdtbcxn5vr16fntffgkj1qeuouqy619s8nq-zxoyholisvilttj3nlhmczkpzjdnxcznohysx4emggy8q8hnfgfptip9smacuodxcqooidtj2u9d3ouoblneasm5t8ioosxwghqbyod87l6-2sc6hofucmxswrlxrh7tguakmmipqs6dh6boafo9w-1791218614413.jpg"
  ],
  "default": [
    "https://lpawosdhwvejvsgfayov.supabase.co/storage/v1/object/public/dongphong-media/blog/images-1--1791215033290.jpg"
  ]
};

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
 * - Ca 1: 05:00 - 10:00 VN -> Slot 1 (Bảo quản sản phẩm)
 * - Ca 2: 10:00 - 15:00 VN -> Slot 2 (Kiến thức về gỗ)
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
        // Trích xuất các dòng tr/td để chuyển thành ul li
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
  const hasBlogLink = content.includes("/bai-viet");

  if (!hasProductLink) {
    if (content.includes("vòng tay")) {
      content = content.replace(/(vòng tay gỗ(?: quý| phong thủy)?)/i, '<a href="/san-pham/vong-tay">$1</a>');
    } else if (content.includes("bút ký")) {
      content = content.replace(/(bút ký(?: phong thủy| gỗ)?)/i, '<a href="/san-pham/but-ky">$1</a>');
    }
  }

  // 3. Đảm bảo có CTA Zalo chuẩn và số Hotline Đông Phong
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

  // Kiểm tra xem đã có CTA box chưa
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
    // Nếu đã viết hết toàn bộ danh sách, chọn ngẫu nhiên 1 topic để khai thác góc nhìn thực tế mới
    selectedTopic = matchedPillar.topics[Math.floor(Math.random() * matchedPillar.topics.length)];
  }

  console.log(`[Pillar-Engine] Đã chọn chủ đề: "${selectedTopic.title}" (Cấp độ: ${selectedTopic.level || "Chuyên sâu"})`);

  const prompt = `
Bạn là Nghệ nhân mộc gia truyền kiêm Chuyên gia đồ gỗ phong thủy tại thương hiệu cao cấp "Mỹ Nghệ Đông Phong".
Hãy viết một bài viết cẩm nang CHUYÊN SÂU, CHÂN THỰC và GIÀU GIÁ TRỊ THỰC TIỄN dựa trên hạt giống nội dung sau:

【CHỦ ĐỀ】: "${selectedTopic.title}"
【CHUYÊN MỤC】: ${category} (${matchedPillar.purpose})
【TỪ KHÓA TÌM KIẾM CỦA KHÁCH】: ${selectedTopic.researchKeywords.join(", ")}

【BỘ TIÊU CHUẨN VIẾT V3.0 — TUYỆT ĐỐI TUÂN THỦ】:
1. PHONG THÁI & GIỌNG VĂN:
   - Giọng văn trầm ấm, điềm đạm, khiêm nhường nhưng uyên bác của người thợ mộc dành cả đời bên thớ gỗ và mùi tinh dầu tự nhiên.
   - Tránh văn phong quảng cáo thổi phồng (no hype). Dùng từ ngữ nghề mộc chính xác: thớ gỗ, tôm gỗ, tom gỗ, phôi mộc, lên nước (patina), dác gỗ, tâm gỗ (heartwood), tinh dầu tự nhiên, mùi hương thảo mộc.

2. MỞ BÀI SẮC BÉN (HOOK — CUT THROAT-CLEARING):
   - TUYỆT ĐỐI KHÔNG mở bài bằng câu chào rập khuôn sáo rỗng: "Chào mừng quý vị...", "Tôi là nghệ nhân trưởng...", "Hôm nay tôi xin chia sẻ...", "Trong bài viết này chúng ta sẽ cùng tìm hiểu...".
   - Vào thẳng vấn đề: Mở đầu bằng một tình huống thực tế tại xưởng mộc, một nghịch lý hoặc quan niệm sai lầm rất phổ biến của người mua gỗ phong thủy, hoặc một trải nghiệm chân thật.
   - Đoạn mở đầu (40-60 từ) trả lời trực tiếp bản chất vấn đề để công cụ tìm kiếm AI (Google AI Overviews, Perplexity) dễ trích xuất câu trả lời trực tiếp (Direct Answer).

3. ĐỘ DÀI & NGUYÊN TẮC CHỐNG ĐỘN CHỮ (NO PADDING):
   - ĐỘ DÀI MỤC TIÊU: 800 - 1.200 TỪ THỰC TẾ (tính theo số từ văn bản, không tính thẻ HTML).
   - Nghiêm cấm viết độn chữ rỗng tuếch để kéo dài bài. Viết câu nào chắc câu đó, đi sâu vào kỹ thuật thực tế và kinh nghiệm phân biệt. Khi hết giá trị thì kết bài dứt khoát.

4. CẤU TRÚC THÂN BÀI (LINH HOẠT THEO TÂM LÝ KHÁCH HÀNG — PAS FLOW):
   - Chia 3 - 4 phần với các tiêu đề <h2> tự nhiên, hấp dẫn, không rập khuôn số 1, 2, 3, 4, 5.
   - Trình bày thoáng mắt: Đan xen đoạn văn 2-3 câu ngắn và danh sách gạch đầu dòng (<ul><li>) có in đậm từ khóa <strong> ở đầu mỗi ý.
   - TUYỆT ĐỐI KHÔNG DÙNG BẢNG HTML (<table>)! Hãy dùng các danh sách so sánh hoặc đoạn văn phân tích tương phản.

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
    "gemini-3.5-flash",
    "gemini-3.5-flash-lite",
    "gemini-3.1-flash-lite",
    "gemini-3.8-flash",
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

      // Kiểm tra độ dài từ thực tế (loại bỏ thẻ HTML)
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

  // Chọn ảnh chụp thật phù hợp với loại gỗ đề cập
  let selectedThumb = REAL_WOOD_PHOTOS["default"][0];
  const woodText = (result.woodTypesMentioned || []).join(" ").toLowerCase() + " " + result.title.toLowerCase();
  
  if (woodText.includes("tử đàn") || woodText.includes("tu dan")) {
    selectedThumb = REAL_WOOD_PHOTOS["tu-dan"][0];
  } else if (woodText.includes("sưa") || woodText.includes("sua")) {
    selectedThumb = REAL_WOOD_PHOTOS["sua-do"][0];
  } else if (woodText.includes("bách xanh") || woodText.includes("bach xanh")) {
    selectedThumb = REAL_WOOD_PHOTOS["bach-xanh"][0];
  } else if (woodText.includes("hoàng đàn") || woodText.includes("hoang dan")) {
    selectedThumb = REAL_WOOD_PHOTOS["hoang-dan"][0];
  } else if (woodText.includes("mun") || woodText.includes("mun sừng")) {
    selectedThumb = REAL_WOOD_PHOTOS["mun-sung"][0];
  } else if (woodText.includes("huyết long") || woodText.includes("huyet long")) {
    selectedThumb = REAL_WOOD_PHOTOS["huyet-long"][0];
  } else if (woodText.includes("trắc") || woodText.includes("trac")) {
    selectedThumb = REAL_WOOD_PHOTOS["trac-do"][0];
  }

  const postSlug = slugify(result.title);
  const vnDateStr = new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString().split("T")[0];
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
  console.log(`- Tiêu chuẩn: Không bảng table, Hook mở bài, FAQ đón đầu Google AI Overviews, 100% ảnh thật\n`);

  const newPost = await generatePillarArticle(targetCategory, currentSlotConfig.name);
  console.log("\n=================================================================");
  console.log(`🎉 XUẤT BẢN THÀNH CÔNG BÀI VIẾT CA ${slot}:`);
  console.log(`   - Tiêu đề: ${newPost.title}`);
  console.log(`   - Đường dẫn: /bai-viet/${newPost.slug}`);
  console.log(`   - Chuyên mục: ${newPost.category}`);
  console.log(`   - Ảnh đại diện thật: ${newPost.thumbnail}`);
  console.log(`   - Thời gian đọc dự kiến: ${newPost.readingTime} phút`);
  console.log("=================================================================");
}

main().catch((err) => {
  console.error("❌ Lỗi xuất bản:", err);
  process.exit(1);
});
