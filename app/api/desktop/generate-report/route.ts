import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  authorizeDesktopRequest,
  desktopUnauthorizedResponse,
} from 'lib/desktop-auth';
import {
  findReportBySurveyId,
  getReportDoc,
  logReportGeneratedActivity,
  saveReportRecord,
  setSurveyMonitorStatus,
  getSurveyDoc,
} from 'lib/desktop-firestore';
import { generateOpportunityReportHtml } from 'lib/report-generation';
import { contactIdFromEmail } from 'lib/journey';
import { buildReportRecord } from 'lib/report-records';
import type { ReportRequestData } from 'lib/surveys';

export const maxDuration = 120;

const BodySchema = z.object({
  surveyId: z.string().min(1),
  test: z.boolean().optional().default(false),
});

/**
 * POST /api/desktop/generate-report
 * Generates a branded HTML report via AI Gateway and saves it to Firestore.
 * Header: X-Desktop-Sync-Secret
 */
export async function POST(request: NextRequest) {
  if (!authorizeDesktopRequest(request)) return desktopUnauthorizedResponse();

  if (!process.env.AI_GATEWAY_API_KEY) {
    return NextResponse.json(
      {
        error: {
          code: 'AI_NOT_CONFIGURED',
          message: 'AI_GATEWAY_API_KEY is not set on the website server.',
        },
      },
      { status: 503 },
    );
  }

  let surveyIdForRevert: string | null = null;
  let useTestForRevert = false;

  try {
    const body = BodySchema.parse(await request.json());
    const useTest = body.test;
    surveyIdForRevert = body.surveyId;
    useTestForRevert = useTest;

    const survey = await getSurveyDoc(body.surveyId, useTest);
    if (!survey) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: `Survey ${body.surveyId} not found` } },
        { status: 404 },
      );
    }

    const surveyData = survey.data as ReportRequestData & {
      contactId?: string;
      created_at?: string;
      monitor_status?: string;
    };

    await setSurveyMonitorStatus(body.surveyId, 'GeneratingReport', useTest);

    const generated = await generateOpportunityReportHtml({
      ...surveyData,
      id: body.surveyId,
    });

    const now = new Date().toISOString();
    const contactId = surveyData.contactId || contactIdFromEmail(surveyData.email);

    const record = buildReportRecord(
      { ...surveyData, id: body.surveyId },
      contactId,
      generated,
      generated.content,
    );

    const reportId = await saveReportRecord(body.surveyId, useTest, record);

    await setSurveyMonitorStatus(body.surveyId, 'ReportReady', useTest);
    await logReportGeneratedActivity(contactId, body.surveyId, reportId, useTest, now);

    return NextResponse.json({
      success: true,
      reportId,
      surveyId: body.surveyId,
      contactId,
      toEmail: surveyData.email.trim().toLowerCase(),
      subject: generated.subject,
      headline: record.headline,
      html: generated.html,
    });
  } catch (err: unknown) {
    if (surveyIdForRevert) {
      try {
        await setSurveyMonitorStatus(surveyIdForRevert, 'New', useTestForRevert);
      } catch {
        /* ignore revert failure */
      }
    }
    const message = err instanceof Error ? err.message : 'Report generation failed';
    console.error('POST /api/desktop/generate-report error', err);
    return NextResponse.json({ error: { code: 'GENERATION_FAILED', message } }, { status: 500 });
  }
}

/**
 * GET /api/desktop/generate-report?reportId=... or ?surveyId=...
 * Fetch a saved report (full HTML) for desktop preview/resend.
 */
export async function GET(request: NextRequest) {
  if (!authorizeDesktopRequest(request)) return desktopUnauthorizedResponse();

  const reportId = request.nextUrl.searchParams.get('reportId');
  const surveyId = request.nextUrl.searchParams.get('surveyId');
  const useTest = request.nextUrl.searchParams.get('test') === 'true';

  if (!reportId && !surveyId) {
    return NextResponse.json(
      { error: { code: 'BAD_REQUEST', message: 'Pass reportId or surveyId' } },
      { status: 400 },
    );
  }

  const doc = reportId
    ? await getReportDoc(reportId, useTest)
    : await findReportBySurveyId(surveyId!, useTest);

  if (!doc) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'Report not found' } },
      { status: 404 },
    );
  }

  const data = doc.data;
  return NextResponse.json({
    success: true,
    reportId: reportId ?? doc.ref.id,
    surveyId: data.surveyResponseId ?? null,
    contactId: data.contactId,
    toEmail: data.toEmail ?? null,
    subject: data.subject ?? null,
    headline: data.headline ?? null,
    status: data.status ?? null,
    contentFormat: data.contentFormat ?? 'html',
    html: data.content ?? '',
    bodyPreview: data.bodyPreview ?? null,
    created_at: data.created_at ?? null,
    sentAt: data.sentAt ?? null,
  });
}
