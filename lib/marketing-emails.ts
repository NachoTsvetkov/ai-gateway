import { addDoc, collection, getDocs, query, limit, setDoc, doc } from 'firebase/firestore';
import { db, MARKETING_EMAILS_COLLECTION, TEST_MARKETING_EMAILS_COLLECTION } from './firebase';
import { logActivity, upsertContact } from './journey';
import { createMarketingLeadAction } from './journey-actions';
import { z } from 'zod';

// Basic Zod schema for marketing email / subscriber records.
// We keep it minimal to start (email + source required).
// You can extend with more fields later (tags, consent, etc.).
export const MarketingEmailSchema = z.object({
  email: z.string().email(),
  source: z.string().min(1), // e.g. "bundle-startup", "survey-revenue-audit", "homepage", "cart-recovery", etc.

  // Optional common marketing fields (uncomment / extend as needed)
  name: z.string().optional(),
  business: z.string().optional(),
  // tags: z.array(z.string()).optional(),
  // consent: z.boolean().optional(),
  // consent_at: z.string().optional(), // ISO timestamp
  page_url: z.string().optional(),
  utm_source: z.string().optional(),
  utm_campaign: z.string().optional(),
});

export type MarketingEmailData = z.infer<typeof MarketingEmailSchema>;

/**
 * Saves a marketing email / subscriber record.
 * Use `useTestCollection = true` (or the ?test=false convention on a future API)
 * for safe testing without polluting production.
 */
export async function saveMarketingEmail(data: MarketingEmailData, useTestCollection = false): Promise<string> {
  const parsed = MarketingEmailSchema.parse(data);

  const collectionName = useTestCollection
    ? TEST_MARKETING_EMAILS_COLLECTION
    : MARKETING_EMAILS_COLLECTION;

  console.log('Attempting to save marketing email to Firestore:', {
    collection: collectionName,
    email: parsed.email,
    source: parsed.source,
  });

  const contactId = await upsertContact(
    {
      email: parsed.email,
      name: parsed.name,
      businessName: parsed.business,
      source: parsed.source,
      funnelStage: 'marketing_lead',
    },
    useTestCollection,
  );

  await logActivity(
    contactId,
    'marketing_lead',
    `Marketing signup via ${parsed.source}`,
    useTestCollection,
    { pageUrl: parsed.page_url },
  );

  await createMarketingLeadAction(contactId, parsed.email, parsed.source, useTestCollection);

  const docRef = await addDoc(collection(db, collectionName), {
    ...parsed,
    contactId,
    created_at: new Date().toISOString(),
  });

  return docRef.id;
}

/**
 * Fetches recent marketing emails (useful for verification scripts).
 */
export async function getRecentMarketingEmails(useTestCollection = false, maxResults = 5) {
  const collectionName = useTestCollection
    ? TEST_MARKETING_EMAILS_COLLECTION
    : MARKETING_EMAILS_COLLECTION;

  // Fetch without orderBy to avoid potential index/type issues on created_at (consistent with orders).
  // Sort client-side.
  const q = query(
    collection(db, collectionName),
    limit(maxResults * 2)
  );
  const snapshot = await getDocs(q);
  const docs = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  docs.sort((a: any, b: any) => {
    const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
    const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
    if (tb !== ta) return tb - ta;
    return (b.id || '').localeCompare(a.id || '');
  });
  return docs.slice(0, maxResults);
}
