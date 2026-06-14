// Browser → Conversions API proxy. The browser pixel records the
// event client-side; this endpoint mirrors it to Meta server-side so
// Meta can dedupe the two hits (using the shared eventId) and we
// keep measuring even when ad blockers / iOS tracking limits prevent
// the browser hit from getting through.
//
// Defence-in-depth checks (in order):
//   1. Body parses as JSON.
//   2. `event` is one of our known PIXEL_EVENTS.
//   3. `eventId` is a non-empty string.
//   4. The visitor's consent cookie is "accepted" — if not, we drop
//      the event silently. The browser caller already gates on
//      consent, but any third party who learned the URL could POST
//      directly without the gate; this is the second line of defence.
//
// Returns 204 on success / "silently dropped" so the browser never
// flags it as an error in DevTools. CAPI failures are logged inside
// `sendCapiEvent` and never propagate to the user.

import { NextResponse, type NextRequest } from "next/server";

import { CONSENT_COOKIE, isConsentValue } from "lib/pixel/consent";
import { sendCapiEvent } from "lib/pixel/capi";
import {
  PIXEL_EVENTS,
  type PixelCustomData,
  type PixelEvent,
  type PixelMatchData,
  type PixelUserData,
} from "lib/pixel/types";

type RequestBody = {
  event?: unknown;
  eventId?: unknown;
  url?: unknown;
  referrerUrl?: unknown;
  custom?: unknown;
  user?: unknown;
  match?: unknown;
};

export async function POST(req: NextRequest) {
  // Consent gate. Drop with 204 (not 4xx) so a logged-out visitor
  // never sees a noisy console error.
  const consentValue = req.cookies.get(CONSENT_COOKIE)?.value;
  if (!isConsentValue(consentValue) || consentValue !== "accepted") {
    return new NextResponse(null, { status: 204 });
  }

  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (
    typeof body.event !== "string" ||
    !PIXEL_EVENTS.includes(body.event as PixelEvent)
  ) {
    return NextResponse.json({ error: "invalid_event" }, { status: 400 });
  }
  if (typeof body.eventId !== "string" || body.eventId.length === 0) {
    return NextResponse.json({ error: "invalid_eventId" }, { status: 400 });
  }

  const event = body.event as PixelEvent;
  const eventId = body.eventId;
  const url =
    (typeof body.url === "string" && body.url.length > 0
      ? body.url
      : undefined) ??
    req.headers.get("referer") ??
    undefined;
  const referrerUrl =
    typeof body.referrerUrl === "string" && body.referrerUrl.length > 0
      ? body.referrerUrl
      : undefined;
  const custom = isCustomData(body.custom) ? body.custom : null;
  const user = isUserData(body.user) ? body.user : undefined;
  const match = isMatchData(body.match) ? body.match : undefined;

  // Forwarded headers from Vercel / proxy. `x-forwarded-for` is a
  // comma-separated list with the original client IP first; fall back
  // to `x-real-ip` for single-hop deployments.
  const forwarded = req.headers.get("x-forwarded-for");
  const clientIp =
    forwarded?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    undefined;
  const clientUserAgent = req.headers.get("user-agent") ?? undefined;

  // Meta pixel cookies set browser-side. Body values win when present
  // (client reads cookies at event time; request cookies are a fallback).
  const fbp = match?.fbp ?? req.cookies.get("_fbp")?.value;
  const fbc = match?.fbc ?? req.cookies.get("_fbc")?.value;
  const externalId = match?.externalId;
  const fbLoginId = match?.fbLoginId;

  // When `FB_CAPI_TEST_EVENT_CODE` is set, every event is tagged so
  // Meta routes it to the Test Events tab in real time instead of
  // counting it as production traffic. Leave UNSET on Vercel; only
  // populate it locally / in preview when actively debugging match
  // quality. The env var is the single switch — there's no per-
  // request override so a third party can't sneak the test flag onto
  // real traffic to skew dashboards.
  const testEventCode = process.env.FB_CAPI_TEST_EVENT_CODE || undefined;

  // Fire-and-forget at the SDK level — sendCapiEvent already swallows
  // its own errors. We `await` here only so the route handler stays
  // alive long enough on serverless platforms (Vercel) for the
  // upstream POST to leave the function.
  await sendCapiEvent({
    event,
    eventId,
    eventSourceUrl: url,
    referrerUrl,
    clientIp,
    clientUserAgent,
    fbp,
    fbc,
    externalId,
    fbLoginId,
    custom,
    user,
    testEventCode,
  });

  return new NextResponse(null, { status: 204 });
}

// ---------------------------------------------------------------------
// Narrow runtime guards. The route receives JSON from a same-origin
// fetch so the data is *probably* well-formed, but we still treat
// the body as untrusted and only forward fields we recognise.
// ---------------------------------------------------------------------

function isCustomData(value: unknown): value is PixelCustomData {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  if (
    v.content_ids !== undefined &&
    !(
      Array.isArray(v.content_ids) &&
      v.content_ids.every((x) => typeof x === "string")
    )
  ) {
    return false;
  }
  if (v.content_name !== undefined && typeof v.content_name !== "string") {
    return false;
  }
  if (v.content_type !== undefined && typeof v.content_type !== "string") {
    return false;
  }
  if (v.value !== undefined && typeof v.value !== "number") {
    return false;
  }
  if (v.currency !== undefined && typeof v.currency !== "string") {
    return false;
  }
  if (v.orderId !== undefined && typeof v.orderId !== "string") {
    return false;
  }
  return true;
}

function isUserData(value: unknown): value is PixelUserData {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  for (const key of ["email", "phone", "firstName", "lastName"] as const) {
    if (v[key] !== undefined && typeof v[key] !== "string") {
      return false;
    }
  }
  return true;
}

function isMatchData(value: unknown): value is PixelMatchData {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  for (const key of ["fbp", "fbc", "externalId", "fbLoginId"] as const) {
    if (v[key] !== undefined && typeof v[key] !== "string") {
      return false;
    }
  }
  return true;
}
