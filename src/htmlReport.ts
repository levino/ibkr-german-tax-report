import { readFileSync } from "node:fs";
import { join } from "node:path";
import Handlebars from "handlebars";
import { registerHelpers } from "./templates/helpers/formatters";
import type {
  DividendEntry,
  GermanTaxCalculation,
  IBKRData,
  WithholdingTaxEntry,
} from "./types";

interface TransactionsByLine {
  line7: DividendEntry[];
  line19: {
    description: string;
    amount: number;
    currency: string;
    lineNumber?: number;
  }[];
  line37_38: WithholdingTaxEntry[];
  line41: WithholdingTaxEntry[];
}

// Initialize templates and helpers
let templatesInitialized = false;

function initializeTemplates(): void {
  if (templatesInitialized) return;

  registerHelpers();
  registerPartials();
  templatesInitialized = true;
}

function registerPartials(): void {
  const partialsDir = join(__dirname, "templates", "partials");
  const partialFiles = [
    "header.hbs",
    "tax-summary.hbs",
    "transaction-details.hbs",
    "transaction-section.hbs",
    "transaction-table-interest.hbs",
    "transaction-table-withholding.hbs",
    "footer.hbs",
    "css.hbs",
  ];

  for (const file of partialFiles) {
    const partialName = file.replace(".hbs", "");
    const partialPath = join(partialsDir, file);
    const partialContent = readFileSync(partialPath, "utf8");
    Handlebars.registerPartial(partialName, partialContent);
  }
}

export function generateHTMLReport(
  parsedData: IBKRData,
  taxResult: GermanTaxCalculation,
  fileName: string,
): string {
  initializeTemplates();

  const transactions = groupTransactionsByLine(parsedData);
  const reportDate = new Date().toLocaleString("de-DE", {
    timeZone: "Europe/Berlin",
  });

  const templatePath = join(__dirname, "templates", "report.hbs");
  const templateSource = readFileSync(templatePath, "utf8");
  const template = Handlebars.compile(templateSource);

  const context = {
    fileName,
    reportDate,
    metadata: parsedData.parsedReport?.metadata,
    taxResult,
    transactions,
  };

  return template(context);
}

function groupTransactionsByLine(data: IBKRData): TransactionsByLine {
  // Line 7: EUR dividends already subject to German tax
  const line7 = data.dividends.filter(
    (dividend) => dividend.currency === "EUR",
  );

  // Line 19: Interest income (from totalInterestEUR)
  const line19 =
    data.totalInterestEUR && data.totalInterestEUR > 0
      ? [
          {
            description: "Total Interest in EUR (from IBKR summary)",
            amount: data.totalInterestEUR,
            currency: "EUR",
            lineNumber: data.totalInterestEURLineNumber,
          },
        ]
      : [];

  // Line 37/38: German tax entries
  const line37_38 = data.withholdingTax.filter((tax) =>
    tax.description.includes("- DE Tax"),
  );

  // Line 41: Other withholding tax (includes both EUR entries and USD subtotal)
  const line41 = data.withholdingTax.filter(
    (tax) =>
      // Include USD subtotal entry if it exists
      tax.description === "USD Withholding Tax (value according to IBKR)" ||
      // Include EUR withholding tax entries that are NOT German tax
      (!tax.description.includes("- DE Tax") &&
        tax.currency === "EUR" &&
        tax.description.includes("Credit Interest")),
  );

  return { line7, line19, line37_38, line41 };
}

// Removed - now handled by Handlebars template

// Removed - now handled by Handlebars template

// Removed - now handled by Handlebars template

// Removed - now handled by Handlebars template

// Removed - now handled by Handlebars template
