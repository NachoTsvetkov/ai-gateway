import Image from "next/image";
import Link from "next/link";
import { formatPrice, formatPriceK, type Currency } from "lib/currency";
import { detectCurrency } from "lib/currency.server";
import { detectLocale } from "lib/i18n/locale.server";
import { createT, type Locale } from "lib/i18n/locale";
import { DICT } from "lib/i18n/dict";
import {
  getLocalizedGettingStartedServices,
  getLocalizedPainCategories,
  getLocalizedServicesByCategory,
  renderServicePrice,
  type PainCategory,
  type Service,
} from "lib/services-data";
import { type Bundle, getLocalizedBundles } from "lib/bundles-data";
import { detectTheme } from "lib/theme/theme.server";

const DEMO_URL = "/projects/ai-shopify-store";

const CALENDLY_URL = "https://calendly.com/nacho-tsvetkov/30min";

// Locale-aware so the <title> + <meta description> match the body copy
// for a BG visitor who set the toggle. Static metadata exports leak
// English into BG renders (visible in social-share previews + browser
// tab title). Same pattern as /bundles/[slug] + /services/[serviceId]
// which already use generateMetadata.
export async function generateMetadata() {
  const locale = await detectLocale();
  return locale === "bg"
    ? {
        title: "Услуги — създадени около най-болезнените ти проблеми",
        description:
          "Разгледай пълния каталог от сайтове, smart automation и системи за приход — групирани по проблема, който решават. Фиксирана цена, фиксиран обхват, готово за дни.",
        openGraph: { type: "website" as const },
      }
    : {
        title: "Services — Built Around Your Biggest Business Pains",
        description:
          "Browse the full catalogue of websites, smart automation, and revenue systems — grouped by the pain they solve. Fixed-price, fixed-scope, ships in days.",
        openGraph: { type: "website" as const },
      };
}

// Accent palette is keyed by `PainCategory["accent"]` PLUS a special
// `cyan` variant used by the "Getting Started" launch sequence. Adding
// the union here (rather than to PainCategory itself) keeps the data
// model honest — Getting Started isn't a pain category, it's a
// separate framing that just happens to reuse the card layout.
type Accent = PainCategory["accent"] | "cyan";

// Tailwind sometimes fails to pick up classes assembled from variables
// at build time. We explicitly list every accent variant we use here so
// JIT keeps them in the final bundle.
const ACCENT_DOT: Record<Accent, string> = {
  blue: "bg-blue-500",
  violet: "bg-violet-500",
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  cyan: "bg-cyan-500",
};
const ACCENT_BORDER: Record<Accent, string> = {
  blue: "hover:border-blue-300 dark:hover:border-blue-500/40",
  violet: "hover:border-violet-300 dark:hover:border-violet-500/40",
  emerald: "hover:border-emerald-300 dark:hover:border-emerald-500/40",
  amber: "hover:border-amber-300 dark:hover:border-amber-500/40",
  cyan: "hover:border-cyan-300 dark:hover:border-cyan-500/40",
};
const ACCENT_TEXT: Record<Accent, string> = {
  blue: "text-blue-600 dark:text-blue-400",
  violet: "text-violet-600 dark:text-violet-400",
  emerald: "text-emerald-600 dark:text-emerald-400",
  amber: "text-amber-600 dark:text-amber-400",
  cyan: "text-cyan-600 dark:text-cyan-400",
};
const ACCENT_BG_SOFT: Record<Accent, string> = {
  blue: "bg-blue-50 dark:bg-blue-500/5",
  violet: "bg-violet-50 dark:bg-violet-500/5",
  emerald: "bg-emerald-50 dark:bg-emerald-500/5",
  amber: "bg-amber-50 dark:bg-amber-500/5",
  cyan: "bg-cyan-50 dark:bg-cyan-500/5",
};

// Getting Started section accent. The hook/title/description text comes
// from DICT so it follows the locale; only the accent + DOM id stay
// fixed here.
const GETTING_STARTED_ID = "getting-started";
const GETTING_STARTED_ACCENT: Accent = "cyan";

// Localized strings used directly inside the hero / section labels that
// don't fit the existing DICT.servicesPage shape. We keep them inline
// (rather than balloon DICT for one-off literals) but only EN+BG forms
// — never raw strings — leak into the JSX.
const HERO = {
  eyebrow: { en: "Full services catalogue", bg: "Пълен каталог услуги" },
  headlineTop: {
    en: "Built around the problems that actually keep",
    bg: "Изградено около проблемите, които наистина не дават мира на",
  },
  headlineHighlight: {
    en: "small-business owners up at night",
    bg: "собствениците на малки бизнеси",
  },
  sub: {
    en: "Pick by the pain you feel today. Every service is fixed-price, fixed-scope, and ships in days — not months. Save more by grabbing the matching",
    bg: "Избери по проблема, който те боли днес. Всяка услуга е с фиксирана цена, фиксиран обхват и се доставя за дни — не месеци. Спести още, като вземеш съответния",
  },
  bundleLink: { en: "bundle", bg: "пакет" },
  ctaSeeBundles: { en: "See the bundles", bg: "Виж пакетите" },
  sectionsAriaLabel: { en: "Sections", bg: "Раздели" },
} as const;

const CLOSING = {
  headline: {
    en: "Not sure which service fits?",
    bg: "Не си сигурен коя услуга ти трябва?",
  },
  introPrefix: { en: "Save", bg: "Спести" },
  introMid: {
    en: "by grabbing a bundle, or jump on a free 15-minute call and I'll tell you in plain English which option pays for itself fastest.",
    bg: "като вземеш пакет, или запази безплатен 15-минутен разговор и ще ти кажа на ясен език кое решение се изплаща най-бързо.",
  },
  ctaSeeBundles: { en: "See the bundles", bg: "Виж пакетите" },
  ctaBookCall: {
    en: "Book 15-min discovery call",
    bg: "Запази 15-минутен разговор",
  },
} as const;

// Service-card chrome strings. The card renders inside both the
// Getting Started section and every pain category, so we localize the
// shared labels once.
const CARD = {
  painLabel: { en: "Pain:", bg: "Проблем:" },
  solutionLabel: { en: "Solution:", bg: "Решение:" },
  seeDetails: { en: "See details", bg: "Виж детайли" },
} as const;

// ---------------------------------------------------------------------
// Bundle / case-study / testimonial renderers.
//
// Originally lived on /projects but were relocated here so the services
// catalogue gets its full proof + cross-sell narrative on a single
// page (catalogue → results → clients → bundles → CTA). The /projects
// page is now a focused gallery of demo sites.
// ---------------------------------------------------------------------

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

export default async function ServicesPage() {
  // Both detections fire in parallel — the page is a server component
  // so we want the slowest of (currency cookie/header lookup,
  // locale cookie/header lookup) and not their sum.
  const [currency, locale, theme] = await Promise.all([
    detectCurrency(),
    detectLocale(),
    detectTheme(),
  ]);
  const t = createT(locale);

  // Localized data accessors merge the EN base with BG overrides where
  // available, falling back to EN on a per-field basis. Cheaper than
  // duplicating the entire dataset.
  const painCategories = getLocalizedPainCategories(locale);
  const gettingStartedServices = getLocalizedGettingStartedServices(locale);
  const bundles = getLocalizedBundles(locale);
  const caseStudies = buildCaseStudies(locale);
  const renderedTestimonials = buildTestimonials(currency, locale);
  const bundleCardIncludes = buildBundleCardIncludes(locale);

  // Theme drives which hero photo we ship: a bright AI-generated
  // cityscape with the value-prop cards in light mode, the original
  // dark cityscape in dark mode. Selecting on the server prevents
  // loading both photos and avoids the flash-of-wrong-image at hydration.
  const heroBgSrc =
    theme === "light"
      ? "/services-hero-background-light.png"
      : "/services-hero-background.png";

  // The Getting Started block reuses translations from DICT so the
  // copy stays in lockstep with the homepage teaser hooks.
  const gettingStartedHook = t(DICT.servicesPage.gettingStartedKicker);
  const gettingStartedTitle = t(DICT.servicesPage.gettingStartedHeadline);
  const gettingStartedDescription = t(DICT.servicesPage.gettingStartedSub);

  return (
    <main className="bg-white dark:bg-neutral-900">
      {/* ---------------------------------------------------------------- */}
      {/* HEADER                                                           */}
      {/* ---------------------------------------------------------------- */}
      <section
        aria-labelledby="services-heading"
        className="relative isolate overflow-hidden bg-white py-20 sm:py-24 dark:bg-neutral-950"
      >
        {/* Background: cityscape skyline + nebula glow + floating UI
            cards labelled "More Customers / Higher Conversions / Save
            Time / Reliable Security / Built for Growth / Fixed Price"
            — they thematically mirror the page's value props, so we
            want them to actually be visible.

            CRITICAL: the section MUST carry `isolate` so it creates
            its own stacking context. Without it, the `-z-10` layers
            below fall BEHIND the section background and the entire
            hero renders as flat colour. `isolate` makes -z-10 mean
            "below content, above this section's own background" —
            the layering we want.

            We ship two photos and pick on the server (`heroBgSrc`):
              • light mode → /services-hero-background-light.png — a
                bright sunrise cityscape with the value-prop cards
                already baked in. The scrim drops to a soft bottom
                fade so the photo + cards stay visible.
              • dark mode → /services-hero-background.png — the
                original deep-navy variant, kept under a heavier
                scrim so the headline + body still read.

            Stack (bottom → top, all -z-10 except content):
              1. section bg                — neutral colour before paint
              2. <Image>                   — the photo itself
              3. uniform scrim             — heavy in dark, light in light
              4. radial vignette           — darker at the centre horizon
                                             so the headline pops
              5. bottom fade               — sells the seam into the next
                                             section on both themes
              6. blue glow                 — preserves the brand hint
              7. content (`relative`)      — sits above the -z-10 stack    */}
        <Image
          src={heroBgSrc}
          alt=""
          fill
          priority
          sizes="100vw"
          className="-z-10 object-cover object-center"
        />
        {/* Layer 1: uniform scrim — soft in light mode (so the bright
            cityscape + cards stay visible) and heavy in dark mode (so
            the dark photo's nebula reads as a textured backdrop). */}
        <div className="absolute inset-0 -z-10 bg-white/15 dark:bg-neutral-950/70" />
        {/* Layer 2: radial vignette — pulls a touch of light/dark in at
            the headline column so text contrast holds. */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/65 via-white/20 to-transparent dark:from-neutral-950/85 dark:via-neutral-950/55" />
        {/* Layer 3: bottom fade — matches the section that follows so
            the seam reads cleanly on both themes. */}
        <div className="absolute inset-x-0 bottom-0 -z-10 h-1/3 bg-gradient-to-b from-transparent to-white dark:to-neutral-950" />
        {/* Layer 4: subtle blue glow. */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent dark:from-blue-600/15" />

        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-700 dark:text-blue-400">
            {t(HERO.eyebrow)}
          </p>
          <h1
            id="services-heading"
            className="mt-3 text-3xl font-bold leading-tight tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl dark:text-white"
          >
            {t(HERO.headlineTop)}
            <br className="hidden sm:block" />{" "}
            <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-violet-400">
              {t(HERO.headlineHighlight)}
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-neutral-700 sm:text-lg dark:text-neutral-300">
            {t(HERO.sub)}{" "}
            <Link
              href="#bundles"
              className="font-semibold text-blue-700 underline decoration-blue-500/40 underline-offset-2 transition-colors hover:text-blue-800 dark:text-blue-300 dark:decoration-blue-300/40 dark:hover:text-blue-200"
            >
              {t(HERO.bundleLink)}
            </Link>
            .
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href={CALENDLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-500"
            >
              {t(DICT.cta.bookFree15Min)}
            </a>
            <Link
              href="#bundles"
              className="inline-flex items-center gap-2 rounded-full border border-neutral-300 px-7 py-3 text-sm font-semibold text-neutral-700 transition-all hover:border-neutral-500 hover:text-neutral-900 dark:border-neutral-600 dark:text-neutral-200 dark:hover:border-neutral-400 dark:hover:text-white"
            >
              {t(HERO.ctaSeeBundles)}
            </Link>
          </div>

          {/* Quick-jump nav: Getting Started first, then the four pain
              categories. Smooth-scroll to the matching section below. */}
          <nav
            aria-label={t(HERO.sectionsAriaLabel)}
            className="mt-10 flex flex-wrap items-center justify-center gap-2"
          >
            <a
              href={`#${GETTING_STARTED_ID}`}
              className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white/70 px-4 py-1.5 text-xs font-medium text-neutral-700 backdrop-blur-sm transition-all hover:border-neutral-500 hover:text-neutral-900 dark:border-neutral-700/70 dark:bg-neutral-900/40 dark:text-neutral-300 dark:hover:border-neutral-500 dark:hover:text-white"
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${ACCENT_DOT[GETTING_STARTED_ACCENT]}`}
              />
              {gettingStartedTitle}
            </a>
            {painCategories.map((c) => (
              <a
                key={c.id}
                href={`#${c.id}`}
                className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white/70 px-4 py-1.5 text-xs font-medium text-neutral-700 backdrop-blur-sm transition-all hover:border-neutral-500 hover:text-neutral-900 dark:border-neutral-700/70 dark:bg-neutral-900/40 dark:text-neutral-300 dark:hover:border-neutral-500 dark:hover:text-white"
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${ACCENT_DOT[c.accent]}`}
                />
                {c.title}
              </a>
            ))}
          </nav>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* SECTIONS                                                         */}
      {/* ---------------------------------------------------------------- */}
      <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
        {/* — Getting Started — the launch-sequence pack.
             Rendered FIRST because newcomers don't have a specific pain
             yet — they need a clear "start here" path. Same card layout
             as pain categories, with numbered "01/02/03" step badges to
             reinforce the launch order. */}
        <section
          id={GETTING_STARTED_ID}
          aria-labelledby={`${GETTING_STARTED_ID}-heading`}
          className="scroll-mt-24 pb-14"
        >
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_2fr]">
            <header
              className={`rounded-2xl p-6 ${ACCENT_BG_SOFT[GETTING_STARTED_ACCENT]}`}
            >
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${ACCENT_DOT[GETTING_STARTED_ACCENT]}`}
                />
                {gettingStartedHook}
              </p>
              <h2
                id={`${GETTING_STARTED_ID}-heading`}
                className={`mt-3 text-2xl font-bold tracking-tight sm:text-3xl ${ACCENT_TEXT[GETTING_STARTED_ACCENT]}`}
              >
                {gettingStartedTitle}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                {gettingStartedDescription}
              </p>
            </header>

            <ul className="grid gap-5 sm:grid-cols-2">
              {gettingStartedServices.map((service, index) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  locale={locale}
                  priceText={renderServicePrice(service.price, currency, locale)}
                  borderHover={ACCENT_BORDER[GETTING_STARTED_ACCENT]}
                  priceText_color={ACCENT_TEXT[GETTING_STARTED_ACCENT]}
                  stepLabel={String(index + 1).padStart(2, "0")}
                  stepAccent={ACCENT_TEXT[GETTING_STARTED_ACCENT]}
                />
              ))}
            </ul>
          </div>
        </section>

        {painCategories.map((category) => {
          const items = getLocalizedServicesByCategory(category.id, locale);
          if (items.length === 0) return null;

          return (
            <section
              key={category.id}
              id={category.id}
              aria-labelledby={`${category.id}-heading`}
              className="scroll-mt-24 border-t border-neutral-200 py-14 dark:border-neutral-800"
            >
              <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_2fr]">
                <header
                  className={`rounded-2xl p-6 ${ACCENT_BG_SOFT[category.accent]}`}
                >
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${ACCENT_DOT[category.accent]}`}
                    />
                    {category.hook}
                  </p>
                  <h2
                    id={`${category.id}-heading`}
                    className={`mt-3 text-2xl font-bold tracking-tight sm:text-3xl ${ACCENT_TEXT[category.accent]}`}
                  >
                    {category.title}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                    {category.description}
                  </p>
                </header>

                <ul className="grid gap-5 sm:grid-cols-2">
                  {items.map((service, index) => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      locale={locale}
                      priceText={renderServicePrice(
                        service.price,
                        currency,
                        locale,
                      )}
                      borderHover={ACCENT_BORDER[category.accent]}
                      priceText_color={ACCENT_TEXT[category.accent]}
                      // Per-section numbering: every card in every
                      // section gets a "01/02/03..." badge that resets
                      // at the start of each pain category.
                      stepLabel={String(index + 1).padStart(2, "0")}
                      stepAccent={ACCENT_TEXT[category.accent]}
                    />
                  ))}
                </ul>
              </div>
            </section>
          );
        })}
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* PROVEN RESULTS — featured case studies with numeric outcomes.    */}
      {/* Sits AFTER the catalogue so the visitor first sees what they    */}
      {/* can buy, then the proof those services produce real numbers.   */}
      {/* ---------------------------------------------------------------- */}
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

      {/* ---------------------------------------------------------------- */}
      {/* CLIENTS — testimonials. Quoted humans land RIGHT AFTER the      */}
      {/* numeric proof so the visitor reads "metrics + voices" as one   */}
      {/* combined social-proof block before reaching the bundle pricing. */}
      {/* ---------------------------------------------------------------- */}
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

      {/* ---------------------------------------------------------------- */}
      {/* BUNDLES — the cross-sell. Visitors who scrolled this far        */}
      {/* already saw 12 services + proof; bundles offer the same outcome */}
      {/* at a lower per-piece price. The `id="bundles"` anchor is        */}
      {/* referenced from the home hero CTA, /bundles/[slug] back link,  */}
      {/* /services/[serviceId] "save with a bundle" hint, the sales-    */}
      {/* assistant chat replies, and the closing CTA below.             */}
      {/* ---------------------------------------------------------------- */}
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

      {/* ---------------------------------------------------------------- */}
      {/* CLOSING CTA                                                      */}
      {/* ---------------------------------------------------------------- */}
      <section
        aria-labelledby="services-cta-heading"
        className="border-t border-neutral-200 bg-neutral-50 py-16 dark:border-neutral-800 dark:bg-neutral-950"
      >
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2
            id="services-cta-heading"
            className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-3xl"
          >
            {t(CLOSING.headline)}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-neutral-600 dark:text-neutral-400">
            {t(CLOSING.introPrefix)}{" "}
            <span className="font-semibold text-neutral-900 dark:text-white">
              {formatPrice(800, currency)}+
            </span>{" "}
            {t(CLOSING.introMid)}
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="#bundles"
              className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-500"
            >
              {t(CLOSING.ctaSeeBundles)}
            </Link>
            <a
              href={CALENDLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-neutral-300 px-7 py-3 text-sm font-semibold text-neutral-700 transition-all hover:border-neutral-500 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-500 dark:hover:text-white"
            >
              {t(CLOSING.ctaBookCall)}
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

function ServiceCard({
  service,
  locale,
  priceText,
  borderHover,
  priceText_color,
  stepLabel,
  stepAccent,
}: {
  service: Service;
  locale: Locale;
  priceText: string;
  borderHover: string;
  priceText_color: string;
  /** When set (e.g. "01"), shows a numbered step badge in the top-right
   *  corner. All sections on /services pass per-section indices, so the
   *  numbering resets at the start of each section. Optional so the
   *  homepage 3-hook teaser (which reuses the visual but doesn't number)
   *  can omit it. */
  stepLabel?: string;
  /** Tailwind text colour classes for the step badge (matches the
   *  section's accent so the card visually belongs to its section). */
  stepAccent?: string;
}) {
  const t = createT(locale);

  // The card is wrapped in a Link so the entire surface is clickable
  // — better than a tiny "learn more" link in the corner. The
  // pain/solution + price layout stays exactly the same; only the
  // outer chrome turns into a hover-able navigation target.
  return (
    <li>
      <Link
        href={`/services/${service.id}`}
        className={`group relative flex h-full flex-col rounded-xl border border-neutral-200 bg-white p-6 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-600/5 dark:border-neutral-800 dark:bg-neutral-900 ${borderHover}`}
      >
        {stepLabel && (
          <span
            aria-hidden="true"
            className={`absolute right-4 top-4 font-mono text-2xl font-bold tracking-tight opacity-70 ${stepAccent ?? ""}`}
          >
            {stepLabel}
          </span>
        )}
        <h3
          className={`text-base font-bold text-neutral-900 dark:text-white ${
            // Reserve room for the badge so long names don't run under it.
            stepLabel ? "pr-12" : ""
          }`}
        >
          {service.name}
        </h3>
        <div className="mt-3 space-y-2 text-sm text-neutral-600 dark:text-neutral-300">
          <p>
            <span className="font-semibold text-neutral-900 dark:text-white">
              {t(CARD.painLabel)}
            </span>{" "}
            {service.pain}
          </p>
          <p>
            <span className="font-semibold text-neutral-900 dark:text-white">
              {t(CARD.solutionLabel)}
            </span>{" "}
            {service.solution}
          </p>
        </div>
        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <p className={`text-sm font-semibold ${priceText_color}`}>
            {priceText}
          </p>
          <span
            aria-hidden="true"
            className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-500 transition-all group-hover:text-neutral-900 group-hover:translate-x-0.5 dark:text-neutral-500 dark:group-hover:text-white"
          >
            {t(CARD.seeDetails)}
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
}
