import type {
  DividendEntry,
  IBKRData,
  ParsedReport,
  WithholdingTaxEntry,
} from "./types";

export function parseReport(reportContent: string): IBKRData {
  const lines = reportContent
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const metadata: ParsedReport["metadata"] = {};
  const dividends: DividendEntry[] = [];
  const withholdingTax: WithholdingTaxEntry[] = [];
  let totalWithholdingTaxEUR: number | undefined;
  let totalInterestEUR: number | undefined;
  let totalInterestEURLineNumber: number | undefined;
  let usdWithholdingTaxEUR: number | undefined;
  let usdWithholdingTaxEURLineNumber: number | undefined;

  let currentSectionName = "";
  let inDividendsSection = false;
  let inWithholdingTaxSection = false;
  let inInterestSection = false;

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];
    const csvLineNumber = lineIndex + 1; // CSV line numbers start at 1

    // Remove BOM and split by comma
    const cleanLine = line.replace(/^\uFEFF/, "");
    const columns = splitCSVLine(cleanLine);

    if (columns.length < 2) continue;

    const [sectionName, type] = columns;

    if (type === "Header") {
      currentSectionName = sectionName;
      inDividendsSection = sectionName === "Dividends";
      inWithholdingTaxSection = sectionName === "Withholding Tax";
      inInterestSection = sectionName === "Interest";
    } else if (type === "Data" && sectionName === currentSectionName) {
      const data = columns.slice(2);

      // Extract metadata
      if (sectionName === "Statement") {
        if (data[0] === "Period") {
          metadata.period = data[1];
        } else if (data[0] === "WhenGenerated") {
          metadata.generatedDate = data[1];
        }
      } else if (sectionName === "Account Information") {
        if (data[0] === "Account") {
          metadata.account = data[1];
        }
      }

      // Process dividend entries
      if (inDividendsSection && data[0] !== "Total" && data[0] !== "") {
        const dividend: DividendEntry = {
          currency: data[0] || "",
          date: data[1] || "",
          description: data[2] || "",
          amount: parseFloat(data[3]) || 0,
          lineNumber: csvLineNumber,
        };
        dividends.push(dividend);
      }

      // Process withholding tax entries
      if (inWithholdingTaxSection) {
        if (data[0] === "Total Withholding Tax in EUR") {
          totalWithholdingTaxEUR = Math.abs(parseFloat(data[3]));
        } else if (data[0] === "Total in EUR" && data[3]) {
          // This is the USD withholding tax subtotal converted to EUR
          usdWithholdingTaxEUR = parseFloat(data[3]) || 0;
          usdWithholdingTaxEURLineNumber = csvLineNumber;
        } else if (
          data[0] !== "Total" &&
          data[0] !== "Total in EUR" &&
          data[0] !== "" &&
          !data[2]?.includes("Total") &&
          data[0] !== "USD" // Skip individual USD entries
        ) {
          const tax: WithholdingTaxEntry = {
            currency: data[0] || "",
            date: data[1] || "",
            description: data[2] || "",
            amount: parseFloat(data[3]) || 0,
            lineNumber: csvLineNumber,
          };
          withholdingTax.push(tax);
        }
      }

      // Process interest entries - only extract the total EUR amount
      if (inInterestSection && data[0] === "Total Interest in EUR") {
        totalInterestEUR = parseFloat(data[3]) || 0;
        totalInterestEURLineNumber = csvLineNumber;
      }
    }
  }

  // Add USD withholding tax subtotal as a single EUR entry
  if (usdWithholdingTaxEUR !== undefined) {
    const periodEndDate = extractPeriodEndDate(metadata.period);
    const usdSubtotalEntry: WithholdingTaxEntry = {
      currency: "EUR",
      date: periodEndDate,
      description: "USD Withholding Tax (value according to IBKR)",
      amount: usdWithholdingTaxEUR,
      lineNumber: usdWithholdingTaxEURLineNumber,
    };
    withholdingTax.push(usdSubtotalEntry);
  }

  const parsedReport: ParsedReport = {
    dividends,
    withholdingTax,
    metadata,
  };

  return {
    dividends,
    withholdingTax,
    totalWithholdingTaxEUR,
    totalInterestEUR,
    totalInterestEURLineNumber,
    parsedReport,
  };
}

function extractPeriodEndDate(period?: string): string {
  if (!period) return "";

  // Extract end date from format like "January 1, 2024 - December 31, 2024"
  const match = period.match(/- (.+)$/);
  if (!match) return "";

  const endDateStr = match[1].trim();

  // Convert from "December 31, 2024" to "2024-12-31"
  try {
    const date = new Date(endDateStr);
    if (Number.isNaN(date.getTime())) return "";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  } catch {
    return "";
  }
}

function splitCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result.map((col) => col.replace(/^"|"$/g, ""));
}

// Keep old function name for backward compatibility
export const parseCSV = parseReport;
