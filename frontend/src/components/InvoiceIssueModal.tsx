import React from 'react';
import { useIssueInvoice } from '../hooks/useIssueInvoice';

export interface InvoiceIssueModalProps {
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
 * InvoiceIssueModal
 * Confirmation modal for issuing a draft invoice (DRAFT -> ISSUED).
 * Locks invoice from further editing, initiates digital signing, and generates legal PDF.
 * Mounted on: `InvoiceDetail` (`/invoices/:id`)
 */
export const InvoiceIssueModal: React.FC<InvoiceIssueModalProps> = ({
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
  const [simStep, setSimStep] = React.useState<number>(0);
  const [isSimulating, setIsSimulating] = React.useState<boolean>(false);

  // Handle ESC key press
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting && !isSimulating) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, isSimulating, onClose]);

  // Reset simulation state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setSimStep(0);
      setIsSimulating(false);
    }
  }, [isOpen]);

  const handleIssueClick = async () => {
    setIsSimulating(true);
    setSimStep(1); // Bước 1: Ký số
    await new Promise((r) => setTimeout(r, 450));
    setSimStep(2); // Bước 2: Gửi Cổng Thuế
    await new Promise((r) => setTimeout(r, 550));
    setSimStep(3); // Bước 3: Cấp mã CQT
    await new Promise((r) => setTimeout(r, 400));
    await onConfirm();
    setIsSimulating(false);
  };

  if (!isOpen) return null;

  const formattedAmount = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(totalAmount);

  const busy = isSubmitting || isSimulating;

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
          if (!busy) onClose();
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
            Ký Số & Phát Hành Hóa Đơn 1C
          </h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm">
            Ký duyệt điện tử và gửi dữ liệu lên <strong>Cổng Tổng Cục Thuế</strong> để cấp Mã CQT cho bản nháp{' '}
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

          {/* Simulation Progress Stepper */}
          {busy ? (
            <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-700 rounded-lg space-y-2.5">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <span className="material-symbols-outlined animate-spin text-[16px]">sync</span>
                Tiến trình truyền nhận dữ liệu Tổng Cục Thuế
              </div>
              <div className="space-y-1.5 text-xs">
                <div className={`flex items-center gap-2 ${simStep >= 1 ? 'text-emerald-700 dark:text-emerald-400 font-semibold' : 'text-on-surface-variant'}`}>
                  <span className="material-symbols-outlined text-[16px]">{simStep >= 1 ? 'check_circle' : 'hourglass_empty'}</span>
                  <span>1. Đang đóng Chữ ký số doanh nghiệp ({signerName})</span>
                </div>
                <div className={`flex items-center gap-2 ${simStep >= 2 ? 'text-emerald-700 dark:text-emerald-400 font-semibold' : 'text-on-surface-variant'}`}>
                  <span className="material-symbols-outlined text-[16px]">{simStep >= 2 ? 'check_circle' : 'hourglass_empty'}</span>
                  <span>2. Đang gửi gói tin XML lên Cổng tiếp nhận Tổng Cục Thuế...</span>
                </div>
                <div className={`flex items-center gap-2 ${simStep >= 3 ? 'text-emerald-700 dark:text-emerald-400 font-semibold' : 'text-on-surface-variant'}`}>
                  <span className="material-symbols-outlined text-[16px]">{simStep >= 3 ? 'check_circle' : 'hourglass_empty'}</span>
                  <span>3. Tổng Cục Thuế kiểm tra & Cấp Mã CQT thành công!</span>
                </div>
              </div>
            </div>
          ) : (
            /* Legal Checklist / Implications */
            <div className="space-y-2.5 font-body-sm text-body-sm text-on-surface">
              <div className="flex items-start gap-2.5">
                <span
                  className="material-symbols-outlined text-secondary text-[18px] mt-0.5 shrink-0"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
                <span>
                  Hóa đơn sẽ được cấp số chính thức liên tục (Zero-Gap) và <strong>khóa chỉnh sửa dữ liệu</strong>.
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
                <span className="material-symbols-outlined text-emerald-600 text-[18px] mt-0.5 shrink-0">
                  account_balance
                </span>
                <span>
                  Tổng Cục Thuế tự động cấp <strong>Mã CQT chuẩn Nghị định 123</strong> và lưu trữ bản thể hiện PDF.
                </span>
              </div>
            </div>
          )}

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
            disabled={busy}
            onClick={onClose}
            className="px-4 py-2 text-on-surface-variant hover:bg-surface-variant rounded-lg font-tabular-nums text-tabular-nums font-medium transition disabled:opacity-50"
          >
            Hủy Bỏ
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={handleIssueClick}
            className="px-6 py-2 bg-secondary text-on-secondary hover:opacity-90 rounded-lg font-tabular-nums text-tabular-nums font-bold transition flex items-center gap-2 shadow-sm disabled:opacity-60"
          >
            {busy ? (
              <>
                <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                <span>Đang Truyền Cổng Thuế...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">verified</span>
                <span>Ký Số & Phát Hành 1C</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceIssueModal;
