import React from 'react';
import { useInvoiceFilter } from '../hooks/useInvoiceFilter';

export type InvoiceStatusFilter = 'ALL' | 'DRAFT' | 'ISSUED' | 'REPLACED' | 'CANCELED';

export interface InvoiceStatusCount {
  all?: number;
  draft?: number;
  issued?: number;
  replaced?: number;
  canceled?: number;
}

export interface InvoiceFilterProps {
  currentStatus?: InvoiceStatusFilter;
  searchTerm?: string;
  vatRateFilter?: string;
  paymentMethodFilter?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: string;
  maxAmount?: string;
  dateRangeText?: string;
  showAdvancedFilters?: boolean;
  showDatePicker?: boolean;
  activeFiltersCount?: number;
  statusCounts?: InvoiceStatusCount;
  selectedInvoiceId?: string | null;
  selectedInvoiceStatus?: string | null;
  onStatusChange?: (status: InvoiceStatusFilter) => void;
  onSearchChange?: (term: string) => void;
  onVatRateChange?: (rate: string) => void;
  onPaymentMethodChange?: (method: string) => void;
  onStartDateChange?: (date: string) => void;
  onEndDateChange?: (date: string) => void;
  onMinAmountChange?: (amt: string) => void;
  onMaxAmountChange?: (amt: string) => void;
  onToggleAdvancedFilters?: () => void;
  onToggleDatePicker?: () => void;
  onDatePreset?: (preset: 'ALL' | 'TODAY' | 'WEEK' | 'THIS_MONTH' | 'THIS_YEAR') => void;
  onResetFilters?: () => void;
  onViewDetail?: () => void;
  onEditDraft?: () => void;
  onDeleteDraft?: () => void;
}

export { useInvoiceFilter };

/**
 * InvoiceFilter
 * Filter Bar, Search, Interactive Date Range Picker, Advanced Filters, and Contextual Action Trigger for Invoice List.
 */
export const InvoiceFilter: React.FC<InvoiceFilterProps> = ({
  currentStatus = 'ALL',
  searchTerm = '',
  vatRateFilter = 'ALL',
  paymentMethodFilter = 'ALL',
  startDate = '',
  endDate = '',
  minAmount = '',
  maxAmount = '',
  dateRangeText = 'Tất cả thời gian',
  showAdvancedFilters = false,
  showDatePicker = false,
  activeFiltersCount = 0,
  statusCounts = { all: 0, draft: 0, issued: 0, replaced: 0, canceled: 0 },
  selectedInvoiceId = null,
  selectedInvoiceStatus = null,
  onStatusChange,
  onSearchChange,
  onVatRateChange,
  onPaymentMethodChange,
  onStartDateChange,
  onEndDateChange,
  onMinAmountChange,
  onMaxAmountChange,
  onToggleAdvancedFilters,
  onToggleDatePicker,
  onDatePreset,
  onResetFilters,
  onViewDetail,
  onEditDraft,
  onDeleteDraft,
}) => {
  const statusTabs: { id: InvoiceStatusFilter; label: string; count?: number }[] = [
    { id: 'ALL', label: 'Tất cả', count: statusCounts.all },
    { id: 'DRAFT', label: 'DRAFT', count: statusCounts.draft },
    { id: 'ISSUED', label: 'ISSUED', count: statusCounts.issued },
    { id: 'REPLACED', label: 'REPLACED', count: statusCounts.replaced },
    { id: 'CANCELED', label: 'CANCELED', count: statusCounts.canceled },
  ];

  const hasSelection = Boolean(selectedInvoiceId);
  const isDraftSelected = selectedInvoiceStatus === 'DRAFT';

  return (
    <div className="p-stack-md border-b border-outline-variant bg-surface flex flex-col gap-stack-md">
      {/* Top Filter Row: Status Badges & Date/Filter Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar w-full sm:w-auto">
          {statusTabs.map((tab) => {
            const isActive = currentStatus === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onStatusChange?.(tab.id)}
                className={`whitespace-nowrap font-label-md text-label-md px-4 py-1.5 rounded-full border transition-all cursor-pointer ${
                  isActive
                    ? 'bg-primary-container text-on-primary-container border-primary-container font-semibold shadow-sm'
                    : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low border-outline-variant'
                }`}
              >
                {tab.label} {tab.count !== undefined ? `(${tab.count})` : ''}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto relative">
          {/* Interactive Date Range Button */}
          <div className="relative">
            <button
              type="button"
              onClick={onToggleDatePicker}
              className={`flex items-center justify-between border rounded-lg px-3 py-2 min-w-[220px] font-body-sm text-on-surface hover:bg-surface-container-low focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors cursor-pointer ${
                startDate || endDate
                  ? 'border-primary text-primary bg-primary/5 font-medium'
                  : 'bg-surface-container-lowest border-outline-variant'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                <span>{dateRangeText}</span>
              </span>
              <span className="material-symbols-outlined text-xs ml-2">
                {showDatePicker ? 'expand_less' : 'expand_more'}
              </span>
            </button>

            {/* Date Range Dropdown Popover */}
            {showDatePicker && (
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-surface border border-outline-variant rounded-xl shadow-xl z-50 p-4 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex justify-between items-center pb-3 border-b border-surface-container-highest">
                  <h3 className="font-label-md text-sm font-bold text-primary flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px]">date_range</span>
                    <span>Chọn Kỳ Tính Thuế / Khoảng Ngày</span>
                  </h3>
                  <button
                    type="button"
                    onClick={onToggleDatePicker}
                    className="text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-surface-container-high"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>

                {/* Quick Presets */}
                <div className="grid grid-cols-3 gap-2 my-3">
                  <button
                    type="button"
                    onClick={() => {
                      onDatePreset?.('ALL');
                      onToggleDatePicker?.();
                    }}
                    className="text-xs py-1.5 px-2 rounded border border-outline-variant hover:bg-surface-container-low text-on-surface transition-colors"
                  >
                    Tất cả
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onDatePreset?.('TODAY');
                      onToggleDatePicker?.();
                    }}
                    className="text-xs py-1.5 px-2 rounded border border-outline-variant hover:bg-surface-container-low text-on-surface transition-colors"
                  >
                    Hôm nay
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onDatePreset?.('WEEK');
                      onToggleDatePicker?.();
                    }}
                    className="text-xs py-1.5 px-2 rounded border border-outline-variant hover:bg-surface-container-low text-on-surface transition-colors"
                  >
                    7 ngày qua
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onDatePreset?.('THIS_MONTH');
                      onToggleDatePicker?.();
                    }}
                    className="text-xs py-1.5 px-2 rounded border border-outline-variant hover:bg-surface-container-low text-on-surface font-medium text-primary bg-primary/5 transition-colors"
                  >
                    Tháng này
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onDatePreset?.('THIS_YEAR');
                      onToggleDatePicker?.();
                    }}
                    className="text-xs py-1.5 px-2 rounded border border-outline-variant hover:bg-surface-container-low text-on-surface transition-colors"
                  >
                    Năm 2026
                  </button>
                  {(startDate || endDate) && (
                    <button
                      type="button"
                      onClick={() => {
                        onDatePreset?.('ALL');
                      }}
                      className="text-xs py-1.5 px-2 rounded border border-error/40 text-error hover:bg-error/10 transition-colors"
                    >
                      Xóa ngày
                    </button>
                  )}
                </div>

                {/* Custom Date Pickers */}
                <div className="space-y-3 pt-2 border-t border-surface-container-highest">
                  <div>
                    <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                      Từ ngày:
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => onStartDateChange?.(e.target.value)}
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded px-3 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                      Đến ngày:
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => onEndDateChange?.(e.target.value)}
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded px-3 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-surface-container-highest">
                  <button
                    type="button"
                    onClick={onToggleDatePicker}
                    className="px-3 py-1.5 rounded bg-primary text-on-primary text-xs font-semibold hover:bg-primary/90 transition-colors"
                  >
                    Xác nhận
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Advanced Filter Toggle Button with Active Badge */}
          <button
            type="button"
            onClick={onToggleAdvancedFilters}
            className={`relative flex items-center justify-center border rounded-lg p-2 transition-colors cursor-pointer ${
              showAdvancedFilters || activeFiltersCount > 0
                ? 'bg-primary text-on-primary border-primary shadow-sm'
                : 'bg-surface-container-lowest border-outline-variant text-on-surface-variant hover:bg-surface-container-low'
            }`}
            title="Bộ lọc nâng cao"
          >
            <span className="material-symbols-outlined text-[20px]">filter_list</span>
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Search and Dropdown Filter Row */}
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-sm">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Tìm theo Số HĐ, Tên KH, Tên người bán, MST, Email, SĐT..."
            className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg pl-9 pr-8 py-2 font-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none placeholder-on-surface-variant"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => onSearchChange?.('')}
              className="absolute right-2.5 top-2.5 text-on-surface-variant hover:text-on-surface"
              title="Xóa tìm kiếm"
            >
              <span className="material-symbols-outlined text-sm">cancel</span>
            </button>
          )}
        </div>

        <select
          value={vatRateFilter}
          onChange={(e) => onVatRateChange?.(e.target.value)}
          className="bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 font-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none min-w-[140px] w-full sm:w-auto"
        >
          <option value="ALL">Thuế suất: Tất cả</option>
          <option value="10">Thuế GTGT 10%</option>
          <option value="8">Thuế GTGT 8%</option>
          <option value="5">Thuế GTGT 5%</option>
          <option value="0">Thuế GTGT 0%</option>
          <option value="KCT">Không chịu thuế (KCT)</option>
        </select>

        {activeFiltersCount > 0 && (
          <button
            type="button"
            onClick={onResetFilters}
            className="text-xs text-error font-medium hover:underline flex items-center gap-1 shrink-0 py-2 px-1 cursor-pointer"
            title="Đặt lại toàn bộ bộ lọc về mặc định"
          >
            <span className="material-symbols-outlined text-sm">restart_alt</span>
            <span>Đặt lại ({activeFiltersCount})</span>
          </button>
        )}
      </div>

      {/* Advanced Filter Panel (Collapsible) */}
      {showAdvancedFilters && (
        <div className="bg-surface-container-low border border-outline-variant rounded-xl p-4 animate-in fade-in duration-200">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-semibold text-sm text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">tune</span>
              <span>Bộ Lọc Nâng Cao</span>
            </h4>
            <button
              type="button"
              onClick={onResetFilters}
              className="text-xs text-on-surface-variant hover:text-error flex items-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">restart_alt</span>
              <span>Đặt lại tất cả</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            {/* Payment Method */}
            <div>
              <label className="block font-semibold text-on-surface-variant mb-1">
                Hình thức thanh toán:
              </label>
              <select
                value={paymentMethodFilter}
                onChange={(e) => onPaymentMethodChange?.(e.target.value)}
                className="w-full bg-surface border border-outline-variant rounded px-2.5 py-1.5 text-on-surface focus:border-primary outline-none"
              >
                <option value="ALL">Tất cả hình thức</option>
                <option value="Chuyển khoản (TM/CK)">Chuyển khoản (TM/CK)</option>
                <option value="Tiền mặt (TM)">Tiền mặt (TM)</option>
                <option value="Chuyển khoản (CK)">Chuyển khoản (CK)</option>
                <option value="Đối trừ công nợ">Đối trừ công nợ</option>
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block font-semibold text-on-surface-variant mb-1">
                Từ ngày:
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => onStartDateChange?.(e.target.value)}
                className="w-full bg-surface border border-outline-variant rounded px-2.5 py-1.5 text-on-surface focus:border-primary outline-none"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block font-semibold text-on-surface-variant mb-1">
                Đến ngày:
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => onEndDateChange?.(e.target.value)}
                className="w-full bg-surface border border-outline-variant rounded px-2.5 py-1.5 text-on-surface focus:border-primary outline-none"
              />
            </div>

            {/* Amount Range */}
            <div>
              <label className="block font-semibold text-on-surface-variant mb-1">
                Số tiền tối thiểu (₫):
              </label>
              <input
                type="number"
                min="0"
                step="10000"
                placeholder="VD: 100000"
                value={minAmount}
                onChange={(e) => onMinAmountChange?.(e.target.value)}
                className="w-full bg-surface border border-outline-variant rounded px-2.5 py-1.5 text-on-surface focus:border-primary outline-none font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {/* Selected Action Bar */}
      <div className="flex items-center gap-2 pt-2 border-t border-outline-variant/50 justify-between">
        <span className="text-label-md text-on-surface-variant mr-2">
          {hasSelection
            ? `Đã chọn: ${selectedInvoiceId}`
            : 'Thao tác với dòng đã chọn:'}
        </span>
        <div className="flex items-center gap-2 ml-auto">
          <button
            type="button"
            disabled={!hasSelection}
            onClick={onViewDetail}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary-container text-on-primary-container font-label-md transition-opacity ${
              hasSelection ? 'hover:opacity-90 cursor-pointer opacity-100' : 'opacity-50 cursor-not-allowed'
            }`}
          >
            <span className="material-symbols-outlined text-sm">visibility</span>
            <span>Xem chi tiết</span>
          </button>

          <button
            type="button"
            disabled={!hasSelection || !isDraftSelected}
            onClick={onEditDraft}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border border-outline-variant font-label-md transition-all ${
              hasSelection && isDraftSelected
                ? 'hover:bg-surface-container-low text-on-surface cursor-pointer opacity-100'
                : 'opacity-40 cursor-not-allowed text-on-surface-variant'
            }`}
            title={!isDraftSelected && hasSelection ? 'Chỉ được sửa hóa đơn ở trạng thái Bản Nháp' : ''}
          >
            <span className="material-symbols-outlined text-sm">edit</span>
            <span>Sửa</span>
          </button>

          <button
            type="button"
            disabled={!hasSelection || !isDraftSelected}
            onClick={onDeleteDraft}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border border-outline-variant font-label-md transition-all ${
              hasSelection && isDraftSelected
                ? 'hover:bg-error/10 text-error border-error/30 cursor-pointer opacity-100'
                : 'opacity-40 cursor-not-allowed text-on-surface-variant'
            }`}
            title={!isDraftSelected && hasSelection ? 'Chỉ được xóa hóa đơn ở trạng thái Bản Nháp' : ''}
          >
            <span className="material-symbols-outlined text-sm">delete</span>
            <span>Xóa</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceFilter;
