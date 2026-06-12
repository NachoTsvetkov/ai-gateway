import { NextRequest, NextResponse } from 'next/server';
import { ReportRequestSchema, saveReportRequestResponse, getRecentReportRequests, type ReportRequestData } from 'lib/surveys';
import { parseUseTestCollection } from 'lib/collection-mode';
import { z } from 'zod';

// Clean API for Personalized AI Opportunity Report requests.
// POST /api/report-request       -> prod survey_responses (default)
// POST /api/report-request?test=true -> survey_responses_test
// GET  /api/report-request?test=true -> recent from test collection (verification)

const QuerySchema = z.object({
  test: z.enum(['true', 'false', '1', '0']).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Re-validate at the API boundary (untrusted input)
    const parsed = ReportRequestSchema.parse(body) as ReportRequestData;

    const { test } = QuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    const useTest = parseUseTestCollection(test, false);

    const id = await saveReportRequestResponse(parsed, useTest);

    return NextResponse.json({ success: true, id, collection: useTest ? 'test' : 'prod' }, { status: 201 });
  } catch (err: any) {
    console.error('POST /api/report-request error', err);

    if (err instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid report request data',
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
          message: err?.message || 'Failed to save report request. Please check Firebase database + security rules setup.',
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

    const recent = await getRecentReportRequests(useTest, 5);

    return NextResponse.json({ success: true, collection: useTest ? 'test' : 'prod', recent });
  } catch (err: any) {
    console.error('GET /api/report-request error (full):', err);
    return NextResponse.json(
      { error: { code: 'FETCH_FAILED', message: err?.message || 'Failed to fetch recent requests', stack: err?.stack?.split('\n').slice(0,5).join('\n') } },
      { status: 500 }
    );
  }
}
