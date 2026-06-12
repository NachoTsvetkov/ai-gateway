---
name: generate-ai-opportunity-report
description: >
  Generate a high-quality Personalized AI Opportunity Report (Chaos Phase / free audit deliverable) from a survey submission.
  Output is **email-ready HTML** (not Markdown) styled like nachotsvetkov.com — blue/violet hero, white card, Calendly CTA.
  Trigger when a new submission appears or when the desktop monitor / website API needs a client report.
  For the canonical copy-paste prompt see prompts/ai-opportunity-report-email.prompt.md.
  For the programmatic wrapper see lib/report-email-template.ts and lib/report-generation.ts.
metadata:
  short-description: "HTML email AI Opportunity Report from survey submissions"
  scope: repo
  related: project-conventions, vercel
---

# generate-ai-opportunity-report

Turn raw "AI Opportunity Audit" survey answers into a **branded HTML email** the owner can preview and send to the lead.

## Mandatory first steps

1. Read the local high-priority `project-conventions` skill.
2. At the workspace root, read (if present):
   - `Grok_Build_Instructions_All_Value_Propositions_Chaos_Phase.md`
   - `Daniel_Priestley_Chaos_Phase_Survey_Questions.md`
3. Read `prompts/ai-opportunity-report-email.prompt.md` for the full HTML + brand spec.
4. Reference `lib/report-email-template.ts` for exact colors and layout when building HTML by hand.

## Input

Single submission as JSON:

```json
{
  "id": "...",
  "source": "revenue-audit",
  "business_type": "...",
  "pain": "...",
  "desired_results": "...",
  "tried_so_far": "...",
  "budget": "...",
  "interest": 7,
  "email": "customer@example.com",
  "additional_details": "...",
  "page_url": "...",
  "created_at": "2026-..."
}
```

## Output format — HTML email (required)

**Do NOT output Markdown.** The deliverable is a complete HTML document usable as a Gmail/Outlook email body.

### Email HTML rules

- Table-based layout with `role="presentation"`; max width 640px, centered.
- **Inline styles only** — no `<style>` blocks, no external CSS, no JavaScript, no images.
- Font: `system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`
- Allowed tags: `html`, `head`, `body`, `table`, `tr`, `td`, `p`, `h1`, `h2`, `ul`, `li`, `strong`, `em`, `a`, `br`

### Brand colors (exact)

| Token | Hex |
|-------|-----|
| Page background | `#fafafa` |
| Card / body bg | `#ffffff` |
| Card border | `#e5e5e5` |
| Hero gradient | `#2563eb` → `#7c3aed` (135deg) |
| Primary blue (CTA, links) | `#2563eb` |
| Body text | `#404040` |
| Section headings | `#171717` |
| Muted / footer | `#525252` |
| Trust badge bg / border / text | `#f0fdf4` / `#bbf7d0` / `#15803d` |

### Layout structure

1. **Hero** — kicker "Personalized AI Opportunity Report", personalized H1, audit source subtitle.
2. **Card body** — greeting, 7 content sections (h2), Calendly CTA button, trust badge.
3. **Footer** — "Nacho Tsvetkov · Smart automation & AI virtual employees" + nachotsvetkov.com link.

**Calendly CTA (always):** https://calendly.com/nacho-tsvetkov/30min — button text: "Book a free 30‑min strategy call"

## Content structure (exact h2 headings)

1. Introduction
2. Your Current Situation
3. Key Opportunities I See
4. Recommended AI Solutions
5. Quick Wins You Could Implement
6. Potential Business Impact
7. Recommended Next Steps

### Content rules

- Tone: professional, approachable, confident — no hype or hard selling.
- Length: 600–900 words.
- Personalize from survey: business type, pain, goals, budget, tried_so_far, interest.
- Tie recommendations to nachotsvetkov.com: AI chatbots, automation, AI agents, Shopify AI integrations, marketing automation, retainers.
- Do **not** promise specific revenue or guaranteed results.
- Subject line format: `Your Personalized AI Opportunity Report — [Business Type]`

## Where to write output

### Headless / Grok CLI (desktop monitor legacy path)

Write the full HTML file to:

`reports/{sanitized-email}-{YYYYMMDD-HHmm}-ai-opportunity-report.html`

Also write a one-line `.subject.txt` alongside with the suggested email subject.

Print the full absolute path(s) when done. **Do not send to the customer** — human reviews first (semi-auto flow).

### Website API path (preferred)

The Next.js API `POST /api/desktop/generate-report` uses `lib/report-generation.ts`:
- Model returns structured JSON (intro + 6 sections + subject).
- `lib/report-email-template.ts` wraps it in the branded shell above.
- Do not duplicate the wrapper when editing generation logic — update the prompt in `report-generation.ts` and/or `prompts/ai-opportunity-report-email.prompt.md`.

## Quality bar

- Every recommendation must feel personally reviewed and grounded in real offers (Shopify AI agents, voice shopping, visual stylist, cart recovery, analytics, bundles, services).
- Use "smart automation" and "autonomous virtual employees" in customer-facing copy (see project-conventions).
- Report must render correctly in the desktop **ReportPreviewForm** WebBrowser preview before send.

## Related files

| File | Purpose |
|------|---------|
| `prompts/ai-opportunity-report-email.prompt.md` | Full ChatGPT copy-paste prompt |
| `lib/report-email-template.ts` | Branded HTML wrapper (programmatic) |
| `lib/report-generation.ts` | AI Gateway structured generation |
| `app/api/desktop/generate-report/route.ts` | Website generate API |
| `app/api/desktop/send-report/route.ts` | Gmail send after preview |
