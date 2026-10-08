/**
 * Script tự động đẩy toàn bộ dữ liệu từ JSON lên Supabase
 * Chạy bằng: node scripts/seed-supabase.js
 */

const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

// Đọc file .env.local thủ công nếu chưa nạp
function loadEnv() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf-8");
    content.split("\n").forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
        const [k, ...v] = trimmed.split("=");
        process.env[k.trim()] = v.join("=").trim().replace(/^["']|["']$/g, "");
      }
    });
  }
}

loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
// Ưu tiên SERVICE_ROLE_KEY nếu có để bypass RLS khi seed, nếu không thì dùng ANON_KEY
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY || SUPABASE_URL.includes("your-project-id")) {
  console.error("\n❌ LỖI: Chưa cấu hình NEXT_PUBLIC_SUPABASE_URL hoặc NEXT_PUBLIC_SUPABASE_ANON_KEY trong file .env.local!");
  console.error("👉 Vui lòng điền URL và Anon Key vào .env.local trước khi chạy script.\n");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function seed() {
  console.log("\n🪵 BẮT ĐẦU ĐỒNG BỘ DỮ LIỆU MỸ NGHỆ ĐÔNG PHONG LÊN SUPABASE...");
  console.log(`🌐 Supabase URL: ${SUPABASE_URL}\n`);

  // 1. Đồng bộ Categories
  const categoriesPath = path.join(__dirname, "..", "data", "categories.json");
  if (fs.existsSync(categoriesPath)) {
    const rawCategories = JSON.parse(fs.readFileSync(categoriesPath, "utf-8"));
    const categories = rawCategories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.id,
      description: c.description || null,
      image: c.image || null,
      display_order: c.order || 0,
    }));

    const { error: catErr } = await supabase.from("categories").upsert(categories, { onConflict: "id" });
    if (catErr) {
      console.error("⚠️ Lỗi đồng bộ categories (kiểm tra bạn đã tạo bảng categories chưa):", catErr.message);
    } else {
      console.log(`✅ Đã đồng bộ thành công ${categories.length} danh mục sản phẩm.`);
    }
  }

  // 2. Đồng bộ Wood Types
  const woodTypesPath = path.join(__dirname, "..", "data", "woodTypes.json");
  if (fs.existsSync(woodTypesPath)) {
    const rawWoods = JSON.parse(fs.readFileSync(woodTypesPath, "utf-8"));
    const woods = rawWoods.map((w) => ({
      id: w.id,
      name: w.name,
      slug: w.id,
      scientific_name: w.fullName || null,
      origin: w.origin || null,
      description: w.fullName || null,
    }));

    const { error: woodErr } = await supabase.from("wood_types").upsert(woods, { onConflict: "id" });
    if (woodErr) {
      console.error("⚠️ Lỗi đồng bộ wood_types:", woodErr.message);
    } else {
      console.log(`✅ Đã đồng bộ thành công ${woods.length} loại gỗ quý.`);
    }
  }

  // 3. Đồng bộ Products
  const productsPath = path.join(__dirname, "..", "data", "products.json");
  if (fs.existsSync(productsPath)) {
    const rawProducts = JSON.parse(fs.readFileSync(productsPath, "utf-8"));
    const products = rawProducts.map((p) => ({
      id: p.id,
      code: p.code,
      name: p.name,
      slug: p.slug,
      category: p.category,
      wood_type: p.woodType,
      description: p.description || null,
      preservation: p.preservation || null,
      sizes: p.sizes || [],
      images: p.images || [],
      featured: Boolean(p.featured),
      status: p.status || "published",
      related_posts: p.relatedPosts || [],
    }));

    const { error: prodErr } = await supabase.from("products").upsert(products, { onConflict: "id" });
    if (prodErr) {
      console.error("⚠️ Lỗi đồng bộ products:", prodErr.message);
    } else {
      console.log(`✅ Đã đồng bộ thành công ${products.length} sản phẩm mỹ nghệ.`);
    }
  }

  // 4. Đồng bộ Posts
  const postsPath = path.join(__dirname, "..", "data", "posts.json");
  if (fs.existsSync(postsPath)) {
    const rawPosts = JSON.parse(fs.readFileSync(postsPath, "utf-8"));
    const posts = rawPosts.map((b) => ({
      id: b.id,
      title: b.title,
      slug: b.slug,
      excerpt: b.excerpt || null,
      content: b.content || "",
      thumbnail: b.thumbnail || null,
      category: b.category,
      read_time: b.readingTime || 5,
      status: b.status || "published",
      published_at: b.publishedAt || new Date().toISOString().split("T")[0],
      related_products: b.relatedProducts || [],
    }));

    const { error: postErr } = await supabase.from("posts").upsert(posts, { onConflict: "id" });
    if (postErr) {
      console.error("⚠️ Lỗi đồng bộ posts:", postErr.message);
    } else {
      console.log(`✅ Đã đồng bộ thành công ${posts.length} bài viết kiến thức gỗ.`);
    }
  }

  console.log("\n🎉 HOÀN TẤT ĐỒNG BỘ DỮ LIỆU ĐÔNG PHONG LÊN SUPABASE!\n");
}

seed().catch((err) => {
  console.error("❌ Lỗi thực thi:", err);
});
