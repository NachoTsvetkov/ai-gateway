# Claude Instructions

See `AGENTS.md` (in the repo root) for the core project conventions, invariants, and gotchas.

Additional Claude-specific resources:
- Load the rich specialists from `~/.claude/skills/` (especially `nextjs-developer`, `shopify-expert`, `frontend-ui-engineering`, `fullstack-guardian`, `api-designer`, `code-reviewer`, and the superpowers for planning/execution, systematic-debugging, verification-before-completion, etc.).
- The project also ships with Grok-native counterparts installed locally in `/.grok/skills/`:
  - High-priority `project-conventions`.
  - `claude-repo-bridge` (automatically pulls in and respects the Claude specialists while leveraging Grok tools like subagents, best-of-n, implement loops).
  - Domain: `nextjs-developer`, `shopify-headless`, `ai-agents` (canonicals live in `~/.grok/skills/` and are pre-tuned for this repo).
  - Meta: `code-review`, `best-of-n`, `check-work`, `create-skill`, `help`.
- **Project plugins** (in `/.grok/plugins/`, installed as git submodules for shareability):
  - `vercel` (https://github.com/vercel/vercel-plugin) — primary for this project: Vercel deploy/env/status commands, deep skills for AI Gateway (this repo), AI SDK, deployments/CI-CD, Turbopack, Next.js caching, Vercel Functions/Storage/Firewall, shadcn, verification flows, plus deployment-expert and performance agents + the Vercel MCP.
  - `superpowers` (https://github.com/obra/superpowers) — workflow skills (TDD, systematic-debugging, writing/executing plans, verification-before-completion, etc.).
  - `chrome-devtools` (https://github.com/ChromeDevTools/chrome-devtools-mcp) — browser DevTools MCP + skills for LCP debugging, a11y, network/perf tracing, console inspection. Great for real-browser validation of the storefront demos and agent UIs.
  - `sentry` (https://github.com/getsentry/sentry-for-ai) — Sentry error monitoring + AI-focused tools. MCP for issues/traces/stack analysis; skills for Next.js SDK setup, Sentry PR code review, issue fixing, monitoring setup. Strongly recommended to add observability to the Vercel deploys, AI agents, Firebase-backed surveys/forms, cart flows, etc.
- Project rules files (AGENTS.md, this file, etc.) + `.grok/skills/` / `.grok/plugins/` / `.claude/skills/` drive discovery. Use `/plugins` and `/mcps` in Grok TUI.

When working in this tree, prefer the patterns and constraints defined in AGENTS.md + the loaded specialists over generic defaults. The "brand illusion" for the demo storefronts, the i18n data duality, the AI agent behavioral rules, and the marketing positioning are non-negotiable.

For the skills system and how Claude discovers rules, see the general Claude Code documentation. This file + AGENTS.md + the `~/.claude/skills/` specialists provide the project-specific layer.