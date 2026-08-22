import { describe, it, expect } from 'vitest';
import { InvoiceCalculationService } from '../services/InvoiceCalculationService';
import { AppError } from '../utils/AppError';
import { ErrorCode } from '../types/invoice.types';

describe('InvoiceCalculationService', () => {
  const service = new InvoiceCalculationService();

  describe('calculateLineItemAmount', () => {
    it('should correctly calculate quantity * unitPrice', () => {
      const amount = service.calculateLineItemAmount(3, 150000);
      expect(amount).toBe(450000);
    });

    it('should throw AppError when quantity is 0 or negative', () => {
      expect(() => service.calculateLineItemAmount(0, 100000)).toThrowError(AppError);
      try {
        service.calculateLineItemAmount(-2, 100000);
      } catch (err: any) {
        expect(err.errorCode).toBe(ErrorCode.INVALID_VALUE);
      }
    });

    it('should throw AppError when unitPrice is negative', () => {
      expect(() => service.calculateLineItemAmount(1, -50000)).toThrowError(AppError);
      try {
        service.calculateLineItemAmount(1, -50000);
      } catch (err: any) {
        expect(err.errorCode).toBe(ErrorCode.INVALID_VALUE);
      }
    });
  });

  describe('calculateVatAmount', () => {
    it('should calculate correct VAT for standard rates (0%, 8%, 10%)', () => {
      expect(service.calculateVatAmount(1000000, 0)).toBe(0);
      expect(service.calculateVatAmount(1000000, 8)).toBe(80000);
      expect(service.calculateVatAmount(1000000, 10)).toBe(100000);
    });

    it('should throw AppError if VAT rate is negative or greater than 100', () => {
      expect(() => service.calculateVatAmount(1000000, -1)).toThrowError(AppError);
      expect(() => service.calculateVatAmount(1000000, 105)).toThrowError(AppError);
    });

    it('should throw AppError if totalAmount is negative', () => {
      expect(() => service.calculateVatAmount(-50000, 10)).toThrowError(AppError);
    });
  });

  describe('calculateInvoiceTotals', () => {
    it('should calculate complete totals with multiple line items and VAT', () => {
      const items = [
        { description: 'Laptop Dell', unit: 'Cái', quantity: 2, unitPrice: 15000000 },
        { description: 'Mouse Logitech', unit: 'Cái', quantity: 5, unitPrice: 300000 },
      ];
      const vatRate = 10;

      const result = service.calculateInvoiceTotals(items, vatRate);

      expect(result.items.length).toBe(2);
      expect(result.items[0].amount).toBe(30000000);
      expect(result.items[1].amount).toBe(1500000);
      expect(result.totalAmount).toBe(31500000);
      expect(result.vatAmount).toBe(3150000);
    });

    it('should throw error when items array is empty', () => {
      expect(() => service.calculateInvoiceTotals([], 10)).toThrowError(AppError);
    });

    it('should throw error when items array exceeds 100 items limit', () => {
      const largeItems = Array.from({ length: 101 }, (_, i) => ({
        description: `Item ${i}`,
        unit: 'Cái',
        quantity: 1,
        unitPrice: 1000,
      }));
      expect(() => service.calculateInvoiceTotals(largeItems, 10)).toThrowError(AppError);
    });
  });
});
