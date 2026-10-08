-- ==============================================================================
-- SCHEMA CƠ SỞ DỮ LIỆU SUPABASE TOÀN DIỆN CHO MỸ NGHỆ ĐÔNG PHONG
-- Chạy script này trong Supabase > SQL Editor > New query > Run
-- ==============================================================================

-- 1. Bảng Danh mục (Categories)
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Bảng Loại gỗ quý (Wood Types)
CREATE TABLE IF NOT EXISTS wood_types (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  scientific_name TEXT,
  rarity TEXT,
  description TEXT,
  origin TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Bảng Sản phẩm đồ gỗ quý (Products)
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  wood_type TEXT NOT NULL,
  description TEXT,
  preservation TEXT,
  sizes JSONB DEFAULT '[]'::jsonb,
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  featured BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'published',
  related_posts TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bổ sung cột nếu bảng products đã tồn tại từ trước
ALTER TABLE products ADD COLUMN IF NOT EXISTS related_posts TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE products ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published';
ALTER TABLE products ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;

-- 4. Bảng Bài viết kiến thức & Tin tức (Posts)
CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT,
  thumbnail TEXT,
  category TEXT,
  author_name TEXT DEFAULT 'Nghệ nhân Đông Phong',
  read_time INT DEFAULT 5,
  status TEXT DEFAULT 'published',
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  related_products TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bổ sung cột nếu bảng posts đã tồn tại từ trước
ALTER TABLE posts ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE posts ADD COLUMN IF NOT EXISTS related_products TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE posts ADD COLUMN IF NOT EXISTS author_name TEXT DEFAULT 'Nghệ nhân Đông Phong';
ALTER TABLE posts ADD COLUMN IF NOT EXISTS read_time INT DEFAULT 5;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published';

-- 5. Bảng liên kết Bài viết và Sản phẩm (Quan hệ Nhiều - Nhiều Móc nối)
CREATE TABLE IF NOT EXISTS product_posts (
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (product_id, post_id)
);

-- 6. Bảng Nhật ký AI Tự động viết bài (ai_news_logs)
CREATE TABLE IF NOT EXISTS ai_news_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  items_scanned INT DEFAULT 0,
  items_accepted INT DEFAULT 0,
  items_skipped INT DEFAULT 0,
  model_used TEXT DEFAULT 'gemini-2.5-flash',
  status TEXT DEFAULT 'success',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Đảm bảo cột name của wood_types là duy nhất để làm đích tham chiếu khóa ngoại
ALTER TABLE wood_types ADD CONSTRAINT wood_types_name_key UNIQUE (name);

-- 7. Tạo Khóa Ngoại (Foreign Keys) - Tạo các đường mũi tên móc nối trực quan trên Schema Visualizer
ALTER TABLE products DROP CONSTRAINT IF EXISTS fk_products_category;
ALTER TABLE products
  ADD CONSTRAINT fk_products_category
  FOREIGN KEY (category)
  REFERENCES categories(id)
  ON UPDATE CASCADE
  ON DELETE RESTRICT;

ALTER TABLE products DROP CONSTRAINT IF EXISTS fk_products_wood_type;
ALTER TABLE products
  ADD CONSTRAINT fk_products_wood_type
  FOREIGN KEY (wood_type)
  REFERENCES wood_types(name)
  ON UPDATE CASCADE
  ON DELETE RESTRICT;

-- 8. Tạo chỉ mục tối ưu tốc độ tải (Indexes)
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_wood_type ON products(wood_type);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts(published_at DESC);

-- 9. Bật Row Level Security (RLS) để bảo vệ dữ liệu
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE wood_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_news_logs ENABLE ROW LEVEL SECURITY;

-- 10. Phân quyền truy cập công khai & thao tác (RLS Policies)
DROP POLICY IF EXISTS "Public read categories" ON categories;
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable all categories" ON categories;
CREATE POLICY "Enable all categories" ON categories FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public read wood_types" ON wood_types;
CREATE POLICY "Public read wood_types" ON wood_types FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable all wood_types" ON wood_types;
CREATE POLICY "Enable all wood_types" ON wood_types FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public read products" ON products;
CREATE POLICY "Public read products" ON products FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable all products" ON products;
CREATE POLICY "Enable all products" ON products FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public read posts" ON posts;
CREATE POLICY "Public read posts" ON posts FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable all posts" ON posts;
CREATE POLICY "Enable all posts" ON posts FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public read product_posts" ON product_posts;
CREATE POLICY "Public read product_posts" ON product_posts FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable all product_posts" ON product_posts;
CREATE POLICY "Enable all product_posts" ON product_posts FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all ai_news_logs" ON ai_news_logs;
CREATE POLICY "Enable all ai_news_logs" ON ai_news_logs FOR ALL USING (true) WITH CHECK (true);

-- 11. Cấu hình Supabase Storage lưu trữ ảnh (Bucket: dongphong-media)
INSERT INTO storage.buckets (id, name, public)
VALUES ('dongphong-media', 'dongphong-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public Access media" ON storage.objects;
CREATE POLICY "Public Access media" ON storage.objects FOR SELECT USING (bucket_id = 'dongphong-media');

DROP POLICY IF EXISTS "Public Upload media" ON storage.objects;
CREATE POLICY "Public Upload media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'dongphong-media');

DROP POLICY IF EXISTS "Public Update media" ON storage.objects;
CREATE POLICY "Public Update media" ON storage.objects FOR UPDATE USING (bucket_id = 'dongphong-media');

DROP POLICY IF EXISTS "Public Delete media" ON storage.objects;
CREATE POLICY "Public Delete media" ON storage.objects FOR DELETE USING (bucket_id = 'dongphong-media');
