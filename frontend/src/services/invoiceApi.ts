import { InvoiceEntity, InvoiceItem } from '../mockData';

const API_BASE_URL = '/api';

export interface InvoiceListQueryParams {
  status?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
  search?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

/**
 * REST API Client for Electronic Invoice Management
 */
export const invoiceApi = {
  /**
   * GET /api/invoices - List invoices with pagination, filtering & search
   */
  async getInvoices(params: InvoiceListQueryParams = {}): Promise<ApiResponse<InvoiceEntity[]>> {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'ALL') query.set('status', params.status);
    if (params.fromDate) query.set('fromDate', params.fromDate);
    if (params.toDate) query.set('toDate', params.toDate);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.search) query.set('search', params.search);

    const queryString = query.toString();
    const url = `${API_BASE_URL}/invoices${queryString ? `?${queryString}` : ''}`;

    const res = await fetch(url);
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error?.message || json.message || 'Không thể tải danh sách hóa đơn');
    }
    return json;
  },

  /**
   * GET /api/invoices/:id - Get invoice by ID
   */
  async getInvoiceById(id: string): Promise<ApiResponse<InvoiceEntity>> {
    const res = await fetch(`${API_BASE_URL}/invoices/${encodeURIComponent(id)}`);
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error?.message || json.message || `Không tìm thấy hóa đơn #${id}`);
    }
    return json;
  },

  /**
   * POST /api/invoices - Create new draft invoice
   */
  async createDraft(payload: {
    templateCode?: string;
    zone?: string;
    customerName: string;
    customerTaxCode: string;
    customerEmail: string;
    customerAddress: string;
    customerPhone?: string;
    customerBankAccount?: string;
    paymentMethod?: string;
    sellerName: string;
    sellerTaxCode: string;
    sellerAddress: string;
    sellerPhone: string;
    sellerEmail?: string;
    sellerBankAccount?: string;
    taxDepartment?: string;
    vatRate: number;
    notes?: string;
    items: InvoiceItem[];
  }): Promise<ApiResponse<InvoiceEntity>> {
    const res = await fetch(`${API_BASE_URL}/invoices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error?.message || json.message || 'Không thể tạo bản nháp hóa đơn');
    }
    return json;
  },

  /**
   * PUT /api/invoices/:id - Update draft invoice
   */
  async updateDraft(
    id: string,
    payload: {
      templateCode?: string;
      customerName?: string;
      customerTaxCode?: string;
      customerEmail?: string;
      customerAddress?: string;
      customerPhone?: string;
      customerBankAccount?: string;
      paymentMethod?: string;
      sellerName?: string;
      sellerTaxCode?: string;
      sellerAddress?: string;
      sellerPhone?: string;
      sellerEmail?: string;
      sellerBankAccount?: string;
      taxDepartment?: string;
      vatRate?: number;
      notes?: string;
      items?: InvoiceItem[];
    }
  ): Promise<ApiResponse<InvoiceEntity>> {
    const res = await fetch(`${API_BASE_URL}/invoices/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error?.message || json.message || 'Không thể cập nhật hóa đơn');
    }
    return json;
  },

  /**
   * DELETE /api/invoices/:id - Delete draft invoice
   */
  async deleteDraft(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE_URL}/invoices/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error?.message || json.message || 'Không thể xóa hóa đơn');
    }
    return json;
  },

  /**
   * POST /api/invoices/:id/issue - Issue/Sign invoice
   */
  async issueInvoice(id: string): Promise<ApiResponse<InvoiceEntity>> {
    const res = await fetch(`${API_BASE_URL}/invoices/${encodeURIComponent(id)}/issue`, {
      method: 'POST',
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error?.message || json.message || 'Không thể phát hành hóa đơn');
    }
    return json;
  },

  /**
   * POST /api/invoices/:id/cancel - Cancel issued invoice
   */
  async cancelInvoice(id: string, cancelReason: string): Promise<ApiResponse<InvoiceEntity>> {
    const res = await fetch(`${API_BASE_URL}/invoices/${encodeURIComponent(id)}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cancelReason }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error?.message || json.message || 'Không thể hủy hóa đơn');
    }
    return json;
  },

  /**
   * POST /api/invoices/:id/replace - Replace issued invoice
   */
  async replaceInvoice(
    id: string,
    payload: {
      templateCode?: string;
      customerName: string;
      customerTaxCode: string;
      customerEmail: string;
      customerAddress: string;
      customerPhone?: string;
      customerBankAccount?: string;
      paymentMethod?: string;
      sellerName: string;
      sellerTaxCode: string;
      sellerAddress: string;
      sellerPhone: string;
      sellerEmail?: string;
      sellerBankAccount?: string;
      taxDepartment?: string;
      vatRate: number;
      notes?: string;
      items: InvoiceItem[];
    }
  ): Promise<ApiResponse<InvoiceEntity>> {
    const res = await fetch(`${API_BASE_URL}/invoices/${encodeURIComponent(id)}/replace`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error?.message || json.message || 'Không thể lập hóa đơn thay thế');
    }
    return json;
  },

  /**
   * POST /api/invoices/:id/clone - Clone invoice into draft
   */
  async cloneInvoice(id: string): Promise<ApiResponse<InvoiceEntity>> {
    const res = await fetch(`${API_BASE_URL}/invoices/${encodeURIComponent(id)}/clone`, {
      method: 'POST',
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error?.message || json.message || 'Không thể nhân bản hóa đơn');
    }
    return json;
  },

  /**
   * GET PDF URL for download or inline preview
   */
  getPdfDownloadUrl(id: string, isDownload = true): string {
    return `${API_BASE_URL}/invoices/${encodeURIComponent(id)}/pdf?download=${isDownload}`;
  },
};
