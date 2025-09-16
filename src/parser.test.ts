import { describe, expect, it } from "vitest";
import { parseReport } from "./parser";

describe("parseReport", () => {
  it("should parse dividend entries correctly", () => {
    const reportContent = `
Statement,Header,Field Name,Field Value
Statement,Data,Title,Activity Statement
Dividends,Header,Currency,Date,Description,Amount
Dividends,Data,EUR,2024-06-15,XYZ(US98765XYZ43) Cash Dividend EUR 2.50 per Share (Ordinary Dividend),100
Dividends,Data,EUR,2024-07-20,ABC(DE000ABC1234) Cash Dividend EUR 1.25 per Share (Ordinary Dividend),50
Dividends,Data,Total,,,150
`;

    const result = parseReport(reportContent);

    expect(result.dividends).toHaveLength(2);
    expect(result.dividends[0]).toEqual({
      currency: "EUR",
      date: "2024-06-15",
      description:
        "XYZ(US98765XYZ43) Cash Dividend EUR 2.50 per Share (Ordinary Dividend)",
      amount: 100,
      lineNumber: 4,
    });

    // Check that parsed report structure is correct
    expect(result.parsedReport?.dividends).toBeDefined();
    expect(result.parsedReport?.withholdingTax).toBeDefined();
    expect(result.parsedReport?.metadata).toBeDefined();

    // Check dividend structure in parsed report
    expect(result.parsedReport?.dividends).toHaveLength(2);
    expect(result.parsedReport?.dividends[0]).toEqual({
      currency: "EUR",
      date: "2024-06-15",
      description:
        "XYZ(US98765XYZ43) Cash Dividend EUR 2.50 per Share (Ordinary Dividend)",
      amount: 100,
      lineNumber: 4,
    });
  });

  it("should parse withholding tax entries correctly", () => {
    const reportContent = `
Withholding Tax,Header,Currency,Date,Description,Amount,Code
Withholding Tax,Data,EUR,2024-06-15,XYZ(US98765XYZ43) Cash Dividend EUR 2.50 per Share - DE Tax,-15,
Withholding Tax,Data,EUR,2024-07-20,ABC(DE000ABC1234) Cash Dividend EUR 1.25 per Share - DE Tax,-7.5,
Withholding Tax,Data,Total,,,-22.5,
`;

    const result = parseReport(reportContent);

    expect(result.withholdingTax).toHaveLength(2);
    expect(result.withholdingTax[0]).toEqual({
      currency: "EUR",
      date: "2024-06-15",
      description:
        "XYZ(US98765XYZ43) Cash Dividend EUR 2.50 per Share - DE Tax",
      amount: -15,
      lineNumber: 2,
    });

    // Check that withholding tax entries are in parsed report
    expect(result.parsedReport?.withholdingTax).toHaveLength(2);
    expect(result.parsedReport?.withholdingTax[0]).toEqual({
      currency: "EUR",
      date: "2024-06-15",
      description:
        "XYZ(US98765XYZ43) Cash Dividend EUR 2.50 per Share - DE Tax",
      amount: -15,
      lineNumber: 2,
    });
  });

  it("should extract metadata correctly", () => {
    const reportContent = `
Statement,Header,Field Name,Field Value
Statement,Data,Period,"January 1, 2024 - December 31, 2024"
Statement,Data,WhenGenerated,"2024-12-31, 23:59:59 EST"
Account Information,Header,Field Name,Field Value
Account Information,Data,Account,T1234567
`;

    const result = parseReport(reportContent);

    expect(result.parsedReport?.metadata).toEqual({
      period: "January 1, 2024 - December 31, 2024",
      generatedDate: "2024-12-31, 23:59:59 EST",
      account: "T1234567",
    });
  });

  it("should extract interest total and line number correctly", () => {
    const reportContent = `
Interest,Header,Currency,Date,Description,Amount,Code
Interest,Data,EUR,2024-01-15,Credit Interest for Dec-2023,5.75,
Interest,Data,USD,2024-01-15,Credit Interest for Dec-2023,12.50,
Interest,Data,Total Interest in EUR,,,18.25,
`;

    const result = parseReport(reportContent);

    expect(result.totalInterestEUR).toBe(18.25);
    expect(result.totalInterestEURLineNumber).toBe(4);
  });
});
