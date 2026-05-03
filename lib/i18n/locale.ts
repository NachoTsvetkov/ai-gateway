// Client-safe locale primitives. Anything in this module can be
// imported from both Server and Client Components — no `next/headers`,
// no `next/cookies`, no Node APIs. Server-only detection lives in
// ./locale.server.ts.

export type Locale = "en" | "bg";

export const LOCALES: ReadonlyArray<Locale> = ["en", "bg"];
export const DEFAULT_LOCALE: Locale = "en";

/** Cookie name storing the visitor's explicit language preference. The
 *  cookie wins over geo-detection, so a Bulgarian visitor who picks
 *  English (or vice versa) doesn't have to override it on every visit. */
export const LOCALE_COOKIE = "locale";

/** ISO-3166 country code that triggers Bulgarian by default. The
 *  language toggle button is also gated on this country code — visitors
 *  outside Bulgaria don't see the toggle at all. */
export const BG_COUNTRY = "BG";

/** Type guard used by both client (toggle button) and server (cookie
 *  parsing) when a string of unknown origin lands in the locale slot. */
export function isLocale(value: string | undefined | null): value is Locale {
  return value === "en" || value === "bg";
}

/**
 * Pull the locale-specific value out of a `{ en, bg }` translation
 * record. The vast majority of localised strings in this codebase live
 * in `lib/i18n/dict.ts` and the bilingual data files (services, bundles)
 * — all share this shape so the same getter handles them all.
 *
 * No falsy-fallback to EN: an empty string is a perfectly valid
 * translation choice (e.g. omitting an English filler word that BG
 * doesn't need), and the type already requires both fields, so the
 * old `entry[locale] || entry.en` was silently flipping intentional
 * empty BG segments back to English.
 */
export type LocalizedString = { readonly en: string; readonly bg: string };

export function tr(entry: LocalizedString, locale: Locale): string {
  return entry[locale];
}

/**
 * Localise an array of strings (e.g. a list of pain points). Same
 * fallback semantics as `tr()`: missing BG falls back to EN.
 */
export type LocalizedStringArray = {
  readonly en: ReadonlyArray<string>;
  readonly bg: ReadonlyArray<string>;
};

export function trArray(
  entry: LocalizedStringArray,
  locale: Locale,
): ReadonlyArray<string> {
  const value = entry[locale];
  if (value && value.length > 0) return value;
  return entry.en;
}

/**
 * Curried form of `tr()` that captures the current locale once and
 * returns a getter. Saves passing locale into every call site inside a
 * single component tree.
 *
 *   const t = createT(locale);
 *   <h1>{t(DICT.home.heroHeadline)}</h1>
 */
export function createT(locale: Locale) {
  return function (entry: LocalizedString): string {
    return tr(entry, locale);
  };
}
