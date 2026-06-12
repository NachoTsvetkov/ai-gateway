import "./load-env";

const API_BASE = (process.env.DESKTOP_API_BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const SECRET = process.env.DESKTOP_SYNC_SECRET || "";

type ReportResponse = {
  success?: boolean;
  reportId?: string;
  surveyId?: string;
  subject?: string;
  status?: string;
  contentFormat?: string;
  toEmail?: string;
  html?: string;
  bodyPreview?: string;
  error?: { code?: string; message?: string };
};

async function fetchReport(label: string, qs: string, withAuth = true): Promise<boolean> {
  const url = `${API_BASE}/api/desktop/generate-report?${qs}`;
  const res = await fetch(url, withAuth ? { headers: { "X-Desktop-Sync-Secret": SECRET } } : {});
  const data = (await res.json()) as ReportResponse;

  console.log(`\n--- ${label} ---`);
  console.log("URL:", url);
  console.log("HTTP:", res.status);

  if (data.success) {
    console.log("reportId:", data.reportId);
    console.log("surveyId:", data.surveyId);
    console.log("subject:", data.subject);
    console.log("status:", data.status);
    console.log("contentFormat:", data.contentFormat);
    console.log("toEmail:", data.toEmail);
    console.log("html length:", data.html?.length ?? 0);
    console.log("bodyPreview:", `${(data.bodyPreview ?? "").slice(0, 100)}…`);
    console.log("html snippet:", `${(data.html ?? "").slice(0, 80)}…`);
    return true;
  }

  console.log("error:", data.error?.code, "-", data.error?.message);
  return false;
}

async function main() {
  if (!SECRET) {
    console.error("DESKTOP_SYNC_SECRET missing in .env.local");
    process.exit(1);
  }

  const surveyIdArg = process.argv.find((a) => a.startsWith("--survey="))?.split("=")[1];
  const reportIdArg = process.argv.find((a) => a.startsWith("--report="))?.split("=")[1];
  const useTest = process.argv.includes("--use-test");

  let surveyId = surveyIdArg;
  let reportId = reportIdArg;

  if (!surveyId && !reportId) {
    const listRes = await fetch(`${API_BASE}/api/desktop-data?type=surveys&limit=5`, {
      headers: { "X-Desktop-Sync-Secret": SECRET },
    });
    if (!listRes.ok) {
      console.error("Failed to list surveys:", listRes.status, await listRes.text());
      process.exit(1);
    }
    const list = (await listRes.json()) as { items: { id: string }[] };
    surveyId = list.items[0]?.id;
    if (!surveyId) {
      console.error("No surveys found");
      process.exit(1);
    }
    reportId = `rpt_${surveyId}`;
    console.log(`Auto-picked survey ${surveyId} → report ${reportId}`);
  }

  const testFlag = useTest ? "true" : "false";

  const byReportId =
    reportId &&
    (await fetchReport("GET by reportId", `reportId=${encodeURIComponent(reportId)}&test=${testFlag}`));
  const bySurveyId =
    surveyId &&
    (await fetchReport("GET by surveyId", `surveyId=${encodeURIComponent(surveyId)}&test=${testFlag}`));
  const noAuth = await fetchReport(
    "GET without auth (expect 401)",
    reportId ? `reportId=${encodeURIComponent(reportId)}&test=${testFlag}` : `surveyId=${encodeURIComponent(surveyId!)}&test=${testFlag}`,
    false,
  );
  const badRequest = await fetchReport("GET missing params (expect 400)", `test=${testFlag}`, true);

  console.log("\n=== Summary ===");
  console.log("GET by reportId:", byReportId ? "PASS" : "FAIL");
  console.log("GET by surveyId:", bySurveyId ? "PASS" : "FAIL");
  console.log("Unauthorized blocked:", !noAuth ? "PASS" : "FAIL");
  console.log("Bad request blocked:", !badRequest ? "PASS" : "FAIL");

  const ok = !!byReportId && !!bySurveyId && !noAuth && !badRequest;
  process.exit(ok ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
