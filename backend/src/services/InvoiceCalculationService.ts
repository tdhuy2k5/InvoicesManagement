import { AppError } from '../utils/AppError';
import {
  ErrorCode,
  CreateInvoiceItemDTO,
  CalculatedTotals,
  CalculatedItemTotal,
} from '../types/invoice.types';

export class InvoiceCalculationService {
  /**
   * Calculate line item amount: quantity * unitPrice (rounded to nearest unit/decimal)
   */
  calculateLineItemAmount(quantity: number, unitPrice: number): number {
    if (quantity <= 0) {
      throw new AppError(400, ErrorCode.INVALID_VALUE, 'Item quantity must be greater than 0');
    }
    if (unitPrice < 0) {
      throw new AppError(400, ErrorCode.INVALID_VALUE, 'Item unit price cannot be negative');
    }

    const rawAmount = Number(quantity) * Number(unitPrice);
    // Standard financial rounding to 2 decimal places (or integer for VND)
    return Math.round((rawAmount + Number.EPSILON) * 100) / 100;
  }

  /**
   * Calculate VAT amount based on total amount and VAT rate percentage
   */
  calculateVatAmount(totalAmount: number, vatRate: number): number {
    if (vatRate < 0 || vatRate > 100) {
      throw new AppError(400, ErrorCode.INVALID_VALUE, 'VAT rate must be between 0 and 100');
    }
    if (totalAmount < 0) {
      throw new AppError(400, ErrorCode.INVALID_VALUE, 'Total amount cannot be negative');
    }

    const rawVat = (Number(totalAmount) * Number(vatRate)) / 100;
    return Math.round((rawVat + Number.EPSILON) * 100) / 100;
  }

  /**
   * Calculates subtotal, VAT amount, and grand total with financial rounding.
   */
  calculateInvoiceTotals(items: CreateInvoiceItemDTO[], vatRate: number): CalculatedTotals {
    if (!items || items.length === 0) {
      throw new AppError(400, ErrorCode.INVALID_VALUE, 'Items array cannot be empty');
    }
    if (items.length > 100) {
      throw new AppError(400, ErrorCode.ITEMS_LIMIT_EXCEEDED, 'Invoice cannot have more than 100 items');
    }
    if (vatRate < 0 || vatRate > 100) {
      throw new AppError(400, ErrorCode.INVALID_VALUE, 'VAT rate must be between 0 and 100');
    }

    const calculatedItems: CalculatedItemTotal[] = items.map((item) => {
      const amount = this.calculateLineItemAmount(item.quantity, item.unitPrice);
      return {
        description: item.description?.trim() || '',
        unit: item.unit?.trim() || '',
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        amount,
      };
    });

    const totalAmount = calculatedItems.reduce((acc, curr) => acc + curr.amount, 0);
    const roundedTotalAmount = Math.round((totalAmount + Number.EPSILON) * 100) / 100;
    const vatAmount = this.calculateVatAmount(roundedTotalAmount, vatRate);

    return {
      items: calculatedItems,
      totalAmount: roundedTotalAmount,
      vatAmount,
    };
  }
}
