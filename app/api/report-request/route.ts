import { NextRequest, NextResponse } from 'next/server';
import { ReportRequestSchema, saveReportRequestResponse, getRecentReportRequests, type ReportRequestData } from 'lib/surveys';
import { z } from 'zod';

// Clean API for Personalized AI Opportunity Report requests.
// POST /api/report-request  -> save (supports ?test=true/false to choose collection; default = prod)
// GET  /api/report-request?test=false  -> recent from test collection (for verification)

const QuerySchema = z.object({
  test: z.enum(['true', 'false', '1', '0']).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Re-validate at the API boundary (untrusted input)
    const parsed = ReportRequestSchema.parse(body) as ReportRequestData;

    // Determine collection from query (matches the client form convention)
    const { test } = QuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    const useTest = test === 'true' || test === '1' || test === 'false' || test === '0'
      ? (test === 'false' || test === '0')
      : false; // default prod; ?test=false selects the local/custom test collection

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
    const useTest = test === 'true' || test === '1' || test === 'false' || test === '0'
      ? (test === 'false' || test === '0')
      : true; // default to test collection for safe verification reads

    const recent = await getRecentReportRequests(useTest, 5);

    return NextResponse.json({ success: true, collection: useTest ? 'test' : 'prod', recent });
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: 'FETCH_FAILED', message: err?.message || 'Failed to fetch recent requests' } },
      { status: 500 }
    );
  }
}
