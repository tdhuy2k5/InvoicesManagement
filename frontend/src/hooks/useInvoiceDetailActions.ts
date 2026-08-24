import { useCallback } from 'react';
import { StateMachineGuard } from '@backend/services/StateMachineGuard';
import { useInvoice } from '../context/InvoiceContext';
import { InvoiceStatus } from '../components/InvoiceHeaderDetail';

const stateGuard = new StateMachineGuard();

/**
 * Hook providing action handlers and state validation for the invoice detail view.
 */
export function useInvoiceDetailActions(invoice?: {
  id: string;
  status: InvoiceStatus;
  originalInvoiceId?: string | null;
}, callbacks?: {
  onOpenIssue?: () => void;
  onOpenCancel?: () => void;
  onOpenDelete?: () => void;
}) {
  const { cloneInvoice, navigate, showToast } = useInvoice();

  const handleClone = useCallback(async () => {
    if (!invoice?.id) return;
    try {
      const cloned = await cloneInvoice(invoice.id);
      navigate('/invoices/:id', { id: cloned.id });
      return cloned;
    } catch (err: any) {
      showToast('error', 'Lỗi Nhân Bản', err?.message || 'Không thể nhân bản hóa đơn.');
    }
  }, [invoice, cloneInvoice, navigate, showToast]);

  const handleOpenIssue = useCallback(() => {
    if (!invoice) return;
    try {
      stateGuard.validateIssueTransition(invoice.status);
      callbacks?.onOpenIssue?.();
    } catch (err: any) {
      showToast('error', 'Không Hợp Lệ', err?.message || 'Chỉ hóa đơn bản nháp (DRAFT) mới có thể phát hành.');
    }
  }, [invoice, callbacks, showToast]);

  const handleOpenCancel = useCallback(() => {
    if (!invoice) return;
    try {
      stateGuard.validateCancelTransition(invoice.status);
      callbacks?.onOpenCancel?.();
    } catch (err: any) {
      showToast('error', 'Không Hợp Lệ', err?.message || 'Chỉ hóa đơn đã phát hành (ISSUED) mới có thể hủy.');
    }
  }, [invoice, callbacks, showToast]);

  const handleOpenDelete = useCallback(() => {
    if (!invoice) return;
    try {
      stateGuard.validateDraftModification(invoice.status);
      callbacks?.onOpenDelete?.();
    } catch (err: any) {
      showToast('error', 'Không Hợp Lệ', err?.message || 'Chỉ có thể xóa hóa đơn ở trạng thái Bản Nháp (DRAFT).');
    }
  }, [invoice, callbacks, showToast]);

  const handleEdit = useCallback(() => {
    if (!invoice) return;
    try {
      stateGuard.validateDraftModification(invoice.status);
      navigate('/invoices/:id/edit', { id: invoice.id });
    } catch (err: any) {
      showToast('error', 'Không Hợp Lệ', err?.message || 'Chỉ có thể chỉnh sửa hóa đơn ở trạng thái Bản Nháp.');
    }
  }, [invoice, navigate, showToast]);

  const handleReplace = useCallback(() => {
    if (!invoice) return;
    try {
      stateGuard.validateReplacementEligibility(invoice.status, invoice.originalInvoiceId);
      navigate('/invoices/:id/replace', { id: invoice.id });
    } catch (err: any) {
      showToast('error', 'Không Hợp Lệ', err?.message || 'Không thể lập hóa đơn thay thế cho hóa đơn này.');
    }
  }, [invoice, navigate, showToast]);

  return {
    handleClone,
    handleOpenIssue,
    handleOpenCancel,
    handleOpenDelete,
    handleEdit,
    handleReplace,
    stateGuard,
  };
}

export { stateGuard };
