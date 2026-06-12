import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { db, ORDERS_COLLECTION, SURVEYS_COLLECTION } from 'lib/firebase';
import { z } from 'zod';

/**
 * Authenticated read API for the Grok Business Monitor desktop app.
 * Uses the same public Firebase client config as the website (lib/firebase.ts).
 *
 * GET /api/desktop-data?type=surveys|orders&limit=50
 * Header: X-Desktop-Sync-Secret: <DESKTOP_SYNC_SECRET from env>
 */

const QuerySchema = z.object({
  type: z.enum(['surveys', 'orders']),
  limit: z.coerce.number().int().min(1).max(200).optional().default(50),
});

function authorize(request: NextRequest): boolean {
  const expected = process.env.DESKTOP_SYNC_SECRET;
  if (!expected) return false;
  const provided = request.headers.get('x-desktop-sync-secret');
  return !!provided && provided === expected;
}

export async function GET(request: NextRequest) {
  if (!authorize(request)) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Invalid or missing X-Desktop-Sync-Secret' } },
      { status: 401 },
    );
  }

  try {
    const { type, limit: max } = QuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    const collectionName = type === 'surveys' ? SURVEYS_COLLECTION : ORDERS_COLLECTION;

    const snap = await getDocs(
      query(collection(db, collectionName), orderBy('created_at', 'desc'), limit(max)),
    );
    const items = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json({ success: true, type, collection: collectionName, count: items.length, items });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch desktop data';
    console.error('GET /api/desktop-data error', err);
    return NextResponse.json({ error: { code: 'FETCH_FAILED', message } }, { status: 500 });
  }
}
