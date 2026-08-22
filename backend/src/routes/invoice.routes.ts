import { Router } from 'express';
import { InvoiceController } from '../controllers/InvoiceController';

const router = Router();
const controller = new InvoiceController();

// CRUD Endpoints
router.post('/invoices', controller.createDraft);
router.get('/invoices', controller.getInvoices);
router.get('/invoices/:id', controller.getInvoiceById);
router.put('/invoices/:id', controller.updateDraft);
router.delete('/invoices/:id', controller.deleteDraft);

// Lifecycle Operations
router.post('/invoices/:id/issue', controller.issueInvoice);
router.post('/invoices/:id/cancel', controller.cancelInvoice);
router.post('/invoices/:id/replace', controller.replaceInvoice);
router.post('/invoices/:id/clone', controller.cloneInvoice);

// PDF Export & Download
router.get('/invoices/:id/pdf', controller.downloadPdf);

export default router;
