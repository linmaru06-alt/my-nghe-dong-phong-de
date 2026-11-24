# Luồng bàn giao giữa 5 vai trong ngày

Một ngày làm việc của ê-kíp đi theo đúng thứ tự này. Vai sau chỉ bắt đầu khi vai trước đã xong.

## Sơ đồ luồng

```
Biên kịch viết
    ↓
Biên tập soát (sửa lỗi, soát lại)
    ↓
Đạo diễn duyệt lúc 23:00
    ↓
Dựng video (từ kịch bản đã duyệt)
    ↓
Đăng bài hẹn giờ (facebook-cli, state: scheduled)
```

## Timeline chuẩn bị trước 23:00

| Thời gian | Vai làm | Việc |
|---|---|---|
| Sáng | Biên kịch | Viết 3 bài viết + kịch bản 2 video (video 1, video 2) + chữ trên màn hình và caption cho video 3. Chọn ảnh cho 3 bài viết, resize ≤ 1600px. |
| Sáng | Biên kịch | Xác định chủ đề video 2 từ video nhiều view nhất kênh @THUATCONHAN (chỉ xem tiêu đề + lượt xem, KHÔNG xem video). |
| Chiều | Biên tập | Soát cả 6 nội dung theo checklist (`roles/03-bien-tap.md`): độ dài, hashtag có #viral không, ảnh đúng loại gỗ không, có dính Kim không, tên gỗ đúng không, voiceover có dính tên tuổi/năm không. Sửa hết lỗi, soát lại một lượt. |
| Chiều | Biên tập | Ghi chú ngắn cho mỗi bài: đã soát những gì, còn thiếu gì (chưa có giá, chưa có số Zalo, chưa xem được file video...). |
| 23:00 | Đạo diễn (anh) | Duyệt 6 nội dung. Thẻ duyệt hết hạn sau 30 phút — duyệt trong khung 23:00–23:30. |
| Sau 23:00 | Dựng video | Dựng video 1, 2, 3 từ kịch bản đã duyệt, theo SOURCE, dọc 9:16. Xem lại từng clip trước khi giao. |
| Sau 23:00 | Đăng bài | Hẹn giờ 6 khung qua facebook-cli. Chỉ tính thành công khi trạng thái trả về là `state: scheduled`. Kiểm tra cả 6 khung rồi báo anh. |

## Quy tắc bàn giao

- **Biên kịch → Biên tập:** giao đủ 6 nội dung (3 bài viết kèm ảnh, 2 kịch bản video có voiceover, chữ trên màn hình + caption video 3). Thiếu món nào thì nói rõ, không giao thiếu mà im lặng.
- **Biên tập → Đạo diễn:** chỉ giao bản đã soát và sửa xong. Kèm ghi chú những điểm còn thiếu để anh quyết.
- **Đạo diễn → Dựng video:** chỉ dựng những gì anh đã duyệt. Anh chưa duyệt thì không dựng, không tự ý đổi kịch bản sau duyệt.
- **Dựng video → Đăng bài:** giao clip đã xem lại + caption + giờ đăng cho từng khung.
- **Đăng bài → Đạo diễn:** báo lại 6 khung đều đã `scheduled` hay khung nào lỗi. Khung nào lỗi thì báo ngay trong đêm, không để tới sáng.

## Lưu ý
- Họ Kim / Kim khắc Mộc đang BỊ GIỮ vô thời hạn — không có nội dung Kim nào đi qua luồng này, trừ khi anh nói rõ "đẩy bài Kim lên".
- Luồng này chỉ phục vụ Facebook. Bot tự đăng web là hệ thống riêng, không đi qua luồng này.
