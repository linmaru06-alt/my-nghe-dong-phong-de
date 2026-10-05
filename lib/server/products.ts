import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { v2 as cloudinary } from "cloudinary";

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

const isCloudinaryConfigured = Boolean(CLOUD_NAME && API_KEY && API_SECRET);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key: API_KEY,
    api_secret: API_SECRET,
    secure: true,
  });
}

export interface ProductSize {
  label: string;
  price: number | null;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  code: string;
  category: string;
  woodType: string;
  description: string;
  preservation: string;
  sizes: ProductSize[];
  images: string[];
  featured: boolean;
  status: "published" | "draft";
  relatedPosts?: string[];
  createdAt: string;
}

const PRODUCTS_FILE = path.join(process.cwd(), "data", "products.json");

interface ProductsCache {
  data: Product[];
  timestamp: number;
}
let memoryProductsCache: ProductsCache | null = null;
const CACHE_TTL_MS = 5000; // 5 giây tự động làm mới từ Supabase để mọi khách đều thấy tức thì
const TMP_PRODUCTS_FILE = path.join(require("os").tmpdir(), "dongphong_products.json");

import { supabase, supabaseAdmin } from "@/lib/supabase";

const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")
);

export async function getAllProducts(): Promise<Product[]> {
  const now = Date.now();
  if (memoryProductsCache && now - memoryProductsCache.timestamp < CACHE_TTL_MS) {
    return memoryProductsCache.data;
  }

  // 1. Đọc trực tiếp từ Supabase Database nếu có cấu hình
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        const mapped: Product[] = data.map((item: any) => ({
          id: item.id,
          slug: item.slug,
          name: item.name,
          code: item.code,
          category: item.category,
          woodType: item.wood_type || item.woodType || "",
          description: item.description || "",
          preservation: item.preservation || "",
          sizes: Array.isArray(item.sizes) ? item.sizes : [],
          images: Array.isArray(item.images) ? item.images : [],
          featured: Boolean(item.featured),
          status: item.status || "published",
          relatedPosts: item.related_posts || item.relatedPosts || [],
          createdAt: item.created_at || new Date().toISOString(),
        }));
        memoryProductsCache = { data: mapped, timestamp: Date.now() };
        return mapped;
      }
    } catch (err: any) {
      console.warn("[Products Server Layer] Lỗi đọc Supabase:", err.message);
    }
  }

  // 2. Thử đọc từ Cloudinary đám mây nếu có CLOUD_NAME
  if (CLOUD_NAME) {
    try {
      const cloudUrl = `https://res.cloudinary.com/${CLOUD_NAME}/raw/upload/dongphong_data/products.json?t=${Date.now()}`;
      const res = await fetch(cloudUrl, { cache: "no-store" });
      if (res.ok) {
        const cloudProducts = await res.json();
        if (Array.isArray(cloudProducts) && cloudProducts.length > 0) {
          memoryProductsCache = { data: cloudProducts, timestamp: Date.now() };
          return cloudProducts;
        }
      }
    } catch {}
  }

  // 2. Thử đọc từ /tmp (nếu trên Vercel đã lưu tạm)
  try {
    const tmpContent = await fs.readFile(TMP_PRODUCTS_FILE, "utf-8");
    const products: Product[] = JSON.parse(tmpContent);
    if (Array.isArray(products) && products.length > 0) {
      memoryProductsCache = { data: products, timestamp: Date.now() };
      return products;
    }
  } catch {}

  // 3. Thử đọc trực tiếp từ file data/products.json
  try {
    const fileContent = await fs.readFile(PRODUCTS_FILE, "utf-8");
    const products: Product[] = JSON.parse(fileContent);
    if (Array.isArray(products) && products.length > 0) {
      memoryProductsCache = { data: products, timestamp: Date.now() };
      return products;
    }
  } catch (error) {
    console.warn("[Products Server Layer] Không thể đọc trực tiếp data/products.json:", error);
  }

  // 3. Fallback tĩnh từ module bundle
  try {
    const fallback = require("@/data/products.json");
    return Array.isArray(fallback) ? fallback : [];
  } catch {
    return [];
  }
}

/**
 * Lấy danh sách sản phẩm đã xuất bản
 */
export async function getPublishedProducts(): Promise<Product[]> {
  const products = await getAllProducts();
  return products.filter((p) => p.status === "published");
}

/**
 * Lấy danh sách sản phẩm nổi bật cho Trang chủ
 */
export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const published = await getPublishedProducts();
  const featured = published.filter((p) => p.featured);
  return featured.slice(0, limit);
}

/**
 * Tìm sản phẩm theo slug hoặc id hoặc mã code
 */
export async function getProductBySlug(rawSlug: string): Promise<Product | undefined> {
  if (!rawSlug) return undefined;
  const decoded = decodeURIComponent(rawSlug).trim().toLowerCase();
  const products = await getAllProducts();
  return (
    products.find((p) => p.slug.toLowerCase() === decoded) ||
    products.find((p) => p.code.toLowerCase() === decoded) ||
    products.find((p) => p.id.toLowerCase() === decoded)
  );
}

/**
 * Lưu danh sách sản phẩm và xóa cache máy chủ tức thời
 */
export async function saveProducts(products: Product[]): Promise<{ success: boolean; total: number }> {
  memoryProductsCache = null;

  // 1. Đồng bộ lên Supabase Database (Ưu tiên cao nhất)
  if (isSupabaseConfigured) {
    try {
      const payload = products.map((p) => ({
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
        created_at: p.createdAt || new Date().toISOString(),
      }));
      await supabaseAdmin.from("products").upsert(payload, { onConflict: "id" });
      
      // Xóa các sản phẩm không còn trong danh sách (để fix lỗi xóa nhưng vẫn hiển thị)
      const newIds = products.map(p => p.id);
      const { data: existing } = await supabaseAdmin.from("products").select("id");
      if (existing) {
        const toDelete = existing.map((e: any) => e.id).filter((id: string) => !newIds.includes(id));
        if (toDelete.length > 0) {
          await supabaseAdmin.from("products").delete().in("id", toDelete);
        }
      }

      console.log("[Products Server Layer] Đã đồng bộ lên Supabase Database thành công");
    } catch (supaErr: any) {
      console.warn("[Products Server Layer] Lỗi đồng bộ Supabase:", supaErr.message);
    }
  }

  // 2. Nếu có Cloudinary, đồng bộ thẳng lên Cloudinary Raw Storage đám mây
  if (isCloudinaryConfigured) {
    try {
      const base64Data = `data:application/json;base64,${Buffer.from(JSON.stringify(products, null, 2)).toString("base64")}`;
      await cloudinary.uploader.upload(base64Data, {
        resource_type: "raw",
        public_id: "dongphong_data/products.json",
        overwrite: true,
        invalidate: true,
      });
      console.log("[Products Server Layer] Đã lưu và đồng bộ products.json lên Cloudinary Raw Storage thành công");
    } catch (cloudErr: any) {
      console.warn("[Products Server Layer] Lỗi tải products.json lên Cloudinary:", cloudErr.message);
    }
  }

  // 2. Thử lưu vào data/products.json trên đĩa (Localhost)
  try {
    const dataDir = path.dirname(PRODUCTS_FILE);
    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2), "utf-8");
  } catch (err: any) {
    // 3. Nếu đĩa read-only trên Vercel, lưu vào /tmp
    console.warn("[Products Server Layer] Ổ đĩa Read-Only (Vercel), lưu tạm vào /tmp:", err.message);
    try {
      await fs.writeFile(TMP_PRODUCTS_FILE, JSON.stringify(products, null, 2), "utf-8");
    } catch {}
  }

  try {
    revalidatePath("/");
    revalidatePath("/san-pham");
    revalidatePath("/san-pham/[slug]", "page");
  } catch (err) {
    console.warn("[Products Server Layer] Không thể revalidate path:", err);
  }

  return { success: true, total: products.length };
}

