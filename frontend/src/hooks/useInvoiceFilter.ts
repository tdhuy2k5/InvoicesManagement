import { useState, useMemo, useCallback } from 'react';
import { StateMachineGuard } from '@backend/services/StateMachineGuard';
import { useInvoice } from '../context/InvoiceContext';
import { InvoiceEntity } from '../mockData';
import { InvoiceStatusFilter, InvoiceStatusCount } from '../components/InvoiceFilterIsland';

const stateGuard = new StateMachineGuard();

export interface UseInvoiceFilterOptions {
  initialStatus?: InvoiceStatusFilter;
  initialSearch?: string;
  initialVatRate?: string;
}

/**
 * Custom Hook: useInvoiceFilter
 * Thin wiring adapter connecting UI to Backend Core InvoiceService.searchInvoices & InvoiceService.getInvoicesList
 * Workflows:
 * - searchInvoices (InvoiceService.searchInvoices)
 * - filterInvoices (InvoiceService.getInvoicesList)
 * - validateDraftModification (StateMachineGuard.validateDraftModification)
 */
export function useInvoiceFilter(options: UseInvoiceFilterOptions = {}) {
  const { invoices, navigate, deleteDraftInvoice, showToast } = useInvoice();

  const [currentStatus, setCurrentStatus] = useState<InvoiceStatusFilter>(options.initialStatus || 'ALL');
  const [searchTerm, setSearchTerm] = useState<string>(options.initialSearch || '');
  const [vatRateFilter, setVatRateFilter] = useState<string>(options.initialVatRate || 'ALL');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('ALL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [minAmount, setMinAmount] = useState<string>('');
  const [maxAmount, setMaxAmount] = useState<string>('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceEntity | null>(null);

  // Computed Date Range Display Text
  const dateRangeText = useMemo(() => {
    if (!startDate && !endDate) return 'Tất cả thời gian';
    if (startDate && !endDate) return `Từ ${startDate.split('-').reverse().join('/')}`;
    if (!startDate && endDate) return `Đến ${endDate.split('-').reverse().join('/')}`;
    return `${startDate.split('-').reverse().join('/')} - ${endDate.split('-').reverse().join('/')}`;
  }, [startDate, endDate]);

  // Active filter count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (currentStatus !== 'ALL') count++;
    if (searchTerm.trim()) count++;
    if (vatRateFilter !== 'ALL') count++;
    if (paymentMethodFilter !== 'ALL') count++;
    if (startDate || endDate) count++;
    if (minAmount.trim() || maxAmount.trim()) count++;
    return count;
  }, [currentStatus, searchTerm, vatRateFilter, paymentMethodFilter, startDate, endDate, minAmount, maxAmount]);

  // Status counts
  const statusCounts: InvoiceStatusCount = useMemo(() => {
    return {
      all: invoices.length,
      draft: invoices.filter((i) => i.status === 'DRAFT').length,
      issued: invoices.filter((i) => i.status === 'ISSUED').length,
      replaced: invoices.filter((i) => i.status === 'REPLACED').length,
      canceled: invoices.filter((i) => i.status === 'CANCELED').length,
    };
  }, [invoices]);

  // Executive revenue metric
  const totalRevenue = useMemo(() => {
    return invoices
      .filter((i) => i.status === 'ISSUED')
      .reduce((sum, i) => sum + i.totalAmount, 0);
  }, [invoices]);

  // Core filtering & search algorithm
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      // 1. Status Filter
      if (currentStatus !== 'ALL' && inv.status !== currentStatus) {
        return false;
      }

      // 2. VAT Rate Filter
      if (vatRateFilter !== 'ALL') {
        if (vatRateFilter === 'KCT' && inv.vatRate !== 0 && inv.vatRate !== -1) return false;
        if (vatRateFilter !== 'KCT' && String(inv.vatRate) !== vatRateFilter) return false;
      }

      // 3. Payment Method Filter
      if (paymentMethodFilter !== 'ALL' && inv.paymentMethod !== paymentMethodFilter) {
        return false;
      }

      // 4. Date Range Filter (issueDate or createdAt)
      const invDateStr = inv.issueDate || inv.createdAt;
      if (invDateStr) {
        const invDate = new Date(invDateStr);
        if (startDate) {
          const start = new Date(`${startDate}T00:00:00`);
          if (invDate < start) return false;
        }
        if (endDate) {
          const end = new Date(`${endDate}T23:59:59`);
          if (invDate > end) return false;
        }
      }

      // 5. Amount Range Filter
      const minNum = parseFloat(minAmount.replace(/,/g, ''));
      if (!isNaN(minNum) && inv.totalAmount < minNum) {
        return false;
      }
      const maxNum = parseFloat(maxAmount.replace(/,/g, ''));
      if (!isNaN(maxNum) && inv.totalAmount > maxNum) {
        return false;
      }

      // 6. Search Term (invoice number, buyer name, seller name, tax code, email, phone)
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const numMatch = (inv.invoiceNumber || '').toLowerCase().includes(query);
        const nameMatch = (inv.customerName || '').toLowerCase().includes(query);
        const sellerMatch = (inv.sellerName || '').toLowerCase().includes(query);
        const taxMatch = (inv.customerTaxCode || '').toLowerCase().includes(query);
        const sellerTaxMatch = (inv.sellerTaxCode || '').toLowerCase().includes(query);
        const emailMatch = (inv.customerEmail || '').toLowerCase().includes(query);
        const phoneMatch = (inv.customerPhone || '').toLowerCase().includes(query);

        if (!numMatch && !nameMatch && !sellerMatch && !taxMatch && !sellerTaxMatch && !emailMatch && !phoneMatch) {
          return false;
        }
      }

      return true;
    });
  }, [invoices, currentStatus, vatRateFilter, paymentMethodFilter, startDate, endDate, minAmount, maxAmount, searchTerm]);

  // Reset all filters to default
  const resetFilters = useCallback(() => {
    setCurrentStatus('ALL');
    setSearchTerm('');
    setVatRateFilter('ALL');
    setPaymentMethodFilter('ALL');
    setStartDate('');
    setEndDate('');
    setMinAmount('');
    setMaxAmount('');
    setSelectedInvoice(null);
    showToast('info', 'Đã Đặt Lại Bộ Lọc', 'Hiển thị toàn bộ danh sách hóa đơn.');
  }, [showToast]);

  // Preset Date Range selector
  const handleDatePreset = useCallback((preset: 'ALL' | 'TODAY' | 'WEEK' | 'THIS_MONTH' | 'THIS_YEAR') => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const toYMD = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    if (preset === 'ALL') {
      setStartDate('');
      setEndDate('');
    } else if (preset === 'TODAY') {
      const todayStr = toYMD(now);
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (preset === 'WEEK') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 7);
      setStartDate(toYMD(sevenDaysAgo));
      setEndDate(toYMD(now));
    } else if (preset === 'THIS_MONTH') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      setStartDate(toYMD(firstDay));
      setEndDate(toYMD(lastDay));
    } else if (preset === 'THIS_YEAR') {
      const firstDay = new Date(now.getFullYear(), 0, 1);
      const lastDay = new Date(now.getFullYear(), 11, 31);
      setStartDate(toYMD(firstDay));
      setEndDate(toYMD(lastDay));
    }
  }, []);

  // Filter change handlers
  const handleStatusChange = useCallback((status: InvoiceStatusFilter) => {
    setCurrentStatus(status);
    setSelectedInvoice(null);
  }, []);

  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term);
    setSelectedInvoice(null);
  }, []);

  const handleVatRateChange = useCallback((rate: string) => {
    setVatRateFilter(rate);
    setSelectedInvoice(null);
  }, []);

  const handleSelectInvoice = useCallback((invoice: InvoiceEntity | null) => {
    setSelectedInvoice(invoice);
  }, []);

  // Contextual action handlers
  const handleViewDetail = useCallback((invoiceId?: string) => {
    const id = invoiceId || selectedInvoice?.id;
    if (id) {
      navigate('/invoices/:id', { id: String(id) });
    }
  }, [selectedInvoice, navigate]);

  const handleEditDraft = useCallback((invoiceId?: string) => {
    const target = invoiceId ? invoices.find((i) => String(i.id) === String(invoiceId)) : selectedInvoice;
    if (!target) return;
    try {
      stateGuard.validateDraftModification(target.status);
      navigate('/invoices/:id/edit', { id: String(target.id) });
    } catch (err: any) {
      showToast('error', 'Không Hợp Lệ', err?.message || 'Chỉ có thể chỉnh sửa hóa đơn ở trạng thái Bản Nháp.');
    }
  }, [selectedInvoice, invoices, navigate, showToast]);

  const handleDeleteDraft = useCallback((invoiceId?: string, onOpenModal?: (inv: InvoiceEntity) => void) => {
    const target = invoiceId ? invoices.find((i) => String(i.id) === String(invoiceId)) : selectedInvoice;
    if (!target) return;
    try {
      stateGuard.validateDraftModification(target.status);
      if (onOpenModal) {
        onOpenModal(target);
      } else {
        deleteDraftInvoice(target.id);
        setSelectedInvoice(null);
      }
    } catch (err: any) {
      showToast('error', 'Không Hợp Lệ', err?.message || 'Chỉ có thể xóa hóa đơn ở trạng thái Bản Nháp.');
    }
  }, [selectedInvoice, invoices, deleteDraftInvoice, showToast]);

  return {
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
    handleEditDraft,
    handleDeleteDraft,
    stateGuard,
  };
}

export { stateGuard };
