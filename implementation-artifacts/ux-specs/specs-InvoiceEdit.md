# UX & Screen Specification: InvoiceEdit (Chỉnh Sửa Hóa Đơn Nháp)

> **Graph Node ID:** `InvoiceEdit`  
> **Route:** `/invoices/:id/edit`  
> **Title:** `Edit Draft Invoice - Chỉnh Sửa Hóa Đơn`  
> **Authentication & Role:** `AUTHENTICATED`  
> **Visibility Guard:** `invoice.status == "DRAFT"` (Strict State Machine Invariant AD-3)  
> **Parent / Layout Context:** Root Main Application Layout  
> **Mounted Islands:** `GlobalHeaderIsland`, `InvoiceFormIsland`

---

## 1. Executive Summary & Screen Purpose

The **InvoiceEdit** screen enables users to modify and update existing commercial invoices that reside strictly in the `DRAFT` lifecycle state. It prevents accidental modifications to finalized legal documents by enforcing an immutable status guard (`validateDraftModification`).

The screen pre-populates all existing invoice fields (buyer profile, payment conditions, notes, tax configurations, and line items). As edits occur, the embedded calculation engine recalculates line totals, subtotal, VAT amounts, and real-time Vietnamese currency words in real time. Upon saving (`PUT /api/v1/invoices/:id`), line items are cleanly replaced and the user is redirected to the updated `InvoiceDetail` screen.

```mermaid
graph TD
    InvoiceEdit["UINode: InvoiceEdit (/invoices/:id/edit)"]
    InvoiceEdit --> GlobalHeaderIsland["SharedIsland: GlobalHeaderIsland"]
    InvoiceEdit --> InvoiceFormIsland["SharedIsland: InvoiceFormIsland"]

    InvoiceEdit -->|fetchInvoiceForEdit (GET /api/v1/invoices/:id)| InvoiceEdit
    InvoiceFormIsland -->|cancelFormAndReturnToDetail| InvoiceDetail["/invoices/:id"]
    InvoiceFormIsland -->|recalculateTotals| InvoiceFormIsland
    InvoiceFormIsland -->|liveConvertVndToWords| InvoiceFormIsland
    InvoiceFormIsland -->|submitUpdateDraft (PUT /api/v1/invoices/:id)| InvoiceDetail["/invoices/:id"]
```

---

## 2. Visual Hierarchy & Action Architecture

### 2.1 State Guard & Access Validation
* **Pre-requisite Check:** When mounted, `InvoiceEdit` verifies `status === 'DRAFT'`. If the invoice is `ISSUED`, `CANCELED`, or `REPLACED`, the page immediately displays an access restriction banner with a direct redirection link to `InvoiceDetail` (`/invoices/:id`).

### 2.2 Primary Action (Single CTA Priority)
* **Action:** `💾 Lưu Cập Nhật Bản Nháp` (`submitUpdateDraft` -> `PUT /api/v1/invoices/:id`)
* **Placement:** Fixed sticky bottom actions bar & Top-right header cluster.
* **Visual Style:** High-contrast Solid Primary Button (`bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-2.5 rounded-lg shadow-sm hover:shadow transition-all duration-200`).
* **Keyboard Shortcut:** `Ctrl + S` / `Cmd + S`.

### 2.3 Secondary Actions (Downgraded Controls)
* **`+ Thêm Dòng Hàng Hóa`:** Dashed outline button under items matrix (`Alt + A`).
* **VAT Rate Selector Buttons:** Segmented pill toggle (`0%`, `5%`, `8%`, `10%`).
* **Reset Changes Button:** Secondary ghost button allowing user to discard unsaved edits and restore initial draft values.

### 2.4 Cancel / Escape Action
* **Action:** `✕ Hủy Thay Đổi` (`cancelFormAndReturnToDetail` -> `/invoices/:id`).
* **Visual:** Ghost button (`text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium px-4 py-2.5 rounded-lg`).
* **Unsaved Changes Guard:** Displays a modal confirmation if any fields were modified: *"Bạn có thay đổi chưa lưu trên bản nháp này. Bạn có muốn hủy bỏ và quay lại xem chi tiết?"*.

---

## 3. Screen Layout & Component Structure

```
+---------------------------------------------------------------------------------------------------+
|  [GlobalHeaderIsland] - Logo | Hóa Đơn Điện Tử | [Danh Sách Hóa Đơn] | [User Profile]             |
+---------------------------------------------------------------------------------------------------+
|                                                                                                   |
|  [Page Header Bar]                                                                                |
|  [← Quay lại chi tiết HD-2026-00042]                                                              |
|  Chỉnh Sửa Bản Nháp Hóa Đơn: HD-2026-00042  [● BẢN NHÁP]        [✕ Hủy Bỏ] [💾 Lưu Cập Nhật]      |
|                                                                                                   |
|  [InvoiceFormIsland (Pre-filled with Existing Data)]                                              |
|  +----------------------------------------------------------------------------------------------+ |
|  | 1. THÔNG TIN BÊN BÁN & BÊN MUA HÀNG                                                          | |
|  | +------------------------------------+ +---------------------------------------------------+ | |
|  | | BÊN BÁN                            | | BÊN MUA HÀNG (Khách hàng)                         | | |
|  | | CTY TNHH GIẢI PHÁP SỐ...           | | Tên đơn vị / Người mua (*): [CTY CP CÔNG NGHỆ XYZ]| | |
|  | | MST: 0101234567                    | | Mã số thuế (MST):           [0319876543         ] | | |
|  | | Cầu Giấy, Hà Nội                   | | Địa chỉ trụ sở:             [Quận 1, TP.HCM     ] | | |
|  | | invoice@sol.vn                     | | Email nhận HĐ:              [ketoan@xyz.com     ] | | |
|  | | STK: 1903... - Techcombank         | | Hình thức thanh toán:       [Chuyển khoản     ▼]  | | |
|  | +------------------------------------+ +---------------------------------------------------+ | |
|  +----------------------------------------------------------------------------------------------+ |
|                                                                                                   |
|  +----------------------------------------------------------------------------------------------+ |
|  | 2. DANH MỤC HÀNG HÓA, DỊCH VỤ (Đang có 2 dòng)                                               | |
|  | +----+--------------------------+--------+---------+----------------+----------------+-----+ | |
|  | | STT| Tên Hàng Hóa / Dịch Vụ(*)| ĐVT (*)| SL (*)  | Đơn Giá (VNĐ)(*| Thành Tiền(VNĐ)| Xóa | | |
|  | |----+--------------------------+--------+---------+----------------+----------------+-----| | |
|  | | 1  | [Bản quyền phần mềm CRM] | [Gói]  | [  2  ] | [ 10.000.000 ] |   20.000.000 ₫ | [🗑] | | |
|  | | 2  | [Dịch vụ Setup hệ thống] | [Giờ]  | [  5  ] | [  1.000.000 ] |    5.000.000 ₫ | [🗑] | | |
|  | +----+--------------------------+--------+---------+----------------+----------------+-----+ | |
|  | [+ Thêm dòng mới (Alt+A)]                                                                    | |
|  +----------------------------------------------------------------------------------------------+ |
|                                                                                                   |
|  +----------------------------------------------------------------------------------------------+ |
|  | 3. TỔNG HỢP THANH TOÁN & THUẾ GTGT                                                           | |
|  | Ghi chú hóa đơn:                            | Tổng tiền hàng (chưa thuế):     25.000.000 ₫   | |
|  | [Thanh toán đợt 1 theo hợp đồng số 12/2026] | Thuế suất GTGT:  [ 0% | 5% | 8% | (10%) ]      | |
|  |                                             | Tiền thuế GTGT:                  2.500.000 ₫   | |
|  |                                             | ---------------------------------------------- | |
|  |                                             | TỔNG CỘNG THANH TOÁN:           27.500.000 ₫   | |
|  |                                             | Số tiền bằng chữ: Hai mươi bảy triệu năm trăm  | |
|  |                                             | nghìn đồng chẵn.                               | |
|  +----------------------------------------------------------------------------------------------+ |
|                                                                                                   |
|  [Sticky Bottom Form Actions Bar]                                                                 |
|  [✕ Hủy Bỏ]   [↺ Khôi Phục Dữ Liệu Gốc]                     [Ctrl+S] [💾 Lưu Cập Nhật Bản Nháp]   |
+---------------------------------------------------------------------------------------------------+
```

---

## 4. Mounted Island Detailed Specifications: `InvoiceFormIsland`

### 4.1 Form Population & Lifecycle Guard
* **Initial Loading (`fetchInvoiceForEdit`):**
  - Fetches existing invoice via `GET /api/v1/invoices/:id`.
  - Populates Buyer Information, Payment Method, Note, VAT Rate, and Line Items.
  - Automatically triggers `recalculateTotals` and `liveConvertVndToWords` on load to ensure arithmetic consistency.
* **Immutable Fields:**
  - `invoiceNumber`: Fixed PostgreSQL sequence number assigned during draft creation (cannot be modified).
  - `createdAt`: Original creation timestamp is preserved.
  - `seller*`: Seller organization profile fields remain tied to tenant configuration.

### 4.2 Editable Field Matrix
* **Buyer Entity:**
  - `buyerName` (`string`, required, 2-255 chars).
  - `buyerTaxCode` (`string`, optional, 10 or 14 digits regex format).
  - `buyerAddress` (`string`, optional).
  - `buyerEmail` (`string`, optional, valid email format).
  - `buyerPhone` (`string`, optional).
  - `paymentMethod` (`select`: Chuyển khoản, Tiền mặt, Chuyển khoản / Tiền mặt).
* **Line Items Table:**
  - User can add, edit, re-order, or delete line items.
  - Each item contains: `itemName`, `unit`, `quantity`, `unitPrice`, `lineTotal`.
  - Minimum 1 item required at all times.
* **VAT Rate & Note:**
  - `vatRate`: Toggle buttons `0%`, `5%`, `8%`, `10%` with live recalculation of `vatAmount` and `totalAmount`.
  - `note`: Textarea for contractual notes or customer terms.

---

## 5. Micro-Interactions, Feedback & State Transitions

| Trigger / Event | UI Transition / Animation | Visual Feedback |
|---|---|---|
| Initial Data Loading | Skeleton Loader | Pre-rendered form skeleton while fetching draft data from API. |
| Submit Draft Update (`submitUpdateDraft`) | `isSubmitting == true` -> `pulse` animation | Save button shows spinner and enters disabled state. |
| Validation Error | `validationError != null` -> `shake` animation | Invalid inputs highlight red (`border-rose-500`) and trigger subtle horizontal shake. |
| Modify Item Quantity / Price | Instant local recalculation (debounced 100ms) | Totals update dynamically; Vietnamese words text transitions with a smooth fade highlight. |
| Non-Draft Access Detected | `visibleIf` Guard Failure | Instant notification card: *"Hóa đơn này đã ở trạng thái ĐÃ PHÁT HÀNH và không thể chỉnh sửa"*. Auto-redirects to `/invoices/:id` after 3s. |

---

## 6. Edge Cases & Error States

### 6.1 State Race Condition (Draft Issued Concurrently by Another User)
* If another accounting user issued the invoice while this user was editing, submitting `PUT /api/v1/invoices/:id` will return HTTP 400 (`INVALID_TRANSITION` / `DRAFT_ONLY_MODIFICATION`).
* **Visual Handling:** Displays an alert banner: *"Không thể lưu: Hóa đơn này vừa được phát hành bởi người dùng khác."* + CTA `[Xem Chi Tiết Hóa Đơn]`.

### 6.2 Line Item Deletion Safeguard
* If the user attempts to delete the only remaining line item, the trash icon is disabled and a tooltip explains *"Hóa đơn phải có tối thiểu 1 hàng hóa / dịch vụ"*.

---

## 7. Responsive Specifications

* **Desktop (>= 1280px):** Full dual-column buyer/seller view with interactive desktop line items matrix and sticky bottom action toolbar.
* **Tablet (768px - 1279px):** Stacked vertical view with horizontal scrolling table.
* **Mobile (< 768px):** Line items represented as clean stacked form cards with quick delete buttons and bottom floating save bar.
