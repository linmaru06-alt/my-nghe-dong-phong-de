import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (supabaseUrl && supabaseKey && !supabaseUrl.includes("placeholder")) {
  const supabase = createClient(supabaseUrl, supabaseKey);
  const posts = JSON.parse(fs.readFileSync(path.join(process.cwd(), "data", "posts.json"), "utf-8"));
  
  // Sync fallback payload without tags if column doesn't exist yet
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
  }));

  const { error } = await supabase.from("posts").upsert(payload, { onConflict: "id" });
  if (error) {
    console.error("Lỗi sync:", error.message);
  } else {
    console.log("✅ Đã cập nhật tiêu đề mới lên Supabase thành công!");
  }
}
