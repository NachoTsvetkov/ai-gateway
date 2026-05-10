// Consent state for marketing/analytics cookies. Generic enough to
// cover any future tracker (GA, Hotjar, etc.) — today only Meta Pixel
// reads it, but the cookie name + grant/revoke shape is stable.
//
// Default-deny per GDPR/ePrivacy: the absence of a cookie means
// "undecided", and trackers MUST NOT load until the visitor clicks
// Accept on the banner. Once chosen, the value persists for 365 days.

export const CONSENT_COOKIE = "marketing_consent";
export const CONSENT_VALUES = ["accepted", "rejected"] as const;
export type ConsentValue = (typeof CONSENT_VALUES)[number];

export function isConsentValue(value: unknown): value is ConsentValue {
  return (
    typeof value === "string" &&
    (CONSENT_VALUES as readonly string[]).includes(value)
  );
}

/**
 * Read the consent cookie from `document.cookie`. Returns null when:
 *   - we're on the server (no document)
 *   - the cookie isn't set (first-time visitor — banner must show)
 *   - the cookie value isn't one of the legal values (corrupted)
 *
 * Server components should use `readConsentServer()` from
 * `consent.server.ts` instead.
 */
export function readConsentClient(): ConsentValue | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${CONSENT_COOKIE}=([^;]+)`),
  );
  if (!match) return null;
  const v = decodeURIComponent(match[1] ?? "");
  return isConsentValue(v) ? v : null;
}

/**
 * Persist the visitor's choice for 365 days, then dispatch a
 * `consent-change` window event so any mounted listener (the
 * MetaPixel loader, mostly) can react without a full page reload.
 *
 * SameSite=Lax is the default and what we want — the cookie does NOT
 * need to be sent on cross-site iframe loads (we never embed the
 * site that way) and Lax is friendlier to top-level navigations.
 */
export function writeConsentClient(value: ConsentValue): void {
  if (typeof document === "undefined") return;
  const oneYearSeconds = 365 * 24 * 60 * 60;
  document.cookie =
    `${CONSENT_COOKIE}=${encodeURIComponent(value)}` +
    `; max-age=${oneYearSeconds}; path=/; samesite=lax`;
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent<{ value: ConsentValue }>("consent-change", {
        detail: { value },
      }),
    );
  }
}
