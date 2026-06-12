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
import { generateOpportunityReport } from 'lib/report-generation';
import { SurveyQualityError } from 'lib/survey-quality';
import { contactIdFromEmail } from 'lib/journey';
import { buildReportRecord } from 'lib/report-records';
import type { ReportRequestData } from 'lib/surveys';

export const maxDuration = 180;

const BodySchema = z.object({
  surveyId: z.string().min(1),
  test: z.boolean().optional().default(false),
});

function reportPayload(data: Record<string, unknown>, reportId: string) {
  return {
    success: true,
    reportId,
    surveyId: data.surveyResponseId ?? null,
    contactId: data.contactId,
    toEmail: data.toEmail ?? null,
    subject: data.subject ?? null,
    headline: data.headline ?? null,
    status: data.status ?? null,
    contentFormat: data.contentFormat ?? 'html',
    html: data.content ?? '',
    reportHtml: data.content ?? '',
    emailHtml: data.emailHtml ?? '',
    emailText: data.emailText ?? '',
    attachmentFileName: data.attachmentFileName ?? null,
    attachmentContentType: data.attachmentContentType ?? 'application/pdf',
    bodyPreview: data.bodyPreview ?? null,
    created_at: data.created_at ?? null,
    sentAt: data.sentAt ?? null,
    hasPdfAttachment: Boolean(data.pdfBase64),
  };
}

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

    const generated = await generateOpportunityReport({
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
      ...reportPayload(record as unknown as Record<string, unknown>, reportId),
      surveyId: body.surveyId,
      pdfBase64: generated.pdfBase64,
    });
  } catch (err: unknown) {
    if (surveyIdForRevert) {
      try {
        await setSurveyMonitorStatus(surveyIdForRevert, 'New', useTestForRevert);
      } catch {
        /* ignore */
      }
    }

    if (err instanceof SurveyQualityError) {
      return NextResponse.json(
        {
          error: {
            code: err.code,
            message: err.message,
            reasons: err.reasons,
          },
        },
        { status: 422 },
      );
    }

    const message = err instanceof Error ? err.message : 'Report generation failed';
    console.error('POST /api/desktop/generate-report error', err);
    return NextResponse.json({ error: { code: 'GENERATION_FAILED', message } }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  if (!authorizeDesktopRequest(request)) return desktopUnauthorizedResponse();

  const reportId = request.nextUrl.searchParams.get('reportId');
  const surveyId = request.nextUrl.searchParams.get('surveyId');
  const useTest = request.nextUrl.searchParams.get('test') === 'true';
  const includePdf = request.nextUrl.searchParams.get('includePdf') === 'true';

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
  const payload = reportPayload(data, reportId ?? doc.ref.id);

  if (includePdf && data.pdfBase64) {
    return NextResponse.json({ ...payload, pdfBase64: data.pdfBase64 });
  }

  return NextResponse.json(payload);
}
