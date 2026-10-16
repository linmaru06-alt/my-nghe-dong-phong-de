/**
 * lib/utils/tags.ts
 * Module quản lý và trích xuất Hashtags / Từ khóa thông minh
 * Dành cho hệ thống tìm kiếm, SEO Metadata và Schema.org Entities
 */

export interface TagEntity {
  name: string; // Tên hiển thị (ví dụ: "Hoàng Đàn Lạng Sơn")
  slug: string; // Slug để tìm kiếm (ví dụ: "hoang-dan-lang-son")
  category: "wood" | "fengshui" | "product" | "general";
}

const KNOWN_TAG_DICTIONARY: Array<{
  keyword: string;
  displayName: string;
  category: TagEntity["category"];
  aliases: string[];
}> = [
  // Danh mộc
  {
    keyword: "hoàng đàn",
    displayName: "Hoàng Đàn Tuyết",
    category: "wood",
    aliases: ["hoang dan", "hoàng đàn lạng sơn", "hoàng đàn tuyết"],
  },
  {
    keyword: "tử đàn",
    displayName: "Tử Đàn Tiểu Diệp",
    category: "wood",
    aliases: ["tu dan", "tử đàn ấn độ", "tiểu diệp kim sa"],
  },
  {
    keyword: "sưa",
    displayName: "Sưa Đỏ Bắc Bộ",
    category: "wood",
    aliases: ["sua do", "gỗ sưa", "sưa đỏ"],
  },
  {
    keyword: "bách xanh",
    displayName: "Bách Xanh Mộc Châu",
    category: "wood",
    aliases: ["bach xanh", "nu bách xanh", "chớp bách xanh"],
  },
  {
    keyword: "mun sừng",
    displayName: "Mun Sừng Khánh Hòa",
    category: "wood",
    aliases: ["mun sung", "gỗ mun", "mun sừng"],
  },
  {
    keyword: "huyết long",
    displayName: "Huyết Long Thấu Quang",
    category: "wood",
    aliases: ["huyet long", "gỗ huyết rồng"],
  },
  {
    keyword: "trầm hương",
    displayName: "Trầm Hương Tự Nhiên",
    category: "wood",
    aliases: ["tram huong", "trầm chìm"],
  },
  {
    keyword: "trắc",
    displayName: "Gỗ Trắc Đỏ Đen",
    category: "wood",
    aliases: ["go trac", "trắc dây"],
  },
  {
    keyword: "cẩm lai",
    displayName: "Gỗ Cẩm Lai",
    category: "wood",
    aliases: ["cam lai", "nu cẩm"],
  },

  // Bản mệnh & Phong thủy
  {
    keyword: "mệnh kim",
    displayName: "Mệnh Kim",
    category: "fengshui",
    aliases: ["menh kim", "hành kim"],
  },
  {
    keyword: "mệnh mộc",
    displayName: "Mệnh Mộc",
    category: "fengshui",
    aliases: ["menh moc", "hành mộc"],
  },
  {
    keyword: "mệnh thủy",
    displayName: "Mệnh Thủy",
    category: "fengshui",
    aliases: ["menh thuy", "hành thủy"],
  },
  {
    keyword: "mệnh hỏa",
    displayName: "Mệnh Hỏa",
    category: "fengshui",
    aliases: ["menh hoa", "hành hỏa"],
  },
  {
    keyword: "mệnh thổ",
    displayName: "Mệnh Thổ",
    category: "fengshui",
    aliases: ["menh tho", "hành thổ"],
  },
  {
    keyword: "dụng thần",
    displayName: "Dụng Thần Hỷ Thần",
    category: "fengshui",
    aliases: ["dung than", "hỷ thần", "tứ trụ"],
  },
  {
    keyword: "trừ tà",
    displayName: "Trừ Tà Hộ Thân",
    category: "fengshui",
    aliases: ["tru ta", "hộ mệnh", "kỵ gió độc", "xua đuổi âm khí"],
  },
  {
    keyword: "chiêu tài",
    displayName: "Chiêu Tài Vượng Khí",
    category: "fengshui",
    aliases: ["chieu tai", "hút lộc", "vượng tài"],
  },
  {
    keyword: "sinh lão bệnh tử",
    displayName: "Sinh Lão Bệnh Tử",
    category: "fengshui",
    aliases: ["đếm hạt", "số hạt phong thủy"],
  },

  // Dòng sản phẩm
  {
    keyword: "vòng tay",
    displayName: "Vòng Tay Phong Thủy",
    category: "product",
    aliases: ["vong tay", "chuỗi hạt"],
  },
  {
    keyword: "bút ký",
    displayName: "Bút Ký Phong Thủy",
    category: "product",
    aliases: ["but ky", "bút gỗ"],
  },
  {
    keyword: "bi lăn tay",
    displayName: "Bi Lăn Tay Dưỡng Sinh",
    category: "product",
    aliases: ["bi lan tay"],
  },
  {
    keyword: "gối gỗ",
    displayName: "Gối Gỗ Bách Xanh",
    category: "product",
    aliases: ["goi go"],
  },
];

/**
 * Tự động trích xuất danh sách Hashtags từ tiêu đề, mô tả và nội dung
 */
export function extractTagsFromContent(
  title: string,
  content?: string,
  explicitTags?: string[]
): string[] {
  if (Array.isArray(explicitTags) && explicitTags.length > 0) {
    return explicitTags;
  }

  const combined = `${title || ""} ${(content || "").slice(0, 1500)}`.toLowerCase();
  const matched = new Set<string>();

  for (const item of KNOWN_TAG_DICTIONARY) {
    if (combined.includes(item.keyword) || item.aliases.some((a) => combined.includes(a))) {
      matched.add(item.displayName);
    }
  }

  // Nếu không khớp từ điển thì bổ sung từ khóa mặc định
  if (matched.size === 0) {
    matched.add("Đồ Gỗ Quý");
    matched.add("Mỹ Nghệ Đông Phong");
  }

  return Array.from(matched).slice(0, 6);
}

/**
 * Danh sách hashtags phổ biến nhất hiển thị trên Search Dropdown
 */
export const POPULAR_HASHTAGS = [
  { name: "Hoàng Đàn Tuyết", query: "hoàng đàn" },
  { name: "Mệnh Kim", query: "mệnh kim" },
  { name: "Tử Đàn Tiểu Diệp", query: "tử đàn" },
  { name: "Bách Xanh Chìm Nước", query: "bách xanh" },
  { name: "Dụng Thần Hỷ Thần", query: "dụng thần" },
  { name: "Trừ Tà Hộ Mệnh", query: "trừ tà" },
  { name: "Trầm Hương", query: "trầm hương" },
  { name: "Sưa Đỏ Bắc Bộ", query: "sưa đỏ" },
];
