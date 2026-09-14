# PSM - Personal Salary Management (DailyIncome Pro)

Ứng dụng quản lý thu nhập cá nhân hàng ngày, tự động tính lương, theo dõi mục tiêu tiền mặt và tổng kết chu kỳ tài chính với **React 19 + Vite + TailwindCSS v4 + Supabase (PostgreSQL Cloud)**.

---

## ✨ Tính năng nổi bật

- 📊 **Dashboard Tổng quan**:
  - Hero Card hiển thị tiến độ và mục tiêu tiền mặt ngày hôm nay.
  - Widget tóm tắt chu kỳ tài chính (Tổng thu nhập, Tiền mặt, Lương cứng, Tiền bo/Tips, Thưởng).
  - Biểu đồ xu hướng và phân bổ nguồn thu theo ngày.
- 📅 **Quản lý thu nhập đa chế độ**:
  - **Chế độ Bảng (Table View)**: Hỗ trợ chỉnh sửa nhanh trực tiếp từng ô (Inline Edit) và click mở modal chi tiết.
  - **Chế độ Thẻ Grid Timeline**: Trực quan hóa tiến độ từng ngày, hiển thị rõ ràng ngày đạt / chưa đạt mục tiêu.
  - Phân trang chuẩn đối xứng `1 2 ... 7 8` đồng nhất trên cả Desktop & Mobile.
- 📱 **Trải nghiệm Mobile chuyên sâu**:
  - Bottom Sheet trượt từ đáy màn hình, thanh kéo chuẩn native.
  - Nút Lưu / Hủy ghim cố định ở đáy không bao giờ bị che khuất.
  - Thanh điều hướng Mobile thông minh.
- 🌙 **Giao diện Sang trọng (Light & Obsidian Dark Mode)**:
  - Tích hợp chuyển đổi theme với hiệu ứng ánh sáng mượt mà.
  - Thông báo Toast góc trên bên phải lướt ngang êm ái.
- 🗄️ **Cơ sở dữ liệu PostgreSQL thật (Supabase)**:
  - Xác thực người dùng (Google OAuth & Email/Mật khẩu).
  - Phân quyền bảo mật cấp dòng **Row Level Security (RLS)**.
  - Tự động fallback sang Demo LocalStorage khi chưa cấu hình DB.

---

## 🛠️ Công nghệ sử dụng

- **Frontend**: React 19, TypeScript, Vite, TailwindCSS v4, Lucide React, Recharts, Canvas Confetti.
- **Backend & Database**: Supabase (PostgreSQL 15+), Row Level Security (RLS).

---

## 🚀 Cài đặt & Chạy Local

### 1. Clone repo và cài đặt dependencies
```bash
git clone git@github.com:HoaiThong2401/PSM.git
cd PSM
npm install
```

### 2. Cấu hình biến môi trường
Tạo file `.env` từ `.env.example`:
```bash
cp .env.example .env
```
Điền thông tin Supabase của bạn:
```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here
```

### 3. Thiết lập Database Supabase
Vào **Supabase SQL Editor**, copy và chạy toàn bộ nội dung file [`supabase/schema.sql`](./supabase/schema.sql).

### 4. Khởi chạy ứng dụng
```bash
npm run dev
```
Truy cập [http://localhost:5173/](http://localhost:5173/) trên trình duyệt.

---

## 📦 Build Production
```bash
npm run build
```
Thư mục xuất ra: `dist/` sẵn sàng triển khai lên **Vercel / Netlify / Cloudflare Pages**.
