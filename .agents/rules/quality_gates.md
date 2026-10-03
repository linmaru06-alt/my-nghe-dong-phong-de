# Quy Tắc Kiểm Duyệt Chất Lượng & Cổng Push Code (Quality Gates)

Tài liệu này định nghĩa các cổng kiểm soát chất lượng bắt buộc (Quality Gates) cho toàn bộ AI Agent và lập trình viên khi làm việc trên mã nguồn **Mỹ Nghệ Đông Phong**.

---

## 1. Kiểm tra Bắt buộc Trước khi Commit & Push (Local Quality Gate)

Tuyệt đối **KHÔNG** commit hoặc push code lên repository nếu chưa chạy lệnh kiểm tra toàn diện và đạt kết quả hoàn hảo (Exit code 0):

```bash
npm run check:pre-push
```

Lệnh trên sẽ tự động kích hoạt 3 bước kiểm tra cốt lõi:
1. **Kiểm tra TypeScript (`npx.cmd tsc --noEmit`)**:
   - Quét toàn bộ project để bắt 100% lỗi kiểu dữ liệu.
   - Chặn đứng các lỗi `type inference: never`, `any` nguy hiểm, hoặc sai interface props giữa các component.
2. **Kiểm tra Build Next.js (`npm.cmd run build`)**:
   - Mô phỏng toàn bộ quá trình Vercel biên dịch và đóng gói (Server Components, Static Pages, Dynamic Routes).
   - Đảm bảo không có lỗi `ReferenceError: window is not defined` hoặc lỗi import/export.
3. **Kiểm tra Kết nối Môi trường & Database**:
   - Kiểm tra các biến môi trường quan trọng (`NEXT_PUBLIC_SUPABASE_URL`, `CLOUDINARY_*`, v.v.).

---

## 2. Quy Tắc Không Lỗi (Zero-Fault Policy)

- Nếu lệnh kiểm tra gặp bất kỳ lỗi nào, Agent **PHẢI** tự động sửa triệt để tất cả lỗi cho đến khi `check:pre-push` hoặc `npm run build` kết thúc thành công với mã thoát `0`.
- **Tuyệt đối KHÔNG** sử dụng cờ bỏ qua kiểm tra `--no-verify` khi push trừ trường hợp có chỉ thị khẩn cấp từ người quản lý dự án.
- **Tuyệt đối KHÔNG** tự ý push code đang lỗi lên nhánh `main`, tránh làm gãy pipeline Vercel Production và GitHub Actions CI.

---

## 3. Quy Chuẩn Commit Message & Git

Mọi commit phải tuân thủ chuẩn Conventional Commits rõ ràng:
- `feat:` Thêm tính năng mới (ví dụ: `feat(seo): bổ sung schema product và open graph`).
- `fix:` Sửa lỗi (ví dụ: `fix(pricing): hiển thị liên hệ báo giá khi giá bằng 0`).
- `refactor:` Tái cấu trúc mã nguồn, tối ưu không làm đổi logic.
- `perf:` Tối ưu hiệu năng, giảm CLS, LCP.
- `chore:` Cập nhật cấu hình, dependencies hoặc tài liệu agent.

---

## 4. Quy Tắc An Toàn Với Supabase & Dữ Liệu

- **Bảo toàn dữ liệu**: Tuyệt đối không xóa bảng (`DROP TABLE`) hoặc làm mất dữ liệu sản phẩm, bài viết đang có.
- **Cơ chế 1-Click SQL**: Xem chi tiết tại quy chuẩn `sql-workflow.md`.
- **Định dạng UUID**: Mọi ID ngẫu nhiên hoặc khóa ngoại phải tuân thủ chuẩn hex `0-9, a-f`, không tự ý đặt ký tự nằm ngoài hex.
- **Bảo mật RLS**: Mọi bảng mới phải bật `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` và có policy cụ thể cho việc đọc công khai (`SELECT`) và quyền ghi của quản trị viên.
