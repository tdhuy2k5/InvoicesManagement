---
stepsCompleted:
  - "step-01-validate-prerequisites"
  - "step-02-design-epics"
  - "step-03-create-stories"
  - "step-04-final-validation"
inputDocuments:
  - "_bmad-output/planning-artifacts/prds/prd-InvoiceManagement-2026-08-22/prd.md"
  - "_bmad-output/planning-artifacts/architecture/architecture-InvoiceManagement-2026-08-22/ARCHITECTURE-SPINE.md"
---

# InvoiceManagement - Epic & Story Breakdown

## Overview

This document provides the complete epic and story breakdown for InvoiceManagement, decomposing requirements from the PRD and Architecture Spine into independently implementable, user-value-focused user stories with explicit acceptance criteria.

---

## Requirements Inventory

### Functional Requirements

- **FR-1**: Create Draft Invoice (accepts nested payload, computes totals, sequential number via Postgres sequence, Zod validations, `DRAFT` status)
- **FR-2**: Read Invoices (list supports search/filters/pagination, detail returns full invoice with up to 100 line items)
- **FR-3**: Update Draft (`PUT /api/v1/invoices/:id` on `DRAFT` only, replaces line items, recomputes totals)
- **FR-4**: Delete Draft (`DELETE /api/v1/invoices/:id` physical delete on `DRAFT` only)
- **FR-5**: Issue Invoice (`POST /api/v1/invoices/:id/issue` sets `issueDate = now()`, transitions to `ISSUED`, triggers PDF generation)
- **FR-6**: Cancel Invoice (`POST /api/v1/invoices/:id/cancel` only on `ISSUED`, records `cancelReason`)
- **FR-7**: Replace Invoice (`POST /api/v1/invoices/:id/replace` on `ISSUED` root invoices only, atomic single transaction, 1-level replacement cap)
- **FR-8**: Clone Draft (`POST /api/v1/invoices/:id/clone` copies customer info and line items to a new `DRAFT`)
- **FR-9**: Indexed Search (case-insensitive partial match using Prisma insensitive filter and composite index on `status, createdAt`)
- **FR-10**: Vietnamese Invoice Template (A4 portrait HTML template layout with standard Vietnamese business labels)
- **FR-11**: UTF-8 & Edge Cases (Embedded Unicode font, long item names wrapping, `word-break` on unbroken strings)
- **FR-12**: Multi-Page Support (dynamic row height, automatic page break, repeated table headers, `Trang X / Y` pagination, signature pinned to last page)
- **FR-13**: PDF Streaming Endpoint (`GET /api/v1/invoices/:id/pdf` with `inline` view or `?download=true` attachment)
- **FR-14**: Service-Layer Unit Tests (Vitest tests for calculations, state transitions, replacement depth guards, currency to Vietnamese words)
- **FR-15**: Postman Collection (Collection mirroring API folders, environment file, pre-request / test scripts for `invoiceId` variable automation)

### Non-Functional Requirements

- **NFR-1**: Folder structure with clear separation of concerns (`controllers/`, `services/`, `repositories/`, `dto/`, `middlewares/`, `utils/`, `config/`)
- **NFR-2**: Controller handles HTTP only, zero business logic
- **NFR-3**: Service layer contains all business logic, stateless, testable without Express
- **NFR-4**: Repository handles all Prisma calls; no Prisma queries in controllers or services
- **NFR-5**: DTO uses Zod for request body validation and typed response shapes
- **NFR-6**: Centralized error handling via custom `AppError(statusCode, errorCode, message)` and global Express error middleware
- **NFR-7**: No N+1 queries; use Prisma `include` or batched queries
- **NFR-8**: Transaction safety for invoice replacement via `prisma.$transaction()`
- **NFR-9**: Named constants and enums without inline magic numbers or strings
- **NFR-10**: Full TypeScript strict mode, no `any`
- **NFR-11**: Deployment via single `docker compose up` command with `app` (Node 20 slim + Chromium) and `postgres` (PostgreSQL 16)

### Additional Architectural Invariants

- **AD-1**: Strict layer separation (Controller → Service → Repository)
- **AD-2**: Constructor injection for repository dependencies in services
- **AD-3**: Invoice state machine transitions routed through `StateMachineGuard`
- **AD-4**: Invoice number sequencing strictly via PostgreSQL `SEQUENCE` (`invoice_number_seq`) formatted as `HD-{YYYY}-{seq:05d}`
- **AD-5**: PDF generation uses `puppeteer-core` targeting system Chromium, with disk caching to `storage/pdfs/{invoiceNumber}.pdf`
- **AD-6**: Replacement is a single atomic transaction
- **AD-7**: Centralized error handling via `AppError`
- **AD-8**: No Prisma queries outside the Repository layer
- **AD-9**: Single-command Docker Compose deployment

---

## FR Coverage Map

| Requirement | Epic Mapping | Summary Description |
|---|---|---|
| **FR-1** | **Epic 1 (Story 1.2)** | Create Draft Invoice with payload validations and calculations |
| **FR-2** | **Epic 1 (Story 1.3)** | Read Invoices (Paginated list & detail with items) |
| **FR-3** | **Epic 1 (Story 1.4)** | Update Draft Invoice with line item replacement |
| **FR-4** | **Epic 1 (Story 1.4)** | Physical Delete of Draft Invoice |
| **FR-5** | **Epic 2 (Story 2.1)** | Issue Invoice (`DRAFT` → `ISSUED` state lock) |
| **FR-6** | **Epic 2 (Story 2.2)** | Cancel Invoice (`ISSUED` → `CANCELED` with reason) |
| **FR-7** | **Epic 2 (Story 2.3)** | Replace Invoice (Atomic transaction, 1-level cap) |
| **FR-8** | **Epic 1 (Story 1.5)** | Clone Draft Invoice into new `DRAFT` |
| **FR-9** | **Epic 3 (Story 3.1)** | Indexed search and composite filtering |
| **FR-10** | **Epic 4 (Story 4.1)** | Vietnamese A4 Invoice HTML Template |
| **FR-11** | **Epic 4 (Story 4.2)** | UTF-8 Fonts and Long Text Line Wrapping |
| **FR-12** | **Epic 4 (Story 4.2)** | Multi-page pagination, table header repetition & signatures |
| **FR-13** | **Epic 4 (Story 4.3)** | PDF streaming & download endpoint |
| **FR-14** | **Epic 5 (Story 5.1)** | Service-layer unit test suite with Vitest |
| **FR-15** | **Epic 5 (Story 5.2)** | Postman API collection and environment automation |

---

## Epic List

### Epic 1: Project Seed & Core Draft Invoice Management
Enable developers to run the backend container and users to create, read, update, delete, and clone draft commercial invoices with strict Zod validations, calculation rules, and PostgreSQL sequence numbers.
**FRs covered:** FR-1, FR-2, FR-3, FR-4, FR-8

### Epic 2: Invoice Lifecycle Transitions & Atomic Replacement
Enable users to finalize draft invoices (`ISSUED`), cancel issued invoices with audit reasons (`CANCELED`), and replace issued invoices via a single atomic transaction capped at 1 level of replacement depth.
**FRs covered:** FR-5, FR-6, FR-7

### Epic 3: Optimized Invoice Search & Query Filtering
Enable users to search invoices across text fields (invoice number, customer name, tax code, email) and filter by status and date range with database composite index optimization.
**FRs covered:** FR-9

### Epic 4: Vietnamese PDF Invoice Generation & Export
Enable users to render and stream printable Vietnamese A4 invoices with UTF-8 typography, dynamic multi-page pagination, Vietnamese currency to words conversion, and disk caching.
**FRs covered:** FR-10, FR-11, FR-12, FR-13

### Epic 5: Service-Layer Unit Testing & Postman API Verification
Provide automated Vitest tests for domain business logic and a complete Postman collection for evaluator testing.
**FRs covered:** FR-14, FR-15

---

## Epic 1: Project Seed & Core Draft Invoice Management

Enable developers to run the backend container and users to create, read, update, delete, and clone draft commercial invoices with strict Zod validations, calculation rules, and PostgreSQL sequence numbers.

### Story 1.1: Project Skeleton, Prisma Schema, Postgres Sequence & Health Check

As a developer / evaluator,  
I want a clean TypeScript Express project structure with Prisma ORM, PostgreSQL sequence, Docker Compose setup, and a health check endpoint,  
So that the application starts reliably with a single `docker compose up` command.

**Acceptance Criteria:**
- **Given** a new setup with Docker Compose,
- **When** running `docker compose up`,
- **Then** the PostgreSQL 16 container and Express Node 20 container start up, Prisma migrations run automatically, creating the `invoices` table, `invoice_items` table, and PostgreSQL sequence `invoice_number_seq`.
- **And** `GET /api/v1/health` returns `{ success: true, status: "OK" }`.
- **And** directory structure strictly adheres to `controllers/`, `services/`, `repositories/`, `dto/`, `middlewares/`, `utils/`, `config/`, and `types/`.

---

### Story 1.2: Create Draft Invoice (`POST /api/v1/invoices`)

As an API client,  
I want to create a new draft invoice by providing seller info, buyer info, and up to 100 line items,  
So that the system validates inputs, calculates line totals and VAT, assigns a sequential invoice number (`HD-YYYY-NNNNN`), and stores it in `DRAFT` status.

**Acceptance Criteria:**
- **Given** a valid JSON request payload containing customer info, seller info, and 1 to 100 items,
- **When** calling `POST /api/v1/invoices`,
- **Then** the repository fetches `nextval('invoice_number_seq')` and formats `invoiceNumber` as `HD-{YYYY}-{seq:05d}`.
- **And** the service calculates `item.amount = quantity * unitPrice`, `totalAmount = sum(item.amount)`, and `vatAmount = totalAmount * (vatRate / 100)`.
- **And** the invoice is persisted in `DRAFT` status, returning `201 Created` with the full invoice object.
- **And** if payload has >100 items, negative values, missing required fields, or string length violations, Zod validation returns `400 Bad Request` with structured `AppError` JSON `{ success: false, errorCode: "FIELD_TOO_LONG" | "ITEMS_LIMIT_EXCEEDED" | "INVALID_VALUE", message: string }`.

---

### Story 1.3: Read Invoices List & Invoice Detail (`GET /api/v1/invoices`, `GET /api/v1/invoices/:id`)

As an API client,  
I want to retrieve paginated lists of invoices with filter options and fetch the full detail of any invoice with all line items,  
So that I can view and review invoice records.

**Acceptance Criteria:**
- **Given** existing invoices in the database,
- **When** calling `GET /api/v1/invoices` with optional query params `status`, `fromDate`, `toDate`, `page` (default 1), and `limit` (default 10),
- **Then** returns `200 OK` with envelope `{ success: true, data: [...], meta: { total, page, limit } }`.
- **Given** an existing invoice ID,
- **When** calling `GET /api/v1/invoices/:id`,
- **Then** returns `200 OK` with full invoice details and all related `items` array.
- **And** if `:id` does not exist, returns `404 Not Found` with `{ success: false, errorCode: "INVOICE_NOT_FOUND", message: string }`.

---

### Story 1.4: Update & Delete Draft Invoice (`PUT /api/v1/invoices/:id`, `DELETE /api/v1/invoices/:id`)

As an API client,  
I want to update fields/line-items of an invoice or delete it while in `DRAFT` status,  
So that I can correct draft information or discard unwanted drafts before finalizing.

**Acceptance Criteria:**
- **Given** an invoice with status `DRAFT`,
- **When** calling `PUT /api/v1/invoices/:id` with updated customer info or line items,
- **Then** the repository replaces line items in a transaction, recalculates totals, and returns `200 OK` with the updated invoice.
- **Given** an invoice with status `DRAFT`,
- **When** calling `DELETE /api/v1/invoices/:id`,
- **Then** the invoice and its items are physically deleted from the database, returning `200 OK` (or `204 No Content`).
- **And** if the invoice is in `ISSUED`, `CANCELED`, or `REPLACED` status, calling PUT or DELETE returns `400 Bad Request` with `errorCode: "INVALID_TRANSITION"`.

---

### Story 1.5: Clone Draft Invoice (`POST /api/v1/invoices/:id/clone`)

As an API client,  
I want to duplicate an existing invoice into a new `DRAFT`,  
So that I can reuse customer info and line items for repeat billing without manual entry.

**Acceptance Criteria:**
- **Given** any existing invoice (regardless of current status),
- **When** calling `POST /api/v1/invoices/:id/clone`,
- **Then** a new invoice is created with a newly generated sequence `invoiceNumber`, status `DRAFT`, copies of all customer/seller data and line items, `originalInvoiceId = null`, and returns `201 Created`.

---

## Epic 2: Invoice Lifecycle Transitions & Atomic Replacement

Enable users to finalize draft invoices (`ISSUED`), cancel issued invoices with audit reasons (`CANCELED`), and replace issued invoices via a single atomic transaction capped at 1 level of replacement depth.

### Story 2.1: Invoice State Machine Guard & Issue Transition (`POST /api/v1/invoices/:id/issue`)

As an API client,  
I want to issue a draft invoice,  
So that the invoice transitions to `ISSUED` status, sets `issueDate = now()`, and becomes permanently locked against direct edits or deletion.

**Acceptance Criteria:**
- **Given** an invoice in `DRAFT` status with complete required seller and customer data,
- **When** calling `POST /api/v1/invoices/:id/issue`,
- **Then** `StateMachineGuard` verifies the transition, updates status to `ISSUED`, sets `issueDate` to current timestamp, and returns `200 OK`.
- **And** if the invoice is already `ISSUED`, `CANCELED`, or `REPLACED`, returns `400 Bad Request` with `errorCode: "INVALID_TRANSITION"`.

---

### Story 2.2: Cancel Issued Invoice (`POST /api/v1/invoices/:id/cancel`)

As an API client,  
I want to cancel an issued invoice with a mandatory or optional cancellation reason,  
So that the invoice is marked `CANCELED` and preserves an audit trail.

**Acceptance Criteria:**
- **Given** an invoice in `ISSUED` status,
- **When** calling `POST /api/v1/invoices/:id/cancel` with optional `{ cancelReason: string }`,
- **Then** `StateMachineGuard` transitions status to `CANCELED`, persists `cancelReason`, and returns `200 OK`.
- **And** attempting to cancel a `DRAFT`, `REPLACED`, or already `CANCELED` invoice returns `400 Bad Request` with `errorCode: "INVALID_TRANSITION"`.

---

### Story 2.3: Atomic Invoice Replacement with 1-Level Depth Guard (`POST /api/v1/invoices/:id/replace`)

As an API client,  
I want to issue a replacement for an erroneous issued invoice in an atomic transaction,  
So that the original is marked `REPLACED` with a bidirectional link to the new invoice, while preventing multi-level replacement chains.

**Acceptance Criteria:**
- **Given** an invoice in `ISSUED` status with `originalInvoiceId = null` (a root invoice),
- **When** calling `POST /api/v1/invoices/:id/replace` with replacement invoice payload,
- **Then** within a single `prisma.$transaction()`:
  1. Original invoice status is updated to `REPLACED` and `replacedById` is set to the new invoice ID.
  2. New invoice is created with `originalInvoiceId = original.id`, new sequence `invoiceNumber`, status `ISSUED`, and calculated totals.
- **And** returns `201 Created` with the new replacement invoice containing reference to the replaced invoice.
- **And** if the target invoice already has `originalInvoiceId != null` (is itself a replacement), `StateMachineGuard` throws `AppError(400, "REPLACEMENT_NOT_ALLOWED")`.
- **And** if either step of the replacement fails, the entire transaction rolls back cleanly.

---

## Epic 3: Optimized Invoice Search & Query Filtering

Enable users to search invoices across text fields (invoice number, customer name, tax code, email) and filter by status and date range with database composite index optimization.

### Story 3.1: Search & Filter Query Handler with Composite Index

As an API client,  
I want to search across invoice number, customer name, tax code, and email using case-insensitive queries and filter by date/status,  
So that I can quickly find specific invoices in large datasets.

**Acceptance Criteria:**
- **Given** invoices in the database,
- **When** calling `GET /api/v1/invoices?search=abc` with optional `status`, `fromDate`, and `toDate`,
- **Then** the repository constructs a Prisma query with `mode: 'insensitive'` across `invoiceNumber`, `customerName`, `customerEmail`, and `customerTaxCode`.
- **And** queries leverage the composite index `@@index([status, createdAt])` and `@@index([invoiceNumber])` in PostgreSQL.
- **And** returns matching paginated invoices with accurate `meta: { total, page, limit }`.

---

## Epic 4: Vietnamese PDF Invoice Generation & Export

Enable users to render and stream printable Vietnamese A4 invoices with UTF-8 typography, dynamic multi-page pagination, Vietnamese currency to words conversion, and disk caching.

### Story 4.1: Vietnamese Currency-to-Words Converter & HTML Invoice Template

As a system,  
I want a utility function to convert VND numbers to Vietnamese words and an A4 portrait HTML invoice template,  
So that invoice totals can be printed according to Vietnamese accounting standards.

**Acceptance Criteria:**
- **Given** a VND numeric amount (e.g. `12320000`),
- **When** calling `currencyToWords(12320000)`,
- **Then** it returns `"Mười hai triệu ba trăm hai mươi nghìn đồng chẵn"`.
- **And** the HTML template includes all required Vietnamese labels: `HÓA ĐƠN BÁN HÀNG`, seller info, buyer info, replacement notice (`Thay thế cho HĐ số... ngày...` if `originalInvoiceId` is present), STT, Tên hàng hóa, ĐVT, Số lượng, Đơn giá, Thành tiền, Thuế GTGT, and signature blocks (`Người mua hàng`, `Người bán hàng`).

---

### Story 4.2: Dynamic PDF Generation with Puppeteer & Disk Caching

As a system,  
I want to render pixel-perfect A4 PDFs using `puppeteer-core` with system Chromium, UTF-8 font embedding, dynamic table row splitting, and disk caching,  
So that invoices are rendered reliably without font corruption or page break layout bugs.

**Acceptance Criteria:**
- **Given** an invoice record,
- **When** `PdfService.generate(invoice)` is called,
- **Then** `puppeteer-core` connects to system Chromium (`CHROMIUM_PATH`), loads the HTML template with embedded Unicode font (e.g., Roboto / Noto Sans), and renders an A4 PDF.
- **And** long product descriptions wrap within table cells using CSS `overflow-wrap: anywhere; word-break: break-word;`.
- **And** invoices with many items dynamically paginate with repeated table headers and `Trang X / Y` page footers.
- **And** generated PDFs are saved to `storage/pdfs/{invoiceNumber}.pdf`. Subsequent requests serve the cached file directly unless invalidated by state changes.

---

### Story 4.3: PDF Streaming & Download Endpoint (`GET /api/v1/invoices/:id/pdf`)

As an API client / evaluator,  
I want an endpoint to view in-browser or download the generated invoice PDF,  
So that I can inspect or download the official invoice document.

**Acceptance Criteria:**
- **Given** an existing invoice ID,
- **When** calling `GET /api/v1/invoices/:id/pdf`,
- **Then** the PDF is generated/retrieved from cache and streamed with `Content-Type: application/pdf` and `Content-Disposition: inline; filename="HD-YYYY-NNNNN.pdf"`.
- **When** calling `GET /api/v1/invoices/:id/pdf?download=true`,
- **Then** the response header is `Content-Disposition: attachment; filename="HD-YYYY-NNNNN.pdf"`.
- **And** if invoice is not found, returns `404 Not Found`.

---

## Epic 5: Service-Layer Unit Testing & Postman API Verification

Provide automated Vitest tests for domain business logic and a complete Postman collection for evaluator testing.

### Story 5.1: Vitest Unit Test Suite for Domain Business Logic

As a developer / evaluator,  
I want a comprehensive suite of unit tests covering business calculations, state transitions, replacement guards, and currency conversions,  
So that core domain invariants are proven without requiring HTTP or live database dependencies.

**Acceptance Criteria:**
- **Given** the service layer classes with constructor-injected mock repositories,
- **When** running `npm run test` (Vitest),
- **Then** unit test suites execute and pass for:
  1. `InvoiceCalculationService` (item amount, total sum, VAT rate calculations, rounding)
  2. `StateMachineGuard` (all valid transitions: DRAFT→ISSUED, ISSUED→CANCELED, ISSUED→REPLACED; all invalid transitions throwing `INVALID_TRANSITION`)
  3. `ReplacementGuard` (prohibiting replacement on invoices where `originalInvoiceId != null` throwing `REPLACEMENT_NOT_ALLOWED`)
  4. `currencyToWords` (verifying standard amounts, zero, large numbers, and correct Vietnamese formatting).

---

### Story 5.2: Postman Collection & Automated Environment Setup

As an evaluator,  
I want a Postman collection and environment file covering all endpoints with automated variable passing,  
So that I can test the full API lifecycle sequentially without manual copy-pasting of IDs.

**Acceptance Criteria:**
- **Given** `postman/InvoiceManagement.postman_collection.json` and `postman/local.postman_environment.json`,
- **When** imported into Postman,
- **Then** folders are organized into `CRUD`, `Lifecycle`, `Search`, and `PDF`.
- **And** running `Create Draft Invoice` automatically captures the returned invoice `id` and `invoiceNumber` into Postman environment variables for subsequent requests (`Read By ID`, `Update`, `Issue`, `Replace`, `Download PDF`).
- **And** sample payloads include valid Vietnamese UTF-8 character data.
