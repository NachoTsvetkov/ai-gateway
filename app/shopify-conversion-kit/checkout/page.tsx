import Link from "next/link";
import { ViewContentTracker } from "components/analytics/view-content-tracker";
import { CheckoutForm } from "components/checkout/checkout-form";
import { DigitalProductLegalNotice } from "components/checkout/legal-notice";
import { buyableFromDigitalProduct } from "lib/buyable";
import { formatPrice, type Currency } from "lib/currency";
import { detectCurrency } from "lib/currency.server";
import { getDigitalProduct } from "lib/digital-products-data";

export const metadata = {
  title: "Checkout — Shopify Paid-Traffic Leak Scorecard",
  description: "Pay securely with PayPal. Instant library access after purchase.",
};

export default async function ConversionKitCheckoutPage() {
  const currency = await detectCurrency();
  const product = getDigitalProduct("shopify-conversion-kit");
  const buyable = buyableFromDigitalProduct(product);

  return (
    <div className="bg-neutral-50 dark:bg-neutral-950">
      <ViewContentTracker
        contentId={product.id}
        contentName={`${product.name} — Checkout`}
        contentType="digital_product"
        contentCategory="Shopify conversion checkout"
        value={product.oneTimeEur}
        currency={currency}
      />

      <div className="mx-auto max-w-lg px-4 py-10 sm:px-6 sm:py-14">
        <Link
          href="/shopify-conversion-kit"
          className="inline-flex min-h-11 items-center gap-1.5 text-sm text-neutral-600 transition-colors hover:text-blue-600 dark:text-neutral-400 dark:hover:text-blue-400"
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
          Back to scorecard
        </Link>

        <header className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
            Secure checkout
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl dark:text-white">
            {product.name}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-neutral-600 sm:text-base dark:text-neutral-400">
            {product.tagline}
          </p>
        </header>

        <OrderCard
          name={product.name}
          priceEur={product.oneTimeEur}
          currency={currency}
        />

        <div className="mt-6">
          <CheckoutForm
            buyable={buyable}
            upsells={[]}
            oneTimeTotalEur={product.oneTimeEur}
            currency={currency}
            paymentLink={product.stripePaymentLink}
            locale="en"
            paypalClientId={process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}
            paypalEnv={
              process.env.PAYPAL_ENV === "live" ? "live" : "sandbox"
            }
          />
        </div>

        <DigitalProductLegalNotice className="mt-6 text-center" />
      </div>
    </div>
  );
}

function OrderCard({
  name,
  priceEur,
  currency,
}: {
  name: string;
  priceEur: number;
  currency: Currency;
}) {
  return (
    <section
      aria-label="Order summary"
      className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
    >
      <div className="flex items-baseline justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-neutral-900 dark:text-white">
            {name}
          </p>
          <p className="mt-0.5 text-xs text-neutral-600 dark:text-neutral-400">
            Instant access · One-time payment
          </p>
        </div>
        <p className="font-mono text-2xl font-extrabold text-neutral-900 dark:text-white">
          {formatPrice(priceEur, currency)}
        </p>
      </div>
    </section>
  );
}
