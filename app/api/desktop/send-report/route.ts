import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authorizeDesktopRequest, desktopUnauthorizedResponse } from 'lib/desktop-auth';
import {
  completePendingSendReportActions,
  getContactDoc,
  getReportDoc,
  getSurveyDoc,
  logReportSentActivity,
  logSentEmailDoc,
  markReportSent,
  setSurveyMonitorStatus,
  upsertContactReportSent,
} from 'lib/desktop-firestore';
import { sendGmailHtml, isGmailConfigured } from 'lib/gmail-send';

const BodySchema = z.object({
  reportId: z.string().min(1),
  surveyId: z.string().optional(),
  toEmail: z.string().email().optional(),
  test: z.boolean().optional().default(false),
});

const STAGE_RANK: Record<string, number> = {
  marketing_lead: 10,
  survey_submitted: 20,
  order_created: 30,
  order_paid: 40,
  report_sent: 50,
  meeting_booked: 60,
};

function sentEmailDocId(template: string, contactId: string, relatedId?: string) {
  const suffix = relatedId ? `_${relatedId.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40)}` : '';
  return `sem_${template}_${contactId}${suffix}`.slice(0, 150);
}

function pickFunnelStage(existing: string | undefined, incoming: string): string {
  if (!existing) return incoming;
  const cur = STAGE_RANK[existing] ?? 0;
  const next = STAGE_RANK[incoming] ?? 0;
  return next >= cur ? incoming : existing;
}

/**
 * POST /api/desktop/send-report
 * Sends a generated HTML report via Gmail and updates Firestore journey state.
 * Header: X-Desktop-Sync-Secret
 */
export async function POST(request: NextRequest) {
  if (!authorizeDesktopRequest(request)) return desktopUnauthorizedResponse();

  if (!isGmailConfigured()) {
    return NextResponse.json(
      {
        error: {
          code: 'GMAIL_NOT_CONFIGURED',
          message:
            'Gmail SMTP is not configured. Set GMAIL_SMTP_USER and GMAIL_SMTP_APP_PASSWORD in .env.local.',
        },
      },
      { status: 503 },
    );
  }

  try {
    const body = BodySchema.parse(await request.json());
    const useTest = body.test;

    const reportDoc = await getReportDoc(body.reportId, useTest);
    if (!reportDoc) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: `Report ${body.reportId} not found` } },
        { status: 404 },
      );
    }

    const report = reportDoc.data as {
      contactId: string;
      surveyResponseId?: string;
      content: string;
      subject?: string;
    };

    const surveyId = body.surveyId || report.surveyResponseId;
    let toEmail = body.toEmail?.trim().toLowerCase();

    if (!toEmail && surveyId) {
      const survey = await getSurveyDoc(surveyId, useTest);
      if (survey) {
        toEmail = (survey.data.email as string | undefined)?.trim().toLowerCase();
      }
    }

    if (!toEmail) {
      return NextResponse.json(
        { error: { code: 'MISSING_EMAIL', message: 'No recipient email — pass toEmail or link surveyId' } },
        { status: 400 },
      );
    }

    const subject = report.subject || 'Your Personalized AI Opportunity Report';
    const html = report.content;
    if (!html || html.length < 100) {
      return NextResponse.json(
        { error: { code: 'EMPTY_REPORT', message: 'Report has no HTML content' } },
        { status: 400 },
      );
    }

    const gmailResult = await sendGmailHtml(toEmail, subject, html);
    const now = new Date().toISOString();

    await markReportSent(body.reportId, useTest, now);

    if (surveyId) {
      await setSurveyMonitorStatus(surveyId, 'Sent', useTest);
    }

    const contactId = report.contactId;
    const existingContact = await getContactDoc(contactId, useTest);
    const prevStage = existingContact
      ? ((existingContact.data.funnelStage as string | undefined) ?? 'survey_submitted')
      : 'survey_submitted';

    await upsertContactReportSent(
      contactId,
      toEmail,
      pickFunnelStage(prevStage, 'report_sent'),
      useTest,
      now,
    );

    const sentEmailId = sentEmailDocId('report_delivery', contactId, body.reportId);
    await logSentEmailDoc(
      sentEmailId,
      {
        contactId,
        toEmail,
        subject,
        template: 'report_delivery',
        category: 'correspondence',
        bodyPreview: html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 2000),
        status: 'sent',
        sentAt: now,
        created_at: now,
        relatedType: 'report',
        relatedId: body.reportId,
      },
      useTest,
    );

    await logReportSentActivity(
      contactId,
      `Personalized AI Opportunity Report sent to ${toEmail}`,
      { reportId: body.reportId, surveyId: surveyId ?? null, gmailMessageId: gmailResult.messageId },
      useTest,
      now,
    );

    if (surveyId) {
      await completePendingSendReportActions(surveyId, useTest, now);
    }

    return NextResponse.json({
      success: true,
      reportId: body.reportId,
      surveyId: surveyId ?? null,
      toEmail,
      subject,
      gmailMessageId: gmailResult.messageId,
      sentAt: now,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to send report';
    console.error('POST /api/desktop/send-report error', err);
    return NextResponse.json({ error: { code: 'SEND_FAILED', message } }, { status: 500 });
  }
}
