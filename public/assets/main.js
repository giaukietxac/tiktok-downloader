/* =====================================================================
   main.js — TikSnap Global Frontend
   Multilingual (13 Languages) + Dark/Light Mode + Download Ad Modal
   ===================================================================== */

// ── DOM References ──────────────────────────────────────────────────────────
const urlInput          = document.getElementById("urlInput");
const downloadBtn       = document.getElementById("downloadBtn");
const btnText           = document.getElementById("btnText");
const errorMsg          = document.getElementById("errorMsg");
const errorText         = document.getElementById("errorText");
const resultSection     = document.getElementById("resultSection");
const thumbnail         = document.getElementById("thumbnail");
const videoTitle        = document.getElementById("videoTitle");
const musicInfo         = document.getElementById("musicInfo");
const musicTitle        = document.getElementById("musicTitle");
const btnNoWM           = document.getElementById("btnNoWatermark");
const btnMP3            = document.getElementById("btnMP3");
const tryAgainBtn       = document.getElementById("tryAgainBtn");
const themeToggle       = document.getElementById("themeToggle");
const iconSun           = document.getElementById("iconSun");
const iconMoon          = document.getElementById("iconMoon");

// Language Dropdown DOM
const langDropdownContainer = document.getElementById("langDropdownContainer");
const langToggle        = document.getElementById("langToggle");
const langLabel         = document.getElementById("langLabel");
const langArrow         = document.getElementById("langArrow");
const langMenu          = document.getElementById("langMenu");

// Download Modal DOM
const downloadModal     = document.getElementById("downloadModal");
const modalCloseBtn     = document.getElementById("modalCloseBtn");
const countdownNumber   = document.getElementById("countdownNumber");
const modalDownloadBtn  = document.getElementById("modalDownloadBtn");
const modalBtnText      = document.getElementById("modalBtnText");

let isLoading = false;
let currentLang = "en";
let pendingDownloadUrl = "";
let pendingDownloadFilename = "";
let countdownTimer = null;

// ── Danh sách 13 Ngôn ngữ Phổ biến Nhất Toàn cầu ──────────────────────────
const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "vi", label: "Tiếng Việt", flag: "🇻🇳" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "pt", label: "Português", flag: "🇧🇷" },
  { code: "id", label: "Bahasa Indonesia", flag: "🇮🇩" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
  { code: "ko", label: "한국어", flag: "🇰🇷" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
  { code: "th", label: "ไทย", flag: "🇹🇭" },
  { code: "zh", label: "中文 (简体)", flag: "🇨🇳" }
];

// ── Từ điển Đa ngôn ngữ (13 Global Languages) ────────────────────────────────
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
    adSideNotice: "Skyscraper Banner 160×600",
    btnNoWM: "Download HD Video (No Watermark)",
    btnMP3: "Download MP3 Audio (Original Sound)",
    directDisclaimer: "Videos are downloaded directly from TikTok/Douyin CDN servers — TikSnap stores 0 bytes.",
    badgeClean: "100% Watermark-Free · Direct Download",
    tryAgain: "← Download another video",
    modalTitle: "Preparing your download...",
    modalWait: "Connecting directly to original CDN server, please wait a moment",
    modalCounting: "Download link ready in:",
    modalAdHeading: "Sponsored Partner Advertisement",
    modalAdText: "High engagement banner slot before download",
    modalBtnDownload: "⬇ Click here to Get Your File",
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
    faq2A: "Yes! TikSnap fully supports international TikTok and Chinese Douyin.",
    faq3Q: "Are the downloaded videos truly watermark-free?",
    faq3A: "Yes. We fetch the original clean video stream directly from ByteDance servers without any watermarks.",
    faq4Q: "Does TikSnap store my downloaded videos?",
    faq4A: "No. TikSnap does not host or store any videos. All downloads stream directly to your device.",
    footerPrivacy: "Privacy Policy",
    footerTerms: "Terms of Service",
    footerDmca: "DMCA",
    footerDisclaimer: "© 2026 TikSnap · tiksnap.space · Not affiliated with ByteDance, TikTok, or Douyin. We do not store videos on our server.",
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
    adSideNotice: "Banner Quảng cáo sườn 160×600",
    btnNoWM: "Tải Video HD (Không Logo)",
    btnMP3: "Tải Nhạc MP3 (Chất Lượng Gốc)",
    directDisclaimer: "Video được tải thẳng từ máy chủ TikTok/Douyin — TikSnap không lưu trữ bất kỳ nội dung nào.",
    badgeClean: "100% Sạch Logo · Tải Trực Tiếp",
    tryAgain: "← Tải video khác",
    modalTitle: "Đang tạo đường link tải...",
    modalWait: "Vui lòng chờ giây lát trong khi chúng tôi kết nối trực tiếp đến máy chủ gốc",
    modalCounting: "Link tải sẵn sàng sau:",
    modalAdHeading: "Không gian Banner Tài trợ",
    modalAdText: "Vị trí tương tác cao nhất trước khi tải file",
    modalBtnDownload: "⬇ Bấm vào đây để Nhận file ngay",
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
    faq2A: "Có! TikSnap hỗ trợ đầy đủ cả TikTok quốc tế và Douyin (TikTok phiên bản Trung Quốc).",
    faq3Q: "Video tải về có thật sự không có logo không?",
    faq3A: "Có. Chúng tôi lấy trực tiếp phiên bản gốc không watermark từ máy chủ TikTok/Douyin. Đây là link gốc của chính ByteDance chứ không phải qua xử lý chỉnh sửa.",
    faq4Q: "TikSnap có lưu video của tôi không?",
    faq4A: "Không. TikSnap không lưu trữ bất kỳ video nào. Video được tải thẳng từ máy chủ TikTok/Douyin về thiết bị của bạn. Chúng tôi chỉ đóng vai trò trung gian cung cấp liên kết.",
    footerPrivacy: "Chính sách bảo mật",
    footerTerms: "Điều khoản sử dụng",
    footerDmca: "DMCA",
    footerDisclaimer: "© 2026 TikSnap · tiksnap.space · Dịch vụ này không liên kết với ByteDance, TikTok hoặc Douyin. Chúng tôi không lưu trữ video trên máy chủ.",
    errEmpty: "Vui lòng dán link TikTok hoặc Douyin vào ô trên.",
    errInvalid: "Link không hợp lệ. Hãy sao chép đúng đường dẫn từ app TikTok hoặc Douyin.",
    errServer: "Lỗi kết nối máy chủ. Vui lòng kiểm tra mạng và thử lại.",
    errGeneral: "Không thể xử lý video này. Hãy thử lại hoặc kiểm tra xem video có bị riêng tư không."
  },
  es: {
    navHowTo: "Cómo usar",
    navGuides: "Guías",
    navFaq: "Preguntas",
    heroBadge: "Gratis · Sin marca de agua · Ilimitado",
    heroTitle: "Descargar Videos de TikTok",
    heroTitleHighlight: "Sin Marca de Agua, Gratis",
    heroSubtitle: "Compatible con TikTok y Douyin, calidad HD original, sin registro, sin aplicaciones.",
    inputPlaceholder: "Pega el enlace de TikTok o Douyin aquí...",
    btnDownload: "⬇ Descargar",
    btnProcessing: "Procesando...",
    adLabel: "PUBLICIDAD / PATROCINADO",
    adTopNotice: "📢 Espacio disponible para anuncios · Contacto: ",
    adResultNotice: "🌟 Espacio patrocinado · Escribir a ndtoanst2@gmail.com",
    adBottomNotice: "📢 Publicidad de socios · Anúnciate aquí: ",
    adSideNotice: "Banner Lateral 160×600",
    btnNoWM: "Descargar Video HD (Sin Marca)",
    btnMP3: "Descargar Audio MP3 (Sonido Original)",
    directDisclaimer: "Los videos se descargan directamente de los servidores CDN de TikTok — TikSnap no almacena nada.",
    badgeClean: "100% Sin Marca · Descarga Directa",
    tryAgain: "← Descargar otro video",
    modalTitle: "Preparando enlace de descarga...",
    modalWait: "Conectando directamente con los servidores originales, espera un momento",
    modalCounting: "El enlace estará listo en:",
    modalAdHeading: "Espacio Publicitario Patrocinado",
    modalAdText: "Zona de máxima interacción antes de descargar",
    modalBtnDownload: "⬇ Haz clic aquí para Obtener el Archivo",
    howToTitle: "¿Cómo descargar videos de TikTok sin marca de agua?",
    step1Title: "Paso 1",
    step1Desc: 'Abre TikTok, pulsa <strong class="text-white">Compartir</strong> → <strong class="text-white">Copiar enlace</strong>',
    step2Title: "Paso 2",
    step2Desc: 'Pega el enlace en el cuadro de búsqueda y haz clic en <strong class="text-white">Descargar</strong>',
    step3Title: "Paso 3",
    step3Desc: 'Elige <strong class="text-white">Descargar Video HD</strong> o <strong class="text-white">Descargar MP3</strong>',
    guidesTitle: "Guías y Tutoriales",
    guidesSubtitle: "Explora guías prácticas para descargar clips de TikTok en cualquier dispositivo",
    guide1Title: "TikTok en iPhone",
    guide1Desc: "Cómo guardar clips de TikTok sin marca directamente en el carrete de iPhone usando Safari.",
    guide2Title: "TikTok en Android",
    guide2Desc: "Tutorial para guardar videos Full HD en la galería de Samsung, Xiaomi y Oppo con total seguridad.",
    guide3Title: "Extraer Sonido MP3",
    guide3Desc: "Cómo extraer música y audio de fondo de TikTok para tonos de llamada o creación de videos.",
    readMore: "Leer guía →",
    faqTitle: "Preguntas Frecuentes",
    faq1Q: "¿Descargar videos de TikTok es gratis?",
    faq1A: "Sí, 100% gratuito con descargas ilimitadas y sin necesidad de registrarse.",
    faq2Q: "¿Es compatible con Douyin (TikTok chino)?",
    faq2A: "¡Sí! TikSnap es totalmente compatible tanto con TikTok global como con Douyin.",
    faq3Q: "¿Los videos descargados no tienen marca de agua?",
    faq3A: "Sí. Obtenemos el flujo de video limpio original directamente de los servidores de ByteDance.",
    faq4Q: "¿TikSnap almacena mis videos descargados?",
    faq4A: "No. TikSnap no aloja ni guarda ningún video. Todo se transmite directamente a tu dispositivo.",
    footerPrivacy: "Política de Privacidad",
    footerTerms: "Términos de Servicio",
    footerDmca: "DMCA",
    footerDisclaimer: "© 2026 TikSnap · tiksnap.space · No afiliado a ByteDance, TikTok o Douyin. No almacenamos videos.",
    errEmpty: "Pega un enlace de TikTok o Douyin en el cuadro de arriba.",
    errInvalid: "Formato de enlace no válido. Copia una URL válida de TikTok o Douyin.",
    errServer: "Error de conexión. Comprueba tu red e inténtalo de nuevo.",
    errGeneral: "No se puede procesar este video. Asegúrate de que sea público e intenta de nuevo."
  },
  pt: {
    navHowTo: "Como usar",
    navGuides: "Tutoriais",
    navFaq: "FAQ",
    heroBadge: "Grátis · Sem marca d'água · Ilimitado",
    heroTitle: "Baixar Vídeos do TikTok",
    heroTitleHighlight: "Sem Marca d'Água, Grátis",
    heroSubtitle: "Compatível com TikTok e Douyin, qualidade HD original, sem cadastro, sem aplicativo.",
    inputPlaceholder: "Cole o link do TikTok ou Douyin aqui...",
    btnDownload: "⬇ Baixar",
    btnProcessing: "Processando...",
    adLabel: "ANÚNCIO / PATROCINADO",
    adTopNotice: "📢 Espaço disponível para anúncios de parceiros · Contato: ",
    adResultNotice: "🌟 Espaço patrocinado · Contato: ndtoanst2@gmail.com",
    adBottomNotice: "📢 Anúncio de parceiros · Patrocine aqui: ",
    adSideNotice: "Banner Lateral 160×600",
    btnNoWM: "Baixar Vídeo HD (Sem Marca)",
    btnMP3: "Baixar Áudio MP3 (Som Original)",
    directDisclaimer: "Os vídeos são baixados diretamente dos servidores do TikTok — TikSnap não armazena dados.",
    badgeClean: "100% Sem Marca · Download Direto",
    tryAgain: "← Baixar outro vídeo",
    modalTitle: "Preparando seu download...",
    modalWait: "Conectando diretamente aos servidores originais, aguarde um instante",
    modalCounting: "Link de download pronto em:",
    modalAdHeading: "Banner de Patrocinador",
    modalAdText: "Área de maior interação antes do download",
    modalBtnDownload: "⬇ Clique aqui para Baixar o Arquivo",
    howToTitle: "Como baixar vídeo do TikTok sem marca d'água",
    step1Title: "Passo 1",
    step1Desc: 'Abra o TikTok, toque em <strong class="text-white">Compartilhar</strong> → <strong class="text-white">Copiar Link</strong>',
    step2Title: "Passo 2",
    step2Desc: 'Cole o link na caixa de busca acima e clique em <strong class="text-white">Baixar</strong>',
    step3Title: "Passo 3",
    step3Desc: 'Escolha <strong class="text-white">Baixar Vídeo HD</strong> ou <strong class="text-white">Baixar MP3</strong>',
    guidesTitle: "Guias e Dicas",
    guidesSubtitle: "Explore dicas úteis para salvar vídeos do TikTok em qualquer celular ou PC",
    guide1Title: "TikTok no iPhone",
    guide1Desc: "Como salvar vídeos do TikTok sem marca d'água direto na galeria do iPhone pelo Safari.",
    guide2Title: "TikTok no Android",
    guide2Desc: "Tutorial para salvar clipes em Full HD na galeria de aparelhos Samsung, Xiaomi e Motorola.",
    guide3Title: "Extrair Áudio MP3",
    guide3Desc: "Como extrair músicas e sons do TikTok para usar como toque de celular ou trilha sonora.",
    readMore: "Ler guia →",
    faqTitle: "Perguntas Frequentes",
    faq1Q: "Baixar vídeos do TikTok é gratuito?",
    faq1A: "Sim, 100% gratuito, com downloads ilimitados e sem necessidade de cadastro.",
    faq2Q: "Suporta o Douyin (TikTok chinês)?",
    faq2A: "Sim! O TikSnap suporta perfeitamente o TikTok internacional e o Douyin chinês.",
    faq3Q: "Os vídeos baixados realmente não têm marca d'água?",
    faq3A: "Sim. Obtemos o fluxo de vídeo limpo original diretamente dos servidores da ByteDance.",
    faq4Q: "O TikSnap armazena meus vídeos baixados?",
    faq4A: "Não. O TikSnap não armazena nenhum vídeo. Todos os downloads vão direto para o seu dispositivo.",
    footerPrivacy: "Política de Privacidade",
    footerTerms: "Termos de Uso",
    footerDmca: "DMCA",
    footerDisclaimer: "© 2026 TikSnap · tiksnap.space · Não afiliado ao ByteDance, TikTok ou Douyin.",
    errEmpty: "Por favor, cole um link do TikTok ou Douyin na caixa acima.",
    errInvalid: "Formato de link inválido. Copie uma URL válida do TikTok ou Douyin.",
    errServer: "Erro de conexão. Verifique sua internet e tente novamente.",
    errGeneral: "Não foi possível processar este vídeo. Verifique se ele é público."
  },
  id: {
    navHowTo: "Cara Pakai",
    navGuides: "Panduan",
    navFaq: "FAQ",
    heroBadge: "Gratis · Tanpa Watermark · Tanpa Batas",
    heroTitle: "Download Video TikTok",
    heroTitleHighlight: "Tanpa Watermark, Gratis",
    heroSubtitle: "Mendukung TikTok & Douyin, kualitas HD asli, tanpa daftar, tanpa instal aplikasi.",
    inputPlaceholder: "Tempel tautan TikTok atau Douyin di sini...",
    btnDownload: "⬇ Unduh",
    btnProcessing: "Memproses...",
    adLabel: "IKLAN / DISPONSORI",
    adTopNotice: "📢 Ruang iklan & banner mitra tersedia · Hubungi: ",
    adResultNotice: "🌟 Ruang Iklan Sponsor · Kontak ndtoanst2@gmail.com",
    adBottomNotice: "📢 Iklan Mitra · Kerjasama banner: ",
    adSideNotice: "Banner Samping 160×600",
    btnNoWM: "Unduh Video HD (Tanpa Watermark)",
    btnMP3: "Unduh Audio MP3 (Suara Asli)",
    directDisclaimer: "Video diunduh langsung dari server CDN TikTok — TikSnap tidak menyimpan data apapun.",
    badgeClean: "100% Tanpa Watermark · Unduh Langsung",
    tryAgain: "← Unduh video lain",
    modalTitle: "Menyiapkan tautan unduhan...",
    modalWait: "Menghubungkan langsung ke server asli, harap tunggu sebentar",
    modalCounting: "Tautan siap dalam:",
    modalAdHeading: "Ruang Iklan Sponsor",
    modalAdText: "Posisi interaksi tertinggi sebelum mengunduh file",
    modalBtnDownload: "⬇ Klik di sini untuk Ambil File Sekarang",
    howToTitle: "Cara download video TikTok tanpa watermark",
    step1Title: "Langkah 1",
    step1Desc: 'Buka TikTok, ketuk <strong class="text-white">Bagikan</strong> → <strong class="text-white">Salin Tautan</strong>',
    step2Title: "Langkah 2",
    step2Desc: 'Tempel tautan ke kotak pencarian di atas, klik <strong class="text-white">Unduh</strong>',
    step3Title: "Langkah 3",
    step3Desc: 'Pilih <strong class="text-white">Unduh Video HD</strong> atau <strong class="text-white">Unduh MP3</strong>',
    guidesTitle: "Panduan & Tips",
    guidesSubtitle: "Jelajahi panduan praktis untuk menyimpan video TikTok di semua perangkat",
    guide1Title: "TikTok di iPhone",
    guide1Desc: "Cara menyimpan video TikTok bersih logo langsung ke Galeri iPhone via Safari tanpa aplikasi.",
    guide2Title: "TikTok di Android",
    guide2Desc: "Tutorial menyimpan video Full HD ke Galeri Samsung, Xiaomi, Oppo dengan aman.",
    guide3Title: "Ekstrak Suara MP3",
    guide3Desc: "Cara mengambil musik latar TikTok untuk nada dering ponsel atau backsound video.",
    readMore: "Baca panduan →",
    faqTitle: "Pertanyaan yang Sering Diajukan",
    faq1Q: "Apakah download video TikTok gratis?",
    faq1A: "Ya, 100% gratis tanpa batas unduhan dan tanpa perlu membuat akun.",
    faq2Q: "Apakah mendukung Douyin (TikTok China)?",
    faq2A: "Ya! TikSnap mendukung penuh TikTok internasional dan Douyin versi China.",
    faq3Q: "Apakah video benar-benar bersih tanpa watermark?",
    faq3A: "Ya. Kami mengambil link video asli langsung dari server ByteDance tanpa watermark.",
    faq4Q: "Apakah TikSnap menyimpan video saya?",
    faq4A: "Tidak. TikSnap tidak menyimpan video apapun. Semua unduhan langsung ke perangkat Anda.",
    footerPrivacy: "Kebijakan Privasi",
    footerTerms: "Ketentuan Layanan",
    footerDmca: "DMCA",
    footerDisclaimer: "© 2026 TikSnap · tiksnap.space · Tidak berafiliasi dengan ByteDance, TikTok, atau Douyin.",
    errEmpty: "Silakan tempel tautan TikTok atau Douyin di kotak atas.",
    errInvalid: "Format tautan tidak valid. Harap salin tautan TikTok atau Douyin yang benar.",
    errServer: "Kesalahan koneksi server. Silakan periksa jaringan dan coba lagi.",
    errGeneral: "Tidak dapat memproses video ini. Pastikan video bersifat publik."
  },
  fr: {
    navHowTo: "Comment faire",
    navGuides: "Guides",
    navFaq: "FAQ",
    heroBadge: "Gratuit · Sans filigrane · Illimité",
    heroTitle: "Télécharger Vidéos TikTok",
    heroTitleHighlight: "Sans Filigrane, Gratuit",
    heroSubtitle: "Prend en charge TikTok et Douyin, qualité HD d'origine, sans inscription.",
    inputPlaceholder: "Collez le lien TikTok ou Douyin ici...",
    btnDownload: "⬇ Télécharger",
    btnProcessing: "Traitement...",
    adLabel: "PUBLICITÉ / SPONSORISÉ",
    adTopNotice: "📢 Espace disponible pour bannières publicitaires · Contact: ",
    adResultNotice: "🌟 Espace sponsorisé · Contact: ndtoanst2@gmail.com",
    adBottomNotice: "📢 Publicité partenaire · Partenariat: ",
    adSideNotice: "Bannière Latérale 160×600",
    btnNoWM: "Télécharger Vidéo HD (Sans Filigrane)",
    btnMP3: "Télécharger Audio MP3 (Son Original)",
    directDisclaimer: "Les vidéos sont téléchargées directement depuis les serveurs CDN de TikTok — TikSnap ne stocke rien.",
    badgeClean: "100% Sans Filigrane · Téléchargement Direct",
    tryAgain: "← Télécharger une autre vidéo",
    modalTitle: "Préparation de votre téléchargement...",
    modalWait: "Connexion directe aux serveurs d'origine, veuillez patienter un instant",
    modalCounting: "Lien prêt dans:",
    modalAdHeading: "Espace Publicitaire Partenaire",
    modalAdText: "Zone à forte visibilité avant téléchargement",
    modalBtnDownload: "⬇ Cliquez ici pour Obtenir le Fichier",
    howToTitle: "Comment télécharger une vidéo TikTok sans filigrane",
    step1Title: "Étape 1",
    step1Desc: 'Ouvrez TikTok, appuyez sur <strong class="text-white">Partager</strong> → <strong class="text-white">Copier le lien</strong>',
    step2Title: "Étape 2",
    step2Desc: 'Collez le lien dans la boîte de recherche et cliquez sur <strong class="text-white">Télécharger</strong>',
    step3Title: "Étape 3",
    step3Desc: 'Choisissez <strong class="text-white">Télécharger Vidéo HD</strong> ou <strong class="text-white">Télécharger MP3</strong>',
    guidesTitle: "Guides & Tutoriels",
    guidesSubtitle: "Découvrez des guides pratiques pour enregistrer des vidéos TikTok sur tous vos appareils",
    guide1Title: "TikTok sur iPhone",
    guide1Desc: "Comment enregistrer des vidéos TikTok sans filigrane sur pellicule iPhone avec Safari.",
    guide2Title: "TikTok sur Android",
    guide2Desc: "Guide pour enregistrer des clips Full HD dans la galerie Samsung, Xiaomi ou Oppo sans risque.",
    guide3Title: "Extraire le Son MP3",
    guide3Desc: "Comment extraire les sons et musiques de fond de TikTok pour vos sonneries de téléphone.",
    readMore: "Lire le guide →",
    faqTitle: "Questions Fréquemment Posées",
    faq1Q: "Le téléchargement de vidéos TikTok est-il gratuit ?",
    faq1A: "Oui, 100% gratuit avec téléchargements illimités et sans inscription requise.",
    faq2Q: "Prend-il en charge Douyin (TikTok chinois) ?",
    faq2A: "Oui ! TikSnap prend en charge TikTok international et Douyin chinois.",
    faq3Q: "Les vidéos téléchargées sont-elles sans filigrane ?",
    faq3A: "Oui, nous récupérons le flux vidéo original directement auprès des serveurs ByteDance.",
    faq4Q: "TikSnap stocke-t-il mes vidéos ?",
    faq4A: "Non. TikSnap ne stocke aucune vidéo. Tout est transmis directement à votre appareil.",
    footerPrivacy: "Politique de Confidentialité",
    footerTerms: "Conditions d'Utilisation",
    footerDmca: "DMCA",
    footerDisclaimer: "© 2026 TikSnap · tiksnap.space · Non affilié à ByteDance, TikTok ou Douyin.",
    errEmpty: "Veuillez coller un lien TikTok ou Douyin dans le champ ci-dessus.",
    errInvalid: "Format de lien invalide. Veuillez copier une URL valide.",
    errServer: "Erreur de connexion au serveur. Vérifiez votre réseau et réessayez.",
    errGeneral: "Impossible de traiter cette vidéo. Vérifiez qu'elle est bien publique."
  },
  de: {
    navHowTo: "Anleitung",
    navGuides: "Ratgeber",
    navFaq: "FAQ",
    heroBadge: "Kostenlos · Ohne Wasserzeichen · Unbegrenzt",
    heroTitle: "TikTok Videos Herunterladen",
    heroTitleHighlight: "Ohne Wasserzeichen, Kostenlos",
    heroSubtitle: "Unterstützt TikTok & Douyin, originale HD-Qualität, keine Registrierung, keine App nötig.",
    inputPlaceholder: "TikTok- oder Douyin-Link hier einfügen...",
    btnDownload: "⬇ Herunterladen",
    btnProcessing: "Wird verarbeitet...",
    adLabel: "WERBUNG / GESPONSERT",
    adTopNotice: "📢 Bannerwerbung & Sponsoring verfügbar · Kontakt: ",
    adResultNotice: "🌟 Werbeplatz · Kontakt: ndtoanst2@gmail.com",
    adBottomNotice: "📢 Partnerwerbung · Banner-Sponsoring: ",
    adSideNotice: "Seitenbanner 160×600",
    btnNoWM: "HD-Video herunterladen (Ohne Wasserzeichen)",
    btnMP3: "MP3-Audio herunterladen (Originalton)",
    directDisclaimer: "Videos werden direkt von den TikTok/Douyin CDN-Servern gestreamt — TikSnap speichert 0 Bytes.",
    badgeClean: "100% Ohne Wasserzeichen · Direkter Download",
    tryAgain: "← Ein anderes Video herunterladen",
    modalTitle: "Download wird vorbereitet...",
    modalWait: "Verbindung zu den Originalservern wird hergestellt, bitte einen Moment Geduld",
    modalCounting: "Downloadlink bereit in:",
    modalAdHeading: "Gesponserter Werbeplatz",
    modalAdText: "Höchste Aufmerksamkeit vor dem Dateidownload",
    modalBtnDownload: "⬇ Hier klicken, um die Datei zu erhalten",
    howToTitle: "So laden Sie TikTok-Videos ohne Wasserzeichen herunter",
    step1Title: "Schritt 1",
    step1Desc: 'Öffnen Sie TikTok, tippen Sie auf <strong class="text-white">Teilen</strong> → <strong class="text-white">Link kopieren</strong>',
    step2Title: "Schritt 2",
    step2Desc: 'Fügen Sie den Link in das Suchfeld oben ein und klicken Sie auf <strong class="text-white">Herunterladen</strong>',
    step3Title: "Schritt 3",
    step3Desc: 'Wählen Sie <strong class="text-white">HD-Video herunterladen</strong> oder <strong class="text-white">MP3 herunterladen</strong>',
    guidesTitle: "Anleitungen & Tipps",
    guidesSubtitle: "Erfahren Sie, wie Sie TikTok-Clips auf jedem Gerät ohne Wasserzeichen speichern",
    guide1Title: "TikTok auf dem iPhone",
    guide1Desc: "TikTok-Videos ohne Logo direkt in die iPhone-Fotomediathek über Safari speichern.",
    guide2Title: "TikTok auf Android",
    guide2Desc: "Anleitung zum Speichern von Full-HD-Clips in der Galerie von Samsung, Xiaomi und Oppo.",
    guide3Title: "MP3-Ton extrahieren",
    guide3Desc: "Hintergrundmusik und Sounds aus TikTok für Klingeltöne oder Videoschnitt extrahieren.",
    readMore: "Anleitung lesen →",
    faqTitle: "Häufig gestellte Fragen",
    faq1Q: "Ist das Herunterladen von TikTok-Videos kostenlos?",
    faq1A: "Ja, 100% kostenlos mit unbegrenzten Downloads und ohne Registrierung.",
    faq2Q: "Wird Douyin (chinesisches TikTok) unterstützt?",
    faq2A: "Ja! TikSnap unterstützt sowohl internationales TikTok als auch chinesisches Douyin.",
    faq3Q: "Sind die Videos wirklich ohne Wasserzeichen?",
    faq3A: "Ja, wir rufen den sauberen Originalvideostream direkt von ByteDance-Servern ab.",
    faq4Q: "Speichert TikSnap meine heruntergeladenen Videos?",
    faq4A: "Nein. TikSnap speichert keine Videos. Alle Downloads laufen direkt auf Ihr Gerät.",
    footerPrivacy: "Datenschutzerklärung",
    footerTerms: "Nutzungsbedingungen",
    footerDmca: "DMCA",
    footerDisclaimer: "© 2026 TikSnap · tiksnap.space · Nicht verbunden mit ByteDance, TikTok oder Douyin.",
    errEmpty: "Bitte fügen Sie oben einen TikTok- oder Douyin-Link ein.",
    errInvalid: "Ungültiges Linkformat. Bitte kopieren Sie eine gültige URL.",
    errServer: "Verbindungsfehler. Bitte überprüfen Sie Ihr Netzwerk und versuchen Sie es erneut.",
    errGeneral: "Dieses Video kann nicht verarbeitet werden. Bitte stellen Sie sicher, dass es öffentlich ist."
  },
  ja: {
    navHowTo: "使い方",
    navGuides: "ガイド",
    navFaq: "よくある質問",
    heroBadge: "完全無料 · 透かしなし · 無制限",
    heroTitle: "TikTok動画保存",
    heroTitleHighlight: "透かしなし・無料",
    heroSubtitle: "TikTok & Douyin対応、オリジナルHD高画質、登録不要、アプリ不要。",
    inputPlaceholder: "TikTokまたはDouyinのリンクをここに貼り付け...",
    btnDownload: "⬇ ダウンロード",
    btnProcessing: "処理中...",
    adLabel: "広告 / スポンサー",
    adTopNotice: "📢 バナー広告枠・スポンサー募集中 · お問い合わせ: ",
    adResultNotice: "🌟 スポンサー広告枠 · 連絡先 ndtoanst2@gmail.com",
    adBottomNotice: "📢 パートナー広告 · バナー掲載: ",
    adSideNotice: "サイドバナー 160×600",
    btnNoWM: "HD動画ダウンロード（ロゴなし）",
    btnMP3: "MP3音声をダウンロード（原音質）",
    directDisclaimer: "動画はTikTok/DouyinのCDNから直接ダウンロードされます。TikSnapは動画を保存しません。",
    badgeClean: "100% 透かしなし · 直接ダウンロード",
    tryAgain: "← 別の動画をダウンロード",
    modalTitle: "ダウンロードリンクを準備中...",
    modalWait: "元のサーバーに直接接続しています。少々お待ちください",
    modalCounting: "リンク準備完了まであと:",
    modalAdHeading: "スポンサー広告エリア",
    modalAdText: "ダウンロード直前の高注目度バナースペース",
    modalBtnDownload: "⬇ ここをクリックしてファイルを保存",
    howToTitle: "TikTok動画をロゴなしで保存する方法",
    step1Title: "ステップ 1",
    step1Desc: 'TikTokを開き、<strong class="text-white">共有</strong> → <strong class="text-white">リンクをコピー</strong>をタップ',
    step2Title: "ステップ 2",
    step2Desc: '上の入力ボックスにリンクを貼り付け、<strong class="text-white">ダウンロード</strong>をクリック',
    step3Title: "ステップ 3",
    step3Desc: '<strong class="text-white">HD動画ダウンロード</strong>または<strong class="text-white">MP3ダウンロード</strong>を選択',
    guidesTitle: "ガイド＆便利な使い方",
    guidesSubtitle: "各デバイスでのTikTok動画保存テクニックをご紹介",
    guide1Title: "iPhoneでTikTok保存",
    guide1Desc: "アプリを使わずにSafari経由でiPhoneの写真アプリにロゴなし動画を保存する方法。",
    guide2Title: "AndroidでTikTok保存",
    guide2Desc: "Galaxy、Xiaomi、AQUOSのギャラリーにフルHD動画を安全に直接保存する手順。",
    guide3Title: "MP3音声を抽出",
    guide3Desc: "TikTokのBGMや流行りのサウンドを着信音や動画編集用に高音質で抽出する方法。",
    readMore: "詳しく見る →",
    faqTitle: "よくあるご質問",
    faq1Q: "TikTok動画のダウンロードは無料ですか？",
    faq1A: "はい、回数無制限で完全無料です。会員登録も一切必要ありません。",
    faq2Q: "中国版TikTok（Douyin / 抖音）にも対応していますか？",
    faq2A: "はい！国際版TikTokおよび中国版Douyinの両方に完全対応しています。",
    faq3Q: "本当に透かしロゴは入りませんか？",
    faq3A: "はい。ByteDanceサーバーから直接元のクリーンな動画ストリームを取得します。",
    faq4Q: "TikSnapはユーザーの動画を保存しますか？",
    faq4A: "いいえ。当サイトはお客様の動画を一切サーバーに保存しません。",
    footerPrivacy: "プライバシーポリシー",
    footerTerms: "利用規約",
    footerDmca: "DMCA",
    footerDisclaimer: "© 2026 TikSnap · tiksnap.space · ByteDance、TikTok、Douyinとは提携していません。",
    errEmpty: "上の入力欄にTikTokまたはDouyinのリンクを貼り付けてください。",
    errInvalid: "無効なURL形式です。正しいTikTokリンクをコピーしてください。",
    errServer: "サーバー接続エラーです。通信状態を確認して再試行してください。",
    errGeneral: "この動画を処理できませんでした。動画が公開設定になっているか確認してください。"
  },
  ko: {
    navHowTo: "이용 방법",
    navGuides: "가이드",
    navFaq: "FAQ",
    heroBadge: "무료 · 워터마크 없음 · 무제한",
    heroTitle: "틱톡 동영상 다운로드",
    heroTitleHighlight: "워터마크 없음, 무료",
    heroSubtitle: "틱톡 및 Douyin 지원, 원본 HD 화질, 회원가입 없음, 앱 설치 불필요.",
    inputPlaceholder: "틱톡 또는 Douyin 링크를 여기에 붙여넣기...",
    btnDownload: "⬇ 다운로드",
    btnProcessing: "처리 중...",
    adLabel: "광고 / 스폰서",
    adTopNotice: "📢 배너 광고 및 스폰서 제휴 문의: ",
    adResultNotice: "🌟 스폰서 광고 공간 · 문의: ndtoanst2@gmail.com",
    adBottomNotice: "📢 파트너 광고 · 배너 제휴: ",
    adSideNotice: "사이드 배너 160×600",
    btnNoWM: "HD 동영상 다운로드 (워터마크 없음)",
    btnMP3: "MP3 음원 다운로드 (원본 사운드)",
    directDisclaimer: "동영상은 틱톡/Douyin 서버에서 직접 전송되며 TikSnap은 파일을 저장하지 않습니다.",
    badgeClean: "100% 워터마크 없음 · 직접 다운로드",
    tryAgain: "← 다른 동영상 다운로드",
    modalTitle: "다운로드 링크 준비 중...",
    modalWait: "원본 서버에 직접 연결 중입니다. 잠시만 기다려주세요",
    modalCounting: "링크 준비 완료까지:",
    modalAdHeading: "스폰서 파트너 광고",
    modalAdText: "다운로드 직전 가장 주목도 높은 배너 영역",
    modalBtnDownload: "⬇ 여기를 클릭하여 파일 받기",
    howToTitle: "워터마크 없이 틱톡 동영상 저장하는 법",
    step1Title: "1단계",
    step1Desc: '틱톡에서 <strong class="text-white">공유</strong> → <strong class="text-white">링크 복사</strong> 클릭',
    step2Title: "2단계",
    step2Desc: '상단 입력창에 링크를 붙여넣고 <strong class="text-white">다운로드</strong> 클릭',
    step3Title: "3단계",
    step3Desc: '<strong class="text-white">HD 동영상 다운로드</strong> 또는 <strong class="text-white">MP3 다운로드</strong> 선택',
    guidesTitle: "가이드 및 활용 팁",
    guidesSubtitle: "다양한 기기에서 워터마크 없이 틱톡 영상을 다운로드하는 팁",
    guide1Title: "아이폰에서 틱톡 저장",
    guide1Desc: "별도 앱 없이 사파리 브라우저로 아이폰 사진 보관함에 깔끔하게 저장하는 법.",
    guide2Title: "안드로이드에서 틱톡 저장",
    guide2Desc: "갤럭시, 샤오미 갤러리에 원본 풀HD 화질로 안전하게 동영상을 저장하는 방법.",
    guide3Title: "MP3 음원 추출",
    guide3Desc: "틱톡 배경음악 및 사운드를 벨소리나 영상 편집용 고음질 MP3로 추출하기.",
    readMore: "가이드 읽기 →",
    faqTitle: "자주 묻는 질문",
    faq1Q: "틱톡 동영상 다운로드는 무료인가요?",
    faq1A: "네, 무제한 다운로드가 100% 무료이며 회원가입도 필요하지 않습니다.",
    faq2Q: "중국판 틱톡(Douyin)도 지원하나요?",
    faq2A: "네! TikSnap은 글로벌 틱톡과 중국 Douyin을 완벽하게 지원합니다.",
    faq3Q: "다운로드한 영상에 정말 로고가 없나요?",
    faq3A: "네. 바이트댄스 서버에서 직접 원본 클린 비디오 스트림을 가져옵니다.",
    faq4Q: "TikSnap에 영상이 저장되나요?",
    faq4A: "아니요. TikSnap은 어떠한 영상도 저장하지 않습니다.",
    footerPrivacy: "개인정보처리방침",
    footerTerms: "이용약관",
    footerDmca: "DMCA",
    footerDisclaimer: "© 2026 TikSnap · tiksnap.space · ByteDance, TikTok, Douyin과 제휴되지 않았습니다.",
    errEmpty: "상단 입력창에 틱톡 또는 Douyin 링크를 붙여넣으세요.",
    errInvalid: "유효하지 않은 링크 형식입니다. 올바른 URL을 복사해주세요.",
    errServer: "서버 연결 오류입니다. 네트워크 상태를 확인하고 다시 시도하세요.",
    errGeneral: "이 동영상을 처리할 수 없습니다. 동영상이 공개 상태인지 확인하세요."
  },
  ru: {
    navHowTo: "Инструкция",
    navGuides: "Гайды",
    navFaq: "ЧаВо",
    heroBadge: "Бесплатно · Без водяного знака · Безлимитно",
    heroTitle: "Скачать видео с Тик Ток",
    heroTitleHighlight: "Без водяного знака, бесплатно",
    heroSubtitle: "Поддержка TikTok и Douyin, оригинальное HD качество, без регистрации.",
    inputPlaceholder: "Вставьте ссылку на TikTok или Douyin сюда...",
    btnDownload: "⬇ Скачать",
    btnProcessing: "Обработка...",
    adLabel: "РЕКЛАМА / СПОНСОР",
    adTopNotice: "📢 Свободное место для баннерной рекламы · Контакты: ",
    adResultNotice: "🌟 Спонсорское место · Контакт: ndtoanst2@gmail.com",
    adBottomNotice: "📢 Реклама партнеров · Спонсорство баннеров: ",
    adSideNotice: "Боковой баннер 160×600",
    btnNoWM: "Скачать HD видео (Без водяного знака)",
    btnMP3: "Скачать аудио MP3 (Оригинальный звук)",
    directDisclaimer: "Видео загружаются напрямую с серверов TikTok — TikSnap ничего не хранит.",
    badgeClean: "100% Без Водяных Знаков · Прямое Скачивание",
    tryAgain: "← Скачать другое видео",
    modalTitle: "Подготовка ссылки на скачивание...",
    modalWait: "Прямое подключение к серверам источника, пожалуйста подождите",
    modalCounting: "Ссылка будет готова через:",
    modalAdHeading: "Спонсорская Реклама",
    modalAdText: "Зона максимального внимания перед загрузкой файла",
    modalBtnDownload: "⬇ Нажмите здесь, чтобы Получить Файл",
    howToTitle: "Как скачать видео из Тик Ток без водяного знака",
    step1Title: "Шаг 1",
    step1Desc: 'Откройте Тик Ток, нажмите <strong class="text-white">Поделиться</strong> → <strong class="text-white">Копировать ссылку</strong>',
    step2Title: "Шаг 2",
    step2Desc: 'Вставьте ссылку в поле поиска выше и нажмите <strong class="text-white">Скачать</strong>',
    step3Title: "Шаг 3",
    step3Desc: 'Выберите <strong class="text-white">Скачать HD видео</strong> или <strong class="text-white">Скачать MP3</strong>',
    guidesTitle: "Инструкции и Советы",
    guidesSubtitle: "Полезные руководства по скачиванию видео из TikTok на любые устройства",
    guide1Title: "TikTok на iPhone",
    guide1Desc: "Как сохранять видео из TikTok без водяного знака прямо в галерею iPhone через Safari.",
    guide2Title: "TikTok на Android",
    guide2Desc: "Инструкция по сохранению Full HD роликов в галерею Samsung, Xiaomi и других Android без вирусов.",
    guide3Title: "Извлечь MP3 трек",
    guide3Desc: "Как извлечь фоновую музыку из видео TikTok в высоком качестве для рингтона или монтажа.",
    readMore: "Читать руководство →",
    faqTitle: "Часто Задаваемые Вопросы",
    faq1Q: "Скачивание видео из TikTok бесплатное?",
    faq1A: "Да, абсолютно бесплатно и без ограничений по количеству скачиваний.",
    faq2Q: "Поддерживается ли Douyin (китайский TikTok)?",
    faq2A: "Да! TikSnap полностью поддерживает как международный TikTok, так и китайский Douyin.",
    faq3Q: "Видео действительно скачивается без водяного знака?",
    faq3A: "Да. Мы запрашиваем исходный чистый видеопоток напрямую с серверов ByteDance.",
    faq4Q: "Сохраняет ли TikSnap мои видео?",
    faq4A: "Нет. TikSnap не хранит видео. Все файлы скачиваются напрямую на ваше устройство.",
    footerPrivacy: "Политика конфиденциальности",
    footerTerms: "Условия обслуживания",
    footerDmca: "DMCA",
    footerDisclaimer: "© 2026 TikSnap · tiksnap.space · Не связано с ByteDance, TikTok или Douyin.",
    errEmpty: "Пожалуйста, вставьте ссылку на TikTok или Douyin в поле выше.",
    errInvalid: "Неверный формат ссылки. Скопируйте правильный адрес видео.",
    errServer: "Ошибка подключения. Проверьте интернет и повторите попытку.",
    errGeneral: "Не удалось обработать видео. Убедитесь, что оно общедоступно."
  },
  ar: {
    navHowTo: "طريقة الاستخدام",
    navGuides: "الدليل",
    navFaq: "الأسئلة الشائعة",
    heroBadge: "مجاني · بدون علامة مائية · غير محدود",
    heroTitle: "تحميل فيديوهات تيك توك",
    heroTitleHighlight: "بدون علامة مائية، مجاناً",
    heroSubtitle: "يدعم تيك توك و Douyin، بجودة HD الأصلية، بدون تسجيل، بدون تطبيقات.",
    inputPlaceholder: "الصق رابط تيك توك أو Douyin هنا...",
    btnDownload: "⬇ تحميل",
    btnProcessing: "جاري المعالجة...",
    adLabel: "إعلان / برعاية",
    adTopNotice: "📢 مساحة إعلانية متاحة للرعاة · تواصل معنا: ",
    adResultNotice: "🌟 مساحة إعلانية برعاية · ndtoanst2@gmail.com",
    adBottomNotice: "📢 إعلان الشركاء · رعاية البانر: ",
    adSideNotice: "بانر جانبي 160×600",
    btnNoWM: "تحميل فيديو HD (بدون علامة مائية)",
    btnMP3: "تحميل صوت MP3 (الصوت الأصلي)",
    directDisclaimer: "يتم تنزيل الفيديوهات مباشرة من خوادم تيك توك — TikSnap لا يخزن أي ملفات.",
    badgeClean: "100% بدون علامة مائية · تحميل مباشر",
    tryAgain: "← تحميل فيديو آخر",
    modalTitle: "جاري تجهيز رابط التنزيل...",
    modalWait: "الاتصال المباشر بالخوادم الأصلية، يُرجى الانتظار لحظات",
    modalCounting: "الرابط سيكون جاهزاً خلال:",
    modalAdHeading: "مساحة إعلانية برعاية",
    modalAdText: "أعلى منطقة تفاعل قبل تنزيل الملف",
    modalBtnDownload: "⬇ انقر هنا للحصول على الملف الآن",
    howToTitle: "كيفية تحميل فيديو تيك توك بدون علامة مائية",
    step1Title: "الخطوة 1",
    step1Desc: 'افتح تيك توك، اضغط على <strong class="text-white">مشاركة</strong> ← <strong class="text-white">نسخ الرابط</strong>',
    step2Title: "الخطوة 2",
    step2Desc: 'الصق الرابط في مربع البحث أعلاه واضغط على <strong class="text-white">تحميل</strong>',
    step3Title: "الخطوة 3",
    step3Desc: 'اختر <strong class="text-white">تحميل فيديو HD</strong> أو <strong class="text-white">تحميل MP3</strong>',
    guidesTitle: "أدلة وشروحات",
    guidesSubtitle: "استكشف أدلة مفيدة لتنزيل مقاطع تيك توك على جميع أجهزتك",
    guide1Title: "تيك توك على آيفون",
    guide1Desc: "طريقة حفظ فيديوهات تيك توك بدون علامة مائية مباشرة في ألبوم صور آيفون عبر سفاري.",
    guide2Title: "تيك توك على أندرويد",
    guide2Desc: "شرح حفظ المقاطع بدقة Full HD في استوديو سامسونج وشاومي بأمان تام.",
    guide3Title: "استخراج صوت MP3",
    guide3Desc: "طريقة استخراج الموسيقى والصوت من تيك توك لاستخدامها كنغمات أو في المونتاج.",
    readMore: "قراءة الدليل ←",
    faqTitle: "الأسئلة الأكثر تكراراً",
    faq1Q: "هل تنزيل الفيديوهات مجاني؟",
    faq1A: "نعم، مجاني 100% بدون حدود لعدد التنزيلات وبدون الحاجة لإنشاء حساب.",
    faq2Q: "هل يدعم التطبيق الصيني Douyin؟",
    faq2A: "نعم! يدعم TikSnap كلاً من تيك توك العالمي و Douyin الصيني بالكامل.",
    faq3Q: "هل الفيديوهات المنزلة بدون علامة مائية فعلاً؟",
    faq3A: "نعم، نحصل على تدفق الفيديو الأصلي النظيف مباشرة من خوادم ByteDance.",
    faq4Q: "هل يقوم TikSnap بتخزين فيديوهاتي؟",
    faq4A: "لا، الموقع لا يستضيف ولا يخزن أي فيديوهات على خوادمه.",
    footerPrivacy: "سياسة الخصوصية",
    footerTerms: "شروط الخدمة",
    footerDmca: "DMCA",
    footerDisclaimer: "© 2026 TikSnap · tiksnap.space · غير تابع لشركة ByteDance أو TikTok.",
    errEmpty: "يُرجى لصق رابط تيك توك أو Douyin في المربع أعلاه.",
    errInvalid: "صيغة الرابط غير صحيحة. يُرجى نسخ رابط تيك توك سليم.",
    errServer: "خطأ في الاتصال بالخادم. يُرجى التحقق من الشبكة وإعادة المحاولة.",
    errGeneral: "تعذر معالجة هذا الفيديو. يُرجى التأكد من أن الفيديو عام."
  },
  th: {
    navHowTo: "วิธีใช้งาน",
    navGuides: "คู่มือ",
    navFaq: "คำถามพบบ่อย",
    heroBadge: "ฟรี · ไม่มีลายน้ำ · ไม่จำกัด",
    heroTitle: "ดาวน์โหลดวิดีโอ TikTok",
    heroTitleHighlight: "ไม่มีลายน้ำ ฟรี",
    heroSubtitle: "รองรับทั้ง TikTok และ Douyin คุณภาพ HD ดั้งเดิม ไม่ต้องลงทะเบียน ไม่ต้องโหลดแอป",
    inputPlaceholder: "วางลิงก์ TikTok หรือ Douyin ที่นี่...",
    btnDownload: "⬇ ดาวน์โหลด",
    btnProcessing: "กำลังประมวลผล...",
    adLabel: "โฆษณา / สปอนเซอร์",
    adTopNotice: "📢 พื้นที่แบนเนอร์โฆษณาสำหรับผู้สนับสนุน · ติดต่อ: ",
    adResultNotice: "🌟 พื้นที่โฆษณาสปอนเซอร์ · ติดต่อ ndtoanst2@gmail.com",
    adBottomNotice: "📢 โฆษณาพาร์ทเนอร์ · สปอนเซอร์แบนเนอร์: ",
    adSideNotice: "แบนเนอร์ข้าง 160×600",
    btnNoWM: "ดาวน์โหลดวิดีโอ HD (ไม่มีลายน้ำ)",
    btnMP3: "ดาวน์โหลดเสียง MP3 (เสียงต้นฉบับ)",
    directDisclaimer: "วิดีโอถูกดาวน์โหลดโดยตรงจากเซิร์ฟเวอร์ TikTok — TikSnap ไม่จัดเก็บข้อมูลใดๆ",
    badgeClean: "ไม่มีลายน้ำ 100% · ดาวน์โหลดโดยตรง",
    tryAgain: "← ดาวน์โหลดวิดีโออื่น",
    modalTitle: "กำลังเตรียมลิงก์ดาวน์โหลด...",
    modalWait: "กำลังเชื่อมต่อโดยตรงกับเซิร์ฟเวอร์ต้นฉบับ โปรดรอสักครู่",
    modalCounting: "ลิงก์จะพร้อมใช้งานใน:",
    modalAdHeading: "พื้นที่แบนเนอร์สปอนเซอร์",
    modalAdText: "ตำแหน่งที่ได้รับความสนใจสูงสุดก่อนดาวน์โหลดไฟล์",
    modalBtnDownload: "⬇ คลิกที่นี่เพื่อรับไฟล์ทันที",
    howToTitle: "วิธีดาวน์โหลดวิดีโอ TikTok แบบไม่มีลายน้ำ",
    step1Title: "ขั้นตอนที่ 1",
    step1Desc: 'เปิด TikTok แตะที่ <strong class="text-white">แชร์</strong> → <strong class="text-white">คัดลอกลิงก์</strong>',
    step2Title: "ขั้นตอนที่ 2",
    step2Desc: 'วางลิงก์ลงในช่องค้นหาด้านบน แล้วกดปุ่ม <strong class="text-white">ดาวน์โหลด</strong>',
    step3Title: "ขั้นตอนที่ 3",
    step3Desc: 'เลือก <strong class="text-white">ดาวน์โหลดวิดีโอ HD</strong> หรือ <strong class="text-white">ดาวน์โหลด MP3</strong>',
    guidesTitle: "คู่มือและเคล็ดลับ",
    guidesSubtitle: "เทคนิคการบันทึกวิดีโอ TikTok สำหรับสมาร์ทโฟนและคอมพิวเตอร์",
    guide1Title: "TikTok บน iPhone",
    guide1Desc: "วิธีบันทึกวิดีโอ TikTok ลงอัลบั้มรูปบน iPhone ผ่าน Safari โดยไม่ต้องติดตั้งแอปเพิ่ม",
    guide2Title: "TikTok บน Android",
    guide2Desc: "วิธีบันทึกคลิป Full HD ลงแกลเลอรีบน Samsung, Xiaomi, Oppo อย่างปลอดภัย",
    guide3Title: "แยกเสียงเพลง MP3",
    guide3Desc: "วิธีดึงเสียงเพลงประกอบจาก TikTok เพื่อนำไปทำเสียงเรียกเข้าหรือตัดต่อคลิป",
    readMore: "อ่านคู่มือ →",
    faqTitle: "คำถามที่พบบ่อย",
    faq1Q: "ดาวน์โหลดวิดีโอ TikTok ฟรีหรือไม่?",
    faq1A: "ฟรี 100% ไม่จำกัดจำนวนครั้ง และไม่ต้องสมัครสมาชิก",
    faq2Q: "รองรับ Douyin (TikTok เวอร์ชันจีน) หรือไม่?",
    faq2A: "รองรับอย่างสมบูรณ์แบบ ทั้ง TikTok สากลและ Douyin จีน",
    faq3Q: "วิดีโอที่โหลดไม่มีลายน้ำจริงไหม?",
    faq3A: "จริง เราดึงไฟล์วิดีโอต้นฉบับที่คมชัดตรงจากเซิร์ฟเวอร์ ByteDance",
    faq4Q: "TikSnap บันทึกวิดีโอของฉันไว้หรือไม่?",
    faq4A: "ไม่ TikSnap ไม่จัดเก็บวิดีโอใดๆ ไฟล์จะถูกส่งตรงไปยังเครื่องของคุณ",
    footerPrivacy: "นโยบายความเป็นส่วนตัว",
    footerTerms: "ข้อกำหนดการใช้งาน",
    footerDmca: "DMCA",
    footerDisclaimer: "© 2026 TikSnap · tiksnap.space · ไม่มีความเกี่ยวข้องกับ ByteDance หรือ TikTok",
    errEmpty: "โปรดวางลิงก์ TikTok หรือ Douyin ในช่องด้านบน",
    errInvalid: "รูปแบบลิงก์ไม่ถูกต้อง โปรดคัดลอก URL ของ TikTok ที่ถูกต้อง",
    errServer: "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์ โปรดลองใหม่อีกครั้ง",
    errGeneral: "ไม่สามารถประมวลผลวิดีโอนี้ได้ โปรดตรวจสอบว่าเป็นวิดีโอสาธารณะ"
  },
  zh: {
    navHowTo: "使用教程",
    navGuides: "精选攻略",
    navFaq: "常见问题",
    heroBadge: "完全免费 · 无水印 · 无限下载",
    heroTitle: "下载抖音 / TikTok 视频",
    heroTitleHighlight: "超清无水印 · 完全免费",
    heroSubtitle: "全面支持国际版 TikTok 与国内版抖音，原生 HD 画质，无需注册，无需安装软件。",
    inputPlaceholder: "在此粘贴 TikTok 或抖音视频链接...",
    btnDownload: "⬇ 立即下载",
    btnProcessing: "正在解析中...",
    adLabel: "广告 / 赞助合作",
    adTopNotice: "📢 赞助广告位虚位以待 · 商务合作：",
    adResultNotice: "🌟 赞助商广告位 · 合作咨询：ndtoanst2@gmail.com",
    adBottomNotice: "📢 合作伙伴广告 · 广告横幅位：",
    adSideNotice: "侧边横幅广告 160×600",
    btnNoWM: "下载超清视频 (无水印)",
    btnMP3: "提取 MP3 音频 (原声无损)",
    directDisclaimer: "视频直接从 TikTok/抖音官方 CDN 服务器串流下载 — TikSnap 本地不存储任何数据。",
    badgeClean: "100% 无水印 · 官方直链下载",
    tryAgain: "← 解析下载其他视频",
    modalTitle: "正在准备高速下载链接...",
    modalWait: "正在直连官方源服务器，请稍候片刻",
    modalCounting: "下载链接将在倒计时后就绪：",
    modalAdHeading: "赞助商专属展示区",
    modalAdText: "文件下载前最高点击与关注度黄金广告位",
    modalBtnDownload: "⬇ 点击此处立即获取文件",
    howToTitle: "如何下载无水印 TikTok / 抖音视频",
    step1Title: "第 1 步",
    step1Desc: '打开 TikTok 或抖音，点击 <strong class="text-white">分享</strong> → <strong class="text-white">复制链接</strong>',
    step2Title: "第 2 步",
    step2Desc: '将链接粘贴到上方搜索框中，点击 <strong class="text-white">立即下载</strong>',
    step3Title: "第 3 步",
    step3Desc: '选择 <strong class="text-white">下载超清视频</strong> 或 <strong class="text-white">提取 MP3 音频</strong> 保存到本地',
    guidesTitle: "教程与使用技巧",
    guidesSubtitle: "探索适用于各类设备的无水印视频保存技巧",
    guide1Title: "iPhone 保存技巧",
    guide1Desc: "无需下载任何 App，利用 Safari 浏览器直接将无水印视频保存到手机相册中。",
    guide2Title: "Android 保存指南",
    guide2Desc: "指导华为、小米、OPPO 等安卓手机安全将超清视频存入相册。",
    guide3Title: "提取 MP3 伴奏音乐",
    guide3Desc: "如何快速提取 TikTok 热门原声与背景音乐，用作手机铃声或二次剪辑。",
    readMore: "阅读攻略 →",
    faqTitle: "常见问题解答",
    faq1Q: "下载视频是完全免费的吗？",
    faq1A: "是的，100% 永久免费，不限下载次数，无需注册任何账号。",
    faq2Q: "支持中国大陆版抖音（Douyin）吗？",
    faq2A: "完全支持！无论是海外版 TikTok 还是国内版抖音均可秒级解析。",
    faq3Q: "下载的视频真的没有任何水印和 Logo 吗？",
    faq3A: "是的。我们直接从字节跳动 CDN 提取未经叠加水印的纯净视频流。",
    faq4Q: "TikSnap 会保存我下载的视频吗？",
    faq4A: "不会。TikSnap 不存储任何视频文件，所有数据直接串流传输到您的设备。",
    footerPrivacy: "隐私政策",
    footerTerms: "服务条款",
    footerDmca: "DMCA 版权声明",
    footerDisclaimer: "© 2026 TikSnap · tiksnap.space · 与字节跳动、TikTok 或抖音无关。我们不在服务器上存储任何视频。",
    errEmpty: "请在上方输入框中粘贴 TikTok 或抖音视频链接。",
    errInvalid: "链接格式不正确，请复制正确的 TikTok 或抖音分享链接。",
    errServer: "服务器连接异常，请检查网络后重试。",
    errGeneral: "无法解析该视频，请确认视频是否为公开状态并稍后重试。"
  }
};

// ── Render Menu Dropdown ────────────────────────────────────────────────────
function renderLanguageMenu() {
  if (!langMenu) return;

  langMenu.innerHTML = SUPPORTED_LANGUAGES.map((item) => {
    const isActive = item.code === currentLang;
    return `
      <button
        type="button"
        class="lang-item w-full flex items-center justify-between px-3.5 py-2 text-xs text-left text-gray-300 hover:text-white transition-colors ${isActive ? 'active' : ''}"
        data-lang-code="${item.code}"
      >
        <span class="flex items-center gap-2">
          <span class="text-sm">${item.flag}</span>
          <span class="font-medium">${item.label}</span>
        </span>
        ${isActive ? '<span class="text-violet-400 font-bold">✓</span>' : ''}
      </button>
    `;
  }).join("");

  // Gắn sự kiện click cho từng option
  langMenu.querySelectorAll("[data-lang-code]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const code = btn.getAttribute("data-lang-code");
      setLanguage(code);
      closeLanguageMenu();
      trackEvent("change_language", { language: code });
    });
  });
}

function openLanguageMenu() {
  if (!langMenu) return;
  renderLanguageMenu();
  langMenu.classList.remove("hidden");
  if (langArrow) langArrow.classList.add("rotate-180");
  if (langToggle) langToggle.setAttribute("aria-expanded", "true");
}

function closeLanguageMenu() {
  if (!langMenu) return;
  langMenu.classList.add("hidden");
  if (langArrow) langArrow.classList.remove("rotate-180");
  if (langToggle) langToggle.setAttribute("aria-expanded", "false");
}

function toggleLanguageMenu() {
  if (!langMenu) return;
  if (langMenu.classList.contains("hidden")) {
    openLanguageMenu();
  } else {
    closeLanguageMenu();
  }
}

// ── Hàm Áp dụng Ngôn ngữ (Set Language) ──────────────────────────────────────
function setLanguage(lang) {
  currentLang = TRANSLATIONS[lang] ? lang : "en";
  localStorage.setItem("lang", currentLang);

  document.documentElement.lang = currentLang;

  // Cập nhật nhãn trên nút Header
  const activeLangConfig = SUPPORTED_LANGUAGES.find((item) => item.code === currentLang) || SUPPORTED_LANGUAGES[0];
  if (langLabel) {
    langLabel.textContent = activeLangConfig.label;
  }

  const dict = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  // Cập nhật tất cả các phần tử có data-i18n
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (dict[key]) {
      el.innerHTML = dict[key];
    }
  });

  // Cập nhật Placeholder ô tìm kiếm
  if (urlInput) {
    urlInput.placeholder = dict.inputPlaceholder;
  }

  // Cập nhật nút Download nếu đang không loading
  if (!isLoading && btnText) {
    btnText.textContent = dict.btnDownload;
  }

  // Cập nhật đường link chuyên mục Guide theo ngôn ngữ (vi trỏ về tiếng Việt, còn lại trỏ tiếng Anh)
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
  if (saved && TRANSLATIONS[saved]) {
    setLanguage(saved);
  } else {
    // Tự động nhận diện qua ngôn ngữ của trình duyệt
    const browserLang = (navigator.language || navigator.userLanguage || "en").toLowerCase();
    const matched = SUPPORTED_LANGUAGES.find((item) => browserLang.startsWith(item.code));
    setLanguage(matched ? matched.code : "en");
  }
}

// ── Dark / Light Mode ────────────────────────────────────────────────────────
function updateThemeIcons() {
  const isLight = document.documentElement.classList.contains("light");
  if (iconSun && iconMoon) {
    iconSun.classList.toggle("hidden", isLight);
    iconMoon.classList.toggle("hidden", !isLight);
  }
}

// ── Analytics & Event Tracking Helper (GA4 + Internal Stats) ────────────────
function trackEvent(eventName, params = {}) {
  try {
    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, params);
      console.log(`[GA4 Event] ${eventName}`, params);
    }
  } catch (err) {
    console.warn("[Analytics]", err);
  }
}

function notifyDownloadPing(type) {
  try {
    const payload = JSON.stringify({ type, timestamp: Date.now() });
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/stats/track-download", payload);
    } else {
      fetch("/api/stats/track-download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    }
  } catch (_) {}
}

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    document.documentElement.classList.toggle("light");
    const isLight = document.documentElement.classList.contains("light");
    localStorage.setItem("theme", isLight ? "light" : "dark");
    updateThemeIcons();
    trackEvent("toggle_theme", { theme: isLight ? "light" : "dark" });
  });
  updateThemeIcons();
}

// ── Kích hoạt Tải File Trực Tiếp Về Máy (Không Mở Tab Mới) ───────────────────
let isDownloadingFile = false;

async function triggerDirectFileDownload(url, filename) {
  if (!url || url === "#" || isDownloadingFile) return;
  isDownloadingFile = true;

  const dlType = filename.includes(".mp3") ? "audio_mp3" : "video_hd";
  trackEvent("download_started", {
    event_category: "Conversion",
    download_type: dlType,
    filename,
    language: currentLang,
  });
  notifyDownloadPing(dlType);

  if (modalBtnText) {
    modalBtnText.innerHTML = `<span class="spinner"></span> <span>${currentLang === "vi" ? "Đang lưu file về máy..." : "Saving file to device..."}</span>`;
  }
  if (modalDownloadBtn) {
    modalDownloadBtn.classList.add("pointer-events-none", "opacity-80");
  }

  // Cách 1: Tải trực tiếp bằng Blob (Trình duyệt tự lưu vào thư mục Downloads)
  try {
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) throw new Error("CDN response not ok: " + res.status);
    const blob = await res.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.style.display = "none";
    a.href = blobUrl;
    a.download = filename || "tiktok-video.mp4";
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);
      if (modalBtnText) modalBtnText.textContent = currentLang === "vi" ? "✓ Đã tải file xong!" : "✓ Download complete!";
      setTimeout(() => {
        closeDownloadModal();
        isDownloadingFile = false;
      }, 1200);
    }, 500);
    return;
  } catch (err) {
    console.warn("[Direct Download] Blob fetch thất bại, chuyển hướng qua Proxy tải về:", err);
  }

  // Cách 2: Tải thông qua máy chủ Proxy với Content-Disposition: attachment
  // Dùng hidden iframe để trình duyệt tự kích hoạt tải file mà TUYỆT ĐỐI KHÔNG mở tab mới
  try {
    const proxyUrl = `/proxy?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`;
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = proxyUrl;
    document.body.appendChild(iframe);

    if (modalBtnText) modalBtnText.textContent = currentLang === "vi" ? "✓ Đang tải file về..." : "✓ Downloading file...";
    setTimeout(() => {
      document.body.removeChild(iframe);
      closeDownloadModal();
      isDownloadingFile = false;
    }, 4000);
  } catch (errProxy) {
    console.error("[Download Error]", errProxy);
    window.location.href = `/proxy?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`;
    isDownloadingFile = false;
  } finally {
    if (modalDownloadBtn) {
      modalDownloadBtn.classList.remove("pointer-events-none", "opacity-80");
    }
  }
}

// ── Download Countdown Modal Logic ──────────────────────────────────────────
function startDownloadCountdown(url, filename) {
  if (!url || url === "#") return;

  pendingDownloadUrl = url;
  pendingDownloadFilename = filename || "tiktok-video.mp4";
  isDownloadingFile = false;

  const dict = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  if (!downloadModal) {
    triggerDirectFileDownload(url, filename);
    return;
  }

  // Reset modal state
  let timeLeft = 3;
  if (countdownNumber) {
    countdownNumber.textContent = `${timeLeft}s`;
    countdownNumber.className = "text-base font-extrabold text-violet-400 bg-violet-500/10 border border-violet-500/30 px-3 py-0.5 rounded-full";
  }

  if (modalDownloadBtn) {
    modalDownloadBtn.classList.add("opacity-50", "pointer-events-none");
    modalDownloadBtn.classList.remove("cursor-pointer", "shadow-xl", "shadow-violet-500/25");
  }
  if (modalBtnText) {
    modalBtnText.textContent = dict.modalWait || (currentLang === "vi" ? "Đang kết nối..." : "Connecting...");
  }

  downloadModal.classList.remove("hidden");

  if (countdownTimer) clearInterval(countdownTimer);

  countdownTimer = setInterval(() => {
    timeLeft--;
    if (timeLeft > 0) {
      if (countdownNumber) countdownNumber.textContent = `${timeLeft}s`;
    } else {
      clearInterval(countdownTimer);
      if (countdownNumber) {
        countdownNumber.textContent = "✓ Sẵn sàng";
        countdownNumber.className = "text-xs font-bold text-green-400 bg-green-500/15 border border-green-500/30 px-2.5 py-0.5 rounded-full";
      }

      if (modalDownloadBtn) {
        modalDownloadBtn.classList.remove("opacity-50", "pointer-events-none");
        modalDownloadBtn.classList.add("cursor-pointer", "shadow-xl", "shadow-violet-500/25");
      }
      if (modalBtnText) {
        modalBtnText.textContent = dict.modalBtnDownload || (currentLang === "vi" ? "⬇ Bấm vào đây để Nhận file ngay" : "⬇ Click here to Get Your File");
      }

      // Đã sẵn sàng: Chờ khách bấm vào nút mới tải file về máy
    }
  }, 1000);
}

function closeDownloadModal() {
  if (countdownTimer) clearInterval(countdownTimer);
  if (downloadModal) downloadModal.classList.add("hidden");
  if (modalDownloadBtn) {
    modalDownloadBtn.classList.remove("shadow-xl", "shadow-violet-500/25");
  }
  isDownloadingFile = false;
}

if (modalCloseBtn) {
  modalCloseBtn.addEventListener("click", closeDownloadModal);
}

if (modalDownloadBtn) {
  modalDownloadBtn.addEventListener("click", () => {
    triggerDirectFileDownload(pendingDownloadUrl, pendingDownloadFilename);
  });
}

if (downloadModal) {
  downloadModal.addEventListener("click", (e) => {
    if (e.target === downloadModal) {
      closeDownloadModal();
    }
  });
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

function setLoading(state) {
  isLoading = state;
  const dict = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  if (state) {
    downloadBtn.disabled = true;
    btnText.innerHTML = `<span class="spinner"></span> <span>${dict.btnProcessing}</span>`;
  } else {
    downloadBtn.disabled = false;
    btnText.innerHTML = dict.btnDownload;
  }
}

// ── Hiển thị kết quả ─────────────────────────────────────────────────────────
// ── Hiển thị kết quả ─────────────────────────────────────────────────────────
function showResult(data) {
  if (thumbnail) {
    thumbnail.style.display = "block";
    thumbnail.src = data.thumbnail || "/assets/og-image.png";
  }
  if (videoTitle) videoTitle.textContent = data.title || "Video TikTok";

  if (data.musicTitle) {
    musicTitle.textContent = data.musicTitle;
    musicInfo.classList.remove("hidden");
  } else {
    musicInfo.classList.add("hidden");
  }

  // Nút Video HD trực tiếp
  if (data.noWatermark) {
    btnNoWM.dataset.downloadUrl = data.noWatermark;
    btnNoWM.dataset.downloadFilename = "tiktok-video-hd.mp4";
    btnNoWM.classList.remove("hidden");
  } else {
    btnNoWM.classList.add("hidden");
  }

  // Nút MP3 trực tiếp
  if (data.music) {
    btnMP3.dataset.downloadUrl = data.music;
    btnMP3.dataset.downloadFilename = "tiktok-audio.mp3";
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
  if (thumbnail) thumbnail.src = "";
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

  const dict = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  const url = urlInput.value.trim();
  hideError();
  resultSection.classList.add("hidden");

  if (!url) {
    trackEvent("analyze_error", {
      error_type: "empty_input",
      language: currentLang,
    });
    showError(dict.errEmpty);
    urlInput.focus();
    return;
  }
  if (!looksLikeTikTokUrl(url)) {
    trackEvent("analyze_error", {
      error_type: "invalid_url_format",
      language: currentLang,
    });
    showError(dict.errInvalid);
    urlInput.focus();
    return;
  }

  const isDouyin = url.includes("douyin.com") || url.includes("iesdouyin.com");
  const platform = isDouyin ? "douyin" : "tiktok";

  trackEvent("analyze_submit", {
    platform,
    language: currentLang,
  });

  const parseStartTime = performance.now();
  setLoading(true);

  try {
    const response = await fetch("/api/download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    const data = await response.json();
    const durationMs = Math.round(performance.now() - parseStartTime);

    if (!response.ok || !data.success) {
      trackEvent("analyze_error", {
        error_type: "api_failure",
        error_message: data.error || dict.errGeneral,
        status_code: response.status,
        duration_ms: durationMs,
        platform,
        language: currentLang,
      });
      showError(data.error || dict.errGeneral);
      return;
    }

    // ⭐ SỰ KIỆN QUAN TRỌNG NHẤT (Key Event / Conversion)
    trackEvent("analyze_success", {
      event_category: "Conversion",
      title: (data.title || "").slice(0, 80),
      has_video: !!data.noWatermark,
      has_audio: !!data.music,
      duration_ms: durationMs,
      platform,
      language: currentLang,
    });

    showResult(data);
  } catch (err) {
    console.error(err);
    trackEvent("analyze_error", {
      error_type: "network_error",
      error_message: err.message,
      language: currentLang,
    });
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

// Bắt sự kiện click nút Tải Video HD và MP3 để kích hoạt Modal chuẩn bị link
if (btnNoWM) {
  btnNoWM.addEventListener("click", (e) => {
    e.preventDefault();
    trackEvent("download_click", {
      download_type: "video_hd",
      language: currentLang,
    });
    const url = btnNoWM.dataset.downloadUrl || btnNoWM.href;
    startDownloadCountdown(url, "tiktok-hd-nowatermark.mp4");
  });
}

if (btnMP3) {
  btnMP3.addEventListener("click", (e) => {
    e.preventDefault();
    trackEvent("download_click", {
      download_type: "audio_mp3",
      language: currentLang,
    });
    const url = btnMP3.dataset.downloadUrl || btnMP3.href;
    startDownloadCountdown(url, "tiktok-audio.mp3");
  });
}

// Dropdown Language Switcher
if (langToggle) {
  langToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleLanguageMenu();
  });
}

document.addEventListener("click", (e) => {
  if (langDropdownContainer && !langDropdownContainer.contains(e.target)) {
    closeLanguageMenu();
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeLanguageMenu();
    closeDownloadModal();
  }
});

// Khởi chạy hệ thống ngôn ngữ
initLanguage();