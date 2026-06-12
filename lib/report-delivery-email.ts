/**
 * Short delivery email — Daniel Priestley style (value first, sell the meeting).
 * Gmail-safe: table rows for paragraph spacing, minimal inline styles.
 */

import { businessDisplayLabel, firstNameFromValidSurvey, isMeaningfulAnswer } from './survey-quality';

const CALENDLY_URL = 'https://calendly.com/nacho-tsvetkov/30min';
const CALENDLY_LINK_LABEL = 'Book a 30-minute call';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nachotsvetkov.com';
const PHONE_DISPLAY = process.env.REPORT_CONTACT_PHONE || '+359 882 700 002';
const FROM_NAME = process.env.GMAIL_FROM_NAME || 'Nacho Tsvetkov';

const CELL =
  'font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:24px;color:#222222;';
const CELL_GAP = `${CELL}padding:0 0 18px 0;`;
const CELL_LAST = `${CELL}padding:0;`;
const LINK = 'color:#1a73e8;text-decoration:underline;';

export type DeliveryEmailParams = {
  firstName?: string;
  businessLabel: string;
  personalizedNote?: string;
  personalizedNoteHtml?: string;
  attachmentFileName: string;
};

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function emailLink(href: string, label: string): string {
  return `<a href="${escapeHtml(href)}" style="${LINK}">${escapeHtml(label)}</a>`;
}

function greetingText(firstName?: string): string {
  const name = firstName?.trim();
  return name ? `Hi ${name},` : 'Hi,';
}

function greetingHtml(firstName?: string): string {
  const name = firstName?.trim();
  return name ? `Hi ${escapeHtml(name)},` : 'Hi,';
}

function friendlySiteLabel(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./i, '');
  } catch {
    return url.replace(/^https?:\/\//i, '').replace(/\/$/, '');
  }
}

function phoneTelHref(display: string): string {
  const digits = display.replace(/[^\d+]/g, '');
  return digits ? `tel:${digits}` : display;
}

/** One paragraph per table row — spacing Gmail reliably preserves. */
function emailRows(cells: string[]): string {
  return cells
    .map((html, i) => {
      const style = i < cells.length - 1 ? CELL_GAP : CELL_LAST;
      return `<tr><td style="${style}">${html}</td></tr>`;
    })
    .join('\n');
}

function wrapEmailHtml(rows: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#ffffff;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;max-width:600px;">
    ${rows}
  </table>
</body>
</html>`;
}

function signatureRows(): string[] {
  const siteLabel = friendlySiteLabel(SITE_URL);
  return [
    'Looking forward to hearing your thoughts.',
    `Best regards,<br />${escapeHtml(FROM_NAME)}<br />${emailLink(phoneTelHref(PHONE_DISPLAY), PHONE_DISPLAY)}<br />${emailLink(SITE_URL, siteLabel)}`,
  ];
}

export function firstNameFromSurvey(email: string): string {
  return firstNameFromValidSurvey(email);
}

export function reportAttachmentFileName(businessType?: string): string {
  const label = businessDisplayLabel(businessType);
  if (label === 'your business') {
    return 'AI-Opportunity-Report.pdf';
  }
  const safe = label
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 40);
  return safe ? `AI-Opportunity-Report-${safe}.pdf` : 'AI-Opportunity-Report.pdf';
}

export function defaultReportSubject(businessType?: string): string {
  const label = businessDisplayLabel(businessType);
  if (label === 'your business') {
    return 'Your Personalized AI Opportunity Report';
  }
  return `Your Personalized AI Opportunity Report for ${label}`;
}

export function insufficientSurveySubject(): string {
  return 'Quick follow-up on your AI questionnaire — need a few more details';
}

export function buildInsufficientSurveyEmailText(firstName: string): string {
  return `${greetingText(firstName)}

Thank you for filling out the questionnaire.

I started reviewing your answers, but a few responses look incomplete or like placeholders — so I haven't attached a Personalized AI Opportunity Report yet. I prepare each report by hand from your specific business context, and I need a bit more detail to make it genuinely useful for you.

When you have a moment, could you reply with (or resubmit the form with):

• What type of business you run (be specific — e.g. "boutique fitness studio in Sofia", not "Test")
• Your biggest current frustration or bottleneck
• The results you'd most like to see from AI or automation
• A rough budget or "not sure yet"

Once I have that, I'll put together a tailored report and send it over.

If you'd prefer to talk it through live, book a quick call here:
${CALENDLY_URL}

Best regards,
${FROM_NAME}
${PHONE_DISPLAY}
${SITE_URL}`;
}

export function buildInsufficientSurveyEmailHtml(firstName: string): string {
  const rows = emailRows([
    greetingHtml(firstName),
    'Thank you for filling out the questionnaire.',
    "I started reviewing your answers, but a few responses look incomplete or like placeholders — so I haven't attached a Personalized AI Opportunity Report yet. I prepare each report by hand from your specific business context, and I need a bit more detail to make it genuinely useful for you.",
    'When you have a moment, could you reply with (or resubmit the form with):<br /><br />• What type of business you run (be specific)<br />• Your biggest current frustration or bottleneck<br />• The results you\'d most like to see from AI or automation<br />• A rough budget or &quot;not sure yet&quot;',
    "Once I have that, I'll put together a tailored report and send it over.",
    `If you'd prefer to talk it through live, ${emailLink(CALENDLY_URL, CALENDLY_LINK_LABEL)}.`,
    ...signatureRows(),
  ]);
  return wrapEmailHtml(rows);
}

export function isValidBusinessNameForReport(businessType?: string): boolean {
  return isMeaningfulAnswer(businessType, 'business_type');
}

export function buildDeliveryEmailText(params: DeliveryEmailParams): string {
  const { firstName, businessLabel, personalizedNote, attachmentFileName } = params;
  const note = personalizedNote ? `\n${personalizedNote}\n` : '';

  return `${greetingText(firstName)}

Thank you for filling out the questionnaire. I've reviewed your answers and put together a short Personalized AI Opportunity Report based on your business and goals.
${note}
You can find it attached to this email (${attachmentFileName}).

In the report, I've outlined a few areas where AI and automation could potentially help ${businessLabel}, along with some initial ideas that might be worth exploring.

If any of this resonates with you, I'd be happy to jump on a quick 15–20 minute call to walk through the ideas and see if there's a good fit to go deeper.

Would you be open to that?

Just reply to this email or use this link to book a time that works for you:
${CALENDLY_URL}

Looking forward to hearing your thoughts.

Best regards,
${FROM_NAME}
${PHONE_DISPLAY}
${SITE_URL}`;
}

export function buildDeliveryEmailHtml(params: DeliveryEmailParams): string {
  const { firstName, businessLabel, personalizedNote, personalizedNoteHtml, attachmentFileName } =
    params;

  const noteCell =
    personalizedNoteHtml ??
    (personalizedNote ? escapeHtml(personalizedNote) : null);

  const cells: string[] = [
    greetingHtml(firstName),
    "Thank you for filling out the questionnaire. I've reviewed your answers and put together a short Personalized AI Opportunity Report based on your business and goals.",
  ];

  if (noteCell) cells.push(noteCell);

  cells.push(
    `You can find it attached to this email (${escapeHtml(attachmentFileName)}).`,
    `In the report, I've outlined a few areas where AI and automation could potentially help ${escapeHtml(businessLabel)}, along with some initial ideas that might be worth exploring.`,
    "If any of this resonates with you, I'd be happy to jump on a quick 15–20 minute call to walk through the ideas and see if there's a good fit to go deeper.",
    'Would you be open to that?',
    `Just reply to this email or ${emailLink(CALENDLY_URL, CALENDLY_LINK_LABEL)} to book a time that works for you.`,
    ...signatureRows(),
  );

  return wrapEmailHtml(emailRows(cells));
}
