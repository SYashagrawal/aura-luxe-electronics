export interface GSTCalculationResult {
  taxableValue: number;
  cgstRate: number;
  cgstAmount: number;
  sgstRate: number;
  sgstAmount: number;
  igstRate: number;
  igstAmount: number;
  totalGst: number;
  totalAmount: number;
  isInterstate: boolean;
}

export interface GSTCalculationInput {
  grossAmount: number; // In retail electronics, MRP/selling price is inclusive of GST
  gstRate: number; // e.g. 18 for 18%
  sellerStateCode: string; // e.g. "27" or "Maharashtra"
  buyerStateCode: string; // e.g. "27" or "Delhi"
  isGstInclusive?: boolean; // Defaults to true for B2C consumer electronics
}

/**
 * Standard Indian State Code mapping (GSTIN first 2 digits)
 */
export const STATE_GST_CODES: Record<string, string> = {
  'jammu and kashmir': '01',
  'himachal pradesh': '02',
  'punjab': '03',
  'chandigarh': '04',
  'uttarakhand': '05',
  'haryana': '06',
  'delhi': '07',
  'rajasthan': '08',
  'uttar pradesh': '09',
  'bihar': '10',
  'sikkim': '11',
  'arunachal pradesh': '12',
  'nagaland': '13',
  'manipur': '14',
  'mizoram': '15',
  'tripura': '16',
  'meghalaya': '17',
  'assam': '18',
  'west bengal': '19',
  'jharkhand': '20',
  'odisha': '21',
  'chhattisgarh': '22',
  'madhya pradesh': '23',
  'gujarat': '24',
  'maharashtra': '27',
  'karnataka': '29',
  'goa': '30',
  'kerala': '32',
  'tamil nadu': '33',
  'puducherry': '34',
  'andaman and nicobar islands': '35',
  'telangana': '36',
  'andhra pradesh': '37',
  'ladakh': '38',
};

export function normalizeStateCode(input: string): string {
  if (!input) return '27';
  const clean = input.trim().toLowerCase();
  if (STATE_GST_CODES[clean]) {
    return STATE_GST_CODES[clean];
  }
  // Check if it's already a 2-digit code
  if (/^\d{2}$/.test(clean)) {
    return clean;
  }
  // Substring match
  for (const [state, code] of Object.entries(STATE_GST_CODES)) {
    if (clean.includes(state) || state.includes(clean)) {
      return code;
    }
  }
  return '27';
}

/**
 * Calculates CGST, SGST, IGST with exact statutory rounding
 */
export function calculateGST(input: GSTCalculationInput): GSTCalculationResult {
  const isInclusive = input.isGstInclusive ?? true;
  const sellerCode = normalizeStateCode(input.sellerStateCode);
  const buyerCode = normalizeStateCode(input.buyerStateCode);
  const isInterstate = sellerCode !== buyerCode;
  const rate = input.gstRate;

  let taxableValue: number;
  let totalGst: number;
  let totalAmount: number;

  if (isInclusive) {
    totalAmount = Math.round(input.grossAmount * 100) / 100;
    // Reverse tax formula: Taxable = Gross / (1 + Rate / 100)
    taxableValue = Math.round((totalAmount / (1 + rate / 100)) * 100) / 100;
    totalGst = Math.round((totalAmount - taxableValue) * 100) / 100;
  } else {
    taxableValue = Math.round(input.grossAmount * 100) / 100;
    totalGst = Math.round(((taxableValue * rate) / 100) * 100) / 100;
    totalAmount = Math.round((taxableValue + totalGst) * 100) / 100;
  }

  let cgstRate = 0;
  let cgstAmount = 0;
  let sgstRate = 0;
  let sgstAmount = 0;
  let igstRate = 0;
  let igstAmount = 0;

  if (isInterstate) {
    igstRate = rate;
    igstAmount = totalGst;
  } else {
    cgstRate = rate / 2;
    sgstRate = rate / 2;
    // Split GST equally between Central and State
    cgstAmount = Math.round((totalGst / 2) * 100) / 100;
    sgstAmount = Math.round((totalGst - cgstAmount) * 100) / 100;
  }

  return {
    taxableValue,
    cgstRate,
    cgstAmount,
    sgstRate,
    sgstAmount,
    igstRate,
    igstAmount,
    totalGst,
    totalAmount,
    isInterstate,
  };
}
