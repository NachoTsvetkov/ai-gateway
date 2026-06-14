import "server-only";

import type {
  PixelCustomData,
  PixelEvent,
  PixelUserData,
} from "./types";
import {
  hashedArray,
  normalizeEmail,
  normalizeName,
  normalizePhone,
} from "./normalize";

// Meta Conversions API endpoint. Pin a version so the request shape
// is stable; bump intentionally when migrating to a newer API revision.
const FB_GRAPH_API = "https://graph.facebook.com/v21.0";

type CapiEventInput = {
  event: PixelEvent;
  /** Same uuid the browser pixel sent — required for dedup. */
  eventId: string;
  /** Unix seconds. Defaults to "now" if omitted. */
  eventTime?: number;
  /** Required for website events per Meta CAPI docs. */
  eventSourceUrl?: string;
  /** Optional; improves attribution when present. */
  referrerUrl?: string;
  /** Required for website events — forwarded from the browser request. */
  clientIp?: string;
  clientUserAgent?: string;
  fbp?: string;
  fbc?: string;
  externalId?: string;
  fbLoginId?: string;
  user?: PixelUserData;
  custom?: PixelCustomData | null;
  testEventCode?: string;
};

/**
 * Send one event to Meta's Conversions API.
 * @see https://developers.facebook.com/docs/marketing-api/conversions-api/parameters
 */
export async function sendCapiEvent(input: CapiEventInput): Promise<boolean> {
  const pixelId = process.env.FB_PIXEL_ID;
  const token = process.env.FB_CAPI_ACCESS_TOKEN;
  if (!pixelId || !token) {
    return false;
  }

  if (!input.eventSourceUrl) {
    console.warn(
      `[capi] missing event_source_url for event=${input.event} — required for website events`,
    );
  }
  if (!input.clientUserAgent) {
    console.warn(
      `[capi] missing client_user_agent for event=${input.event} — required for website events`,
    );
  }

  const userData = buildUserData(input);
  const customData =
    input.custom !== null && input.custom !== undefined
      ? mapCustomData(input.custom)
      : undefined;

  const serverEvent: Record<string, unknown> = {
    event_name: input.event,
    event_time: input.eventTime ?? Math.floor(Date.now() / 1000),
    event_id: input.eventId,
    action_source: "website",
    user_data: userData,
  };

  if (input.eventSourceUrl) {
    serverEvent.event_source_url = input.eventSourceUrl;
  }
  if (input.referrerUrl) {
    serverEvent.referrer_url = input.referrerUrl;
  }
  if (customData && Object.keys(customData).length > 0) {
    serverEvent.custom_data = customData;
  }

  const body: Record<string, unknown> = {
    data: [serverEvent],
    access_token: token,
  };
  if (input.testEventCode) {
    body.test_event_code = input.testEventCode;
  }

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

  // Do not hash — required / recommended browser-side match parameters.
  if (input.clientIp) u.client_ip_address = input.clientIp;
  if (input.clientUserAgent) u.client_user_agent = input.clientUserAgent;
  if (input.fbp) u.fbp = input.fbp;
  if (input.fbc) u.fbc = input.fbc;
  if (input.fbLoginId) u.fb_login_id = input.fbLoginId;
  // external_id: hashing recommended but not required; UUID is fine unhashed.
  if (input.externalId) u.external_id = input.externalId;

  // Hashed PII — Meta expects array form in Graph API payloads.
  const em = hashedArray(
    input.user?.email ? normalizeEmail(input.user.email) : undefined,
  );
  if (em) u.em = em;

  const ph = hashedArray(
    input.user?.phone ? normalizePhone(input.user.phone) : undefined,
  );
  if (ph) u.ph = ph;

  const fn = hashedArray(
    input.user?.firstName ? normalizeName(input.user.firstName) : undefined,
  );
  if (fn) u.fn = fn;

  const ln = hashedArray(
    input.user?.lastName ? normalizeName(input.user.lastName) : undefined,
  );
  if (ln) u.ln = ln;

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
  if (c.orderId) out.order_id = c.orderId;
  return out;
}
