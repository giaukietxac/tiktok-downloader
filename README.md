# 🎬 TraTuiLoc – TikTok Video Downloader (No Watermark)

Website công cụ tải video TikTok và Douyin không logo, không watermark miễn phí, hỗ trợ tải trực tiếp tốc độ cao.

---

## 🌐 Các Đường Link Quan Trọng

* **Tên miền chính thức**: [https://tratuiloc.xyz](https://tratuiloc.xyz) *(hoặc [https://www.tratuiloc.xyz](https://www.tratuiloc.xyz))*
* **Link dự phòng máy chủ Cloud**: [https://tratuiloc-app.onrender.com](https://tratuiloc-app.onrender.com)
* **Kho mã nguồn GitHub**: [https://github.com/giaukietxac/tiktok-downloader](https://github.com/giaukietxac/tiktok-downloader)
* **Trang quản trị Cloud Render**: [https://dashboard.render.com/web/srv-db7k0grbc2fs73fg4kig](https://dashboard.render.com/web/srv-db7k0grbc2fs73fg4kig)

---

## 🏗️ Kiến Trúc Hệ Thống

* **Backend**: Node.js + Express (`server.js`)
* **Bộ máy bóc tách (Engine)**: Tích hợp TikWM API trích xuất trực tiếp link CDN không logo từ máy chủ ByteDance (TikTok/Douyin).
* **Cơ chế tải file**: Sử dụng endpoint `/proxy?url=...` để stream video thẳng từ CDN về máy khách, tự động gán tên file `.mp4` chuẩn và không tốn ổ cứng máy chủ.
* **Frontend**: HTML5 + Tailwind CSS + Vanilla JS (`public/`)
* **Pháp lý sẵn sàng cho Google AdSense**:
  * [Chính sách bảo mật (`/privacy`)](https://tratuiloc.xyz/privacy)
  * [Điều khoản sử dụng (`/terms`)](https://tratuiloc.xyz/terms)
  * [Chính sách DMCA (`/dmca`)](https://tratuiloc.xyz/dmca) (Email: `ndtoanst2@gmail.com`)

---

## 💻 Hướng Dẫn Về Nhà Tiếp Tục Làm Việc (Resume at Home)

Khi bạn về nhà và mở máy tính cá nhân lên:

### Bước 1: Tải mã nguồn về máy
Mở Terminal (hoặc PowerShell) và chạy lệnh:
```bash
git clone https://github.com/giaukietxac/tiktok-downloader.git
cd tiktok-downloader
npm install
```

### Bước 2: Chạy thử nghiệm trên máy ở nhà
```bash
npm start
```
Mở trình duyệt truy cập: `http://localhost:3000`

### Bước 3: Tiếp tục yêu cầu AI hỗ trợ
Mở thư mục dự án trong Antigravity (hoặc Cursor / VS Code) và chỉ cần nhắn:
> *"Đọc file README.md, tôi muốn tiếp tục làm phần [Giao diện mới / Tải MP3 / Cắm quảng cáo] cho dự án này."*
AI sẽ đọc toàn bộ bối cảnh và tiếp tục code chính xác mà bạn không cần phải giải thích lại từ đầu.

---

## 📌 Các Bước Tiếp Theo Cần Triển Khai (Roadmap)

1. [ ] **Nâng cấp giao diện (UI/UX)**: Làm đẹp trang chủ, thêm chế độ dark/light, hiệu ứng mượt mà (theo đúng mong muốn làm bước này sau cùng của bạn).
2. [ ] **Tính năng Tải Âm thanh MP3**: Thêm nút tách riêng nhạc nền MP3 chất lượng gốc từ video.
3. [ ] **Gợi ý sản phẩm Shopee Affiliate (Smart Box)**: Đặt khung gợi ý đồ quay video (micro thu âm, đèn livestream, tripod) sau khi tải video xong.
4. [ ] **Cắm vị trí Quảng cáo (AdSense Placeholder)**: Chuẩn bị sẵn các khung banner để khi được duyệt Google AdSense chỉ cần dán mã vào là xong.
5. [ ] **Nộp hồ sơ Google AdSense**: Gửi xét duyệt trang `tratuiloc.xyz` để bắt đầu kiếm tiền quảng cáo.
