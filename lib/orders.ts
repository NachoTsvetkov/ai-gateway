import { collection, getDocs, query, limit, setDoc, doc } from 'firebase/firestore';
import { db, ORDERS_COLLECTION, TEST_ORDERS_COLLECTION } from './firebase';
import { logActivity, upsertContact } from './journey';
import { createOrderSubmitActions } from './journey-actions';
import { z } from 'zod';

// Zod schema for order/purchase records from the /checkout + PayPal flow.
// Captures everything needed to follow up on a paid bundle or service:
// full buyer details, exactly what was bought (including chosen upsells and tier),
// pricing at time of purchase, currency/locale context, and the PayPal proof (order or subscription id).
export const OrderSchema = z.object({
  customer: z.object({
    name: z.string().min(1),
    business: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional(),
    notes: z.string().optional(),
  }),
  buyable: z.object({
    kind: z.enum(['bundle', 'service']),
    id: z.string().min(1),
    tier: z.number().int().nonnegative().optional(),
    name: z.string().min(1),
    oneTimeEur: z.number(),
    retainerEur: z.number().optional(),
    reference: z.string().min(1),
  }),
  upsells: z.array(
    z.object({
      id: z.string().min(1),
      label: z.string().min(1),
      eur: z.number(),
    })
  ),
  totalEur: z.number(),
  currency: z.enum(['EUR', 'USD']),
  locale: z.enum(['en', 'bg']),
  paypal: z.object({
    kind: z.enum(['order', 'subscription']),
    id: z.string().min(1),
  }),
  status: z.enum(['created', 'paid', 'failed', 'cancelled']).default('created'),
  // Optional context for debugging / attribution
  pageUrl: z.string().optional(),

  // System fields (added on write, can be re-sent on status updates)
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type OrderData = z.infer<typeof OrderSchema>;
export type OrderStatus = 'created' | 'paid' | 'failed' | 'cancelled';

/**
 * Saves (or upserts) an order record.
 *
 * We use a stable Firestore document ID derived from the PayPal id so that:
 *   - Creating on "PayPal button click" (create-order/create-subscription) writes the full
 *     buyer + buyable intent with status 'created'.
 *   - On successful payment we can call this again (or updateOrderStatus) with status 'paid'
 *     and it merges without creating duplicates.
 *
 * This guarantees we capture the data at click time (even if the buyer abandons or the
 * final success POST is blocked), and we can flip the status on success.
 */
export async function saveOrder(data: OrderData, useTestCollection = false): Promise<string> {
  const parsed = OrderSchema.parse(data);

  const writeData: any = { ...parsed };

  // Only default created_at for the initial "intent" write (from server create routes on button click).
  // Client re-sends on success carry status:'paid' but no created_at — we must NOT inject a timestamp
  // or merge would clobber the original click-time created_at.
  if (!writeData.created_at && (writeData.status === 'created' || !writeData.status)) {
    writeData.created_at = new Date().toISOString();
  }

  // Always record the last mutation time
  writeData.updated_at = new Date().toISOString();

  // Firestore does not allow explicit `undefined` values anywhere in a document.
  function stripUndefined(obj: any): any {
    if (obj === null || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(stripUndefined).filter((v) => v !== undefined);
    const out: any = {};
    for (const k of Object.keys(obj)) {
      const v = (obj as any)[k];
      if (v !== undefined) out[k] = stripUndefined(v);
    }
    return out;
  }

  const safeData = stripUndefined(writeData);

  const collectionName = useTestCollection ? TEST_ORDERS_COLLECTION : ORDERS_COLLECTION;
  const stableId = `${parsed.paypal.kind}_${parsed.paypal.id}`;

  console.log('Attempting to save order to Firestore:', {
    collection: collectionName,
    docId: stableId,
    ref: safeData.buyable.reference,
    paypal: safeData.paypal,
    status: safeData.status,
    email: safeData.customer.email,
  });

  const funnelStage = parsed.status === 'paid' ? 'order_paid' : 'order_created';
  const contactId = await upsertContact(
    {
      email: parsed.customer.email,
      name: parsed.customer.name,
      businessName: parsed.customer.business,
      businessType: parsed.customer.business,
      phone: parsed.customer.phone,
      source: `order:${parsed.buyable.reference}`,
      funnelStage,
    },
    useTestCollection,
  );

  await logActivity(
    contactId,
    parsed.status === 'paid' ? 'order_paid' : 'order_created',
    `${parsed.buyable.name} — €${parsed.totalEur} (${parsed.status})`,
    useTestCollection,
    { orderRef: parsed.buyable.reference, paypalId: parsed.paypal.id, status: parsed.status },
  );

  const submittedAt = safeData.created_at ?? writeData.updated_at ?? new Date().toISOString();
  await createOrderSubmitActions(
    contactId,
    parsed.customer.email,
    stableId,
    parsed.buyable.name,
    parsed.totalEur,
    parsed.status,
    submittedAt,
    useTestCollection,
  );

  const ref = doc(db, collectionName, stableId);
  await setDoc(ref, { ...safeData, contactId }, { merge: true });

  return stableId;
}

/**
 * Lightweight status flip + patch (used from capture-order for server-authoritative "paid").
 * Uses merge so we don't need the full customer/buyable payload.
 */
export async function updateOrderStatus(
  paypalKind: 'order' | 'subscription',
  paypalId: string,
  status: OrderStatus,
  useTestCollection = false,
  extra: Record<string, any> = {}
): Promise<void> {
  const collectionName = useTestCollection ? TEST_ORDERS_COLLECTION : ORDERS_COLLECTION;
  const stableId = `${paypalKind}_${paypalId}`;
  const ref = doc(db, collectionName, stableId);

  await setDoc(ref, {
    status,
    ...extra,
    updated_at: new Date().toISOString(),
  }, { merge: true });
}

/**
 * Fetches recent orders.
 * Used by test scripts + /api/orders GET for verification (submit + retrieve roundtrip).
 */
export async function getRecentOrders(useTestCollection = false, maxResults = 5) {
  const collectionName = useTestCollection ? TEST_ORDERS_COLLECTION : ORDERS_COLLECTION;
  // Fetch without orderBy to avoid potential index/type issues on created_at across docs (some old docs may lack it or have different type).
  // Sort client-side instead.
  const q = query(
    collection(db, collectionName),
    limit(maxResults * 2) // fetch a bit more to sort
  );
  const snapshot = await getDocs(q);
  const docs = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  // Sort by created_at desc if present, else by id.
  docs.sort((a: any, b: any) => {
    const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
    const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
    if (tb !== ta) return tb - ta;
    return (b.id || '').localeCompare(a.id || '');
  });
  return docs.slice(0, maxResults);
}
