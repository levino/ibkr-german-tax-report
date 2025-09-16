# ibkr-german-tax-report

## 0.0.6

### Patch Changes

- 2982991: Enhance German tax calculations with improved accuracy and comprehensive documentation

  - Split income types: dividends (line 7) and interest (line 19) according to German tax requirements
  - Separate German taxes: Abgeltungssteuer (line 37) and Solidaritätszuschlag (line 38) with correct 25%/5.5% split
  - Improve USD conversion using IBKR's pre-calculated EUR totals to avoid exchange rate issues
  - Add official German tax form terminology matching Anlage KAP
  - Include prominent disclaimers and comprehensive README with calculation explanations
  - Update currency handling to use IBKR's "Total Interest in EUR" and "Total in EUR" values

- 2a846fe: Add comprehensive HTML reports with CSV line number traceability and enhanced transaction details

  - Generate detailed HTML reports alongside CLI output for professional documentation
  - Add CSV line number tracking for all transactions (dividends, taxes, interest totals)
  - Include transaction-level details grouped by German tax form lines (7, 19, 37/38, 41)
  - Professional styling with print-optimized CSS for PDF generation
  - Complete audit trail linking every calculation back to source CSV lines
  - Automatic HTML file generation during tests for validation
  - Enhanced user experience with browser-based report viewing and printing

## 0.0.5

### Patch Changes

- 89b7b58: trigger release

## 0.0.4

### Patch Changes

- 1633dc4: trigger release

## 0.0.3

### Patch Changes

- df0bd2d: fix package.json for release

## 0.0.2

### Patch Changes

- f575a4d: trigger release
