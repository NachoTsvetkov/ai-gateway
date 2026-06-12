import { addDoc, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db, SURVEYS_COLLECTION, TEST_SURVEYS_COLLECTION } from './firebase';
import { z } from 'zod';

// Zod schema for survey data validation (used on client before saving and at API boundary).
// Matches the Daniel Priestley-inspired questions adapted for our specialized AI Opportunity Reports.
// "tried_so_far" added per the recommended structure (Step 4).
export const ReportRequestSchema = z.object({
  source: z.string().min(1), // e.g. "revenue-audit", "lead-machine" etc. (used to track which focus area)
  business_type: z.string().min(1, "Please tell us what type of business you run."),
  pain: z.string().min(1, "Please describe your current situation or biggest frustration."),
  desired_results: z.string().min(1, "Please share the results you'd like to see."),
  tried_so_far: z.string().optional(), // What they have already tried (Step 4 – recommended by Priestley)
  budget: z.string().min(1, "Please enter a fair price, range, or even 'not sure yet'."),
  interest: z.number().min(1, "Please select a number from 1 to 10.").max(10, "Please select a number from 1 to 10."),
  email: z.string().email("Please enter a valid email address."),
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
 *
 * Per Client Journey docs: the **website only writes survey_responses** (or *_test).
 * Contact creation, activity logging, and funnel progression are handled by the desktop app
 * when it detects new surveys.
 */
export async function saveReportRequestResponse(data: ReportRequestData, useTestCollection = false): Promise<string> {
  const parsed = ReportRequestSchema.parse(data);

  const surveysColl = useTestCollection ? TEST_SURVEYS_COLLECTION : SURVEYS_COLLECTION;

  console.log('Attempting to save report request to Firestore:', {
    collection: useTestCollection ? TEST_SURVEYS_COLLECTION : SURVEYS_COLLECTION,
    email: parsed.email,
    source: parsed.source,
  });

  const surveyData = {
    ...parsed,
    created_at: new Date().toISOString(),
  };

  const docRef = await addDoc(collection(db, surveysColl), surveyData);
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
    orderBy('created_at', 'desc'),
    limit(maxResults),
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
