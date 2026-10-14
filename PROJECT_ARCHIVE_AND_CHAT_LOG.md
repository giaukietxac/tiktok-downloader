# 📚 TÀI LIỆU TOÀN DIỆN DỰ ÁN TRATUILOC (TIKTOK DOWNLOADER)
*(Được trích xuất và đóng gói đầy đủ từ toàn bộ phiên làm việc)*

---

## 1. TỔNG QUAN & CÁC TÀI KHOẢN / ĐƯỜNG LINK ĐÃ TẠO

| Hạng mục | Thông tin chi tiết |
| :--- | :--- |
| **Tên dự án** | **TraTuiLoc** (Website tải video TikTok / Douyin không watermark) |
| **Tên miền chính** | [https://tratuiloc.xyz](https://tratuiloc.xyz) & [https://www.tratuiloc.xyz](https://www.tratuiloc.xyz) |
| **Nhà cung cấp tên miền** | **Mắt Bão** (`id.matbao.net`) |
| **Bản ghi DNS tại Mắt Bão** | • `@` (A) ➔ `216.24.57.1`<br>• `www` (CNAME) ➔ `tratuiloc-app.onrender.com.` |
| **Máy chủ Cloud (Hosting)** | **Render.com** (Vị trí: Singapore - Free Tier Node.js Web Service) |
| **URL máy chủ Render** | [https://tratuiloc-app.onrender.com](https://tratuiloc-app.onrender.com) |
| **Render Service ID** | `srv-db7k0grbc2fs73fg4kig` |
| **Kho mã nguồn (GitHub)** | [https://github.com/giaukietxac/tiktok-downloader](https://github.com/giaukietxac/tiktok-downloader) |
| **Email tiếp nhận DMCA/AdSense** | `ndtoanst2@gmail.com` |

---

## 2. PHÂN TÍCH CHUYÊN SÂU & BÀI HỌC KINH DOANH (TỪ SNAPTIK)

### A. Mô hình kiếm tiền (Monetization)
1. **Google AdSense (Mỏ vàng chính)**:
   - SnapTik kiếm tiền chủ yếu từ **Google Vignette Ads** (quảng cáo toàn màn hình khi người dùng bấm nút tải). Các quảng cáo này thường có chữ "Download" tự nhiên, đem lại CTR (tỷ lệ click) và RPM rất cao ($3 - $10 / 1.000 lượt xem ở thị trường quốc tế).
   - Hệ thống banner: Header, Sticky Footer, và Sidebar Skyscraper.
2. **Cảnh báo về Shopee Affiliate**:
   - **Tuyệt đối không dùng cơ chế "ép chuyển hướng / nhảy trang" (Forced Redirect / Popunder) sang Shopee**: Shopee có hệ thống phát hiện gian lận cookie stuffing và sẽ khóa tài khoản vĩnh viễn, đóng băng hoa hồng.
   - **Cách làm Shopee đúng cách**: Đặt box "Gợi ý thông minh" sau khi khách tải video xong (ví dụ: Micro thu âm cài áo, đèn livestream, gậy tripod giá rẻ). Người làm TikTok có nhu cầu thật sẽ tự nguyện bấm mua.

### B. Kỹ thuật bóc tách video (Extraction Engine)
* **Bí quyết không tốn ổ cứng & băng thông server**: Server KHÔNG tải file video nặng 20MB - 50MB về máy chủ rồi stream lại. Server chỉ gửi yêu cầu bóc tách chuỗi JSON để lấy link trực tiếp từ CDN của ByteDance (TikTok/Douyin).
* **Trình duyệt của khách** sẽ tải thẳng từ CDN của TikTok. Nhờ vậy, máy chủ rẻ tiền hoặc gói Free vẫn chịu tải hàng chục nghìn người cùng lúc.
* **Kỹ thuật chống chặn IP (Anti-Bot)**:
  - Tận dụng Mobile App API của TikTok thay vì cào HTML web (vì API App điện thoại TikTok rất ít khi thay đổi).
  - Có thể tận dụng dải mạng **IPv6 Subnet `/64`** (được tặng kèm miễn phí khi thuê VPS) để đổi IP ngẫu nhiên cho mỗi request nếu sau này traffic tăng đột biến.

### C. Tấm khiên pháp lý (Legal Shield)
Để Google AdSense duyệt và tránh kiện tụng bản quyền, web đã tích hợp sẵn 3 trang:
1. **Chính sách bảo mật (`/privacy`)**: Khẳng định không lưu trữ thông tin cá nhân hay video.
2. **Điều khoản dịch vụ (`/terms`)**: Người dùng tự chịu trách nhiệm về mục đích sao lưu cá nhân.
3. **Chính sách DMCA (`/dmca`)**: Cung cấp email `ndtoanst2@gmail.com` để chủ bản quyền gửi yêu cầu gỡ link (cam kết xử lý trong 48h).

---

## 3. CẤU TRÚC MÃ NGUỒN CỦA DỰ ÁN

```
tiktok-downloader/
│
├── server.js                        # Backend Node.js Express (bóc tách TikWM API & stream proxy)
├── package.json                     # Quản lý thư viện (express, cors)
├── README.md                        # Hướng dẫn nhanh dự án
├── PROJECT_ARCHIVE_AND_CHAT_LOG.md  # Tài liệu lưu trữ chi tiết toàn bộ dự án này
├── start.bat                        # File 1-click khởi động web trên Windows
├── install.bat                      # File 1-click cài đặt thư viện
│
└── public/                          # Giao diện Frontend tĩnh
    ├── index.html                   # Trang chủ (Tailwind CSS, ô dán link, preview, nút tải)
    ├── privacy.html                 # Trang Chính sách bảo mật (phục vụ AdSense)
    ├── terms.html                   # Trang Điều khoản sử dụng
    ├── dmca.html                    # Trang DMCA gỡ bản quyền
    └── assets/
        ├── style.css                # CSS hiệu ứng gradient, loading spinner
        └── main.js                  # Logic gọi API, tự động bắt link khi paste
```

---

## 4. HƯỚNG DẪN MỞ VÀ CHẠY DỰ ÁN TRÊN MÁY Ở NHÀ

### Cách 1: Tải file nén `.zip`
1. Bạn tải file nén `tiktok-downloader-full-project.zip` về máy nhà và giải nén.
2. Click đúp vào file **`install.bat`** (để cài đặt thư viện tự động).
3. Click đúp vào file **`start.bat`** ➔ Web sẽ tự động mở lên tại `http://localhost:3000`.

### Cách 2: Kéo code từ GitHub
```bash
git clone https://github.com/giaukietxac/tiktok-downloader.git
cd tiktok-downloader
npm install
npm start
```

---

## 5. CÁCH RA LỆNH CHO AI ĐỂ LÀM TIẾP PHẦN SAU

Khi bạn mở thư mục dự án này trên máy ở nhà trong Antigravity (hoặc Cursor / VS Code), bạn chỉ cần copy dòng này gửi cho AI:

> *"Đọc file PROJECT_ARCHIVE_AND_CHAT_LOG.md và README.md trong thư mục. Tôi muốn tiếp tục làm bước tiếp theo: [Nâng cấp giao diện đẹp hơn / Thêm nút tải MP3 / Cắm banner quảng cáo]. Hãy lên phương án và thực hiện giúp tôi."*

AI sẽ tự hiểu 100% toàn bộ lịch sử, các quyết định đã đưa ra và cấu trúc code mà không cần bạn giải thích lại bất cứ điều gì!
