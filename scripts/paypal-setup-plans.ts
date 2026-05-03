// One-shot bootstrapper for PayPal Catalog Products + Billing Plans.
//
// Usage:
//   npm run paypal:setup            # uses PAYPAL_ENV from .env.local
//   PAYPAL_ENV=sandbox npm run paypal:setup
//   PAYPAL_ENV=live    npm run paypal:setup
//
// What it does:
//   1. Loads bundles + services from `lib/`.
//   2. Enumerates every unique (retainerEur, currency) pair that any
//      buyable will ever subscribe against. Today that's:
//        97 EUR/mo    (Scale-Up bundle, Maintenance service)
//        197 EUR/mo   (Enterprise bundle)
//        + matching USD plans (107, 217)
//   3. Creates ONE Catalog Product ("nacho-monthly-retainer") if it
//      doesn't exist.
//   4. Creates a Billing Plan per pair and writes the resulting plan
//      ids into `lib/paypal/plan-ids.<env>.json`.
//   5. Subsequent runs are idempotent: existing plans are detected
//      from the JSON file and skipped (PayPal doesn't expose a
//      "find plan by name" lookup, so we trust the file).
//
// Run this in BOTH sandbox and live before going to production.

import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
// We deliberately don't take a `dotenv` dep — `loadDotEnvLocal()` below
// is small enough to inline and means this script works standalone
// without polluting the runtime bundle.

import { BUNDLES } from "../lib/bundles-data";
import { services } from "../lib/services-data";
import {
  type CreatePlanArgs,
  createPlan,
  createProduct,
  getProduct,
  planKey,
} from "../lib/paypal/plans";
import { getPayPalEnv } from "../lib/paypal/client";
import type { Currency } from "../lib/currency";

// ---------------------------------------------------------------------
// Bare-minimum dotenv loader so the script works without an extra dep.
// ---------------------------------------------------------------------
function loadDotEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  if (!existsSync(path)) return;
  const text = readFileSync(path, "utf8");
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    const k = line.slice(0, eq).trim();
    let v = line.slice(eq + 1).trim();
    // Strip surrounding double or single quotes.
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (process.env[k] === undefined) process.env[k] = v;
  }
}

// ---------------------------------------------------------------------
// Plan enumeration
// ---------------------------------------------------------------------
//
// Both EUR and USD pricing share the same "marketing" amount derived
// from `EUR_TO_USD = 1.10`. We mirror the helper here directly to keep
// this script independent of the runtime client bundle.

const EUR_TO_USD = 1.1;

function eurEquivalentForUsdPlan(retainerEur: number): number {
  // Plan amount in USD = roundedEurX1.1, then DIVIDED back by 1.1 so
  // the lookup key in plan-ids.json stays denominated in EUR. This way
  // the runtime can do `getPlanId(retainerEur, currency)` without
  // knowing about USD-specific rounding.
  const usdAmount = Math.round(retainerEur * EUR_TO_USD);
  return usdAmount;
}

type PlanRow = {
  retainerEur: number; // key into plan-ids.json
  currency: Currency;
  name: string;
};

function collectPlansToCreate(): PlanRow[] {
  const retainerEurs = new Set<number>();

  for (const b of BUNDLES) {
    if (b.retainerEur && b.retainerEur > 0) retainerEurs.add(b.retainerEur);
  }
  for (const s of services) {
    // monthly-only services + tiered-with-retainer + addon services
    // — pull every "retainer" candidate.
    switch (s.price.kind) {
      case "monthly":
        retainerEurs.add(s.price.eur);
        break;
      case "from":
      case "addon":
      case "tiered":
        // No retainer on these by default. If services-data ever grows
        // a retainer field on tiered/from-priced services, extend this
        // switch.
        break;
    }
  }

  const rows: PlanRow[] = [];
  for (const eur of [...retainerEurs].sort((a, b) => a - b)) {
    rows.push({
      retainerEur: eur,
      currency: "EUR",
      name: `Monthly retainer — €${eur}/mo`,
    });
    // USD plans use the rounded-USD amount baked into the plan price,
    // but the lookup key stays denominated in EUR (see plan-store.ts).
    const usd = eurEquivalentForUsdPlan(eur);
    rows.push({
      retainerEur: eur,
      currency: "USD",
      name: `Monthly retainer — $${usd}/mo`,
    });
  }
  return rows;
}

// ---------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------

async function main() {
  loadDotEnvLocal();

  if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_SECRET) {
    console.error(
      "PAYPAL_CLIENT_ID + PAYPAL_SECRET must be set in .env.local first.",
    );
    process.exit(1);
  }

  const env = getPayPalEnv();
  console.log(`PayPal plans bootstrap — env=${env}\n`);

  const planIdsFile = resolve(
    process.cwd(),
    `lib/paypal/plan-ids.${env}.json`,
  );
  let existing: Record<string, string> = {};
  if (existsSync(planIdsFile)) {
    try {
      existing = JSON.parse(readFileSync(planIdsFile, "utf8"));
    } catch {
      console.warn(`Couldn't parse ${planIdsFile}, starting fresh`);
    }
  }

  // Step 1: ensure the Product exists. We use a stable id so re-runs
  // are idempotent. Product ids must be 6-50 chars, alphanumeric +
  // dash, so we encode the env into the id.
  const productId = `NACHO-RETAINER-${env.toUpperCase()}`;
  let product = await getProduct(productId);
  if (!product) {
    console.log(`Creating Catalog Product ${productId}…`);
    product = await createProduct({
      id: productId,
      name: "Nacho Tsvetkov — Monthly retainer",
      description:
        "Recurring monthly retainer covering hosting, security updates, " +
        "minor content + design changes, priority support, and ongoing " +
        "improvements.",
    });
    console.log(`  → product.id=${product.id}\n`);
  } else {
    console.log(`Reusing Catalog Product ${product.id}\n`);
  }

  // Step 2: enumerate plans and create the missing ones.
  const rows = collectPlansToCreate();
  // We mutate `updated` in place inside the loop — the `PlanIdMap`
  // alias on the public type is read-only for callers, but inside this
  // build script we treat it as a plain mutable Record.
  const updated: Record<string, string> = { ...existing };
  let created = 0;

  for (const row of rows) {
    const key = planKey(row.retainerEur, row.currency);
    if (updated[key]) {
      console.log(`✓  ${key} already mapped to ${updated[key]} — skipping`);
      continue;
    }
    console.log(`→  Creating plan ${key} (${row.name})…`);
    const planArgs: CreatePlanArgs = {
      productId: product.id,
      name: row.name,
      description: `Recurring billing for ${row.name}.`,
      retainerEur: row.retainerEur,
      currency: row.currency,
    };
    const plan = await createPlan(planArgs);
    updated[key] = plan.id;
    created++;
    console.log(`   plan.id=${plan.id}`);
  }

  // Step 3: write back the updated map.
  mkdirSync(dirname(planIdsFile), { recursive: true });
  writeFileSync(
    planIdsFile,
    JSON.stringify(sortKeys(updated), null, 2) + "\n",
    "utf8",
  );
  console.log(
    `\nWrote ${Object.keys(updated).length} plan id(s) to ${planIdsFile}`,
  );
  console.log(`Created ${created} new plan(s) this run.`);
}

function sortKeys(obj: Record<string, string>): Record<string, string> {
  const sorted: Record<string, string> = {};
  for (const k of Object.keys(obj).sort()) sorted[k] = obj[k] as string;
  return sorted;
}

main().catch((err: unknown) => {
  console.error("\nPayPal plans bootstrap failed:");
  if (err instanceof Error) {
    console.error(err.message);
    if ("body" in err) console.error(JSON.stringify((err as { body: unknown }).body, null, 2));
  } else {
    console.error(err);
  }
  process.exit(1);
});
