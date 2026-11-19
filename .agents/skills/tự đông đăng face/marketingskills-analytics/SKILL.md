---
name: marketingskills-analytics
description: >-
  Use this skill when reading Dong Phong numbers — whether a metric is calculated right, what to track, and how to name events: reach, hook retention, inbox, GA4.
---

# Analytics

*Trạng thái: Đã cài 13/11 — phục vụ Bước 1, 7.*

## Khi Nào Kích Hoạt (Triggers)

* Bước 1 — Chọn chủ đề vòng sau từ số liệu tuần trước.
* Bước 7 — Đọc số liệu sau khi bài đã đăng (24h/72h).

## 1. Nguyên Tắc

* **Track theo quyết định, không track vì dữ liệu.** Mỗi chỉ số phải trả lời được 1 quyết định cụ thể. Tránh chỉ số vanity.
* **Tính toán bằng script/bảng, không cộng nhẩm.** Kiểm chứng mỗi con số chính bằng 1 cách độc lập khác trước khi báo cáo.
* **So sánh cùng cửa sổ quan sát.** Tỉ lệ = tử và mẫu cùng 1 khoảng thời gian đóng. Nhóm (cohort) chưa hết cửa sổ quan sát thì tính là đang chờ, không tính là thất bại.
* **Kết luận theo mục tiêu đã nêu.** Phân tích kết thúc bằng khuyến nghị, và khuyến nghị phải lập luận từ mục tiêu trong brief — không chỉ từ cái gì dễ làm nhất.

## 2. Chỉ Số Đông Phong

* Đọc reach, giữ chân qua hook, inbox sau 24h/72h.
* Tổng kết tuần → chọn chủ đề vòng sau.
* Web đo qua GA4.
* Họ Kim đang giữ: không có nội dung Kim trong số liệu tổng kết chủ đề (chỉ đếm chủ đề đã đăng).

## 3. Đặt Tên Event

* Dạng object-action, chữ thường, gạch dưới: `video_viewed`, `inbox_clicked`.
* Cụ thể: `cta_hero_clicked` thay vì `button_clicked`.
* Không nhét thông tin cá nhân (email, tên, số điện thoại) vào event hay UTM.

## 4. Checklist Kiểm Tra

* [ ] Event bắn đúng trigger
* [ ] Giá trị property điền đúng
* [ ] Không trùng event
* [ ] Chạy được trên mọi trình duyệt và mobile
* [ ] Không rò rỉ thông tin cá nhân
