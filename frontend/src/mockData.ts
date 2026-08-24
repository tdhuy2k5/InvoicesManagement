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
  customerBankAccount?: string;
  paymentMethod: string;
  templateCode?: string;
  zone?: string;
  sequenceNumber?: number;
  taxDepartment?: string;

  // Line Items & Totals
  items: InvoiceItem[];
  subtotalAmount: number;
  vatRate: number; // 0, 5, 8, 10, -1 (KCT)
  vatAmount: number;
  totalAmount: number;
  amountInWords?: string;
  notes?: string;

  // Replacement / Cancellation Lineage
  originalInvoiceId?: string | null;
  originalInvoiceNumber?: string | null;
  replacedById?: string | null;
  replacementInvoiceNumber?: string | null;
  cancelReason?: string | null;
  taxAuthorityCode?: string | null;
  agreementMinutes?: string | null;
}

export const INITIAL_MOCK_INVOICES: InvoiceEntity[] = [
  {
    id: '1',
    invoiceNumber: '1C26TAA-0000001',
    serialNumber: '1C26TAA',
    zone: '1C26TAA',
    sequenceNumber: 1,
    taxAuthorityCode: '00E26TAA88123401',
    status: 'ISSUED',
    issueDate: '2026-08-10T08:30:00.000Z',
    createdAt: '2026-08-10T08:00:00.000Z',
    signedBy: 'CÔNG TY CỔ PHẦN CÔNG NGHỆ VÀ TRUYỀN THÔNG ALPHA',
    signedAt: '10/08/2026 08:30:00',
    sellerName: 'CÔNG TY CỔ PHẦN CÔNG NGHỆ VÀ TRUYỀN THÔNG ALPHA',
    sellerTaxCode: '0101234567',
    sellerAddress: 'Tầng 3, Tòa nhà Alpha, 123 Đường Công Nghệ, Cầu Giấy, Hà Nội',
    sellerPhone: '024 3838 9999',
    sellerEmail: 'finance@alphatech.vn',
    sellerBankAccount: '19031234567890 - Techcombank (CN Thăng Long)',
    customerName: 'CÔNG TY TNHH GIẢI PHÁP SỐ TOÀN CẦU',
    customerTaxCode: '0319876543',
    customerAddress: '456 Lê Lợi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    customerPhone: '028 3912 8888',
    customerEmail: 'ketoan@toancau-solution.vn',
    customerBankAccount: '0071001234567 - Vietcombank (CN TP.HCM)',
    paymentMethod: 'Chuyển khoản (CK)',
    items: [
      {
        id: 1,
        description: 'Bản quyền phần mềm ERP Cloud Doanh nghiệp (Gói 12 tháng)',
        unit: 'Gói',
        quantity: 1,
        unitPrice: 20000000,
        amount: 20000000,
      },
      {
        id: 2,
        description: 'Dịch vụ đào tạo và chuyển giao công nghệ cho nhân sự kế toán',
        unit: 'Buổi',
        quantity: 2,
        unitPrice: 2500000,
        amount: 5000000,
      },
    ],
    subtotalAmount: 25000000,
    vatRate: 10,
    vatAmount: 2500000,
    totalAmount: 27500000,
    amountInWords: 'Hai mươi bảy triệu năm trăm nghìn đồng chẵn.',
    notes: 'Thanh toán đợt 1 hợp đồng phần mềm ERP Cloud số 12/2026/HĐKT-ERP',
    originalInvoiceId: null,
    replacedById: null,
  },
  {
    id: '2',
    invoiceNumber: '1C26TAA-0000002',
    serialNumber: '1C26TAA',
    zone: '1C26TAA',
    sequenceNumber: 2,
    taxAuthorityCode: '00E26TAA88123402',
    status: 'ISSUED',
    issueDate: '2026-08-15T14:15:00.000Z',
    createdAt: '2026-08-15T13:45:00.000Z',
    sellerName: 'CÔNG TY CỔ PHẦN CÔNG NGHỆ VÀ TRUYỀN THÔNG ALPHA',
    sellerTaxCode: '0101234567',
    sellerAddress: 'Tầng 3, Tòa nhà Alpha, 123 Đường Công Nghệ, Cầu Giấy, Hà Nội',
    sellerPhone: '024 3838 9999',
    sellerEmail: 'finance@alphatech.vn',
    sellerBankAccount: '19031234567890 - Techcombank (CN Thăng Long)',
    customerName: 'CÔNG TY CỔ PHẦN ĐẦU TƯ VÀ XÂY DỰNG BÌNH MINH',
    customerTaxCode: '0108889999',
    customerAddress: 'Số 88 Phố Huế, Phường Hàng Bài, Quận Hoàn Kiếm, Hà Nội',
    customerPhone: '0912 345 678',
    customerEmail: 'contact@binhminh-invest.vn',
    customerBankAccount: '102003004005 - BIDV (CN Hà Nội)',
    paymentMethod: 'Chuyển khoản (TM/CK)',
    items: [
      {
        id: 1,
        description: 'Máy chủ Server Dell PowerEdge R750xs (Xeon Silver 4310/32GB/2TB)',
        unit: 'Bộ',
        quantity: 1,
        unitPrice: 38000000,
        amount: 38000000,
      },
      {
        id: 2,
        description: 'Switch mạng Cisco Catalyst 24 Port Gigabit',
        unit: 'Chiếc',
        quantity: 2,
        unitPrice: 5000000,
        amount: 10000000,
      },
    ],
    subtotalAmount: 48000000,
    vatRate: 8,
    vatAmount: 3840000,
    totalAmount: 51840000,
    amountInWords: 'Năm mươi mốt triệu tám trăm bốn mươi nghìn đồng chẵn.',
    notes: 'Bàn giao thiết bị phòng Server theo biên bản nghiệm thu số 08/BBNT',
    originalInvoiceId: null,
    replacedById: null,
  },
  {
    id: '3',
    invoiceNumber: '1C26TAA-0000003',
    serialNumber: '1C26TAA',
    zone: '1C26TAA',
    sequenceNumber: 3,
    taxAuthorityCode: '00E26TAA88123403',
    status: 'ISSUED',
    issueDate: '2026-08-18T10:00:00.000Z',
    createdAt: '2026-08-18T09:30:00.000Z',
    sellerName: 'CÔNG TY CỔ PHẦN CÔNG NGHỆ VÀ TRUYỀN THÔNG ALPHA',
    sellerTaxCode: '0101234567',
    sellerAddress: 'Tầng 3, Tòa nhà Alpha, 123 Đường Công Nghệ, Cầu Giấy, Hà Nội',
    sellerPhone: '024 3838 9999',
    sellerEmail: 'finance@alphatech.vn',
    sellerBankAccount: '19031234567890 - Techcombank (CN Thăng Long)',
    customerName: 'CÔNG TY TNHH DỊCH VỤ SỐ HOÀNG GIA',
    customerTaxCode: '0108765432',
    customerAddress: 'Tòa nhà Royal City, 72A Nguyễn Trãi, Thanh Xuân, Hà Nội',
    customerPhone: '0912 345 678',
    customerEmail: 'finance@hoanggiadigital.com',
    customerBankAccount: '0451000234567 - Vietcombank (CN Thành Công)',
    paymentMethod: 'Chuyển khoản (TM/CK)',
    items: [
      {
        id: 1,
        description: 'Dịch vụ Cloud VPS High-Performance (8 vCPU / 32GB RAM / 500GB NVMe)',
        unit: 'Tháng',
        quantity: 6,
        unitPrice: 2500000,
        amount: 15000000,
      },
      {
        id: 2,
        description: 'Bản quyền SSL EV Wildcard & Dịch vụ tường lửa chống DDoS cao cấp',
        unit: 'Gói',
        quantity: 1,
        unitPrice: 3500000,
        amount: 3500000,
      },
    ],
    subtotalAmount: 18500000,
    vatRate: 10,
    vatAmount: 1850000,
    totalAmount: 20350000,
    amountInWords: 'Hai mươi triệu ba trăm năm mươi nghìn đồng chẵn.',
    notes: 'Dịch vụ duy trì hạ tầng Cloud VPS và bảo mật hệ thống 6 tháng cuối năm 2026.',
    originalInvoiceId: null,
    replacedById: null,
  },
  {
    id: '4',
    invoiceNumber: '1C26TAA-0000004',
    serialNumber: '1C26TAA',
    zone: '1C26TAA',
    sequenceNumber: 4,
    taxAuthorityCode: '00E26TAA88123404',
    status: 'ISSUED',
    issueDate: '2026-08-20T14:30:00.000Z',
    createdAt: '2026-08-20T14:00:00.000Z',
    sellerName: 'CÔNG TY CỔ PHẦN CÔNG NGHỆ VÀ TRUYỀN THÔNG ALPHA',
    sellerTaxCode: '0101234567',
    sellerAddress: 'Tầng 3, Tòa nhà Alpha, 123 Đường Công Nghệ, Cầu Giấy, Hà Nội',
    sellerPhone: '024 3838 9999',
    sellerEmail: 'finance@alphatech.vn',
    sellerBankAccount: '19031234567890 - Techcombank (CN Thăng Long)',
    customerName: 'CÔNG TY CỔ PHẦN THƯƠNG MẠI & XNK AN PHÁT',
    customerTaxCode: '0107654321',
    customerAddress: 'Số 15 Phố Huế, Phường Hàng Bài, Quận Hoàn Kiếm, Hà Nội',
    customerPhone: '024 3943 1234',
    customerEmail: 'anphat@anphattrading.vn',
    customerBankAccount: '118000123456 - Vietinbank (CN Hoàn Kiếm)',
    paymentMethod: 'Chuyển khoản (TM/CK)',
    items: [
      {
        id: 1,
        description: 'Camera AI thông minh nhận diện khuôn mặt & biển số 4K UltraHD',
        unit: 'Bộ',
        quantity: 4,
        unitPrice: 9500000,
        amount: 38000000,
      },
      {
        id: 2,
        description: 'Đầu ghi hình mạng NVR 32 kênh hỗ trợ AI Storage 8TB',
        unit: 'Chiếc',
        quantity: 1,
        unitPrice: 10000000,
        amount: 10000000,
      },
    ],
    subtotalAmount: 48000000,
    vatRate: 10,
    vatAmount: 4800000,
    totalAmount: 52800000,
    amountInWords: 'Năm mươi hai triệu tám trăm nghìn đồng chẵn.',
    notes: 'Lắp đặt và triển khai hệ thống Camera Giám sát AI thông minh theo Hợp đồng số 20/2026/HĐ-AP.',
    originalInvoiceId: null,
    replacedById: null,
  },
  {
    id: '5',
    invoiceNumber: '1C26TAA-0000005',
    serialNumber: '1C26TAA',
    zone: '1C26TAA',
    sequenceNumber: 5,
    taxAuthorityCode: '00E26TAA88123405',
    status: 'ISSUED',
    issueDate: '2026-08-22T15:30:00.000Z',
    createdAt: '2026-08-22T15:00:00.000Z',
    sellerName: 'CÔNG TY CỔ PHẦN CÔNG NGHỆ VÀ TRUYỀN THÔNG ALPHA',
    sellerTaxCode: '0101234567',
    sellerAddress: 'Tầng 3, Tòa nhà Alpha, 123 Đường Công Nghệ, Cầu Giấy, Hà Nội',
    sellerPhone: '024 3838 9999',
    sellerEmail: 'finance@alphatech.vn',
    sellerBankAccount: '19031234567890 - Techcombank (CN Thăng Long)',
    customerName: 'TẬP ĐOÀN CÔNG NGHỆ VÀ TRUYỀN THÔNG ĐÔNG NAM Á',
    customerTaxCode: '0109998888',
    customerAddress: 'Tòa nhà Landmark 72, Đường Phạm Hùng, Phường Mễ Trì, Quận Nam Từ Liêm, Hà Nội',
    customerPhone: '024 3789 9999',
    customerEmail: 'finance@dongnama-group.vn',
    customerBankAccount: '0011004567890 - Vietcombank (Sở Giao Dịch)',
    paymentMethod: 'Chuyển khoản (TM/CK)',
    items: [
      { id: 1, description: '1. Máy chủ chuyên dụng Server Dell PowerEdge R750xs (2x Xeon/64GB/4TB)', unit: 'Bộ', quantity: 2, unitPrice: 45000000, amount: 90000000 },
      { id: 2, description: '2. Tủ Rack chuyên dụng 42U chống ồn chuẩn Data Center', unit: 'Tủ', quantity: 1, unitPrice: 12000000, amount: 12000000 },
      { id: 3, description: '3. Switch trung tâm Cisco Catalyst 9200L 48 cổng PoE+ Layer 3', unit: 'Chiếc', quantity: 2, unitPrice: 18500000, amount: 37000000 },
      { id: 4, description: '4. Bộ định tuyến Router DrayTek Vigor3910 10Gbps Multi-WAN', unit: 'Chiếc', quantity: 1, unitPrice: 16500000, amount: 16500000 },
      { id: 5, description: '5. Bộ phát Wi-Fi chuyên dụng Aruba AP-515 chuẩn Wi-Fi 6', unit: 'Chiếc', quantity: 6, unitPrice: 4200000, amount: 25200000 },
    ],
    subtotalAmount: 180700000,
    vatRate: 10,
    vatAmount: 18070000,
    totalAmount: 198770000,
    amountInWords: 'Một trăm chín mươi tám triệu bảy trăm bảy mươi nghìn đồng chẵn.',
    notes: 'Bàn giao thiết bị và triển khai gói chuyển đổi số toàn diện theo Hợp đồng số 88/2026/HĐKT-DNA.',
    originalInvoiceId: null,
    replacedById: null,
  },
  {
    id: '6',
    invoiceNumber: 'NHAP-A8F2K',
    serialNumber: '1C26TAA',
    zone: '1C26TAA',
    status: 'DRAFT',
    issueDate: null,
    createdAt: '2026-08-23T10:00:00.000Z',
    sellerName: 'CÔNG TY CỔ PHẦN CÔNG NGHỆ VÀ TRUYỀN THÔNG ALPHA',
    sellerTaxCode: '0101234567',
    sellerAddress: 'Tầng 3, Tòa nhà Alpha, 123 Đường Công Nghệ, Cầu Giấy, Hà Nội',
    sellerPhone: '024 3838 9999',
    sellerEmail: 'finance@alphatech.vn',
    sellerBankAccount: '19031234567890 - Techcombank (CN Thăng Long)',
    customerName: 'TẬP ĐOÀN CÔNG NGHỆ VIỄN THÔNG SAO MAI',
    customerTaxCode: '0301122334',
    customerAddress: 'Tòa nhà Sao Mai, 79 Nguyễn Thị Minh Khai, Quận 3, TP. Hồ Chí Minh',
    customerPhone: '0909 999 888',
    customerEmail: 'ketoan@saomai-telecom.com',
    paymentMethod: 'Chuyển khoản (CK)',
    items: [
      {
        id: 1,
        description: 'Dịch vụ tư vấn hạ tầng đám mây và tối ưu hóa hệ thống AI Data Lake',
        unit: 'Tháng',
        quantity: 1,
        unitPrice: 15000000,
        amount: 15000000,
      },
    ],
    subtotalAmount: 15000000,
    vatRate: 10,
    vatAmount: 1500000,
    totalAmount: 16500000,
    amountInWords: 'Mười sáu triệu năm trăm nghìn đồng chẵn.',
    notes: 'Bản nháp gửi khách hàng kiểm tra thông tin trước khi xuất chính thức.',
    originalInvoiceId: null,
    replacedById: null,
  },
  {
    id: '7',
    invoiceNumber: '1C26TAA-0000006',
    serialNumber: '1C26TAA',
    zone: '1C26TAA',
    sequenceNumber: 6,
    taxAuthorityCode: '00E26TAA88123406',
    status: 'CANCELED',
    issueDate: '2026-08-05T10:00:00.000Z',
    createdAt: '2026-08-05T09:30:00.000Z',
    sellerName: 'CÔNG TY CỔ PHẦN CÔNG NGHỆ VÀ TRUYỀN THÔNG ALPHA',
    sellerTaxCode: '0101234567',
    sellerAddress: 'Tầng 3, Tòa nhà Alpha, 123 Đường Công Nghệ, Cầu Giấy, Hà Nội',
    sellerPhone: '024 3838 9999',
    sellerEmail: 'finance@alphatech.vn',
    sellerBankAccount: '19031234567890 - Techcombank (CN Thăng Long)',
    customerName: 'CÔNG TY TNHH THIẾT BỊ Y TẾ HÒA BÌNH',
    customerTaxCode: '0309871234',
    customerEmail: 'contact@hoabinhmed.vn',
    customerAddress: 'Số 102 Đường Võ Văn Kiệt, Quận 5, TP. HCM',
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
    notes: 'Hóa đơn đã bị hủy theo biên bản thỏa thuận hủy hóa đơn số 18/BB-HUY.',
    cancelReason: 'Nhập sai mã số thuế khách hàng và sai tên đơn vị người mua.',
    originalInvoiceId: null,
    replacedById: null,
  },
];
