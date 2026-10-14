const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ─────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ─── Validate URL ───────────────────────────────────────────────────────────
function isValidTikTokUrl(url) {
  try {
    const u = new URL(url);
    const validHosts = [
      "tiktok.com", "www.tiktok.com", "vm.tiktok.com",
      "vt.tiktok.com", "m.tiktok.com",
      "douyin.com", "www.douyin.com",
    ];
    return validHosts.some((h) => u.hostname === h || u.hostname.endsWith("." + h));
  } catch {
    return false;
  }
}

// ─── Bóc tách link qua TikWM API ────────────────────────────────────────────
async function extractViaTikWM(url) {
  const params = new URLSearchParams();
  params.append("url", url);
  params.append("hd", "1");

  const res = await fetch("https://www.tikwm.com/api/", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Referer": "https://www.tikwm.com/",
    },
    body: params,
    signal: AbortSignal.timeout(20000),
  });

  const json = await res.json();

  if (json.code !== 0 || !json.data) {
    console.log("[TikWM] Failed:", json.msg);
    return null;
  }

  const d = json.data;
  return {
    title: d.title || "Video TikTok",
    thumbnail: d.cover || d.origin_cover || null,
    noWatermark: d.hdplay || d.play || null,
    withWatermark: d.wmplay || d.play || null,
  };
}

// ─── API: POST /api/download ────────────────────────────────────────────────
app.post("/api/download", async (req, res) => {
  const { url } = req.body;

  if (!url || typeof url !== "string") {
    return res.status(400).json({ success: false, error: "Vui lòng cung cấp đường link TikTok." });
  }

  const trimmed = url.trim();
  if (!isValidTikTokUrl(trimmed)) {
    return res.status(400).json({ success: false, error: "Link không hợp lệ. Vui lòng dán đúng link TikTok hoặc Douyin." });
  }

  console.log(`\n[Request] ${new Date().toLocaleTimeString()} → ${trimmed}`);

  try {
    const data = await extractViaTikWM(trimmed);

    if (!data || !data.noWatermark) {
      return res.status(422).json({
        success: false,
        error: "Không thể tải video này. Có thể video đã bị xóa, ở chế độ riêng tư, hoặc link đã hết hạn.",
      });
    }

    console.log(`[OK] "${data.title.slice(0, 50)}..."`);
    return res.json({ success: true, ...data });

  } catch (err) {
    console.error("[Error]", err.message);
    return res.status(500).json({ success: false, error: "Lỗi máy chủ. Vui lòng thử lại sau ít giây." });
  }
});

// ─── Proxy download: /proxy?url=CDN_URL&filename=video.mp4 ──────────────────
app.get("/proxy", async (req, res) => {
  const { url, filename } = req.query;
  if (!url) return res.status(400).send("Missing url");

  try {
    const upstream = await fetch(decodeURIComponent(url), {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://www.tiktok.com/",
      },
      signal: AbortSignal.timeout(30000),
    });

    if (!upstream.ok) {
      return res.status(upstream.status).send("CDN error: " + upstream.status);
    }

    const contentType = upstream.headers.get("content-type") || "video/mp4";
    const safeFilename = (filename || "video.mp4").replace(/[^a-z0-9._-]/gi, "_");

    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", `attachment; filename="${safeFilename}"`);

    const contentLength = upstream.headers.get("content-length");
    if (contentLength) res.setHeader("Content-Length", contentLength);

    if (req.method === "HEAD") {
      return res.end();
    }

    const { Readable } = require("stream");
    Readable.fromWeb(upstream.body).pipe(res);
  } catch (err) {
    console.error("[Proxy Error]", err.message);
    if (!res.headersSent) res.status(500).send("Proxy error");
  }
});

// ─── Health check ────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── Trang pháp lý ──────────────────────────────────────────────────────────
app.get("/privacy", (_req, res) => res.sendFile(path.join(__dirname, "public", "privacy.html")));
app.get("/terms",   (_req, res) => res.sendFile(path.join(__dirname, "public", "terms.html")));
app.get("/dmca",    (_req, res) => res.sendFile(path.join(__dirname, "public", "dmca.html")));

// ─── Fallback → index.html ───────────────────────────────────────────────────
app.get("/{*splat}", (_req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));

// ─── Start ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 TraTuiLoc chạy tại: http://localhost:${PORT}`);
  console.log(`📋 Health: http://localhost:${PORT}/health\n`);
});
