import { NextRequest, NextResponse } from 'next/server';
import {
  MarketingEmailSchema,
  saveMarketingEmail,
  getRecentMarketingEmails,
  type MarketingEmailData,
} from 'lib/marketing-emails';
import { parseUseTestCollection } from 'lib/collection-mode';
import { z } from 'zod';

// Simple API for marketing email / subscriber signups.
// POST /api/marketing-email          -> save (supports ?test=true/false)
// GET  /api/marketing-email?test=... -> recent (for verification)

const QuerySchema = z.object({
  test: z.enum(['true', 'false', '1', '0']).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const parsed = MarketingEmailSchema.parse(body) as MarketingEmailData;

    const { test } = QuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    const useTest = parseUseTestCollection(test, false);

    const id = await saveMarketingEmail(parsed, useTest);

    return NextResponse.json(
      { success: true, id, collection: useTest ? 'test' : 'prod' },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('POST /api/marketing-email error', err);

    if (err instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid marketing email data',
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
          message: err?.message || 'Failed to save marketing email.',
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

    const recent = await getRecentMarketingEmails(useTest, 5);

    return NextResponse.json({ success: true, collection: useTest ? 'test' : 'prod', recent });
  } catch (err: any) {
    console.error('GET /api/marketing-email error', err);
    return NextResponse.json(
      { error: { code: 'FETCH_FAILED', message: err?.message || 'Failed to fetch recent emails' } },
      { status: 500 }
    );
  }
}
