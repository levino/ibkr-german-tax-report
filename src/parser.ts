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

  let currentSectionName = "";
  let inDividendsSection = false;
  let inWithholdingTaxSection = false;

  for (const line of lines) {
    // Remove BOM and split by comma
    const cleanLine = line.replace(/^\uFEFF/, "");
    const columns = splitCSVLine(cleanLine);

    if (columns.length < 2) continue;

    const [sectionName, type] = columns;

    if (type === "Header") {
      currentSectionName = sectionName;
      inDividendsSection = sectionName === "Dividends";
      inWithholdingTaxSection = sectionName === "Withholding Tax";
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
        };
        dividends.push(dividend);
      }

      // Process withholding tax entries
      if (inWithholdingTaxSection) {
        if (data[0] === "Total Withholding Tax in EUR") {
          totalWithholdingTaxEUR = Math.abs(parseFloat(data[3]));
        } else if (
          data[0] !== "Total" &&
          data[0] !== "Total in EUR" &&
          data[0] !== "" &&
          !data[2]?.includes("Total")
        ) {
          const tax: WithholdingTaxEntry = {
            currency: data[0] || "",
            date: data[1] || "",
            description: data[2] || "",
            amount: parseFloat(data[3]) || 0,
          };
          withholdingTax.push(tax);
        }
      }
    }
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
    parsedReport,
  };
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
