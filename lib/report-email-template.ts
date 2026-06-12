/**
 * Branded HTML document for the PDF report attachment.
 * Matches audit pages: light hero, blue accents, solid colors (IE preview safe).
 */

export type ReportSection = {
  title: string;
  bodyHtml: string;
  bullets?: string[];
};

export type ReportTemplateContent = {
  subject: string;
  kicker: string;
  headline: string;
  sections: ReportSection[];
  recipientName?: string;
  sourceLabel?: string;
  businessName?: string;
};

/** Tailwind-aligned site palette (light mode / audit pages). */
const BRAND = {
  blue50: '#eff6ff',
  blue100: '#dbeafe',
  blue200: '#bfdbfe',
  blue600: '#2563eb',
  blue700: '#1d4ed8',
  blue800: '#1e40af',
  neutral50: '#fafafa',
  neutral200: '#e5e5e5',
  neutral600: '#525252',
  neutral700: '#404040',
  neutral900: '#171717',
  white: '#ffffff',
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nachotsvetkov.com';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderBullets(bullets: string[] | undefined): string {
  if (!bullets?.length) return '';
  const items = bullets
    .map((b) => `<li style="margin:0 0 8px 0;">${escapeHtml(b)}</li>`)
    .join('');
  return `<ul style="margin:12px 0 0 0;padding-left:20px;color:${BRAND.neutral700};font-size:15px;line-height:1.6;">${items}</ul>`;
}

function renderSections(sections: ReportSection[]): string {
  return sections
    .map(
      (s, i) => `
      <section style="margin:0 0 28px 0;page-break-inside:avoid;">
        <h2 style="margin:0 0 10px 0;font-size:18px;font-weight:600;color:${BRAND.neutral900};letter-spacing:-0.02em;">
          ${i + 1}. ${escapeHtml(s.title)}
        </h2>
        <div style="font-size:15px;line-height:1.65;color:${BRAND.neutral700};">${s.bodyHtml}</div>
        ${renderBullets(s.bullets)}
      </section>`,
    )
    .join('');
}

/** Full HTML document for PDF attachment and desktop report preview. */
export function wrapReportHtml(content: ReportTemplateContent): string {
  const kicker = escapeHtml(content.kicker);
  const headline = escapeHtml(content.headline);
  const business = escapeHtml(content.businessName || content.recipientName || 'Your business');
  const source = content.sourceLabel ? escapeHtml(content.sourceLabel) : 'AI Opportunity Audit';
  const preparedFor = content.recipientName ? escapeHtml(content.recipientName) : business;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(content.subject)}</title>
  <style>
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  </style>
</head>
<body style="margin:0;padding:0;background-color:${BRAND.white};font-family:system-ui,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="max-width:720px;margin:0 auto;padding:32px 24px;">
    <div style="background-color:${BRAND.blue50};border:1px solid ${BRAND.blue200};border-radius:12px;overflow:hidden;margin-bottom:32px;">
      <div style="background-color:${BRAND.blue600};height:4px;"></div>
      <div style="padding:28px 32px;text-align:center;">
        <p style="margin:0 0 8px 0;font-size:11px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:${BRAND.blue700};">${kicker}</p>
        <h1 style="margin:0;font-size:26px;font-weight:700;line-height:1.25;color:${BRAND.neutral900};letter-spacing:-0.03em;">${headline}</h1>
        <p style="margin:12px 0 0 0;font-size:14px;color:${BRAND.neutral600};">Prepared for ${preparedFor} · ${source}</p>
      </div>
    </div>

    ${renderSections(content.sections)}

    <footer style="margin-top:40px;padding-top:20px;border-top:1px solid ${BRAND.neutral200};text-align:center;">
      <p style="margin:0 0 4px 0;font-size:13px;color:${BRAND.neutral600};">Nacho Tsvetkov · Smart automation &amp; AI virtual employees</p>
      <p style="margin:0;font-size:13px;"><a href="${SITE_URL}" style="color:${BRAND.blue600};text-decoration:none;font-weight:600;">${SITE_URL.replace(/^https?:\/\//, '')}</a></p>
    </footer>
  </div>
</body>
</html>`;
}
