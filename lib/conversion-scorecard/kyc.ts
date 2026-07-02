import { doc, getDoc, setDoc } from "firebase/firestore";
import { z } from "zod";
import {
  CONVERSION_KIT_KYC_COLLECTION,
  db,
  ORDERS_COLLECTION,
  TEST_CONVERSION_KIT_KYC_COLLECTION,
  TEST_ORDERS_COLLECTION,
} from "lib/firebase";
import { logActivity, upsertContact } from "lib/journey";
import {
  normalizeLibraryEmail,
  parseSignedAccessPayload,
} from "lib/digital-product-access";

export const CONVERSION_KIT_KYC_SOURCE = "shopify-conversion-kit-library";

export const ConversionKitKycSchema = z.object({
  email: z.string().email(),
  business_type: z
    .string()
    .min(1, "Please tell us what type of business you run."),
  desired_results: z
    .string()
    .min(1, "Please share the results you'd like to see."),
  pain: z
    .string()
    .min(1, "Please describe your current situation or biggest frustration."),
  tried_so_far: z
    .string()
    .min(1, "Please tell us what you've already tried."),
  budget: z.string().min(1, "Pick a budget range."),
});

export type ConversionKitKycData = z.infer<typeof ConversionKitKycSchema>;

export type ConversionKitKycFieldId = keyof Omit<
  ConversionKitKycData,
  "email"
>;

export const CONVERSION_KIT_KYC_STEPS = [
  {
    id: "business_type" as const,
    label: "What type of business do you run?",
    placeholder: "e.g. DTC skincare brand, $40k/mo Meta spend…",
    multiline: false,
    chipCount: 6,
  },
  {
    id: "desired_results" as const,
    label:
      "What results would make the biggest difference in the next 3–6 months?",
    placeholder: "Higher checkout rate, lower CPA, fix tracking…",
    multiline: true,
    chipCount: 6,
  },
  {
    id: "pain" as const,
    labelKey: "pain" as const,
    placeholder:
      "Surprise shipping, mobile checkout, Meta vs Shopify mismatch…",
    multiline: true,
    chipCount: 6,
  },
  {
    id: "tried_so_far" as const,
    label: "What have you already tried to improve this?",
    placeholder: "Meta ads, new theme, CRO audit, nothing yet…",
    helperText: "Pick a suggestion or type your own.",
    multiline: true,
    chipCount: 6,
  },
  {
    id: "budget" as const,
    label: "What budget range would you expect for a solution?",
    placeholder: "$300 – $500",
    multiline: false,
    chipCount: 7,
  },
] as const;

function kycCollection(useTestCollection: boolean): string {
  return useTestCollection
    ? TEST_CONVERSION_KIT_KYC_COLLECTION
    : CONVERSION_KIT_KYC_COLLECTION;
}

function kycDocId(email: string): string {
  return normalizeLibraryEmail(email).replace(/[^a-z0-9._-]/g, "_");
}

function ordersCollection(useTestCollection: boolean): string {
  return useTestCollection ? TEST_ORDERS_COLLECTION : ORDERS_COLLECTION;
}

/** Resolve buyer email from library access cookie (email login or purchase token). */
export async function resolveLibrarySessionEmail(
  token: string,
  useTestCollection = false,
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

  for (const kind of ["order", "subscription"] as const) {
    const ref = doc(db, ordersCollection(useTestCollection), `${kind}_${paypalId}`);
    const snap = await getDoc(ref);
    if (!snap.exists()) continue;

    const email = snap.data()?.customer?.email;
    if (typeof email === "string" && email.trim()) {
      return normalizeLibraryEmail(email);
    }
  }

  if (useTestCollection) {
    return resolveLibrarySessionEmail(token, false);
  }

  return null;
}

export async function hasConversionKitKyc(
  email: string,
  useTestCollection = false,
): Promise<boolean> {
  const normalized = normalizeLibraryEmail(email);
  const ref = doc(db, kycCollection(useTestCollection), kycDocId(normalized));
  const snap = await getDoc(ref);
  return snap.exists();
}

export async function saveConversionKitKyc(
  data: ConversionKitKycData,
  useTestCollection = false,
): Promise<void> {
  const parsed = ConversionKitKycSchema.parse(data);
  const email = normalizeLibraryEmail(parsed.email);
  const now = new Date().toISOString();

  const contactId = await upsertContact(
    {
      email,
      businessType: parsed.business_type,
      source: CONVERSION_KIT_KYC_SOURCE,
      funnelStage: "order_paid",
    },
    useTestCollection,
  );

  await logActivity(
    contactId,
    "library_kyc_submitted",
    "Conversion kit library KYC completed",
    useTestCollection,
    { source: CONVERSION_KIT_KYC_SOURCE },
  );

  const ref = doc(db, kycCollection(useTestCollection), kycDocId(email));
  await setDoc(
    ref,
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
