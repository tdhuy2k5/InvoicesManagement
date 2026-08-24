import { useState, useMemo, useCallback } from 'react';
import { StateMachineGuard } from '@backend/services/StateMachineGuard';
import { useInvoice } from '../context/InvoiceContext';
import { InvoiceFormData } from '../components/InvoiceForm';
import { InvoiceEntity } from '../mockData';

const stateGuard = new StateMachineGuard();

/**
 * Custom Hook: useInvoiceReplacement
 * Thin wiring adapter connecting UI to Backend Core InvoiceService and StateMachineGuard replacement workflows
 * Workflows:
 * - getInvoiceById (InvoiceService.getInvoiceById)
 * - validateReplacementEligibility (StateMachineGuard.validateReplacementEligibility)
 * - replaceInvoice (InvoiceService.replaceInvoice)
 */
export function useInvoiceReplacement(originalInvoiceId?: string) {
  const { getInvoiceById, replaceInvoice, navigate, showToast } = useInvoice();

  const originalInvoice = useMemo(() => {
    if (!originalInvoiceId) return undefined;
    return getInvoiceById(originalInvoiceId);
  }, [originalInvoiceId, getInvoiceById]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Status and Depth-cap validations (Invariant AD-3 / FR-7)
  const validationState = useMemo(() => {
    if (!originalInvoice) {
      return { isValid: false, reason: 'NOT_FOUND', errorMessage: 'Không tìm thấy hóa đơn gốc.' };
    }

    try {
      stateGuard.validateReplacementEligibility(originalInvoice.status, originalInvoice.originalInvoiceId);
      return { isValid: true, reason: null, errorMessage: null };
    } catch (err: any) {
      const isDepthCap = Boolean(originalInvoice.originalInvoiceId);
      return {
        isValid: false,
        reason: isDepthCap ? 'DEPTH_CAP_EXCEEDED' : 'INVALID_STATUS',
        errorMessage: err?.message || 'Hóa đơn không đủ điều kiện thay thế.',
      };
    }
  }, [originalInvoice]);

  // Pre-fill initial form data from original invoice
  const initialFormData: Partial<InvoiceFormData> | undefined = useMemo(() => {
    if (!originalInvoice) return undefined;
    const formattedIssueDate = originalInvoice.issueDate
      ? new Date(originalInvoice.issueDate).toLocaleDateString('vi-VN')
      : 'gốc';

    return {
      id: originalInvoice.id,
      customerName: originalInvoice.customerName,
      customerTaxCode: originalInvoice.customerTaxCode,
      customerPhone: originalInvoice.customerPhone || '',
      customerEmail: originalInvoice.customerEmail || '',
      customerAddress: originalInvoice.customerAddress,
      paymentMethod: originalInvoice.paymentMethod,
      sellerName: originalInvoice.sellerName,
      sellerTaxCode: originalInvoice.sellerTaxCode,
      sellerAddress: originalInvoice.sellerAddress,
      sellerPhone: originalInvoice.sellerPhone,
      sellerBankAccount: originalInvoice.sellerBankAccount,
      items: originalInvoice.items.map((it, idx) => ({
        id: it.id || `item-${idx}`,
        description: it.description,
        unit: it.unit,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        amount: it.amount,
      })),
      vatRate: originalInvoice.vatRate,
      vatAmount: originalInvoice.vatAmount,
      subtotalAmount: originalInvoice.subtotalAmount,
      totalAmount: originalInvoice.totalAmount,
      notes: `Thay thế cho hóa đơn số ${originalInvoice.invoiceNumber} ngày ${formattedIssueDate} do điều chỉnh sai sót thông tin.`,
    };
  }, [originalInvoice]);

  // Execute replacement mutation
  const executeReplacement = useCallback(
    async (formData: InvoiceFormData): Promise<InvoiceEntity | undefined> => {
      if (!originalInvoice) {
        setValidationError('Không tìm thấy hóa đơn gốc.');
        return;
      }

      try {
        setIsSubmitting(true);
        setValidationError(null);

        // Pre-mutation guard check
        stateGuard.validateReplacementEligibility(originalInvoice.status, originalInvoice.originalInvoiceId);

        if (!formData.customerName.trim()) {
          setValidationError('Vui lòng nhập Tên đơn vị / Người mua hàng.');
          return;
        }
        if (!formData.items || formData.items.length === 0) {
          setValidationError('Hóa đơn phải có ít nhất 1 dòng hàng hóa / dịch vụ.');
          return;
        }

        const replacement = await replaceInvoice(originalInvoice.id, formData);
        navigate('/invoices/:id', { id: String(replacement.id) });
        return replacement;
      } catch (err: any) {
        const msg = err?.message || 'Không thể tạo hóa đơn thay thế. Vui lòng thử lại.';
        setValidationError(msg);
        showToast('error', 'Lỗi Thay Thế Hóa Đơn', msg);
      } finally {
        setIsSubmitting(false);
      }
    },
    [originalInvoice, replaceInvoice, navigate, showToast]
  );

  return {
    originalInvoice,
    validationState,
    initialFormData,
    isSubmitting,
    validationError,
    executeReplacement,
    stateGuard,
  };
}

export { stateGuard };
