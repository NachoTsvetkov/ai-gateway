// Single source of truth for the 12 a-la-carte services. Imported by:
//   - `app/page.tsx`              (homepage 3-service teaser)
//   - `app/services/page.tsx`     (full catalogue grouped by pain)
//
// Prices are stored as numeric EUR amounts and rendered through
// `formatPrice(eur, currency)` so EU visitors see €-prices and the
// rest of the world sees USD via the fixed FX rate in `lib/currency.ts`.
// If you change a price here it propagates everywhere automatically.

import { formatPrice, type Currency } from "./currency";

// ----------------------------------------------------------------------
// Service pricing — discriminated union to capture the few different
// price-shape conventions used across the catalogue.
// ----------------------------------------------------------------------

export type ServicePrice =
  | { kind: "from"; eur: number; trail?: string }
  | { kind: "addon"; addonEur: number; combinedEur: number }
  | { kind: "monthly"; eur: number }
  | { kind: "tiered"; tiers: Array<{ label: string; eur: number }> };

export function renderServicePrice(
  p: ServicePrice,
  currency: Currency,
): string {
  switch (p.kind) {
    case "from":
      return `Starting at ${formatPrice(p.eur, currency)}${p.trail ? ` ${p.trail}` : ""}`;
    case "addon":
      return `Add-on +${formatPrice(p.addonEur, currency)} (full site with chatbot: ${formatPrice(p.combinedEur, currency)})`;
    case "monthly":
      return `${formatPrice(p.eur, currency)}/month`;
    case "tiered":
      return `Starting at ${p.tiers
        .map((t) => `${formatPrice(t.eur, currency)} (${t.label})`)
        .join(" / ")}`;
  }
}

// Two-line variant of `renderServicePrice` used by the homepage teaser
// cards. Each card has a fixed-height price block where the small/intro
// offer goes on the first line and the larger/expanded offer goes on
// the second — keeps all three cards visually balanced regardless of
// price shape, and prevents long prices from squeezing the "See
// details" affordance to the right.
//
// Mapping per kind:
//  - tiered:  first tier on top, remaining tiers joined on the second
//             (e.g. "Starting at €59 (1-page)" / "€97 (3-page)")
//  - addon:   add-on price on top, bundled-site price on the second
//             (e.g. "Add-on +€50" / "Full site with chatbot: €323")
//  - from:    the "Starting at" kicker on top, the actual amount on the
//             second so single-amount services still fill two rows
//  - monthly: "Monthly retainer" kicker on top, "€97/month" below
export function renderServicePriceParts(
  p: ServicePrice,
  currency: Currency,
): { primary: string; secondary: string } {
  switch (p.kind) {
    case "from":
      return {
        primary: "Starting at",
        secondary: `${formatPrice(p.eur, currency)}${p.trail ? ` ${p.trail}` : ""}`,
      };
    case "addon":
      return {
        primary: `Add-on +${formatPrice(p.addonEur, currency)}`,
        secondary: `Full site with chatbot: ${formatPrice(p.combinedEur, currency)}`,
      };
    case "monthly":
      return {
        primary: "Monthly retainer",
        secondary: `${formatPrice(p.eur, currency)}/month`,
      };
    case "tiered": {
      const [first, ...rest] = p.tiers;
      return {
        primary: `Starting at ${formatPrice(first.eur, currency)} (${first.label})`,
        secondary: rest
          .map((t) => `${formatPrice(t.eur, currency)} (${t.label})`)
          .join(" / "),
      };
    }
  }
}

// ----------------------------------------------------------------------
// Pain-point categories. Order is the order they appear on /services.
// Top → bottom is roughly priority of pain in SMB owner research:
//   "I can't find customers" → "they don't buy" → "I'm overworked"
//   → "my brand looks bad" — the first three are the most reported
//   acute pains in U.S. SBA / Salesforce / Gartner SMB studies; the
//   last is foundational but felt as background noise rather than
//   acute pain.
// ----------------------------------------------------------------------

export type PainCategoryId =
  | "more-customers"
  | "convert-visitors"
  | "save-time"
  | "look-professional";

export type PainCategory = {
  id: PainCategoryId;
  /** First-person voice — "I want to ___" or "I'm ___". */
  hook: string;
  /** Section heading. */
  title: string;
  /** 1-sentence intro under the heading. */
  description: string;
  /** Tailwind colour token used for the accent dot/badge. */
  accent: "blue" | "violet" | "emerald" | "amber";
};

export const PAIN_CATEGORIES: ReadonlyArray<PainCategory> = [
  {
    id: "more-customers",
    hook: "I'm not getting enough customers",
    title: "Get more customers",
    description:
      "Be findable on Google, run automated outbound, and turn cold prospects into qualified leads — even while you sleep.",
    accent: "blue",
  },
  {
    id: "convert-visitors",
    hook: "Visitors leave without buying",
    title: "Convert more visitors into buyers",
    description:
      "Capture, qualify, and follow up with every lead in seconds — and personalise the experience so they actually buy.",
    accent: "violet",
  },
  {
    id: "save-time",
    hook: "I'm drowning in repetitive work",
    title: "Stop wasting time on manual work",
    description:
      "Automate the boring parts of running your business so your hours go into the work that actually grows revenue.",
    accent: "emerald",
  },
  {
    id: "look-professional",
    hook: "My online presence looks dated",
    title: "Build a professional online presence",
    description:
      "A fast, beautiful site + payments + ongoing maintenance so customers trust you the moment they land.",
    accent: "amber",
  },
];

// ----------------------------------------------------------------------
// Services. Stable `id` slugs let us reference specific services from
// other places (homepage hooks, AI assistant, future deep links).
// ----------------------------------------------------------------------

export type ServiceId =
  | "website"
  | "ecommerce"
  | "chatbot"
  | "marketing-automation"
  | "crm"
  | "booking"
  | "integrations"
  | "seo"
  | "personalization"
  | "maintenance"
  | "ai-agents"
  | "voice-agents";

export type Service = {
  id: ServiceId;
  name: string;
  pain: string;
  solution: string;
  price: ServicePrice;
  /** Primary pain category for grouping on /services. */
  painCategoryId: PainCategoryId;
};

export const services: ReadonlyArray<Service> = [
  // — Look professional ------------------------------------------------
  {
    id: "website",
    name: "Custom Responsive Website Build/Redesign",
    pain: "Your current site looks outdated, loads slowly on mobile, ranks poorly, and doesn’t capture leads.",
    solution:
      "Lightning-fast, SEO-optimized, mobile-first sites with forms, analytics & booking.",
    price: {
      kind: "tiered",
      tiers: [
        { label: "1-page", eur: 59 },
        { label: "3-page", eur: 97 },
      ],
    },
    painCategoryId: "look-professional",
  },
  {
    id: "ecommerce",
    name: "E-commerce Store Setup & Customization",
    pain: "Inventory chaos, abandoned carts, and manual order processing killing your margins.",
    solution:
      "Shopify/WooCommerce or headless stores with payments, inventory sync & recovery flows.",
    price: { kind: "from", eur: 273, trail: "(full payments-ready site)" },
    painCategoryId: "look-professional",
  },
  {
    id: "maintenance",
    name: "Ongoing Maintenance & Security Retainer",
    pain: "One day your site goes down, gets hacked, or breaks after a plugin update — and you have no one to call.",
    solution:
      "Monthly retainer with monitoring, backups, security patches, content updates, and priority support. Sleep at night again.",
    price: { kind: "monthly", eur: 97 },
    painCategoryId: "look-professional",
  },

  // — Convert visitors -------------------------------------------------
  {
    id: "chatbot",
    name: "AI Chatbot & Website Virtual Assistant",
    pain: "Customers message you at night and get no reply → lost sales.",
    solution:
      "24/7 intelligent chatbot that answers questions, qualifies leads, books appointments, and even completes sales directly on your site.",
    price: { kind: "addon", addonEur: 50, combinedEur: 323 },
    painCategoryId: "convert-visitors",
  },
  {
    id: "marketing-automation",
    name: "Marketing Automation",
    pain: "You’re sending the same emails, follow-ups, and reminders manually — and 70% of leads go cold before you reach them.",
    solution:
      "Email/SMS sequences, abandoned-cart recovery, and behavior-triggered campaigns that nurture leads on autopilot.",
    price: { kind: "from", eur: 197 },
    painCategoryId: "convert-visitors",
  },
  {
    id: "personalization",
    name: "AI-Powered Personalization",
    pain: "Every visitor sees the same generic homepage — so conversion stays flat at 1–2%.",
    solution:
      "AI personalizes copy, product recommendations, and offers in real time based on visitor behavior. Conversion lifts of 30–80% are typical.",
    price: { kind: "from", eur: 247 },
    painCategoryId: "convert-visitors",
  },

  // — Save time --------------------------------------------------------
  {
    id: "crm",
    name: "Custom CRM",
    pain: "Customer info lives in spreadsheets, sticky notes, and three different inboxes — leads slip through the cracks.",
    solution:
      "A simple, custom CRM tailored to your workflow — pipelines, reminders, and one-click follow-ups your team will actually use.",
    price: { kind: "from", eur: 297 },
    painCategoryId: "save-time",
  },
  {
    id: "booking",
    name: "Online Booking",
    pain: "You waste hours every week emailing back-and-forth to schedule a 15-minute call.",
    solution:
      "Branded booking page with calendar sync, deposits, automated reminders, and Zoom/Meet links — fully integrated into your site.",
    price: { kind: "from", eur: 79 },
    painCategoryId: "save-time",
  },
  {
    id: "integrations",
    name: "API Integrations",
    pain: "You’re copy-pasting data between Shopify, accounting, shipping, and your CRM every single day.",
    solution:
      "Custom integrations that sync everything in real time — Stripe, QuickBooks, Mailchimp, HubSpot, Twilio, you name it.",
    price: { kind: "from", eur: 147 },
    painCategoryId: "save-time",
  },
  {
    id: "ai-agents",
    name: "AI Agent Development (Autonomous Virtual Employees)",
    pain: "You can’t afford a full-time assistant or sales rep — but the work keeps piling up.",
    solution:
      "Custom AI agents that act, not just chat — they research, send emails, update your CRM, qualify leads, and execute tasks autonomously. One agent can replace 20+ hours of weekly work.",
    price: { kind: "from", eur: 497 },
    painCategoryId: "save-time",
  },

  // — Get more customers ----------------------------------------------
  {
    id: "seo",
    name: "SEO & Conversion Optimization",
    pain: "You’re invisible on Google and the few visitors you do get bounce in 3 seconds.",
    solution:
      "Technical SEO, Core Web Vitals fixes, conversion-focused copy, and A/B-tested CTAs that turn traffic into customers.",
    price: { kind: "from", eur: 197 },
    painCategoryId: "more-customers",
  },
  {
    id: "voice-agents",
    name: "AI Lead Generation & Voice Agents",
    pain: "Cold outreach is dead, your team hates the phone, and inbound leads vanish if you don’t call within 5 minutes.",
    solution:
      "AI voice agents that call, qualify, book meetings, and handle inbound calls 24/7 — in natural-sounding voices.",
    price: { kind: "from", eur: 597 },
    painCategoryId: "more-customers",
  },
];

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

export function getServicesByCategory(
  categoryId: PainCategoryId,
): ReadonlyArray<Service> {
  return services.filter((s) => s.painCategoryId === categoryId);
}

export function getServiceById(id: ServiceId): Service {
  const s = services.find((svc) => svc.id === id);
  if (!s) throw new Error(`Unknown service id: ${id}`);
  return s;
}

// The three "hook" services shown on the homepage teaser. Picked for
// breadth (foundation → conversion → recurring impact) and for being
// the strongest visual hooks in their respective categories. Keep this
// list to EXACTLY 3 — the homepage layout is built around it.
export const HOOK_SERVICE_IDS: ReadonlyArray<ServiceId> = [
  "website",
  "chatbot",
  "marketing-automation",
];

export function getHookServices(): ReadonlyArray<Service> {
  return HOOK_SERVICE_IDS.map(getServiceById);
}

// "Getting Started" — the natural launch sequence for brand-new
// businesses or anyone going online for the first time. Rendered as
// the first section on /services, BEFORE the pain-point categories,
// because newcomers don't have a specific pain yet — they have a
// foundational need to get a presence up.
//
// Order is the logical investment order at launch (foundation →
// commerce/booking → ongoing care). Keep it short (3–5 services).
export const GETTING_STARTED_SERVICE_IDS: ReadonlyArray<ServiceId> = [
  "website",
  "ecommerce",
  "booking",
  "maintenance",
];

export function getGettingStartedServices(): ReadonlyArray<Service> {
  return GETTING_STARTED_SERVICE_IDS.map(getServiceById);
}
