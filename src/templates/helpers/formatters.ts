import Handlebars from "handlebars";

// Currency formatting helper
export function formatCurrency(amount: number): string {
  return `€${amount.toFixed(2)}`;
}

// Default value helper
export function defaultTo<T>(value: T | undefined | null, defaultValue: T): T {
  return value ?? defaultValue;
}

// Sum helper for calculating totals from array of objects
export function sum(
  array: Array<Record<string, number>>,
  property: string,
): number {
  return array.reduce((total, item) => total + (item[property] || 0), 0);
}

// Array helper for creating arrays in templates
export function array(...items: unknown[]): unknown[] {
  // Remove the last item which is the options object from Handlebars
  return items.slice(0, -1);
}

// Register all helpers with Handlebars
export function registerHelpers(): void {
  Handlebars.registerHelper("formatCurrency", formatCurrency);
  Handlebars.registerHelper("defaultTo", defaultTo);
  Handlebars.registerHelper("sum", sum);
  Handlebars.registerHelper("array", array);
}
