import { NextRequest } from 'next/server';
import { getAdminFirestore } from './firebase-admin';

/** Shared secret auth for Grok Business Monitor desktop API routes. */
export function authorizeDesktopRequest(request: NextRequest): boolean {
  const expected = process.env.DESKTOP_SYNC_SECRET;
  if (!expected) return false;
  const provided = request.headers.get('x-desktop-sync-secret');
  return !!provided && provided === expected;
}

export function desktopUnauthorizedResponse() {
  return Response.json(
    { error: { code: 'UNAUTHORIZED', message: 'Invalid or missing X-Desktop-Sync-Secret' } },
    { status: 401 },
  );
}

export function requireAdminFirestore() {
  const db = getAdminFirestore();
  if (!db) {
    return {
      db: null as null,
      error: Response.json(
        {
          error: {
            code: 'ADMIN_NOT_CONFIGURED',
            message:
              'Firebase Admin SDK is not configured. Set FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT_PATH.',
          },
        },
        { status: 503 },
      ),
    };
  }
  return { db, error: null as null };
}
