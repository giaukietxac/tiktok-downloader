const express = require("express");
const cors = require("cors");
const path = require("path");

// Thư viện bóc tách dự phòng (tùy chọn khi có node_modules)
let Downloader;
try {
  const tiktokApi = require("@tobyg74/tiktok-api-dl");
  Downloader = tiktokApi.Downloader;
} catch {
  console.log("[Info] @tobyg74/tiktok-api-dl sẽ sẵn sàng sau khi chạy npm install.");
}

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ─────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ─── In-Memory Cache (Lưu kết quả video hot 15 phút) ────────────────────────
const cache = new Map();
const CACHE_TTL = 15 * 60 * 1000; // 15 phút
const MAX_CACHE_SIZE = 500; // Tối đa 500 video gần nhất

// ─── Hệ thống Đo lường & Thống kê Thời gian thực (Live Analytics) ─────────────
let totalDownloads = 1580;

const systemStats = {
  startTime: Date.now(),
  totalRequests: 0,
  successRequests: 0,
  errorRequests: 0,
  downloadsTriggered: 0,
  cacheHits: 0,
  cacheMisses: 0,
  platforms: {
    tiktok: 0,
    douyin: 0,
  },
  errorsByType: {
    invalid_url: 0,
    rate_limited: 0,
    upstream_not_found: 0,
    server_error: 0,
  },
  recentLogs: [], // Tối đa 30 sự kiện gần nhất
};

function logActivity(entry) {
  systemStats.recentLogs.unshift({
    id: Date.now() + "_" + Math.random().toString(36).substring(2, 6),
    timestamp: new Date().toISOString(),
    timeStr: new Date().toLocaleTimeString("vi-VN", { hour12: false }),
    ...entry,
  });
  if (systemStats.recentLogs.length > 30) {
    systemStats.recentLogs.pop();
  }
}

function getCached(url) {
  const entry = cache.get(url);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(url);
    return null;
  }
  return entry.data;
}

function setCache(url, data) {
  if (cache.size >= MAX_CACHE_SIZE) {
    const oldestKey = cache.keys().next().value;
    cache.delete(oldestKey);
  }
  cache.set(url, { data, timestamp: Date.now() });
}

// ─── Rate Limiting (Tối đa 20 lượt tải/phút/IP để chống bot spam) ─────────────
const rateMap = new Map();
const RATE_LIMIT = 20; // 20 requests
const RATE_WINDOW = 60 * 1000; // 1 phút

function isRateLimited(req) {
  const ip = req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown";
  const now = Date.now();
  const entry = rateMap.get(ip);

  if (!entry || now - entry.windowStart > RATE_WINDOW) {
    rateMap.set(ip, { windowStart: now, count: 1 });
    return false;
  }

  entry.count++;
  if (entry.count > RATE_LIMIT) return true;
  return false;
}

// Tự động dọn dẹp bộ nhớ rate-limit mỗi 5 phút
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateMap) {
    if (now - entry.windowStart > RATE_WINDOW) rateMap.delete(ip);
  }
}, 5 * 60 * 1000);

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

// ─── Bóc tách link qua TikWM API (Nguồn chính) ──────────────────────────────
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
  // Ưu tiên d.play (link video trực tiếp chuẩn nhất từ ByteDance, không dính lỗi v16-notes)
  const cleanVideo = (d.play && !d.play.includes("notes"))
    ? d.play
    : (d.hdplay && !d.hdplay.includes("notes"))
      ? d.hdplay
      : (d.play || d.hdplay || null);

  return {
    title: d.title || "Video TikTok",
    thumbnail: d.cover || d.origin_cover || null,
    noWatermark: cleanVideo,
    withWatermark: d.wmplay || cleanVideo,
    music: d.music || (d.music_info && d.music_info.play) || null,
    musicInfo: d.music_info ? {
      title: d.music_info.title || "Original Sound",
      author: d.music_info.author || "",
      duration: d.music_info.duration || null,
    } : null,
  };
}

// ─── Bóc tách link qua @tobyg74/tiktok-api-dl (Nguồn dự phòng) ──────────────
async function extractViaFallback(url) {
  if (!Downloader) return null;

  // Thử lần lượt các phiên bản: v1 (TikTok Mobile API) -> v2 (SSSTik) -> v3 (MusicalDown)
  const versions = ["v1", "v2", "v3"];
  for (const ver of versions) {
    try {
      const result = await Downloader(url, { version: ver });
      if (result && result.status === "success" && result.result) {
        const r = result.result;

        let noWatermark = null;
        let withWatermark = null;
        let thumbnail = null;
        let music = null;
        let title = r.desc || r.description || "Video TikTok";

        if (r.video) {
          // Định dạng của v1 và v2
          noWatermark = (r.video.playAddr && r.video.playAddr[0]) ||
                        (r.video.downloadAddr && r.video.downloadAddr[0]) || null;
          withWatermark = (r.video.downloadAddr && r.video.downloadAddr[0]) || noWatermark;
          thumbnail = (r.video.cover && r.video.cover[0]) || (r.video.originCover && r.video.originCover[0]) || null;
        } else if (r.videoHD || r.videoSD || r.videoWatermark) {
          // Định dạng của v3
          noWatermark = r.videoHD || r.videoSD || null;
          withWatermark = r.videoWatermark || noWatermark;
          thumbnail = (r.author && r.author.avatar) || null;
        }

        if (r.music) {
          music = typeof r.music === "string" ? r.music :
                  (r.music.playUrl && r.music.playUrl[0]) || null;
        }

        if (noWatermark) {
          console.log(`[Fallback OK] Trích xuất thành công qua ${ver.toUpperCase()}`);
          return {
            title,
            thumbnail,
            noWatermark,
            withWatermark,
            music,
            musicInfo: r.music && typeof r.music === "object" ? {
              title: r.music.title || "Original Sound",
              author: r.music.author || "",
              duration: r.music.duration || null,
            } : null,
          };
        }
      }
    } catch (err) {
      console.log(`[Fallback ${ver} Error]`, err.message);
    }
  }
  return null;
}

// ─── API: POST /api/download ────────────────────────────────────────────────
app.post("/api/download", async (req, res) => {
  const reqStart = Date.now();
  const { url } = req.body;

  systemStats.totalRequests++;

  if (!url || typeof url !== "string") {
    systemStats.errorRequests++;
    systemStats.errorsByType.invalid_url++;
    logActivity({
      platform: "unknown",
      status: "error",
      title: "Thiếu link đầu vào",
      url: "",
      durationMs: Date.now() - reqStart,
      source: "validation",
      errorMsg: "Vui lòng cung cấp link",
    });
    return res.status(400).json({ success: false, error: "Vui lòng cung cấp đường link TikTok." });
  }

  const trimmed = url.trim();
  const isDouyin = trimmed.includes("douyin.com") || trimmed.includes("iesdouyin.com");
  const platform = isDouyin ? "douyin" : "tiktok";

  if (isDouyin) {
    systemStats.platforms.douyin++;
  } else {
    systemStats.platforms.tiktok++;
  }

  if (!isValidTikTokUrl(trimmed)) {
    systemStats.errorRequests++;
    systemStats.errorsByType.invalid_url++;
    logActivity({
      platform,
      status: "error",
      title: "Link sai định dạng",
      url: trimmed.slice(0, 70),
      durationMs: Date.now() - reqStart,
      source: "validation",
      errorMsg: "Đường link không đúng định dạng TikTok/Douyin",
    });
    return res.status(400).json({ success: false, error: "Link không hợp lệ. Vui lòng dán đúng link TikTok hoặc Douyin." });
  }

  // 1. Kiểm tra giới hạn tốc độ (Rate Limit)
  if (isRateLimited(req)) {
    systemStats.errorRequests++;
    systemStats.errorsByType.rate_limited++;
    logActivity({
      platform,
      status: "error",
      title: "Bị chặn Rate Limit",
      url: trimmed.slice(0, 70),
      durationMs: Date.now() - reqStart,
      source: "rate_limit",
      errorMsg: "Vượt quá 20 yêu cầu / phút",
    });
    return res.status(429).json({
      success: false,
      error: "Bạn gửi yêu cầu quá nhanh. Vui lòng đợi 1 phút rồi thử lại.",
    });
  }

  console.log(`\n[Request] ${new Date().toLocaleTimeString()} → ${trimmed}`);

  // 2. Kiểm tra Cache RAM trước (0ms, 0đ băng thông)
  const cached = getCached(trimmed);
  if (cached) {
    systemStats.cacheHits++;
    systemStats.successRequests++;
    totalDownloads++;
    const duration = Date.now() - reqStart;
    logActivity({
      platform,
      status: "success",
      title: cached.title?.slice(0, 60) || "Video TikTok",
      url: trimmed.slice(0, 70),
      durationMs: duration,
      source: "cache",
    });
    console.log(`[Cache HIT - ${duration}ms] "${cached.title?.slice(0, 50)}..."`);
    return res.json({ success: true, ...cached });
  }

  systemStats.cacheMisses++;

  try {
    // 3. Gọi nguồn chính (TikWM API)
    let data = await extractViaTikWM(trimmed);
    let usedSource = "tikwm";

    // 4. Nếu TikWM lỗi, tự động chuyển sang nguồn dự phòng
    if (!data || !data.noWatermark) {
      console.log("[TikWM] Không trích xuất được, chuyển sang nguồn dự phòng...");
      data = await extractViaFallback(trimmed);
      usedSource = "fallback";
    }

    if (!data || !data.noWatermark) {
      systemStats.errorRequests++;
      systemStats.errorsByType.upstream_not_found++;
      const duration = Date.now() - reqStart;
      logActivity({
        platform,
        status: "error",
        title: "Không thể lấy nội dung",
        url: trimmed.slice(0, 70),
        durationMs: duration,
        source: "upstream",
        errorMsg: "Video bị xóa, riêng tư hoặc link đã hết hạn",
      });
      return res.status(422).json({
        success: false,
        error: "Không thể tải video này. Có thể video đã bị xóa, ở chế độ riêng tư, hoặc link đã hết hạn.",
      });
    }

    // 5. Lưu vào Cache RAM cho những người dùng sau
    setCache(trimmed, data);
    systemStats.successRequests++;
    totalDownloads++;

    const duration = Date.now() - reqStart;
    logActivity({
      platform,
      status: "success",
      title: data.title?.slice(0, 60) || "Video TikTok",
      url: trimmed.slice(0, 70),
      durationMs: duration,
      source: usedSource,
    });

    console.log(`[OK - ${usedSource} - ${duration}ms] "${data.title.slice(0, 50)}..."`);
    return res.json({ success: true, ...data });

  } catch (err) {
    systemStats.errorRequests++;
    systemStats.errorsByType.server_error++;
    const duration = Date.now() - reqStart;
    logActivity({
      platform,
      status: "error",
      title: "Lỗi máy chủ",
      url: trimmed.slice(0, 70),
      durationMs: duration,
      source: "server",
      errorMsg: err.message,
    });
    console.error("[Error]", err.message);
    return res.status(500).json({ success: false, error: "Lỗi máy chủ. Vui lòng thử lại sau ít giây." });
  }
});

// ─── Proxy download: /proxy?url=CDN_URL&filename=video.mp4 ──────────────────
// Lưu ý: Chỉ dùng dự phòng khi thực sự cần thiết để tránh tốn băng thông server
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

// ─── Health check (Dùng cho UptimeRobot giữ server thức 24/24) ───────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── Ghi nhận lượt tải file thực tế từ trình duyệt ──────────────────────────
app.post("/api/stats/track-download", (req, res) => {
  systemStats.downloadsTriggered++;
  totalDownloads++;
  res.json({ success: true, totalDownloads, downloadsTriggered: systemStats.downloadsTriggered });
});

// ─── Theo dõi trạng thái tài nguyên hệ thống (Live Stats API) ───────────────
app.get("/api/stats", (_req, res) => {
  const uptimeSec = Math.floor(process.uptime());
  const hours = Math.floor(uptimeSec / 3600);
  const minutes = Math.floor((uptimeSec % 3600) / 60);
  const seconds = uptimeSec % 60;
  const uptimeHuman = `${hours}h ${minutes}m ${seconds}s`;

  const totalReq = systemStats.totalRequests;
  const successRate = totalReq > 0
    ? ((systemStats.successRequests / totalReq) * 100).toFixed(1) + "%"
    : "100%";

  const totalCacheQueries = systemStats.cacheHits + systemStats.cacheMisses;
  const cacheHitRate = totalCacheQueries > 0
    ? ((systemStats.cacheHits / totalCacheQueries) * 100).toFixed(1) + "%"
    : "0%";

  res.json({
    status: "operational",
    totalDownloads,
    systemStats: {
      totalRequests: systemStats.totalRequests,
      successRequests: systemStats.successRequests,
      errorRequests: systemStats.errorRequests,
      successRate,
      downloadsTriggered: systemStats.downloadsTriggered,
      cacheHits: systemStats.cacheHits,
      cacheMisses: systemStats.cacheMisses,
      cacheHitRate,
      activeCacheSize: cache.size,
      platforms: systemStats.platforms,
      errorsByType: systemStats.errorsByType,
      recentLogs: systemStats.recentLogs,
      uptimeSeconds: uptimeSec,
      uptimeHuman,
      memoryMB: Math.round(process.memoryUsage().rss / 1024 / 1024),
      rateLimitTrackedIPs: rateMap.size,
    },
    serverTime: new Date().toISOString(),
  });
});

// ─── Trang Dashboard Giám sát Trực quan (Live Monitor UI) ───────────────────
app.get("/stats", (_req, res) => res.sendFile(path.join(__dirname, "public", "stats.html")));

// ─── Trang pháp lý ──────────────────────────────────────────────────────────
app.get("/privacy", (_req, res) => res.sendFile(path.join(__dirname, "public", "privacy.html")));
app.get("/terms",   (_req, res) => res.sendFile(path.join(__dirname, "public", "terms.html")));
app.get("/dmca",    (_req, res) => res.sendFile(path.join(__dirname, "public", "dmca.html")));

// ─── Chuyên mục bài viết SEO Quốc tế (English Guides) ────────────────────────
app.get("/guides/how-to-download-tiktok-videos-on-iphone", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "guides", "how-to-download-tiktok-videos-on-iphone.html"));
});
app.get("/guides/how-to-download-tiktok-videos-on-android", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "guides", "how-to-download-tiktok-videos-on-android.html"));
});
app.get("/guides/how-to-convert-tiktok-to-mp3", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "guides", "how-to-convert-tiktok-to-mp3.html"));
});
app.get("/guides/how-to-download-douyin-videos-without-watermark", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "guides", "how-to-download-douyin-videos-without-watermark.html"));
});

// ─── Chuyên mục bài viết SEO Tiếng Việt (Vietnamese Guides) ──────────────────
app.get("/huong-dan/tai-video-tiktok-tren-iphone", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "huong-dan", "tai-video-tiktok-tren-iphone.html"));
});
app.get("/huong-dan/tai-video-tiktok-tren-android", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "huong-dan", "tai-video-tiktok-tren-android.html"));
});
app.get("/huong-dan/cach-tach-nhac-tiktok-sang-mp3", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "huong-dan", "cach-tach-nhac-tiktok-sang-mp3.html"));
});
app.get("/huong-dan/cach-tai-video-douyin-khong-logo", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "huong-dan", "cach-tai-video-douyin-khong-logo.html"));
});

// ─── Sub-folders Quốc tế (International SEO Landing Pages) ───────────────────
app.get(["/es", "/es/{*splat}"], (_req, res) => res.sendFile(path.join(__dirname, "public", "es", "index.html")));
app.get(["/pt", "/pt/{*splat}"], (_req, res) => res.sendFile(path.join(__dirname, "public", "pt", "index.html")));
app.get(["/id", "/id/{*splat}"], (_req, res) => res.sendFile(path.join(__dirname, "public", "id", "index.html")));

// ─── Fallback → index.html ───────────────────────────────────────────────────
app.get("/{*splat}", (_req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));

// ─── Start ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 TikSnap chạy tại: http://localhost:${PORT}`);
  console.log(`📡 Domain: https://tiksnap.space`);
  console.log(`📋 Health: http://localhost:${PORT}/health`);
  console.log(`📊 Stats: http://localhost:${PORT}/api/stats\n`);
});