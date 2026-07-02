---
name: shopify-headless
description: >
  Project installation of the shopify-headless Grok skill. Work on headless Shopify Storefront integrations using the custom lib/shopify layer in this repo. Covers product/catalog fetching, real optimistic cart, checkout (Shopify + PayPal), data models for AI agents (visual-stylist-catalog, bundles), and maintaining the "real store" illusion in the /projects/ai-shopify-store demo. Triggers on Shopify, Storefront API, cart, checkout, lib/shopify, ai-shopify-store, product recs inside chats.
metadata:
  short-description: "Headless Shopify + custom lib/shopify layer (project installation)"
  scope: repo
  canonical: C:\Users\nacho\.grok\skills\shopify-headless\SKILL.md
  related: claude-repo-bridge, nextjs-developer, ai-agents, project-conventions
---

# shopify-headless (installed for this workspace)

This is the **project-scoped installation** of the canonical shopify-headless skill.

**On activation (anything touching lib/shopify/*, cart context/actions, product pages, search, checkout, AI agent tools that read/mutate catalog or cart, or the Curated. demo):**

1. Read the full canonical definition:
   `read_file` `C:\Users\nacho\.grok\skills\shopify-headless\SKILL.md`

2. The canonical version is already written specifically for **this repo's implementation**:
   - Real headless Storefront via the thin wrappers in `lib/shopify/` (do not bypass or duplicate).
   - Optimistic cart shared between UI (`components/cart/`) and agent tools (use the same addToCart, getCart, etc.).
   - PayPal sidecar flows.
   - Catalog for visual stylist lives in `lib/visual-stylist-catalog.*`.
   - Must keep marketing data (`lib/*-data.ts` + .bg.ts) in sync when catalog concepts change.
   - "Real store" contract: the /projects/ai-shopify-store routes + shells must feel like a premium independent brand (white theme, no demo badges, full cart/checkout that actually works to purchase).

3. Cross-load:
   - `claude-repo-bridge` → pulls `~/.claude/skills/claude-skills/skills/shopify-expert/SKILL.md` (adapt headless parts).
   - Local `project-conventions` for illusion and data rules.
   - `ai-agents` and `nextjs-developer` as needed.

4. Verification after changes: exercise the real cart + at least one agentic add-to-cart flow; run full `npm run build`.

Use `/shopify-headless` to force explicit activation.

Installing this locally ensures the precise headless + agentic commerce patterns for this AI storefront are always front-and-center for the workspace.
