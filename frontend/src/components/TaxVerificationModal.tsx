import React from 'react';
import { InvoiceEntity } from '../mockData';

export interface TaxVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: InvoiceEntity | null;
}

/**
 * TaxVerificationModal
 * Simulates official lookup and verification from the National E-Invoice Portal (hoadondientu.gdt.gov.vn)
 */
export const TaxVerificationModal: React.FC<TaxVerificationModalProps> = ({
  isOpen,
  onClose,
  invoice,
}) => {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !invoice) return null;

  const isIssued = invoice.status === 'ISSUED';
  const isCanceled = invoice.status === 'CANCELED';
  const isReplaced = invoice.status === 'REPLACED';
  const isDraft = invoice.status === 'DRAFT';

  const formattedAmount = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(invoice.totalAmount);

  const formattedDate = invoice.issueDate
    ? new Date(invoice.issueDate).toLocaleString('vi-VN')
    : 'Chưa phát hành';

  const cqtCode = invoice.taxAuthorityCode || (isDraft ? 'Chưa cấp mã' : '00E26TAA' + Math.random().toString(16).substring(2, 10).toUpperCase());

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tax-portal-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-on-surface/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-surface rounded-xl shadow-[0_25px_50px_rgba(0,0,0,0.2)] overflow-hidden border border-outline-variant w-full max-w-[620px] z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* National Portal Header */}
        <div className="bg-gradient-to-r from-red-700 via-red-800 to-red-900 text-white p-5 border-b border-red-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
              <span className="material-symbols-outlined text-amber-300 text-[26px]">
                account_balance
              </span>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-widest text-amber-200 font-semibold">
                TỔNG CỤC THUẾ - BỘ TÀI CHÍNH
              </div>
              <h3 id="tax-portal-title" className="font-bold text-base tracking-wide">
                Cổng Tra Cứu Hóa Đơn Điện Tử Quốc Gia
              </h3>
              <div className="text-[10px] text-white/80 font-mono">
                hoadondientu.gdt.gov.vn
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 font-body-sm text-xs">
          {/* Status Verdict Banner */}
          {isDraft ? (
            <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 rounded-lg flex items-center gap-3 text-amber-900 dark:text-amber-200">
              <span className="material-symbols-outlined text-amber-600 text-[28px]">pending</span>
              <div>
                <div className="font-bold text-sm">HÓA ĐƠN CHƯA CÓ TRÊN CỔNG THUẾ</div>
                <div className="text-[11px] text-amber-800/90 dark:text-amber-300">
                  Đây là bản nháp nội bộ, chưa được ký số và chưa truyền dữ liệu xin cấp mã từ Tổng Cục Thuế.
                </div>
              </div>
            </div>
          ) : isIssued ? (
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 rounded-lg flex items-center gap-3 text-emerald-900 dark:text-emerald-200">
              <span className="material-symbols-outlined text-emerald-600 text-[28px]">verified</span>
              <div>
                <div className="font-bold text-sm text-emerald-800 dark:text-emerald-300">
                  ✓ HÓA ĐƠN HỢP LỆ ĐÃ CÓ MÃ CỦA CƠ QUAN THUẾ
                </div>
                <div className="text-[11px] text-emerald-700/90 dark:text-emerald-400">
                  Hóa đơn đã được Tổng Cục Thuế kiểm tra chữ ký số hợp lệ và cấp mã phê duyệt theo Nghị định 123.
                </div>
              </div>
            </div>
          ) : isCanceled ? (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 rounded-lg flex items-center gap-3 text-rose-900 dark:text-rose-200">
              <span className="material-symbols-outlined text-error text-[28px]">cancel</span>
              <div>
                <div className="font-bold text-sm text-error">
                  ❌ HÓA ĐƠN ĐÃ BỊ HỦY TRÊN CỔNG TỔNG CỤC THUẾ
                </div>
                <div className="text-[11px] text-rose-700/90 dark:text-rose-400">
                  Cơ quan Thuế đã tiếp nhận Mẫu 04/SS-HĐĐT và đóng mã hóa đơn. Hóa đơn này không còn giá trị pháp lý.
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 rounded-lg flex items-center gap-3 text-slate-900 dark:text-slate-200">
              <span className="material-symbols-outlined text-slate-600 text-[28px]">sync_alt</span>
              <div>
                <div className="font-bold text-sm">
                  ⚠️ HÓA ĐƠN ĐÃ BỊ THAY THẾ (HẾT HIỆU LỰC)
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400">
                  Hóa đơn này đã được thay thế bằng hóa đơn mới theo thỏa thuận giữa 2 bên.
                </div>
              </div>
            </div>
          )}

          {/* Tax Authority Code Box */}
          <div className="bg-surface-container-low border border-outline-variant rounded-lg p-3.5 space-y-2">
            <div className="flex justify-between items-center pb-2 border-b border-outline-variant font-tabular-nums">
              <span className="text-on-surface-variant font-semibold">Mã của Cơ Quan Thuế (Mã CQT):</span>
              <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 text-sm tracking-wider">
                {cqtCode}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-y-2 gap-x-4 pt-1 font-tabular-nums text-xs">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Mẫu số - Ký hiệu:</span>
                <span className="font-semibold text-on-surface font-mono">{invoice.templateCode || '01GTKT3/001'} - {invoice.serialNumber || '1C26TAA'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Số hóa đơn:</span>
                <span className="font-bold text-primary font-mono">{invoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Thời gian cấp mã:</span>
                <span className="text-on-surface">{formattedDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Tổng tiền thanh toán:</span>
                <span className="font-bold text-secondary">{formattedAmount}</span>
              </div>
            </div>
          </div>

          {/* Parties Details */}
          <div className="grid grid-cols-2 gap-3">
            {/* Seller Details */}
            <div className="bg-surface-container-low border border-outline-variant rounded-lg p-3 space-y-1">
              <div className="text-[10px] uppercase font-bold text-on-surface-variant">Người bán (Doanh nghiệp)</div>
              <div className="font-bold text-on-surface truncate text-xs">{invoice.sellerName}</div>
              <div className="text-on-surface-variant font-mono">MST: <strong>{invoice.sellerTaxCode}</strong></div>
              <div className="text-[10px] text-emerald-700 dark:text-emerald-400 flex items-center gap-1 pt-1">
                <span className="material-symbols-outlined text-[12px]">verified</span>
                Chữ ký số X.509 hợp lệ
              </div>
            </div>

            {/* Buyer Details */}
            <div className="bg-surface-container-low border border-outline-variant rounded-lg p-3 space-y-1">
              <div className="text-[10px] uppercase font-bold text-on-surface-variant">Người mua (Khách hàng)</div>
              <div className="font-bold text-on-surface truncate text-xs">{invoice.customerName}</div>
              <div className="text-on-surface-variant font-mono">MST: <strong>{invoice.customerTaxCode || 'Khách lẻ'}</strong></div>
              <div className="text-[10px] text-on-surface-variant pt-1 truncate">
                {invoice.customerAddress}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 bg-surface-container-low border-t border-outline-variant flex justify-between items-center text-xs">
          <div className="text-on-surface-variant text-[11px] flex items-center gap-1">
            <span className="material-symbols-outlined text-emerald-600 text-[14px]">lock</span>
            Dữ liệu đối soát thời gian thực từ Cơ sở dữ liệu HĐĐT Quốc Gia
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-surface-variant hover:bg-outline-variant/30 text-on-surface font-semibold rounded-md transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaxVerificationModal;
