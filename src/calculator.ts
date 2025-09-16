import type { GermanTaxCalculation, IBKRData } from "./types";

export function calculateGermanTax(data: IBKRData): GermanTaxCalculation {
  const line7 = calculateLine7(data);
  const line19 = calculateLine19(data);
  const { line37, line38 } = calculateLine37And38(data);
  const line41 = calculateLine41(data);
  return { line7, line19, line37, line38, line41 };
}

function calculateLine7(data: IBKRData): number {
  // Line 7: Only dividends that are already subject to German tax
  const germanDividends = data.dividends
    .filter((dividend) => dividend.currency === "EUR")
    .reduce((sum, dividend) => sum + dividend.amount, 0);

  return parseFloat(germanDividends.toFixed(2));
}

function calculateLine19(data: IBKRData): number {
  // Line 19: Interest income not yet subject to German tax
  const totalInterest = data.totalInterestEUR || 0;

  return parseFloat(totalInterest.toFixed(2));
}

function calculateLine37And38(data: IBKRData): {
  line37: number;
  line38: number;
} {
  // Total German tax (Abgeltungssteuer + Solidaritätszuschlag)
  // Note: Tax withheld is negative, so multiply by -1 to get positive amount
  const totalGermanTax =
    -1 *
    data.withholdingTax
      .filter((tax) => tax.description.includes("- DE Tax"))
      .reduce((sum, tax) => sum + tax.amount, 0);

  // Split into Abgeltungssteuer (25%) and Solidaritätszuschlag (5.5% of Abgeltungssteuer)
  // Total = Abgeltungssteuer * (1 + 0.055) = Abgeltungssteuer * 1.055
  const abgeltungssteuer = totalGermanTax / 1.055;
  const solidaritaetszuschlag = totalGermanTax - abgeltungssteuer;

  return {
    line37: parseFloat(abgeltungssteuer.toFixed(2)),
    line38: parseFloat(solidaritaetszuschlag.toFixed(2)),
  };
}

function calculateLine41(data: IBKRData): number {
  // Line 41: Other withholding tax (mostly credit interest withholding)
  // Note: Tax withheld is negative, so multiply by -1 to get positive amount

  // Check if we have USD subtotal entry (from reports with "Total in EUR")
  const hasUsdSubtotal = data.withholdingTax.some(
    (tax) =>
      tax.description === "USD Withholding Tax (value according to IBKR)",
  );

  let result: number;
  if (hasUsdSubtotal) {
    // Include only USD subtotal (already converted to EUR by IBKR)
    result =
      -1 *
      data.withholdingTax
        .filter(
          (tax) =>
            tax.description === "USD Withholding Tax (value according to IBKR)",
        )
        .reduce((sum, tax) => sum + tax.amount, 0);
  } else {
    // Fallback to EUR interest withholding tax for files without USD subtotal
    result =
      -1 *
      data.withholdingTax
        .filter(
          (tax) =>
            !tax.description.includes("- DE Tax") &&
            tax.currency === "EUR" &&
            tax.description.includes("Credit Interest"),
        )
        .reduce((sum, tax) => sum + tax.amount, 0);
  }

  return parseFloat(result.toFixed(2));
}
