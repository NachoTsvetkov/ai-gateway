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

- **Grok**: The following are installed locally under `.grok/skills/` (repo-scoped):
  - `project-conventions` (highest priority — read first for brand illusion, i18n duality, agent tone, data files, demo shells, build rules).
  - `claude-repo-bridge` (cross-vendor bridge to Claude specialists + Grok orchestration strengths).
  - `nextjs-developer`, `shopify-headless`, `ai-agents` (core domain skills; the canonicals in `~/.grok/skills/` are already heavily customized for this repo's patterns, real cart/checkout, agentic flows, and brand demo shells).
  - Supporting meta skills: `code-review` (strict maintainability + simplification), `best-of-n` (parallel N-way implementations + pick best), `check-work` (independent post-change verifier), `create-skill`, `help`.
- The local `<name>/SKILL.md` files act as project installations (they instruct to load the full canonical from `~/.grok/skills/<name>/SKILL.md` plus the local project-conventions + bridge).
- **Claude**: The canonical specialists live in `~/.claude/skills/` (nextjs-developer, shopify-expert, frontend-ui-engineering, fullstack-guardian, api-designer, and all the superpowers for planning/execution/review). The `claude-repo-bridge` skill causes the right ones to be loaded and respected.
- Project rules files (AGENTS.md, CLAUDE.md, etc.) and `.grok/rules/` / `.claude/rules/` are also scanned.

When making changes that touch marketing copy, demo shells, i18n data, agents, cart flows, or cross the marketing-vs-demo boundary, load the project conventions first (plus the matching domain skill(s) + bridge).

## Plugins (Grok Build)

This project uses **project-scoped plugins** (committed in `.grok/plugins/`) for deeper integrations:

- **vercel** (https://github.com/vercel/vercel-plugin) — The big one for this stack.
  - Slash commands: `/deploy` (or `deploy prod`), `/env`, `/status`, `/bootstrap`, `/marketplace`.
  - Many high-quality skills (read them via the plugin or `/skills`): `ai-gateway` (critical — this repo *is* an ai-gateway consumer), `ai-sdk`, `deployments-cicd`, `vercel-cli`, `env-vars`, `nextjs`, `turbopack`, `vercel-functions`, `vercel-storage`, `shadcn`, `verification`, etc.
  - Agents: `deployment-expert`, `ai-architect`, `performance-optimizer`.
  - Brings the official Vercel MCP (deployments, logs, domains, env, etc.) + hooks.
  - Use for anything deployment, preview URLs, prod promote/rollback, AI Gateway config, Vercel-specific Next.js features (cache components, etc.).

- **superpowers** (https://github.com/obra/superpowers) — Excellent engineering workflow skills that align with the Claude superpowers and our meta skills: `using-superpowers`, `writing-plans`, `executing-plans`, `systematic-debugging`, `test-driven-development`, `verification-before-completion`, `subagent-driven-development`, `brainstorming`, `requesting-code-review`, etc. Load early for complex multi-step work.

- **chrome-devtools** (https://github.com/ChromeDevTools/chrome-devtools-mcp) — Browser automation + DevTools MCP. Skills for LCP debugging, a11y, memory leaks, network/console inspection, performance tracing. Extremely useful for verifying the storefront UIs, cart flows, rich AI chat renders, and demo shells in a real browser.
- **sentry** (https://github.com/getsentry/sentry-for-ai) — Error monitoring and debugging for AI-assisted development. Provides MCP access to Sentry issues, stack traces, fingerprint search; skills for Next.js SDK setup, Sentry code review on GitHub PRs, fixing issues identified in production, AI monitoring setup. Highly recommended for this project (public demos, AI agents, forms/surveys hitting Firebase, cart/checkout flows on Vercel deploys) to catch runtime errors early and integrate monitoring into the dev process.

Plugins are discovered from `.grok/plugins/<name>` (submodules here for clean versioning). Use `/plugins` (or Ctrl+L) in the TUI to manage, reload with `r`, or inspect components. The project versions take priority.

When doing Vercel-related work (deploys, AI Gateway, env, performance), always load the vercel plugin skills + the local nextjs-developer / project-conventions.

## Other

- The root README was previously the generic Vercel Commerce template — it has been updated to reflect reality.
- Build artifacts (`build.log`, etc.) and `tsconfig.tsbuildinfo` are currently committed.
- Git remote: https://github.com/NachoTsvetkov/ai-gateway.git (local checkout may be nested under a `portfolio/` collection).
- Submodules: `.grok/plugins/vercel`, `.grok/plugins/superpowers`, `.grok/plugins/chrome-devtools` (and the earlier `.grok/skills/` local installations). Run `git submodule update --init --recursive` after clone.

Keep these rules in mind on every task. When in doubt, re-read the local `project-conventions` skill (or this file) + the specific agent/data files involved.