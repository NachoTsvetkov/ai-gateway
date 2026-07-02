---
name: code-review
description: >
  Project installation of the strict code-review Grok skill. Run an extremely rigorous maintainability, abstraction quality, and structural simplification review. Use before merging, on complex refactors, new agents, data layer changes, or anything crossing marketing/demo boundaries. Also bridges to Claude's code-review-and-quality.
metadata:
  short-description: "Strict code quality & maintainability reviewer (project installation)"
  scope: repo
  canonical: C:\Users\nacho\.grok\skills\code-review\SKILL.md
  related: claude-repo-bridge, project-conventions
---

# code-review (installed for this workspace)

This is the **project-scoped installation** of the canonical strict code-review skill.

**Activate for:**
- Any PR or change review (especially multi-file, agents, lib/shopify, data files, layouts/shells, i18n).
- Before shipping features or after large refactors.
- When you (or a subagent) have just implemented something non-trivial.

**Action:**

1. Read the full canonical:
   `read_file` `C:\Users\nacho\.grok\skills\code-review\SKILL.md`

2. The canonical gives the ambitious "code judo", no >1k line file growth, anti-spaghetti, boundary cleanliness, etc. rules.

3. Additionally:
   - Load `claude-repo-bridge` and pull the Claude `code-review-and-quality` / `code-reviewer` specialists for complementary depth.
   - Load local `project-conventions` so reviews specifically call out violations of brand illusion, i18n duality, agent prompt guardrails, real cart flows, or "real store" demo rules.
   - Be extra harsh on anything that would leak demo chrome into brand shells, break English/BG sync, or make agent behavior less grounded/human.

Use `/code-review` (or the skill name) to run a review on current changes / a specific scope.

This ensures high-quality bar is applied consistently inside the workspace.
