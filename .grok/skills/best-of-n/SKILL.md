---
name: best-of-n
description: >
  Project installation of the best-of-n Grok skill. Implement a task N ways in parallel (using isolated worktrees or subagents), evaluate all candidates with the help of code-review / project-conventions / domain skills, and apply the winner. Excellent for UI variants, agent prompt variants, complex component designs, or any ambiguous implementation choice in this Next.js + AI agents codebase.
metadata:
  short-description: "Parallel N implementations + pick the best (project installation)"
  scope: repo
  canonical: C:\Users\nacho\.grok\skills\best-of-n\SKILL.md
  related: claude-repo-bridge, implement, code-review
---

# best-of-n (installed for this workspace)

This is the **project-scoped installation** of the canonical best-of-n skill.

**When to use:** Any time there are multiple reasonable architectures, UI approaches, prompt wordings for agents, or implementation paths (especially anything user-facing or agentic).

**Action on use:**

1. Read the full canonical: `read_file` `C:\Users\nacho\.grok\skills\best-of-n\SKILL.md`

2. Combine with:
   - Local `project-conventions` (brand illusion, i18n, agent tone must be preserved in all candidates).
   - `claude-repo-bridge` + relevant Claude specialists (frontend-ui-engineering is critical for UI candidates).
   - `nextjs-developer`, `ai-agents`, `shopify-headless` as appropriate to the task.
   - `code-review` to evaluate the candidates rigorously.

3. Spawn parallel work (worktrees or subagents), have each produce a complete diff or implementation slice, then review comparatively (often with another reviewer subagent seeded with the domain skills).

Use `/best-of-n` to trigger.

This installation brings the parallel exploration power specifically into the workspace for high-ambiguity work on the AI store and marketing surfaces.
