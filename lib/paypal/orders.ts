// PayPal Orders v2 wrappers. Used for ONE-TIME purchases (bundles
// without a retainer + services without a retainer). Buyables that
// include a recurring component go through `subscriptions.ts` instead.
//
// Two endpoints, two functions: `createOrder` builds the line-item
// breakdown server-side (we never trust client-supplied totals) and
// returns the order id; `captureOrder` is called from the JS-SDK
// `onApprove` handler after the buyer hits "Pay" inside the PayPal
// popup. Both are async / idempotent — passing a stable `requestId`
// to PayPal lets us safely retry on network blips.

import "server-only";
import type { Buyable } from "../buyable";
import type { Currency } from "../currency";
import type { Upsell } from "../bundles-data";
import { paypalFetch } from "./client";
import {
  fromPayPalAmount,
  toPayPalAmount,
  toPayPalAmountValue,
} from "./money";

// ----------------------------------------------------------------------
// Types (subset of the Orders v2 response shape we actually consume)
// ----------------------------------------------------------------------

export type PayPalOrderStatus =
  | "CREATED"
  | "SAVED"
  | "APPROVED"
  | "VOIDED"
  | "COMPLETED"
  | "PAYER_ACTION_REQUIRED";

export type PayPalOrder = {
  id: string;
  status: PayPalOrderStatus;
  links?: ReadonlyArray<{ rel: string; href: string; method: string }>;
};

export type PayPalCapturedOrder = PayPalOrder & {
  payer?: {
    email_address?: string;
    name?: { given_name?: string; surname?: string };
    payer_id?: string;
  };
  purchase_units?: ReadonlyArray<{
    invoice_id?: string;
    custom_id?: string;
    amount: { currency_code: Currency; value: string };
    payments?: {
      captures?: ReadonlyArray<{
        id: string;
        status: string;
        amount: { currency_code: Currency; value: string };
        seller_receivable_breakdown?: {
          paypal_fee?: { value: string };
          net_amount?: { value: string };
        };
      }>;
    };
  }>;
};

// ----------------------------------------------------------------------
// Customer payload (used for both orders and subscriptions)
// ----------------------------------------------------------------------

export type CheckoutCustomer = {
  name: string;
  business: string;
  email: string;
  phone?: string;
  notes?: string;
};

// ----------------------------------------------------------------------
// createOrder
// ----------------------------------------------------------------------

/**
 * Build a PayPal Orders v2 request from a Buyable + selected upsells.
 *
 * `intent: CAPTURE` means we'll call /capture after the buyer approves
 * (the standard one-step pattern). We could use AUTHORIZE for delayed
 * captures, but at this price band there's no benefit.
 *
 * Idempotency: PayPal's request_id header dedupes retries within 30s.
 * We hash the buyable reference + upsell ids + a millisecond timestamp
 * so a refresh-and-retry actually creates a NEW order (refund tracking
 * stays clean) but a transient network retry collapses into one.
 */
export async function createOrder(args: {
  buyable: Buyable;
  upsells: ReadonlyArray<Upsell>;
  currency: Currency;
  customer: CheckoutCustomer;
  /** Where PayPal should redirect after approve / cancel. */
  returnUrl: string;
  cancelUrl: string;
}): Promise<PayPalOrder> {
  const { buyable, upsells, currency, customer, returnUrl, cancelUrl } = args;

  if (buyable.retainerEur !== undefined && buyable.retainerEur > 0) {
    throw new Error(
      `createOrder called for a buyable with a retainer (${buyable.reference}). ` +
        "Use createSubscription instead.",
    );
  }

  // Build the item breakdown. PayPal requires `item_total` to equal
  // sum-of-items, so we build both the item array AND the breakdown
  // sum-fields in lockstep.
  type Item = {
    name: string;
    description?: string;
    quantity: string;
    unit_amount: { currency_code: Currency; value: string };
    category?: "DIGITAL_GOODS" | "PHYSICAL_GOODS" | "DONATION";
  };
  const items: Item[] = [];

  items.push({
    name: truncate(buyable.name, 127),
    description: truncate(buyable.tagline, 127),
    quantity: "1",
    unit_amount: toPayPalAmount(buyable.oneTimeEur, currency),
    category: "DIGITAL_GOODS",
  });

  for (const u of upsells) {
    items.push({
      name: truncate(u.label, 127),
      description: truncate(u.description, 127),
      quantity: "1",
      unit_amount: toPayPalAmount(u.eur, currency),
      category: "DIGITAL_GOODS",
    });
  }

  const upsellsTotalEur = upsells.reduce((sum, u) => sum + u.eur, 0);
  const grandTotalEur = buyable.oneTimeEur + upsellsTotalEur;
  const itemTotal = toPayPalAmount(grandTotalEur, currency);

  // Stash the buyer-provided notes in custom_id so they show up on the
  // PayPal-side transaction record (capped at 127 chars). The full
  // notes go into the eventual handoff email, not into PayPal.
  const customId = truncate(
    [
      `ref=${buyable.reference}`,
      upsells.length > 0 ? `up=${upsells.map((u) => u.id).join(",")}` : null,
      customer.business ? `biz=${customer.business}` : null,
    ]
      .filter(Boolean)
      .join("|"),
    127,
  );

  const requestId = `${buyable.reference}:${upsells.map((u) => u.id).sort().join(",")}:${Date.now()}`;

  return paypalFetch<PayPalOrder>("/v2/checkout/orders", {
    method: "POST",
    requestId,
    body: {
      intent: "CAPTURE",
      purchase_units: [
        {
          // Up to 127 chars; PayPal uses this on the receipt + dispute
          // export so a reference like `bundle:scaleup` stays readable.
          invoice_id: truncate(
            `${buyable.reference}-${Date.now()}`,
            127,
          ),
          custom_id: customId,
          description: truncate(
            `${buyable.name} — ${customer.business || customer.name}`,
            127,
          ),
          amount: {
            currency_code: currency,
            value: itemTotal.value,
            breakdown: {
              item_total: itemTotal,
            },
          },
          items,
        },
      ],
      payer: {
        email_address: customer.email,
        name: splitName(customer.name),
      },
      application_context: {
        brand_name: "Nacho Tsvetkov",
        // Buyer pays without a PayPal-side shipping prompt — these are
        // digital services. (Default flow shows shipping address fields
        // for physical goods.)
        shipping_preference: "NO_SHIPPING",
        user_action: "PAY_NOW",
        return_url: returnUrl,
        cancel_url: cancelUrl,
      },
    },
  });
}

// ----------------------------------------------------------------------
// captureOrder
// ----------------------------------------------------------------------

/**
 * Capture an approved order. Called from the API route that backs the
 * PayPal Smart Buttons `onApprove` handler. Returns the full captured
 * order so the caller can reconcile totals + log the capture id.
 */
export async function captureOrder(orderId: string): Promise<PayPalCapturedOrder> {
  return paypalFetch<PayPalCapturedOrder>(
    `/v2/checkout/orders/${orderId}/capture`,
    { method: "POST", requestId: `capture:${orderId}` },
  );
}

/**
 * Inspect a captured order against what we expected. Returns
 * `{ ok: true }` if the captured total matches the expected total (in
 * the same currency). `{ ok: false, reason }` otherwise — the caller
 * should refund or flag for manual review. We never fail the user-
 * facing flow here, but we want the discrepancy in our logs.
 */
export function verifyCapture(args: {
  capture: PayPalCapturedOrder;
  expectedTotalEur: number;
  currency: Currency;
}): { ok: true } | { ok: false; reason: string } {
  const { capture, expectedTotalEur, currency } = args;
  const unit = capture.purchase_units?.[0];
  if (!unit) return { ok: false, reason: "no purchase_units" };
  if (unit.amount.currency_code !== currency) {
    return {
      ok: false,
      reason: `currency mismatch: ${unit.amount.currency_code} vs ${currency}`,
    };
  }
  const expected = Number.parseFloat(toPayPalAmountValue(expectedTotalEur, currency));
  const actual = fromPayPalAmount(unit.amount.value);
  // Allow a 1-cent tolerance for floating-point edge cases.
  if (Math.abs(actual - expected) > 0.01) {
    return {
      ok: false,
      reason: `amount mismatch: paid ${actual} vs expected ${expected}`,
    };
  }
  return { ok: true };
}

// ----------------------------------------------------------------------
// Local helpers
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
