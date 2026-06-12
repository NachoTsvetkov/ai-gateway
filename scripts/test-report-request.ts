import "./load-env";
import {
  saveReportRequestResponse,
  getRecentReportRequests,
} from "../lib/surveys";

const API_BASE = process.env.API_BASE || "http://127.0.0.1:3000";

// Run with: npx tsx scripts/test-report-request.ts
// Writes ONLY to survey_responses_test (?test=true). Prod forms use no param → survey_responses.

async function test() {
  console.log(
    "Submitting test data to TEST collection (survey_responses_test) via ?test=true...",
  );

  const testData = {
    source: "test-local",
    business_type: "Test Fitness Studio",
    pain: "Missed leads after hours and manual follow up taking too much time",
    desired_results:
      "More bookings without hiring staff, time back for coaching",
    tried_so_far: "Tried basic booking software and manual follow-ups",
    budget: "$1,500–$2,500",
    interest: 9,
    email: `test-${Date.now()}@example.com`,
    additional_details:
      "This is a test submission from the integration script. Safe to delete.",
    page_url: "http://localhost:3000/test",
  };

  const timeoutMs = 15000;

  try {
    const savePromise = (async () => {
      const id = await saveReportRequestResponse(testData, true);
      console.log("✅ Direct lib write to test collection. Document ID:", id);

      const recent = await getRecentReportRequests(true, 3);
      console.log("✅ Direct lib read-back from survey_responses_test:");
      console.dir(recent, { depth: 2 });
      return id;
    })();

    await Promise.race([
      savePromise,
      new Promise((_, reject) =>
        setTimeout(
          () =>
            reject(
              new Error(
                `Timeout after ${timeoutMs}ms — check Firestore rules / DB setup`,
              ),
            ),
          timeoutMs,
        ),
      ),
    ]);

    console.log("\n🎉 Direct lib submit + retrieve PASSED (test collection).");

    console.log("\nTesting HTTP API /api/report-request?test=true ...");
    const postRes = await fetch(`${API_BASE}/api/report-request?test=true`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...testData,
        email: `api-test-${Date.now()}@example.com`,
      }),
    });
    if (!postRes.ok) {
      const e = await postRes.text();
      throw new Error(`API POST failed: ${postRes.status} ${e}`);
    }
    const postJson = await postRes.json();
    console.log("✅ API POST success:", postJson);

    const getRes = await fetch(`${API_BASE}/api/report-request?test=true`);
    const getJson = await getRes.json();
    console.log("✅ API GET recent (test):", getJson);
    console.log("🎉 API roundtrip (submit + retrieve) verified.");
  } catch (e) {
    console.error("❌ Error during submit or retrieve test:", e);
    console.log("\nFix: npm run firestore:setup  (creates DB + deploys rules)");
    console.log(
      "Live prod forms: no ?test param → survey_responses. Dev/test: ?test=true on URL.",
    );
    process.exit(1);
  }
}

test();
