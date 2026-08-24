import React, { useEffect } from 'react';
import { useDeleteDraftInvoice } from '../hooks/useDeleteDraftInvoice';

export interface InvoiceDeleteModalProps {
  /** Controls modal visibility */
  isOpen: boolean;
  /** Callback to close or dismiss modal */
  onClose: () => void;
  /** Callback to confirm physical draft deletion */
  onConfirm: () => void | Promise<void>;
  /** Unique ID of the draft invoice */
  invoiceId?: string;
  /** Draft invoice display code/number (e.g. DRAFT-00042) */
  invoiceNumber?: string;
  /** Customer / Buyer company name */
  customerName?: string;
  /** Total draft amount (VND) */
  totalAmount?: number;
  /** Draft creation date */
  createdAt?: string | Date;
  /** Loading state during deletion request */
  isSubmitting?: boolean;
  /** Error message if delete operation fails */
  errorMessage?: string | null;
  /** Additional CSS class names */
  className?: string;
}

export { useDeleteDraftInvoice };

/**
 * InvoiceDeleteModal
 * Confirmation modal for permanently deleting a draft invoice (DRAFT state only).
 * Complies with strict invariant that only unissued DRAFT invoices can be physically deleted.
 * Mounted on: `InvoiceList` (`/invoices`), `InvoiceDetail` (`/invoices/:id`)
 */
export const InvoiceDeleteModal: React.FC<InvoiceDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  invoiceId,
  invoiceNumber = 'DRAFT-00042',
  customerName = 'CÔNG TY TNHH GIẢI PHÁP SỐ TOÀN CẦU',
  totalAmount = 27500000,
  createdAt,
  isSubmitting = false,
  errorMessage = null,
  className = '',
}) => {
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

  const formattedAmount = totalAmount !== undefined && totalAmount !== null
    ? new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(totalAmount)
    : null;

  const formattedDate = createdAt
    ? typeof createdAt === 'string'
      ? createdAt
      : new Date(createdAt).toLocaleDateString('vi-VN')
    : null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto ${className}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm transition-opacity"
        onClick={() => {
          if (!isSubmitting) onClose();
        }}
      />

      {/* Modal Card with scaleUp animation */}
      <div className="relative bg-surface rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.15)] overflow-hidden border border-outline-variant w-full max-w-[500px] z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header with Red Warning Icon */}
        <div className="bg-rose-50 dark:bg-rose-950/40 p-6 flex flex-col items-center text-center border-b border-rose-200 dark:border-rose-800">
          <div className="w-16 h-16 bg-white dark:bg-surface rounded-full flex items-center justify-center shadow-sm mb-3 border border-rose-200 dark:border-rose-800">
            <span
              className="material-symbols-outlined text-error text-[34px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              delete_forever
            </span>
          </div>
          <h3
            id="delete-modal-title"
            className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-on-surface mb-1"
          >
            Xác Nhận Xóa Bản Nháp
          </h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm">
            Bạn có chắc chắn muốn xóa bản nháp hóa đơn{' '}
            <strong className="font-tabular-nums text-error">{invoiceNumber}</strong>?
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {/* Summary Box */}
          <div className="bg-surface-container-low border border-outline-variant rounded-lg p-3.5 space-y-2 font-tabular-nums text-tabular-nums text-sm">
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Mã bản nháp:</span>
              <span className="font-bold text-primary">{invoiceNumber}</span>
            </div>
            {customerName && (
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Khách hàng:</span>
                <span className="font-semibold text-on-surface text-right truncate max-w-[220px]">
                  {customerName}
                </span>
              </div>
            )}
            {formattedDate && (
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Ngày tạo:</span>
                <span className="text-on-surface">{formattedDate}</span>
              </div>
            )}
            {formattedAmount && (
              <div className="flex justify-between border-t border-outline-variant pt-2">
                <span className="font-bold text-on-surface">Tổng tiền:</span>
                <span className="font-bold text-error">{formattedAmount}</span>
              </div>
            )}
          </div>

          {/* Warning Message */}
          <div className="bg-rose-50/60 border border-rose-200 rounded-lg p-3 text-xs text-rose-900 leading-relaxed flex items-start gap-2">
            <span className="material-symbols-outlined text-error text-[16px] mt-0.5 shrink-0">
              warning
            </span>
            <span>
              <strong>Lưu ý:</strong> Hành động này sẽ xóa vĩnh viễn bản ghi hóa đơn và tất cả các dòng hàng hóa liên quan. Dữ liệu không thể khôi phục sau khi xóa.
            </span>
          </div>

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
            Hủy Bỏ
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => onConfirm()}
            className="px-6 py-2 bg-error text-on-error hover:opacity-90 rounded-lg font-tabular-nums text-tabular-nums font-bold transition flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                <span>Đang Xóa Bản Nháp...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">delete</span>
                <span>Xóa Vĩnh Viễn</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDeleteModal;
