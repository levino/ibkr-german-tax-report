# IBKR German Tax Report

A CLI tool to generate German tax reports (Anlage KAP) from Interactive Brokers (IBKR) trading reports.

## ⚠️ Important Disclaimer

**This tool is provided for informational purposes only and is not tax advice. We make no warranty or guarantee regarding the accuracy, completeness, or reliability of the calculations. You are solely responsible for the accuracy of your tax return and should consult with a qualified tax professional or advisor for specific tax guidance.**

## Features

- Automatically parses IBKR CSV reports
- Calculates values for German tax form (Anlage KAP) lines 7, 19, 37, 38, and 41
- Handles currency conversion using IBKR's provided EUR totals
- Interactive file selection
- Clear output with official German tax form terminology

## Installation

```bash
npm install -g ibkr-german-tax-report
```

Or run directly with npx:

```bash
npx ibkr-german-tax-report
```

## Usage

1. Download your IBKR activity report in CSV format
2. Place the CSV file in a directory
3. Run the tool in that directory:
   ```bash
   ibkr-german-tax-report
   ```
4. Select your CSV file from the interactive prompt
5. Copy the calculated values to your German tax return (Anlage KAP)

## How Values Are Calculated

### Line 7 - Kapitalerträge, bei denen Steuer einbehalten wurde
**Capital income with tax withheld**

Only includes EUR dividends from German companies where German withholding tax was applied. These dividends are already subject to German capital gains tax (Abgeltungssteuer) and solidarity surcharge.

### Line 19 - Andere Kapitalerträge ohne Steuerabzug
**Other capital income without tax deduction**

Includes interest income from IBKR that has not yet been subject to German tax. The tool:
- Extracts the "Total Interest in EUR" value directly from IBKR reports
- Uses IBKR's currency conversion to avoid exchange rate calculation issues
- Includes both EUR and USD interest converted to EUR by IBKR

**USD Interest Conversion**: Instead of converting individual USD interest payments at different exchange rates throughout the year, the tool uses IBKR's pre-calculated "Total Interest in EUR" value. This approach:
- Avoids complex daily exchange rate lookups
- Uses IBKR's official EUR conversion amounts
- Appears as a single entry dated to the last day of the reporting period

### Line 37 - Einbehaltene Kapitalertragsteuer
**Withheld capital gains tax (Abgeltungssteuer)**

Calculated from German withholding tax entries marked with "- DE Tax". The tool:
- Identifies dividend withholding tax from German sources
- Splits the total German tax into Abgeltungssteuer (25%) and Solidaritätszuschlag (5.5%)
- Formula: `Total German Tax ÷ 1.055 = Abgeltungssteuer`

### Line 38 - Darauf entfallender Solidaritätszuschlag
**Corresponding solidarity surcharge**

The solidarity surcharge portion of German withholding tax:
- Formula: `Total German Tax - Abgeltungssteuer = Solidaritätszuschlag`
- Represents 5.5% of the Abgeltungssteuer

### Line 41 - Ausländische Quellensteuer
**Foreign withholding tax**

Includes withholding taxes from foreign sources, primarily:
- US withholding tax on interest income (20%)
- Uses IBKR's "Total in EUR" conversion for USD withholding tax
- Excludes German withholding tax (which goes to lines 37-38)

## Currency Conversion Approach

The tool handles multi-currency transactions by leveraging IBKR's pre-calculated EUR totals:

1. **USD Interest**: Uses IBKR's "Total Interest in EUR" field instead of converting individual entries
2. **USD Withholding Tax**: Uses IBKR's "Total in EUR" subtotal for USD withholding tax entries
3. **EUR Entries**: Processed directly without conversion

This approach ensures consistency with IBKR's official EUR amounts and avoids discrepancies from daily exchange rate variations.

## Limitations

**⚠️ This tool currently supports only a subset of investment activities:**

- ✅ **Supported**: Dividend payments and interest income
- ❌ **Not supported**:
  - Options trading (puts, calls, assignments)
  - Futures trading
  - Forex trading
  - Capital gains/losses from stock sales
  - Corporate actions (splits, mergers, spin-offs)
  - Cryptocurrency transactions
  - Bond trading (other than interest)

**Additional limitations:**
- Only processes IBKR CSV reports in the standard format
- Requires manual verification of calculated values
- Does not handle complex tax situations or special cases
- No support for loss carryforwards or tax optimization strategies

## File Structure

The tool processes these sections from IBKR CSV reports:
- **Dividends**: EUR dividend payments
- **Interest**: Total interest income (converted to EUR by IBKR)
- **Withholding Tax**: Both German and foreign tax withholdings

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build the project
npm run build

# Run tests
npm test

# Lint code
npm run lint
```

## Contributing

Contributions are welcome! Please ensure:
- All tests pass
- Code follows the existing style
- New features include appropriate tests
- Documentation is updated accordingly

## License

MIT License - see LICENSE file for details.

---

**Remember**: This tool provides calculations based on IBKR data, but you are responsible for verifying the accuracy and completeness of your tax return. Always consult with a qualified tax professional for complex tax situations.