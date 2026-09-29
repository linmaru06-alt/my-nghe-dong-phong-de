/**
 * Chuyển đổi tiếng Việt có dấu sang URL slug không dấu chuẩn SEO
 * Quy tắc: Bỏ dấu tiếng Việt, "đ/Đ" → "d", chuyển thường, ký tự lạ → "-", gộp "-" liên tiếp, bỏ "-" đầu/cuối
 */
export function slugify(str: string): string {
  if (!str) return "";
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

