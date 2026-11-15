# Vai 5 — Đăng bài (em qua facebook-cli)

Em hẹn giờ đăng 6 nội dung lên Facebook Page Mỹ Nghệ Đông Phong sau khi anh đã duyệt.

## Thông tin Page
- Page: Mỹ Nghệ Đông Phong
- Page ID: `1388313934362724`

## Hẹn giờ bằng facebook-cli

Lệnh mẫu hẹn giờ đăng một bài viết (có ảnh):

```bash
facebook-cli pages posts create \
  --page-id 1388313934362724 \
  --text "[Tiêu đề bài viết] 🌿
Nội dung bài viết...
#hashtag1 #hashtag2 #viral" \
  --privacy PUBLIC \
  --file /đường/dẫn/ảnh.jpg \
  --scheduled-publish-time <unix_timestamp>
```

Lệnh mẫu hẹn giờ đăng video:

```bash
facebook-cli pages posts create \
  --page-id 1388313934362724 \
  --text "[Tiêu đề video] 🌿
Caption đi kèm video...
#hashtag1 #hashtag2 #viral" \
  --privacy PUBLIC \
  --file /đường/dẫn/video.mp4 \
  --scheduled-publish-time <unix_timestamp>
```

- `--scheduled-publish-time` là thời gian đăng tính bằng Unix timestamp (giây), theo giờ Việt Nam (GMT+7).
- Text đăng phải trong giới hạn **1.024 ký tự** — bài nào vượt là đăng lỗi, phải rút ngắn trước khi hẹn giờ.
- Ảnh kèm bài đã resize tối đa 1600px trước khi đăng.

## Chỉ tính là hẹn thành công khi nào

- Sau khi chạy lệnh, kiểm tra kết quả trả về: chỉ khi `state: scheduled` mới tính là hẹn giờ thành công.
- Nếu trạng thái khác (ví dụ lỗi, hoặc không có `state: scheduled`), coi như chưa hẹn được — kiểm tra lại lệnh và hẹn lại.
- Ghi lại cho từng khung: giờ hẹn, trạng thái trả về, link bài (nếu có).

## Quy tắc duyệt — quan trọng

- **Mỗi bài đăng qua facebook-cli cần anh bấm duyệt 1 lần.** Anh duyệt lúc 23:00 hằng ngày, thẻ duyệt hết hạn sau 30 phút.
- Chuẩn bị xong 6 nội dung trước 23:00 để anh duyệt trong khung 23:00–23:30.
- Anh chưa duyệt bài nào thì không hẹn giờ bài đó. Không tự đăng khi chưa có duyệt.
- **Không dính Kim.** Trước khi hẹn giờ, kiểm tra lại một lượt: không có nội dung họ Kim / Kim khắc Mộc trong bài đăng. Họ Kim đang BỊ GIỮ vô thời hạn.

## 6 khung giờ hẹn đăng mỗi ngày

| Giờ đăng | Nội dung |
|---|---|
| 07:30 | Video 1 |
| 09:00 | Bài 1 |
| 12:00 | Video 2 |
| 13:00 | Bài 2 |
| 17:30 | Bài 3 |
| 20:00 | Video 3 |

## Sau khi hẹn giờ xong
- Kiểm tra lại cả 6 khung đều ở trạng thái `scheduled`.
- Báo anh: 6 bài đã hẹn xong, kèm trạng thái từng khung.
- Nếu có khung nào hẹn lỗi thì báo ngay, không để tới sáng mới phát hiện.
