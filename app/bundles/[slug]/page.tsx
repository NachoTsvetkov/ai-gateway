// /bundles/[slug] — bundle detail / "buy" page.
//
// The page is a Server Component that statically renders one page per
// bundle id (`startup`, `scaleup`, `enterprise`). The interactive
// upsell selector + dynamic total is delegated to the
// `<BundleCheckoutIsland>` Client Component. Everything else (hero,
// what's-included list, value comparison, social proof, FAQ) is plain
// static HTML — fastest possible LCP, easiest to crawl.
//
// Composition:
//   1. Hero               — bundle name, tagline, headline price, savings
//   2. What's included    — every line in `bundle.contents`, with deep
//                           links into /services/<id> for service lines
//                           so the visitor can investigate before buying
//   3. Value math card    — "buying separately" total crossed out vs the
//                           bundle price, plus "you save €X" badge
//   4. Upsell selector    — client island, recommended upsells pre-checked
//   5. FAQ                — bundle-level questions (timeline, what if I
//                           need something not listed, refunds, etc.)
//   6. Footer CTA         — alternative path: book a free 15-min call

import Link from "next/link";
import { notFound } from "next/navigation";
import {
  type Bundle,
  type BundleId,
  BUNDLES,
  getBundleFaqBg,
  getBundleSavingsEur,
  getBundleSeparatePriceEur,
  getLocalizedBundle,
} from "lib/bundles-data";
import {
  type ServiceId,
  getLocalizedServiceById,
  getServiceById,
} from "lib/services-data";
import { type Currency, formatPrice } from "lib/currency";
import { detectCurrency } from "lib/currency.server";
import { detectLocale } from "lib/i18n/locale.server";
import { type Locale, createT } from "lib/i18n/locale";
import { DICT } from "lib/i18n/dict";
import {
  buyableFromBundle,
  getApplicableUpsells,
} from "lib/buyable";
import { CheckoutIsland } from "components/checkout/checkout-island";

const CALENDLY_URL = "https://calendly.com/nacho-tsvetkov/30min";

const VALID_SLUGS: ReadonlySet<string> = new Set(BUNDLES.map((b) => b.id));

// ---------------------------------------------------------------------
// Static params + metadata
// ---------------------------------------------------------------------

export function generateStaticParams() {
  return BUNDLES.map((b) => ({ slug: b.id }));
}

type RouteParams = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { slug } = await params;
  if (!VALID_SLUGS.has(slug)) return { title: "Bundle not found" };
  const locale = await detectLocale();
  const b = getLocalizedBundle(slug as BundleId, locale);
  return {
    title: `${b.name} — Nacho Tsvetkov`,
    description: `${b.tagline}. ${b.pain}`,
    openGraph: { type: "website" },
  };
}

// ---------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------

export default async function BundleDetailPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { slug } = await params;
  if (!VALID_SLUGS.has(slug)) notFound();
  // Currency + locale lookups don't depend on each other — fan out so
  // the page's TTFB is bound by the slower of the two, not their sum.
  const [currency, locale] = await Promise.all([
    detectCurrency(),
    detectLocale(),
  ]);
  const bundle = getLocalizedBundle(slug as BundleId, locale);

  const separateEur = getBundleSeparatePriceEur(bundle);
  const savingsEur = getBundleSavingsEur(bundle);
  const showsSavings = savingsEur > 0;
  // Single normalized buyable shared between the order-summary helpers
  // and the interactive CheckoutIsland sidebar — keeps both views
  // anchored to the same price + reference id.
  const buyable = buyableFromBundle(bundle);
  const upsells = getApplicableUpsells(buyable, locale);

  return (
    <main className="bg-white dark:bg-neutral-950">
      <Hero
        bundle={bundle}
        currency={currency}
        savingsEur={savingsEur}
        locale={locale}
      />

      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 lg:grid-cols-[1fr_minmax(360px,420px)] lg:gap-10 lg:py-20">
        <div className="space-y-12">
          <Inclusions bundle={bundle} currency={currency} locale={locale} />
          {showsSavings && (
            <ValueComparison
              bundle={bundle}
              currency={currency}
              separateEur={separateEur}
              savingsEur={savingsEur}
              locale={locale}
            />
          )}
          <FAQ bundle={bundle} locale={locale} />
        </div>

        {/* Sidebar (sticky on desktop) — the interactive upsell + total
            + checkout CTA. On mobile this falls below the inclusions
            list, which is fine: the in-hero CTA scrolls there anyway.
            `id="upsells"` is the anchor target for the hero's primary
            CTA (`href="#upsells"`); `scroll-mt-24` keeps the section's
            top out from under the sticky navbar after a smooth scroll. */}
        <aside
          id="upsells"
          className="scroll-mt-24 lg:sticky lg:top-24 lg:self-start"
        >
          <CheckoutIsland
            buyable={buyable}
            upsells={upsells}
            currency={currency}
            locale={locale}
          />
        </aside>
      </div>

      <FooterCTA locale={locale} />
    </main>
  );
}

// ---------------------------------------------------------------------
// Hero
// ---------------------------------------------------------------------

function Hero({
  bundle,
  currency,
  savingsEur,
  locale,
}: {
  bundle: Bundle;
  currency: Currency;
  savingsEur: number;
  locale: Locale;
}) {
  const t = createT(locale);
  // Two short retainer-line variants in BG/EN. Inlined here because
  // they're both grammatically tied to the surrounding parentheses
  // and adding a `/` separator was simpler than carving four entries
  // into DICT.
  const oneTimeNote = bundle.retainerEur
    ? locale === "bg"
      ? `еднократно + ${formatPrice(bundle.retainerEur, currency)}/месец абонамент`
      : `one-time + ${formatPrice(bundle.retainerEur, currency)}/month retainer`
    : locale === "bg"
      ? "еднократно плащане"
      : "one-time payment";
  const allBundlesLabel = locale === "bg" ? "Всички пакети" : "All bundles";
  const saveLabel = locale === "bg" ? "Спести" : "Save";
  return (
    <section
      aria-labelledby="bundle-hero-heading"
      className="relative isolate overflow-hidden border-b border-neutral-200 bg-neutral-950 py-16 sm:py-20 dark:border-neutral-800"
    >
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-violet-600/15 via-transparent to-transparent" />

      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-4">
          <Link
            href="/#bundles"
            className="inline-flex items-center gap-1.5 text-sm text-neutral-400 transition-colors hover:text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
              className="h-4 w-4"
            >
              <path
                fillRule="evenodd"
                d="M15 10a.75.75 0 0 1-.75.75H7.612l2.158 1.96a.75.75 0 1 1-1.04 1.08l-3.5-3.25a.75.75 0 0 1 0-1.08l3.5-3.25a.75.75 0 1 1 1.04 1.08L7.612 9.25h6.638A.75.75 0 0 1 15 10Z"
                clipRule="evenodd"
              />
            </svg>
            {allBundlesLabel}
          </Link>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
              {bundle.tagline}
            </p>
            <h1
              id="bundle-hero-heading"
              className="mt-3 text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl"
            >
              {bundle.name}
            </h1>
            <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-neutral-300 sm:text-lg">
              {bundle.pain}
            </p>

            <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-blue-500/40 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-300">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
              {bundle.roiHook}
            </p>
          </div>

          {/* Pricing column. Big bold price, retainer note underneath,
              "you save" pill aligned right when present. The pill is a
              priced anchor — visitors who scroll no further than the
              hero already see the comparative value. */}
          <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-b from-blue-950/60 to-neutral-900 p-6 shadow-2xl shadow-blue-600/20 sm:p-8">
            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl">
                {formatPrice(bundle.oneTimeEur, currency)}
              </span>
              {savingsEur > 0 && (
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-300">
                  {saveLabel} {formatPrice(savingsEur, currency)}
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-neutral-400">{oneTimeNote}</p>

            <a
              href="#upsells"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition-all hover:-translate-y-0.5 hover:bg-blue-500 sm:text-base"
            >
              {bundle.cta.primary}
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
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-neutral-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-neutral-500"
            >
              {t(DICT.cta.talkFirst)}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------
// What's included
// ---------------------------------------------------------------------

function Inclusions({
  bundle,
  currency,
  locale,
}: {
  bundle: Bundle;
  currency: Currency;
  locale: Locale;
}) {
  const t = createT(locale);
  // Resolve every line into a render-friendly shape upfront so the JSX
  // below stays declarative. Rules:
  //   - service line  → name (override-able), link, line-item EUR price
  //   - inherit line  → "Everything in <bundle name>" + total inherited price
  //   - bonus line    → just a label, no price column
  //   - freebies      → rendered FIRST with a green "FREE" badge
  // Each `kind` is its OWN union member (no `"freebie" | "bonus"` lump)
  // so TypeScript can narrow `r.href` correctly inside the chained
  // ternary below — without separate kinds it widens back to the
  // unioned type and refuses to read `href`.
  type Row =
    | { kind: "freebie"; label: string }
    | { kind: "bonus"; label: string }
    | {
        kind: "service";
        label: string;
        href: string;
        priceEur: number;
        // Service note for the secondary line (e.g. service.solution).
        sub?: string;
      }
    | {
        kind: "inherit";
        label: string;
        href: string;
        priceEur: number;
      };

  const rows: Row[] = [];

  for (const f of bundle.freebies ?? []) {
    rows.push({ kind: "freebie", label: f });
  }

  for (const line of bundle.contents) {
    if (line.kind === "bonus") {
      rows.push({ kind: "bonus", label: line.label });
    } else if (line.kind === "service") {
      // Pull the localised service so the row label + sub-text follow
      // the active locale. For services with a `note` override on the
      // bundle line, the note already comes from the localised bundle
      // record (see getLocalizedBundle), so no extra work needed.
      const svc = getLocalizedServiceById(line.serviceId, locale);
      const price = serviceLineEur(line.serviceId, line.tier);
      rows.push({
        kind: "service",
        label: line.note ?? svc.name,
        href: `/services/${svc.id}`,
        priceEur: price,
        sub: svc.solution,
      });
    } else {
      // Inherited bundle content — also localised so the BG version of
      // a Scale-Up reading "Всичко от Startup пакета" gets the BG name.
      const parent = getLocalizedBundle(line.from, locale);
      rows.push({
        kind: "inherit",
        label: `${t(DICT.bundleDetail.inheritFromPrefix)}${parent.name}`,
        href: `/bundles/${parent.id}`,
        priceEur: getBundleSeparatePriceEur(parent),
      });
    }
  }

  return (
    <section aria-labelledby="includes-heading">
      <h2
        id="includes-heading"
        className="text-2xl font-bold text-neutral-900 sm:text-3xl dark:text-white"
      >
        {t(DICT.bundleDetail.inclusionsHeadline)}
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-neutral-600 dark:text-neutral-400">
        {t(DICT.bundleDetail.inclusionsSub)}
      </p>

      <ul className="mt-6 divide-y divide-neutral-200 rounded-2xl border border-neutral-200 bg-white dark:divide-neutral-800 dark:border-neutral-800 dark:bg-neutral-900">
        {rows.map((r, i) => (
          <li
            key={`${r.kind}:${i}`}
            className="flex items-start gap-4 p-4 sm:p-5"
          >
            {r.kind === "freebie" ? (
              <CheckIcon className="mt-0.5 h-5 w-5 flex-none text-emerald-500" />
            ) : (
              <CheckIcon className="mt-0.5 h-5 w-5 flex-none text-blue-500" />
            )}

            <div className="min-w-0 flex-1">
              {r.kind === "freebie" ? (
                <p className="text-sm font-medium text-neutral-900 dark:text-white">
                  <span className="mr-2 inline-flex items-center rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                    {t(DICT.bundleDetail.freebieBadge)}
                  </span>
                  {r.label}
                </p>
              ) : r.kind === "bonus" ? (
                <p className="text-sm text-neutral-800 dark:text-neutral-200">
                  {r.label}
                </p>
              ) : (
                <Link
                  href={r.href}
                  prefetch={true}
                  className="group block"
                >
                  <p className="text-sm font-semibold text-neutral-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                    {r.label}
                    <span
                      aria-hidden="true"
                      className="ml-1 inline-block transition-transform group-hover:translate-x-0.5"
                    >
                      →
                    </span>
                  </p>
                  {"sub" in r && r.sub && (
                    <p className="mt-1 line-clamp-2 text-xs text-neutral-600 dark:text-neutral-400">
                      {r.sub}
                    </p>
                  )}
                </Link>
              )}
            </div>

            {(r.kind === "service" || r.kind === "inherit") && (
              <p className="ml-3 flex-none whitespace-nowrap text-right font-mono text-sm text-neutral-500 line-through dark:text-neutral-500">
                {formatPrice(r.priceEur, currency)}
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

// ---------------------------------------------------------------------
// Value comparison card — separate price vs bundle price vs you save
// ---------------------------------------------------------------------

function ValueComparison({
  bundle,
  currency,
  separateEur,
  savingsEur,
  locale,
}: {
  bundle: Bundle;
  currency: Currency;
  separateEur: number;
  savingsEur: number;
  locale: Locale;
}) {
  const t = createT(locale);
  const savingsPct = Math.round((savingsEur / separateEur) * 100);
  // Headline is a sentence with a price embedded in the middle, so we
  // pre-compose it here from two language-specific halves rather than
  // a single localised string with placeholder syntax.
  const valueHeadline =
    locale === "bg"
      ? `Защо пакетът ти спестява ${formatPrice(savingsEur, currency)}`
      : `Why the bundle saves you ${formatPrice(savingsEur, currency)}`;
  const retainerNote = bundle.retainerEur
    ? locale === "bg"
      ? `Месечният абонамент от ${formatPrice(bundle.retainerEur, currency)} замества това, което иначе би плащал отделно за хостинг + договор за поддръжка. Отказваш по всяко време; всичко остава твое.`
      : `The ${formatPrice(bundle.retainerEur, currency)}/month retainer replaces what you'd otherwise pay separately for hosting + a maintenance contract. Cancel anytime; you keep ownership of everything.`
    : null;
  return (
    <section
      aria-labelledby="value-heading"
      className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 sm:p-8 dark:border-emerald-500/20 dark:bg-emerald-950/20"
    >
      <h2
        id="value-heading"
        className="text-xl font-bold text-emerald-900 dark:text-emerald-200"
      >
        {valueHeadline}
      </h2>

      <dl className="mt-5 grid gap-4 sm:grid-cols-3">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-widest text-emerald-800/70 dark:text-emerald-200/70">
            {t(DICT.bundleDetail.valueSeparate)}
          </dt>
          <dd className="mt-1 font-mono text-2xl font-bold text-emerald-900 line-through dark:text-emerald-200">
            {formatPrice(separateEur, currency)}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-widest text-emerald-800/70 dark:text-emerald-200/70">
            {bundle.name}
          </dt>
          <dd className="mt-1 font-mono text-2xl font-extrabold text-emerald-900 dark:text-emerald-200">
            {formatPrice(bundle.oneTimeEur, currency)}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-widest text-emerald-800/70 dark:text-emerald-200/70">
            {t(DICT.bundleDetail.valueSavings)}
          </dt>
          <dd className="mt-1 font-mono text-2xl font-extrabold text-emerald-900 dark:text-emerald-200">
            {formatPrice(savingsEur, currency)}{" "}
            <span className="text-sm font-semibold">({savingsPct}%)</span>
          </dd>
        </div>
      </dl>

      {retainerNote && (
        <p className="mt-5 text-sm text-emerald-900/80 dark:text-emerald-200/80">
          {retainerNote}
        </p>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------
// FAQ
// ---------------------------------------------------------------------

function FAQ({ bundle, locale }: { bundle: Bundle; locale: Locale }) {
  const t = createT(locale);
  // BG visitors get a hand-tuned FAQ from `bundles-data.bg.ts` — the
  // questions are deliberately different from the EN list (different
  // concerns surface in BG conversations, like domains and hidden
  // monthly fees), so we don't try to translate the EN entries
  // 1-for-1. EN visitors keep the inline EN array. The two arrays
  // share the same `{ q, a }` shape so the JSX below is identical.
  const bgFaq = locale === "bg" ? getBundleFaqBg(bundle.id) : undefined;
  const faq: ReadonlyArray<{ q: string; a: string }> =
    bgFaq ?? [
      {
        q: `What if I already have something from the ${bundle.name}'s list?`,
        a: "Tell me on the kickoff call — I'll subtract the redundant piece and either credit it as upgrade time on something else (e.g. extra design polish, a 4th flow, deeper integration) or refund pro rata. No fight, ever.",
      },
      {
        q: "How fast does this ship?",
        a:
          bundle.id === "startup"
            ? "Startup typically goes live in 5–7 business days from kickoff. Add 'Express delivery' from the upgrades to compress to 3–4 days."
            : bundle.id === "scaleup"
              ? "Scale-Up ships the website + automation pieces in 2 weeks. CRM follows in week 3. Express delivery cuts the first deliverable to ~7 days."
              : "Enterprise rolls out in 3 phases over 4–6 weeks (foundation → automation → AI agents). You start using each piece as it's delivered — no big-bang go-live.",
      },
      {
        q: "Can I cancel the monthly retainer later?",
        a: bundle.retainerEur
          ? "Yes — month-to-month, no contract. You keep ownership of the code, design, and data. The freebies that came with the retainer (domain + hosting) revert to you at cost (€10–15/yr typically) when you cancel."
          : "There's no recurring component on this bundle — it's a one-time payment. Add the maintenance retainer separately if you'd like it.",
      },
      {
        q: "What if I need something not on the list?",
        a: "Tell me. Most things outside the bundle are available as a-la-carte add-ons — pricing on /services. If it's a small ask (an extra page, a copy tweak, a new flow), I just include it. If it's bigger, I quote it before doing the work.",
      },
      {
        q: "Do you offer refunds?",
        a: "Yes — if I haven't shipped any work yet, full refund, no questions. After we kick off, I refund the unspent portion if you decide to bail. Zero hostage situations.",
      },
    ];

  return (
    <section aria-labelledby="faq-heading">
      <h2
        id="faq-heading"
        className="text-2xl font-bold text-neutral-900 sm:text-3xl dark:text-white"
      >
        {t(DICT.bundleDetail.bundleFaqHeadline)}
      </h2>
      <div className="mt-6 space-y-2">
        {faq.map((f, i) => (
          <details
            key={i}
            className="group rounded-xl border border-neutral-200 bg-white p-5 open:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:open:bg-neutral-900/80"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-sm font-semibold text-neutral-900 dark:text-white">
              <span>{f.q}</span>
              <span
                aria-hidden="true"
                className="flex-none text-neutral-400 transition-transform group-open:rotate-180"
              >
                ▾
              </span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
              {f.a}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------
// Footer CTA
// ---------------------------------------------------------------------

function FooterCTA({ locale }: { locale: Locale }) {
  const t = createT(locale);
  // The "not sure?" framing copy is bundle-page-only and benefits
  // from full BG rewrites (translating "no pitch" word-for-word
  // sounds robotic). Inlined here in both locales rather than added
  // to DICT for one-off copy.
  const headline =
    locale === "bg"
      ? "Не си сигурен кой пакет ти трябва?"
      : "Not sure which bundle fits?";
  const sub =
    locale === "bg"
      ? "15 минути, без рекламни приказки — слушам, задавам 3 въпроса и ти казвам най-малкия пакет, който ще ти свърши работа. Ако не е пакет, ти препоръчвам отделна услуга."
      : "15 minutes, no pitch — I'll listen, ask 3 questions, and tell you the smallest fit. If a bundle isn't it, I'll send you to the single service that solves your problem instead.";
  const browseServices =
    locale === "bg" ? "Разгледай отделните услуги" : "Browse single services";
  return (
    <section className="border-t border-neutral-200 bg-neutral-50 py-16 dark:border-neutral-800 dark:bg-neutral-950">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="text-2xl font-bold text-neutral-900 sm:text-3xl dark:text-white">
          {headline}
        </h2>
        <p className="mt-3 text-base text-neutral-600 dark:text-neutral-400">
          {sub}
        </p>
        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href={CALENDLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-500"
          >
            {t(DICT.cta.bookFree15Min)}
          </a>
          <Link
            href="/services"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-neutral-300 px-6 py-3 text-sm font-semibold text-neutral-800 transition-colors hover:border-neutral-400 hover:bg-white dark:border-neutral-700 dark:text-neutral-200 dark:hover:border-neutral-600 dark:hover:bg-neutral-900"
          >
            {browseServices}
          </Link>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------

// Tiny inline price resolver for service lines on the inclusions list.
// We deliberately don't call into bundles-data to avoid surfacing the
// `priceToEur` helper there — it's an internal detail of the math
// helpers. Replicating the small switch here is cheaper than reorganising
// the export surface.
function serviceLineEur(serviceId: ServiceId, tier: number | undefined): number {
  const s = getServiceById(serviceId);
  switch (s.price.kind) {
    case "from":
      return s.price.eur;
    case "monthly":
      return s.price.eur;
    case "addon":
      return s.price.addonEur;
    case "tiered": {
      const idx = tier ?? 0;
      const t = s.price.tiers[idx] ?? s.price.tiers[0];
      return t.eur;
    }
  }
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
