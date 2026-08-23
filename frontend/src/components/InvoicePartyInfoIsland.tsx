import React from 'react';

export interface SellerDetails {
  sellerName?: string;
  sellerTaxCode?: string;
  sellerAddress?: string;
  sellerPhone?: string;
  sellerEmail?: string;
  sellerBankAccount?: string;
}

export interface CustomerDetails {
  customerName?: string;
  customerTaxCode?: string;
  customerAddress?: string;
  customerPhone?: string;
  customerEmail?: string;
  customerRepresentative?: string;
  paymentMethod?: string;
}

export interface InvoicePartyInfoIslandProps {
  // Support nested objects
  seller?: SellerDetails;
  customer?: CustomerDetails;

  // Support direct flattened props matching Prisma schema
  sellerName?: string;
  sellerTaxCode?: string;
  sellerAddress?: string;
  sellerPhone?: string;
  sellerEmail?: string;
  sellerBankAccount?: string;

  customerName?: string;
  customerTaxCode?: string;
  customerAddress?: string;
  customerPhone?: string;
  customerEmail?: string;
  customerRepresentative?: string;
  paymentMethod?: string;

  className?: string;
}

/**
 * InvoicePartyInfoIsland
 * Seller (Bên Bán) and Buyer (Bên Mua) legal business profile cards.
 * Matches graph-master.cypher: `:SharedIsland { id: "InvoicePartyInfoIsland" }`
 * Mounted on: `InvoiceDetail` (`/invoices/:id`)
 */
export const InvoicePartyInfoIsland: React.FC<InvoicePartyInfoIslandProps> = ({
  seller,
  customer,
  sellerName = seller?.sellerName || 'CÔNG TY CỔ PHẦN CÔNG NGHỆ VÀ TRUYỀN THÔNG ALPHA',
  sellerTaxCode = seller?.sellerTaxCode || '0101234567',
  sellerAddress = seller?.sellerAddress || 'Tầng 3, Tòa nhà Alpha, 123 Đường Công Nghệ, Cầu Giấy, Hà Nội',
  sellerPhone = seller?.sellerPhone || '024 3838 9999',
  sellerEmail = seller?.sellerEmail || 'contact@alphatech.vn',
  sellerBankAccount = seller?.sellerBankAccount || '19031234567890 - Techcombank (CN Thăng Long)',
  customerName = customer?.customerName || 'CÔNG TY TNHH GIẢI PHÁP SỐ TOÀN CẦU',
  customerTaxCode = customer?.customerTaxCode || '0319876543',
  customerAddress = customer?.customerAddress || '456 Lê Lợi, Phường Bến Nghé, Quận 1, TP. HCM',
  customerPhone = customer?.customerPhone || '',
  customerEmail = customer?.customerEmail || 'contact@globalsolutions.vn',
  customerRepresentative = customer?.customerRepresentative || 'Trần Thị Bích Ngọc',
  paymentMethod = customer?.paymentMethod || 'Chuyển khoản (TM/CK)',
  className = '',
}) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-stack-md ${className}`}>
      {/* Seller Info Card */}
      <div className="bg-surface border border-outline-variant rounded-lg p-stack-md shadow-sm">
        <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-3 border-b border-outline-variant pb-2 flex items-center justify-between">
          <span>Thông Tin Người Bán</span>
          <span className="material-symbols-outlined text-[18px] text-on-surface-variant">storefront</span>
        </h3>
        <div className="space-y-2 font-body-sm text-body-sm">
          <p className="font-bold text-primary">{sellerName}</p>
          <div className="grid grid-cols-[80px_1fr] gap-2">
            <span className="text-on-surface-variant">MST:</span>
            <span className="font-tabular-nums text-primary font-medium">{sellerTaxCode}</span>
          </div>
          <div className="grid grid-cols-[80px_1fr] gap-2">
            <span className="text-on-surface-variant">Địa chỉ:</span>
            <span className="text-primary">{sellerAddress}</span>
          </div>
          {(sellerPhone || sellerEmail) && (
            <div className="grid grid-cols-[80px_1fr] gap-2">
              <span className="text-on-surface-variant">Liên hệ:</span>
              <span className="text-primary">
                {sellerPhone}
                {sellerPhone && sellerEmail ? ' | ' : ''}
                {sellerEmail}
              </span>
            </div>
          )}
          {sellerBankAccount && (
            <div className="grid grid-cols-[80px_1fr] gap-2">
              <span className="text-on-surface-variant">STK:</span>
              <span className="text-primary font-tabular-nums">{sellerBankAccount}</span>
            </div>
          )}
        </div>
      </div>

      {/* Buyer Info Card */}
      <div className="bg-surface border border-outline-variant rounded-lg p-stack-md shadow-sm">
        <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-3 border-b border-outline-variant pb-2 flex items-center justify-between">
          <span>Thông Tin Người Mua</span>
          <span className="material-symbols-outlined text-[18px] text-on-surface-variant">business</span>
        </h3>
        <div className="space-y-2 font-body-sm text-body-sm">
          <p className="font-bold text-primary">{customerName}</p>
          <div className="grid grid-cols-[80px_1fr] gap-2">
            <span className="text-on-surface-variant">MST:</span>
            <span className="font-tabular-nums text-primary font-medium">{customerTaxCode}</span>
          </div>
          <div className="grid grid-cols-[80px_1fr] gap-2">
            <span className="text-on-surface-variant">Địa chỉ:</span>
            <span className="text-primary">{customerAddress}</span>
          </div>
          {(customerRepresentative || customerEmail || customerPhone) && (
            <div className="grid grid-cols-[80px_1fr] gap-2">
              <span className="text-on-surface-variant">Liên hệ:</span>
              <span className="text-primary">
                {customerRepresentative}
                {customerRepresentative && (customerEmail || customerPhone) ? ' - ' : ''}
                {customerPhone || customerEmail}
              </span>
            </div>
          )}
          <div className="grid grid-cols-[80px_1fr] gap-2">
            <span className="text-on-surface-variant">HTTT:</span>
            <span className="text-primary">{paymentMethod}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePartyInfoIsland;
