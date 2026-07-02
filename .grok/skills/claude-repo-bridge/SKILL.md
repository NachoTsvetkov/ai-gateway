---
name: claude-repo-bridge
description: >
  Project installation of the claude-repo-bridge Grok skill. Automatically bridges to and respects the rich Claude specialist skills (~/.claude/skills/) while using Grok's native strengths (subagents, worktrees, best-of-n, implement-review loops, plan mode). Must be loaded on this Claude-first Next.js + Shopify + AI agents repo. Higher priority for cross-vendor consistency.
metadata:
  short-description: "Bridge Grok <-> Claude skills ecosystem (installed for this workspace)"
  scope: repo
  canonical: C:\Users\nacho\.grok\skills\claude-repo-bridge\SKILL.md
---

# claude-repo-bridge (installed for this workspace)

This is the **project-scoped installation** of the canonical claude-repo-bridge skill.

**On every relevant task (Next.js, Shopify, UI, agents, planning, or when switching from Claude context):**

1. Read the full canonical definition immediately:
   `read_file` with absolute path `C:\Users\nacho\.grok\skills\claude-repo-bridge\SKILL.md`

2. Follow its core rules:
   - Load the corresponding Claude specialists from `C:\Users\nacho\.claude\skills\claude-skills\skills\` or `agent-skills\skills\` (e.g. nextjs-developer, shopify-expert, frontend-ui-engineering, fullstack-guardian, api-designer) and adapt their MUST / MUST NOT rules.
   - Use Grok orchestration strengths (implement, best-of-n, review, execute-plan, subagents) seeded with the Claude constraints.
   - Respect Windows/pwsh + strong relative path preference + the nested git repo at `shopify-store-integration/my-shopify-ai`.
   - Never break the brand demo illusion, i18n duality, or agent behavioral rules (cross with local project-conventions).

3. Also read the local `project-conventions` skill (this directory's sibling) — it is higher priority for this specific repo's invariants.

The global canonical version already contains a large amount of this project's specific context (brand shells, data files, AI agents, cart, etc.) and is the living reference.

Use `/claude-repo-bridge` (or it auto-triggers) to force a reload of the bridge guidance + Claude counterparts when needed.

This installation ensures the bridge is always present in the workspace's skill set.
