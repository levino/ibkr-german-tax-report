import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { calculateGermanTax } from "./calculator";
import { parseReport } from "./parser";

describe("calculateGermanTax", () => {
  const testCases = getAllTestCases();

  testCases.forEach(
    ({ reportPath, expectedPath, parsedJsonPath, baseName, folder }) => {
      it(`should calculate correctly for ${baseName} (${folder})`, () => {
        const expectedData = JSON.parse(readFileSync(expectedPath, "utf-8"));

        // Parse the report and calculate tax
        const reportContent = readFileSync(reportPath, "utf-8");
        const parsedData = parseReport(reportContent);
        const result = calculateGermanTax(parsedData);

        // Explicitly write the parsed report as JSON for inspection
        writeFileSync(
          parsedJsonPath,
          JSON.stringify(parsedData.parsedReport, null, 2),
        );

        expect(result.line7).toBe(parseFloat(expectedData["7"]));
        expect(result.line19).toBe(parseFloat(expectedData["19"]));
        expect(result.line37).toBe(parseFloat(expectedData["37"]));
        expect(result.line38).toBe(parseFloat(expectedData["38"]));
        expect(result.line41).toBe(parseFloat(expectedData["41"]));

        // Verify that parsed report structure is included
        expect(parsedData.parsedReport).toBeDefined();
        expect(parsedData.parsedReport?.dividends).toBeDefined();
        expect(parsedData.parsedReport?.withholdingTax).toBeDefined();
        expect(parsedData.parsedReport?.metadata).toBeDefined();
      });
    },
  );
});

// Find all CSV files in both real-reports and test-reports folders
function getAllTestCases() {
  const testCases: {
    reportPath: string;
    expectedPath: string;
    parsedJsonPath: string;
    baseName: string;
    folder: string;
  }[] = [];

  // Check real-reports folder (may not exist)
  const realReportsDir = join(process.cwd(), "real-reports");
  try {
    const realFiles = readdirSync(realReportsDir);
    const realCsvFiles = realFiles.filter((file) => file.endsWith(".csv"));

    realCsvFiles.forEach((csvFile) => {
      const baseName = csvFile.replace(".csv", "");
      const expectedFile = `${baseName}.expected.json`;
      if (realFiles.includes(expectedFile)) {
        testCases.push({
          reportPath: join(realReportsDir, csvFile),
          expectedPath: join(realReportsDir, expectedFile),
          parsedJsonPath: join(realReportsDir, `${baseName}.parsed.json`),
          baseName,
          folder: "real-reports",
        });
      }
    });
    // biome-ignore lint/correctness/noUnusedVariables: Just ignoring an empty or missing folder here.
  } catch (error) {
    // real-reports folder may not exist, ignore
  }

  // Check test-reports folder (should always exist)
  const testReportsDir = join(process.cwd(), "test-reports");
  const testFiles = readdirSync(testReportsDir);
  const testCsvFiles = testFiles.filter((file) => file.endsWith(".csv"));

  testCsvFiles.forEach((csvFile) => {
    const baseName = csvFile.replace(".csv", "");
    const expectedFile = `${baseName}.expected.json`;
    if (testFiles.includes(expectedFile)) {
      testCases.push({
        reportPath: join(testReportsDir, csvFile),
        expectedPath: join(testReportsDir, expectedFile),
        parsedJsonPath: join(testReportsDir, `${baseName}.parsed.json`),
        baseName,
        folder: "test-reports",
      });
    }
  });

  return testCases;
}
