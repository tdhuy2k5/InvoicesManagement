import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer-core';
import { AppError } from '../utils/AppError';
import { ErrorCode, InvoiceModel, InvoiceStatus, PdfStreamResultDTO } from '../types/invoice.types';
import { IInvoiceRepository, IPdfService } from './InvoiceService';

export interface ICurrencyToWordsUtil {
  convertVndToWords(amount: number): string;
}

export class PdfService implements IPdfService {
  private readonly storageDir: string;
  private readonly chromiumPath: string;

  constructor(
    private readonly invoiceRepo: IInvoiceRepository,
    private readonly currencyUtil: ICurrencyToWordsUtil,
    storageDir?: string,
    chromiumPath?: string
  ) {
    this.storageDir = storageDir || path.resolve(process.cwd(), 'storage', 'pdfs');
    this.chromiumPath = chromiumPath || process.env.CHROMIUM_PATH || '/usr/bin/chromium';

    // Ensure storage directory exists
    if (!fs.existsSync(this.storageDir)) {
      fs.mkdirSync(this.storageDir, { recursive: true });
    }
  }

  /**
   * Helper: Get cache file path for an invoice
   */
  private getCacheFilePath(invoiceNumber: string): string {
    const sanitizedNumber = invoiceNumber.replace(/[^a-zA-Z0-9_-]/g, '_');
    return path.join(this.storageDir, `${sanitizedNumber}.pdf`);
  }

  /**
   * Helper: Format Date to Vietnamese format (Ngày DD tháng MM năm YYYY)
   */
  private formatVietnameseDate(dateInput?: Date | string | null): string {
    const d = dateInput ? new Date(dateInput) : new Date();
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `Ngày ${day} tháng ${month} năm ${year}`;
  }

  /**
   * Helper: Format number to VND currency string (e.g. 10.000.000)
   */
  private formatVnd(amount: number): string {
    return new Intl.NumberFormat('vi-VN').format(Math.round(amount));
  }

  /**
   * Helper: Render Tax Code Boxes for PDF
   */
  private renderTaxCodeBoxesHtml(taxCode?: string | null): string {
    const cleanCode = (taxCode || '').replace(/[^0-9A-Za-z]/g, '');
    const mainPart = cleanCode.slice(0, 10).padEnd(10, ' ').split('');
    const subPart = cleanCode.slice(10, 13).padEnd(3, ' ').split('');

    const mainBoxes = mainPart
      .map(
        (char) =>
          `<span style="display: inline-block; width: 18px; height: 18px; line-height: 18px; text-align: center; border-right: 1px solid #9ca3af; font-family: monospace; font-size: 11px; font-weight: bold; color: #111827;">${char.trim()}</span>`
      )
      .join('');

    const subBoxes = subPart
      .map(
        (char) =>
          `<span style="display: inline-block; width: 18px; height: 18px; line-height: 18px; text-align: center; border-right: 1px solid #9ca3af; font-family: monospace; font-size: 11px; font-weight: bold; color: #111827;">${char.trim()}</span>`
      )
      .join('');

    return `
      <div style="display: inline-flex; align-items: center; gap: 4px; vertical-align: middle;">
        <div style="display: inline-flex; border: 1px solid #1f2937; background: #fff;">
          ${mainBoxes}
        </div>
        <span style="font-weight: bold; color: #4b5563;">-</span>
        <div style="display: inline-flex; border: 1px solid #1f2937; background: #fff;">
          ${subBoxes}
        </div>
      </div>
    `;
  }

  /**
   * Render HTML invoice template for Vietnamese A4 printing
   * 100% synchronized with frontend InvoiceVatTemplate.tsx
   */
  renderInvoiceHtml(invoice: InvoiceModel, amountInWords: string): string {
    const activeDate = invoice.issueDate ? new Date(invoice.issueDate) : (invoice.createdAt ? new Date(invoice.createdAt) : new Date());
    const dayStr = String(activeDate.getDate()).padStart(2, '0');
    const monthStr = String(activeDate.getMonth() + 1).padStart(2, '0');
    const yearStr = String(activeDate.getFullYear());

    const subtotal = Number(invoice.totalAmount);
    const vatAmount = Number(invoice.vatAmount);
    const grandTotal = subtotal + vatAmount;
    const isDraft = invoice.status === InvoiceStatus.DRAFT;
    const isCanceled = invoice.status === InvoiceStatus.CANCELED;
    const isIssued = invoice.status === InvoiceStatus.ISSUED || invoice.status === InvoiceStatus.REPLACED;
    const displayNo = (invoice.sequenceNumber !== undefined && invoice.sequenceNumber !== null)
      ? String(invoice.sequenceNumber).padStart(7, '0')
      : (invoice.invoiceNumber ? (invoice.invoiceNumber.replace(/[^\d]/g, '').padStart(7, '0') || invoice.invoiceNumber) : '0000001');

    const itemsRows = (invoice.items || [])
      .map((item, index) => {
        return `
          <tr>
            <td class="text-center" style="font-family: monospace;">${index + 1}</td>
            <td class="break-word" style="font-weight: 500;">${item.description}</td>
            <td class="text-center">${item.unit}</td>
            <td class="text-right" style="font-family: monospace;">${item.quantity}</td>
            <td class="text-right" style="font-family: monospace;">${this.formatVnd(Number(item.unitPrice))}</td>
            <td class="text-right" style="font-family: monospace; font-weight: bold;">${this.formatVnd(Number(item.amount))}</td>
          </tr>
        `;
      })
      .join('');

    const minRows = 5;
    const currentLength = (invoice.items || []).length;
    const blankRows = Array.from({ length: Math.max(0, minRows - currentLength) })
      .map((_, idx) => `
        <tr style="height: 22px;">
          <td class="text-center" style="color: #cbd5e1; font-family: monospace;">${currentLength + idx + 1}</td>
          <td></td><td></td><td></td><td></td><td></td>
        </tr>
      `).join('');

    return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Hóa đơn ${invoice.invoiceNumber}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 10mm 12mm 12mm 12mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: "Times New Roman", Times, "Liberation Serif", serif;
      letter-spacing: normal;
    }
    body {
      color: #111827;
      font-size: 13px;
      line-height: 1.35;
      padding: 6px;
      position: relative;
    }
    .watermark {
      position: absolute;
      top: 35%;
      left: 15%;
      right: 15%;
      text-align: center;
      transform: rotate(-35deg);
      opacity: 0.13;
      border: 6px dashed #1e293b;
      padding: 20px;
      border-radius: 16px;
      pointer-events: none;
      z-index: 10;
    }
    .watermark-title {
      font-size: 40px;
      line-height: 1.2;
      font-weight: bold;
      text-transform: uppercase;
      color: #1e293b;
    }
    .watermark-sub {
      font-size: 15px;
      line-height: 1.3;
      font-weight: bold;
      margin-top: 10px;
    }
    .watermark-cancel {
      border-color: #b91c1c;
      color: #b91c1c;
    }
    .watermark-cancel .watermark-title {
      color: #b91c1c;
    }
    .top-meta {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 1px solid #111827;
      padding-bottom: 6px;
      margin-bottom: 10px;
      font-size: 11px;
    }
    .top-tax-dept {
      text-transform: uppercase;
      font-weight: bold;
      font-family: sans-serif;
      color: #1f2937;
    }
    .top-meta-right {
      text-align: right;
      font-family: sans-serif;
      font-size: 11px;
      line-height: 1.4;
    }
    .header-title-box {
      text-align: center;
      margin: 6px 0 12px;
    }
    .header-title {
      font-size: 22px;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #111827;
    }
    .header-copy {
      font-size: 12px;
      font-weight: 600;
      font-style: italic;
      color: #374151;
      margin-top: 2px;
    }
    .header-date {
      font-size: 12px;
      font-style: italic;
      color: #1f2937;
      margin-top: 4px;
    }
    .replacement-banner {
      background-color: #fef3c7;
      color: #92400e;
      padding: 6px 12px;
      border-radius: 4px;
      margin: 8px 0;
      font-size: 11px;
      text-align: center;
      border: 1px solid #fde68a;
    }
    .info-box {
      border: 1px solid #1f2937;
      border-radius: 4px;
      padding: 8px 10px;
      margin-bottom: 10px;
      background: #ffffff;
      font-size: 12px;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .info-line {
      display: flex;
      align-items: baseline;
      margin-bottom: 4px;
    }
    .info-line:last-child {
      margin-bottom: 0;
    }
    .info-label {
      width: 110px;
      flex-shrink: 0;
      font-weight: bold;
      color: #111827;
    }
    table.invoice-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 10px;
      font-size: 12px;
      border: 1px solid #1f2937;
    }
    table.invoice-table thead {
      display: table-header-group;
    }
    table.invoice-table tr {
      page-break-inside: avoid;
      break-inside: avoid;
    }
    table.invoice-table th, table.invoice-table td {
      border: 1px solid #1f2937;
      padding: 5px 6px;
    }
    table.invoice-table th {
      background-color: #f3f4f6;
      font-weight: bold;
      text-align: center;
    }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .break-word { word-break: break-word; }
    
    .summary-box {
      border: 1px solid #1f2937;
      border-radius: 4px;
      padding: 8px 10px;
      margin-bottom: 12px;
      font-size: 12px;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      padding-bottom: 4px;
      border-bottom: 1px dashed #d1d5db;
      margin-bottom: 4px;
    }
    .summary-row-total {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      padding-top: 2px;
    }
    .summary-words {
      border-top: 1px solid #d1d5db;
      padding-top: 4px;
      margin-top: 4px;
      font-style: italic;
      color: #1f2937;
    }
    .signatures {
      display: flex;
      justify-content: space-between;
      margin: 14px 0 10px;
      text-align: center;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .sig-block {
      width: 45%;
    }
    .sig-title {
      font-size: 12px;
      font-weight: bold;
      text-transform: uppercase;
    }
    .sig-note {
      font-size: 11px;
      font-style: italic;
      color: #4b5563;
    }
    .sig-seal {
      margin: 6px auto 0;
      width: 200px;
      border: 2px solid #dc2626;
      color: #dc2626;
      padding: 6px 8px;
      border-radius: 4px;
      text-align: left;
      font-size: 10px;
      background: #fef2f2;
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    }
    .footer-note {
      border-top: 1px solid #1f2937;
      padding-top: 6px;
      margin-top: 12px;
      font-size: 10px;
      color: #374151;
      font-family: sans-serif;
      page-break-inside: avoid;
      break-inside: avoid;
    }
  </style>
</head>
<body>
  ${isDraft ? `
    <div class="watermark">
      <div class="watermark-title">BẢN NHÁP</div>
      <div class="watermark-sub">(DRAFT - CHƯA CÓ GIÁ TRỊ PHÁP LÝ)</div>
    </div>
  ` : ''}

  ${isCanceled ? `
    <div class="watermark watermark-cancel">
      <div class="watermark-title">HÓA ĐƠN ĐÃ HỦY</div>
      <div class="watermark-sub">(CANCELED INVOICE)</div>
    </div>
  ` : ''}

  <!-- TOP META LINE -->
  <div class="top-meta">
    <div class="top-tax-dept">
      TÊN CỤC THUẾ: <span style="font-family: serif; font-weight: normal; text-transform: none;">${invoice.taxDepartment || 'CỤC THUẾ TP. HÀ NỘI'}</span>
    </div>
    <div class="top-meta-right">
      <div>Mẫu số: <strong style="font-family: monospace;">${invoice.templateCode || '01GTKT3/001'}</strong></div>
      <div>Ký hiệu: <strong style="font-family: monospace;">${invoice.zone || '1C26TAA'}</strong></div>
      <div>Số: <strong style="color: #dc2626; font-size: 14px; font-family: monospace; letter-spacing: 0.5px;">${displayNo}</strong></div>
      ${invoice.taxAuthorityCode ? `<div>Mã CQT: <strong style="color: #047857; font-size: 11px; font-family: monospace; letter-spacing: 0.5px;">${invoice.taxAuthorityCode}</strong></div>` : ''}
    </div>
  </div>

  <!-- TITLE & DATE -->
  <div class="header-title-box">
    <div class="header-title">HÓA ĐƠN GIÁ TRỊ GIA TĂNG</div>
    <div class="header-copy">
      Liên 1: Lưu
      ${isDraft ? '<span style="color: #b45309; font-weight: bold; font-style: normal; margin-left: 8px;">(BẢN NHÁP - XEM TRƯỚC)</span>' : ''}
    </div>
    <div class="header-date">
      Ngày ${dayStr} tháng ${monthStr} năm ${yearStr}
    </div>
  </div>

  ${(() => {
    if (!invoice.originalInvoiceId) return '';
    const origNum = (invoice as any).originalInvoiceNumber || (invoice as any).originalInvoice?.invoiceNumber;
    if (origNum) {
      return `
        <div class="replacement-banner">
          ⚠️ <em>Hóa đơn này thay thế cho hóa đơn số <strong>${origNum}</strong></em>
        </div>
      `;
    }
    const match = invoice.notes?.match(/Thay thế cho hóa đơn\s*(?:số)?\s*([A-Z0-9-]+)/i);
    if (match && match[1]) {
      return `
        <div class="replacement-banner">
          ⚠️ <em>Hóa đơn này thay thế cho hóa đơn số <strong>${match[1]}</strong></em>
        </div>
      `;
    }
    return `
      <div class="replacement-banner">
        ⚠️ <em>Hóa đơn này thay thế cho hóa đơn gốc đã lập theo thỏa thuận 2 bên (Nghị định 123/2020/NĐ-CP)</em>
      </div>
    `;
  })()}

  <!-- SELLER SECTION (FULL-WIDTH BOX) -->
  <div class="info-box">
    <div class="info-line">
      <span class="info-label">Tên người bán:</span>
      <span style="font-weight: bold; text-transform: uppercase; color: #111827;">${invoice.sellerName || '......................................................................................'}</span>
    </div>
    <div class="info-line" style="margin: 3px 0;">
      <span class="info-label">Mã số thuế:</span>
      ${this.renderTaxCodeBoxesHtml(invoice.sellerTaxCode)}
    </div>
    <div class="info-line">
      <span class="info-label">Địa chỉ:</span>
      <span style="color: #1f2937;">${invoice.sellerAddress || '......................................................................................'}</span>
    </div>
    <div style="display: flex; justify-content: space-between; margin-top: 3px;">
      <div style="display: flex; align-items: baseline;">
        <span class="info-label">Điện thoại:</span>
        <span style="font-family: monospace;">${invoice.sellerPhone || '......................'}</span>
      </div>
      <div style="display: flex; align-items: baseline;">
        <span style="font-weight: bold; margin-right: 6px;">Số tài khoản:</span>
        <span style="font-family: monospace; font-weight: bold; color: #111827;">${invoice.sellerBankAccount || '......................'}</span>
      </div>
    </div>
  </div>

  <!-- BUYER SECTION (FULL-WIDTH BOX) -->
  <div class="info-box">
    <div class="info-line">
      <span class="info-label">Tên người mua:</span>
      <span style="font-weight: bold; text-transform: uppercase; color: #111827;">${invoice.customerName || '......................................................................................'}</span>
    </div>
    <div class="info-line" style="margin: 3px 0;">
      <span class="info-label">Mã số thuế:</span>
      ${invoice.customerTaxCode ? this.renderTaxCodeBoxesHtml(invoice.customerTaxCode) : '<span style="font-style: italic; color: #6b7280; font-size: 11px;">(Không có MST)</span>'}
    </div>
    <div class="info-line">
      <span class="info-label">Địa chỉ:</span>
      <span style="color: #1f2937;">${invoice.customerAddress || '......................................................................................'}</span>
    </div>
    <div style="display: flex; justify-content: space-between; margin-top: 3px;">
      <div style="display: flex; align-items: baseline;">
        <span class="info-label">Hình thức TT:</span>
        <span>${invoice.paymentMethod || 'Chuyển khoản (TM/CK)'}</span>
      </div>
      ${invoice.customerBankAccount ? `
        <div style="display: flex; align-items: baseline;">
          <span style="font-weight: bold; margin-right: 6px;">Số tài khoản:</span>
          <span style="font-family: monospace; font-weight: bold; color: #111827;">${invoice.customerBankAccount}</span>
        </div>
      ` : ''}
    </div>
  </div>

  <!-- ITEMS TABLE -->
  <table class="invoice-table">
    <thead>
      <tr>
        <th style="width: 38px;">STT<br><span style="font-weight: normal; font-size: 10px;">(1)</span></th>
        <th>Tên hàng hóa, dịch vụ<br><span style="font-weight: normal; font-size: 10px;">(2)</span></th>
        <th style="width: 60px;">Đơn vị tính<br><span style="font-weight: normal; font-size: 10px;">(3)</span></th>
        <th style="width: 65px;">Số lượng<br><span style="font-weight: normal; font-size: 10px;">(4)</span></th>
        <th style="width: 95px;">Đơn giá<br><span style="font-weight: normal; font-size: 10px;">(5)</span></th>
        <th style="width: 115px;">Thành tiền<br><span style="font-weight: normal; font-size: 10px;">(6=4x5)</span></th>
      </tr>
    </thead>
    <tbody>
      ${itemsRows}
      ${blankRows}
    </tbody>
  </table>

  <!-- SUMMARY TOTALS BOX -->
  <div class="summary-box">
    <div class="summary-row">
      <span style="font-weight: bold;">Cộng tiền hàng:</span>
      <span style="font-family: monospace; font-weight: bold; color: #111827;">${this.formatVnd(subtotal)} ₫</span>
    </div>
    <div class="summary-row">
      <div>
        <span style="font-weight: bold;">Thuế suất GTGT: </span>
        <span style="font-weight: bold;">${invoice.vatRate}%</span>
      </div>
      <div>
        <span style="font-weight: bold;">Tiền thuế GTGT: </span>
        <span style="font-family: monospace; font-weight: bold; color: #111827;">${this.formatVnd(vatAmount)} ₫</span>
      </div>
    </div>
    <div class="summary-row-total">
      <span style="font-weight: bold; font-size: 13px; text-transform: uppercase;">Tổng cộng tiền thanh toán:</span>
      <span style="font-family: monospace; font-weight: bold; font-size: 15px; color: #dc2626;">${this.formatVnd(grandTotal)} ₫</span>
    </div>
    <div class="summary-words">
      Số tiền viết bằng chữ: <strong style="font-style: normal; color: #111827;">${amountInWords}</strong>
    </div>
  </div>

  <!-- SIGNATURES SECTION -->
  <div class="signatures">
    <div class="sig-block">
      <div class="sig-title">NGƯỜI MUA HÀNG</div>
      <div class="sig-note">(Ký, ghi rõ họ, tên)</div>
      <div style="height: 65px;"></div>
    </div>
    <div class="sig-block">
      <div class="sig-title">NGƯỜI BÁN HÀNG</div>
      <div class="sig-note">(Ký, đóng dấu, ghi rõ họ, tên)</div>
      ${isIssued ? `
        <div class="sig-seal">
          <div style="font-weight: bold; border-bottom: 1px solid #fca5a5; padding-bottom: 2px; text-align: center;">✓ ĐÃ KÝ ĐIỆN TỬ</div>
          <div style="margin-top: 3px; font-weight: bold; font-size: 10px;">${invoice.sellerName}</div>
          <div style="font-size: 9px; color: #4b5563; margin-top: 2px;">Ngày: ${activeDate.toLocaleString('vi-VN')}</div>
        </div>
      ` : `
        <div style="height: 55px; display: flex; align-items: center; justify-content: center; font-size: 11px; color: #b45309; font-style: italic; border: 1px dashed #fde68a; background: #fefce8; border-radius: 4px; margin-top: 6px;">
          (Chưa ký điện tử - Bản Nháp)
        </div>
      `}
    </div>
  </div>

  <div style="text-align: center; font-size: 11px; font-style: italic; color: #4b5563; margin-top: 6px;">
    (Cần kiểm tra, đối chiếu khi lập, giao, nhận hóa đơn)
  </div>

  <!-- FOOTER COPIES NOTE -->
  <div class="footer-note">
    <div style="font-weight: bold;">Ghi chú:</div>
    <div style="display: flex; gap: 16px; margin-top: 2px;">
      <span>- Liên 1: Lưu</span>
      <span>- Liên 2: Giao người mua</span>
      <span>- Liên 3: Nội bộ</span>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Invalidates cached PDF file from disk storage when invoice state mutates.
   */
  async invalidatePdfCache(invoiceNumber: string): Promise<void> {
    try {
      const cachePath = this.getCacheFilePath(invoiceNumber);
      if (fs.existsSync(cachePath)) {
        await fs.promises.unlink(cachePath);
      }
    } catch (err) {
      console.warn(`[PdfService] Could not invalidate cache for invoice ${invoiceNumber}:`, err);
    }
  }

  /**
   * Renders A4 PDF using Puppeteer Core against Chromium and persists to disk cache.
   */
  async generatePdfFromHtml(html: string, outputPath: string): Promise<Buffer> {
    let browser;
    try {
      const executablePath = fs.existsSync(this.chromiumPath)
        ? this.chromiumPath
        : undefined;

      browser = await puppeteer.launch({
        executablePath,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
        headless: true,
      });

      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdfBufferUint8 = await page.pdf({
        format: 'A4',
        printBackground: true,
        displayHeaderFooter: true,
        headerTemplate: '<div></div>',
        footerTemplate: '<div style="font-size: 9px; text-align: right; width: 100%; padding-right: 15mm; color: #6b7280; font-family: \'Times New Roman\', serif;">Trang <span class="pageNumber"></span>/<span class="totalPages"></span></div>',
        margin: {
          top: '10mm',
          right: '10mm',
          bottom: '14mm',
          left: '10mm',
        },
      });

      const buffer = Buffer.from(pdfBufferUint8);
      await fs.promises.writeFile(outputPath, buffer);
      return buffer;
    } catch (error) {
      throw new AppError(
        500,
        ErrorCode.INTERNAL_SERVER_ERROR,
        `PDF generation failed: ${(error as Error).message}`
      );
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  /**
   * Retrieves an invoice PDF stream either from disk cache or generates on demand.
   */
  async getInvoicePdfStream(id: string | number, isDownload = false): Promise<PdfStreamResultDTO> {
    const invoice = await this.invoiceRepo.findInvoiceById(id);

    if (!invoice) {
      throw new AppError(404, ErrorCode.INVOICE_NOT_FOUND, `Invoice with ID ${id} was not found`);
    }

    const cachePath = this.getCacheFilePath(invoice.invoiceNumber);

    let pdfBuffer: Buffer;
    if (fs.existsSync(cachePath)) {
      pdfBuffer = await fs.promises.readFile(cachePath);
    } else {
      const grandTotal = Number(invoice.totalAmount) + Number(invoice.vatAmount);
      const amountInWords = this.currencyUtil.convertVndToWords(grandTotal);
      const html = this.renderInvoiceHtml(invoice, amountInWords);
      pdfBuffer = await this.generatePdfFromHtml(html, cachePath);
    }

    return {
      buffer: pdfBuffer,
      filename: `${invoice.invoiceNumber}.pdf`,
      contentType: 'application/pdf',
      isDownload: Boolean(isDownload),
    };
  }
}
