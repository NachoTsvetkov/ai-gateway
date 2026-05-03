// POST /api/paypal/create-order
//
// Called from the Smart Buttons `createOrder` callback on the client.
// We rebuild the buyable + upsells from the URL search params SERVER-
// side (we never trust client-supplied totals) and forward to PayPal,
// returning the order id the SDK uses to drive the popup.
//
// Customer details (name, email, business, phone, notes) come from the
// checkout form. They're embedded in the PayPal `custom_id` so they
// stick to the transaction record + emailed to Nacho on capture.

import { NextResponse } from "next/server";
import { resolveBuyableFromSearchParams } from "lib/buyable";
import { resolveLocalizedUpsells } from "lib/bundles-data";
import { detectCurrency } from "lib/currency.server";
import { detectLocale } from "lib/i18n/locale.server";
import { createOrder } from "lib/paypal/orders";
import type { CheckoutCustomer } from "lib/paypal/orders";
import { PayPalApiError } from "lib/paypal/client";
import { getPublicOrigin } from "lib/paypal/origin";

type CreateOrderBody = {
  searchParams: {
    bundle?: string;
    service?: string;
    tier?: string;
    upsells?: string;
  };
  customer: CheckoutCustomer;
};

function isValidBody(x: unknown): x is CreateOrderBody {
  if (!x || typeof x !== "object") return false;
  const o = x as Partial<CreateOrderBody>;
  if (!o.searchParams || typeof o.searchParams !== "object") return false;
  if (!o.customer || typeof o.customer !== "object") return false;
  const c = o.customer as Partial<CheckoutCustomer>;
  return (
    typeof c.name === "string" &&
    typeof c.email === "string" &&
    typeof c.business === "string"
  );
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  if (!isValidBody(body)) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const [currency, locale] = await Promise.all([
    detectCurrency(),
    detectLocale(),
  ]);

  const buyable = resolveBuyableFromSearchParams(body.searchParams, locale);
  if (!buyable) {
    return NextResponse.json({ error: "unknown_buyable" }, { status: 400 });
  }
  if (buyable.retainerEur !== undefined && buyable.retainerEur > 0) {
    // The frontend should call /api/paypal/create-subscription instead.
    // Returning 400 lets the client fall through to the right handler
    // rather than silently capturing a single one-time payment for
    // what should have been a recurring subscription.
    return NextResponse.json(
      { error: "buyable_requires_subscription" },
      { status: 400 },
    );
  }

  const upsells = resolveLocalizedUpsells(body.searchParams.upsells, locale);

  // Use the public-facing origin (honours X-Forwarded-Host so ngrok /
  // tunnels / prod load balancers all hand PayPal a URL the buyer's
  // browser can actually return to). Pre-populate `?type=…&ref=…` so
  // PayPal's hosted-approval redirect lands on a fully rendered
  // confirmation; PayPal appends `?token=…&PayerID=…` after these.
  const origin = getPublicOrigin(req);
  const successUrl = new URL(`${origin}/checkout/success`);
  successUrl.searchParams.set("type", "order");
  successUrl.searchParams.set("ref", buyable.reference);
  const returnUrl = successUrl.toString();
  const cancelUrl = `${origin}${buyable.detailsUrl}`;

  try {
    const order = await createOrder({
      buyable,
      upsells,
      currency,
      customer: body.customer,
      returnUrl,
      cancelUrl,
    });
    return NextResponse.json({ id: order.id });
  } catch (err) {
    return errorResponse(err, "create_order_failed");
  }
}

function errorResponse(err: unknown, fallback: string): NextResponse {
  if (err instanceof PayPalApiError) {
    // 4xx from PayPal is usually a config error (bad creds, missing
    // plan); log the body, return a redacted message to the client.
    console.error(
      `[paypal] ${err.method} ${err.path} → ${err.status}`,
      err.body,
    );
    return NextResponse.json(
      { error: fallback, status: err.status },
      { status: 502 },
    );
  }
  console.error("[paypal] unexpected error:", err);
  return NextResponse.json({ error: fallback }, { status: 500 });
}
