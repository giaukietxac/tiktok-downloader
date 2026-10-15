/* =====================================================================
   main.js — Logic frontend cho TraTuiLoc (Multilingual + Dark/Light Mode)
   ===================================================================== */

const urlInput      = document.getElementById("urlInput");
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
const langToggle    = document.getElementById("langToggle");
const langLabel     = document.getElementById("langLabel");

let isLoading = false;
let currentLang = "en"; // Mặc định toàn cầu

// ── Từ điển Song ngữ (i18n Dictionary) ────────────────────────────────────────
const TRANSLATIONS = {
  en: {
    navHowTo: "How to",
    navGuides: "Guides",
    navFaq: "FAQ",
    heroBadge: "Free · No Watermark · Unlimited",
    heroTitle: "Download TikTok Videos",
    heroTitleHighlight: "No Watermark, Free",
    heroSubtitle: "Supports TikTok & Douyin, original HD quality, no registration, no app needed.",
    inputPlaceholder: "Paste TikTok or Douyin link here...",
    btnDownload: "⬇ Download",
    btnProcessing: "Processing...",
    adLabel: "ADVERTISEMENT / SPONSORED",
    adTopNotice: "📢 Space available for Sponsor & Banner ads · Contact: ",
    adResultNotice: "🌟 Sponsored Ad Space · Inquire at ndtoanst2@gmail.com",
    adBottomNotice: "📢 Partner Advertisement · Banner sponsorship: ",
    btnNoWM: "Download HD Video (No Watermark)",
    btnMP3: "Download MP3 Audio (Original Sound)",
    directDisclaimer: "Videos are downloaded directly from TikTok/Douyin CDN servers — TraTuiLoc stores 0 bytes.",
    tryAgain: "← Download another video",
    howToTitle: "How to download TikTok video without watermark",
    step1Title: "Step 1",
    step1Desc: 'Open TikTok, tap <strong class="text-white">Share</strong> → <strong class="text-white">Copy Link</strong>',
    step2Title: "Step 2",
    step2Desc: 'Paste the link into the search box above, click <strong class="text-white">Download</strong>',
    step3Title: "Step 3",
    step3Desc: 'Choose <strong class="text-white">Download HD Video</strong> or <strong class="text-white">Download MP3</strong>',
    guidesTitle: "Guides & Tutorials",
    guidesSubtitle: "Explore handy guides on downloading TikTok clips for every device",
    guide1Title: "TikTok on iPhone",
    guide1Desc: "How to save watermark-free TikTok videos directly to iPhone Camera Roll via Safari without extra apps.",
    guide2Title: "TikTok on Android",
    guide2Desc: "Tutorial to save original Full HD clips into Android Gallery (Samsung, Xiaomi, Oppo) with zero APK risk.",
    guide3Title: "Extract MP3 Sound",
    guide3Desc: "How to extract TikTok background music and sounds to use as high-quality phone ringtones or video audio.",
    readMore: "Read guide →",
    faqTitle: "Frequently Asked Questions",
    faq1Q: "Is downloading TikTok videos free?",
    faq1A: "Yes, 100% free with unlimited downloads and no account registration needed.",
    faq2Q: "Does it support Douyin (Chinese TikTok)?",
    faq2A: "Yes! TraTuiLoc fully supports international TikTok and Chinese Douyin.",
    faq3Q: "Are the downloaded videos truly watermark-free?",
    faq3A: "Yes. We fetch the original clean video stream directly from ByteDance servers without any watermarks.",
    faq4Q: "Does TraTuiLoc store my downloaded videos?",
    faq4A: "No. TraTuiLoc does not host or store any videos. All downloads stream directly to your device.",
    footerPrivacy: "Privacy Policy",
    footerTerms: "Terms of Service",
    footerDmca: "DMCA",
    footerDisclaimer: "© 2026 TraTuiLoc · tratuiloc.xyz · Not affiliated with ByteDance, TikTok, or Douyin. We do not store videos on our server.",
    errEmpty: "Please paste a TikTok or Douyin link in the box above.",
    errInvalid: "Invalid link format. Please copy a valid TikTok or Douyin video URL.",
    errServer: "Connection error. Please check your internet connection and try again.",
    errGeneral: "Unable to process this video. Please make sure the video is public and try again."
  },
  vi: {
    navHowTo: "Hướng dẫn",
    navGuides: "Mẹo hay",
    navFaq: "FAQ",
    heroBadge: "Miễn phí · Không logo · Không giới hạn",
    heroTitle: "Tải Video TikTok",
    heroTitleHighlight: "Không Logo, Miễn Phí",
    heroSubtitle: "Hỗ trợ TikTok & Douyin, chất lượng HD gốc, không cần đăng ký, không cài ứng dụng.",
    inputPlaceholder: "Dán link TikTok hoặc Douyin vào đây...",
    btnDownload: "⬇ Tải xuống",
    btnProcessing: "Đang xử lý...",
    adLabel: "QUẢNG CÁO / TÀI TRỢ",
    adTopNotice: "📢 Không gian tài trợ & Quảng cáo banner · Liên hệ: ",
    adResultNotice: "🌟 Quảng cáo tài trợ · Đặt banner liên hệ ndtoanst2@gmail.com",
    adBottomNotice: "📢 Quảng cáo đối tác · Hợp tác đặt banner: ",
    btnNoWM: "Tải Video HD (Không Logo)",
    btnMP3: "Tải Nhạc MP3 (Chất Lượng Gốc)",
    directDisclaimer: "Video được tải thẳng từ máy chủ TikTok/Douyin — TraTuiLoc không lưu trữ bất kỳ nội dung nào.",
    tryAgain: "← Tải video khác",
    howToTitle: "Cách tải video TikTok không logo",
    step1Title: "Bước 1",
    step1Desc: 'Mở TikTok, nhấn <strong class="text-white">Chia sẻ</strong> → <strong class="text-white">Sao chép liên kết</strong>',
    step2Title: "Bước 2",
    step2Desc: 'Dán link vào ô tìm kiếm phía trên, nhấn nút <strong class="text-white">Tải xuống</strong>',
    step3Title: "Bước 3",
    step3Desc: 'Chọn <strong class="text-white">Tải Video HD</strong> hoặc <strong class="text-white">Tải Nhạc MP3</strong> để lưu về máy',
    guidesTitle: "Hướng Dẫn & Mẹo Hay",
    guidesSubtitle: "Khám phá các mẹo tải video TikTok không watermark cho từng thiết bị",
    guide1Title: "Tải TikTok trên iPhone",
    guide1Desc: "Cách lưu video TikTok sạch logo trực tiếp vào Cuộn camera iPhone qua Safari không cần cài app.",
    guide2Title: "Tải TikTok trên Android",
    guide2Desc: "Hướng dẫn lưu video Full HD vào Bộ sưu tập trên Samsung, Xiaomi, Oppo không cần file APK lạ.",
    guide3Title: "Tách Nhạc Nền MP3",
    guide3Desc: "Cách trích xuất âm thanh TikTok gốc để làm nhạc chuông điện thoại hoặc dựng video cực chuẩn.",
    readMore: "Xem hướng dẫn →",
    faqTitle: "Câu hỏi thường gặp",
    faq1Q: "Tải video TikTok có mất phí không?",
    faq1A: "Hoàn toàn miễn phí, không giới hạn số lượt tải, không cần đăng ký tài khoản.",
    faq2Q: "Có tải được video Douyin không?",
    faq2A: "Có! TraTuiLoc hỗ trợ đầy đủ cả TikTok quốc tế và Douyin (TikTok phiên bản Trung Quốc).",
    faq3Q: "Video tải về có thật sự không có logo không?",
    faq3A: "Có. Chúng tôi lấy trực tiếp phiên bản gốc không watermark từ máy chủ TikTok/Douyin. Đây là link gốc của chính ByteDance chứ không phải qua xử lý chỉnh sửa.",
    faq4Q: "TraTuiLoc có lưu video của tôi không?",
    faq4A: "Không. TraTuiLoc không lưu trữ bất kỳ video nào. Video được tải thẳng từ máy chủ TikTok/Douyin về thiết bị của bạn. Chúng tôi chỉ đóng vai trò trung gian cung cấp liên kết.",
    footerPrivacy: "Chính sách bảo mật",
    footerTerms: "Điều khoản sử dụng",
    footerDmca: "DMCA",
    footerDisclaimer: "© 2026 TraTuiLoc · tratuiloc.xyz · Dịch vụ này không liên kết với ByteDance, TikTok hoặc Douyin. Chúng tôi không lưu trữ video trên máy chủ.",
    errEmpty: "Vui lòng dán link TikTok hoặc Douyin vào ô trên.",
    errInvalid: "Link không hợp lệ. Hãy sao chép đúng đường dẫn từ app TikTok hoặc Douyin.",
    errServer: "Lỗi kết nối máy chủ. Vui lòng kiểm tra mạng và thử lại.",
    errGeneral: "Không thể xử lý video này. Hãy thử lại hoặc kiểm tra xem video có bị riêng tư không."
  }
};

// ── Hàm áp dụng ngôn ngữ (Apply Language) ─────────────────────────────────────
function setLanguage(lang) {
  currentLang = lang === "vi" ? "vi" : "en";
  localStorage.setItem("lang", currentLang);

  document.documentElement.lang = currentLang;
  if (langLabel) {
    langLabel.textContent = currentLang === "vi" ? "VI" : "EN";
  }

  const dict = TRANSLATIONS[currentLang];

  // Cập nhật tất cả các phần tử có data-i18n
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (dict[key]) {
      el.innerHTML = dict[key];
    }
  });

  // Cập nhật Placeholder
  if (urlInput) {
    urlInput.placeholder = dict.inputPlaceholder;
  }

  // Cập nhật nút Download nếu không loading
  if (!isLoading && btnText) {
    btnText.textContent = dict.btnDownload;
  }

  // Cập nhật đường link chuyên mục Guide theo ngôn ngữ
  const linkIphone  = document.getElementById("guideLinkIphone");
  const linkAndroid = document.getElementById("guideLinkAndroid");
  const linkMP3     = document.getElementById("guideLinkMP3");

  if (linkIphone) {
    linkIphone.href = currentLang === "vi"
      ? "/huong-dan/tai-video-tiktok-tren-iphone"
      : "/guides/how-to-download-tiktok-videos-on-iphone";
  }
  if (linkAndroid) {
    linkAndroid.href = currentLang === "vi"
      ? "/huong-dan/tai-video-tiktok-tren-android"
      : "/guides/how-to-download-tiktok-videos-on-android";
  }
  if (linkMP3) {
    linkMP3.href = currentLang === "vi"
      ? "/huong-dan/cach-tach-nhac-tiktok-sang-mp3"
      : "/guides/how-to-convert-tiktok-to-mp3";
  }
}

// Khởi tạo ngôn ngữ ban đầu
function initLanguage() {
  const saved = localStorage.getItem("lang");
  if (saved) {
    setLanguage(saved);
  } else {
    // Tự động nhận diện qua ngôn ngữ của trình duyệt
    const browserLang = (navigator.language || navigator.userLanguage || "en").toLowerCase();
    const detected = browserLang.startsWith("vi") ? "vi" : "en";
    setLanguage(detected);
  }
}

if (langToggle) {
  langToggle.addEventListener("click", () => {
    const nextLang = currentLang === "en" ? "vi" : "en";
    setLanguage(nextLang);
  });
}

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
  updateThemeIcons();
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function showError(msg) {
  errorText.textContent = msg;
  errorMsg.classList.remove("hidden");

  // Hiệu ứng rung lắc ô nhập link khi có lỗi
  urlInput.classList.remove("input-error");
  void urlInput.offsetWidth;
  urlInput.classList.add("input-error");
  setTimeout(() => urlInput.classList.remove("input-error"), 500);
}

function hideError() {
  errorMsg.classList.add("hidden");
}

function setLoading(loading) {
  isLoading = loading;
  downloadBtn.disabled = loading;
  const dict = TRANSLATIONS[currentLang];
  btnText.innerHTML = loading
    ? `<span class="spinner"></span> ${dict.btnProcessing}`
    : dict.btnDownload;
}

function showResult(data) {
  if (data.thumbnail) {
    thumbnail.src = data.thumbnail;
    thumbnail.style.display = "block";
  } else {
    thumbnail.style.display = "none";
  }

  videoTitle.textContent = data.title || "TikTok Video";

  if (data.musicInfo && data.musicInfo.title) {
    const artist = data.musicInfo.author ? ` • ${data.musicInfo.author}` : "";
    musicTitle.textContent = `${data.musicInfo.title}${artist}`;
    musicInfo.classList.remove("hidden");
  } else {
    musicInfo.classList.add("hidden");
  }

  // Nút Video HD trực tiếp
  if (data.noWatermark) {
    btnNoWM.href = data.noWatermark;
    btnNoWM.classList.remove("hidden");
  } else {
    btnNoWM.classList.add("hidden");
  }

  // Nút MP3 trực tiếp
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

  const dict = TRANSLATIONS[currentLang];
  const url = urlInput.value.trim();
  hideError();
  resultSection.classList.add("hidden");

  if (!url) {
    showError(dict.errEmpty);
    urlInput.focus();
    return;
  }
  if (!looksLikeTikTokUrl(url)) {
    showError(dict.errInvalid);
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
      showError(data.error || dict.errGeneral);
      return;
    }

    showResult(data);
  } catch (err) {
    console.error(err);
    showError(dict.errServer);
  } finally {
    setLoading(false);
  }
}

// ── Event Listeners ───────────────────────────────────────────────────────────
downloadBtn.addEventListener("click", handleDownload);

urlInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleDownload();
});

tryAgainBtn.addEventListener("click", reset);

// Khởi chạy hệ thống ngôn ngữ
initLanguage();