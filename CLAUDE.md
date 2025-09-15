# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a CLI tool for generating German tax reports from Interactive Brokers (IBKR) trading reports. The tool processes CSV files from IBKR and calculates values needed for German tax declarations (Anlage KAP).

## Development Commands

- `npm run dev` - Development mode with Vite
- `npm run build` - Build the project (runs TypeScript compilation and Vite build for both library and CLI)
- `npm run start` - Run the CLI tool with the generate command
- `npm test` - Run tests with Vitest
- `npm run test:ui` - Run tests with Vitest UI
- `npm run lint` - Lint code with Biome

## Architecture

The codebase follows a modular architecture with clear separation of concerns:

- **src/types.ts** - Core TypeScript interfaces for dividend entries, withholding tax entries, parsed reports, IBKR data, and German tax calculations
- **src/parser.ts** - CSV parsing logic for IBKR reports, extracting dividends and withholding tax data
- **src/calculator.ts** - German tax calculation logic that processes parsed data and generates values for tax form lines 7, 37, and 40
- **src/cli.ts** - Interactive CLI interface using Commander.js, Inquirer for file selection, and formatted output with tables and colors
- **src/index.ts** - Main library entry point that exports public API

## Build System

The project uses a dual build approach:
- **Vite** builds the library (`src/index.ts`) for programmatic use
- **TypeScript** separately compiles the CLI (`src/cli.ts`) using `tsconfig.cli.json`

The CLI is distributed as a binary via the `bin` field in package.json pointing to `dist/cli.js`.

## Testing

Uses Vitest for testing with global test functions enabled and Node environment configured. Test files follow the `*.test.ts` naming convention.