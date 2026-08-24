import { useState, useCallback } from 'react';
import { StateMachineGuard } from '@backend/services/StateMachineGuard';
import { useInvoice } from '../context/InvoiceContext';

const stateGuard = new StateMachineGuard();

/**
 * Hook for managing draft invoice deletion and validation.
 */
export function useDeleteDraftInvoice(invoiceId?: string, currentStatus?: string, onSuccess?: () => void) {
  const { deleteDraftInvoice, showToast } = useInvoice();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const openModal = useCallback(() => {
    try {
      if (currentStatus) {
        stateGuard.validateDraftModification(currentStatus);
      }
      setErrorMessage(null);
      setIsOpen(true);
    } catch (err: any) {
      const msg = err?.message || 'Chỉ có thể xóa hóa đơn ở trạng thái Bản Nháp (DRAFT).';
      showToast('error', 'Không Hợp Lệ', msg);
    }
  }, [currentStatus, showToast]);

  const closeModal = useCallback(() => {
    if (!isSubmitting) {
      setIsOpen(false);
      setErrorMessage(null);
    }
  }, [isSubmitting]);

  const confirmDelete = useCallback(async () => {
    if (!invoiceId) return;
    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      if (currentStatus) {
        stateGuard.validateDraftModification(currentStatus);
      }
      const success = deleteDraftInvoice(invoiceId);
      if (success) {
        setIsOpen(false);
        onSuccess?.();
      }
      return success;
    } catch (err: any) {
      setErrorMessage(err?.message || 'Có lỗi xảy ra khi xóa bản nháp.');
    } finally {
      setIsSubmitting(false);
    }
  }, [invoiceId, currentStatus, deleteDraftInvoice, onSuccess]);

  return {
    isOpen,
    isSubmitting,
    errorMessage,
    openModal,
    closeModal,
    confirmDelete,
    validateDraftModification: (status: string) => stateGuard.validateDraftModification(status),
  };
}

export { stateGuard };
