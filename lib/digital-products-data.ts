// Stand-alone digital products sold via the same checkout flow as
// bundles/services. Kept separate from bundles-data because these are
// impulse-priced, self-serve downloads — not scoped engagements.

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
  /** Files delivered on the success page (paths under /public). */
  downloads: ReadonlyArray<{
    label: string;
    href: string;
    description?: string;
  }>;
};

const CONVERSION_KIT_DOWNLOADS: DigitalProduct["downloads"] = [
  {
    label: "Kit overview (start here)",
    href: "/guides/shopify-conversion-leak-fix-kit/README.md",
    description: "What's inside + how to run the 15-minute audit",
  },
  {
    label: "15-minute mobile checkout audit",
    href: "/guides/shopify-conversion-leak-fix-kit/01-15-minute-audit.md",
  },
  {
    label: "5 conversion leaks playbook",
    href: "/guides/shopify-conversion-leak-fix-kit/02-five-leaks-playbook.md",
  },
  {
    label: "Copy-paste fix blocks",
    href: "/guides/shopify-conversion-leak-fix-kit/03-copy-paste-blocks.md",
  },
  {
    label: "Weekly conversion tracker (CSV)",
    href: "/guides/shopify-conversion-leak-fix-kit/04-conversion-tracker.csv",
  },
];

export const DIGITAL_PRODUCTS: ReadonlyArray<DigitalProduct> = [
  {
    id: "shopify-conversion-kit",
    name: "Shopify Conversion Leak Fix Kit",
    tagline:
      "15-minute self-audit + prioritized fixes for stores bleeding paid traffic at mobile checkout.",
    oneTimeEur: 34,
    cta: {
      primary: "Get the kit — fix my leaks",
      helper: "Instant download after checkout · PayPal secure",
      checkout: "Get the kit — $37",
    },
    stripePaymentLink: process.env.NEXT_PUBLIC_STRIPE_CONVERSION_KIT_LINK,
    downloads: CONVERSION_KIT_DOWNLOADS,
  },
];

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
