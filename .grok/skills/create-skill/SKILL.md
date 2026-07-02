---
name: create-skill
description: >
  Project installation of the create-skill Grok skill. Interactively create new Grok skills (SKILL.md + optional scripts/references) scoped to this workspace. Use when the user wants to capture a repeating workflow, add project-specific rules, or extend the local skill set (e.g. a custom chaos-phase planner, bundle data helper, agent prompt tester, etc.).
metadata:
  short-description: "Scaffold new project-scoped Grok skills (installed)"
  scope: repo
  canonical: C:\Users\nacho\.grok\skills\create-skill\SKILL.md
---

# create-skill (installed for this workspace)

This is the **project-scoped installation** of the canonical create-skill skill.

It allows you (or the user via `/create-skill`) to add new skills directly into this workspace's `.grok/skills/` (under `shopify-store-integration/my-shopify-ai/.grok/skills/`), making them repo-specific and shareable.

**Action when invoked:**

1. Read the full canonical guidance: `read_file` `C:\Users\nacho\.grok\skills\create-skill\SKILL.md`

2. Follow its interactive steps (ask for name, scope=Project, description with triggers, then create dir + SKILL.md using search_replace with empty old_string).

3. After creation, the new skill becomes immediately available (skills auto-reload). Update AGENTS.md / project-conventions if the new skill encodes important invariants.

4. Seed any new skill with references to the existing local ones (`project-conventions`, the domain skills, bridge) so it stays consistent with the repo's brand, i18n, agent, and illusion rules.

Use `/create-skill` to start the flow for capturing a new reusable pattern in this AI storefront / portfolio project.

This installation turns the workspace into a living, extensible skill environment.
