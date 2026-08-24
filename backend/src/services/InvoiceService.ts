import { DEFAULT_INVOICE_ZONE } from './InvoiceSequenceService';
import { AppError } from '../utils/AppError';
import {
  InvoiceStatus,
  ErrorCode,
  InvoiceModel,
  CreateInvoiceDTO,
  UpdateInvoiceDTO,
  CancelInvoiceDTO,
  ReplaceInvoiceDTO,
  GetInvoicesQueryDTO,
  SearchInvoicesQueryDTO,
  InvoiceResponseDTO,
  PaginatedInvoicesResponseDTO,
  DeleteResponseDTO,
  CalculatedTotals,
  CreateInvoiceModelInput,
  UpdateDraftInvoiceModelInput,
  FindManyInvoicesInput,
  InvoiceSearchCriteriaInput,
} from '../types/invoice.types';

export interface IInvoiceRepository {
  createInvoice(data: CreateInvoiceModelInput): Promise<InvoiceModel>;
  findManyInvoices(filter: FindManyInvoicesInput): Promise<{ items: InvoiceModel[]; total: number }>;
  findInvoiceById(id: number | string): Promise<InvoiceModel | null>;
  replaceDraftItemsAndUpdate(id: number | string, data: UpdateDraftInvoiceModelInput): Promise<InvoiceModel>;
  deleteInvoice(id: number | string): Promise<InvoiceModel>;
  updateInvoiceStatus(
    id: number | string,
    status: InvoiceStatus,
    issueDate?: Date,
    cancelReason?: string,
    replacedById?: number | string,
    agreementMinutes?: string
  ): Promise<InvoiceModel>;
  issueInvoiceWithSequence?(
    id: number | string,
    sequenceNumber: number,
    invoiceNumber: string,
    issueDate: Date,
    taxAuthorityCode?: string
  ): Promise<InvoiceModel>;
  executeReplacementTransaction(
    originalId: number | string,
    newInvoiceData: CreateInvoiceModelInput
  ): Promise<{ original: InvoiceModel; replacement: InvoiceModel }>;
  searchInvoicesRepo(criteria: InvoiceSearchCriteriaInput): Promise<{ items: InvoiceModel[]; total: number }>;
}

export interface IInvoiceCalculationService {
  calculateInvoiceTotals(items: Array<{ description: string; unit: string; quantity: number; unitPrice: number }>, vatRate: number): CalculatedTotals;
}

export interface IInvoiceSequenceService {
  generateDraftCode?(prefix?: string): string;
  generateTaxAuthorityCode?(zone?: string): string;
  generateInvoiceNumber(zoneOrYear?: string | number): Promise<string>;
}

export interface IStateMachineGuard {
  validateDraftModification(currentStatus: string): void;
  validateIssueTransition(currentStatus: string): void;
  validateCancelTransition(currentStatus: string): void;
  validateReplacementEligibility(currentStatus: string, originalInvoiceId: string | number | null | undefined): void;
}

export interface IPdfService {
  invalidatePdfCache(invoiceNumber: string): Promise<void> | void;
}

export class InvoiceService {
  constructor(
    private readonly invoiceRepo: IInvoiceRepository,
    private readonly calculationService: IInvoiceCalculationService,
    private readonly sequenceService: IInvoiceSequenceService,
    private readonly stateMachineGuard: IStateMachineGuard,
    private readonly pdfService?: IPdfService
  ) {}

  /**
   * Helper: Normalize string/number ID into string/number ID
   */
  private parseId(id: string | number): string | number {
    if (id === undefined || id === null || (typeof id === 'string' && !id.trim())) {
      throw new AppError(400, ErrorCode.INVALID_VALUE, `Invalid invoice ID: ${id}`);
    }
    return typeof id === 'number' ? id : id.trim();
  }

  /**
   * Helper: Map InvoiceModel to InvoiceResponseDTO
   */
  private mapToResponseDTO(invoice: InvoiceModel): InvoiceResponseDTO {
    const mappedItems = invoice.items?.map((item) => ({
      id: item.id || 0,
      invoiceId: item.invoiceId || invoice.id,
      description: item.description,
      unit: item.unit,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      amount: Number(item.amount),
    }));

    return {
      id: invoice.id,
      templateCode: invoice.templateCode || '01GTKT3/001',
      zone: invoice.zone,
      sequenceNumber: invoice.sequenceNumber,
      invoiceNumber: invoice.invoiceNumber,
      status: invoice.status,
      customerName: invoice.customerName,
      customerTaxCode: invoice.customerTaxCode,
      customerEmail: invoice.customerEmail,
      customerAddress: invoice.customerAddress,
      customerPhone: invoice.customerPhone ?? null,
      customerBankAccount: invoice.customerBankAccount ?? null,
      paymentMethod: invoice.paymentMethod || 'TM/CK',
      sellerName: invoice.sellerName,
      sellerTaxCode: invoice.sellerTaxCode,
      sellerAddress: invoice.sellerAddress,
      sellerPhone: invoice.sellerPhone,
      sellerEmail: invoice.sellerEmail ?? null,
      sellerBankAccount: invoice.sellerBankAccount ?? null,
      taxDepartment: invoice.taxDepartment ?? null,
      taxAuthorityCode: invoice.taxAuthorityCode ?? null,
      agreementMinutes: invoice.agreementMinutes ?? null,
      totalAmount: Number(invoice.totalAmount),
      vatAmount: Number(invoice.vatAmount),
      vatRate: Number(invoice.vatRate),
      notes: invoice.notes,
      cancelReason: invoice.cancelReason ?? null,
      issueDate: invoice.issueDate ? new Date(invoice.issueDate).toISOString() : null,
      originalInvoiceId: invoice.originalInvoiceId ?? null,
      replacedById: invoice.replacedById ?? null,
      createdAt: new Date(invoice.createdAt).toISOString(),
      updatedAt: new Date(invoice.updatedAt).toISOString(),
      items: mappedItems,
    };
  }

  /**
   * Workflow: createDraftInvoice
   * Orchestrates draft invoice validation, calculation, sequencing, and creation
   */
  async createDraftInvoice(dto: CreateInvoiceDTO): Promise<InvoiceResponseDTO> {
    if (!dto.customerName || !dto.customerName.trim()) {
      throw new AppError(400, ErrorCode.INVALID_VALUE, 'Customer name is required');
    }
    if (!dto.customerTaxCode || !dto.customerTaxCode.trim()) {
      throw new AppError(400, ErrorCode.INVALID_VALUE, 'Customer tax code is required');
    }
    if (!dto.customerEmail || !dto.customerEmail.trim()) {
      throw new AppError(400, ErrorCode.INVALID_VALUE, 'Customer email is required');
    }
    if (!dto.customerAddress || !dto.customerAddress.trim()) {
      throw new AppError(400, ErrorCode.INVALID_VALUE, 'Customer address is required');
    }
    if (!dto.sellerName || !dto.sellerName.trim()) {
      throw new AppError(400, ErrorCode.INVALID_VALUE, 'Seller name is required');
    }
    if (!dto.sellerTaxCode || !dto.sellerTaxCode.trim()) {
      throw new AppError(400, ErrorCode.INVALID_VALUE, 'Seller tax code is required');
    }
    if (!dto.sellerAddress || !dto.sellerAddress.trim()) {
      throw new AppError(400, ErrorCode.INVALID_VALUE, 'Seller address is required');
    }
    if (!dto.sellerPhone || !dto.sellerPhone.trim()) {
      throw new AppError(400, ErrorCode.INVALID_VALUE, 'Seller phone is required');
    }

    if (!dto.items || dto.items.length === 0) {
      throw new AppError(400, ErrorCode.INVALID_VALUE, 'Invoice must have at least one line item');
    }
    if (dto.items.length > 100) {
      throw new AppError(400, ErrorCode.ITEMS_LIMIT_EXCEEDED, 'Invoice cannot have more than 100 line items');
    }

    if (dto.vatRate < 0 || dto.vatRate > 100) {
      throw new AppError(400, ErrorCode.INVALID_VALUE, 'VAT rate must be between 0 and 100');
    }

    const calculatedTotals = this.calculationService.calculateInvoiceTotals(dto.items, dto.vatRate);
    const zone = dto.zone?.trim() || DEFAULT_INVOICE_ZONE;
    const draftInvoiceNumber = this.sequenceService.generateDraftCode
      ? this.sequenceService.generateDraftCode('NHAP')
      : `NHAP-${Date.now().toString().slice(-6)}`;

    const modelInput: CreateInvoiceModelInput = {
      templateCode: dto.templateCode?.trim() || '01GTKT3/001',
      zone,
      invoiceNumber: draftInvoiceNumber,
      status: InvoiceStatus.DRAFT,
      customerName: dto.customerName.trim(),
      customerTaxCode: dto.customerTaxCode.trim(),
      customerEmail: dto.customerEmail.trim(),
      customerAddress: dto.customerAddress.trim(),
      customerPhone: dto.customerPhone ? dto.customerPhone.trim() : null,
      customerBankAccount: dto.customerBankAccount ? dto.customerBankAccount.trim() : null,
      paymentMethod: dto.paymentMethod?.trim() || 'TM/CK',
      sellerName: dto.sellerName.trim(),
      sellerTaxCode: dto.sellerTaxCode.trim(),
      sellerAddress: dto.sellerAddress.trim(),
      sellerPhone: dto.sellerPhone.trim(),
      sellerEmail: dto.sellerEmail ? dto.sellerEmail.trim() : null,
      sellerBankAccount: dto.sellerBankAccount ? dto.sellerBankAccount.trim() : null,
      taxDepartment: dto.taxDepartment ? dto.taxDepartment.trim() : null,
      totalAmount: calculatedTotals.totalAmount,
      vatAmount: calculatedTotals.vatAmount,
      vatRate: dto.vatRate,
      notes: dto.notes ? dto.notes.trim() : '',
      originalInvoiceId: null,
      items: calculatedTotals.items,
    };

    const created = await this.invoiceRepo.createInvoice(modelInput);
    return this.mapToResponseDTO(created);
  }

  /**
   * Workflow: getInvoices (List)
   * Retrieves paginated list of invoices with optional status/date filters
   */
  async getInvoicesList(query: GetInvoicesQueryDTO): Promise<PaginatedInvoicesResponseDTO> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 10));

    let fromDate: Date | undefined;
    let toDate: Date | undefined;

    if (query.fromDate) {
      fromDate = new Date(query.fromDate);
      if (isNaN(fromDate.getTime())) {
        throw new AppError(400, ErrorCode.INVALID_VALUE, `Invalid fromDate: ${query.fromDate}`);
      }
    }

    if (query.toDate) {
      toDate = new Date(query.toDate);
      if (isNaN(toDate.getTime())) {
        throw new AppError(400, ErrorCode.INVALID_VALUE, `Invalid toDate: ${query.toDate}`);
      }
    }

    const filter: FindManyInvoicesInput = {
      status: query.status,
      fromDate,
      toDate,
      page,
      limit,
    };

    const result = await this.invoiceRepo.findManyInvoices(filter);
    const totalPages = Math.ceil(result.total / limit) || 1;

    return {
      success: true,
      data: result.items.map((item) => this.mapToResponseDTO(item)),
      meta: {
        total: result.total,
        page,
        limit,
        totalPages,
      },
    };
  }

  /**
   * Workflow: getInvoiceById
   * Retrieves a single invoice by ID, ensuring existence or throwing INVOICE_NOT_FOUND
   */
  async getInvoiceById(id: string | number): Promise<InvoiceResponseDTO> {
    const parsedId = this.parseId(id);
    const invoice = await this.invoiceRepo.findInvoiceById(parsedId);

    if (!invoice) {
      throw new AppError(404, ErrorCode.INVOICE_NOT_FOUND, `Invoice with ID ${id} was not found`);
    }

    return this.mapToResponseDTO(invoice);
  }

  /**
   * Workflow: updateDraftInvoice
   * Orchestrates draft invoice update with line item replacement and recalculation
   */
  async updateDraftInvoice(id: string | number, dto: UpdateInvoiceDTO): Promise<InvoiceResponseDTO> {
    const parsedId = this.parseId(id);
    const existing = await this.invoiceRepo.findInvoiceById(parsedId);

    if (!existing) {
      throw new AppError(404, ErrorCode.INVOICE_NOT_FOUND, `Invoice with ID ${id} was not found`);
    }

    this.stateMachineGuard.validateDraftModification(existing.status);

    const updateData: UpdateDraftInvoiceModelInput = {
      templateCode: dto.templateCode,
      customerName: dto.customerName,
      customerTaxCode: dto.customerTaxCode,
      customerEmail: dto.customerEmail,
      customerAddress: dto.customerAddress,
      customerPhone: dto.customerPhone,
      customerBankAccount: dto.customerBankAccount,
      paymentMethod: dto.paymentMethod,
      sellerName: dto.sellerName,
      sellerTaxCode: dto.sellerTaxCode,
      sellerAddress: dto.sellerAddress,
      sellerPhone: dto.sellerPhone,
      sellerEmail: dto.sellerEmail,
      sellerBankAccount: dto.sellerBankAccount,
      taxDepartment: dto.taxDepartment,
      notes: dto.notes,
    };

    if (dto.vatRate !== undefined) {
      if (dto.vatRate < 0 || dto.vatRate > 100) {
        throw new AppError(400, ErrorCode.INVALID_VALUE, 'VAT rate must be between 0 and 100');
      }
      updateData.vatRate = dto.vatRate;
    }

    if (dto.items) {
      if (dto.items.length === 0) {
        throw new AppError(400, ErrorCode.INVALID_VALUE, 'Invoice must have at least one line item');
      }
      if (dto.items.length > 100) {
        throw new AppError(400, ErrorCode.ITEMS_LIMIT_EXCEEDED, 'Invoice cannot have more than 100 line items');
      }

      const activeVatRate = dto.vatRate !== undefined ? dto.vatRate : existing.vatRate;
      const calculated = this.calculationService.calculateInvoiceTotals(dto.items, activeVatRate);
      updateData.items = calculated.items;
      updateData.totalAmount = calculated.totalAmount;
      updateData.vatAmount = calculated.vatAmount;
    } else if (dto.vatRate !== undefined && existing.items) {
      const calculated = this.calculationService.calculateInvoiceTotals(existing.items, dto.vatRate);
      updateData.totalAmount = calculated.totalAmount;
      updateData.vatAmount = calculated.vatAmount;
    }

    const updated = await this.invoiceRepo.replaceDraftItemsAndUpdate(parsedId, updateData);
    return this.mapToResponseDTO(updated);
  }

  /**
   * Workflow: deleteDraftInvoice
   * Deletes a draft invoice and associated line items, ensuring status is DRAFT
   */
  async deleteDraftInvoice(id: string | number): Promise<DeleteResponseDTO> {
    const parsedId = this.parseId(id);
    const existing = await this.invoiceRepo.findInvoiceById(parsedId);

    if (!existing) {
      throw new AppError(404, ErrorCode.INVOICE_NOT_FOUND, `Invoice with ID ${id} was not found`);
    }

    this.stateMachineGuard.validateDraftModification(existing.status);

    await this.invoiceRepo.deleteInvoice(parsedId);

    return {
      success: true,
      message: `Draft invoice ${existing.invoiceNumber} deleted successfully`,
    };
  }

  /**
   * Workflow: cloneInvoice
   * Clones customer and items from existing invoice into a new DRAFT invoice with new sequence number
   */
  async cloneInvoice(id: string | number): Promise<InvoiceResponseDTO> {
    const parsedId = this.parseId(id);
    const source = await this.invoiceRepo.findInvoiceById(parsedId);

    if (!source) {
      throw new AppError(404, ErrorCode.INVOICE_NOT_FOUND, `Source invoice with ID ${id} was not found`);
    }

    if (!source.items || source.items.length === 0) {
      throw new AppError(400, ErrorCode.INVALID_VALUE, 'Source invoice has no line items to clone');
    }

    const zone = source.zone || DEFAULT_INVOICE_ZONE;
    const draftInvoiceNumber = this.sequenceService.generateDraftCode
      ? this.sequenceService.generateDraftCode('NHAP')
      : `NHAP-${Date.now().toString().slice(-6)}`;
    const clonedItems = source.items.map((item) => ({
      description: item.description,
      unit: item.unit,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
    }));

    const calculatedTotals = this.calculationService.calculateInvoiceTotals(clonedItems, source.vatRate);

    const modelInput: CreateInvoiceModelInput = {
      templateCode: source.templateCode || '01GTKT3/001',
      zone,
      invoiceNumber: draftInvoiceNumber,
      status: InvoiceStatus.DRAFT,
      customerName: source.customerName,
      customerTaxCode: source.customerTaxCode,
      customerEmail: source.customerEmail,
      customerAddress: source.customerAddress,
      customerPhone: source.customerPhone,
      customerBankAccount: source.customerBankAccount,
      paymentMethod: source.paymentMethod || 'TM/CK',
      sellerName: source.sellerName,
      sellerTaxCode: source.sellerTaxCode,
      sellerAddress: source.sellerAddress,
      sellerPhone: source.sellerPhone,
      sellerEmail: source.sellerEmail,
      sellerBankAccount: source.sellerBankAccount,
      taxDepartment: source.taxDepartment,
      totalAmount: calculatedTotals.totalAmount,
      vatAmount: calculatedTotals.vatAmount,
      vatRate: source.vatRate,
      notes: source.notes ? `Nhân bản từ ${source.invoiceNumber}. ${source.notes}`.trim() : `Nhân bản từ ${source.invoiceNumber}`,
      originalInvoiceId: null,
      items: calculatedTotals.items,
    };

    const created = await this.invoiceRepo.createInvoice(modelInput);
    return this.mapToResponseDTO(created);
  }

  /**
   * Workflow: issueInvoice
   * Orchestrates invoice issue transition, allocates official sequence number, sets issueDate = now(), and manages PDF cache
   */
  async issueInvoice(id: string | number): Promise<InvoiceResponseDTO> {
    const parsedId = this.parseId(id);
    const existing = await this.invoiceRepo.findInvoiceById(parsedId);

    if (!existing) {
      throw new AppError(404, ErrorCode.INVOICE_NOT_FOUND, `Invoice with ID ${id} was not found`);
    }

    this.stateMachineGuard.validateIssueTransition(existing.status);

    if (!existing.items || existing.items.length === 0) {
      throw new AppError(400, ErrorCode.INVALID_VALUE, 'Cannot issue an invoice without line items');
    }

    const issueDate = new Date();
    const zone = existing.zone || DEFAULT_INVOICE_ZONE;

    // Allocate official sequential invoice number and Tax Authority Code at the moment of issuance
    const officialInvoiceNumber = await this.sequenceService.generateInvoiceNumber(zone);
    const seqMatch = officialInvoiceNumber.match(/\d+$/);
    const sequenceNumber = seqMatch ? parseInt(seqMatch[0], 10) : undefined;
    const taxAuthorityCode = this.sequenceService.generateTaxAuthorityCode
      ? this.sequenceService.generateTaxAuthorityCode(zone)
      : `00E${zone.replace(/^1C/, '')}${Math.random().toString(16).substring(2, 10).toUpperCase()}`;

    let issued: InvoiceModel;
    if (this.invoiceRepo.issueInvoiceWithSequence && sequenceNumber !== undefined) {
      issued = await this.invoiceRepo.issueInvoiceWithSequence(
        parsedId,
        sequenceNumber,
        officialInvoiceNumber,
        issueDate,
        taxAuthorityCode
      );
    } else {
      issued = await this.invoiceRepo.updateInvoiceStatus(
        parsedId,
        InvoiceStatus.ISSUED,
        issueDate
      );
    }

    if (this.pdfService) {
      await this.pdfService.invalidatePdfCache(existing.invoiceNumber);
      await this.pdfService.invalidatePdfCache(officialInvoiceNumber);
    }

    return this.mapToResponseDTO(issued);
  }

  /**
   * Workflow: cancelInvoice
   * Orchestrates transition of ISSUED invoice to CANCELED with audit reason & agreement minutes
   */
  async cancelInvoice(id: string | number, dto: CancelInvoiceDTO): Promise<InvoiceResponseDTO> {
    const parsedId = this.parseId(id);
    const existing = await this.invoiceRepo.findInvoiceById(parsedId);

    if (!existing) {
      throw new AppError(404, ErrorCode.INVOICE_NOT_FOUND, `Invoice with ID ${id} was not found`);
    }

    this.stateMachineGuard.validateCancelTransition(existing.status);

    if (!dto.cancelReason || !dto.cancelReason.trim()) {
      throw new AppError(400, ErrorCode.INVALID_VALUE, 'Cancel reason is required when canceling an invoice');
    }

    const canceled = await this.invoiceRepo.updateInvoiceStatus(
      parsedId,
      InvoiceStatus.CANCELED,
      undefined,
      dto.cancelReason.trim(),
      undefined,
      dto.agreementMinutes ? dto.agreementMinutes.trim() : undefined
    );

    if (this.pdfService) {
      await this.pdfService.invalidatePdfCache(existing.invoiceNumber);
    }

    return this.mapToResponseDTO(canceled);
  }

  /**
   * Workflow: replaceInvoice
   * Orchestrates atomic replacement of root ISSUED invoice with new replacement invoice
   */
  async replaceInvoice(id: string | number, dto: ReplaceInvoiceDTO): Promise<InvoiceResponseDTO> {
    const parsedId = this.parseId(id);
    const original = await this.invoiceRepo.findInvoiceById(parsedId);

    if (!original) {
      throw new AppError(404, ErrorCode.INVOICE_NOT_FOUND, `Original invoice with ID ${id} was not found`);
    }

    this.stateMachineGuard.validateReplacementEligibility(original.status, original.originalInvoiceId);

    if (!dto.items || dto.items.length === 0) {
      throw new AppError(400, ErrorCode.INVALID_VALUE, 'Replacement invoice must have at least one line item');
    }
    if (dto.items.length > 100) {
      throw new AppError(400, ErrorCode.ITEMS_LIMIT_EXCEEDED, 'Replacement invoice cannot have more than 100 line items');
    }
    if (dto.vatRate < 0 || dto.vatRate > 100) {
      throw new AppError(400, ErrorCode.INVALID_VALUE, 'VAT rate must be between 0 and 100');
    }

    const calculatedTotals = this.calculationService.calculateInvoiceTotals(dto.items, dto.vatRate);
    const zone = original.zone || DEFAULT_INVOICE_ZONE;
    const replacementInvoiceNumber = await this.sequenceService.generateInvoiceNumber(zone);
    const replacementTaxAuthorityCode = this.sequenceService.generateTaxAuthorityCode
      ? this.sequenceService.generateTaxAuthorityCode(zone)
      : `00E${zone.replace(/^1C/, '')}${Math.random().toString(16).substring(2, 10).toUpperCase()}`;

    const newInvoiceData: CreateInvoiceModelInput = {
      templateCode: dto.templateCode || original.templateCode || '01GTKT3/001',
      zone,
      invoiceNumber: replacementInvoiceNumber,
      status: InvoiceStatus.ISSUED,
      customerName: dto.customerName,
      customerTaxCode: dto.customerTaxCode,
      customerEmail: dto.customerEmail,
      customerAddress: dto.customerAddress,
      customerPhone: dto.customerPhone || original.customerPhone,
      customerBankAccount: dto.customerBankAccount || original.customerBankAccount,
      paymentMethod: dto.paymentMethod || original.paymentMethod || 'TM/CK',
      sellerName: dto.sellerName,
      sellerTaxCode: dto.sellerTaxCode,
      sellerAddress: dto.sellerAddress,
      sellerPhone: dto.sellerPhone,
      sellerEmail: dto.sellerEmail || original.sellerEmail,
      sellerBankAccount: dto.sellerBankAccount || original.sellerBankAccount,
      taxDepartment: dto.taxDepartment || original.taxDepartment,
      taxAuthorityCode: replacementTaxAuthorityCode,
      agreementMinutes: dto.agreementMinutes ? dto.agreementMinutes.trim() : undefined,
      totalAmount: calculatedTotals.totalAmount,
      vatAmount: calculatedTotals.vatAmount,
      vatRate: dto.vatRate,
      notes: dto.notes || `Thay thế cho hóa đơn ${original.invoiceNumber}`,
      originalInvoiceId: original.id,
      issueDate: new Date(),
      items: calculatedTotals.items,
    };

    const { replacement } = await this.invoiceRepo.executeReplacementTransaction(original.id, newInvoiceData);

    if (this.pdfService) {
      await this.pdfService.invalidatePdfCache(original.invoiceNumber);
    }

    return this.mapToResponseDTO(replacement);
  }

  /**
   * Workflow: searchInvoices
   * Orchestrates multi-field indexed search with validation and pagination
   */
  async searchInvoices(query: SearchInvoicesQueryDTO): Promise<PaginatedInvoicesResponseDTO> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 10));

    let fromDate: Date | undefined;
    let toDate: Date | undefined;

    if (query.fromDate) {
      fromDate = new Date(query.fromDate);
      if (isNaN(fromDate.getTime())) {
        throw new AppError(400, ErrorCode.INVALID_VALUE, `Invalid fromDate: ${query.fromDate}`);
      }
    }

    if (query.toDate) {
      toDate = new Date(query.toDate);
      if (isNaN(toDate.getTime())) {
        throw new AppError(400, ErrorCode.INVALID_VALUE, `Invalid toDate: ${query.toDate}`);
      }
    }

    const criteria: InvoiceSearchCriteriaInput = {
      search: query.search ? query.search.trim() : undefined,
      status: query.status,
      fromDate,
      toDate,
      page,
      limit,
    };

    const result = await this.invoiceRepo.searchInvoicesRepo(criteria);
    const totalPages = Math.ceil(result.total / limit) || 1;

    return {
      success: true,
      data: result.items.map((item) => this.mapToResponseDTO(item)),
      meta: {
        total: result.total,
        page,
        limit,
        totalPages,
      },
    };
  }
}
