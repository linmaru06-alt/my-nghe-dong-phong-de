---
name: dongphong-seo
description: >-
  Kỹ năng SEO & GEO chuyên sâu cho Mỹ Nghệ Đông Phong. Tối ưu Schema.org JSON-LD (Product, Article, LocalBusiness),
  tối ưu tìm kiếm AI (Google AI Overviews, ChatGPT, Gemini), chiến lược từ khóa đồ gỗ quý phong thủy,
  tiêu chuẩn biên soạn nội dung V3.0 (Marketing Skills, PAS Flow, FAQ Top 0) và lịch xuất bản tự động 3 ca vàng.
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

---

## 5. Tiêu Chuẩn Biên Soạn Nội Dung & Xuất Bản Tự Động V3.0 (Marketing Skills)

Quy định áp dụng cho toàn bộ bài viết trên web và hệ thống xuất bản tự động AI (`scripts/ai-schedule-publisher.mjs`):

### 5.1. Nhịp Xuất Bản 3 Ca Vàng (Tỷ lệ 2 Phong Thủy : 1 Bảo Quản)
- **Ca 1 (07:30 VN - Sáng):** Bảo quản sản phẩm & Kỹ thuật dưỡng mộc (`bao-quan-san-pham`). Hướng dẫn chống nồm, xử lý dính nước/mồ hôi, lau mộc cotton, hồi hương tinh dầu, thay dây hạt.
- **Ca 2 (11:30 VN - Trưa):** Kiến thức danh mộc & Nhận diện thật - giả (`kien-thuc-ve-go`). Phân tích thớ gỗ, tôm gỗ, so sánh đặc tính danh mộc (Tử Đàn, Sưa Đỏ, Bách Xanh, Mun Sừng, Hoàng Đàn...).
- **Ca 3 (20:30 VN - Tối):** Cẩm nang Phong thủy Ngũ Hành theo Năm sinh & Nghề nghiệp (`huong-dan-lua-chon`). Khai thác trọn bộ **60 chủ đề ngũ hành** (Kim: 12, Mộc: 12, Thủy: 12, Hỏa: 12, Thổ: 12) từ `data/content-pillars.json`.

### 5.2. Nguyên Tắc Copywriting Đỉnh Cao (Marketing Skills Corey Haines)
1. **Mở bài bằng Hook sắc bén (Cut Throat-Clearing):**
   - **Tuyệt đối cấm:** Các câu mở đầu rập khuôn sáo rỗng như *"Chào mừng quý vị...", "Tôi là nghệ nhân trưởng...", "Hôm nay tôi xin chia sẻ...", "Trong bài viết này..."*.
   - **Thay bằng:** Đi thẳng vào một nghịch lý, một quan niệm phong thủy sai lầm phổ biến, hoặc câu chuyện thực tế về thớ gỗ tại xưởng.
   - Đoạn mở đầu 40–60 từ trả lời trực diện vấn đề để Google AI Overviews dễ trích xuất (Direct Answer).
2. **Bỏ hoàn toàn bảng so sánh HTML `<table>`:**
   - Người đọc chủ yếu dùng điện thoại di động; bảng `<table>` gây tràn màn hình và tạo cảm giác văn mẫu khô cứng.
   - Sử dụng các danh sách gạch đầu dòng `<ul><li>` có in đậm từ khóa `<strong>` hoặc các đoạn văn đối chiếu tương phản ngắn.
3. **Chống độn chữ (Anti-Padding):**
   - Độ dài bài viết đạt **800 – 1.200 từ thực tế** (tính theo số từ văn bản).
   - Nghiêm cấm viết lặp ý, câu nào ra câu đó. Dừng bài viết khi đã truyền tải trọn vẹn giá trị cho người đọc.
4. **Khối Hỏi – Đáp (FAQ) đón đầu AI Search:**
   - Cuối bài viết (trước phần CTA), bắt buộc có một mục `<h2>Những câu hỏi thường gặp</h2>`.
   - Gồm **3 – 4 câu hỏi** thực tế người chơi gỗ hay băn khoăn (`<h3>`), mỗi câu trả lời dứt khoát trong 2 – 3 câu chuẩn xác để AI Bot (Google AI Overviews, Perplexity) dễ trích Top 0.
5. **Liên kết nội bộ tự nhiên (Internal Links):**
   - Đan xen 2 – 3 liên kết ngữ cảnh dẫn về các trang sản phẩm (`/san-pham/vong-tay`, `/san-pham/but-ky`, `/san-pham/goi-go`, `/san-pham/bi-lan-tay`) hoặc cẩm nang kiến thức (`/bai-viet`).
6. **Xoay vòng 5 mẫu Lời Kêu Gọi Zalo (Frictionless CTAs):**
   - Mẫu 1 (Đo size tay): Tư vấn đo size hạt 10mm, 12mm, 14mm miễn phí qua ảnh cổ tay.
   - Mẫu 2 (Năm sinh bản mệnh): Tra cứu bảng ngũ hành nạp âm cá nhân hóa.
   - Mẫu 3 (Quà tặng đối tác/sếp): Tư vấn mẫu phẩm theo độ tuổi và ngành nghề vị thế.
   - Mẫu 4 (Thẩm định thật - giả): Thẩm định miễn phí ảnh chụp cận cảnh vân gỗ.
   - Mẫu 5 (Trải nghiệm phôi mộc): Quay video cận cảnh phôi thô trước khi tiện hạt.
7. **Quy tắc hình ảnh chụp thật 100% tìm kiếm từ mạng internet:**
   - 100% hình ảnh bài viết là **ảnh chụp thật được tìm kiếm tự động từ các trang web, bài viết nghiên cứu chuyên ngành đồ gỗ uy tín trên mạng internet** (khớp theo từng chất gỗ: Hoàng đàn, Tử đàn, Sưa đỏ, Bách xanh, Mun sừng...).
   - **Tuyệt đối cấm sử dụng ảnh do AI tạo** (Midjourney, DALL-E, Stable Diffusion).
   - **Không sử dụng kho ảnh cố định trùng lặp** để mỗi bài viết đều có hình ảnh thực tế độc bản, sắc nét.
