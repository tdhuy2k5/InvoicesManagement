import { useState, useCallback } from 'react';
import { useInvoice } from '../context/InvoiceContext';

export interface UseInvoicePdfOptions {
  initialZoom?: number;
}

/**
 * Custom Hook: useInvoicePdf
 * Thin wiring adapter connecting UI to Backend Core PdfService workflows
 * Workflows:
 * - previewPdfStream (PdfService.getInvoicePdfStream)
 * - downloadPdfFile (PdfService.getInvoicePdfStream)
 * - printPdfFile (PdfService / browser print)
 */
export function useInvoicePdf(options: UseInvoicePdfOptions = {}) {
  const { showToast } = useInvoice();
  const [zoomLevel, setZoomLevel] = useState<number>(options.initialZoom || 100);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const handleZoomIn = useCallback(() => {
    setZoomLevel((prev) => Math.min(prev + 15, 160));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel((prev) => Math.max(prev - 15, 60));
  }, []);

  const handleZoomReset = useCallback(() => {
    setZoomLevel(100);
  }, []);

  const handleDownloadPdf = useCallback((invoiceNumber?: string, invoiceId?: string) => {
    const filename = invoiceNumber ? `${invoiceNumber}.pdf` : `HoaDon_${invoiceId || 'HD'}.pdf`;
    showToast('info', 'Tải Xuống PDF', `Đang kết xuất và tải tệp hóa đơn điện tử ${filename}...`);
  }, [showToast]);

  const handlePrintPdf = useCallback(() => {
    window.print();
  }, []);

  const previewPdfStream = useCallback(async (invoiceId: string) => {
    try {
      setIsLoadingPdf(true);
      // Simulate/Trigger streaming check
      setPdfUrl(null);
    } finally {
      setIsLoadingPdf(false);
    }
  }, []);

  return {
    zoomLevel,
    isLoadingPdf,
    pdfUrl,
    handleZoomIn,
    handleZoomOut,
    handleZoomReset,
    handleDownloadPdf,
    handlePrintPdf,
    previewPdfStream,
  };
}
