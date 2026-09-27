---
name: dongphong-seo
description: >-
  Kỹ năng SEO & GEO chuyên sâu cho Mỹ Nghệ Đông Phong. Tối ưu Schema.org JSON-LD (Product, Article, LocalBusiness),
  tối ưu tìm kiếm AI (Google AI Overviews, ChatGPT, Gemini), chiến lược từ khóa đồ gỗ quý phong thủy và audit kỹ thuật SEO.
---

# Dong Phong SEO & GEO Mastery Skill

Tài liệu hướng dẫn kỹ năng tối ưu hóa công cụ tìm kiếm truyền thống (SEO Google) và tối ưu hóa công cụ tìm kiếm trí tuệ nhân tạo (GEO - Generative Engine Optimization) may đo chuyên biệt cho thương hiệu **Mỹ Nghệ Đông Phong**.

---

## 1. Kiến trúc Cấu trúc Dữ liệu (Schema.org JSON-LD)

Theo chuẩn Google cập nhật 2026, Schema.org là chìa khóa để hiển thị Rich Results và giúp AI hiểu sâu về thực thể sản phẩm đồ gỗ quý.

### 1.1. Product Schema (Trang Chi tiết Sản phẩm)
Mỗi sản phẩm tại `/san-pham/[slug]` bắt buộc phải có JSON-LD `@type: Product`:
- **`name`**: Tên sản phẩm đầy đủ (Ví dụ: "Vòng Tay Gỗ Tử Đàn Tiểu Diệp Kim Sa").
- **`image`**: Mảng URL tuyệt đối của hình ảnh sản phẩm.
- **`sku`**: Mã sản phẩm chuẩn (Ví dụ: `VT-TD-01`).
- **`brand`**: `{"@type": "Brand", "name": "Mỹ Nghệ Đông Phong"}`.
- **`material`**: Loại gỗ quý (Tử Đàn, Sưa đỏ, Bách xanh, Mun sừng...).
- **`offers`**: Khai báo `@type: Offer` hoặc `@type: AggregateOffer`:
  - `priceCurrency`: "VND"
  - `availability`: "https://schema.org/InStock"
  - `itemCondition`: "https://schema.org/NewCondition"

### 1.2. Article / BlogPosting Schema (Trang Chi tiết Bài viết)
Mỗi bài viết tại `/bai-viet/[slug]` có JSON-LD `@type: BlogPosting`:
- **`headline`**: Tiêu đề bài viết.
- **`author`**: `{"@type": "Person", "name": "Nghệ nhân Đông Phong"}` (Gia tăng chỉ số tin cậy E-E-A-T).
- **`publisher`**: `{"@type": "Organization", "name": "Mỹ Nghệ Đông Phong", "logo": {"@type": "ImageObject", "url": "https://mynghedongphong.vn/images/logo.png"}}`.
- **`datePublished`**: Định dạng chuẩn ISO 8601 (YYYY-MM-DD).

### 1.3. Những loại Schema KHÔNG ĐƯỢC DÙNG (Đã bị Google khai tử):
- ❌ **HowTo**: Google đã hủy bỏ Rich Result HowTo từ tháng 9/2023.
- ❌ **FAQPage**: Google đã chính thức hủy bỏ Rich Result FAQPage cho toàn bộ website từ 7/5/2026.

---

## 2. Chiến lược GEO (Generative Engine Optimization - Tối ưu tìm kiếm AI)

Để **Google AI Overviews**, **ChatGPT**, **Gemini**, **Perplexity** ưu tiên trích dẫn Đông Phong khi người dùng hỏi đáp:

1. **Định nghĩa chuẩn xác (Fact-based Information):**
   Mỗi trang sản phẩm hoặc bài viết cần có 1 đoạn tóm tắt rõ ràng: Đặc tính phôi gỗ, xuất xứ địa lý (Ấn Độ, Bắc Bộ, Lạng Sơn), phương pháp phân biệt thật - giả.
2. **Trích dẫn chuyên gia & Làng nghề truyền thống:**
   Khẳng định xuất xứ xưởng mộc gia truyền, cam kết thử nước, soi thấu quang hoặc mùi hương tinh dầu tự nhiên.
3. **Cấu trúc hỏi đáp trực tiếp (Direct Answers):**
   Trong bài viết, đặt các thẻ `h2` là câu hỏi người dùng hay thắc mắc (Ví dụ: *Cách nhận biết gỗ Tử Đàn Tiểu Diệp xịn*, *Số hạt vòng tay phong thủy chuẩn nam nữ*).

---

## 3. Quy chuẩn Thẻ Meta & OpenGraph

- **Title Tag**: Tối đa 60 ký tự, cấu trúc: `[Tên Tác Phẩm/Bài Viết] | Mỹ Nghệ Đông Phong`.
- **Meta Description**: 130 - 155 ký tự, bao gồm tên loại gỗ quý, cam kết kiểm tra hàng trước khi nhận, tư vấn Zalo.
- **Thẻ OpenGraph (OG:Image)**: Kích thước 1200x630px, định dạng WebP/JPG sắc nét để khi chia sẻ lên Zalo/Facebook hiển thị ảnh preview sang trọng.

---

## 4. Danh mục Từ khóa Trọng tâm cho Xưởng Mộc

- **Vòng tay:** Vòng tay gỗ tử đàn tiểu diệp, vòng tay sưa đỏ bắc bộ, vòng nu bách xanh chìm nước, vòng trầm hương tự nhiên.
- **Bút ký:** Bút ký phong thủy mộc, bút nu huyết long thấu quang, bút gỗ hoàng đàn tuyết làm quà biếu sếp.
- **Gối & Đệm ô tô:** Gối gỗ sưa thoáng khí, đệm ghế ô tô hạt gỗ trắc, đệm bách xanh massage lưng.
- **Đũa & Dưỡng sinh:** Đũa gỗ mun sừng cao cấp, bi lăn tay gỗ cẩm lai dưỡng sinh.
