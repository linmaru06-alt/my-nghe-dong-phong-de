# Ê-kíp nội dung Facebook — Mỹ Nghệ Đông Phong

Bản triển khai Xưởng Phim áp dụng có chọn lọc cho Đông Phong. Chỉ dùng cho Facebook, không đụng tới web.

## Phạm vi — đọc kỹ trước khi dùng

- **Chỉ Facebook.** Repo này phục vụ 6 nội dung/ngày đăng lên Facebook Page Mỹ Nghệ Đông Phong (page_id `1388313934362724`).
- **Không đụng web.** Bot tự đăng web (3 Golden Slots, Supabase) là hệ thống riêng, không nằm trong repo này, không sửa gì ở đây cho web.
- **Không bịa.** Không bịa giá bán, không bịa số liệu, không bịa người dùng.

## 5 vai trong ê-kíp

| Vai | Người làm | Việc chính |
|---|---|---|
| 1. Đạo diễn | Anh (Maru) | Chọn chủ đề, duyệt bài lúc 23:00, quyết giữ/gỡ bài Kim, quyết giá bán và số Zalo |
| 2. Biên kịch | Em | Viết 3 bài viết + kịch bản 2 video mỗi ngày |
| 3. Biên tập | Em | Soát lại tất cả trước khi giao anh duyệt |
| 4. Dựng video | Em | Làm clip từ kịch bản đã duyệt, theo SOURCE |
| 5. Đăng bài | Em qua facebook-cli | Hẹn giờ đăng, mỗi bài cần anh bấm duyệt 1 lần |

Chi tiết từng vai nằm trong thư mục `roles/`.

## 6 khung giờ mỗi ngày (mỗi khung 1 nội dung)

| Giờ | Loại | Nội dung |
|---|---|---|
| 07:30 | Video 1 | Kiến thức gỗ + phong thủy 5 mệnh (trừ Kim) |
| 09:00 | Bài 1 | Kiến thức các loại gỗ |
| 12:00 | Video 2 | Nỗi sợ / chữa lành / triết lý — chủ đề lấy từ video nhiều view nhất kênh YouTube @THUATCONHAN (chỉ xem tiêu đề + lượt xem, KHÔNG xem video) |
| 13:00 | Bài 2 | Phong thủy kiểu kinh dị, đánh vào nỗi sợ |
| 17:30 | Bài 3 | Bán sản phẩm |
| 20:00 | Video 3 | Sản phẩm, lấy video/ảnh từ 2 thư mục Drive của anh, KHÔNG voice |

## Luật cứng của ê-kíp (áp cho mọi vai)

- **Họ Kim / Kim khắc Mộc đang BỊ GIỮ khỏi mọi nội dung vô thời hạn.** Chỉ gỡ khi anh nói rõ "đẩy bài Kim lên". Không có nội dung Kim nào trong tiêu đề, thân bài, voiceover hay caption.
- **Video 1 + 2 dài ~30s**, voiceover 5 phần (Mở Huyền bí → Huyền bí → Sợ hãi → Triết lý → Thực tế/an tâm → Chữa lành), giọng kể trầm kiểu Ngọc Ngạn (không clone giọng thật). Voiceover **BỎ tên tuổi/năm** — chỉ giữ tên tuổi/năm trong caption/bài viết.
- **Bài viết do em TỰ VIẾT, không dùng Gemini.** Ngắn ~200–250 từ nhưng phải trong giới hạn **1.024 ký tự** của facebook-cli. Vào thẳng vấn đề ngay câu đầu, bỏ mục câu hỏi thường gặp, bỏ câu mở đầu kiểu hook/nghịch lý. Dòng đầu là tiêu đề dạng [text] + icon. Cuối bài 3–5 hashtag + **LUÔN có #viral**. CTA Zalo xoay vòng. Mỗi bài kèm 1 ảnh, ưu tiên: (1) Pinterest, (2) search trên mạng, (3) tạo ảnh AI. Ảnh resize tối đa 1600px, ảnh phải đúng loại gỗ/chủ đề.
- **Kịch bản video chia theo SOURCE** để anh duyệt TRƯỚC khi tạo (mỗi source = 1 clip 10s, tối đa 6 source/lô). Toàn bộ video là **REELS DỌC 9:16 (720x1280)**.
- **Duyệt bài lúc 23:00 hằng ngày.** Thẻ duyệt hết hạn sau 30 phút, nên mọi nội dung phải chuẩn bị xong trước 23:00.

## Cách dùng repo

1. Sáng: Biên kịch viết 6 nội dung theo `roles/02-bien-kich.md`.
2. Chiều: Biên tập soát theo `roles/03-bien-tap.md`, sửa xong mới giao.
3. 23:00: Đạo diễn (anh) duyệt.
4. Sau duyệt: Dựng video theo `roles/04-dung-video.md`, Đăng bài hẹn giờ theo `roles/05-dang-bai.md`.
5. Luồng bàn giao và timeline trong `workflow/luong-ban-giao.md`; checklist hằng ngày trong `workflow/checklist-ngay.md`.
6. Công cụ hỗ trợ: `tools/goc-quay-dong-phong.md` (ghép cú máy) và `tools/master-framework-checklist.md` (soát chất lượng video).

## Cấu trúc thư mục

```
dong-phong-facebook-crew/
├── README.md
├── roles/
│   ├── 01-dao-dien.md
│   ├── 02-bien-kich.md
│   ├── 03-bien-tap.md
│   ├── 04-dung-video.md
│   └── 05-dang-bai.md
├── workflow/
│   ├── luong-ban-giao.md
│   └── checklist-ngay.md
└── tools/
    ├── goc-quay-dong-phong.md
    └── master-framework-checklist.md
```
