import "./load-env";
import { saveOrder, getRecentOrders } from "../lib/orders";

const API_BASE = process.env.API_BASE || "http://127.0.0.1:3000";

// Run with: npx tsx scripts/test-order.ts
// Writes ONLY to orders_test (?test=true). Live checkout uses no param → orders.

async function test() {
  console.log(
    "Submitting test ORDER to TEST collection (orders_test) via ?test=true...",
  );

  const now = Date.now();
  const testData = {
    customer: {
      name: "Test Buyer",
      business: "Acme Test GmbH",
      email: `order-test-${now}@example.com`,
      phone: "+49 123 456789",
      notes: "Integration test order — safe to delete.",
    },
    buyable: {
      kind: "bundle" as const,
      id: "startup",
      name: "Startup",
      oneTimeEur: 1490,
      retainerEur: 290,
      reference: "bundle:startup",
    },
    upsells: [{ id: "design-revisions", label: "+5 design revisions", eur: 290 }],
    totalEur: 1780,
    currency: "EUR" as const,
    locale: "en" as const,
    paypal: { kind: "order" as const, id: `TEST_ORDER_${now}` },
    status: "created" as const,
    pageUrl: "http://localhost:3000/checkout?bundle=startup",
  };

  try {
    console.log("\n1. Direct lib saveOrder(useTest=true)...");
    const directId = await saveOrder(testData, true);
    console.log("✅ Direct lib (test) doc id:", directId);

    const recent = await getRecentOrders(true, 3);
    console.log("✅ Direct lib read-back:", recent.length, "recent test orders");

    console.log("\n2. API POST ?test=true (created)...");
    const testPostRes = await fetch(`${API_BASE}/api/orders?test=true`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...testData,
        paypal: { kind: "order" as const, id: `TEST_ORDER_API_${now}` },
      }),
    });
    if (!testPostRes.ok) {
      throw new Error(`API POST (test) failed: ${testPostRes.status} ${await testPostRes.text()}`);
    }
    console.log("✅ API POST (test):", await testPostRes.json());

    console.log("\n3. API POST ?test=true (paid status)...");
    const paidRes = await fetch(`${API_BASE}/api/orders?test=true`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...testData,
        status: "paid" as const,
        paypal: { kind: "order" as const, id: `TEST_PAID_${now}` },
      }),
    });
    if (!paidRes.ok) {
      throw new Error(`API paid (test) failed: ${paidRes.status} ${await paidRes.text()}`);
    }
    console.log("✅ API paid (test):", await paidRes.json());

    console.log("\n4. API GET ?test=true...");
    const getRes = await fetch(`${API_BASE}/api/orders?test=true`);
    const getJson = await getRes.json();
    console.log("✅ API GET (test):", getJson);

    console.log(
      "\n🎉 Order E2E PASSED (test collection only). Live checkout → /api/orders (prod).",
    );
  } catch (e) {
    console.error("❌ Error during E2E test:", e);
    console.log("\nEnsure dev server is running and Firebase rules are deployed.");
    process.exit(1);
  }
}

test();
