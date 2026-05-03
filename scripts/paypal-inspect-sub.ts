// One-shot inspector. Usage:
//   npx tsx --env-file=.env.local scripts/paypal-inspect-sub.ts I-XXXXXXXX
//
// Prints PayPal's view of a subscription so we can verify the override
// landed correctly:
//   - plan_overridden:    must be true when we send a `plan` block
//   - setup_fee:          should equal (oneTimeEur − retainerEur + upsells)
//                         for setup+retainer bundles; just upsells for
//                         pure-monthly services
//   - recurring:          retainerEur (the parent plan's price)
//   - day-1 charge:       setup_fee + first recurring cycle =
//                         bundle's advertised one-time price + upsells

import { paypalFetch } from "../lib/paypal/client";

const id = process.argv[2];
if (!id) {
  console.error("Usage: paypal-inspect-sub.ts <subscription-id>");
  process.exit(1);
}

(async () => {
  const sub = await paypalFetch<{
    id: string;
    status: string;
    plan_id: string;
    plan_overridden?: boolean;
    start_time?: string;
    billing_info?: {
      next_billing_time?: string;
      cycle_executions?: ReadonlyArray<{
        tenure_type?: string;
        sequence?: number;
        cycles_completed?: number;
        cycles_remaining?: number;
      }>;
    };
    plan?: {
      payment_preferences?: {
        setup_fee?: { value?: string; currency_code?: string };
      };
      billing_cycles?: ReadonlyArray<{
        tenure_type?: string;
        sequence?: number;
        total_cycles?: number;
        pricing_scheme?: { fixed_price?: { value?: string; currency_code?: string } };
      }>;
    };
  }>(`/v1/billing/subscriptions/${id}?fields=plan_overrides,plan`);

  const fee = sub.plan?.payment_preferences?.setup_fee;
  const recurringCycle = sub.plan?.billing_cycles?.find(
    (c) => c.tenure_type === "REGULAR",
  );
  const recurring = recurringCycle?.pricing_scheme?.fixed_price;

  console.log(`id:                  ${sub.id}`);
  console.log(`status:              ${sub.status}`);
  console.log(`plan_id:             ${sub.plan_id}`);
  console.log(`plan_overridden:     ${sub.plan_overridden}`);
  console.log(`start_time:          ${sub.start_time ?? "(now)"}`);
  console.log(
    `next_billing_time:   ${sub.billing_info?.next_billing_time ?? "(none)"}`,
  );
  console.log(`setup_fee:           ${JSON.stringify(fee ?? null)}`);
  console.log(`recurring:           ${JSON.stringify(recurring ?? null)}`);

  // PayPal collects (setup_fee + first recurring cycle) on day-1.
  // For setup+retainer bundles, the setup_fee is intentionally
  // reduced by retainerEur so this sum equals the bundle's
  // advertised one-time price. For pure-monthly services, setup_fee
  // is just upsells (or 0).
  if (fee && recurring) {
    const day1 = (
      Number(fee.value ?? 0) + Number(recurring.value ?? 0)
    ).toFixed(2);
    console.log(
      `\nday-1 charge:        ${day1} ${fee.currency_code} (setup_fee + first recurring cycle)`,
    );
    console.log(
      `month-2 onward:      ${recurring.value} ${recurring.currency_code}/mo (recurring)`,
    );
  }
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
