import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Firebase config from environment variables (public keys are safe to expose client-side)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase only once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Export Firestore instance for survey data storage.
// IMPORTANT: Before any writes can succeed you must (in Firebase Console):
// 1. Create a Firestore database (Native mode) for the project.
// 2. Deploy/paste rules from the firestore.rules file in repo root.
// See scripts/test-report-request.ts for verification.
export const db = getFirestore(app);

// Collection names (kept for data continuity with any existing responses).
// Prod (default on live report request pages): survey_responses
// Test/dev: survey_responses_test (activated via ?test=true on forms or useTestCollection=true in scripts)
export const SURVEYS_COLLECTION = "survey_responses";
export const TEST_SURVEYS_COLLECTION = "survey_responses_test";

// Order / purchase records from the bundle & service checkout flow (PayPal).
// Persisted on successful payment capture/approval so the site owner has
// a local record of real paid orders with full customer + buyable details.
export const ORDERS_COLLECTION = "orders";
export const TEST_ORDERS_COLLECTION = "orders_test";

// Marketing email subscribers / contacts (for newsletters, automated campaigns,
// cart recovery, lead nurturing, etc.).
// Use the test collection during development (?test=true) or in verification scripts.
export const MARKETING_EMAILS_COLLECTION = "marketing_emails";
export const TEST_MARKETING_EMAILS_COLLECTION = "marketing_emails_test";

// Client journey CRM collections (per Client_Journey_and_System_Flows.md)
export const CONTACTS_COLLECTION = "contacts";
export const TEST_CONTACTS_COLLECTION = "contacts_test";

export const REPORTS_COLLECTION = "reports";
export const TEST_REPORTS_COLLECTION = "reports_test";

export const MEETINGS_COLLECTION = "meetings";
export const TEST_MEETINGS_COLLECTION = "meetings_test";

export const PROPOSALS_COLLECTION = "proposals";
export const TEST_PROPOSALS_COLLECTION = "proposals_test";

export const PROJECTS_COLLECTION = "projects";
export const TEST_PROJECTS_COLLECTION = "projects_test";

export const ACTIVITIES_COLLECTION = "activities";
export const TEST_ACTIVITIES_COLLECTION = "activities_test";

export const ACTIONS_COLLECTION = "actions";
export const TEST_ACTIONS_COLLECTION = "actions_test";
