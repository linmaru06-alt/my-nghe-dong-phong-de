---
name: programmatic-seo
description: >-
  Cổng kiểm soát dữ liệu tự động, chống trùng lặp slug, chống dồn cục từ khóa và bảo đảm chất lượng nội dung quy mô lớn cho hệ thống xuất bản tự động Mỹ Nghệ Đông Phong.
---

# Programmatic SEO & Content Guard Skill — Mỹ Nghệ Đông Phong

Kỹ năng này thiết lập quy chuẩn kiểm soát tự động hóa nội dung (Programmatic Quality Gate) cho cỗ máy xuất bản 3 ca vàng của Mỹ Nghệ Đông Phong, ngăn chặn triệt để tình trạng trùng lặp dữ liệu, dồn cục một chủ đề hoặc xuất bản bài viết kém chất lượng lên cơ sở dữ liệu Supabase.

---

## 1. Khi Nào Kích Hoạt (Triggers)

* Chạy trước và trong quá trình sinh nội dung tự động bằng `scripts/ai-schedule-publisher.mjs`.
* Khi AI lựa chọn chủ đề xuất bản cho ca tiếp theo (Slot 1, Slot 2, Slot 3).
* Khi rà soát tính toàn vẹn của dữ liệu trong `data/posts.json` và bảng `posts` trên Supabase.

---

## 2. Bốn Rào Chắn Chất Lượng Dữ Liệu Tự Động (4 Quality Gates)

### [Gate 1] Khóa Duy Nhất Slug & Chống Va Chạm (Unique Slug Anti-Collision)
* **Quy tắc:** Mỗi bài viết phải có một đường dẫn `slug` độc bản, duy nhất trên toàn hệ thống.
* **Cơ chế kiểm soát:**
  1. Trước khi lưu, hàm kiểm tra phải quét đối chiếu slug mới với toàn bộ mảng `data/posts.json` và bảng `posts` trên Supabase.
  2. Nếu phát hiện slug đã tồn tại (collision):
     * Không ghi đè hoặc gây lỗi `posts_slug_key` vi phạm ràng buộc DB.
     * Tự động thêm hậu tố định danh tự nhiên hoặc mã năm sinh (Ví dụ: `tuoi-mau-thin-1988-deo-vong-gi-kich-tai-loc-nam-2026`).

### [Gate 2] Chống Dồn Cục & Luân Chuyển Ngũ Hành (Round-Robin Recency Distance)
* **Vấn đề cần tránh:** Hiện tượng một chủ đề bị viết liên tiếp nhiều ngày (như trường hợp 26 bài Mệnh Kim trước đây), gây hiện tượng "ăn thịt từ khóa" (Keyword Cannibalization).
* **Cơ chế luân chuyển 5 Mệnh:**
  * Bài gần nhất là **[KIM]** ➔ Ca này bắt buộc chọn **[MỘC]**.
  * Bài gần nhất là **[MỘC]** ➔ Ca này bắt buộc chọn **[THỦY]**.
  * Bài gần nhất là **[THỦY]** ➔ Ca này bắt buộc chọn **[HỎA]**.
  * Bài gần nhất là **[HỎA]** ➔ Ca này bắt buộc chọn **[THỔ]**.
  * Bài gần nhất là **[THỔ]** ➔ Ca này quay lại **[KIM]**.
* **Đo khoảng cách thời gian (Recency Distance):** Trong cùng một mệnh, ưu tiên chọn các tuổi hoặc chủ đề chưa từng viết, hoặc có khoảng cách xuất bản xa nhất trong lịch sử.

### [Gate 3] Cổng Kiểm Soát Độ Dày Chuyên Sâu (Word Count & Depth Gate)
* **Quy chuẩn độ dài:** Bắt buộc thân bài (`content`) đạt tối thiểu **800 từ** (khuyến nghị 900 - 1.200 từ).
* **Cơ chế xử lý khi thiếu từ:**
  * Nếu model AI trả về dưới 800 từ (ví dụ 600 từ), hệ thống tự động gắn cờ *"Chưa đủ điều kiện"* và kích hoạt fallback gọi model tiếp theo hoặc yêu cầu mở rộng góc phân tích tôm gỗ, cơ chế lên nước, cách bảo dưỡng.
  * Tuyệt đối không cho phép xuất bản các bài viết ngắn, sơ sài làm loãng chất lượng website.

### [Gate 4] Khóa An Toàn Cơ Sở Dữ Liệu & Bài Giữ Lại (Database & Draft Guard)
* **Bảo vệ toàn vẹn dữ liệu:** Tuyệt đối không chạy các lệnh phá hủy DB (`DROP TABLE`, `DROP COLUMN`) làm mất bài viết đang hoạt động.
* **Cơ chế giữ bài (Draft Safety):**
  * Các bài viết đang giữ hoặc bài nháp mang `status = 'draft'` hoặc `status = 'hold'` trong `posts.json` **tuyệt đối không bao giờ được tự động đẩy lên Supabase**.
  * Script đồng bộ luôn lọc qua điều kiện: `posts.filter(b => b.status === 'published')`.

---

## 3. Ma Trận Chủ Đề Chuẩn Hóa Theo 3 Khung Giờ Vàng

1. **Ca 1 (07:30 VN — kien-thuc-ve-go):**
   * Bách khoa gỗ quý toàn cầu & Kiến thức danh mộc (Tử Đàn Ấn Độ, Sưa Đỏ Bắc Bộ, Bách Xanh Mộc Châu, Mun Sừng Khánh Hòa, Trầm Hương, Hoàng Đàn Tuyết, Huyết Long, Trắc, Cẩm Lai...).
2. **Ca 2 (11:30 VN — huong-dan-lua-chon Ca Trưa):**
   * Cẩm nang phong thủy theo tuổi, ngũ hành bản mệnh 60 hoa giáp, hướng dẫn đo size tay và chọn quà tặng phong thủy.
3. **Ca 3 (20:30 VN — huong-dan-lua-chon Ca Tối):**
   * Nghệ thuật dưỡng gỗ, xử lý khi vòng dính nước, giải mã nghịch lý phong thủy (Kim khắc Mộc, Thủy hỏa tương tranh), tâm sự nghệ nhân mộc.

