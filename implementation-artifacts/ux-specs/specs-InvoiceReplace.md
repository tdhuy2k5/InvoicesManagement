# UX & Screen Specification: InvoiceReplace (Lập Hóa Đơn Thay Thế)

> **Graph Node ID:** `InvoiceReplace`  
> **Route:** `/invoices/:id/replace`  
> **Title:** `Replace Issued Invoice - Thay Thế Hóa Đơn`  
> **Authentication & Role:** `AUTHENTICATED`  
> **Visibility Guard:** `invoice.status == "ISSUED" && invoice.originalInvoiceId == null` (Strict 1-Level Depth Cap Invariant AD-3 / FR-7)  
> **Parent / Layout Context:** Root Main Application Layout  
> **Mounted Islands:** `GlobalHeaderIsland`, `InvoiceReplacementBannerIsland`, `InvoiceFormIsland`

---

## 1. Executive Summary & Screen Purpose

The **InvoiceReplace** screen manages the legal replacement of an already issued commercial invoice (`ISSUED` state) in accordance with Vietnamese electronic invoice regulations (Nghị định 123/2020/NĐ-CP).

Because invoice replacement is a high-impact financial and audit transaction, this screen enforces two strict architectural invariants:
1. **Single-Level Depth Cap (FR-7 / AD-3):** Only root invoices (`originalInvoiceId == null`) can be replaced. Invoices that are themselves replacements cannot be replaced further (they must be canceled instead).
2. **Atomic Transition (AD-6):** In a single database transaction (`prisma.$transaction()`), the original invoice transitions from `ISSUED` to `REPLACED`, while the new replacement invoice is immediately created in `ISSUED` status with its own sequential number (`HD-YYYY-XXXXX`), linked to the original via `originalInvoiceId`, and queued for instantaneous PDF rendering.

```mermaid
graph TD
    InvoiceReplace["UINode: InvoiceReplace (/invoices/:id/replace)"]
    InvoiceReplace --> GlobalHeaderIsland["SharedIsland: GlobalHeaderIsland"]
    InvoiceReplace --> InvoiceReplacementBannerIsland["SharedIsland: InvoiceReplacementBannerIsland"]
    InvoiceReplace --> InvoiceFormIsland["SharedIsland: InvoiceFormIsland"]

    InvoiceReplace -->|fetchOriginalForReplacement (GET /api/v1/invoices/:id)| InvoiceReplace
    InvoiceFormIsland -->|cancelFormAndReturnToDetail| InvoiceDetail["/invoices/:id (Original)"]
    InvoiceFormIsland -->|recalculateTotals| InvoiceFormIsland
    InvoiceFormIsland -->|liveConvertVndToWords| InvoiceFormIsland
    InvoiceFormIsland -->|submitReplaceInvoice (POST /api/v1/invoices/:id/replace)| NewInvoiceDetail["/invoices/:newId (Replacement)"]
```

---

## 2. Visual Hierarchy & Action Architecture

### 2.1 State Guard & Depth Cap Verification
* **Guard Verification:** On component mount, the screen validates:
  - `invoice.status === 'ISSUED'`
  - `invoice.originalInvoiceId === null`
* If `originalInvoiceId !== null` (attempting multi-level replacement), access is blocked with a specialized guard banner: *"Hóa đơn này là hóa đơn thay thế. Quy định không cho phép lập hóa đơn thay thế cấp 2. Quý khách vui lòng thực hiện thủ tục Hủy Hóa Đơn."* + CTA button `[Quay Lại Chi Tiết]`.

### 2.2 Primary Action (Single CTA Priority)
* **Action:** `⚡ Xác Nhận & Phát Hành Hóa Đơn Thay Thế` (`submitReplaceInvoice` -> `POST /api/v1/invoices/:id/replace`)
* **Placement:** Prominently positioned in the sticky action footer and top-right form header.
* **Visual Style:** High-emphasis Amber-to-Emerald solid button (`bg-amber-600 hover:bg-amber-700 text-white font-semibold px-6 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200`).
* **Confirmation Step:** Triggers a high-priority confirmation dialog before firing the backend request.

### 2.3 Secondary Actions (Downgraded Controls)
* **`+ Thêm Dòng Hàng Hóa`:** Dashed outline button under line items (`Alt + A`).
* **VAT Rate Selector Buttons:** Segmented toggle (`0%`, `5%`, `8%`, `10%`).
* **Reset to Original Data:** Ghost button to reset modified fields back to the original invoice's values.

### 2.4 Cancel / Escape Action
* **Action:** `✕ Hủy Bỏ` (`cancelFormAndReturnToDetail` -> navigates back to original `/invoices/:id`).
* **Visual:** Ghost button (`text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium px-4 py-2.5 rounded-lg`).

---

## 3. Screen Layout & Component Structure

```
+---------------------------------------------------------------------------------------------------+
|  [GlobalHeaderIsland] - Logo | Hóa Đơn Điện Tử | [Danh Sách Hóa Đơn] | [User Profile]             |
+---------------------------------------------------------------------------------------------------+
|                                                                                                   |
|  [Page Header Bar]                                                                                |
|  [← Quay lại hóa đơn gốc HD-2026-00018]                                                           |
|  Lập Hóa Đơn Thay Thế (Thay thế cho HD-2026-00018)          [✕ Hủy Bỏ] [⚡ Xác Nhận Thay Thế]     |
|                                                                                                   |
|  [InvoiceReplacementBannerIsland]                                                                 |
|  +----------------------------------------------------------------------------------------------+ |
|  | ℹ THÔNG BÁO THAY THẾ HÓA ĐƠN ĐIỆN TỬ                                                         | |
|  | Bạn đang lập hóa đơn thay thế cho hóa đơn gốc HD-2026-00018 (Phát hành ngày 15/08/2026).     | |
|  | - Hóa đơn gốc HD-2026-00018 sẽ chuyển sang trạng thái: [REPLACED - Đã thay thế].              | |
|  | - Hóa đơn mới sẽ được cấp số mới theo sequence và phát hành ngay lập tức [ISSUED].           | |
|  +----------------------------------------------------------------------------------------------+ |
|                                                                                                   |
|  [InvoiceFormIsland (Pre-populated from Original Invoice)]                                       |
|  +----------------------------------------------------------------------------------------------+ |
|  | 1. THÔNG TIN BÊN BÁN & BÊN MUA HÀNG (Điều chỉnh nếu cần)                                     | |
|  | +------------------------------------+ +---------------------------------------------------+ | |
|  | | BÊN BÁN (Mặc định doanh nghiệp)    | | BÊN MUA HÀNG (Khách hàng)                         | | |
|  | | CTY TNHH GIẢI PHÁP SỐ...           | | Tên đơn vị / Người mua (*): [CTY CP THƯƠNG MẠI ABC] | |
|  | | MST: 0101234567                    | | Mã số thuế (MST):           [0109988776         ] | | |
|  | | Cầu Giấy, Hà Nội                   | | Địa chỉ trụ sở:             [Ba Đình, Hà Nội    ] | | |
|  | | invoice@sol.vn                     | | Email nhận HĐ:              [ketoan@abc.vn      ] | | |
|  | | STK: 1903... - Techcombank         | | Hình thức thanh toán:       [Chuyển khoản     ▼]  | | |
|  | +------------------------------------+ +---------------------------------------------------+ | |
|  +----------------------------------------------------------------------------------------------+ |
|                                                                                                   |
|  +----------------------------------------------------------------------------------------------+ |
|  | 2. DANH MỤC HÀNG HÓA, DỊCH VỤ THAY THẾ                                                        | |
|  | +----+--------------------------+--------+---------+----------------+----------------+-----+ | |
|  | | STT| Tên Hàng Hóa / Dịch Vụ(*)| ĐVT (*)| SL (*)  | Đơn Giá (VNĐ)(*| Thành Tiền(VNĐ)| Xóa | | |
|  | |----+--------------------------+--------+---------+----------------+----------------+-----| | |
|  | | 1  | [Phần mềm Quản lý Bán H..| [Gói]  | [  1  ] | [ 50.000.000 ] |   50.000.000 ₫ | [🗑] | | |
|  | +----+--------------------------+--------+---------+----------------+----------------+-----+ | |
|  | [+ Thêm dòng mới (Alt+A)]                                                                    | |
|  +----------------------------------------------------------------------------------------------+ |
|                                                                                                   |
|  +----------------------------------------------------------------------------------------------+ |
|  | 3. TỔNG HỢP THANH TOÁN & LÝ DO THAY THẾ                                                       | |
|  | Ghi chú / Căn cứ thay thế (*):              | Tổng tiền hàng (chưa thuế):     50.000.000 ₫   | |
|  | [Thay thế cho HĐ số HD-2026-00018 ngày      | Thuế suất GTGT:  [ 0% | 5% | 8% | (10%) ]      | |
|  | 15/08/2026 do sai sót thông tin MST khách]  | Tiền thuế GTGT:                  5.000.000 ₫   | |
|  |                                             | ---------------------------------------------- | |
|  |                                             | TỔNG CỘNG THANH TOÁN:           55.000.000 ₫   | |
|  |                                             | Số tiền bằng chữ: Năm mươi lăm triệu đồng chẵn.| |
|  +----------------------------------------------------------------------------------------------+ |
|                                                                                                   |
|  [Sticky Bottom Form Actions Bar]                                                                 |
|  [✕ Hủy Bỏ]                                                [⚡ Xác Nhận & Phát Hành HĐ Thay Thế]  |
+---------------------------------------------------------------------------------------------------+
```

---

## 4. Mounted Island Detailed Specifications

### 4.1 `InvoiceReplacementBannerIsland`
* **Visual Styling:** High-visibility amber banner (`bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 shadow-sm`).
* **Information Hierarchy:**
  - **Banner Title:** Warning/Information icon + *"Cơ Chế Thay Thế Hóa Đơn Điện Tử"*.
  - **Original Invoice Reference:** Monospace badge showing Original Invoice Number `HD-2026-00018`, Issue Date, and Original Buyer Name.
  - **Audit Implication:** Explicit explanation of the atomic transition (Original -> `REPLACED`, New -> `ISSUED` with fresh sequence number).

### 4.2 `InvoiceFormIsland` (Pre-Filled & Configured for Replacement)
* **Initial Data Ingestion:**
  - Automatically clones buyer profile, payment method, tax rate, and all line items from the original invoice.
  - Generates default standard replacement note: *"Thay thế cho hóa đơn số HD-YYYY-XXXXX ngày DD/MM/YYYY do điều chỉnh thông tin..."*.
* **Interactive Recalculations:**
  - Modifying line item quantities, prices, or tax rates immediately triggers `recalculateTotals` and updates `liveConvertVndToWords`.
* **Replacement Submission (`submitReplaceInvoice`):**
  - Sends `POST /api/v1/invoices/:originalId/replace` with updated payload.
  - On 200 OK, transitions the view directly to the newly created replacement invoice's `InvoiceDetail` page (`/invoices/:newId`).

---

## 5. Micro-Interactions, Feedback & State Transitions

| Trigger / Event | UI Transition / Animation | Visual Feedback |
|---|---|---|
| Click Submit Replacement | Modal Confirmation `scaleUp` | High-impact confirmation dialog: *"Xác nhận phát hành hóa đơn thay thế?"* with breakdown of changes. |
| Processing Atomic Replacement | `isSubmitting == true` -> `pulse` | Full-screen subtle overlay with spinner *"Đang thực hiện thay thế hóa đơn và khởi tạo bản in PDF..."*. |
| Replacement Success | Page Transition to `/invoices/:newId` | Green toast notification: *"Đã thay thế hóa đơn HD-2026-00018 bằng hóa đơn mới HD-2026-00045 thành công!"*. |
| Depth Cap Violation (Multi-level) | Guard Alert Block | Red alert block blocking form entry: *"Hóa đơn này là hóa đơn thay thế. Không thể thực hiện thay thế tiếp theo."*. |

---

## 6. Edge Cases & Error States

### 6.1 Replacement Depth Cap Violation (HTTP 400 `REPLACEMENT_NOT_ALLOWED`)
* If an invoice already has `originalInvoiceId != null`, attempting to replace it is rejected at the API and UI layers.
* **UI Handling:** The replacement button is hidden, and direct URL navigation triggers a full-page notification directing the user to use the **Cancel Invoice** flow instead.

### 6.2 Concurrent Status Change
* If the original invoice was canceled or already replaced concurrently by another user, the transaction rolls back cleanly with error message: *"Hóa đơn gốc không còn ở trạng thái hợp lệ để thay thế."*.

---

## 7. Responsive Specifications

* **Desktop (>= 1280px):** Full-width view with prominent warning banner, two-column party data, and side-by-side note & total calculations.
* **Tablet (768px - 1279px):** Single-column stacked layout with horizontal scrolling item table.
* **Mobile (< 768px):** Sticky warning banner, stacked item cards, and bottom full-width CTA button `[⚡ Phát Hành HĐ Thay Thế]`.
