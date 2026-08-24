import React, { useState, useEffect } from 'react';
import { useCancelInvoice } from '../hooks/useCancelInvoice';

export interface InvoiceCancelModalProps {
  /** Controls modal visibility */
  isOpen: boolean;
  /** Callback to close or dismiss modal */
  onClose: () => void;
  /** Callback to confirm cancellation with reason and optional agreement minutes */
  onConfirm: (cancelReason: string, agreementMinutes?: string) => void | Promise<void>;
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
 * InvoiceCancelModal
 * Destructive action modal for canceling an issued commercial invoice (ISSUED -> CANCELED).
 * Features Dual-Party Agreement Protocol (Decree 123/2020/ND-CP) and GDT Form 04 Transmission Simulation.
 * Mounted on: `InvoiceList` (`/invoices`), `InvoiceDetail` (`/invoices/:id`)
 */
export const InvoiceCancelModal: React.FC<InvoiceCancelModalProps> = ({
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
  const [mode, setMode] = useState<'quick' | 'dual_sign'>('dual_sign');
  const [buyerSigned, setBuyerSigned] = useState(false);
  const [isBuyerSigning, setIsBuyerSigning] = useState(false);
  const [hasAgreementMinutes, setHasAgreementMinutes] = useState(true);

  const [simStep, setSimStep] = useState<number>(0);
  const [isTransmitting, setIsTransmitting] = useState<boolean>(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setCancelReason('Sai thông tin địa chỉ và mã số thuế người mua theo Biên bản thỏa thuận số 01/BB-HUY');
      setTouched(false);
      setMode('dual_sign');
      setBuyerSigned(false);
      setIsBuyerSigning(false);
      setHasAgreementMinutes(true);
      setSimStep(0);
      setIsTransmitting(false);
    }
  }, [isOpen]);

  const busy = isSubmitting || isTransmitting || isBuyerSigning;

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !busy) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, busy, onClose]);

  if (!isOpen) return null;

  const isReasonValid = cancelReason.trim().length >= 5;
  const canSubmit = isReasonValid && !busy && (mode === 'quick' ? hasAgreementMinutes : buyerSigned);

  const handleSimulateBuyerSign = async () => {
    setIsBuyerSigning(true);
    await new Promise((r) => setTimeout(r, 600));
    setBuyerSigned(true);
    setIsBuyerSigning(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!canSubmit) return;

    setIsTransmitting(true);
    setSimStep(1); // Bước 1: Lập Mẫu 04/SS-HĐĐT
    await new Promise((r) => setTimeout(r, 450));
    setSimStep(2); // Bước 2: Gửi Cổng Thuế
    await new Promise((r) => setTimeout(r, 550));
    setSimStep(3); // Bước 3: Thuế chấp thuận Mẫu 01/TB-HĐĐT
    await new Promise((r) => setTimeout(r, 400));

    const agreementText = mode === 'dual_sign'
      ? `Biên bản điện tử 2 bên: Bên Bán (Alpha Tech) và Bên Mua (${customerName}) đã ký số lúc ${new Date().toLocaleString('vi-VN')}`
      : 'Biên bản thỏa thuận giấy bên ngoài';

    await onConfirm(cancelReason.trim(), agreementText);
    setIsTransmitting(false);
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
          if (!busy) onClose();
        }}
      />

      {/* Modal Card */}
      <div className="relative bg-surface rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.15)] overflow-hidden border border-outline-variant w-full max-w-[580px] z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header with Destructive Rose Tone */}
        <div className="bg-rose-50 dark:bg-rose-950/40 p-5 flex flex-col items-center text-center border-b border-rose-200 dark:border-rose-800">
          <div className="w-14 h-14 bg-white dark:bg-surface rounded-full flex items-center justify-center shadow-sm mb-2 border border-rose-200 dark:border-rose-800">
            <span
              className="material-symbols-outlined text-error text-[30px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              cancel
            </span>
          </div>
          <h3
            id="cancel-modal-title"
            className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-on-surface mb-0.5"
          >
            Hủy Hóa Đơn Điện Tử (Mẫu 04/SS-HĐĐT)
          </h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm">
            Quy trình thỏa thuận 2 bên & Gửi thông báo sai sót lên Cổng Thuế cho hóa đơn{' '}
            <strong className="font-tabular-nums text-error">{invoiceNumber}</strong>.
          </p>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-5 space-y-4">
            {/* Summary Box */}
            <div className="bg-surface-container-low border border-outline-variant rounded-lg p-3 space-y-1.5 font-tabular-nums text-tabular-nums text-xs">
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
              <div className="flex justify-between border-t border-outline-variant pt-1.5">
                <span className="font-bold text-on-surface">Tổng tiền:</span>
                <span className="font-bold text-error">{formattedAmount}</span>
              </div>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex bg-surface-container rounded-lg p-1 border border-outline-variant text-xs font-semibold">
              <button
                type="button"
                onClick={() => setMode('dual_sign')}
                className={`flex-1 py-1.5 px-3 rounded-md transition flex items-center justify-center gap-1.5 ${
                  mode === 'dual_sign'
                    ? 'bg-surface text-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">handshake</span>
                <span>Ký Biên Bản 2 Bên (NĐ 123)</span>
              </button>
              <button
                type="button"
                onClick={() => setMode('quick')}
                className={`flex-1 py-1.5 px-3 rounded-md transition flex items-center justify-center gap-1.5 ${
                  mode === 'quick'
                    ? 'bg-surface text-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">bolt</span>
                <span>Biên bản bên ngoài</span>
              </button>
            </div>

            {/* Tab Content 1: Dual Sign Simulation */}
            {mode === 'dual_sign' ? (
              <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 rounded-lg p-3 space-y-2.5">
                <div className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">draw</span>
                  Biên bản thỏa thuận điện tử xử lý sai sót (NĐ 123)
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {/* Seller Sign Box */}
                  <div className="bg-white dark:bg-surface p-2.5 rounded border border-emerald-300 dark:border-emerald-700 space-y-1">
                    <div className="text-[11px] font-bold text-on-surface-variant">ĐẠI DIỆN BÊN BÁN</div>
                    <div className="font-semibold text-emerald-700 dark:text-emerald-400 text-[11px] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">verified</span>
                      ✓ ĐÃ KÝ ĐIỆN TỬ
                    </div>
                    <div className="text-[10px] text-on-surface-variant">Công ty CP Công Nghệ Alpha Tech</div>
                  </div>

                  {/* Buyer Sign Box */}
                  <div className={`p-2.5 rounded border transition space-y-1 ${
                    buyerSigned
                      ? 'bg-white dark:bg-surface border-emerald-300 dark:border-emerald-700'
                      : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800'
                  }`}>
                    <div className="text-[11px] font-bold text-on-surface-variant">ĐẠI DIỆN BÊN MUA</div>
                    {buyerSigned ? (
                      <div className="font-semibold text-emerald-700 dark:text-emerald-400 text-[11px] flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">verified</span>
                        ✓ BÊN MUA ĐÃ KÝ SỐ
                      </div>
                    ) : (
                      <div className="font-semibold text-rose-600 dark:text-rose-400 text-[11px] flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">pending</span>
                        Chờ Bên Mua ký duyệt
                      </div>
                    )}
                    <div className="text-[10px] text-on-surface-variant truncate">{customerName}</div>
                  </div>
                </div>

                {/* Simulation Trigger Button for Buyer */}
                {!buyerSigned && (
                  <button
                    type="button"
                    disabled={isBuyerSigning}
                    onClick={handleSimulateBuyerSign}
                    className="w-full py-2 px-3 bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/50 dark:hover:bg-amber-900 text-amber-900 dark:text-amber-200 rounded border border-amber-300 dark:border-amber-700 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    {isBuyerSigning ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-[16px]">sync</span>
                        <span>Đang giả lập Bên Mua ký số...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[16px]">touch_app</span>
                        <span>🏢 Giả Lập Bên Mua Xác Nhận & Ký Số Điện Tử</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            ) : (
              /* Tab Content 2: Quick Checkbox */
              <label className="flex items-start gap-2.5 p-3 bg-surface-container-low rounded-lg border border-outline-variant cursor-pointer select-none text-xs text-on-surface">
                <input
                  type="checkbox"
                  checked={hasAgreementMinutes}
                  onChange={(e) => setHasAgreementMinutes(e.target.checked)}
                  className="mt-0.5 rounded border-outline-variant text-error focus:ring-error"
                />
                <span>
                  Tôi cam kết đã có <strong>Biên bản thỏa thuận hủy hóa đơn</strong> có chữ ký/con dấu của Bên Mua theo quy định Điều 19 Nghị định 123/2020/NĐ-CP.
                </span>
              </label>
            )}

            {/* Cancel Reason Field (Mandatory) */}
            <div className="space-y-1.5">
              <label
                htmlFor="cancel-reason-input"
                className="font-label-md text-xs uppercase font-bold text-on-surface flex items-center justify-between"
              >
                <span>
                  Lý Do Hủy Hóa Đơn (Mẫu 04/SS-HĐĐT) <span className="text-error">*</span>
                </span>
                <span className="text-on-surface-variant font-normal lowercase text-[11px]">
                  (tối thiểu 5 ký tự)
                </span>
              </label>
              <textarea
                id="cancel-reason-input"
                rows={2}
                required
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                onBlur={() => setTouched(true)}
                placeholder="Ví dụ: Hai bên thống nhất hủy hóa đơn do sai sót thông tin địa chỉ và mã số thuế người mua..."
                className={`w-full bg-surface border rounded-lg p-2.5 font-body-sm text-body-sm focus:outline-none focus:ring-1 transition resize-none ${
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

            {/* Transmission Progress Simulation */}
            {isTransmitting && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-300 dark:border-rose-800 rounded-lg space-y-2 text-xs">
                <div className="font-bold uppercase tracking-wider text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                  <span className="material-symbols-outlined animate-spin text-[16px]">sync</span>
                  Tiến trình gửi Mẫu 04/SS-HĐĐT lên Cổng Tổng Cục Thuế
                </div>
                <div className="space-y-1 text-xs">
                  <div className={`flex items-center gap-2 ${simStep >= 1 ? 'text-emerald-700 dark:text-emerald-400 font-semibold' : 'text-on-surface-variant'}`}>
                    <span className="material-symbols-outlined text-[16px]">{simStep >= 1 ? 'check_circle' : 'hourglass_empty'}</span>
                    <span>1. Đóng chữ ký số Thông báo sai sót Mẫu 04/SS-HĐĐT</span>
                  </div>
                  <div className={`flex items-center gap-2 ${simStep >= 2 ? 'text-emerald-700 dark:text-emerald-400 font-semibold' : 'text-on-surface-variant'}`}>
                    <span className="material-symbols-outlined text-[16px]">{simStep >= 2 ? 'check_circle' : 'hourglass_empty'}</span>
                    <span>2. Đang truyền gói tin XML lên Cổng tiếp nhận Tổng Cục Thuế...</span>
                  </div>
                  <div className={`flex items-center gap-2 ${simStep >= 3 ? 'text-emerald-700 dark:text-emerald-400 font-semibold' : 'text-on-surface-variant'}`}>
                    <span className="material-symbols-outlined text-[16px]">{simStep >= 3 ? 'check_circle' : 'hourglass_empty'}</span>
                    <span>3. Tổng Cục Thuế phản hồi: Chấp nhận thông báo hủy (Mẫu 01/TB-HĐĐT)!</span>
                  </div>
                </div>
              </div>
            )}

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
              disabled={busy}
              onClick={onClose}
              className="px-4 py-2 text-on-surface-variant hover:bg-surface-variant rounded-lg font-tabular-nums text-tabular-nums font-medium transition disabled:opacity-50 text-xs"
            >
              Đóng
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="px-5 py-2 bg-error text-on-error hover:opacity-90 rounded-lg font-tabular-nums text-tabular-nums font-bold transition flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed text-xs"
            >
              {isTransmitting ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
                  <span>Đang Truyền Cổng Thuế...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">send</span>
                  <span>Ký & Gửi Mẫu 04 Lên Tổng Cục Thuế</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvoiceCancelModal;
