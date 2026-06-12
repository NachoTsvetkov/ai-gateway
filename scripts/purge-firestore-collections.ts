/**
 * Purge all Firestore documents in known client-journey collections (prod + test + legacy).
 *
 * Requires admin credentials via one of:
 *   - FIREBASE_SERVICE_ACCOUNT_PATH env var (path to service account JSON)
 *   - Default desktop app path: ../../tools/GrokFirebaseReportMonitor/firebase-service-account.json
 *   - GOOGLE_APPLICATION_CREDENTIALS env var
 *
 * Run: npx tsx scripts/purge-firestore-collections.ts
 *      npx tsx scripts/purge-firestore-collections.ts --dry-run
 */

import "./load-env";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const COLLECTIONS = [
  "survey_responses",
  "survey_responses_test",
  "marketing_emails",
  "marketing_emails_test",
  "orders",
  "orders_test",
  "contacts",
  "contacts_test",
  "reports",
  "reports_test",
  "meetings",
  "meetings_test",
  "proposals",
  "proposals_test",
  "projects",
  "projects_test",
  "activities",
  "activities_test",
  // legacy chaos phase names
  "chaos_survey_responses",
  "chaos_survey_responses_test",
];

const dryRun = process.argv.includes("--dry-run");

function resolveServiceAccountPath(): string | null {
  const envPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (envPath && fs.existsSync(envPath)) return envPath;

  const gac = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (gac && fs.existsSync(gac)) return gac;

  const defaultPath = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../../../tools/GrokFirebaseReportMonitor/firebase-service-account.json",
  );
  if (fs.existsSync(defaultPath)) return defaultPath;

  return null;
}

async function main() {
  const saPath = resolveServiceAccountPath();
  if (!saPath) {
    console.error(
      "❌ No service account found. Set FIREBASE_SERVICE_ACCOUNT_PATH or place firebase-service-account.json in tools/GrokFirebaseReportMonitor/",
    );
    process.exit(1);
  }

  console.log(`Using service account: ${saPath}`);
  if (dryRun) console.log("DRY RUN — no deletes will be performed.\n");

  const { initializeApp, cert, getApps } = await import("firebase-admin/app");
  const { getFirestore } = await import("firebase-admin/firestore");

  if (getApps().length === 0) {
    initializeApp({ credential: cert(saPath) });
  }

  const db = getFirestore();
  let totalDeleted = 0;

  for (const collName of COLLECTIONS) {
    try {
      const snap = await db.collection(collName).limit(500).get();
      if (snap.empty) {
        console.log(`  ${collName}: (empty)`);
        continue;
      }

      console.log(`  ${collName}: ${snap.size} doc(s)${snap.size >= 500 ? " (first batch)" : ""}`);

      if (!dryRun) {
        const batch = db.batch();
        snap.docs.forEach((d) => batch.delete(d.ref));
        await batch.commit();
        totalDeleted += snap.size;

        // Recurse if we hit the batch limit (more docs remain)
        if (snap.size >= 500) {
          let more = true;
          while (more) {
            const next = await db.collection(collName).limit(500).get();
            if (next.empty) {
              more = false;
              break;
            }
            const b2 = db.batch();
            next.docs.forEach((d) => b2.delete(d.ref));
            await b2.commit();
            totalDeleted += next.size;
            console.log(`    ... deleted ${next.size} more from ${collName}`);
            if (next.size < 500) more = false;
          }
        }
      }
    } catch (err: any) {
      console.warn(`  ${collName}: skip (${err?.message || err})`);
    }
  }

  if (dryRun) {
    console.log("\nDry run complete. Re-run without --dry-run to delete.");
  } else {
    console.log(`\n✅ Purge complete. Deleted ~${totalDeleted} document(s).`);
  }
}

main().catch((e) => {
  console.error("Purge failed:", e);
  process.exit(1);
});
