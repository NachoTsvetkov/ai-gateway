# Project Rules for Nacho Tsvetkov AI Portfolio / Shopify AI Storefront

This document (plus the local skills) contains the key conventions, invariants, and gotchas for working in this codebase.

**Primary goal**: Keep the "real brand" demo illusion intact, maintain the bilingual marketing + service positioning, and ensure AI agents stay grounded in real catalog/cart data with the correct tones.

## Brand & Demo Illusion (Highest Priority)

- `/projects/ai-shopify-store` ("Curated."), `/projects/local-fitness-studio` (KORE), and `/projects/boutique-fashion-brand` (ROZÉ) must feel like **standalone real DTC/brand sites**.
- The global marketing Navbar + chrome is deliberately hidden on these routes (see `HIDE_NAVBAR_ON` in `app/layout.tsx` and the dedicated `*Shell` components).
- Do **not** add cross-portfolio links, "demo" labels, "built with AI" badges, global nav, or elements that break the fourth wall inside these shells.
- The outer marketing site (home, services, bundles, main /projects listing) uses the full Navbar, language toggle (BG-only), theme system, etc.

## Marketing Copy & Language

- In headlines, bundle descriptions, and high-level customer-facing text: prefer "smart automation", "autonomous virtual employees", "voice agents", "money generator" language over raw "AI".
- "AI" is fine (and expected) in tech stack lists, agent internals, code comments, and skill triggers.
- The business sells **websites + progressive layers of automation** that run 24/7 for small businesses.

## i18n & Data

- English is canonical in `lib/*-data.ts` (PROJECTS, BUNDLES, SERVICES, ROZE, etc.).
- Bulgarian lives in the parallel `*-data.bg.ts` files + `lib/i18n/dict.ts` (DICT) and locale helpers.
- Server components use `detectLocale()`, `detectLocaleAndCountry()`, `getLocalized*`, etc.
- When adding or changing projects/bundles/services, update **both** languages at the same time.
- Currency formatting and price notes (one-time vs retainer + ROI) are also localized.

Data files are the source of truth for marketing pages and the projects grid.

## AI Agents

- Each major agent lives in its own `app/api/<name>/chat/route.ts` (using Vercel AI SDK `streamText` + tools via the AI Gateway).
- Agents have **strict per-agent system prompts** with behavioral rules (e.g. cart recovery must be empathetic and human-like, never spammy; certain flows forbid the word "AI" in output copy).
- Tools (when present) call the same `lib/shopify` wrappers used by the real UI/cart so recommendations and actions are grounded in live data.
- Corresponding UIs in `components/ai/` render rich content (product cards, grids, tool status, direct "add to cart" that hits the real optimistic cart context).
- Visual stylist uses vision + the dedicated catalog loader (`lib/visual-stylist-catalog.*`).
- Always ground product/price/availability claims in real data. Do not hallucinate SKUs.

See the individual route files for the exact current rules, and load the `ai-agents` skill (Grok) or equivalent Claude specialists for implementation.

## Shopify / Cart / Checkout Layer

- Real headless Storefront API via the custom `lib/shopify/` layer (queries, mutations, types, cart helpers).
- The cart in the Curated. demo is **real and functional** (optimistic UI + Server Actions + PayPal sidecar).
- AI agents that mutate state (search → add, etc.) must use the project's thin wrappers so the rest of the app stays in sync.
- Revalidation uses the project's tags and `/api/revalidate`.

## Theming, Shells & Layout

- Global light/dark theme + recent hero improvements exist.
- Brand demos often force or heavily constrain theme (white for Curated., specific palettes for KORE/ROZÉ) for brand fidelity.
- Root layout hides the marketing nav on demo routes.

## Environment & Tooling Notes

- `pnpm dev` (Turbopack), `pnpm build`, `pnpm prettier:check` (the project's "test").
- Required env vars in `.env.example` / `.env.local`: Shopify Storefront, AI_GATEWAY_API_KEY, PayPal (sandbox first), optional Meta Pixel + CAPI.
- **Relative paths preferred** for imports, links, and tool calls.
- Workspace is Windows + pwsh in the current environment — use appropriate shell commands.

## Skills & Rules (for AI Agents Working Here)

This project uses the skills system heavily:

- **Grok**: See the local `/.grok/skills/project-conventions/SKILL.md` (repo-scoped, highest priority for this tree). Also load the user-level bridge (`claude-repo-bridge`), `nextjs-developer`, `shopify-headless`, and `ai-agents` skills.
- **Claude**: The canonical specialists live in `~/.claude/skills/` (nextjs-developer, shopify-expert, frontend-ui-engineering, fullstack-guardian, etc.). Use the bridge patterns or load them directly.
- Project rules files (AGENTS.md, Claude.md, etc.) and `.grok/rules/` / `.claude/rules/` are also scanned.

When making changes that touch marketing copy, demo shells, i18n data, agents, cart flows, or cross the marketing-vs-demo boundary, load the project conventions first.

## Other

- The root README was previously the generic Vercel Commerce template — it has been updated to reflect reality.
- Build artifacts (`build.log`, etc.) and `tsconfig.tsbuildinfo` are currently committed.
- Git remote: https://github.com/NachoTsvetkov/ai-gateway.git (local checkout may be nested under a `portfolio/` collection).

Keep these rules in mind on every task. When in doubt, re-read the local `project-conventions` skill (or this file) + the specific agent/data files involved.