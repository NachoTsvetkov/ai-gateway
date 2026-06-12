import "./load-env";

const API_BASE = (process.env.DESKTOP_API_BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const SECRET = process.env.DESKTOP_SYNC_SECRET || "";

type SurveyItem = { id: string; email: string; business_type: string; source: string };

async function main() {
  if (!SECRET) {
    console.error("❌ DESKTOP_SYNC_SECRET missing in .env.local");
    process.exit(1);
  }

  const useTest = process.argv.includes("--use-test");
  const surveyIdArg = process.argv.find((a) => a.startsWith("--survey="))?.split("=")[1];

  console.log(`\n🔍 Desktop report generation test (${useTest ? "TEST" : "PROD"} collections)\n`);

  let surveyId = surveyIdArg;
  if (!surveyId) {
    if (useTest) {
      console.error("❌ With --use-test, pass --survey=<id> (desktop-data lists PROD surveys only).");
      process.exit(1);
    }
    const listRes = await fetch(`${API_BASE}/api/desktop-data?type=surveys&limit=5`, {
      headers: { "X-Desktop-Sync-Secret": SECRET },
    });
    if (!listRes.ok) {
      console.error("❌ Failed to list surveys:", listRes.status, await listRes.text());
      process.exit(1);
    }
    const list = (await listRes.json()) as { items: SurveyItem[] };
    const pick = list.items.find((s) => s.email && s.business_type) ?? list.items[0];
    if (!pick?.id) {
      console.error("❌ No surveys found — submit one on the site first.");
      process.exit(1);
    }
    surveyId = pick.id;
    console.log(`Using survey ${surveyId} (${pick.email} / ${pick.business_type})`);
  }

  console.log("⏳ Generating report (may take 1–3 min)...");
  const genRes = await fetch(`${API_BASE}/api/desktop/generate-report`, {
    method: "POST",
    headers: {
      "X-Desktop-Sync-Secret": SECRET,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ surveyId, test: useTest }),
  });

  const genBody = await genRes.text();
  if (!genRes.ok) {
    console.error("❌ Generate failed:", genRes.status, genBody);
    process.exit(1);
  }

  const generated = JSON.parse(genBody) as {
    reportId: string;
    subject: string;
    headline?: string;
    html: string;
  };
  console.log("✅ Generated report:", generated.reportId);
  console.log("   Subject:", generated.subject);
  console.log("   HTML length:", generated.html.length);

  const getRes = await fetch(
    `${API_BASE}/api/desktop/generate-report?reportId=${generated.reportId}&test=${useTest}`,
    { headers: { "X-Desktop-Sync-Secret": SECRET } },
  );
  if (!getRes.ok) {
    console.error("❌ GET report failed:", getRes.status, await getRes.text());
    process.exit(1);
  }

  const fetched = (await getRes.json()) as { html: string; subject: string; bodyPreview: string };
  if (fetched.html.length < 100) {
    console.error("❌ Saved report HTML too short");
    process.exit(1);
  }
  console.log("✅ Read-back OK — HTML length:", fetched.html.length);
  console.log("   Preview:", fetched.bodyPreview?.slice(0, 120) + "…");
  console.log("\nAll checks passed.\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
