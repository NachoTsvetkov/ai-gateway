import Image from "next/image";
import Link from "next/link";
import { SalesAssistant } from "components/ai/sales-assistant";
import { formatPrice, formatPriceK, type Currency } from "lib/currency";
import { detectCurrency } from "lib/currency.server";
import {
  getLocalizedHookServices,
  renderServicePriceParts,
} from "lib/services-data";
import { type Bundle, getLocalizedBundles } from "lib/bundles-data";
import { detectLocale } from "lib/i18n/locale.server";
import { type Locale, createT } from "lib/i18n/locale";
import { DICT } from "lib/i18n/dict";

// SEO metadata for the homepage. Kept in EUR-English — search engines
// crawl from various IPs and the SERP description should be stable.
// The visible page content below is locale + currency-aware (BG copy
// for Bulgarian visitors, EUR for EU, USD for everyone else).
export const metadata = {
  title:
    "Nacho Tsvetkov – Money Generator for Small Businesses",
  description:
    "Professional website + smart automation that turns small businesses into 24/7 money generators. No more missed leads, no more manual work. Starting at €59.",
  openGraph: { type: "website" },
};

// Centralized links so the page is easy to repoint later.
const CALENDLY_URL = "https://calendly.com/nacho-tsvetkov/30min";
const EMAIL = "nacho.tsvetkov@gmail.com";
const PHONE_E164 = "+359882700002";
const PHONE_DISPLAY = "+359 882 700 002";

// Featured demo project URL — used by the centerpiece case study card
// in PROVEN RESULTS so the visitor can click through to the live build.
const DEMO_URL = "/projects/ai-shopify-store";

// Locale-aware renderers for the bundle cards. Both the "pricing
// note" (one-time vs one-time + retainer) and the "ROI" line carry
// translated chrome strings around the formatted EUR/USD amount, so
// we resolve the right phrasing from DICT before composing.
function renderBundlePricingNote(
  b: Bundle,
  currency: Currency,
  locale: Locale,
): string {
  if (!b.retainerEur) return DICT.home.bundlesOneTime[locale];
  return `${DICT.home.bundlesOneTimePlus[locale]}${formatPrice(b.retainerEur, currency)}${DICT.home.bundlesPerMonthRetainer[locale]}`;
}

function renderBundleRoi(
  b: Bundle,
  currency: Currency,
  locale: Locale,
): string {
  return `${b.roiHook}. ${DICT.home.bundlesRoiSuffix[locale]} ~${formatPrice(b.roiSavingsEur, currency)}+`;
}

// Per-bundle "what's included" lines, kept compact for the listing card.
// The detail page (`/bundles/[slug]`) renders the full structured tree
// where each line links to its underlying service; here we use a
// flattened, marketing-tuned copy so the card stays scannable.
function buildBundleCardIncludes(
  locale: Locale,
): Record<Bundle["id"], ReadonlyArray<string>> {
  if (locale === "bg") {
    return {
      startup: [
        "Custom уебсайт — до 5 страници (mobile-first, оптимизиран за SEO)",
        "AI чатбот, обучен на твоя бизнес",
        "Интеграция за онлайн резервации",
        "Форма за контакт + събиране на имейли",
        "Настройка на Google Analytics + Search Console",
        "Хоствано и пуснато на живо за теб",
      ],
      scaleup: [
        "Всичко от Startup пакета",
        "Пълен редизайн — без лимит на страници",
        "Готов за e-commerce / плащания",
        "AI чатбот с квалификация на контакти",
        "Маркетинг автоматизация (имейл + SMS поредици)",
        "Custom лек CRM",
        "Месечно: поддръжка + промени в съдържанието + 2ч поддръжка",
      ],
      enterprise: [
        "Всичко от Scale-Up пакета",
        "Custom AI агент (автономен виртуален служител)",
        "AI гласов агент за продажби и поддръжка",
        "Персонализация с AI",
        "Сложни API интеграции (CRM, ERP, доставчици)",
        "Приоритетна поддръжка + месечен стратегически разговор",
      ],
    };
  }
  return {
    startup: [
      "Custom website — up to 5 pages (mobile-first, SEO-optimized)",
      "AI chatbot trained on your business",
      "Online booking integration",
      "Contact form + email capture",
      "Google Analytics + Search Console setup",
      "Hosted & deployed for you",
    ],
    scaleup: [
      "Everything in Startup Bundle",
      "Full redesign — no page limit",
      "E-commerce / payments ready",
      "AI chatbot with lead qualification",
      "Marketing automation (email + SMS sequences)",
      "Custom lightweight CRM",
      "Monthly: maintenance + content updates + 2h support",
    ],
    enterprise: [
      "Everything in Scale-Up Bundle",
      "Custom AI agent (autonomous virtual employee)",
      "AI voice agent for leads & support",
      "AI-powered personalization",
      "Advanced API integrations (CRM, ERP, vendors)",
      "Priority support + monthly strategy call",
    ],
  };
}

// Three featured case studies — drilldowns into selected projects with
// numeric outcomes. The Curated. shop sits in the MIDDLE so it reads
// as the centerpiece; the `featured` flag flips it to a blue-bordered,
// gradient-haloed treatment in the rendering loop.
function buildCaseStudies(locale: Locale) {
  return [
    {
      title: DICT.caseStudies.fitnessTitle[locale],
      summary: DICT.caseStudies.fitnessSummary[locale],
      metric: DICT.caseStudies.fitnessMetric[locale],
      tech: "Next.js · Stripe · Calendar API · GPT-4o",
      href: "/projects/local-fitness-studio",
      cta: DICT.caseStudies.fitnessCta[locale],
      badge: DICT.caseStudies.badgeLive[locale],
      real: true,
      featured: false,
    },
    {
      title: DICT.caseStudies.shopTitle[locale],
      summary: DICT.caseStudies.shopSummary[locale],
      metric: DICT.caseStudies.shopMetric[locale],
      tech: "Next.js · Shopify · OpenAI · Vercel AI SDK",
      href: DEMO_URL,
      cta: DICT.caseStudies.shopCta[locale],
      badge: DICT.caseStudies.badgeLive[locale],
      real: true,
      featured: true,
    },
    {
      title: DICT.caseStudies.boutiqueTitle[locale],
      summary: DICT.caseStudies.boutiqueSummary[locale],
      metric: DICT.caseStudies.boutiqueMetric[locale],
      tech: "Shopify · AI Personalization · Klaviyo",
      href: "/projects/boutique-fashion-brand",
      cta: DICT.caseStudies.boutiqueCta[locale],
      badge: DICT.caseStudies.badgeLive[locale],
      real: true,
      featured: false,
    },
  ];
}

function buildTestimonials(currency: Currency, locale: Locale) {
  return [
    {
      quote: DICT.testimonials.t1Quote[locale],
      name: DICT.testimonials.t1Name[locale],
      role: DICT.testimonials.t1Role[locale],
    },
    {
      quote: DICT.testimonials.t2Quote[locale],
      name: DICT.testimonials.t2Name[locale],
      role: DICT.testimonials.t2Role[locale],
    },
    {
      quote: `${DICT.testimonials.t3QuotePrefix[locale]}${formatPriceK(4000, currency)}${DICT.testimonials.t3QuoteSuffix[locale]}`,
      name: DICT.testimonials.t3Name[locale],
      role: DICT.testimonials.t3Role[locale],
    },
  ];
}

function buildSteps(locale: Locale) {
  return [
    { n: "01", title: DICT.steps.s1Title[locale], body: DICT.steps.s1Body[locale] },
    { n: "02", title: DICT.steps.s2Title[locale], body: DICT.steps.s2Body[locale] },
    { n: "03", title: DICT.steps.s3Title[locale], body: DICT.steps.s3Body[locale] },
    { n: "04", title: DICT.steps.s4Title[locale], body: DICT.steps.s4Body[locale] },
  ];
}

function buildFaqs(currency: Currency, locale: Locale) {
  const retainer = formatPrice(97, currency);
  const a5 = `${retainer}${DICT.faq.a5Body[locale]}`;
  return [
    { q: DICT.faq.q1[locale], a: DICT.faq.a1[locale] },
    { q: DICT.faq.q2[locale], a: DICT.faq.a2[locale] },
    { q: DICT.faq.q3[locale], a: DICT.faq.a3[locale] },
    { q: DICT.faq.q4[locale], a: DICT.faq.a4[locale] },
    { q: DICT.faq.q5[locale], a: a5 },
    { q: DICT.faq.q6[locale], a: DICT.faq.a6[locale] },
  ];
}

export default async function HomePage() {
  // Resolve display currency + locale from request headers (Vercel/CF
  // geo + cookie). EU visitors see EUR; everyone else sees USD. BG
  // visitors see Bulgarian copy; the rest see English. The hero is a
  // solid surface so we no longer detect the active theme here — both
  // themes share the same background-glow markup.
  const [currency, locale] = await Promise.all([
    detectCurrency(),
    detectLocale(),
  ]);
  const t = createT(locale);
  const hookServices = getLocalizedHookServices(locale);
  const steps = buildSteps(locale);
  const renderedFaqs = buildFaqs(currency, locale);
  const bundles = getLocalizedBundles(locale);
  const bundleCardIncludes = buildBundleCardIncludes(locale);
  const caseStudies = buildCaseStudies(locale);
  const renderedTestimonials = buildTestimonials(currency, locale);

  return (
    <>
      <SalesAssistant currency={currency} locale={locale} />

      {/* HERO --------------------------------------------------------- */}
      {/* Solid surface + two soft brand glows. The previous iteration
          shipped a 600KB photo composite under a heavy scrim; the
          scrim was knocking the artwork back so much that the visual
          cost wasn't paying off (and it caused a flash-of-wrong-image
          on hydration when the theme cookie changed). The headline
          now lands on flat colour, with a top-right blue glow + a
          bottom-left violet glow giving the surface gradient depth
          without competing with the type. Both glows pick up the
          --color-blue-* / --color-violet-* tokens, so they follow the
          theme automatically. */}
      <section
        aria-labelledby="hero-heading"
        className="relative isolate overflow-hidden bg-white dark:bg-neutral-950"
      >
        {/* Bottom fade — softens the seam into PROVEN RESULTS below
            on both themes. */}
        <div className="absolute inset-x-0 bottom-0 -z-10 h-1/3 bg-gradient-to-b from-transparent to-white dark:to-neutral-950" />
        {/* Top-right blue glow — primary brand accent, slightly
            stronger now there's no photo to lift it off. */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-500/15 via-transparent to-transparent dark:from-blue-600/25" />
        {/* Bottom-left violet glow — softer secondary tint. */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-violet-500/10 via-transparent to-transparent dark:from-violet-600/15" />

        <div className="relative mx-auto max-w-5xl px-6 py-20 text-center sm:py-28 lg:py-32">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-100 px-4 py-1.5 text-sm text-green-800 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-300">
            <span className="h-2 w-2 animate-pulse rounded-full bg-green-500 dark:bg-green-400" />
            {t(DICT.status.availableForProjects)}
          </div>

          <h1
            id="hero-heading"
            className="mx-auto max-w-5xl text-4xl font-bold leading-[1.05] tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl dark:text-white"
          >
            <span className="sm:whitespace-nowrap">
              {t(DICT.home.heroLine1)}
            </span>{" "}
            {/* Gradient span needs its OWN looser leading + pb so
                descenders (y in "Money", g in "Generators") aren't
                clipped by the bg-clip-text bounding box. The parent
                h1's leading-[1.05] is too tight for clipped text. */}
            <span className="block bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text pb-1 leading-[1.15] text-transparent dark:from-blue-400 dark:to-violet-400">
              {t(DICT.home.heroLine2)}
            </span>
          </h1>

          <div className="mx-auto mt-7 max-w-2xl space-y-1 text-pretty text-base leading-relaxed text-neutral-700 sm:text-lg dark:text-neutral-300">
            <p>{t(DICT.home.heroBullet1)}</p>
            <p>{t(DICT.home.heroBullet2)}</p>
            <p>{t(DICT.home.heroBullet3)}</p>
          </div>

          <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-neutral-700 sm:text-lg dark:text-neutral-300">
            {t(DICT.home.heroSubBefore)}{" "}
            <Link
              href="/services/website"
              className="font-semibold text-neutral-900 underline decoration-blue-500/50 decoration-2 underline-offset-4 transition-colors hover:text-blue-700 hover:decoration-blue-600 dark:text-white dark:decoration-blue-400/40 dark:hover:text-blue-200 dark:hover:decoration-blue-300"
            >
              {t(DICT.home.heroSubJustPrefix)}
              {formatPrice(59, currency)}
            </Link>
            {t(DICT.home.heroSubAfter)}
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="#bundles"
              className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-500"
            >
              {t(DICT.cta.seeMoneyBundles)}
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
            </Link>
            <a
              href={CALENDLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-neutral-300 px-7 py-3.5 text-sm font-semibold text-neutral-700 transition-all hover:border-neutral-500 hover:text-neutral-900 dark:border-neutral-600 dark:text-neutral-200 dark:hover:border-neutral-400 dark:hover:text-white"
            >
              {t(DICT.cta.book15MinTalk)}
            </a>
          </div>

          <div className="mx-auto mt-9 max-w-md rounded-2xl border border-neutral-200 bg-white/70 p-5 text-left backdrop-blur-sm dark:border-neutral-700/50 dark:bg-neutral-900/40">
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-600 dark:text-neutral-400">
              {t(DICT.home.heroPreviewKicker)}
            </p>
            <ul className="mt-3 space-y-2 text-sm text-neutral-800 dark:text-neutral-200">
              {[
                t(DICT.home.heroPreviewItem1),
                t(DICT.home.heroPreviewItem2),
                t(DICT.home.heroPreviewItem3),
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                    className="mt-0.5 h-4 w-4 shrink-0 text-blue-400"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-8 text-xs text-neutral-600 sm:text-sm dark:text-neutral-400">
            {t(DICT.home.heroFooter)}
          </p>
        </div>
      </section>

      {/* PROVEN RESULTS ----------------------------------------------- */}
      {/* Sits directly under the hero so the visitor's first scroll
          earns numeric proof BEFORE we ask for money. Three case
          studies with hard metrics ("+47% bookings", "€4k saved",
          etc.) — the Curated. shop is the centerpiece (featured = a
          blue-haloed treatment that draws the eye to the live demo).
          Pairs with the Testimonials block lower down: numbers here,
          quoted humans there, so social proof brackets the pricing
          on both sides. */}
      <section
        aria-labelledby="results-heading"
        className="border-t border-neutral-200 bg-white py-20 dark:border-neutral-800 dark:bg-neutral-900"
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">
              {t(DICT.home.resultsKicker)}
            </p>
            <h2
              id="results-heading"
              className="mt-3 text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl"
            >
              {t(DICT.home.resultsHeadline)}
            </h2>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {caseStudies.map((c) => (
              <article
                key={c.title}
                className={`relative flex flex-col rounded-2xl p-6 ${
                  c.featured
                    ? "border-2 border-blue-500 bg-gradient-to-b from-blue-50 to-white shadow-2xl shadow-blue-600/15 ring-1 ring-blue-500/20 dark:border-blue-400 dark:from-blue-950/50 dark:to-neutral-950 dark:shadow-blue-500/20 dark:ring-blue-400/30"
                    : "border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950"
                }`}
              >
                {c.featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white shadow-md shadow-blue-600/30">
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                    {c.badge}
                  </span>
                )}
                {!c.featured && (
                  <span
                    className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      c.real
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        c.real ? "bg-green-500" : "bg-neutral-400"
                      }`}
                    />
                    {c.badge}
                  </span>
                )}
                <h3
                  className={`text-lg font-bold text-neutral-900 dark:text-white ${
                    c.featured ? "mt-3" : "mt-4"
                  }`}
                >
                  {c.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                  {c.summary}
                </p>
                <p className="mt-4 text-sm font-bold text-blue-600 dark:text-blue-400">
                  {c.metric}
                </p>
                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-500">
                  {c.tech}
                </p>
                {c.href && (
                  <Link
                    href={c.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${c.cta} (opens in a new tab)`}
                    className={`mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold transition-colors ${
                      c.featured
                        ? "text-blue-700 hover:text-blue-600 dark:text-blue-300 dark:hover:text-blue-200"
                        : "text-blue-600 hover:text-blue-500 dark:text-blue-400"
                    }`}
                  >
                    {c.cta}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-3.5 w-3.5"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.25 5.5a.75.75 0 0 0-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 0 0 .75-.75v-4a.75.75 0 0 1 1.5 0v4A2.25 2.25 0 0 1 12.75 17h-8.5A2.25 2.25 0 0 1 2 14.75v-8.5A2.25 2.25 0 0 1 4.25 4h5a.75.75 0 0 1 0 1.5h-5Z"
                        clipRule="evenodd"
                      />
                      <path
                        fillRule="evenodd"
                        d="M6.194 12.753a.75.75 0 0 0 1.06.053L16.5 4.44v2.81a.75.75 0 0 0 1.5 0v-4.5a.75.75 0 0 0-.75-.75h-4.5a.75.75 0 0 0 0 1.5h2.553l-9.056 8.194a.75.75 0 0 0-.053 1.06Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </Link>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* BUNDLES ------------------------------------------------------ */}
      {/* Lives directly under the hero so first-time visitors see the
          priced packages before drilling into À la carte / About /
          process. The id="bundles" anchor is referenced from the home
          hero CTA, /bundles/[slug] back link, /services/[serviceId]
          "save with a bundle" hint, and the sales-assistant chat. */}
      <section
        id="bundles"
        aria-labelledby="bundles-heading"
        className="scroll-mt-24 border-t border-neutral-200 bg-neutral-50 py-20 dark:border-neutral-800 dark:bg-neutral-950"
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-700 dark:text-blue-400">
              {t(DICT.home.bundlesKicker)}
            </p>
            <h2
              id="bundles-heading"
              className="mt-3 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl dark:text-white"
            >
              {t(DICT.home.bundlesHeadline)}
            </h2>
            <p className="mt-4 text-base text-neutral-600 dark:text-neutral-400">
              {t(DICT.home.bundlesIntro1)}{" "}
              <span className="font-semibold text-neutral-900 dark:text-white">
                {t(DICT.home.bundlesIntroMid)}
              </span>
              {t(DICT.home.bundlesIntroEnd)}
            </p>
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {bundles.map((b) => {
              const highlighted = !!b.highlight;
              return (
                <div
                  key={b.name}
                  className={`relative flex flex-col gap-6 rounded-2xl p-8 ${
                    highlighted
                      ? "border-2 border-blue-500 bg-gradient-to-b from-blue-50 to-white shadow-2xl shadow-blue-600/20 ring-1 ring-blue-500/40 dark:from-blue-950/60 dark:to-neutral-900 dark:shadow-blue-600/30"
                      : "border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900/60"
                  }`}
                >
                  {highlighted && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                      {t(DICT.home.bundlesMostPopular)}
                    </span>
                  )}

                  <header>
                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                      {b.name}
                    </h3>
                    <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
                      {b.tagline}
                    </p>
                  </header>

                  <div>
                    <span className="text-5xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
                      {formatPrice(b.oneTimeEur, currency)}
                    </span>
                    <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                      {renderBundlePricingNote(b, currency, locale)}
                    </p>
                  </div>

                  <p className="text-sm italic text-neutral-700 dark:text-neutral-300">
                    {b.pain}
                  </p>

                  <ul className="flex-1 space-y-3 text-sm text-neutral-700 dark:text-neutral-300">
                    {b.freebies?.map((item) => (
                      <li key={`free:${item}`} className="flex gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                          className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>
                          <span className="mr-1.5 inline-flex items-center rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300">
                            {t(DICT.home.bundlesFreeBadge)}
                          </span>
                          {item}
                        </span>
                      </li>
                    ))}
                    {bundleCardIncludes[b.id].map((item) => (
                      <li key={item} className="flex gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                          className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  {b.nudge && (
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      {b.nudge}
                    </p>
                  )}

                  <p className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-700 dark:border-neutral-800 dark:bg-neutral-950/60 dark:text-neutral-300">
                    <span className="font-semibold text-neutral-900 dark:text-white">
                      {t(DICT.home.bundlesRoiLabel)}
                    </span>{" "}
                    {renderBundleRoi(b, currency, locale)}
                  </p>

                  <Link
                    href={`/bundles/${b.id}`}
                    prefetch={true}
                    className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all ${
                      highlighted
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500"
                        : "border border-neutral-300 text-neutral-900 hover:border-neutral-500 dark:border-neutral-700 dark:text-white dark:hover:border-neutral-500"
                    }`}
                  >
                    {b.cta.primary}
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
                  </Link>
                </div>
              );
            })}
          </div>

          <p className="mt-10 text-center text-sm text-neutral-600 dark:text-neutral-400">
            {t(DICT.home.bundlesCustomNeed)}{" "}
            <a
              href={CALENDLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-blue-700 transition-colors hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {t(DICT.home.bundlesCustomCta)}
            </a>
          </p>
        </div>
      </section>

      {/* SERVICES TEASER (À LA CARTE) -------------------------------- */}
      <section
        id="services"
        aria-labelledby="services-heading"
        className="scroll-mt-24 border-t border-neutral-200 bg-neutral-50 py-20 dark:border-neutral-800 dark:bg-neutral-950"
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">
              {t(DICT.home.servicesKicker)}
            </p>
            <h2
              id="services-heading"
              className="mt-3 text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl"
            >
              {t(DICT.home.servicesHeadline)}
            </h2>
            <p className="mt-4 text-base text-neutral-600 dark:text-neutral-400">
              {t(DICT.home.servicesIntro)}
            </p>
          </div>

          <ul className="mx-auto mt-12 grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {hookServices.map((s) => {
              const price = renderServicePriceParts(s.price, currency, locale);
              const singleLine =
                s.price.kind === "from"
                  ? `${price.primary} ${price.secondary}`
                  : s.price.kind === "monthly"
                    ? price.secondary
                    : null;
              return (
                <li key={s.id}>
                  <Link
                    href={`/services/${s.id}`}
                    className="group flex h-full flex-col rounded-xl border border-neutral-200 bg-white p-6 transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-600/5 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-blue-500/30"
                  >
                    <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                      {s.name}
                    </h3>
                    <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-300">
                      <span className="font-semibold text-neutral-900 dark:text-white">
                        {t(DICT.home.servicesPainLabel)}
                      </span>{" "}
                      {s.pain}
                    </p>
                    <div className="mt-auto flex items-end justify-between gap-3 pt-4">
                      <div className="text-sm font-semibold leading-tight text-blue-600 dark:text-blue-400">
                        {singleLine ? (
                          <p>{singleLine}</p>
                        ) : (
                          <>
                            <p>{price.primary}</p>
                            <p>{price.secondary}</p>
                          </>
                        )}
                      </div>
                      <span
                        aria-hidden="true"
                        className="inline-flex flex-shrink-0 items-center gap-1 whitespace-nowrap text-xs font-semibold text-neutral-500 transition-all group-hover:translate-x-0.5 group-hover:text-blue-600 dark:text-neutral-500 dark:group-hover:text-blue-400"
                      >
                        {t(DICT.cta.seeDetails)}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="h-3.5 w-3.5"
                        >
                          <path
                            fillRule="evenodd"
                            d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mt-10 text-center">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-6 py-3 text-sm font-semibold text-neutral-900 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-md dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:hover:border-blue-500"
            >
              {t(DICT.home.servicesBrowseAll)}
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
            </Link>
            <p className="mt-3 text-xs text-neutral-500 dark:text-neutral-500">
              {t(DICT.home.servicesGroupedBy)}
            </p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS ------------------------------------------------- */}
      {/* Process clarity goes BEFORE testimonials + about: visitors who
          like the offer above need to know how the engagement flows
          before they trust voices or the founder. The 4-step "discover
          → build → polish → launch" track resolves the "what happens
          after I click" friction so the testimonials below land on a
          visitor who can already picture the project running. */}
      <section
        aria-labelledby="process-heading"
        className="border-t border-neutral-200 bg-neutral-50 py-20 dark:border-neutral-800 dark:bg-neutral-950"
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">
              {t(DICT.home.processKicker)}
            </p>
            <h2
              id="process-heading"
              className="mt-3 text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl"
            >
              {t(DICT.home.processHeadline)}
            </h2>
          </div>

          <ol className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <li
                key={step.n}
                className="rounded-xl border border-neutral-200 bg-white p-6 transition-all hover:border-blue-300 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-blue-500/30"
              >
                <div className="text-xs font-bold tracking-widest text-blue-600 dark:text-blue-400">
                  {step.n}
                </div>
                <h3 className="mt-2 text-base font-bold text-neutral-900 dark:text-white">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CLIENTS — testimonials. Quoted humans land AFTER the process
          block so the visitor reads "yes, here's how it works" then
          "yes, real people are happy with how it worked". Pairs with
          PROVEN RESULTS up top: numbers above the pricing decision,
          voices below it, so social proof brackets the offer on both
          sides. About me follows next so the visitor's last
          impression before the final CTA is the human they'd be
          working with. */}
      <section
        aria-labelledby="testimonials-heading"
        className="border-t border-neutral-200 bg-neutral-50 py-20 dark:border-neutral-800 dark:bg-neutral-950"
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">
              {t(DICT.home.testimonialsKicker)}
            </p>
            <h2
              id="testimonials-heading"
              className="mt-3 text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl"
            >
              {t(DICT.home.testimonialsHeadline)}
            </h2>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {renderedTestimonials.map((tm) => (
              <figure
                key={tm.name}
                className="flex flex-col rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                  className="h-6 w-6 text-blue-600 dark:text-blue-400"
                >
                  <path d="M9.983 3v7.391c0 5.704-3.731 9.57-8.983 10.609l-.995-2.151c2.432-.917 3.995-3.638 3.995-5.849h-4v-10h9.983zm14.017 0v7.391c0 5.704-3.748 9.571-9 10.609l-.996-2.151c2.433-.917 3.996-3.638 3.996-5.849h-3.983v-10h9.983z" />
                </svg>
                <blockquote className="mt-4 text-base leading-relaxed text-neutral-700 dark:text-neutral-200">
                  “{tm.quote}”
                </blockquote>
                <figcaption className="mt-auto pt-6 text-sm">
                  <div className="font-semibold text-neutral-900 dark:text-white">
                    {tm.name}
                  </div>
                  <div className="text-neutral-500 dark:text-neutral-400">
                    {tm.role}
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT -------------------------------------------------------- */}
      {/* Sits AFTER the testimonials so the visitor reads "real people
          are happy" and then "here's the human those people worked
          with". Last credibility hit before FAQ + Final CTA — the
          stats line ("8+ years · 50+ projects · 3-7 day delivery")
          quantifies the bio without forcing them to read it. */}
      <section
        aria-labelledby="about-heading"
        className="border-t border-neutral-200 bg-white py-20 dark:border-neutral-800 dark:bg-neutral-900"
      >
        <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-[auto_1fr] lg:items-center lg:gap-16">
          <div className="flex justify-center lg:justify-start">
            <div className="relative h-60 w-60 shrink-0 overflow-hidden rounded-full border-4 border-blue-500/30 shadow-2xl shadow-blue-500/10 sm:h-72 sm:w-72">
              <Image
                src="/profile.png"
                alt="Nacho Tsvetkov"
                fill
                sizes="(max-width: 640px) 15rem, 18rem"
                className="object-cover object-[center_-50px]"
                priority
              />
            </div>
          </div>

          <div>
            <h2
              id="about-heading"
              className="text-sm font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400"
            >
              {t(DICT.home.aboutKicker)}
            </h2>
            <p className="mt-3 text-2xl font-bold leading-tight tracking-tight text-neutral-900 dark:text-white sm:text-3xl">
              {t(DICT.home.aboutHeadline)}
            </p>
            <p className="mt-5 text-base leading-relaxed text-neutral-600 dark:text-neutral-300">
              {t(DICT.home.aboutP1)}
            </p>
            <p className="mt-4 text-base leading-relaxed text-neutral-600 dark:text-neutral-300">
              <span className="font-semibold text-neutral-900 dark:text-white">
                {t(DICT.home.aboutSpecialtyLabel)}
              </span>{" "}
              {t(DICT.home.aboutSpecialty)}
            </p>

            <dl className="mt-8 grid grid-cols-3 gap-4 border-t border-neutral-200 pt-6 dark:border-neutral-800">
              <div>
                <dt className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                  {t(DICT.home.statExperience)}
                </dt>
                <dd className="mt-1 text-2xl font-bold text-neutral-900 dark:text-white">
                  {t(DICT.home.statExperienceValue)}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                  {t(DICT.home.statProjects)}
                </dt>
                <dd className="mt-1 text-2xl font-bold text-neutral-900 dark:text-white">
                  50+
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                  {t(DICT.home.statAvgDelivery)}
                </dt>
                <dd className="mt-1 text-2xl font-bold text-neutral-900 dark:text-white">
                  {t(DICT.home.statAvgDeliveryValue)}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* FAQ (QUICK ANSWERS) ----------------------------------------- */}
      <section
        aria-labelledby="faq-heading"
        className="border-t border-neutral-200 bg-neutral-50 py-20 dark:border-neutral-800 dark:bg-neutral-950"
      >
        <div className="mx-auto max-w-3xl px-6">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">
              {t(DICT.home.faqKicker)}
            </p>
            <h2
              id="faq-heading"
              className="mt-3 text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl"
            >
              {t(DICT.home.faqHeadline)}
            </h2>
          </div>

          <dl className="mt-12 space-y-4">
            {renderedFaqs.map((f) => (
              <details
                key={f.q}
                className="group rounded-xl border border-neutral-200 bg-white p-5 transition-all open:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-neutral-900 dark:text-white">
                  <dt>{f.q}</dt>
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
                  {f.a}
                </dd>
              </details>
            ))}
          </dl>
        </div>
      </section>

      {/* FINAL CTA ---------------------------------------------------- */}
      {/* The blue→violet gradient is brand chrome and stays vivid on
          BOTH themes — it's a deliberate "look up here" moment, not a
          surface that should fade into the page background. We only
          flip the top border so the seam to the section above reads
          right in light mode. */}
      <section
        id="contact"
        aria-labelledby="cta-heading"
        className="scroll-mt-24 border-t border-neutral-200 bg-gradient-to-br from-blue-700 via-blue-600 to-violet-700 py-20 text-white dark:border-neutral-800"
      >
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2
            id="cta-heading"
            className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
          >
            {t(DICT.home.finalHeadline)}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-blue-100 sm:text-lg">
            {t(DICT.home.finalSub)}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href={CALENDLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-blue-700 shadow-lg transition-all hover:scale-[1.02] hover:bg-blue-50"
            >
              {t(DICT.cta.bookDiscoveryCall)}
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
            <a
              href={`mailto:${EMAIL}`}
              className="inline-flex items-center gap-2 rounded-full border border-white/40 px-7 py-3.5 text-sm font-semibold text-white transition-all hover:bg-white/10"
            >
              {t(DICT.cta.emailMe)}
            </a>
          </div>
          <p className="mt-6 text-xs text-blue-100">
            {t(DICT.home.finalNote)}
          </p>
        </div>
      </section>

      {/* FOOTER ------------------------------------------------------- */}
      <footer className="border-t border-neutral-200 bg-neutral-50 py-10 dark:border-neutral-800 dark:bg-neutral-950">
        <div className="mx-auto max-w-7xl px-6 text-center text-sm text-neutral-600 dark:text-neutral-400">
          <div className="mb-5 flex items-center justify-center gap-4">
            <a
              href={`mailto:${EMAIL}`}
              className="rounded-lg border border-neutral-300 p-2.5 text-neutral-600 transition-colors hover:border-neutral-500 hover:text-neutral-900 dark:border-neutral-800 dark:text-neutral-400 dark:hover:border-neutral-600 dark:hover:text-white"
              aria-label={`Email Nacho at ${EMAIL}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
                className="h-4 w-4"
              >
                <path d="M3 4a2 2 0 0 0-2 2v1.161l8.441 4.221a1.25 1.25 0 0 0 1.118 0L19 7.162V6a2 2 0 0 0-2-2H3Z" />
                <path d="m19 8.839-7.77 3.885a2.75 2.75 0 0 1-2.46 0L1 8.839V14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.839Z" />
              </svg>
            </a>
            <a
              href={`tel:${PHONE_E164}`}
              className="rounded-lg border border-neutral-300 p-2.5 text-neutral-600 transition-colors hover:border-neutral-500 hover:text-neutral-900 dark:border-neutral-800 dark:text-neutral-400 dark:hover:border-neutral-600 dark:hover:text-white"
              aria-label={`Call Nacho at ${PHONE_DISPLAY}`}
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
                  d="M2 3.5A1.5 1.5 0 0 1 3.5 2h1.148a1.5 1.5 0 0 1 1.465 1.175l.716 3.223a1.5 1.5 0 0 1-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 0 0 6.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 0 1 1.767-1.052l3.223.716A1.5 1.5 0 0 1 18 15.352V16.5a1.5 1.5 0 0 1-1.5 1.5H15c-1.149 0-2.263-.15-3.326-.43A13.022 13.022 0 0 1 2.43 8.326 13.019 13.019 0 0 1 2 5V3.5Z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
            <a
              href="https://linkedin.com/in/nachotsvetkov"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-neutral-300 p-2.5 text-neutral-600 transition-colors hover:border-neutral-500 hover:text-neutral-900 dark:border-neutral-800 dark:text-neutral-400 dark:hover:border-neutral-600 dark:hover:text-white"
              aria-label="LinkedIn"
            >
              <svg
                className="h-4 w-4"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
          </div>
          <p>
            &copy; {new Date().getFullYear()} Nacho Tsvetkov.{" "}
            {t(DICT.home.footerRights)}
          </p>
          <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-600">
            <a
              href={`mailto:${EMAIL}`}
              className="transition-colors hover:text-neutral-800 dark:hover:text-neutral-300"
            >
              {EMAIL}
            </a>{" "}
            ·{" "}
            <a
              href={`tel:${PHONE_E164}`}
              className="transition-colors hover:text-neutral-800 dark:hover:text-neutral-300"
            >
              {PHONE_DISPLAY}
            </a>{" "}
            · {t(DICT.home.footerLocation)}
          </p>
        </div>
      </footer>
    </>
  );
}
