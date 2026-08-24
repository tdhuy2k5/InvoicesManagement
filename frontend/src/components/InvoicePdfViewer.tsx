import React, { useState } from 'react';
import { useInvoicePdf } from '../hooks/useInvoicePdf';

export interface InvoicePdfItem {
  id?: number | string;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface InvoicePdfViewerProps {
  invoiceId?: string;
  invoiceNumber?: string;
  serialNumber?: string;
  pdfUrl?: string | null;
  sellerName?: string;
  sellerTaxCode?: string;
  sellerAddress?: string;
  sellerPhone?: string;
  sellerBankAccount?: string;
  customerName?: string;
  customerTaxCode?: string;
  customerAddress?: string;
  paymentMethod?: string;
  items?: InvoicePdfItem[];
  subtotalAmount?: number;
  vatRate?: number;
  vatAmount?: number;
  totalAmount?: number;
  amountInWords?: string;
  isSigned?: boolean;
  signerName?: string;
  signedAt?: string;
  isLoadingPdf?: boolean;
  onDownloadPdf?: (id?: string) => void;
  onPrintPdf?: (id?: string) => void;
  className?: string;
}

export { useInvoicePdf };

/**
 * InvoicePdfViewer
 * Live sticky A4 Electronic Invoice PDF Document Preview & Interactive Toolbar.
 * Mounted on: `InvoiceDetail` (`/invoices/:id`)
 * State Mutations:
 * - `previewPdfStream` (executes: getInvoicePdfStream)
 * - `downloadPdfFile` (executes: getInvoicePdfStream)
 */
export const InvoicePdfViewer: React.FC<InvoicePdfViewerProps> = ({
  invoiceId,
  invoiceNumber = 'HD-2026-00042',
  serialNumber = '1C26TAA',
  pdfUrl = null,
  sellerName = 'CÔNG TY CỔ PHẦN CÔNG NGHỆ VÀ TRUYỀN THÔNG ALPHA',
  sellerTaxCode = '0101234567',
  sellerAddress = 'Tầng 3, Tòa nhà Alpha, 123 Đường Công Nghệ, Cầu Giấy, Hà Nội',
  sellerPhone = '024 3838 9999',
  sellerBankAccount = '19031234567890 - Techcombank (CN Thăng Long)',
  customerName = 'CÔNG TY TNHH GIẢI PHÁP SỐ TOÀN CẦU',
  customerTaxCode = '0319876543',
  customerAddress = '456 Lê Lợi, Phường Bến Nghé, Quận 1, TP. HCM',
  paymentMethod = 'Chuyển khoản (TM/CK)',
  items = [
    {
      id: 1,
      description: 'Bản quyền phần mềm Quản trị Doanh nghiệp ERP Cloud (Gói 12 tháng)',
      unit: 'Gói',
      quantity: 1,
      unitPrice: 20000000,
      amount: 20000000,
    },
    {
      id: 2,
      description: 'Dịch vụ đào tạo và cấu hình phân quyền hệ thống tại chỗ',
      unit: 'Buổi',
      quantity: 5,
      unitPrice: 1000000,
      amount: 5000000,
    },
  ],
  subtotalAmount = 25000000,
  vatRate = 10,
  vatAmount = 2500000,
  totalAmount = 27500000,
  amountInWords = 'Hai mươi bảy triệu năm trăm nghìn đồng chẵn.',
  isSigned = true,
  signerName = 'CÔNG TY CỔ PHẦN CÔNG NGHỆ VÀ TRUYỀN THÔNG ALPHA',
  signedAt = '22/08/2026 15:00:12',
  isLoadingPdf = false,
  onDownloadPdf,
  onPrintPdf,
  className = '',
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 15, 160));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 15, 60));
  };

  const handleZoomReset = () => {
    setZoomLevel(100);
  };

  const formatNumber = (val: number) => {
    return new Intl.NumberFormat('vi-VN').format(val);
  };

  return (
    <div className={`w-full h-full bg-surface-container-low flex flex-col border-t lg:border-t-0 border-outline-variant relative overflow-hidden ${className}`}>
      {/* PDF Toolbar */}
      <div className="h-12 border-b border-outline-variant bg-surface flex items-center justify-between px-4 shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-1">
          <button
            type="button"
            title="Thu nhỏ"
            onClick={handleZoomOut}
            className="p-1.5 text-on-surface-variant hover:bg-surface-container hover:text-primary rounded transition"
          >
            <span className="material-symbols-outlined text-[18px]">remove</span>
          </button>
          <button
            type="button"
            title="Đặt lại 100%"
            onClick={handleZoomReset}
            className="font-tabular-nums text-tabular-nums text-primary w-14 text-center px-1 py-0.5 rounded hover:bg-surface-container transition font-medium"
          >
            {zoomLevel}%
          </button>
          <button
            type="button"
            title="Phóng to"
            onClick={handleZoomIn}
            className="p-1.5 text-on-surface-variant hover:bg-surface-container hover:text-primary rounded transition"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
          </button>
        </div>

        <span className="font-body-sm text-body-sm text-on-surface-variant hidden sm:inline">
          Trang 1 / 1
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            title="In ngay"
            onClick={() => onPrintPdf?.(invoiceId)}
            className="p-1.5 text-on-surface-variant hover:bg-surface-container hover:text-primary rounded transition flex items-center gap-1 text-body-sm"
          >
            <span className="material-symbols-outlined text-[18px]">print</span>
            <span className="hidden sm:inline">In</span>
          </button>
          <button
            type="button"
            title="Tải PDF"
            onClick={() => onDownloadPdf?.(invoiceId)}
            className="p-1.5 text-on-surface-variant hover:bg-surface-container hover:text-primary rounded transition flex items-center gap-1 text-body-sm"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span className="hidden sm:inline">Tải về</span>
          </button>
        </div>
      </div>

      {/* PDF Canvas Area */}
      <div className="flex-1 overflow-auto p-4 md:p-8 flex justify-center items-start bg-surface-container custom-scrollbar">
        {isLoadingPdf ? (
          <div className="w-full max-w-[800px] bg-white shadow-xl min-h-[900px] border border-outline-variant p-10 flex flex-col items-center justify-center animate-pulse">
            <div className="flex flex-col items-center gap-4 text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl animate-spin">sync</span>
              <span className="font-body-md text-body-md">Đang tải bản thể hiện hóa đơn điện tử...</span>
            </div>
          </div>
        ) : pdfUrl ? (
          <iframe
            src={pdfUrl}
            title={`PDF Preview ${invoiceNumber}`}
            className="w-full max-w-[800px] min-h-[900px] bg-white shadow-xl border border-outline-variant rounded"
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
          />
        ) : (
          <div
            className="w-full max-w-[800px] bg-white shadow-xl min-h-[1050px] border border-outline-variant p-8 md:p-12 flex flex-col justify-between relative transition-transform duration-200 select-text"
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
          >
            {/* Header section of legal tax invoice */}
            <div>
              <div className="text-center border-b-2 border-primary pb-4 mb-6">
                <h2 className="text-2xl font-bold text-primary mb-1 uppercase tracking-wide font-serif">
                  HÓA ĐƠN GIÁ TRỊ GIA TĂNG
                </h2>
                <p className="text-xs text-on-surface-variant italic font-serif">
                  (Bản thể hiện của hóa đơn điện tử)
                </p>
                <div className="mt-4 flex justify-between text-xs text-primary font-serif">
                  <div>Ký hiệu (Serial): <span className="font-bold">{serialNumber}</span></div>
                  <div>Số (No.): <span className="text-error font-bold font-mono text-sm">{(invoiceNumber.match(/\d+$/)?.[0] || '0000001').padStart(7, '0')}</span></div>
                </div>
              </div>

              {/* Seller details */}
              <div className="text-xs text-on-surface space-y-1 mb-4 border-b border-outline-variant/60 pb-3">
                <div className="font-bold text-sm text-primary uppercase">{sellerName}</div>
                <div>Mã số thuế (Tax code): <span className="font-mono font-semibold">{sellerTaxCode}</span></div>
                <div>Địa chỉ: {sellerAddress}</div>
                <div>Điện thoại: {sellerPhone} | Số tài khoản: <span className="font-mono">{sellerBankAccount}</span></div>
              </div>

              {/* Buyer details */}
              <div className="text-xs text-on-surface space-y-1 mb-5 border-b border-outline-variant/60 pb-3">
                <div>Đơn vị mua hàng: <span className="font-bold text-primary uppercase">{customerName}</span></div>
                <div>Mã số thuế: <span className="font-mono font-semibold">{customerTaxCode}</span></div>
                <div>Địa chỉ: {customerAddress}</div>
                <div>Hình thức thanh toán: {paymentMethod}</div>
              </div>

              {/* Items Table inside PDF canvas */}
              <table className="w-full text-left text-xs border border-outline-variant mb-4">
                <thead className="bg-surface-container-low font-semibold text-primary border-b border-outline-variant">
                  <tr>
                    <th className="p-2 border-r border-outline-variant w-8 text-center">STT</th>
                    <th className="p-2 border-r border-outline-variant">Tên Hàng Hóa, Dịch Vụ</th>
                    <th className="p-2 border-r border-outline-variant w-14 text-center">ĐVT</th>
                    <th className="p-2 border-r border-outline-variant w-16 text-right">Số lượng</th>
                    <th className="p-2 border-r border-outline-variant w-24 text-right">Đơn giá</th>
                    <th className="p-2 text-right w-24">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {items.map((item, idx) => (
                    <tr key={item.id ?? idx}>
                      <td className="p-2 border-r border-outline-variant text-center font-mono">{idx + 1}</td>
                      <td className="p-2 border-r border-outline-variant">{item.description}</td>
                      <td className="p-2 border-r border-outline-variant text-center">{item.unit}</td>
                      <td className="p-2 border-r border-outline-variant text-right font-mono">{formatNumber(item.quantity)}</td>
                      <td className="p-2 border-r border-outline-variant text-right font-mono">{formatNumber(item.unitPrice)}</td>
                      <td className="p-2 text-right font-mono font-medium">{formatNumber(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals Table inside PDF */}
              <div className="border border-outline-variant text-xs space-y-1.5 p-3 mb-4 bg-surface-container-lowest">
                <div className="flex justify-between">
                  <span>Cộng tiền hàng:</span>
                  <span className="font-mono font-medium">{formatNumber(subtotalAmount)} ₫</span>
                </div>
                <div className="flex justify-between">
                  <span>Thuế suất GTGT: <span className="font-semibold">{vatRate}%</span> | Tiền thuế GTGT:</span>
                  <span className="font-mono font-medium">{formatNumber(vatAmount)} ₫</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-primary border-t border-outline-variant/60 pt-1.5">
                  <span>Tổng cộng tiền thanh toán:</span>
                  <span className="font-mono text-error">{formatNumber(totalAmount)} ₫</span>
                </div>
                <div className="italic text-on-surface-variant pt-1 border-t border-outline-variant/40">
                  Số tiền viết bằng chữ: <span className="font-medium text-primary not-italic">{amountInWords}</span>
                </div>
              </div>
            </div>

            {/* Bottom Digital Signature Seal */}
            <div className="relative pt-6 pb-2 mt-4 flex justify-between items-end text-xs">
              <div className="text-center w-48">
                <div className="font-bold">NGƯỜI MUA HÀNG</div>
                <div className="text-[10px] text-on-surface-variant italic">(Ký, ghi rõ họ tên)</div>
              </div>

              <div className="text-center w-64 relative">
                <div className="font-bold">NGƯỜI BÁN HÀNG</div>
                <div className="text-[10px] text-on-surface-variant italic">(Ký, đóng dấu điện tử)</div>

                {isSigned && (
                  <div className="mt-2 border-2 border-error text-error p-2.5 w-full text-center bg-error/5 rotate-[-2deg] rounded shadow-sm">
                    <div className="font-bold text-[11px] uppercase border-b border-error/40 pb-0.5">
                      ✓ ĐÃ KÝ ĐIỆN TỬ
                    </div>
                    <div className="text-[9px] font-semibold mt-1 leading-tight">{signerName}</div>
                    <div className="text-[8px] opacity-80 mt-0.5 font-mono">Ngày: {signedAt}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoicePdfViewer;
