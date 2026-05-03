// Server-only PayPal REST client. Wraps token acquisition + a thin
// `paypalFetch` helper used by every other module under `lib/paypal/`.
//
// Why a hand-rolled REST client instead of the SDK:
//   - `@paypal/checkout-server-sdk` is officially deprecated.
//   - `@paypal/paypal-server-sdk` is the replacement but bundles
//     ~250kB of generated code we don't need; PayPal's REST surface
//     is small enough that a fetch wrapper stays under 100 lines.
//   - Keeping the client this thin means it works identically in the
//     Next.js runtime (no Node-only dependencies) and in the standalone
//     `scripts/paypal-setup-plans.ts` bootstrapper (run via tsx).
//
// Env-aware: PAYPAL_ENV=sandbox|live picks the base URL. PAYPAL_CLIENT_ID
// + PAYPAL_SECRET are read at call time, never at module load — that
// way unit tests can swap them without restarting the runtime, and the
// client surfaces a clear error at first use instead of crashing during
// bundle-eval if someone forgot to fill .env.local.
//
// Note: this module deliberately does NOT carry an `import "server-only"`
// marker. It's imported by `scripts/paypal-setup-plans.ts` which runs
// under plain Node via `tsx`, where `server-only` (designed for Webpack
// bundling decisions) throws unconditionally and breaks the script. The
// safety net is preserved one layer up: `orders.ts`, `subscriptions.ts`,
// and `plan-store.ts` all declare `server-only`, so any accidental
// import of them from a Client Component fails at build time. Direct
// imports from here are extremely unusual and would surface obvious
// runtime errors (Buffer / process.env / fetch with secret headers).

export type PayPalEnv = "sandbox" | "live";

const SANDBOX_BASE = "https://api-m.sandbox.paypal.com";
const LIVE_BASE = "https://api-m.paypal.com";

export function getPayPalEnv(): PayPalEnv {
  const raw = process.env.PAYPAL_ENV?.toLowerCase();
  // Default to sandbox so a misconfigured deploy never accidentally
  // charges real cards. Going live is an explicit opt-in.
  if (raw === "live") return "live";
  return "sandbox";
}

export function getPayPalBaseUrl(): string {
  return getPayPalEnv() === "live" ? LIVE_BASE : SANDBOX_BASE;
}

function getCredentials(): { clientId: string; secret: string } {
  const clientId = process.env.PAYPAL_CLIENT_ID?.trim();
  const secret = process.env.PAYPAL_SECRET?.trim();
  if (!clientId || !secret) {
    throw new Error(
      "PayPal credentials missing. Set PAYPAL_CLIENT_ID + PAYPAL_SECRET in .env.local " +
        "(get them from https://developer.paypal.com/dashboard/applications/" +
        getPayPalEnv() +
        ").",
    );
  }
  return { clientId, secret };
}

// ----------------------------------------------------------------------
// Access-token cache
// ----------------------------------------------------------------------
//
// PayPal access tokens last ~9 hours. We cache the live token in module
// scope and refresh ~5 min before expiry to avoid a 401 round-trip on
// every API call. The cache key includes the env so flipping
// PAYPAL_ENV at runtime (e.g. in tests) doesn't reuse a stale token.

type CachedToken = {
  accessToken: string;
  expiresAt: number; // epoch ms
  env: PayPalEnv;
};

let cachedToken: CachedToken | undefined;
const TOKEN_REFRESH_MARGIN_MS = 5 * 60 * 1000;

async function getAccessToken(): Promise<string> {
  const env = getPayPalEnv();
  const now = Date.now();
  if (
    cachedToken &&
    cachedToken.env === env &&
    cachedToken.expiresAt - TOKEN_REFRESH_MARGIN_MS > now
  ) {
    return cachedToken.accessToken;
  }

  const { clientId, secret } = getCredentials();
  const auth = Buffer.from(`${clientId}:${secret}`).toString("base64");

  const res = await fetch(`${getPayPalBaseUrl()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    // Tokens are stable across requests; let Next.js cache the response
    // for the token's lifetime if it wants to.
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal token request failed (${res.status}): ${text}`);
  }

  const data = (await res.json()) as {
    access_token: string;
    expires_in: number; // seconds
  };

  cachedToken = {
    accessToken: data.access_token,
    expiresAt: now + data.expires_in * 1000,
    env,
  };
  return data.access_token;
}

// ----------------------------------------------------------------------
// Generic REST helper
// ----------------------------------------------------------------------

export type PayPalFetchOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  /** Optional PayPal-Request-Id for idempotent retries on POST. */
  requestId?: string;
  /** Allows tests / callers to override the base URL (rare). */
  baseUrl?: string;
};

/**
 * Thin fetch wrapper that authenticates against PayPal automatically
 * and surfaces a typed JSON response. Throws a `PayPalApiError` on
 * non-2xx responses so callers can inspect `status` + the parsed body.
 */
export async function paypalFetch<T>(
  path: string,
  options: PayPalFetchOptions = {},
): Promise<T> {
  const { method = "GET", body, requestId, baseUrl } = options;
  const token = await getAccessToken();

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (requestId) headers["PayPal-Request-Id"] = requestId;

  const res = await fetch(`${baseUrl ?? getPayPalBaseUrl()}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  // 204 No Content endpoints (e.g. cancel-subscription) — return an
  // empty object rather than choking on an empty body.
  if (res.status === 204) return {} as T;

  const text = await res.text();
  let parsed: unknown = undefined;
  if (text.length > 0) {
    try {
      parsed = JSON.parse(text);
    } catch {
      // Non-JSON body (rare on PayPal but possible on edge errors).
      parsed = { raw: text };
    }
  }

  if (!res.ok) {
    throw new PayPalApiError(res.status, parsed, path, method);
  }

  return parsed as T;
}

export class PayPalApiError extends Error {
  readonly status: number;
  readonly path: string;
  readonly method: string;
  readonly body: unknown;
  constructor(status: number, body: unknown, path: string, method: string) {
    super(`PayPal ${method} ${path} failed (${status})`);
    this.name = "PayPalApiError";
    this.status = status;
    this.body = body;
    this.path = path;
    this.method = method;
  }
}
