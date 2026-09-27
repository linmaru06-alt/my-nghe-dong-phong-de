# Quy chuẩn SEO & Schema: Mỹ Nghệ Đông Phong

Tài liệu quy chuẩn bắt buộc áp dụng khi xây dựng hoặc cập nhật bất kỳ trang nội dung nào trên website Mỹ Nghệ Đông Phong.

---

## 1. Yêu cầu Cấu trúc Dữ liệu (Structured Data)
1. **Trang sản phẩm (`/san-pham/[slug]`):** Phải chứa script JSON-LD `@type: Product`, đính kèm mã SKU, tên thương hiệu Đông Phong, loại gỗ `material`, và khoảng giá `offers`.
2. **Trang bài viết (`/bai-viet/[slug]`):** Phải chứa script JSON-LD `@type: BlogPosting`, tác giả là `Nghệ nhân Đông Phong`, ngày xuất bản chuẩn ISO 8601.
3. **Trang chủ (`/`):** Chứa script JSON-LD `@type: Organization` và `@type: WebSite` với thông tin liên hệ Hotline và Zalo.

## 2. Tiêu chuẩn Thẻ Meta & Hình ảnh
- Thẻ `<h1>` duy nhất trên mỗi trang.
- Thẻ ảnh `<img>` hoặc Next.js `<Image />` bắt buộc phải có `alt` mô tả thớ gỗ, tên tác phẩm, tuyệt đối không để trống `alt=""`.
- URL thân thiện chuẩn SEO tiếng Việt không dấu, nối bằng dấu gạch ngang (ví dụ: `/san-pham/vong-tay-go-tu-dan-tieu-diep`).
