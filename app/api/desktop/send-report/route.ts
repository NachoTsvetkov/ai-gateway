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
import { sendGmailReportDelivery, isGmailConfigured } from 'lib/gmail-send';
import { renderReportPdf } from 'lib/report-pdf';
import { assessSurveyForReport } from 'lib/survey-quality';
import type { ReportRequestData } from 'lib/surveys';

const BodySchema = z.object({
  reportId: z.string().min(1),
  surveyId: z.string().optional(),
  toEmail: z.string().email().optional(),
  test: z.boolean().optional().default(false),
  /** Local testing only — requires ALLOW_PLACEHOLDER_REPORT_SEND=true on the server. */
  forceSend: z.boolean().optional().default(false),
});

function placeholderSendAllowed(forceSend: boolean): boolean {
  return forceSend && process.env.ALLOW_PLACEHOLDER_REPORT_SEND === 'true';
}

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

async function resolvePdfBuffer(report: {
  pdfBase64?: string;
  content?: string;
  attachmentFileName?: string;
}): Promise<{ buffer: Buffer; filename: string }> {
  const filename = report.attachmentFileName || 'AI-Opportunity-Report.pdf';
  if (report.pdfBase64) {
    return { buffer: Buffer.from(report.pdfBase64, 'base64'), filename };
  }
  if (report.content && report.content.length > 100) {
    return { buffer: await renderReportPdf(report.content), filename };
  }
  throw new Error('Report has no PDF attachment data');
}

/**
 * POST /api/desktop/send-report
 * Sends short delivery email + PDF report attachment via Gmail.
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
      content?: string;
      subject?: string;
      emailHtml?: string;
      emailText?: string;
      attachmentFileName?: string;
      pdfBase64?: string;
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

    if (surveyId && !placeholderSendAllowed(body.forceSend)) {
      const survey = await getSurveyDoc(surveyId, useTest);
      if (survey) {
        const surveyData = survey.data as ReportRequestData;
        const quality = assessSurveyForReport(surveyData);
        if (!quality.valid) {
          return NextResponse.json(
            {
              error: {
                code: 'INSUFFICIENT_SURVEY_DATA',
                message:
                  'Survey answers are too vague to send a personalized report. Ask the client for real answers and regenerate. For local pipeline testing, set ALLOW_PLACEHOLDER_REPORT_SEND=true in .env.local and AllowPlaceholderReportSend in appsettings.json.',
                reasons: quality.reasons,
              },
            },
            { status: 422 },
          );
        }
      }
    }

    const subject = report.subject || 'Your Personalized AI Opportunity Report';
    const emailHtml = report.emailHtml;
    const emailText = report.emailText;

    if (!emailHtml || !emailText) {
      return NextResponse.json(
        { error: { code: 'MISSING_EMAIL_BODY', message: 'Report has no delivery email — regenerate the report' } },
        { status: 400 },
      );
    }

    const { buffer: pdfBuffer, filename } = await resolvePdfBuffer(report);

    const gmailResult = await sendGmailReportDelivery(
      toEmail,
      subject,
      emailHtml,
      emailText,
      {
        filename,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    );

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
        bodyPreview: emailText.slice(0, 2000),
        emailHtml,
        emailText,
        attachmentFileName: filename,
        attachmentContentType: 'application/pdf',
        hasAttachment: true,
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
      {
        reportId: body.reportId,
        surveyId: surveyId ?? null,
        gmailMessageId: gmailResult.messageId,
        attachmentFileName: filename,
      },
      useTest,
      now,
    );

    if (surveyId) {
      await completePendingSendReportActions(surveyId, contactId, useTest, now);
    }

    return NextResponse.json({
      success: true,
      reportId: body.reportId,
      surveyId: surveyId ?? null,
      toEmail,
      subject,
      attachmentFileName: filename,
      gmailMessageId: gmailResult.messageId,
      sentAt: now,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to send report';
    console.error('POST /api/desktop/send-report error', err);
    return NextResponse.json({ error: { code: 'SEND_FAILED', message } }, { status: 500 });
  }
}
