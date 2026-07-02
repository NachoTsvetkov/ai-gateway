---
name: check-work
description: >
  Project installation of the check-work Grok skill. After you (or a subagent) make changes, spawn a verifier that reviews the diffs, runs the project's build + checks (npm run build, prettier), exercises key flows (especially cart + AI agents + demo shells), and evaluates correctness against project-conventions, nextjs-developer, shopify-headless, ai-agents, and claude-repo-bridge rules. Use to self-verify before claiming work complete.
metadata:
  short-description: "Independent verification of changes (project installation)"
  scope: repo
  canonical: C:\Users\nacho\.grok\skills\check-work\SKILL.md
  related: code-review, project-conventions, verification-before-completion (claude superpowers)
---

# check-work (installed for this workspace)

This is the **project-scoped installation** of the canonical check-work skill.

**Strongly recommended after any non-trivial implementation**, especially:
- New or changed AI agent routes / chat components
- Cart, checkout, lib/shopify modifications
- Anything in brand demo shells (`/projects/*`)
- Data file or i18n changes
- Layout / routing / metadata work

**Action:**

1. Read the full canonical: `read_file` `C:\Users\nacho\.grok\skills\check-work\SKILL.md`

2. The verifier subagent must:
   - Read local `project-conventions` + the three domain skills (nextjs, shopify-headless, ai-agents) + bridge.
   - Run `cd shopify-store-integration/my-shopify-ai && npm run build` (or pnpm) and confirm clean.
   - Check that relative paths were used.
   - For agent/cart work: conceptually or actually test the flows.
   - Flag any violation of brand illusion, English/BG sync, real cart contract, or agent guardrails.
   - Use code-review style rigor on the diff.

3. Cross with Claude superpowers like verification-before-completion when deeper.

Use `/check-work` (or "verify your changes", "self-verify") to invoke.

Installing this makes rigorous post-change verification a first-class, always-available extension in the workspace.
