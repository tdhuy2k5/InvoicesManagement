import { useCallback } from 'react';
import { StateMachineGuard } from '@backend/services/StateMachineGuard';
import { useInvoice } from '../context/InvoiceContext';
import { InvoiceRowItem } from '../components/InvoiceTable';

const stateGuard = new StateMachineGuard();

/**
 * Hook providing action handlers (clone, delete, cancel, edit, replace) for the invoice table.
 */
export function useInvoiceTableActions(callbacks?: {
  onOpenDeleteModal?: (invoice: InvoiceRowItem) => void;
  onOpenCancelModal?: (invoice: InvoiceRowItem) => void;
  onEditDraft?: (id: string) => void;
  onReplace?: (id: string) => void;
}) {
  const { cloneInvoice, navigate, showToast } = useInvoice();

  const handleClone = useCallback(async (id: string) => {
    try {
      const cloned = await cloneInvoice(id);
      return cloned;
    } catch (err: any) {
      showToast('error', 'Lỗi Nhân Bản', err?.message || 'Không thể nhân bản hóa đơn này.');
    }
  }, [cloneInvoice, showToast]);

  const handleOpenDelete = useCallback((invoice: InvoiceRowItem) => {
    try {
      stateGuard.validateDraftModification(invoice.status);
      callbacks?.onOpenDeleteModal?.(invoice);
    } catch (err: any) {
      showToast('error', 'Không Hợp Lệ', err?.message || 'Chỉ có thể xóa hóa đơn ở trạng thái Bản Nháp.');
    }
  }, [callbacks, showToast]);

  const handleOpenCancel = useCallback((invoice: InvoiceRowItem) => {
    try {
      stateGuard.validateCancelTransition(invoice.status);
      callbacks?.onOpenCancelModal?.(invoice);
    } catch (err: any) {
      showToast('error', 'Không Hợp Lệ', err?.message || 'Chỉ có thể hủy hóa đơn ở trạng thái Đã Phát Hành.');
    }
  }, [callbacks, showToast]);

  const handleEdit = useCallback((invoice: InvoiceRowItem) => {
    try {
      stateGuard.validateDraftModification(invoice.status);
      if (callbacks?.onEditDraft) {
        callbacks.onEditDraft(invoice.id);
      } else {
        navigate('/invoices/:id/edit', { id: invoice.id });
      }
    } catch (err: any) {
      showToast('error', 'Không Hợp Lệ', err?.message || 'Chỉ có thể chỉnh sửa hóa đơn ở trạng thái Bản Nháp.');
    }
  }, [callbacks, navigate, showToast]);

  const handleReplace = useCallback((invoice: InvoiceRowItem) => {
    try {
      stateGuard.validateReplacementEligibility(invoice.status, invoice.originalInvoiceId);
      if (callbacks?.onReplace) {
        callbacks.onReplace(invoice.id);
      } else {
        navigate('/invoices/:id/replace', { id: invoice.id });
      }
    } catch (err: any) {
      showToast('error', 'Không Hợp Lệ', err?.message || 'Không thể lập hóa đơn thay thế cho hóa đơn này.');
    }
  }, [callbacks, navigate, showToast]);

  return {
    handleClone,
    handleOpenDelete,
    handleOpenCancel,
    handleEdit,
    handleReplace,
    stateGuard,
  };
}

export { stateGuard };
