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
   * Formats sequence number and zone into standardized invoice number: <zone>-<NNNNN>
   * Default zone is 'HD-2026' matching schema.prisma default for model Invoice.zone
   */
  formatInvoiceNumber(seq: number, zone?: string): string {
    const activeZone = (typeof zone === 'string' && zone.trim()) ? zone.trim() : this.defaultZone;
    const paddedSeq = String(seq).padStart(5, '0');
    return `${activeZone}-${paddedSeq}`;
  }

  /**
   * Workflow: generateInvoiceNumber
   * Fetches nextval from the PostgreSQL autoincrement sequence belonging to Invoice.sequenceNumber
   * and formats as <zone>-<00001>
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
      // Execute raw SQL to fetch PostgreSQL sequence value from Invoice.sequenceNumber autoincrement sequence
      const result: Array<{ next_val: bigint | number | string }> = await this.prismaClient.$queryRaw`
        SELECT nextval(COALESCE(pg_get_serial_sequence('"Invoice"', 'sequenceNumber'), '"Invoice_sequenceNumber_seq"')) AS next_val
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

