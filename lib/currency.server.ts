// Server-only currency helper. The `next/headers` import below is what
// makes this module server-only — pulling it into a client bundle
// errors at build time. Keep client-safe helpers in `./currency.ts`.
import { headers } from "next/headers";
import { getCountryFromHeaders, getCurrency, type Currency } from "./currency";

/**
 * Read the visitor's country from the request headers (set by the
 * deployment platform — Vercel, Cloudflare, etc.) and resolve it to a
 * display currency. Falls back to EUR when geo information is missing
 * (e.g. local dev) so the page never renders without a price.
 */
export async function detectCurrency(): Promise<Currency> {
  const h = await headers();
  return getCurrency(getCountryFromHeaders(h));
}
