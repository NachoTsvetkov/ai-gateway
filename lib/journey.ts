import { addDoc, collection, doc, getDoc, setDoc } from 'firebase/firestore';
import {
  ACTIVITIES_COLLECTION,
  CONTACTS_COLLECTION,
  TEST_ACTIVITIES_COLLECTION,
  TEST_CONTACTS_COLLECTION,
} from './firebase';
import { db } from './firebase';

/** Funnel stages from Firebase_Database_Model_Client_Journey.md (subset used on website intake). */
export type IntakeFunnelStage =
  | 'marketing_lead'
  | 'survey_submitted'
  | 'order_created'
  | 'order_paid';

const STAGE_RANK: Record<string, number> = {
  marketing_lead: 10,
  survey_submitted: 20,
  order_created: 30,
  order_paid: 40,
  report_sent: 50,
  meeting_booked: 60,
  meeting_completed: 70,
  proposal_sent: 80,
  proposal_accepted: 90,
  project_active: 100,
  subscription_active: 110,
};

function contactsCollection(useTest: boolean) {
  return useTest ? TEST_CONTACTS_COLLECTION : CONTACTS_COLLECTION;
}

function activitiesCollection(useTest: boolean) {
  return useTest ? TEST_ACTIVITIES_COLLECTION : ACTIVITIES_COLLECTION;
}

/** Stable contact document id from email (upsert key). */
export function contactIdFromEmail(email: string): string {
  const slug = email
    .toLowerCase()
    .trim()
    .replace(/@/g, '_at_')
    .replace(/[^a-z0-9._-]/g, '_')
    .slice(0, 120);
  return `c_${slug}`;
}

function pickFunnelStage(existing: string | undefined, incoming: IntakeFunnelStage): string {
  if (!existing) return incoming;
  const cur = STAGE_RANK[existing] ?? 0;
  const next = STAGE_RANK[incoming] ?? 0;
  return next >= cur ? incoming : existing;
}

export type UpsertContactInput = {
  email: string;
  name?: string;
  businessName?: string;
  businessType?: string;
  phone?: string;
  source: string;
  funnelStage: IntakeFunnelStage;
};

/**
 * Create or merge a contact with funnel-stage progression (never downgrade).
 */
export async function upsertContact(input: UpsertContactInput, useTestCollection = false): Promise<string> {
  const email = input.email.trim().toLowerCase();
  const id = contactIdFromEmail(email);
  const coll = contactsCollection(useTestCollection);
  const ref = doc(db, coll, id);
  const existing = await getDoc(ref);
  const now = new Date().toISOString();

  const prev = existing.exists() ? (existing.data() as Record<string, unknown>) : null;
  const funnelStage = pickFunnelStage(
    prev?.funnelStage as string | undefined,
    input.funnelStage,
  );

  await setDoc(
    ref,
    {
      email,
      name: input.name?.trim() || (prev?.name as string) || '',
      businessName: input.businessName?.trim() || (prev?.businessName as string) || '',
      businessType: input.businessType?.trim() || (prev?.businessType as string) || '',
      source: input.source || (prev?.source as string) || '',
      funnelStage,
      owner: 'nacho',
      archived: false,
      created_at: (prev?.created_at as string) || now,
      updated_at: now,
      lastActivityAt: now,
      ...(input.phone?.trim() ? { phone: input.phone.trim() } : prev?.phone ? { phone: prev.phone as string } : {}),
    },
    { merge: true },
  );

  return id;
}

export async function logActivity(
  contactId: string,
  type: string,
  description: string,
  useTestCollection = false,
  metadata: Record<string, unknown> = {},
): Promise<string> {
  const coll = activitiesCollection(useTestCollection);
  const docRef = await addDoc(collection(db, coll), {
    contactId,
    type,
    description,
    metadata,
    created_at: new Date().toISOString(),
  });
  return docRef.id;
}
