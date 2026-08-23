import React, { useState, useEffect } from 'react';
import { useCancelInvoice } from '../hooks/useCancelInvoice';

export interface InvoiceCancelModalIslandProps {
  /** Controls modal visibility */
  isOpen: boolean;
  /** Callback to close or dismiss modal */
  onClose: () => void;
  /** Callback to confirm cancellation with reason */
  onConfirm: (cancelReason: string) => void | Promise<void>;
  /** Invoice unique identifier */
  invoiceId?: string;
  /** Invoice official number (e.g. HD-2026-00042) */
  invoiceNumber?: string;
  /** Customer / Buyer company name */
  customerName?: string;
  /** Total amount of the invoice (VND) */
  totalAmount?: number;
  /** Issue date of the invoice */
  issueDate?: string | Date;
  /** Loading state during cancellation request */
  isSubmitting?: boolean;
  /** Error message if cancel operation failed */
  errorMessage?: string | null;
  /** Additional CSS class names */
  className?: string;
}

export { useCancelInvoice };

/**
 * InvoiceCancelModalIsland
 * Destructive action modal for canceling an issued commercial invoice (ISSUED -> CANCELED).
 * Requires mandatory legal cancellation reason in accordance with Decree 123/2020/ND-CP.
 * 
 * Matches graph-master.cypher: `:SharedIsland { id: "InvoiceCancelModalIsland", visibleIf: "invoice.status == 'ISSUED'" }`
 * Mounted on: `InvoiceList` (`/invoices`), `InvoiceDetail` (`/invoices/:id`)
 * Transitions: `:TRANSITIONS_TO { if: "isOpen == true", animation: "scaleUp" }`
 */
export const InvoiceCancelModalIsland: React.FC<InvoiceCancelModalIslandProps> = ({
  isOpen,
  onClose,
  onConfirm,
  invoiceId,
  invoiceNumber = 'HD-2026-00042',
  customerName = 'CÔNG TY TNHH GIẢI PHÁP SỐ TOÀN CẦU',
  totalAmount = 27500000,
  issueDate = '22/08/2026',
  isSubmitting = false,
  errorMessage = null,
  className = '',
}) => {
  const [cancelReason, setCancelReason] = useState('');
  const [touched, setTouched] = useState(false);
  const [hasAgreementMinutes, setHasAgreementMinutes] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setCancelReason('');
      setTouched(false);
      setHasAgreementMinutes(false);
    }
  }, [isOpen]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const isReasonValid = cancelReason.trim().length >= 5;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!isReasonValid || isSubmitting) return;
    onConfirm(cancelReason.trim());
  };

  const formattedAmount = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(totalAmount);

  const formattedDate = typeof issueDate === 'string'
    ? issueDate
    : new Date(issueDate).toLocaleDateString('vi-VN');

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto ${className}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-modal-title"
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
        {/* Header with Destructive Rose Tone */}
        <div className="bg-rose-50 dark:bg-rose-950/40 p-6 flex flex-col items-center text-center border-b border-rose-200 dark:border-rose-800">
          <div className="w-16 h-16 bg-white dark:bg-surface rounded-full flex items-center justify-center shadow-sm mb-3 border border-rose-200 dark:border-rose-800">
            <span
              className="material-symbols-outlined text-error text-[34px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              cancel
            </span>
          </div>
          <h3
            id="cancel-modal-title"
            className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-on-surface mb-1"
          >
            Xác Nhận Hủy Hóa Đơn Điện Tử
          </h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm">
            Bạn đang yêu cầu hủy hóa đơn đã phát hành{' '}
            <strong className="font-tabular-nums text-error">{invoiceNumber}</strong>.
          </p>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            {/* Summary Box */}
            <div className="bg-surface-container-low border border-outline-variant rounded-lg p-3.5 space-y-2 font-tabular-nums text-tabular-nums text-sm">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Số hóa đơn:</span>
                <span className="font-bold text-primary">{invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Ngày phát hành:</span>
                <span className="text-on-surface">{formattedDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Khách hàng:</span>
                <span className="font-semibold text-on-surface text-right truncate max-w-[240px]">
                  {customerName}
                </span>
              </div>
              <div className="flex justify-between border-t border-outline-variant pt-2">
                <span className="font-bold text-on-surface">Tổng tiền:</span>
                <span className="font-bold text-error">{formattedAmount}</span>
              </div>
            </div>

            {/* Legal Warning Notice */}
            <div className="bg-rose-50/70 border border-rose-200/80 rounded-lg p-3 text-xs text-rose-900 leading-relaxed flex items-start gap-2">
              <span className="material-symbols-outlined text-error text-[16px] mt-0.5 shrink-0">
                warning
              </span>
              <span>
                <strong>Cảnh báo pháp lý:</strong> Hóa đơn sau khi hủy sẽ chuyển sang trạng thái <strong>CANCELED</strong>, mất hoàn toàn giá trị pháp lý và không thể khôi phục.
              </span>
            </div>

            {/* Cancel Reason Field (Mandatory) */}
            <div className="space-y-1.5">
              <label
                htmlFor="cancel-reason-input"
                className="font-label-md text-xs uppercase font-bold text-on-surface flex items-center justify-between"
              >
                <span>
                  Lý Do Hủy Hóa Đơn <span className="text-error">*</span>
                </span>
                <span className="text-on-surface-variant font-normal lowercase text-[11px]">
                  (tối thiểu 5 ký tự)
                </span>
              </label>
              <textarea
                id="cancel-reason-input"
                rows={3}
                required
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                onBlur={() => setTouched(true)}
                placeholder="Ví dụ: Hai bên thống nhất hủy hóa đơn do sai sót thông tin đơn giá và chủng loại hàng hóa theo Biên bản hủy số..."
                className={`w-full bg-surface border rounded-lg p-3 font-body-sm text-body-sm focus:outline-none focus:ring-1 transition resize-none ${
                  touched && !isReasonValid
                    ? 'border-error focus:border-error focus:ring-error'
                    : 'border-outline-variant focus:border-primary focus:ring-primary'
                }`}
              />
              {touched && !isReasonValid && (
                <p className="text-xs text-error flex items-center gap-1 mt-1">
                  <span className="material-symbols-outlined text-[14px]">error</span>
                  Vui lòng nhập lý do hủy hợp lệ (tối thiểu 5 ký tự).
                </p>
              )}
            </div>

            {/* Agreement Minutes Checkbox */}
            <label className="flex items-start gap-2.5 cursor-pointer select-none text-xs text-on-surface-variant">
              <input
                type="checkbox"
                checked={hasAgreementMinutes}
                onChange={(e) => setHasAgreementMinutes(e.target.checked)}
                className="mt-0.5 rounded border-outline-variant text-error focus:ring-error"
              />
              <span>
                Đã lập và ký Biên bản hủy hóa đơn / Biên bản thỏa thuận thu hồi hóa đơn giữa hai bên (nếu có).
              </span>
            </label>

            {/* Error display if API fails */}
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
              Đóng
            </button>
            <button
              type="submit"
              disabled={!isReasonValid || isSubmitting}
              className="px-6 py-2 bg-error text-on-error hover:opacity-90 rounded-lg font-tabular-nums text-tabular-nums font-bold transition flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                  <span>Đang Thực Hiện Hủy...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">delete_forever</span>
                  <span>Xác Nhận Hủy Hóa Đơn</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvoiceCancelModalIsland;
