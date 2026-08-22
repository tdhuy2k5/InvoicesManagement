import { AppError } from '../utils/AppError';
import { InvoiceStatus, ErrorCode } from '../types/invoice.types';
import { IStateMachineGuard } from './InvoiceService';

export class StateMachineGuard implements IStateMachineGuard {
  /**
   * Allowed state transitions map:
   * DRAFT -> ISSUED
   * ISSUED -> CANCELED
   * ISSUED -> REPLACED (requires originalInvoiceId === null)
   */
  private readonly ALLOWED_TRANSITIONS: Record<string, InvoiceStatus[]> = {
    [InvoiceStatus.DRAFT]: [InvoiceStatus.ISSUED],
    [InvoiceStatus.ISSUED]: [InvoiceStatus.CANCELED, InvoiceStatus.REPLACED],
    [InvoiceStatus.CANCELED]: [],
    [InvoiceStatus.REPLACED]: [],
  };

  /**
   * Validates whether a state transition from fromStatus to toStatus is permitted.
   */
  validateTransition(fromStatus: string, toStatus: InvoiceStatus): void {
    const allowed = this.ALLOWED_TRANSITIONS[fromStatus] || [];
    if (!allowed.includes(toStatus)) {
      throw new AppError(
        400,
        ErrorCode.INVALID_TRANSITION,
        `Cannot transition invoice from status '${fromStatus}' to '${toStatus}'`
      );
    }
  }

  /**
   * Workflow: updateDraftInvoice / deleteDraftInvoice
   * Ensures status is DRAFT before allowing edit/delete or throws INVALID_TRANSITION
   */
  validateDraftModification(currentStatus: string): void {
    if (currentStatus !== InvoiceStatus.DRAFT) {
      throw new AppError(
        400,
        ErrorCode.INVALID_TRANSITION,
        `Cannot modify or delete invoice in '${currentStatus}' status. Only DRAFT invoices can be edited or deleted.`
      );
    }
  }

  /**
   * Workflow: issueInvoice
   * Ensures status is DRAFT before allowing transition to ISSUED or throws INVALID_TRANSITION
   */
  validateIssueTransition(currentStatus: string): void {
    if (currentStatus !== InvoiceStatus.DRAFT) {
      throw new AppError(
        400,
        ErrorCode.INVALID_TRANSITION,
        `Cannot issue invoice in '${currentStatus}' status. Only DRAFT invoices can be issued.`
      );
    }
  }

  /**
   * Workflow: cancelInvoice
   * Ensures status is ISSUED before allowing transition to CANCELED or throws INVALID_TRANSITION
   */
  validateCancelTransition(currentStatus: string): void {
    if (currentStatus !== InvoiceStatus.ISSUED) {
      throw new AppError(
        400,
        ErrorCode.INVALID_TRANSITION,
        `Cannot cancel invoice in '${currentStatus}' status. Only ISSUED invoices can be canceled.`
      );
    }
  }

  /**
   * Workflow: replaceInvoice
   * Guards that status is ISSUED and invoice is root (originalInvoiceId is null/undefined),
   * otherwise throws INVALID_TRANSITION or REPLACEMENT_NOT_ALLOWED
   */
  validateReplacementEligibility(
    currentStatus: string,
    originalInvoiceId: number | string | null | undefined
  ): void {
    if (currentStatus !== InvoiceStatus.ISSUED) {
      throw new AppError(
        400,
        ErrorCode.INVALID_TRANSITION,
        `Cannot replace invoice in '${currentStatus}' status. Only ISSUED invoices can be replaced.`
      );
    }

    if (originalInvoiceId !== null && originalInvoiceId !== undefined) {
      throw new AppError(
        400,
        ErrorCode.REPLACEMENT_NOT_ALLOWED,
        'Cannot replace a replacement invoice (1-level replacement depth exceeded). Please cancel this replacement invoice instead.'
      );
    }
  }
}
