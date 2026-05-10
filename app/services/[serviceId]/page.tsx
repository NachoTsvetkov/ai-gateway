import Link from "next/link";
import { notFound } from "next/navigation";
import { detectCurrency } from "lib/currency.server";
import { detectLocale } from "lib/i18n/locale.server";
import { type Locale, createT } from "lib/i18n/locale";
import { DICT } from "lib/i18n/dict";
import {
  getLocalizedPainCategories,
  getLocalizedServiceById,
  localizeTierLabel,
  renderServicePrice,
  services,
  type PainCategory,
  type Service,
  type ServiceId,
} from "lib/services-data";
import {
  getLocalizedServiceDetail,
  type ServiceDetail,
} from "lib/service-details";
import {
  buyableFromService,
  getApplicableUpsells,
} from "lib/buyable";
import {
  CheckoutIsland,
  type TierOption,
} from "components/checkout/checkout-island";
import { ViewContentTracker } from "components/analytics/view-content-tracker";

const CALENDLY_URL = "https://calendly.com/nacho-tsvetkov/30min";

// ---------------------------------------------------------------------
// Static params + metadata
// ---------------------------------------------------------------------

// Pre-render every service in the catalogue at build time. Adding a
// new service to `services` automatically gets a static page.
export function generateStaticParams() {
  return services.map((s) => ({ serviceId: s.id }));
}

type RouteParams = { serviceId: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { serviceId } = await params;
  const service = findService(serviceId);
  if (!service) return { title: "Service not found" };
  // Metadata is locale-aware so search-engine snippets in BG markets
  // surface the BG tagline instead of the EN baseline.
  const locale = await detectLocale();
  const localizedService = getLocalizedServiceById(service.id, locale);
  const detail = getLocalizedServiceDetail(service.id, locale);
  return {
    title: `${localizedService.name} — Nacho Tsvetkov`,
    description: detail?.tagline ?? localizedService.solution,
    openGraph: { type: "website" },
  };
}

// ---------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------

// Narrowing helper — `params.serviceId` arrives as a generic string
// from the URL, but we only render pages whose IDs exist in the
// catalogue. Returns undefined for unknown IDs so the page can call
// notFound() cleanly.
function findService(id: string): Service | undefined {
  return services.find((s) => s.id === id);
}

// For tiered services, surface the tier list as a radio picker inside
// the CheckoutIsland. Returns undefined for non-tiered services (the
// island then renders without a picker). The numeric prices come
// straight from the catalogue (single source of truth) and the
// canonical EN label is run through `localizeTierLabel` so BG visitors
// see "1 страница" / "3 страници" instead of "1-page" / "3-page".
function buildTierOptions(
  service: Service,
  locale: Locale,
): TierOption[] | undefined {
  if (service.price.kind !== "tiered") return undefined;
  return service.price.tiers.map((t, i) => ({
    index: i,
    label: localizeTierLabel(t.label, locale),
    oneTimeEur: t.eur,
  }));
}

// Static accent maps — same idea as on /services. Tailwind JIT needs
// to see every class spelled out somewhere or it'll prune them.
const ACCENT_DOT: Record<PainCategory["accent"], string> = {
  blue: "bg-blue-500",
  violet: "bg-violet-500",
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
};
const ACCENT_TEXT: Record<PainCategory["accent"], string> = {
  blue: "text-blue-400",
  violet: "text-violet-400",
  emerald: "text-emerald-400",
  amber: "text-amber-400",
};
const ACCENT_GRADIENT: Record<PainCategory["accent"], string> = {
  blue: "from-blue-400 to-violet-400",
  violet: "from-violet-400 to-fuchsia-400",
  emerald: "from-emerald-400 to-teal-400",
  amber: "from-amber-400 to-orange-400",
};
// Borders for accent-coloured cards (e.g. the "kickoff within 48h"
// ribbon). Spelled out so Tailwind JIT keeps them in the bundle.
const ACCENT_BORDER: Record<PainCategory["accent"], string> = {
  blue: "border-blue-300 dark:border-blue-500/40",
  violet: "border-violet-300 dark:border-violet-500/40",
  emerald: "border-emerald-300 dark:border-emerald-500/40",
  amber: "border-amber-300 dark:border-amber-500/40",
};
// Accent gradients tuned for hero-strength CTA cards (light bg, dark
// text). Used by the deliverables-section "skip the back-and-forth"
// banner so it visually pops as the page's strongest in-content CTA.
const ACCENT_GRADIENT_BG: Record<PainCategory["accent"], string> = {
  blue: "from-blue-50 via-white to-violet-50 dark:from-blue-950/40 dark:via-neutral-900 dark:to-violet-950/40",
  violet:
    "from-violet-50 via-white to-fuchsia-50 dark:from-violet-950/40 dark:via-neutral-900 dark:to-fuchsia-950/40",
  emerald:
    "from-emerald-50 via-white to-teal-50 dark:from-emerald-950/40 dark:via-neutral-900 dark:to-teal-950/40",
  amber:
    "from-amber-50 via-white to-orange-50 dark:from-amber-950/40 dark:via-neutral-900 dark:to-orange-950/40",
};

// ---------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { serviceId } = await params;
  const baseService = findService(serviceId);
  if (!baseService) notFound();
  // Resolve locale + currency in parallel — both are server-side
  // header/cookie reads with no inter-dependency.
  const [currency, locale] = await Promise.all([
    detectCurrency(),
    detectLocale(),
  ]);
  const t = createT(locale);
  // Type assertion is safe — we just verified this id is in the catalogue.
  const id: ServiceId = baseService.id;
  // Localised projections of the catalogue + detail blocks. The
  // base record (`baseService`) is only used for category lookups
  // and for the tier picker (whose label/price come straight from
  // the catalogue and need to stay numerically identical for the
  // URL to round-trip).
  const service = getLocalizedServiceById(id, locale);
  const detail = getLocalizedServiceDetail(id, locale);
  const painCategories = getLocalizedPainCategories(locale);
  const category = painCategories.find(
    (c) => c.id === baseService.painCategoryId,
  );
  const priceText = renderServicePrice(service.price, currency, locale);

  // The `bestFor`, `faq` and rich content fields are optional on the
  // detail object — pages without a detail block still render the
  // hero, price, and CTAs from the catalogue alone.
  const accent = category?.accent ?? "blue";

  // Buy section: project the service into a Buyable so the same
  // checkout island/checkout page that powers /bundles/<slug> works
  // here unchanged. For tiered services we surface the tiers as a
  // radio picker inside the island; the picker rebuilds the buyable
  // client-side as the visitor toggles between tiers.
  const buyable = buyableFromService(service, undefined, locale);
  const tiers = buildTierOptions(baseService, locale);
  // Pass `locale` so the upsell labels + descriptions render through
  // the BG overlay. Without this the island falls back to EN copy
  // even on a fully translated page (the default for the optional
  // arg is "en").
  const upsells = getApplicableUpsells(buyable, locale);

  return (
    <main className="bg-white dark:bg-neutral-900">
      {/* Meta Pixel ViewContent — fires once on hydration with the
          service's id, name, headline price, and pain category. The
          tracker no-ops when consent isn't granted. */}
      <ViewContentTracker
        contentId={service.id}
        contentName={service.name}
        contentType="service"
        contentCategory={category?.title}
        value={buyable.oneTimeEur}
        currency={currency}
      />
      {/* ---------------------------------------------------------------- */}
      {/* HERO — pain agitation                                            */}
      {/* ---------------------------------------------------------------- */}
      <section
        aria-labelledby="service-hero-heading"
        className="relative isolate overflow-hidden bg-gradient-to-br from-neutral-100 via-white to-neutral-100 py-20 sm:py-24 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950"
      >
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-600/15 via-transparent to-transparent" />

        <div className="relative mx-auto max-w-4xl px-6">
          {/* Breadcrumb back to the catalogue. Plain text, low-key. */}
          <nav
            aria-label={locale === "bg" ? "Навигация" : "Breadcrumb"}
            className="mb-6 flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400"
          >
            <Link
              href="/services"
              className="transition-colors hover:text-neutral-900 dark:hover:text-white"
            >
              {t(DICT.serviceDetail.breadcrumbServices)}
            </Link>
            <span aria-hidden="true">›</span>
            {category && (
              <>
                <Link
                  href={`/services#${category.id}`}
                  className="transition-colors hover:text-neutral-900 dark:hover:text-white"
                >
                  {category.title}
                </Link>
                <span aria-hidden="true">›</span>
              </>
            )}
            <span className="text-neutral-800 dark:text-neutral-200">
              {service.name}
            </span>
          </nav>

          {/* Pain category chip — visually anchors this service to the
              broader pain it solves on the catalogue page. */}
          {category && (
            <p className="inline-flex items-center gap-2 rounded-full border border-neutral-300/80 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-neutral-700 backdrop-blur-sm dark:border-neutral-700/70 dark:bg-neutral-900/50 dark:text-neutral-300">
              <span
                className={`h-1.5 w-1.5 rounded-full ${ACCENT_DOT[accent]}`}
              />
              {category.hook}
            </p>
          )}

          <h1
            id="service-hero-heading"
            className="mt-5 text-balance text-4xl font-bold leading-[1.1] tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl dark:text-white"
          >
            {service.name}
          </h1>

          {detail && (
            <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
              {detail.tagline}
            </p>
          )}

          {/* The catalogue's `pain` field — the core "you feel this" hook.
              Italicised + bordered to read like the visitor's own thought. */}
          <blockquote className="mt-8 max-w-2xl border-l-2 border-neutral-300 pl-5 text-base italic text-neutral-700 sm:text-lg dark:border-neutral-700 dark:text-neutral-200">
            {service.pain}
          </blockquote>

          {/* Price band: anchors the CTA below to a tangible number. */}
          <div className="mt-10 flex flex-wrap items-baseline gap-3">
            <span
              className={`bg-gradient-to-r bg-clip-text text-3xl font-extrabold tracking-tight text-transparent sm:text-4xl ${ACCENT_GRADIENT[accent]}`}
            >
              {priceText}
            </span>
            <span className="text-sm text-neutral-500 dark:text-neutral-400">
              {t(DICT.serviceDetail.pricedFixedShipsInDays)}
            </span>
          </div>

          <div className="mt-9 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            {/* Primary: jump to the Buy box at the bottom of the page.
                The buyable.cta.primary verb is service-specific
                ("Build my site", "Launch my store", etc.). */}
            <a
              href="#buy"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-500"
            >
              {buyable.cta.primary}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
                className="h-4 w-4"
              >
                <path
                  fillRule="evenodd"
                  d="M5 10a.75.75 0 0 1 .75-.75h6.638L10.23 7.29a.75.75 0 1 1 1.04-1.08l3.5 3.25a.75.75 0 0 1 0 1.08l-3.5 3.25a.75.75 0 1 1-1.04-1.08l2.158-1.96H5.75A.75.75 0 0 1 5 10Z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
            {/* Secondary: still offer the discovery call for visitors
                who want to talk first. */}
            <a
              href={CALENDLY_URL}
              data-pixel-lead
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-neutral-300 px-7 py-3.5 text-sm font-semibold text-neutral-700 transition-all hover:border-neutral-500 hover:text-neutral-900 dark:border-neutral-600 dark:text-neutral-200 dark:hover:border-neutral-400 dark:hover:text-white"
            >
              {t(DICT.cta.talkFirst)}
            </a>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* PAIN AGITATION                                                   */}
      {/* ---------------------------------------------------------------- */}
      {detail && (
        <section
          aria-labelledby="pain-heading"
          className="border-t border-neutral-200 bg-white py-16 dark:border-neutral-800 dark:bg-neutral-900 sm:py-20"
        >
          <div className="mx-auto max-w-4xl px-6">
            <h2
              id="pain-heading"
              className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl dark:text-white"
            >
              {t(DICT.serviceDetail.painSectionHeadline)}
            </h2>
            <p className="mt-3 text-base text-neutral-600 dark:text-neutral-400">
              {t(DICT.serviceDetail.painSectionSub)}
            </p>
            <ul className="mt-8 space-y-4">
              {detail.painPoints.map((point, i) => (
                <li
                  key={i}
                  className="flex gap-3 rounded-xl border border-red-200/40 bg-red-50/60 p-4 text-sm text-neutral-800 sm:text-base dark:border-red-500/20 dark:bg-red-500/5 dark:text-neutral-200"
                >
                  <span
                    aria-hidden="true"
                    className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-xs font-bold text-red-700 dark:text-red-400"
                  >
                    !
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>

            {/* End-of-section CTA #1 — PAIN. Red danger framing
                because the visitor just read 3-5 things actively
                costing them money. Tone: "stop bleeding". */}
            <a
              href="#buy"
              className="mt-10 flex flex-col items-center justify-between gap-4 rounded-2xl border-2 border-red-300 bg-gradient-to-r from-red-50 to-orange-50 p-6 transition-all hover:border-red-400 hover:shadow-md sm:flex-row dark:border-red-500/40 dark:from-red-950/40 dark:to-orange-950/30 dark:hover:border-red-500/60"
            >
              <div className="text-center sm:text-left">
                <p className="text-base font-bold text-red-900 sm:text-lg dark:text-red-200">
                  {t(DICT.serviceDetail.painCtaTitle)}
                </p>
                <p className="mt-1 text-sm text-red-800/80 dark:text-red-300/80">
                  {t(DICT.serviceDetail.painCtaSub)}
                </p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-red-700">
                {buyable.cta.primary}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                  className="h-4 w-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 10a.75.75 0 0 1 .75-.75h6.638L10.23 7.29a.75.75 0 1 1 1.04-1.08l3.5 3.25a.75.75 0 0 1 0 1.08l-3.5 3.25a.75.75 0 1 1-1.04-1.08l2.158-1.96H5.75A.75.75 0 0 1 5 10Z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            </a>
          </div>
        </section>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* SOLUTION                                                         */}
      {/* ---------------------------------------------------------------- */}
      {detail && (
        <section
          aria-labelledby="solution-heading"
          className="border-t border-neutral-200 bg-neutral-50 py-16 dark:border-neutral-800 dark:bg-neutral-950 sm:py-20"
        >
          <div className="mx-auto max-w-4xl px-6">
            <p
              className={`text-xs font-semibold uppercase tracking-widest ${ACCENT_TEXT[accent]}`}
            >
              {t(DICT.serviceDetail.solutionKicker)}
            </p>
            <h2
              id="solution-heading"
              className="mt-3 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl dark:text-white"
            >
              {t(DICT.serviceDetail.solutionHeadline)}
            </h2>
            <p className="mt-3 text-base text-neutral-600 dark:text-neutral-400">
              {service.solution}
            </p>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {detail.solutionPoints.map((point, i) => (
                <li
                  key={i}
                  className="flex gap-3 rounded-xl border border-neutral-200 bg-white p-5 text-sm text-neutral-700 sm:text-base dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                    className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{point}</span>
                </li>
              ))}
            </ul>

            {/* End-of-section CTA #2 — SOLUTION. Affirmative emerald
                framing: every box on the list above can be ticked.
                Visual mirrors the green check icon from the list. */}
            <div className="mt-10 overflow-hidden rounded-2xl border border-emerald-200 bg-white dark:border-emerald-500/30 dark:bg-neutral-900">
              <div className="grid items-center gap-6 p-6 sm:grid-cols-[1fr_auto] sm:p-7">
                <div className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-5 w-5"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                  <div>
                    <p className="text-base font-bold text-neutral-900 sm:text-lg dark:text-white">
                      {t(DICT.serviceDetail.solutionCtaTitle)}
                    </p>
                    <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                      {t(DICT.serviceDetail.solutionCtaSub)}
                    </p>
                  </div>
                </div>
                <a
                  href="#buy"
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-emerald-500"
                >
                  {buyable.cta.primary}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                    className="h-4 w-4"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 10a.75.75 0 0 1 .75-.75h6.638L10.23 7.29a.75.75 0 1 1 1.04-1.08l3.5 3.25a.75.75 0 0 1 0 1.08l-3.5 3.25a.75.75 0 1 1-1.04-1.08l2.158-1.96H5.75A.75.75 0 0 1 5 10Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* IMPLEMENTATION                                                   */}
      {/* ---------------------------------------------------------------- */}
      {detail && (
        <section
          aria-labelledby="implementation-heading"
          className="border-t border-neutral-200 bg-white py-16 dark:border-neutral-800 dark:bg-neutral-900 sm:py-20"
        >
          <div className="mx-auto max-w-4xl px-6">
            <p
              className={`text-xs font-semibold uppercase tracking-widest ${ACCENT_TEXT[accent]}`}
            >
              {t(DICT.serviceDetail.implKicker)}
            </p>
            <h2
              id="implementation-heading"
              className="mt-3 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl dark:text-white"
            >
              {t(DICT.serviceDetail.implHeadline)} {detail.timeline.toLowerCase()}
            </h2>
            <p className="mt-3 text-base text-neutral-600 dark:text-neutral-400">
              {t(DICT.serviceDetail.implSub)}
            </p>

            <ol className="mt-10 space-y-6">
              {detail.implementation.map((step, i) => (
                <li key={i} className="flex gap-5">
                  <div className="flex shrink-0 flex-col items-center">
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 border-current font-mono text-sm font-bold ${ACCENT_TEXT[accent]}`}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {i < detail.implementation.length - 1 && (
                      <span
                        aria-hidden="true"
                        className="mt-2 w-px flex-1 bg-neutral-200 dark:bg-neutral-800"
                      />
                    )}
                  </div>
                  <div className="pb-6">
                    <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                      {step.title}
                    </h3>
                    <p className="mt-1.5 text-sm text-neutral-600 sm:text-base dark:text-neutral-400">
                      {step.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            {/* End-of-section CTA #3 — IMPLEMENTATION. Timeline-led
                ribbon styled as the next step on the numbered list
                above (matching numbered circle, dashed connector).
                Tone: "you've seen the process — kickoff yours". */}
            <a
              href="#buy"
              className={`mt-2 flex items-center gap-5 rounded-2xl border-2 border-dashed p-5 transition-all hover:border-solid hover:bg-neutral-50 dark:hover:bg-neutral-950 ${ACCENT_BORDER[accent]}`}
            >
              <span
                aria-hidden="true"
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-current ${ACCENT_TEXT[accent]}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .2.08.39.22.53l3 3a.75.75 0 1 0 1.06-1.06l-2.78-2.78V5Z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
              <div className="flex-1">
                <p className="text-base font-bold text-neutral-900 dark:text-white">
                  {t(DICT.serviceDetail.implCtaTitle)}
                </p>
                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                  {t(DICT.serviceDetail.implCtaSub)}
                </p>
              </div>
              <span
                className={`hidden shrink-0 items-center gap-1.5 text-sm font-semibold sm:inline-flex ${ACCENT_TEXT[accent]}`}
              >
                {buyable.cta.primary}
                <span aria-hidden="true">→</span>
              </span>
            </a>
          </div>
        </section>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* DELIVERABLES + BEST FOR                                          */}
      {/* ---------------------------------------------------------------- */}
      {detail && (
        <section
          aria-labelledby="deliverables-heading"
          className="border-t border-neutral-200 bg-neutral-50 py-16 dark:border-neutral-800 dark:bg-neutral-950 sm:py-20"
        >
          <div className="mx-auto max-w-4xl px-6">
            <div className="grid gap-10 lg:grid-cols-2">
              <div>
                <p
                  className={`text-xs font-semibold uppercase tracking-widest ${ACCENT_TEXT[accent]}`}
                >
                  {t(DICT.serviceDetail.deliverablesKicker)}
                </p>
                <h2
                  id="deliverables-heading"
                  className="mt-3 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl dark:text-white"
                >
                  {t(DICT.serviceDetail.deliverablesHeadline)}
                </h2>
                <ul className="mt-6 space-y-3 text-sm text-neutral-700 sm:text-base dark:text-neutral-300">
                  {detail.deliverables.map((d) => (
                    <li key={d} className="flex gap-2.5">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                        className="mt-1 h-4 w-4 shrink-0 text-blue-500"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-6">
                <div className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
                  <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                    {t(DICT.serviceDetail.bestForLabel)}
                  </p>
                  <p className="mt-2 text-base text-neutral-800 dark:text-neutral-200">
                    {detail.bestFor}
                  </p>
                </div>
                <div className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
                  <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                    {t(DICT.serviceDetail.investmentLabel)}
                  </p>
                  <p
                    className={`mt-2 text-2xl font-bold tracking-tight ${ACCENT_TEXT[accent]}`}
                  >
                    {priceText}
                  </p>
                  <a
                    href="#buy"
                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 transition-colors hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    {buyable.cta.primary}
                    <span aria-hidden="true">→</span>
                  </a>
                  <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
                    {t(DICT.serviceDetail.investmentSavePrefix)}
                    <Link
                      href="/#bundles"
                      className="font-semibold text-blue-600 underline decoration-blue-300/40 underline-offset-2 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      {t(DICT.serviceDetail.investmentSaveBundleLink)}
                    </Link>
                    {t(DICT.serviceDetail.investmentSaveSuffix)}
                  </p>
                </div>
              </div>
            </div>

            {/* End-of-section CTA #4 — DELIVERABLES. The strongest
                in-content CTA on the page: full-width, accent
                gradient, price baked in. Tone: "you've seen
                everything — here's the price, click to commit". */}
            <a
              href="#buy"
              className={`mt-12 flex flex-col items-center gap-6 rounded-2xl border border-neutral-200 bg-gradient-to-br p-8 transition-all hover:-translate-y-0.5 hover:shadow-xl sm:flex-row sm:p-10 dark:border-neutral-800 ${ACCENT_GRADIENT_BG[accent]}`}
            >
              <div className="flex-1 text-center sm:text-left">
                <p className="text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl dark:text-white">
                  {t(DICT.serviceDetail.deliverablesCtaTitle)}
                </p>
                <p className="mt-2 text-base text-neutral-700 dark:text-neutral-300">
                  {t(DICT.serviceDetail.deliverablesCtaPrefix)}
                  <span
                    className={`bg-gradient-to-r bg-clip-text font-bold text-transparent ${ACCENT_GRADIENT[accent]}`}
                  >
                    {priceText}
                  </span>
                  {t(DICT.serviceDetail.deliverablesCtaSuffix)}
                </p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-neutral-800 sm:text-base dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100">
                {buyable.cta.primary}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                  className="h-4 w-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 10a.75.75 0 0 1 .75-.75h6.638L10.23 7.29a.75.75 0 1 1 1.04-1.08l3.5 3.25a.75.75 0 0 1 0 1.08l-3.5 3.25a.75.75 0 1 1-1.04-1.08l2.158-1.96H5.75A.75.75 0 0 1 5 10Z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            </a>
          </div>
        </section>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* SERVICE-SPECIFIC FAQ (optional)                                  */}
      {/* ---------------------------------------------------------------- */}
      {detail?.faq && detail.faq.length > 0 && (
        <section
          aria-labelledby="service-faq-heading"
          className="border-t border-neutral-200 bg-white py-16 dark:border-neutral-800 dark:bg-neutral-900 sm:py-20"
        >
          <div className="mx-auto max-w-3xl px-6">
            <h2
              id="service-faq-heading"
              className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl dark:text-white"
            >
              {t(DICT.serviceDetail.faqHeadline)}
            </h2>
            <dl className="mt-8 space-y-3">
              {detail.faq.map((item) => (
                <details
                  key={item.q}
                  className="group rounded-xl border border-neutral-200 bg-white p-5 transition-all open:shadow-md dark:border-neutral-800 dark:bg-neutral-950"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-neutral-900 dark:text-white">
                    <dt>{item.q}</dt>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                      className="h-4 w-4 shrink-0 text-neutral-400 transition-transform group-open:rotate-45"
                    >
                      <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
                    </svg>
                  </summary>
                  <dd className="mt-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    {item.a}
                  </dd>
                </details>
              ))}
            </dl>

            {/* End-of-section CTA #5 — FAQ. Minimal text-led close
                because the dramatic CTA is right below this section
                (the actual buy box). Two paths: out of questions →
                buy; still unsure → talk first. */}
            <div className="mt-10 border-t border-neutral-200 pt-8 text-center dark:border-neutral-800">
              <p className="text-base font-semibold text-neutral-900 dark:text-white">
                {t(DICT.serviceDetail.faqCtaTitle)}
              </p>
              <div className="mt-4 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
                <a
                  href="#buy"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-blue-500"
                >
                  {buyable.cta.primary}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                    className="h-4 w-4"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 10a.75.75 0 0 1 .75-.75h6.638L10.23 7.29a.75.75 0 1 1 1.04-1.08l3.5 3.25a.75.75 0 0 1 0 1.08l-3.5 3.25a.75.75 0 1 1-1.04-1.08l2.158-1.96H5.75A.75.75 0 0 1 5 10Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a
                  href={CALENDLY_URL}
                  data-pixel-lead
              data-pixel-lead
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-neutral-600 underline-offset-4 transition-colors hover:text-blue-600 hover:underline dark:text-neutral-400 dark:hover:text-blue-400"
                >
                  {t(DICT.serviceDetail.faqCtaUnsure)}
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* BUY THIS SERVICE — the actual conversion point                   */}
      {/* ---------------------------------------------------------------- */}
      {/*
        Anchor target for the hero "{cta.primary}" button + the small
        "Investment" card's CTA. `scroll-mt-24` keeps the section's top
        below the sticky navbar when the visitor smooth-scrolls in.

        We use a centred single-column layout (max-w-2xl) on every
        breakpoint — the buy box is the dominant element and a sticky
        sidebar treatment (like /bundles/[slug]) doesn't add value
        when the page only sells ONE thing. The CheckoutIsland already
        contains everything the visitor needs to commit.
      */}
      <section
        id="buy"
        aria-labelledby="service-buy-heading"
        className="scroll-mt-24 border-t border-neutral-200 bg-gradient-to-br from-neutral-100 via-white to-neutral-100 py-16 dark:border-neutral-800 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950"
      >
        <div className="mx-auto max-w-2xl px-6">
          <div className="text-center">
            <p
              className={`text-xs font-semibold uppercase tracking-widest ${ACCENT_TEXT[accent]}`}
            >
              {t(DICT.serviceDetail.buyKicker)}
            </p>
            <h2
              id="service-buy-heading"
              className="mt-3 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl dark:text-white"
            >
              {t(DICT.serviceDetail.buyHeadlinePrefix)}
              {service.name.toLowerCase()}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-neutral-700 dark:text-neutral-300">
              {t(DICT.serviceDetail.buySub)}
            </p>
          </div>

          <div className="mt-10">
            <CheckoutIsland
              buyable={buyable}
              upsells={upsells}
              currency={currency}
              tiers={tiers}
              locale={locale}
            />
          </div>

          {/* Alt path for visitors who'd rather scope before paying.
              Kept compact and below-the-fold so the buy box is the
              clear primary action. */}
          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <a
              href={CALENDLY_URL}
              data-pixel-lead
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-neutral-300 px-6 py-3 text-sm font-semibold text-neutral-700 transition-all hover:border-neutral-500 hover:text-neutral-900 dark:border-neutral-600 dark:text-neutral-200 dark:hover:border-neutral-400 dark:hover:text-white"
            >
              {t(DICT.cta.talkFirst)}
            </a>
            <Link
              href="/services"
              className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
            >
              {t(DICT.cta.backToServices)}
            </Link>
          </div>

          <p className="mt-6 text-center text-xs text-neutral-500 dark:text-neutral-500">
            {t(DICT.serviceDetail.closingPrefix)}{" "}
            <a
              href="mailto:nacho.tsvetkov@gmail.com"
              className="text-neutral-700 underline decoration-neutral-400 underline-offset-2 hover:text-neutral-900 dark:text-neutral-300 dark:decoration-neutral-600 dark:hover:text-white"
            >
              nacho.tsvetkov@gmail.com
            </a>{" "}
            ·{" "}
            <a
              href="tel:+359882700002"
              className="text-neutral-700 underline decoration-neutral-400 underline-offset-2 hover:text-neutral-900 dark:text-neutral-300 dark:decoration-neutral-600 dark:hover:text-white"
            >
              +359 882 700 002
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}

// Suppress unused-warning for ServiceDetail import (kept for IDE jump-to-def
// while developing). Could be removed safely.
export type { ServiceDetail };
