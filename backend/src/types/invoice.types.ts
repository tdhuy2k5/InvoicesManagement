export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  ISSUED = 'ISSUED',
  CANCELED = 'CANCELED',
  REPLACED = 'REPLACED',
}

export enum ErrorCode {
  INVOICE_NOT_FOUND = 'INVOICE_NOT_FOUND',
  INVALID_TRANSITION = 'INVALID_TRANSITION',
  REPLACEMENT_NOT_ALLOWED = 'REPLACEMENT_NOT_ALLOWED',
  FIELD_TOO_LONG = 'FIELD_TOO_LONG',
  ITEMS_LIMIT_EXCEEDED = 'ITEMS_LIMIT_EXCEEDED',
  INVALID_VALUE = 'INVALID_VALUE',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
}

export interface InvoiceItemModel {
  id?: number;
  invoiceId?: string | number;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface InvoiceModel {
  id: string | number;
  templateCode?: string;
  zone?: string;
  sequenceNumber?: number;
  invoiceNumber: string;
  status: InvoiceStatus | string;
  customerName: string;
  customerTaxCode: string;
  customerEmail: string;
  customerAddress: string;
  customerPhone?: string | null;
  customerBankAccount?: string | null;
  paymentMethod?: string;
  sellerName: string;
  sellerTaxCode: string;
  sellerAddress: string;
  sellerPhone: string;
  sellerEmail?: string | null;
  sellerBankAccount?: string | null;
  taxDepartment?: string | null;
  taxAuthorityCode?: string | null;
  agreementMinutes?: string | null;
  totalAmount: number;
  vatAmount: number;
  vatRate: number;
  notes: string;
  cancelReason?: string | null;
  issueDate?: Date | null;
  originalInvoiceId?: string | number | null;
  replacedById?: string | number | null;
  createdAt: Date;
  updatedAt: Date;
  items?: InvoiceItemModel[];
}

export interface CreateInvoiceItemDTO {
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateInvoiceDTO {
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
  items: CreateInvoiceItemDTO[];
}

export interface UpdateInvoiceDTO {
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
  items?: CreateInvoiceItemDTO[];
}

export interface CancelInvoiceDTO {
  cancelReason?: string;
  agreementMinutes?: string;
}

export interface ReplaceInvoiceDTO extends CreateInvoiceDTO {
  agreementMinutes?: string;
}

export interface GetInvoicesQueryDTO {
  status?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}

export interface SearchInvoicesQueryDTO extends GetInvoicesQueryDTO {
  search?: string;
}

export interface InvoiceItemResponseDTO {
  id: number | string;
  invoiceId: string | number;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface InvoiceResponseDTO {
  id: string | number;
  templateCode: string;
  zone?: string;
  sequenceNumber?: number;
  invoiceNumber: string;
  status: InvoiceStatus | string;
  customerName: string;
  customerTaxCode: string;
  customerEmail: string;
  customerAddress: string;
  customerPhone?: string | null;
  customerBankAccount?: string | null;
  paymentMethod: string;
  sellerName: string;
  sellerTaxCode: string;
  sellerAddress: string;
  sellerPhone: string;
  sellerEmail?: string | null;
  sellerBankAccount?: string | null;
  taxDepartment?: string | null;
  taxAuthorityCode?: string | null;
  agreementMinutes?: string | null;
  totalAmount: number;
  vatAmount: number;
  vatRate: number;
  notes: string;
  cancelReason?: string | null;
  issueDate?: string | null;
  originalInvoiceId?: string | number | null;
  replacedById?: string | number | null;
  createdAt: string;
  updatedAt: string;
  items?: InvoiceItemResponseDTO[];
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedInvoicesResponseDTO {
  success: boolean;
  data: InvoiceResponseDTO[];
  meta: PaginationMeta;
}

export interface DeleteResponseDTO {
  success: boolean;
  message: string;
}

export interface CalculatedItemTotal {
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface CalculatedTotals {
  items: CalculatedItemTotal[];
  totalAmount: number;
  vatAmount: number;
}

export interface CreateInvoiceModelInput {
  templateCode?: string;
  zone?: string;
  sequenceNumber?: number;
  invoiceNumber: string;
  status: string;
  customerName: string;
  customerTaxCode: string;
  customerEmail: string;
  customerAddress: string;
  customerPhone?: string | null;
  customerBankAccount?: string | null;
  paymentMethod?: string;
  sellerName: string;
  sellerTaxCode: string;
  sellerAddress: string;
  sellerPhone: string;
  sellerEmail?: string | null;
  sellerBankAccount?: string | null;
  taxDepartment?: string | null;
  taxAuthorityCode?: string | null;
  agreementMinutes?: string | null;
  totalAmount: number;
  vatAmount: number;
  vatRate: number;
  notes: string;
  originalInvoiceId?: string | number | null;
  issueDate?: Date | null;
  items: CalculatedItemTotal[];
}

export interface UpdateDraftInvoiceModelInput {
  templateCode?: string;
  customerName?: string;
  customerTaxCode?: string;
  customerEmail?: string;
  customerAddress?: string;
  customerPhone?: string | null;
  customerBankAccount?: string | null;
  paymentMethod?: string;
  sellerName?: string;
  sellerTaxCode?: string;
  sellerAddress?: string;
  sellerPhone?: string;
  sellerEmail?: string | null;
  sellerBankAccount?: string | null;
  taxDepartment?: string | null;
  totalAmount?: number;
  vatAmount?: number;
  vatRate?: number;
  notes?: string;
  items?: CalculatedItemTotal[];
}

export interface FindManyInvoicesInput {
  status?: string;
  fromDate?: Date;
  toDate?: Date;
  page: number;
  limit: number;
}

export interface InvoiceSearchCriteriaInput {
  search?: string;
  status?: string;
  fromDate?: Date;
  toDate?: Date;
  page: number;
  limit: number;
}

export interface PdfStreamResultDTO {
  buffer: Uint8Array | any;
  filename: string;
  contentType: string;
  isDownload: boolean;
}
