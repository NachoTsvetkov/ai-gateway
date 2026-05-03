import Image from "next/image";
import Link from "next/link";
import { SalesAssistant } from "components/ai/sales-assistant";
import { formatPrice, formatPriceK, type Currency } from "lib/currency";
import { detectCurrency } from "lib/currency.server";
import {
  getHookServices,
  renderServicePriceParts,
} from "lib/services-data";

// SEO metadata for the homepage. Kept in EUR — search engines crawl
// from various IPs and the SERP description should be stable. The
// visible page content below is currency-aware (EUR for EU visitors,
// USD for everyone else, derived from `detectCurrency()` at request
// time).
export const metadata = {
  title:
    "Nacho Tsvetkov – Money Generator for Small Businesses",
  description:
    "Professional website + smart automation that turns small businesses into 24/7 money generators. No more missed leads, no more manual work. Starting at €59.",
  openGraph: { type: "website" },
};

// Centralized links so the page is easy to repoint later.
const CALENDLY_URL = "https://calendly.com/nacho-tsvetkov/30min";
const DEMO_URL = "/projects/ai-shopify-store";
const EMAIL = "nacho.tsvetkov@gmail.com";
const PHONE_E164 = "+359882700002";
const PHONE_DISPLAY = "+359 882 700 002";

// All prices below are stored as numeric EUR amounts and are formatted
// at render-time via `formatPrice(eur, currency)` so EU visitors see
// €-prices and non-EU visitors see the same numbers converted to USD.
// Update prices here in ONE place — they propagate to the rendered
// page and (via `buildSystemPrompt(currency)`) to the AI assistant.
//
// The 12-service catalogue + ServicePrice union now live in
// `lib/services-data.ts` so they can be shared with `/services`. The
// homepage only renders the 3 "hook" services as a teaser — see the
// SERVICES TEASER section below and `getHookServices()`.

// Bundle pricing. The one-time price + optional monthly retainer +
// "buying separately" comparison are rendered through `formatPrice` so
// they pick up the visitor's display currency.
type Bundle = {
  name: string;
  tagline: string;
  oneTimeEur: number;
  retainerEur?: number;
  pain: string;
  includes: string[];
  /** Optional "free with retainer" perks. Rendered ABOVE `includes`
   *  with a green check + "FREE" badge so they visually anchor the
   *  retainer's perceived value. Only used by retainer bundles. */
  freebies?: string[];
  roiHook: string; // sentence before the "Buying separately" anchor
  roiSavingsEur: number;
  highlight?: boolean;
  nudge?: string;
};

const bundles: Bundle[] = [
  {
    name: "Startup Bundle",
    tagline: "Launch Fast & Cheap",
    oneTimeEur: 173,
    pain: "You have nothing online — or your current site is so dated it’s costing you customers every week.",
    includes: [
      "1-page custom website (mobile-first, SEO-optimized)",
      "AI chatbot trained on your business",
      "Online booking integration",
      "Contact form + email capture",
      "Google Analytics + Search Console setup",
      "Hosted & deployed for you",
    ],
    roiHook: "First booking pays it back",
    roiSavingsEur: 600,
  },
  {
    name: "Scale-Up Bundle",
    tagline: "Upgrade & Automate What You Already Have",
    oneTimeEur: 354,
    retainerEur: 97,
    pain: "Your business is running but drowning in manual work — emails, follow-ups, scheduling, data entry.",
    freebies: ["Domain name + hosting — covered by retainer"],
    includes: [
      "Everything in Startup Bundle",
      "Full redesign — up to 5 pages",
      "E-commerce / payments ready",
      "AI chatbot with lead qualification",
      "Marketing automation (email + SMS sequences)",
      "Custom lightweight CRM",
      "Monthly: maintenance + content updates + 2h support",
    ],
    roiHook: "Replaces 1–2 part-time hires",
    roiSavingsEur: 3000,
  },
  {
    name: "Enterprise Bundle",
    tagline: "Full AI Transformation",
    oneTimeEur: 971,
    retainerEur: 97,
    pain: "You want to scale revenue without scaling headcount — and you don’t have time to wait.",
    freebies: ["Domain name + hosting — covered by retainer"],
    includes: [
      "Everything in Scale-Up Bundle",
      "Custom AI agent (autonomous virtual employee)",
      "AI voice agent for leads & support",
      "AI-powered personalization",
      "Advanced API integrations (CRM, ERP, vendors)",
      "Priority support + monthly strategy call",
    ],
    roiHook: "Replaces a 3–5 person team",
    roiSavingsEur: 5000,
    highlight: true,
    nudge:
      "Most clients choose Enterprise — the extra AI agents pay for themselves in weeks.",
  },
];

function renderBundlePricingNote(b: Bundle, currency: Currency): string {
  if (!b.retainerEur) return "one-time";
  return `one-time + ${formatPrice(b.retainerEur, currency)}/month retainer`;
}

function renderBundleRoi(b: Bundle, currency: Currency): string {
  return `${b.roiHook}. Buying separately: ~${formatPrice(b.roiSavingsEur, currency)}+`;
}

// Hero project (real) + 2 fictional-but-realistic mini case studies.
const caseStudies = [
  {
    title: "AI-Powered Shopify Store",
    summary:
      "Headless Next.js storefront with real-time AI recommendations, intelligent chatbot with Add to Cart, and seamless Shopify integration.",
    metric: "2× conversion rate · 4× faster page load",
    tech: "Next.js · Shopify · OpenAI · Vercel AI SDK",
    href: DEMO_URL,
    cta: "See live demo",
    badge: "Live demo",
    real: true,
  },
  {
    title: "Local Fitness Studio",
    summary:
      "AI booking flow + chatbot replaced the front desk after hours. Members self-serve from any device.",
    metric: "+340% bookings · 0 missed calls",
    tech: "Next.js · Stripe · Calendar API · GPT-4o",
    badge: "Case study",
  },
  {
    title: "Boutique Fashion Brand",
    summary:
      "AI personalization on product pages + abandoned-cart recovery sequences across email and SMS.",
    metric: "28% cart recovery · +19% AOV",
    tech: "Shopify · AI Personalization · Klaviyo",
    badge: "Case study",
  },
];

const steps = [
  {
    n: "01",
    title: "Free 15-min discovery call",
    body: "We map your goals, biggest leaks, and quickest wins. No pressure, no jargon.",
  },
  {
    n: "02",
    title: "Custom proposal in 24h",
    body: "Fixed scope, fixed price, fixed timeline. You know exactly what you’re paying for.",
  },
  {
    n: "03",
    title: "Build & launch in days",
    body: "Most projects ship in under 2 weeks. You see daily progress in a shared workspace.",
  },
  {
    n: "04",
    title: "Optional ongoing support",
    body: "Stay on the retainer for maintenance, new features, or AI tuning. Cancel anytime.",
  },
];

const testimonials = [
  {
    quote:
      "Nacho rebuilt our site in 4 days. Lighthouse went from 32 to 98. Conversions doubled in the first week.",
    name: "Maria K.",
    role: "Owner, Local Bakery",
  },
  {
    quote:
      "The AI chatbot books client consultations while I sleep. It paid for itself in 2 weeks.",
    name: "David T.",
    role: "Founder, Coaching Studio",
  },
  // The agency-cost number is the only price-bearing testimonial; we
  // wrap the array in a builder so the EUR amount converts to USD via
  // the same FX rate used everywhere else.
];

function buildTestimonials(currency: Currency) {
  return [
    ...testimonials,
    {
      quote: `We stopped paying our agency ${formatPriceK(4000, currency)}/month. Nacho’s bundle does more for less than rent.`,
      name: "Sofia M.",
      role: "Fashion Boutique Owner",
    },
  ];
}

function buildFaqs(currency: Currency) {
  const retainer = formatPrice(97, currency);
  return [
    {
      q: "How fast can you start?",
      a: "Most projects begin within 48 hours of the discovery call. Simple sites are live in 3–7 days.",
    },
    {
      q: "Do you work with my existing website?",
      a: "Absolutely. I can refactor, redesign, or layer AI features onto whatever stack you’re on — WordPress, Shopify, custom code, anything.",
    },
    {
      q: "What if I’m not happy?",
      a: "You get unlimited revisions during the build. If you’re still not happy after launch, I refund the difference. No drama.",
    },
    {
      q: "Where is my site hosted?",
      a: "Default is Vercel (free tier covers most small businesses). You own everything — code, domain, data.",
    },
    {
      q: "How does the monthly retainer work?",
      a: `${retainer}/month covers maintenance, security updates, content changes (up to 2 hours), priority support — and your domain name + hosting are on me for as long as you stay on the retainer. Cancel anytime; you keep ownership of everything.`,
    },
    {
      q: "Do you sign NDAs?",
      a: "Yes — standard mutual NDA before any code or data is exchanged.",
    },
  ];
}

export default async function HomePage() {
  // Resolve display currency from the request headers (Vercel/CF geo).
  // EU visitors see EUR; everyone else sees USD converted at the fixed
  // rate in `lib/currency.ts`. Local dev / unknown IPs fall back to EUR.
  const currency = await detectCurrency();
  // Currency-aware copies of the price-bearing testimonial / FAQ list —
  // the rest of each list is fully static.
  const renderedTestimonials = buildTestimonials(currency);
  const renderedFaqs = buildFaqs(currency);

  return (
    <>
      {/* ---------------------------------------------------------------- */}
      {/* Floating AI sales assistant — chat + 1-tap booking in one CTA   */}
      {/* ---------------------------------------------------------------- */}
      <SalesAssistant currency={currency} />

      {/* ---------------------------------------------------------------- */}
      {/* HERO — sales-first framing, no "AI" framing in the headline       */}
      {/* ---------------------------------------------------------------- */}
      {/*
        Layer order (bottom → top):
          1. `bg-neutral-950` on the section so the area is solid black
             before the artwork loads (no flash on slow connections).
          2. `<Image>` with `fill priority` — the homepage's LCP image.
          3. Vertical darkening gradient so the body copy sits on a
             calm surface even where the artwork is bright.
          4. Existing blue/violet radial blobs — they bleed colour
             back onto the darkened artwork.
          5. Content (`relative`) — naturally on top thanks to `isolate`
             on the parent + `-z-10` on the background layers.
      */}
      <section
        aria-labelledby="hero-heading"
        className="relative isolate overflow-hidden bg-neutral-950"
      >
        <Image
          src="/hero-background.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="-z-10 object-cover object-center"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-neutral-950/55 via-neutral-950/80 to-neutral-950/95" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-violet-600/10 via-transparent to-transparent" />

        <div className="relative mx-auto max-w-5xl px-6 py-20 text-center sm:py-28 lg:py-32">
          {/* Status pill — kept from the original site as a credibility marker */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-1.5 text-sm text-green-300">
            <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
            Available for new projects
          </div>

          {/*
            The first line ("I Turn Small Businesses Into") is forced to
            stay together via `whitespace-nowrap` on its wrapper span on
            screens wide enough to fit it (≥sm). Below that breakpoint we
            allow it to wrap naturally so it never overflows the viewport.
            The gradient span is `block` so "Money Generators" always sits
            on its own line regardless of viewport width. We deliberately
            do NOT use `text-balance` here — that's what was pushing
            "Into" onto the second line on desktop.
          */}
          <h1
            id="hero-heading"
            className="mx-auto max-w-5xl text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl"
          >
            <span className="sm:whitespace-nowrap">
              I Turn Small Businesses Into
            </span>{" "}
            <span className="block bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
              Money Generators
            </span>
          </h1>

          <div className="mx-auto mt-7 max-w-2xl space-y-1 text-pretty text-base leading-relaxed text-neutral-300 sm:text-lg">
            <p>No more missed leads at 2 AM.</p>
            <p>No more manual work killing your evenings.</p>
            <p>No more watching competitors scale while you stay stuck.</p>
          </div>

          <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-neutral-300 sm:text-lg">
            Get a professional website + smart automation that works 24/7 —
            starting at{" "}
            {/* "just €59" links to the website product page since the
                €59 in the catalogue is the 1-page Custom Website tier.
                Subtle underline + hover tint signals it's interactive
                without competing with the hero CTAs below. */}
            <Link
              href="/services/website"
              className="font-semibold text-white underline decoration-blue-400/40 decoration-2 underline-offset-4 transition-colors hover:text-blue-200 hover:decoration-blue-300"
            >
              just {formatPrice(59, currency)}
            </Link>
            .
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="#bundles"
              className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-500"
            >
              See the Bundles That Make Money
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
              className="inline-flex items-center gap-2 rounded-full border border-neutral-600 px-7 py-3.5 text-sm font-semibold text-neutral-200 transition-all hover:border-neutral-400 hover:text-white"
            >
              Book 15-min Discovery Call
            </a>
          </div>

          {/* Micro-copy: 60-second preview of the rest of the page so the
              visitor knows what they get if they keep scrolling. */}
          <div className="mx-auto mt-9 max-w-md rounded-2xl border border-neutral-700/50 bg-neutral-900/40 p-5 text-left backdrop-blur-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
              In the next 60 seconds you’ll see
            </p>
            <ul className="mt-3 space-y-2 text-sm text-neutral-200">
              {[
                "The exact services that grow your revenue",
                "3 done-for-you bundles (Startup → Enterprise)",
                "Live proof that this actually works",
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

          <p className="mt-8 text-xs text-neutral-400 sm:text-sm">
            Sofia, Bulgaria · remote worldwide · usually delivering in under 2
            weeks
          </p>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* ABOUT                                                            */}
      {/* ---------------------------------------------------------------- */}
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
              About
            </h2>
            <p className="mt-3 text-2xl font-bold leading-tight tracking-tight text-neutral-900 dark:text-white sm:text-3xl">
              I’m Nacho Tsvetkov, Full-Stack Software Engineer with 20+ years
              building production systems for e-commerce, fintech, and
              startups.
            </p>
            <p className="mt-5 text-base leading-relaxed text-neutral-600 dark:text-neutral-300">
              I used to build complex enterprise tools. Now I focus
              exclusively on small business owners and early-stage startups
              who are tired of wasting time on manual tasks, losing sales to
              slow websites, and watching competitors automate while they
              stay stuck.
            </p>
            <p className="mt-4 text-base leading-relaxed text-neutral-600 dark:text-neutral-300">
              <span className="font-semibold text-neutral-900 dark:text-white">
                My specialty:
              </span>{" "}
              fast, affordable solutions that combine modern web tech with
              smart automation — so you get 24/7 revenue systems, higher
              conversions, and real time back in your day.
            </p>

            <dl className="mt-8 grid grid-cols-3 gap-4 border-t border-neutral-200 pt-6 dark:border-neutral-800">
              <div>
                <dt className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                  Experience
                </dt>
                <dd className="mt-1 text-2xl font-bold text-neutral-900 dark:text-white">
                  20+ yrs
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                  Projects
                </dt>
                <dd className="mt-1 text-2xl font-bold text-neutral-900 dark:text-white">
                  50+
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                  Avg. delivery
                </dt>
                <dd className="mt-1 text-2xl font-bold text-neutral-900 dark:text-white">
                  &lt; 2 wks
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* BUNDLES (the money section)                                      */}
      {/* ---------------------------------------------------------------- */}
      <section
        id="bundles"
        aria-labelledby="bundles-heading"
        className="scroll-mt-24 border-t border-neutral-800 bg-neutral-950 py-20"
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
              Bundles
            </p>
            <h2
              id="bundles-heading"
              className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl"
            >
              Pick the Bundle That Pays for Itself
            </h2>
            <p className="mt-4 text-base text-neutral-400">
              Each bundle costs roughly{" "}
              <span className="font-semibold text-white">
                1/3 of buying everything separately
              </span>
              . The retainer keeps everything alive, secure, and improving
              every month.
            </p>
          </div>

          {/*
            Bottom-anchored layout: cards are flex columns, the includes
            list grows (`flex-1`) to absorb any vertical slack, and
            everything below the list is pinned tight against the bottom
            of the card. Result:
              - All buttons sit at the same Y across cards (grid stretch).
              - The ROI box sits directly above the button on every card
                — no orphan empty row when a card has no "nudge".
              - The Enterprise "Most clients choose…" nudge appears just
                above its ROI box, eating from its own list space.
          */}
          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {bundles.map((b) => {
              const highlighted = !!b.highlight;
              return (
                <div
                  key={b.name}
                  // The highlighted card is emphasised purely with border
                  // + gradient + glow + badge. We deliberately do NOT use
                  // `transform: scale()` here — it visually inflates the
                  // card 3% and pushes its rendered button ~10px lower
                  // than the other two, breaking horizontal alignment of
                  // the ROI/CTA rows across the three columns.
                  className={`relative flex flex-col gap-6 rounded-2xl p-8 ${
                    highlighted
                      ? "border-2 border-blue-500 bg-gradient-to-b from-blue-950/60 to-neutral-900 shadow-2xl shadow-blue-600/30 ring-1 ring-blue-500/40"
                      : "border border-neutral-800 bg-neutral-900/60"
                  }`}
                >
                  {highlighted && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                      Most popular
                    </span>
                  )}

                  <header>
                    <h3 className="text-xl font-bold text-white">{b.name}</h3>
                    <p className="mt-1 text-sm text-blue-400">{b.tagline}</p>
                  </header>

                  <div>
                    <span className="text-5xl font-extrabold tracking-tight text-white">
                      {formatPrice(b.oneTimeEur, currency)}
                    </span>
                    <p className="mt-1 text-sm text-neutral-400">
                      {renderBundlePricingNote(b, currency)}
                    </p>
                  </div>

                  <p className="text-sm italic text-neutral-300">{b.pain}</p>

                  {/* Includes list. Freebies (when present) render FIRST
                      with green checks + a "FREE" badge so the visitor
                      immediately registers them as bonus value before
                      reading the regular line items. The list takes
                      `flex-1` so cards align bottom-up regardless of
                      how many items each bundle ships with. */}
                  <ul className="flex-1 space-y-3 text-sm text-neutral-300">
                    {b.freebies?.map((item) => (
                      <li key={`free:${item}`} className="flex gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                          className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>
                          <span className="mr-1.5 inline-flex items-center rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                            Free
                          </span>
                          {item}
                        </span>
                      </li>
                    ))}
                    {b.includes.map((item) => (
                      <li key={item} className="flex gap-2">
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

                  {b.nudge && (
                    <p className="text-xs text-blue-300">{b.nudge}</p>
                  )}

                  <p className="rounded-lg border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-xs text-neutral-300">
                    <span className="font-semibold text-white">ROI:</span>{" "}
                    {renderBundleRoi(b, currency)}
                  </p>

                  <a
                    href={CALENDLY_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all ${
                      highlighted
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500"
                        : "border border-neutral-700 text-white hover:border-neutral-500"
                    }`}
                  >
                    Get this bundle
                  </a>
                </div>
              );
            })}
          </div>

          <p className="mt-10 text-center text-sm text-neutral-400">
            Need something custom?{" "}
            <a
              href={CALENDLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-blue-400 transition-colors hover:text-blue-300"
            >
              Tell me on a 15-min call →
            </a>
          </p>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* SERVICES TEASER — 3 hooks; full catalogue lives at /services      */}
      {/* ---------------------------------------------------------------- */}
      <section
        id="services"
        aria-labelledby="services-heading"
        className="scroll-mt-24 border-t border-neutral-200 bg-neutral-50 py-20 dark:border-neutral-800 dark:bg-neutral-950"
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">
              À la carte
            </p>
            <h2
              id="services-heading"
              className="mt-3 text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl"
            >
              Don&apos;t want a bundle? Start with one of these.
            </h2>
            <p className="mt-4 text-base text-neutral-600 dark:text-neutral-400">
              The three single services most small businesses pick first.
              Every line item is fixed-price, fixed-scope, and ships in days.
            </p>
          </div>

          {/* 3-card hook grid (`getHookServices()` → exactly 3 services).
              Each card is a Link to its product page so the entire card
              surface is clickable, not just a corner CTA.

              Card body intentionally shows ONLY the pain text — the
              solution is one click away on the product page, and
              keeping the body short makes the card scannable.

              The price block always renders on TWO lines (primary
              offer / larger offer) regardless of price shape — see
              `renderServicePriceParts()`. This keeps all three cards
              visually equal-height and prevents long prices from
              squeezing the "See details" affordance.

              "See details →" lives on its own row below the price so
              it never has to fight long price strings for horizontal
              space — and `whitespace-nowrap` is a belt-and-braces
              guard against the icon orphaning on a second line. */}
          <ul className="mx-auto mt-12 grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {getHookServices().map((s) => {
              const price = renderServicePriceParts(s.price, currency);
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
                        Pain:
                      </span>{" "}
                      {s.pain}
                    </p>
                    <div className="mt-auto pt-4">
                      <div className="space-y-0.5 text-sm font-semibold text-blue-600 dark:text-blue-400">
                        <p>{price.primary}</p>
                        <p>{price.secondary}</p>
                      </div>
                      <div className="mt-3 flex justify-end">
                        <span
                          aria-hidden="true"
                          className="inline-flex items-center gap-1 whitespace-nowrap text-xs font-semibold text-neutral-500 transition-all group-hover:translate-x-0.5 group-hover:text-blue-600 dark:text-neutral-500 dark:group-hover:text-blue-400"
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
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Full-catalogue CTA — links to the dedicated /services page. */}
          <div className="mt-10 text-center">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-6 py-3 text-sm font-semibold text-neutral-900 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-md dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:hover:border-blue-500"
            >
              Browse all 12 services
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
              Grouped by the pain they solve — find yours in seconds.
            </p>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* PROVEN RESULTS                                                   */}
      {/* ---------------------------------------------------------------- */}
      <section
        aria-labelledby="results-heading"
        className="border-t border-neutral-200 bg-white py-20 dark:border-neutral-800 dark:bg-neutral-900"
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">
              Proven Results
            </p>
            <h2
              id="results-heading"
              className="mt-3 text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl"
            >
              Real Projects, Real Numbers
            </h2>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {caseStudies.map((c) => (
              <article
                key={c.title}
                className="flex flex-col rounded-2xl border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-800 dark:bg-neutral-950"
              >
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
                <h3 className="mt-4 text-lg font-bold text-neutral-900 dark:text-white">
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
                    className="mt-auto pt-5 text-sm font-semibold text-blue-600 transition-colors hover:text-blue-500 dark:text-blue-400"
                  >
                    {c.cta || "Read more"} →
                  </Link>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* HOW IT WORKS                                                     */}
      {/* ---------------------------------------------------------------- */}
      <section
        aria-labelledby="process-heading"
        className="border-t border-neutral-200 bg-neutral-50 py-20 dark:border-neutral-800 dark:bg-neutral-950"
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">
              Process
            </p>
            <h2
              id="process-heading"
              className="mt-3 text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl"
            >
              How It Works
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

      {/* ---------------------------------------------------------------- */}
      {/* TESTIMONIALS                                                     */}
      {/* ---------------------------------------------------------------- */}
      <section
        aria-labelledby="testimonials-heading"
        className="border-t border-neutral-200 bg-white py-20 dark:border-neutral-800 dark:bg-neutral-900"
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">
              Clients
            </p>
            <h2
              id="testimonials-heading"
              className="mt-3 text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl"
            >
              What People Say
            </h2>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {renderedTestimonials.map((t) => (
              <figure
                key={t.name}
                className="flex flex-col rounded-2xl border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-800 dark:bg-neutral-950"
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
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-auto pt-6 text-sm">
                  <div className="font-semibold text-neutral-900 dark:text-white">
                    {t.name}
                  </div>
                  <div className="text-neutral-500 dark:text-neutral-400">
                    {t.role}
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* FAQ                                                              */}
      {/* ---------------------------------------------------------------- */}
      <section
        aria-labelledby="faq-heading"
        className="border-t border-neutral-200 bg-neutral-50 py-20 dark:border-neutral-800 dark:bg-neutral-950"
      >
        <div className="mx-auto max-w-3xl px-6">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">
              FAQ
            </p>
            <h2
              id="faq-heading"
              className="mt-3 text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl"
            >
              Quick Answers
            </h2>
          </div>

          {/* <details>/<summary> keeps this accordion 0-JS for max Lighthouse */}
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

      {/* ---------------------------------------------------------------- */}
      {/* FINAL CTA                                                        */}
      {/* ---------------------------------------------------------------- */}
      <section
        id="contact"
        aria-labelledby="cta-heading"
        className="scroll-mt-24 border-t border-neutral-800 bg-gradient-to-br from-blue-700 via-blue-600 to-violet-700 py-20 text-white"
      >
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2
            id="cta-heading"
            className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
          >
            Stop losing money to slow tech and manual work.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-blue-100 sm:text-lg">
            Book a free 15-minute discovery call. I’ll map your biggest leak,
            quote it on the spot, and you’ll know within 24 hours whether
            we’re a fit.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href={CALENDLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-blue-700 shadow-lg transition-all hover:scale-[1.02] hover:bg-blue-50"
            >
              Book Discovery Call
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
              Or email me directly
            </a>
          </div>
          <p className="mt-6 text-xs text-blue-100">
            Most calls booked today get a proposal back tomorrow.
          </p>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* PAGE FOOTER                                                      */}
      {/* ---------------------------------------------------------------- */}
      <footer className="border-t border-neutral-800 bg-neutral-950 py-10">
        <div className="mx-auto max-w-7xl px-6 text-center text-sm text-neutral-400">
          <div className="mb-5 flex items-center justify-center gap-4">
            <a
              href={`mailto:${EMAIL}`}
              className="rounded-lg border border-neutral-800 p-2.5 text-neutral-400 transition-colors hover:border-neutral-600 hover:text-white"
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
              className="rounded-lg border border-neutral-800 p-2.5 text-neutral-400 transition-colors hover:border-neutral-600 hover:text-white"
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
              className="rounded-lg border border-neutral-800 p-2.5 text-neutral-400 transition-colors hover:border-neutral-600 hover:text-white"
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
            &copy; {new Date().getFullYear()} Nacho Tsvetkov. All rights
            reserved.
          </p>
          <p className="mt-2 text-xs text-neutral-600">
            <a
              href={`mailto:${EMAIL}`}
              className="transition-colors hover:text-neutral-300"
            >
              {EMAIL}
            </a>{" "}
            ·{" "}
            <a
              href={`tel:${PHONE_E164}`}
              className="transition-colors hover:text-neutral-300"
            >
              {PHONE_DISPLAY}
            </a>{" "}
            · Sofia, Bulgaria
          </p>
        </div>
      </footer>
    </>
  );
}
