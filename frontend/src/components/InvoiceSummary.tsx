import React from 'react';
import { useCurrencyToWords, convertVndToWords } from '../hooks/useCurrencyToWords';

export interface InvoiceSummaryProps {
  subtotalAmount?: number;
  vatRate?: number;
  vatAmount?: number;
  totalAmount?: number;
  amountInWords?: string;
  notes?: string | null;
  className?: string;
}

export { convertVndToWords };

/**
 * InvoiceSummary
 * Financial Summary card (Subtotal, VAT, Grand Total, and Amount in Vietnamese Words).
 * Mounted on: `InvoiceDetail` (`/invoices/:id`)
 * State Mutations:
 * - `renderVietnameseCurrencyWords` (executes: convertVndToWords)
 */
export const InvoiceSummary: React.FC<InvoiceSummaryProps> = ({
  subtotalAmount = 25000000,
  vatRate = 10,
  vatAmount = 2500000,
  totalAmount = 27500000,
  amountInWords,
  notes,
  className = '',
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  const calculatedTotal = totalAmount ?? (subtotalAmount + vatAmount);
  const { words: wordsDisplay } = useCurrencyToWords(calculatedTotal, amountInWords);

  return (
    <div className={`bg-surface-container-lowest p-stack-md border border-outline-variant rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4 shadow-sm ${className}`}>
      {/* Amount in Vietnamese Words & Notes */}
      <div className="flex flex-col justify-between space-y-3">
        <div className="text-on-surface-variant font-body-sm text-body-sm italic bg-surface-container-low/60 p-3 rounded border border-outline-variant/60">
          <span className="font-semibold text-primary not-italic">Số tiền viết bằng chữ: </span>
          <span>{wordsDisplay}</span>
        </div>
        {notes && (
          <div className="text-on-surface-variant font-body-sm text-body-sm">
            <span className="font-medium text-primary">Ghi chú: </span>
            <span>{notes}</span>
          </div>
        )}
      </div>

      {/* Numerical Financial Totals */}
      <div className="space-y-2">
        <div className="flex justify-between font-body-sm text-body-sm text-on-surface-variant">
          <span>Cộng tiền hàng (chưa thuế):</span>
          <span className="font-tabular-nums text-primary font-medium">{formatCurrency(subtotalAmount)} ₫</span>
        </div>
        <div className="flex justify-between font-body-sm text-body-sm text-on-surface-variant">
          <span>Tiền thuế GTGT ({vatRate}%):</span>
          <span className="font-tabular-nums text-primary font-medium">{formatCurrency(vatAmount)} ₫</span>
        </div>
        <div className="flex justify-between font-headline-lg-mobile text-headline-lg-mobile text-primary border-t border-outline-variant pt-2 mt-2 font-bold">
          <span>Tổng tiền thanh toán:</span>
          <span className="text-primary font-tabular-nums">{formatCurrency(calculatedTotal)} ₫</span>
        </div>
      </div>
    </div>
  );
};

export default InvoiceSummary;
