import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "lib/currency";
import { detectCurrency } from "lib/currency.server";
import {
  PAIN_CATEGORIES,
  getGettingStartedServices,
  getServicesByCategory,
  renderServicePrice,
  type PainCategory,
  type Service,
} from "lib/services-data";

const CALENDLY_URL = "https://calendly.com/nacho-tsvetkov/30min";

export const metadata = {
  title: "Services — Built Around Your Biggest Business Pains",
  description:
    "Browse the full catalogue of websites, smart automation, and revenue systems — grouped by the pain they solve. Fixed-price, fixed-scope, ships in days.",
  openGraph: { type: "website" },
};

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

// Getting Started section metadata — kept inline because it's a
// one-off section and doesn't need to live in the shared data module.
const GETTING_STARTED_META = {
  id: "getting-started",
  hook: "I'm just getting online for the first time",
  title: "Getting Started",
  description:
    "Brand new business or first-time online? This is the natural launch sequence — pick the pieces that fit your business model and skip the rest.",
  accent: "cyan" as const,
};

export default async function ServicesPage() {
  const currency = await detectCurrency();

  return (
    <main className="bg-white dark:bg-neutral-900">
      {/* ---------------------------------------------------------------- */}
      {/* HEADER                                                           */}
      {/* ---------------------------------------------------------------- */}
      <section
        aria-labelledby="services-heading"
        className="relative overflow-hidden bg-neutral-950 py-20 sm:py-24"
      >
        {/* Cityscape + floating UI cards background. The image already
            ships dark, but a vertical darkening gradient is layered on
            top to keep the white headline + neutral-300 body copy
            legible regardless of where the image's bright spots fall.
            A faint blue radial preserves the existing brand glow. */}
        <Image
          src="/services-hero-background.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="-z-10 object-cover object-center"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-neutral-950/65 via-neutral-950/75 to-neutral-950/90" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-600/15 via-transparent to-transparent" />

        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
            Full services catalogue
          </p>
          <h1
            id="services-heading"
            className="mt-3 text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl"
          >
            Built around the problems that actually keep
            <br className="hidden sm:block" />{" "}
            <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
              small-business owners up at night
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-neutral-300 sm:text-lg">
            Pick by the pain you feel today. Every service is fixed-price,
            fixed-scope, and ships in days — not months. Save more by grabbing
            the matching{" "}
            <Link
              href="/#bundles"
              className="font-semibold text-blue-300 underline decoration-blue-300/40 underline-offset-2 transition-colors hover:text-blue-200"
            >
              bundle
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
              Book a free 15-min call
            </a>
            <Link
              href="/#bundles"
              className="inline-flex items-center gap-2 rounded-full border border-neutral-600 px-7 py-3 text-sm font-semibold text-neutral-200 transition-all hover:border-neutral-400 hover:text-white"
            >
              See the bundles
            </Link>
          </div>

          {/* Quick-jump nav: Getting Started first, then the four pain
              categories. Smooth-scroll to the matching section below. */}
          <nav
            aria-label="Sections"
            className="mt-10 flex flex-wrap items-center justify-center gap-2"
          >
            <a
              href={`#${GETTING_STARTED_META.id}`}
              className="inline-flex items-center gap-2 rounded-full border border-neutral-700/70 bg-neutral-900/40 px-4 py-1.5 text-xs font-medium text-neutral-300 backdrop-blur-sm transition-all hover:border-neutral-500 hover:text-white"
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${ACCENT_DOT[GETTING_STARTED_META.accent]}`}
              />
              {GETTING_STARTED_META.title}
            </a>
            {PAIN_CATEGORIES.map((c) => (
              <a
                key={c.id}
                href={`#${c.id}`}
                className="inline-flex items-center gap-2 rounded-full border border-neutral-700/70 bg-neutral-900/40 px-4 py-1.5 text-xs font-medium text-neutral-300 backdrop-blur-sm transition-all hover:border-neutral-500 hover:text-white"
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
             reinforce the launch order. Services intentionally overlap
             with the pain categories below (Website + E-commerce +
             Maintenance also live in "Build a professional online
             presence", Booking also lives in "Stop wasting time"); the
             numbering and section header reframe them as launch steps
             rather than pain solutions. */}
        <section
          id={GETTING_STARTED_META.id}
          aria-labelledby={`${GETTING_STARTED_META.id}-heading`}
          className="scroll-mt-24 pb-14"
        >
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_2fr]">
            <header
              className={`rounded-2xl p-6 ${ACCENT_BG_SOFT[GETTING_STARTED_META.accent]}`}
            >
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${ACCENT_DOT[GETTING_STARTED_META.accent]}`}
                />
                {GETTING_STARTED_META.hook}
              </p>
              <h2
                id={`${GETTING_STARTED_META.id}-heading`}
                className={`mt-3 text-2xl font-bold tracking-tight sm:text-3xl ${ACCENT_TEXT[GETTING_STARTED_META.accent]}`}
              >
                {GETTING_STARTED_META.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                {GETTING_STARTED_META.description}
              </p>
            </header>

            <ul className="grid gap-5 sm:grid-cols-2">
              {getGettingStartedServices().map((service, index) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  priceText={renderServicePrice(service.price, currency)}
                  borderHover={ACCENT_BORDER[GETTING_STARTED_META.accent]}
                  priceText_color={ACCENT_TEXT[GETTING_STARTED_META.accent]}
                  stepLabel={String(index + 1).padStart(2, "0")}
                  stepAccent={ACCENT_TEXT[GETTING_STARTED_META.accent]}
                />
              ))}
            </ul>
          </div>
        </section>

        {PAIN_CATEGORIES.map((category) => {
          const items = getServicesByCategory(category.id);
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
                      priceText={renderServicePrice(service.price, currency)}
                      borderHover={ACCENT_BORDER[category.accent]}
                      priceText_color={ACCENT_TEXT[category.accent]}
                      // Per-section numbering: every card in every
                      // section gets a "01/02/03..." badge that resets
                      // at the start of each pain category. Same
                      // treatment as Getting Started above — the badge
                      // colour follows the section accent, so the card
                      // still visually belongs to its section.
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
            Not sure which service fits?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-neutral-600 dark:text-neutral-400">
            Save{" "}
            <span className="font-semibold text-neutral-900 dark:text-white">
              {formatPrice(800, currency)}+
            </span>{" "}
            by grabbing a bundle, or jump on a free 15-minute call and I&apos;ll
            tell you in plain English which option pays for itself fastest.
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/#bundles"
              className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-500"
            >
              See the bundles
            </Link>
            <a
              href={CALENDLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-neutral-300 px-7 py-3 text-sm font-semibold text-neutral-700 transition-all hover:border-neutral-500 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-500 dark:hover:text-white"
            >
              Book 15-min discovery call
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

function ServiceCard({
  service,
  priceText,
  borderHover,
  priceText_color,
  stepLabel,
  stepAccent,
}: {
  service: Service;
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
              Pain:
            </span>{" "}
            {service.pain}
          </p>
          <p>
            <span className="font-semibold text-neutral-900 dark:text-white">
              Solution:
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
            See details
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
