// Browser-side `track()` helper. Two responsibilities:
//
//   1. Fire the event through the global `window.fbq()` queue with
//      advanced matching (em, ph, fb_login_id) when available.
//
//   2. Mirror the same event to our /api/pixel route handler (CAPI).
//
// Both calls are guarded by the consent cookie.

"use client";

import { readConsentClient } from "./consent";
import { getClientCurrency } from "./currency.client";
import { collectMatchPayload } from "./match-data.client";
import {
  STANDARD_PIXEL_EVENTS,
  type PixelCustomData,
  type PixelEvent,
  type PixelUserData,
} from "./types";
import {
  buildBrowserAdvancedMatching,
  getStoredPixelUserData,
  mergePixelUserData,
  setStoredPixelUserData,
} from "./user-data.client";

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

const PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID ?? "";

/**
 * Fire a Meta Pixel event browser-side AND mirror it to CAPI.
 * User PII is merged with any previously stored values (same session).
 */
export function track(
  event: PixelEvent,
  custom?: PixelCustomData,
  user?: PixelUserData,
): string | null {
  if (typeof window === "undefined") return null;
  if (readConsentClient() !== "accepted") return null;

  if (user && (user.email || user.phone || user.firstName || user.lastName)) {
    setStoredPixelUserData(user);
  }

  const userData = mergePixelUserData(getStoredPixelUserData(), user);
  const payload = enrichCustomData(event, custom);
  const eventId = generateEventId();
  const match = collectMatchPayload();
  const advanced = buildBrowserAdvancedMatching(
    userData,
    match.fbLoginId,
    match.externalId,
  );

  if (typeof window.fbq === "function") {
    // Refresh init advanced matching when PII becomes available.
    if (PIXEL_ID && Object.keys(advanced).length > 0) {
      window.fbq("init", PIXEL_ID, advanced);
    }
    const fbqMethod = STANDARD_PIXEL_EVENTS.has(event) ? "track" : "trackCustom";
    window.fbq(fbqMethod, event, payload ?? {}, {
      eventID: eventId,
      ...advanced,
    });
  }

  void fetch("/api/pixel", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({
      event,
      eventId,
      url: window.location.href,
      referrerUrl: document.referrer || undefined,
      custom: payload ?? null,
      user: hasUserPayload(userData) ? userData : null,
      match,
    }),
    keepalive: true,
  }).catch(() => {
    // Swallow — browser pixel hit already recorded.
  });

  return eventId;
}

/** Sync advanced matching on pixel load (e.g. returning visitor with stored email). */
export function syncPixelAdvancedMatching(): void {
  if (typeof window === "undefined") return;
  if (readConsentClient() !== "accepted") return;
  if (!PIXEL_ID || typeof window.fbq !== "function") return;

  const userData = getStoredPixelUserData();
  const match = collectMatchPayload();
  const advanced = buildBrowserAdvancedMatching(
    userData,
    match.fbLoginId,
    match.externalId,
  );
  if (Object.keys(advanced).length > 0) {
    window.fbq("init", PIXEL_ID, advanced);
  }
}

/** Meta requires a valid ISO currency on Lead (and whenever `value` is set). */
function enrichCustomData(
  event: PixelEvent,
  custom?: PixelCustomData,
): PixelCustomData | undefined {
  const needsCurrency =
    event === "Lead" ||
    (typeof custom?.value === "number" && !custom.currency);

  if (!needsCurrency) return custom;

  return { ...custom, currency: custom?.currency ?? getClientCurrency() };
}

function hasUserPayload(user: PixelUserData): boolean {
  return Boolean(
    user.email?.trim() ||
      user.phone?.trim() ||
      user.firstName?.trim() ||
      user.lastName?.trim(),
  );
}

function generateEventId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
