// Meta Pixel type surface. We narrow the events Meta supports to the
// five that map to this site's funnel:
//
//   PageView         — every navigation (auto, browser + CAPI)
//   ViewContent      — service / bundle detail page mount
//   Lead             — Calendly click + sales-assistant lead capture
//   SurveyStart      — report form: first successful advance (step 1 → 2)
//   SurveyStep       — report form: each later step completed (step 2–4)
//   InitiateCheckout — "Buy" CTA before PayPal redirect
//   Purchase         — PayPal capture / approve success
//
// Adding a new event means: (1) extend PIXEL_EVENTS below, (2) call
// `track('NewEvent', custom?)` from the right surface, (3) optionally
// pass `user` PII to /api/pixel to improve CAPI match rate.

export const PIXEL_EVENTS = [
  "PageView",
  "ViewContent",
  "Lead",
  "SurveyStart",
  "SurveyStep",
  "InitiateCheckout",
  "Purchase",
] as const;

export type PixelEvent = (typeof PIXEL_EVENTS)[number];

/** Meta standard events — use `fbq('track', …)`. */
export const STANDARD_PIXEL_EVENTS: ReadonlySet<PixelEvent> = new Set([
  "PageView",
  "ViewContent",
  "Lead",
  "InitiateCheckout",
  "Purchase",
]);

/**
 * Optional per-event metadata. Every field is optional — Meta only
 * requires `event_name` + a few user-data signals. We surface the
 * subset we actually use so the call sites stay readable. Reach for
 * the broader Meta `custom_data` schema only when a campaign needs it.
 */
export type PixelCustomData = {
  /** Stable identifier(s) of the thing being viewed/bought (e.g.
   *  service id, bundle slug). Meta uses these for catalog matching
   *  + retargeting. */
  content_ids?: string[];
  content_name?: string;
  /** "service" / "bundle" map cleanly to our funnel; "product" is
   *  here for symmetry with the demo Curated. shop if we ever decide
   *  to track it (currently excluded). */
  content_type?: "product" | "service" | "bundle" | "page" | "audit";
  content_category?: string;
  /** Survey funnel: step just completed (2–4) on `SurveyStep`. */
  step?: number;
  /** Monetary value of the event. ALWAYS pair with `currency` so
   *  Meta's value optimisation works. */
  value?: number;
  currency?: "USD" | "EUR";
  /** PayPal order / subscription id — standard Purchase parameter. */
  orderId?: string;
};

/**
 * PII we may forward to /api/pixel for CAPI hashing. Only the email
 * is used at present (PayPal capture); kept extensible so we can
 * widen this without changing the route's contract later.
 */
export type PixelUserData = {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
};

/** Non-PII parameters Meta uses for event matching (CAPI user_data). */
export type PixelMatchData = {
  fbp?: string;
  fbc?: string;
  externalId?: string;
  fbLoginId?: string;
};
