---
name: nextjs-developer
description: >
  Project installation of the nextjs-developer Grok skill. Build and modify Next.js 15/16+ App Router applications (Server Components, Server Actions, streaming, Turbopack) following this codebase's exact patterns: brand demo shells that hide global nav (HIDE_NAVBAR_ON + ShopShell/KoreShell/RozeShell), i18n with parallel *-data.ts + *-data.bg.ts + DICT, relative paths, Windows/pwsh, generateMetadata, loading/error boundaries, and the "real store illusion" for /projects/ai-shopify-store etc. Triggers on any Next.js, App Router, RSC, Server Actions work.
metadata:
  short-description: "Next.js App Router specialist (project installation, already tuned for this repo)"
  scope: repo
  canonical: C:\Users\nacho\.grok\skills\nextjs-developer\SKILL.md
  related: claude-repo-bridge, shopify-headless, ai-agents, project-conventions
---

# nextjs-developer (installed for this workspace)

This is the **project-scoped installation** of the canonical nextjs-developer skill.

**On activation (any edit under app/, components/, lib/ involving routing, data, Server Components, metadata, layouts, or the demo shells):**

1. Read the full canonical definition:
   `read_file` `C:\Users\nacho\.grok\skills\nextjs-developer\SKILL.md`

2. The canonical is **already heavily customized for exactly this project** (Nacho Tsvetkov AI-powered money-generator portfolio / Shopify AI storefront). It encodes:
   - Brand demo "real site" illusion rules (never add marketing nav inside /projects/* shells).
   - i18n data duality (English canonical in lib/*-data.ts, Bulgarian in parallel .bg.ts + lib/i18n).
   - Relative paths preference.
   - Build verification: always `pnpm build` (or npm) before deploy/commit.
   - Integration with cart, theme, analytics, and the AI agent routes.
   - Recommended workflow: plan mode / implement + seed with Claude nextjs-developer from ~/.claude + frontend-ui-engineering for UI quality.

3. Always also load (read):
   - Local `project-conventions` (sibling skill) — highest priority for illusion, copy, data files.
   - `claude-repo-bridge` to pull in the Claude `~/.claude/skills/claude-skills/skills/nextjs-developer/SKILL.md` constraints.

4. After changes: run the project's checks (`pnpm prettier:check` if available, `pnpm build` or `npm run build`) and verify no module-not-found or route issues.

Use `/nextjs-developer` as a slash command to explicitly activate the full guidance.

This local installation makes the skill repo-discoverable and ensures the project-tuned version is the default when working inside the workspace.
