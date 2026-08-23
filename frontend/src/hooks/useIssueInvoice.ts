import { useState, useCallback } from 'react';
import { StateMachineGuard } from '@backend/services/StateMachineGuard';
import { useInvoice } from '../context/InvoiceContext';

const stateGuard = new StateMachineGuard();

/**
 * Custom Hook: useIssueInvoice
 * Thin wiring adapter connecting UI to StateMachineGuard and InvoiceService issue workflow
 * Workflows:
 * - openIssueModal (StateMachineGuard.validateIssueTransition)
 * - confirmIssueInvoice (InvoiceService.issueInvoice)
 */
export function useIssueInvoice(invoiceId?: string, currentStatus?: string) {
  const { issueInvoice, showToast } = useInvoice();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const openModal = useCallback(() => {
    try {
      if (currentStatus) {
        stateGuard.validateIssueTransition(currentStatus);
      }
      setErrorMessage(null);
      setIsOpen(true);
    } catch (err: any) {
      const msg = err?.message || 'Chỉ hóa đơn bản nháp (DRAFT) mới có thể phát hành.';
      showToast('error', 'Không Hợp Lệ', msg);
    }
  }, [currentStatus, showToast]);

  const closeModal = useCallback(() => {
    if (!isSubmitting) {
      setIsOpen(false);
      setErrorMessage(null);
    }
  }, [isSubmitting]);

  const confirmIssue = useCallback(async () => {
    if (!invoiceId) return;
    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      if (currentStatus) {
        stateGuard.validateIssueTransition(currentStatus);
      }
      const issuedInvoice = issueInvoice(invoiceId);
      setIsOpen(false);
      return issuedInvoice;
    } catch (err: any) {
      setErrorMessage(err?.message || 'Có lỗi xảy ra khi phát hành hóa đơn.');
    } finally {
      setIsSubmitting(false);
    }
  }, [invoiceId, currentStatus, issueInvoice]);

  return {
    isOpen,
    isSubmitting,
    errorMessage,
    openModal,
    closeModal,
    confirmIssue,
    validateIssueTransition: (status: string) => stateGuard.validateIssueTransition(status),
  };
}

export { stateGuard };
