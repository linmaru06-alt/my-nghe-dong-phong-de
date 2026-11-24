---
name: blog-seo-check
description: >-
  Thanh tra và kiểm duyệt chất lượng kỹ thuật SEO, GEO và chuẩn nhận diện thương hiệu Mỹ Nghệ Đông Phong trước khi xuất bản bài viết lên website và Supabase.
---

# Blog SEO Check Skill — Mỹ Nghệ Đông Phong

Kỹ năng này đóng vai trò là "Cổng thanh tra chất lượng kỹ thuật" (Pre-Publishing Technical & Brand Quality Gate) độc lập, bảo đảm 100% bài viết kiến thức gỗ và phong thủy xuất bản trên website Mỹ Nghệ Đông Phong đạt chuẩn SEO Onpage đỉnh cao, đón đầu tìm kiếm AI (Google AI Overviews, Gemini, ChatGPT) và giữ trọn hồn mộc nghệ nhân.

---

## 1. Khi Nào Kích Hoạt (Triggers)

* Chạy tự động bên trong `scripts/ai-schedule-publisher.mjs` trước khi lưu bài viết mới vào `posts.json` và Supabase.
* Khi người dùng hoặc agent yêu cầu: *"soát SEO bài viết"*, *"kiểm tra chuẩn SEO bài này"*, *"audit chất lượng bài viết"*.
* Khi chạy lệnh rà soát toàn bộ bài viết trong hệ thống: `npm run check:seo-audit`.

---

## 2. Bảng 7 Tiêu Chuẩn Vàng Kiểm Duyệt (Pass/Fail Checklist)

Mọi bài viết xuất bản đều phải vượt qua toàn bộ 7 tiêu chuẩn sau:

### [C1] Tiêu Đề Bài Viết (Title Tag)
* **Quy chuẩn độ dài:** 45 - 65 ký tự.
* **Quy chuẩn nội dung:** Phải chứa từ khóa cốt lõi (Năm sinh âm lịch / Bản mệnh Ngũ Hành / Loại gỗ quý: *Tử Đàn, Sưa đỏ, Bách Xanh, Trầm Hương, Mun sừng, Hoàng Đàn, Huyết Long, Trắc*).
* **Cấm:** Không dùng từ ngữ giật gân, spam viết hoa toàn bộ, hoặc dấu câu bất thường.

### [C2] Phân Cấp Heading & Cấm Bảng Table (Mobile-First)
* **Thẻ H1:** Duy nhất 1 thẻ `<h1>` trên trang (do Next.js template tự kết xuất từ trường `title`). Thân bài (`content`) tuyệt đối không chứa thêm thẻ `<h1>`.
* **Thẻ H2 & H3:** Phân cấp logic `<h2>` cho các luận điểm lớn và `<h3>` cho các luận cứ / câu hỏi con.
* **Quy tắc tiêu đề H2:** Tuyệt đối **KHÔNG đánh số thứ tự** ở tiêu đề lớn (`1. `, `2. `, `Phần 1: `) để tránh cảm giác giáo điều, khô cứng.
* **Cấm tuyệt đối thẻ `<table>`:** Không sử dụng bảng so sánh trong bài viết vì gây tràn ngang màn hình điện thoại (mobile overflow). Thay vào đó, dùng danh sách `<ul><li>` có in đậm `<strong>` ở đầu mỗi ý.

### [C3] GEO Direct Answer (Đoạn Mở Bài Chuẩn Tìm Kiếm AI)
* **Quy chuẩn:** Ngay sau tiêu đề, đoạn mở bài phải là một khối dẫn dắt 40 - 60 từ (Answer-First).
* **Nhiệm vụ:** Trả lời trực diện thắc mắc lớn nhất của người đọc (Ví dụ: *Tuổi Mậu Thìn hợp vòng gì? Mệnh Thủy nên đeo gỗ nào?*). Giúp các công cụ AI (Google AI Overviews, Perplexity, Gemini) trích dẫn trực tiếp thương hiệu Đông Phong lên vị trí Top 0.

### [C4] 100% Ảnh Chụp Thật & Thuộc Tính `alt` Giàu Thực Thể
* **Tôn chỉ bất di bất dịch:** Tuyệt đối **CẤM ảnh tạo từ AI** (Midjourney, DALL-E) hoặc ảnh giả lập 3D. Khách sành gỗ rất tinh mắt; vân gỗ AI biến dạng sẽ phá hủy uy tín thương hiệu.
* **Nguồn ảnh:** Phải là ảnh chụp phôi mộc thật từ xưởng hoặc tư liệu nghiên cứu chuyên ngành gỗ uy tín trên mạng.
* **Thẻ `alt`:** 100% hình ảnh trong bài phải có thuộc tính `alt` miêu tả chi tiết thớ gỗ, vân gỗ hoặc tác phẩm kèm tên loại gỗ thật. Nghiêm cấm để trống hoặc dùng từ chung chung (`alt="ảnh"`).

### [C5] Liên Kết Nội Bộ Chuẩn 7 Danh Mục (Internal Links)
* **Số lượng:** Tối thiểu 2 - 3 liên kết nội bộ tự nhiên dẫn người đọc sang các trang sản phẩm hoặc chuyên mục liên quan.
* **Đích đến chuẩn xác:** Phải trỏ về đúng 7 danh mục sản phẩm của Đông Phong:
  * `/san-pham/vong-tay`
  * `/san-pham/but-ky`
  * `/san-pham/bi-lan-tay`
  * `/san-pham/goi-go`
  * `/san-pham/tau`
  * `/san-pham/dua-go`
  * `/san-pham/dem-khoac-o-to`
  * Hoặc cẩm nang tổng hợp: `/bai-viet`.
* **Cấm:** Không chèn link cụt, link 404, hoặc liên kết ra website thương mại điện tử bên ngoài.

### [C6] Lời Kêu Gọi Zalo Nghệ Nhân (Frictionless CTAs)
* **Vị trí:** Cuối mỗi bài viết, trước phần FAQ.
* **Quy chuẩn:** Phải áp dụng 1 trong 5 mẫu CTA giảm rào cản tâm lý mua hàng của Đông Phong (chưa cần mua, tư vấn đo size tay miễn phí, tra ngũ hành năm sinh, thẩm định gỗ thật giả bằng ảnh chụp cận cảnh, gợi ý quà tặng đối tác, xem video phôi mộc).
* **Hotline/Zalo:** Luôn kèm số hotline nghệ nhân `0961.668.612` và link `https://zalo.me/0961668612`.

### [C7] Khối FAQ Đón Đầu AI Overviews Top 0
* **Số lượng:** 3 - 4 câu hỏi - đáp ngắn gọn, dứt khoát ở cuối bài.
* **Cấu trúc:** Thẻ `<h3>Câu hỏi?</h3>` theo sau bởi `<p>Câu trả lời trực diện 40-70 từ.</p>`.
* **Chủ đề:** Giải quyết các băn khoăn thực tế: *Đeo vòng khi ngủ có sao không? Vòng dính nước xử lý thế nào? Tại sao gỗ lên nước bóng?*

---

## 3. Đầu Ra Báo Cáo Của Skill

Khi tiến hành kiểm tra một bài viết, xuất kết quả theo mẫu chuẩn sau:

```markdown
### 📋 BÁO CÁO KIỂM DUYỆT SEO & THƯƠNG HIỆU: [TÊN BÀI VIẾT]

1. [C1] Tiêu đề (Title): ✅ ĐẠT (56 ký tự, có từ khóa "Mậu Thìn" & "Đại Lâm Mộc")
2. [C2] Phân cấp Heading: ✅ ĐẠT (Không chứa H1 trong bài, không đánh số H2, không dùng table)
3. [C3] GEO Direct Answer: ✅ ĐẠT (52 từ, trả lời trực diện)
4. [C4] Ảnh mộc thật & Alt: ✅ ĐẠT (Ảnh chụp thật, alt mô tả vân gỗ Tử Đàn Ấn Độ)
5. [C5] Liên kết nội bộ: ✅ ĐẠT (Có 3 links dẫn về /san-pham/vong-tay, /san-pham/but-ky, /bai-viet)
6. [C6] CTA Zalo Nghệ Nhân: ✅ ĐẠT (Mẫu thẩm định vân gỗ thật giả)
7. [C7] Khối FAQ AI Overviews: ✅ ĐẠT (3 câu hỏi H3 chuẩn xác)

👉 **KẾT LUẬN: ĐỦ ĐIỀU KIỆN XUẤT BẢN TRỰC TIẾP LÊN SUPABASE.**
```

