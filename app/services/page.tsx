import Link from "next/link";
import { formatPrice } from "lib/currency";
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

export default async function ServicesPage() {
  // Both detections fire in parallel — the page is a server component
  // so we want the slowest of (currency cookie/header lookup,
  // locale cookie/header lookup) and not their sum.
  const [currency, locale] = await Promise.all([
    detectCurrency(),
    detectLocale(),
  ]);
  const t = createT(locale);

  // Localized data accessors merge the EN base with BG overrides where
  // available, falling back to EN on a per-field basis. Cheaper than
  // duplicating the entire dataset.
  const painCategories = getLocalizedPainCategories(locale);
  const gettingStartedServices = getLocalizedGettingStartedServices(locale);

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
        className="relative isolate overflow-hidden bg-blue-500 py-20 sm:py-24"
      >
        {/* Brand-blue surface + theme-aware translucent mask. The
            section paints a saturated blue, then a heavy white
            (light) / neutral-950 (dark) scrim knocks it back so the
            headline and quick-jump pills read with easy contrast.
            Glows below sit ON TOP of the mask in DOM order so the
            brand accent stays visible.

            CRITICAL: the section MUST carry `isolate` so it creates
            its own stacking context. Without it, the `-z-10` layers
            fall BEHIND the section background and the mask + glows
            disappear. `isolate` keeps -z-10 meaning "below content,
            above this section's own background". */}
        {/* Mask: per-theme veil. Tweak opacity here, not on the bg,
            when adjusting how blue the section feels. */}
        <div className="absolute inset-0 -z-10 bg-white/85 dark:bg-neutral-950/80" />
        {/* Top-centre blue glow — primary brand accent. */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-500/15 via-transparent to-transparent dark:from-blue-600/25" />
        {/* Bottom-left violet glow — softer secondary tint. */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-violet-500/10 via-transparent to-transparent dark:from-violet-600/15" />
        {/* Bottom fade — sells the seam into the sections below on
            both themes. */}
        <div className="absolute inset-x-0 bottom-0 -z-10 h-1/3 bg-gradient-to-b from-transparent to-white dark:to-neutral-950" />

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
              href="/#bundles"
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
              href="/#bundles"
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
              href="/#bundles"
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
          className={`text-lg font-bold leading-snug text-neutral-900 dark:text-white ${
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
        {/* Footer row: price on the left grows/wraps as needed, "See
            details" on the right is locked to a single line and never
            shrinks. Without `flex-shrink-0 whitespace-nowrap` the long
            tier prices ("Starting at €273 (full payments-ready site)")
            squeeze the BG label "Виж детайли" onto two lines on the
            narrower cards. */}
        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <p className={`min-w-0 flex-1 text-base font-semibold ${priceText_color}`}>
            {priceText}
          </p>
          <span
            aria-hidden="true"
            className="inline-flex flex-shrink-0 items-center gap-1 whitespace-nowrap text-xs font-semibold text-neutral-500 transition-all group-hover:text-neutral-900 group-hover:translate-x-0.5 dark:text-neutral-500 dark:group-hover:text-white"
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
