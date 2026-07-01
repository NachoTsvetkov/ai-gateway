// Normalized "thing you can buy" abstraction. Both bundles and single
// services are projected into the same shape so the checkout island,
// the checkout page, the order summary, and the payment form don't
// need to branch on bundle-vs-service. Adding a third buyable type
// later (a stand-alone upsell, a one-off audit, etc.) means
// implementing one factory function below; nothing else changes.
//
// Why a separate module:
//   - bundles-data and services-data each own their own catalogue +
//     pricing rules. This file is the *adapter* that turns either of
//     them into the shape the checkout flow consumes.
//   - keeping it here means /bundles/[slug] and /services/[serviceId]
//     each ship the same checkout island without dragging the other
//     domain's data into their bundle.

import type { Currency } from "./currency";
import { type Locale } from "./i18n/locale";
import {
  type Bundle,
  type BundleId,
  type Upsell,
  BUNDLES,
  UPSELLS,
  getLocalizedBundle,
  getLocalizedUpsells,
} from "./bundles-data";
import {
  type DigitalProduct,
  type DigitalProductId,
  DIGITAL_PRODUCTS,
  getDigitalProduct,
} from "./digital-products-data";
import {
  type Service,
  type ServiceId,
  type ServicePrice,
  getLocalizedServiceById,
  localizeTierLabel,
  services,
} from "./services-data";

// ----------------------------------------------------------------------
// Buyable type
// ----------------------------------------------------------------------

export type BuyableKind = "bundle" | "service" | "digital_product";

/**
 * A normalized buyable. After construction, downstream UI never has to
 * read from the raw Bundle / Service / ServicePrice types again.
 *
 * Pricing semantics:
 *   - `oneTimeEur` is what's "due today". For services with a monthly
 *     retainer it's the first month's payment; for one-time priced
 *     services it's the fee.
 *   - `retainerEur` is the recurring amount. Always optional.
 *   - For tiered services (e.g. website 1-page vs 3-page) we pre-resolve
 *     `oneTimeEur` to the chosen tier. The `tier` field is preserved
 *     so URLs / order summaries can show which tier was picked.
 */
export type Buyable = {
  kind: BuyableKind;
  /** Stable id (bundle slug or service id). */
  id: string;
  /** Index into the service's `tiers[]` (only set for tiered services). */
  tier?: number;
  /** Display name. Fully resolved (includes tier label for tiered services). */
  name: string;
  /** One-line tagline shown in summaries / cards. */
  tagline: string;
  oneTimeEur: number;
  retainerEur?: number;
  /** Per-buyable CTA verbs threaded across the homepage card, the chat
   *  card (bundles only), the detail page, and the checkout button.
   *
   *  `verb` is the bare action verb without the tier suffix (e.g.
   *  "Build my site"). The CheckoutIsland uses it to re-derive the
   *  button label live when the visitor switches tier in the picker —
   *  otherwise the label would be frozen to whichever tier was selected
   *  at server-render time. Only set for tiered services; bundles and
   *  non-tiered services leave it undefined and the island falls back
   *  to `checkout` unchanged. */
  cta: {
    primary: string;
    helper: string;
    checkout: string;
    verb?: string;
  };
  /** "View what's included" link target (the buyable's own detail page). */
  detailsUrl: string;
  /**
   * Encoded back into ?service=foo&tier=0 / ?bundle=startup. Carried
   * through to the checkout URL so a refresh on /checkout reconstructs
   * the same line item.
   */
  searchParams: URLSearchParams;
  /** Same string the checkout form sends to the payment provider as
   *  `client_reference_id`. Stable across refreshes. */
  reference: string;
  /** Optional Stripe Payment Link for one-click hosted checkout. */
  stripePaymentLink?: string;
};

// ----------------------------------------------------------------------
// Digital product → Buyable
// ----------------------------------------------------------------------

export function buyableFromDigitalProduct(product: DigitalProduct): Buyable {
  const sp = new URLSearchParams();
  sp.set("product", product.id);
  return {
    kind: "digital_product",
    id: product.id,
    name: product.name,
    tagline: product.tagline,
    oneTimeEur: product.oneTimeEur,
    cta: product.cta,
    detailsUrl: `/shopify-conversion-kit`,
    searchParams: sp,
    reference: `digital:${product.id}`,
    stripePaymentLink: product.stripePaymentLink,
  };
}

// ----------------------------------------------------------------------
// Bundle → Buyable
// ----------------------------------------------------------------------

export function buyableFromBundle(bundle: Bundle): Buyable {
  // The caller is expected to pass a bundle that's already been
  // localised via `getLocalizedBundle(id, locale)` if BG copy is
  // wanted. The buyable just projects whatever it receives, so the
  // same factory works for both locales.
  const sp = new URLSearchParams();
  sp.set("bundle", bundle.id);
  return {
    kind: "bundle",
    id: bundle.id,
    name: bundle.name,
    tagline: bundle.tagline,
    oneTimeEur: bundle.oneTimeEur,
    retainerEur: bundle.retainerEur,
    cta: bundle.cta,
    detailsUrl: `/bundles/${bundle.id}`,
    searchParams: sp,
    reference: `bundle:${bundle.id}`,
  };
}

// ----------------------------------------------------------------------
// Service → Buyable
// ----------------------------------------------------------------------

/**
 * Project a `Service` into a Buyable. For tiered services, `tier` picks
 * which tier to charge for. For services with a monthly retainer
 * (`maintenance`), the first month's amount becomes "due today" and
 * the same amount becomes the recurring `retainerEur`. For addon
 * services (chatbot), the bare add-on amount is what we charge — the
 * "full site with chatbot" combined offer is encouraged via the
 * Startup Bundle, not modelled as its own buyable.
 */
export function buyableFromService(
  service: Service,
  tier: number | undefined,
  locale: Locale = "en",
): Buyable {
  const { oneTimeEur, retainerEur, tierName } = resolveServicePrice(
    service.price,
    tier,
    locale,
  );
  const cta = getServiceCta(service.id, tierName, locale);
  const sp = new URLSearchParams();
  sp.set("service", service.id);
  if (tier !== undefined) sp.set("tier", String(tier));
  return {
    kind: "service",
    id: service.id,
    tier,
    name: tierName ? `${service.name} (${tierName})` : service.name,
    tagline: service.solution,
    oneTimeEur,
    retainerEur,
    cta,
    detailsUrl: `/services/${service.id}`,
    searchParams: sp,
    reference:
      tier !== undefined
        ? `service:${service.id}:tier${tier}`
        : `service:${service.id}`,
  };
}

type ResolvedPrice = {
  oneTimeEur: number;
  retainerEur?: number;
  /** Human label of the tier ("1-page", "3-page") if tiered. */
  tierName?: string;
};

function resolveServicePrice(
  price: ServicePrice,
  tier: number | undefined,
  locale: Locale = "en",
): ResolvedPrice {
  switch (price.kind) {
    case "from":
      return { oneTimeEur: price.eur };
    case "addon":
      return { oneTimeEur: price.addonEur };
    case "monthly":
      // Monthly-only services charge first month up-front, then recur.
      // The visitor gets the "first month free if you cancel before
      // day 30" framing on the checkout page.
      return { oneTimeEur: price.eur, retainerEur: price.eur };
    case "tiered": {
      const idx = tier ?? 0;
      const t = price.tiers[idx] ?? price.tiers[0];
      return { oneTimeEur: t.eur, tierName: localizeTierLabel(t.label, locale) };
    }
  }
}

// ----------------------------------------------------------------------
// Per-service CTA verbs
// ----------------------------------------------------------------------
//
// Each service ships its own action verb so the buy buttons feel
// distinct rather than 12 instances of "Buy this service". Same
// principle as the bundle CTAs ("Get / Start the process / Buy"):
// distinct verbs imply distinct commitments.

const SERVICE_PRIMARY_CTA: Record<ServiceId, { en: string; bg: string }> = {
  website: { en: "Build my site", bg: "Изградете сайта ми" },
  ecommerce: { en: "Launch my store", bg: "Пусни магазина ми" },
  chatbot: { en: "Add the chatbot", bg: "Добави чатбота" },
  "marketing-automation": {
    en: "Start automating",
    bg: "Започни автоматизацията",
  },
  crm: { en: "Get my CRM", bg: "Вземи моя CRM" },
  booking: { en: "Set up booking", bg: "Пусни резервациите" },
  integrations: { en: "Wire it up", bg: "Свържи системите" },
  seo: { en: "Boost my SEO", bg: "Качи ми SEO-то" },
  personalization: {
    en: "Personalize my site",
    bg: "Персонализирай сайта ми",
  },
  maintenance: {
    en: "Subscribe to retainer",
    bg: "Запиши се на абонамента",
  },
  "ai-agents": { en: "Hire an AI agent", bg: "Наеми AI агент" },
  "voice-agents": { en: "Get a voice agent", bg: "Вземи гласов агент" },
};

const SERVICE_CTA_HELPER: Record<Locale, string> = {
  en: "Continue to checkout — pay securely online",
  bg: "Продължи към плащане — сигурно онлайн",
};

function getServiceCta(
  id: ServiceId,
  tierName: string | undefined,
  locale: Locale = "en",
): Buyable["cta"] {
  const verb = SERVICE_PRIMARY_CTA[id][locale];
  const primary = verb + (tierName ? ` — ${tierName}` : "");
  // `verb` is exposed only for tiered services so the CheckoutIsland
  // can re-derive `<verb> — <activeTier.label>` when the visitor
  // switches tier client-side. Non-tiered services don't need it
  // (the suffix is empty anyway) and leaving it undefined keeps the
  // shape lean.
  return {
    primary,
    helper: SERVICE_CTA_HELPER[locale],
    checkout: primary,
    verb: tierName !== undefined ? verb : undefined,
  };
}

// ----------------------------------------------------------------------
// Resolve a Buyable from URL search params
// ----------------------------------------------------------------------
//
// Used by the /checkout page to reconstruct the buyable from the URL
// without depending on which detail page the visitor came from. Returns
// undefined for missing / unknown ids so the page can render a
// friendly fallback instead of a 404.

const BUNDLE_IDS: ReadonlySet<string> = new Set(BUNDLES.map((b) => b.id));
const SERVICE_IDS: ReadonlySet<string> = new Set(services.map((s) => s.id));
const DIGITAL_PRODUCT_IDS: ReadonlySet<string> = new Set(
  DIGITAL_PRODUCTS.map((p) => p.id),
);

export function resolveBuyableFromSearchParams(
  sp: { bundle?: string; service?: string; tier?: string; product?: string },
  locale: Locale = "en",
): Buyable | undefined {
  if (sp.bundle && BUNDLE_IDS.has(sp.bundle)) {
    return buyableFromBundle(
      getLocalizedBundle(sp.bundle as BundleId, locale),
    );
  }
  if (sp.service && SERVICE_IDS.has(sp.service)) {
    const tier = parseTier(sp.tier);
    const svc = getLocalizedServiceById(sp.service as ServiceId, locale);
    return buyableFromService(svc, tier, locale);
  }
  if (sp.product && DIGITAL_PRODUCT_IDS.has(sp.product)) {
    return buyableFromDigitalProduct(
      getDigitalProduct(sp.product as DigitalProductId),
    );
  }
  return undefined;
}

function parseTier(v: string | undefined): number | undefined {
  if (v === undefined) return undefined;
  const n = Number.parseInt(v, 10);
  if (!Number.isFinite(n) || n < 0) return undefined;
  return n;
}

// ----------------------------------------------------------------------
// Upsell filtering
// ----------------------------------------------------------------------

/**
 * Subset of UPSELLS that's appropriate for the given buyable.
 *
 *   - For bundles: ALL upsells are available; recommendations are
 *     driven by `Upsell.recommendedFor`.
 *   - For services: filtered by `Upsell.applicableToServiceIds`. An
 *     upsell with no `applicableToServiceIds` is available for every
 *     service. An upsell with an explicit list is available only for
 *     those services.
 *
 * The filtering is a UX decision — e.g. "+5 design revisions" doesn't
 * make sense alongside `maintenance`, so it's hidden there. Avoids a
 * cluttered checkout with options the visitor can't meaningfully use.
 *
 * Locale: when "bg", every applicable upsell is run through the
 * BG localiser before being returned. The filtering itself is
 * locale-independent (it only cares about ids).
 */
export function getApplicableUpsells(
  buyable: Buyable,
  locale: Locale = "en",
): ReadonlyArray<Upsell> {
  const localized = getLocalizedUpsellsForLocale(locale);
  if (buyable.kind === "digital_product") return [];
  if (buyable.kind === "bundle") return localized;
  const sid = buyable.id as ServiceId;
  return localized.filter((u) => {
    if (!u.applicableToServiceIds) return true;
    return u.applicableToServiceIds.includes(sid);
  });
}

// Tiny indirection so we don't pull `getLocalizedUpsells` from
// bundles-data into the import graph for callers that just want the
// EN list. Lazy-evaluated; the BG branch only runs when actually
// needed.
function getLocalizedUpsellsForLocale(
  locale: Locale,
): ReadonlyArray<Upsell> {
  if (locale === "en") return UPSELLS;
  return getLocalizedUpsells(locale);
}

/**
 * Same `recommendedFor` mechanism, generalised. Returns true if the
 * upsell is recommended (and should be pre-checked on the buyable's
 * detail page).
 */
export function isUpsellRecommendedFor(
  upsell: Upsell,
  buyable: Buyable,
): boolean {
  if (buyable.kind === "bundle") {
    return upsell.recommendedFor?.includes(buyable.id as BundleId) === true;
  }
  return (
    upsell.recommendedForServices?.includes(buyable.id as ServiceId) === true
  );
}

/**
 * Format a buyable's headline price string for tight contexts (chat
 * cards, mobile order summary). Always picks the visitor's currency.
 */
export function formatBuyableHeadlinePrice(
  buyable: Buyable,
  currency: Currency,
  locale: Locale = "en",
): string {
  const perMonth = locale === "bg" ? "/месец" : "/month";
  const perMo = locale === "bg" ? "/месец" : "/mo";
  const parts: string[] = [];
  parts.push(formatCurrency(buyable.oneTimeEur, currency));
  if (buyable.retainerEur && buyable.oneTimeEur === buyable.retainerEur) {
    // Pure-monthly service: "€97/month" (don't double up).
    return `${formatCurrency(buyable.retainerEur, currency)}${perMonth}`;
  }
  if (buyable.retainerEur) {
    parts.push(`+ ${formatCurrency(buyable.retainerEur, currency)}${perMo}`);
  }
  return parts.join(" ");
}

// Lightweight currency formatter — kept private here to avoid a
// circular import via the more elaborate `formatPrice` in
// ./currency.ts (which imports nothing). Both should match for whole
// EUR amounts; if you change the symbol convention there, mirror it
// here.
function formatCurrency(eur: number, currency: Currency): string {
  const value = currency === "USD" ? Math.round(eur * 1.1) : eur;
  const sym = currency === "USD" ? "$" : "€";
  return `${sym}${value}`;
}
