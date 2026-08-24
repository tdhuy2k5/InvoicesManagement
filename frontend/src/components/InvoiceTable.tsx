import React from 'react';
import { useInvoiceTableActions } from '../hooks/useInvoiceTableActions';
import { InvoiceStatus } from './InvoiceHeaderDetail';

export type { InvoiceStatus };

export interface InvoiceRowItem {
  id: string;
  invoiceNumber: string;
  templateCode?: string;
  zone?: string;
  issueDate?: string | null;
  createdAt: string;
  customerName?: string | null;
  customerTaxCode?: string | null;
  sellerName?: string | null;
  sellerTaxCode?: string | null;
  totalAmount: number;
  vatRate: number;
  status: InvoiceStatus;
  originalInvoiceId?: string | null;
  replacedById?: string | null;
  taxAuthorityCode?: string | null;
}

export interface InvoiceTableProps {
  invoices?: InvoiceRowItem[];
  selectedId?: string | null;
  isLoading?: boolean;
  currentPage?: number;
  totalPages?: number;
  pageSize?: number;
  totalItems?: number;
  onSelectInvoice?: (invoice: InvoiceRowItem | null) => void;
  onViewDetail?: (id: string) => void;
  onEditDraft?: (id: string) => void;
  onCloneInvoice?: (id: string) => void;
  onOpenDeleteModal?: (invoice: InvoiceRowItem) => void;
  onOpenCancelModal?: (invoice: InvoiceRowItem) => void;
  onOpenReplaceModal?: (invoice: InvoiceRowItem) => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

export { useInvoiceTableActions };

/**
 * InvoiceTable
 * Interactive Data Table & Pagination displaying full Seller & Buyer details.
 */
export const InvoiceTable: React.FC<InvoiceTableProps> = ({
  invoices = [],
  selectedId = null,
  isLoading = false,
  currentPage = 1,
  totalPages = 1,
  pageSize = 20,
  totalItems = 0,
  onSelectInvoice,
  onViewDetail,
  onEditDraft,
  onCloneInvoice,
  onOpenDeleteModal,
  onOpenCancelModal,
  onOpenReplaceModal,
  onPageChange,
  onPageSizeChange,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const renderStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case 'DRAFT':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold font-mono bg-blue-50 text-blue-700 border border-blue-200">
            DRAFT
          </span>
        );
      case 'ISSUED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
            ISSUED
          </span>
        );
      case 'REPLACED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold font-mono bg-amber-50 text-amber-700 border border-amber-200">
            REPLACED
          </span>
        );
      case 'CANCELED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold font-mono bg-rose-50 text-rose-700 border border-rose-200">
            CANCELED
          </span>
        );
      default:
        return <span className="text-xs text-on-surface-variant font-mono">{status}</span>;
    }
  };

  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="overflow-hidden flex flex-col w-full">
      {/* Table Container */}
      <div className="overflow-x-auto w-full custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-[1100px]">
          <thead>
            <tr className="border-b border-outline-variant bg-surface-container-lowest">
              <th className="py-3 px-4 w-12 text-center">
                <span className="sr-only">Chọn</span>
              </th>
              <th className="py-3 px-4 font-label-md text-label-md text-on-surface-variant min-w-[140px]">SỐ HÓA ĐƠN</th>
              <th className="py-3 px-4 font-label-md text-label-md text-on-surface-variant min-w-[110px]">NGÀY LẬP</th>
              <th className="py-3 px-4 font-label-md text-label-md text-on-surface-variant min-w-[220px]">BÊN BÁN (ĐƠN VỊ XUẤT)</th>
              <th className="py-3 px-4 font-label-md text-label-md text-on-surface-variant min-w-[220px]">BÊN MUA (KHÁCH HÀNG)</th>
              <th className="py-3 px-4 font-label-md text-label-md text-on-surface-variant text-right min-w-[130px]">TỔNG TIỀN (₫)</th>
              <th className="py-3 px-4 font-label-md text-label-md text-on-surface-variant text-right w-24">THUẾ GTGT</th>
              <th className="py-3 px-4 font-label-md text-label-md text-on-surface-variant min-w-[120px]">TRẠNG THÁI</th>
            </tr>
          </thead>
          <tbody className={`font-tabular-nums text-tabular-nums ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-on-surface-variant font-body-md">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-4xl text-outline">inbox</span>
                    <span>Không tìm thấy hóa đơn nào phù hợp.</span>
                  </div>
                </td>
              </tr>
            ) : (
              invoices.map((inv) => {
                const isSelected = selectedId === inv.id;
                const isStrikethrough = inv.status === 'REPLACED' || inv.status === 'CANCELED';

                return (
                  <tr
                    key={inv.id}
                    onClick={() => onSelectInvoice?.(isSelected ? null : inv)}
                    className={`border-b border-outline-variant hover:bg-[#F1F5F9] transition-colors cursor-pointer group ${
                      isSelected ? 'bg-surface-container-low' : ''
                    }`}
                  >
                    <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onSelectInvoice?.(isSelected ? null : inv)}
                        className="rounded border-outline-variant text-primary focus:ring-primary cursor-pointer"
                      />
                    </td>
                    <td
                      className={`py-3 px-4 font-medium ${
                        isStrikethrough
                          ? 'text-on-surface-variant line-through'
                          : 'text-primary font-mono font-semibold'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewDetail?.(inv.id);
                      }}
                    >
                      <div className="hover:underline cursor-pointer">{inv.invoiceNumber}</div>
                      {inv.taxAuthorityCode && (
                        <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-normal font-mono flex items-center gap-0.5 mt-0.5 no-underline">
                          <span className="material-symbols-outlined text-[12px]">account_balance</span>
                          <span>{inv.taxAuthorityCode}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-on-surface-variant text-xs font-mono">
                      {formatDate(inv.issueDate || inv.createdAt)}
                    </td>
                    {/* BÊN BÁN */}
                    <td className="py-3 px-4">
                      <div
                        className="text-on-surface font-medium truncate max-w-[240px] text-xs"
                        title={inv.sellerName || '- Chưa nhập -'}
                      >
                        {inv.sellerName || '- Chưa nhập -'}
                      </div>
                      <div className="text-on-surface-variant text-[11px] font-mono mt-0.5">
                        MST: <span className="font-semibold text-gray-700">{inv.sellerTaxCode || '-'}</span>
                      </div>
                    </td>
                    {/* BÊN MUA */}
                    <td className="py-3 px-4">
                      <div
                        className="text-on-surface font-medium truncate max-w-[240px] text-xs"
                        title={inv.customerName || '- Chưa nhập -'}
                      >
                        {inv.customerName || '- Chưa nhập -'}
                      </div>
                      <div className="text-on-surface-variant text-[11px] font-mono mt-0.5">
                        MST: <span className="font-semibold text-gray-700">{inv.customerTaxCode || '-'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right text-on-surface font-bold font-mono">
                      {formatCurrency(inv.totalAmount)}
                    </td>
                    <td className="py-3 px-4 text-right text-on-surface-variant text-xs">
                      {inv.vatRate}%
                    </td>
                    <td className="py-3 px-4">{renderStatusBadge(inv.status)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="border-t border-outline-variant p-stack-md flex flex-col sm:flex-row justify-between items-center gap-4 bg-surface-container-lowest">
        <div className="font-body-sm text-body-sm text-on-surface-variant">
          Hiển thị {startIndex} - {endIndex} trong tổng số{' '}
          <span className="font-semibold text-on-surface">
            {new Intl.NumberFormat('vi-VN').format(totalItems)}
          </span>{' '}
          hóa đơn
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-body-sm text-body-sm text-on-surface-variant">Số dòng:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
              className="bg-surface border border-outline-variant rounded px-2 py-1 font-body-sm text-on-surface focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => onPageChange?.(currentPage - 1)}
              className="p-1 rounded border border-outline-variant text-on-surface-variant hover:bg-surface-container-low disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Trang trước"
            >
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>

            <span className="font-body-sm text-body-sm text-on-surface px-2">
              Trang {currentPage} / {totalPages}
            </span>

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange?.(currentPage + 1)}
              className="p-1 rounded border border-outline-variant text-on-surface-variant hover:bg-surface-container-low disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Trang sau"
            >
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceTable;
