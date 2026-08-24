import React from 'react';
import { useInvoice } from '../context/InvoiceContext';

export interface GlobalHeaderProps {
  appName?: string;
  activeNav?: string;
  onNavigateToInvoiceList?: () => void;
  onNavigateToCreateInvoice?: () => void;
}

/**
 * GlobalHeader
 * UI Component representing the application-wide top header bar.
 * Outbound Navigation:
 * - `navigateToInvoiceList` -> `InvoiceList`
 * - `navigateToCreateInvoice` -> `InvoiceCreate`
 */
export const GlobalHeader: React.FC<GlobalHeaderProps> = ({
  appName = 'AuditorPro',
  activeNav = 'invoices',
  onNavigateToInvoiceList,
  onNavigateToCreateInvoice,
}) => {
  const { navigate } = useInvoice();
  const handleNavList = onNavigateToInvoiceList || (() => navigate('/invoices'));
  const handleNavCreate = onNavigateToCreateInvoice || (() => navigate('/invoices/new'));

  return (
    <header className="bg-surface-container-lowest border-b border-outline-variant flex justify-between items-center px-gutter py-stack-sm w-full sticky top-0 z-40">
      <div className="flex items-center gap-gutter">
        <div 
          className="flex items-center gap-2 cursor-pointer select-none"
          onClick={handleNavList}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleNavList();
            }
          }}
        >
          <span className="material-symbols-outlined text-primary text-2xl">receipt_long</span>
          <span className="font-headline-lg text-headline-lg font-bold text-primary">{appName}</span>
        </div>
        <nav className="hidden lg:flex items-center gap-stack-md ml-8">
          <button
            type="button"
            onClick={handleNavList}
            className={`font-label-md text-label-md font-bold transition-colors py-2 px-4 rounded-full ${
              activeNav === 'invoices'
                ? 'text-primary bg-surface-container'
                : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low'
            }`}
          >
            Danh Sách Hóa Đơn
          </button>
        </nav>
      </div>
      <div className="flex items-center gap-stack-md">
        <button
          type="button"
          onClick={handleNavCreate}
          className="bg-primary text-on-primary font-label-md text-label-md px-4 py-2 rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity ml-4 shadow-sm"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          <span>Tạo Hóa Đơn Mới</span>
        </button>
      </div>
    </header>
  );
};

export default GlobalHeader;
