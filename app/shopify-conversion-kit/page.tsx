import Link from "next/link";
import { ViewContentTracker } from "components/analytics/view-content-tracker";
import { DigitalProductBuy } from "components/checkout/digital-product-buy";
import { DigitalProductLegalNotice } from "components/checkout/legal-notice";
import { StickyMobileBuyBar } from "components/checkout/sticky-mobile-buy-bar";
import { buyableFromDigitalProduct } from "lib/buyable";
import { detectCurrency } from "lib/currency.server";
import { getDigitalProduct } from "lib/digital-products-data";

export const metadata = {
  title: "Shopify Conversion Leak Fix Kit — Stop Bleeding Paid Traffic",
  description:
    "15-minute self-audit for Shopify stores losing sales at mobile checkout. Prioritized fixes, copy-paste blocks, and a weekly tracker — $37, instant download.",
  openGraph: {
    type: "website",
    title: "Shopify Conversion Leak Fix Kit",
    description:
      "Find where your Shopify store leaks conversions — and fix the highest-impact issues in one afternoon.",
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
  "15-minute mobile checkout audit checklist (score each leak 0–2)",
  "5-leak playbook with Shopify-specific fix steps",
  "Copy-paste trust, shipping, and urgency blocks for your theme",
  "Weekly conversion tracker CSV (sessions → ATC → checkout → purchase)",
  "Priority order: fix these first if you only have one afternoon",
] as const;

const FAQ = [
  {
    q: "Is this for beginners or experienced store owners?",
    a: "Both. If you're already running Meta or Google ads and getting traffic but weak conversion rate, this kit is built for you. No agency required.",
  },
  {
    q: "Do I need Shopify Plus?",
    a: "No. Everything applies to standard Shopify and Shopify Basic. Some fixes use built-in settings; others use free theme edits or apps you may already have.",
  },
  {
    q: "How fast will I see results?",
    a: "Many fixes ship in under an hour. Track baseline metrics before you start — the included tracker shows whether checkout completion improves within 7–14 days.",
  },
  {
    q: "Refunds?",
    a: "If the audit checklist doesn't surface at least 3 actionable leaks on your store, email nacho.tsvetkov@gmail.com within 7 days for a full refund. See conversion kit terms for details.",
  },
] as const;

const AUDIT_PREVIEW = [
  { check: "Shop Pay or Apple Pay available", score: "0–2" },
  { check: "Shipping cost shown before payment", score: "0–2" },
  { check: "Reviews visible near Add to Cart", score: "0–2" },
  { check: "Checkout completes in under 60 seconds", score: "0–2" },
] as const;

function KitAuditPreview() {
  return (
    <div
      className="overflow-hidden rounded-xl border border-neutral-300 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-900"
      aria-label="Preview of the 15-minute audit checklist"
    >
      <div className="border-b border-neutral-200 bg-neutral-100 px-4 py-2.5 dark:border-neutral-800 dark:bg-neutral-800">
        <p className="font-mono text-xs font-semibold text-neutral-700 dark:text-neutral-300">
          01-15-minute-audit.md — excerpt
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
        Full checklist: 30 points · score in 15 minutes on your phone
      </p>
    </div>
  );
}

export default async function ShopifyConversionKitPage() {
  const currency = await detectCurrency();
  const product = getDigitalProduct("shopify-conversion-kit");
  const buyable = buyableFromDigitalProduct(product);

  return (
    <main className="bg-white pb-24 sm:pb-0 dark:bg-neutral-950">
      <ViewContentTracker
        contentId={product.id}
        contentName={product.name}
        contentType="digital_product"
        contentCategory="Shopify conversion"
        value={product.oneTimeEur}
        currency={currency}
      />

      <StickyMobileBuyBar buyable={buyable} currency={currency} />

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
            Why am I paying for traffic that doesn&apos;t buy?
          </h1>
          <p className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-neutral-700 sm:text-lg dark:text-neutral-300">
            The{" "}
            <strong className="font-semibold text-neutral-900 dark:text-white">
              Shopify Conversion Leak Fix Kit
            </strong>{" "}
            is a 15-minute self-audit plus prioritized fixes for the five leaks
            that bleed mobile checkout — without hiring an agency.
          </p>
          <ul className="mt-6 space-y-2.5 text-base text-neutral-700 dark:text-neutral-300">
            <li className="flex items-start gap-2">
              <span className="mt-1 text-emerald-600" aria-hidden="true">
                ✓
              </span>
              Run the audit on your phone in 15 minutes
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 text-emerald-600" aria-hidden="true">
                ✓
              </span>
              Fix highest-impact leaks first (priority order included)
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 text-emerald-600" aria-hidden="true">
                ✓
              </span>
              Copy-paste blocks + weekly tracker to prove it worked
            </li>
          </ul>
          <div className="mt-8 sm:mt-10">
            <DigitalProductBuy buyable={buyable} currency={currency} />
          </div>
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
            under 18/30 on the mobile checkout audit.
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
                  Inside the kit
                </p>
                <p className="mt-2 font-mono text-2xl font-extrabold text-neutral-900 dark:text-white">
                  30<span className="text-base font-semibold">-point audit</span>
                </p>
                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                  5 playbooks · copy-paste blocks · weekly CSV tracker
                </p>
              </div>
            </div>
            <KitAuditPreview />
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
            The 5 leaks this kit helps you fix
          </h2>
          <p className="mt-2 text-base text-neutral-600 dark:text-neutral-400">
            Score each 0–2 in the audit. Anything scoring 0–1 gets a fix this
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
            What you get (instant download)
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
        </div>
      </footer>
    </main>
  );
}
