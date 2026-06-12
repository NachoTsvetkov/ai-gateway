---
name: project-conventions
description: >
  Project-specific conventions, invariants, and gotchas for Nacho Tsvetkov's AI-powered money-generator portfolio / Shopify AI storefront demo (the current active repo). Must be respected on any task touching marketing copy, demo "brand illusion", i18n data duality, AI agent behavioral rules, the HIDE_NAVBAR_ON shells, bundles/services/projects data files, or the real cart/checkout flows. Higher priority than generic nextjs or shopify skills.
metadata:
  short-description: "This exact project's rules and gotchas"
  scope: repo
---

# Project Conventions (my-shopify-ai / ai-gateway)

This is the living spec for how this particular Next.js + Shopify + AI agents codebase is supposed to behave and look. These rules come from code comments, data file structure, layout logic, prompt engineering in the agents, and business positioning ("professional website + smart automation that turns small businesses into 24/7 money generators").

## Brand Illusion Rules (Critical)

Several sub-apps are presented as if they are independent real businesses:

- `/projects/ai-shopify-store` ("Curated.") — clean white premium DTC feel (no dark mode variants inside the shell). Uses `ShopShell`, real hero, three-item grid, category tiles, carousel, etc. The global marketing navbar is hidden.
- `/projects/local-fitness-studio` — KORE (warm orange/cream), KoreShell + AI receptionist.
- `/projects/boutique-fashion-brand` — ROZÉ (cream + blush + serif, Bulgarian), RozeShell + personal stylist + recovery.

**Never** add marketing nav, portfolio cross-links, "demo" pills, "built with" badges, or global theme overrides inside these routes that would shatter the "this is the real brand site" experience for a visitor. The only hint it's part of nachotsvetkov.com is the URL itself.

The outer marketing site (home, /services, /bundles, /projects listing, main AI features) uses the full Navbar + language toggle (BG only) + theme pill + i18n.

## Marketing Copy & "AI" Word Rules

From the sales-assistant prompt and home page copy:
- In customer-facing headlines and high-level positioning: prefer "smart automation", "autonomous virtual employees", "voice agents", "money generator" language.
- The word "AI" is acceptable in technical contexts, skill names, tech stack chips, and inside the agents themselves.
- The business sells **websites + layered automation** (chatbot → qualification → agents → voice). The demos prove it.

When writing or editing marketing surfaces, bundles descriptions, service details, or agent system prompts that leak into UI copy, follow the above distinction.

## i18n & Data Duality (Non-Negotiable)

- Canonical English lives in:
  - `lib/projects-data.ts`
  - `lib/bundles-data.ts`
  - `lib/services-data.ts`
  - `lib/roze-data.ts`
  - `lib/service-details.ts`
  - etc.
- Bulgarian translations live in the parallel `*-data.bg.ts` files + the `DICT` object in `lib/i18n/dict.ts` (and locale files).
- Server code uses `detectLocale()`, `detectLocaleAndCountry()`, `getLocalized*`, `renderServicePriceParts`, etc.
- When you add a new project, bundle tier, or service, you **must** add the BG counterpart at the same time or the site will be inconsistent for Bulgarian visitors.
- Currency: `detectCurrency` + `formatPrice`. Home bundles have one-time vs retainer + ROI savings messaging that is also localized.

The data files are the source of truth for the /projects listing and the bundles/services marketing pages. The individual project pages under `app/projects/` often repeat or expand on that data — keep them in sync.

## AI Agent Implementation Rules

See the companion `ai-agents` user skill for deep details. Project-specific highlights:
- Each major agent has its own `app/api/<name>/chat/route.ts` with a carefully written `system` prompt containing behavioral guardrails.
- Agentic ones define real `tool()` calls that operate on the live Shopify data via the project's lib/shopify wrappers.
- The corresponding `components/ai/<name>-chat.tsx` renders rich content inside the stream (product grids, tool status, direct "add to cart" that hits the real cart).
- Visual stylist does vision + catalog retrieval.
- Voice one wires Web Speech API.
- When editing prompts, keep the "human-like", "never spammy", "grounded in real catalog" rules intact.
- The outer site also has a general sales-assistant and chatbot entry points.

## Cart, Checkout, PayPal

- The cart in the ai-shopify-store demo is **real**. Optimistic UI + Server Actions + the Shopify cart.
- Checkout has both Shopify native and PayPal flows (see scripts/ for PayPal plan setup).
- Changes to cart behavior must work for both the marketing-site context and the embedded demo.

## Theming & Shells

- Global theme toggle (light/dark) + recent hero mask work exists.
- Inside the brand demo shells the visual identity is dictated by the brand (white for Curated., warm for KORE, blush/serif for ROZÉ). Do not force dark or global tokens that fight the brand.

## Other Gotchas

- The weird `app/[page]/` route exists for some dynamic marketing page use-case — be careful when touching root layouts.
- `app/projects/page.tsx` drives the portfolio grid from the PROJECTS data.
- Build artifacts (build.log, start.log, tsconfig.tsbuildinfo) are committed — don't fight it unless asked.
- The root README is still the old Vercel commerce one. The real story lives in the code + the marketing pages.
- Relative paths preferred everywhere (imports, tool args, links).

## Build and Deploy Rules (Non-Negotiable)

- **Always** run the build locally (`npm run build` — matches what Vercel uses) and verify it completes successfully with no errors or module-not-found issues **before** committing or pushing any code.
- Do this **every time** before deploy.
- Check that all new routes (e.g. the report request pages + /api/report-request) appear in the build output under "Route (app)".
- If using pnpm for other tasks, still validate the npm build since that's the CI/deploy command.
- Update this skill or add notes if new build requirements (e.g. env vars, deps) are introduced.

## Personalized AI Opportunity Report / Audit LPs (Free Reports for 6 Focus Areas)

- The 6 specialized LPs + hub at /free-ai-audits and /ai-*-* use ReportRequestForm + Firebase (prod collection `chaos_survey_responses` by default — internal name only).
- Prod default: useTestCollection={false} (or no ?test) on the 6 live pages writes to main prod collection.
- Local/custom/test bucket (`chaos_survey_responses_test`): activate with useTestCollection={true} in code, or via URL param `?test=false` (this is "the local/custom one").
- The hub includes a visible quick test form wired to the test bucket (labeled neutrally).
- Always use the Firebase config from .env (NEXT_PUBLIC_FIREBASE_*); test writes locally with the script; enable Firestore in console + rules before real use.
  - Script (test-report-request.ts) does write + immediate read-back (getRecentReportRequests) + also exercises the HTTP API roundtrip.
- **API**: submissions go through `POST /api/report-request` (and GET for recent for verification). Forms call the API. The route re-validates with Zod at the boundary, chooses collection via ?test= (same convention), returns structured success/error. Test the API with the script or directly:
  - curl -X POST http://localhost:3000/api/report-request?test=false -H "Content-Type: application/json" -d '{ "source":"t", "business_type":"x", ... full schema fields ... }'
- These are marketing surfaces (not /projects/* shells), so full global nav + consistent site styling apply.
- New routes must be verified in `npm run build` output (including the report-request API).
- **CRITICAL for any data/API work (per api development skills)**: Before considering "done", you MUST actually submit real data (via form, script or curl) AND retrieve/read it back (confirm the exact saved fields are queryable and correct). The test script enforces this. Update tests + this skill + the Priestley survey questions doc when changing questions or flow. No "it compiled" excuses.

## How to Use This Skill

Any time you are about to edit marketing copy, a demo shell route/layout, data files, i18n, an agent route or its UI component, or anything that crosses the "marketing site" vs "real brand demo" boundary, read this file first (or have it injected into the implementer/reviewer prompts).

It is higher priority than the generic nextjs-developer or shopify-headless skills for decisions that affect the *illusion* and the *business positioning* of this specific product.

When creating a new project demo or a new agent, start by reading this + the ai-agents skill + the relevant data file, then plan the changes.

This file should be updated whenever a new invariant is discovered or a convention is deliberately changed.
