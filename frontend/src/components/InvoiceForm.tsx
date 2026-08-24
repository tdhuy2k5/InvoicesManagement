import React, { useState, useEffect } from 'react';
import { useInvoiceCalculations } from '../hooks/useInvoiceCalculations';
import { convertVndToWords } from '../hooks/useCurrencyToWords';

export type InvoiceFormMode = 'CREATE' | 'EDIT' | 'REPLACE';

export interface FormInvoiceItem {
  id?: string | number;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface InvoiceFormData {
  id?: string | number;
  customerName: string;
  customerTaxCode: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  customerBankAccount?: string;
  paymentMethod: string;
  sellerName: string;
  sellerTaxCode: string;
  sellerAddress: string;
  sellerPhone: string;
  sellerEmail?: string;
  sellerBankAccount: string;
  items: FormInvoiceItem[];
  vatRate: number; // 0, 5, 8, 10, or -1 (KCT - Không chịu thuế)
  vatAmount: number;
  subtotalAmount: number;
  totalAmount: number;
  notes: string;
}

export interface InvoiceFormProps {
  mode?: InvoiceFormMode;
  initialData?: Partial<InvoiceFormData>;
  isSubmitting?: boolean;
  validationError?: string | null;
  onSubmitDraft?: (data: InvoiceFormData) => void;
  onSubmitUpdate?: (id: string | number, data: InvoiceFormData) => void;
  onSubmitReplace?: (id: string | number, data: InvoiceFormData) => void;
  onCancelForm?: () => void;
  className?: string;
}

/**
 * InvoiceForm
 * Dynamic Form Matrix for Creating, Editing, and Replacing Invoices.
 * Mounted on: `InvoiceCreate` (`/invoices/new`), `InvoiceEdit` (`/invoices/:id/edit`), `InvoiceReplace` (`/invoices/:id/replace`)
 * State Mutations:
 * - `recalculateTotals` (executes: calculateInvoiceTotals)
 * - `liveConvertVndToWords` (executes: convertVndToWords)
 * - `submitDraftInvoice` (executes: createDraftInvoice)
 * - `submitUpdateDraft` (executes: updateDraftInvoice)
 * - `submitReplaceInvoice` (executes: replaceInvoice)
 */
export const InvoiceForm: React.FC<InvoiceFormProps> = ({
  mode = 'CREATE',
  initialData,
  isSubmitting = false,
  validationError = null,
  onSubmitDraft,
  onSubmitUpdate,
  onSubmitReplace,
  onCancelForm,
  className = '',
}) => {
  // Buyer Info State
  const [customerName, setCustomerName] = useState(initialData?.customerName || '');
  const [customerTaxCode, setCustomerTaxCode] = useState(initialData?.customerTaxCode || '');
  const [customerPhone, setCustomerPhone] = useState(initialData?.customerPhone || '');
  const [customerEmail, setCustomerEmail] = useState(initialData?.customerEmail || '');
  const [customerAddress, setCustomerAddress] = useState(initialData?.customerAddress || '');
  const [paymentMethod, setPaymentMethod] = useState(initialData?.paymentMethod || 'Chuyển khoản (TM/CK)');

  // Seller Info State (Blank default with placeholders)
  const [sellerName, setSellerName] = useState(initialData?.sellerName || '');
  const [sellerTaxCode, setSellerTaxCode] = useState(initialData?.sellerTaxCode || '');
  const [sellerAddress, setSellerAddress] = useState(initialData?.sellerAddress || '');
  const [sellerBankAccount, setSellerBankAccount] = useState(initialData?.sellerBankAccount || '');
  const [sellerPhone, setSellerPhone] = useState(initialData?.sellerPhone || '');

  // Line Items State (Blank default with placeholders)
  const [items, setItems] = useState<FormInvoiceItem[]>(
    initialData?.items && initialData.items.length > 0
      ? initialData.items
      : [
          {
            id: 'item-1',
            description: '',
            unit: '',
            quantity: 1,
            unitPrice: 0,
            amount: 0,
          },
        ]
  );

  // VAT & Notes State
  const [vatRate, setVatRate] = useState<number>(initialData?.vatRate ?? 10);
  const [notes, setNotes] = useState<string>(initialData?.notes || '');
  const [showDiscardModal, setShowDiscardModal] = useState<boolean>(false);

  // Automatic Totals & Currency-in-words wired to Backend Core Calculation Service
  const { subtotalAmount, vatAmount, totalAmount, amountInWords, calculateLineItem } =
    useInvoiceCalculations(items, vatRate);

  // Handle Item Row Changes
  const handleItemChange = (index: number, field: keyof FormInvoiceItem, value: any) => {
    const updated = [...items];
    const target = { ...updated[index], [field]: value };

    if (field === 'quantity' || field === 'unitPrice') {
      const qty = field === 'quantity' ? Number(value) || 0 : Number(target.quantity) || 0;
      const price = field === 'unitPrice' ? Number(value) || 0 : Number(target.unitPrice) || 0;
      target.amount = calculateLineItem(qty, price);
    }

    updated[index] = target;
    setItems(updated);
  };

  const handleAddItem = () => {
    const newItem: FormInvoiceItem = {
      id: `item-${Date.now()}`,
      description: '',
      unit: 'Gói',
      quantity: 1,
      unitPrice: 0,
      amount: 0,
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      alert('Hóa đơn phải có ít nhất một dòng hàng hóa/dịch vụ.');
      return;
    }
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      alert('Vui lòng nhập Tên đơn vị / Người mua.');
      return;
    }

    const payload: InvoiceFormData = {
      id: initialData?.id,
      customerName,
      customerTaxCode,
      customerPhone,
      customerEmail,
      customerAddress,
      paymentMethod,
      sellerName,
      sellerTaxCode,
      sellerAddress,
      sellerPhone,
      sellerBankAccount,
      items,
      vatRate,
      vatAmount,
      subtotalAmount,
      totalAmount,
      notes,
    };

    if (mode === 'CREATE') {
      onSubmitDraft?.(payload);
    } else if (mode === 'EDIT' && initialData?.id) {
      onSubmitUpdate?.(initialData.id, payload);
    } else if (mode === 'REPLACE' && initialData?.id) {
      onSubmitReplace?.(initialData.id, payload);
    } else {
      onSubmitDraft?.(payload);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN').format(val);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex flex-col h-full overflow-hidden bg-background ${validationError ? 'animate-[shake_0.3s_ease-in-out]' : ''} ${className}`}
    >
      {/* Scrollable Content Container */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-stack-md md:p-gutter">
        <div className="max-w-[1200px] mx-auto space-y-stack-lg">
          {/* Validation Error Banner */}
          {validationError && (
            <div className="bg-error-container text-on-error-container p-4 rounded-xl border border-error/30 flex items-center gap-3">
              <span className="material-symbols-outlined text-error">error</span>
              <span className="font-body-sm text-body-sm font-medium">{validationError}</span>
            </div>
          )}

          {/* Parties Grid (Seller & Buyer) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-stack-md">
            {/* Bên Bán (Seller) */}
            <div className="bg-surface rounded-xl border border-outline-variant p-stack-md shadow-sm">
              <h2 className="font-tabular-nums text-sm font-semibold text-primary mb-stack-md border-b border-surface-container-highest pb-2 flex items-center justify-between">
                <span>BÊN BÁN HÀNG (ĐƠN VỊ PHÁT HÀNH)</span>
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant">storefront</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                <div className="col-span-1 sm:col-span-2">
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-1">
                    Tên đơn vị bán <span className="text-error font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={sellerName}
                    onChange={(e) => setSellerName(e.target.value)}
                    placeholder="VD: CÔNG TY CỔ PHẦN CÔNG NGHỆ VÀ TRUYỀN THÔNG ALPHA"
                    className="w-full bg-surface border border-outline-variant rounded px-3 py-2 text-body-sm focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container"
                  />
                </div>
                <div>
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-1">
                    Mã số thuế bên bán (10 - 13 số) <span className="text-error font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={14}
                    value={sellerTaxCode}
                    onChange={(e) => setSellerTaxCode(e.target.value)}
                    placeholder="VD: 0101234567 hoặc 0101234567-001"
                    className="w-full bg-surface border border-outline-variant rounded px-3 py-2 text-body-sm focus:outline-none focus:border-primary-container font-mono"
                  />
                </div>
                <div>
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-1">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={sellerPhone}
                    onChange={(e) => setSellerPhone(e.target.value)}
                    placeholder="VD: 024 3838 9999"
                    className="w-full bg-surface border border-outline-variant rounded px-3 py-2 text-body-sm focus:outline-none focus:border-primary-container"
                  />
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-1">
                    Địa chỉ bên bán
                  </label>
                  <input
                    type="text"
                    value={sellerAddress}
                    onChange={(e) => setSellerAddress(e.target.value)}
                    placeholder="VD: Tầng 3, Tòa nhà Alpha, 123 Đường Công Nghệ, Cầu Giấy, Hà Nội"
                    className="w-full bg-surface border border-outline-variant rounded px-3 py-2 text-body-sm focus:outline-none focus:border-primary-container"
                  />
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-1">
                    Số tài khoản / Ngân hàng
                  </label>
                  <input
                    type="text"
                    value={sellerBankAccount}
                    onChange={(e) => setSellerBankAccount(e.target.value)}
                    placeholder="VD: 19031234567890 - Techcombank (CN Thăng Long)"
                    className="w-full bg-surface border border-outline-variant rounded px-3 py-2 text-body-sm focus:outline-none focus:border-primary-container"
                  />
                </div>
              </div>
            </div>

            {/* Bên Mua (Buyer) */}
            <div className="bg-surface rounded-xl border border-outline-variant p-stack-md shadow-sm">
              <h2 className="font-tabular-nums text-sm font-semibold text-primary mb-stack-md border-b border-surface-container-highest pb-2 flex items-center justify-between">
                <span>BÊN MUA HÀNG</span>
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant">business</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                <div className="col-span-1 sm:col-span-2">
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-1">
                    Tên đơn vị / Người mua <span className="text-error font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="VD: CÔNG TY TNHH GIẢI PHÁP SỐ TOÀN CẦU"
                    className="w-full bg-surface border border-outline-variant rounded px-3 py-2 text-body-sm focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container"
                  />
                </div>
                <div>
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-1">
                    Mã số thuế (10 - 13 số)
                  </label>
                  <input
                    type="text"
                    maxLength={14}
                    value={customerTaxCode}
                    onChange={(e) => setCustomerTaxCode(e.target.value)}
                    placeholder="VD: 0319876543 hoặc 0101234567-001"
                    className="w-full bg-surface border border-outline-variant rounded px-3 py-2 text-body-sm focus:outline-none focus:border-primary-container font-mono"
                  />
                </div>
                <div>
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-1">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="VD: 0987654321"
                    className="w-full bg-surface border border-outline-variant rounded px-3 py-2 text-body-sm focus:outline-none focus:border-primary-container"
                  />
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-1">
                    Địa chỉ khách hàng
                  </label>
                  <input
                    type="text"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="VD: 456 Lê Lợi, P. Bến Nghé, Q.1, TP. HCM"
                    className="w-full bg-surface border border-outline-variant rounded px-3 py-2 text-body-sm focus:outline-none focus:border-primary-container"
                  />
                </div>
                <div>
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-1">
                    Email nhận hóa đơn
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="VD: contact@khachhang.com"
                    className="w-full bg-surface border border-outline-variant rounded px-3 py-2 text-body-sm focus:outline-none focus:border-primary-container"
                  />
                </div>
                <div>
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-1">
                    Hình thức thanh toán
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full bg-surface border border-outline-variant rounded px-3 py-2 text-body-sm focus:outline-none focus:border-primary-container appearance-none cursor-pointer"
                  >
                    <option value="Chuyển khoản (TM/CK)">Chuyển khoản (TM/CK)</option>
                    <option value="Tiền mặt (TM)">Tiền mặt (TM)</option>
                    <option value="Chuyển khoản (CK)">Chuyển khoản (CK)</option>
                    <option value="Đối trừ công nợ">Đối trừ công nợ</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Line Items Matrix Table */}
          <div className="bg-surface rounded-xl border border-outline-variant p-0 overflow-hidden flex flex-col shadow-sm">
            <div className="px-stack-md py-3 border-b border-surface-container-highest bg-surface-container-low flex justify-between items-center">
              <h2 className="font-tabular-nums text-sm font-semibold text-primary">CHI TIẾT HÀNG HÓA / DỊCH VỤ</h2>
              <span className="font-body-sm text-body-sm text-on-surface-variant">Tổng {items.length} mục</span>
            </div>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left min-w-[800px]">
                <thead>
                  <tr className="font-label-md text-label-md text-on-surface-variant border-b border-surface-container-highest">
                    <th scope="col" className="py-3 px-4 w-12 text-center">STT</th>
                    <th scope="col" className="py-3 px-4 min-w-[240px]">Tên Hàng Hóa / Dịch Vụ <span className="text-error">*</span></th>
                    <th scope="col" className="py-3 px-4 w-28">ĐVT <span className="text-error">*</span></th>
                    <th scope="col" className="py-3 px-4 w-32 text-right">Số Lượng <span className="text-error">*</span></th>
                    <th scope="col" className="py-3 px-4 w-40 text-right">Đơn Giá (₫) <span className="text-error">*</span></th>
                    <th scope="col" className="py-3 px-4 w-44 text-right">Thành Tiền (₫)</th>
                    <th scope="col" className="py-3 px-4 w-16 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/50">
                  {items.map((item, idx) => (
                    <tr key={item.id ?? idx} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="py-3 px-4 text-center font-tabular-nums text-sm text-on-surface-variant">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          required
                          value={item.description}
                          onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                          placeholder="VD: Dịch vụ tư vấn triển khai phần mềm..."
                          className="w-full bg-surface border border-outline-variant rounded px-2.5 py-1.5 text-body-sm focus:outline-none focus:border-primary-container"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          required
                          value={item.unit}
                          onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                          placeholder="Cái / Gói / Tháng..."
                          className="w-full bg-surface border border-outline-variant rounded px-2 py-1.5 text-body-sm focus:outline-none focus:border-primary-container text-center"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          min="1"
                          step="any"
                          required
                          value={item.quantity === 0 ? '' : item.quantity}
                          onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                          placeholder="1"
                          className="w-full bg-surface border border-outline-variant rounded px-2 py-1.5 text-body-sm focus:outline-none focus:border-primary-container text-right font-mono"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          required
                          value={item.unitPrice === 0 ? '' : item.unitPrice}
                          onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                          placeholder="0"
                          className="w-full bg-surface border border-outline-variant rounded px-2 py-1.5 text-body-sm focus:outline-none focus:border-primary-container text-right font-mono"
                        />
                      </td>
                      <td className="py-3 px-4 text-right font-tabular-nums text-sm font-semibold text-primary">
                        {formatCurrency(item.amount)} ₫
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="text-on-surface-variant hover:text-error transition-colors p-1 rounded-full hover:bg-surface-container-high"
                          title="Xóa dòng này"
                        >
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-stack-md bg-surface border-t border-outline-variant">
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-2 text-primary font-label-md text-label-md hover:bg-surface-container-low px-3 py-2 rounded transition-colors w-fit border border-outline-variant"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span>Thêm Dòng Hàng Hóa / Dịch Vụ Mới</span>
              </button>
            </div>
          </div>

          {/* Financial Summary & Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-md items-start">
            <div className="bg-surface border border-outline-variant rounded-xl p-stack-md h-full shadow-sm">
              <label className="block font-label-md text-label-md text-on-surface-variant mb-2">
                Ghi chú hóa đơn (Tùy chọn)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="VD: Thanh toán đợt 1 theo Hợp đồng kinh tế số 42/2026/HĐKT..."
                className="w-full h-36 bg-surface border border-outline-variant rounded px-3 py-2 text-body-sm focus:outline-none focus:border-primary-container resize-none"
              />
            </div>

            <div className="bg-surface border border-outline-variant rounded-xl p-stack-md h-full flex flex-col justify-between shadow-sm">
              <div className="space-y-4">
                <div className="flex justify-between items-center font-body-sm text-body-sm">
                  <span className="text-on-surface-variant">Cộng tiền hàng (Trước thuế):</span>
                  <span className="font-tabular-nums text-sm font-semibold text-primary">
                    {formatCurrency(subtotalAmount)} ₫
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-body-sm text-body-sm">
                  <span className="text-on-surface-variant whitespace-nowrap">Thuế suất GTGT:</span>
                  <div className="flex flex-wrap gap-1">
                    {[0, 5, 8, 10, -1].map((rate) => (
                      <button
                        key={rate}
                        type="button"
                        onClick={() => setVatRate(rate)}
                        className={`px-2.5 py-1 border rounded text-xs transition-colors ${
                          vatRate === rate
                            ? 'bg-primary-container text-on-primary-container border-primary-container font-semibold'
                            : 'border-outline-variant hover:bg-surface-container-low text-on-surface'
                        }`}
                      >
                        {rate === -1 ? 'KCT' : `${rate}%`}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between items-center font-body-sm text-body-sm">
                  <span className="text-on-surface-variant">Tiền thuế GTGT:</span>
                  <span className="font-tabular-nums text-sm font-semibold text-primary">
                    {formatCurrency(vatAmount)} ₫
                  </span>
                </div>
              </div>

              <div className="mt-stack-md pt-stack-md border-t border-surface-container-highest">
                <div className="flex justify-between items-end mb-2">
                  <span className="font-tabular-nums text-sm font-bold text-primary">Tổng tiền thanh toán:</span>
                  <span className="font-headline-lg text-headline-lg font-bold text-primary">
                    {formatCurrency(totalAmount)} ₫
                  </span>
                </div>
                <div className="bg-surface-container-low p-3 rounded font-body-sm text-body-sm italic text-on-surface-variant">
                  <span className="font-medium text-primary not-italic">Số tiền bằng chữ: </span>
                  <span>{amountInWords}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="h-16"></div>
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="bg-surface border-t border-outline-variant p-stack-md shrink-0 flex flex-col sm:flex-row justify-between items-center gap-stack-sm z-10 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
        <div className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
          <span>
            {mode === 'CREATE' ? 'Bản nháp mới' : mode === 'EDIT' ? 'Đang chỉnh sửa bản nháp' : 'Lập hóa đơn thay thế'} - Tổng tiền:{' '}
            <strong className="font-tabular-nums text-primary">{formatCurrency(totalAmount)} ₫</strong>
          </span>
        </div>
        <div className="flex gap-stack-sm w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setShowDiscardModal(true)}
            className="flex-1 sm:flex-none px-4 py-2 bg-surface text-primary border border-outline rounded font-label-md text-label-md hover:bg-surface-container-low transition-colors"
          >
            Hủy Bỏ
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`flex-1 sm:flex-none px-5 py-2 bg-primary text-on-primary rounded font-label-md text-label-md hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-sm ${
              isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting && <span className="material-symbols-outlined text-sm animate-spin">sync</span>}
            <span>{mode === 'CREATE' ? 'Lưu Bản Nháp' : mode === 'EDIT' ? 'Cập Nhật Bản Nháp' : 'Tạo HĐ Thay Thế'}</span>
          </button>
        </div>
      </div>

      {/* Discard Modal Dialog */}
      {showDiscardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-background/30 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-surface rounded-xl shadow-2xl border border-outline-variant p-stack-lg max-w-sm w-full">
            <h3 className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-primary mb-2">
              Hủy bỏ thay đổi?
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-6">
              Mọi dữ liệu bạn vừa nhập sẽ không được lưu lại. Bạn có chắc chắn muốn thoát khỏi biểu mẫu này?
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDiscardModal(false)}
                className="px-4 py-2 bg-surface text-primary border border-outline-variant rounded font-label-md text-label-md hover:bg-surface-container-low transition-colors"
              >
                Tiếp tục chỉnh sửa
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDiscardModal(false);
                  onCancelForm?.();
                }}
                className="px-4 py-2 bg-error text-on-error rounded font-label-md text-label-md hover:opacity-90 transition-opacity"
              >
                Đồng ý hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};

export default InvoiceForm;
