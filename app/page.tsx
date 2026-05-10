import Image from "next/image";
import Link from "next/link";
import { SalesAssistant } from "components/ai/sales-assistant";
import { formatPrice, type Currency } from "lib/currency";
import { detectCurrency } from "lib/currency.server";
import {
  getLocalizedHookServices,
  renderServicePriceParts,
} from "lib/services-data";
import { detectLocale } from "lib/i18n/locale.server";
import { type Locale, createT } from "lib/i18n/locale";
import { DICT } from "lib/i18n/dict";
import { detectTheme } from "lib/theme/theme.server";

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
  // visitors see Bulgarian copy; the rest see English. Theme drives
  // which hero photo we ship: a bright AI-generated cityscape +
  // value-prop cards in light mode, the original dark cityscape in
  // dark mode (see hero markup below).
  const [currency, locale, theme] = await Promise.all([
    detectCurrency(),
    detectLocale(),
    detectTheme(),
  ]);
  const t = createT(locale);
  const hookServices = getLocalizedHookServices(locale);
  const steps = buildSteps(locale);
  const renderedFaqs = buildFaqs(currency, locale);
  const heroBgSrc =
    theme === "light" ? "/hero-background-light.png" : "/hero-background.png";

  return (
    <>
      <SalesAssistant currency={currency} locale={locale} />

      {/* HERO --------------------------------------------------------- */}
      {/* Two hero photos, picked server-side from the theme cookie:
            • light mode → /hero-background-light.png — a bright,
              teal-tinted "BUILD → IMPROVE → SCALE → AI" composite
              with the value-prop cards baked in. Scrim is a soft
              bottom-fade only (light/55 → light) so the photo reads
              through and the headline still has enough contrast at
              the centre.
            • dark mode → /hero-background.png — the original dark
              cityscape. Scrim stays heavy (dark/55 → dark/95) so the
              photo plays second fiddle to the white headline.
          Selecting the src on the server avoids loading both photos
          and prevents the flash-of-wrong-image when the page mounts. */}
      <section
        aria-labelledby="hero-heading"
        className="relative isolate overflow-hidden bg-white dark:bg-neutral-950"
      >
        <Image
          src={heroBgSrc}
          alt=""
          fill
          priority
          sizes="100vw"
          className="-z-10 object-cover object-center"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white/0 via-white/30 to-white/85 dark:from-neutral-950/55 dark:via-neutral-950/80 dark:to-neutral-950/95" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent dark:from-blue-600/20" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-violet-500/5 via-transparent to-transparent dark:from-violet-600/10" />

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
            <span className="block bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-violet-400">
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
              href="/services#bundles"
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

      {/* ABOUT -------------------------------------------------------- */}
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
