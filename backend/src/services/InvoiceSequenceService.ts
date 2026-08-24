import { prisma as defaultPrisma } from '../config/prisma';
import { PrismaClient } from '@prisma/client';

export const DEFAULT_INVOICE_ZONE = 'HD-2026';

export interface ISequenceFetcher {
  getNextSequenceValue(): Promise<number>;
}

export class InvoiceSequenceService {
  private readonly prismaClient: PrismaClient;
  private readonly customFetcher?: ISequenceFetcher;
  private readonly defaultZone: string;

  constructor(
    prismaClient?: PrismaClient,
    customFetcher?: ISequenceFetcher,
    defaultZone: string = DEFAULT_INVOICE_ZONE
  ) {
    this.prismaClient = prismaClient || defaultPrisma;
    this.customFetcher = customFetcher;
    this.defaultZone = defaultZone;
  }

  /**
   * Generates a temporary unique identifier for DRAFT invoices (e.g. NHAP-A8F2K)
   * This does NOT consume the official PostgreSQL sequence counter.
   */
  generateDraftCode(prefix: string = 'NHAP'): string {
    const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    const timestampPart = Date.now().toString().slice(-4);
    return `${prefix}-${randomSuffix}${timestampPart}`;
  }

  /**
   * Generates a realistic Tax Authority Code (Mã Cơ Quan Thuế - Mã CQT)
   * Format: 00E<Year><SerialZone><RandomHexHash> (e.g. 00E26TAA9F8B2C41)
   */
  generateTaxAuthorityCode(zone: string = '1C26TAA'): string {
    const cleanZone = zone.replace(/^1C/, '').replace(/[^A-Z0-9]/gi, '').toUpperCase() || '26TAA';
    const randomHash = Math.random().toString(16).substring(2, 10).toUpperCase();
    const timeHash = Date.now().toString(16).slice(-4).toUpperCase();
    return `00E${cleanZone}${randomHash}${timeHash}`;
  }

  /**
   * Formats sequence number and zone into standardized invoice number: <zone>-<NNNNN>
   * Default zone is 'HD-2026' matching schema.prisma default for model Invoice.zone
   */
  formatInvoiceNumber(seq: number, zone?: string): string {
    const activeZone = (typeof zone === 'string' && zone.trim()) ? zone.trim() : this.defaultZone;
    const paddedSeq = String(seq).padStart(5, '0');
    return `${activeZone}-${paddedSeq}`;
  }

  /**
   * Fetches the next atomic sequence value from PostgreSQL sequence and formats as <zone>-<00001>.
   */
  async generateInvoiceNumber(zone?: string): Promise<string> {
    const nextVal = await this.getNextSequenceNumber();
    return this.formatInvoiceNumber(nextVal, zone);
  }

  /**
   * Retrieves the next numeric sequence value using PostgreSQL native serial sequence.
   * Fails fast if the sequence is unreachable or invalid to preserve invoice number integrity.
   */
  async getNextSequenceNumber(): Promise<number> {
    if (this.customFetcher) {
      return await this.customFetcher.getNextSequenceValue();
    }

    try {
      // Ensure PostgreSQL sequence exists
      if (this.prismaClient?.$executeRaw) {
        await this.prismaClient.$executeRaw`
          CREATE SEQUENCE IF NOT EXISTS "Invoice_sequenceNumber_seq"
        `;
      }

      // Execute raw SQL to fetch PostgreSQL sequence value
      const result: Array<{ next_val: bigint | number | string }> = await this.prismaClient.$queryRaw`
        SELECT nextval('\"Invoice_sequenceNumber_seq\"') AS next_val
      `;

      if (!result || result.length === 0 || result[0].next_val === undefined || result[0].next_val === null) {
        throw new Error('Database returned empty sequence value');
      }

      return Number(result[0].next_val);
    } catch (error: any) {
      throw new Error(`Failed to retrieve invoice sequence from PostgreSQL: ${error.message || error}`);
    }
  }
}

