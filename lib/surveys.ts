import { addDoc, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db, SURVEYS_COLLECTION, TEST_SURVEYS_COLLECTION } from './firebase';
import { z } from 'zod';

// Zod schema for survey data validation (used on client before saving and at API boundary).
// Matches the Daniel Priestley-inspired questions adapted for our specialized AI Opportunity Reports.
// "tried_so_far" added per the recommended structure (Step 4).
export const ReportRequestSchema = z.object({
  source: z.string().min(1), // e.g. "revenue-audit", "lead-machine" etc. (used to track which focus area)
  business_type: z.string().min(1),
  pain: z.string().min(1),           // Current situation / biggest frustration (customized per page via painLabel)
  desired_results: z.string().min(1), // What success / results they want
  tried_so_far: z.string().optional(), // What they have already tried (Step 4 – recommended by Priestley)
  budget: z.string().min(1),
  interest: z.number().min(1).max(10),
  email: z.string().email(),
  additional_details: z.string().optional(),
  utm_source: z.string().optional(),
  utm_campaign: z.string().optional(),
  page_url: z.string().url().optional(),
});

export type ReportRequestData = z.infer<typeof ReportRequestSchema>;

// Back-compat aliases (in case anything still references the old names during transition)
export const ChaosSurveySchema = ReportRequestSchema;
export type ChaosSurveyData = ReportRequestData;

/**
 * Saves a report request (Personalized AI Opportunity Report / audit survey response) to Firestore.
 * Called by the client form (optimistically) and the API route.
 * 
 * The `useTestCollection` flag + ?test= param lets us keep production data clean while testing.
 */
export async function saveReportRequestResponse(data: ReportRequestData, useTestCollection = false): Promise<string> {
  // default=false=prod main collection; true=local/custom test bucket.
  // ?test=false in the URL (or prop) forces the test collection.
  const parsed = ReportRequestSchema.parse(data);

  console.log('Attempting to save report request to Firestore:', { collection: useTestCollection ? 'test' : 'prod', data: parsed });

  const collectionName = useTestCollection ? TEST_SURVEYS_COLLECTION : SURVEYS_COLLECTION;

  const docRef = await addDoc(collection(db, collectionName), {
    ...parsed,
    // serverTimestamp() removed to avoid resolution issues on new DBs / certain streams.
    created_at: new Date().toISOString(),
  });

  return docRef.id;
}

/**
 * Fetches recent report requests.
 * Used by the test script to verify that a submit actually persisted and is retrievable (end-to-end test).
 */
export async function getRecentReportRequests(useTestCollection = false, maxResults = 5) {
  const collectionName = useTestCollection ? TEST_SURVEYS_COLLECTION : SURVEYS_COLLECTION;
  const q = query(
    collection(db, collectionName),
    orderBy('created_at', 'desc'), // fallback ordering since we use client created_at
    limit(maxResults)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

// Back-compat for any lingering references
export const saveChaosSurveyResponse = saveReportRequestResponse;
export const getRecentChaosSurveyResponses = getRecentReportRequests;
