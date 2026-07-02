import Link from "next/link";
import { ViewContentTracker } from "components/analytics/view-content-tracker";
import { DigitalProductBuy } from "components/checkout/digital-product-buy";
import { DigitalProductLegalNotice } from "components/checkout/legal-notice";
import { StickyMobileBuyBar } from "components/checkout/sticky-mobile-buy-bar";
import { buyableFromDigitalProduct } from "lib/buyable";
import { formatPrice } from "lib/currency";
import { detectCurrency } from "lib/currency.server";
import { getDigitalProduct } from "lib/digital-products-data";
import { LIBRARY_BASE_PATH, LIBRARY_LOGIN_PATH } from "lib/digital-product-access";

export const metadata = {
  title: "Shopify Paid-Traffic Leak Scorecard — Stop Bleeding Meta Ad Spend",
  description:
    "15-minute mobile scorecard for Shopify stores losing sales at checkout. Interactive scoring, fix playbooks, copy blocks, and $300 Meta test plan — $37, instant access.",
  openGraph: {
    type: "website",
    title: "Shopify Paid-Traffic Leak Scorecard",
    description:
      "Find why paid traffic isn't buying — score your mobile checkout in 15 minutes and fix the highest-impact leaks first.",
  },
};

const LEAKS = [
  {
    title: "Mobile checkout friction",
    body: "Extra fields, forced account creation, and tiny tap targets kill mobile buyers who were ready to pay.",
    fix: "Enable Shop Pay / Apple Pay, collapse optional fields, and test checkout thumb-reach on a real phone.",
  },
  {
    title: "Surprise shipping at checkout",
    body: "Traffic looks fine until the last step — then shipping or fees spike and carts abandon.",
    fix: "Show shipping thresholds on the PDP, add a cart drawer estimate, and test free-shipping bars above the fold.",
  },
  {
    title: "Slow mobile product pages",
    body: "Every extra second on 4G costs conversions. Heavy themes and unoptimized hero images are common culprits.",
    fix: "Compress hero images, defer non-critical apps, and aim for sub-3s LCP on your top 5 SKUs.",
  },
  {
    title: "Weak trust on the buy button",
    body: "Paid traffic lands cold. If reviews, returns policy, and payment badges aren't visible near the CTA, hesitation wins.",
    fix: "Add review snippets, delivery ETA, and secure-checkout copy directly under the Add to Cart button.",
  },
  {
    title: "No post-click message match",
    body: "Your ad promises one outcome; the landing page sells something else. Bounce + zero conversion.",
    fix: "Mirror ad headline on the landing hero, repeat the same offer, and remove nav clutter on paid landing pages.",
  },
] as const;

const INCLUDED = [
  "Interactive leak scorecard — tap 0–2 on your phone, auto-saves your score",
  "Tracking or checkout? — 5-minute decision tree before you blame the ads",
  "5 leak playbooks with Shopify-specific fix steps (priority order)",
  "Copy-paste trust, shipping, and ad-match blocks (one-tap copy)",
  "Weekly conversion tracker CSV + $300 Meta smoke test kill rules",
] as const;

const FAQ = [
  {
    q: "Is this for beginners or experienced store owners?",
    a: "Both. If you're already running Meta or Google ads and getting traffic but weak conversion rate, this scorecard is built for you. No agency required.",
  },
  {
    q: "Do I need Shopify Plus?",
    a: "No. Everything applies to standard Shopify and Shopify Basic. Some fixes use built-in settings; others use free theme edits or apps you may already have.",
  },
  {
    q: "How do I access it after purchase?",
    a: "You get a private web library — works on mobile. Score the checklist in your browser, copy blocks with one tap, and bookmark the page. No markdown files to wrestle with.",
  },
  {
    q: "How fast will I see results?",
    a: "Many fixes ship in under an hour. Track baseline metrics before you start — the included tracker shows whether checkout completion improves within 7–14 days.",
  },
  {
    q: "Refunds?",
    a: "If the scorecard doesn't surface at least 3 actionable leaks on your store, email nacho.tsvetkov@gmail.com within 7 days for a full refund. See terms for details.",
  },
] as const;

const AUDIT_PREVIEW = [
  { check: "Shop Pay or Apple Pay available", score: "0–2" },
  { check: "Shipping cost shown before payment", score: "0–2" },
  { check: "Reviews visible near Add to Cart", score: "0–2" },
  { check: "Checkout completes in under 60 seconds", score: "0–2" },
] as const;

function ScorecardPreview() {
  return (
    <div
      className="overflow-hidden rounded-xl border border-neutral-300 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-900"
      aria-label="Preview of the interactive leak scorecard"
    >
      <div className="border-b border-neutral-200 bg-emerald-50 px-4 py-2.5 dark:border-neutral-800 dark:bg-emerald-950/40">
        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
          Leak scorecard — live preview
        </p>
      </div>

      {/* Card stack — easier to read on narrow phones */}
      <ul className="divide-y divide-neutral-100 sm:hidden dark:divide-neutral-800">
        {AUDIT_PREVIEW.map((row) => (
          <li
            key={row.check}
            className="flex items-start justify-between gap-3 px-4 py-3"
          >
            <span className="text-sm text-neutral-700 dark:text-neutral-300">
              {row.check}
            </span>
            <span className="shrink-0 font-mono text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              {row.score}
            </span>
          </li>
        ))}
      </ul>

      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full min-w-[320px] text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950/50">
              <th className="px-4 py-2 font-semibold text-neutral-900 dark:text-white">
                Check
              </th>
              <th className="px-4 py-2 text-right font-semibold text-neutral-900 dark:text-white">
                Score
              </th>
            </tr>
          </thead>
          <tbody>
            {AUDIT_PREVIEW.map((row) => (
              <tr
                key={row.check}
                className="border-b border-neutral-100 last:border-0 dark:border-neutral-800"
              >
                <td className="px-4 py-2.5 text-neutral-700 dark:text-neutral-300">
                  {row.check}
                </td>
                <td className="px-4 py-2.5 text-right font-mono text-xs text-emerald-700 dark:text-emerald-400">
                  {row.score}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="border-t border-neutral-200 bg-emerald-50 px-4 py-2.5 text-xs leading-relaxed text-emerald-900 dark:border-neutral-800 dark:bg-emerald-950/30 dark:text-emerald-200">
        30 checks · tap 0, 1, or 2 · scores save on your phone
      </p>
    </div>
  );
}

export default async function ShopifyConversionKitPage({
  searchParams,
}: {
  searchParams: Promise<{ locked?: string }>;
}) {
  const sp = await searchParams;
  const locked = sp.locked === "1";
  const currency = await detectCurrency();
  const product = getDigitalProduct("shopify-conversion-kit");
  const buyable = buyableFromDigitalProduct(product);
  const price = formatPrice(product.oneTimeEur, currency);
  const showLibraryPreview =
    process.env.NODE_ENV === "development" &&
    process.env.DIGITAL_PRODUCT_LIBRARY_PREVIEW === "1";

  return (
    <div className="bg-white pb-24 sm:pb-0 dark:bg-neutral-950">
      <ViewContentTracker
        contentId={product.id}
        contentName={product.name}
        contentType="digital_product"
        contentCategory="Shopify conversion"
        value={product.oneTimeEur}
        currency={currency}
      />

      <StickyMobileBuyBar buyable={buyable} currency={currency} />

      {locked && (
        <div
          role="status"
          className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100"
        >
          The scorecard library requires purchase. Get instant access below.
        </div>
      )}

      {showLibraryPreview && (
        <div className="border-b border-blue-200 bg-blue-50 px-4 py-2 text-center text-xs text-blue-900 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-200">
          Dev preview:{" "}
          <Link
            href={LIBRARY_LOGIN_PATH}
            className="font-semibold underline underline-offset-2"
          >
            Open library login
          </Link>
        </div>
      )}

      {/* Hero */}
      <section
        aria-labelledby="kit-hero-heading"
        className="relative isolate overflow-hidden border-b border-neutral-200 bg-gradient-to-b from-emerald-50 to-white dark:border-neutral-800 dark:from-emerald-950/30 dark:to-neutral-950"
      >
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-24">
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
            For Shopify stores running paid traffic
          </p>
          <h1
            id="kit-hero-heading"
            className="mt-3 text-3xl font-bold leading-tight tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl dark:text-white"
          >
            Paying for traffic that doesn&apos;t buy?
          </h1>
          <p className="mt-4 font-mono text-2xl font-extrabold text-emerald-700 sm:text-3xl dark:text-emerald-400">
            {price}{" "}
            <span className="text-base font-semibold text-neutral-600 dark:text-neutral-400">
              · one-time · instant access
            </span>
          </p>
          <p className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-neutral-700 sm:text-lg dark:text-neutral-300">
            The{" "}
            <strong className="font-semibold text-neutral-900 dark:text-white">
              Paid-Traffic Leak Scorecard
            </strong>{" "}
            shows where mobile checkout leaks — score 30 checks in 15 minutes on
            your phone, then fix the highest-impact leaks first. Not a 300-point
            PDF.
          </p>
          <ul className="mt-6 space-y-2.5 text-base text-neutral-700 dark:text-neutral-300">
            <li className="flex items-start gap-2">
              <span className="mt-1 text-emerald-600" aria-hidden="true">
                ✓
              </span>
              Interactive 0–2 scorecard — saves on your phone
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 text-emerald-600" aria-hidden="true">
                ✓
              </span>
              Tracking or checkout? decision tree + fix playbooks
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 text-emerald-600" aria-hidden="true">
                ✓
              </span>
              7-day refund if you don&apos;t find 3+ actionable leaks
            </li>
          </ul>
          <div className="mt-8 sm:mt-10">
            <DigitalProductBuy buyable={buyable} currency={currency} />
          </div>
          <p className="mt-5 text-center text-sm text-neutral-600 dark:text-neutral-400">
            Already purchased?{" "}
            <Link
              href={LIBRARY_LOGIN_PATH}
              className="font-semibold text-emerald-700 underline underline-offset-2 hover:text-emerald-600 dark:text-emerald-400"
            >
              Enter your email to open the library
            </Link>
          </p>
        </div>
      </section>

      {/* Problem */}
      <section
        aria-labelledby="problem-heading"
        className="border-b border-neutral-200 py-10 sm:py-14 dark:border-neutral-800"
      >
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2
            id="problem-heading"
            className="text-xl font-bold text-neutral-900 sm:text-2xl dark:text-white"
          >
            Ads get clicks. Checkout doesn&apos;t convert.
          </h2>
          <p className="mt-3 text-base leading-relaxed text-neutral-600 dark:text-neutral-400">
            Most Shopify stores running Meta traffic lose buyers at the same five
            leaks — surprise shipping, mobile checkout friction, weak trust near
            the buy button, slow PDPs, and ad copy that doesn&apos;t match the
            landing page. More ad spend without fixing these just scales the
            leak.
          </p>
        </div>
      </section>

      {/* Proof + preview */}
      <section
        aria-labelledby="proof-heading"
        className="border-b border-neutral-200 bg-neutral-50 py-12 sm:py-16 dark:border-neutral-800 dark:bg-neutral-900/30"
      >
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2
            id="proof-heading"
            className="text-2xl font-bold leading-tight text-neutral-900 sm:text-3xl dark:text-white"
          >
            What you&apos;ll find in the first 15 minutes
          </h2>
          <p className="mt-2 text-base text-neutral-600 dark:text-neutral-400">
            Built by a senior engineer who ships Shopify integrations — not
            generic marketing theory. Most stores running paid traffic score
            under 18/30 on the mobile checkout scorecard.
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-2 md:items-start md:gap-8">
            <div className="space-y-4">
              <div className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-5 dark:border-neutral-800 dark:bg-neutral-900">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Typical findings
                </p>
                <ul className="mt-3 space-y-2 text-sm leading-relaxed text-neutral-700 sm:text-base dark:text-neutral-300">
                  <li>→ No Shop Pay on mobile (checkout friction)</li>
                  <li>→ Shipping surprise at the last step</li>
                  <li>→ Zero trust copy under the buy button</li>
                  <li>→ Ad headline doesn&apos;t match the product page</li>
                </ul>
              </div>
              <div className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-5 dark:border-neutral-800 dark:bg-neutral-900">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Not a checklist PDF
                </p>
                <p className="mt-2 font-mono text-2xl font-extrabold text-neutral-900 dark:text-white">
                  0–2<span className="text-base font-semibold"> scorecard</span>
                </p>
                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                  Interactive library · copy blocks · Meta kill rules
                </p>
              </div>
            </div>
            <ScorecardPreview />
          </div>
        </div>
      </section>

      {/* Leaks */}
      <section
        aria-labelledby="leaks-heading"
        className="border-b border-neutral-200 py-12 sm:py-16 dark:border-neutral-800"
      >
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2
            id="leaks-heading"
            className="text-2xl font-bold leading-tight text-neutral-900 sm:text-3xl dark:text-white"
          >
            The 5 leaks this scorecard helps you fix
          </h2>
          <p className="mt-2 text-base text-neutral-600 dark:text-neutral-400">
            Score each 0–2 in the library. Anything scoring 0–1 gets a fix this
            week.
          </p>
          <ol className="mt-8 space-y-4 sm:space-y-6">
            {LEAKS.map((leak, i) => (
              <li
                key={leak.title}
                className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 sm:p-5 dark:border-neutral-800 dark:bg-neutral-900/50"
              >
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Leak {i + 1}
                </p>
                <h3 className="mt-1 text-lg font-semibold leading-snug text-neutral-900 dark:text-white">
                  {leak.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600 sm:text-base dark:text-neutral-400">
                  {leak.body}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-neutral-800 sm:text-base dark:text-neutral-200">
                  <span className="font-semibold">Fix: </span>
                  {leak.fix}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* What's included */}
      <section
        aria-labelledby="included-heading"
        className="border-b border-neutral-200 bg-neutral-50 py-12 sm:py-16 dark:border-neutral-800 dark:bg-neutral-900/30"
      >
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2
            id="included-heading"
            className="text-2xl font-bold leading-tight text-neutral-900 sm:text-3xl dark:text-white"
          >
            What you get (instant access)
          </h2>
          <ul className="mt-6 space-y-3">
            {INCLUDED.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 text-base leading-relaxed text-neutral-700 dark:text-neutral-300"
              >
                <span
                  className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300"
                  aria-hidden="true"
                >
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-8 sm:mt-10">
            <DigitalProductBuy buyable={buyable} currency={currency} />
          </div>
        </div>
      </section>

      {/* Guarantee */}
      <section
        aria-labelledby="guarantee-heading"
        className="border-b border-emerald-200 bg-emerald-50 py-10 sm:py-12 dark:border-emerald-900/40 dark:bg-emerald-950/25"
      >
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2
            id="guarantee-heading"
            className="text-xl font-bold text-neutral-900 sm:text-2xl dark:text-white"
          >
            7-day leak guarantee
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-neutral-700 dark:text-neutral-300">
            Run the scorecard on your store. If it doesn&apos;t surface at least{" "}
            <strong>3 actionable leaks</strong>, email within 7 days for a full
            refund — no forms, no call required.
          </p>
          <div className="mt-8">
            <DigitalProductBuy buyable={buyable} currency={currency} />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section aria-labelledby="faq-heading" className="py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2
            id="faq-heading"
            className="text-2xl font-bold leading-tight text-neutral-900 sm:text-3xl dark:text-white"
          >
            FAQ
          </h2>
          <dl className="mt-8 space-y-6">
            {FAQ.map((item) => (
              <div key={item.q}>
                <dt className="text-base font-semibold text-neutral-900 dark:text-white">
                  {item.q}
                </dt>
                <dd className="mt-2 text-sm leading-relaxed text-neutral-600 sm:text-base dark:text-neutral-400">
                  {item.a}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <footer className="border-t border-neutral-200 bg-neutral-50 py-8 dark:border-neutral-800 dark:bg-neutral-950">
        <div className="mx-auto max-w-3xl px-4 text-center text-sm sm:px-6">
          <p className="text-neutral-600 dark:text-neutral-400">
            &copy; {new Date().getFullYear()} Nacho Tsvetkov ·{" "}
            <a
              href="mailto:nacho.tsvetkov@gmail.com"
              className="inline-block py-2 hover:underline"
            >
              nacho.tsvetkov@gmail.com
            </a>
          </p>
          <p className="mt-1">
            <Link
              href="/privacy-policy"
              className="inline-block py-2 text-neutral-600 hover:underline dark:text-neutral-400"
            >
              Privacy policy
            </Link>
            <span className="text-neutral-400"> · </span>
            <Link
              href="/conversion-kit-terms"
              className="inline-block py-2 text-neutral-600 hover:underline dark:text-neutral-400"
            >
              Terms &amp; refund
            </Link>
          </p>
          <DigitalProductLegalNotice className="mx-auto mt-2 max-w-md text-center text-xs leading-relaxed" />
          <p className="mt-4 text-neutral-600 dark:text-neutral-400">
            Already purchased?{" "}
            <Link
              href={LIBRARY_LOGIN_PATH}
              className="font-semibold text-emerald-700 underline underline-offset-2 hover:text-emerald-600 dark:text-emerald-400"
            >
              Log in with your checkout email
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
