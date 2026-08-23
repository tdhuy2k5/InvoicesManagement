import React from 'react';
import { useIssueInvoice } from '../hooks/useIssueInvoice';

export interface InvoiceIssueModalIslandProps {
  /** Controls modal visibility */
  isOpen: boolean;
  /** Callback to close or dismiss modal */
  onClose: () => void;
  /** Callback to confirm and trigger issueInvoice */
  onConfirm: () => void | Promise<void>;
  /** Invoice unique identifier */
  invoiceId?: string;
  /** Draft invoice number or code (e.g. DRAFT-00042) */
  invoiceNumber?: string;
  /** Customer / Buyer company name */
  customerName?: string;
  /** Total amount payable (VND) */
  totalAmount?: number;
  /** Signer name or business legal name */
  signerName?: string;
  /** Customer email receiving the invoice */
  customerEmail?: string;
  /** Loading state while issuing */
  isSubmitting?: boolean;
  /** Error message if issue operation failed */
  errorMessage?: string | null;
  /** Additional CSS class names */
  className?: string;
}

export { useIssueInvoice };

/**
 * InvoiceIssueModalIsland
 * Confirmation modal for issuing a draft invoice (DRAFT -> ISSUED).
 * Locks invoice from further editing, initiates digital signing, and generates legal PDF.
 * 
 * Matches graph-master.cypher: `:SharedIsland { id: "InvoiceIssueModalIsland", visibleIf: "invoice.status == 'DRAFT'" }`
 * Mounted on: `InvoiceDetail` (`/invoices/:id`)
 * Transitions: `:TRANSITIONS_TO { if: "isOpen == true", animation: "scaleUp" }`
 */
export const InvoiceIssueModalIsland: React.FC<InvoiceIssueModalIslandProps> = ({
  isOpen,
  onClose,
  onConfirm,
  invoiceId,
  invoiceNumber = 'DRAFT-00042',
  customerName = 'CÔNG TY TNHH GIẢI PHÁP SỐ TOÀN CẦU',
  totalAmount = 27500000,
  signerName = 'Công Ty Cổ Phần Công Nghệ Alpha Tech',
  customerEmail = 'contact@globalsolutions.vn',
  isSubmitting = false,
  errorMessage = null,
  className = '',
}) => {
  // Handle ESC key press
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const formattedAmount = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(totalAmount);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto ${className}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="issue-modal-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm transition-opacity"
        onClick={() => {
          if (!isSubmitting) onClose();
        }}
      />

      {/* Modal Card with scaleUp animation */}
      <div className="relative bg-surface rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.15)] overflow-hidden border border-outline-variant w-full max-w-[540px] z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header with Emerald Tone */}
        <div className="bg-emerald-50 dark:bg-emerald-950/40 p-6 flex flex-col items-center text-center border-b border-emerald-200 dark:border-emerald-800">
          <div className="w-16 h-16 bg-white dark:bg-surface rounded-full flex items-center justify-center shadow-sm mb-3 border border-emerald-200 dark:border-emerald-800">
            <span
              className="material-symbols-outlined text-secondary text-[34px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              verified_user
            </span>
          </div>
          <h3
            id="issue-modal-title"
            className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-on-surface mb-1"
          >
            Xác Nhận Phát Hành Hóa Đơn
          </h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm">
            Bạn đang chuẩn bị ký số điện tử và phát hành chính thức hóa đơn{' '}
            <strong className="font-tabular-nums text-primary">{invoiceNumber}</strong>.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {/* Summary Box */}
          <div className="bg-surface-container-low border border-outline-variant rounded-lg p-3.5 space-y-2 font-tabular-nums text-tabular-nums">
            <div className="flex justify-between text-sm">
              <span className="text-on-surface-variant">Khách hàng / Đơn vị mua:</span>
              <span className="font-semibold text-on-surface text-right truncate max-w-[240px]">
                {customerName}
              </span>
            </div>
            {customerEmail && (
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">Email nhận hóa đơn:</span>
                <span className="text-on-surface text-right">{customerEmail}</span>
              </div>
            )}
            <div className="flex justify-between text-sm border-t border-outline-variant pt-2">
              <span className="font-bold text-on-surface">Tổng tiền thanh toán:</span>
              <span className="font-bold text-secondary text-base">{formattedAmount}</span>
            </div>
          </div>

          {/* Legal Checklist / Implications */}
          <div className="space-y-2.5 font-body-sm text-body-sm text-on-surface">
            <div className="flex items-start gap-2.5">
              <span
                className="material-symbols-outlined text-secondary text-[18px] mt-0.5 shrink-0"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check_circle
              </span>
              <span>
                Hóa đơn sẽ được cấp số chính thức theo dải ký hiệu và <strong>khóa chỉnh sửa dữ liệu</strong>.
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="material-symbols-outlined text-primary text-[18px] mt-0.5 shrink-0">
                fingerprint
              </span>
              <span>
                Tự động áp dụng Chữ ký số của <strong>{signerName}</strong>.
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="material-symbols-outlined text-outline text-[18px] mt-0.5 shrink-0">
                picture_as_pdf
              </span>
              <span>
                Hệ thống tự động biên dịch và lưu trữ bản thể hiện PDF tiêu chuẩn Nghị định 123/2020/NĐ-CP.
              </span>
            </div>
          </div>

          {/* Error display if any */}
          {errorMessage && (
            <div className="bg-rose-50 border border-rose-200 text-error p-3 rounded-lg text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">error</span>
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-surface-container-low border-t border-outline-variant flex justify-end gap-3 items-center">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="px-4 py-2 text-on-surface-variant hover:bg-surface-variant rounded-lg font-tabular-nums text-tabular-nums font-medium transition disabled:opacity-50"
          >
            Hủy Bỏ
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => onConfirm()}
            className="px-6 py-2 bg-secondary text-on-secondary hover:opacity-90 rounded-lg font-tabular-nums text-tabular-nums font-bold transition flex items-center gap-2 shadow-sm disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                <span>Đang Ký Số & Phát Hành...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">verified</span>
                <span>Ký Số & Phát Hành Ngay</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceIssueModalIsland;
