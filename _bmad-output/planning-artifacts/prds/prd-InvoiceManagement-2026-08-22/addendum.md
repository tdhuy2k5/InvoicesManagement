# Technical Addendum: Invoice Management API & Document Engine

## 1. Database Indexing Architecture for Search Optimization

### 1.1 PostgreSQL Indexes Schema

To satisfy the sub-50ms search latency requirement across large datasets (`50,000+` rows), the following indexes are specified for the Prisma schema:

```prisma
model Invoice {
  id                String       @id @default(uuid())
  invoiceNumber     String       @unique
  status            InvoiceStatus @default(DRAFT)
  customerName      String
  customerEmail     String?
  issueDate         DateTime?
  dueDate           DateTime?
  totalAmount       Decimal      @db.Decimal(12, 2)
  currency          String       @default("USD")
  notes             String?
  originalInvoiceId String?
  replacedById      String?
  pdfPath           String?
  createdAt         DateTime     @default(now())
  updatedAt         DateTime     @updatedAt

  originalInvoice   Invoice?     @relation("InvoiceReplacement", fields: [originalInvoiceId], references: [id])
  replacedBy        Invoice?     @relation("InvoiceReplacement")
  items             InvoiceItem[]

  @@index([status, createdAt])
  @@index([customerName])
  @@index([customerEmail])
  @@index([originalInvoiceId])
  @@index([replacedById])
  @@map("invoices")
}

model InvoiceItem {
  id          String   @id @default(uuid())
  invoiceId   String
  description String
  quantity    Decimal  @db.Decimal(10, 2)
  unitPrice   Decimal  @db.Decimal(12, 2)
  amount      Decimal  @db.Decimal(12, 2)

  invoice     Invoice  @relation(fields: [invoiceId], references: [id], onDelete: Cascade)

  @@index([invoiceId])
  @@map("invoice_items")
}

enum InvoiceStatus {
  DRAFT
  ISSUED
  CANCELED
  REPLACED
}
```

### 1.2 Trigram & Full-Text Extension Migration (PostgreSQL)

For fast case-insensitive fuzzy/substring search (`search=...`), add a custom migration enabling `pg_trgm`:

```sql
-- Enable trigram extension for fuzzy/partial matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create GIN trigram indexes on searchable text columns
CREATE INDEX IF NOT EXISTS idx_invoices_customer_name_trgm ON invoices USING gin (customerName gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_invoices_customer_email_trgm ON invoices USING gin (customerEmail gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_invoices_number_trgm ON invoices USING gin (invoiceNumber gin_trgm_ops);
```

---

## 2. Edge Case Handling: Text Wrapping & Multi-Page Pagination

### 2.1 Long Part/Item Names & Description Wrapping

- **Problem**: Technical parts (e.g. `VALVE-CTRL-ASSEMBLY-HIGH-PRESSURE-PNEUMATIC-STAINLESS-STEEL-V4-2026-SERIAL-998877`) or long customer item descriptions can overflow table columns or break table borders.
- **Solution Strategy**:
  1. **Column Proportions**: Allocate fixed percentage widths:
     - `# (Index)`: 6%
     - `Description / Part Name`: 54% (flexible, dominant column)
     - `Qty`: 10% (right-aligned)
     - `Unit Price`: 15% (right-aligned)
     - `Total Amount`: 15% (right-aligned)
  2. **Word Breaking & Ellipsis Policy**:
     - Allow multi-line height calculation per row (`max(lineCount) * lineHeight + cellPadding`).
     - Force word breaking on unbroken strings longer than 35 characters using CSS `overflow-wrap: anywhere; word-break: break-word;` (or PDFKit line wrapping with `width: cellWidth`).

### 2.2 Invoices with Many Products (Multi-Page Table Pagination)

- **Problem**: Invoices containing 20 to 100+ items overflow a single page. If page breaks happen mid-row, text is cut in half horizontally.
- **Solution Strategy**:
  1. **Page Budgeting**:
     - Standard A4 page height: 842 pt (PDFKit) / 297mm.
     - Header block (Logo, Invoice metadata, Customer info): ~220 pt (first page only).
     - Repeating Table Header: 30 pt on every page.
     - Row height: dynamic (min 24 pt, expanding with multi-line descriptions).
     - Footer / Totals block: ~140 pt (final page only).
  2. **Clean Page Splitting**:
     - Calculate remaining page space before rendering each row. If `currentRowHeight > remainingSpace`, trigger page break.
     - Emit repeated table header on the new page.
     - Emit dynamic page footer: `"Page X of Y"` centered at the bottom margin (15mm from bottom).
     - If the remaining space on the last page is insufficient for the totals block, advance to an additional final page cleanly.

---

## 3. Data Population & Ingestion Patterns

### 3.1 Nested JSON Ingestion Payload (`POST /api/v1/invoices`)

```json
{
  "customerName": "Acme Industrial Technologies Ltd",
  "customerEmail": "finance@acme-tech.com",
  "currency": "USD",
  "dueDate": "2026-09-30T00:00:00.000Z",
  "notes": "Net 30 payment terms. Bank wire details enclosed.",
  "items": [
    {
      "description": "High-Pressure Hydraulic Actuator Valve V4 (Extended Life Series)",
      "quantity": 4,
      "unitPrice": 450.00
    },
    {
      "description": "Precision Stainless Steel Flange Connector Kit 150mm",
      "quantity": 12,
      "unitPrice": 35.50
    },
    {
      "description": "On-site Calibration & Pressure Testing Service (Standard Workday Rate)",
      "quantity": 8,
      "unitPrice": 120.00
    }
  ]
}
```

### 3.2 Computation Invariant
- Backend automatically computes line item `amount = round(quantity * unitPrice, 2)`.
- Backend automatically calculates `totalAmount = sum(lineItem.amount)`.
- Client values for `amount` or `totalAmount` in payload are ignored/overridden by server computation to prevent tampering.

---

## 4. Clean & Simple Print Template Layout

### 4.1 Visual Structure (A4 Printable)
```
+---------------------------------------------------------------+
| [COMPANY LOGO / NAME]              INVOICE                    |
| 123 Tech Park, Suite 400           Number:   INV-2026-00042   |
| contact@mycompany.com              Date:     2026-08-22       |
|                                    Due Date: 2026-09-22       |
|                                    Status:   [ISSUED] (Badge) |
+---------------------------------------------------------------+
| BILLED TO:                                                    |
| Acme Industrial Technologies Ltd                              |
| finance@acme-tech.com                                         |
+---------------------------------------------------------------+
| (If Replaced): [!] This invoice replaces Invoice #INV-2026-00010
+---------------------------------------------------------------+
| #  | Description                             | Qty | Price | Total |
+----+-----------------------------------------+-----+-------+-------+
| 1  | Long part name with clean wrapping...   | 4   | 450.00| 1800.00|
| 2  | Precision Stainless Steel Flange...     | 12  | 35.50 |  426.00|
+----+-----------------------------------------+-----+-------+-------+
|                                              Subtotal:     2226.00 |
|                                              Tax (0%):        0.00 |
|                                              GRAND TOTAL:  $2226.00|
+---------------------------------------------------------------+
| Notes: Net 30 payment terms.                                  |
|                                                  Page 1 of 1  |
+---------------------------------------------------------------+
```
