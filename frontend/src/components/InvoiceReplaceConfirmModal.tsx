import React, { useState, useEffect } from 'react';

export interface InvoiceReplaceConfirmModalProps {
  /** Controls modal visibility */
  isOpen: boolean;
  /** Callback to close or dismiss modal */
  onClose: () => void;
  /** Callback to confirm replacement with agreement reference */
  onConfirm: (agreementMinutes?: string) => void | Promise<void>;
  /** Original invoice number (e.g. 1C26TAA-0000005) */
  originalInvoiceNumber?: string;
  /** Customer / Buyer company name */
  customerName?: string;
  /** Original total amount (VND) */
  originalTotalAmount?: number;
  /** New replacement total amount (VND) */
  newTotalAmount?: number;
  /** Loading state during replacement request */
  isSubmitting?: boolean;
  /** Error message if replace operation failed */
  errorMessage?: string | null;
  /** Additional CSS class names */
  className?: string;
}

/**
 * InvoiceReplaceConfirmModal
 * Interactive dual-party agreement & tax authority transmission confirmation modal
 * for issuing a replacement invoice under Decree 123/2020/ND-CP Article 19.
 */
export const InvoiceReplaceConfirmModal: React.FC<InvoiceReplaceConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  originalInvoiceNumber = '1C26TAA-0000005',
  customerName = 'CÔNG TY TNHH GIẢI PHÁP SỐ TOÀN CẦU',
  originalTotalAmount = 0,
  newTotalAmount = 0,
  isSubmitting = false,
  errorMessage = null,
  className = '',
}) => {
  const [mode, setMode] = useState<'dual_sign' | 'quick'>('dual_sign');
  const [buyerSigned, setBuyerSigned] = useState(false);
  const [isBuyerSigning, setIsBuyerSigning] = useState(false);
  const [hasAgreementMinutes, setHasAgreementMinutes] = useState(true);

  const [simStep, setSimStep] = useState<number>(0);
  const [isTransmitting, setIsTransmitting] = useState<boolean>(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
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

  const canSubmit = !busy && (mode === 'quick' ? hasAgreementMinutes : buyerSigned);

  const handleSimulateBuyerSign = async () => {
    setIsBuyerSigning(true);
    await new Promise((r) => setTimeout(r, 600));
    setBuyerSigned(true);
    setIsBuyerSigning(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsTransmitting(true);
    setSimStep(1); // Bước 1: Ký số Hóa đơn thay thế & Biên bản
    await new Promise((r) => setTimeout(r, 500));
    setSimStep(2); // Bước 2: Truyền XML lên Tổng Cục Thuế
    await new Promise((r) => setTimeout(r, 600));
    setSimStep(3); // Bước 3: CQT cấp Mã CQT mới & Hủy hiệu lực HĐ cũ
    await new Promise((r) => setTimeout(r, 450));

    const agreementText =
      mode === 'dual_sign'
        ? `Biên bản thỏa thuận điện tử 2 bên: Bên Bán và Bên Mua (${customerName}) đã ký số đồng thuận lúc ${new Date().toLocaleString('vi-VN')}`
        : 'Biên bản thỏa thuận thay thế bằng văn bản giấy bên ngoài';

    await onConfirm(agreementText);
    setIsTransmitting(false);
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="replace-modal-title"
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-scrim/60 backdrop-blur-sm animate-fade-in ${className}`}
    >
      <div
        className="w-full max-w-lg bg-surface dark:bg-slate-900 rounded-2xl shadow-2xl border border-amber-200 dark:border-amber-900/50 overflow-hidden flex flex-col max-h-[92vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">swap_horiz</span>
            </div>
            <div>
              <h3 id="replace-modal-title" className="font-headline-sm font-bold text-base text-white">
                Xác Nhận Phát Hành Hóa Đơn Thay Thế
              </h3>
              <p className="text-xs text-amber-100">Căn cứ Điều 19 Khoản 2 Điểm b - Nghị định 123/2020/NĐ-CP</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Đóng"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 font-body-sm text-xs">
          {/* Compare Card */}
          <div className="p-4 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-on-surface-variant font-medium">Hóa đơn gốc bị thay thế:</span>
              <span className="font-mono font-bold text-amber-800 dark:text-amber-300">
                {originalInvoiceNumber}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-on-surface-variant font-medium">Khách hàng (Bên Mua):</span>
              <span className="font-semibold text-on-surface truncate max-w-[240px]">
                {customerName}
              </span>
            </div>
            <div className="pt-2 border-t border-amber-200/60 dark:border-amber-900/40 flex items-center justify-between text-xs">
              <div>
                <span className="text-on-surface-variant text-[11px]">Tiền HĐ cũ:</span>{' '}
                <span className="font-mono font-semibold line-through text-slate-500">
                  {formatCurrency(originalTotalAmount)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-amber-600">arrow_forward</span>
                <span className="text-on-surface-variant text-[11px]">Tiền HĐ mới:</span>{' '}
                <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                  {formatCurrency(newTotalAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Mode Switch Tabs */}
          <div className="space-y-1.5">
            <label className="font-semibold text-on-surface flex items-center gap-1 text-xs">
              <span className="material-symbols-outlined text-[16px] text-amber-600">verified_user</span>
              <span>Phương thức xác nhận thỏa thuận 2 bên (Bắt buộc theo luật):</span>
            </label>
            <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setMode('dual_sign')}
                className={`py-1.5 px-2 rounded-md text-[11px] font-medium transition ${
                  mode === 'dual_sign'
                    ? 'bg-white dark:bg-slate-700 text-amber-700 dark:text-amber-300 shadow-sm font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                🤝 Ký Biên Bản Điện Tử
              </button>
              <button
                type="button"
                onClick={() => setMode('quick')}
                className={`py-1.5 px-2 rounded-md text-[11px] font-medium transition ${
                  mode === 'quick'
                    ? 'bg-white dark:bg-slate-700 text-amber-700 dark:text-amber-300 shadow-sm font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                ⚡ Biên Bản Giấy Ngoài
              </button>
            </div>
          </div>

          {/* Mode 1: Dual-Party Agreement Protocol */}
          {mode === 'dual_sign' ? (
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl space-y-3">
              <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>TIẾN ĐỘ KÝ BIÊN BẢN ĐIỆN TỬ:</span>
                <span className="text-[10px] font-mono text-slate-500">Mẫu: 01/BB-TT-HDDT</span>
              </div>

              {/* Seller Sign Status */}
              <div className="flex items-center justify-between p-2 bg-white dark:bg-slate-700/80 rounded-lg border border-slate-200 dark:border-slate-600 text-xs">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-600 text-[18px]">verified</span>
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">Bên Bán (Alpha Tech)</div>
                    <div className="text-[10px] text-slate-500">Chữ ký số HSM / USB Token sẵn sàng</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-semibold text-[10px]">
                  ✓ SẴN SÀNG KÝ
                </span>
              </div>

              {/* Buyer Sign Status & Simulator Button */}
              <div
                className={`p-2.5 rounded-lg border text-xs transition ${
                  buyerSigned
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 text-emerald-900 dark:text-emerald-300'
                    : 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 text-amber-900 dark:text-amber-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`material-symbols-outlined text-[18px] ${
                        buyerSigned ? 'text-emerald-600' : 'text-amber-600'
                      }`}
                    >
                      {buyerSigned ? 'check_circle' : 'pending'}
                    </span>
                    <div>
                      <div className="font-semibold">{customerName}</div>
                      <div className="text-[10px] opacity-80">Đại diện pháp lý Người Mua hàng</div>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                      buyerSigned
                        ? 'bg-emerald-200 text-emerald-900'
                        : 'bg-amber-200 text-amber-900 animate-pulse'
                    }`}
                  >
                    {buyerSigned ? '✓ ĐÃ ĐỒNG THUẬN KÝ' : 'CHỜ BÊN MUA KÝ'}
                  </span>
                </div>

                {!buyerSigned && (
                  <button
                    type="button"
                    onClick={handleSimulateBuyerSign}
                    disabled={isBuyerSigning}
                    className="w-full mt-1.5 py-1.5 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded font-medium text-[11px] flex items-center justify-center gap-1.5 shadow-sm transition disabled:opacity-50"
                  >
                    {isBuyerSigning ? (
                      <>
                        <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>Đang xác thực chữ ký điện tử Bên Mua...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[15px]">draw</span>
                        <span>Giả Lập Bên Mua Xác Nhận & Ký Số Thỏa Thuận</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Mode 2: External Paper Minutes */
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasAgreementMinutes}
                  onChange={(e) => setHasAgreementMinutes(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                />
                <span className="text-[11px] text-slate-700 dark:text-slate-300 leading-tight">
                  Tôi xác nhận <strong>Hai bên đã ký văn bản thỏa thuận thay thế bằng giấy</strong> có chữ ký đóng dấu của người đại diện trước khi phát hành hóa đơn mới.
                </span>
              </label>
            </div>
          )}

          {/* 3-Step Animated Tax Transmission Progress */}
          {isTransmitting && (
            <div className="p-3.5 bg-slate-900 text-white rounded-xl space-y-2 font-mono text-[11px] animate-fade-in shadow-inner">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
                <span>QUY TRÌNH PHÁT HÀNH HÓA ĐƠN THAY THẾ LÊN CỔNG THUẾ:</span>
              </div>
              <div className="space-y-1 pl-2 border-l-2 border-slate-700">
                <div
                  className={`flex items-center gap-1.5 ${
                    simStep >= 1 ? 'text-emerald-400 font-bold' : 'text-slate-500'
                  }`}
                >
                  <span>{simStep >= 1 ? '✓' : '○'}</span>
                  <span>1. Ký số điện tử Hóa đơn thay thế & Biên bản thỏa thuận</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 ${
                    simStep >= 2 ? 'text-emerald-400 font-bold' : 'text-slate-500'
                  }`}
                >
                  <span>{simStep >= 2 ? '✓' : '○'}</span>
                  <span>2. Truyền gói tin XML lên Cổng tiếp nhận Tổng Cục Thuế...</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 ${
                    simStep >= 3 ? 'text-emerald-400 font-bold' : 'text-slate-500'
                  }`}
                >
                  <span>{simStep >= 3 ? '✓' : '○'}</span>
                  <span>3. Thuế cấp Mã CQT mới & Hủy hiệu lực hóa đơn {originalInvoiceNumber}</span>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-medium transition disabled:opacity-50"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className={`px-5 py-2 rounded-lg font-bold text-white shadow-md flex items-center gap-1.5 transition ${
                canSubmit
                  ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/30'
                  : 'bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed'
              }`}
            >
              {busy ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Đang Xử Lý Thay Thế...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
                  <span>Xác Nhận & Phát Hành HĐ Thay Thế</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvoiceReplaceConfirmModal;
