import { PrismaClient, Prisma } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres:postgrespassword@localhost:5432/invoicedb?schema=public';

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('[Seed] Seeding fresh sample invoice data...');

  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();

  // 1. HÓA ĐƠN ĐÃ PHÁT HÀNH #1 (ISSUED - Dịch vụ phần mềm ERP)
  const inv1 = await prisma.invoice.create({
    data: {
      templateCode: '01GTKT3/001',
      zone: '1C26TAA',
      sequenceNumber: 1,
      invoiceNumber: '1C26TAA-0000001',
      status: 'ISSUED',
      issueDate: new Date('2026-08-10T08:30:00.000Z'),
      taxDepartment: 'CỤC THUẾ TP. HÀ NỘI',
      taxAuthorityCode: '00E26TAA88123401',
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
      totalAmount: new Prisma.Decimal(25000000),
      vatAmount: new Prisma.Decimal(2500000),
      vatRate: 10,
      notes: 'Thanh toán đợt 1 hợp đồng phần mềm ERP Cloud số 12/2026/HĐKT-ERP',
      items: {
        create: [
          {
            description: 'Bản quyền phần mềm ERP Cloud Doanh nghiệp (Gói 12 tháng)',
            unit: 'Gói',
            quantity: new Prisma.Decimal(1),
            unitPrice: new Prisma.Decimal(20000000),
            amount: new Prisma.Decimal(20000000),
          },
          {
            description: 'Dịch vụ đào tạo và chuyển giao công nghệ cho nhân sự kế toán',
            unit: 'Buổi',
            quantity: new Prisma.Decimal(2),
            unitPrice: new Prisma.Decimal(2500000),
            amount: new Prisma.Decimal(5000000),
          },
        ],
      },
    },
  });

  // 2. HÓA ĐƠN ĐÃ PHÁT HÀNH #2 (ISSUED - Thiết bị mạng & Máy chủ)
  const inv2 = await prisma.invoice.create({
    data: {
      templateCode: '01GTKT3/001',
      zone: '1C26TAA',
      sequenceNumber: 2,
      invoiceNumber: '1C26TAA-0000002',
      status: 'ISSUED',
      issueDate: new Date('2026-08-15T14:15:00.000Z'),
      taxDepartment: 'CỤC THUẾ TP. HÀ NỘI',
      taxAuthorityCode: '00E26TAA88123402',
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
      totalAmount: new Prisma.Decimal(48000000),
      vatAmount: new Prisma.Decimal(3840000),
      vatRate: 8,
      notes: 'Bàn giao thiết bị phòng Server theo biên bản nghiệm thu số 08/BBNT',
      items: {
        create: [
          {
            description: 'Máy chủ Server Dell PowerEdge R750xs (Xeon Silver 4310/32GB/2TB)',
            unit: 'Bộ',
            quantity: new Prisma.Decimal(1),
            unitPrice: new Prisma.Decimal(38000000),
            amount: new Prisma.Decimal(38000000),
          },
          {
            description: 'Switch mạng Cisco Catalyst 24 Port Gigabit',
            unit: 'Chiếc',
            quantity: new Prisma.Decimal(2),
            unitPrice: new Prisma.Decimal(5000000),
            amount: new Prisma.Decimal(10000000),
          },
        ],
      },
    },
  });

  // 3. HÓA ĐƠN ĐÃ PHÁT HÀNH #3 (ISSUED - Dịch vụ Cloud VPS)
  const inv3 = await prisma.invoice.create({
    data: {
      templateCode: '01GTKT3/001',
      zone: '1C26TAA',
      sequenceNumber: 3,
      invoiceNumber: '1C26TAA-0000003',
      status: 'ISSUED',
      issueDate: new Date('2026-08-18T10:00:00.000Z'),
      taxDepartment: 'CỤC THUẾ TP. HÀ NỘI',
      taxAuthorityCode: '00E26TAA88123403',
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
      totalAmount: new Prisma.Decimal(18500000),
      vatAmount: new Prisma.Decimal(1850000),
      vatRate: 10,
      notes: 'Dịch vụ duy trì hạ tầng Cloud VPS và bảo mật hệ thống 6 tháng cuối năm 2026.',
      items: {
        create: [
          {
            description: 'Dịch vụ Cloud VPS High-Performance (8 vCPU / 32GB RAM / 500GB NVMe)',
            unit: 'Tháng',
            quantity: new Prisma.Decimal(6),
            unitPrice: new Prisma.Decimal(2500000),
            amount: new Prisma.Decimal(15000000),
          },
          {
            description: 'Bản quyền SSL EV Wildcard & Dịch vụ tường lửa chống DDoS cao cấp',
            unit: 'Gói',
            quantity: new Prisma.Decimal(1),
            unitPrice: new Prisma.Decimal(3500000),
            amount: new Prisma.Decimal(3500000),
          },
        ],
      },
    },
  });

  // 4. HÓA ĐƠN ĐÃ PHÁT HÀNH #4 (ISSUED - Camera AI An Phát)
  const inv4 = await prisma.invoice.create({
    data: {
      templateCode: '01GTKT3/001',
      zone: '1C26TAA',
      sequenceNumber: 4,
      invoiceNumber: '1C26TAA-0000004',
      status: 'ISSUED',
      issueDate: new Date('2026-08-20T14:30:00.000Z'),
      taxDepartment: 'CỤC THUẾ TP. HÀ NỘI',
      taxAuthorityCode: '00E26TAA88123404',
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
      totalAmount: new Prisma.Decimal(48000000),
      vatAmount: new Prisma.Decimal(4800000),
      vatRate: 10,
      notes: 'Lắp đặt và triển khai hệ thống Camera Giám sát AI thông minh theo Hợp đồng số 20/2026/HĐ-AP.',
      items: {
        create: [
          {
            description: 'Camera AI thông minh nhận diện khuôn mặt & biển số 4K UltraHD',
            unit: 'Bộ',
            quantity: new Prisma.Decimal(4),
            unitPrice: new Prisma.Decimal(9500000),
            amount: new Prisma.Decimal(38000000),
          },
          {
            description: 'Đầu ghi hình mạng NVR 32 kênh hỗ trợ AI Storage 8TB',
            unit: 'Chiếc',
            quantity: new Prisma.Decimal(1),
            unitPrice: new Prisma.Decimal(10000000),
            amount: new Prisma.Decimal(10000000),
          },
        ],
      },
    },
  });

  // 5. HÓA ĐƠN ĐÃ PHÁT HÀNH #5 (ISSUED - HÓA ĐƠN LỚN 18 MỤC ĐỂ TEST IN ẤN & XUẤT PDF NHIỀU TRANG)
  const inv5 = await prisma.invoice.create({
    data: {
      templateCode: '01GTKT3/001',
      zone: '1C26TAA',
      sequenceNumber: 5,
      invoiceNumber: '1C26TAA-0000005',
      status: 'ISSUED',
      issueDate: new Date('2026-08-22T15:30:00.000Z'),
      taxDepartment: 'CỤC THUẾ TP. HÀ NỘI',
      taxAuthorityCode: '00E26TAA88123405',
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
      totalAmount: new Prisma.Decimal(258550000),
      vatAmount: new Prisma.Decimal(25855000),
      vatRate: 10,
      notes: 'Bàn giao thiết bị và triển khai gói chuyển đổi số toàn diện theo Hợp đồng số 88/2026/HĐKT-DNA.',
      items: {
        create: [
          { description: '1. Máy chủ chuyên dụng Server Dell PowerEdge R750xs (2x Xeon/64GB/4TB)', unit: 'Bộ', quantity: new Prisma.Decimal(2), unitPrice: new Prisma.Decimal(45000000), amount: new Prisma.Decimal(90000000) },
          { description: '2. Tủ Rack chuyên dụng 42U chống ồn chuẩn Data Center', unit: 'Tủ', quantity: new Prisma.Decimal(1), unitPrice: new Prisma.Decimal(12000000), amount: new Prisma.Decimal(12000000) },
          { description: '3. Switch trung tâm Cisco Catalyst 9200L 48 cổng PoE+ Layer 3', unit: 'Chiếc', quantity: new Prisma.Decimal(2), unitPrice: new Prisma.Decimal(18500000), amount: new Prisma.Decimal(37000000) },
          { description: '4. Bộ định tuyến Router DrayTek Vigor3910 10Gbps Multi-WAN', unit: 'Chiếc', quantity: new Prisma.Decimal(1), unitPrice: new Prisma.Decimal(16500000), amount: new Prisma.Decimal(16500000) },
          { description: '5. Bộ phát Wi-Fi chuyên dụng Aruba AP-515 chuẩn Wi-Fi 6', unit: 'Chiếc', quantity: new Prisma.Decimal(6), unitPrice: new Prisma.Decimal(4200000), amount: new Prisma.Decimal(25200000) },
          { description: '6. Thiết bị tường lửa bảo mật Fortinet FortiGate 60F kèm License 1 năm', unit: 'Chiếc', quantity: new Prisma.Decimal(1), unitPrice: new Prisma.Decimal(19500000), amount: new Prisma.Decimal(19500000) },
          { description: '7. Bộ lưu điện trực tuyến UPS SANTAK Online 3kVA / 2700W', unit: 'Bộ', quantity: new Prisma.Decimal(1), unitPrice: new Prisma.Decimal(14500000), amount: new Prisma.Decimal(14500000) },
          { description: '8. Ổ cứng SSD Enterprise Kioxia 1.92TB NVMe Read-Intensive', unit: 'Chiếc', quantity: new Prisma.Decimal(4), unitPrice: new Prisma.Decimal(4800000), amount: new Prisma.Decimal(19200000) },
          { description: '9. Thanh RAM Server Samsung DDR4 32GB ECC Registered 3200MHz', unit: 'Thanh', quantity: new Prisma.Decimal(4), unitPrice: new Prisma.Decimal(2200000), amount: new Prisma.Decimal(8800000) },
          { description: '10. Cáp mạng đúc sẵn Cat6 UTP CommScope thùng 305 mét', unit: 'Cuộn', quantity: new Prisma.Decimal(3), unitPrice: new Prisma.Decimal(2100000), amount: new Prisma.Decimal(6300000) },
          { description: '11. Hạt mạng RJ45 Cat6 bọc kim chống nhiễu cao cấp (Hộp 100 cái)', unit: 'Hộp', quantity: new Prisma.Decimal(2), unitPrice: new Prisma.Decimal(450000), amount: new Prisma.Decimal(900000) },
          { description: '12. Thanh đấu nối Patch Panel Cat6 24 cổng AMP/CommScope', unit: 'Chiếc', quantity: new Prisma.Decimal(2), unitPrice: new Prisma.Decimal(850000), amount: new Prisma.Decimal(1700000) },
          { description: '13. Dây nhảy mạng Patch Cord Cat6 1.5 mét đúc đầu sẵn', unit: 'Sợi', quantity: new Prisma.Decimal(48), unitPrice: new Prisma.Decimal(35000), amount: new Prisma.Decimal(1680000) },
          { description: '14. Bản quyền hệ điều hành máy chủ Windows Server 2022 Standard 16 Core', unit: 'License', quantity: new Prisma.Decimal(2), unitPrice: new Prisma.Decimal(11500000), amount: new Prisma.Decimal(23000000) },
          { description: '15. Phần mềm diệt virus máy chủ Kaspersky Endpoint Security Business 1 năm', unit: 'Gói', quantity: new Prisma.Decimal(1), unitPrice: new Prisma.Decimal(4500000), amount: new Prisma.Decimal(4500000) },
          { description: '16. Dịch vụ lắp đặt, cấu hình hệ thống mạng VLAN, Routing và VPN', unit: 'Gói', quantity: new Prisma.Decimal(1), unitPrice: new Prisma.Decimal(6000000), amount: new Prisma.Decimal(6000000) },
          { description: '17. Dịch vụ đào tạo và chuyển giao tài liệu vận hành hạ tầng', unit: 'Buổi', quantity: new Prisma.Decimal(2), unitPrice: new Prisma.Decimal(2000000), amount: new Prisma.Decimal(4000000) },
          { description: '18. Dịch vụ bảo trì và hỗ trợ kỹ thuật On-site 24/7 (12 tháng)', unit: 'Gói', quantity: new Prisma.Decimal(1), unitPrice: new Prisma.Decimal(5000000), amount: new Prisma.Decimal(5000000) },
        ],
      },
    },
  });

  // 6. HÓA ĐƠN BẢN NHÁP #6 (DRAFT - Khách hàng đang kiểm tra thông tin)
  const inv6 = await prisma.invoice.create({
    data: {
      templateCode: '01GTKT3/001',
      zone: '1C26TAA',
      invoiceNumber: 'NHAP-A8F2K',
      status: 'DRAFT',
      taxDepartment: 'CỤC THUẾ TP. HÀ NỘI',
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
      totalAmount: new Prisma.Decimal(15000000),
      vatAmount: new Prisma.Decimal(1500000),
      vatRate: 10,
      notes: 'Bản nháp gửi khách hàng kiểm tra thông tin trước khi xuất chính thức',
      items: {
        create: [
          {
            description: 'Dịch vụ tư vấn hạ tầng đám mây và tối ưu hóa hệ thống AI Data Lake',
            unit: 'Tháng',
            quantity: new Prisma.Decimal(1),
            unitPrice: new Prisma.Decimal(15000000),
            amount: new Prisma.Decimal(15000000),
          },
        ],
      },
    },
  });

  // 7. HÓA ĐƠN ĐÃ HỦY #7 (CANCELED - Minh họa tính năng Hủy theo Nghị định 123)
  const inv7 = await prisma.invoice.create({
    data: {
      templateCode: '01GTKT3/001',
      zone: '1C26TAA',
      sequenceNumber: 6,
      invoiceNumber: '1C26TAA-0000006',
      status: 'CANCELED',
      issueDate: new Date('2026-08-05T10:00:00.000Z'),
      taxDepartment: 'CỤC THUẾ TP. HÀ NỘI',
      taxAuthorityCode: '00E26TAA88123406',
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
      totalAmount: new Prisma.Decimal(8800000),
      vatAmount: new Prisma.Decimal(0),
      vatRate: 0,
      notes: 'Hóa đơn đã bị hủy theo biên bản thỏa thuận hủy hóa đơn số 18/BB-HUY',
      cancelReason: 'Nhập sai mã số thuế khách hàng và sai tên đơn vị người mua.',
      items: {
        create: [
          {
            description: 'Thiết bị cảm biến nhiệt độ thông minh IoT MedSense v2',
            unit: 'Chiếc',
            quantity: new Prisma.Decimal(4),
            unitPrice: new Prisma.Decimal(2200000),
            amount: new Prisma.Decimal(8800000),
          },
        ],
      },
    },
  });

  // Synchronize PostgreSQL sequence with max sequenceNumber in database
  await prisma.$executeRaw`
    CREATE SEQUENCE IF NOT EXISTS "Invoice_sequenceNumber_seq";
  `;
  await prisma.$executeRaw`
    SELECT setval('"Invoice_sequenceNumber_seq"', (SELECT COALESCE(MAX("sequenceNumber"), 0) FROM "Invoice"));
  `;

  console.log('[Seed] Successfully seeded 7 sample invoices:');
  console.log(`  1. [ISSUED]   ${inv1.invoiceNumber} - ${inv1.customerName}`);
  console.log(`  2. [ISSUED]   ${inv2.invoiceNumber} - ${inv2.customerName}`);
  console.log(`  3. [ISSUED]   ${inv3.invoiceNumber} - ${inv3.customerName}`);
  console.log(`  4. [ISSUED]   ${inv4.invoiceNumber} - ${inv4.customerName}`);
  console.log(`  5. [ISSUED-18ITEMS] ${inv5.invoiceNumber} - ${inv5.customerName}`);
  console.log(`  6. [DRAFT]    ${inv6.invoiceNumber} - ${inv6.customerName}`);
  console.log(`  7. [CANCELED] ${inv7.invoiceNumber} - ${inv7.customerName}`);
}

main()
  .catch((e) => {
    console.error('[Seed Error]:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
