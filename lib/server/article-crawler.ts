import { v2 as cloudinary } from "cloudinary";
import { supabaseAdmin } from "@/lib/supabase";

function initCloudinary(): boolean {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (cloudName && apiKey && apiSecret) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
    return true;
  }
  return false;
}

export interface CrawledArticle {
  title?: string;
  realUrl: string;
  leadImage: string | null;
  permanentImageUrl: string | null;
  fullContent: string;
  wordCount: number;
  inArticleImages: { url: string; caption: string }[];
}

/**
 * Tải và lưu trữ ảnh an toàn lên Cloudinary / Supabase Storage (Chống lỗi 403 Forbidden & Chống chết link)
 */
export async function rehostImageToCloud(
  imageUrl: string,
  folder: string = "news"
): Promise<string> {
  if (!imageUrl || !imageUrl.startsWith("http")) return imageUrl;

  // 1. Ưu tiên 1: Tải trực tiếp lên Cloudinary đám mây (Tối ưu định dạng WebP tự động)
  if (initCloudinary()) {
    try {
      const uploadRes = await cloudinary.uploader.upload(imageUrl, {
        folder: `dongphong/${folder}`,
        resource_type: "image",
        overwrite: false,
      });
      if (uploadRes && uploadRes.secure_url) {
        console.log(`[Crawler] ✅ Đã lưu ảnh vĩnh viễn lên Cloudinary: ${uploadRes.secure_url}`);
        return uploadRes.secure_url;
      }
    } catch (cloudErr: any) {
      console.warn(`[Crawler] Lỗi upload Cloudinary: ${cloudErr.message}, thử tiếp Supabase Storage...`);
    }
  }

  // 2. Ưu tiên 2: Tải lên Supabase Storage (Bucket dongphong-media)
  try {
    const isSupabaseConfigured = Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
        !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")
    );

    if (isSupabaseConfigured) {
      const imgFetch = await fetch(imageUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      });

      if (imgFetch.ok) {
        const arrayBuf = await imgFetch.arrayBuffer();
        const buffer = Buffer.from(arrayBuf);
        const ext = imageUrl.split("?")[0].split(".").pop() || "jpg";
        const cleanExt = ["jpg", "jpeg", "png", "webp"].includes(ext.toLowerCase()) ? ext.toLowerCase() : "jpg";
        const fileName = `${folder}/crawled-${Date.now()}-${Math.floor(Math.random() * 1000)}.${cleanExt}`;

        const { data, error } = await supabaseAdmin.storage
          .from("dongphong-media")
          .upload(fileName, buffer, {
            contentType: `image/${cleanExt === "jpg" ? "jpeg" : cleanExt}`,
            upsert: true,
          });

        if (!error && data) {
          const { data: pubData } = supabaseAdmin.storage
            .from("dongphong-media")
            .getPublicUrl(data.path);
          console.log(`[Crawler] ✅ Đã lưu ảnh vĩnh viễn lên Supabase Storage: ${pubData.publicUrl}`);
          return pubData.publicUrl;
        }
      }
    }
  } catch (supaErr: any) {
    console.warn(`[Crawler] Lỗi upload Supabase Storage: ${supaErr.message}`);
  }

  // Fallback nếu cả 2 đám mây gặp sự cố: Trả lại URL ảnh ban đầu
  return imageUrl;
}

/**
 * Cào toàn văn nội dung và hình ảnh bài báo gốc từ URL
 */
export async function crawlFullArticle(targetUrl: string): Promise<CrawledArticle> {
  const result: CrawledArticle = {
    realUrl: targetUrl,
    leadImage: null,
    permanentImageUrl: null,
    fullContent: "",
    wordCount: 0,
    inArticleImages: [],
  };

  try {
    const res = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7",
      },
      redirect: "follow",
    });

    let html = await res.text();
    result.realUrl = res.url;

    // 1. Bóc tách tiêu đề trang báo gốc nếu cần
    const titleMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<title>([\s\S]*?)<\/title>/i);
    if (titleMatch) {
      result.title = titleMatch[1].replace(/ - [^-]+$/, "").trim();
    }

    // 2. Bóc tách ảnh đại diện thật (og:image)
    const ogImgMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);

    if (ogImgMatch && ogImgMatch[1] && ogImgMatch[1].startsWith("http")) {
      result.leadImage = ogImgMatch[1];
    }

    // 3. Bóc tách các ảnh chụp thực tế trong thân bài báo (kèm caption)
    const inArticleImages: { url: string; caption: string }[] = [];
    const figureRegex = /<figure[^>]*>[\s\S]*?<img[^>]+(?:src|data-src)=["']([^"']+)["'][^>]*?>[\s\S]*?(?:<figcaption[^>]*>([\s\S]*?)<\/figcaption>)?[\s\S]*?<\/figure>/gi;
    let fm: RegExpExecArray | null;
    while ((fm = figureRegex.exec(html)) !== null) {
      const imgUrl = fm[1];
      const caption = fm[2] ? fm[2].replace(/<[^>]*>/g, "").trim() : "";
      if (
        imgUrl &&
        imgUrl.startsWith("http") &&
        !imgUrl.includes("avatar") &&
        !imgUrl.includes("logo") &&
        !imgUrl.includes("icon")
      ) {
        inArticleImages.push({ url: imgUrl, caption });
      }
    }
    result.inArticleImages = inArticleImages;

    // Nếu không có og:image nhưng có ảnh trong thân bài -> Lấy ảnh đầu tiên làm leadImage
    if (!result.leadImage && inArticleImages.length > 0) {
      result.leadImage = inArticleImages[0].url;
    }

    // 4. Bóc tách toàn văn các đoạn văn bản trong bài báo (loại bỏ quảng cáo, scripts)
    const paragraphs: string[] = [];
    const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
    let pm: RegExpExecArray | null;
    while ((pm = pRegex.exec(html)) !== null) {
      const clean = pm[1].replace(/<[^>]*>/g, "").trim();
      if (
        clean.length > 45 &&
        !clean.includes("Copyright") &&
        !clean.includes("function(") &&
        !clean.includes("Theo dõi trên") &&
        !clean.includes("Bình luận mới") &&
        !clean.includes("Xu hướng#")
      ) {
        paragraphs.push(clean);
      }
    }

    result.fullContent = paragraphs.join("\n\n");
    result.wordCount = result.fullContent.split(/\s+/).filter(Boolean).length;

    // 5. Lưu ảnh đại diện thật lên Cloudinary / Supabase Storage để đảm bảo không chết link
    if (result.leadImage) {
      result.permanentImageUrl = await rehostImageToCloud(result.leadImage, "news");
    }

    // 6. Rehost tối đa 2 ảnh chụp thực tế trong thân bài báo để sẵn sàng chèn vào bài viết
    for (let i = 0; i < Math.min(2, result.inArticleImages.length); i++) {
      try {
        const rehosted = await rehostImageToCloud(result.inArticleImages[i].url, "news");
        result.inArticleImages[i].url = rehosted;
      } catch {}
    }

    console.log(`[Crawler] 📰 Đã cào toàn văn thành công: "${result.title || targetUrl}" (${result.wordCount} từ, ảnh: ${result.permanentImageUrl ? "Có" : "Không"})`);
  } catch (err: any) {
    console.warn(`[Crawler] Lỗi cào chi tiết bài báo ${targetUrl}:`, err.message);
  }

  return result;
}
