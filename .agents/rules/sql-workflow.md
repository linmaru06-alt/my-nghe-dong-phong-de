# Quy Trình 1-Click SQL & Thao Tác Cơ Sở Dữ Liệu An Toàn

Tài liệu này quy định quy trình tương tác và quản lý cơ sở dữ liệu Supabase theo phương pháp **1-Click SQL** cho thương hiệu **Mỹ Nghệ Đông Phong**.

---

## 1. Nguyên Tắc Cốt Lõi: An Toàn & Bảo Toàn Dữ Liệu

1. **Tuyệt đối KHÔNG chạy lệnh phá hủy DB**: Không được sinh câu lệnh xóa bảng (`DROP TABLE`), xóa cột chứa dữ liệu (`DROP COLUMN`), hoặc xóa hàng loạt dữ liệu đang hoạt động của xưởng.
2. **Luôn sử dụng cú pháp phòng vệ (Defensive SQL)**:
   - Tạo bảng: `CREATE TABLE IF NOT EXISTS [tên_bảng]`
   - Thêm cột: `ALTER TABLE [tên_bảng] ADD COLUMN IF NOT EXISTS [tên_cột] [kiểu_dữ_liệu]`
   - Tạo chỉ mục: `CREATE INDEX IF NOT EXISTS [tên_index] ON [tên_bảng] ([cột])`
   - Tạo Policy: `DROP POLICY IF EXISTS ... ON ...; CREATE POLICY ...`
3. **Chuẩn hóa UUID**: Mọi chuỗi UUID giả lập hoặc ID mặc định phải tuân thủ chuẩn hex `[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}` (ví dụ: `a0000000-0000-0000-0000-000000000001`).

---

## 2. Quy Trình Triển Khai 1-Click SQL

Khi một tính năng mới yêu cầu thêm bảng, thêm cột, hoặc điều chỉnh quyền dữ liệu trên Supabase:

### Bước 1: Viết Code Ứng Dụng Trước
- Định nghĩa kiểu dữ liệu TypeScript an toàn trong `types/` hoặc `lib/server/`.
- Cập nhật các service / server actions đọc ghi dữ liệu.

### Bước 2: Chuẩn Bị Khối Mã SQL An Toàn
- Viết toàn bộ câu lệnh DDL và DML cần thiết, kiểm tra tính tương thích với Supabase Postgres.
- Luôn kích hoạt bảo mật hàng (Row Level Security - RLS):
  ```sql
  ALTER TABLE public.[tên_bảng] ENABLE ROW LEVEL SECURITY;
  ```
- Phân quyền chuẩn cho website bán hàng / giới thiệu:
  - **Public (khách truy cập)**: Chỉ có quyền `SELECT` với các nội dung đã xuất bản (`status = 'published'`).
  - **Admin (quản trị viên)**: Quyền đầy đủ `ALL` (hoặc thông qua Supabase Service Role).

### Bước 3: Xuất Khối Mã SQL Độc Lập Ở Cuối Câu Trả Lời
- Agent gom **toàn bộ câu lệnh SQL** vào **một khối code duy nhất** (fenced code block ` ```sql `) đặt ở cuối phản hồi.
- Hướng dẫn rõ ràng để người dùng chỉ cần:
  1. Bấm nút **Copy** khối mã SQL.
  2. Mở **Supabase Dashboard** > **SQL Editor** > **New Query**.
  3. Dán (Paste) và bấm **Run (Chạy)** một lần duy nhất.

---

## 3. Mẫu Khối Mã 1-Click SQL Tiêu Chuẩn

```sql
-- ========================================================
-- 1-CLICK SQL MIGRATION: [TÊN TÍNH NĂNG]
-- Dành cho: Mỹ Nghệ Đông Phong
-- ========================================================

-- 1. Tạo bảng an toàn
CREATE TABLE IF NOT EXISTS public.example_table (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    title TEXT NOT NULL,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published'))
);

-- 2. Chỉ mục tối ưu truy vấn
CREATE INDEX IF NOT EXISTS idx_example_status ON public.example_table(status);

-- 3. Kích hoạt và cấu hình RLS
ALTER TABLE public.example_table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Cho phép khách xem nội dung đã xuất bản" ON public.example_table;
CREATE POLICY "Cho phép khách xem nội dung đã xuất bản"
ON public.example_table FOR SELECT
USING (status = 'published');

DROP POLICY IF EXISTS "Cho phép admin toàn quyền quản trị" ON public.example_table;
CREATE POLICY "Cho phép admin toàn quyền quản trị"
ON public.example_table FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');
```
