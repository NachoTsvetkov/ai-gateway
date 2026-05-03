// POST /api/paypal/create-subscription
//
// Mirrors /api/paypal/create-order but uses the Subscriptions API for
// buyables that include a recurring retainer. PayPal charges
// (setup_fee + first_billing) on day 1 and the recurring amount
// monthly thereafter — buyer signs once.
//
// The plan id is looked up server-side via the runtime plan-store
// (filled by `npm run paypal:setup`). If the plan is missing the
// endpoint returns 503 + a developer-facing error message; the client
// falls back to the mailto path so a misconfig doesn't strand a buyer.

import { NextResponse } from "next/server";
import { resolveBuyableFromSearchParams } from "lib/buyable";
import { resolveLocalizedUpsells } from "lib/bundles-data";
import { detectCurrency } from "lib/currency.server";
import { detectLocale } from "lib/i18n/locale.server";
import { createSubscription } from "lib/paypal/subscriptions";
import type { CheckoutCustomer } from "lib/paypal/orders";
import { PayPalApiError } from "lib/paypal/client";
import { getPublicOrigin } from "lib/paypal/origin";

type CreateSubscriptionBody = {
  searchParams: {
    bundle?: string;
    service?: string;
    tier?: string;
    upsells?: string;
  };
  customer: CheckoutCustomer;
};

function isValidBody(x: unknown): x is CreateSubscriptionBody {
  if (!x || typeof x !== "object") return false;
  const o = x as Partial<CreateSubscriptionBody>;
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
  if (buyable.retainerEur === undefined || buyable.retainerEur <= 0) {
    return NextResponse.json(
      { error: "buyable_is_one_time" },
      { status: 400 },
    );
  }

  const upsells = resolveLocalizedUpsells(body.searchParams.upsells, locale);

  // Use the public-facing origin (honours X-Forwarded-Host so ngrok /
  // tunnels / prod load balancers all hand PayPal a URL the buyer's
  // browser can actually return to). Pre-populate `?type=…&ref=…` so
  // PayPal's hosted-approval redirect lands on a fully rendered
  // confirmation; PayPal appends `?subscription_id=…&ba_token=…`
  // after these.
  const origin = getPublicOrigin(req);
  const successUrl = new URL(`${origin}/checkout/success`);
  successUrl.searchParams.set("type", "subscription");
  successUrl.searchParams.set("ref", buyable.reference);
  const returnUrl = successUrl.toString();
  const cancelUrl = `${origin}${buyable.detailsUrl}`;

  try {
    const subscription = await createSubscription({
      buyable,
      upsells,
      currency,
      customer: body.customer,
      returnUrl,
      cancelUrl,
    });
    return NextResponse.json({ id: subscription.id });
  } catch (err) {
    if (
      err instanceof Error &&
      err.message.includes("No PayPal plan id")
    ) {
      // Distinct status so the client knows this is a config issue,
      // not a transient PayPal blip.
      console.error("[paypal] missing plan:", err.message);
      return NextResponse.json(
        { error: "plan_not_configured" },
        { status: 503 },
      );
    }
    return errorResponse(err, "create_subscription_failed");
  }
}

function errorResponse(err: unknown, fallback: string): NextResponse {
  if (err instanceof PayPalApiError) {
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
