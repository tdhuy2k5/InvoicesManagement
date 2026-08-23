import { useMemo } from 'react';
import { convertVndToWords } from '@backend/services/CurrencyToWordsUtil';

/**
 * Custom Hook: useCurrencyToWords
 * Thin wiring adapter connecting UI components directly to Backend Core CurrencyToWordsUtil
 * Workflow: convertVndToWords
 */
export function useCurrencyToWords(amount?: number, initialWords?: string) {
  const words = useMemo(() => {
    if (initialWords) return initialWords;
    if (amount === undefined || amount === null || isNaN(amount)) return 'Không đồng chẵn';
    return convertVndToWords(amount);
  }, [amount, initialWords]);

  return {
    words,
    convert: convertVndToWords,
  };
}

export { convertVndToWords };
