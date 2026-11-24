import { create } from "zustand";
import initialProducts from "../data/products.json";

export interface ProductSize {
  label: string;
  price: number | null;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  code: string;
  category: string;
  woodType: string;
  description: string;
  preservation: string;
  sizes: ProductSize[];
  images: string[];
  featured: boolean;
  status: "published" | "draft";
  relatedPosts?: string[];
  createdAt: string;
}

interface ProductsState {
  products: Product[];
  isLoaded: boolean;
  loadProducts: () => Promise<void>;
  getProductBySlug: (slug: string) => Product | undefined;
  getProductById: (id: string) => Product | undefined;
  saveProduct: (product: Product) => Promise<boolean>;
  addProduct: (product: Product) => Promise<boolean>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;
  toggleFeatured: (id: string) => Promise<boolean>;
  toggleStatus: (id: string) => Promise<boolean>;
  resetToDefault: () => Promise<void>;
}

const STORAGE_KEY = "dongphong_products_v2";

async function syncProductsToBackend(products: Product[]): Promise<boolean> {
  if (typeof window === "undefined") return false;
  try {
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ products }),
    });
    if (!res.ok) {
      console.warn("[useProducts] API đồng bộ disk trả về mã lỗi:", res.status);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("[useProducts] Không thể đồng bộ sản phẩm vào backend disk:", err);
    return false;
  }
}

export const useProductsStore = create<ProductsState>((set, get) => ({
  products: initialProducts as Product[],
  isLoaded: false,

  loadProducts: async () => {
    if (typeof window === "undefined") return;
    try {
      const res = await fetch("/api/admin/products", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const cleanData = json.data.filter((p: any) => p.status !== "deleted");
          const localStored = localStorage.getItem(STORAGE_KEY);
          const localTimestamp = Number(localStorage.getItem(STORAGE_KEY + "_timestamp") || 0);
          const now = Date.now();
          // Nếu có chỉnh sửa cục bộ trong 2 phút vừa qua, ưu tiên giữ lại để tránh bị đè ngược
          if (localStored && now - localTimestamp < 120000) {
            try {
              const parsed = JSON.parse(localStored);
              if (Array.isArray(parsed) && parsed.length > 0) {
                const cleanParsed = parsed.filter((p: any) => p.status !== "deleted");
                set({ products: cleanParsed, isLoaded: true });
                return;
              }
            } catch {}
          }
          localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanData));
          set({ products: cleanData, isLoaded: true });
          return;
        }
      }
    } catch (e) {
      console.warn("[useProducts] Không kết nối được API, dùng dữ liệu lưu tạm:", e);
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        set({ products: JSON.parse(stored), isLoaded: true });
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialProducts));
        set({ products: initialProducts as Product[], isLoaded: true });
      }
    } catch {
      set({ products: initialProducts as Product[], isLoaded: true });
    }
  },

  getProductBySlug: (slug: string) => {
    return get().products.find((p) => p.slug === slug);
  },

  getProductById: (id: string) => {
    return get().products.find((p) => p.id === id);
  },

  saveProduct: async (product: Product) => {
    const list = [...get().products];
    const index = list.findIndex((p) => p.id === product.id);

    if (index >= 0) {
      list[index] = product;
    } else {
      list.unshift(product);
    }

    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      localStorage.setItem(STORAGE_KEY + "_timestamp", Date.now().toString());
    }
    set({ products: list });
    return await syncProductsToBackend(list);
  },

  addProduct: async (product: Product) => {
    return await get().saveProduct(product);
  },

  updateProduct: async (id: string, updates: Partial<Product>) => {
    const existing = get().getProductById(id);
    if (existing) {
      return await get().saveProduct({ ...existing, ...updates });
    }
    return false;
  },

  deleteProduct: async (id: string) => {
    const list = get().products.filter((p) => p.id !== id);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      localStorage.setItem(STORAGE_KEY + "_timestamp", Date.now().toString());
    }
    set({ products: list });

    // 1. Gọi trực tiếp endpoint DELETE cho sản phẩm này
    try {
      await fetch(`/api/admin/products?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    } catch (e) {
      console.warn("[useProducts] Lỗi khi gọi DELETE sản phẩm:", e);
    }

    // 2. Đồng bộ danh sách còn lại vào backend
    return await syncProductsToBackend(list);
  },

  toggleFeatured: async (id: string) => {
    const list = get().products.map((p) =>
      p.id === id ? { ...p, featured: !p.featured } : p
    );
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      localStorage.setItem(STORAGE_KEY + "_timestamp", Date.now().toString());
    }
    set({ products: list });
    return await syncProductsToBackend(list);
  },

  toggleStatus: async (id: string) => {
    const list = get().products.map((p) =>
      p.id === id
        ? { ...p, status: (p.status === "published" ? "draft" : "published") as "published" | "draft" }
        : p
    );
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      localStorage.setItem(STORAGE_KEY + "_timestamp", Date.now().toString());
    }
    set({ products: list });
    return await syncProductsToBackend(list);
  },

  resetToDefault: async () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialProducts));
    }
    set({ products: initialProducts as Product[] });
    await syncProductsToBackend(initialProducts as Product[]);
  },
}));

