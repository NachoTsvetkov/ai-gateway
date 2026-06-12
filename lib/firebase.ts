import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

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
// 2. Deploy/paste rules from the firestore.rules file in repo root (allows only create for the two collections with required fields).
// See scripts/test-chaos-firebase.ts for the exact URLs + copy-paste rule example + test that does write + read-back.
export const db = getFirestore(app);

// Collection names (kept for data continuity with any existing responses).
// Prod (default on live report request pages): chaos_survey_responses
// Local/custom testing: chaos_survey_responses_test (activated via useTestCollection=true or ?test=false on forms)
// These are internal names only — visitor-facing language never mentions them.
export const SURVEYS_COLLECTION = 'chaos_survey_responses';
export const TEST_SURVEYS_COLLECTION = 'chaos_survey_responses_test';
