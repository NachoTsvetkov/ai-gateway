// Runtime loader for the plan-id map written by `paypal-setup-plans.ts`.
//
// The map is environment-specific (sandbox vs live use different plan
// ids), so we read PAYPAL_ENV at import time and pull from the matching
// file. Both files live alongside this module so they ship as part of
// the build.
//
// If a plan id is missing, the caller throws with a clear instruction:
// "run npm run paypal:setup". This avoids silent fallback to the wrong
// plan or — worse — creating a runtime fallback plan that drifts.

import "server-only";
import { getPayPalEnv } from "./client";
import { planKey, type PlanIdMap } from "./plans";
import type { Currency } from "../currency";

// We import both JSON files statically so Webpack/Turbopack bundles
// them. Import-asserts on JSON aren't supported uniformly across all
// Node versions Next ships with, so we use the standard `with` syntax
// (Node 22+, what Next.js 15 ships with) — but to keep things simple,
// we just `require()` the JSON via dynamic require at first call. Both
// files start as `{}` and get filled by the setup script.

import sandboxPlans from "./plan-ids.sandbox.json";
import livePlans from "./plan-ids.live.json";

function getPlanMap(): PlanIdMap {
  return getPayPalEnv() === "live" ? (livePlans as PlanIdMap) : (sandboxPlans as PlanIdMap);
}

/**
 * Look up the plan id for a given recurring amount + currency.
 * Throws with a helpful message if missing — this is a developer
 * error, not a user-facing one (the Plan needs to exist before any
 * subscription can be created against it).
 */
export function getPlanId(retainerEur: number, currency: Currency): string {
  const map = getPlanMap();
  const key = planKey(retainerEur, currency);
  const id = map[key];
  if (!id) {
    throw new Error(
      `No PayPal plan id for ${key} in env=${getPayPalEnv()}. ` +
        `Run \`npm run paypal:setup\` to bootstrap missing plans.`,
    );
  }
  return id;
}

/**
 * Returns true if the plan-id map has at least one entry for the
 * current environment. Used by the checkout form to pre-flight check
 * whether subscriptions will work — if not, we hide the Smart Buttons
 * for buyables with a retainer and fall back to the mailto path.
 */
export function hasAnyPlans(): boolean {
  return Object.keys(getPlanMap()).length > 0;
}
