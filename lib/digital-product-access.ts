import { createHmac, timingSafeEqual } from "crypto";
import type { DigitalProductId } from "./digital-products-data";

export const ACCESS_COOKIE_NAME = "conversion_scorecard_access";
export const LIBRARY_BASE_PATH = "/shopify-conversion-kit/library";
export const LIBRARY_KYC_PATH = "/api/conversion-scorecard/kyc";
export const LIBRARY_LOGIN_PATH = "/shopify-conversion-kit/login";
export const LIBRARY_LOGOUT_PATH = "/shopify-conversion-kit/logout";
export const LIBRARY_GRANT_PATH = "/shopify-conversion-kit/access";

/** Older deploys scoped the cookie to the library path only. */
export const LEGACY_LIBRARY_ACCESS_COOKIE_PATHS = [
  LIBRARY_BASE_PATH,
  "/shopify-conversion-kit/library/",
] as const;

function accessSecret(): string {
  const secret =
    process.env.DIGITAL_PRODUCT_ACCESS_SECRET?.trim() ||
    process.env.PAYPAL_SECRET?.trim();
  const isProd =
    process.env.VERCEL_ENV === "production" ||
    process.env.NODE_ENV === "production";

  if (!secret && isProd) {
    throw new Error(
      "DIGITAL_PRODUCT_ACCESS_SECRET (or PAYPAL_SECRET) is required in production",
    );
  }

  return secret ?? "dev-only-conversion-scorecard-secret";
}

function signPayload(payload: string): string {
  return createHmac("sha256", accessSecret())
    .update(payload)
    .digest("base64url");
}

/** Issue a lifetime access token after PayPal order capture. */
export function createDigitalProductAccessToken(
  productId: DigitalProductId,
  orderId: string,
): string {
  const payload = `${productId}|${orderId.trim()}`;
  return `${Buffer.from(payload, "utf8").toString("base64url")}.${signPayload(payload)}`;
}

export function verifyDigitalProductAccessToken(token: string): boolean {
  const payload = parseSignedAccessPayload(token);
  if (!payload || payload.startsWith("email|")) return false;
  return payload.includes("|");
}

export function parseSignedAccessPayload(token: string): string | null {
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;

  const payloadB64 = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  let payload: string;
  try {
    payload = Buffer.from(payloadB64, "base64url").toString("utf8");
  } catch {
    return null;
  }

  const expected = signPayload(payload);
  try {
    const a = Buffer.from(sig, "utf8");
    const b = Buffer.from(expected, "utf8");
    if (a.length !== b.length) return null;
    if (!timingSafeEqual(a, b)) return null;
    return payload;
  } catch {
    return null;
  }
}

/** Email session issued after library login (post-purchase return visits). */
export function createLibraryEmailAccessToken(
  productId: DigitalProductId,
  email: string,
): string {
  const payload = `email|${productId}|${normalizeLibraryEmail(email)}`;
  return `${Buffer.from(payload, "utf8").toString("base64url")}.${signPayload(payload)}`;
}

export function normalizeLibraryEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function verifyLibraryEmailAccessToken(token: string): boolean {
  const payload = parseSignedAccessPayload(token);
  if (!payload?.startsWith("email|")) return false;
  const parts = payload.split("|");
  return parts.length === 3 && parts[1] === "shopify-conversion-kit";
}

/** Accepts purchase token (from checkout) or email session token (from login). */
export function verifyLibraryAccessToken(token: string): boolean {
  const payload = parseSignedAccessPayload(token);
  if (!payload) return false;
  if (payload.startsWith("email|")) {
    return verifyLibraryEmailAccessToken(token);
  }
  return payload.includes("|");
}

export function libraryAccessCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  };
}

type CookieStoreLike = {
  get: (name: string) => { value: string } | undefined;
  getAll?: () => Array<{ name: string; value: string }>;
};

/** Read access token — prefers any valid duplicate cookie over a stale first match. */
export function readLibraryAccessToken(
  cookieStore: CookieStoreLike,
): string | undefined {
  const direct = cookieStore.get(ACCESS_COOKIE_NAME)?.value;
  if (!cookieStore.getAll) return direct;

  const candidates = cookieStore
    .getAll()
    .filter((entry) => entry.name === ACCESS_COOKIE_NAME)
    .map((entry) => entry.value);

  if (direct && !candidates.includes(direct)) {
    candidates.unshift(direct);
  }

  for (const value of candidates) {
    if (verifyLibraryAccessToken(value)) return value;
  }

  return direct;
}

export function clearLegacyLibraryAccessCookies(
  response: { cookies: { set: (name: string, value: string, options: object) => void } },
) {
  for (const legacyPath of LEGACY_LIBRARY_ACCESS_COOKIE_PATHS) {
    response.cookies.set(ACCESS_COOKIE_NAME, "", {
      ...libraryAccessCookieOptions(),
      path: legacyPath,
      maxAge: 0,
    });
  }
}

export function setLibraryAccessCookie(
  response: { cookies: { set: (name: string, value: string, options: object) => void } },
  token: string,
) {
  clearLegacyLibraryAccessCookies(response);
  response.cookies.set(ACCESS_COOKIE_NAME, token, libraryAccessCookieOptions());
}

export function libraryPath(
  segment?: string,
  accessToken?: string | null,
): string {
  if (accessToken) {
    const params = new URLSearchParams({ access: accessToken });
    if (segment) params.set("dest", segment);
    return `${LIBRARY_GRANT_PATH}?${params.toString()}`;
  }
  const base = segment
    ? `${LIBRARY_BASE_PATH}/${segment}`
    : LIBRARY_BASE_PATH;
  return base;
}
