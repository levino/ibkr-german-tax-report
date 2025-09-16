---
"ibkr-german-tax-report": patch
---

Enhance German tax calculations with improved accuracy and comprehensive documentation

- Split income types: dividends (line 7) and interest (line 19) according to German tax requirements
- Separate German taxes: Abgeltungssteuer (line 37) and Solidaritätszuschlag (line 38) with correct 25%/5.5% split
- Improve USD conversion using IBKR's pre-calculated EUR totals to avoid exchange rate issues
- Add official German tax form terminology matching Anlage KAP
- Include prominent disclaimers and comprehensive README with calculation explanations
- Update currency handling to use IBKR's "Total Interest in EUR" and "Total in EUR" values