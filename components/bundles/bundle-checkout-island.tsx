"use client";

// Interactive upsell selector + dynamic running-total + "continue to
// checkout" CTA. Lives on the bundle detail page.
//
// Why a client island and not the full bundle page:
//   - the page itself is 95% static marketing copy. We only need a
//     React state hook for the checkbox set, the running-total math,
//     and the dynamic CTA href. Keeping that in a small island lets
//     the rest of the page stay a Server Component (and ship as static
//     HTML).
//
// The rendered CTA forwards to `/checkout?bundle=<id>&upsells=<csv>`
// preserving the visitor's selection through the order summary on the
// next page.

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import { type Currency, formatPrice } from "lib/currency";
import type { Bundle, Upsell } from "lib/bundles-data";

type Props = {
  bundle: Bundle;
  upsells: ReadonlyArray<Upsell>;
  currency: Currency;
};

export function BundleCheckoutIsland({ bundle, upsells, currency }: Props) {
  const headingId = useId();

  // Pre-checked recommended upsells: opt-in by default for the ones
  // explicitly tagged for THIS bundle. This is a small but consistent
  // conversion lever — the visitor can untick anything they don't
  // want, but the relevant upsells are framed as the default "smart"
  // configuration. The total updates live so there's never a surprise
  // at checkout.
  const initialChecked = useMemo(() => {
    const set = new Set<string>();
    for (const u of upsells) {
      if (u.recommendedFor?.includes(bundle.id)) set.add(u.id);
    }
    return set;
  }, [bundle.id, upsells]);

  const [checked, setChecked] = useState<Set<string>>(initialChecked);

  function toggle(id: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const upsellTotal = useMemo(() => {
    let sum = 0;
    for (const u of upsells) if (checked.has(u.id)) sum += u.eur;
    return sum;
  }, [checked, upsells]);

  const oneTimeTotal = bundle.oneTimeEur + upsellTotal;
  const upsellCsv = Array.from(checked).join(",");
  const checkoutHref = `/checkout?bundle=${bundle.id}${
    upsellCsv ? `&upsells=${encodeURIComponent(upsellCsv)}` : ""
  }`;

  return (
    <section
      aria-labelledby={headingId}
      className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8 dark:border-neutral-800 dark:bg-neutral-900"
    >
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">
          Optional upgrades
        </p>
        <h2
          id={headingId}
          className="mt-2 text-xl font-bold text-neutral-900 sm:text-2xl dark:text-white"
        >
          Add anything you'd like — or just skip them all
        </h2>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          Recommended upgrades for this bundle are pre-selected. Untick
          anything you don't want and the price updates live.
        </p>
      </header>

      <ul className="space-y-3">
        {upsells.map((u) => {
          const isChecked = checked.has(u.id);
          const recommended = u.recommendedFor?.includes(bundle.id) === true;
          return (
            <li key={u.id}>
              <label
                className={`flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition-colors ${
                  isChecked
                    ? "border-blue-400 bg-blue-50 dark:border-blue-500/60 dark:bg-blue-950/30"
                    : "border-neutral-200 bg-neutral-50 hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-950/40 dark:hover:border-neutral-700"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggle(u.id)}
                  className="mt-1 h-4 w-4 flex-none cursor-pointer accent-blue-600"
                  aria-describedby={`${u.id}-desc`}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <p className="font-semibold text-neutral-900 dark:text-white">
                      {u.label}
                      {recommended && (
                        <span className="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
                          Recommended
                        </span>
                      )}
                    </p>
                    <p className="font-mono text-sm font-semibold text-neutral-900 dark:text-white">
                      +{formatPrice(u.eur, currency)}
                    </p>
                  </div>
                  <p
                    id={`${u.id}-desc`}
                    className="mt-1 text-sm text-neutral-600 dark:text-neutral-400"
                  >
                    {u.description}
                  </p>
                </div>
              </label>
            </li>
          );
        })}
      </ul>

      {/* Running total — updates as the visitor toggles upsells. We
          deliberately show the bundle base + upsells separately so it's
          obvious why the total changed. The retainer (if any) is shown
          on its own line because it's recurring, not part of "due now". */}
      <div className="mt-8 space-y-2 rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm dark:border-neutral-800 dark:bg-neutral-950/40">
        <div className="flex items-center justify-between text-neutral-700 dark:text-neutral-300">
          <span>{bundle.name}</span>
          <span className="font-mono">
            {formatPrice(bundle.oneTimeEur, currency)}
          </span>
        </div>
        {upsellTotal > 0 && (
          <div className="flex items-center justify-between text-neutral-700 dark:text-neutral-300">
            <span>
              {checked.size} upgrade{checked.size === 1 ? "" : "s"}
            </span>
            <span className="font-mono">
              +{formatPrice(upsellTotal, currency)}
            </span>
          </div>
        )}
        <div className="mt-2 flex items-baseline justify-between border-t border-neutral-200 pt-3 dark:border-neutral-800">
          <span className="text-base font-semibold text-neutral-900 dark:text-white">
            Total due today
          </span>
          <span className="font-mono text-2xl font-extrabold text-neutral-900 dark:text-white">
            {formatPrice(oneTimeTotal, currency)}
          </span>
        </div>
        {bundle.retainerEur && (
          <p className="text-xs text-neutral-500 dark:text-neutral-500">
            + {formatPrice(bundle.retainerEur, currency)}/month retainer
            (covers maintenance, security, content updates, hosting +
            domain). Cancel anytime.
          </p>
        )}
      </div>

      <Link
        href={checkoutHref}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-blue-600/30 transition-all hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-xl hover:shadow-blue-600/40 sm:text-lg"
      >
        {bundle.cta.checkout}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
          className="h-5 w-5"
        >
          <path
            fillRule="evenodd"
            d="M5 10a.75.75 0 0 1 .75-.75h6.638L10.23 7.29a.75.75 0 1 1 1.04-1.08l3.5 3.25a.75.75 0 0 1 0 1.08l-3.5 3.25a.75.75 0 1 1-1.04-1.08l2.158-1.96H5.75A.75.75 0 0 1 5 10Z"
            clipRule="evenodd"
          />
        </svg>
      </Link>

      <p className="mt-3 text-center text-xs text-neutral-500 dark:text-neutral-500">
        {bundle.cta.helper}
      </p>
    </section>
  );
}
