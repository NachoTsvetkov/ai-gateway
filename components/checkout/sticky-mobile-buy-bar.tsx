"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatPrice, type Currency } from "lib/currency";
import type { Buyable } from "lib/buyable";
import { CONVERSION_KIT_CHECKOUT_PATH } from "lib/digital-products-data";
import { track } from "lib/pixel/client";

type Props = {
  buyable: Buyable;
  currency: Currency;
  /** Pixels scrolled before bar appears */
  showAfter?: number;
};

/**
 * Fixed buy bar for mobile viewports. Hidden from `sm:` up where inline
 * CTAs are enough. Respects iOS safe-area inset.
 */
export function StickyMobileBuyBar({
  buyable,
  currency,
  showAfter = 420,
}: Props) {
  const [visible, setVisible] = useState(false);
  const checkoutHref = CONVERSION_KIT_CHECKOUT_PATH;
  const price = formatPrice(buyable.oneTimeEur, currency);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > showAfter);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [showAfter]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 border-t border-neutral-200 bg-white/95 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] backdrop-blur-sm sm:hidden dark:border-neutral-800 dark:bg-neutral-950/95"
      style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
      role="region"
      aria-label="Quick purchase"
    >
      <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 pt-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-neutral-900 dark:text-white">
            {buyable.name}
          </p>
          <p className="font-mono text-lg font-extrabold text-neutral-900 dark:text-white">
            {price}
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
          className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 active:bg-blue-700"
        >
          Get kit
        </Link>
      </div>
    </div>
  );
}
