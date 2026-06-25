// Single source of truth for the 3 bundles + the upsell catalogue.
// Imported by:
//   - `app/page.tsx`                  (homepage bundle pricing section)
//   - `app/bundles/[slug]/page.tsx`   (bundle detail / "buy" page)
//   - `app/checkout/page.tsx`         (order summary + payment forward)
//   - `components/ai/sales-assistant` (bundle card in chat → links here)
//
// Why a separate file from `services-data.ts`:
//   - bundles REFER to services by id, so they need the service catalogue
//     to compute "buying-separately" math, but services don't need to
//     know about bundles. Keeping bundles downstream avoids a cycle.
//   - the homepage section was historically inlined into `app/page.tsx`;
//     centralising the data here is a precondition for the dedicated
//     `/bundles/[slug]` product pages.
//
// Pricing convention: every numeric amount is EUR. Rendered through
// `formatPrice(eur, currency)` so EU visitors see €-prices and the rest
// of the world sees USD via the fixed FX rate in `lib/currency.ts`.

import {
  getServiceById,
  type Service,
  type ServiceId,
  type ServicePrice,
} from "./services-data";
import type { Locale } from "./i18n/locale";
import {
  BUNDLES_BG,
  BUNDLE_BONUS_BG,
  BUNDLE_FAQ_BG,
  UPSELLS_BG,
} from "./bundles-data.bg";

// Re-export so consumers (e.g. the buyable adapter, the checkout
// island, the checkout page) can import everything they need from one
// module rather than two.
export type { Service, ServiceId, ServicePrice } from "./services-data";

// ----------------------------------------------------------------------
// Bundle types
// ----------------------------------------------------------------------

export type BundleId = "startup" | "scaleup" | "enterprise";

/**
 * A single line item inside a bundle.
 *
 * - `service` lines REFER to a real service in `services-data.ts`. We
 *   compute their à-la-carte cost from that service's own price object,
 *   so the "buying separately" total stays in sync with the catalogue.
 *   Optional `tier` index is used for `kind: "tiered"` services where
 *   the bundle ships a specific tier (e.g. website 5-page = tier 1).
 *   Optional `note` overrides the line label shown in the bundle's
 *   "What's included" list (for things like "Full redesign — up to 5
 *   pages" instead of the generic catalogue name).
 *
 * - `bonus` lines are fixed-text inclusions that don't map to a
 *   billable service ("Hosted & deployed for you", "Google Analytics
 *   setup"). They do NOT contribute to the à-la-carte total — they're
 *   value-add framing.
 *
 * - `inherit` lines visually represent "Everything in <previous bundle>"
 *   in the UI. They contribute the SUM of the inherited bundle's
 *   priced lines to the à-la-carte total so the math compounds
 *   correctly.
 */
export type BundleLine =
  | {
      kind: "service";
      serviceId: ServiceId;
      tier?: number;
      note?: string;
    }
  | { kind: "bonus"; label: string }
  | { kind: "inherit"; from: BundleId };

export type Bundle = {
  id: BundleId;
  name: string;
  /** Two- or three-word positioning, e.g. "Launch Fast & Cheap". */
  tagline: string;
  /** Visceral one-sentence pain frame shown above the price. */
  pain: string;

  // Pricing
  oneTimeEur: number;
  retainerEur?: number;

  // Composition
  contents: ReadonlyArray<BundleLine>;
  /** Optional "free with retainer" perks (domain + hosting, etc.). */
  freebies?: ReadonlyArray<string>;

  // Sales copy on the homepage card
  roiHook: string;
  roiSavingsEur: number;
  highlight?: boolean;
  nudge?: string;

  /**
   * Per-bundle CTA verb. The user explicitly asked for distinct verbs
   * so each tier feels like a different commitment (lightweight Startup
   * = "get", Scale-Up = "start the process", Enterprise = "buy").
   */
  cta: {
    /** Big primary button on the homepage card + bundle detail page. */
    primary: string;
    /** Smaller helper text under the primary, e.g. "→ Continue to checkout". */
    helper: string;
    /** Mid-flow label inside the dynamic checkout island. */
    checkout: string;
  };

  /**
   * Optional Stripe Payment Link. When set, the checkout page can route
   * the visitor straight to a hosted Stripe checkout. Until Nacho wires
   * up live payment links, the checkout page falls back to a `mailto:`
   * "send order details" CTA + Calendly fallback.
   */
  stripePaymentLink?: string;
};

// ----------------------------------------------------------------------
// Bundle catalogue
// ----------------------------------------------------------------------
// Order = display order on /bundles index + homepage. Cheapest first
// is the convention — visitors anchor on the cheapest price first, then
// the highlighted "Most popular" Scale-Up card in the middle pulls
// them up-tier (it's the modal customer fit; Enterprise is the rarer
// outlier reserved for teams ready to delegate fully to AI agents).

export const BUNDLES: ReadonlyArray<Bundle> = [
  {
    id: "startup",
    name: "Startup Bundle",
    tagline: "Get Online Fast",
    pain: "Get online fast with a professional website + AI that works while you sleep. Launch in 5–7 days — first booking often pays for the whole bundle.",
    oneTimeEur: 173,
    contents: [
      // The bundle's website inclusion is intentionally MORE generous
      // than the à-la-carte tier it references for pricing math —
      // that's the whole point of the bundle. The price math still
      // anchors to tier 0 (1-page) so the "buying separately" total
      // stays a conservative comparison; if anything, the bundle's
      // value is understated.
      {
        kind: "service",
        serviceId: "website",
        tier: 0,
        note: "Custom website — up to 5 pages (mobile-first, SEO-optimized)",
      },
      { kind: "service", serviceId: "chatbot" }, // add-on €50
      { kind: "service", serviceId: "booking" },
      { kind: "bonus", label: "Contact form + email capture" },
      { kind: "bonus", label: "Google Analytics + Search Console setup" },
      { kind: "bonus", label: "Hosted & deployed for you" },
    ],
    roiHook: "Pays for itself with the first booking",
    roiSavingsEur: 600,
    cta: {
      primary: "Get the Startup Bundle",
      helper: "Continue to checkout — pay securely online",
      checkout: "Get the Startup Bundle",
    },
  },
  {
    id: "scaleup",
    name: "Scale-Up Bundle",
    tagline: "Grow and Automate",
    pain: "The complete growth system for businesses ready to scale — advanced automation, CRM, and monthly support that replaces manual work.",
    oneTimeEur: 354,
    retainerEur: 97,
    contents: [
      { kind: "inherit", from: "startup" },
      {
        kind: "service",
        serviceId: "website",
        tier: 1,
        note: "Full redesign — no page limit",
      },
      { kind: "service", serviceId: "ecommerce", note: "E-commerce / payments ready" },
      { kind: "service", serviceId: "marketing-automation", note: "Marketing automation (email + SMS sequences)" },
      { kind: "service", serviceId: "crm", note: "Custom lightweight CRM" },
      {
        kind: "service",
        serviceId: "maintenance",
        note: "Monthly retainer: maintenance + content updates + 2h support",
      },
    ],
    freebies: ["Domain name + hosting — covered by retainer"],
    roiHook: "Replaces 1–2 part-time hires",
    roiSavingsEur: 3000,
    highlight: true,
    nudge:
      "Most growing businesses choose Scale-Up — automation + CRM for businesses that already have customers.",
    cta: {
      primary: "Start the Scale-Up process",
      helper: "Continue to checkout — pay securely online",
      checkout: "Start the Scale-Up process",
    },
  },
  {
    id: "enterprise",
    name: "Enterprise Bundle",
    tagline: "Full AI Transformation",
    pain: "You want to scale revenue without scaling headcount — and you don't have time to wait.",
    oneTimeEur: 971,
    retainerEur: 97,
    contents: [
      { kind: "inherit", from: "scaleup" },
      {
        kind: "service",
        serviceId: "ai-agents",
        note: "Custom AI agent (autonomous virtual employee)",
      },
      { kind: "service", serviceId: "voice-agents", note: "AI voice agent for leads & support" },
      { kind: "service", serviceId: "personalization", note: "AI-powered personalization" },
      {
        kind: "service",
        serviceId: "integrations",
        note: "Advanced API integrations (CRM, ERP, vendors)",
      },
      { kind: "bonus", label: "Priority support + monthly strategy call" },
    ],
    freebies: ["Domain name + hosting — covered by retainer"],
    roiHook: "Replaces a 3–5 person team",
    roiSavingsEur: 5000,
    cta: {
      primary: "Buy the Enterprise Bundle",
      helper: "Continue to checkout — pay securely online",
      checkout: "Buy the Enterprise Bundle",
    },
  },
];

const BUNDLES_BY_ID: Record<BundleId, Bundle> = Object.freeze(
  BUNDLES.reduce(
    (acc, b) => {
      acc[b.id] = b;
      return acc;
    },
    {} as Record<BundleId, Bundle>,
  ),
);

export function getBundle(id: BundleId): Bundle {
  const b = BUNDLES_BY_ID[id];
  if (!b) throw new Error(`Unknown bundle id: ${id}`);
  return b;
}

// ----------------------------------------------------------------------
// Price math
// ----------------------------------------------------------------------

/**
 * The à-la-carte EUR equivalent of buying everything in this bundle as
 * separate services. Used to anchor the bundle's value vs paying line
 * by line ("Buy individually: €993 / Bundle: €354 — you save €639").
 *
 * Lines that are `bonus` (free-text inclusions like "Hosted & deployed
 * for you") contribute zero — they're framing, not billable items.
 *
 * `inherit` lines compound the previous bundle's à-la-carte total, so
 * Scale-Up's "Everything in Startup" picks up €188 instead of zero.
 */
export function getBundleSeparatePriceEur(b: Bundle): number {
  let total = 0;
  for (const line of b.contents) {
    if (line.kind === "service") {
      total += servicePriceEurForBundle(line.serviceId, line.tier);
    } else if (line.kind === "inherit") {
      const parent = getBundle(line.from);
      total += getBundleSeparatePriceEur(parent);
    }
    // bonus lines: no contribution
  }
  return total;
}

/**
 * The visitor's "you save" headline number. Always reported as a
 * positive integer — if a bundle is somehow more expensive than the
 * sum of its parts (shouldn't happen, but guard for it) we clamp to 0
 * so we don't flash a negative number on the marketing card.
 */
export function getBundleSavingsEur(b: Bundle): number {
  const separate = getBundleSeparatePriceEur(b);
  return Math.max(0, separate - b.oneTimeEur);
}

/** Convert a service's `ServicePrice` into a single representative EUR
 *  value for "buying separately" math. Rules:
 *  - `from`:    use `eur` directly (the "starting at" floor).
 *  - `monthly`: use `eur` once (single month) — bundles that include
 *               the maintenance retainer cover the monthly via the
 *               bundle's own `retainerEur`, so we count the retainer
 *               value as 1× the monthly. The savings comparison still
 *               makes sense to a buyer because they'd be paying that
 *               first month anyway.
 *  - `addon`:   use `addonEur` (chatbot is always added to a website,
 *               which the bundle already prices separately).
 *  - `tiered`:  pick the requested `tier` index, defaulting to 0 if
 *               none is specified. Tier order matches `services-data`.
 */
function servicePriceEurForBundle(
  serviceId: ServiceId,
  tier: number | undefined,
): number {
  const svc = getServiceById(serviceId);
  return priceToEur(svc.price, tier);
}

function priceToEur(p: ServicePrice, tier: number | undefined): number {
  switch (p.kind) {
    case "from":
      return p.eur;
    case "monthly":
      return p.eur;
    case "addon":
      return p.addonEur;
    case "tiered": {
      const idx = tier ?? 0;
      const t = p.tiers[idx] ?? p.tiers[0];
      return t.eur;
    }
  }
}

// ----------------------------------------------------------------------
// Upsells
// ----------------------------------------------------------------------
// Optional add-ons offered on the bundle detail page as checkbox
// upsells. The user explicitly asked for "express delivery" as an
// example; the rest are commercially honest and complement the bundle
// without overpromising.
//
// Each upsell costs a flat one-time EUR amount (kept simple — no
// recurring upsells yet to keep the checkout flow predictable).
//
// `recommendedFor` highlights the upsell with a "RECOMMENDED" badge on
// the matching bundle's page. Empty / undefined = available for all
// bundles, no recommendation badge.

export type Upsell = {
  id: string;
  label: string;
  /** 1–2 sentence value framing shown next to the checkbox. */
  description: string;
  eur: number;
  /** Bundle ids where this upsell shines (renders a "Recommended"
   *  badge + pre-checks the box on those bundles' pages). */
  recommendedFor?: ReadonlyArray<BundleId>;
  /** Service ids where this upsell shines. Same UX as
   *  `recommendedFor` but on `/services/<id>` pages. */
  recommendedForServices?: ReadonlyArray<ServiceId>;
  /** Whitelist of service ids the upsell is OFFERED on at all. Leave
   *  undefined to expose the upsell to every service. Used to hide
   *  irrelevant options (e.g. "+5 design revisions" on a maintenance
   *  retainer) from the service detail pages. Bundles always see
   *  every upsell — bundles are bigger purchases and we want to
   *  show breadth there. */
  applicableToServiceIds?: ReadonlyArray<ServiceId>;
};

export const UPSELLS: ReadonlyArray<Upsell> = [
  {
    id: "express-delivery",
    label: "Express delivery",
    description:
      "Cut delivery time roughly in half — front of the queue, weekend work included. Typical: 14 days → 7 days, 7 days → 3 days.",
    eur: 99,
    recommendedFor: ["startup", "scaleup"],
    recommendedForServices: ["website", "ecommerce"],
    // Maintenance is recurring (no "delivery" to compress); personalization
    // is iterative tuning rather than a one-shot ship.
    applicableToServiceIds: [
      "website",
      "ecommerce",
      "chatbot",
      "marketing-automation",
      "crm",
      "booking",
      "integrations",
      "seo",
      "ai-agents",
      "voice-agents",
    ],
  },
  {
    id: "white-glove-onboarding",
    label: "White-glove onboarding call",
    description:
      "1-hour 1:1 walkthrough where I screen-share through every system with your team. Get them confident on day 1 instead of week 2.",
    eur: 49,
    recommendedForServices: ["ecommerce", "crm", "ai-agents", "voice-agents"],
    // Available for every service — every kickoff benefits from a
    // proper handoff.
  },
  {
    id: "extra-revisions",
    label: "+5 design revision rounds",
    description:
      "Most clients are happy with the standard 2 rounds. Pick this if you're particular about pixel-perfect details or have multiple stakeholders.",
    eur: 49,
    recommendedForServices: ["website"],
    // Only design-heavy services have meaningful "rounds" of design
    // to revise. Hidden everywhere else so the checkout stays focused.
    applicableToServiceIds: ["website", "ecommerce"],
  },
  {
    id: "priority-support-90d",
    label: "Priority support — 90 days",
    description:
      "Skip the queue for 3 months post-launch. 4-hour response on weekdays, same-day on outages. Normally retainer-only.",
    eur: 79,
    recommendedFor: ["startup"],
    recommendedForServices: ["voice-agents", "ai-agents"],
    // Maintenance retainer already includes priority support, so this
    // would double-bill there.
    applicableToServiceIds: [
      "website",
      "ecommerce",
      "chatbot",
      "marketing-automation",
      "crm",
      "booking",
      "integrations",
      "seo",
      "personalization",
      "ai-agents",
      "voice-agents",
    ],
  },
  {
    id: "seo-content-sprint",
    label: "SEO content sprint (3 articles)",
    description:
      "3 keyword-targeted blog articles written + published in your first month. Bring in organic traffic before launch even finishes paying for itself.",
    eur: 149,
    recommendedFor: ["scaleup", "enterprise"],
    recommendedForServices: ["seo", "marketing-automation"],
    applicableToServiceIds: [
      "website",
      "ecommerce",
      "marketing-automation",
      "seo",
      "personalization",
    ],
  },
  {
    id: "analytics-dashboard",
    label: "Custom analytics dashboard",
    description:
      "Live dashboard wiring GA4 + Stripe + your CRM into a single revenue + funnel view. Update by phone, screenshot to investors.",
    eur: 199,
    recommendedFor: ["scaleup", "enterprise"],
    recommendedForServices: ["ecommerce", "marketing-automation"],
    applicableToServiceIds: [
      "website",
      "ecommerce",
      "marketing-automation",
      "crm",
      "integrations",
      "ai-agents",
      "voice-agents",
    ],
  },
];

const UPSELLS_BY_ID: Record<string, Upsell> = Object.freeze(
  UPSELLS.reduce(
    (acc, u) => {
      acc[u.id] = u;
      return acc;
    },
    {} as Record<string, Upsell>,
  ),
);

export function getUpsell(id: string): Upsell | undefined {
  return UPSELLS_BY_ID[id];
}

/**
 * Resolve a CSV list of upsell ids (as it appears in `?upsells=a,b,c`
 * on the checkout URL) into the matching `Upsell` objects, deduped and
 * in catalogue order. Unknown ids are silently dropped — never throw
 * over a stale URL the visitor might have bookmarked.
 */
export function resolveUpsells(csv: string | undefined): ReadonlyArray<Upsell> {
  if (!csv) return [];
  const wanted = new Set(
    csv
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  );
  return UPSELLS.filter((u) => wanted.has(u.id));
}

// ----------------------------------------------------------------------
// Locale-aware accessors
// ----------------------------------------------------------------------
//
// Same overlay pattern as `services-data.ts`: the English structures
// above stay the source of truth (ids, prices, ordering, references).
// These helpers project a BG-localised view at request time so call
// sites that already read locale (server components) can swap in the
// right strings without per-field fallbacks.

function localizeBundle(b: Bundle, locale: Locale): Bundle {
  if (locale === "en") return b;
  const overrides = BUNDLES_BG[b.id];
  if (!overrides) return b;
  return {
    ...b,
    name: overrides.name ?? b.name,
    tagline: overrides.tagline ?? b.tagline,
    pain: overrides.pain ?? b.pain,
    contents: b.contents.map((line) => {
      // Service lines: only the per-line `note` is translated. The
      // service id and tier index stay untouched (they're structural).
      if (line.kind === "service" && line.note && overrides.contentNotes) {
        const bgNote = overrides.contentNotes[line.serviceId];
        if (bgNote) return { ...line, note: bgNote };
      }
      // Bonus lines: look up the translated label by exact English text.
      if (line.kind === "bonus") {
        const bgLabel = BUNDLE_BONUS_BG[line.label];
        if (bgLabel) return { ...line, label: bgLabel };
      }
      return line;
    }),
    freebies: overrides.freebies ?? b.freebies,
    roiHook: overrides.roiHook ?? b.roiHook,
    nudge: overrides.nudge ?? b.nudge,
    cta: {
      primary: overrides.cta?.primary ?? b.cta.primary,
      helper: overrides.cta?.helper ?? b.cta.helper,
      checkout: overrides.cta?.checkout ?? b.cta.checkout,
    },
  };
}

export function getLocalizedBundles(locale: Locale): ReadonlyArray<Bundle> {
  if (locale === "en") return BUNDLES;
  return BUNDLES.map((b) => localizeBundle(b, locale));
}

export function getLocalizedBundle(id: BundleId, locale: Locale): Bundle {
  return localizeBundle(getBundle(id), locale);
}

function localizeUpsell(u: Upsell, locale: Locale): Upsell {
  if (locale === "en") return u;
  const overrides = UPSELLS_BG[u.id];
  if (!overrides) return u;
  return {
    ...u,
    label: overrides.label ?? u.label,
    description: overrides.description ?? u.description,
  };
}

export function getLocalizedUpsells(locale: Locale): ReadonlyArray<Upsell> {
  if (locale === "en") return UPSELLS;
  return UPSELLS.map((u) => localizeUpsell(u, locale));
}

export function resolveLocalizedUpsells(
  csv: string | undefined,
  locale: Locale,
): ReadonlyArray<Upsell> {
  return resolveUpsells(csv).map((u) => localizeUpsell(u, locale));
}

/**
 * Per-bundle FAQ for `/bundles/[slug]`. The English source lives inline
 * in the page component (each bundle's FAQ is hand-tuned), so we expose
 * the BG override map here under a locale-aware getter that returns
 * `undefined` for English — the page keeps using its own English FAQ
 * array in that case.
 */
export function getBundleFaqBg(
  id: BundleId,
): ReadonlyArray<{ q: string; a: string }> | undefined {
  return BUNDLE_FAQ_BG[id];
}
