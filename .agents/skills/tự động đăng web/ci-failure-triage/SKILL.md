---
name: ci-failure-triage
description: >-
  Chẩn đoán, truy vết và xử lý nhanh mọi sự cố CI/CD, GitHub Actions và build gãy của Mỹ Nghệ Đông Phong. Sử dụng khi workflow báo đỏ, email không ghi lý do, hoặc khi kiểm tra chất lượng trước khi push.
---

# CI Failure Triage Skill — Mỹ Nghệ Đông Phong

Kỹ năng này đóng vai trò là quy chuẩn vận hành chuẩn (SOP) giúp AI Agent và lập trình viên chẩn đoán, khoanh vùng và xử lý triệt để các lỗi xảy ra trong quá trình CI/CD và tự động hóa xuất bản của repository `linmaru06-alt/my-nghe-dong-phong-de`.

---

## 1. Khi Nào Kích Hoạt (Triggers)

Kích hoạt kỹ năng này ngay khi:
* Người dùng thông báo: *"workflow lỗi"*, *"check run Actions"*, *"job publish-article bị đỏ"*, *"email báo lỗi mà không ghi lý do"*.
* Lệnh kiểm tra chất lượng `npm run check:pre-push` hoặc `npm run build` thất bại trên máy cục bộ.
* Cần kiểm tra lịch sử chạy của workflow `Daily Smart Auto Publisher (3 Golden Slots)` (`daily-publisher.yml`) hoặc `CI Quality Gate` (`ci.yml`).

---

## 2. Quy Trình Chẩn Đoán 4 Bước Chuẩn Hóa

### Bước 1: Trích xuất nhanh Log lỗi trọng tâm qua GitHub CLI
Chạy các lệnh sau để lấy thông tin phiên chạy gần nhất:
```powershell
# 1. Liệt kê 5 phiên chạy gần nhất của workflow xuất bản
gh run list --repo linmaru06-alt/my-nghe-dong-phong-de --workflow daily-publisher.yml -L 5

# 2. Xem trực tiếp phần log thất bại (không cần tải toàn bộ log dài)
gh run view <RUN_ID> --repo linmaru06-alt/my-nghe-dong-phong-de --log-failed
```

### Bước 2: Đối chiếu với Playbook Các Lỗi Kinh Điển của Đông Phong

| Dấu hiệu trong Log | Nguyên nhân cốt lõi | Cách xử lý dứt điểm (Minimal Fix) |
| :--- | :--- | :--- |
| **`TypeError: fetch failed`** (khi gọi Supabase) | Node 22 trên Ubuntu runner ưu tiên IPv6 nhưng mạng runner không có route IPv6, hoặc GitHub Secrets lệch key. | 1. Bật `NODE_OPTIONS: "--dns-result-order=ipv4first"`.<br/>2. Chạy `dns.setDefaultResultOrder("ipv4first")`.<br/>3. Đồng bộ lại Secrets: `gh secret set <KEY> --body "..."` từ `.env.local`. |
| **`fk_products_wood_type`** (Foreign Key Violation) | Sản phẩm trong `data/products.json` tham chiếu đến `woodType` chưa được khai báo trong `data/woodTypes.json`. | Bổ sung mã loại gỗ tương ứng vào `data/woodTypes.json` (ví dụ: `chop-bach-xanh`, `cam-lai`). |
| **`posts_slug_key`** (Unique Constraint) | Hai bài viết trong `data/posts.json` bị trùng slug khi upsert lên Supabase. | Thêm hậu tố timestamp hoặc hash ngắn vào slug trong `ai-schedule-publisher.mjs`. |
| **`503 Service Unavailable`** / **Quota Spike** (Gemini) | Model AI đang quá tải tạm thời ở Google Cloud. | Sử dụng chuỗi fallback tự động: `gemini-3.5-flash-lite` ➔ `gemini-3.1-flash-lite` ➔ `gemini-2.5-flash`. |
| **`Type error: Type '...' is not assignable to type 'never'`** | Lỗi suy diễn kiểu TypeScript trong các trang Next.js động hoặc `lib/server/posts.ts`. | Khai báo kiểu tường minh cho mảng/object; chạy `npx.cmd tsc --noEmit` để xác nhận. |
| **`git push rejected (fetch first)`** | GitHub Actions bot vừa tự động commit bài viết mới lên `main` trong lúc máy cục bộ đang làm việc. | Chạy `git pull --rebase origin main` trước khi thực hiện push. |

### Bước 3: So sánh biến động mã nguồn (`git diff`)
Kiểm tra các commit gần nhất để xác định xem thay đổi nào vừa đưa vào hệ thống:
```powershell
git log -n 3 --oneline
git diff HEAD~1 HEAD
```

### Bước 4: Đưa ra 3 Giả Thuyết + Phương Án Sửa Nhỏ Nhất (Minimal Fix)
1. Luôn nêu rõ: Dòng log gây lỗi ➔ Tệp tin và số dòng trong repo ➔ Nguyên nhân gốc rễ.
2. Áp dụng giải pháp sửa đổi cục bộ, nhỏ nhất, không viết lại những thành phần đang chạy ổn định.
3. Chạy `npm run check:pre-push` để đảm bảo bài kiểm tra cục bộ đạt chuẩn 100% trước khi đẩy commit lên GitHub.

