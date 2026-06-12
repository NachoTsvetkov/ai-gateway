# Claude Instructions

See `AGENTS.md` (in the repo root) for the core project conventions, invariants, and gotchas.

Additional Claude-specific resources:
- Load the rich specialists from `~/.claude/skills/` (especially `nextjs-developer`, `shopify-expert`, `frontend-ui-engineering`, `fullstack-guardian`, `api-designer`, and the superpowers for planning/execution).
- The project also ships with Grok-native counterparts in `/.grok/skills/` (including a high-priority `project-conventions` skill and a `claude-repo-bridge` that helps when switching tools).

When working in this tree, prefer the patterns and constraints defined in AGENTS.md + the loaded specialists over generic defaults. The "brand illusion" for the demo storefronts, the i18n data duality, the AI agent behavioral rules, and the marketing positioning are non-negotiable.

For the skills system and how Claude discovers rules, see the general Claude Code documentation. This file + AGENTS.md + the `~/.claude/skills/` specialists provide the project-specific layer.