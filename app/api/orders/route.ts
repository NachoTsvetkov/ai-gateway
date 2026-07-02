import { NextRequest, NextResponse } from 'next/server';
import { OrderSchema, saveOrder, getRecentOrders, type OrderData } from 'lib/orders';
import { parseUseTestCollection } from 'lib/collection-mode';
import { z } from 'zod';

// Clean API for persisting completed orders from the bundle/service checkout flow.
// POST /api/orders          -> save (supports ?test=... to choose test/prod collection)
// GET  /api/orders?test=... -> recent orders (for verification scripts / admin tooling)
//
// Mirrors the established pattern from /api/report-request exactly for consistency
// (same query param convention, error shape, test/prod split, etc.).

const QuerySchema = z.object({
  test: z.enum(['true', 'false', '1', '0']).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Re-validate at the API boundary (untrusted input from browser on PayPal success)
    const parsed = OrderSchema.parse(body) as OrderData;

    if (
      process.env.NODE_ENV === "production" &&
      parsed.paypal?.id?.startsWith("DEV-")
    ) {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "Invalid payment proof" } },
        { status: 403 },
      );
    }

    const { test } = QuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    const useTest = parseUseTestCollection(test, false);

    const id = await saveOrder(parsed, useTest);

    return NextResponse.json(
      { success: true, id, collection: useTest ? 'test' : 'prod' },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('POST /api/orders error', err);

    if (err instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid order data',
            details: err.flatten(),
          },
        },
        { status: 422 }
      );
    }

    return NextResponse.json(
      {
        error: {
          code: 'SAVE_FAILED',
          message: err?.message || 'Failed to save order. Please check Firebase database + security rules setup.',
        },
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { test } = QuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    const useTest = parseUseTestCollection(test, true);

    const recent = await getRecentOrders(useTest, 5);

    return NextResponse.json({ success: true, collection: useTest ? 'test' : 'prod', recent });
  } catch (err: any) {
    console.error('GET /api/orders error (full):', err);
    return NextResponse.json(
      {
        error: {
          code: 'FETCH_FAILED',
          message: err?.message || 'Failed to fetch recent orders',
          stack: err?.stack?.split('\n').slice(0, 5).join('\n'),
        },
      },
      { status: 500 }
    );
  }
}
