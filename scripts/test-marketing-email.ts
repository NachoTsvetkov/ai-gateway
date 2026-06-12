import "./load-env";
import { saveMarketingEmail } from "../lib/marketing-emails";

const API_BASE = process.env.API_BASE || "http://127.0.0.1:3000";

// Run with: npx tsx scripts/test-marketing-email.ts
// Writes ONLY to marketing_emails_test (?test=true).

async function test() {
  console.log(
    "Submitting test MARKETING EMAIL to TEST collection (marketing_emails_test) via ?test=true...",
  );

  const now = Date.now();
  const testData = {
    email: `e2e-test-${now}@example.com`,
    source: "e2e-verification-script",
    name: "E2E Test User",
    business: "Test Corp LLC",
    page_url: "http://localhost:3000/test-marketing",
  };

  try {
    console.log("\n1. Direct lib saveMarketingEmail(useTest=true)...");
    const id = await saveMarketingEmail(testData, true);
    console.log("✅ Direct lib (test) id:", id);

    console.log("\n2. API POST ?test=true...");
    const tPost = await fetch(`${API_BASE}/api/marketing-email?test=true`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...testData,
        email: `api-test-${now}@example.com`,
      }),
    });
    if (!tPost.ok) {
      throw new Error(`test POST failed: ${tPost.status} ${await tPost.text()}`);
    }
    console.log("✅ API POST (test):", await tPost.json());

    console.log("\n3. API GET ?test=true...");
    const gr = await fetch(`${API_BASE}/api/marketing-email?test=true`);
    console.log("✅ GET (test):", await gr.json());

    console.log(
      "\n🎉 Marketing email E2E PASSED (test only). Live forms → /api/marketing-email (prod).",
    );
  } catch (e) {
    console.error("❌ Error:", e);
    process.exit(1);
  }
}

test();
