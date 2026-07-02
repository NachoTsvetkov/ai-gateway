export type ScoreOption = 0 | 1 | 2;

export type ScorecardItem = {
  id: string;
  check: string;
};

export type ScorecardSection = {
  id: string;
  title: string;
  subtitle: string;
  maxPerItem: 2;
  items: ScorecardItem[];
};

export const SCORECARD_SECTIONS: ReadonlyArray<ScorecardSection> = [
  {
    id: "pdp",
    title: "Product page",
    subtitle: "6 checks · walk your best-selling SKU on a real phone",
    maxPerItem: 2,
    items: [
      { id: "pdp-1", check: "Hero image loads in under 3 seconds on 4G" },
      { id: "pdp-2", check: "Price visible without scrolling on mobile" },
      { id: "pdp-3", check: "Reviews or star rating visible near Add to Cart" },
      { id: "pdp-4", check: "Shipping/delivery estimate near the buy button" },
      { id: "pdp-5", check: "Returns or guarantee mentioned near CTA" },
      { id: "pdp-6", check: "Sticky Add to Cart or buy bar on scroll" },
    ],
  },
  {
    id: "cart",
    title: "Cart",
    subtitle: "6 checks · open cart drawer or cart page",
    maxPerItem: 2,
    items: [
      { id: "cart-1", check: "Cart opens without full page reload (drawer or slide)" },
      { id: "cart-2", check: "Shipping estimate shown before checkout" },
      { id: "cart-3", check: "Free-shipping threshold visible" },
      { id: "cart-4", check: "Trust line under checkout button" },
      { id: "cart-5", check: "No surprise app popups blocking checkout" },
      { id: "cart-6", check: "Quantity edit works on mobile" },
    ],
  },
  {
    id: "checkout",
    title: "Checkout",
    subtitle: "12 checks · complete a test purchase on your phone",
    maxPerItem: 2,
    items: [
      { id: "chk-1", check: "Shop Pay or Apple Pay available" },
      { id: "chk-2", check: "Guest checkout — no forced account creation" },
      { id: "chk-3", check: "Shipping cost shown before payment step" },
      { id: "chk-4", check: "Total matches cart (no surprise fees at pay)" },
      { id: "chk-5", check: "Form fields large enough for thumb tap" },
      { id: "chk-6", check: "Autofill works (address, email)" },
      { id: "chk-7", check: "Progress indicator (contact → shipping → payment)" },
      { id: "chk-8", check: "Store logo visible" },
      { id: "chk-9", check: "Payment badges visible" },
      { id: "chk-10", check: "Clear error messages if a field fails" },
      { id: "chk-11", check: "Checkout completes in under 60 seconds" },
      { id: "chk-12", check: "Order confirmation email within 5 minutes" },
    ],
  },
  {
    id: "match",
    title: "Ad ↔ page match",
    subtitle: "3 checks · compare your top ad to the landing URL",
    maxPerItem: 2,
    items: [
      { id: "match-1", check: "Ad headline matches PDP or landing hero" },
      { id: "match-2", check: "Same offer/price in ad and on page" },
      { id: "match-3", check: "No distracting nav on paid landing pages" },
    ],
  },
];

export const SCORE_BANDS = [
  {
    min: 24,
    max: 30,
    label: "Polish mode",
    action: "Optimize PDP speed and A/B test — checkout is solid.",
  },
  {
    min: 18,
    max: 23,
    label: "Fix checkout first",
    action: "Start with Leaks 1–2 (shipping + mobile checkout).",
  },
  {
    min: 12,
    max: 17,
    label: "Major leaks",
    action: "Block 2 hours this week — pause scaling ads until 18+.",
  },
  {
    min: 0,
    max: 11,
    label: "Stop scaling ads",
    action: "Checkout is broken — fix before spending more on traffic.",
  },
] as const;

export const SCORE_LEGEND = [
  {
    value: 0 as const,
    label: "Broken",
    hint: "Missing or clearly broken on mobile",
    color: "rose",
  },
  {
    value: 1 as const,
    label: "Partial",
    hint: "Works sometimes or needs polish",
    color: "amber",
  },
  {
    value: 2 as const,
    label: "Working",
    hint: "Solid when you test on a real phone",
    color: "emerald",
  },
] as const;

export function scoreOptionLabel(value: ScoreOption): string {
  return SCORE_LEGEND.find((entry) => entry.value === value)?.label ?? String(value);
}

export type LeakFix = {
  id: number;
  title: string;
  symptom: string;
  steps: string[];
  optional?: string;
  metric: string;
  avoid?: string[];
};

export const LEAK_FIXES: ReadonlyArray<LeakFix> = [
  {
    id: 1,
    title: "Surprise shipping at checkout",
    symptom:
      "Strong add-to-cart, weak checkout completion. Abandonment spikes on the shipping step.",
    steps: [
      "Settings → Shipping and delivery — simplify to 2–3 zones max.",
      "Set a free-shipping threshold 10–15% above current AOV.",
      "Cart drawer: add “Free shipping on orders over $XX” and “$Y away from free shipping”.",
      "PDP: repeat shipping message under Add to Cart (use Copy blocks).",
      "Test: incognito mobile purchase — shipping visible before payment.",
    ],
    optional:
      "Use a native theme free-shipping bar before installing another app.",
    metric: "Checkout reached → purchase rate up 0.3–0.8 pp within 14 days.",
  },
  {
    id: 2,
    title: "Mobile checkout friction",
    symptom: "High mobile traffic, lower mobile conversion vs desktop.",
    steps: [
      "Settings → Payments — enable Shop Pay, Apple Pay, Google Pay, PayPal Express.",
      "Settings → Checkout — allow guest checkout.",
      "Checkout branding — upload logo, match brand color.",
      "Remove optional fields — phone only if carrier requires it.",
      "Thumb test — complete purchase one-handed. Every failed tap = fix or remove.",
      "Theme: Add to Cart min-height 48px; sticky ATC on mobile.",
    ],
    metric: "Mobile checkout completion improves 5–15% relative.",
  },
  {
    id: 3,
    title: "Weak trust on the buy button",
    symptom: "Good time-on-page, low add-to-cart. Paid traffic bounces.",
    steps: [
      "Enable product reviews — show count + stars above fold on mobile.",
      "Returns window in one line under CTA.",
      "Payment icons row under button.",
      "One specific testimonial with name + outcome.",
      "Honest urgency only — real low stock or delivery cutoff.",
    ],
    avoid: [
      "Fake countdown timers",
      "Stock counters that reset",
      "Generic “1000+ happy customers” with no proof",
    ],
    metric: "Add-to-cart rate up 0.5–1.5 pp on top traffic source.",
  },
  {
    id: 4,
    title: "Slow mobile product pages",
    symptom:
      "High bounce from ads, low scroll depth, PageSpeed mobile under 50.",
    steps: [
      "PageSpeed Insights — test top 3 URLs from Ads Manager.",
      "Convert hero to WebP, max 1200px wide, under 150KB.",
      "Uninstall unused apps — each adds JS.",
      "Disable heavy sections on product template until speed recovers.",
      "Lazy-load images; no autoplay video above fold.",
    ],
    optional: "Targets: LCP under 2.5s mobile, TTI under 5s on 4G.",
    metric: "Bounce rate down 5–10% relative on paid landing URLs.",
  },
  {
    id: 5,
    title: "Ad ↔ landing message mismatch",
    symptom: "Good CTR, terrible conversion. “Not what I expected.”",
    steps: [
      "Screenshot your top ad — note headline, offer, price.",
      "Landing first screen must repeat headline + offer within 3 seconds.",
      "Dedicated LP for Meta tests — minimal header nav.",
      "One CTA — single product or collection, not homepage.",
      "Same product image in ad creative and landing hero.",
    ],
    optional:
      "Duplicate product template or use a page-builder section with ad-matched hero.",
    metric: "Landing CVR up 20–40% relative vs sending to homepage.",
  },
];

export type CopyBlock = {
  id: string;
  title: string;
  placement: string;
  body: string;
};

export const COPY_BLOCKS: ReadonlyArray<CopyBlock> = [
  {
    id: "shipping-trust",
    title: "Shipping + trust under Add to Cart",
    placement: "Product template, below variant picker",
    body: `✓ Free shipping on orders over $[THRESHOLD]
✓ [XX]-day hassle-free returns
✓ Secure checkout · Shop Pay & Apple Pay accepted
Estimated delivery: [X–Y] business days to [COUNTRY]`,
  },
  {
    id: "free-shipping-progress",
    title: "Free-shipping progress",
    placement: "Cart drawer",
    body: `You're $[AMOUNT_REMAINING] away from free shipping!
🚚 Free shipping unlocks at $[THRESHOLD]`,
  },
  {
    id: "review-line",
    title: "Review social proof (one line)",
    placement: "Product template, near CTA",
    body: `★★★★★ "[Specific outcome quote]" — [First name], verified buyer`,
  },
  {
    id: "low-stock",
    title: "Low stock (only if true)",
    placement: "Product template",
    body: `Only [N] left in stock — order soon for [DAY] delivery`,
  },
  {
    id: "cart-trust",
    title: "Checkout trust",
    placement: "Cart drawer footer",
    body: `🔒 SSL encrypted checkout
Need help? [support@yourstore.com] — we reply within 24 hours`,
  },
  {
    id: "paid-lp-hero",
    title: "Paid landing hero",
    placement: "Dedicated Meta landing page",
    body: `[HEADLINE — same as your ad primary text]

[SUBHEAD — same offer as ad]

• [Benefit 1 from ad]
• [Benefit 2 from ad]
• [Benefit 3 from ad]

CTA: [Same verb as ad — Shop Now / Get Yours]`,
  },
  {
    id: "abandoned-email",
    title: "Abandoned checkout email subjects",
    placement: "Shopify Email / Klaviyo",
    body: `1. You left something behind — shipping is [free/over $X]
2. Still thinking? Here's [5% off / free shipping] for the next 24 hours
3. Your cart expires soon — complete checkout in 2 taps with Shop Pay`,
  },
  {
    id: "meta-caption",
    title: "Meta Reels caption template",
    placement: "Reels / Stories caption",
    body: `Paying for traffic but checkout isn't converting?

Most Shopify stores leak in the same 5 places:
→ surprise shipping
→ slow mobile checkout
→ no Shop Pay
→ weak trust on the buy button
→ ad doesn't match the landing page

15-min scorecard + fix playbook for store owners (no agency).

$37 · instant access · link in bio`,
  },
];

export const TRACKING_START = {
  title: "Tracking or checkout?",
  intro:
    "Meta and Shopify often disagree in 2026. Answer these from what you saw in the last 7 days — not what you hope is true.",
  trackingFixSteps: [
    "Shopify Admin → Facebook & Instagram → Data sharing → Maximum.",
    "Meta Events Manager → Test Events → run one test purchase.",
    "Confirm Purchase shows once (deduplicated), not twice.",
    "Align on 1-day click in Ads Manager when comparing to Shopify.",
    "Remove duplicate pixel apps — one primary integration only.",
  ],
};

// Single-page tracking-vs-checkout diagnosis, folded into the scorecard
// flow. Two yes/no questions the buyer answers from last week's data.
export type TrackingDiagnosisId = "tracking" | "checkout" | "match" | "clear";

export type TrackingQuestion = {
  id: string;
  question: string;
  yes: string;
  no: string;
};

export const TRACKING_DIAGNOSIS_QUESTIONS: ReadonlyArray<TrackingQuestion> = [
  {
    id: "signal",
    question:
      "Do Meta Ads Manager and Shopify Analytics disagree on purchases for the same week (Meta shows sales, Shopify shows flat / “Direct”)?",
    yes: "Yes — the numbers disagree",
    no: "No — they roughly match",
  },
  {
    id: "checkout",
    question:
      "On your own phone, can you complete checkout in under 60 seconds with Shop Pay or Apple Pay?",
    yes: "Yes — checkout is smooth",
    no: "No — friction, surprises, or no express pay",
  },
  {
    id: "match",
    question:
      "Does your top ad's headline match the first screen of the landing page it points to?",
    yes: "Yes — they match",
    no: "No — different promise on the page",
  },
];

export type TrackingDiagnosisResult = {
  id: TrackingDiagnosisId;
  label: string;
  outcome: string;
  /** Library section slug to send them to first. */
  fixLink: "fixes" | "copy" | "meta-test";
  showTrackingFix: boolean;
};

/**
 * Resolve the tracking diagnosis from the three yes/no answers.
 * `true` = "yes" (first option), `false` = "no".
 */
export function resolveTrackingDiagnosis(answers: {
  signal?: boolean;
  checkout?: boolean;
  match?: boolean;
}): TrackingDiagnosisResult {
  if (answers.signal) {
    return {
      id: "tracking",
      label: "Tracking / CAPI issue",
      outcome:
        "Meta and Shopify disagree — fix your signal before you touch checkout or scale ads. Bad data hides the real problem.",
      fixLink: "meta-test",
      showTrackingFix: true,
    };
  }
  if (answers.checkout === false) {
    return {
      id: "checkout",
      label: "Checkout leak",
      outcome:
        "Tracking looks fine but checkout has friction — this is where you're losing paid traffic. Fix Leaks 1–2 first.",
      fixLink: "fixes",
      showTrackingFix: false,
    };
  }
  if (answers.match === false) {
    return {
      id: "match",
      label: "Ad ↔ page mismatch",
      outcome:
        "Tracking and checkout are OK, but your ad promises something the page doesn't deliver. Fix message match (Leak 5) before new creative.",
      fixLink: "copy",
      showTrackingFix: false,
    };
  }
  return {
    id: "clear",
    label: "Tracking + checkout clear",
    outcome:
      "No tracking or checkout red flags. Polish PDP speed and run the $300 Meta test before scaling spend.",
    fixLink: "meta-test",
    showTrackingFix: false,
  };
}

export const META_TEST_PLAN = {
  title: "$300 Meta smoke test",
  intro:
    "Use this after checkout fixes score 18+. Do not scale ads until the scorecard says you're ready.",
  economics: [
    { label: "Daily budget", value: "$15–20/day" },
    { label: "Hard stop", value: "$300 total" },
    { label: "Kill rule", value: "$150 spend, 0 purchases → stop" },
    { label: "Target CPA", value: "$15–35" },
    { label: "Scale signal", value: "3+ purchases at CPA ≤ $35" },
  ],
  after150: [
    {
      purchases: "0",
      action: "Kill ad set. Revise hook or LP — do not scale.",
    },
    {
      purchases: "1–2",
      action: "New Reels angle. Spend remaining $150.",
    },
    {
      purchases: "3+ at CPA ≤ $35",
      action: "Finish $300 test. Plan $500 scale test.",
    },
  ],
  structure: [
    "Objective: Sales (Purchase)",
    "Ad set: US + CA + UK + AU — Broad 25–55",
    "3 creatives max in first $150",
    "Landing URL: your store LP — never homepage",
    "Do not run traffic campaigns to warm up pixel",
  ],
  reelHook:
    "Paying for traffic that doesn't buy? Score your mobile checkout in 15 minutes.",
};

export const LIBRARY_SECTIONS = [
  {
    slug: "scorecard",
    title: "Leak scorecard",
    description:
      "Score your store, diagnose tracking vs checkout, and get prioritized fixes.",
    step: "1",
    highlight: true,
  },
  {
    slug: "fixes",
    title: "5 leak playbooks",
    description: "Step-by-step Shopify fixes in priority order.",
    step: "2",
  },
  {
    slug: "copy",
    title: "Copy-paste blocks",
    description: "Theme-ready trust, shipping, and ad-match copy.",
    step: "3",
  },
  {
    slug: "meta-test",
    title: "$300 Meta test plan",
    description: "Kill rules, budgets, and when to scale.",
    step: "4",
  },
] as const;

export const TRACKER_CSV = `week_start,sessions,add_to_cart_rate_pct,checkout_reached_rate_pct,purchase_rate_pct,mobile_purchase_rate_pct,notes,leaks_fixed
2026-07-01,,,,,,Baseline before scorecard,
2026-07-08,,,,,,,
2026-07-15,,,,,,,
2026-07-22,,,,,,,
2026-07-29,,,,,,,
`;

export type TrackerBuildInput = {
  scores: Record<string, ScoreOption | undefined>;
  trackingAnswers?: {
    signal?: boolean;
    checkout?: boolean;
    match?: boolean;
  };
  /** Defaults to today (local date). */
  baselineDate?: Date;
};

function csvCell(value: string | number): string {
  const text = String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function csvRow(values: Array<string | number>): string {
  return values.map(csvCell).join(",");
}

function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/** Build a tracker CSV pre-filled with scorecard results + weekly template rows. */
export function buildPersonalizedTrackerCsv(input: TrackerBuildInput): string {
  const baselineDate = input.baselineDate ?? new Date();
  const baselineLabel = formatLocalDate(baselineDate);

  let total = 0;
  let answered = 0;
  const lowItems: string[] = [];

  for (const section of SCORECARD_SECTIONS) {
    for (const item of section.items) {
      const score = input.scores[item.id];
      if (score === undefined) continue;
      answered += 1;
      total += score;
      if (score <= 1) {
        lowItems.push(`${item.check} (${scoreOptionLabel(score)})`);
      }
    }
  }

  const max = maxScorecardPoints();
  const band = answered > 0 ? scoreBand(total) : null;
  const diagnosis =
    input.trackingAnswers &&
    (input.trackingAnswers.signal !== undefined ||
      input.trackingAnswers.checkout !== undefined ||
      input.trackingAnswers.match !== undefined)
      ? resolveTrackingDiagnosis(input.trackingAnswers)
      : null;

  const rows: string[] = [];

  rows.push("Scorecard summary");
  rows.push(
    csvRow([
      "Date",
      "Total score",
      "Max score",
      "Band",
      "Tracking diagnosis",
      "Priority fixes",
    ]),
  );
  rows.push(
    csvRow([
      baselineLabel,
      answered > 0 ? total : "",
      max,
      band?.label ?? "",
      diagnosis?.label ?? "",
      lowItems.slice(0, 5).join("; "),
    ]),
  );
  rows.push("");

  rows.push("Scorecard answers");
  rows.push(csvRow(["Section", "Check", "Rating", "Label"]));
  for (const section of SCORECARD_SECTIONS) {
    for (const item of section.items) {
      const score = input.scores[item.id];
      rows.push(
        csvRow([
          section.title,
          item.check,
          score ?? "",
          score !== undefined ? scoreOptionLabel(score) : "Not rated",
        ]),
      );
    }
  }
  rows.push("");

  rows.push("Weekly metrics (update each Monday from Shopify Analytics)");
  rows.push(
    csvRow([
      "Week start",
      "Sessions",
      "Add to cart rate %",
      "Checkout reached rate %",
      "Purchase rate %",
      "Mobile purchase rate %",
      "Notes",
      "Leaks fixed",
    ]),
  );

  const baselineNote =
    answered > 0
      ? `Baseline: ${total}/${max}${band ? ` (${band.label})` : ""}${
          diagnosis ? `. Diagnosis: ${diagnosis.label}` : ""
        }. Fill metrics from Shopify Analytics → Online store conversion.`
      : "Baseline before scorecard — fill metrics from Shopify Analytics.";

  rows.push(
    csvRow([
      baselineLabel,
      "",
      "",
      "",
      "",
      "",
      baselineNote,
      "",
    ]),
  );

  for (let week = 1; week <= 4; week += 1) {
    rows.push(
      csvRow([formatLocalDate(addDays(baselineDate, week * 7)), "", "", "", "", "", "", ""]),
    );
  }

  return `${rows.join("\r\n")}\r\n`;
}

export function maxScorecardPoints(): number {
  return SCORECARD_SECTIONS.reduce((sum, s) => sum + s.items.length * 2, 0);
}

export function scoreBand(total: number) {
  return (
    SCORE_BANDS.find((b) => total >= b.min && total <= b.max) ?? SCORE_BANDS[3]
  );
}

export type ScorecardNextStep = {
  label: string;
  href: string;
  why: string;
  /** Opens in a new tab (Calendly, mailto, etc.). */
  external?: boolean;
};

export const CONVERSION_KIT_SUPPORT_EMAIL = "nacho.tsvetkov@gmail.com";

export const CONVERSION_KIT_CONTACT_URL =
  "https://calendly.com/nacho-tsvetkov/30min?a1=Shopify%20conversion%20scorecard%20%E2%80%94%20still%20struggling%20after%20fixes";

export function scorecardContactStep(): ScorecardNextStep {
  return {
    label: "Still struggling? Contact me",
    href: CONVERSION_KIT_CONTACT_URL,
    why: "Book a free 15-min call — I'll help you pinpoint what's still blocking conversions.",
    external: true,
  };
}

/** Personalized library links after the scorecard — ordered by priority. */
export function getScorecardNextSteps(
  total: number,
  scores: Record<string, ScoreOption | undefined>,
  libraryBase = "/shopify-conversion-kit/library",
): ScorecardNextStep[] {
  const band = scoreBand(total);
  const sectionStats = SCORECARD_SECTIONS.map((section) => {
    const rated = section.items.filter((item) => scores[item.id] !== undefined);
    const points = rated.reduce((sum, item) => sum + (scores[item.id] ?? 0), 0);
    const max = section.items.length * 2;
    return {
      id: section.id,
      title: section.title,
      ratio: rated.length > 0 ? points / max : 1,
    };
  });
  const weakest = sectionStats
    .filter((s) => s.ratio < 1)
    .sort((a, b) => a.ratio - b.ratio)[0];

  const steps: ScorecardNextStep[] = [];

  if (total <= 11) {
    steps.push({
      label: "Pause ad spend — fix checkout first",
      href: `${libraryBase}/fixes`,
      why: band.action,
    });
    steps.push({
      label: "Copy-paste trust + shipping blocks",
      href: `${libraryBase}/copy`,
      why: "Ship the quickest on-page wins while you rebuild checkout.",
    });
  } else if (total <= 17) {
    steps.push({
      label: "Open fix playbooks",
      href: `${libraryBase}/fixes`,
      why: band.action,
    });
    steps.push({
      label: "Copy-paste trust + ad-match blocks",
      href: `${libraryBase}/copy`,
      why: "Layer on-page copy fixes over the structural leaks.",
    });
  } else if (total <= 23) {
    steps.push({
      label: "Fix Leaks 1–2 (shipping + mobile checkout)",
      href: `${libraryBase}/fixes`,
      why: band.action,
    });
    if (weakest?.id === "pdp" || weakest?.id === "match") {
      steps.push({
        label: "Copy-paste trust + ad-match blocks",
        href: `${libraryBase}/copy`,
        why: `${weakest.title} was your weakest section — start with on-page copy.`,
      });
    }
  } else {
    steps.push({
      label: "Run the $300 Meta test plan",
      href: `${libraryBase}/meta-test`,
      why: "Checkout is solid — test creatives before scaling spend.",
    });
    steps.push({
      label: "Polish PDP copy blocks",
      href: `${libraryBase}/copy`,
      why: band.action,
    });
  }

  steps.push(scorecardContactStep());

  return steps;
}
