import { ICurrencyToWordsUtil } from './PdfService';

const DIGIT_WORDS = [
  'không',
  'một',
  'hai',
  'ba',
  'bốn',
  'năm',
  'sáu',
  'bảy',
  'tám',
  'chín',
];

const SCALE_WORDS = [
  '',
  'nghìn',
  'triệu',
  'tỷ',
  'nghìn tỷ',
  'triệu tỷ',
  'tỷ tỷ',
];

/**
 * Converts a 3-digit group into Vietnamese words
 */
function readThreeDigits(
  hundreds: number,
  tens: number,
  units: number,
  hasHigherScale: boolean
): string[] {
  const words: string[] = [];

  if (hundreds > 0 || hasHigherScale) {
    words.push(DIGIT_WORDS[hundreds], 'trăm');
  }

  if (tens > 1) {
    words.push(DIGIT_WORDS[tens], 'mươi');
    if (units === 1) {
      words.push('mốt');
    } else if (units === 5) {
      words.push('lăm');
    } else if (units > 0) {
      words.push(DIGIT_WORDS[units]);
    }
  } else if (tens === 1) {
    words.push('mười');
    if (units === 1) {
      words.push('một');
    } else if (units === 5) {
      words.push('lăm');
    } else if (units > 0) {
      words.push(DIGIT_WORDS[units]);
    }
  } else {
    // tens === 0
    if (units > 0) {
      if (hundreds > 0 || hasHigherScale) {
        words.push('lẻ');
      }
      words.push(DIGIT_WORDS[units]);
    }
  }

  return words;
}

export class CurrencyToWordsUtil implements ICurrencyToWordsUtil {
  /**
   * Workflow: convertVndToWords
   * Converts numeric VND amount into standardized Vietnamese text description
   * e.g., 12320000 -> "Mười hai triệu ba trăm hai mươi nghìn đồng chẵn"
   */
  convertVndToWords(amount: number): string {
    const rounded = Math.abs(Math.round(amount));

    if (rounded === 0) {
      return 'Không đồng chẵn';
    }

    const numStr = rounded.toString();
    const groups: number[][] = [];

    // Split string into groups of 3 digits from right to left
    let end = numStr.length;
    while (end > 0) {
      const start = Math.max(0, end - 3);
      const chunk = numStr.slice(start, end).padStart(3, '0');
      groups.push([
        parseInt(chunk[0], 10),
        parseInt(chunk[1], 10),
        parseInt(chunk[2], 10),
      ]);
      end = start;
    }

    const wordsList: string[] = [];

    for (let i = groups.length - 1; i >= 0; i--) {
      const [h, t, u] = groups[i];
      const isGroupZero = h === 0 && t === 0 && u === 0;

      if (isGroupZero) {
        // For 'tỷ' scale (scale index 3, 6...), preserve scale name if higher groups exist
        if (i % 3 === 0 && i > 0) {
          wordsList.push(SCALE_WORDS[i]);
        }
        continue;
      }

      const hasHigherScale = i < groups.length - 1;
      const groupWords = readThreeDigits(h, t, u, hasHigherScale);

      wordsList.push(...groupWords);

      if (SCALE_WORDS[i]) {
        wordsList.push(SCALE_WORDS[i]);
      }
    }

    if (wordsList.length === 0) {
      return 'Không đồng chẵn';
    }

    // Join words, add currency suffix, and capitalize the first letter
    const result = `${wordsList.join(' ')} đồng chẵn`;
    const capitalized = result.charAt(0).toUpperCase() + result.slice(1);

    return capitalized.replace(/\s+/g, ' ').trim();
  }
}

/**
 * Standalone helper function
 */
export function convertVndToWords(amount: number): string {
  const util = new CurrencyToWordsUtil();
  return util.convertVndToWords(amount);
}
