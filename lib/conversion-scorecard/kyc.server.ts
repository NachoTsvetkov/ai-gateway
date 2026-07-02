import type { Firestore } from "firebase-admin/firestore";
import { doc, getDoc } from "firebase/firestore";
import { getAdminFirestore } from "lib/firebase-admin";
import {
  ACTIVITIES_COLLECTION,
  CONTACTS_COLLECTION,
  db,
  ORDERS_COLLECTION,
  TEST_ACTIVITIES_COLLECTION,
  TEST_CONTACTS_COLLECTION,
  TEST_ORDERS_COLLECTION,
} from "lib/firebase";
import {
  contactIdFromEmail,
  type IntakeFunnelStage,
  type UpsertContactInput,
} from "lib/journey";
import { isProductionDeploy } from "lib/digital-product-auth.server";
import {
  CONVERSION_KIT_KYC_SOURCE,
  type ConversionKitKycData,
  ConversionKitKycSchema,
  hasConversionKitKyc,
  saveConversionKitKyc,
} from "lib/conversion-scorecard/kyc";
import {
  CONVERSION_KIT_KYC_COLLECTION,
  TEST_CONVERSION_KIT_KYC_COLLECTION,
} from "lib/firebase";
import {
  normalizeLibraryEmail,
  parseSignedAccessPayload,
} from "lib/digital-product-access";

export function useConversionKitTestCollection(): boolean {
  return !isProductionDeploy();
}

function ordersCollection(useTestCollection: boolean): string {
  return useTestCollection ? TEST_ORDERS_COLLECTION : ORDERS_COLLECTION;
}

/** Resolve buyer email from library cookie — Admin SDK first on the server. */
export async function resolveLibrarySessionEmailServer(
  token: string,
  useTestCollection = useConversionKitTestCollection(),
): Promise<string | null> {
  const payload = parseSignedAccessPayload(token);
  if (!payload) return null;

  if (payload.startsWith("email|")) {
    const parts = payload.split("|");
    return parts[2] ? normalizeLibraryEmail(parts[2]) : null;
  }

  const pipe = payload.indexOf("|");
  if (pipe <= 0) return null;

  const productId = payload.slice(0, pipe);
  const paypalId = payload.slice(pipe + 1);
  if (productId !== "shopify-conversion-kit" || !paypalId) return null;

  const adminDb = getAdminFirestore();
  const collections = useTestCollection
    ? [ordersCollection(true), ordersCollection(false)]
    : [ordersCollection(false)];

  for (const collectionName of collections) {
    for (const kind of ["order", "subscription"] as const) {
      const docId = `${kind}_${paypalId}`;

      if (adminDb) {
        const snap = await adminDb.collection(collectionName).doc(docId).get();
        if (!snap.exists) continue;
        const email = snap.data()?.customer?.email;
        if (typeof email === "string" && email.trim()) {
          return normalizeLibraryEmail(email);
        }
        continue;
      }

      const snap = await getDoc(doc(db, collectionName, docId));
      if (!snap.exists()) continue;
      const email = snap.data()?.customer?.email;
      if (typeof email === "string" && email.trim()) {
        return normalizeLibraryEmail(email);
      }
    }
  }

  return null;
}

function kycCollection(useTestCollection: boolean): string {
  return useTestCollection
    ? TEST_CONVERSION_KIT_KYC_COLLECTION
    : CONVERSION_KIT_KYC_COLLECTION;
}

function contactsCollection(useTestCollection: boolean): string {
  return useTestCollection ? TEST_CONTACTS_COLLECTION : CONTACTS_COLLECTION;
}

function activitiesCollection(useTestCollection: boolean): string {
  return useTestCollection ? TEST_ACTIVITIES_COLLECTION : ACTIVITIES_COLLECTION;
}

function kycDocId(email: string): string {
  return normalizeLibraryEmail(email).replace(/[^a-z0-9._-]/g, "_");
}

/** Server-side KYC completion check — prefers Firebase Admin (bypasses client rules). */
export async function hasConversionKitKycServer(
  email: string,
  useTestCollection = useConversionKitTestCollection(),
): Promise<boolean> {
  const docId = kycDocId(email);
  const adminDb = getAdminFirestore();

  if (adminDb) {
    const primary = await adminDb
      .collection(kycCollection(useTestCollection))
      .doc(docId)
      .get();
    if (primary.exists) return true;

    if (useTestCollection) {
      const prod = await adminDb
        .collection(kycCollection(false))
        .doc(docId)
        .get();
      if (prod.exists) return true;
    }

    return false;
  }

  let complete = await hasConversionKitKyc(email, useTestCollection);
  if (!complete && useTestCollection) {
    complete = await hasConversionKitKyc(email, false);
  }
  return complete;
}

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

function pickFunnelStage(existing: string | undefined, incoming: IntakeFunnelStage): string {
  if (!existing) return incoming;
  const cur = STAGE_RANK[existing] ?? 0;
  const next = STAGE_RANK[incoming] ?? 0;
  return next >= cur ? incoming : existing;
}

async function upsertContactAdmin(
  adminDb: Firestore,
  input: UpsertContactInput,
  useTestCollection: boolean,
): Promise<string> {
  const email = input.email.trim().toLowerCase();
  const id = contactIdFromEmail(email);
  const ref = adminDb.collection(contactsCollection(useTestCollection)).doc(id);
  const existing = await ref.get();
  const now = new Date().toISOString();
  const prev = existing.exists ? existing.data() : null;
  const funnelStage = pickFunnelStage(
    prev?.funnelStage as string | undefined,
    input.funnelStage,
  );

  await ref.set(
    {
      email,
      name: input.name?.trim() || (prev?.name as string) || "",
      businessName: input.businessName?.trim() || (prev?.businessName as string) || "",
      businessType: input.businessType?.trim() || (prev?.businessType as string) || "",
      source: input.source || (prev?.source as string) || "",
      funnelStage,
      owner: "nacho",
      archived: false,
      created_at: (prev?.created_at as string) || now,
      updated_at: now,
      lastActivityAt: now,
      ...(input.phone?.trim() ? { phone: input.phone.trim() } : {}),
    },
    { merge: true },
  );

  return id;
}

async function logActivityAdmin(
  adminDb: Firestore,
  contactId: string,
  type: string,
  description: string,
  useTestCollection: boolean,
  metadata: Record<string, unknown> = {},
): Promise<void> {
  await adminDb.collection(activitiesCollection(useTestCollection)).add({
    contactId,
    type,
    description,
    metadata,
    created_at: new Date().toISOString(),
  });
}

/** Server-side KYC save — prefers Firebase Admin (same credentials as desktop-data). */
export async function saveConversionKitKycServer(
  data: ConversionKitKycData,
  useTestCollection = useConversionKitTestCollection(),
): Promise<void> {
  const parsed = ConversionKitKycSchema.parse(data);
  const email = normalizeLibraryEmail(parsed.email);
  const now = new Date().toISOString();
  const adminDb = getAdminFirestore();

  if (!adminDb) {
    await saveConversionKitKyc({ ...parsed, email }, useTestCollection);
    return;
  }

  const contactId = await upsertContactAdmin(
    adminDb,
    {
      email,
      businessType: parsed.business_type,
      source: CONVERSION_KIT_KYC_SOURCE,
      funnelStage: "order_paid",
    },
    useTestCollection,
  );

  await logActivityAdmin(
    adminDb,
    contactId,
    "library_kyc_submitted",
    "Conversion kit library KYC completed",
    useTestCollection,
    { source: CONVERSION_KIT_KYC_SOURCE },
  );

  await adminDb.collection(kycCollection(useTestCollection)).doc(kycDocId(email)).set(
    {
      ...parsed,
      email,
      contactId,
      source: CONVERSION_KIT_KYC_SOURCE,
      created_at: now,
      updated_at: now,
    },
    { merge: true },
  );
}
