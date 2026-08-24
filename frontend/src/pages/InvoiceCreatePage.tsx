import React, { useState } from 'react';
import { useInvoice } from '../context/InvoiceContext';
import { GlobalHeader } from '../components/GlobalHeader';
import { InvoiceForm, InvoiceFormData } from '../components/InvoiceForm';

/**
 * InvoiceCreatePage (`InvoiceCreate`)
 * Route: `/invoices/new`
 * Assembled from:
 * - GlobalHeader
 * - InvoiceForm (mode="CREATE")
 */
export const InvoiceCreatePage: React.FC = () => {
  const { navigate, createDraftInvoice } = useInvoice();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmitDraft = async (formData: InvoiceFormData) => {
    setIsSubmitting(true);
    setValidationError(null);
    try {
      if (!formData.customerName.trim()) {
        setValidationError('Vui lòng nhập Tên đơn vị / Người mua hàng.');
        return;
      }
      if (!formData.items || formData.items.length === 0) {
        setValidationError('Hóa đơn phải có ít nhất 1 dòng hàng hóa / dịch vụ.');
        return;
      }

      const created = await createDraftInvoice({
        customerName: formData.customerName,
        customerTaxCode: formData.customerTaxCode,
        customerAddress: formData.customerAddress,
        customerPhone: formData.customerPhone,
        customerEmail: formData.customerEmail,
        customerBankAccount: formData.customerBankAccount,
        paymentMethod: formData.paymentMethod,
        sellerName: formData.sellerName,
        sellerTaxCode: formData.sellerTaxCode,
        sellerAddress: formData.sellerAddress,
        sellerPhone: formData.sellerPhone,
        sellerBankAccount: formData.sellerBankAccount,
        items: formData.items,
        vatRate: formData.vatRate,
        vatAmount: formData.vatAmount,
        subtotalAmount: formData.subtotalAmount,
        totalAmount: formData.totalAmount,
        notes: formData.notes,
      });
      navigate('/invoices/:id', { id: String(created.id) });
    } catch (err: any) {
      setValidationError(err?.message || 'Không thể tạo bản nháp hóa đơn. Vui lòng kiểm tra lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/invoices');
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

      {/* Page Title & Breadcrumb Header */}
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
              <span>Quay lại danh sách</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="font-headline-lg text-xl sm:text-2xl font-bold text-primary">
                Lập Hóa Đơn Mới (Tạo Bản Nháp)
              </h1>
              <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded text-xs font-semibold font-mono">
                DRAFT
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <main className="flex-1 w-full max-w-[1440px] mx-auto overflow-hidden">
        <InvoiceForm
          mode="CREATE"
          isSubmitting={isSubmitting}
          validationError={validationError}
          onSubmitDraft={handleSubmitDraft}
          onCancelForm={handleCancel}
        />
      </main>
    </div>
  );
};

export default InvoiceCreatePage;
