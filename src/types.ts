export interface DividendEntry {
  currency: string;
  date: string;
  description: string;
  amount: number;
}

export interface WithholdingTaxEntry {
  currency: string;
  date: string;
  description: string;
  amount: number;
}

export interface ParsedReport {
  dividends: DividendEntry[];
  withholdingTax: WithholdingTaxEntry[];
  metadata: {
    generatedDate?: string;
    period?: string;
    account?: string;
  };
}

export interface IBKRData {
  dividends: DividendEntry[];
  withholdingTax: WithholdingTaxEntry[];
  totalWithholdingTaxEUR?: number;
  totalInterestEUR?: number;
  parsedReport?: ParsedReport;
}

export interface GermanTaxCalculation {
  line7: number;
  line19: number;
  line37: number;
  line38: number;
  line41: number;
}
