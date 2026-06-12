# Nacho Tsvetkov – Money Generator for Small Businesses

**Professional websites + smart automation that turn small businesses into 24/7 money generators.** No more missed leads, no more manual work. Starting at €59.

This is a production-grade Next.js portfolio and lead-generation site that demonstrates exactly the kind of deliverables offered: custom sites combined with layered AI automation (chatbots → qualification agents → autonomous agents → voice).

The site itself is the product — multiple fully functional, standalone-feeling **branded demo experiences** prove the AI features in realistic buying, booking, and support contexts.

## Live Demos (the proof)

These routes are intentionally built to feel like real independent brand sites (global marketing nav is hidden, brand-specific shells and theming are used):

- **Curated.** (`/projects/ai-shopify-store`) — Premium white-label headless Shopify storefront with a full suite of AI shopping assistants. Real cart, real checkout (Shopify + PayPal), AI that can search, recommend, add to cart, and act autonomously.
- **KORE** (`/projects/local-fitness-studio`) — Local fitness studio (warm orange/cream) with an after-hours AI receptionist that books classes and hands off to humans.
- **ROZÉ** (`/projects/boutique-fashion-brand`) — Bulgarian-language luxury boutique with a personal AI stylist and human-sounding abandoned-cart recovery.

Individual deep-dive demos for specific capabilities:
- Multi-Modal Visual Stylist (vision + RAG over catalog)
- Autonomous Agentic Commerce Bot (full tool-calling that can complete purchases)
- Smart Cart Recovery Agent
- Personalized Style Concierge
- Voice-Enabled Shopping Assistant
- AI Store Analytics Insights
- Sales Assistant

See `app/projects/` and the data files for the full list and marketing descriptions.

## Offerings (Bundles)

Tiered service packages sold via the site:

- **Startup** — Custom site (up to 5 pages), AI chatbot trained on your business, booking integration, basic analytics/SEO.
- **Scale-up** — Everything in Startup + unlimited pages, e-commerce ready, lead qualification, marketing automation (email/SMS), light CRM, ongoing support + content changes.
- **Enterprise** — Everything in Scale-up + custom autonomous AI agents, voice agents, advanced personalization, complex integrations (CRM/ERP), priority support + strategy calls.

Full details, pricing notes (one-time vs retainer), and ROI examples live in `lib/bundles-data.ts` (and the `.bg.ts` overlay) and the `/bundles` + `/services` pages.

## Tech Stack

- **Framework**: Next.js 15/16 (canary), React 19, App Router, Server Components/Actions, Turbopack, streaming.
- **AI Layer**: Vercel AI SDK (`streamText`, `useChat`, tool calling), OpenAI models via AI Gateway (`grok` wait — currently `openai/gpt-4o` and mini variants). Rich in-chat rendering of products, tool status, and cart actions.
- **Commerce**: Custom headless Shopify Storefront API integration (`lib/shopify/`). Real carts, optimistic updates, product search/recommendations that AI agents can drive. PayPal integration for subscriptions and checkout.
- **Frontend**: Tailwind 4, Geist font, Sonner toasts, fully responsive with production-quality UI standards (see the `frontend-ui-engineering` patterns).
- **i18n & Localization**: English canonical in data files + full Bulgarian (`*-data.bg.ts` + `DICT` system). Server-side locale/country/currency detection (`detectLocaleAndCountry`, etc.). Language toggle shown only for BG traffic.
- **Analytics & Conversion**: Meta Pixel + Conversions API (CAPI) with consent gate, full-funnel instrumentation.
- **Other**: Zod for validation, custom catalog loaders for vision/RAG agents, theme system (light/dark + brand overrides in demos).

See `package.json`, `lib/`, `app/api/*/chat/route.ts`, and `components/ai/` for the agent implementations.

## Project Structure Highlights

- `app/` — Marketing site + the "brand demo" sub-apps (many use dedicated shells to hide global nav).
- `components/ai/` — All the rich chat UIs that power the agents.
- `lib/shopify/` — The custom Storefront wrappers, queries, mutations, types, and cart helpers.
- `lib/*-data.ts` (+ `.bg.ts`) — Source of truth for projects, bundles, services, etc.
- `lib/i18n/` — Locale detection and translation dictionary.
- `app/api/{agentic-commerce,visual-stylist,...}/chat/route.ts` — The individual AI agents (system prompts + tools).
- `scripts/` — PayPal plan setup helpers.

## Running Locally

1. `pnpm install`
2. Copy `.env.example` → `.env.local` (or `.env`) and fill the required values:
   - Shopify Storefront (domain + access token)
   - `AI_GATEWAY_API_KEY` (for the model gateway)
   - PayPal (sandbox recommended first)
   - Meta Pixel + CAPI (optional but fully wired)
3. `pnpm dev` (uses Turbopack)

The project "test" script runs Prettier check. Use `pnpm build` to validate.

**Important**: Never commit real secrets. The `.env` is gitignored.

## Development Conventions (this project)

- **Relative paths preferred** in code, imports, and tool calls.
- **Environment**: Windows + PowerShell (pwsh) in this workspace. Use appropriate cmdlets for shell tasks.
- **"Brand illusion"** — Edits inside `/projects/ai-shopify-store`, `/projects/local-fitness-studio`, etc. must preserve the standalone real-brand experience. Do not leak global marketing elements.
- **i18n duality** — Always keep English data and Bulgarian overlays in sync.
- **AI agent rules** — Many agents have strict prompt guidelines (e.g. tone for recovery, "never say AI" in certain customer copy, grounding in real catalog data). See the individual route files and the `ai-agents` skill.
- **Skills system** — This repo uses both Claude and Grok skills. See the local `.grok/skills/project-conventions/` for Grok-specific executable rules, and the user-level bridge + domain skills (`claude-repo-bridge`, `nextjs-developer`, `shopify-headless`, `ai-agents`).

For full current conventions when working with Grok, the `project-conventions` skill is the single source of truth and should be loaded for relevant tasks.

## Repository

Primary git remote: https://github.com/NachoTsvetkov/ai-gateway.git

This is a heavily customized fork of the Vercel Next.js Commerce template, extended with the full AI agent layer, bilingual marketing site, specific demo shells, and the service-bundle positioning.

## License

See `license.md`.

---

*This README was updated from the original generic commerce template to accurately reflect the current state of the project.*