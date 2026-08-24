import { useMemo } from 'react';
import { InvoiceCalculationService } from '@backend/services/InvoiceCalculationService';
import { convertVndToWords } from '@backend/services/CurrencyToWordsUtil';
import { FormInvoiceItem } from '../components/InvoiceForm';

const calculationService = new InvoiceCalculationService();

/**
 * Hook for managing reactive invoice subtotal, VAT, total amount, and words calculations.
 */
export function useInvoiceCalculations(items: FormInvoiceItem[], vatRate: number) {
  const calculations = useMemo(() => {
    try {
      const validItems = items.map((it) => ({
        description: it.description,
        unit: it.unit,
        quantity: Number(it.quantity) || 0,
        unitPrice: Number(it.unitPrice) || 0,
      }));

      // Calculate subtotal from line items
      const subtotal = validItems.reduce(
        (sum, item) => sum + (item.quantity > 0 && item.unitPrice >= 0 ? calculationService.calculateLineItemAmount(item.quantity, item.unitPrice) : 0),
        0
      );

      const normalizedVatRate = vatRate > 0 ? vatRate : 0;
      const vatAmount = calculationService.calculateVatAmount(subtotal, normalizedVatRate);
      const totalAmount = subtotal + vatAmount;
      const amountInWords = convertVndToWords(totalAmount);

      return {
        subtotalAmount: subtotal,
        vatAmount,
        totalAmount,
        amountInWords,
      };
    } catch {
      const fallbackSubtotal = items.reduce((sum, it) => sum + (Number(it.amount) || 0), 0);
      const fallbackVat = vatRate > 0 ? Math.round((fallbackSubtotal * vatRate) / 100) : 0;
      const fallbackTotal = fallbackSubtotal + fallbackVat;
      return {
        subtotalAmount: fallbackSubtotal,
        vatAmount: fallbackVat,
        totalAmount: fallbackTotal,
        amountInWords: convertVndToWords(fallbackTotal),
      };
    }
  }, [items, vatRate]);

  const calculateLineItem = (quantity: number, unitPrice: number): number => {
    try {
      return calculationService.calculateLineItemAmount(quantity, unitPrice);
    } catch {
      return (Number(quantity) || 0) * (Number(unitPrice) || 0);
    }
  };

  return {
    ...calculations,
    calculateLineItem,
  };
}

export { calculationService };
