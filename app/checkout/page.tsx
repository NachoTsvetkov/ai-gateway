// /checkout — order summary + payment form. Generic over bundles AND
// services because both are projected through the `Buyable` shape in
// `lib/buyable.ts`. The visitor lands here from any of:
//
//   /bundles/<slug>            via the bundle's checkout island
//   /services/<id>             via the service's checkout island
//
// URL conventions:
//   ?bundle=<id>                                  — bundle purchase
//   ?service=<id>&tier=<n>                        — service purchase
//   ?<...>&upsells=<csv>                          — selected upgrades
//
// Unknown / missing buyables fall back to a friendly "pick a bundle"
// landing screen instead of a 404.

import Link from "next/link";
import {
  type Buyable,
  resolveBuyableFromSearchParams,
} from "lib/buyable";
import { BUNDLES, getBundle, resolveUpsells } from "lib/bundles-data";
import { type Currency, formatPrice } from "lib/currency";
import { detectCurrency } from "lib/currency.server";
import { CheckoutForm } from "components/checkout/checkout-form";

export const metadata = {
  title: "Checkout — Nacho Tsvetkov",
  description: "Review your order and pay securely.",
};

type SearchParams = {
  bundle?: string;
  service?: string;
  tier?: string;
  upsells?: string;
};

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const buyable = resolveBuyableFromSearchParams(sp);
  const currency = await detectCurrency();

  if (!buyable) {
    return <PickBundleFallback />;
  }

  const selectedUpsells = resolveUpsells(sp.upsells);
  const upsellTotal = selectedUpsells.reduce((sum, u) => sum + u.eur, 0);
  const oneTimeTotal = buyable.oneTimeEur + upsellTotal;

  // Hosted-payment URL — bundles can carry a `stripePaymentLink`. For
  // services there's no equivalent today; if Nacho later configures
  // per-service Payment Links, surfacing them through `Buyable` is a
  // small additive change (extend the Buyable shape + populate from
  // bundles-data / services-data).
  const paymentLink =
    buyable.kind === "bundle"
      ? getBundle(buyable.id as Parameters<typeof getBundle>[0])
          .stripePaymentLink
      : undefined;

  return (
    <main className="bg-neutral-50 dark:bg-neutral-950">
      <div className="mx-auto max-w-5xl px-6 py-12 sm:py-16">
        <BackLink href={buyable.detailsUrl} label="Back" />

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
            buyable={buyable}
            upsells={selectedUpsells}
            oneTimeTotal={oneTimeTotal}
            currency={currency}
          />
          <CheckoutForm
            buyable={buyable}
            upsells={selectedUpsells}
            oneTimeTotalEur={oneTimeTotal}
            currency={currency}
            paymentLink={paymentLink}
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
  buyable,
  upsells,
  oneTimeTotal,
  currency,
}: {
  buyable: Buyable;
  upsells: ReturnType<typeof resolveUpsells>;
  oneTimeTotal: number;
  currency: Currency;
}) {
  const isPureMonthly =
    buyable.retainerEur !== undefined &&
    buyable.retainerEur === buyable.oneTimeEur;
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
              {buyable.name}
            </p>
            <p className="mt-0.5 text-xs text-neutral-600 dark:text-neutral-400">
              {buyable.tagline}
            </p>
            <Link
              href={buyable.detailsUrl}
              className="mt-1 inline-block text-xs font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              {buyable.kind === "bundle"
                ? "View what's included →"
                : "View service details →"}
            </Link>
          </div>
          <p className="flex-none whitespace-nowrap font-mono text-sm font-semibold text-neutral-900 dark:text-white">
            {formatPrice(buyable.oneTimeEur, currency)}
            {isPureMonthly && (
              <span className="ml-1 text-xs font-normal text-neutral-500">
                (1st mo)
              </span>
            )}
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
            {isPureMonthly ? "First month" : "Total due today"}
          </span>
          <span className="font-mono text-2xl font-extrabold text-neutral-900 dark:text-white">
            {formatPrice(oneTimeTotal, currency)}
          </span>
        </div>
        {buyable.retainerEur && !isPureMonthly && (
          <div className="flex items-center justify-between text-sm text-neutral-600 dark:text-neutral-400">
            <span>Then monthly retainer</span>
            <span className="font-mono">
              {formatPrice(buyable.retainerEur, currency)}/month
            </span>
          </div>
        )}
        {isPureMonthly && (
          <div className="flex items-center justify-between text-sm text-neutral-600 dark:text-neutral-400">
            <span>Recurring monthly</span>
            <span className="font-mono">
              {formatPrice(buyable.retainerEur ?? 0, currency)}/month
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
// Fallback when no valid buyable is in the URL
// ---------------------------------------------------------------------

function PickBundleFallback() {
  return (
    <main className="bg-neutral-50 dark:bg-neutral-950">
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl dark:text-white">
          Pick something to check out
        </h1>
        <p className="mt-4 text-base text-neutral-600 dark:text-neutral-400">
          Looks like the link didn't carry an order through. Pick a
          bundle below to get back on track, or browse single services.
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
        <p className="mt-8 text-sm text-neutral-600 dark:text-neutral-400">
          Or{" "}
          <Link
            href="/services"
            className="font-semibold text-blue-600 underline-offset-2 hover:underline dark:text-blue-400"
          >
            browse single services →
          </Link>
        </p>
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
