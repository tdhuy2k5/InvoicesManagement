export type InvoiceStatus = 'DRAFT' | 'ISSUED' | 'REPLACED' | 'CANCELED';

export interface InvoiceItem {
  id?: number | string;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface InvoiceEntity {
  id: string;
  invoiceNumber: string;
  serialNumber?: string;
  status: InvoiceStatus;
  issueDate?: string | null;
  createdAt: string;
  updatedAt?: string;
  signedBy?: string | null;
  signedAt?: string | null;

  // Seller Details
  sellerName: string;
  sellerTaxCode: string;
  sellerAddress: string;
  sellerPhone: string;
  sellerEmail: string;
  sellerBankAccount: string;

  // Buyer / Customer Details
  customerName: string;
  customerTaxCode: string;
  customerAddress: string;
  customerPhone?: string;
  customerEmail?: string;
  customerRepresentative?: string;
  paymentMethod: string;

  // Line Items & Totals
  items: InvoiceItem[];
  subtotalAmount: number;
  vatRate: number; // 0, 5, 8, 10, -1 (KCT)
  vatAmount: number;
  totalAmount: number;
  amountInWords?: string;
  notes?: string;

  // Replacement / Cancellation Lineage (AD-3, AD-6, FR-7)
  originalInvoiceId?: string | null;
  originalInvoiceNumber?: string | null;
  replacedById?: string | null;
  replacementInvoiceNumber?: string | null;
  cancelReason?: string | null;
}

export const INITIAL_MOCK_INVOICES: InvoiceEntity[] = [
  {
    id: '1',
    invoiceNumber: 'HD-2026-00042',
    serialNumber: '1C26TAA',
    status: 'ISSUED',
    issueDate: '2026-08-22T15:00:12.000Z',
    createdAt: '2026-08-22T14:30:00.000Z',
    signedBy: 'CÔNG TY CỔ PHẦN CÔNG NGHỆ VÀ TRUYỀN THÔNG ALPHA',
    signedAt: '22/08/2026 15:00:12',
    sellerName: 'CÔNG TY CỔ PHẦN CÔNG NGHỆ VÀ TRUYỀN THÔNG ALPHA',
    sellerTaxCode: '0101234567',
    sellerAddress: 'Tầng 3, Tòa nhà Alpha, 123 Đường Công Nghệ, Cầu Giấy, Hà Nội',
    sellerPhone: '024 3838 9999',
    sellerEmail: 'contact@alphatech.vn',
    sellerBankAccount: '19031234567890 - Techcombank (CN Thăng Long)',
    customerName: 'CÔNG TY TNHH GIẢI PHÁP SỐ TOÀN CẦU',
    customerTaxCode: '0319876543',
    customerAddress: '456 Lê Lợi, Phường Bến Nghé, Quận 1, TP. HCM',
    customerPhone: '0987654321',
    customerEmail: 'contact@globalsolutions.vn',
    customerRepresentative: 'Trần Thị Bích Ngọc',
    paymentMethod: 'Chuyển khoản (TM/CK)',
    items: [
      {
        id: 1,
        description: 'Bản quyền phần mềm Quản trị Doanh nghiệp ERP Cloud (Gói 12 tháng)',
        unit: 'Gói',
        quantity: 1,
        unitPrice: 20000000,
        amount: 20000000,
      },
      {
        id: 2,
        description: 'Dịch vụ đào tạo và cấu hình phân quyền hệ thống tại chỗ',
        unit: 'Buổi',
        quantity: 5,
        unitPrice: 1000000,
        amount: 5000000,
      },
    ],
    subtotalAmount: 25000000,
    vatRate: 10,
    vatAmount: 2500000,
    totalAmount: 27500000,
    amountInWords: 'Hai mươi bảy triệu năm trăm nghìn đồng chẵn.',
    notes: 'Thanh toán đợt 1 theo Hợp đồng cung cấp dịch vụ số 42/2026/HĐ-ALPHA.',
    originalInvoiceId: null,
    replacedById: null,
  },
  {
    id: '2',
    invoiceNumber: 'HD-2026-00041',
    serialNumber: '1C26TAA',
    status: 'DRAFT',
    issueDate: null,
    createdAt: '2026-08-22T10:15:00.000Z',
    sellerName: 'CÔNG TY CỔ PHẦN CÔNG NGHỆ VÀ TRUYỀN THÔNG ALPHA',
    sellerTaxCode: '0101234567',
    sellerAddress: 'Tầng 3, Tòa nhà Alpha, 123 Đường Công Nghệ, Cầu Giấy, Hà Nội',
    sellerPhone: '024 3838 9999',
    sellerEmail: 'contact@alphatech.vn',
    sellerBankAccount: '19031234567890 - Techcombank (CN Thăng Long)',
    customerName: 'CÔNG TY CỔ PHẦN TẬP ĐOÀN VINATECH',
    customerTaxCode: '0312456789',
    customerAddress: 'Số 88 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. HCM',
    customerPhone: '028 3822 8888',
    customerEmail: 'ketoan@vinatech-group.vn',
    customerRepresentative: 'Nguyễn Văn Hùng',
    paymentMethod: 'Chuyển khoản (TM/CK)',
    items: [
      {
        id: 1,
        description: 'Máy chủ Server Dell PowerEdge R750xs 2x Intel Xeon Silver 4314',
        unit: 'Bộ',
        quantity: 2,
        unitPrice: 57000000,
        amount: 114000000,
      },
    ],
    subtotalAmount: 114000000,
    vatRate: 10,
    vatAmount: 11400000,
    totalAmount: 125400000,
    amountInWords: 'Một trăm hai mươi lăm triệu bốn trăm nghìn đồng chẵn.',
    notes: 'Bàn giao và nghiệm thu thiết bị phần cứng tại trụ sở khách hàng.',
    originalInvoiceId: null,
    replacedById: null,
  },
  {
    id: '3',
    invoiceNumber: 'HD-2026-00040',
    serialNumber: '1C26TAA',
    status: 'ISSUED',
    issueDate: '2026-08-21T16:45:00.000Z',
    createdAt: '2026-08-21T16:00:00.000Z',
    signedBy: 'CÔNG TY CỔ PHẦN CÔNG NGHỆ VÀ TRUYỀN THÔNG ALPHA',
    signedAt: '21/08/2026 16:45:00',
    sellerName: 'CÔNG TY CỔ PHẦN CÔNG NGHỆ VÀ TRUYỀN THÔNG ALPHA',
    sellerTaxCode: '0101234567',
    sellerAddress: 'Tầng 3, Tòa nhà Alpha, 123 Đường Công Nghệ, Cầu Giấy, Hà Nội',
    sellerPhone: '024 3838 9999',
    sellerEmail: 'contact@alphatech.vn',
    sellerBankAccount: '19031234567890 - Techcombank (CN Thăng Long)',
    customerName: 'CÔNG TY TNHH DỊCH VỤ SỐ HOÀNG GIA',
    customerTaxCode: '0108765432',
    customerAddress: 'Tòa nhà Royal City, 72A Nguyễn Trãi, Thanh Xuân, Hà Nội',
    customerPhone: '0912345678',
    customerEmail: 'finance@hoanggiadigital.com',
    customerRepresentative: 'Lê Hoàng Long',
    paymentMethod: 'Chuyển khoản (TM/CK)',
    items: [
      {
        id: 1,
        description: 'Dịch vụ duy trì và bảo mật hạ tầng Cloud VPS cao cấp',
        unit: 'Tháng',
        quantity: 6,
        unitPrice: 2854938,
        amount: 17129628,
      },
    ],
    subtotalAmount: 17129630,
    vatRate: 8,
    vatAmount: 1370370,
    totalAmount: 18500000,
    amountInWords: 'Mười tám triệu năm trăm nghìn đồng chẵn.',
    notes: 'Áp dụng chính sách giảm thuế GTGT 8% theo Nghị định 72/2024/NĐ-CP.',
    originalInvoiceId: null,
    replacedById: null,
  },
  {
    id: '4',
    invoiceNumber: 'HD-2026-00018',
    serialNumber: '1C26TAA',
    status: 'REPLACED',
    issueDate: '2026-08-15T09:20:00.000Z',
    createdAt: '2026-08-15T09:00:00.000Z',
    signedBy: 'CÔNG TY CỔ PHẦN CÔNG NGHỆ VÀ TRUYỀN THÔNG ALPHA',
    signedAt: '15/08/2026 09:20:00',
    sellerName: 'CÔNG TY CỔ PHẦN CÔNG NGHỆ VÀ TRUYỀN THÔNG ALPHA',
    sellerTaxCode: '0101234567',
    sellerAddress: 'Tầng 3, Tòa nhà Alpha, 123 Đường Công Nghệ, Cầu Giấy, Hà Nội',
    sellerPhone: '024 3838 9999',
    sellerEmail: 'contact@alphatech.vn',
    sellerBankAccount: '19031234567890 - Techcombank (CN Thăng Long)',
    customerName: 'CÔNG TY CỔ PHẦN THƯƠNG MẠI & XNK AN PHÁT',
    customerTaxCode: '0107654321',
    customerAddress: 'Số 15 Phố Huế, Phường Hàng Bài, Quận Hoàn Kiếm, Hà Nội',
    customerPhone: '024 3943 1234',
    customerEmail: 'anphat@anphattrading.vn',
    customerRepresentative: 'Vũ Đức Nam',
    paymentMethod: 'Chuyển khoản (TM/CK)',
    items: [
      {
        id: 1,
        description: 'Hệ thống Camera Giám sát AI Thông minh (Gói Standard)',
        unit: 'Gói',
        quantity: 1,
        unitPrice: 40909091,
        amount: 40909091,
      },
    ],
    subtotalAmount: 40909091,
    vatRate: 10,
    vatAmount: 4090909,
    totalAmount: 45000000,
    amountInWords: 'Bốn mươi lăm triệu đồng chẵn.',
    notes: 'Hóa đơn gốc bị sai thông tin chủng loại camera, đã được thay thế.',
    originalInvoiceId: null,
    replacedById: '5',
    replacementInvoiceNumber: 'HD-2026-00039',
  },
  {
    id: '5',
    invoiceNumber: 'HD-2026-00039',
    serialNumber: '1C26TAA',
    status: 'ISSUED',
    issueDate: '2026-08-20T11:30:00.000Z',
    createdAt: '2026-08-20T11:00:00.000Z',
    signedBy: 'CÔNG TY CỔ PHẦN CÔNG NGHỆ VÀ TRUYỀN THÔNG ALPHA',
    signedAt: '20/08/2026 11:30:00',
    sellerName: 'CÔNG TY CỔ PHẦN CÔNG NGHỆ VÀ TRUYỀN THÔNG ALPHA',
    sellerTaxCode: '0101234567',
    sellerAddress: 'Tầng 3, Tòa nhà Alpha, 123 Đường Công Nghệ, Cầu Giấy, Hà Nội',
    sellerPhone: '024 3838 9999',
    sellerEmail: 'contact@alphatech.vn',
    sellerBankAccount: '19031234567890 - Techcombank (CN Thăng Long)',
    customerName: 'CÔNG TY CỔ PHẦN THƯƠNG MẠI & XNK AN PHÁT',
    customerTaxCode: '0107654321',
    customerAddress: 'Số 15 Phố Huế, Phường Hàng Bài, Quận Hoàn Kiếm, Hà Nội',
    customerPhone: '024 3943 1234',
    customerEmail: 'anphat@anphattrading.vn',
    customerRepresentative: 'Vũ Đức Nam',
    paymentMethod: 'Chuyển khoản (TM/CK)',
    items: [
      {
        id: 1,
        description: 'Hệ thống Camera Giám sát AI Thông minh (Gói Enterprise - Cập nhật)',
        unit: 'Gói',
        quantity: 1,
        unitPrice: 43636364,
        amount: 43636364,
      },
    ],
    subtotalAmount: 43636364,
    vatRate: 10,
    vatAmount: 4363636,
    totalAmount: 48000000,
    amountInWords: 'Bốn mươi tám triệu đồng chẵn.',
    notes: 'Thay thế cho hóa đơn số HD-2026-00018 ngày 15/08/2026 theo Biên bản thỏa thuận số 05/BB-TH.',
    originalInvoiceId: '4',
    originalInvoiceNumber: 'HD-2026-00018',
    replacedById: null,
  },
  {
    id: '6',
    invoiceNumber: 'HD-2026-00035',
    serialNumber: '1C26TAA',
    status: 'CANCELED',
    issueDate: '2026-08-18T14:00:00.000Z',
    createdAt: '2026-08-18T13:30:00.000Z',
    signedBy: 'CÔNG TY CỔ PHẦN CÔNG NGHỆ VÀ TRUYỀN THÔNG ALPHA',
    signedAt: '18/08/2026 14:00:00',
    sellerName: 'CÔNG TY CỔ PHẦN CÔNG NGHỆ VÀ TRUYỀN THÔNG ALPHA',
    sellerTaxCode: '0101234567',
    sellerAddress: 'Tầng 3, Tòa nhà Alpha, 123 Đường Công Nghệ, Cầu Giấy, Hà Nội',
    sellerPhone: '024 3838 9999',
    sellerEmail: 'contact@alphatech.vn',
    sellerBankAccount: '19031234567890 - Techcombank (CN Thăng Long)',
    customerName: 'CÔNG TY TNHH THIẾT BỊ Y TẾ HÒA BÌNH',
    customerTaxCode: '0309871234',
    customerAddress: 'Số 102 Đường Võ Văn Kiệt, Quận 5, TP. HCM',
    customerPhone: '028 3955 6677',
    customerEmail: 'contact@hoabinhmed.vn',
    customerRepresentative: 'Phạm Thanh Bình',
    paymentMethod: 'Tiền mặt (TM)',
    items: [
      {
        id: 1,
        description: 'Thiết bị cảm biến nhiệt độ thông minh IoT MedSense v2',
        unit: 'Chiếc',
        quantity: 4,
        unitPrice: 2200000,
        amount: 8800000,
      },
    ],
    subtotalAmount: 8800000,
    vatRate: 0,
    vatAmount: 0,
    totalAmount: 8800000,
    amountInWords: 'Tám triệu tám trăm nghìn đồng chẵn.',
    notes: 'Hóa đơn đã bị hủy.',
    cancelReason: 'Sai sót thông tin người mua và đơn giá, hai bên thống nhất lập biên bản hủy số 18/BB-HUY.',
    originalInvoiceId: null,
    replacedById: null,
  },
  {
    id: '7',
    invoiceNumber: 'HD-2026-00034',
    serialNumber: '1C26TAA',
    status: 'ISSUED',
    issueDate: '2026-08-17T08:30:00.000Z',
    createdAt: '2026-08-17T08:00:00.000Z',
    signedBy: 'CÔNG TY CỔ PHẦN CÔNG NGHỆ VÀ TRUYỀN THÔNG ALPHA',
    signedAt: '17/08/2026 08:30:00',
    sellerName: 'CÔNG TY CỔ PHẦN CÔNG NGHỆ VÀ TRUYỀN THÔNG ALPHA',
    sellerTaxCode: '0101234567',
    sellerAddress: 'Tầng 3, Tòa nhà Alpha, 123 Đường Công Nghệ, Cầu Giấy, Hà Nội',
    sellerPhone: '024 3838 9999',
    sellerEmail: 'contact@alphatech.vn',
    sellerBankAccount: '19031234567890 - Techcombank (CN Thăng Long)',
    customerName: 'DOANH NGHIỆP TƯ NHÂN CƠ KHÍ NAM THẮNG',
    customerTaxCode: '3601234567',
    customerAddress: 'Khu Công Nghiệp Biên Hòa 2, Tỉnh Đồng Nai',
    customerPhone: '0251 389 1234',
    customerEmail: 'namthang.mech@gmail.com',
    paymentMethod: 'Chuyển khoản (TM/CK)',
    items: [
      {
        id: 1,
        description: 'Dịch vụ bảo trì, nâng cấp phần mềm điều khiển dây chuyền CNC',
        unit: 'Gói',
        quantity: 1,
        unitPrice: 29090909,
        amount: 29090909,
      },
    ],
    subtotalAmount: 29090909,
    vatRate: 10,
    vatAmount: 2909091,
    totalAmount: 32000000,
    amountInWords: 'Ba mươi hai triệu đồng chẵn.',
    notes: 'Nghiệm thu dịch vụ kỹ thuật quý 3/2026.',
    originalInvoiceId: null,
    replacedById: null,
  },
  {
    id: '8',
    invoiceNumber: 'HD-2026-00033',
    serialNumber: '1C26TAA',
    status: 'DRAFT',
    issueDate: null,
    createdAt: '2026-08-16T15:10:00.000Z',
    sellerName: 'CÔNG TY CỔ PHẦN CÔNG NGHỆ VÀ TRUYỀN THÔNG ALPHA',
    sellerTaxCode: '0101234567',
    sellerAddress: 'Tầng 3, Tòa nhà Alpha, 123 Đường Công Nghệ, Cầu Giấy, Hà Nội',
    sellerPhone: '024 3838 9999',
    sellerEmail: 'contact@alphatech.vn',
    sellerBankAccount: '19031234567890 - Techcombank (CN Thăng Long)',
    customerName: 'CÔNG TY TNHH TƯ VẤN KIẾN TRÚC TÂN THỜI',
    customerTaxCode: '0105432109',
    customerAddress: 'Số 45 Phố Thợ Nhuộm, Quận Hoàn Kiếm, Hà Nội',
    customerPhone: '0903456789',
    customerEmail: 'tanthoi.arch@gmail.com',
    paymentMethod: 'Chuyển khoản (TM/CK)',
    items: [
      {
        id: 1,
        description: 'Bản quyền phần mềm Thiết kế Đồ họa 3D RenderPro Studio',
        unit: 'License',
        quantity: 3,
        unitPrice: 5000000,
        amount: 15000000,
      },
    ],
    subtotalAmount: 15000000,
    vatRate: 0,
    vatAmount: 0,
    totalAmount: 15000000,
    amountInWords: 'Mười lăm triệu đồng chẵn.',
    notes: 'Bản quyền phần mềm thuộc đối tượng không chịu thuế GTGT.',
    originalInvoiceId: null,
    replacedById: null,
  },
];
