// Stand-alone digital products sold via the same checkout flow as
// bundles/services. Kept separate from bundles-data because these are
// impulse-priced, self-serve downloads — not scoped engagements.

import { LIBRARY_BASE_PATH } from "./digital-product-access";

export type DigitalProductId = "shopify-conversion-kit";

/** Dedicated PayPal checkout route (not generic /checkout). */
export const CONVERSION_KIT_CHECKOUT_PATH = "/shopify-conversion-kit/checkout";

export type DigitalProduct = {
  id: DigitalProductId;
  name: string;
  tagline: string;
  /** EUR-denominated price. USD display ≈ round(eur * 1.10). */
  oneTimeEur: number;
  cta: {
    primary: string;
    helper: string;
    checkout: string;
  };
  /** Optional Stripe Payment Link — surfaced on checkout as fallback. */
  stripePaymentLink?: string;
  /** Gated library sections (access via checkout success token). */
  librarySections: ReadonlyArray<{
    slug: string;
    label: string;
    description?: string;
  }>;
};

const CONVERSION_KIT_LIBRARY: DigitalProduct["librarySections"] = [
  {
    slug: "",
    label: "Start here",
    description: "Your 30-minute workflow",
  },
  {
    slug: "scorecard",
    label: "Leak scorecard",
    description: "Score, diagnose tracking vs checkout, get fixes",
  },
  {
    slug: "fixes",
    label: "5 leak playbooks",
    description: "Priority-ordered Shopify fixes",
  },
  {
    slug: "copy",
    label: "Copy-paste blocks",
    description: "One-tap copy for your theme",
  },
  {
    slug: "meta-test",
    label: "$300 Meta test plan",
    description: "Kill rules and scale signals",
  },
];

export const DIGITAL_PRODUCTS: ReadonlyArray<DigitalProduct> = [
  {
    id: "shopify-conversion-kit",
    name: "Shop Fix Scorecard",
    tagline:
      "Simple phone checklist. See what's wrong in 15 minutes. Fix the big problems first.",
    oneTimeEur: 34,
    cta: {
      primary: "Get the checklist — find what's wrong",
      helper: "Pay once · open right after checkout · PayPal safe",
      checkout: "Get access — $37",
    },
    stripePaymentLink: process.env.NEXT_PUBLIC_STRIPE_CONVERSION_KIT_LINK,
    librarySections: CONVERSION_KIT_LIBRARY,
  },
];

/** Post-purchase library entry (append ?access= token from success page). */
export function getDigitalProductLibraryPath(
  productId: DigitalProductId,
  sectionSlug = "",
): string {
  const base = sectionSlug
    ? `${LIBRARY_BASE_PATH}/${sectionSlug}`
    : LIBRARY_BASE_PATH;
  void productId;
  return base;
}

const BY_ID = new Map(DIGITAL_PRODUCTS.map((p) => [p.id, p]));

export function getDigitalProduct(id: DigitalProductId): DigitalProduct {
  const p = BY_ID.get(id);
  if (!p) throw new Error(`Unknown digital product: ${id}`);
  return p;
}

export function getDigitalProductByReference(
  ref: string | null | undefined,
): DigitalProduct | undefined {
  if (!ref?.startsWith("digital:")) return undefined;
  const id = ref.slice("digital:".length) as DigitalProductId;
  return BY_ID.get(id);
}
