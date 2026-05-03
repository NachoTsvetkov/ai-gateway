// Admin helpers for creating PayPal Catalog Products + Billing Plans.
// Called ONLY from `scripts/paypal-setup-plans.ts` — not at runtime.
//
// PayPal's Subscriptions API requires:
//   1. A Catalog Product (the "thing" being subscribed to). One product
//      per service line ("Monthly retainer") is plenty — we don't need
//      a product per price point.
//   2. A Billing Plan that pins the Product to a specific price /
//      currency / billing cycle. Plan price is FIXED on the plan, so
//      we need one plan per (retainerEur, currency) pair we want to
//      bill. Setup-fee CAN be overridden per subscription via
//      `plan_overrides.payment_preferences.setup_fee` — that's what
//      lets one plan handle both "Scale-Up: €1797 setup + €97/mo" and
//      "Maintenance: €0 setup + €97/mo".
//
// Plan IDs are written to `lib/paypal/plan-ids.json` keyed by
// `${eurAmount}_${currency}` (e.g. `97_EUR`). Runtime code reads that
// file via `plan-store.ts`.
//
// No `import "server-only"` marker here — this module is imported by
// `scripts/paypal-setup-plans.ts` under plain Node via tsx. The
// equivalent protection lives on `plan-store.ts`, the only PayPal
// module that actually has a Client-Component-reachable surface.

import type { Currency } from "../currency";
import { paypalFetch } from "./client";
import { toPayPalAmountValue } from "./money";

// ----------------------------------------------------------------------
// Catalog Product
// ----------------------------------------------------------------------

export type PayPalProduct = {
  id: string;
  name: string;
  type: string;
  category: string;
  create_time: string;
};

export async function createProduct(args: {
  name: string;
  description: string;
  /** Optional stable id; PayPal generates one if omitted. */
  id?: string;
}): Promise<PayPalProduct> {
  return paypalFetch<PayPalProduct>("/v1/catalogs/products", {
    method: "POST",
    requestId: args.id ?? `product:${args.name}:${Date.now()}`,
    body: {
      // Stable id makes the script idempotent — re-running it produces
      // the same product instead of creating a duplicate.
      id: args.id,
      name: args.name,
      description: args.description,
      type: "SERVICE",
      category: "SOFTWARE",
    },
  });
}

export async function getProduct(id: string): Promise<PayPalProduct | undefined> {
  try {
    return await paypalFetch<PayPalProduct>(`/v1/catalogs/products/${id}`);
  } catch (err) {
    // 404 means the product doesn't exist yet — that's expected on
    // first run.
    if (
      err instanceof Error &&
      err.message.includes("(404)")
    ) {
      return undefined;
    }
    throw err;
  }
}

// ----------------------------------------------------------------------
// Billing Plan
// ----------------------------------------------------------------------

export type PayPalBillingPlan = {
  id: string;
  product_id: string;
  name: string;
  status: "CREATED" | "ACTIVE" | "INACTIVE";
  create_time: string;
};

export type CreatePlanArgs = {
  productId: string;
  name: string;
  description: string;
  /** Recurring monthly amount in EUR (will be rendered as USD for USD plans). */
  retainerEur: number;
  currency: Currency;
};

/**
 * Create a billing plan for a fixed monthly price. The plan starts
 * ACTIVE so subscriptions can be opened against it immediately.
 *
 * Cycle config: indefinite monthly (`total_cycles: 0`) — subscriptions
 * recur until the buyer cancels. Setup fee is set to 0 here and
 * OVERRIDDEN at subscription-create time to the buyable's actual
 * upfront amount (bundle one-time + selected upsells).
 */
export async function createPlan(args: CreatePlanArgs): Promise<PayPalBillingPlan> {
  const monthlyValue = toPayPalAmountValue(args.retainerEur, args.currency);

  return paypalFetch<PayPalBillingPlan>("/v1/billing/plans", {
    method: "POST",
    requestId: `plan:${args.productId}:${args.retainerEur}:${args.currency}`,
    body: {
      product_id: args.productId,
      name: args.name,
      description: args.description,
      status: "ACTIVE",
      billing_cycles: [
        {
          frequency: { interval_unit: "MONTH", interval_count: 1 },
          tenure_type: "REGULAR",
          sequence: 1,
          // 0 = recur until cancelled.
          total_cycles: 0,
          pricing_scheme: {
            fixed_price: {
              value: monthlyValue,
              currency_code: args.currency,
            },
          },
        },
      ],
      payment_preferences: {
        auto_bill_outstanding: true,
        // Default setup fee is 0; the actual upfront amount is set per
        // subscription via plan_overrides.
        setup_fee: { value: "0.00", currency_code: args.currency },
        setup_fee_failure_action: "CANCEL",
        payment_failure_threshold: 2,
      },
      // Tax handling stays buyer-side (their billing country drives it).
      taxes: { percentage: "0", inclusive: false },
    },
  });
}

// ----------------------------------------------------------------------
// Plan-id key + JSON file shape
// ----------------------------------------------------------------------

/**
 * Stable key for the plan-id lookup file. Pairs the recurring amount
 * (in EUR for storage) with the currency the plan is denominated in.
 * USD plans store their EUR-equivalent here so a single setup script
 * can compute both currencies from the same enumeration.
 */
export function planKey(retainerEur: number, currency: Currency): string {
  return `${retainerEur}_${currency}`;
}

export type PlanIdMap = Readonly<Record<string, string>>;
