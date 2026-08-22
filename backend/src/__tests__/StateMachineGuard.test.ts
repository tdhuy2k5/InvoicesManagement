import { describe, it, expect } from 'vitest';
import { StateMachineGuard } from '../services/StateMachineGuard';
import { InvoiceStatus, ErrorCode } from '../types/invoice.types';
import { AppError } from '../utils/AppError';

describe('StateMachineGuard', () => {
  const guard = new StateMachineGuard();

  describe('validateTransition', () => {
    it('should allow valid transition DRAFT -> ISSUED', () => {
      expect(() => guard.validateTransition(InvoiceStatus.DRAFT, InvoiceStatus.ISSUED)).not.toThrow();
    });

    it('should allow valid transition ISSUED -> CANCELED', () => {
      expect(() => guard.validateTransition(InvoiceStatus.ISSUED, InvoiceStatus.CANCELED)).not.toThrow();
    });

    it('should allow valid transition ISSUED -> REPLACED', () => {
      expect(() => guard.validateTransition(InvoiceStatus.ISSUED, InvoiceStatus.REPLACED)).not.toThrow();
    });

    it('should reject invalid transition DRAFT -> CANCELED', () => {
      expect(() => guard.validateTransition(InvoiceStatus.DRAFT, InvoiceStatus.CANCELED)).toThrowError(AppError);
    });

    it('should reject transition from CANCELED to any status', () => {
      expect(() => guard.validateTransition(InvoiceStatus.CANCELED, InvoiceStatus.ISSUED)).toThrowError(AppError);
      expect(() => guard.validateTransition(InvoiceStatus.CANCELED, InvoiceStatus.DRAFT)).toThrowError(AppError);
    });

    it('should reject transition from REPLACED to any status', () => {
      expect(() => guard.validateTransition(InvoiceStatus.REPLACED, InvoiceStatus.ISSUED)).toThrowError(AppError);
    });
  });

  describe('validateDraftModification', () => {
    it('should allow modification when status is DRAFT', () => {
      expect(() => guard.validateDraftModification(InvoiceStatus.DRAFT)).not.toThrow();
    });

    it('should throw AppError INVALID_TRANSITION when status is ISSUED, CANCELED, or REPLACED', () => {
      [InvoiceStatus.ISSUED, InvoiceStatus.CANCELED, InvoiceStatus.REPLACED].forEach((status) => {
        try {
          guard.validateDraftModification(status);
          expect.fail('Should have thrown AppError');
        } catch (err: any) {
          expect(err.errorCode).toBe(ErrorCode.INVALID_TRANSITION);
        }
      });
    });
  });

  describe('validateIssueTransition', () => {
    it('should allow issuing when status is DRAFT', () => {
      expect(() => guard.validateIssueTransition(InvoiceStatus.DRAFT)).not.toThrow();
    });

    it('should throw AppError when status is already ISSUED', () => {
      expect(() => guard.validateIssueTransition(InvoiceStatus.ISSUED)).toThrowError(AppError);
    });
  });

  describe('validateCancelTransition', () => {
    it('should allow canceling when status is ISSUED', () => {
      expect(() => guard.validateCancelTransition(InvoiceStatus.ISSUED)).not.toThrow();
    });

    it('should throw AppError when trying to cancel DRAFT invoice', () => {
      expect(() => guard.validateCancelTransition(InvoiceStatus.DRAFT)).toThrowError(AppError);
    });
  });

  describe('validateReplacementEligibility', () => {
    it('should allow replacement for root ISSUED invoice', () => {
      expect(() => guard.validateReplacementEligibility(InvoiceStatus.ISSUED, null)).not.toThrow();
      expect(() => guard.validateReplacementEligibility(InvoiceStatus.ISSUED, undefined)).not.toThrow();
    });

    it('should reject replacement if status is not ISSUED', () => {
      expect(() => guard.validateReplacementEligibility(InvoiceStatus.DRAFT, null)).toThrowError(AppError);
      expect(() => guard.validateReplacementEligibility(InvoiceStatus.CANCELED, null)).toThrowError(AppError);
    });

    it('should reject replacement if invoice already replaces another invoice (2nd level replacement)', () => {
      try {
        guard.validateReplacementEligibility(InvoiceStatus.ISSUED, 'orig-uuid-123');
        expect.fail('Should have thrown AppError');
      } catch (err: any) {
        expect(err.errorCode).toBe(ErrorCode.REPLACEMENT_NOT_ALLOWED);
      }
    });
  });
});
