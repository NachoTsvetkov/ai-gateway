// PayPal Subscriptions v1 wrappers. Used for buyables that include a
// monthly retainer (Scale-Up bundle, Enterprise bundle, maintenance
// service, services with retainers in their tier list).
//
// Pricing model:
//   - Plan price = recurring monthly amount, fixed at plan creation
//     time and shared across all buyers at the same retainer level.
//   - First month is included in the bundle's headline price. Rather
//     than fight PayPal's billing-cycle override rules to model this
//     as a $0 trial cycle (which PayPal rejects with
//     INVALID_BILLING_CYCLE_SEQUENCE because we'd be adding a new
//     sequence to the parent plan), we just subtract the retainer
//     out of the setup fee:
//
//         setup_fee = (oneTimeEur − retainerEur) + upsells
//
//     PayPal then charges day-1 = setup_fee + first recurring cycle
//     = (oneTimeEur − retainerEur) + upsells + retainerEur
//     = oneTimeEur + upsells
//
//     ...which is exactly the bundle's advertised price. No
//     start_time gymnastics, no UI special case, and pure-monthly
//     services (oneTimeEur === retainerEur) drop out automatically:
//     setup_fee = 0 + upsells, day-1 = upsells + first month.
//
//   - Recurring kicks in on day 30+ at the plan's retainerEur price.
//
// Buyer signs once.
//
// IMPORTANT historical note on the override field name:
//   PayPal's official Subscriptions API spec accepts an inline-plan
//   override under the field name `plan` (alongside `plan_id` which
//   references the parent plan). Earlier blog posts and community
//   examples called this field `plan_overrides`, which PayPal's live
//   API silently *ignores* — the response comes back with
//   `plan_overridden: false` and the subscription bills as if no
//   override was attached. Always use `plan` and verify with
//   `scripts/paypal-verify-setup-fee.ts` after schema changes.

import "server-only";
import type { Buyable } from "../buyable";
import type { Currency } from "../currency";
import type { Upsell } from "../bundles-data";
import { paypalFetch } from "./client";
import { toPayPalAmountValue } from "./money";
import { getPlanId } from "./plan-store";
import type { CheckoutCustomer } from "./orders";

export type PayPalSubscription = {
  id: string;
  status:
    | "APPROVAL_PENDING"
    | "APPROVED"
    | "ACTIVE"
    | "SUSPENDED"
    | "CANCELLED"
    | "EXPIRED";
  status_update_time?: string;
  plan_id: string;
  start_time?: string;
  subscriber?: {
    email_address?: string;
    name?: { given_name?: string; surname?: string };
  };
  links?: ReadonlyArray<{ rel: string; href: string; method: string }>;
};

export async function createSubscription(args: {
  buyable: Buyable;
  upsells: ReadonlyArray<Upsell>;
  currency: Currency;
  customer: CheckoutCustomer;
  returnUrl: string;
  cancelUrl: string;
}): Promise<PayPalSubscription> {
  const { buyable, upsells, currency, customer, returnUrl, cancelUrl } = args;

  const retainerEur = buyable.retainerEur;
  if (retainerEur === undefined || retainerEur <= 0) {
    throw new Error(
      `createSubscription called for a buyable with no retainer (${buyable.reference}). ` +
        "Use createOrder instead.",
    );
  }

  const planId = getPlanId(retainerEur, currency);

  // Setup fee = bundle one-time MINUS first month (because PayPal
  // will charge that as the first billing cycle today) PLUS upsells.
  // Pure-monthly services (oneTimeEur === retainerEur) end up with
  // setup_fee = upsells only — PayPal's first cycle is the service
  // itself, no separate setup component.
  const upsellsTotalEur = upsells.reduce((sum, u) => sum + u.eur, 0);
  const setupFeeEur = Math.max(
    0,
    buyable.oneTimeEur - retainerEur + upsellsTotalEur,
  );

  // PayPal-Request-Id makes a network retry idempotent without
  // collapsing genuine separate retries from a refresh-and-resubscribe.
  const requestId = `${buyable.reference}:sub:${upsells.map((u) => u.id).sort().join(",")}:${Date.now()}`;

  return paypalFetch<PayPalSubscription>("/v1/billing/subscriptions", {
    method: "POST",
    requestId,
    body: {
      plan_id: planId,
      // PayPal accepts an arbitrary string of <=127 chars for cross-
      // referencing with our internal records. We use the buyable
      // reference + selected upsells for parity with one-time orders.
      custom_id: truncate(
        [
          `ref=${buyable.reference}`,
          upsells.length > 0
            ? `up=${upsells.map((u) => u.id).join(",")}`
            : null,
          customer.business ? `biz=${customer.business}` : null,
        ]
          .filter(Boolean)
          .join("|"),
        127,
      ),
      // Inline plan override — see the header comment for why this
      // goes under `plan` (not `plan_overrides`). We override only
      // `payment_preferences.setup_fee`; the parent plan's setup_fee
      // is $0 and we replace it with our reduced setup amount
      // (oneTimeEur − retainerEur + upsells), so PayPal's day-1
      // charge sums to the bundle's advertised price.
      plan: buildPlanOverride({ currency, setupFeeEur }),
      subscriber: {
        email_address: customer.email,
        name: splitName(customer.name),
      },
      application_context: {
        brand_name: "Nacho Tsvetkov",
        // No shipping prompt for digital services.
        shipping_preference: "NO_SHIPPING",
        user_action: "SUBSCRIBE_NOW",
        // Single-click subscription approval.
        payment_method: {
          payer_selected: "PAYPAL",
          payee_preferred: "IMMEDIATE_PAYMENT_REQUIRED",
        },
        return_url: returnUrl,
        cancel_url: cancelUrl,
      },
    },
  });
}

/**
 * Read a subscription by id — used by the success page to confirm
 * status before showing the success message.
 */
export async function getSubscription(id: string): Promise<PayPalSubscription> {
  return paypalFetch<PayPalSubscription>(`/v1/billing/subscriptions/${id}`);
}

/**
 * Cancel a subscription. Only used by an admin-protected endpoint;
 * exposed here for completeness so the same module owns the full
 * lifecycle.
 */
export async function cancelSubscription(
  id: string,
  reason: string,
): Promise<void> {
  await paypalFetch<void>(`/v1/billing/subscriptions/${id}/cancel`, {
    method: "POST",
    requestId: `cancel:${id}`,
    body: { reason },
  });
}

// ----------------------------------------------------------------------
// Plan-override builder
// ----------------------------------------------------------------------
//
// Returns the inline-plan object to pass under the `plan` field of
// POST /v1/billing/subscriptions, or `undefined` when there's nothing
// to override (no upsells AND no setup fee — the parent plan's
// defaults are already correct).
//
// The shape mirrors PayPal's documented Plan schema, only the fields
// we actually want to change. Anything we omit falls back to the
// parent plan's value.

type PlanOverride = {
  payment_preferences?: {
    setup_fee?: { value: string; currency_code: Currency };
    setup_fee_failure_action?: "CANCEL" | "CONTINUE";
    auto_bill_outstanding?: boolean;
    payment_failure_threshold?: number;
  };
};

function buildPlanOverride(args: {
  currency: Currency;
  setupFeeEur: number;
}): PlanOverride | undefined {
  const { currency, setupFeeEur } = args;
  if (setupFeeEur <= 0) return undefined;

  return {
    payment_preferences: {
      setup_fee: {
        value: toPayPalAmountValue(setupFeeEur, currency),
        currency_code: currency,
      },
      // CANCEL the subscription if PayPal can't collect the setup fee
      // — we don't want a buyer drifting into ACTIVE state without
      // having paid for the bundle. Threshold of 2 means PayPal
      // retries once before giving up on a recurring charge.
      setup_fee_failure_action: "CANCEL",
      auto_bill_outstanding: true,
      payment_failure_threshold: 2,
    },
  };
}

// ----------------------------------------------------------------------
// Local helpers (mirrors of orders.ts — kept inline to avoid an
// extra `string-utils` module for two 5-line functions)
// ----------------------------------------------------------------------

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, max - 1).trimEnd() + "…";
}

function splitName(full: string): { given_name: string; surname: string } {
  const parts = full.trim().split(/\s+/);
  if (parts.length === 1) {
    return { given_name: parts[0] ?? "", surname: "" };
  }
  return {
    given_name: parts.slice(0, -1).join(" "),
    surname: parts[parts.length - 1] ?? "",
  };
}
