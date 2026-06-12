import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authorizeDesktopRequest, desktopUnauthorizedResponse } from 'lib/desktop-auth';
import {
  createReportDoc,
  getSurveyDoc,
  setSurveyMonitorStatus,
} from 'lib/desktop-firestore';
import { generateOpportunityReportHtml } from 'lib/report-generation';
import { contactIdFromEmail } from 'lib/journey';
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

    const reportId = await createReportDoc(useTest, {
      contactId,
      surveyResponseId: body.surveyId,
      status: 'ready',
      content: generated.html,
      contentFormat: 'html',
      subject: generated.subject,
      created_at: now,
    });

    await setSurveyMonitorStatus(body.surveyId, 'ReportReady', useTest);

    return NextResponse.json({
      success: true,
      reportId,
      surveyId: body.surveyId,
      contactId,
      toEmail: surveyData.email.trim().toLowerCase(),
      subject: generated.subject,
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
