import React, { useState, useEffect } from 'react';
import { InvoiceVatTemplate } from './InvoiceVatTemplate';
import { InvoiceItem } from '../mockData';
import { invoiceApi } from '../services/invoiceApi';

export interface InvoicePrintModalProps {
  isOpen: boolean;
  onClose: () => void;

  invoiceId: string;
  templateCode?: string;
  serialNumber?: string;
  invoiceNumber?: string;
  sequenceNumber?: number;
  issueDate?: string | null;
  createdAt?: string;
  status?: string;

  taxDepartment?: string;
  sellerName?: string;
  sellerTaxCode?: string;
  sellerAddress?: string;
  sellerPhone?: string;
  sellerBankAccount?: string;

  customerName?: string;
  customerTaxCode?: string;
  customerAddress?: string;
  customerBankAccount?: string;
  paymentMethod?: string;

  items?: InvoiceItem[];
  subtotalAmount?: number;
  vatRate?: number;
  vatAmount?: number;
  totalAmount?: number;
  amountInWords?: string;

  signedBy?: string | null;
  signedAt?: string | null;
  originalInvoiceId?: string | null;
  originalInvoiceNumber?: string | null;
  originalIssueDate?: string | null;
  taxAuthorityCode?: string | null;
}

/**
 * InvoicePrintModal
 * Modal xem trước và in ấn hóa đơn GTGT chuẩn theo mẫu Bộ Tài Chính
 */
export const InvoicePrintModal: React.FC<InvoicePrintModalProps> = ({
  isOpen,
  onClose,
  invoiceId,
  templateCode = '01GTKT3/001',
  serialNumber = '1C26TAA',
  invoiceNumber = '0000001',
  sequenceNumber,
  issueDate,
  createdAt,
  status = 'DRAFT',
  taxDepartment = 'CỤC THUẾ TP. HÀ NỘI',
  taxAuthorityCode,
  sellerName,
  sellerTaxCode,
  sellerAddress,
  sellerPhone,
  sellerBankAccount,
  customerName,
  customerTaxCode,
  customerAddress,
  customerBankAccount,
  paymentMethod,
  items = [],
  subtotalAmount,
  vatRate,
  vatAmount,
  totalAmount,
  amountInWords,
  signedBy,
  signedAt,
  originalInvoiceId,
  originalInvoiceNumber,
  originalIssueDate,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [copyType, setCopyType] = useState<'LIEN_1' | 'LIEN_2' | 'LIEN_3'>('LIEN_1');
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [isPrinting, setIsPrinting] = useState<boolean>(false);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 15, 150));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 15, 60));
  const handleZoomReset = () => setZoomLevel(100);

  /**
   * Direct PDF printing: Fetches exact PDF from backend and triggers native PDF print
   * Ensures 100% identical styling, headers, and vector resolution with Downloaded PDF
   */
  const handlePrint = async () => {
    if (isPrinting) return;
    setIsPrinting(true);
    try {
      const url = invoiceApi.getPdfDownloadUrl(invoiceId, false);
      const res = await fetch(url);
      if (!res.ok) throw new Error('Không thể tải PDF để in');
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);

      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      iframe.src = blobUrl;
      document.body.appendChild(iframe);

      iframe.onload = () => {
        setTimeout(() => {
          try {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
          } catch {
            const printWindow = window.open(blobUrl, '_blank');
            printWindow?.focus();
            printWindow?.print();
          }
          setTimeout(() => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
            URL.revokeObjectURL(blobUrl);
          }, 60000);
        }, 300);
      };
    } catch {
      window.print();
    } finally {
      setIsPrinting(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      await invoiceApi.downloadPdf(invoiceId, invoiceNumber);
    } catch {
      const url = invoiceApi.getPdfDownloadUrl(invoiceId, true);
      window.open(url, '_blank');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm print:p-0 print:bg-white print:static print:inset-auto">
      {/* Modal Container */}
      <div className="bg-surface rounded-2xl border border-outline-variant shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-fadeIn print:border-none print:shadow-none print:max-w-none print:max-h-none print:rounded-none">
        {/* Modal Toolbar (Hidden during browser print) */}
        <div className="px-4 py-3 bg-surface-container border-b border-outline-variant flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden">
          {/* Left: Title & Copy selector */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">print</span>
              <span className="font-bold text-sm sm:text-base text-primary">
                Xem Trước &amp; In Hóa Đơn
              </span>
            </div>

            {/* Select Copy */}
            <div className="flex items-center bg-surface rounded-lg p-0.5 border border-outline-variant text-xs">
              <button
                type="button"
                onClick={() => setCopyType('LIEN_1')}
                className={`px-2.5 py-1 rounded font-medium transition ${
                  copyType === 'LIEN_1'
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                Liên 1 (Lưu)
              </button>
              <button
                type="button"
                onClick={() => setCopyType('LIEN_2')}
                className={`px-2.5 py-1 rounded font-medium transition ${
                  copyType === 'LIEN_2'
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                Liên 2 (Người mua)
              </button>
              <button
                type="button"
                onClick={() => setCopyType('LIEN_3')}
                className={`px-2.5 py-1 rounded font-medium transition ${
                  copyType === 'LIEN_3'
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                Liên 3 (Nội bộ)
              </button>
            </div>
          </div>

          {/* Right: Zoom controls & Actions */}
          <div className="flex items-center gap-2">
            {/* Zoom toolbar */}
            <div className="hidden sm:flex items-center bg-surface border border-outline-variant rounded-lg p-0.5 text-xs">
              <button
                type="button"
                onClick={handleZoomOut}
                title="Thu nhỏ"
                className="p-1 hover:bg-surface-container-low rounded text-on-surface-variant hover:text-primary"
              >
                <span className="material-symbols-outlined text-[18px]">remove</span>
              </button>
              <button
                type="button"
                onClick={handleZoomReset}
                title="Đặt lại 100%"
                className="px-2 py-0.5 font-mono font-medium text-primary"
              >
                {zoomLevel}%
              </button>
              <button
                type="button"
                onClick={handleZoomIn}
                title="Phóng to"
                className="p-1 hover:bg-surface-container-low rounded text-on-surface-variant hover:text-primary"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
              </button>
            </div>

            {/* Action Buttons */}
            <button
              type="button"
              disabled={isPrinting}
              onClick={handlePrint}
              className={`px-3.5 py-1.5 bg-primary text-on-primary rounded-lg text-xs font-semibold hover:opacity-90 transition flex items-center gap-1.5 shadow-sm ${
                isPrinting ? 'opacity-70 cursor-wait' : ''
              }`}
            >
              {isPrinting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Đang Chuẩn Bị In...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">print</span>
                  <span>In Ngay</span>
                </>
              )}
            </button>

            <button
              type="button"
              disabled={isDownloading}
              onClick={handleDownloadPdf}
              className={`px-3 py-1.5 bg-surface text-primary border border-outline rounded-lg text-xs font-semibold hover:bg-surface-container-low transition flex items-center gap-1.5 ${
                isDownloading ? 'opacity-70 cursor-wait' : ''
              }`}
            >
              {isDownloading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                  <span>Đang Tạo PDF...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  <span>Tải PDF</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-on-surface-variant hover:bg-surface-container-high rounded-lg transition"
              title="Đóng cửa sổ"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Scrollable Preview Canvas */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-surface-container-low flex justify-center items-start print:p-0 print:bg-white print:overflow-visible print:block print:w-full">
          <div
            className="w-full flex justify-center transition-transform duration-200 print:block print:w-full print:transform-none print:m-0 print:p-0"
            style={{ transform: zoomLevel !== 100 ? `scale(${zoomLevel / 100})` : undefined, transformOrigin: 'top center' }}
          >
            <InvoiceVatTemplate
              templateCode={templateCode}
              serialNumber={serialNumber}
              invoiceNumber={invoiceNumber}
              sequenceNumber={sequenceNumber}
              issueDate={issueDate}
              createdAt={createdAt}
              copyType={copyType}
              taxDepartment={taxDepartment}
              sellerName={sellerName}
              sellerTaxCode={sellerTaxCode}
              sellerAddress={sellerAddress}
              sellerPhone={sellerPhone}
              sellerBankAccount={sellerBankAccount}
              customerName={customerName}
              customerTaxCode={customerTaxCode}
              customerAddress={customerAddress}
              customerBankAccount={customerBankAccount}
              paymentMethod={paymentMethod}
              items={items}
              subtotalAmount={subtotalAmount}
              vatRate={vatRate}
              vatAmount={vatAmount}
              totalAmount={totalAmount}
              amountInWords={amountInWords}
              isSigned={status === 'ISSUED' || status === 'REPLACED'}
              signerName={signedBy || sellerName}
              signedAt={signedAt}
              originalInvoiceId={originalInvoiceId}
              originalInvoiceNumber={originalInvoiceNumber}
              originalIssueDate={originalIssueDate}
              taxAuthorityCode={taxAuthorityCode}
              status={status}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePrintModal;
