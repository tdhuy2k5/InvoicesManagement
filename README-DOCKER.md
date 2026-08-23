# 🚀 Hướng Dẫn Chạy Dự Án Bằng Docker & Docker Compose

Dự án đã được đóng gói hoàn chỉnh gồm **PostgreSQL 16 Database** và **Frontend React SPA (Vite + Tailwind CSS + Nginx)**.

---

## 1. Chạy Dự Án (Bản Production / Nginx)

Chạy lệnh sau tại thư mục gốc của dự án:

```bash
docker compose up -d --build
```

- 🌐 **Truy cập ứng dụng:** [http://localhost](http://localhost) (hoặc [http://localhost:3000](http://localhost:3000))
- 🗄️ **PostgreSQL Database:** `localhost:5432` (User: `postgres`, Password: `postgrespassword`, DB: `invoicedb`)

### Dừng hệ thống:
```bash
docker compose down
```

---

## 2. Chạy Dự Án (Bản Development với Hot-Reload)

Nếu bạn muốn chỉnh sửa code và thấy thay đổi ngay lập tức (Hot Module Replacement - Vite):

```bash
docker compose -f docker-compose.dev.yml up -d --build
```

- 🌐 **Truy cập môi trường Dev:** [http://localhost:5173](http://localhost:5173)

### Dừng môi trường Dev:
```bash
docker compose -f docker-compose.dev.yml down
```

---

## 3. Xem Logs

```bash
# Xem log toàn bộ hệ thống
docker compose logs -f

# Xem log riêng của web
docker compose logs -f web

# Xem log database
docker compose logs -f postgres
```

---

## 4. Chạy Trực Tiếp Không Cần Docker (Local Node.js)

Nếu muốn chạy trực tiếp trên máy:

```bash
# 1. Cài đặt dependencies
npm install

# 2. Sinh Prisma Client
npm run prisma:generate

# 3. Chạy Vite dev server
npm run dev
```
Truy cập: [http://localhost:5173](http://localhost:5173)
