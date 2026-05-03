// Standalone diagnostic — proves the setup_fee + recurring breakdown
// we send for a subscription matches what PayPal stores against the
// subscription record.
//
// Run via:
//   npx tsx --env-file=.env.local scripts/paypal-verify-setup-fee.ts <bundleId>
// e.g.
//   npx tsx --env-file=.env.local scripts/paypal-verify-setup-fee.ts enterprise
//
// What it does:
//   1. Builds the same payload our /api/paypal/create-subscription
//      route would send for the requested bundle in USD (matching
//      what the live UI is doing right now).
//   2. POSTs it to PayPal's Subscriptions API on whichever env
//      .env.local points at.
//   3. Reads the subscription back via GET /v1/billing/subscriptions/{id}
//      and prints the plan_overrides PayPal echoed.
//   4. Cancels the subscription so nothing leaks (the buyer never
//      approved, so no charge was made — this just removes the
//      APPROVAL_PENDING record).
//
// We deliberately don't import lib/paypal/subscriptions.ts here — it
// carries `server-only`, which throws under tsx. Instead we inline the
// payload using the same source-of-truth modules (buyable / bundles-data
// / money) and call paypalFetch directly. That way the diagnostic uses
// EXACTLY the EUR→USD conversion + setup_fee math that the production
// route does.

if (!process.env.PAYPAL_CLIENT_ID) {
  console.error(
    "PAYPAL_CLIENT_ID is not set. Run with:\n" +
      "  npx tsx --env-file=.env.local scripts/paypal-verify-setup-fee.ts enterprise",
  );
  process.exit(1);
}

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { getLocalizedBundles } from "../lib/bundles-data";
import { resolveBuyableFromSearchParams } from "../lib/buyable";
import { toPayPalAmountValue } from "../lib/paypal/money";
import { planKey } from "../lib/paypal/plans";
import { paypalFetch, getPayPalEnv } from "../lib/paypal/client";
import { EUR_TO_USD } from "../lib/currency";
import type { Currency } from "../lib/currency";

type PayPalSubscription = {
  id: string;
  status: string;
  plan_id: string;
  plan_overridden?: boolean;
  // PayPal echoes the *effective* plan (parent plan merged with our
  // override) under `plan` on a fields=plan,plan_overrides GET. We
  // verify against this rather than against an `override` echo.
  plan?: {
    payment_preferences?: {
      setup_fee?: { value?: string; currency_code?: string };
    };
  };
};

function loadPlanId(retainerEur: number, currency: Currency): string {
  const env = getPayPalEnv();
  const file = resolve(
    process.cwd(),
    `lib/paypal/plan-ids.${env}.json`,
  );
  const raw = readFileSync(file, "utf8");
  const map = JSON.parse(raw) as Record<string, string>;
  const key = planKey(retainerEur, currency);
  const id = map[key];
  if (!id) {
    throw new Error(
      `No PayPal plan id for ${key} in env=${env}. Run \`npm run paypal:setup\`.`,
    );
  }
  return id;
}

async function main() {
  const bundleId = process.argv[2] ?? "enterprise";
  const currency: Currency = "USD";

  const bundle = getLocalizedBundles("en").find((b) => b.id === bundleId);
  if (!bundle) throw new Error(`Unknown bundle: ${bundleId}`);

  console.log(`\n=== Source bundle (${getPayPalEnv()} env) ===`);
  console.log(`  id:          ${bundle.id}`);
  console.log(`  oneTimeEur:  €${bundle.oneTimeEur}`);
  console.log(`  retainerEur: €${bundle.retainerEur ?? 0}/mo`);
  console.log(`  EUR→USD:     fixed ${EUR_TO_USD} from lib/currency`);

  const buyable = resolveBuyableFromSearchParams({ bundle: bundleId }, "en");
  if (!buyable) throw new Error("Failed to resolve buyable");
  if (!buyable.retainerEur) {
    throw new Error(
      "Bundle has no retainer — would use orders.ts, not subscriptions.ts.",
    );
  }

  // Mirror the math in lib/paypal/subscriptions.ts exactly.
  const isPureMonthly = buyable.oneTimeEur === buyable.retainerEur;
  const setupFeeEur = isPureMonthly ? 0 : buyable.oneTimeEur;
  const planId = loadPlanId(buyable.retainerEur, currency);

  const expectedSetupFeeUsd = toPayPalAmountValue(setupFeeEur, currency);
  const expectedRecurringUsd = toPayPalAmountValue(
    buyable.retainerEur,
    currency,
  );
  const expectedDay1Usd = (
    Number(expectedSetupFeeUsd) + Number(expectedRecurringUsd)
  ).toFixed(2);

  console.log(`\n=== What we EXPECT to send to PayPal ===`);
  console.log(`  plan_id:     ${planId}`);
  console.log(`  setup_fee:   $${expectedSetupFeeUsd} USD`);
  console.log(`  recurring:   $${expectedRecurringUsd} USD / month`);
  console.log(
    `  day-1:       $${expectedDay1Usd} USD (setup + first month)`,
  );

  console.log(`\n=== POST /v1/billing/subscriptions ===`);
  // Use the `plan` inline-override field. The field name `plan_overrides`
  // we used previously is NOT in PayPal's documented schema; PayPal
  // silently ignored it (response showed `plan_overridden: false`).
  // The current spec accepts `plan: { payment_preferences: {...} }`.
  const sub = await paypalFetch<PayPalSubscription>(
    "/v1/billing/subscriptions",
    {
      method: "POST",
      requestId: `diag:${buyable.reference}:${Date.now()}`,
      body: {
        plan_id: planId,
        custom_id: `diag|ref=${buyable.reference}`,
        plan:
          setupFeeEur > 0
            ? {
                payment_preferences: {
                  setup_fee: {
                    value: expectedSetupFeeUsd,
                    currency_code: currency,
                  },
                  setup_fee_failure_action: "CANCEL",
                  auto_bill_outstanding: true,
                  payment_failure_threshold: 2,
                },
              }
            : undefined,
        subscriber: {
          email_address: "verify+paypal@example.com",
          name: { given_name: "SetupFee", surname: "Verifier" },
        },
        application_context: {
          brand_name: "Nacho Tsvetkov",
          shipping_preference: "NO_SHIPPING",
          user_action: "SUBSCRIBE_NOW",
          payment_method: {
            payer_selected: "PAYPAL",
            payee_preferred: "IMMEDIATE_PAYMENT_REQUIRED",
          },
          return_url: "https://example.com/checkout/success",
          cancel_url: "https://example.com/checkout",
        },
      },
    },
  );

  console.log(`  → id:     ${sub.id}`);
  console.log(`  → status: ${sub.status}`);

  // PayPal's GET subscription suppresses plan_overrides + plan +
  // subscriber from the default response — must be explicitly requested.
  console.log(`\n=== GET /v1/billing/subscriptions/${sub.id}?fields=plan_overrides,plan ===`);
  const stored = await paypalFetch<PayPalSubscription>(
    `/v1/billing/subscriptions/${sub.id}?fields=plan_overrides,plan`,
  );
  // After a successful inline-plan override, PayPal returns the
  // EFFECTIVE plan under `plan` and sets `plan_overridden: true`.
  const fee = stored.plan?.payment_preferences?.setup_fee;
  console.log(`  plan_id:           ${stored.plan_id}`);
  console.log(`  plan_overridden:   ${stored.plan_overridden}`);
  console.log(`  effective setup_fee: ${JSON.stringify(fee ?? null)}`);

  // We do NOT call /cancel here — APPROVAL_PENDING subscriptions can't
  // be cancelled (the cancel verb only works on ACTIVE/SUSPENDED).
  // PayPal auto-expires unapproved subscriptions after ~3 days, and
  // since the buyer never sees the approval URL, no charge can occur.
  console.log(`\n=== Skipping cancel — APPROVAL_PENDING auto-expires ===`);

  console.log(`\n=== Verdict ===`);
  // PayPal returns the value as an unpadded decimal ("1068.0" rather
  // than "1068.00"); compare numerically so trailing-zero differences
  // don't trip the check.
  const valuesMatch =
    fee?.value !== undefined &&
    Number(fee.value).toFixed(2) === expectedSetupFeeUsd;
  if (
    stored.plan_overridden === true &&
    valuesMatch &&
    fee?.currency_code === currency
  ) {
    console.log(`  ✓ setup_fee correctly stored: $${fee.value} ${fee.currency_code}`);
    console.log(
      `  ✓ Day-1 charge will be $${expectedDay1Usd} ` +
        `($${expectedSetupFeeUsd} setup + $${expectedRecurringUsd} first month)`,
    );
    console.log(`  ✓ Recurring after that: $${expectedRecurringUsd}/mo`);
    console.log(``);
    console.log(`  PayPal's checkout cart shows only the recurring price`);
    console.log(`  ($${expectedRecurringUsd}) as the headline. The setup_fee`);
    console.log(`  surfaces in the cart's expandable breakdown (chevron next`);
    console.log(`  to the price) and on PayPal's review screen before the`);
    console.log(`  buyer commits.`);
  } else {
    console.log(`  ✗ setup_fee MISMATCH:`);
    console.log(`    expected: ${expectedSetupFeeUsd} USD`);
    console.log(`    stored:   ${JSON.stringify(fee ?? null)}`);
  }
}

main().catch((err: unknown) => {
  if (err && typeof err === "object" && "body" in err) {
    console.error(err);
    console.error("PayPal error body:", (err as { body: unknown }).body);
  } else {
    console.error(err);
  }
  process.exit(1);
});
