# Công cụ Góc quay — rút gọn cho video Đông Phong 30s

Lấy từ khu Góc quay của Xưởng Phim, rút gọn lại cho vừa video dọc 9:16 dài ~30s. Dùng khi viết kịch bản theo SOURCE để ghép cú máy cho sinh động, thay vì quay một góc tĩnh suốt clip.

## 8 cỡ cảnh

| Cỡ cảnh | Dùng khi nào (video vòng gỗ) |
|---|---|
| Cực cận (Extreme Close-up) | Vân gỗ, một hạt vòng, chi tiết chạm khắc |
| Cận cảnh (Close-up) | Cả chuỗi vòng, bàn tay cầm vòng |
| Cận trung (Medium Close-up) | Tay đeo vòng, cổ tay + một phần cánh tay |
| Trung cảnh (Medium Shot) | Người đeo vòng, thấy nửa người trên |
| Trung toàn (Medium Wide Shot) | Người + không gian xung quanh (bàn, kệ gỗ) |
| Toàn cảnh (Wide Shot) | Toàn bộ khung cảnh (góc bàn làm việc, góc phòng) |
| Toàn thân (Full Shot) | Cả người từ đầu tới chân (ít dùng cho video 30s) |
| Cực toàn (Extreme Wide Shot) | Khung cảnh rộng (ít dùng cho video 30s) |

Video vòng gỗ 30s dùng nhiều nhất: cực cận, cận cảnh, cận trung, trung cảnh.

## 6 góc máy

| Góc máy | Hiệu quả |
|---|---|
| Ngang tầm mắt (Eye level) | Tự nhiên, gần gũi — góc mặc định |
| Góc thấp (Low angle) | Vòng gỗ trông trang trọng, có uy |
| Góc cao (High angle) | Nhìn xuống bàn tay, vòng trên bàn — rõ vân gỗ |
| Góc chim (Bird's eye) | Nhìn thẳng từ trên xuống — bày vòng trên mặt bàn |
| Góc nghiêng (Dutch angle) | Tạo cảm giác bất an, dùng cho phần Sợ hãi trong voiceover |
| Góc từ dưới lên (Worm's eye) | Hiếm dùng cho video vòng gỗ |

## 8 chuyển động máy

| Chuyển động | Dùng khi nào |
|---|---|
| Tĩnh (Static) | Giữ yên một cảnh, để người xem nhìn rõ vân gỗ |
| Lia ngang (Pan) | Quét từ hạt này sang hạt khác trên chuỗi vòng |
| Lia dọc (Tilt) | Quét từ cổ tay lên cánh tay, hoặc từ bàn lên kệ |
| Tiến lại (Dolly in) | Tiến dần vào hạt vòng — dùng cho đoạn Huyền bí |
| Lùi ra (Dolly out) | Lùi ra để lộ khung cảnh — dùng cho đoạn Chữa lành |
| Theo dõi (Tracking) | Theo bàn tay đang đeo vòng, đang lần hạt |
| Zoom | Phóng to chi tiết vân gỗ (dùng nhẹ tay, không lạm dụng) |
| Rung tay (Handheld) | Cảm giác thật, đời thường — dùng ít, chỉ cho cảnh sinh hoạt |

## 4 bố cục

| Bố cục | Dùng khi nào |
|---|---|
| Một phần ba (Rule of thirds) | Đặt vòng lệch một bên, chừa không gian cho chữ trên màn hình |
| Trung tâm (Center) | Vòng ở giữa khung — dùng cho cảnh hero, khoe sản phẩm |
| Đường dẫn (Leading lines) | Vân gỗ, mép bàn dẫn mắt về phía vòng |
| Đối xứng (Symmetry) | Hai tay cầm vòng cân xứng — dùng cho cảnh trang trọng |

## Mẫu ghép cú máy → prompt tiếng Anh

Khi viết kịch bản theo SOURCE, ghép 4 yếu tố theo mẫu này rồi dịch thành prompt tiếng Anh cho clip:

**Mẫu:** [Cỡ cảnh] + [Góc máy] + [Chuyển động] + [Bố cục] + [Chủ thể + ánh sáng]

**Ví dụ 1 — Cận cảnh hạt vòng:**
- Ghép: Cận cảnh + góc cao + tĩnh + trung tâm
- Prompt tiếng Anh: "Extreme close-up, high angle, static shot, centered composition, a single wooden prayer bead with visible natural grain, warm soft light, dark wooden table background, vertical 9:16"

**Ví dụ 2 — Tay đeo vòng:**
- Ghép: Cận trung + ngang tầm mắt + theo dõi + một phần ba
- Prompt tiếng Anh: "Medium close-up, eye level, slow tracking shot, rule of thirds composition, a hand wearing a natural wooden bead bracelet, gentle daily movement, warm indoor light, vertical 9:16"

## Lưu ý khi dùng
- Mỗi source 10s chỉ nên dùng 1 cú máy chính, không đổi góc liên tục trong 10s.
- Video dọc 9:16: bố cục một phần ba chừa chỗ cho chữ hiện trên màn hình (video 3) và caption.
- Cảnh quan trọng (cận cảnh hạt vòng, tay đeo vòng) phải dùng ảnh/video thật của đúng sản phẩm làm đầu vào, không để model tự tưởng tượng.
