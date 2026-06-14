// Client-side helpers for Meta CAPI match parameters. Every `track()`
// call merges this data into the /api/pixel payload so server events
// carry the same signals Meta lists in Events Manager → match quality.

const EXTERNAL_ID_COOKIE = "meta_external_id";
const FBC_MAX_AGE_SECONDS = 90 * 24 * 60 * 60;

function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}=([^;]+)`),
  );
  if (!match?.[1]) return undefined;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

function writeCookie(name: string, value: string, maxAgeSeconds: number): void {
  if (typeof document === "undefined") return;
  document.cookie =
    `${name}=${encodeURIComponent(value)}` +
    `; max-age=${maxAgeSeconds}; path=/; samesite=lax`;
}

/**
 * Meta Click ID (`fbc`). Set by the pixel when `fbclid` is present; we
 * mirror that format as a fallback so CAPI gets fbc even before
 * fbevents.js finishes loading.
 */
export function ensureFbcCookie(): string | undefined {
  const existing = readCookie("_fbc");
  if (existing) return existing;

  if (typeof window === "undefined") return undefined;
  const fbclid = new URLSearchParams(window.location.search).get("fbclid");
  if (!fbclid) return undefined;

  const fbc = `fb.1.${Date.now()}.${fbclid}`;
  writeCookie("_fbc", fbc, FBC_MAX_AGE_SECONDS);
  return fbc;
}

/** Stable advertiser id — not hashed on the CAPI wire. */
export function getOrCreateExternalId(): string {
  const existing = readCookie(EXTERNAL_ID_COOKIE);
  if (existing) return existing;

  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  writeCookie(EXTERNAL_ID_COOKIE, id, 365 * 24 * 60 * 60);
  return id;
}

export type PixelMatchPayload = {
  fbp?: string;
  fbc?: string;
  externalId: string;
  fbLoginId?: string;
};

/** Collect non-PII match fields for every CAPI mirror request. */
export function collectMatchPayload(): PixelMatchPayload {
  const fbc = ensureFbcCookie() ?? readCookie("_fbc");
  const fbp = readCookie("_fbp");
  const fbLoginId = readCookie("_fb_login_id");

  return {
    fbp,
    fbc,
    externalId: getOrCreateExternalId(),
    fbLoginId,
  };
}
