// Currency / geo-pricing helpers shared by Server Components AND
// Client Components. This module is intentionally free of any
// `next/headers` import so it stays client-bundlable. The server-only
// helper that reads request headers lives in `./currency.server.ts`.

export type Currency = "EUR" | "USD";

// Strict EU-27. The product spec is "outside the EU = USD", so EEA
// non-EU countries (Iceland, Liechtenstein, Norway, Switzerland) and
// the post-Brexit UK all fall into USD.
const EU_COUNTRIES: ReadonlySet<string> = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR",
  "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL",
  "PL", "PT", "RO", "SK", "SI", "ES", "SE",
]);

// Fixed EUR→USD rate snapshot (May 2026). Slightly above the spot rate
// so currency moves work in Nacho's favour rather than against him.
// Review quarterly; bump the constant in one place to repropagate
// everywhere prices are rendered.
export const EUR_TO_USD = 1.10;

// Headers that may carry the visitor's country, in priority order.
// `XX` / `T1` are anonymous-network sentinels that some CDNs return —
// treat them as "unknown" and fall through to the safe EUR default.
const COUNTRY_HEADER_NAMES: ReadonlyArray<string> = [
  "x-vercel-ip-country",
  "cf-ipcountry",
  "x-country-code",
];

export function getCountryFromHeaders(h: Headers): string | undefined {
  for (const name of COUNTRY_HEADER_NAMES) {
    const v = h.get(name);
    if (!v) continue;
    const upper = v.toUpperCase();
    if (upper === "XX" || upper === "T1") continue;
    return upper;
  }
  return undefined;
}

export function getCurrency(country: string | undefined): Currency {
  if (!country) return "EUR";
  return EU_COUNTRIES.has(country) ? "EUR" : "USD";
}

const FORMATTERS: Record<Currency, Intl.NumberFormat> = {
  EUR: new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
    currencyDisplay: "narrowSymbol",
  }),
  USD: new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
    currencyDisplay: "narrowSymbol",
  }),
};

/**
 * Format an EUR-denominated amount in the target display currency,
 * with the symbol BEFORE the number (e.g. `€173`, `$190`).
 *
 * USD amounts are derived from EUR via {@link EUR_TO_USD} and rounded
 * to the nearest whole unit — partial cents look noisy on a sales page.
 */
export function formatPrice(eurAmount: number, currency: Currency): string {
  const value = currency === "USD" ? eurAmount * EUR_TO_USD : eurAmount;
  return FORMATTERS[currency].format(Math.round(value));
}

export function currencySymbol(currency: Currency): string {
  return currency === "USD" ? "$" : "€";
}

/**
 * Compact "k"-suffixed price for informal copy (testimonials, hero
 * filler, etc.) — e.g. `€4k` / `$4.4k`. Rounds to one decimal when the
 * thousands aren't a whole number, otherwise drops the decimal.
 */
export function formatPriceK(eurAmount: number, currency: Currency): string {
  const value = currency === "USD" ? eurAmount * EUR_TO_USD : eurAmount;
  const sym = currencySymbol(currency);
  const k = value / 1000;
  return Number.isInteger(k) ? `${sym}${k}k` : `${sym}${k.toFixed(1)}k`;
}
