import fs from 'fs';
import path from 'path';
import Parser from 'rss-parser';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("Vui lòng thiết lập GEMINI_API_KEY trong file .env");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

const parser = new Parser();
const sourcesPath = path.join(__dirname, 'news-sources.json');
const articlesPath = path.join(__dirname, '../src/data/articles.js');

async function fetchNews() {
  const sources = JSON.parse(fs.readFileSync(sourcesPath, 'utf8'));
  let allItems = [];

  for (const source of sources) {
    try {
      console.log(`Đang đọc RSS từ: ${source.name}`);
      const feed = await parser.parseURL(source.url);
      const latestItems = feed.items.slice(0, 5); // Lấy 5 tin mới nhất
      allItems.push(...latestItems);
    } catch (err) {
      console.error(`Lỗi đọc RSS ${source.url}:`, err.message);
    }
  }
  return allItems;
}

async function processWithGemini(item) {
  const prompt = `
Bạn là biên tập viên của Mỹ Nghệ Đông Phong (thương hiệu đồ gỗ phong thủy, đồ mỹ nghệ cao cấp).
Dưới đây là một tin tức thu thập được:
Tiêu đề: ${item.title}
Tóm tắt gốc: ${item.contentSnippet || item.content}
Link: ${item.link}

Nhiệm vụ:
1. Đánh giá xem tin này có liên quan (dù là gián tiếp) đến Đồ gỗ, Nội thất, Phong thủy, Nghệ thuật thủ công, Làng nghề, hoặc Xu hướng sống bền vững không.
2. Nếu KHÔNG liên quan, CHỈ trả về đúng 1 chữ "SKIP".
3. Nếu CÓ liên quan, hãy viết lại bài báo và trả về ĐÚNG định dạng JSON nguyên thủy sau (KHÔNG chứa ký tự markdown \`\`\`json):
{
  "title": "Tiêu đề tiếng Việt, hấp dẫn, ngắn gọn",
  "excerpt": "Đoạn tóm tắt khoảng 2 câu",
  "content": "Nội dung bài viết chi tiết, diễn xuôi, có sử dụng thẻ HTML cơ bản như <p>, <h2>, <ul>",
  "group": "tin-tuc",
  "groupName": "Tin tức ngành",
  "status": "draft"
}
`;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();
    
    if (responseText.includes("SKIP") || responseText === "SKIP") {
      return null;
    }
    
    let jsonStr = responseText.replace(/^```json/im, '').replace(/```$/im, '').trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Lỗi AI hoặc parse JSON:", error.message);
    return null;
  }
}

function removeVietnameseTones(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
}

async function main() {
  console.log("Bắt đầu thu thập tin tức...");
  const items = await fetchNews();
  console.log(`Thu thập được ${items.length} tin thô. Bắt đầu AI Filter...`);

  const processedArticles = [];
  
  for (const item of items) {
    console.log(`Đang xử lý: ${item.title}`);
    const processed = await processWithGemini(item);
    if (processed) {
      console.log(` -> Đã tạo bản nháp: ${processed.title}`);
      
      const safeSlug = removeVietnameseTones(processed.title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      
      processedArticles.push({
        id: `ai-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        title: processed.title,
        slug: safeSlug,
        group: 'tin-tuc', 
        groupName: processed.groupName || 'Tin tức ngành',
        author: 'AI Curation',
        publishedAt: new Date().toISOString(),
        thumbnail: '/assets/images/articles/default.webp',
        excerpt: processed.excerpt,
        content: processed.content,
        relatedProductSkus: [],
        status: 'draft' 
      });
    } else {
      console.log(` -> Bỏ qua`);
    }
    await new Promise(r => setTimeout(r, 2000));
  }

  if (processedArticles.length === 0) {
    console.log("Không có bài viết mới phù hợp.");
    return;
  }

  let articlesCode = fs.readFileSync(articlesPath, 'utf8');
  const newItemsStr = processedArticles.map(a => JSON.stringify(a, null, 4)).join(',\n');
  const lastBracketIndex = articlesCode.lastIndexOf(']');
  
  if (lastBracketIndex !== -1) {
    const before = articlesCode.slice(0, lastBracketIndex);
    const after = articlesCode.slice(lastBracketIndex);
    const separator = before.trim().endsWith('{') ? '\n' : ',\n';
    
    articlesCode = before + separator + newItemsStr + '\n' + after;
    fs.writeFileSync(articlesPath, articlesCode);
    console.log(`Đã ghi ${processedArticles.length} bài viết Nháp vào src/data/articles.js!`);
  }
}

main();
