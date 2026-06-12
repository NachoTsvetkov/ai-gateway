/**
 * Branded HTML email wrapper for Personalized AI Opportunity Reports.
 * Matches the website audit pages: blue hero, neutral body, rounded card, Geist-like stack.
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
  introHtml: string;
  sections: ReportSection[];
  closingHtml: string;
  recipientName?: string;
  sourceLabel?: string;
};

const BRAND = {
  blue600: '#2563eb',
  blue700: '#1d4ed8',
  violet600: '#7c3aed',
  neutral50: '#fafafa',
  neutral200: '#e5e5e5',
  neutral600: '#525252',
  neutral700: '#404040',
  neutral900: '#171717',
  white: '#ffffff',
  green50: '#f0fdf4',
  green700: '#15803d',
};

const CALENDLY_URL = 'https://calendly.com/nacho-tsvetkov/30min';
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
  const items = bullets.map((b) => `<li style="margin:0 0 8px 0;">${b}</li>`).join('');
  return `<ul style="margin:12px 0 0 0;padding-left:20px;color:${BRAND.neutral700};font-size:15px;line-height:1.6;">${items}</ul>`;
}

function renderSections(sections: ReportSection[]): string {
  return sections
    .map(
      (s) => `
      <tr>
        <td style="padding:0 0 24px 0;">
          <h2 style="margin:0 0 10px 0;font-size:20px;font-weight:600;color:${BRAND.neutral900};letter-spacing:-0.02em;">${escapeHtml(s.title)}</h2>
          <div style="font-size:15px;line-height:1.65;color:${BRAND.neutral700};">${s.bodyHtml}</div>
          ${renderBullets(s.bullets)}
        </td>
      </tr>`,
    )
    .join('');
}

/** Full HTML document suitable for email clients and desktop preview. */
export function wrapReportHtml(content: ReportTemplateContent): string {
  const kicker = escapeHtml(content.kicker);
  const headline = escapeHtml(content.headline);
  const recipient = content.recipientName ? escapeHtml(content.recipientName) : 'there';
  const source = content.sourceLabel ? escapeHtml(content.sourceLabel) : 'AI Opportunity Audit';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(content.subject)}</title>
</head>
<body style="margin:0;padding:0;background-color:${BRAND.neutral50};font-family:system-ui,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:${BRAND.neutral50};">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;">
          <!-- Hero band -->
          <tr>
            <td style="background:linear-gradient(135deg, ${BRAND.blue600} 0%, ${BRAND.violet600} 100%);border-radius:16px 16px 0 0;padding:28px 32px;text-align:center;">
              <p style="margin:0 0 8px 0;font-size:12px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.9);">${kicker}</p>
              <h1 style="margin:0;font-size:28px;font-weight:700;line-height:1.2;color:${BRAND.white};letter-spacing:-0.03em;">${headline}</h1>
              <p style="margin:12px 0 0 0;font-size:14px;color:rgba(255,255,255,0.85);">${source}</p>
            </td>
          </tr>
          <!-- Card body -->
          <tr>
            <td style="background-color:${BRAND.white};border:1px solid ${BRAND.neutral200};border-top:none;border-radius:0 0 16px 16px;padding:32px;">
              <p style="margin:0 0 20px 0;font-size:16px;line-height:1.65;color:${BRAND.neutral700};">
                Hi ${recipient},
              </p>
              <div style="font-size:15px;line-height:1.65;color:${BRAND.neutral700};margin-bottom:28px;">
                ${content.introHtml}
              </div>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                ${renderSections(content.sections)}
              </table>
              <div style="margin:28px 0;font-size:15px;line-height:1.65;color:${BRAND.neutral700};">
                ${content.closingHtml}
              </div>
              <!-- CTA -->
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin:32px 0 8px 0;">
                <tr>
                  <td style="border-radius:12px;background-color:${BRAND.blue600};">
                    <a href="${CALENDLY_URL}" style="display:inline-block;padding:14px 28px;font-size:16px;font-weight:600;color:${BRAND.white};text-decoration:none;">Book a free 30‑min strategy call</a>
                  </td>
                </tr>
              </table>
              <p style="margin:16px 0 0 0;font-size:13px;color:${BRAND.neutral600};">
                Or reply to this email — I personally review every report.
              </p>
              <!-- Trust badge -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:28px;">
                <tr>
                  <td style="background-color:${BRAND.green50};border:1px solid #bbf7d0;border-radius:12px;padding:16px 20px;">
                    <p style="margin:0;font-size:14px;line-height:1.5;color:${BRAND.green700};">
                      <strong>100% free, no obligation.</strong> This report was prepared from your survey answers and reviewed personally before sending.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 8px;text-align:center;">
              <p style="margin:0 0 6px 0;font-size:13px;color:${BRAND.neutral600};">
                Nacho Tsvetkov · Smart automation &amp; AI virtual employees
              </p>
              <p style="margin:0;font-size:13px;">
                <a href="${SITE_URL}" style="color:${BRAND.blue600};text-decoration:none;">${SITE_URL.replace(/^https?:\/\//, '')}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
