-- ==============================================================================
-- SCHEMA CƠ SỞ DỮ LIỆU SUPABASE CHO MỸ NGHỆ ĐÔNG PHONG
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Bảng Bài viết kiến thức (Posts)
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

-- 5. Bật Row Level Security (RLS) để bảo vệ dữ liệu
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE wood_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- 6. Phân quyền: Cho phép mọi người đọc dữ liệu công khai trên website
DROP POLICY IF EXISTS "Public read categories" ON categories;
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read wood_types" ON wood_types;
CREATE POLICY "Public read wood_types" ON wood_types FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read products" ON products;
CREATE POLICY "Public read products" ON products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read posts" ON posts;
CREATE POLICY "Public read posts" ON posts FOR SELECT USING (true);

-- 7. Phân quyền: Cho phép ghi/sửa dữ liệu nếu có quyền (Anon hoặc Service Role)
DROP POLICY IF EXISTS "Enable insert for all" ON categories;
CREATE POLICY "Enable insert for all" ON categories FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable insert for all" ON wood_types;
CREATE POLICY "Enable insert for all" ON wood_types FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable insert for all" ON products;
CREATE POLICY "Enable insert for all" ON products FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable insert for all" ON posts;
CREATE POLICY "Enable insert for all" ON posts FOR ALL USING (true) WITH CHECK (true);
