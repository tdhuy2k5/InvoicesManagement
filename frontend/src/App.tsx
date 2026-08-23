import React from 'react';
import { InvoiceProvider, useInvoice } from './context/InvoiceContext';
import {
  InvoiceListPage,
  InvoiceDetailPage,
  InvoiceCreatePage,
  InvoiceEditPage,
  InvoiceReplacePage,
} from './pages';

/**
 * NotFoundPage (404 Fallback View)
 * Displayed when an unmapped or invalid route is accessed.
 */
const NotFoundPage: React.FC = () => {
  const { navigate } = useInvoice();
  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col items-center justify-center p-8 text-center font-sans">
      <div className="w-20 h-20 bg-error-container text-error rounded-full flex items-center justify-center mb-6 shadow-md animate-bounce">
        <span className="material-symbols-outlined text-4xl">search_off</span>
      </div>
      <h1 className="font-headline-lg text-3xl font-bold text-primary mb-2">404 - Trang Không Tồn Tại</h1>
      <p className="font-body-sm text-on-surface-variant max-w-md mb-6 leading-relaxed">
        Đường dẫn bạn yêu cầu không nằm trong hệ thống hóa đơn điện tử hoặc đã được di chuyển.
      </p>
      <button
        type="button"
        onClick={() => navigate('/invoices')}
        className="px-6 py-2.5 bg-primary text-on-primary rounded-lg font-medium shadow-sm hover:opacity-90 transition flex items-center gap-2"
      >
        <span className="material-symbols-outlined text-sm">home</span>
        <span>Về Danh Sách Hóa Đơn</span>
      </button>
    </div>
  );
};

/**
 * RouterView
 * Central Application Router mapping Graph UI Nodes to physical screens.
 * Routes:
 * - `/` & `/invoices` -> InvoiceListPage
 * - `/invoices/new` -> InvoiceCreatePage
 * - `/invoices/:id` -> InvoiceDetailPage
 * - `/invoices/:id/edit` -> InvoiceEditPage (Guard: DRAFT)
 * - `/invoices/:id/replace` -> InvoiceReplacePage (Guard: ISSUED & originalInvoiceId == null)
 * - `*` -> NotFoundPage (404 Fallback)
 */
const RouterView: React.FC = () => {
  const { currentRoute, toast, hideToast } = useInvoice();

  const renderRoute = () => {
    switch (currentRoute) {
      case '/':
      case '/invoices':
        return <InvoiceListPage />;
      case '/invoices/new':
        return <InvoiceCreatePage />;
      case '/invoices/:id':
        return <InvoiceDetailPage />;
      case '/invoices/:id/edit':
        return <InvoiceEditPage />;
      case '/invoices/:id/replace':
        return <InvoiceReplacePage />;
      default:
        return <NotFoundPage />;
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* Toast Notification Container */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md w-full shadow-2xl rounded-xl overflow-hidden border border-outline-variant animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div
            className={`p-4 flex items-start gap-3 ${
              toast.type === 'success'
                ? 'bg-emerald-50 text-emerald-950 border-l-4 border-l-emerald-600'
                : toast.type === 'error'
                ? 'bg-rose-50 text-rose-950 border-l-4 border-l-rose-600'
                : toast.type === 'warning'
                ? 'bg-amber-50 text-amber-950 border-l-4 border-l-amber-600'
                : 'bg-blue-50 text-blue-950 border-l-4 border-l-blue-600'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[22px] shrink-0 mt-0.5 ${
                toast.type === 'success'
                  ? 'text-emerald-700'
                  : toast.type === 'error'
                  ? 'text-rose-700'
                  : toast.type === 'warning'
                  ? 'text-amber-700'
                  : 'text-blue-700'
              }`}
            >
              {toast.type === 'success'
                ? 'check_circle'
                : toast.type === 'error'
                ? 'error'
                : toast.type === 'warning'
                ? 'warning'
                : 'info'}
            </span>
            <div className="flex-1">
              <h4 className="font-bold text-sm">{toast.title}</h4>
              <p className="text-xs opacity-90 mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
            <button
              type="button"
              onClick={hideToast}
              className="text-xs opacity-60 hover:opacity-100 p-1 transition"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {renderRoute()}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <InvoiceProvider>
      <RouterView />
    </InvoiceProvider>
  );
};

export default App;
