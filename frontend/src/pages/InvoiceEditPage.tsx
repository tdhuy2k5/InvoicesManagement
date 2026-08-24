import React from 'react';
import { useInvoice } from '../context/InvoiceContext';
import { useInvoiceEdit } from '../hooks/useInvoiceEdit';
import { GlobalHeader } from '../components/GlobalHeader';
import { InvoiceForm } from '../components/InvoiceForm';

/**
 * InvoiceEditPage (`InvoiceEdit`)
 * Route: `/invoices/:id/edit`
 * Assembled from:
 * - GlobalHeader
 * - InvoiceForm (mode="EDIT")
 * 
 * Enforces Visibility & Mutation Guard: `invoice.status == "DRAFT"` (StateMachineGuard.validateDraftModification)
 * Wired with Backend Core:
 * - InvoiceService.getInvoiceById via useInvoiceEdit
 * - InvoiceService.updateDraftInvoice via useInvoiceEdit
 * - StateMachineGuard via useInvoiceEdit
 */
export const InvoiceEditPage: React.FC = () => {
  const { routeParams, navigate } = useInvoice();
  const invoiceId = routeParams.id || '1';

  const {
    invoice,
    validationState,
    initialFormData,
    isSubmitting,
    validationError,
    executeUpdate,
  } = useInvoiceEdit(invoiceId);

  if (!invoice) {
    return (
      <div className="min-h-screen bg-background text-on-surface flex flex-col font-sans">
        <GlobalHeader
          appName="AuditorPro Hóa Đơn"
          activeNav="invoices"
          onNavigateToInvoiceList={() => navigate('/invoices')}
          onNavigateToCreateInvoice={() => navigate('/invoices/new')}
        />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-16 h-16 bg-error-container text-error rounded-full flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-3xl">error_outline</span>
          </div>
          <h2 className="font-headline-lg text-2xl font-bold text-primary mb-2">Không Tìm Thấy Hóa Đơn</h2>
          <p className="font-body-sm text-on-surface-variant max-w-md mb-6">
            Hóa đơn #{invoiceId} không tồn tại trong hệ thống.
          </p>
          <button
            type="button"
            onClick={() => navigate('/invoices')}
            className="px-5 py-2.5 bg-primary text-on-primary rounded-lg font-medium shadow hover:opacity-90 transition"
          >
            Quay Lại Danh Sách
          </button>
        </div>
      </div>
    );
  }

  // Guard Violation: Status must be DRAFT (Invariant AD-3)
  if (!validationState.isValid) {
    return (
      <div className="min-h-screen bg-background text-on-surface flex flex-col font-sans">
        <GlobalHeader
          appName="AuditorPro Hóa Đơn"
          activeNav="invoices"
          onNavigateToInvoiceList={() => navigate('/invoices')}
          onNavigateToCreateInvoice={() => navigate('/invoices/new')}
        />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-xl mx-auto">
          <div className="w-16 h-16 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-3xl">lock</span>
          </div>
          <h2 className="font-headline-lg text-2xl font-bold text-primary mb-2">
            Không Thể Chỉnh Sửa Hóa Đơn
          </h2>
          <p className="font-body-sm text-on-surface-variant mb-6 leading-relaxed">
            Hóa đơn <strong>{invoice.invoiceNumber}</strong> đang ở trạng thái{' '}
            <strong className="text-primary">{invoice.status}</strong>. Theo quy định tài chính và tính toàn vẹn hệ thống, chỉ hóa đơn ở trạng thái <strong>Bản Nháp (DRAFT)</strong> mới được phép sửa đổi.
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate('/invoices/:id', { id: invoice.id })}
              className="px-5 py-2.5 bg-primary text-on-primary rounded-lg font-medium shadow hover:opacity-90 transition"
            >
              Xem Chi Tiết Hóa Đơn
            </button>
            <button
              type="button"
              onClick={() => navigate('/invoices')}
              className="px-5 py-2.5 bg-surface text-on-surface border border-outline-variant rounded-lg font-medium hover:bg-surface-container-low transition"
            >
              Về Danh Sách
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleCancel = () => {
    navigate('/invoices/:id', { id: invoice.id });
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col font-sans">
      {/* Global Header */}
      <GlobalHeader
        appName="AuditorPro Hóa Đơn"
        activeNav="invoices"
        onNavigateToInvoiceList={() => navigate('/invoices')}
        onNavigateToCreateInvoice={() => navigate('/invoices/new')}
      />

      {/* Breadcrumb & Screen Title Header */}
      <div className="bg-surface px-4 sm:px-6 lg:px-8 py-4 border-b border-outline-variant shrink-0">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div
              onClick={handleCancel}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleCancel();
              }}
              className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-primary cursor-pointer mb-1 transition-colors select-none"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>Quay lại chi tiết {invoice.invoiceNumber}</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="font-headline-lg text-xl sm:text-2xl font-bold text-primary">
                Chỉnh Sửa Bản Nháp Hóa Đơn: {invoice.invoiceNumber}
              </h1>
              <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded text-xs font-semibold font-mono">
                DRAFT
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Form in EDIT Mode */}
      <main className="flex-1 w-full max-w-[1440px] mx-auto overflow-hidden">
        <InvoiceForm
          mode="EDIT"
          initialData={initialFormData}
          isSubmitting={isSubmitting}
          validationError={validationError}
          onSubmitUpdate={(id, data) => executeUpdate(data)}
          onCancelForm={handleCancel}
        />
      </main>
    </div>
  );
};

export default InvoiceEditPage;
