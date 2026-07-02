---
name: ai-agents
description: >
  Project installation of the ai-agents Grok skill. Develop, debug, or extend the custom AI shopping agents in this project (agentic-commerce, visual-stylist, style-concierge, voice-shopping, cart-recovery, sales-assistant, store-analytics, etc.). Covers Vercel AI SDK (streamText, useChat, tool calling with zod), strict per-agent system prompts, rich chat UIs that render real products/tools/cart actions inside streams, RAG/catalog for stylist, "smart automation" marketing tone (avoid "AI" in customer headlines). Triggers on /api/*/chat/route.ts, components/ai/*, visual-stylist-catalog, agent tool use.
metadata:
  short-description: "Custom Vercel AI SDK agents + rich chat UIs (project installation)"
  scope: repo
  canonical: C:\Users\nacho\.grok\skills\ai-agents\SKILL.md
  related: claude-repo-bridge, nextjs-developer, shopify-headless, project-conventions
---

# ai-agents (installed for this workspace)

This is the **project-scoped installation** of the canonical ai-agents skill.

**On activation (editing any agent chat route, the components/ai/ renderers, adding new agents, modifying prompts, vision/voice flows, or tool definitions that talk to Shopify):**

1. Read the full canonical definition:
   `read_file` `C:\Users\nacho\.grok\skills\ai-agents\SKILL.md`

2. The canonical is purpose-built for **this exact set of ~10 agents** in the money-generator portfolio:
   - Architecture: `app/api/<name>/chat/route.ts` (streamText + gateway model + strict system prompt + optional tools) + matching `components/ai/<name>-chat.tsx` (useChat + custom rich renderers for ProductCard, tool status, direct add-to-cart that hits real cart).
   - Strict behavioral guardrails per agent (e.g. cart-recovery = empathetic + human, never spammy; sales-assistant forbids "AI" in output copy in certain contexts; always ground in real catalog via tools or visual-stylist-catalog loaders).
   - Tools must use the project's `lib/shopify` wrappers so recommendations and mutations stay in sync with the live UI cart.
   - Marketing positioning: customer-facing surfaces speak "smart automation", "autonomous virtual employees", "voice agents"; "AI" is ok in tech contexts and inside agents.
   - Visual stylist: vision upload + retrieval + rich grid render + one-tap real cart.
   - Voice: Web Speech API integration.

3. Required cross-loads:
   - `claude-repo-bridge` (for Claude frontend-ui-engineering, nextjs-developer, etc.).
   - `shopify-headless` (all agentic catalog/cart actions).
   - `nextjs-developer` (the routes are Next.js Route Handlers).
   - Local `project-conventions` (tone, illusion, i18n, data files).

4. Workflow: For new agents or prompt changes, use planning tools + implement loops. Prototype prompt + tools + UI renderer together. Always test the full loop (user → tools → real mutation or read → rich streamed UI update). Verify build.

Use `/ai-agents` to explicitly surface the full agent development playbook.

This installation guarantees the production-grade agentic commerce rules and patterns specific to this workspace are loaded by default.
