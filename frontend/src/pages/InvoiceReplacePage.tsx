import React from 'react';
import { useInvoice } from '../context/InvoiceContext';
import { useInvoiceReplacement } from '../hooks/useInvoiceReplacement';
import { GlobalHeaderIsland } from '../components/GlobalHeaderIsland';
import { InvoiceReplacementBannerIsland } from '../components/InvoiceReplacementBannerIsland';
import { InvoiceFormIsland } from '../components/InvoiceFormIsland';

/**
 * InvoiceReplacePage (`InvoiceReplace`)
 * Route: `/invoices/:id/replace`
 * Assembled from:
 * - GlobalHeaderIsland
 * - InvoiceReplacementBannerIsland
 * - InvoiceFormIsland (mode="REPLACE")
 * 
 * Enforces Visibility & Transition Guard:
 * `invoice.status == "ISSUED" && invoice.originalInvoiceId == null`
 * (Strict 1-level depth cap invariant AD-3 / FR-7 and atomic replacement AD-6).
 * 
 * Wired with Backend Core:
 * - InvoiceService.getInvoiceById via useInvoiceReplacement
 * - InvoiceService.replaceInvoice via useInvoiceReplacement
 * - StateMachineGuard via useInvoiceReplacement
 */
export const InvoiceReplacePage: React.FC = () => {
  const { routeParams, navigate } = useInvoice();
  const invoiceId = routeParams.id || '1';

  const {
    originalInvoice,
    validationState,
    initialFormData,
    isSubmitting,
    validationError,
    executeReplacement,
  } = useInvoiceReplacement(invoiceId);

  if (!originalInvoice) {
    return (
      <div className="min-h-screen bg-background text-on-surface flex flex-col font-sans">
        <GlobalHeaderIsland
          appName="AuditorPro Hóa Đơn"
          activeNav="invoices"
          onNavigateToInvoiceList={() => navigate('/invoices')}
          onNavigateToCreateInvoice={() => navigate('/invoices/new')}
        />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-16 h-16 bg-error-container text-error rounded-full flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-3xl">error_outline</span>
          </div>
          <h2 className="font-headline-lg text-2xl font-bold text-primary mb-2">Không Tìm Thấy Hóa Đơn Gốc</h2>
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

  // Guard: Status must be ISSUED and Depth Cap Invariant (AD-3 / FR-7)
  if (!validationState.isValid) {
    const isDepthCapExceeded = validationState.reason === 'DEPTH_CAP_EXCEEDED';
    return (
      <div className="min-h-screen bg-background text-on-surface flex flex-col font-sans">
        <GlobalHeaderIsland
          appName="AuditorPro Hóa Đơn"
          activeNav="invoices"
          onNavigateToInvoiceList={() => navigate('/invoices')}
          onNavigateToCreateInvoice={() => navigate('/invoices/new')}
        />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-xl mx-auto">
          <div className="w-16 h-16 bg-rose-100 text-error rounded-full flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-3xl">block</span>
          </div>
          <h2 className="font-headline-lg text-2xl font-bold text-primary mb-2">
            Không Thể Thực Hiện Thay Thế Hóa Đơn
          </h2>
          <p className="font-body-sm text-on-surface-variant mb-6 leading-relaxed">
            {isDepthCapExceeded ? (
              <>
                Hóa đơn <strong>{originalInvoice.invoiceNumber}</strong> là hóa đơn thay thế (cho hóa đơn #{originalInvoice.originalInvoiceId}).
                Theo quy định pháp luật (Nghị định 123/2020/NĐ-CP), <strong>không được phép lập hóa đơn thay thế cấp 2</strong>. Quý khách vui lòng thực hiện thủ tục <strong>Hủy Hóa Đơn</strong> nếu có sai sót.
              </>
            ) : (
              <>
                Hóa đơn <strong>{originalInvoice.invoiceNumber}</strong> đang ở trạng thái{' '}
                <strong className="text-primary">{originalInvoice.status}</strong>. Chỉ hóa đơn ở trạng thái <strong>Đã Phát Hành (ISSUED)</strong> mới có thể thay thế.
              </>
            )}
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate('/invoices/:id', { id: originalInvoice.id })}
              className="px-5 py-2.5 bg-primary text-on-primary rounded-lg font-medium shadow hover:opacity-90 transition"
            >
              Quay Lại Chi Tiết Hóa Đơn
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
    navigate('/invoices/:id', { id: originalInvoice.id });
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col font-sans">
      {/* Global Header Island */}
      <GlobalHeaderIsland
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
              <span>Quay lại hóa đơn gốc {originalInvoice.invoiceNumber}</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="font-headline-lg text-xl sm:text-2xl font-bold text-amber-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-700">swap_horiz</span>
                <span>Lập Hóa Đơn Thay Thế</span>
              </h1>
              <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded text-xs font-semibold">
                NĐ 123/2020/NĐ-CP
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <main className="flex-1 w-full max-w-[1440px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Invoice Replacement Legal Banner Island */}
        <InvoiceReplacementBannerIsland
          originalInvoiceNumber={originalInvoice.invoiceNumber}
          originalInvoiceId={originalInvoice.id}
          originalIssueDate={originalInvoice.issueDate || originalInvoice.createdAt}
          customerName={originalInvoice.customerName}
          totalAmount={originalInvoice.totalAmount}
          isDepthCapExceeded={Boolean(originalInvoice.originalInvoiceId)}
          onViewOriginal={handleCancel}
          onCancelReplacement={handleCancel}
        />

        {/* Invoice Form Island in REPLACE mode */}
        <div className="bg-surface border border-outline-variant rounded-xl shadow-sm overflow-hidden">
          <InvoiceFormIsland
            mode="REPLACE"
            initialData={initialFormData}
            isSubmitting={isSubmitting}
            validationError={validationError}
            onSubmitReplace={(id, data) => executeReplacement(data)}
            onCancelForm={handleCancel}
          />
        </div>
      </main>
    </div>
  );
};

export default InvoiceReplacePage;
