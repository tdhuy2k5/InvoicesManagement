---
title: "PRD: Invoice Management API — Intern Assessment Project"
status: final
created: "2026-08-22"
updated: "2026-08-22"
---

# PRD: Invoice Management API — Intern Assessment Project

## 0. Document Purpose

This PRD scopes a **solo intern test project** to demonstrate clean TypeScript backend architecture, production-grade folder structure, correct domain modeling, and thoughtful performance optimization. The evaluator cares about **how** the code is written, not enterprise scale.

> **Assessment criteria, in order of weight:**
> 1. 🗂️ **Folder structure** — clear separation of concerns (controller / service / repository / DTO / middleware layers)
> 2. 🧹 **Clean code** — readable, typed, single-responsibility, no magic numbers, consistent conventions
> 3. ⚙️ **Optimization choices** — justified DB indexes, efficient query patterns, no N+1 queries
> 4. ✅ **Test coverage** — service-layer unit tests proving business rules work
> 5. 📄 **PDF output** — clean Vietnamese UTF-8 invoice template, printable and correct

---

## 1. Vision

A minimal but well-crafted REST API for managing commercial invoices through their lifecycle — Draft → Issue → Cancel / Replace — with server-side PDF export. Built to demonstrate a developer who writes code that teammates can read, maintain, and extend.

---

## 2. Target User (Simplified)

**Persona**: The intern evaluator — a senior developer reviewing code quality.

**What they want to see:**
- A folder structure they'd use themselves in production.
- Service layer that is pure business logic, decoupled from HTTP.
- Prisma schema with appropriate indexes, not just the defaults.
- PDF that looks clean in a Vietnamese business context.
- Tests that test the *business rules*, not just method calls.

---

## 3. Glossary

| Term | Definition |
|---|---|
| `DRAFT` (Bản nháp) | Editable invoice. Can be updated or deleted freely. |
| `ISSUED` (Đã xuất) | Finalized, immutable invoice. No direct modifications allowed. |
| `CANCELED` (Đã hủy) | Terminal state. Canceled with an auditable reason. |
| `REPLACED` (Đã thay thế) | Terminal. Superseded by a replacement invoice, linked bidirectionally. |
| Line Item (Hàng hóa) | Single product/service row on an invoice: name, quantity, unit price, amount. |
| Replacement Chain | Parent invoice (REPLACED) ↔ Child invoice (carries `originalInvoiceId`). |

---

## 4. Functional Requirements

### 4.1 Core CRUD — Invoice Lifecycle

#### FR-1: Create Draft Invoice (`POST /api/v1/invoices`)
- Accepts nested payload: seller info, buyer info (name, tax code, email, address), and an `items[]` array.
- Server computes: `item.amount = qty × unitPrice`, `invoice.totalAmount = Σ(item.amount)`, VAT amount = `totalAmount × vatRate`.
- Assigns sequential `invoiceNumber` (e.g. `HD-2026-00001`).
- Sets status to `DRAFT`.

**⚠️ Validation Rules (enforced at DTO layer — Zod schema):**

| Field | Max Length / Constraint | Error Code |
|---|---|---|
| `items[]` array | Max **100 items** | `ITEMS_LIMIT_EXCEEDED` |
| `customerName` | 200 ký tự | `FIELD_TOO_LONG` |
| `customerTaxCode` | 20 ký tự | `FIELD_TOO_LONG` |
| `customerAddress` | 300 ký tự | `FIELD_TOO_LONG` |
| `item.description` | 500 ký tự | `FIELD_TOO_LONG` |
| `notes` / `cancelReason` | 1000 ký tự | `FIELD_TOO_LONG` |
| `item.quantity` | > 0, ≤ 999,999 | `INVALID_VALUE` |
| `item.unitPrice` | > 0, ≤ 999,999,999 | `INVALID_VALUE` |
| `vatRate` | 0–100 (%) | `INVALID_VALUE` |

> 📝 **Scalability Note** *(for code reviewers)*: The 100-item limit covers 95%+ of real-world B2B invoices. For production-scale platforms (e.g. 1000+ items like retail chains), line items would be paginated separately via `GET /invoices/:id/items?page=1&limit=50` and PDF generation offloaded to a background job queue. This is intentionally out of scope for this assessment.

#### FR-2: Read Invoices (`GET /api/v1/invoices`, `GET /api/v1/invoices/:id`)
- List endpoint supports: `search`, `status`, `fromDate`, `toDate`, `page`, `limit`.
- Detail endpoint returns full invoice + all line items (up to 100, consistent with FR-1 limit).

#### FR-3: Update Draft (`PUT /api/v1/invoices/:id`)
- Only allowed on `DRAFT` invoices.
- Replaces line items (delete-and-recreate pattern within a Prisma transaction).
- Recomputes totals after update.

#### FR-4: Delete Draft (`DELETE /api/v1/invoices/:id`)
- Physical delete. Only allowed on `DRAFT` invoices.

#### FR-5: Issue Invoice (`POST /api/v1/invoices/:id/issue`)
- Validates required fields before issuing.
- Sets `issueDate = now()`, transitions to `ISSUED`.
- Triggers PDF generation (async-friendly, cached to disk).

#### FR-6: Cancel Invoice (`POST /api/v1/invoices/:id/cancel`)
- Only `ISSUED` invoices can be canceled.
- Accepts optional body `{ cancelReason: string }`.

#### FR-7: Replace Invoice (`POST /api/v1/invoices/:id/replace`)
- Only `ISSUED` invoices can be replaced.
- Accepts payload for the corrected invoice data.
- In a single **transaction**:
  1. Mark original as `REPLACED`, set `replacedById = newInvoice.id`.
  2. Create replacement invoice with `originalInvoiceId = original.id`.

**⚠️ Business Rule — Replacement chain is capped at 1 level:**
- Chỉ được phép thay thế hóa đơn `ISSUED` gốc (không có `originalInvoiceId`).
- Hóa đơn thay thế (`originalInvoiceId != null`) **không được phép replace tiếp** — nếu có sai sót thì phải dùng `Cancel`, sau đó tạo hóa đơn mới hoàn toàn.
- API trả về `400 Bad Request` với `errorCode: REPLACEMENT_NOT_ALLOWED` nếu cố replace một hóa đơn đã là hóa đơn thay thế.

**Testable:**
- `POST /api/v1/invoices/:id/replace` với `:id` là invoice đang có `originalInvoiceId` → 400.
- `POST /api/v1/invoices/:id/replace` với `:id` là invoice `ISSUED` gốc → 201 success.

#### FR-8: Clone Draft (`POST /api/v1/invoices/:id/clone`) *(Optional, nice-to-have)*
- Copies customer info and line items into a new `DRAFT`. Demonstrates Prisma nested create.

---

### 4.2 Search & Database Optimization

#### FR-9: Indexed Search
- `GET /api/v1/invoices?search=...` performs case-insensitive partial match on `invoiceNumber`, `customerName`, `customerEmail`, `customerTaxCode`.
- Uses `pg_trgm` trigram indexes (custom migration) for efficient `ILIKE` queries.
- Composite index on `(status, createdAt)` for common filter patterns.
- **No raw SQL** — use Prisma's `$queryRaw` only for the GIN index creation migration; service layer uses typed Prisma client.

> **Optimization note for code reviewers**: GIN trigram indexes on text columns reduce ILIKE cost from O(n) full table scan to O(log n). This is the correct pattern vs. Elasticsearch/Typesense at this data volume.

---

### 4.3 PDF Generation — Vietnamese Invoice Template (UTF-8)

#### FR-10: Vietnamese Invoice Template
Template layout (A4 portrait) — all labels in Vietnamese:

```
┌────────────────────────────────────────────────────────────────────┐
│  [Logo]  Tên Công Ty Bán                    HÓA ĐƠN BÁN HÀNG      │
│           MST: 0123456789                   Số: HD-2026-00001       │
│           Địa chỉ: ...                      Ngày: 22/08/2026        │
│           ĐT: 0901xxxxxx                   Trạng thái: [ISSUED]     │
├────────────────────────────────────────────────────────────────────┤
│  Khách hàng:  Công ty TNHH ABC                                     │
│  MST:         0987654321                                           │
│  Địa chỉ:     123 Nguyễn Huệ, Q.1, TP.HCM                         │
│  Hình thức TT: Chuyển khoản                                        │
│  [Nếu thay thế]: Thay thế cho HĐ số HD-2026-XXXXX ngày 01/08/2026 │
├───┬────────────────────────────────┬───┬──────────┬─────────────┤
│STT│ Tên hàng hóa, dịch vụ          │ĐVT│ Số lượng │  Đơn giá    │Thành tiền│
├───┼────────────────────────────────┼───┼──────────┼──────────┤
│ 1 │ Màn hình LCD 24" Samsung...    │Cái│    2     │  4,500,000  │  9,000,000│
│ 2 │ Bàn phím cơ Keychron K2       │Cái│    1     │  2,200,000  │  2,200,000│
├───┴────────────────────────────────┴───┴──────────┴──────────┤
│                                              Cộng tiền hàng:  11,200,000│
│                                              Thuế GTGT (10%): 1,120,000│
│                                        Tổng tiền thanh toán: 12,320,000│
│  Số tiền bằng chữ: Mười hai triệu ba trăm hai mươi nghìn đồng chẵn   │
├────────────────────────────────────────────────────────────────────┤
│  Người mua hàng         │         Người bán hàng                  │
│  (Ký, ghi rõ họ tên)    │        (Ký, đóng dấu, ghi rõ họ tên)    │
│                         Trang 1/1                                  │
└────────────────────────────────────────────────────────────────────┘
```

#### FR-11: UTF-8 & Edge Cases
- Embed Unicode-compliant font (Roboto / Noto Sans Vietnamese / DejaVu) — no system font dependency.
- Long item names (100+ chars): wrap within description column (`≥ 45%` of table width); no overflow.
- Unbroken strings (serial numbers): `word-break: break-all` or PDFKit manual wrapping.

#### FR-12: Multi-Page Support
- Dynamic row height per line item (multiline = `n × lineHeight + padding`).
- Page break before row if remaining vertical space < row height.
- Repeat table header on each page.
- Print page numbers: `Trang X / Y`.
- Summary + signature block pinned to last page.

#### FR-13: PDF Streaming Endpoint
- `GET /api/v1/invoices/:id/pdf`
  - Default: `Content-Disposition: inline` (view in browser).
  - `?download=true`: `Content-Disposition: attachment; filename="HD-2026-00001.pdf"`.

---

### 4.4 Unit Tests

#### FR-14: Service-Layer Tests
Tests focus on **business logic**, not HTTP routing:
- `InvoiceCalculationService`: Verify `amount`, `totalAmount`, VAT, rounding.
- `StateMachineGuard`: All valid/invalid transitions (e.g. cannot `issue` an already-issued invoice).
- `ReplacementService`: Verify bidirectional link integrity in transaction.
- `CurrencyToWords` (Vietnamese): `12320000 → "Mười hai triệu ba trăm hai mươi nghìn đồng chẵn"`.
- `SearchFilter`: Correct WHERE clause construction (pagination, search term, status filter).

---

### 4.5 Postman Collection

#### FR-15: Postman Collection (`InvoiceManagement.postman_collection.json`)
- **Folder structure** mirroring API:
  - `Invoices / CRUD` (Create, Read All, Read By ID, Update, Delete)
  - `Invoices / Lifecycle` (Issue, Cancel, Replace, Clone)
  - `Invoices / PDF` (View PDF, Download PDF)
- **Environment file** (`local.postman_environment.json`): `baseUrl = http://localhost:3000`, `invoiceId = {{auto-set from create}}`.
- Pre-request scripts to auto-set `invoiceId` variable after creation.

---

## 5. Non-Goals (v1)

- Real payment processing (Stripe, VNPay, MoMo)
- Tax authority integration (HTKK, eTax portal, TCT APIs)
- Frontend UI / Admin dashboard
- Email sending of invoices
- Multi-tenant / authentication system

---

## 6. Architecture & Code Quality Constraints *(Non-Functional)*

> These are **evaluation criteria**, not optional suggestions.

| Area | Requirement |
|---|---|
| **Folder structure** | `src/` with distinct `controllers/`, `services/`, `repositories/`, `dto/`, `middlewares/`, `utils/`, `config/` |
| **Controller** | HTTP only: parse request, call service, return response. Zero business logic. |
| **Service** | All business logic. Stateless. Importable and testable without Express. |
| **Repository** | All Prisma calls. No Prisma queries in controllers or services directly. |
| **DTO** | Zod or class-validator schemas for request validation. Typed response shapes. |
| **Error handling** | Centralized error middleware. Custom `AppError` class with `statusCode` + `errorCode`. |
| **No N+1 queries** | Always use Prisma `include` or batched queries; never fetch line items in a loop. |
| **Transaction safety** | Invoice replacement runs in a `prisma.$transaction()` block. |
| **Constants** | No magic numbers/strings inline. Use named constants or enums. |
| **Type safety** | Full TypeScript strict mode. No `any`. |

---

## 7. Success Criteria (Assessment View)

| Criterion | Target |
|---|---|
| Code reviewer can trace a request from HTTP → controller → service → repository without confusion | ✅ |
| All state machine transitions tested and enforced | ✅ |
| PDF renders tiếng Việt correctly (no garbled characters) on A4 print | ✅ |
| Search query uses database indexes (not full scan) | ✅ |
| Unit tests pass for calculations, state guards, and currency-to-words | ✅ |

---

## 8. Open Questions

1. **VAT Rate**: Fixed 10% for all items, or configurable per item in the payload?
   - *Default assumption*: Invoice-level `vatRate` field (default `10`), applied uniformly. Mark `[ASSUMPTION]`.
2. **PDF Engine**: PDFKit (Node.js, no headless browser) vs. Puppeteer (HTML template → PDF).
   - *Recommendation for intern assessment*: **PDFKit** — demonstrates lower-level PDF generation skill and has zero Chromium dependency. HTML-to-PDF with Puppeteer is also valid, especially for complex Vietnamese layout control.
3. **Invoice Number sequencing**: Auto-increment counter (`INV-YYYY-NNNNN`) — needs atomic DB sequence or Redis counter.
   - *Default assumption*: PostgreSQL `SEQUENCE` or padded `ROW_NUMBER()` query.

---

## 9. Assumptions Index

- `[ASSUMPTION: VAT]` Invoice-level VAT rate, defaulting to 10%.
- `[ASSUMPTION: Currency]` VND only for v1; field stored as `varchar` for future multi-currency.
- `[ASSUMPTION: Auth]` API is unauthenticated for this intern assessment; API key middleware can be wired in later.
- `[ASSUMPTION: PDF Caching]` PDF file is generated on-demand and cached to `storage/pdfs/` after first generation. Re-issued if invoice changes.
