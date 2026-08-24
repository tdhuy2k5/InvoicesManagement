import { PrismaClient, Prisma } from '@prisma/client';
import { prisma as defaultPrisma } from '../config/prisma';
import { DEFAULT_INVOICE_ZONE } from '../services/InvoiceSequenceService';
import {
  InvoiceStatus,
  InvoiceModel,
  CreateInvoiceModelInput,
  UpdateDraftInvoiceModelInput,
  FindManyInvoicesInput,
  InvoiceSearchCriteriaInput,
} from '../types/invoice.types';
import { IInvoiceRepository } from '../services/InvoiceService';

export class InvoiceRepository implements IInvoiceRepository {
  private readonly prisma: PrismaClient;

  constructor(prismaClient?: PrismaClient) {
    this.prisma = prismaClient || defaultPrisma;
  }

  /**
   * Helper: Parse string or number ID to string UUID
   */
  private parseId(id: number | string): string {
    return String(id).trim();
  }

  /**
   * Helper: Normalize Prisma Invoice record to domain InvoiceModel
   */
  private toDomainModel(
    record: any
  ): InvoiceModel {
    return {
      id: record.id,
      templateCode: record.templateCode || '01GTKT3/001',
      zone: record.zone || '1C26TAA',
      sequenceNumber: record.sequenceNumber,
      invoiceNumber: record.invoiceNumber,
      status: record.status as InvoiceStatus,
      customerName: record.customerName,
      customerTaxCode: record.customerTaxCode,
      customerEmail: record.customerEmail,
      customerAddress: record.customerAddress,
      customerPhone: record.customerPhone ?? null,
      customerBankAccount: record.customerBankAccount ?? null,
      paymentMethod: record.paymentMethod || 'TM/CK',
      sellerName: record.sellerName,
      sellerTaxCode: record.sellerTaxCode,
      sellerAddress: record.sellerAddress,
      sellerPhone: record.sellerPhone,
      sellerEmail: record.sellerEmail ?? null,
      sellerBankAccount: record.sellerBankAccount ?? null,
      taxDepartment: record.taxDepartment ?? null,
      taxAuthorityCode: record.taxAuthorityCode ?? null,
      agreementMinutes: record.agreementMinutes ?? null,
      totalAmount: Number(record.totalAmount),
      vatAmount: Number(record.vatAmount),
      vatRate: record.vatRate,
      notes: record.notes,
      cancelReason: record.cancelReason,
      issueDate: record.issueDate,
      originalInvoiceId: record.originalInvoiceId,
      originalInvoiceNumber: record.originalInvoice?.invoiceNumber || (record.originalInvoiceNumber ?? null),
      originalIssueDate: record.originalInvoice?.issueDate || (record.originalIssueDate ?? null),
      replacedById: record.replacedById,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      items: record.items?.map((item: any) => ({
        id: item.id,
        invoiceId: item.invoiceId,
        description: item.description,
        unit: item.unit,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        amount: Number(item.amount),
      })),
    };
  }

  /**
   * Inserts a new invoice record and nested items into PostgreSQL.
   */
  async createInvoice(data: CreateInvoiceModelInput): Promise<InvoiceModel> {
    const created = await (this.prisma as any).invoice.create({
      data: {
        templateCode: data.templateCode || '01GTKT3/001',
        zone: data.zone || DEFAULT_INVOICE_ZONE,
        ...(data.sequenceNumber !== undefined ? { sequenceNumber: data.sequenceNumber } : {}),
        invoiceNumber: data.invoiceNumber,
        status: data.status,
        customerName: data.customerName,
        customerTaxCode: data.customerTaxCode,
        customerEmail: data.customerEmail,
        customerAddress: data.customerAddress,
        customerPhone: data.customerPhone ?? null,
        customerBankAccount: data.customerBankAccount ?? null,
        paymentMethod: data.paymentMethod || 'TM/CK',
        sellerName: data.sellerName,
        sellerTaxCode: data.sellerTaxCode,
        sellerAddress: data.sellerAddress,
        sellerPhone: data.sellerPhone,
        sellerEmail: data.sellerEmail ?? null,
        sellerBankAccount: data.sellerBankAccount ?? null,
        taxDepartment: data.taxDepartment ?? null,
        taxAuthorityCode: data.taxAuthorityCode ?? null,
        agreementMinutes: data.agreementMinutes ?? null,
        totalAmount: new Prisma.Decimal(data.totalAmount),
        vatAmount: new Prisma.Decimal(data.vatAmount),
        vatRate: data.vatRate,
        notes: data.notes,
        originalInvoiceId: data.originalInvoiceId ? String(data.originalInvoiceId) : null,
        issueDate: data.issueDate ?? null,
        items: {
          create: data.items.map((item) => ({
            description: item.description,
            unit: item.unit,
            quantity: new Prisma.Decimal(item.quantity),
            unitPrice: new Prisma.Decimal(item.unitPrice),
            amount: new Prisma.Decimal(item.amount),
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return this.toDomainModel(created);
  }

  /**
   * Queries paginated invoices matching filter criteria.
   */
  async findManyInvoices(filter: FindManyInvoicesInput): Promise<{ items: InvoiceModel[]; total: number }> {
    const where: any = {};

    if (filter.status) {
      where.status = filter.status;
    }

    if (filter.fromDate || filter.toDate) {
      where.issueDate = {};
      if (filter.fromDate) {
        where.issueDate.gte = filter.fromDate;
      }
      if (filter.toDate) {
        where.issueDate.lte = filter.toDate;
      }
    }

    const skip = (filter.page - 1) * filter.limit;
    const take = filter.limit;

    const [records, total] = await Promise.all([
      (this.prisma as any).invoice.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          items: true,
          originalInvoice: {
            select: {
              id: true,
              invoiceNumber: true,
              issueDate: true,
              zone: true,
              sequenceNumber: true,
            },
          },
        },
      }),
      (this.prisma as any).invoice.count({ where }),
    ]);

    return {
      items: records.map((r: any) => this.toDomainModel(r)),
      total,
    };
  }

  /**
   * Finds a unique invoice by its ID.
   */
  async findInvoiceById(id: number | string): Promise<InvoiceModel | null> {
    const stringId = this.parseId(id);
    const record = await (this.prisma as any).invoice.findUnique({
      where: { id: stringId },
      include: {
        items: true,
        originalInvoice: {
          select: {
            id: true,
            invoiceNumber: true,
            issueDate: true,
            zone: true,
            sequenceNumber: true,
          },
        },
      },
    });

    if (!record) {
      return null;
    }

    return this.toDomainModel(record);
  }

  /**
   * Atomically replaces line items and updates invoice header in a transaction.
   */
  async replaceDraftItemsAndUpdate(
    id: number | string,
    data: UpdateDraftInvoiceModelInput
  ): Promise<InvoiceModel> {
    const stringId = this.parseId(id);

    const updated = await this.prisma.$transaction(async (tx) => {
      // If new items are provided, replace them atomically
      if (data.items) {
        await (tx as any).invoiceItem.deleteMany({
          where: { invoiceId: stringId },
        });

        await (tx as any).invoiceItem.createMany({
          data: data.items.map((item) => ({
            invoiceId: stringId,
            description: item.description,
            unit: item.unit,
            quantity: new Prisma.Decimal(item.quantity),
            unitPrice: new Prisma.Decimal(item.unitPrice),
            amount: new Prisma.Decimal(item.amount),
          })),
        });
      }

      const updatePayload: any = {};
      if (data.templateCode !== undefined) updatePayload.templateCode = data.templateCode;
      if (data.customerName !== undefined) updatePayload.customerName = data.customerName;
      if (data.customerTaxCode !== undefined) updatePayload.customerTaxCode = data.customerTaxCode;
      if (data.customerEmail !== undefined) updatePayload.customerEmail = data.customerEmail;
      if (data.customerAddress !== undefined) updatePayload.customerAddress = data.customerAddress;
      if (data.customerPhone !== undefined) updatePayload.customerPhone = data.customerPhone;
      if (data.customerBankAccount !== undefined) updatePayload.customerBankAccount = data.customerBankAccount;
      if (data.paymentMethod !== undefined) updatePayload.paymentMethod = data.paymentMethod;
      if (data.sellerName !== undefined) updatePayload.sellerName = data.sellerName;
      if (data.sellerTaxCode !== undefined) updatePayload.sellerTaxCode = data.sellerTaxCode;
      if (data.sellerAddress !== undefined) updatePayload.sellerAddress = data.sellerAddress;
      if (data.sellerPhone !== undefined) updatePayload.sellerPhone = data.sellerPhone;
      if (data.sellerEmail !== undefined) updatePayload.sellerEmail = data.sellerEmail;
      if (data.sellerBankAccount !== undefined) updatePayload.sellerBankAccount = data.sellerBankAccount;
      if (data.taxDepartment !== undefined) updatePayload.taxDepartment = data.taxDepartment;
      if (data.notes !== undefined) updatePayload.notes = data.notes;
      if (data.vatRate !== undefined) updatePayload.vatRate = data.vatRate;
      if (data.totalAmount !== undefined) updatePayload.totalAmount = new Prisma.Decimal(data.totalAmount);
      if (data.vatAmount !== undefined) updatePayload.vatAmount = new Prisma.Decimal(data.vatAmount);

      return (tx as any).invoice.update({
        where: { id: stringId },
        data: updatePayload,
        include: { items: true },
      });
    });

    return this.toDomainModel(updated);
  }

  /**
   * Deletes an invoice and cascades delete to all associated items.
   */
  async deleteInvoice(id: number | string): Promise<InvoiceModel> {
    const stringId = this.parseId(id);

    // Cascade delete configured in Prisma schema
    const deleted = await (this.prisma as any).invoice.delete({
      where: { id: stringId },
      include: { items: true },
    });

    return this.toDomainModel(deleted);
  }

  /**
   * Updates invoice status, timestamps, and transition metadata.
   */
  async updateInvoiceStatus(
    id: number | string,
    status: InvoiceStatus,
    issueDate?: Date,
    cancelReason?: string,
    replacedById?: number | string,
    agreementMinutes?: string
  ): Promise<InvoiceModel> {
    const stringId = this.parseId(id);

    const updatePayload: any = {
      status,
    };

    if (issueDate !== undefined) {
      updatePayload.issueDate = issueDate;
    }

    if (cancelReason !== undefined) {
      updatePayload.cancelReason = cancelReason;
    }

    if (replacedById !== undefined) {
      updatePayload.replacedById = String(replacedById);
    }

    if (agreementMinutes !== undefined) {
      updatePayload.agreementMinutes = agreementMinutes;
    }

    const updated = await (this.prisma as any).invoice.update({
      where: { id: stringId },
      data: updatePayload,
      include: { items: true },
    });

    return this.toDomainModel(updated);
  }

  /**
   * Transitions invoice to ISSUED, assigning sequence number, invoice number, and tax authority code.
   */
  async issueInvoiceWithSequence(
    id: number | string,
    sequenceNumber: number,
    invoiceNumber: string,
    issueDate: Date,
    taxAuthorityCode?: string
  ): Promise<InvoiceModel> {
    const stringId = this.parseId(id);

    const updated = await (this.prisma as any).invoice.update({
      where: { id: stringId },
      data: {
        status: InvoiceStatus.ISSUED,
        sequenceNumber,
        invoiceNumber,
        issueDate,
        ...(taxAuthorityCode ? { taxAuthorityCode } : {}),
      },
      include: { items: true },
    });

    return this.toDomainModel(updated);
  }

  /**
   * Atomically executes replacement: creates replacement invoice and marks original as REPLACED.
   */
  async executeReplacementTransaction(
    originalId: number | string,
    newInvoiceData: CreateInvoiceModelInput
  ): Promise<{ original: InvoiceModel; replacement: InvoiceModel }> {
    const stringOriginalId = this.parseId(originalId);

    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Create the new replacement invoice
      const replacementRecord = await (tx as any).invoice.create({
        data: {
          templateCode: newInvoiceData.templateCode || '01GTKT3/001',
          zone: newInvoiceData.zone || DEFAULT_INVOICE_ZONE,
          ...(newInvoiceData.sequenceNumber !== undefined ? { sequenceNumber: newInvoiceData.sequenceNumber } : {}),
          invoiceNumber: newInvoiceData.invoiceNumber,
          status: newInvoiceData.status,
          customerName: newInvoiceData.customerName,
          customerTaxCode: newInvoiceData.customerTaxCode,
          customerEmail: newInvoiceData.customerEmail,
          customerAddress: newInvoiceData.customerAddress,
          customerPhone: newInvoiceData.customerPhone ?? null,
          customerBankAccount: newInvoiceData.customerBankAccount ?? null,
          paymentMethod: newInvoiceData.paymentMethod || 'TM/CK',
          sellerName: newInvoiceData.sellerName,
          sellerTaxCode: newInvoiceData.sellerTaxCode,
          sellerAddress: newInvoiceData.sellerAddress,
          sellerPhone: newInvoiceData.sellerPhone,
          sellerEmail: newInvoiceData.sellerEmail ?? null,
          sellerBankAccount: newInvoiceData.sellerBankAccount ?? null,
          taxDepartment: newInvoiceData.taxDepartment ?? null,
          taxAuthorityCode: newInvoiceData.taxAuthorityCode ?? null,
          agreementMinutes: newInvoiceData.agreementMinutes ?? null,
          totalAmount: new Prisma.Decimal(newInvoiceData.totalAmount),
          vatAmount: new Prisma.Decimal(newInvoiceData.vatAmount),
          vatRate: newInvoiceData.vatRate,
          notes: newInvoiceData.notes,
          originalInvoiceId: stringOriginalId,
          issueDate: newInvoiceData.issueDate || new Date(),
          items: {
            create: newInvoiceData.items.map((item) => ({
              description: item.description,
              unit: item.unit,
              quantity: new Prisma.Decimal(item.quantity),
              unitPrice: new Prisma.Decimal(item.unitPrice),
              amount: new Prisma.Decimal(item.amount),
            })),
          },
        },
        include: { items: true },
      });

      // 2. Update original invoice status to REPLACED and set replacedById to the new invoice's UUID
      const originalRecord = await (tx as any).invoice.update({
        where: { id: stringOriginalId },
        data: {
          status: InvoiceStatus.REPLACED,
          replacedById: replacementRecord.id,
          ...(newInvoiceData.agreementMinutes ? { agreementMinutes: newInvoiceData.agreementMinutes } : {}),
        },
        include: { items: true },
      });

      return {
        original: originalRecord,
        replacement: replacementRecord,
      };
    });

    return {
      original: this.toDomainModel(result.original),
      replacement: this.toDomainModel(result.replacement),
    };
  }

  /**
   * Searches invoices using multi-column indexed queries.
   */
  async searchInvoicesRepo(
    criteria: InvoiceSearchCriteriaInput
  ): Promise<{ items: InvoiceModel[]; total: number }> {
    const where: any = {};

    // 1. Status Filter (hits composite index @@index([status, issueDate]))
    if (criteria.status) {
      where.status = criteria.status;
    }

    // 2. Date Range Filter (hits B-Tree index on issueDate / createdAt)
    if (criteria.fromDate || criteria.toDate) {
      where.issueDate = {};
      if (criteria.fromDate) {
        where.issueDate.gte = criteria.fromDate;
      }
      if (criteria.toDate) {
        where.issueDate.lte = criteria.toDate;
      }
    }

    // 3. Search Term Dispatcher (Index-First Evaluation)
    if (criteria.search) {
      const term = criteria.search.trim();
      const orConditions: any[] = [];

      // A. Numeric search -> Fast B-Tree lookup on sequenceNumber
      const numTerm = parseInt(term, 10);
      if (!isNaN(numTerm) && numTerm > 0 && /^\d+$/.test(term)) {
        orConditions.push({ sequenceNumber: numTerm });
      }

      // B. Zone + Sequence format (e.g., HD-2026-00042) -> Composite unique index @@unique([zone, sequenceNumber])
      const zoneSeqMatch = term.match(/^([A-Za-z0-9-]+?)[-\s](\d+)$/);
      if (zoneSeqMatch) {
        const parsedZone = zoneSeqMatch[1];
        const parsedSeq = parseInt(zoneSeqMatch[2], 10);
        orConditions.push({
          zone: parsedZone,
          sequenceNumber: parsedSeq,
        });
      }

      // C. Exact Invoice Number (hits @unique B-Tree index)
      orConditions.push({ invoiceNumber: term });

      // D. Tax Code (MST) exact lookup (hits @@index([customerTaxCode]))
      if (/^\d{10}(-\d{3})?$/.test(term)) {
        orConditions.push({ customerTaxCode: term });
      } else {
        orConditions.push({ customerTaxCode: { startsWith: term } });
      }

      // E. Customer / Seller Name & Email matching
      orConditions.push({ customerName: { contains: term, mode: 'insensitive' } });
      orConditions.push({ customerEmail: { contains: term, mode: 'insensitive' } });

      where.OR = orConditions;
    }

    const skip = (criteria.page - 1) * criteria.limit;
    const take = criteria.limit;

    const [records, total] = await Promise.all([
      (this.prisma as any).invoice.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { items: true },
      }),
      (this.prisma as any).invoice.count({ where }),
    ]);

    return {
      items: records.map((r: any) => this.toDomainModel(r)),
      total,
    };
  }
}
