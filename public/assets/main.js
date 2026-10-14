const urlInput      = document.getElementById("urlInput");
const downloadBtn   = document.getElementById("downloadBtn");
const btnText       = document.getElementById("btnText");
const errorMsg      = document.getElementById("errorMsg");
const errorText     = document.getElementById("errorText");
const resultSection = document.getElementById("resultSection");
const thumbnail     = document.getElementById("thumbnail");
const videoTitle    = document.getElementById("videoTitle");
const btnNoWM       = document.getElementById("btnNoWatermark");
const btnWithWM     = document.getElementById("btnWithWatermark");
const tryAgainBtn   = document.getElementById("tryAgainBtn");

let isLoading = false;

function showError(msg) {
  errorText.textContent = msg;
  errorMsg.classList.remove("hidden");
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

function makeProxyUrl(cdnUrl, filename) {
  return `/proxy?url=${encodeURIComponent(cdnUrl)}&filename=${encodeURIComponent(filename)}`;
}

function showResult(data) {
  if (data.thumbnail) {
    thumbnail.src = data.thumbnail;
    thumbnail.style.display = "block";
  } else {
    thumbnail.style.display = "none";
  }

  videoTitle.textContent = data.title || "Video TikTok";

  const safeTitle = (data.title || "tiktok-video")
    .replace(/[^a-z0-9\s-]/gi, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60) || "tiktok-video";

  btnNoWM.href  = makeProxyUrl(data.noWatermark, `${safeTitle}-nowm.mp4`);
  btnWithWM.href = makeProxyUrl(data.withWatermark || data.noWatermark, `${safeTitle}.mp4`);

  resultSection.classList.remove("hidden");
  resultSection.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function reset() {
  resultSection.classList.add("hidden");
  hideError();
  urlInput.value = "";
  urlInput.focus();
}

function looksLikeTikTokUrl(url) {
  try {
    const u = new URL(url.trim());
    return ["tiktok.com", "douyin.com"].some(
      (d) => u.hostname === d || u.hostname.endsWith("." + d)
    );
  } catch {
    return false;
  }
}

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

downloadBtn.addEventListener("click", handleDownload);
urlInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleDownload();
});
urlInput.addEventListener("paste", () => {
  setTimeout(() => {
    const url = urlInput.value.trim();
    if (url && looksLikeTikTokUrl(url)) handleDownload();
  }, 100);
});
tryAgainBtn.addEventListener("click", reset);
