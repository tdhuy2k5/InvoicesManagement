# 🚀 Hướng Dẫn Chạy Dự Án exportInvoice Bằng Docker Compose

Dự án đã được đóng gói hoàn chỉnh 3 tầng (3-tier architecture) chuẩn Production:
1. **PostgreSQL 16 Database**: CSDL quan hệ lưu trữ hóa đơn, tự động khởi tạo bảng và nạp dữ liệu mẫu (`seed`).
2. **Backend Express REST API**: Xử lý nghiệp vụ, tính toán VAT, cấp số sequence, xuất file PDF bằng Puppeteer trên nền Alpine Linux.
3. **Web Frontend (React SPA + Nginx)**: Giao diện chuẩn mực, tích hợp reverse proxy định tuyến `/api/` mượt mà.

---

## ⚡ 1. Khởi Động Dự Án (Chỉ 1 Câu Lệnh)

Chạy lệnh sau tại thư mục gốc của dự án:

```bash
docker compose up -d --build
```

### 🌐 Địa chỉ truy cập:
- **Ứng dụng Web:** [http://localhost](http://localhost) (hoặc [http://localhost:3000](http://localhost:3000))
- **REST API Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **REST API Danh sách hóa đơn:** [http://localhost:5000/api/invoices](http://localhost:5000/api/invoices)
- **PostgreSQL Database:** `localhost:5432`  
  - *User:* `postgres`  
  - *Password:* `postgrespassword`  
  - *Database:* `invoicedb`

---

## 🛑 2. Dừng Hệ Thống

```bash
# Dừng các container
docker compose down

# Dừng và xóa toàn bộ dữ liệu PostgreSQL để chạy lại từ đầu
docker compose down -v
```

---

## 📋 3. Xem Nhật Ký Hoạt Động (Logs)

```bash
# Xem log toàn bộ hệ thống
docker compose logs -f

# Xem log riêng của Backend API
docker compose logs -f api

# Xem log riêng của Web Nginx
docker compose logs -f web

# Xem log riêng của Database
docker compose logs -f postgres
```

---

## 🧪 4. Chạy Kiểm Thử Tự Động (Unit & Integration Tests)

Nếu người nhận muốn chạy kiểm tra bộ 52 bài test trên máy:

```bash
npm install
npm run test
```
