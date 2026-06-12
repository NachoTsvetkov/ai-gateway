import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  authorizeDesktopRequest,
  desktopUnauthorizedResponse,
  requireAdminFirestore,
} from 'lib/desktop-auth';
import {
  actionsCollection,
  contactsCollection,
  reportsCollection,
  sentEmailsCollection,
  surveysCollection,
} from 'lib/desktop-collections';
import { ACTIVITIES_COLLECTION, TEST_ACTIVITIES_COLLECTION } from 'lib/firebase';
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

  const { db, error } = requireAdminFirestore();
  if (!db) return error!;

  try {
    const body = BodySchema.parse(await request.json());
    const useTest = body.test;

    const reportRef = db.collection(reportsCollection(useTest)).doc(body.reportId);
    const reportSnap = await reportRef.get();
    if (!reportSnap.exists) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: `Report ${body.reportId} not found` } },
        { status: 404 },
      );
    }

    const report = reportSnap.data() as {
      contactId: string;
      surveyResponseId?: string;
      content: string;
      contentFormat?: string;
      subject?: string;
      status?: string;
    };

    const surveyId = body.surveyId || report.surveyResponseId;
    let toEmail = body.toEmail?.trim().toLowerCase();

    if (!toEmail && surveyId) {
      const surveySnap = await db.collection(surveysCollection(useTest)).doc(surveyId).get();
      if (surveySnap.exists) {
        const survey = surveySnap.data() as { email?: string };
        toEmail = survey.email?.trim().toLowerCase();
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

    await reportRef.set(
      {
        status: 'sent',
        sentAt: now,
      },
      { merge: true },
    );

    if (surveyId) {
      await db.collection(surveysCollection(useTest)).doc(surveyId).set(
        { monitor_status: 'Sent' },
        { merge: true },
      );
    }

    const contactId = report.contactId;
    const contactRef = db.collection(contactsCollection(useTest)).doc(contactId);
    const contactSnap = await contactRef.get();
    const prevStage = contactSnap.exists
      ? ((contactSnap.data() as { funnelStage?: string }).funnelStage ?? 'survey_submitted')
      : 'survey_submitted';

    await contactRef.set(
      {
        email: toEmail,
        funnelStage: pickFunnelStage(prevStage, 'report_sent'),
        updated_at: now,
        lastActivityAt: now,
      },
      { merge: true },
    );

    const sentEmailId = sentEmailDocId('report_delivery', contactId, body.reportId);
    await db.collection(sentEmailsCollection(useTest)).doc(sentEmailId).set(
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
      { merge: true },
    );

    await db.collection(useTest ? TEST_ACTIVITIES_COLLECTION : ACTIVITIES_COLLECTION).add({
      contactId,
      type: 'report_sent',
      description: `Personalized AI Opportunity Report sent to ${toEmail}`,
      metadata: { reportId: body.reportId, surveyId: surveyId ?? null, gmailMessageId: gmailResult.messageId },
      created_at: now,
    });

    if (surveyId) {
      const actionsSnap = await db
        .collection(actionsCollection(useTest))
        .where('type', '==', 'send_report')
        .where('relatedId', '==', surveyId)
        .where('status', '==', 'pending')
        .limit(5)
        .get();

      for (const docSnap of actionsSnap.docs) {
        await docSnap.ref.set(
          {
            status: 'completed',
            completedAt: now,
            resolution: 'sent',
          },
          { merge: true },
        );
      }
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
