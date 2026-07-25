// Source of truth for the /projects portfolio listing. Mirrors the
// shape of `bundles-data.ts` / `services-data.ts`: the English content
// here is canonical, and `projects-data.bg.ts` overlays Bulgarian
// strings via the same `getLocalized*` accessor pattern.
//
// Why move it out of `app/projects/page.tsx`:
//   - The listing was a hardcoded array baked into the page component,
//     so adding a translation meant either inlining `s()` pairs (ugly
//     for 9 projects × 2 fields) or duplicating the array.
//   - Centralising lets the AI sales-assistant or any future surface
//     reference the same project metadata without re-importing the
//     page module.

import type { Locale } from "./i18n/locale";
import { PROJECTS_BG } from "./projects-data.bg";

export type ProjectId =
  | "ai-shopify-store"
  | "local-fitness-studio"
  | "boutique-fashion-brand"
  | "rag-demo"
  | "multi-modal-visual-stylist"
  | "autonomous-agentic-commerce-bot"
  | "ai-store-analytics-insights"
  | "smart-cart-recovery-agent"
  | "personalized-style-concierge"
  | "voice-enabled-shopping-assistant";

export type Project = {
  id: ProjectId;
  title: string;
  description: string;
  /** Tech-stack chips. Intentionally NOT translated — these are
   *  product/library names that read identically in any language and
   *  are how engineers scan a portfolio. */
  tech: ReadonlyArray<string>;
  href: string;
};

// Display order = visit order on the listing. Highlighted / most
// important projects first.
export const PROJECTS: ReadonlyArray<Project> = [
  {
    id: "rag-demo",
    title: "Production RAG Demo — SRE Knowledge Base",
    description:
      "Hybrid search (BM25 + dense), retrieval inspector, Naive vs Improved comparison, and an evaluation dashboard over a Software Engineering / DevOps corpus with source citations and honest failure cases.",
    tech: [
      "Hybrid RAG",
      "BM25",
      "Embeddings",
      "Vercel AI SDK",
      "Eval metrics",
    ],
    href: "/projects/rag-demo",
  },
  {
    id: "ai-shopify-store",
    title: "AI-Powered Shopify Store",
    description:
      "Headless Next.js storefront with real-time AI product recommendations, intelligent chatbot with Add to Cart, and seamless Shopify integration. Fullscreen chat mode, streaming responses, product cards inside chat.",
    tech: ["Next.js 16", "Shopify", "OpenAI", "Vercel AI SDK", "Tailwind 4"],
    href: "/projects/ai-shopify-store",
  },
  {
    id: "local-fitness-studio",
    title: "Local Fitness Studio · KORE",
    description:
      "Standalone studio site (warm orange + cream palette) with an after-hours AI receptionist that books classes, answers schedule questions, and hands off to a coach when needed.",
    tech: ["Next.js 16", "GPT-4o", "Stripe", "Calendar API", "Tailwind 4"],
    href: "/projects/local-fitness-studio",
  },
  {
    id: "boutique-fashion-brand",
    title: "Boutique Fashion Brand · ROZÉ",
    description:
      "Bulgarian-language luxury boutique (cream + blush + serif) with an AI personal stylist and abandoned-cart recovery emails that read like a human wrote them — never spam.",
    tech: ["Bulgarian", "GPT-4o", "Shopify", "Klaviyo", "AI personalization"],
    href: "/projects/boutique-fashion-brand",
  },
  {
    id: "multi-modal-visual-stylist",
    title: "Multi-Modal Visual Stylist",
    description:
      "Upload any photo — GPT-4o vision analyzes the scene, RAG pulls similar and complementary products from a Shopify catalog, with an in-chat grid and one-tap add to cart.",
    tech: ["GPT-4o", "Vercel AI SDK", "Vision", "RAG", "Next.js"],
    href: "/projects/multi-modal-visual-stylist",
  },
  {
    id: "autonomous-agentic-commerce-bot",
    title: "Autonomous Agentic Commerce Bot",
    description:
      "The chatbot that doesn't just talk — it acts. Tool-calling AI that searches, compares, adds to cart, and checks out autonomously via OpenAI function calling.",
    tech: ["OpenAI Tools", "Vercel AI SDK", "Shopify", "Agentic AI"],
    href: "/projects/autonomous-agentic-commerce-bot",
  },
  {
    id: "ai-store-analytics-insights",
    title: "AI Store Analytics & Insights",
    description:
      "Merchant-facing BI copilot — ask plain-English questions about sales, orders, and customers. RAG over 30 days of store data with inline charts.",
    tech: ["GPT-4o", "RAG", "Analytics", "Vercel AI SDK", "Charts"],
    href: "/projects/ai-store-analytics-insights",
  },
  {
    id: "smart-cart-recovery-agent",
    title: "Smart Cart Recovery Agent",
    description:
      "Proactive AI that automatically recovers abandoned carts with personalized offers, urgency, and style-based incentives — no user action needed to start.",
    tech: ["GPT-4o", "Proactive AI", "Vercel AI SDK", "Recovery"],
    href: "/projects/smart-cart-recovery-agent",
  },
  {
    id: "personalized-style-concierge",
    title: "Personalized Style Concierge",
    description:
      "AI personal stylist that profiles your taste via a multi-turn quiz, then builds complete outfits with product cards, save-this-look, and one-tap add to cart.",
    tech: ["GPT-4o", "Multi-turn", "Vercel AI SDK", "Outfit Builder"],
    href: "/projects/personalized-style-concierge",
  },
  {
    id: "voice-enabled-shopping-assistant",
    title: "Voice-Enabled Shopping Assistant",
    description:
      "Hands-free AI shopping — speak your query, hear the response. Web Speech API for STT, browser SpeechSynthesis for TTS, with full product cards and cart.",
    tech: ["Web Speech API", "TTS", "GPT-4o", "Vercel AI SDK", "A11y"],
    href: "/projects/voice-enabled-shopping-assistant",
  },
];

// ----------------------------------------------------------------------
// Locale-aware accessor
// ----------------------------------------------------------------------
//
// English stays the source of truth for ids, ordering, hrefs, and tech
// chips. The BG overlay only carries the human-readable title +
// description, with `??` fallbacks so an untranslated entry never
// renders blank.

function localizeProject(p: Project, locale: Locale): Project {
  if (locale === "en") return p;
  const overrides = PROJECTS_BG[p.id];
  if (!overrides) return p;
  return {
    ...p,
    title: overrides.title ?? p.title,
    description: overrides.description ?? p.description,
  };
}

export function getLocalizedProjects(
  locale: Locale,
): ReadonlyArray<Project> {
  if (locale === "en") return PROJECTS;
  return PROJECTS.map((p) => localizeProject(p, locale));
}
