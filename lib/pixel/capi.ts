import "server-only";

import { createHash } from "node:crypto";
import type {
  PixelCustomData,
  PixelEvent,
  PixelUserData,
} from "./types";

// Meta Conversions API endpoint. Pin a version so the request shape
// is stable; bump intentionally when migrating to a newer API revision.
const FB_GRAPH_API = "https://graph.facebook.com/v19.0";

type CapiEventInput = {
  event: PixelEvent;
  /** Same uuid the browser pixel sent — required for dedup. */
  eventId: string;
  /** Unix seconds. Defaults to "now" if omitted. */
  eventTime?: number;
  /** Full URL the visitor was on when the event fired. Helps Meta
   *  attribute conversions to specific landing pages. */
  eventSourceUrl?: string;
  /** Forwarded from the request — Meta uses these for matching. */
  clientIp?: string;
  clientUserAgent?: string;
  /** _fbp / _fbc cookies set by the browser pixel. Big match-quality
   *  boost when present. */
  fbp?: string;
  fbc?: string;
  user?: PixelUserData;
  custom?: PixelCustomData | null;
  /** Set this when running through Meta's Test Events tab — only
   *  events tagged with the matching code show up there. Drop in
   *  production. */
  testEventCode?: string;
};

/**
 * Send one event to Meta's Conversions API. Returns true on a 2xx
 * response, false on any failure (callers don't block on this — the
 * browser pixel already recorded the hit).
 *
 * No-ops cleanly when `FB_PIXEL_ID` or `FB_CAPI_ACCESS_TOKEN` are
 * unset, so the entire integration boots into a "configure later"
 * state without throwing. Useful for local dev + preview deploys
 * that don't carry the secret.
 */
export async function sendCapiEvent(input: CapiEventInput): Promise<boolean> {
  const pixelId = process.env.FB_PIXEL_ID;
  const token = process.env.FB_CAPI_ACCESS_TOKEN;
  if (!pixelId || !token) {
    return false;
  }

  const body = {
    data: [
      {
        event_name: input.event,
        event_time: input.eventTime ?? Math.floor(Date.now() / 1000),
        event_id: input.eventId,
        event_source_url: input.eventSourceUrl,
        action_source: "website" as const,
        user_data: buildUserData(input),
        custom_data:
          input.custom !== null && input.custom !== undefined
            ? mapCustomData(input.custom)
            : undefined,
      },
    ],
    test_event_code: input.testEventCode,
    access_token: token,
  };

  try {
    const res = await fetch(`${FB_GRAPH_API}/${pixelId}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error(
        `[capi] HTTP ${res.status} for event=${input.event} eventId=${input.eventId}: ${text.slice(0, 500)}`,
      );
      return false;
    }
    return true;
  } catch (err) {
    console.error(
      `[capi] network error for event=${input.event} eventId=${input.eventId}:`,
      err,
    );
    return false;
  }
}

function buildUserData(input: CapiEventInput): Record<string, unknown> {
  const u: Record<string, unknown> = {};
  if (input.clientIp) u.client_ip_address = input.clientIp;
  if (input.clientUserAgent) u.client_user_agent = input.clientUserAgent;
  if (input.fbp) u.fbp = input.fbp;
  if (input.fbc) u.fbc = input.fbc;

  // Meta requires PII fields to be SHA-256 hashed (lowercase, trimmed)
  // before hitting the wire. The phone normalisation strips everything
  // but digits per Meta's spec. First/last names follow the same
  // lowercase+trim rule.
  if (input.user?.email) u.em = sha256(input.user.email.trim().toLowerCase());
  if (input.user?.phone) u.ph = sha256(input.user.phone.replace(/\D/g, ""));
  if (input.user?.firstName) u.fn = sha256(input.user.firstName.trim().toLowerCase());
  if (input.user?.lastName) u.ln = sha256(input.user.lastName.trim().toLowerCase());

  return u;
}

function mapCustomData(c: PixelCustomData): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (c.content_ids) out.content_ids = c.content_ids;
  if (c.content_name) out.content_name = c.content_name;
  if (c.content_type) out.content_type = c.content_type;
  if (c.content_category) out.content_category = c.content_category;
  if (typeof c.value === "number") out.value = c.value;
  if (c.currency) out.currency = c.currency;
  return out;
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}
