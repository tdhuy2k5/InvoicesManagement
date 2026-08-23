import React, { useState, useMemo } from 'react';
import { useInvoice } from '../context/InvoiceContext';
import { useInvoiceFilter } from '../hooks/useInvoiceFilter';
import { useInvoiceTableActions } from '../hooks/useInvoiceTableActions';
import { GlobalHeaderIsland } from '../components/GlobalHeaderIsland';
import { InvoiceFilterIsland } from '../components/InvoiceFilterIsland';
import { InvoiceTableIsland, InvoiceRowItem } from '../components/InvoiceTableIsland';
import { InvoiceDeleteModalIsland } from '../components/InvoiceDeleteModalIsland';
import { InvoiceCancelModalIsland } from '../components/InvoiceCancelModalIsland';
import { InvoiceEntity } from '../mockData';

/**
 * InvoiceListPage (`InvoiceList`)
 * Route: `/invoices` (and default `/`)
 * Assembled from:
 * - GlobalHeaderIsland
 * - InvoiceFilterIsland
 * - InvoiceTableIsland
 * - InvoiceDeleteModalIsland
 * - InvoiceCancelModalIsland
 * Plus Executive Metrics Cards and Status Controls.
 * 
 * Wired with Backend Core:
 * - InvoiceService.getInvoicesList & InvoiceService.searchInvoices via useInvoiceFilter
 * - InvoiceService.cloneInvoice & StateMachineGuard via useInvoiceTableActions
 */
export const InvoiceListPage: React.FC = () => {
  const { invoices, navigate, deleteDraftInvoice, cancelInvoice } = useInvoice();

  // Filters & Search via Hook
  const {
    currentStatus,
    searchTerm,
    vatRateFilter,
    paymentMethodFilter,
    setPaymentMethodFilter,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    minAmount,
    setMinAmount,
    maxAmount,
    setMaxAmount,
    showAdvancedFilters,
    setShowAdvancedFilters,
    showDatePicker,
    setShowDatePicker,
    dateRangeText,
    activeFiltersCount,
    handleDatePreset,
    resetFilters,
    selectedInvoice,
    statusCounts,
    totalRevenue,
    filteredInvoices,
    handleStatusChange,
    handleSearchChange,
    handleVatRateChange,
    handleSelectInvoice,
    handleViewDetail,
    handleEditDraft: handleEditDraftFromFilter,
    handleDeleteDraft: handleDeleteDraftFromFilter,
  } = useInvoiceFilter();

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Modal States
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [targetDeleteInvoice, setTargetDeleteInvoice] = useState<InvoiceEntity | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [targetCancelInvoice, setTargetCancelInvoice] = useState<InvoiceEntity | null>(null);
  const [isCanceling, setIsCanceling] = useState(false);

  // Table Action Hooks
  const {
    handleClone,
    handleOpenDelete,
    handleOpenCancel,
    handleReplace,
    handleEdit,
  } = useInvoiceTableActions({
    onOpenCancelModal: (inv) => {
      const full = invoices.find((i) => String(i.id) === String(inv.id));
      if (full) {
        setTargetCancelInvoice(full);
        setCancelModalOpen(true);
      }
    },
    onOpenDeleteModal: (inv) => {
      const full = invoices.find((i) => String(i.id) === String(inv.id));
      if (full) {
        setTargetDeleteInvoice(full);
        setDeleteModalOpen(true);
      }
    },
  });

  // Client-side pagination based on filtered invoices
  const totalPages = Math.max(1, Math.ceil(filteredInvoices.length / pageSize));
  const paginatedInvoices = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredInvoices.slice(start, start + pageSize);
  }, [filteredInvoices, currentPage, pageSize]);

  const tableRows: InvoiceRowItem[] = useMemo(() => {
    return paginatedInvoices.map((inv) => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      templateCode: inv.templateCode,
      zone: inv.zone,
      issueDate: inv.issueDate,
      createdAt: inv.createdAt,
      customerName: inv.customerName,
      customerTaxCode: inv.customerTaxCode,
      sellerName: inv.sellerName,
      sellerTaxCode: inv.sellerTaxCode,
      totalAmount: inv.totalAmount,
      vatRate: inv.vatRate,
      status: inv.status,
      originalInvoiceId: inv.originalInvoiceId,
      replacedById: inv.replacedById,
    }));
  }, [paginatedInvoices]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Modal confirm handlers
  const handleConfirmDelete = async () => {
    if (!targetDeleteInvoice) return;
    setIsDeleting(true);
    try {
      await deleteDraftInvoice(targetDeleteInvoice.id);
      setDeleteModalOpen(false);
      setTargetDeleteInvoice(null);
      if (selectedInvoice?.id === targetDeleteInvoice.id) {
        handleSelectInvoice(null);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmCancel = async (reason: string) => {
    if (!targetCancelInvoice) return;
    setIsCanceling(true);
    try {
      await cancelInvoice(targetCancelInvoice.id, reason);
      setCancelModalOpen(false);
      setTargetCancelInvoice(null);
    } finally {
      setIsCanceling(false);
    }
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

      <main className="flex-1 w-full max-w-[1440px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Page Title Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-headline-lg text-2xl sm:text-3xl font-bold text-primary tracking-tight">
              Quản Lý Hóa Đơn Điện Tử
            </h1>
          </div>
        </div>

        {/* Data Filter & Table Container */}
        <div className="bg-surface border border-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col">
          {/* InvoiceFilterIsland */}
          <InvoiceFilterIsland
            currentStatus={currentStatus}
            searchTerm={searchTerm}
            vatRateFilter={vatRateFilter}
            paymentMethodFilter={paymentMethodFilter}
            startDate={startDate}
            endDate={endDate}
            minAmount={minAmount}
            maxAmount={maxAmount}
            dateRangeText={dateRangeText}
            showAdvancedFilters={showAdvancedFilters}
            showDatePicker={showDatePicker}
            activeFiltersCount={activeFiltersCount}
            statusCounts={statusCounts}
            selectedInvoiceId={selectedInvoice ? selectedInvoice.invoiceNumber : null}
            selectedInvoiceStatus={selectedInvoice ? selectedInvoice.status : null}
            onStatusChange={(st) => {
              handleStatusChange(st);
              setCurrentPage(1);
            }}
            onSearchChange={(val) => {
              handleSearchChange(val);
              setCurrentPage(1);
            }}
            onVatRateChange={(val) => {
              handleVatRateChange(val);
              setCurrentPage(1);
            }}
            onPaymentMethodChange={(val) => {
              setPaymentMethodFilter(val);
              setCurrentPage(1);
            }}
            onStartDateChange={(val) => {
              setStartDate(val);
              setCurrentPage(1);
            }}
            onEndDateChange={(val) => {
              setEndDate(val);
              setCurrentPage(1);
            }}
            onMinAmountChange={(val) => {
              setMinAmount(val);
              setCurrentPage(1);
            }}
            onMaxAmountChange={(val) => {
              setMaxAmount(val);
              setCurrentPage(1);
            }}
            onToggleAdvancedFilters={() => setShowAdvancedFilters((prev) => !prev)}
            onToggleDatePicker={() => setShowDatePicker((prev) => !prev)}
            onDatePreset={(preset) => {
              handleDatePreset(preset);
              setCurrentPage(1);
            }}
            onResetFilters={() => {
              resetFilters();
              setCurrentPage(1);
            }}
            onViewDetail={() => handleViewDetail()}
            onEditDraft={() => handleEditDraftFromFilter()}
            onDeleteDraft={() => {
              if (selectedInvoice && selectedInvoice.status === 'DRAFT') {
                setTargetDeleteInvoice(selectedInvoice);
                setDeleteModalOpen(true);
              }
            }}
          />

          {/* InvoiceTableIsland */}
          <InvoiceTableIsland
            invoices={tableRows}
            selectedId={selectedInvoice?.id || null}
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={filteredInvoices.length}
            onSelectInvoice={(inv) => {
              if (!inv) {
                handleSelectInvoice(null);
              } else {
                const full = invoices.find((i) => String(i.id) === String(inv.id));
                handleSelectInvoice(full || null);
              }
            }}
            onViewDetail={(id) => navigate('/invoices/:id', { id })}
            onEditDraft={(id) => {
              const row = tableRows.find((r) => r.id === id);
              if (row) handleEdit(row);
            }}
            onCloneInvoice={handleClone}
            onOpenDeleteModal={handleOpenDelete}
            onOpenCancelModal={handleOpenCancel}
            onOpenReplaceModal={handleReplace}
            onPageChange={(p) => setCurrentPage(p)}
            onPageSizeChange={(sz) => {
              setPageSize(sz);
              setCurrentPage(1);
            }}
          />
        </div>
      </main>

      {/* Delete Draft Modal Island */}
      <InvoiceDeleteModalIsland
        isOpen={deleteModalOpen}
        invoiceId={targetDeleteInvoice?.id}
        invoiceNumber={targetDeleteInvoice?.invoiceNumber}
        customerName={targetDeleteInvoice?.customerName}
        totalAmount={targetDeleteInvoice?.totalAmount}
        createdAt={targetDeleteInvoice?.createdAt}
        isSubmitting={isDeleting}
        onClose={() => {
          setDeleteModalOpen(false);
          setTargetDeleteInvoice(null);
        }}
        onConfirm={handleConfirmDelete}
      />

      {/* Cancel Issued Invoice Modal Island */}
      <InvoiceCancelModalIsland
        isOpen={cancelModalOpen}
        invoiceId={targetCancelInvoice?.id}
        invoiceNumber={targetCancelInvoice?.invoiceNumber}
        customerName={targetCancelInvoice?.customerName}
        totalAmount={targetCancelInvoice?.totalAmount}
        issueDate={targetCancelInvoice?.issueDate || targetCancelInvoice?.createdAt}
        isSubmitting={isCanceling}
        onClose={() => {
          setCancelModalOpen(false);
          setTargetCancelInvoice(null);
        }}
        onConfirm={handleConfirmCancel}
      />
    </div>
  );
};

export default InvoiceListPage;
