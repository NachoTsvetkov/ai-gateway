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
            <a
              href={CALENDLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-500"
            >
              Book a free 15-min call
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
                className="h-4 w-4"
              >
                <path
                  fillRule="evenodd"
                  d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
            <Link
              href="/#bundles"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-neutral-600 px-7 py-3.5 text-sm font-semibold text-neutral-200 transition-all hover:border-neutral-400 hover:text-white"
            >
              See bundles (save 60%+)
            </Link>
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
                  <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
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
      {/* CLOSING CTA                                                      */}
      {/* ---------------------------------------------------------------- */}
      <section
        aria-labelledby="service-cta-heading"
        className="border-t border-neutral-200 bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 py-16 dark:border-neutral-800"
      >
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2
            id="service-cta-heading"
            className="text-2xl font-bold tracking-tight text-white sm:text-3xl"
          >
            Ready to ship {service.name.toLowerCase()}?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-neutral-300">
            Free 15-minute discovery call. We map your specific situation,
            confirm fixed scope + price, and you decide. No pressure,
            no jargon.
          </p>
          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <a
              href={CALENDLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-500"
            >
              Book the discovery call
            </a>
            <Link
              href="/services"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-neutral-600 px-7 py-3 text-sm font-semibold text-neutral-200 transition-all hover:border-neutral-400 hover:text-white"
            >
              ← Back to all services
            </Link>
          </div>
          <p className="mt-6 text-xs text-neutral-500">
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
