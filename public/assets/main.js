/* =====================================================================
   main.js — Logic frontend cho TraTuiLoc (Dark/Light Mode + 1-Click Paste)
   ===================================================================== */

const urlInput      = document.getElementById("urlInput");
const pasteBtn      = document.getElementById("pasteBtn");
const downloadBtn   = document.getElementById("downloadBtn");
const btnText       = document.getElementById("btnText");
const errorMsg      = document.getElementById("errorMsg");
const errorText     = document.getElementById("errorText");
const resultSection = document.getElementById("resultSection");
const thumbnail     = document.getElementById("thumbnail");
const videoTitle    = document.getElementById("videoTitle");
const musicInfo     = document.getElementById("musicInfo");
const musicTitle    = document.getElementById("musicTitle");
const btnNoWM       = document.getElementById("btnNoWatermark");
const btnMP3        = document.getElementById("btnMP3");
const tryAgainBtn   = document.getElementById("tryAgainBtn");
const themeToggle   = document.getElementById("themeToggle");
const iconSun       = document.getElementById("iconSun");
const iconMoon      = document.getElementById("iconMoon");

let isLoading = false;

// ── Dark / Light Mode ────────────────────────────────────────────────────────
function updateThemeIcons() {
  const isLight = document.documentElement.classList.contains("light");
  if (iconSun && iconMoon) {
    iconSun.classList.toggle("hidden", isLight);
    iconMoon.classList.toggle("hidden", !isLight);
  }
}

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    document.documentElement.classList.toggle("light");
    const isLight = document.documentElement.classList.contains("light");
    localStorage.setItem("theme", isLight ? "light" : "dark");
    updateThemeIcons();
  });
  // Cập nhật trạng thái icon theo theme đang chạy
  updateThemeIcons();
}

// ── Nút Dán thông minh (1-Click Paste từ Clipboard) ──────────────────────────
if (pasteBtn) {
  if (navigator.clipboard && navigator.clipboard.readText) {
    pasteBtn.addEventListener("click", async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (text && text.trim()) {
          const trimmed = text.trim();
          urlInput.value = trimmed;

          // Phản hồi giao diện trực quan
          const originalHTML = pasteBtn.innerHTML;
          pasteBtn.innerHTML = "<span>✅</span> <span>Đã dán</span>";
          pasteBtn.classList.add("paste-success");
          setTimeout(() => {
            pasteBtn.innerHTML = originalHTML;
            pasteBtn.classList.remove("paste-success");
          }, 1500);

          // Tự động tải nếu là link TikTok hợp lệ
          if (looksLikeTikTokUrl(trimmed)) {
            handleDownload();
          }
        }
      } catch (err) {
        // Trình duyệt chặn quyền clipboard -> focus vào ô để người dùng tự dán
        console.log("Clipboard read rejected:", err.message);
        urlInput.focus();
        urlInput.select();
      }
    });
  } else {
    // Ẩn nút Dán nếu trình duyệt không hỗ trợ Clipboard API
    pasteBtn.style.display = "none";
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function showError(msg) {
  errorText.textContent = msg;
  errorMsg.classList.remove("hidden");

  // Hiệu ứng rung lắc ô nhập link khi có lỗi
  urlInput.classList.remove("input-error");
  void urlInput.offsetWidth; // Trigger reflow để restart animation
  urlInput.classList.add("input-error");
  setTimeout(() => urlInput.classList.remove("input-error"), 500);
}

function hideError() {
  errorMsg.classList.add("hidden");
}

function setLoading(loading) {
  isLoading = loading;
  downloadBtn.disabled = loading;
  btnText.innerHTML = loading
    ? '<span class="spinner"></span> Đang xử lý...'
    : "⬇ Tải xuống";
}

function showResult(data) {
  // 1. Ảnh thu nhỏ (Thumbnail)
  if (data.thumbnail) {
    thumbnail.src = data.thumbnail;
    thumbnail.style.display = "block";
  } else {
    thumbnail.style.display = "none";
  }

  // 2. Tiêu đề video
  videoTitle.textContent = data.title || "Video TikTok";

  // 3. Thông tin bài nhạc
  if (data.musicInfo && data.musicInfo.title) {
    const artist = data.musicInfo.author ? ` • ${data.musicInfo.author}` : "";
    musicTitle.textContent = `${data.musicInfo.title}${artist}`;
    musicInfo.classList.remove("hidden");
  } else {
    musicInfo.classList.add("hidden");
  }

  // 4. Nút tải Video HD trực tiếp từ máy chủ TikTok (0đ băng thông của bạn)
  if (data.noWatermark) {
    btnNoWM.href = data.noWatermark;
    btnNoWM.classList.remove("hidden");
  } else {
    btnNoWM.classList.add("hidden");
  }

  // 5. Nút tải Nhạc MP3 trực tiếp từ CDN gốc
  if (data.music) {
    btnMP3.href = data.music;
    btnMP3.classList.remove("hidden");
  } else {
    btnMP3.classList.add("hidden");
  }

  resultSection.classList.remove("hidden");
  resultSection.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function reset() {
  resultSection.classList.add("hidden");
  if (musicInfo) musicInfo.classList.add("hidden");
  if (btnMP3) btnMP3.classList.add("hidden");
  hideError();
  urlInput.value = "";
  urlInput.focus();
}

// ── Validate URL phía client ─────────────────────────────────────────────────
function looksLikeTikTokUrl(url) {
  try {
    const u = new URL(url.trim());
    return [
      "tiktok.com",
      "douyin.com",
    ].some((d) => u.hostname === d || u.hostname.endsWith("." + d));
  } catch {
    return false;
  }
}

// ── Xử lý tải xuống ──────────────────────────────────────────────────────────
async function handleDownload() {
  if (isLoading) return;

  const url = urlInput.value.trim();
  hideError();
  resultSection.classList.add("hidden");

  if (!url) {
    showError("Vui lòng dán link TikTok hoặc Douyin vào ô trên.");
    urlInput.focus();
    return;
  }
  if (!looksLikeTikTokUrl(url)) {
    showError("Link không hợp lệ. Hãy sao chép đúng đường dẫn từ app TikTok hoặc Douyin.");
    urlInput.focus();
    return;
  }

  setLoading(true);

  try {
    const response = await fetch("/api/download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      showError(data.error || "Không thể xử lý video này. Hãy thử lại hoặc kiểm tra xem video có bị riêng tư không.");
      return;
    }

    showResult(data);
  } catch (err) {
    console.error(err);
    showError("Lỗi kết nối máy chủ. Vui lòng kiểm tra mạng và thử lại.");
  } finally {
    setLoading(false);
  }
}

// ── Event Listeners ───────────────────────────────────────────────────────────
downloadBtn.addEventListener("click", handleDownload);

urlInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleDownload();
});

// Auto-submit khi paste thông thường (Ctrl+V hoặc chuột phải)
urlInput.addEventListener("paste", () => {
  setTimeout(() => {
    const url = urlInput.value.trim();
    if (url && looksLikeTikTokUrl(url)) handleDownload();
  }, 100);
});

tryAgainBtn.addEventListener("click", reset);