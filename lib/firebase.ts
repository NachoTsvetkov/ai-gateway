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

// Export Firestore instance for survey data storage
export const db = getFirestore(app);

// Collection name for Chaos Phase survey responses
// Prod (default on live LPs): chaos_survey_responses
// Local/custom testing: chaos_survey_responses_test (activated via useTestCollection=true or ?test=false on forms)
export const SURVEYS_COLLECTION = 'chaos_survey_responses';
export const TEST_SURVEYS_COLLECTION = 'chaos_survey_responses_test';
