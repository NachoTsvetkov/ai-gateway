// Server-only currency helper. The `next/headers` import below is what
// makes this module server-only — pulling it into a client bundle
// errors at build time. Keep client-safe helpers in `./currency.ts`.
import { headers } from "next/headers";
import { getCountryFromHeaders, getCurrency, type Currency } from "./currency";
import { getDevCountryOverride } from "./i18n/locale.server";

/**
 * Read the visitor's country from the request headers (set by the
 * deployment platform — Vercel, Cloudflare, etc.) and resolve it to a
 * display currency. Falls back to EUR when geo information is missing
 * (e.g. local dev) so the page never renders without a price.
 *
 * Honours the same `DEV_COUNTRY` escape hatch used for locale
 * detection so a developer simulating a BG visitor sees EUR pricing
 * (and a US visitor sees USD) without changing real geo headers.
 */
export async function detectCurrency(): Promise<Currency> {
  const dev = getDevCountryOverride();
  if (dev) return getCurrency(dev);
  const h = await headers();
  return getCurrency(getCountryFromHeaders(h));
}
