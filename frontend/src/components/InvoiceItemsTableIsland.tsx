import React from 'react';

export interface InvoiceItemRow {
  id?: number | string;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface InvoiceItemsTableIslandProps {
  items?: InvoiceItemRow[];
  emptyMessage?: string;
  className?: string;
}

/**
 * InvoiceItemsTableIsland
 * Itemized goods and services table component for Invoice Detail and Preview.
 * Matches graph-master.cypher: `:SharedIsland { id: "InvoiceItemsTableIsland" }`
 * Mounted on: `InvoiceDetail` (`/invoices/:id`)
 */
export const InvoiceItemsTableIsland: React.FC<InvoiceItemsTableIslandProps> = ({
  items = [
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
  emptyMessage = 'Chưa có dòng hàng hóa / dịch vụ nào.',
  className = '',
}) => {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  return (
    <div className={`bg-surface border border-outline-variant rounded-lg overflow-hidden flex flex-col shadow-sm ${className}`}>
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left font-body-sm text-body-sm whitespace-nowrap">
          <thead className="bg-surface-container-low font-label-md text-label-md text-on-surface-variant border-b border-outline-variant">
            <tr>
              <th scope="col" className="p-3 w-12 text-center">STT</th>
              <th scope="col" className="p-3">Tên Hàng Hóa / Dịch Vụ</th>
              <th scope="col" className="p-3 w-20 text-center">ĐVT</th>
              <th scope="col" className="p-3 w-24 text-right">Số Lượng</th>
              <th scope="col" className="p-3 w-32 text-right">Đơn Giá (₫)</th>
              <th scope="col" className="p-3 w-32 text-right">Thành Tiền (₫)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/50">
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-on-surface-variant italic">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              items.map((item, idx) => (
                <tr
                  key={item.id ?? idx}
                  className="hover:bg-surface-container-lowest transition-colors"
                >
                  <td className="p-3 text-center text-on-surface-variant font-tabular-nums">
                    {idx + 1}
                  </td>
                  <td className="p-3 text-primary font-medium">
                    {item.description}
                  </td>
                  <td className="p-3 text-center text-on-surface-variant">
                    {item.unit}
                  </td>
                  <td className="p-3 text-right font-tabular-nums text-primary">
                    {formatNumber(item.quantity)}
                  </td>
                  <td className="p-3 text-right font-tabular-nums text-primary">
                    {formatNumber(item.unitPrice)}
                  </td>
                  <td className="p-3 text-right font-tabular-nums font-semibold text-primary">
                    {formatNumber(item.amount)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InvoiceItemsTableIsland;
