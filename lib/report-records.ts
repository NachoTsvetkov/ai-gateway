import type { ReportTemplateContent } from './report-email-template';
import type { GeneratedReport } from './report-generation';
import type { ReportRequestData } from './surveys';

export type ReportStatus = 'ready' | 'sent' | 'draft';

/** Persisted Firestore shape for reports / reports_test. */
export type ReportRecord = {
  contactId: string;
  surveyResponseId: string;
  toEmail: string;
  surveySource: string;
  status: ReportStatus;
  contentFormat: 'html';
  subject: string;
  headline: string;
  kicker: string;
  sourceLabel: string;
  content: string;
  bodyPreview: string;
  model: string;
  generatedBy: 'website-api';
  created_at: string;
  updated_at: string;
  sentAt?: string;
};

export const REPORT_MODEL_ID = 'openai/gpt-4o';

export function stripHtmlPreview(html: string, max = 500): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
}

/** Stable doc id — one canonical report per survey (regenerate overwrites). */
export function reportDocIdFromSurvey(surveyId: string): string {
  const safe = surveyId.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80);
  return `rpt_${safe}`;
}

export function buildReportRecord(
  survey: ReportRequestData & { id: string; contactId?: string; created_at?: string },
  contactId: string,
  generated: GeneratedReport,
  content: ReportTemplateContent,
): ReportRecord {
  const now = new Date().toISOString();
  return {
    contactId,
    surveyResponseId: survey.id,
    toEmail: survey.email.trim().toLowerCase(),
    surveySource: survey.source,
    status: 'ready',
    contentFormat: 'html',
    subject: generated.subject,
    headline: content.headline,
    kicker: content.kicker,
    sourceLabel: content.sourceLabel ?? survey.source,
    content: generated.html,
    bodyPreview: stripHtmlPreview(generated.html),
    model: REPORT_MODEL_ID,
    generatedBy: 'website-api',
    created_at: now,
    updated_at: now,
  };
}
