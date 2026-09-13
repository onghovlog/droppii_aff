# 🛍️ Droppii Affiliate - Nền Tảng Giới Thiệu Sản Phẩm & Điều Hướng Link Mua Hàng

> **Website Giới thiệu Sản phẩm, Deal Khuyến Mãi, Tin HOT và Điều hướng Affiliate Link**  
> Xây dựng theo triết lý **Mobile First**, giao diện hiện đại, tốc độ tải nhanh, tối ưu chuyển đổi và quản trị Admin CMS toàn diện.

---

## 📌 1. TỔNG QUAN DỰ ÁN

Dự án là nền tảng tiếp thị liên kết (Affiliate Showcase) chuẩn SEO và tối ưu chuyển đổi cao:
- **KHÔNG** phải website bán hàng trực tiếp: Không có giỏ hàng, không checkout phức tạp, không xử lý thanh toán hay quản lý đơn hàng.
- **Mục tiêu chính**: Giới thiệu sản phẩm chính hãng, deal giảm giá hot, tin tức khuyến mãi, video review thực tế và điều hướng người dùng sang đường link Affiliate (Shopee, Lazada, Tiki, Droppii,...).
- **Ghi nhận chuyển đổi**: Mọi lượt nhấn *"Mua ngay"* được ghi nhận tự động vào Database (`AffiliateClick`) kèm thông tin nguồn, chiến dịch, IP, User-Agent trước khi mở tab mới an toàn với `rel="noopener noreferrer sponsored"`.
- **Banner tối giản & hiệu quả**: Banner quản lý chỉ gồm **Hình ảnh** và **Target URL** (không chứa text overlay, subtitle, CTA text gây rối mắt).
- **Admin CMS**: Quản trị dữ liệu toàn diện với biểu đồ thống kê Chart.js, quản lý Sản phẩm, Danh mục (bật/tắt hiển thị Trang chủ), Banner, Tin tức HOT, Video, Liên hệ, Đăng ký nhận tin (xuất file CSV) và Cấu hình website.

---

## 🛠️ 2. CÔNG NGHỆ SỬ DỤNG

### Frontend:
- **HTML5 & CSS3 thuần (Vanilla CSS)**: Thiết kế hệ thống Design System chuẩn, CSS Variables, Card-based, Glassmorphism, Micro-animations.
- **Vanilla JavaScript (ES6+)**: Module hóa rõ ràng (`api.js`, `toast.js`, `modal.js`, `banners.js`, `products.js`, `news.js`, `videos.js`, `contact.js`, `subscriber.js`, `app.js`), không dùng jQuery hay framework nặng (React, Vue, Angular).
- **Chart.js**: Vẽ biểu đồ xu hướng click trong Admin Dashboard.
- **Mobile First & Responsive**: Breakpoints chuẩn (<768px, 768px-1023px, >=1024px), hỗ trợ `env(safe-area-inset-bottom)`.

### Backend:
- **Node.js & Express.js**: RESTful API chuẩn mực, kiến trúc MVC phân tách rõ ràng.
- **MongoDB & Mongoose**: Database NoSQL tốc độ cao, chỉ mục Index tối ưu, tự động tính toán % giảm giá.
- **Authentication**: JWT (JSON Web Token) và `bcryptjs` mã hóa mật khẩu an toàn.
- **Multer**: Upload hình ảnh sản phẩm, banner, tin tức, video, logo với kiểm tra định dạng và giới hạn dung lượng.
- **Bảo mật & Hiệu năng**: `helmet`, `cors`, `compression`, `express-rate-limit`, `morgan`, `slugify`.

---

## 📁 3. CẤU TRÚC THƯ MỤC DỰ ÁN

```
droppii_aff/
├── server.js                      # Khởi động ứng dụng Express, middleware & static files
├── package.json                   # Dependencies và npm scripts
├── .env                           # Biến môi trường
├── .env.example                   # Mẫu cấu hình môi trường
├── README.md                      # Tài liệu hướng dẫn dự án chi tiết
├── config/
│   └── db.js                      # Kết nối MongoDB qua Mongoose
├── models/
│   ├── Product.js                 # Model Sản phẩm (tự tính % giảm giá, index)
│   ├── Category.js                # Model Danh mục (showOnHomepage, homepageOrder)
│   ├── Banner.js                  # Model Banner (chỉ có image, targetUrl, sortOrder, status)
│   ├── News.js                    # Model Tin tức HOT
│   ├── Video.js                   # Model Video đánh giá
│   ├── Contact.js                 # Model Tin nhắn liên hệ
│   ├── Subscriber.js              # Model Người đăng ký nhận tin (Email/Phone sparse index)
│   ├── PartnerRegistration.js     # Model Đăng ký đối tác
│   ├── AffiliateClick.js          # Model Ghi nhận lượt click link mua hàng
│   ├── Admin.js                   # Model Quản trị viên (bcrypt hash)
│   └── Setting.js                 # Model Cấu hình website & mạng xã hội
├── controllers/
│   ├── productController.js       # Xử lý CRUD sản phẩm, bộ lọc, tìm kiếm
│   ├── categoryController.js      # Xử lý danh mục & cấu hình hiển thị Trang chủ
│   ├── bannerController.js        # Xử lý banner upload & danh sách
│   ├── newsController.js          # Xử lý tin tức HOT & bài viết
│   ├── videoController.js         # Xử lý thư viện video
│   ├── contactController.js       # Xử lý gửi & quản lý liên hệ
│   ├── subscriberController.js    # Xử lý đăng ký nhận tin & xuất file CSV
│   ├── partnerController.js       # Xử lý đăng ký đối tác
│   ├── affiliateController.js     # Xử lý click tracking & thống kê Dashboard
│   ├── adminController.js         # Xử lý Admin Auth (JWT), Profile & Password
│   └── settingController.js       # Xử lý cấu hình website
├── routes/
│   ├── productRoutes.js           # Routes sản phẩm Public
│   ├── categoryRoutes.js          # Routes danh mục Public
│   ├── bannerRoutes.js            # Routes banner Public
│   ├── newsRoutes.js              # Routes tin tức Public
│   ├── videoRoutes.js             # Routes video Public
│   ├── contactRoutes.js           # Route liên hệ Public
│   ├── subscriberRoutes.js        # Route đăng ký nhận tin Public
│   ├── partnerRoutes.js           # Route đăng ký đối tác Public
│   ├── affiliateRoutes.js         # Route tracking click Public
│   ├── settingRoutes.js           # Route cài đặt Public
│   └── adminRoutes.js             # Toàn bộ Routes Admin CMS (được bảo vệ bằng JWT)
├── middleware/
│   ├── authMiddleware.js          # Middleware xác thực JWT Admin
│   ├── uploadMiddleware.js        # Middleware upload ảnh với Multer
│   └── errorMiddleware.js         # Middleware bắt lỗi 404 & Centralized Error Handler
├── utils/
│   ├── asyncHandler.js            # Wrapper bất đồng bộ bắt lỗi tự động
│   └── helpers.js                 # Utility slugify tiếng Việt, validate URL an toàn
├── scripts/
│   └── seed.js                    # Script nạp dữ liệu mẫu phong phú
└── public/
    ├── index.html                 # Trang chủ Mobile-First
    ├── partner.html               # Trang đăng ký đối tác
    ├── assets/
    │   ├── css/
    │   │   ├── style.css          # Hệ thống CSS Design System & Components
    │   │   └── responsive.css     # Breakpoints Responsive & Safe Areas
    │   └── js/
    │       ├── api.js             # Fetch API wrapper
    │       ├── toast.js           # Toast Notification thông báo
    │       ├── modal.js           # Quản lý Modal & Bottom Sheet
    │       ├── banners.js         # Slider Carousel Banner cảm ứng
    │       ├── products.js        # Xử lý hiển thị sản phẩm, lọc danh mục & mua hàng
    │       ├── news.js            # Hiển thị tin tức & Modal chi tiết
    │       ├── videos.js          # Thư viện video với lazy loading YouTube iframe
    │       ├── contact.js         # Xử lý form liên hệ
    │       ├── subscriber.js      # Xử lý form đăng ký nhận deal
    │       ├── partner.js         # Xử lý form đăng ký đối tác
    │       └── app.js             # Bootstrap ứng dụng & nạp cấu hình động
    ├── uploads/                   # Thư mục lưu trữ hình ảnh upload
    └── admin/
        ├── login.html             # Giao diện Đăng nhập Admin
        ├── index.html             # Giao diện Dashboard Admin CMS
        └── assets/
            ├── css/
            │   └── admin.css      # Giao diện Admin Dashboard
            └── js/
                ├── auth.js        # Guard xác thực JWT Admin
                └── admin.js       # Xử lý toàn bộ nghiệp vụ Admin & Chart.js
```

---

## 🚀 4. HƯỚNG DẪN CÀI ĐẶT & CHẠY LOCAL

### Yêu cầu hệ thống:
- **Node.js**: Phiên bản 18+ (Đã kiểm tra tương thích Node.js v22+)
- **MongoDB**: MongoDB Server đang chạy (Cổng mặc định `27017`)

### Các bước cài đặt:

1. **Cài đặt thư viện phụ thuộc (Dependencies)**:
   ```bash
   npm install
   ```

2. **Cấu hình file môi trường (`.env`)**:
   Tạo file `.env` từ `.env.example`:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://127.0.0.1:27017/affiliate_web
   JWT_SECRET=droppii_affiliate_super_secret_jwt_key_2026
   ADMIN_EMAIL=admin@example.com
   ADMIN_PASSWORD=admin123456
   BASE_URL=http://localhost:3000
   NODE_ENV=development
   ```

3. **Nạp dữ liệu mẫu vào Database (Seed Database)**:
   ```bash
   npm run seed
   ```
   > Script sẽ tự động tạo: **5 Danh mục**, **20 Sản phẩm**, **3 Banners**, **5 Tin tức HOT**, **6 Videos**, **Cấu hình website**, **45 lượt Click mẫu** và **1 Tài khoản Admin**.

4. **Khởi chạy Server**:
   - Chế độ phát triển (Development với Nodemon):
     ```bash
     npm run dev
     ```
   - Chế độ chính thức (Production):
     ```bash
     npm start
     ```

5. **Truy cập ứng dụng**:
   - 🌐 **Trang chủ Website**: [http://localhost:3000](http://localhost:3000)
   - 🤝 **Trang Đăng ký Đối tác**: [http://localhost:3000/partner](http://localhost:3000/partner)
   - 🔐 **Đăng nhập Quản trị**: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
   - 📊 **Bảng điều khiển Admin CMS**: [http://localhost:3000/admin](http://localhost:3000/admin)

### 🔑 Thông tin đăng nhập mặc định:
- **Email**: `admin@example.com`
- **Mật khẩu**: `admin123456`

---

## 📡 5. TỔNG QUAN HỆ THỐNG REST API

### Public APIs:
| Phương thức | Endpoint | Mô tả |
| :--- | :--- | :--- |
| `GET` | `/api/banners` | Lấy danh sách Banner đang hoạt động (`status = true`) |
| `GET` | `/api/news` | Lấy danh sách Tin tức (`?hot=true&limit=6`) |
| `GET` | `/api/news/:slug` | Lấy chi tiết bài viết theo Slug hoặc ID |
| `GET` | `/api/products` | Lấy danh sách sản phẩm (Hỗ trợ `?category=...&promotion=true&new=true&search=...&sort=...&page=...`) |
| `GET` | `/api/products/:slug` | Lấy chi tiết sản phẩm theo Slug hoặc ID |
| `GET` | `/api/categories` | Lấy danh mục sản phẩm (`?homepage=true` để lấy danh mục hiển thị Trang chủ) |
| `GET` | `/api/videos` | Lấy danh sách video đánh giá sản phẩm |
| `GET` | `/api/settings` | Lấy thông tin cấu hình website, hotline, mạng xã hội |
| `POST` | `/api/contacts` | Gửi thông tin liên hệ |
| `POST` | `/api/subscribers` | Đăng ký nhận thông báo khuyến mãi |
| `POST` | `/api/partners` | Đăng ký trở thành đối tác |
| `POST` | `/api/affiliate-clicks` | Ghi nhận lượt click điều hướng sang link Affiliate |

### Admin APIs (Yêu cầu `Authorization: Bearer <JWT_TOKEN>`):
| Phương thức | Endpoint | Mô tả |
| :--- | :--- | :--- |
| `POST` | `/api/admin/login` | Đăng nhập Admin lấy JWT Token |
| `GET` | `/api/admin/me` | Lấy thông tin tài khoản Admin hiện tại |
| `PUT` | `/api/admin/profile` | Cập nhật thông tin & Đổi mật khẩu |
| `GET / POST` | `/api/admin/products` | Danh sách sản phẩm & Thêm mới sản phẩm (kèm upload ảnh) |
| `PUT / DELETE` | `/api/admin/products/:id` | Sửa & Xóa sản phẩm |
| `GET / POST` | `/api/admin/categories` | Danh sách danh mục & Thêm danh mục (cài đặt hiện Trang chủ) |
| `PUT / DELETE` | `/api/admin/categories/:id` | Sửa & Xóa danh mục |
| `GET / POST` | `/api/admin/banners` | Danh sách banner & Thêm banner mới (Ảnh + Target URL) |
| `PUT / DELETE` | `/api/admin/banners/:id` | Sửa & Xóa banner |
| `GET / POST` | `/api/admin/news` | Danh sách & Thêm tin tức HOT |
| `PUT / DELETE` | `/api/admin/news/:id` | Sửa & Xóa tin tức |
| `GET / POST` | `/api/admin/videos` | Danh sách & Thêm video |
| `PUT / DELETE` | `/api/admin/videos/:id` | Sửa & Xóa video |
| `GET / PUT / DELETE` | `/api/admin/contacts` | Quản lý tin nhắn liên hệ & đổi trạng thái (new, processing, completed, spam) |
| `GET / PUT / DELETE` | `/api/admin/subscribers` | Quản lý người nhận tin & bật/tắt nhận tin |
| `GET` | `/api/admin/subscribers/export` | Xuất danh sách người nhận tin ra file **Excel (CSV)** |
| `GET / PUT / DELETE` | `/api/admin/partners` | Quản lý đối tác & đổi trạng thái (new, contacted, approved, rejected) |
| `GET` | `/api/admin/affiliate-clicks` | Xem nhật ký chi tiết các lượt click mua hàng |
| `GET` | `/api/admin/affiliate-clicks/stats` | Thống kê tổng số click, click hôm nay, 7 ngày, 30 ngày, biểu đồ 14 ngày |
| `GET / PUT` | `/api/admin/settings` | Xem & Cập nhật cấu hình website |

---

## 📱 6. TỐI ƯU GIAO DIỆN & TRẢI NGHIỆM NGƯỜI DÙNG

1. **Mobile Bottom Navigation**:
   - Cố định ở đáy màn hình điện thoại gồm 4 tab tiện ích: *Trang chủ*, *Sản phẩm*, *Zalo*, *Gọi ngay*.
   - Hỗ trợ padding an toàn với `env(safe-area-inset-bottom)`.
2. **Desktop Floating Contact Buttons**:
   - Nút gọi hotline, chat Zalo, Messenger cố định góc dưới bên phải với tooltip khi hover.
   - Tự động ẩn trên mobile để nhường chỗ cho Mobile Bottom Navigation.
3. **Popup & Modal tương tác mượt mà**:
   - Modal Chi tiết Sản phẩm với Gallery ảnh, thông số, quà tặng và nút *"Mua ngay"* dính cố định ở đáy modal.
   - Modal Tin tức HOT mở đọc trực tiếp không cần tải lại trang.
   - Đóng modal bằng phím `ESC`, click nút `✕` hoặc bấm ra ngoài Overlay.
4. **Hiệu năng & Tốc độ**:
   - Lazy loading hình ảnh với `loading="lazy"`.
   - Lazy embed video YouTube (chỉ nạp iframe khi người dùng click vào nút Play).
   - Nén tài nguyên `compression`, hạn chế request spam với `express-rate-limit`.

---

## 🔮 7. KẾ HOẠCH NÂNG CẤP VERSION 2 (ROADMAP)
- [ ] Tích hợp API tự động đồng bộ giá và tình trạng hàng từ Shopee Affiliate / TikTok Shop.
- [ ] Import / Export danh sách sản phẩm bằng file Excel.
- [ ] Hệ thống tạo link rút gọn và gắn mã UTM Tracking tự động cho từng chiến dịch.
- [ ] Gửi Email thông báo tự động khi có liên hệ hoặc đăng ký đối tác mới.
- [ ] Tích hợp lưu trữ đám mây Cloudinary / AWS S3 cho ảnh dung lượng lớn.
- [ ] Chế độ Dark Mode cho Admin CMS.

---

© 2026 **Droppii Affiliate Platform**. Được xây dựng với tiêu chuẩn chất lượng cao nhất bởi Antigravity Senior Full-stack Developer.
