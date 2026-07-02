import { doc, getDoc } from "firebase/firestore";
import type { DigitalProductId } from "./digital-products-data";
import {
  normalizeLibraryEmail,
  parseSignedAccessPayload,
  verifyLibraryAccessToken,
} from "./digital-product-access";
import { getAdminFirestore } from "./firebase-admin";
import { db, ORDERS_COLLECTION, TEST_ORDERS_COLLECTION } from "./firebase";
import { hasPaidDigitalProductOrder } from "./orders";

export function isProductionDeploy(): boolean {
  return (
    process.env.VERCEL_ENV === "production" ||
    process.env.NODE_ENV === "production"
  );
}

/** Dev-only library login bypass — never enabled on production deploys. */
export function isDigitalProductLibraryPreviewEnabled(): boolean {
  if (isProductionDeploy()) return false;
  return process.env.DIGITAL_PRODUCT_LIBRARY_PREVIEW === "1";
}

function orderMatchesBuyer(
  data: Record<string, unknown>,
  normalizedEmail: string,
  productId: string,
): boolean {
  const customer = data.customer;
  const buyable = data.buyable;
  const orderEmail = normalizeLibraryEmail(
    String((customer as { email?: string } | undefined)?.email ?? ""),
  );
  const buyableId =
    buyable &&
    typeof buyable === "object" &&
    "id" in buyable &&
    typeof buyable.id === "string"
      ? buyable.id
      : null;

  return (
    orderEmail === normalizedEmail &&
    buyableId === productId &&
    data.status === "paid"
  );
}

async function hasPaidOrderInCollection(
  collectionName: string,
  normalizedEmail: string,
  productId: string,
): Promise<boolean> {
  const adminDb = getAdminFirestore();

  if (adminDb) {
    const snapshot = await adminDb
      .collection(collectionName)
      .where("customer.email", "==", normalizedEmail)
      .limit(25)
      .get();

    return snapshot.docs.some((orderDoc) =>
      orderMatchesBuyer(orderDoc.data(), normalizedEmail, productId),
    );
  }

  const useTestCollection = collectionName === TEST_ORDERS_COLLECTION;
  return hasPaidDigitalProductOrder(
    normalizedEmail,
    productId,
    useTestCollection,
  );
}

/** Server-only: true when a paid order exists for this product + email. */
export async function hasPaidDigitalProductAccess(
  email: string,
  productId: DigitalProductId,
): Promise<boolean> {
  const normalized = normalizeLibraryEmail(email);
  if (!normalized) return false;

  try {
    if (await hasPaidOrderInCollection(ORDERS_COLLECTION, normalized, productId)) {
      return true;
    }

    if (!isProductionDeploy()) {
      return hasPaidOrderInCollection(
        TEST_ORDERS_COLLECTION,
        normalized,
        productId,
      );
    }

    return false;
  } catch (error) {
    console.error("[digital-product-auth] paid order lookup failed", error);
    return false;
  }
}

async function verifyPurchaseTokenEntitlement(
  productId: DigitalProductId,
  paypalId: string,
): Promise<boolean> {
  const adminDb = getAdminFirestore();
  const collections = isProductionDeploy()
    ? [ORDERS_COLLECTION]
    : [ORDERS_COLLECTION, TEST_ORDERS_COLLECTION];

  for (const collectionName of collections) {
    for (const kind of ["order", "subscription"] as const) {
      const docId = `${kind}_${paypalId}`;

      if (adminDb) {
        const snap = await adminDb.collection(collectionName).doc(docId).get();
        if (!snap.exists) continue;
        const data = snap.data();
        if (data?.buyable?.id === productId && data.status === "paid") {
          return true;
        }
        continue;
      }

      const snap = await getDoc(doc(db, collectionName, docId));
      if (!snap.exists()) continue;
      const data = snap.data();
      if (data?.buyable?.id === productId && data.status === "paid") {
        return true;
      }
    }
  }

  return false;
}

/** Validates cookie token signature AND live purchase entitlement. */
export async function verifyLibraryTokenEntitlement(
  token: string,
): Promise<boolean> {
  if (!verifyLibraryAccessToken(token)) return false;

  const payload = parseSignedAccessPayload(token);
  if (!payload) return false;

  if (payload.startsWith("email|")) {
    const parts = payload.split("|");
    const productId = parts[1];
    const email = parts[2];
    if (productId !== "shopify-conversion-kit" || !email) return false;
    return hasPaidDigitalProductAccess(email, "shopify-conversion-kit");
  }

  const pipe = payload.indexOf("|");
  if (pipe <= 0) return false;

  const productId = payload.slice(0, pipe) as DigitalProductId;
  const paypalId = payload.slice(pipe + 1);
  if (productId !== "shopify-conversion-kit" || !paypalId) return false;

  return verifyPurchaseTokenEntitlement(productId, paypalId);
}
