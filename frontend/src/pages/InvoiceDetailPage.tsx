import React, { useState, useEffect, useMemo } from 'react';
import { useInvoice } from '../context/InvoiceContext';
import { useInvoiceDetailActions } from '../hooks/useInvoiceDetailActions';
import { GlobalHeader } from '../components/GlobalHeader';
import { InvoiceHeaderDetail } from '../components/InvoiceHeaderDetail';
import { InvoicePartyInfo } from '../components/InvoicePartyInfo';
import { InvoiceItemsTable } from '../components/InvoiceItemsTable';
import { InvoiceSummary } from '../components/InvoiceSummary';
import { InvoicePrintModal } from '../components/InvoicePrintModal';
import { InvoiceIssueModal } from '../components/InvoiceIssueModal';
import { InvoiceCancelModal } from '../components/InvoiceCancelModal';
import { InvoiceDeleteModal } from '../components/InvoiceDeleteModal';
import { TaxVerificationModal } from '../components/TaxVerificationModal';
import { invoiceApi } from '../services/invoiceApi';

/**
 * InvoiceDetailPage (`InvoiceDetail`)
 * Route: `/invoices/:id`
 * Bố cục 1 cột toàn diện, tích hợp Modal xem trước và in ấn hóa đơn GTGT chuẩn.
 */
export const InvoiceDetailPage: React.FC = () => {
  const {
    invoices,
    routeParams,
    navigate,
    getInvoiceById,
    fetchInvoiceById,
    issueInvoice,
    cancelInvoice,
    deleteDraftInvoice,
    cloneInvoice,
    showToast,
  } = useInvoice();

  const invoiceId = routeParams.id || '1';
  const invoice = getInvoiceById(invoiceId);

  // Modals state
  const [printModalOpen, setPrintModalOpen] = useState(false);

  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [isIssuing, setIsIssuing] = useState(false);

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [taxModalOpen, setTaxModalOpen] = useState(false);

  // Fetch invoice if not in cache
  useEffect(() => {
    if (!invoice && invoiceId) {
      fetchInvoiceById(invoiceId);
    }
  }, [invoiceId, invoice, fetchInvoiceById]);

  // Invoice Detail Actions Hook (with StateMachineGuard validation)
  const {
    handleOpenIssue,
    handleOpenCancel,
    handleOpenDelete,
    handleEdit,
    handleReplace,
  } = useInvoiceDetailActions(
    invoice
      ? {
          id: invoice.id,
          status: invoice.status,
          originalInvoiceId: invoice.originalInvoiceId,
        }
      : undefined,
    {
      onOpenIssue: () => setIssueModalOpen(true),
      onOpenCancel: () => setCancelModalOpen(true),
      onOpenDelete: () => setDeleteModalOpen(true),
    }
  );

  // Direct clone handler
  const handleCloneInvoice = async () => {
    if (!invoice) return;
    try {
      const cloned = await cloneInvoice(invoice.id);
      navigate('/invoices/:id', { id: String(cloned.id) });
    } catch {
      // Error handled by context toast
    }
  };

  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  // Direct download PDF handler with progress & toast (No blank tab!)
  const handleDownloadPdf = async () => {
    if (!invoice || isDownloadingPdf) return;
    setIsDownloadingPdf(true);
    showToast('info', 'Đang Tạo PDF', `Đang kết xuất bản thể hiện hóa đơn ${invoice.invoiceNumber}...`);
    try {
      await invoiceApi.downloadPdf(invoice.id, invoice.invoiceNumber);
      showToast('success', 'Tải Thành Công', `Đã tải xuống file PDF hóa đơn ${invoice.invoiceNumber}.`);
    } catch (err: any) {
      showToast('error', 'Lỗi Tải PDF', err?.message || 'Không thể tạo file PDF.');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // Related invoice helpers
  const originalInvoice = useMemo(() => {
    if (!invoice?.originalInvoiceId) return null;
    return invoices.find((i) => String(i.id) === String(invoice.originalInvoiceId));
  }, [invoice, invoices]);

  const replacementInvoice = useMemo(() => {
    if (!invoice?.replacedById) return null;
    return invoices.find((i) => String(i.id) === String(invoice.replacedById));
  }, [invoice, invoices]);

  if (!invoice) {
    return (
      <div className="min-h-screen bg-background text-on-surface flex flex-col font-sans">
        <GlobalHeader
          appName="exportInvoice"
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
            Hóa đơn với mã định danh #{invoiceId} không tồn tại hoặc đã bị xóa khỏi hệ thống.
          </p>
          <button
            type="button"
            onClick={() => navigate('/invoices')}
            className="px-5 py-2.5 bg-primary text-on-primary rounded-lg font-medium shadow hover:opacity-90 transition"
          >
            Quay Lại Danh Sách Hóa Đơn
          </button>
        </div>
      </div>
    );
  }

  // Modal Confirm Handlers
  const handleConfirmIssue = async () => {
    setIsIssuing(true);
    try {
      await issueInvoice(invoice.id);
      setIssueModalOpen(false);
    } finally {
      setIsIssuing(false);
    }
  };

  const handleConfirmCancel = async (reason: string) => {
    setIsCanceling(true);
    try {
      await cancelInvoice(invoice.id, reason);
      setCancelModalOpen(false);
    } finally {
      setIsCanceling(false);
    }
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      const ok = await deleteDraftInvoice(invoice.id);
      if (ok) {
        setDeleteModalOpen(false);
        navigate('/invoices');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col font-sans">
      {/* Global Header */}
      <GlobalHeader
        appName="exportInvoice"
        activeNav="invoices"
        onNavigateToInvoiceList={() => navigate('/invoices')}
        onNavigateToCreateInvoice={() => navigate('/invoices/new')}
      />

      {/* Invoice Header Detail */}
      <InvoiceHeaderDetail
        id={invoice.id}
        invoiceNumber={invoice.invoiceNumber}
        status={invoice.status}
        issueDate={invoice.issueDate}
        createdAt={invoice.createdAt}
        signedBy={invoice.signedBy}
        originalInvoiceId={invoice.originalInvoiceId}
        originalInvoiceNumber={originalInvoice?.invoiceNumber || invoice.originalInvoiceNumber}
        replacedById={invoice.replacedById}
        replacementInvoiceNumber={replacementInvoice?.invoiceNumber || invoice.replacementInvoiceNumber}
        cancelReason={invoice.cancelReason}
        taxAuthorityCode={invoice.taxAuthorityCode}
        onBackToList={() => navigate('/invoices')}
        onEditDraft={handleEdit}
        onIssueInvoice={handleOpenIssue}
        onDeleteDraft={handleOpenDelete}
        onCloneInvoice={handleCloneInvoice}
        onReplaceInvoice={handleReplace}
        onCancelInvoice={handleOpenCancel}
        onVerifyTax={() => setTaxModalOpen(true)}
        onPrintPreview={() => setPrintModalOpen(true)}
        onDownloadPdf={handleDownloadPdf}
        isDownloadingPdf={isDownloadingPdf}
        onViewOriginalInvoice={(origId) => navigate('/invoices/:id', { id: origId })}
        onViewReplacementInvoice={(repId) => navigate('/invoices/:id', { id: repId })}
      />

      {/* Main Full-Width Workspace (Expanded 12 cols layout) */}
      <main className="flex-1 w-full max-w-[1440px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Party Information */}
        <InvoicePartyInfo
          sellerName={invoice.sellerName}
          sellerTaxCode={invoice.sellerTaxCode}
          sellerAddress={invoice.sellerAddress}
          sellerPhone={invoice.sellerPhone}
          sellerEmail={invoice.sellerEmail}
          sellerBankAccount={invoice.sellerBankAccount}
          customerName={invoice.customerName}
          customerTaxCode={invoice.customerTaxCode}
          customerAddress={invoice.customerAddress}
          customerPhone={invoice.customerPhone}
          customerEmail={invoice.customerEmail}
          customerRepresentative={invoice.customerRepresentative}
          customerBankAccount={invoice.customerBankAccount}
          paymentMethod={invoice.paymentMethod}
        />

        {/* Line Items Table */}
        <div className="space-y-2">
          <h3 className="font-label-md text-sm font-semibold text-primary uppercase tracking-wider flex items-center justify-between px-1">
            <span>Danh Mục Hàng Hóa &amp; Dịch Vụ</span>
            <span className="text-xs text-on-surface-variant lowercase font-normal">
              ({invoice.items.length} dòng)
            </span>
          </h3>
          <InvoiceItemsTable items={invoice.items} />
        </div>

        {/* Financial Summary */}
        <InvoiceSummary
          subtotalAmount={invoice.subtotalAmount}
          vatRate={invoice.vatRate}
          vatAmount={invoice.vatAmount}
          totalAmount={invoice.totalAmount}
          amountInWords={invoice.amountInWords}
          notes={invoice.notes}
        />
      </main>

      {/* VAT Print & Preview Modal */}
      <InvoicePrintModal
        isOpen={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        invoiceId={invoice.id}
        templateCode={invoice.templateCode || '01GTKT3/001'}
        serialNumber={invoice.serialNumber || invoice.zone || '1C26TAA'}
        invoiceNumber={invoice.invoiceNumber}
        sequenceNumber={invoice.sequenceNumber}
        issueDate={invoice.issueDate}
        createdAt={invoice.createdAt}
        status={invoice.status}
        taxDepartment={invoice.taxDepartment || 'CỤC THUẾ TP. HÀ NỘI'}
        sellerName={invoice.sellerName}
        sellerTaxCode={invoice.sellerTaxCode}
        sellerAddress={invoice.sellerAddress}
        sellerPhone={invoice.sellerPhone}
        sellerBankAccount={invoice.sellerBankAccount}
        customerName={invoice.customerName}
        customerTaxCode={invoice.customerTaxCode}
        customerAddress={invoice.customerAddress}
        customerBankAccount={invoice.customerBankAccount}
        paymentMethod={invoice.paymentMethod}
        items={invoice.items}
        subtotalAmount={invoice.subtotalAmount}
        vatRate={invoice.vatRate}
        vatAmount={invoice.vatAmount}
        totalAmount={invoice.totalAmount}
        amountInWords={invoice.amountInWords}
        signedBy={invoice.signedBy}
        signedAt={invoice.signedAt}
        originalInvoiceId={invoice.originalInvoiceId}
        originalInvoiceNumber={originalInvoice?.invoiceNumber || invoice.originalInvoiceNumber}
        originalIssueDate={originalInvoice?.issueDate ? new Date(originalInvoice.issueDate).toLocaleDateString('vi-VN') : undefined}
        taxAuthorityCode={invoice.taxAuthorityCode}
      />

      {/* Public Tax Authority Verification Modal */}
      <TaxVerificationModal
        isOpen={taxModalOpen}
        onClose={() => setTaxModalOpen(false)}
        invoice={invoice}
      />

      {/* Issue Modal */}
      <InvoiceIssueModal
        isOpen={issueModalOpen}
        invoiceId={invoice.id}
        invoiceNumber={invoice.invoiceNumber}
        customerName={invoice.customerName}
        customerEmail={invoice.customerEmail}
        totalAmount={invoice.totalAmount}
        signerName={invoice.sellerName}
        isSubmitting={isIssuing}
        onClose={() => setIssueModalOpen(false)}
        onConfirm={handleConfirmIssue}
      />

      {/* Cancel Modal */}
      <InvoiceCancelModal
        isOpen={cancelModalOpen}
        invoiceId={invoice.id}
        invoiceNumber={invoice.invoiceNumber}
        customerName={invoice.customerName}
        totalAmount={invoice.totalAmount}
        issueDate={invoice.issueDate || invoice.createdAt}
        isSubmitting={isCanceling}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={handleConfirmCancel}
      />

      {/* Delete Draft Modal */}
      <InvoiceDeleteModal
        isOpen={deleteModalOpen}
        invoiceId={invoice.id}
        invoiceNumber={invoice.invoiceNumber}
        customerName={invoice.customerName}
        totalAmount={invoice.totalAmount}
        createdAt={invoice.createdAt}
        isSubmitting={isDeleting}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default InvoiceDetailPage;
