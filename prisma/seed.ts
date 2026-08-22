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
  console.log('🌱 Bắt đầu nạp dữ liệu mẫu vào PostgreSQL...');

  // Xóa sạch dữ liệu cũ để tránh trùng lặp
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();

  console.log('🧹 Đã dọn dẹp các bảng Invoice và InvoiceItem.');

  // 1. HÓA ĐƠN ĐÃ PHÁT HÀNH #1 (Dịch vụ phần mềm ERP)
  const inv1 = await prisma.invoice.create({
    data: {
      templateCode: '01GTKT3/001',
      zone: '1C26TAA',
      sequenceNumber: 1,
      invoiceNumber: '1C26TAA-0000001',
      status: 'ISSUED',
      issueDate: new Date('2026-08-10T08:30:00.000Z'),
      taxDepartment: 'CỤC THUẾ TP. HÀ NỘI',
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
            description: 'Dịch vụ đào tạo và chuyển giao công nghệ',
            unit: 'Buổi',
            quantity: new Prisma.Decimal(2),
            unitPrice: new Prisma.Decimal(2500000),
            amount: new Prisma.Decimal(5000000),
          },
        ],
      },
    },
  });

  // 2. HÓA ĐƠN ĐÃ PHÁT HÀNH #2 (Thiết bị mạng & Máy chủ)
  const inv2 = await prisma.invoice.create({
    data: {
      templateCode: '01GTKT3/001',
      zone: '1C26TAA',
      sequenceNumber: 2,
      invoiceNumber: '1C26TAA-0000002',
      status: 'ISSUED',
      issueDate: new Date('2026-08-15T14:15:00.000Z'),
      taxDepartment: 'CỤC THUẾ TP. HÀ NỘI',
      sellerName: 'CÔNG TY CỔ PHẦN CÔNG NGHỆ VÀ TRUYỀN THÔNG ALPHA',
      sellerTaxCode: '0101234567',
      sellerAddress: 'Tầng 3, Tòa nhà Alpha, 123 Đường Công Nghệ, Cầu Giấy, Hà Nội',
      sellerPhone: '024 3838 9999',
      sellerBankAccount: '19031234567890 - Techcombank (CN Thăng Long)',
      customerName: 'CÔNG TY CỔ PHẦN ĐẦU TƯ VÀ XÂY DỰNG BÌNH MINH',
      customerTaxCode: '0108889999',
      customerAddress: 'Số 88 Phố Huế, Phường Hàng Bài, Quận Hoàn Kiếm, Hà Nội',
      customerPhone: '0912 345 678',
      customerEmail: 'contact@binhminh-invest.vn',
      paymentMethod: 'Chuyển khoản (TM/CK)',
      totalAmount: new Prisma.Decimal(48000000),
      vatAmount: new Prisma.Decimal(3840000),
      vatRate: 8, // Áp dụng thuế ưu đãi 8%
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

  // 3. HÓA ĐƠN BẢN NHÁP #3 (DRAFT - Khách hàng đang xem trước)
  const inv3 = await prisma.invoice.create({
    data: {
      templateCode: '01GTKT3/001',
      zone: '1C26TAA',
      sequenceNumber: 3,
      invoiceNumber: '1C26TAA-0000003',
      status: 'DRAFT',
      taxDepartment: 'CỤC THUẾ TP. HÀ NỘI',
      sellerName: 'CÔNG TY CỔ PHẦN CÔNG NGHỆ VÀ TRUYỀN THÔNG ALPHA',
      sellerTaxCode: '0101234567',
      sellerAddress: 'Tầng 3, Tòa nhà Alpha, 123 Đường Công Nghệ, Cầu Giấy, Hà Nội',
      sellerPhone: '024 3838 9999',
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
            description: 'Dịch vụ tư vấn hạ tầng đám mây và tối ưu hóa hệ thống',
            unit: 'Tháng',
            quantity: new Prisma.Decimal(1),
            unitPrice: new Prisma.Decimal(15000000),
            amount: new Prisma.Decimal(15000000),
          },
        ],
      },
    },
  });

  // 4. HÓA ĐƠN ĐÃ HỦY #4 (CANCELED - Hủy do sai thông tin MST)
  const inv4 = await prisma.invoice.create({
    data: {
      templateCode: '01GTKT3/001',
      zone: '1C26TAA',
      sequenceNumber: 4,
      invoiceNumber: '1C26TAA-0000004',
      status: 'CANCELED',
      issueDate: new Date('2026-08-05T10:00:00.000Z'),
      taxDepartment: 'CỤC THUẾ TP. HÀ NỘI',
      sellerName: 'CÔNG TY CỔ PHẦN CÔNG NGHỆ VÀ TRUYỀN THÔNG ALPHA',
      sellerTaxCode: '0101234567',
      sellerAddress: 'Tầng 3, Tòa nhà Alpha, 123 Đường Công Nghệ, Cầu Giấy, Hà Nội',
      sellerPhone: '024 3838 9999',
      sellerBankAccount: '19031234567890 - Techcombank (CN Thăng Long)',
      customerName: 'CÔNG TY TNHH THƯƠNG MẠI HẢI ÂU (SAI MST)',
      customerTaxCode: '0100000000',
      customerEmail: 'haiau.trade@example.vn',
      customerAddress: '12 Đường Láng, Đống Đa, Hà Nội',
      paymentMethod: 'Tiền mặt (TM)',
      totalAmount: new Prisma.Decimal(8000000),
      vatAmount: new Prisma.Decimal(800000),
      vatRate: 10,
      notes: 'Hóa đơn đã bị hủy theo biên bản thỏa thuận hủy hóa đơn số 01/BBH-HA',
      cancelReason: 'Nhập sai mã số thuế khách hàng và sai tên đơn vị người mua.',
      items: {
        create: [
          {
            description: 'Gia hạn dịch vụ sao lưu dữ liệu tự động Cloud Backup',
            unit: 'Gói',
            quantity: new Prisma.Decimal(1),
            unitPrice: new Prisma.Decimal(8000000),
            amount: new Prisma.Decimal(8000000),
          },
        ],
      },
    },
  });

  // 5. HÓA ĐƠN BỊ THAY THẾ #5 (REPLACED - Hóa đơn gốc)
  const inv5 = await prisma.invoice.create({
    data: {
      templateCode: '01GTKT3/001',
      zone: '1C26TAA',
      sequenceNumber: 5,
      invoiceNumber: '1C26TAA-0000005',
      status: 'REPLACED',
      issueDate: new Date('2026-08-18T09:00:00.000Z'),
      taxDepartment: 'CỤC THUẾ TP. HÀ NỘI',
      sellerName: 'CÔNG TY CỔ PHẦN CÔNG NGHỆ VÀ TRUYỀN THÔNG ALPHA',
      sellerTaxCode: '0101234567',
      sellerAddress: 'Tầng 3, Tòa nhà Alpha, 123 Đường Công Nghệ, Cầu Giấy, Hà Nội',
      sellerPhone: '024 3838 9999',
      sellerBankAccount: '19031234567890 - Techcombank (CN Thăng Long)',
      customerName: 'CÔNG TY CỔ PHẦN DƯỢC PHẨM HOA SEN',
      customerTaxCode: '0105556666',
      customerEmail: 'ketoan@duochoasen.vn',
      customerAddress: 'Số 10 Phố Cũ, Ba Đình, Hà Nội (Địa chỉ cũ)',
      paymentMethod: 'Chuyển khoản (TM/CK)',
      totalAmount: new Prisma.Decimal(12000000),
      vatAmount: new Prisma.Decimal(1200000),
      vatRate: 10,
      notes: 'Hóa đơn bị thay thế do khách hàng thay đổi địa chỉ đăng ký kinh doanh mới',
      items: {
        create: [
          {
            description: 'Dịch vụ bảo trì phần mềm kế toán năm 2026',
            unit: 'Năm',
            quantity: new Prisma.Decimal(1),
            unitPrice: new Prisma.Decimal(12000000),
            amount: new Prisma.Decimal(12000000),
          },
        ],
      },
    },
  });

  // 6. HÓA ĐƠN THAY THẾ MỚI #6 (ISSUED - Thay thế cho #5)
  const inv6 = await prisma.invoice.create({
    data: {
      templateCode: '01GTKT3/001',
      zone: '1C26TAA',
      sequenceNumber: 6,
      invoiceNumber: '1C26TAA-0000006',
      status: 'ISSUED',
      issueDate: new Date('2026-08-20T11:00:00.000Z'),
      originalInvoiceId: inv5.id,
      taxDepartment: 'CỤC THUẾ TP. HÀ NỘI',
      sellerName: 'CÔNG TY CỔ PHẦN CÔNG NGHỆ VÀ TRUYỀN THÔNG ALPHA',
      sellerTaxCode: '0101234567',
      sellerAddress: 'Tầng 3, Tòa nhà Alpha, 123 Đường Công Nghệ, Cầu Giấy, Hà Nội',
      sellerPhone: '024 3838 9999',
      sellerBankAccount: '19031234567890 - Techcombank (CN Thăng Long)',
      customerName: 'CÔNG TY CỔ PHẦN DƯỢC PHẨM HOA SEN',
      customerTaxCode: '0105556666',
      customerEmail: 'ketoan@duochoasen.vn',
      customerAddress: 'Tòa nhà Lotus Tower, Số 99 Duy Tân, Cầu Giấy, Hà Nội (Địa chỉ mới cập nhật)',
      paymentMethod: 'Chuyển khoản (TM/CK)',
      totalAmount: new Prisma.Decimal(12000000),
      vatAmount: new Prisma.Decimal(1200000),
      vatRate: 10,
      notes: `Hóa đơn này thay thế cho hóa đơn số ${inv5.invoiceNumber} ngày 18/08/2026 do cập nhật địa chỉ kinh doanh mới`,
      items: {
        create: [
          {
            description: 'Dịch vụ bảo trì phần mềm kế toán năm 2026',
            unit: 'Năm',
            quantity: new Prisma.Decimal(1),
            unitPrice: new Prisma.Decimal(12000000),
            amount: new Prisma.Decimal(12000000),
          },
        ],
      },
    },
  });

  // Liên kết ngược replacedById từ #5 sang #6
  await prisma.invoice.update({
    where: { id: inv5.id },
    data: { replacedById: inv6.id },
  });

  // 7. HÓA ĐƠN DÀI #7 (18 DÒNG HÀNG HÓA - TEST IN ẤN & XUẤT PDF NHIỀU TRANG A4)
  const inv7 = await prisma.invoice.create({
    data: {
      templateCode: '01GTKT3/001',
      zone: '1C26TAA',
      sequenceNumber: 7,
      invoiceNumber: '1C26TAA-0000007',
      status: 'ISSUED',
      issueDate: new Date('2026-08-22T15:30:00.000Z'),
      taxDepartment: 'CỤC THUẾ TP. HÀ NỘI',
      sellerName: 'CÔNG TY CỔ PHẦN CÔNG NGHỆ VÀ TRUYỀN THÔNG ALPHA',
      sellerTaxCode: '0101234567',
      sellerAddress: 'Tầng 3, Tòa nhà Alpha, 123 Đường Công Nghệ, Cầu Giấy, Hà Nội',
      sellerPhone: '024 3838 9999',
      sellerEmail: 'sales@alphatech.vn',
      sellerBankAccount: '19031234567890 - Techcombank (CN Thăng Long)',
      customerName: 'TỔNG CÔNG TY THƯƠNG MẠI VÀ XUẤT NHẬP KHẨU ĐẠI TÍN',
      customerTaxCode: '0107778888',
      customerEmail: 'ketoan@daitin-corp.vn',
      customerAddress: 'Tòa nhà Diamond Plaza, Số 18 Phố Lê Duẩn, Hoàn Kiếm, Hà Nội',
      customerPhone: '024 3999 7777',
      customerBankAccount: '112000045678 - VietinBank (CN Hoàn Kiếm)',
      paymentMethod: 'Chuyển khoản (TM/CK)',
      totalAmount: new Prisma.Decimal(258550000),
      vatAmount: new Prisma.Decimal(25855000),
      vatRate: 10,
      notes: 'Cung cấp gói trang thiết bị CNTT phòng họp và hệ thống máy trạm theo Hợp đồng kinh tế số 88/2026/HĐKT-IT',
      items: {
        create: [
          {
            description: '1. Máy tính để bàn Dell OptiPlex 7090 MT (Core i7/16GB/512GB SSD)',
            unit: 'Bộ',
            quantity: new Prisma.Decimal(5),
            unitPrice: new Prisma.Decimal(18500000),
            amount: new Prisma.Decimal(92500000),
          },
          {
            description: '2. Màn hình máy tính Dell UltraSharp U2422H 23.8 inch IPS Full HD',
            unit: 'Chiếc',
            quantity: new Prisma.Decimal(5),
            unitPrice: new Prisma.Decimal(5800000),
            amount: new Prisma.Decimal(29000000),
          },
          {
            description: '3. Bàn phím cơ không dây văn phòng Logitech MX Mechanical',
            unit: 'Chiếc',
            quantity: new Prisma.Decimal(5),
            unitPrice: new Prisma.Decimal(3200000),
            amount: new Prisma.Decimal(16000000),
          },
          {
            description: '4. Chuột không dây công thái học cao cấp Logitech MX Master 3S',
            unit: 'Chiếc',
            quantity: new Prisma.Decimal(5),
            unitPrice: new Prisma.Decimal(2100000),
            amount: new Prisma.Decimal(10500000),
          },
          {
            description: '5. Bộ lưu điện UPS APC Easy 1000VA / 600W 230V',
            unit: 'Chiếc',
            quantity: new Prisma.Decimal(2),
            unitPrice: new Prisma.Decimal(4500000),
            amount: new Prisma.Decimal(9000000),
          },
          {
            description: '6. Máy in đa năng laser trắng đen HP LaserJet Pro MFP M428fdw',
            unit: 'Chiếc',
            quantity: new Prisma.Decimal(1),
            unitPrice: new Prisma.Decimal(12800000),
            amount: new Prisma.Decimal(12800000),
          },
          {
            description: '7. Máy quét tài liệu 2 mặt tự động Fujitsu ScanSnap iX1600',
            unit: 'Chiếc',
            quantity: new Prisma.Decimal(1),
            unitPrice: new Prisma.Decimal(14500000),
            amount: new Prisma.Decimal(14500000),
          },
          {
            description: '8. Tai nghe không dây chống ồn đàm thoại Jabra Evolve2 65',
            unit: 'Chiếc',
            quantity: new Prisma.Decimal(5),
            unitPrice: new Prisma.Decimal(4200000),
            amount: new Prisma.Decimal(21000000),
          },
          {
            description: '9. Ổ cứng SSD gắn ngoài chống sốc Samsung T7 Shield 1TB USB 3.2',
            unit: 'Chiếc',
            quantity: new Prisma.Decimal(3),
            unitPrice: new Prisma.Decimal(2600000),
            amount: new Prisma.Decimal(7800000),
          },
          {
            description: '10. Cuộn cáp mạng đúc sẵn Cat6 UTP 3 mét Ugreen cao cấp',
            unit: 'Sợi',
            quantity: new Prisma.Decimal(20),
            unitPrice: new Prisma.Decimal(85000),
            amount: new Prisma.Decimal(1700000),
          },
          {
            description: '11. Thanh RAM nâng cấp DDR4 Kingston Fury Beast 16GB 3200MHz',
            unit: 'Thanh',
            quantity: new Prisma.Decimal(4),
            unitPrice: new Prisma.Decimal(1150000),
            amount: new Prisma.Decimal(4600000),
          },
          {
            description: '12. Ổ cứng di động gắn ngoài WD My Passport 2TB 2.5 inch USB 3.0',
            unit: 'Chiếc',
            quantity: new Prisma.Decimal(2),
            unitPrice: new Prisma.Decimal(2150000),
            amount: new Prisma.Decimal(4300000),
          },
          {
            description: '13. Webcam hội nghị truyền hình Logitech C930e Full HD 1080p',
            unit: 'Chiếc',
            quantity: new Prisma.Decimal(3),
            unitPrice: new Prisma.Decimal(2400000),
            amount: new Prisma.Decimal(7200000),
          },
          {
            description: '14. Loa hội nghị không dây 360 độ Jabra Speak 710 MS',
            unit: 'Chiếc',
            quantity: new Prisma.Decimal(1),
            unitPrice: new Prisma.Decimal(6900000),
            amount: new Prisma.Decimal(6900000),
          },
          {
            description: '15. Tủ Rack mạng văn phòng 19 inch 12U cửa lưới sâu 600mm',
            unit: 'Tủ',
            quantity: new Prisma.Decimal(1),
            unitPrice: new Prisma.Decimal(3500000),
            amount: new Prisma.Decimal(3500000),
          },
          {
            description: '16. Bộ chia cổng đa năng Type-C HyperDrive 8-in-1 4K HDMI',
            unit: 'Chiếc',
            quantity: new Prisma.Decimal(5),
            unitPrice: new Prisma.Decimal(1800000),
            amount: new Prisma.Decimal(9000000),
          },
          {
            description: '17. Giá treo tay nâng màn hình công thái học North Bayou F80',
            unit: 'Chiếc',
            quantity: new Prisma.Decimal(5),
            unitPrice: new Prisma.Decimal(450000),
            amount: new Prisma.Decimal(2250000),
          },
          {
            description: '18. Dịch vụ thi công lắp đặt, bấm dây mạng và cấu hình trọn gói',
            unit: 'Gói',
            quantity: new Prisma.Decimal(1),
            unitPrice: new Prisma.Decimal(5000000),
            amount: new Prisma.Decimal(5000000),
          },
        ],
      },
    },
  });

  console.log('✅ Đã nạp thành công 7 hóa đơn mẫu (bao gồm hóa đơn dài 18 mục):');
  console.log(`  1. [ISSUED]   ${inv1.invoiceNumber} - ${inv1.customerName}`);
  console.log(`  2. [ISSUED]   ${inv2.invoiceNumber} - ${inv2.customerName}`);
  console.log(`  3. [DRAFT]    ${inv3.invoiceNumber} - ${inv3.customerName}`);
  console.log(`  4. [CANCELED] ${inv4.invoiceNumber} - ${inv4.customerName}`);
  console.log(`  5. [REPLACED] ${inv5.invoiceNumber} - ${inv5.customerName}`);
  console.log(`  6. [ISSUED-REPLACEMENT] ${inv6.invoiceNumber} - ${inv6.customerName} (Thay thế cho #5)`);
  console.log(`  7. [ISSUED-LONG-18ITEMS] ${inv7.invoiceNumber} - ${inv7.customerName} (284.405.000 ₫)`);
}

main()
  .catch((e) => {
    console.error('❌ Lỗi khi nạp dữ liệu mẫu:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
