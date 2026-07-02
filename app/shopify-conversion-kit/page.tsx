import Link from "next/link";
import { ViewContentTracker } from "components/analytics/view-content-tracker";
import { DigitalProductBuy } from "components/checkout/digital-product-buy";
import { DigitalProductLegalNotice } from "components/checkout/legal-notice";
import { StickyMobileBuyBar } from "components/checkout/sticky-mobile-buy-bar";
import { buyableFromDigitalProduct } from "lib/buyable";
import { formatPrice } from "lib/currency";
import { detectCurrency } from "lib/currency.server";
import { isDigitalProductLibraryPreviewEnabled } from "lib/digital-product-dev.server";
import { getDigitalProduct } from "lib/digital-products-data";
import { LIBRARY_BASE_PATH, LIBRARY_LOGIN_PATH } from "lib/digital-product-access";

export const metadata = {
  title: "Shop Fix Scorecard — Find Why Your Ads Don't Turn Into Sales",
  description:
    "27-point survey for Shopify stores. Find where sales leak in 15 minutes. Fix the big problems first. $37, instant access.",
  openGraph: {
    type: "website",
    title: "Shop Fix Scorecard",
    description:
      "People click your ads but don't buy? This 27-point survey finds where sales leak — in about 15 minutes.",
  },
};

const LEAKS = [
  {
    title: "Checkout is hard on phones",
    body: "Too many boxes to fill. Hard to tap buttons. People give up.",
    fix: "Turn on Shop Pay or Apple Pay. Hide extra fields. Try checkout on your own phone.",
  },
  {
    title: "Shipping cost is a surprise",
    body: "They like the product. Then shipping looks too high at the end. They leave.",
    fix: "Show shipping early. Tell them how much for free shipping. Put it on the product page.",
  },
  {
    title: "Your pages load slow on phones",
    body: "Slow pages make people leave before they even read.",
    fix: "Make pictures smaller. Remove apps you don't need. Test your top products on a phone.",
  },
  {
    title: "They don't trust the Buy button",
    body: "New shoppers want proof before they buy. If reviews and safe checkout signs are missing by the Buy button, they leave.",
    fix: "Add star reviews, return policy, and safe checkout text right under the Buy button.",
  },
  {
    title: "Your ad and your page don't match",
    body: "The ad says one thing. The page says another. People bounce.",
    fix: "Use the same headline on the ad and the page. Keep the same offer.",
  },
] as const;

const LEAK_SCORECARD_SUMMARY =
  "The Leak Scorecard is a 27-point survey. It finds where sales leak on your store. Takes about 15 minutes.";

const INCLUDED = [
  "Leak Scorecard — 27-point survey to find where sales leak (~15 min)",
  "Simple guide: is it your ads or your checkout?",
  "5 fix guides — what to do first, step by step",
  "Ready-to-copy text for trust, shipping, and ads",
  "Weekly tracker sheet + small $300 ad test plan",
] as const;

const FAQ = [
  {
    q: "Is this for new store owners?",
    a: "Yes. If you run Facebook or Google ads and get clicks but few sales, this is for you. You don't need an agency.",
  },
  {
    q: "Do I need Shopify Plus?",
    a: "No. Works on regular Shopify. Many fixes use settings you already have.",
  },
  {
    q: "How do I get it after I pay?",
    a: "You get a private web page. Log in with your checkout email. Open the Leak Scorecard and answer 27 simple questions about your store.",
  },
  {
    q: "How fast will I see more sales?",
    a: "Some fixes take under an hour. Use the tracker. Give it 1–2 weeks to see checkout get better.",
  },
  {
    q: "Can I get a refund?",
    a: "Yes. Run the checklist. If you don't find at least 3 things to fix, email nacho.tsvetkov@gmail.com within 7 days. Full refund.",
  },
] as const;

const AUDIT_PREVIEW = [
  "Shop Pay or Apple Pay works",
  "Shipping cost shown early",
  "Reviews near the Buy button",
  "Checkout takes under 1 minute",
] as const;

function ScorecardPreview() {
  return (
    <div
      className="overflow-hidden rounded-xl border border-neutral-300 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-900"
      aria-label="Preview of the Leak Scorecard survey"
    >
      <div className="border-b border-neutral-200 bg-emerald-50 px-4 py-2.5 dark:border-neutral-800 dark:bg-emerald-950/40">
        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
          Leak Scorecard
        </p>
      </div>

      <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
        {AUDIT_PREVIEW.map((check) => (
          <li key={check} className="px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300">
            {check}
          </li>
        ))}
      </ul>

      <p className="border-t border-neutral-200 bg-emerald-50 px-4 py-2.5 text-xs leading-relaxed text-emerald-900 dark:border-neutral-800 dark:bg-emerald-950/30 dark:text-emerald-200">
        27-point survey · find where sales leak · about 15 minutes
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
  const showLibraryPreview = isDigitalProductLibraryPreviewEnabled();

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
          The scorecard library requires purchase. Buy below to get in.
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
            For Shopify stores with ads
          </p>
          <h1
            id="kit-hero-heading"
            className="mt-3 text-3xl font-bold leading-tight tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl dark:text-white"
          >
            People click your ads but don&apos;t buy?
          </h1>
          <p className="mt-4 font-mono text-2xl font-extrabold text-emerald-700 sm:text-3xl dark:text-emerald-400">
            {price}{" "}
            <span className="text-base font-semibold text-neutral-600 dark:text-neutral-400">
              · pay once · use right away
            </span>
          </p>
          <p className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-neutral-700 sm:text-lg dark:text-neutral-300">
            This{" "}
            <strong className="font-semibold text-neutral-900 dark:text-white">
              Shop Fix Scorecard
            </strong>{" "}
            shows what&apos;s wrong. Use your phone. Takes about 15 minutes.
            Fix the worst problems first. Not a long PDF.
          </p>
          <ul className="mt-6 space-y-2.5 text-base text-neutral-700 dark:text-neutral-300">
            <li className="flex items-start gap-2">
              <span className="mt-1 text-emerald-600" aria-hidden="true">
                ✓
              </span>
              Leak Scorecard — 27-point survey to find where sales leak (~15
              min)
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 text-emerald-600" aria-hidden="true">
                ✓
              </span>
              Simple guide: bad ads or bad checkout?
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 text-emerald-600" aria-hidden="true">
                ✓
              </span>
              7-day refund if you don&apos;t find 3+ fixes
            </li>
          </ul>
          <div className="mt-8 sm:mt-10">
            <DigitalProductBuy buyable={buyable} currency={currency} />
          </div>
          <p className="mt-5 text-center text-sm text-neutral-600 dark:text-neutral-400">
            Already bought?{" "}
            <Link
              href={LIBRARY_LOGIN_PATH}
              className="font-semibold text-emerald-700 underline underline-offset-2 hover:text-emerald-600 dark:text-emerald-400"
            >
              Enter your email to open it
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
            Ads get clicks. People still don&apos;t buy.
          </h2>
          <p className="mt-3 text-base leading-relaxed text-neutral-600 dark:text-neutral-400">
            Most stores lose sales in the same five places: checkout is hard on
            phones, shipping cost shocks people, pages load too slow, shoppers
            see no proof by the Buy button, and the ad does not match the page.
            More ad spend will not help until you fix those problems first.
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
            What you find in 15 minutes
          </h2>
          <p className="mt-2 text-base text-neutral-600 dark:text-neutral-400">
            Built by someone who builds Shopify stores for a living.{" "}
            {LEAK_SCORECARD_SUMMARY}
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-2 md:items-start md:gap-8">
            <div className="space-y-4">
              <div className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-5 dark:border-neutral-800 dark:bg-neutral-900">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Common problems
                </p>
                <ul className="mt-3 space-y-2 text-sm leading-relaxed text-neutral-700 sm:text-base dark:text-neutral-300">
                  <li>→ No Shop Pay on phones</li>
                  <li>→ Shipping cost shows up too late</li>
                  <li>→ No reviews near the Buy button</li>
                  <li>→ Ad words don&apos;t match the product page</li>
                </ul>
              </div>
              <div className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-5 dark:border-neutral-800 dark:bg-neutral-900">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Not a boring PDF
                </p>
                <p className="mt-2 text-2xl font-extrabold text-neutral-900 dark:text-white">
                  Leak Scorecard
                </p>
                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                  27-point survey · fix guides · copy blocks · ad test plan
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
            5 problems this checklist helps you fix
          </h2>
          <p className="mt-2 text-base text-neutral-600 dark:text-neutral-400">
            Walk through the Leak Scorecard. Fix the worst spots first this
            week.
          </p>
          <ol className="mt-8 space-y-4 sm:space-y-6">
            {LEAKS.map((leak, i) => (
              <li
                key={leak.title}
                className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 sm:p-5 dark:border-neutral-800 dark:bg-neutral-900/50"
              >
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Problem {i + 1}
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
            What you get
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
            7-day money-back promise
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-neutral-700 dark:text-neutral-300">
            Run the checklist on your store. If you don&apos;t find at least{" "}
            <strong>3 things to fix</strong>, email within 7 days for all your
            money back. No phone call needed.
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
            Questions
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
            Already bought?{" "}
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
