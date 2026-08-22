import { Request, Response, NextFunction } from 'express';
import { InvoiceService } from '../services/InvoiceService';
import { InvoiceRepository } from '../repositories/InvoiceRepository';
import { InvoiceCalculationService } from '../services/InvoiceCalculationService';
import { InvoiceSequenceService } from '../services/InvoiceSequenceService';
import { StateMachineGuard } from '../services/StateMachineGuard';
import { PdfService } from '../services/PdfService';
import { CurrencyToWordsUtil } from '../services/CurrencyToWordsUtil';
import { prisma } from '../config/prisma';

export class InvoiceController {
  private invoiceService: InvoiceService;
  private pdfService: PdfService;

  constructor() {
    const invoiceRepo = new InvoiceRepository(prisma);
    const calculationService = new InvoiceCalculationService();
    const sequenceService = new InvoiceSequenceService(prisma);
    const stateMachineGuard = new StateMachineGuard();
    const currencyUtil = new CurrencyToWordsUtil();
    this.pdfService = new PdfService(invoiceRepo, currencyUtil);

    this.invoiceService = new InvoiceService(
      invoiceRepo,
      calculationService,
      sequenceService,
      stateMachineGuard,
      this.pdfService
    );
  }

  /**
   * POST /api/invoices - Create draft invoice
   */
  createDraft = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.invoiceService.createDraftInvoice(req.body);
      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * GET /api/invoices - List invoices with pagination & filtering
   */
  getInvoices = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { status, fromDate, toDate, page, limit, search } = req.query;
      const queryParams = {
        status: status as string | undefined,
        fromDate: fromDate as string | undefined,
        toDate: toDate as string | undefined,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 10,
        search: search as string | undefined,
      };

      let result;
      if (search) {
        result = await this.invoiceService.searchInvoices(queryParams);
      } else {
        result = await this.invoiceService.getInvoicesList(queryParams);
      }

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.meta,
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * GET /api/invoices/:id - Get invoice by ID
   */
  getInvoiceById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.invoiceService.getInvoiceById(id);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * PUT /api/invoices/:id - Update draft invoice
   */
  updateDraft = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.invoiceService.updateDraftInvoice(id, req.body);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * DELETE /api/invoices/:id - Delete draft invoice
   */
  deleteDraft = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.invoiceService.deleteDraftInvoice(id);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * POST /api/invoices/:id/issue - Issue/Sign invoice
   */
  issueInvoice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.invoiceService.issueInvoice(id);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * POST /api/invoices/:id/cancel - Cancel invoice
   */
  cancelInvoice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.invoiceService.cancelInvoice(id, req.body);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * POST /api/invoices/:id/replace - Replace invoice
   */
  replaceInvoice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.invoiceService.replaceInvoice(id, req.body);
      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * POST /api/invoices/:id/clone - Clone invoice into draft
   */
  cloneInvoice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.invoiceService.cloneInvoice(id);
      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * GET /api/invoices/:id/pdf - Download or stream PDF invoice
   */
  downloadPdf = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const isDownload = req.query.download === 'true';
      const pdfResult = await this.pdfService.getInvoicePdfStream(id, isDownload);

      res.setHeader('Content-Type', pdfResult.contentType);
      const disposition = isDownload ? 'attachment' : 'inline';
      res.setHeader('Content-Disposition', `${disposition}; filename="${pdfResult.filename}"`);
      res.status(200).send(pdfResult.buffer);
    } catch (err) {
      next(err);
    }
  };
}
