"use client";

// Generic Buyable checkout island. Used by:
//   - /bundles/[slug]   — buyable is a bundle
//   - /services/[serviceId] — buyable is a service (+ optional tier)
//
// Renders:
//   - optional tier picker (only when `tiers` prop is provided — tiered
//     services like the website 1-page / 3-page choice)
//   - upsell checkboxes (recommended ones pre-checked)
//   - live running total (oneTime + upsell sum, plus retainer line if any)
//   - CTA button that forwards to /checkout?<buyable.searchParams>&upsells=<csv>
//
// Why a single component instead of one per buyable type:
//   - 95% of the UI is shared — the only differences are tiers, the
//     CTA verb, and the mix of available upsells. All three are handled
//     by props.
//   - keeps one place to change the upsell UX or running-total math.

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import { type Currency, formatPrice } from "lib/currency";
import {
  type Buyable,
  isUpsellRecommendedFor,
} from "lib/buyable";
import type { Upsell } from "lib/bundles-data";

export type TierOption = {
  /** Index into the source `tiers[]`. Must match the URL `tier` param. */
  index: number;
  label: string;
  oneTimeEur: number;
  /** Optional 1-line description shown under the tier label. */
  description?: string;
};

type Props = {
  /**
   * The buyable being purchased. For tiered services, the buyable's
   * `oneTimeEur` and `tier` reflect the *currently selected* tier — so
   * if the user picks a different tier client-side, we re-derive both
   * locally without reloading the page.
   */
  buyable: Buyable;
  /** Upsells to OFFER. The component decides which to pre-check using
   *  `isUpsellRecommendedFor(buyable)`. */
  upsells: ReadonlyArray<Upsell>;
  currency: Currency;
  /**
   * Optional tier list. When provided, renders a radio-card picker
   * above the upsells and uses the selected tier's `oneTimeEur` for
   * the running total + checkout link.
   */
  tiers?: ReadonlyArray<TierOption>;
};

export function CheckoutIsland({ buyable, upsells, currency, tiers }: Props) {
  const headingId = useId();

  // Tier state — defaults to whatever tier the buyable arrived as
  // (matches the URL or the buyable's tier prop). For non-tiered
  // buyables this stays undefined.
  const [selectedTierIndex, setSelectedTierIndex] = useState<number | undefined>(
    () => buyable.tier ?? tiers?.[0]?.index,
  );

  const activeTier = useMemo(
    () =>
      tiers && selectedTierIndex !== undefined
        ? tiers.find((t) => t.index === selectedTierIndex)
        : undefined,
    [tiers, selectedTierIndex],
  );

  const oneTimeBaseEur = activeTier ? activeTier.oneTimeEur : buyable.oneTimeEur;

  // Pre-check the recommended upsells. Re-runs when the buyable changes
  // (e.g. switching tier within a tiered service rebuilds the buyable
  // and so the recommendation set may shift).
  const initialChecked = useMemo(() => {
    const set = new Set<string>();
    for (const u of upsells) {
      if (isUpsellRecommendedFor(u, buyable)) set.add(u.id);
    }
    return set;
  }, [buyable, upsells]);

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

  const oneTimeTotal = oneTimeBaseEur + upsellTotal;

  const checkoutHref = useMemo(() => {
    // Clone the buyable's base searchParams so we never mutate the
    // shared instance. Override `tier` if the user picked one client-
    // side that differs from the buyable's default.
    const sp = new URLSearchParams(buyable.searchParams);
    if (
      activeTier &&
      activeTier.index !== buyable.tier
    ) {
      sp.set("tier", String(activeTier.index));
    }
    const upsellCsv = Array.from(checked).join(",");
    if (upsellCsv) sp.set("upsells", upsellCsv);
    return `/checkout?${sp.toString()}`;
  }, [activeTier, buyable.searchParams, buyable.tier, checked]);

  const isPureMonthly =
    buyable.retainerEur !== undefined &&
    buyable.retainerEur === buyable.oneTimeEur &&
    !activeTier;

  return (
    <section
      aria-labelledby={headingId}
      className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8 dark:border-neutral-800 dark:bg-neutral-900"
    >
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">
          {buyable.kind === "bundle" ? "Optional upgrades" : "Add to your order"}
        </p>
        <h2
          id={headingId}
          className="mt-2 text-xl font-bold text-neutral-900 sm:text-2xl dark:text-white"
        >
          {tiers && tiers.length > 1
            ? "Pick a tier, then add anything you'd like"
            : "Add anything you'd like — or just skip them all"}
        </h2>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          Recommended upgrades are pre-selected. Untick anything you don't
          want and the price updates live.
        </p>
      </header>

      {/* Tier picker — only rendered for tiered services. The radio
          inputs are visually hidden; the surrounding label IS the
          clickable card. */}
      {tiers && tiers.length > 1 && (
        <fieldset className="mb-6">
          <legend className="mb-2 text-xs font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
            Tier
          </legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {tiers.map((t) => {
              const isSelected = t.index === selectedTierIndex;
              return (
                <label
                  key={t.index}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors ${
                    isSelected
                      ? "border-blue-400 bg-blue-50 dark:border-blue-500/60 dark:bg-blue-950/30"
                      : "border-neutral-200 bg-neutral-50 hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-950/40 dark:hover:border-neutral-700"
                  }`}
                >
                  <input
                    type="radio"
                    name="tier"
                    value={t.index}
                    checked={isSelected}
                    onChange={() => setSelectedTierIndex(t.index)}
                    className="mt-1 h-4 w-4 cursor-pointer accent-blue-600"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="font-semibold text-neutral-900 dark:text-white">
                        {t.label}
                      </p>
                      <p className="font-mono text-sm font-semibold text-neutral-900 dark:text-white">
                        {formatPrice(t.oneTimeEur, currency)}
                      </p>
                    </div>
                    {t.description && (
                      <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                        {t.description}
                      </p>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        </fieldset>
      )}

      <ul className="space-y-3">
        {upsells.map((u) => {
          const isChecked = checked.has(u.id);
          const recommended = isUpsellRecommendedFor(u, buyable);
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

      {/* Running total. Shows the buyable line, every checked upsell as
          a count, and a clear "due today" total. The retainer (if any)
          is on its own line because it's recurring, not part of "due
          now". For pure-monthly services the framing collapses into a
          single "first month + recurring" copy line. */}
      <div className="mt-8 space-y-2 rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm dark:border-neutral-800 dark:bg-neutral-950/40">
        <div className="flex items-center justify-between text-neutral-700 dark:text-neutral-300">
          <span>{baseLineLabel(buyable, activeTier)}</span>
          <span className="font-mono">
            {formatPrice(oneTimeBaseEur, currency)}
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
            {isPureMonthly ? "First month" : "Total due today"}
          </span>
          <span className="font-mono text-2xl font-extrabold text-neutral-900 dark:text-white">
            {formatPrice(oneTimeTotal, currency)}
          </span>
        </div>
        {buyable.retainerEur && !isPureMonthly && (
          <p className="text-xs text-neutral-500 dark:text-neutral-500">
            + {formatPrice(buyable.retainerEur, currency)}/month retainer.
            Cancel anytime.
          </p>
        )}
        {isPureMonthly && (
          <p className="text-xs text-neutral-500 dark:text-neutral-500">
            Then {formatPrice(buyable.retainerEur ?? 0, currency)}/month.
            Cancel anytime — you keep ownership of everything.
          </p>
        )}
      </div>

      <Link
        href={checkoutHref}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-blue-600/30 transition-all hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-xl hover:shadow-blue-600/40 sm:text-lg"
      >
        {buyable.cta.checkout}
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
        {buyable.cta.helper}
      </p>
    </section>
  );
}

// "Startup Bundle" / "Custom Responsive Website Build (1-page)" / etc.
function baseLineLabel(buyable: Buyable, tier: TierOption | undefined): string {
  if (!tier) return buyable.name;
  // For tiered services we don't repeat the tier label twice. The
  // running-total line just shows the unbracketed name + the picked
  // tier's label, which the dedicated tier-picker block already
  // confirmed visually above.
  // The buyable.name already encodes the tier ("Service (1-page)") for
  // URL-scoped contexts; here we strip the parenthetical for clarity.
  const stripped = buyable.name.replace(/\s*\([^)]*\)\s*$/, "");
  return `${stripped} — ${tier.label}`;
}
