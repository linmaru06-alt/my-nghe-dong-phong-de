import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });

const POSTS_PATH = path.join(process.cwd(), "data", "posts.json");
const raw = fs.readFileSync(POSTS_PATH, "utf-8");
const posts = JSON.parse(raw);

const KNOWN_TAGS = [
  { keyword: "hoàng đàn", displayName: "Hoàng Đàn Tuyết", aliases: ["hoang dan"] },
  { keyword: "tử đàn", displayName: "Tử Đàn Tiểu Diệp", aliases: ["tu dan"] },
  { keyword: "sưa", displayName: "Sưa Đỏ Bắc Bộ", aliases: ["sua do", "gỗ sưa"] },
  { keyword: "bách xanh", displayName: "Bách Xanh Mộc Châu", aliases: ["bach xanh"] },
  { keyword: "mun sừng", displayName: "Mun Sừng Khánh Hòa", aliases: ["mun sung"] },
  { keyword: "huyết long", displayName: "Huyết Long Thấu Quang", aliases: ["huyet long"] },
  { keyword: "trầm hương", displayName: "Trầm Hương Tự Nhiên", aliases: ["tram huong"] },
  { keyword: "trắc", displayName: "Gỗ Trắc Đỏ Đen", aliases: ["go trac"] },
  { keyword: "cẩm lai", displayName: "Gỗ Cẩm Lai", aliases: ["cam lai"] },
  { keyword: "mệnh kim", displayName: "Mệnh Kim", aliases: ["menh kim"] },
  { keyword: "mệnh mộc", displayName: "Mệnh Mộc", aliases: ["menh moc"] },
  { keyword: "mệnh thủy", displayName: "Mệnh Thủy", aliases: ["menh thuy"] },
  { keyword: "mệnh hỏa", displayName: "Mệnh Hỏa", aliases: ["menh hoa"] },
  { keyword: "mệnh thổ", displayName: "Mệnh Thổ", aliases: ["menh tho"] },
  { keyword: "dụng thần", displayName: "Dụng Thần Hỷ Thần", aliases: ["dung than", "hỷ thần", "tứ trụ"] },
  { keyword: "trừ tà", displayName: "Trừ Tà Hộ Thân", aliases: ["tru ta", "hộ mệnh"] },
  { keyword: "chiêu tài", displayName: "Chiêu Tài Vượng Khí", aliases: ["chieu tai", "vượng tài"] },
  { keyword: "sinh lão bệnh tử", displayName: "Sinh Lão Bệnh Tử", aliases: ["đếm hạt", "số hạt"] },
  { keyword: "vòng tay", displayName: "Vòng Tay Phong Thủy", aliases: ["vong tay"] },
  { keyword: "bút ký", displayName: "Bút Ký Phong Thủy", aliases: ["but ky"] },
  { keyword: "bi lăn tay", displayName: "Bi Lăn Tay Dưỡng Sinh", aliases: ["bi lan tay"] },
  { keyword: "lên nước", displayName: "Lên Nước Patina", aliases: ["patina"] },
];

function extractTags(title, content) {
  const text = `${title || ""} ${(content || "").slice(0, 2000)}`.toLowerCase();
  const matched = new Set();
  for (const item of KNOWN_TAGS) {
    if (text.includes(item.keyword) || item.aliases.some((a) => text.includes(a))) {
      matched.add(item.displayName);
    }
  }
  if (matched.size === 0) {
    matched.add("Đồ Gỗ Quý");
    matched.add("Mỹ Nghệ Đông Phong");
  }
  return Array.from(matched).slice(0, 6);
}

// Cập nhật tags cho từng bài viết
for (const post of posts) {
  if (post.id === "pillar-1792135152101") {
    post.tags = ["Hoàng Đàn Tuyết", "Tác Dụng Gỗ Hoàng Đàn", "Gỗ Hoàng Đàn Hợp Mệnh Gì", "Mệnh Kim", "Vương Mộc", "Vòng Tay Phong Thủy"];
  } else if (post.id === "pillar-1792135123396") {
    post.tags = ["Dụng Thần Hỷ Thần", "Sinh Lão Bệnh Tử", "Trừ Tà Hộ Thân", "Tử Đàn Tiểu Diệp", "Vòng Tay Phong Thủy"];
  } else if (post.id === "pillar-1792134842198") {
    post.tags = ["Mệnh Kim", "Hoàng Đàn Tuyết", "Tử Đàn Tiểu Diệp", "Sưa Đỏ Bắc Bộ", "Vòng Tay Phong Thủy"];
  } else if (!post.tags || post.tags.length === 0) {
    post.tags = extractTags(post.title, post.content);
  }
}

fs.writeFileSync(POSTS_PATH, JSON.stringify(posts, null, 2), "utf-8");
console.log(`✅ Đã cập nhật tags cho ${posts.length} bài viết trong data/posts.json`);

// Thử đồng bộ lên Supabase nếu có key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (supabaseUrl && supabaseKey && !supabaseUrl.includes("placeholder")) {
  const supabase = createClient(supabaseUrl, supabaseKey);
  console.log("Đang đồng bộ tags lên Supabase...");
  
  const payload = posts.map(p => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt || null,
    content: p.content || "",
    thumbnail: p.thumbnail || null,
    category: p.category,
    read_time: p.readingTime || 5,
    status: p.status || "published",
    published_at: p.publishedAt || new Date().toISOString().split("T")[0],
    related_products: p.relatedProducts || [],
    tags: p.tags || []
  }));

  const { error } = await supabase.from("posts").upsert(payload, { onConflict: "id" });
  if (error) {
    console.warn("⚠️ Supabase upsert payload có thể thiếu cột tags:", error.message);
  } else {
    console.log("✅ Đồng bộ Supabase thành công!");
  }
}
