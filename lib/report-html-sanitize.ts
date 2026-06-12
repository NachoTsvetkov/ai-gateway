/**
 * Allow only safe inline HTML in AI-generated report fragments (PDF rendering).
 */

const ALLOWED_TAG = /^(strong|em|br|p)$/i;

export function stripListItemWrapper(text: string): string {
  return text
    .replace(/^<\s*li[^>]*>/i, '')
    .replace(/<\s*\/\s*li\s*>$/i, '')
    .trim();
}

/** Remove disallowed tags; keep strong, em, br, p. */
export function sanitizeReportInlineHtml(html: string): string {
  let s = stripListItemWrapper(html);
  s = s.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g, (match, tagName: string) => {
    if (ALLOWED_TAG.test(tagName)) return match;
    return '';
  });
  return s;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Render a bullet: plain "Title: detail" or sanitized inline HTML from the model. */
export function formatReportBulletHtml(bullet: string): string {
  const raw = stripListItemWrapper(bullet.trim());
  if (!raw) return '';

  if (/<[a-z]/i.test(raw)) {
    return sanitizeReportInlineHtml(raw);
  }

  const colonIdx = raw.indexOf(':');
  if (colonIdx > 0 && colonIdx < 72) {
    const title = escapeHtml(raw.slice(0, colonIdx).trim());
    const detail = escapeHtml(raw.slice(colonIdx + 1).trim());
    return `<strong>${title}</strong>: ${detail}`;
  }

  return escapeHtml(raw);
}
