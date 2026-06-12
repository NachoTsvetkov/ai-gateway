import { generateObject, gateway } from 'ai';
import { z } from 'zod';
import type { ReportRequestData } from './surveys';
import { wrapReportHtml, type ReportTemplateContent } from './report-email-template';

const ReportContentSchema = z.object({
  subject: z.string().min(10).max(120),
  kicker: z.string().min(3).max(80),
  headline: z.string().min(10).max(120),
  introHtml: z.string().min(20),
  sections: z
    .array(
      z.object({
        title: z.string().min(3),
        bodyHtml: z.string().min(10),
        bullets: z.array(z.string()).optional(),
      }),
    )
    .min(6)
    .max(6),
  closingHtml: z.string().min(20),
});

export type GeneratedReport = {
  subject: string;
  html: string;
  content: ReportTemplateContent;
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
  'Your Current Situation',
  'Key Opportunities I See',
  'Recommended AI Solutions',
  'Quick Wins You Could Implement',
  'Potential Business Impact',
  'Recommended Next Steps',
] as const;

function buildSystemPrompt(): string {
  return `You are an expert AI automation consultant helping small business owners. You write Personalized AI Opportunity Reports for Nacho Tsvetkov's free audit offer (nachotsvetkov.com).

**Tone:** Professional but approachable, helpful, and confident. Avoid hype or overly salesy language. Use simple, clear language.

**Length:** Aim for 600–900 words total across all sections.

**Output format:** Structured content only (NOT a full HTML document). The website wraps your content in a branded email template automatically.

**HTML rules for introHtml, bodyHtml, closingHtml:**
- Use only email-safe inline-friendly tags: <p>, <strong>, <em>, <br> — no markdown, no headings inside bodyHtml (section titles are separate).
- No external CSS, no <style> blocks, no JavaScript, no images, no div/class/id attributes.
- Keep paragraphs short (2–4 sentences). Use bullets array for lists (plain text strings, no HTML in bullets).

**Personalization:** Reference the client's business type, goals, challenges, budget, and what they've tried from the survey.

**Recommendations:** Tie solutions to real offerings on nachotsvetkov.com:
- Custom AI chatbots and virtual employees / AI receptionists
- Business automation systems and AI agents
- AI-powered websites and Shopify storefront integrations (voice shopping, visual stylist, cart recovery, analytics)
- Marketing automation
- Retainer-based AI virtual team support

**Section structure (exact titles for the sections array, in this order):**
1. Your Current Situation — empathetic summary of their challenges from the survey
2. Key Opportunities I See — 3–5 high-level opportunities (use bullets)
3. Recommended AI Solutions — 2–4 specific solutions tied to nachotsvetkov.com offerings; for each mention expected benefit and relative complexity (use bullets)
4. Quick Wins You Could Implement — 2–3 practical suggestions they could do quickly without hiring help (use bullets)
5. Potential Business Impact — realistic, conservative estimate of time/money saved or revenue gained; do NOT promise specific revenue numbers
6. Recommended Next Steps — clear, low-pressure CTA to book a free discovery call (Calendly link is added by the template — do not invent URLs)

**introHtml:** Introduction section — thank them and show you understood their business and main goal (1–2 paragraphs).

**closingHtml:** Warm personal sign-off from Nacho (1 short paragraph). Mention the report was prepared from their survey answers.

**subject:** Personal, not spammy — e.g. "Your Personalized AI Opportunity Report — [Business Type]"

**kicker:** "Personalized AI Opportunity Report"

**headline:** Tailored to their business_type and main pain (short, benefit-oriented)

**Important rules:**
- Do not promise specific results or guaranteed revenue.
- Focus on value and possibilities, not hard selling.
- Make it feel custom-written for this specific business.
- Do not output markdown.`;
}

function buildUserPrompt(survey: ReportRequestData & { id?: string }): string {
  return `Write the report content for this survey submission.

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

export async function generateOpportunityReportHtml(
  survey: ReportRequestData & { id?: string; created_at?: string },
): Promise<GeneratedReport> {
  const { object } = await generateObject({
    model: gateway('openai/gpt-4o'),
    schema: ReportContentSchema,
    system: buildSystemPrompt(),
    prompt: buildUserPrompt(survey),
  });

  const content: ReportTemplateContent = {
    ...object,
    recipientName: survey.business_type || survey.email.split('@')[0],
    sourceLabel: SOURCE_LABELS[survey.source] || survey.source,
  };

  const html = wrapReportHtml(content);

  return {
    subject: object.subject,
    html,
    content,
  };
}
