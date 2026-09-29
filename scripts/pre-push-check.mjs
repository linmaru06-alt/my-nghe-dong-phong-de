#!/usr/bin/env node

/**
 * MỸ NGHỆ ĐÔNG PHONG - PRE-PUSH QUALITY GATE
 * Tự động kiểm tra trước khi cho phép Git Push:
 * 1. Supabase Environment & Connection Check
 * 2. TypeScript Type Checking (tsc --noEmit)
 * 3. Next.js Production Build (next build)
 */

import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
};

function log(msg, color = colors.reset) {
  console.log(`${color}${msg}${colors.reset}`);
}

function banner() {
  log("\n=======================================================", colors.cyan);
  log("   🛡️  MỸ NGHỆ ĐÔNG PHONG - PRE-PUSH QUALITY GATE", colors.bold + colors.cyan);
  log("   Kiểm tra chất lượng trước khi đẩy lên GitHub & Vercel", colors.cyan);
  log("=======================================================\n", colors.cyan);
}

function runStep(name, command, args) {
  log(`▶ Đang kiểm tra: ${name}...`, colors.yellow);
  const startTime = Date.now();
  
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: true,
  });

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);

  if (result.status !== 0) {
    log(`\n❌ [THẤT BẠI] ${name} gặp lỗi! (Thời gian: ${duration}s)`, colors.bold + colors.red);
    log(`⚠️  Lệnh git push đã bị HỦY để bảo vệ repository và Vercel.`, colors.red);
    log(`👉 Vui lòng sửa các lỗi hiển thị ở trên rồi thử lại.\n`, colors.yellow);
    return false;
  }

  log(`✅ [THÀNH CÔNG] ${name} hoàn tất trong ${duration}s.\n`, colors.green);
  return true;
}

async function checkSupabase() {
  log(`▶ Đang kiểm tra cấu hình Supabase...`, colors.yellow);

  // Đọc .env.local nếu có
  const envPath = path.resolve(process.cwd(), ".env.local");
  let envContent = "";
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, "utf-8");
  }

  const supabaseUrlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL\s*=\s*(.+)/);
  const supabaseKeyMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY\s*=\s*(.+)/);

  const supabaseUrl = (supabaseUrlMatch ? supabaseUrlMatch[1].trim() : process.env.NEXT_PUBLIC_SUPABASE_URL) || "";
  const supabaseKey = (supabaseKeyMatch ? supabaseKeyMatch[1].trim() : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) || "";

  if (!supabaseUrl || supabaseUrl.includes("your-project-id") || supabaseUrl.includes("placeholder")) {
    log(`⚠️  [CẢNH BÁO] Supabase URL chưa cấu hình hoặc đang dùng placeholder.`, colors.yellow);
    log(`   (Website vẫn hoạt động bình thường với dữ liệu JSON cục bộ)\n`, colors.yellow);
    return true;
  }

  try {
    const pingUrl = `${supabaseUrl.replace(/\/$/, "")}/rest/v1/`;
    const res = await fetch(pingUrl, {
      headers: {
        apikey: supabaseKey,
      },
    });

    if (res.ok || res.status === 401 || res.status === 404) {
      log(`✅ [THÀNH CÔNG] Kết nối Supabase phản hồi (${res.status}).\n`, colors.green);
      return true;
    } else {
      log(`⚠️  [CẢNH BÁO] Supabase phản hồi mã trạng thái: ${res.status}\n`, colors.yellow);
      return true;
    }
  } catch (err) {
    log(`⚠️  [CẢNH BÁO] Không thể ping tới Supabase: ${err.message}`, colors.yellow);
    log(`   (Kiểm tra lại kết nối mạng hoặc cấu hình URL)\n`, colors.yellow);
    return true;
  }
}

async function main() {
  banner();

  // 1. Kiểm tra kết nối Supabase
  await checkSupabase();

  // 2. Kiểm tra TypeScript (tsc --noEmit)
  const isWindows = process.platform === "win32";
  const npxCmd = isWindows ? "npx.cmd" : "npx";
  const npmCmd = isWindows ? "npm.cmd" : "npm";

  const tscOk = runStep("TypeScript Type Check (tsc --noEmit)", npxCmd, ["tsc", "--noEmit"]);
  if (!tscOk) process.exit(1);

  // 3. Kiểm tra Next.js Build (npm run build)
  const buildOk = runStep("Next.js Production Build (next build)", npmCmd, ["run", "build"]);
  if (!buildOk) process.exit(1);

  log("🎉 [HOÀN HẢO] Toàn bộ kiểm tra đều ĐẠT CHUẨN! Tiến hành đẩy mã nguồn lên Git...\n", colors.bold + colors.green);
  process.exit(0);
}

main().catch((err) => {
  log(`Lỗi không xác định trong quá trình kiểm tra: ${err.message}`, colors.red);
  process.exit(1);
});
