// /checkout — order summary + payment form.
//
// Reads `?bundle=<id>&upsells=<csv>` from the search params, resolves
// the line items into the bundle catalogue, and renders:
//
//   - a left/top column with the line-by-line summary + grand total
//   - a right/bottom column with the contact form (`<CheckoutForm>`)
//
// Unknown / missing bundle ids return a friendly "pick a bundle"
// landing screen instead of a 404 — visitors land here from any number
// of bundle CTAs and we never want them to bounce off a hard error.

import Link from "next/link";
import {
  type BundleId,
  BUNDLES,
  getBundle,
  resolveUpsells,
} from "lib/bundles-data";
import { type Currency, formatPrice } from "lib/currency";
import { detectCurrency } from "lib/currency.server";
import { CheckoutForm } from "components/bundles/checkout-form";

export const metadata = {
  title: "Checkout — Nacho Tsvetkov",
  description: "Review your bundle + upgrades and complete your order.",
};

const VALID_BUNDLE_IDS: ReadonlySet<string> = new Set(BUNDLES.map((b) => b.id));

type SearchParams = {
  bundle?: string;
  upsells?: string;
};

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const bundleSlug = sp.bundle;
  const currency = await detectCurrency();

  if (!bundleSlug || !VALID_BUNDLE_IDS.has(bundleSlug)) {
    return <PickBundleFallback />;
  }

  const bundle = getBundle(bundleSlug as BundleId);
  const selectedUpsells = resolveUpsells(sp.upsells);

  const upsellTotal = selectedUpsells.reduce((sum, u) => sum + u.eur, 0);
  const oneTimeTotal = bundle.oneTimeEur + upsellTotal;

  return (
    <main className="bg-neutral-50 dark:bg-neutral-950">
      <div className="mx-auto max-w-5xl px-6 py-12 sm:py-16">
        <BackLink href={`/bundles/${bundle.id}`} label="Back to the bundle" />

        <header className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">
            Checkout
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl dark:text-white">
            Review your order
          </h1>
          <p className="mt-3 max-w-2xl text-base text-neutral-600 dark:text-neutral-400">
            Confirm the line items below, fill in your details, and I'll
            send you a secure Stripe invoice within the hour. Kickoff
            usually happens within 48 hours of payment.
          </p>
        </header>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.05fr_1fr]">
          <OrderSummary
            bundle={bundle}
            upsells={selectedUpsells}
            oneTimeTotal={oneTimeTotal}
            currency={currency}
          />
          <CheckoutForm
            bundle={bundle}
            upsells={selectedUpsells}
            oneTimeTotalEur={oneTimeTotal}
            currency={currency}
          />
        </div>
      </div>
    </main>
  );
}

// ---------------------------------------------------------------------
// Order summary
// ---------------------------------------------------------------------

function OrderSummary({
  bundle,
  upsells,
  oneTimeTotal,
  currency,
}: {
  bundle: ReturnType<typeof getBundle>;
  upsells: ReturnType<typeof resolveUpsells>;
  oneTimeTotal: number;
  currency: Currency;
}) {
  return (
    <section
      aria-labelledby="summary-heading"
      className="self-start rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8 dark:border-neutral-800 dark:bg-neutral-900"
    >
      <h2
        id="summary-heading"
        className="text-lg font-bold text-neutral-900 dark:text-white"
      >
        Order summary
      </h2>

      <ul className="mt-5 divide-y divide-neutral-200 dark:divide-neutral-800">
        <li className="flex items-start justify-between gap-4 py-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-neutral-900 dark:text-white">
              {bundle.name}
            </p>
            <p className="mt-0.5 text-xs text-neutral-600 dark:text-neutral-400">
              {bundle.tagline}
            </p>
            <Link
              href={`/bundles/${bundle.id}`}
              className="mt-1 inline-block text-xs font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              View what's included →
            </Link>
          </div>
          <p className="flex-none whitespace-nowrap font-mono text-sm font-semibold text-neutral-900 dark:text-white">
            {formatPrice(bundle.oneTimeEur, currency)}
          </p>
        </li>

        {upsells.map((u) => (
          <li
            key={u.id}
            className="flex items-start justify-between gap-4 py-4"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-neutral-900 dark:text-white">
                {u.label}
              </p>
              <p className="mt-0.5 line-clamp-2 text-xs text-neutral-600 dark:text-neutral-400">
                {u.description}
              </p>
            </div>
            <p className="flex-none whitespace-nowrap font-mono text-sm text-neutral-700 dark:text-neutral-300">
              +{formatPrice(u.eur, currency)}
            </p>
          </li>
        ))}
      </ul>

      <div className="mt-2 space-y-2 border-t border-neutral-200 pt-4 dark:border-neutral-800">
        <div className="flex items-baseline justify-between">
          <span className="text-base font-bold text-neutral-900 dark:text-white">
            Total due today
          </span>
          <span className="font-mono text-2xl font-extrabold text-neutral-900 dark:text-white">
            {formatPrice(oneTimeTotal, currency)}
          </span>
        </div>
        {bundle.retainerEur && (
          <div className="flex items-center justify-between text-sm text-neutral-600 dark:text-neutral-400">
            <span>Then monthly retainer</span>
            <span className="font-mono">
              {formatPrice(bundle.retainerEur, currency)}/month
            </span>
          </div>
        )}
        <p className="pt-2 text-xs text-neutral-500 dark:text-neutral-500">
          Prices in {currency}. Local taxes (if applicable) will be added
          on the invoice based on your billing country.
        </p>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------
// Fallback when no valid bundle is in the URL
// ---------------------------------------------------------------------

function PickBundleFallback() {
  return (
    <main className="bg-neutral-50 dark:bg-neutral-950">
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl dark:text-white">
          Pick a bundle to check out
        </h1>
        <p className="mt-4 text-base text-neutral-600 dark:text-neutral-400">
          Looks like the link didn't carry a bundle through. Pick one
          below and you'll be back here in two clicks.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {BUNDLES.map((b) => (
            <Link
              key={b.id}
              href={`/bundles/${b.id}`}
              prefetch={true}
              className="group rounded-2xl border border-neutral-200 bg-white p-5 text-left transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-blue-500/40"
            >
              <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                {b.tagline}
              </p>
              <p className="mt-1 text-base font-bold text-neutral-900 dark:text-white">
                {b.name}
              </p>
              <p className="mt-3 font-mono text-2xl font-extrabold text-neutral-900 dark:text-white">
                €{b.oneTimeEur}
              </p>
              <p className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 transition-transform group-hover:translate-x-0.5 dark:text-blue-400">
                See bundle →
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

// ---------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------

function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 text-sm text-neutral-600 transition-colors hover:text-blue-600 dark:text-neutral-400 dark:hover:text-blue-400"
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
      {label}
    </Link>
  );
}
