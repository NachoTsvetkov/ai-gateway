// Browser-side `track()` helper. Two responsibilities:
//
//   1. Fire the event through the global `window.fbq()` queue so the
//      Meta browser pixel records it (cookies, retargeting audiences,
//      etc.). The fbq snippet creates the queue immediately on script
//      execution, so calling fbq() before fbevents.js finishes
//      loading is safe — events queue and replay.
//
//   2. Mirror the same event to our /api/pixel route handler, which
//      forwards it to the Conversions API. A shared `eventID` allows
//      Meta to dedupe the two hits on its end (recommended pattern
//      per the Conversions API docs).
//
// Both calls are guarded by the consent cookie. If the visitor hasn't
// clicked Accept on the banner, both branches no-op silently.

"use client";

import { readConsentClient } from "./consent";
import type { PixelCustomData, PixelEvent, PixelUserData } from "./types";

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

/**
 * Fire a Meta Pixel event browser-side AND mirror it to CAPI.
 * Returns the eventId used so callers can correlate (e.g. log a
 * Purchase id ↔ pixel eventId mapping for debugging).
 */
export function track(
  event: PixelEvent,
  custom?: PixelCustomData,
  user?: PixelUserData,
): string | null {
  if (typeof window === "undefined") return null;
  if (readConsentClient() !== "accepted") return null;

  const eventId = generateEventId();

  // Browser pixel hit. The custom data + eventID pattern matches
  // Meta's recommended snippet exactly so dedup against CAPI works
  // out of the box.
  if (typeof window.fbq === "function") {
    window.fbq("track", event, custom ?? {}, { eventID: eventId });
  }

  // CAPI mirror. Fire-and-forget — the browser already recorded the
  // hit, so a CAPI failure never blocks the user. `keepalive` lets
  // the request survive a navigation away from the page (important
  // for InitiateCheckout right before redirecting to PayPal).
  void fetch("/api/pixel", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event,
      eventId,
      url: window.location.href,
      custom: custom ?? null,
      user: user ?? null,
    }),
    keepalive: true,
  }).catch(() => {
    // Swallow. The browser pixel hit is already in flight; CAPI
    // dropouts only hurt deduplication, not measurement.
  });

  return eventId;
}

function generateEventId(): string {
  // crypto.randomUUID is available in all evergreen browsers + Node 16+.
  // The fallback handles ancient browsers and any edge case where the
  // Web Crypto API is unavailable (very rare).
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
