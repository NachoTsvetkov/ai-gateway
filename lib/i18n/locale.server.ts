// Server-only locale detection. The `next/headers` import below is
// what makes this module server-only — pulling it into a client bundle
// errors at build time. Keep client-safe primitives in `./locale.ts`.

import { cookies, headers } from "next/headers";
import { getCountryFromHeaders } from "../currency";
import {
  type Locale,
  BG_COUNTRY,
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  isLocale,
} from "./locale";

/**
 * Resolve the locale for the current request, in priority order:
 *
 *   1. Explicit cookie (the visitor used the language toggle).
 *   2. Geo header — Bulgaria → `bg`, anything else → `en`.
 *
 * The cookie always wins so the toggle is sticky across visits.
 */
export async function detectLocale(): Promise<Locale> {
  const c = await cookies();
  const cookieValue = c.get(LOCALE_COOKIE)?.value;
  if (isLocale(cookieValue)) return cookieValue;

  const country = await detectCountry();
  if (country === BG_COUNTRY) return "bg";
  return DEFAULT_LOCALE;
}

/**
 * Read the visitor's country from the request headers. Reused for the
 * language-toggle visibility check — the toggle is rendered ONLY when
 * the visitor is in Bulgaria, so non-BG traffic never sees a stray
 * "EN/BG" pill that doesn't match their experience.
 *
 * Returns the same uppercase ISO-3166 country code that
 * `lib/currency.ts` already extracts; `undefined` in local dev or when
 * the deployment platform doesn't supply geo headers.
 *
 * Local-dev escape hatch: `DEV_COUNTRY=BG` in `.env.local` forces the
 * country (and therefore the locale + currency + toggle visibility) so
 * the BG experience can be tested without a VPN. Only honoured when
 * `NODE_ENV !== "production"`, so a misplaced env var on Vercel can't
 * accidentally lock everyone into a single country.
 */
export async function detectCountry(): Promise<string | undefined> {
  const dev = getDevCountryOverride();
  if (dev) return dev;
  const h = await headers();
  return getCountryFromHeaders(h);
}

/**
 * Bundle the two reads into one round-trip — every server component
 * that wants both ends up calling them in sequence anyway, so this
 * keeps page handlers shorter.
 */
export async function detectLocaleAndCountry(): Promise<{
  locale: Locale;
  country: string | undefined;
}> {
  const [locale, country] = await Promise.all([
    detectLocale(),
    detectCountry(),
  ]);
  return { locale, country };
}

/**
 * Returns an uppercase 2-letter country code from `DEV_COUNTRY` if
 * we're not in production, otherwise undefined. Exported for
 * `currency.server.ts` to keep both detections in lockstep — without
 * this, currency would still be EUR-from-fallback even when the dev
 * override forces a non-EU country.
 */
export function getDevCountryOverride(): string | undefined {
  if (process.env.NODE_ENV === "production") return undefined;
  const raw = process.env.DEV_COUNTRY?.trim().toUpperCase();
  if (!raw || raw.length !== 2) return undefined;
  return raw;
}
