# Quy Chuẩn SEO & Semantic HTML (SEO Standards) — Mỹ Nghệ Đông Phong

Quy chuẩn này bắt buộc áp dụng khi xây dựng, chỉnh sửa các component giao diện, trang (pages) và thẻ metadata trên website **Mỹ Nghệ Đông Phong**.

---

## 1. Cấu Trúc Semantic HTML & Phân Cấp Heading
- **Thẻ Heading `<h1>`**: Mỗi trang chỉ được phép có **duy nhất một thẻ `<h1>`**. Thẻ này phải chứa từ khóa trọng tâm gắn liền với sản phẩm gỗ quý hoặc nội dung bài viết (Ví dụ: `<h1>Vòng Tay Gỗ Tử Đàn Tiểu Diệp Ấn Độ 108 Hạt</h1>`).
- **Phân cấp Heading logic**: Các thẻ `<h2>`, `<h3>`, `<h4>` phải phân cấp tuần tự logic, tuyệt đối không nhảy cóc từ `<h2>` xuống thẳng `<h4>`.
- **Cấu trúc ngữ nghĩa**: Sử dụng thẻ Semantic HTML chuẩn (`<main>`, `<header>`, `<nav>`, `<section>`, `<article>`, `<aside>`, `<footer>`), không bọc toàn bộ giao diện bằng các thẻ `<div>` vô nghĩa.

---

## 2. Tiêu Đề (Title) & Thẻ Mô Tả (Meta Description)
- Mỗi trang phải có thẻ tiêu đề `<title>` độc nhất, không trùng lặp hay để mặc định.
- **Công thức Tiêu đề**: `[Tên Tác Phẩm / Chủ Đề Gỗ Quý] | Mỹ Nghệ Đông Phong` (Độ dài: 45 - 60 ký tự).
- **Công thức Thẻ mô tả (`meta description`)**: Từ 130 - 160 ký tự. Nêu rõ đặc tính phôi gỗ quý (vân gỗ, tuổi gỗ, mùi hương), cam kết gỗ chuẩn 100%, bảo hành trọn đời và lời kêu gọi tư vấn qua Zalo / Hotline.

---

## 3. Thuộc Tính Ảnh & Trải Nghiệm Tải Trang (Core Web Vitals)
- **Thuộc tính `alt` có nghĩa**: Đồ gỗ phong thủy cao cấp bán bằng niềm tin vào thớ gỗ. Mọi thẻ `<img>` hoặc `Image` của Next.js đều bắt buộc phải có thuộc tính `alt` mô tả trực quan và giàu giá trị thực thể:
  - ✅ **Đúng**: `alt="Vân nu bách xanh Mộc Châu chìm nước chế tác vòng tay phong thủy"`
  - ❌ **Sai**: `alt="image"`, `alt="san-pham"`, hoặc `alt=""`.
- **Chống giật giao diện (CLS < 0.1)**: Luôn khai báo tỷ lệ khung hình `aspect-ratio` hoặc kích thước `width`, `height` cho ảnh sản phẩm, ảnh bài viết để tránh layout bị nhảy khi ảnh tải xong.
- **Tải ảnh lười (Lazy Loading)**: Áp dụng `loading="lazy"` cho toàn bộ ảnh nằm dưới màn hình đầu tiên (below-the-fold) để tăng tốc độ tải trang ban đầu (LCP < 2.5s).

---

## 4. Thẻ Chia Sẻ Mạng Xã Hội (OpenGraph & Zalo Preview)
Khi khách hàng hoặc tư vấn viên gửi đường dẫn sản phẩm/bài viết qua Zalo, Facebook:
- `og:site_name`: Mỹ Nghệ Đông Phong
- `og:title`: Hấp dẫn, tôn vinh giá trị gỗ quý nghệ thuật.
- `og:description`: Tóm tắt kích thước hạt, chất gỗ, cam kết bảo hành và thông tin xưởng.
- `og:image`: Luôn trỏ về URL ảnh chất lượng cao tỷ lệ chuẩn 1200x630px, định dạng WebP hoặc JPG sắc nét.
- `og:type`: `website` (trang chủ/danh mục) hoặc `article` (bài viết).

---

## 5. Phân Quyền & Bảo Vệ Trang Quản Trị (Robots Meta)
Tuyệt đối **KHÔNG** để Google lập chỉ mục các trang nội bộ của xưởng:
- Toàn bộ khu vực quản trị CMS: `/admin`, `/admin/*`
- Các endpoint API: `/api/*`
- Luôn cấu hình trong `robots.ts` hoặc gắn thẻ metadata:
  ```html
  <meta name="robots" content="noindex, nofollow" />
  ```

---

## 6. Tối Ưu Tìm Kiếm AI (GEO - Generative Engine Optimization)
Để các công cụ AI (Google AI Overviews, ChatGPT, Gemini, Perplexity) ưu tiên trích dẫn Đông Phong:
1. **Đoạn trả lời trực tiếp (Direct Answer Paragraph)**: Đầu mỗi bài viết hoặc trang danh mục, luôn có đoạn tóm tắt 40-60 từ trả lời trực diện thắc mắc cốt lõi (ví dụ: *"Cách phân biệt Tử Đàn Tiểu Diệp thật dựa trên trọng lượng chìm nước, vệt viết màu đỏ máu và ánh kim sa tự nhiên..."*).
2. **Dữ liệu minh bạch (Fact-based)**: Công khai kích thước hạt (10mm, 12mm, 14mm...), nguồn gốc phôi gỗ (Ấn Độ, Lào, Tây Nguyên), độ ẩm sấy và chính sách bảo hành.
3. **Cấu trúc `llms.txt`**: Cung cấp file tóm tắt toàn bộ danh mục và tri thức gỗ tại `public/llms.txt`.

---

## 7. Bảng Kiểm Duyệt (Audit Checklist) Khi Xuất Bản Tính Năng

Trước khi bàn giao bất kỳ trang hoặc chức năng mới nào ra môi trường production:
- [ ] Trang có duy nhất 1 thẻ `<h1>` chứa từ khóa trọng tâm?
- [ ] Thẻ `<title>` và `<meta description>` đúng cú pháp, hấp dẫn và chứa thương hiệu?
- [ ] 100% thẻ ảnh có thuộc tính `alt` mô tả sắc nét chất gỗ / chi tiết sản phẩm?
- [ ] Cấu trúc Schema JSON-LD hợp lệ (Product / Article / LocalBusiness)?
- [ ] Link chia sẻ hiển thị đúng thumbnail và mô tả khi gửi qua Zalo?
- [ ] Trang admin đã được chặn index bot an toàn (`noindex, nofollow`)?
- [ ] Chạy `npm run check:pre-push` đạt 100% không có lỗi?
