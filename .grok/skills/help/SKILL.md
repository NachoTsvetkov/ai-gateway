---
name: help
description: >
  Project installation of the help Grok skill. Grok documentation and configuration help, plus workspace-specific notes on available skills, how to use the local project-conventions + domain skills, slash commands, MCP, keyboard shortcuts, and project setup. Use when the user asks about Grok features in context of working on this Next.js Shopify AI portfolio.
metadata:
  short-description: "Grok TUI / CLI / skills help (with this workspace context)"
  scope: repo
  canonical: C:\Users\nacho\.grok\skills\help\SKILL.md
---

# help (installed for this workspace)

This is the **project-scoped installation** of the canonical help skill.

**When the user asks about setup, configuration, skills, slash commands, how to use Grok on this project, MCP servers, or "what skills do we have here":**

1. Read the full canonical: `read_file` `C:\Users\nacho\.grok\skills\help\SKILL.md`

2. Supplement with the local reality:
   - List and briefly describe the skills present in `.grok/skills/` (project-conventions is highest priority; claude-repo-bridge, nextjs-developer, shopify-headless, ai-agents are the core domain ones; meta ones like best-of-n, code-review, check-work, create-skill, help).
   - Point to AGENTS.md and CLAUDE.md in the repo root.
   - Note the git repo is nested under portfolio/ ; active work happens in `shopify-store-integration/my-shopify-ai`.
   - Remind about build discipline (`npm run build` before deploy), relative paths, pwsh/Windows shell, real cart + agent grounding.
   - The user guide docs live in `~/.grok/docs/user-guide/`.

3. Direct users to `/skills` (or the TUI menu) to see currently loaded/installed skills.

Use `/help` for Grok-specific or workspace-skill questions.

This local install ensures help answers are grounded in the actual skills and conventions of *this* workspace.
