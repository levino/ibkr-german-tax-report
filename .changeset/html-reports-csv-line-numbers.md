---
"ibkr-german-tax-report": patch
---

Add comprehensive HTML reports with CSV line number traceability and enhanced transaction details

- Generate detailed HTML reports alongside CLI output for professional documentation
- Add CSV line number tracking for all transactions (dividends, taxes, interest totals)
- Include transaction-level details grouped by German tax form lines (7, 19, 37/38, 41)
- Professional styling with print-optimized CSS for PDF generation
- Complete audit trail linking every calculation back to source CSV lines
- Automatic HTML file generation during tests for validation
- Enhanced user experience with browser-based report viewing and printing