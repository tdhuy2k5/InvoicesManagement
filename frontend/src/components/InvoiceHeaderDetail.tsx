import React from 'react';
import { useInvoiceDetailActions } from '../hooks/useInvoiceDetailActions';

export type InvoiceStatus = 'DRAFT' | 'ISSUED' | 'REPLACED' | 'CANCELED';

export interface InvoiceHeaderDetailProps {
  id: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  issueDate?: string | null;
  createdAt?: string;
  signedBy?: string | null;
  originalInvoiceId?: string | null;
  originalInvoiceNumber?: string | null;
  replacedById?: string | null;
  replacementInvoiceNumber?: string | null;
  cancelReason?: string | null;
  taxAuthorityCode?: string | null;
  onBackToList?: () => void;
  onEditDraft?: () => void;
  onIssueInvoice?: () => void;
  onDeleteDraft?: () => void;
  onCloneInvoice?: () => void;
  onReplaceInvoice?: () => void;
  onCancelInvoice?: () => void;
  onDownloadPdf?: () => void;
  isDownloadingPdf?: boolean;
  onPrintPreview?: () => void;
  onVerifyTax?: () => void;
  onViewOriginalInvoice?: (id: string) => void;
  onViewReplacementInvoice?: (id: string) => void;
}

export { useInvoiceDetailActions };

/**
 * Action header toolbar and status banner for the invoice detail screen.
 */
export const InvoiceHeaderDetail: React.FC<InvoiceHeaderDetailProps> = ({
  id,
  invoiceNumber,
  status,
  issueDate,
  createdAt,
  signedBy,
  originalInvoiceId,
  originalInvoiceNumber,
  replacedById,
  replacementInvoiceNumber,
  cancelReason,
  taxAuthorityCode,
  onBackToList,
  onEditDraft,
  onIssueInvoice,
  onDeleteDraft,
  onCloneInvoice,
  onReplaceInvoice,
  onCancelInvoice,
  onDownloadPdf,
  isDownloadingPdf = false,
  onPrintPreview,
  onVerifyTax,
  onViewOriginalInvoice,
  onViewReplacementInvoice,
}) => {
  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const renderStatusBadge = () => {
    switch (status) {
      case 'DRAFT':
        return (
          <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded font-label-md text-label-md flex items-center gap-1.5 font-semibold font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            DRAFT
          </span>
        );
      case 'ISSUED':
        return (
          <span className="bg-secondary-container/20 text-secondary border border-secondary/30 px-2.5 py-0.5 rounded font-label-md text-label-md flex items-center gap-1.5 font-semibold font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
            ISSUED
          </span>
        );
      case 'REPLACED':
        return (
          <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded font-label-md text-label-md flex items-center gap-1.5 font-semibold font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
            REPLACED
          </span>
        );
      case 'CANCELED':
        return (
          <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded font-label-md text-label-md flex items-center gap-1.5 font-semibold font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
            CANCELED
          </span>
        );
      default:
        return null;
    }
  };

  const canEdit = status === 'DRAFT';
  const canIssue = status === 'DRAFT';
  const canDelete = status === 'DRAFT';
  const canReplace = status === 'ISSUED' && !originalInvoiceId;
  const canCancel = status === 'ISSUED';

  return (
    <div className="bg-surface px-gutter py-stack-md border-b border-outline-variant shrink-0 flex flex-col gap-4 z-10 shadow-sm relative print:hidden">
      {/* Back link */}
      <div
        onClick={onBackToList}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') onBackToList?.();
        }}
        className="flex items-center gap-2 text-on-surface-variant cursor-pointer hover:text-primary w-max select-none transition-colors"
      >
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        <span className="font-body-sm text-body-sm font-medium">Quay lại danh sách</span>
      </div>

      {/* Main Title & Action Buttons */}
      <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5 mb-1">
            <h2 className="font-headline-lg text-headline-lg text-primary font-bold">
              {invoiceNumber}
            </h2>
            {renderStatusBadge()}
            {taxAuthorityCode && (
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 rounded font-mono text-xs flex items-center gap-1.5 font-semibold">
                <span className="material-symbols-outlined text-emerald-600 text-[14px]">account_balance</span>
                Mã CQT: {taxAuthorityCode}
              </span>
            )}
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Ngày lập: {formatDate(issueDate || createdAt)}
            {signedBy ? ` | Ký bởi: ${signedBy}` : ''}
          </p>
        </div>

        {/* Action Button Bar */}
        <div className="flex flex-wrap gap-2">
          {onVerifyTax && (
            <button
              type="button"
              onClick={onVerifyTax}
              className="px-3.5 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-tabular-nums text-tabular-nums hover:opacity-90 transition flex items-center gap-1.5 shadow-sm text-xs font-bold"
              title="Tra cứu trực tiếp trên Cổng Hóa Đơn Điện Tử Tổng Cục Thuế"
            >
              <span className="material-symbols-outlined text-[16px] text-amber-200">account_balance</span>
              <span>Tra Cứu Cổng Thuế</span>
            </button>
          )}

          {canEdit && (
            <button
              type="button"
              onClick={onEditDraft}
              className="px-4 py-2 bg-surface text-primary border border-outline rounded-lg font-tabular-nums text-tabular-nums hover:bg-surface-container-low transition flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
              <span>Chỉnh Sửa</span>
            </button>
          )}

          {canIssue && (
            <button
              type="button"
              onClick={onIssueInvoice}
              className="px-4 py-2 bg-secondary text-on-secondary rounded-lg font-tabular-nums text-tabular-nums hover:opacity-90 transition flex items-center gap-1.5 shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              <span>Phát Hành Hóa Đơn</span>
            </button>
          )}

          <button
            type="button"
            onClick={onCloneInvoice}
            className="px-4 py-2 bg-surface text-primary border border-outline rounded-lg font-tabular-nums text-tabular-nums hover:bg-surface-container-low transition flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">content_copy</span>
            <span>Nhân Bản</span>
          </button>

          {canReplace && (
            <button
              type="button"
              onClick={onReplaceInvoice}
              className="px-4 py-2 bg-amber-50 text-amber-800 border border-amber-300 rounded-lg font-tabular-nums text-tabular-nums hover:bg-amber-100 transition flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
              <span>Lập HĐ Thay Thế</span>
            </button>
          )}

          {canCancel && (
            <button
              type="button"
              onClick={onCancelInvoice}
              className="px-4 py-2 bg-error text-on-error rounded-lg font-tabular-nums text-tabular-nums hover:opacity-90 transition flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">cancel</span>
              <span>Hủy Hóa Đơn</span>
            </button>
          )}

          {canDelete && (
            <button
              type="button"
              onClick={onDeleteDraft}
              className="px-4 py-2 bg-error-container text-error rounded-lg font-tabular-nums text-tabular-nums hover:bg-error hover:text-on-error transition flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">delete</span>
              <span>Xóa Bản Nháp</span>
            </button>
          )}

          <button
            type="button"
            onClick={onPrintPreview}
            className="px-4 py-2 bg-primary text-on-primary rounded-lg font-tabular-nums text-tabular-nums hover:opacity-90 transition flex items-center gap-2 shadow-sm font-semibold"
          >
            <span className="material-symbols-outlined text-[18px]">print</span>
            <span>In / Xem Trước Hóa Đơn</span>
          </button>

          <button
            type="button"
            disabled={isDownloadingPdf}
            onClick={onDownloadPdf}
            className={`px-4 py-2 bg-surface text-primary border border-outline rounded-lg font-tabular-nums text-tabular-nums hover:bg-surface-container-low transition flex items-center gap-1.5 font-medium ${
              isDownloadingPdf ? 'opacity-70 cursor-wait' : ''
            }`}
          >
            {isDownloadingPdf ? (
              <>
                <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                <span>Đang Tạo PDF...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">download</span>
                <span>Tải Xuống PDF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Replacement Banner (If this invoice replaces another) */}
      {originalInvoiceId && (
        <div className="bg-surface-container-low border border-primary/20 rounded-lg p-3 flex justify-between items-center text-primary font-body-sm text-body-sm">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-primary">info</span>
            <span>
              Hóa đơn này thay thế cho hóa đơn gốc{' '}
              <strong>{originalInvoiceNumber || `HD #${originalInvoiceId}`}</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={() => onViewOriginalInvoice?.(originalInvoiceId)}
            className="font-bold underline text-primary hover:opacity-80 transition-opacity"
          >
            Xem hóa đơn gốc →
          </button>
        </div>
      )}

      {/* Replaced By Banner (If this invoice was replaced by another) */}
      {replacedById && (
        <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 flex justify-between items-center text-amber-900 font-body-sm text-body-sm">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-amber-700">warning</span>
            <span>
              Hóa đơn này đã bị thay thế bởi hóa đơn{' '}
              <strong>{replacementInvoiceNumber || `HD #${replacedById}`}</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={() => onViewReplacementInvoice?.(replacedById)}
            className="font-bold underline text-amber-900 hover:opacity-80 transition-opacity"
          >
            Xem hóa đơn thay thế →
          </button>
        </div>
      )}

      {/* Cancelled Info Banner */}
      {status === 'CANCELED' && cancelReason && (
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 flex items-start gap-2 text-rose-800 font-body-sm text-body-sm">
          <span className="material-symbols-outlined text-[18px] text-rose-600 mt-0.5">error</span>
          <div>
            <span className="font-semibold">Lý do hủy hóa đơn: </span>
            <span>{cancelReason}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceHeaderDetail;
