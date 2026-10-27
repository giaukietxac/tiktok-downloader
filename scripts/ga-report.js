/**
 * Script đọc chỉ số Google Analytics 4 (GA4) cho TikSnap
 * Sử dụng OAuth 2.0 refresh token đã lưu trong hệ thống
 */

const fs = require("fs");
const path = require("path");

const TOKEN_PATH = path.join(
  process.env.USERPROFILE || "C:\\Users\\toanv",
  ".gemini",
  "antigravity",
  "mcp_servers",
  "google_analytics",
  "token.json"
);

const PROPERTY_ID = process.env.GA_PROPERTY_ID || "559051267";

async function getAccessToken() {
  if (!fs.existsSync(TOKEN_PATH)) {
    throw new Error(`Không tìm thấy token.json tại: ${TOKEN_PATH}`);
  }
  const tokenData = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf-8"));

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: tokenData.client_id,
      client_secret: tokenData.client_secret,
      refresh_token: tokenData.refresh_token,
      grant_type: "refresh_token",
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.access_token) {
    throw new Error(`Lỗi cấp lại access_token: ${JSON.stringify(data)}`);
  }
  return data.access_token;
}

async function runReport(accessToken, body) {
  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${PROPERTY_ID}:runReport`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );
  return res.json();
}

async function runRealtime(accessToken, body) {
  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${PROPERTY_ID}:runRealtimeReport`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );
  return res.json();
}

async function main() {
  console.log(`\n======================================================`);
  console.log(`📊 BÁO CÁO GOOGLE ANALYTICS 4 - TIKSNAP (Property: ${PROPERTY_ID})`);
  console.log(`======================================================\n`);

  const token = await getAccessToken();

  // 1. Realtime
  const realtime = await runRealtime(token, {
    metrics: [{ name: "activeUsers" }],
    dimensions: [{ name: "country" }],
  });
  const realtimeUsers = (realtime.rows || []).reduce(
    (sum, r) => sum + parseInt(r.metricValues[0].value, 10),
    0
  );
  console.log(`🟢 ĐANG ONLINE (Realtime 30 phút qua): ${realtimeUsers} người`);
  if (realtime.rows && realtime.rows.length > 0) {
    realtime.rows.forEach((r) => {
      console.log(`   • ${r.dimensionValues[0].value}: ${r.metricValues[0].value} users`);
    });
  }
  console.log("");

  // 2. Tổng quan 30 ngày
  const overview = await runReport(token, {
    dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
    metrics: [
      { name: "activeUsers" },
      { name: "sessions" },
      { name: "screenPageViews" },
      { name: "eventCount" },
    ],
  });

  if (overview.rows && overview.rows.length > 0) {
    const [users, sessions, views, events] = overview.rows[0].metricValues.map(
      (m) => m.value
    );
    console.log(`📈 TỔNG QUAN 30 NGÀY QUA:`);
    console.log(`   • Người dùng hoạt động (Users) : ${users}`);
    console.log(`   • Số phiên truy cập (Sessions)  : ${sessions}`);
    console.log(`   • Lượt xem trang (Pageviews)   : ${views}`);
    console.log(`   • Tổng sự kiện (Events)        : ${events}`);
    console.log("");
  }

  // 3. Top quốc gia
  const countries = await runReport(token, {
    dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
    dimensions: [{ name: "country" }],
    metrics: [{ name: "activeUsers" }, { name: "screenPageViews" }],
    limit: 5,
  });

  console.log(`🌍 TOP 5 QUỐC GIA TRUY CẬP:`);
  (countries.rows || []).forEach((r, idx) => {
    console.log(
      `   ${idx + 1}. ${r.dimensionValues[0].value}: ${r.metricValues[0].value} users (${r.metricValues[1].value} views)`
    );
  });
  console.log("");

  // 4. Top trang xem nhiều nhất
  const pages = await runReport(token, {
    dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
    dimensions: [{ name: "pagePath" }],
    metrics: [{ name: "screenPageViews" }, { name: "activeUsers" }],
    limit: 5,
  });

  console.log(`📄 TOP 5 TRANG XEM NHIỀU NHẤT:`);
  (pages.rows || []).forEach((r, idx) => {
    console.log(
      `   ${idx + 1}. ${r.dimensionValues[0].value}: ${r.metricValues[0].value} views (${r.metricValues[1].value} users)`
    );
  });
  console.log(`\n======================================================\n`);
}

module.exports = { getAccessToken, runReport, runRealtime, PROPERTY_ID };

if (require.main === module) {
  main().catch((err) => {
    console.error("❌ Lỗi khi đọc GA:", err.message);
  });
}
