import { useState, useCallback } from 'react';
import { StateMachineGuard } from '@backend/services/StateMachineGuard';
import { useInvoice } from '../context/InvoiceContext';

const stateGuard = new StateMachineGuard();

/**
 * Hook for managing the cancel invoice modal and status transition.
 */
export function useCancelInvoice(invoiceId?: string, currentStatus?: string) {
  const { cancelInvoice, showToast } = useInvoice();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const openModal = useCallback(() => {
    try {
      if (currentStatus) {
        stateGuard.validateCancelTransition(currentStatus);
      }
      setErrorMessage(null);
      setIsOpen(true);
    } catch (err: any) {
      const msg = err?.message || 'Chỉ hóa đơn đã phát hành (ISSUED) mới có thể thực hiện hủy.';
      showToast('error', 'Không Hợp Lệ', msg);
    }
  }, [currentStatus, showToast]);

  const closeModal = useCallback(() => {
    if (!isSubmitting) {
      setIsOpen(false);
      setErrorMessage(null);
    }
  }, [isSubmitting]);

  const confirmCancel = useCallback(async (cancelReason: string) => {
    if (!invoiceId) return;
    if (!cancelReason || cancelReason.trim().length < 5) {
      setErrorMessage('Lý do hủy hóa đơn phải có ít nhất 5 ký tự.');
      return;
    }
    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      if (currentStatus) {
        stateGuard.validateCancelTransition(currentStatus);
      }
      const canceledInvoice = cancelInvoice(invoiceId, cancelReason.trim());
      setIsOpen(false);
      return canceledInvoice;
    } catch (err: any) {
      setErrorMessage(err?.message || 'Có lỗi xảy ra khi hủy hóa đơn.');
    } finally {
      setIsSubmitting(false);
    }
  }, [invoiceId, currentStatus, cancelInvoice]);

  return {
    isOpen,
    isSubmitting,
    errorMessage,
    openModal,
    closeModal,
    confirmCancel,
    validateCancelTransition: (status: string) => stateGuard.validateCancelTransition(status),
  };
}

export { stateGuard };
