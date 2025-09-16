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

export function generateHTMLReport(
  parsedData: IBKRData,
  taxResult: GermanTaxCalculation,
  fileName: string,
): string {
  const transactions = groupTransactionsByLine(parsedData);
  const reportDate = new Date().toLocaleString("de-DE", {
    timeZone: "Europe/Berlin",
  });

  return `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>German Tax Report - Anlage KAP</title>
    <style>
        ${getCSS()}
    </style>
</head>
<body>
    <div class="container">
        ${generateHeader(parsedData, fileName, reportDate)}
        ${generateTaxSummary(taxResult)}
        ${generateTransactionDetails(transactions)}
        ${generateFooter()}
    </div>
</body>
</html>`;
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

  // Line 41: Other withholding tax
  const hasUsdSubtotal = data.withholdingTax.some(
    (tax) =>
      tax.description === "USD Withholding Tax (value according to IBKR)",
  );

  const line41 = hasUsdSubtotal
    ? data.withholdingTax.filter(
        (tax) =>
          tax.description === "USD Withholding Tax (value according to IBKR)",
      )
    : data.withholdingTax.filter(
        (tax) =>
          !tax.description.includes("- DE Tax") &&
          tax.currency === "EUR" &&
          tax.description.includes("Credit Interest"),
      );

  return { line7, line19, line37_38, line41 };
}

function generateHeader(
  data: IBKRData,
  fileName: string,
  reportDate: string,
): string {
  const metadata = data.parsedReport?.metadata;

  return `
    <header class="header">
        <h1>German Tax Report - Anlage KAP</h1>
        <div class="report-info">
            <div class="info-row">
                <span class="label">Source File:</span>
                <span class="value">${fileName}</span>
            </div>
            ${
              metadata?.account
                ? `
            <div class="info-row">
                <span class="label">Account:</span>
                <span class="value">${metadata.account}</span>
            </div>`
                : ""
            }
            ${
              metadata?.period
                ? `
            <div class="info-row">
                <span class="label">Period:</span>
                <span class="value">${metadata.period}</span>
            </div>`
                : ""
            }
            ${
              metadata?.generatedDate
                ? `
            <div class="info-row">
                <span class="label">IBKR Report Generated:</span>
                <span class="value">${metadata.generatedDate}</span>
            </div>`
                : ""
            }
            <div class="info-row">
                <span class="label">Tax Report Generated:</span>
                <span class="value">${reportDate}</span>
            </div>
        </div>
    </header>`;
}

function generateTaxSummary(taxResult: GermanTaxCalculation): string {
  return `
    <section class="tax-summary">
        <h2>Tax Summary</h2>
        <div class="summary-note">
            Copy these values to your German tax return (Anlage KAP):
        </div>
        <table class="summary-table">
            <thead>
                <tr>
                    <th>Line</th>
                    <th>Description</th>
                    <th>Amount (EUR)</th>
                </tr>
            </thead>
            <tbody>
                <tr class="line-7">
                    <td class="line-number">7</td>
                    <td>Kapitalerträge, bei denen Steuer einbehalten wurde</td>
                    <td class="amount positive">€${taxResult.line7.toFixed(2)}</td>
                </tr>
                <tr class="line-19">
                    <td class="line-number">19</td>
                    <td>Andere Kapitalerträge ohne Steuerabzug</td>
                    <td class="amount neutral">€${taxResult.line19.toFixed(2)}</td>
                </tr>
                <tr class="line-37">
                    <td class="line-number">37</td>
                    <td>Einbehaltene Kapitalertragsteuer</td>
                    <td class="amount tax">€${taxResult.line37.toFixed(2)}</td>
                </tr>
                <tr class="line-38">
                    <td class="line-number">38</td>
                    <td>Darauf entfallender Solidaritätszuschlag</td>
                    <td class="amount tax">€${taxResult.line38.toFixed(2)}</td>
                </tr>
                <tr class="line-41">
                    <td class="line-number">41</td>
                    <td>Ausländische Quellensteuer</td>
                    <td class="amount foreign-tax">€${taxResult.line41.toFixed(2)}</td>
                </tr>
            </tbody>
        </table>
    </section>`;
}

function generateTransactionDetails(transactions: TransactionsByLine): string {
  let html =
    '<section class="transaction-details"><h2>Transaction Details</h2>';

  // Line 7 transactions
  if (transactions.line7.length > 0) {
    html += `
      <div class="line-section">
        <h3>Line 7: Dividends Subject to German Tax</h3>
        <table class="transaction-table">
          <thead>
            <tr>
              <th>CSV Line</th>
              <th>Date</th>
              <th>Description</th>
              <th>Currency</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>`;

    for (const dividend of transactions.line7) {
      html += `
        <tr>
          <td class="line-number">${dividend.lineNumber || "—"}</td>
          <td>${dividend.date}</td>
          <td class="description">${dividend.description}</td>
          <td>${dividend.currency}</td>
          <td class="amount positive">€${dividend.amount.toFixed(2)}</td>
        </tr>`;
    }

    html += "</tbody></table></div>";
  }

  // Line 19 transactions
  if (transactions.line19.length > 0) {
    html += `
      <div class="line-section">
        <h3>Line 19: Interest Income</h3>
        <div class="calculation-note">
          This amount comes from IBKR's "Total Interest in EUR" summary line
        </div>
        <table class="transaction-table">
          <thead>
            <tr>
              <th>CSV Line</th>
              <th>Description</th>
              <th>Currency</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>`;

    for (const interest of transactions.line19) {
      html += `
        <tr>
          <td class="line-number">${interest.lineNumber || "—"}</td>
          <td class="description">${interest.description}</td>
          <td>${interest.currency}</td>
          <td class="amount neutral">€${interest.amount.toFixed(2)}</td>
        </tr>`;
    }

    html += "</tbody></table></div>";
  }

  // Line 37/38 transactions
  if (transactions.line37_38.length > 0) {
    html += `
      <div class="line-section">
        <h3>Lines 37 & 38: German Tax Withheld</h3>
        <div class="calculation-note">
          Total German tax is split into Abgeltungssteuer (25%, Line 37) and Solidaritätszuschlag (5.5% of Abgeltungssteuer, Line 38)
        </div>
        <table class="transaction-table">
          <thead>
            <tr>
              <th>CSV Line</th>
              <th>Date</th>
              <th>Description</th>
              <th>Currency</th>
              <th>Amount Withheld</th>
            </tr>
          </thead>
          <tbody>`;

    for (const tax of transactions.line37_38) {
      html += `
        <tr>
          <td class="line-number">${tax.lineNumber || "—"}</td>
          <td>${tax.date}</td>
          <td class="description">${tax.description}</td>
          <td>${tax.currency}</td>
          <td class="amount tax">€${tax.amount.toFixed(2)}</td>
        </tr>`;
    }

    html += "</tbody></table></div>";
  }

  // Line 41 transactions
  if (transactions.line41.length > 0) {
    html += `
      <div class="line-section">
        <h3>Line 41: Foreign Withholding Tax</h3>
        <table class="transaction-table">
          <thead>
            <tr>
              <th>CSV Line</th>
              <th>Date</th>
              <th>Description</th>
              <th>Currency</th>
              <th>Amount Withheld</th>
            </tr>
          </thead>
          <tbody>`;

    for (const tax of transactions.line41) {
      html += `
        <tr>
          <td class="line-number">${tax.lineNumber || "—"}</td>
          <td>${tax.date}</td>
          <td class="description">${tax.description}</td>
          <td>${tax.currency}</td>
          <td class="amount foreign-tax">€${tax.amount.toFixed(2)}</td>
        </tr>`;
    }

    html += "</tbody></table></div>";
  }

  html += "</section>";
  return html;
}

function generateFooter(): string {
  return `
    <footer class="footer">
        <div class="disclaimer">
            <h3>⚠️ IMPORTANT DISCLAIMER</h3>
            <ul>
                <li><strong>This tool provides calculations for informational purposes only</strong></li>
                <li>This is NOT tax advice</li>
                <li>No warranty or guarantee is provided</li>
                <li>You are responsible for verifying all calculations</li>
                <li>Consult a qualified tax professional for guidance</li>
            </ul>
        </div>
        <div class="source-info">
            <p>📖 Please read the README and review the source code:</p>
            <p><a href="https://github.com/levino/ibkr-german-tax-report" target="_blank">
                https://github.com/levino/ibkr-german-tax-report
            </a></p>
            <p>Understand how calculations work before using results.</p>
        </div>
        <div class="generation-info">
            Generated by ibkr-german-tax-report
        </div>
    </footer>`;
}

function getCSS(): string {
  return `
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        background-color: #fff;
    }

    .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
    }

    .header {
        text-align: center;
        margin-bottom: 30px;
        padding-bottom: 20px;
        border-bottom: 2px solid #e0e0e0;
    }

    .header h1 {
        color: #2c3e50;
        margin-bottom: 15px;
        font-size: 2.2em;
        font-weight: 600;
    }

    .report-info {
        background-color: #f8f9fa;
        padding: 15px;
        border-radius: 8px;
        display: inline-block;
        text-align: left;
        min-width: 400px;
    }

    .info-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 5px;
    }

    .info-row:last-child {
        margin-bottom: 0;
    }

    .label {
        font-weight: 600;
        color: #555;
    }

    .value {
        color: #333;
        margin-left: 20px;
    }

    .tax-summary {
        margin-bottom: 40px;
    }

    .tax-summary h2 {
        color: #2c3e50;
        margin-bottom: 15px;
        font-size: 1.8em;
    }

    .summary-note {
        background-color: #e8f4fd;
        padding: 10px 15px;
        border-left: 4px solid #3498db;
        margin-bottom: 20px;
        font-weight: 500;
    }

    .summary-table, .transaction-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 20px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .summary-table th, .transaction-table th {
        background-color: #3498db;
        color: white;
        padding: 12px;
        text-align: left;
        font-weight: 600;
    }

    .summary-table td, .transaction-table td {
        padding: 12px;
        border-bottom: 1px solid #ddd;
    }

    .summary-table tbody tr:hover, .transaction-table tbody tr:hover {
        background-color: #f5f5f5;
    }

    .line-number {
        font-weight: bold;
        background-color: #ecf0f1;
        text-align: center;
        width: 60px;
        font-family: 'Courier New', monospace;
        color: #7f8c8d;
    }

    .description {
        max-width: 300px;
        word-wrap: break-word;
    }

    .amount {
        text-align: right;
        font-weight: 600;
        font-family: 'Courier New', monospace;
    }

    .amount.positive { color: #27ae60; }
    .amount.neutral { color: #f39c12; }
    .amount.tax { color: #3498db; }
    .amount.foreign-tax { color: #9b59b6; }

    .transaction-details h2 {
        color: #2c3e50;
        margin-bottom: 25px;
        font-size: 1.8em;
        border-bottom: 1px solid #ddd;
        padding-bottom: 10px;
    }

    .line-section {
        margin-bottom: 35px;
    }

    .line-section h3 {
        color: #34495e;
        margin-bottom: 15px;
        font-size: 1.3em;
        background-color: #ecf0f1;
        padding: 10px 15px;
        border-radius: 5px;
    }

    .calculation-note {
        background-color: #fff3cd;
        border: 1px solid #ffeaa7;
        padding: 10px 15px;
        border-radius: 5px;
        margin-bottom: 15px;
        font-style: italic;
        color: #856404;
    }

    .footer {
        margin-top: 50px;
        padding-top: 30px;
        border-top: 2px solid #e0e0e0;
    }

    .disclaimer {
        background-color: #fee;
        border: 2px solid #e74c3c;
        padding: 20px;
        border-radius: 8px;
        margin-bottom: 25px;
    }

    .disclaimer h3 {
        color: #c0392b;
        margin-bottom: 15px;
        font-size: 1.2em;
    }

    .disclaimer ul {
        list-style-position: inside;
        color: #721c24;
    }

    .disclaimer li {
        margin-bottom: 8px;
    }

    .source-info {
        background-color: #f8f9fa;
        padding: 15px;
        border-radius: 8px;
        margin-bottom: 20px;
        text-align: center;
    }

    .source-info a {
        color: #3498db;
        text-decoration: none;
        font-weight: 500;
    }

    .source-info a:hover {
        text-decoration: underline;
    }

    .generation-info {
        text-align: center;
        color: #7f8c8d;
        font-size: 0.9em;
        font-style: italic;
    }

    @media print {
        .container {
            max-width: none;
            padding: 10px;
        }

        body {
            font-size: 12px;
        }

        .header h1 {
            font-size: 1.8em;
        }

        .summary-table, .transaction-table {
            font-size: 11px;
        }

        .line-section {
            page-break-inside: avoid;
            margin-bottom: 20px;
        }

        .disclaimer {
            page-break-inside: avoid;
        }
    }

    @page {
        margin: 1in;
    }
  `;
}
