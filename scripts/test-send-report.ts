import "./load-env";

const API_BASE = (process.env.DESKTOP_API_BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const SECRET = process.env.DESKTOP_SYNC_SECRET || "";

async function main() {
  if (!SECRET) {
    console.error("DESKTOP_SYNC_SECRET missing in .env.local");
    process.exit(1);
  }

  const reportId =
    process.argv.find((a) => a.startsWith("--report="))?.split("=")[1] ??
    "rpt_nm8nX3DQSznU8B2XOr0Y";
  const surveyId =
    process.argv.find((a) => a.startsWith("--survey="))?.split("=")[1] ??
    "nm8nX3DQSznU8B2XOr0Y";
  const useTest = process.argv.includes("--use-test");
  const forceSend = process.argv.includes("--force");
  const dryRun = process.argv.includes("--dry-run");

  console.log(`\nSend-report test (${useTest ? "TEST" : "PROD"}) reportId=${reportId}\n`);

  if (!process.env.GMAIL_SMTP_USER || !process.env.GMAIL_SMTP_APP_PASSWORD) {
    console.error("Gmail not configured — set GMAIL_SMTP_USER and GMAIL_SMTP_APP_PASSWORD in .env.local");
    process.exit(1);
  }

  if (dryRun) {
    console.log("Dry run — skipping actual send. Gmail env present.");
    process.exit(0);
  }

  const res = await fetch(`${API_BASE}/api/desktop/send-report`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Desktop-Sync-Secret": SECRET,
    },
    body: JSON.stringify({
      reportId,
      surveyId,
      test: useTest,
      forceSend,
    }),
  });

  const body = await res.text();
  console.log(`HTTP ${res.status}`);
  try {
    console.log(JSON.stringify(JSON.parse(body), null, 2));
  } catch {
    console.log(body);
  }

  if (res.status === 422) {
    console.log(
      "\nTip: placeholder survey blocked. For local pipeline testing add to .env.local:\n  ALLOW_PLACEHOLDER_REPORT_SEND=true\nThen rerun with --force",
    );
  }

  process.exit(res.ok ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
