import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

let adminApp: App | undefined;

function resolveServiceAccount(): Record<string, unknown> | null {
  const jsonEnv = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (jsonEnv) {
    try {
      return JSON.parse(jsonEnv) as Record<string, unknown>;
    } catch {
      console.error('[firebase-admin] FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON');
    }
  }

  const filePath =
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
    path.resolve(
      process.cwd(),
      '../../tools/GrokFirebaseReportMonitor/firebase-service-account.json',
    );

  if (filePath && fs.existsSync(filePath)) {
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf8')) as Record<string, unknown>;
    } catch {
      console.error('[firebase-admin] Failed to parse service account at', filePath);
    }
  }

  return null;
}

/** Firestore Admin instance (bypasses security rules). Returns null if no credentials configured. */
export function getAdminFirestore(): Firestore | null {
  if (getApps().length > 0) return getFirestore();

  const sa = resolveServiceAccount();
  if (sa) {
    adminApp = initializeApp({
      credential: cert(sa),
      projectId: (sa.project_id as string) || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
    return getFirestore(adminApp);
  }

  return null;
}
