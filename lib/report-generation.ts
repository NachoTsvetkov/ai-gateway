import { generateObject, gateway } from 'ai';
import { z } from 'zod';
import type { ReportRequestData } from './surveys';
import {
  buildDeliveryEmailHtml,
  buildDeliveryEmailText,
  defaultReportSubject,
  reportAttachmentFileName,
} from './report-delivery-email';
import { wrapReportHtml, type ReportTemplateContent } from './report-email-template';
import { renderReportPdf } from './report-pdf';
import { assertSurveyQualityForReport, businessDisplayLabel } from './survey-quality';

const ReportContentSchema = z.object({
  headline: z.string().min(10).max(120),
  sections: z
    .array(
      z.object({
        title: z.string().min(3),
        bodyHtml: z.string().min(10),
        bullets: z.array(z.string()),
      }),
    )
    .length(7),
});

export type GeneratedReport = {
  subject: string;
  reportHtml: string;
  emailHtml: string;
  emailText: string;
  attachmentFileName: string;
  pdfBase64: string;
  content: ReportTemplateContent;
  /** @deprecated use reportHtml */
  html: string;
};

const SOURCE_LABELS: Record<string, string> = {
  'revenue-audit': 'AI Revenue Audit',
  'lead-machine': 'AI Lead Machine Audit',
  'time-back': 'AI Time-Back Audit',
  'fast-custom-app': 'Fast Custom App Audit',
  'affordable-non-tech': 'Affordable AI for Non-Tech Audit',
  'virtual-team-retainer': 'AI Virtual Team Retainer Audit',
};

const REQUIRED_SECTION_TITLES = [
  'Introduction',
  'Your Current Situation',
  'Key Opportunities I See',
  'Recommended AI Solutions',
  'Quick Wins You Could Implement',
  'Potential Business Impact',
  'Recommended Next Steps',
] as const;

function buildSystemPrompt(): string {
  return `You are an expert AI automation consultant helping small business owners.

Write a personalized, professional **AI Opportunity Report** based on the survey responses provided.

**Tone:** Professional but approachable, helpful, and confident. Avoid hype or overly salesy language. Use simple, clear language.

**Length:** 600–900 words total across all sections.

**Output format:** Structured content only (NOT a full HTML document). The website wraps your content in a branded PDF template.

**HTML rules for bodyHtml:**
- Use only: <p>, <strong>, <em>, <br> — no markdown, no headings inside bodyHtml (section titles are separate).
- No external CSS, scripts, images, or div/class/id attributes.
- Keep paragraphs short (2–4 sentences). Use bullets array for lists.

**Bullets array rules:**
- Each bullet is PLAIN TEXT only — no HTML tags, no <li>, no <strong>.
- Format: "Solution name: one sentence benefit" (the template adds bold to the title before the colon).

**Personalization:** Reference business type, goals, challenges, budget, and what they've tried. Only use details that appear in the survey — never invent specifics.

**Data quality:** If any answer looks like a placeholder (e.g. "test", "asdf", "foo", single repeated words, or identical fields), do NOT fabricate business context. Write only from distinct, substantive survey answers.

**Recommendations:** Tie to nachotsvetkov.com offerings — custom AI chatbots, automation systems, AI agents, AI-powered websites, marketing automation, retainers.

**Section structure (exact titles, this order):**
1. Introduction — thank the client; show you understood their business and main goal
2. Your Current Situation — empathetic summary of challenges from the survey
3. Key Opportunities I See — 3–5 high-level opportunities (use bullets)
4. Recommended AI Solutions — 2–4 specific solutions with expected benefit and complexity (use bullets)
5. Quick Wins You Could Implement — 2–3 practical suggestions without hiring help (use bullets)
6. Potential Business Impact — realistic, conservative time/revenue impact; no guaranteed numbers
7. Recommended Next Steps — soft invitation to book a discovery call (no invented URLs)

**headline:** Tailored to business_type and main pain (short, benefit-oriented)

**Rules:** No specific revenue promises. Helpful not salesy. Custom-written feel. No markdown.`;
}

function buildUserPrompt(survey: ReportRequestData & { id?: string }): string {
  return `Write the report for this survey.

The survey has already been validated — all answers below are real client input. Personalize every section from these specifics.

Use exactly these section titles in order: ${REQUIRED_SECTION_TITLES.join(' | ')}

Survey data:
${JSON.stringify(
  {
    id: survey.id,
    source: survey.source,
    business_type: survey.business_type,
    pain: survey.pain,
    desired_results: survey.desired_results,
    tried_so_far: survey.tried_so_far ?? '',
    budget: survey.budget,
    interest: survey.interest,
    email: survey.email,
    additional_details: survey.additional_details ?? '',
    page_url: survey.page_url ?? '',
    created_at: (survey as { created_at?: string }).created_at ?? '',
  },
  null,
  2,
)}`;
}

export async function generateOpportunityReport(
  survey: ReportRequestData & { id?: string; created_at?: string },
): Promise<GeneratedReport> {
  const quality = assertSurveyQualityForReport(survey);
  const businessType = quality.businessType!;
  const businessLabel = businessDisplayLabel(businessType);
  const firstName = quality.firstName || undefined;
  const personalizedNote = quality.personalizedNote;
  const personalizedNoteHtml = quality.personalizedNoteHtml;

  const { object } = await generateObject({
    model: gateway('openai/gpt-4o'),
    schema: ReportContentSchema,
    system: buildSystemPrompt(),
    prompt: buildUserPrompt(survey),
  });

  const subject = defaultReportSubject(businessType);

  const content: ReportTemplateContent = {
    subject,
    kicker: 'Personalized AI Opportunity Report',
    headline: object.headline,
    sections: object.sections,
    recipientName: quality.businessName,
    businessName: quality.businessName,
    sourceLabel: SOURCE_LABELS[survey.source] || survey.source,
  };

  const reportHtml = wrapReportHtml(content);
  const attachmentFileName = reportAttachmentFileName(businessType);

  const deliveryParams = {
    firstName,
    businessLabel,
    personalizedNote,
    personalizedNoteHtml,
    attachmentFileName,
  };

  const emailHtml = buildDeliveryEmailHtml(deliveryParams);
  const emailText = buildDeliveryEmailText(deliveryParams);
  const pdfBuffer = await renderReportPdf(reportHtml);
  const pdfBase64 = pdfBuffer.toString('base64');

  return {
    subject,
    reportHtml,
    html: reportHtml,
    emailHtml,
    emailText,
    attachmentFileName,
    pdfBase64,
    content,
  };
}

export const generateOpportunityReportHtml = generateOpportunityReport;
