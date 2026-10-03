# AGENTS.md — Hướng dẫn và Kiến trúc AI Agent: Mỹ Nghệ Đông Phong

Tài liệu này đóng vai trò là kim chỉ nam (Master Context & Rules) cho các AI Agent khi tham gia phát triển, bảo trì và mở rộng hệ thống website thương hiệu đồ gỗ cao cấp **Mỹ Nghệ Đông Phong**.

---

## 1. Tổng quan Dự án & Tôn chỉ Thương hiệu

- **Tên thương hiệu:** Mỹ Nghệ Đông Phong
- **Lĩnh vực:** Thủ công mỹ nghệ, đồ gỗ quý phong thủy & đời sống (Vòng tay gỗ quý, bút ký phong thủy, bi lăn tay, gối gỗ, tẩu gỗ, đũa gỗ xuất khẩu, đệm khoác ô tô gỗ quý).
- **Mô hình kinh doanh:** Giới thiệu sản phẩm cao cấp kết hợp chia sẻ kiến thức chuyên sâu về các loại gỗ quý (Tử đàn, Sưa, Bách xanh, Mun sừng, Hoàng đàn, Huyết long, Trắc...).
- **Kênh chuyển đổi chính:** Tư vấn trực tiếp cá nhân hóa qua **Zalo** và **Hotline điện thoại**. Không áp dụng giỏ hàng, thanh toán online hay tài khoản khách hàng ở phiên bản hiện tại.

---

## 2. Định hướng Thẩm mỹ & Giao diện (Luxury Aesthetics)

Toàn bộ giao diện phải toát lên nét đẹp tinh tế, trầm ấm và đẳng cấp của gỗ thủ công:

- **Bảng màu chủ đạo:**
  - Nền chính: Trắng ngọc / kem nhạt thượng hạng (`#FDFBF7`, `#FAF6F0`).
  - Điểm nhấn gỗ quý: Nâu gỗ óc chó / trắc / tử đàn (`#3D2314`, `#5C3A21`, `#2A160C`).
  - Điểm nhấn sang trọng: Vàng đồng / Hoàng kim cổ điển (`#C5A059`, `#D4AF37`).
  - Màu chữ: Nâu đen đậm (`#1F1610`) và xám trầm (`#5A4A42`), độ tương phản cao, êm mắt.
- **Typography:**
  - Tiêu đề & Thương hiệu: Serif cổ điển, quý phái (Google Fonts: `Cinzel`, `Playfair Display`, hoặc `Merriweather`).
  - Nội dung & Thao tác: Sans-serif hiện đại, tối ưu tiếng Việt chuẩn (Google Fonts: `Be Vietnam Pro` hoặc `Plus Jakarta Sans`).
- **Hình ảnh:**
  - Ảnh lớn, sắc nét, tôn vinh cận cảnh thớ gỗ, nu gỗ, vân gỗ và độ hoàn thiện thủ công.
  - Tuyệt đối không dùng ảnh placeholder vỡ nét hoặc ảnh giả lập kém chất lượng.
- **Tối ưu di động (Mobile-First):**
  - Khách hàng phần lớn truy cập trên điện thoại. Menu trực quan, thanh tìm kiếm nhanh, nút Zalo & Gọi điện luôn nổi ở vị trí ngón tay cái dễ bấm nhất.

---

## 3. Quy tắc Nghiệp vụ Sản phẩm & Bán hàng

1. **7 Danh mục sản phẩm chuẩn:**
   1. `Vòng tay` (Tử đàn, Sưa, Nu bách xanh, Nu ngọc am chìm, Chớp bách xanh, Trầm)
   2. `Bút ký` (Nu huyết long, Nu bách xanh, Hoàng đàn, Mun sừng)
   3. `Bi lăn tay` (Cẩm, Sưa)
   4. `Gối gỗ` (Sưa, Bách xanh)
   5. `Tẩu` (Gỗ trắc cán sừng, Gỗ nu cẩm)
   6. `Đũa gỗ` (Mun sừng, Gỗ trắc)
   7. `Đệm khoác ô tô` (Gỗ trắc, Bách xanh)
2. **Quy tắc hiển thị giá:**
   - Sản phẩm có giá: Định dạng chuẩn VNĐ (Ví dụ: `1.850.000 ₫`).
   - Sản phẩm chưa có giá hoặc theo thời giá gỗ: Hiển thị chữ `Liên hệ báo giá`.
   - **Tuyệt đối không hiển thị `0 ₫`** hoặc khoảng trống giá khi chưa nhập.
3. **Quy tắc kích thước & biến thể:**
   - Một sản phẩm có thể có nhiều kích thước (ví dụ vòng tay 10mm, 12mm, 14mm, 16mm).
   - Dùng 1 trang chi tiết duy nhất, khách click chọn kích thước thì giá tự động nhảy theo.
   - Kích thước nào chưa có giá riêng sẽ hiển thị `Liên hệ báo giá`.
4. **Mã sản phẩm (SKU):**
   - Luôn hiển thị nổi bật mã sản phẩm (ví dụ: `VT-TUDAN-01`) cạnh nút "Nhắn Zalo" và "Gọi điện".
   - Khi bấm Zalo hoặc Gọi điện, hệ thống tự động đính kèm mã sản phẩm vào lời chào để khách hàng không cần gõ lại.

---

## 4. Quy tắc Trang Quản trị (Admin CMS)

- Quản lý tập trung: Sản phẩm, Bài viết, Danh mục, Loại gỗ, Thông tin liên hệ.
- Trạng thái nội dung: Có 2 trạng thái rõ ràng là `Nháp (Draft)` và `Đã đăng (Published)`. Chỉ nội dung `Đã đăng` mới hiển thị ngoài trang chủ và danh mục.
- Tích hợp tính năng ghim `Sản phẩm nổi bật (Featured)` lên trang chủ.
- Dữ liệu quản trị được đồng bộ qua `StorageAdapter` (hỗ trợ LocalStorage, file JSON mock, và sẵn sàng kết nối REST/GraphQL Backend).

---

## 5. Môi trường & Quy chuẩn Kỹ thuật (Technical Guidelines)

- **Hệ điều hành:** Windows (PowerShell).
- **Lưu ý quan trọng về Command Line:**
  - Luôn sử dụng `npm.cmd` thay cho `npm` (để tránh lỗi PowerShell script execution policy).
  - Luôn sử dụng `npx.cmd` thay cho `npx`.
- **Ngôn ngữ & Framework:**
  - JavaScript / React hiện đại.
  - CSS: Vanilla CSS thuần, tổ chức dạng modular BEM, biến màu toàn cục CSS Custom Properties (`--bg-primary`, `--wood-primary`, `--accent-gold`...).
  - Mã hóa UTF-8 đầy đủ cho tiếng Việt có dấu.
- **Cấu trúc Agent Skills & Rules:**
  - Luôn tham khảo các tài liệu trong `.agents/rules/` và `.agents/skills/` trước khi thực hiện chỉnh sửa cấu trúc dữ liệu hoặc giao diện.

---

## 6. Quy chuẩn Đẩy mã nguồn & Kiểm soát Chất lượng (Git Push & CI/CD Gate)

Để bảo đảm website chạy ổn định, không bao giờ bị gãy build trên Vercel hoặc mất kết nối Supabase, toàn bộ AI Agent và lập trình viên bắt buộc tuân thủ:

1. **Kiểm tra bắt buộc trước khi Git Push (Local Quality Gate):**
   - **BẮT BUỘC** chạy lệnh kiểm tra chất lượng trước khi commit/push:
     ```bash
     npm run check:pre-push
     ```
     Lệnh này sẽ tự động chạy:
     - `npx tsc --noEmit`: Bắt toàn bộ lỗi kiểu dữ liệu TypeScript (chặn lỗi type inference `never`).
     - `npm run build`: Mô phỏng 100% quá trình Vercel đóng gói 52+ trang static/dynamic.
     - Kiểm tra kết nối Supabase và biến môi trường.
2. **Quy tắc xử lý lỗi (Zero-Fault Policy):**
   - Tuyệt đối **KHÔNG ĐƯỢC PHÉP** `git push` nếu lệnh build hoặc type-check còn báo lỗi (`exit code != 0`).
   - Phải sửa triệt để tất cả lỗi biên dịch và warning nguy hiểm tại môi trường cục bộ trước khi đẩy lên GitHub.
   - Không được sử dụng cờ bỏ qua kiểm tra `--no-verify` khi push trừ trường hợp khẩn cấp có chỉ định rõ ràng từ chủ dự án.
3. **Bảo vệ nhánh chính (Branch Protection & GitHub Actions):**
   - Hệ thống GitHub Actions CI (`.github/workflows/ci.yml`) sẽ tự động kiểm tra độc lập trên mỗi commit/Pull Request.
   - Nhánh `main` chỉ nhận các commit vượt qua cả bài kiểm tra cục bộ và bài kiểm tra trên GitHub CI.

---

## 7. Quy trình 1-Click SQL & Cơ chế Supabase An toàn

- **Nguyên tắc bất di bất dịch**: Tuyệt đối **KHÔNG** chạy các lệnh phá hủy DB (`DROP TABLE`, `DROP COLUMN`) làm mất dữ liệu sản phẩm, bài viết đang hoạt động.
- **Cơ chế 1-Click SQL**:
  1. Viết code TypeScript Frontend/Backend trước (kiểu dữ liệu an toàn).
  2. Tạo toàn bộ mã SQL cần thiết (`CREATE TABLE IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS`, Index, RLS policy).
  3. Xuất toàn bộ mã SQL vào **một khối code duy nhất** (` ```sql `) ở cuối câu trả lời.
  4. Người dùng chỉ việc copy khối SQL đó dán vào Supabase SQL Editor và bấm Run một lần duy nhất.
- **Bảo mật RLS**: Luôn bật Row Level Security: Khách truy cập (Public) chỉ có quyền `SELECT` các bài viết/sản phẩm có `status = 'published'`; Admin có quyền toàn bộ.

---

## 8. Tiêu chuẩn SEO & Semantic HTML (SEO Standards)

- **Semantic HTML**: Mỗi trang chỉ có **duy nhất 1 thẻ `<h1>`** mang từ khóa trọng tâm. Phân cấp `<h2>` -> `<h3>` logic.
- **Thuộc tính ảnh `alt`**: Bắt buộc 100% ảnh thớ gỗ, vân gỗ phải có thuộc tính `alt` mô tả trực quan và giàu giá trị thực thể, cấm để trống hoặc generic.
- **Core Web Vitals**: Luôn có `aspect-ratio` chống nhảy giật layout (CLS < 0.1), ảnh below-the-fold phải dùng `loading="lazy"`.
- **Tối ưu tìm kiếm AI (GEO)**: Đoạn mở đầu Direct Answer 40-60 từ trả lời trực tiếp thắc mắc cốt lõi, duy trì file `public/llms.txt` để hỗ trợ AI bot (ChatGPT, Gemini, Perplexity).
- **Bảo vệ trang riêng tư**: Chặn tuyệt đối Google index khu vực quản trị CMS (`/admin`, `/admin/*`) qua `robots.ts` và thẻ meta `noindex, nofollow`.


