// PayPal-specific money helpers. The rest of the app stores prices as
// integer EUR amounts and renders them via `lib/currency.ts`. PayPal
// expects amounts as STRINGS with two decimals plus an explicit
// 3-letter currency code, so this file is the bridge.

import { type Currency, EUR_TO_USD } from "../currency";

/**
 * Convert an EUR-denominated integer amount into the {value, currency_code}
 * shape PayPal expects in `amount.breakdown` and `purchase_unit.amount`.
 *
 * USD conversions reuse the same fixed rate the marketing site shows
 * (`lib/currency.ts`'s `EUR_TO_USD`), so the buyer pays the price they
 * saw on the page.
 */
export function toPayPalAmount(
  eur: number,
  currency: Currency,
): { value: string; currency_code: Currency } {
  const value = currency === "USD" ? eur * EUR_TO_USD : eur;
  // PayPal's API rejects more than two decimals on non-zero-decimal
  // currencies (EUR/USD). `Math.round` matches what's printed on the
  // page so totals add up exactly.
  return {
    value: Math.round(value).toFixed(2),
    currency_code: currency,
  };
}

/**
 * Render the same EUR-derived amount as a bare numeric string (no
 * currency_code) — useful inside item-level breakdowns where the
 * currency_code is set once on the parent purchase_unit.
 */
export function toPayPalAmountValue(
  eur: number,
  currency: Currency,
): string {
  return toPayPalAmount(eur, currency).value;
}

/**
 * Convert from PayPal's string-amount form back to a plain number. Used
 * server-side when validating capture totals against what we expected.
 */
export function fromPayPalAmount(value: string): number {
  const n = Number.parseFloat(value);
  if (!Number.isFinite(n)) {
    throw new Error(`Invalid PayPal amount: ${value}`);
  }
  return n;
}
