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
  customerBankAccount?: string;
  paymentMethod?: string;
}

export interface InvoicePartyInfoProps {
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
  customerBankAccount?: string;
  paymentMethod?: string;

  className?: string;
}

/**
 * InvoicePartyInfo
 * Seller (Bên Bán) and Buyer (Bên Mua) legal business profile cards.
 * Mounted on: `InvoiceDetail` (`/invoices/:id`)
 */
export const InvoicePartyInfo: React.FC<InvoicePartyInfoProps> = ({
  seller,
  customer,
  sellerName = seller?.sellerName || '',
  sellerTaxCode = seller?.sellerTaxCode || '',
  sellerAddress = seller?.sellerAddress || '',
  sellerPhone = seller?.sellerPhone || '',
  sellerEmail = seller?.sellerEmail || '',
  sellerBankAccount = seller?.sellerBankAccount || '',
  customerName = customer?.customerName || '',
  customerTaxCode = customer?.customerTaxCode || '',
  customerAddress = customer?.customerAddress || '',
  customerPhone = customer?.customerPhone || '',
  customerEmail = customer?.customerEmail || '',
  customerRepresentative = customer?.customerRepresentative || '',
  customerBankAccount = customer?.customerBankAccount || '',
  paymentMethod = customer?.paymentMethod || '',
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
          {customerBankAccount && (
            <div className="grid grid-cols-[80px_1fr] gap-2">
              <span className="text-on-surface-variant">STK:</span>
              <span className="text-primary font-tabular-nums">{customerBankAccount}</span>
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

export default InvoicePartyInfo;
