import React from 'react';
import { useInvoiceReplacement } from '../hooks/useInvoiceReplacement';

export interface InvoiceReplacementBannerProps {
  /** Original invoice number being replaced (e.g. HD-2026-00018) */
  originalInvoiceNumber?: string;
  /** Original invoice ID in database */
  originalInvoiceId?: string;
  /** Issue date of the original invoice */
  originalIssueDate?: string | Date;
  /** Name of the customer/buyer from the original invoice */
  customerName?: string;
  /** Total amount of the original invoice */
  totalAmount?: number;
  /** If the original invoice is already a replacement (Depth cap violation invariant AD-3 / FR-7) */
  isDepthCapExceeded?: boolean;
  /** Callback to view original invoice detail */
  onViewOriginal?: () => void;
  /** Callback to cancel and return to previous page */
  onCancelReplacement?: () => void;
  /** Additional CSS class names */
  className?: string;
}

export { useInvoiceReplacement };

/**
 * InvoiceReplacementBanner
 * Legal notice banner & context for the Invoice Replacement screen.
 * Complies with Vietnamese e-invoice regulations (Nghị định 123/2020/NĐ-CP).
 * Mounted on: `InvoiceReplace` (`/invoices/:id/replace`)
 */
export const InvoiceReplacementBanner: React.FC<InvoiceReplacementBannerProps> = ({
  originalInvoiceNumber = 'HD-2026-00018',
  originalInvoiceId,
  originalIssueDate = '15/08/2026',
  customerName,
  totalAmount,
  isDepthCapExceeded = false,
  onViewOriginal,
  onCancelReplacement,
  className = '',
}) => {
  const formattedDate = React.useMemo(() => {
    if (!originalIssueDate) return '';
    if (typeof originalIssueDate === 'string') return originalIssueDate;
    try {
      return new Date(originalIssueDate).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return String(originalIssueDate);
    }
  }, [originalIssueDate]);

  const formattedAmount = React.useMemo(() => {
    if (totalAmount === undefined || totalAmount === null) return null;
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount);
  }, [totalAmount]);

  // Depth Cap Guard Violation State (Invariant FR-7: Cannot replace a replacement invoice)
  if (isDepthCapExceeded) {
    return (
      <div
        className={`bg-rose-50 border border-rose-200 rounded-lg p-stack-md flex items-start gap-3 shadow-[0_4px_20px_rgba(0,0,0,0.02)] ${className}`}
        role="alert"
      >
        <span
          className="material-symbols-outlined text-error text-[24px] mt-0.5 shrink-0"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          error
        </span>
        <div className="flex-1">
          <h3 className="font-tabular-nums text-tabular-nums text-error font-bold mb-1">
            Không Cho Phép Thay Thế Hóa Đơn (Quy định Nghị định 123/2020/NĐ-CP)
          </h3>
          <p className="text-rose-900 font-body-sm text-body-sm mb-3">
            Hóa đơn <strong>{originalInvoiceNumber}</strong> là hóa đơn thay thế. Quy định pháp luật không cho phép lập hóa đơn thay thế cấp 2. Quý khách vui lòng thực hiện thủ tục <strong>Hủy Hóa Đơn</strong> nếu có sai sót.
          </p>
          <div className="flex items-center gap-3">
            {onCancelReplacement && (
              <button
                type="button"
                onClick={onCancelReplacement}
                className="px-4 py-1.5 bg-error text-on-error rounded-lg font-tabular-nums text-tabular-nums text-xs font-semibold hover:opacity-90 transition shadow-sm"
              >
                Quay Lại Chi Tiết
              </button>
            )}
            {originalInvoiceId && onViewOriginal && (
              <button
                type="button"
                onClick={onViewOriginal}
                className="text-error font-semibold underline text-xs hover:opacity-80 transition"
              >
                Xem Hóa Đơn Gốc
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-amber-50 border border-amber-200 rounded-lg p-stack-md flex items-start gap-3 shadow-[0_4px_20px_rgba(0,0,0,0.02)] ${className}`}
      role="region"
      aria-label="Thông báo thay thế hóa đơn"
    >
      <span
        className="material-symbols-outlined text-amber-600 text-[24px] mt-0.5 shrink-0"
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        warning
      </span>
      <div className="flex-1 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="font-tabular-nums text-tabular-nums text-amber-900 font-bold">
            Quy định Hóa Đơn Thay Thế (Nghị định 123/2020/NĐ-CP)
          </h3>
          {originalInvoiceId && onViewOriginal && (
            <button
              type="button"
              onClick={onViewOriginal}
              className="inline-flex items-center text-xs font-bold text-amber-800 hover:text-amber-950 underline transition-colors"
            >
              Xem hóa đơn gốc {originalInvoiceNumber} →
            </button>
          )}
        </div>

        <p className="text-amber-800/90 font-body-sm text-body-sm leading-relaxed">
          Bạn đang lập hóa đơn thay thế cho hóa đơn gốc{' '}
          <span className="font-bold font-tabular-nums text-amber-950 bg-amber-100/80 px-1.5 py-0.5 rounded border border-amber-300/60">
            {originalInvoiceNumber}
          </span>
          {formattedDate && ` (Phát hành ngày ${formattedDate})`}
          {customerName && ` của khách hàng ${customerName}`}
          {formattedAmount && ` - Tổng tiền: ${formattedAmount}`}.
        </p>

        <div className="pt-1 text-xs text-amber-900 space-y-1 bg-amber-100/50 p-2.5 rounded-md border border-amber-200/60">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[15px] text-amber-700">change_circle</span>
            <span>
              <strong>Hiệu lực pháp lý:</strong> Hóa đơn gốc (<strong>{originalInvoiceNumber}</strong>) sẽ tự động chuyển sang trạng thái <strong className="text-amber-950">REPLACED (Bị thay thế)</strong> theo Biên bản thỏa thuận 2 bên.
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[15px] text-emerald-700">verified</span>
            <span>
              <strong>Cấp Mã CQT Mới:</strong> Hóa đơn thay thế sẽ được cấp <strong>Số hóa đơn mới liên tục (Zero-Gap)</strong> và nhận <strong>Mã CQT mới</strong> từ Cổng Tổng Cục Thuế.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceReplacementBanner;
