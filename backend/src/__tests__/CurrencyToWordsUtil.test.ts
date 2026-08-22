import { describe, it, expect } from 'vitest';
import { CurrencyToWordsUtil } from '../services/CurrencyToWordsUtil';

describe('CurrencyToWordsUtil', () => {
  const util = new CurrencyToWordsUtil();

  it('should convert 0 to "Không đồng chẵn"', () => {
    expect(util.convertVndToWords(0)).toBe('Không đồng chẵn');
  });

  it('should convert simple millions correctly', () => {
    expect(util.convertVndToWords(1000000)).toBe('Một triệu đồng chẵn');
    expect(util.convertVndToWords(50000000)).toBe('Năm mươi triệu đồng chẵn');
  });

  it('should convert complex numbers into proper Vietnamese words', () => {
    const result = util.convertVndToWords(12350000);
    expect(result).toBe('Mười hai triệu ba trăm năm mươi nghìn đồng chẵn');
  });

  it('should handle billions correctly', () => {
    const result = util.convertVndToWords(1000000000);
    expect(result).toBe('Một tỷ đồng chẵn');
  });
});
