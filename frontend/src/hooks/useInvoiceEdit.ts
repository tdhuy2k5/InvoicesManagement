import { useState, useMemo, useCallback } from 'react';
import { StateMachineGuard } from '@backend/services/StateMachineGuard';
import { useInvoice } from '../context/InvoiceContext';
import { InvoiceFormData } from '../components/InvoiceFormIsland';
import { InvoiceEntity } from '../mockData';

const stateGuard = new StateMachineGuard();

/**
 * Custom Hook: useInvoiceEdit
 * Thin wiring adapter connecting UI to Backend Core InvoiceService and StateMachineGuard edit workflows
 * Workflows:
 * - getInvoiceById (InvoiceService.getInvoiceById)
 * - validateDraftModification (StateMachineGuard.validateDraftModification)
 * - updateDraftInvoice (InvoiceService.updateDraftInvoice)
 */
export function useInvoiceEdit(invoiceId?: string) {
  const { getInvoiceById, updateDraftInvoice, navigate, showToast } = useInvoice();

  const invoice = useMemo(() => {
    if (!invoiceId) return undefined;
    return getInvoiceById(invoiceId);
  }, [invoiceId, getInvoiceById]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Status validation for draft modification (Invariant AD-3)
  const validationState = useMemo(() => {
    if (!invoice) {
      return { isValid: false, reason: 'NOT_FOUND', errorMessage: 'Không tìm thấy hóa đơn.' };
    }

    try {
      stateGuard.validateDraftModification(invoice.status);
      return { isValid: true, reason: null, errorMessage: null };
    } catch (err: any) {
      return {
        isValid: false,
        reason: 'NOT_DRAFT',
        errorMessage: err?.message || 'Chỉ hóa đơn ở trạng thái Bản Nháp mới được phép chỉnh sửa.',
      };
    }
  }, [invoice]);

  // Pre-fill initial form data from draft invoice
  const initialFormData: Partial<InvoiceFormData> | undefined = useMemo(() => {
    if (!invoice) return undefined;
    return {
      id: invoice.id,
      customerName: invoice.customerName,
      customerTaxCode: invoice.customerTaxCode,
      customerPhone: invoice.customerPhone || '',
      customerEmail: invoice.customerEmail || '',
      customerAddress: invoice.customerAddress,
      paymentMethod: invoice.paymentMethod,
      sellerName: invoice.sellerName,
      sellerTaxCode: invoice.sellerTaxCode,
      sellerAddress: invoice.sellerAddress,
      sellerPhone: invoice.sellerPhone,
      sellerBankAccount: invoice.sellerBankAccount,
      items: invoice.items.map((it, idx) => ({
        id: it.id || `item-${idx}`,
        description: it.description,
        unit: it.unit,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        amount: it.amount,
      })),
      vatRate: invoice.vatRate,
      vatAmount: invoice.vatAmount,
      subtotalAmount: invoice.subtotalAmount,
      totalAmount: invoice.totalAmount,
      notes: invoice.notes || '',
    };
  }, [invoice]);

  // Execute update draft invoice mutation
  const executeUpdate = useCallback(
    async (formData: InvoiceFormData): Promise<InvoiceEntity | undefined> => {
      if (!invoice) {
        setValidationError('Không tìm thấy hóa đơn cần cập nhật.');
        return;
      }

      try {
        setIsSubmitting(true);
        setValidationError(null);

        // Pre-mutation guard check
        stateGuard.validateDraftModification(invoice.status);

        if (!formData.customerName.trim()) {
          setValidationError('Vui lòng nhập Tên đơn vị / Người mua hàng.');
          return;
        }
        if (!formData.items || formData.items.length === 0) {
          setValidationError('Hóa đơn phải có ít nhất 1 dòng hàng hóa / dịch vụ.');
          return;
        }

        const updated = await updateDraftInvoice(invoice.id, formData);
        navigate('/invoices/:id', { id: String(updated.id) });
        return updated;
      } catch (err: any) {
        const msg = err?.message || 'Không thể cập nhật bản nháp. Vui lòng thử lại.';
        setValidationError(msg);
        showToast('error', 'Lỗi Cập Nhật', msg);
      } finally {
        setIsSubmitting(false);
      }
    },
    [invoice, updateDraftInvoice, navigate, showToast]
  );

  return {
    invoice,
    validationState,
    initialFormData,
    isSubmitting,
    validationError,
    executeUpdate,
    stateGuard,
  };
}

export { stateGuard };
