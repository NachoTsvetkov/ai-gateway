// Server-only theme detection. The `next/headers` import below is what
// makes this module server-only — pulling it into a client bundle
// errors at build time. Keep client-safe primitives in `./theme.ts`.

import { cookies } from "next/headers";
import { type Theme, DEFAULT_THEME, THEME_COOKIE, isTheme } from "./theme";

/**
 * Resolve the theme for the current request. The cookie is the only
 * input — there's no geo or OS-preference fallback because:
 *
 *   - Honouring `prefers-color-scheme` server-side requires a Sec-CH
 *     hint that's still not universally sent, so the first paint
 *     would mismatch what we eventually render on the client.
 *   - The product spec is "light by default; visitor can opt into
 *     dark", which is exactly what `cookie ?? "light"` produces.
 *
 * The cookie is set by the ThemeToggle pill (1-year Max-Age, Path=/),
 * so once a visitor picks dark they keep it across sessions and
 * across every route on the site.
 */
export async function detectTheme(): Promise<Theme> {
  const c = await cookies();
  const cookieValue = c.get(THEME_COOKIE)?.value;
  if (isTheme(cookieValue)) return cookieValue;
  return DEFAULT_THEME;
}
