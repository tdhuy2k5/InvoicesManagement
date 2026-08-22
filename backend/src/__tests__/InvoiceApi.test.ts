import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../app';

describe('Invoice REST API Integration Tests', () => {
  let createdInvoiceId: string;

  it('GET /api/health - should return healthy status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('POST /api/invoices - should create a new draft invoice', async () => {
    const newInvoice = {
      customerName: 'Công ty TNHH Thử Nghiệm',
      customerTaxCode: '0109999999',
      customerEmail: 'test@example.com',
      customerAddress: 'Hà Nội',
      sellerName: 'Công ty Cổ phần TechVN',
      sellerTaxCode: '0309876543',
      sellerAddress: 'TP. Hồ Chí Minh',
      sellerPhone: '0901234567',
      vatRate: 10,
      notes: 'Hóa đơn thử nghiệm qua REST API',
      items: [
        {
          description: 'Gói dịch vụ kiểm thử phần mềm',
          unit: 'Gói',
          quantity: 1,
          unitPrice: 5000000,
        },
      ],
    };

    const res = await request(app).post('/api/invoices').send(newInvoice);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.status).toBe('DRAFT');
    expect(res.body.data.totalAmount).toBe(5000000);
    expect(res.body.data.vatAmount).toBe(500000);

    createdInvoiceId = res.body.data.id;
  });

  it('GET /api/invoices - should list invoices with pagination', async () => {
    const res = await request(app).get('/api/invoices?page=1&limit=10');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination).toBeDefined();
  });

  it('GET /api/invoices/:id - should get invoice details', async () => {
    if (!createdInvoiceId) return;

    const res = await request(app).get(`/api/invoices/${createdInvoiceId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(createdInvoiceId);
  });

  it('PUT /api/invoices/:id - should update draft invoice', async () => {
    if (!createdInvoiceId) return;

    const updateData = {
      customerName: 'Công ty TNHH Thử Nghiệm Đã Cập Nhật',
      items: [
        {
          description: 'Gói dịch vụ kiểm thử cập nhật',
          unit: 'Gói',
          quantity: 2,
          unitPrice: 5000000,
        },
      ],
    };

    const res = await request(app).put(`/api/invoices/${createdInvoiceId}`).send(updateData);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalAmount).toBe(10000000);
  });

  it('POST /api/invoices/:id/issue - should issue the draft invoice', async () => {
    if (!createdInvoiceId) return;

    const res = await request(app).post(`/api/invoices/${createdInvoiceId}/issue`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('ISSUED');
    expect(res.body.data.issueDate).toBeDefined();
  });

  it('POST /api/invoices/:id/cancel - should cancel the issued invoice', async () => {
    if (!createdInvoiceId) return;

    const res = await request(app)
      .post(`/api/invoices/${createdInvoiceId}/cancel`)
      .send({ cancelReason: 'Sai thông tin mã số thuế' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('CANCELED');
    expect(res.body.data.cancelReason).toBe('Sai thông tin mã số thuế');
  });

  it('GET /api/invoices/9999999 - should return 404 for non-existent invoice', async () => {
    const res = await request(app).get('/api/invoices/non-existent-uuid');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INVOICE_NOT_FOUND');
  });
});
