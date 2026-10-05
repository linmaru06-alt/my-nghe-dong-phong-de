import { create } from "zustand";
import initialPosts from "../data/posts.json";

export interface Post {
  id: string;
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  content: string;
  thumbnail: string;
  relatedProducts?: string[];
  status: "published" | "draft";
  publishedAt: string;
  readingTime: number;
}

interface PostsState {
  posts: Post[];
  isLoaded: boolean;
  loadPosts: () => Promise<void>;
  getPostBySlug: (slug: string) => Post | undefined;
  getPostById: (id: string) => Post | undefined;
  savePost: (post: Post) => Promise<boolean>;
  addPost: (post: Post) => Promise<boolean>;
  updatePost: (id: string, post: Partial<Post>) => Promise<boolean>;
  deletePost: (id: string) => Promise<boolean>;
  resetToDefault: () => Promise<void>;
}

const STORAGE_KEY = "dongphong_posts_v2";

async function syncPostsToBackend(posts: Post[]): Promise<boolean> {
  if (typeof window === "undefined") return false;
  try {
    const res = await fetch("/api/admin/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ posts }),
    });
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      console.error("[usePosts] API đồng bộ trả về lỗi:", res.status, errJson);
      return false;
    }
    const json = await res.json().catch(() => ({}));
    return Boolean(json.success);
  } catch (err) {
    console.error("[usePosts] Không thể kết nối API đồng bộ bài viết:", err);
    return false;
  }
}

function normalizeTitle(t: string): string {
  return t
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s]/g, " ")
    .trim();
}

function isTitleDuplicate(t1: string, t2: string): boolean {
  if (!t1 || !t2) return false;
  const n1 = normalizeTitle(t1);
  const n2 = normalizeTitle(t2);
  if (n1 === n2) return true;
  if (n1.includes(n2) || n2.includes(n1)) return true;

  const stopWords = new Set(["nghe", "nhan", "dong", "phong", "my", "nghe", "bai", "viet", "cha", "con", "truoc", "so", "phan", "ve", "su", "va", "cua", "cac"]);
  const w1 = new Set(n1.split(/\s+/).filter((w) => w.length > 2 && !stopWords.has(w)));
  const w2 = new Set(n2.split(/\s+/).filter((w) => w.length > 2 && !stopWords.has(w)));
  if (w1.size === 0 || w2.size === 0) return false;
  let matches = 0;
  w1.forEach((w) => {
    if (w2.has(w)) matches++;
  });
  const ratio = matches / Math.min(w1.size, w2.size);
  return ratio >= 0.55;
}

function deduplicatePostsList(list: Post[]): Post[] {
  const seenIds = new Set<string>();
  const seenSlugs = new Set<string>();
  const seenThumbnails = new Set<string>();
  const result: Post[] = [];

  for (const p of list) {
    if (seenIds.has(p.id)) continue;
    const normSlug = (p.slug || "").toLowerCase();
    if (normSlug && seenSlugs.has(normSlug)) continue;

    if (p.thumbnail && !p.thumbnail.includes("placeholder") && !p.thumbnail.includes("googleusercontent") && seenThumbnails.has(p.thumbnail)) {
      continue;
    }

    let isDup = false;
    for (const existing of result) {
      if (isTitleDuplicate(p.title, existing.title)) {
        isDup = true;
        break;
      }
    }
    if (isDup) continue;

    seenIds.add(p.id);
    if (normSlug) seenSlugs.add(normSlug);
    if (p.thumbnail && !p.thumbnail.includes("placeholder") && !p.thumbnail.includes("googleusercontent")) {
      seenThumbnails.add(p.thumbnail);
    }
    result.push(p);
  }

  return result;
}

export const usePostsStore = create<PostsState>((set, get) => ({
  posts: initialPosts as Post[],
  isLoaded: false,

  loadPosts: async () => {
    if (typeof window === "undefined") return;

    // Đọc bản lưu cục bộ trước để giao diện không bị giật
    let currentLocal: Post[] = [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        currentLocal = JSON.parse(stored);
        if (Array.isArray(currentLocal) && currentLocal.length > 0) {
          const dedupedLocal = deduplicatePostsList(currentLocal);
          set({ posts: dedupedLocal, isLoaded: true });
        }
      }
    } catch {}

    try {
      const res = await fetch("/api/admin/posts", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const serverPosts: Post[] = json.data;

          // HỢP NHẤT THÔNG MINH (Smart Reconciliation):
          // Không xóa bài mới tạo ở Local mà Server chưa kịp lưu, đồng thời khử trùng lặp triệt để
          const serverIds = new Set(serverPosts.map((p) => p.id));
          const serverSlugs = new Set(serverPosts.map((p) => p.slug.toLowerCase()));
          const serverThumbnails = new Set(
            serverPosts
              .map((p) => p.thumbnail)
              .filter((t) => t && !t.includes("placeholder") && !t.includes("googleusercontent"))
          );

          const unsavedLocalPosts = currentLocal.filter((p) => {
            if (serverIds.has(p.id)) return false;
            if (serverSlugs.has(p.slug.toLowerCase())) return false;
            if (p.thumbnail && serverThumbnails.has(p.thumbnail)) return false;
            for (const sp of serverPosts) {
              if (isTitleDuplicate(p.title, sp.title)) return false;
            }
            return true;
          });

          // Gộp và khử trùng lặp toàn diện
          const mergedPosts = deduplicatePostsList([...unsavedLocalPosts, ...serverPosts]);

          // Lưu kết quả hợp nhất an toàn
          localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedPosts));
          set({ posts: mergedPosts, isLoaded: true });

          // Nếu phát hiện có bài viết ở Local mà Server chưa có, tự động kích hoạt đồng bộ lên Server
          if (unsavedLocalPosts.length > 0) {
            console.log(`[usePosts] Tự động đồng bộ ${unsavedLocalPosts.length} bài viết mới từ máy cục bộ lên Server...`);
            syncPostsToBackend(mergedPosts);
          }
          return;
        }
      }
    } catch (e) {
      console.warn("[usePosts] Không kết nối được API, tiếp tục dùng dữ liệu cục bộ:", e);
    }

    // Fallback nếu không kết nối được server
    if (currentLocal.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialPosts));
      set({ posts: initialPosts as Post[], isLoaded: true });
    }
  },

  getPostBySlug: (slug: string) => {
    return get().posts.find((p) => p.slug === slug);
  },

  getPostById: (id: string) => {
    return get().posts.find((p) => p.id === id);
  },

  savePost: async (post: Post) => {
    const list = [...get().posts];
    const index = list.findIndex((p) => p.id === post.id);

    if (index >= 0) {
      list[index] = post;
    } else {
      list.unshift(post);
    }

    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      localStorage.setItem(STORAGE_KEY + "_timestamp", Date.now().toString());
    }
    set({ posts: list });

    const isSynced = await syncPostsToBackend(list);
    return isSynced;
  },

  addPost: async (post: Post) => {
    return await get().savePost(post);
  },

  updatePost: async (id: string, updates: Partial<Post>) => {
    const existing = get().getPostById(id);
    if (existing) {
      return await get().savePost({ ...existing, ...updates });
    }
    return false;
  },

  deletePost: async (id: string) => {
    const list = get().posts.filter((p) => p.id !== id);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      localStorage.setItem(STORAGE_KEY + "_timestamp", Date.now().toString());
    }
    set({ posts: list });

    // Gọi endpoint DELETE chính xác cho bài viết này
    try {
      await fetch(`/api/admin/posts?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    } catch {}

    return await syncPostsToBackend(list);
  },

  resetToDefault: async () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialPosts));
    }
    set({ posts: initialPosts as Post[] });
    await syncPostsToBackend(initialPosts as Post[]);
  },
}));

