import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { InvoiceEntity } from '../mockData';
import { invoiceApi, InvoiceListQueryParams } from '../services/invoiceApi';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}

export interface InvoiceContextType {
  invoices: InvoiceEntity[];
  isLoading: boolean;
  currentRoute: string;
  routeParams: Record<string, string>;
  toast: ToastMessage | null;
  navigate: (route: string, params?: Record<string, string>) => void;
  showToast: (type: ToastMessage['type'], title: string, message: string) => void;
  hideToast: () => void;
  loadInvoices: (params?: InvoiceListQueryParams) => Promise<void>;
  getInvoiceById: (id: string) => InvoiceEntity | undefined;
  fetchInvoiceById: (id: string) => Promise<InvoiceEntity | null>;
  createDraftInvoice: (data: any) => Promise<InvoiceEntity>;
  updateDraftInvoice: (id: string, data: any) => Promise<InvoiceEntity>;
  issueInvoice: (id: string) => Promise<InvoiceEntity>;
  cancelInvoice: (id: string, cancelReason: string) => Promise<InvoiceEntity>;
  replaceInvoice: (id: string, data: any) => Promise<InvoiceEntity>;
  cloneInvoice: (id: string) => Promise<InvoiceEntity>;
  deleteDraftInvoice: (id: string) => Promise<boolean>;
}

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

export const InvoiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [invoices, setInvoices] = useState<InvoiceEntity[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    const hash = window.location.hash.replace('#', '') || '/invoices';
    return hash.split('?')[0] || '/invoices';
  });

  const [routeParams, setRouteParams] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = useCallback((type: ToastMessage['type'], title: string, message: string) => {
    const newToast: ToastMessage = {
      id: String(Date.now()),
      type,
      title,
      message,
    };
    setToast(newToast);
    setTimeout(() => {
      setToast((prev) => (prev?.id === newToast.id ? null : prev));
    }, 4000);
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  // Fetch all invoices from backend API
  const loadInvoices = useCallback(async (params: InvoiceListQueryParams = {}) => {
    setIsLoading(true);
    try {
      const res = await invoiceApi.getInvoices(params);
      if (res.data) {
        setInvoices(res.data);
      }
    } catch (err: any) {
      console.warn('[InvoiceContext] Could not load from backend API, falling back to local state:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load from backend API on mount
  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  // Handle hash changes for client-side routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') || '/invoices';
      const cleanPath = hash.split('?')[0];

      // Parse routes
      if (cleanPath === '' || cleanPath === '/' || cleanPath === '/invoices') {
        setCurrentRoute('/invoices');
        setRouteParams({});
      } else if (cleanPath === '/invoices/new') {
        setCurrentRoute('/invoices/new');
        setRouteParams({});
      } else if (cleanPath.startsWith('/invoices/') && cleanPath.endsWith('/edit')) {
        const parts = cleanPath.split('/');
        const id = parts[2];
        setCurrentRoute('/invoices/:id/edit');
        setRouteParams({ id });
      } else if (cleanPath.startsWith('/invoices/') && cleanPath.endsWith('/replace')) {
        const parts = cleanPath.split('/');
        const id = parts[2];
        setCurrentRoute('/invoices/:id/replace');
        setRouteParams({ id });
      } else if (cleanPath.startsWith('/invoices/')) {
        const parts = cleanPath.split('/');
        const id = parts[2];
        if (id) {
          setCurrentRoute('/invoices/:id');
          setRouteParams({ id });
        } else {
          setCurrentRoute('/invoices');
          setRouteParams({});
        }
      } else {
        setCurrentRoute('/404');
        setRouteParams({});
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = useCallback((route: string, params: Record<string, string> = {}) => {
    let resolvedHash = route;
    if (params.id) {
      resolvedHash = route.replace(':id', params.id);
    }
    window.location.hash = resolvedHash;
    setCurrentRoute(route);
    setRouteParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const getInvoiceById = useCallback(
    (id: string) => {
      return invoices.find((inv) => String(inv.id) === String(id));
    },
    [invoices]
  );

  const fetchInvoiceById = useCallback(async (id: string): Promise<InvoiceEntity | null> => {
    try {
      const res = await invoiceApi.getInvoiceById(id);
      if (res.data) {
        setInvoices((prev) => {
          const exists = prev.some((i) => String(i.id) === String(id));
          if (exists) {
            return prev.map((i) => (String(i.id) === String(id) ? res.data : i));
          }
          return [res.data, ...prev];
        });
        return res.data;
      }
      return null;
    } catch (err: any) {
      console.warn(`[InvoiceContext] fetchInvoiceById error for #${id}:`, err);
      return null;
    }
  }, []);

  const createDraftInvoice = async (data: any): Promise<InvoiceEntity> => {
    try {
      const res = await invoiceApi.createDraft({
        templateCode: data.templateCode || '01GTKT3/001',
        zone: data.zone || '1C26TAA',
        customerName: data.customerName || '',
        customerTaxCode: data.customerTaxCode || '',
        customerEmail: data.customerEmail || '',
        customerAddress: data.customerAddress || '',
        customerPhone: data.customerPhone || '',
        customerBankAccount: data.customerBankAccount || '',
        paymentMethod: data.paymentMethod || 'Chuyển khoản (TM/CK)',
        sellerName: data.sellerName || '',
        sellerTaxCode: data.sellerTaxCode || '',
        sellerAddress: data.sellerAddress || '',
        sellerPhone: data.sellerPhone || '',
        sellerEmail: data.sellerEmail || '',
        sellerBankAccount: data.sellerBankAccount || '',
        taxDepartment: data.taxDepartment || 'CỤC THUẾ TP. HÀ NỘI',
        vatRate: data.vatRate !== undefined ? data.vatRate : 10,
        notes: data.notes || '',
        items: data.items || [],
      });

      const newInv = res.data;
      setInvoices((prev) => [newInv, ...prev.filter((i) => String(i.id) !== String(newInv.id))]);
      showToast('success', 'Tạo Bản Nháp Thành Công', `Bản nháp hóa đơn ${newInv.invoiceNumber} đã được lưu.`);
      return newInv;
    } catch (err: any) {
      showToast('error', 'Lỗi Tạo Bản Nháp', err?.message || 'Không thể tạo bản nháp hóa đơn.');
      throw err;
    }
  };

  const updateDraftInvoice = async (id: string, data: any): Promise<InvoiceEntity> => {
    try {
      const res = await invoiceApi.updateDraft(id, {
        templateCode: data.templateCode,
        customerName: data.customerName,
        customerTaxCode: data.customerTaxCode,
        customerEmail: data.customerEmail,
        customerAddress: data.customerAddress,
        customerPhone: data.customerPhone,
        customerBankAccount: data.customerBankAccount,
        paymentMethod: data.paymentMethod,
        sellerName: data.sellerName,
        sellerTaxCode: data.sellerTaxCode,
        sellerAddress: data.sellerAddress,
        sellerPhone: data.sellerPhone,
        sellerEmail: data.sellerEmail,
        sellerBankAccount: data.sellerBankAccount,
        taxDepartment: data.taxDepartment,
        vatRate: data.vatRate,
        notes: data.notes,
        items: data.items,
      });

      const updated = res.data;
      setInvoices((prev) => prev.map((inv) => (String(inv.id) === String(id) ? updated : inv)));
      showToast('success', 'Cập Nhật Thành Công', `Đã lưu thay đổi cho bản nháp ${updated.invoiceNumber}.`);
      return updated;
    } catch (err: any) {
      showToast('error', 'Lỗi Cập Nhật', err?.message || 'Không thể cập nhật hóa đơn.');
      throw err;
    }
  };

  const issueInvoice = async (id: string): Promise<InvoiceEntity> => {
    try {
      const res = await invoiceApi.issueInvoice(id);
      const updated = res.data;
      setInvoices((prev) => prev.map((inv) => (String(inv.id) === String(id) ? updated : inv)));
      showToast('success', 'Phát Hành Thành Công', `Hóa đơn ${updated.invoiceNumber} đã được ký số và phát hành chính thức.`);
      return updated;
    } catch (err: any) {
      showToast('error', 'Lỗi Phát Hành', err?.message || 'Không thể phát hành hóa đơn.');
      throw err;
    }
  };

  const cancelInvoice = async (id: string, cancelReason: string): Promise<InvoiceEntity> => {
    try {
      const res = await invoiceApi.cancelInvoice(id, cancelReason);
      const updated = res.data;
      setInvoices((prev) => prev.map((inv) => (String(inv.id) === String(id) ? updated : inv)));
      showToast('warning', 'Đã Hủy Hóa Đơn', `Hóa đơn ${updated.invoiceNumber} đã chuyển sang trạng thái CANCELED.`);
      return updated;
    } catch (err: any) {
      showToast('error', 'Lỗi Hủy Hóa Đơn', err?.message || 'Không thể hủy hóa đơn.');
      throw err;
    }
  };

  const replaceInvoice = async (id: string, data: any): Promise<InvoiceEntity> => {
    try {
      const res = await invoiceApi.replaceInvoice(id, {
        templateCode: data.templateCode,
        customerName: data.customerName,
        customerTaxCode: data.customerTaxCode,
        customerEmail: data.customerEmail,
        customerAddress: data.customerAddress,
        customerPhone: data.customerPhone,
        customerBankAccount: data.customerBankAccount,
        paymentMethod: data.paymentMethod,
        sellerName: data.sellerName,
        sellerTaxCode: data.sellerTaxCode,
        sellerAddress: data.sellerAddress,
        sellerPhone: data.sellerPhone,
        sellerEmail: data.sellerEmail,
        sellerBankAccount: data.sellerBankAccount,
        taxDepartment: data.taxDepartment,
        agreementMinutes: data.agreementMinutes,
        vatRate: data.vatRate,
        notes: data.notes,
        items: data.items,
      });

      const replacement = res.data;
      await loadInvoices();
      showToast(
        'success',
        'Thay Thế Hóa Đơn Thành Công',
        `Đã tạo hóa đơn thay thế ${replacement.invoiceNumber}.`
      );
      return replacement;
    } catch (err: any) {
      showToast('error', 'Lỗi Thay Thế Hóa Đơn', err?.message || 'Không thể lập hóa đơn thay thế.');
      throw err;
    }
  };

  const cloneInvoice = async (id: string): Promise<InvoiceEntity> => {
    try {
      const res = await invoiceApi.cloneInvoice(id);
      const cloned = res.data;
      setInvoices((prev) => [cloned, ...prev]);
      showToast('info', 'Đã Nhân Bản Hóa Đơn', `Bản nháp ${cloned.invoiceNumber} đã được tạo.`);
      return cloned;
    } catch (err: any) {
      showToast('error', 'Lỗi Nhân Bản', err?.message || 'Không thể nhân bản hóa đơn.');
      throw err;
    }
  };

  const deleteDraftInvoice = async (id: string): Promise<boolean> => {
    try {
      await invoiceApi.deleteDraft(id);
      setInvoices((prev) => prev.filter((inv) => String(inv.id) !== String(id)));
      showToast('success', 'Đã Xóa Bản Nháp', 'Bản nháp hóa đơn đã được xóa hoàn toàn.');
      return true;
    } catch (err: any) {
      showToast('error', 'Lỗi Xóa Bản Nháp', err?.message || 'Không thể xóa hóa đơn.');
      return false;
    }
  };

  return (
    <InvoiceContext.Provider
      value={{
        invoices,
        isLoading,
        currentRoute,
        routeParams,
        toast,
        navigate,
        showToast,
        hideToast,
        loadInvoices,
        getInvoiceById,
        fetchInvoiceById,
        createDraftInvoice,
        updateDraftInvoice,
        issueInvoice,
        cancelInvoice,
        replaceInvoice,
        cloneInvoice,
        deleteDraftInvoice,
      }}
    >
      {children}
    </InvoiceContext.Provider>
  );
};

export const useInvoice = () => {
  const ctx = useContext(InvoiceContext);
  if (!ctx) {
    throw new Error('useInvoice must be used within an InvoiceProvider');
  }
  return ctx;
};
