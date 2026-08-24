import { describe, it, expect, vi } from 'vitest';
import { InvoiceSequenceService, ISequenceFetcher, DEFAULT_INVOICE_ZONE } from '../services/InvoiceSequenceService';
import { PrismaClient } from '@prisma/client';

describe('InvoiceSequenceService Unit Tests', () => {
  describe('formatInvoiceNumber', () => {
    it('should format sequence number using custom zone string', () => {
      const service = new InvoiceSequenceService();
      expect(service.formatInvoiceNumber(1, 'HD-2026')).toBe('HD-2026-00001');
      expect(service.formatInvoiceNumber(42, 'HD1')).toBe('HD1-00042');
      expect(service.formatInvoiceNumber(12345, '1C26TYY')).toBe('1C26TYY-12345');
    });

    it('should use DEFAULT_INVOICE_ZONE (HD-2026) matching schema.prisma default when zone is omitted', () => {
      const service = new InvoiceSequenceService();
      expect(DEFAULT_INVOICE_ZONE).toBe('HD-2026');
      expect(service.formatInvoiceNumber(7)).toBe('HD-2026-00007');
      expect(service.formatInvoiceNumber(42)).toBe('HD-2026-00042');
    });

    it('should allow custom default zone injection in constructor', () => {
      const customService = new InvoiceSequenceService(undefined, undefined, 'HD1');
      expect(customService.formatInvoiceNumber(5)).toBe('HD1-00005');
    });
  });

  describe('generateDraftCode', () => {
    it('should generate draft codes with prefix and not call PostgreSQL sequence', () => {
      const service = new InvoiceSequenceService();
      const code1 = service.generateDraftCode();
      const code2 = service.generateDraftCode('DRAFT');

      expect(code1.startsWith('NHAP-')).toBe(true);
      expect(code2.startsWith('DRAFT-')).toBe(true);
      expect(code1).not.toBe(code2);
    });
  });

  describe('generateInvoiceNumber with customFetcher', () => {
    it('should use custom fetcher when provided with zone', async () => {
      const mockFetcher: ISequenceFetcher = {
        getNextSequenceValue: vi.fn().mockResolvedValue(99),
      };
      const service = new InvoiceSequenceService(undefined, mockFetcher);

      const result = await service.generateInvoiceNumber('HD-2026');
      expect(result).toBe('HD-2026-00099');
      expect(mockFetcher.getNextSequenceValue).toHaveBeenCalled();
    });
  });

  describe('generateInvoiceNumber with Prisma SQL sequence (Fail-Fast)', () => {
    it('should fetch nextval from PostgreSQL serial sequence and format with default zone', async () => {
      const mockPrisma = {
        $executeRaw: vi.fn().mockResolvedValue(1),
        $queryRaw: vi.fn().mockResolvedValue([{ next_val: 15n }]),
      } as unknown as PrismaClient;

      const service = new InvoiceSequenceService(mockPrisma);
      const result = await service.generateInvoiceNumber();

      expect(result).toBe('HD-2026-00015');
      expect(mockPrisma.$queryRaw).toHaveBeenCalled();
    });

    it('should fail-fast and throw an explicit error when PostgreSQL sequence query fails', async () => {
      const mockPrisma = {
        $executeRaw: vi.fn().mockResolvedValue(1),
        $queryRaw: vi.fn().mockRejectedValue(new Error('Sequence invoice_sequenceNumber_seq not found')),
      } as unknown as PrismaClient;

      const service = new InvoiceSequenceService(mockPrisma);
      await expect(service.generateInvoiceNumber()).rejects.toThrowError(
        /Failed to retrieve invoice sequence from PostgreSQL: Sequence invoice_sequenceNumber_seq not found/
      );
    });

    it('should fail-fast and throw an explicit error if database returns empty result', async () => {
      const mockPrisma = {
        $executeRaw: vi.fn().mockResolvedValue(1),
        $queryRaw: vi.fn().mockResolvedValue([]),
      } as unknown as PrismaClient;

      const service = new InvoiceSequenceService(mockPrisma);
      await expect(service.generateInvoiceNumber()).rejects.toThrowError(
        /Database returned empty sequence value/
      );
    });
  });
});
