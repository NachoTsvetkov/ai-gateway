import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, SURVEYS_COLLECTION, TEST_SURVEYS_COLLECTION } from './firebase';
import { z } from 'zod';

// Zod schema for survey data validation (used on client before saving)
export const ChaosSurveySchema = z.object({
  source: z.string().min(1), // e.g. "revenue-audit" or full path
  business_type: z.string().min(1),
  pain: z.string().min(1),
  desired_results: z.string().min(1),
  budget: z.string().min(1),
  interest: z.number().min(1).max(10),
  email: z.string().email(),
  additional_details: z.string().optional(),
  utm_source: z.string().optional(),
  utm_campaign: z.string().optional(),
  page_url: z.string().url().optional(),
});

export type ChaosSurveyData = z.infer<typeof ChaosSurveySchema>;

/**
 * Saves a Chaos Phase survey response to Firestore.
 * Call this from the form submit handler on the landing pages.
 * 
 * Also fire the existing Meta Pixel 'Lead' event from the client (lib/pixel/client.ts)
 * before or after calling this.
 */
export async function saveChaosSurveyResponse(data: ChaosSurveyData, useTestCollection = false): Promise<string> {
  // default=false=prod main collection; true=local/custom test bucket.
  // URL override on forms: ?test=false forces true here (local/custom). See ChaosSurveyForm.
  // Client-side validation (defense in depth)
  const parsed = ChaosSurveySchema.parse(data);

  console.log('Attempting to save to Firestore:', { collection: useTestCollection ? 'test' : 'prod', data: parsed });

  const collectionName = useTestCollection ? TEST_SURVEYS_COLLECTION : SURVEYS_COLLECTION;

  const docRef = await addDoc(collection(db, collectionName), {
    ...parsed,
    timestamp: serverTimestamp(),
    created_at: new Date().toISOString(), // fallback for client
  });

  return docRef.id;
}
