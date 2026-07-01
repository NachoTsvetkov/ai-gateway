"use client";

import Link from "next/link";
import { formatPrice, type Currency } from "lib/currency";
import type { Buyable } from "lib/buyable";
import { CONVERSION_KIT_CHECKOUT_PATH } from "lib/digital-products-data";
import { track } from "lib/pixel/client";
import { DigitalProductLegalNotice } from "components/checkout/legal-notice";

type Props = {
  buyable: Buyable;
  currency: Currency;
  className?: string;
};

/** Single-price CTA for digital products — no upsell UI. */
export function DigitalProductBuy({
  buyable,
  currency,
  className = "",
}: Props) {
  const checkoutHref = CONVERSION_KIT_CHECKOUT_PATH;
  const price = formatPrice(buyable.oneTimeEur, currency);

  return (
    <div
      className={`rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8 dark:border-neutral-800 dark:bg-neutral-900 ${className}`}
    >
      <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">
            One-time purchase
          </p>
          <p className="mt-1 font-mono text-3xl font-extrabold text-neutral-900 dark:text-white">
            {price}
          </p>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Instant download · No subscription
          </p>
        </div>
        <Link
          href={checkoutHref}
          onClick={() => {
            track("InitiateCheckout", {
              content_ids: [buyable.id],
              content_name: buyable.name,
              content_type: buyable.kind,
              value: buyable.oneTimeEur,
              currency,
            });
          }}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-600/30 transition-all hover:-translate-y-0.5 hover:bg-blue-500 active:bg-blue-700 sm:w-auto sm:py-4 sm:text-lg"
        >
          {buyable.cta.checkout}
        </Link>
      </div>
      <p className="mt-4 text-center text-xs text-neutral-500 dark:text-neutral-500 sm:text-left">
        {buyable.cta.helper}
      </p>
      <DigitalProductLegalNotice className="mt-3 text-center sm:text-left" />
    </div>
  );
}
