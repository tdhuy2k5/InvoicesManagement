import React from 'react';
import { InvoiceItem } from '../mockData';
import { convertVndToWords } from './InvoiceSummary';

export interface InvoiceVatTemplateProps {
  templateCode?: string;
  serialNumber?: string;
  invoiceNumber?: string;
  sequenceNumber?: number;
  issueDate?: string | null;
  createdAt?: string;
  copyType?: 'LIEN_1' | 'LIEN_2' | 'LIEN_3';

  // Tax Department
  taxDepartment?: string;

  // Seller
  sellerName?: string;
  sellerTaxCode?: string;
  sellerAddress?: string;
  sellerPhone?: string;
  sellerBankAccount?: string;

  // Buyer
  customerName?: string;
  customerTaxCode?: string;
  customerAddress?: string;
  customerBankAccount?: string;
  paymentMethod?: string;

  // Items & Amounts
  items?: InvoiceItem[];
  subtotalAmount?: number;
  vatRate?: number;
  vatAmount?: number;
  totalAmount?: number;
  amountInWords?: string;

  // Status & Digital Signature
  isSigned?: boolean;
  signerName?: string;
  signedAt?: string;
  originalInvoiceId?: string | null;
  cancelReason?: string | null;
  taxAuthorityCode?: string | null;
  status?: string;

  className?: string;
}

/**
 * Renders individual characters of a Tax Code into distinct boxed cells [ ][ ][ ]
 */
export const TaxCodeBoxes: React.FC<{ taxCode?: string }> = ({ taxCode = '' }) => {
  const cleanCode = taxCode.replace(/[^0-9A-Za-z]/g, '');
  const mainPart = cleanCode.slice(0, 10).padEnd(10, ' ').split('');
  const subPart = cleanCode.slice(10, 13).padEnd(3, ' ').split('');

  return (
    <div className="inline-flex items-center gap-1.5 font-mono select-none">
      <div className="flex border border-gray-800 bg-white">
        {mainPart.map((char, i) => (
          <span
            key={i}
            className="w-5 h-5 flex items-center justify-center border-r last:border-r-0 border-gray-400 text-xs font-bold text-gray-900"
          >
            {char.trim()}
          </span>
        ))}
      </div>
      <span className="text-gray-600 font-bold">-</span>
      <div className="flex border border-gray-800 bg-white">
        {subPart.map((char, i) => (
          <span
            key={i}
            className="w-5 h-5 flex items-center justify-center border-r last:border-r-0 border-gray-400 text-xs font-bold text-gray-900"
          >
            {char.trim()}
          </span>
        ))}
      </div>
    </div>
  );
};

/**
 * InvoiceVatTemplate
 * Chuẩn biểu mẫu Hóa đơn Giá trị gia tăng (Mẫu 01GTKT3/001 theo quy định Thuế Việt Nam)
 * Hỗ trợ Watermark phân biệt rõ ràng giữa DRAFT (Bản Nháp), ISSUED (Đã ký số) và CANCELED (Đã hủy).
 */
export const InvoiceVatTemplate: React.FC<InvoiceVatTemplateProps> = ({
  templateCode = '01GTKT3/001',
  serialNumber = '1C26TAA',
  invoiceNumber = '0000001',
  sequenceNumber,
  issueDate,
  createdAt,
  copyType = 'LIEN_1',
  taxDepartment = 'CỤC THUẾ TP. HÀ NỘI',
  sellerName = '',
  sellerTaxCode = '',
  sellerAddress = '',
  sellerPhone = '',
  sellerBankAccount = '',
  customerName = '',
  customerTaxCode = '',
  customerAddress = '',
  customerBankAccount = '',
  paymentMethod = 'Chuyển khoản (TM/CK)',
  items = [],
  subtotalAmount,
  vatRate = 10,
  vatAmount,
  totalAmount,
  amountInWords,
  isSigned = false,
  signerName,
  signedAt,
  originalInvoiceId,
  taxAuthorityCode,
  status = 'DRAFT',
  className = '',
}) => {
  const isDraft = status === 'DRAFT' || (!isSigned && status !== 'ISSUED' && status !== 'REPLACED');
  const isIssued = status === 'ISSUED';
  const isCanceled = status === 'CANCELED';
  const isReplaced = status === 'REPLACED';

  // Format numeric date components
  const activeDate = issueDate ? new Date(issueDate) : (createdAt ? new Date(createdAt) : new Date());
  const dayStr = String(activeDate.getDate()).padStart(2, '0');
  const monthStr = String(activeDate.getMonth() + 1).padStart(2, '0');
  const yearStr = String(activeDate.getFullYear());

  // Number formatters
  const formatMoney = (amount?: number) => {
    if (amount === undefined || amount === null || isNaN(amount)) return '0';
    return new Intl.NumberFormat('vi-VN').format(Math.round(amount));
  };

  // Compute calculated amounts if not passed
  const calcSubtotal = subtotalAmount !== undefined
    ? subtotalAmount
    : items.reduce((acc, it) => acc + (Number(it.amount) || 0), 0);
  const calcVat = vatAmount !== undefined
    ? vatAmount
    : (vatRate > 0 ? Math.round((calcSubtotal * vatRate) / 100) : 0);
  const calcTotal = totalAmount !== undefined
    ? totalAmount
    : (calcSubtotal + calcVat);
  const words = amountInWords || convertVndToWords(calcTotal);

  // Clean invoice number to 7-digit display
  const displayNo = sequenceNumber !== undefined
    ? String(sequenceNumber).padStart(7, '0')
    : invoiceNumber.replace(/[^\d]/g, '').padStart(7, '0') || '0000001';

  // Copy title helper
  const getCopyTitle = () => {
    switch (copyType) {
      case 'LIEN_2':
        return 'Liên 2: Giao người mua';
      case 'LIEN_3':
        return 'Liên 3: Nội bộ';
      case 'LIEN_1':
      default:
        return 'Liên 1: Lưu';
    }
  };

  // Ensure table has at least 5 rows for authentic paper template feel
  const minRows = 5;
  const blankRowsCount = Math.max(0, minRows - items.length);

  return (
    <div
      id="printable-invoice-paper"
      style={{
        fontFamily: "'Times New Roman', Times, 'Liberation Serif', serif",
        letterSpacing: 'normal',
      }}
      className={`relative bg-white text-gray-900 p-6 sm:p-10 max-w-[850px] mx-auto border border-gray-400 shadow-lg text-[13px] leading-snug print:border-none print:shadow-none print:p-0 print:m-0 print:max-w-none print:w-full select-text overflow-hidden ${className}`}
    >
      {/* WATERMARK SECTION (DRAFT / CANCELED) */}
      {isDraft && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-10 opacity-[0.14] overflow-hidden">
          <div className="transform -rotate-45 text-center border-8 border-dashed border-gray-900 p-8 rounded-3xl">
            <div className="text-5xl sm:text-7xl font-bold uppercase tracking-widest text-gray-900">
              DRAFT
            </div>
            <div className="text-xl sm:text-2xl font-bold uppercase tracking-wider text-gray-800 mt-2">
              (BẢN NHÁP - CHƯA CÓ GIÁ TRỊ PHÁP LÝ)
            </div>
          </div>
        </div>
      )}

      {isCanceled && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-10 opacity-[0.18] overflow-hidden">
          <div className="transform -rotate-45 text-center border-8 border-dashed border-red-700 p-8 rounded-3xl">
            <div className="text-5xl sm:text-7xl font-bold uppercase tracking-widest text-red-700">
              CANCELED
            </div>
            <div className="text-xl sm:text-2xl font-bold uppercase tracking-wider text-red-800 mt-2">
              (HÓA ĐƠN ĐÃ HỦY)
            </div>
          </div>
        </div>
      )}

      {/* Top Meta Line */}
      <div className="flex justify-between items-start border-b border-gray-900 pb-2 mb-3">
        <div className="text-xs uppercase font-sans font-bold tracking-wide text-gray-800">
          TÊN CỤC THUẾ: <span className="font-serif normal-case">{taxDepartment}</span>
        </div>
        <div className="text-right text-xs space-y-0.5 font-sans">
          <div>
            Mẫu số: <span className="font-bold font-mono text-gray-900">{templateCode}</span>
          </div>
          <div>
            Ký hiệu: <span className="font-bold font-mono text-gray-900">{serialNumber}</span>
          </div>
          <div>
            Số: <span className="font-bold font-mono text-red-600 text-sm tracking-wider">{displayNo}</span>
          </div>
          {taxAuthorityCode && (
            <div>
              Mã CQT: <span className="font-bold font-mono text-emerald-700 text-xs tracking-wider">{taxAuthorityCode}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Title & Issue Date */}
      <div className="text-center my-3">
        <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-wider text-gray-900">
          HÓA ĐƠN GIÁ TRỊ GIA TĂNG
        </h1>
        <div className="text-xs font-semibold text-gray-700 italic mt-0.5">
          {getCopyTitle()}
          {isDraft && <span className="text-amber-700 font-bold not-italic ml-2">(DRAFT - XEM TRƯỚC)</span>}
        </div>
        <div className="text-xs italic text-gray-800 mt-1">
          Ngày {dayStr} tháng {monthStr} năm {yearStr}
        </div>
      </div>

      {/* Replacement Notice Banner */}
      {originalInvoiceId && (
        <div className="bg-amber-50 border border-amber-300 text-amber-900 text-xs px-3 py-1.5 rounded mb-3 text-center italic">
          ⚠️ <em>Hóa đơn này thay thế cho hóa đơn gốc mã định danh #{originalInvoiceId}</em>
        </div>
      )}

      {/* SELLER SECTION */}
      <div className="border border-gray-800 rounded p-3 mb-3 bg-white space-y-1.5">
        <div className="flex items-baseline">
          <span className="w-28 shrink-0 font-bold">Tên người bán:</span>
          <span className="font-bold text-gray-900 uppercase">{sellerName || '......................................................................................'}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-28 shrink-0 font-bold">Mã số thuế:</span>
          <TaxCodeBoxes taxCode={sellerTaxCode} />
        </div>
        <div className="flex items-baseline">
          <span className="w-28 shrink-0 font-bold">Địa chỉ:</span>
          <span className="text-gray-800">{sellerAddress || '......................................................................................'}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="flex items-baseline">
            <span className="w-28 shrink-0 font-bold">Điện thoại:</span>
            <span className="font-mono">{sellerPhone || '......................'}</span>
          </div>
          <div className="flex items-baseline">
            <span className="w-24 shrink-0 font-bold">Số tài khoản:</span>
            <span className="font-mono text-gray-900">{sellerBankAccount || '......................'}</span>
          </div>
        </div>
      </div>

      {/* BUYER SECTION */}
      <div className="border border-gray-800 rounded p-3 mb-3 bg-white space-y-1.5">
        <div className="flex items-baseline">
          <span className="w-28 shrink-0 font-bold">Tên người mua:</span>
          <span className="font-bold text-gray-900 uppercase">{customerName || '......................................................................................'}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-28 shrink-0 font-bold">Mã số thuế:</span>
          {customerTaxCode ? (
            <TaxCodeBoxes taxCode={customerTaxCode} />
          ) : (
            <span className="italic text-gray-500 text-xs">(Không có MST)</span>
          )}
        </div>
        <div className="flex items-baseline">
          <span className="w-28 shrink-0 font-bold">Địa chỉ:</span>
          <span className="text-gray-800">{customerAddress || '......................................................................................'}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="flex items-baseline">
            <span className="w-28 shrink-0 font-bold">Hình thức TT:</span>
            <span className="text-gray-900">{paymentMethod}</span>
          </div>
          {customerBankAccount && (
            <div className="flex items-baseline">
              <span className="w-24 shrink-0 font-bold">Số tài khoản:</span>
              <span className="font-mono text-gray-900">{customerBankAccount}</span>
            </div>
          )}
        </div>
      </div>

      {/* ITEMS TABLE */}
      <div className="mb-3 overflow-x-auto">
        <table className="w-full border-collapse border border-gray-800 text-xs">
          <thead>
            <tr className="bg-gray-100 font-bold text-center border-b border-gray-800">
              <th className="border-r border-gray-800 p-1.5 w-10">
                STT<br />
                <span className="font-normal text-[10px]">(1)</span>
              </th>
              <th className="border-r border-gray-800 p-1.5 text-left">
                Tên hàng hóa, dịch vụ<br />
                <span className="font-normal text-[10px]">(2)</span>
              </th>
              <th className="border-r border-gray-800 p-1.5 w-16">
                Đơn vị tính<br />
                <span className="font-normal text-[10px]">(3)</span>
              </th>
              <th className="border-r border-gray-800 p-1.5 w-16">
                Số lượng<br />
                <span className="font-normal text-[10px]">(4)</span>
              </th>
              <th className="border-r border-gray-800 p-1.5 w-24">
                Đơn giá<br />
                <span className="font-normal text-[10px]">(5)</span>
              </th>
              <th className="p-1.5 w-28 text-right">
                Thành tiền<br />
                <span className="font-normal text-[10px]">(6=4x5)</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-300">
            {items.map((item, idx) => (
              <tr key={item.id ?? idx} className="hover:bg-gray-50/50">
                <td className="border-r border-gray-800 p-1.5 text-center font-mono">{idx + 1}</td>
                <td className="border-r border-gray-800 p-1.5 break-words font-medium">{item.description}</td>
                <td className="border-r border-gray-800 p-1.5 text-center">{item.unit}</td>
                <td className="border-r border-gray-800 p-1.5 text-right font-mono">{formatMoney(item.quantity)}</td>
                <td className="border-r border-gray-800 p-1.5 text-right font-mono">{formatMoney(item.unitPrice)}</td>
                <td className="p-1.5 text-right font-mono font-semibold">{formatMoney(item.amount)}</td>
              </tr>
            ))}
            {/* Blank filler rows */}
            {Array.from({ length: blankRowsCount }).map((_, bIdx) => (
              <tr key={`blank-${bIdx}`} className="h-6">
                <td className="border-r border-gray-800 p-1.5 text-center font-mono text-gray-300">
                  {items.length + bIdx + 1}
                </td>
                <td className="border-r border-gray-800 p-1.5"></td>
                <td className="border-r border-gray-800 p-1.5"></td>
                <td className="border-r border-gray-800 p-1.5"></td>
                <td className="border-r border-gray-800 p-1.5"></td>
                <td className="p-1.5"></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* SUMMARY TOTALS BLOCK */}
      <div className="border border-gray-800 rounded p-3 mb-4 space-y-1 text-xs">
        <div className="flex justify-between items-baseline border-b border-dashed border-gray-300 pb-1">
          <span className="font-bold">Cộng tiền hàng:</span>
          <span className="font-mono font-bold text-gray-900">{formatMoney(calcSubtotal)} ₫</span>
        </div>
        <div className="flex justify-between items-baseline border-b border-dashed border-gray-300 pb-1">
          <div>
            <span className="font-bold">Thuế suất GTGT: </span>
            <span className="font-bold text-gray-900">{vatRate}%</span>
          </div>
          <div>
            <span className="font-bold">Tiền thuế GTGT: </span>
            <span className="font-mono font-bold text-gray-900">{formatMoney(calcVat)} ₫</span>
          </div>
        </div>
        <div className="flex justify-between items-baseline pt-1">
          <span className="font-bold text-sm uppercase">Tổng cộng tiền thanh toán:</span>
          <span className="font-mono font-bold text-base text-red-600">{formatMoney(calcTotal)} ₫</span>
        </div>
        <div className="italic text-gray-800 pt-1 border-t border-gray-300">
          Số tiền viết bằng chữ: <span className="font-bold not-italic text-gray-900">{words}</span>
        </div>
      </div>

      {/* SIGNATURE SECTION */}
      <div className="grid grid-cols-2 gap-6 my-6 pt-2 select-none">
        <div className="text-center">
          <div className="font-bold uppercase text-xs">NGƯỜI MUA HÀNG</div>
          <div className="text-[11px] italic text-gray-600">(Ký, ghi rõ họ, tên)</div>
          <div className="h-24"></div>
        </div>

        <div className="text-center relative">
          <div className="font-bold uppercase text-xs">NGƯỜI BÁN HÀNG</div>
          <div className="text-[11px] italic text-gray-600">(Ký, đóng dấu, ghi rõ họ, tên)</div>

          {/* Digital Signature Seal */}
          {(isSigned || isIssued || isReplaced) ? (
            <div className="my-2 mx-auto w-56 border-2 border-red-600 text-red-600 p-2 rounded bg-red-50/60 rotate-[-1deg] shadow-sm text-left">
              <div className="font-bold text-[11px] uppercase border-b border-red-400 pb-0.5 text-center flex items-center justify-center gap-1">
                <span>✓</span>
                <span>ĐÃ KÝ ĐIỆN TỬ</span>
              </div>
              <div className="text-[10px] font-semibold mt-1 leading-tight line-clamp-2">{signerName || sellerName}</div>
              <div className="text-[9px] mt-0.5 opacity-90 font-mono">
                Ngày: {signedAt || activeDate.toLocaleString('vi-VN')}
              </div>
            </div>
          ) : (
            <div className="h-24 flex items-center justify-center text-xs text-amber-700 italic border border-dashed border-amber-300 rounded m-2 bg-amber-50/50">
              (Chưa ký điện tử - Bản Nháp)
            </div>
          )}
        </div>
      </div>

      <div className="text-center text-[11px] italic text-gray-600 my-2">
        (Cần kiểm tra, đối chiếu khi lập, giao, nhận hóa đơn)
      </div>

      {/* FOOTER COPIES NOTE */}
      <div className="border-t border-gray-800 pt-2 mt-4 text-[11px] text-gray-700 font-sans">
        <div className="font-bold">Ghi chú:</div>
        <div className="flex flex-wrap gap-4 mt-0.5">
          <span>- Liên 1: Lưu</span>
          <span>- Liên 2: Giao người mua</span>
          <span>- Liên 3: Nội bộ</span>
        </div>
      </div>
    </div>
  );
};

export default InvoiceVatTemplate;
