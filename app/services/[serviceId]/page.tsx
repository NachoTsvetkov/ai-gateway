import Link from "next/link";
import { notFound } from "next/navigation";
import { formatPrice } from "lib/currency";
import { detectCurrency } from "lib/currency.server";
import {
  PAIN_CATEGORIES,
  getServiceById,
  renderServicePrice,
  services,
  type PainCategory,
  type Service,
  type ServiceId,
} from "lib/services-data";
import { getServiceDetail, type ServiceDetail } from "lib/service-details";
import {
  type Buyable,
  buyableFromService,
  getApplicableUpsells,
} from "lib/buyable";
import {
  CheckoutIsland,
  type TierOption,
} from "components/checkout/checkout-island";

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
  const detail = getServiceDetail(service.id);
  return {
    title: `${service.name} — Nacho Tsvetkov`,
    description: detail?.tagline ?? service.solution,
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

function findCategory(id: string): PainCategory | undefined {
  return PAIN_CATEGORIES.find((c) => c.id === id);
}

// For tiered services, surface the tier list as a radio picker inside
// the CheckoutIsland. Returns undefined for non-tiered services (the
// island then renders without a picker). The labels and prices come
// directly from the service's catalogue entry so changing one place
// (services-data.ts) keeps the buy box in sync.
function buildTierOptions(service: Service): TierOption[] | undefined {
  if (service.price.kind !== "tiered") return undefined;
  return service.price.tiers.map((t, i) => ({
    index: i,
    label: t.label,
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

// ---------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { serviceId } = await params;
  const service = findService(serviceId);
  if (!service) notFound();
  // Type assertion is safe — we just verified this id is in the catalogue.
  const id: ServiceId = service.id;
  const detail = getServiceDetail(id);
  const category = findCategory(service.painCategoryId);
  const currency = await detectCurrency();
  const priceText = renderServicePrice(service.price, currency);

  // The `bestFor`, `faq` and rich content fields are optional on the
  // detail object — pages without a detail block still render the
  // hero, price, and CTAs from the catalogue alone.
  const accent = category?.accent ?? "blue";

  // Buy section: project the service into a Buyable so the same
  // checkout island/checkout page that powers /bundles/<slug> works
  // here unchanged. For tiered services we surface the tiers as a
  // radio picker inside the island; the picker rebuilds the buyable
  // client-side as the visitor toggles between tiers.
  const buyable = buyableFromService(service, undefined);
  const tiers = buildTierOptions(service);
  const upsells = getApplicableUpsells(buyable);

  return (
    <main className="bg-white dark:bg-neutral-900">
      {/* ---------------------------------------------------------------- */}
      {/* HERO — pain agitation                                            */}
      {/* ---------------------------------------------------------------- */}
      <section
        aria-labelledby="service-hero-heading"
        className="relative isolate overflow-hidden bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 py-20 sm:py-24"
      >
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-600/15 via-transparent to-transparent" />

        <div className="relative mx-auto max-w-4xl px-6">
          {/* Breadcrumb back to the catalogue. Plain text, low-key. */}
          <nav
            aria-label="Breadcrumb"
            className="mb-6 flex items-center gap-2 text-xs text-neutral-400"
          >
            <Link
              href="/services"
              className="transition-colors hover:text-white"
            >
              Services
            </Link>
            <span aria-hidden="true">›</span>
            {category && (
              <>
                <Link
                  href={`/services#${category.id}`}
                  className="transition-colors hover:text-white"
                >
                  {category.title}
                </Link>
                <span aria-hidden="true">›</span>
              </>
            )}
            <span className="text-neutral-200">{service.name}</span>
          </nav>

          {/* Pain category chip — visually anchors this service to the
              broader pain it solves on the catalogue page. */}
          {category && (
            <p className="inline-flex items-center gap-2 rounded-full border border-neutral-700/70 bg-neutral-900/50 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-neutral-300 backdrop-blur-sm">
              <span
                className={`h-1.5 w-1.5 rounded-full ${ACCENT_DOT[accent]}`}
              />
              {category.hook}
            </p>
          )}

          <h1
            id="service-hero-heading"
            className="mt-5 text-balance text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl"
          >
            {service.name}
          </h1>

          {detail && (
            <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-neutral-300">
              {detail.tagline}
            </p>
          )}

          {/* The catalogue's `pain` field — the core "you feel this" hook.
              Italicised + bordered to read like the visitor's own thought. */}
          <blockquote className="mt-8 max-w-2xl border-l-2 border-neutral-700 pl-5 text-base italic text-neutral-200 sm:text-lg">
            {service.pain}
          </blockquote>

          {/* Price band: anchors the CTA below to a tangible number. */}
          <div className="mt-10 flex flex-wrap items-baseline gap-3">
            <span
              className={`bg-gradient-to-r bg-clip-text text-3xl font-extrabold tracking-tight text-transparent sm:text-4xl ${ACCENT_GRADIENT[accent]}`}
            >
              {priceText}
            </span>
            <span className="text-sm text-neutral-400">
              · fixed-price · ships in days
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
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-neutral-600 px-7 py-3.5 text-sm font-semibold text-neutral-200 transition-all hover:border-neutral-400 hover:text-white"
            >
              Or talk first — book a 15-min call
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
              If this is you, you&apos;re losing money right now
            </h2>
            <p className="mt-3 text-base text-neutral-600 dark:text-neutral-400">
              Every one of these is a measurable cost. Most clients
              recognise at least three before booking.
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
              The fix
            </p>
            <h2
              id="solution-heading"
              className="mt-3 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl dark:text-white"
            >
              Here&apos;s what you get
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
              How it ships
            </p>
            <h2
              id="implementation-heading"
              className="mt-3 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl dark:text-white"
            >
              Implementation in {detail.timeline.toLowerCase()}
            </h2>
            <p className="mt-3 text-base text-neutral-600 dark:text-neutral-400">
              No surprises. You see daily progress in a shared workspace and
              can call &quot;done&quot; whenever you&apos;re happy.
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
                  What you walk away with
                </p>
                <h2
                  id="deliverables-heading"
                  className="mt-3 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl dark:text-white"
                >
                  Deliverables
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
                    Best for
                  </p>
                  <p className="mt-2 text-base text-neutral-800 dark:text-neutral-200">
                    {detail.bestFor}
                  </p>
                </div>
                <div className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
                  <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                    Investment
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
                    Or save 60%+ by grabbing it inside a{" "}
                    <Link
                      href="/#bundles"
                      className="font-semibold text-blue-600 underline decoration-blue-300/40 underline-offset-2 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      bundle
                    </Link>
                    .
                  </p>
                </div>
              </div>
            </div>
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
              Quick questions
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
        className="scroll-mt-24 border-t border-neutral-200 bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 py-16 dark:border-neutral-800"
      >
        <div className="mx-auto max-w-2xl px-6">
          <div className="text-center">
            <p
              className={`text-xs font-semibold uppercase tracking-widest ${ACCENT_TEXT[accent]}`}
            >
              Ready when you are
            </p>
            <h2
              id="service-buy-heading"
              className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl"
            >
              Buy {service.name.toLowerCase()}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-neutral-300">
              Fixed scope. Fixed price. Ships in days. Cancel for a full
              refund any time before kickoff.
            </p>
          </div>

          <div className="mt-10">
            <CheckoutIsland
              buyable={buyable}
              upsells={upsells}
              currency={currency}
              tiers={tiers}
            />
          </div>

          {/* Alt path for visitors who'd rather scope before paying.
              Kept compact and below-the-fold so the buy box is the
              clear primary action. */}
          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <a
              href={CALENDLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-neutral-600 px-6 py-3 text-sm font-semibold text-neutral-200 transition-all hover:border-neutral-400 hover:text-white"
            >
              Or talk first — book a free 15-min call
            </a>
            <Link
              href="/services"
              className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-neutral-400 transition-colors hover:text-white"
            >
              ← Back to all services
            </Link>
          </div>

          <p className="mt-6 text-center text-xs text-neutral-500">
            Prefer email or phone?{" "}
            <a
              href="mailto:nacho.tsvetkov@gmail.com"
              className="text-neutral-300 underline decoration-neutral-600 underline-offset-2 hover:text-white"
            >
              nacho.tsvetkov@gmail.com
            </a>{" "}
            ·{" "}
            <a
              href="tel:+359882700002"
              className="text-neutral-300 underline decoration-neutral-600 underline-offset-2 hover:text-white"
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
