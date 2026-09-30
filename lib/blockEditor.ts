/**
 * lib/blockEditor.ts
 * Hệ thống chuyển đổi dữ liệu và định nghĩa khối (Block Editor System) cho Mỹ Nghệ Đông Phong
 */

export type BlockType =
  | "header"
  | "heading"
  | "text"
  | "image"
  | "layout"
  | "section"
  | "quote"
  | "list"
  | "table"
  | "button"
  | "divider"
  | "footer";

export interface EditorBlock {
  id: string;
  type: BlockType;
  data: Record<string, any>;
}

export function generateId(): string {
  return "b_" + Math.random().toString(36).substring(2, 9) + "_" + Date.now().toString(36);
}

/**
 * Khởi tạo khối mẫu mặc định theo từng loại khối
 */
export function createDefaultBlock(type: BlockType): EditorBlock {
  const id = generateId();

  switch (type) {
    case "header":
      return {
        id,
        type,
        data: {
          title: "Tiêu đề phần quan trọng",
          subtitle: "Dòng mô tả phụ giới thiệu bối cảnh hoặc tóm tắt ý chính của phần này.",
        },
      };

    case "heading":
      return {
        id,
        type,
        data: {
          level: 2, // 2 (H2), 3 (H3), 4 (H4)
          text: "",
        },
      };

    case "text":
      return {
        id,
        type,
        data: {
          text: "",
        },
      };

    case "image":
      return {
        id,
        type,
        data: {
          url: "",
          alt: "Cận cảnh thớ gỗ tự nhiên Mỹ Nghệ Đông Phong",
          caption: "Ảnh chụp thực tế phôi gỗ già cỗi nhiều năm tuổi tại xưởng",
        },
      };

    case "layout":
      return {
        id,
        type,
        data: {
          ratio: "50-50", // 50-50, 60-40, 40-60
          leftTitle: "Đặc điểm thớ gỗ",
          leftContent: "Thớ gỗ mịn tít, ánh kim sa tự nhiên lấp lánh khi có ánh sáng chiếu xiên.",
          rightTitle: "Cách cảm nhận",
          rightContent: "Mùi hương thảo mộc ngọt dịu tự nhiên, mang lại cảm giác thư thái và an yên.",
        },
      };

    case "section":
      return {
        id,
        type,
        data: {
          title: "Điểm nhấn phong thủy & Giá trị cốt lõi",
          content: "Chất gỗ già đanh chìm nước tự nhiên, tích tụ linh khí đất trời qua hàng chục năm sinh trưởng trong rừng nguyên sinh.",
        },
      };

    case "quote":
      return {
        id,
        type,
        data: {
          quote: "Chơi gỗ quý không chỉ để ngắm nhìn vẻ đẹp bên ngoài, mà là để cảm nhận cái hồn mộc trầm mặc và sinh khí an lành mà từng thớ gỗ ban tặng.",
          author: "Nghệ nhân Đông Phong",
        },
      };

    case "list":
      return {
        id,
        type,
        data: {
          listType: "bullet", // "bullet" | "numbered"
          items: [
            "Kiểm tra tôm gỗ mịn tít và màu sắc đồng nhất tự nhiên",
            "Mùi hương thơm dịu nhẹ, không hắc mùi hóa chất tạo màu",
            "Trọng lượng đầm tay, thả nước có độ chìm tự nhiên",
          ],
        },
      };

    case "table":
      return {
        id,
        type,
        data: {
          headers: ["Tiêu chí phân biệt", "Gỗ quý tự nhiên Đông Phong", "Gỗ nhân tạo / Ép mùn"],
          rows: [
            ["Thớ vân mộc", "Vân sống uốn lượn tự nhiên, không trùng lặp", "Vân in công nghiệp đều răm rắp giả tạo"],
            ["Mùi hương", "Hương tinh dầu tự nhiên bền bỉ theo thời gian", "Mùi keo công nghiệp, phai nhanh sau vài tuần"],
            ["Độ bóng lên nước", "Càng đeo càng lên nước bóng gương sâu thẳm", "Dễ bong tróc lớp sơn bóng và xỉn màu"],
          ],
        },
      };

    case "button":
      return {
        id,
        type,
        data: {
          label: "Nhắn Zalo Nhận Tư Vấn Trực Tiếp",
          url: "https://zalo.me/0968888972",
          buttonStyle: "zalo", // "zalo" | "hotline" | "primary"
        },
      };

    case "divider":
      return {
        id,
        type,
        data: {
          style: "solid",
        },
      };

    case "footer":
      return {
        id,
        type,
        data: {
          title: "Lời Kết & Cam Kết Chất Lượng",
          content: "Mỹ Nghệ Đông Phong cam kết 100% gỗ tự nhiên chuẩn xuất xứ. Mọi tác phẩm đều được kiểm tra đồng kiểm trước khi thanh toán và bảo hành dây xâu trọn đời.",
        },
      };

    default:
      return {
        id,
        type: "text",
        data: { text: "" },
      };
  }
}

/**
 * Chuyển đổi danh sách khối EditorBlock sang Markdown chuẩn để lưu trữ vào Supabase Database
 */
export function blocksToMarkdown(blocks: EditorBlock[]): string {
  const parts: string[] = [];

  for (const block of blocks) {
    switch (block.type) {
      case "header":
        parts.push(`## ${block.data.title || ""}\n\n*${block.data.subtitle || ""}*`);
        break;

      case "heading": {
        const hashes = "#".repeat(Number(block.data.level) || 2);
        parts.push(`${hashes} ${block.data.text || ""}`);
        break;
      }

      case "text":
        parts.push(block.data.text || "");
        break;

      case "image": {
        const alt = block.data.alt || "Ảnh bài viết Mỹ Nghệ Đông Phong";
        const url = block.data.url || "/images/placeholder.svg";
        const caption = block.data.caption ? `\n\n*Chú thích: ${block.data.caption}*` : "";
        parts.push(`![${alt}](${url})${caption}`);
        break;
      }

      case "layout": {
        // Render 2 columns format
        parts.push(
          `:::columns ${block.data.ratio || "50-50"}\n` +
          `:::column-left\n### ${block.data.leftTitle || ""}\n${block.data.leftContent || ""}\n:::\n` +
          `:::column-right\n### ${block.data.rightTitle || ""}\n${block.data.rightContent || ""}\n:::\n:::`
        );
        break;
      }

      case "section":
        parts.push(
          `:::section\n` +
          `### ${block.data.title || "Khối nội dung"}\n\n` +
          `${block.data.content || ""}\n:::`
        );
        break;

      case "quote":
        parts.push(
          `> ${block.data.quote || ""}\n` +
          (block.data.author ? `>\n> **— ${block.data.author}**` : "")
        );
        break;

      case "list": {
        const isNum = block.data.listType === "numbered";
        const isCheck = block.data.listType === "checklist";
        const items: any[] = Array.isArray(block.data.items) ? block.data.items : [];
        const formatted = items
          .map((item, idx) => {
            if (isCheck) {
              const isChecked = typeof item === "object" ? !!item.checked : false;
              const text = typeof item === "object" ? item.text || "" : String(item);
              return `- [${isChecked ? "x" : " "}] ${text}`;
            }
            const text = typeof item === "object" ? item.text || "" : String(item);
            return isNum ? `${idx + 1}. ${text}` : `- ${text}`;
          })
          .join("\n");
        parts.push(formatted);
        break;
      }

      case "table": {
        const headers: string[] = block.data.headers || [];
        const rows: string[][] = block.data.rows || [];
        if (headers.length > 0) {
          const headerRow = `| ${headers.join(" | ")} |`;
          const separatorRow = `| ${headers.map(() => ":---").join(" | ")} |`;
          const bodyRows = rows.map((r) => `| ${r.join(" | ")} |`).join("\n");
          parts.push(`${headerRow}\n${separatorRow}\n${bodyRows}`);
        }
        break;
      }

      case "button":
        parts.push(
          `:::cta-button ${block.data.buttonStyle || "primary"}\n` +
          `[${block.data.label || "Xem chi tiết"}](${block.data.url || "#"})\n:::`
        );
        break;

      case "divider":
        parts.push(`---`);
        break;

      case "footer":
        parts.push(
          `:::footer-summary\n` +
          `### ${block.data.title || "Lời Kết"}\n\n` +
          `${block.data.content || ""}\n:::`
        );
        break;

      default:
        if (block.data?.text) {
          parts.push(block.data.text);
        }
        break;
    }
  }

  return parts.join("\n\n");
}

/**
 * Phân tích Markdown thành danh sách khối khi người dùng chỉnh sửa bài viết đã có sẵn
 */
export function markdownToBlocks(markdown: string): EditorBlock[] {
  if (!markdown || !markdown.trim()) {
    return [createDefaultBlock("text")];
  }

  const rawBlocks = markdown.split(/\n\n+/);
  const blocks: EditorBlock[] = [];

  for (let i = 0; i < rawBlocks.length; i++) {
    const raw = rawBlocks[i].trim();
    if (!raw) continue;

    // 1. Divider
    if (raw === "---" || raw === "***" || raw === "___") {
      blocks.push({ id: generateId(), type: "divider", data: { style: "solid" } });
      continue;
    }

    // 2. Custom Section
    if (raw.startsWith(":::section")) {
      const inner = raw.replace(/^:::section\n?/, "").replace(/\n?:::$/, "").trim();
      const titleMatch = inner.match(/^###\s*(.+)/m);
      const title = titleMatch ? titleMatch[1].trim() : "Khối nội dung";
      const content = inner.replace(/^###\s*.+\n?/, "").trim();
      blocks.push({ id: generateId(), type: "section", data: { title, content } });
      continue;
    }

    // 3. Custom 2 Columns Layout
    if (raw.startsWith(":::columns")) {
      const ratioMatch = raw.match(/:::columns\s*([0-9-]+)?/);
      const ratio = ratioMatch?.[1] || "50-50";
      const leftMatch = raw.match(/:::column-left\n([\s\S]*?):::/);
      const rightMatch = raw.match(/:::column-right\n([\s\S]*?):::/);

      const parseCol = (txt: string = "") => {
        const tm = txt.match(/^###\s*(.+)/m);
        const t = tm ? tm[1].trim() : "";
        const c = txt.replace(/^###\s*.+\n?/, "").trim();
        return { t, c };
      };

      const left = parseCol(leftMatch?.[1] || "");
      const right = parseCol(rightMatch?.[1] || "");

      blocks.push({
        id: generateId(),
        type: "layout",
        data: {
          ratio,
          leftTitle: left.t,
          leftContent: left.c,
          rightTitle: right.t,
          rightContent: right.c,
        },
      });
      continue;
    }

    // 4. Custom Button CTA
    if (raw.startsWith(":::cta-button")) {
      const styleMatch = raw.match(/:::cta-button\s*([a-z0-9_-]+)?/);
      const buttonStyle = styleMatch?.[1] || "primary";
      const linkMatch = raw.match(/\[(.*?)\]\((.*?)\)/);
      blocks.push({
        id: generateId(),
        type: "button",
        data: {
          label: linkMatch?.[1] || "Bấm vào đây",
          url: linkMatch?.[2] || "https://zalo.me/0968888972",
          buttonStyle,
        },
      });
      continue;
    }

    // 5. Custom Footer Summary
    if (raw.startsWith(":::footer-summary")) {
      const inner = raw.replace(/^:::footer-summary\n?/, "").replace(/\n?:::$/, "").trim();
      const titleMatch = inner.match(/^###\s*(.+)/m);
      const title = titleMatch ? titleMatch[1].trim() : "Lời Kết";
      const content = inner.replace(/^###\s*.+\n?/, "").trim();
      blocks.push({ id: generateId(), type: "footer", data: { title, content } });
      continue;
    }

    // 6. Heading (H2, H3, H4)
    const headingMatch = raw.match(/^(#{2,4})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      blocks.push({
        id: generateId(),
        type: "heading",
        data: {
          level,
          text: headingMatch[2].trim(),
        },
      });
      continue;
    }

    // 7. Image ![alt](url)
    const imgMatch = raw.match(/^!\[(.*?)\]\((.*?)\)/);
    if (imgMatch) {
      const alt = imgMatch[1];
      const url = imgMatch[2];
      const captionMatch = raw.match(/\*Chú thích:\s*(.*?)\*/);
      blocks.push({
        id: generateId(),
        type: "image",
        data: {
          url,
          alt,
          caption: captionMatch ? captionMatch[1] : "",
        },
      });
      continue;
    }

    // 8. Blockquote
    if (raw.startsWith(">")) {
      const cleanQuote = raw
        .split("\n")
        .map((l) => l.replace(/^>\s?/, ""))
        .join("\n")
        .trim();
      const authorMatch = cleanQuote.match(/\*\*—\s*(.*?)\*\*/);
      const author = authorMatch ? authorMatch[1] : "";
      const quote = cleanQuote.replace(/\n?>\s*\*\*—.*?\*\*/, "").trim();
      blocks.push({
        id: generateId(),
        type: "quote",
        data: { quote, author },
      });
      continue;
    }

    // 9. Table (| ... |)
    if (raw.includes("|") && raw.split("\n").length >= 2 && raw.includes("---")) {
      const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);
      const headers = lines[0]
        .split("|")
        .map((c) => c.trim())
        .filter(Boolean);
      const rowLines = lines.slice(2);
      const rows = rowLines.map((line) =>
        line
          .split("|")
          .map((c) => c.trim())
          .filter(Boolean)
      );

      blocks.push({
        id: generateId(),
        type: "table",
        data: { headers, rows },
      });
      continue;
    }

    // 10. Checklist or List (Bullet or Numbered)
    const isChecklist = raw.startsWith("- [ ] ") || raw.startsWith("- [x] ") || raw.startsWith("- [X] ");
    const isBullet = raw.startsWith("- ") || raw.startsWith("* ");
    const isNum = /^[0-9]+\.\s/.test(raw);

    if (isChecklist) {
      const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);
      const items = lines.map((l) => {
        const match = l.match(/^-\s*\[([ xX])\]\s*(.*)$/);
        if (match) {
          return { checked: match[1].toLowerCase() === "x", text: match[2] };
        }
        return { checked: false, text: l.replace(/^-\s*/, "") };
      });
      blocks.push({
        id: generateId(),
        type: "list",
        data: {
          listType: "checklist",
          items,
        },
      });
      continue;
    }

    if (isBullet || isNum) {
      const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);
      const items = lines.map((l) => l.replace(/^([-*]|[0-9]+\.)\s+/, ""));
      blocks.push({
        id: generateId(),
        type: "list",
        data: {
          listType: isNum ? "numbered" : "bullet",
          items,
        },
      });
      continue;
    }

    // Default: Plain Text Paragraph
    blocks.push({
      id: generateId(),
      type: "text",
      data: { text: raw },
    });
  }

  return blocks.length > 0 ? blocks : [createDefaultBlock("text")];
}
