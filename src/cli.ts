#!/usr/bin/env node

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import chalk from "chalk";
import Table from "cli-table3";
import { Command } from "commander";
import inquirer from "inquirer";
import { calculateGermanTax } from "./calculator.ts";
import { parseReport } from "./parser.ts";
import type { GermanTaxCalculation, IBKRData } from "./types.ts";

const program = new Command();

program
  .name("ibkr-german-tax-report")
  .description("Generate German tax reports from IBKR trading reports")
  .version("0.0.1");

program
  .command("generate")
  .description("Generate tax report from CSV file")
  .action(async () => {
    try {
      // Find CSV files in current directory
      const currentDir = process.cwd();
      const files = readdirSync(currentDir);
      const csvFiles = files.filter((file) => file.endsWith(".csv"));

      if (csvFiles.length === 0) {
        console.log(
          chalk.red("❌ No CSV files found in the current directory."),
        );
        console.log(
          chalk.gray(
            "Please make sure you have an IBKR report CSV file in this folder.",
          ),
        );
        process.exit(1);
      }

      // Interactive file selection
      const { selectedFile } = await inquirer.prompt([
        {
          type: "list",
          name: "selectedFile",
          message: "Select an IBKR CSV report file:",
          choices: csvFiles.map((file) => ({
            name: `📄 ${file}`,
            value: file,
          })),
        },
      ]);

      console.log(chalk.blue(`\n🔍 Processing ${selectedFile}...\n`));

      // Parse and calculate
      const reportPath = join(currentDir, selectedFile);
      const reportContent = readFileSync(reportPath, "utf-8");
      const parsedData = parseReport(reportContent);
      const taxResult = calculateGermanTax(parsedData);

      // Display results
      displayResults(parsedData, taxResult);
    } catch (error) {
      console.error(
        chalk.red("❌ Error:"),
        error instanceof Error ? error.message : error,
      );
      process.exit(1);
    }
  });

function displayResults(parsedData: IBKRData, taxResult: GermanTaxCalculation) {
  // Header
  console.log(chalk.green.bold("🇩🇪 German Tax Report"));
  console.log(chalk.gray("=".repeat(50)));

  // Account info
  if (parsedData.parsedReport?.metadata) {
    const meta = parsedData.parsedReport.metadata;
    console.log(chalk.cyan("📊 Report Information:"));
    if (meta.account) console.log(`   Account: ${chalk.white(meta.account)}`);
    if (meta.period) console.log(`   Period: ${chalk.white(meta.period)}`);
    if (meta.generatedDate)
      console.log(`   Generated: ${chalk.white(meta.generatedDate)}`);
    console.log();
  }

  // Tax calculations table
  const table = new Table({
    head: [
      chalk.yellow.bold("Line"),
      chalk.yellow.bold("Description"),
      chalk.yellow.bold("Amount (EUR)"),
    ],
    colWidths: [8, 40, 20],
    style: {
      head: [],
      border: ["cyan"],
    },
  });

  table.push(
    [
      "7",
      "Dividends subjected to German withholding tax",
      chalk.green.bold(`€${taxResult.line7.toFixed(2)}`),
    ],
    [
      "37",
      "German withholding tax on dividends",
      chalk.blue.bold(`€${taxResult.line37.toFixed(2)}`),
    ],
    [
      "40",
      "Other withholding tax (credit interest)",
      chalk.magenta.bold(`€${taxResult.line40.toFixed(2)}`),
    ],
  );

  console.log(table.toString());
  console.log();

  // Summary stats
  console.log(chalk.cyan("📈 Summary:"));
  console.log(
    `   ${chalk.white(`${parsedData.dividends?.length || 0}`)} dividend payments processed`,
  );
  console.log(
    `   ${chalk.white(`${parsedData.withholdingTax?.length || 0}`)} withholding tax entries processed`,
  );
  console.log();

  console.log(chalk.green("✅ Report generated successfully!"));
  console.log(
    chalk.gray("Copy these values to your German tax return (Anlage KAP)."),
  );
}

// Set default command
program.action(() => {
  program.help();
});

program.parse();
