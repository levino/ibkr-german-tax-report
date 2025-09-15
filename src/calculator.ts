import type { GermanTaxCalculation, IBKRData } from "./types";

export function calculateGermanTax(data: IBKRData): GermanTaxCalculation {
  const line7 = calculateLine7(data);
  const line37 = calculateLine37(data);
  const line40 = calculateLine40(data);
  return { line7, line37, line40 };
}

function calculateLine7(data: IBKRData): number {
  const germanDividends = data.dividends
    .filter((dividend) => dividend.currency === "EUR")
    .reduce((sum, dividend) => sum + dividend.amount, 0);

  return parseFloat(germanDividends.toFixed(2));
}

function calculateLine37(data: IBKRData): number {
  // Line 37: Only "DE Tax" withholding tax (dividend withholding tax)
  // Note: Tax withheld is negative, so multiply by -1 to get positive amount
  const result =
    -1 *
    data.withholdingTax
      .filter((tax) => tax.description.includes("- DE Tax"))
      .reduce((sum, tax) => sum + tax.amount, 0);

  return parseFloat(result.toFixed(2));
}

function calculateLine40(data: IBKRData): number {
  // Line 40: Other withholding tax (mostly credit interest withholding)
  // Note: Tax withheld is negative, so multiply by -1 to get positive amount
  const result =
    -1 *
    data.withholdingTax
      .filter((tax) => !tax.description.includes("- DE Tax"))
      .reduce((sum, tax) => sum + tax.amount, 0);

  return parseFloat(result.toFixed(2));
}
