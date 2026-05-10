// Client-safe theme primitives. Anything in this module can be
// imported from both Server and Client Components — no `next/headers`,
// no Node APIs. Server-only detection lives in ./theme.server.ts.
//
// The site is dual-themed:
//   - "light" — teal-accented, off-white surfaces. Default for every
//     visitor who hasn't explicitly opted into dark.
//   - "dark"  — the original navy + blue identity. Same palette the
//     site shipped with for months; preserved verbatim so visitors
//     who already love it keep their experience.
//
// The visitor's choice is persisted in a cookie (rather than
// localStorage) so the server can render the correct `<html class>` on
// first paint — no flash of wrong theme on hard navigations.

export type Theme = "light" | "dark";

export const THEMES: ReadonlyArray<Theme> = ["light", "dark"];

/** Light is the default. The teal-on-white identity is the public face
 *  of the site; dark mode is opt-in for visitors who prefer it. */
export const DEFAULT_THEME: Theme = "light";

/** Cookie name storing the visitor's explicit theme preference. */
export const THEME_COOKIE = "theme";

/** Type guard used by both client (toggle button) and server (cookie
 *  parsing) when a string of unknown origin lands in the theme slot. */
export function isTheme(value: string | undefined | null): value is Theme {
  return value === "light" || value === "dark";
}
