import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InvoiceService, IInvoiceRepository, IInvoiceCalculationService, IInvoiceSequenceService, IStateMachineGuard, IPdfService } from '../services/InvoiceService';
import { InvoiceStatus, ErrorCode } from '../types/invoice.types';
import { AppError } from '../utils/AppError';

describe('InvoiceService (Unit Tests with Mocks)', () => {
  let invoiceRepo: IInvoiceRepository;
  let calculationService: IInvoiceCalculationService;
  let sequenceService: IInvoiceSequenceService;
  let stateMachineGuard: IStateMachineGuard;
  let pdfService: IPdfService;
  let service: InvoiceService;

  const mockInvoiceModel = {
    id: 'uuid-1234',
    zone: 'HD-2026',
    sequenceNumber: 1,
    invoiceNumber: 'HD-2026-00001',
    status: InvoiceStatus.DRAFT,
    customerName: 'Công ty TNHH ABC',
    customerTaxCode: '0101234567',
    customerEmail: 'abc@example.com',
    customerAddress: 'Hà Nội',
    sellerName: 'Công ty Cổ phần TechVN',
    sellerTaxCode: '0309876543',
    sellerAddress: 'TP. Hồ Chí Minh',
    sellerPhone: '0901234567',
    totalAmount: 10000000,
    vatAmount: 1000000,
    vatRate: 10,
    notes: 'Ghi chú đơn hàng',
    createdAt: new Date(),
    updatedAt: new Date(),
    items: [
      {
        id: 1,
        invoiceId: 'uuid-1234',
        description: 'Dịch vụ tư vấn',
        unit: 'Gói',
        quantity: 1,
        unitPrice: 10000000,
        amount: 10000000,
      },
    ],
  };

  beforeEach(() => {
    invoiceRepo = {
      createInvoice: vi.fn().mockResolvedValue(mockInvoiceModel),
      findManyInvoices: vi.fn().mockResolvedValue({ items: [mockInvoiceModel], total: 1 }),
      findInvoiceById: vi.fn().mockResolvedValue(mockInvoiceModel),
      replaceDraftItemsAndUpdate: vi.fn().mockResolvedValue(mockInvoiceModel),
      deleteInvoice: vi.fn().mockResolvedValue(mockInvoiceModel),
      updateInvoiceStatus: vi.fn().mockImplementation((id, status) => {
        return Promise.resolve({ ...mockInvoiceModel, status, id });
      }),
      executeReplacementTransaction: vi.fn().mockImplementation((origId, newInv) => {
        return Promise.resolve({
          original: { ...mockInvoiceModel, id: origId, status: InvoiceStatus.REPLACED, replacedById: 'new-uuid' },
          replacement: { ...mockInvoiceModel, id: 'new-uuid', originalInvoiceId: origId, status: InvoiceStatus.DRAFT },
        });
      }),
      searchInvoicesRepo: vi.fn().mockResolvedValue({ items: [mockInvoiceModel], total: 1 }),
    };

    calculationService = {
      calculateInvoiceTotals: vi.fn().mockReturnValue({
        items: [{ description: 'Dịch vụ tư vấn', unit: 'Gói', quantity: 1, unitPrice: 10000000, amount: 10000000 }],
        totalAmount: 10000000,
        vatAmount: 1000000,
      }),
    };

    sequenceService = {
      generateInvoiceNumber: vi.fn().mockResolvedValue('HD-2026-00001'),
    };

    stateMachineGuard = {
      validateDraftModification: vi.fn(),
      validateIssueTransition: vi.fn(),
      validateCancelTransition: vi.fn(),
      validateReplacementEligibility: vi.fn(),
    };

    pdfService = {
      invalidatePdfCache: vi.fn().mockResolvedValue(undefined),
    };

    service = new InvoiceService(
      invoiceRepo,
      calculationService,
      sequenceService,
      stateMachineGuard,
      pdfService
    );
  });

  describe('createDraftInvoice', () => {
    it('should create a draft invoice with calculated totals and generated sequence', async () => {
      const dto = {
        customerName: 'Công ty TNHH ABC',
        customerTaxCode: '0101234567',
        customerEmail: 'abc@example.com',
        customerAddress: 'Hà Nội',
        sellerName: 'Công ty Cổ phần TechVN',
        sellerTaxCode: '0309876543',
        sellerAddress: 'TP. Hồ Chí Minh',
        sellerPhone: '0901234567',
        vatRate: 10,
        items: [{ description: 'Dịch vụ tư vấn', unit: 'Gói', quantity: 1, unitPrice: 10000000 }],
      };

      const result = await service.createDraftInvoice(dto);

      expect(calculationService.calculateInvoiceTotals).toHaveBeenCalledWith(dto.items, 10);
      expect(sequenceService.generateInvoiceNumber).toHaveBeenCalled();
      expect(invoiceRepo.createInvoice).toHaveBeenCalled();
      expect(result.id).toBe('uuid-1234');
      expect(result.status).toBe(InvoiceStatus.DRAFT);
    });

    it('should throw AppError if customerName is empty', async () => {
      const dto = {
        customerName: '   ',
        customerTaxCode: '0101234567',
        customerEmail: 'abc@example.com',
        customerAddress: 'Hà Nội',
        sellerName: 'Công ty Cổ phần TechVN',
        sellerTaxCode: '0309876543',
        sellerAddress: 'TP. Hồ Chí Minh',
        sellerPhone: '0901234567',
        vatRate: 10,
        items: [{ description: 'Dịch vụ', unit: 'Gói', quantity: 1, unitPrice: 10000000 }],
      };

      await expect(service.createDraftInvoice(dto)).rejects.toThrowError(AppError);
    });
  });

  describe('issueInvoice', () => {
    it('should validate transition and update status to ISSUED', async () => {
      const result = await service.issueInvoice('uuid-1234');

      expect(invoiceRepo.findInvoiceById).toHaveBeenCalledWith('uuid-1234');
      expect(stateMachineGuard.validateIssueTransition).toHaveBeenCalledWith(InvoiceStatus.DRAFT);
      expect(invoiceRepo.updateInvoiceStatus).toHaveBeenCalled();
      expect(result.status).toBe(InvoiceStatus.ISSUED);
    });

    it('should throw 404 if invoice does not exist', async () => {
      vi.spyOn(invoiceRepo, 'findInvoiceById').mockResolvedValueOnce(null);

      await expect(service.issueInvoice('non-existent')).rejects.toThrowError(AppError);
    });
  });

  describe('cancelInvoice', () => {
    it('should validate transition, cancel invoice with reason and invalidate PDF cache', async () => {
      vi.spyOn(invoiceRepo, 'findInvoiceById').mockResolvedValueOnce({
        ...mockInvoiceModel,
        status: InvoiceStatus.ISSUED,
      });

      const result = await service.cancelInvoice('uuid-1234', { cancelReason: 'Khách hàng hủy đơn' });

      expect(stateMachineGuard.validateCancelTransition).toHaveBeenCalledWith(InvoiceStatus.ISSUED);
      expect(pdfService.invalidatePdfCache).toHaveBeenCalledWith('HD-2026-00001');
      expect(result.status).toBe(InvoiceStatus.CANCELED);
    });

    it('should throw AppError if cancelReason is omitted or blank', async () => {
      vi.spyOn(invoiceRepo, 'findInvoiceById').mockResolvedValueOnce({
        ...mockInvoiceModel,
        status: InvoiceStatus.ISSUED,
      });

      await expect(service.cancelInvoice('uuid-1234', { cancelReason: '   ' })).rejects.toThrowError(AppError);
    });
  });

  describe('replaceInvoice', () => {
    it('should create replacement invoice and mark original as REPLACED', async () => {
      vi.spyOn(invoiceRepo, 'findInvoiceById').mockResolvedValueOnce({
        ...mockInvoiceModel,
        status: InvoiceStatus.ISSUED,
      });

      const replaceDto = {
        customerName: 'Công ty TNHH ABC Mới',
        customerTaxCode: '0101234567',
        customerEmail: 'abc@example.com',
        customerAddress: 'Hà Nội',
        sellerName: 'Công ty Cổ phần TechVN',
        sellerTaxCode: '0309876543',
        sellerAddress: 'TP. Hồ Chí Minh',
        sellerPhone: '0901234567',
        vatRate: 10,
        items: [{ description: 'Dịch vụ mới', unit: 'Gói', quantity: 1, unitPrice: 12000000 }],
      };

      const result = await service.replaceInvoice('uuid-1234', replaceDto);

      expect(stateMachineGuard.validateReplacementEligibility).toHaveBeenCalled();
      expect(invoiceRepo.executeReplacementTransaction).toHaveBeenCalled();
      expect(result.id).toBeDefined();
      expect(result.originalInvoiceId).toBe('uuid-1234');
    });
  });

  describe('deleteDraftInvoice', () => {
    it('should delete draft invoice and invalidate cache', async () => {
      const result = await service.deleteDraftInvoice('uuid-1234');

      expect(stateMachineGuard.validateDraftModification).toHaveBeenCalledWith(InvoiceStatus.DRAFT);
      expect(invoiceRepo.deleteInvoice).toHaveBeenCalledWith('uuid-1234');
      expect(result.success).toBe(true);
    });
  });
});
