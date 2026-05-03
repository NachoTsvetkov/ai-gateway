import Link from "next/link";

export const metadata = {
  title: "Projects",
  description:
    "Portfolio projects by Nacho Tsvetkov – Full-Stack Software Engineer.",
};

/**
 * Each project page has its own colour palette so visitors immediately
 * read them as distinct sites rather than templated portfolio entries.
 * The `accent` tokens here mirror the per-page hero theme:
 *   - dot: a small pill of solid colour the card displays at the top
 *   - hoverBorder / hoverShadow: the card frame's hover treatment
 *   - hoverArrow: the right-arrow's hover colour
 *
 * Tokens are literal Tailwind classes (not built dynamically) so the
 * JIT picks them up at build time.
 */
const projects = [
  {
    title: "AI-Powered Shopify Store",
    description:
      "Headless Next.js storefront with real-time AI product recommendations, intelligent chatbot with Add to Cart, and seamless Shopify integration. Fullscreen chat mode, streaming responses, product cards inside chat.",
    tech: ["Next.js 16", "Shopify", "OpenAI", "Vercel AI SDK", "Tailwind 4"],
    href: "/projects/ai-shopify-store",
    status: "Live",
    accent: {
      dot: "bg-blue-500",
      hoverBorder: "hover:border-blue-300 dark:hover:border-blue-500/40",
      hoverShadow: "hover:shadow-blue-600/10",
      hoverArrow: "group-hover:text-blue-500",
    },
  },
  {
    title: "Multi-Modal Visual Stylist",
    description:
      "Upload any photo — GPT-4o vision analyzes the scene, RAG pulls similar and complementary products from a Shopify catalog, with an in-chat grid and one-tap add to cart.",
    tech: ["GPT-4o", "Vercel AI SDK", "Vision", "RAG", "Next.js"],
    href: "/projects/multi-modal-visual-stylist",
    status: "Live",
    accent: {
      dot: "bg-rose-500",
      hoverBorder: "hover:border-rose-300 dark:hover:border-rose-500/40",
      hoverShadow: "hover:shadow-rose-600/10",
      hoverArrow: "group-hover:text-rose-500",
    },
  },
  {
    title: "Autonomous Agentic Commerce Bot",
    description:
      "The chatbot that doesn't just talk — it acts. Tool-calling AI that searches, compares, adds to cart, and checks out autonomously via OpenAI function calling.",
    tech: ["OpenAI Tools", "Vercel AI SDK", "Shopify", "Agentic AI"],
    href: "/projects/autonomous-agentic-commerce-bot",
    status: "Live",
    accent: {
      dot: "bg-amber-500",
      hoverBorder: "hover:border-amber-300 dark:hover:border-amber-500/40",
      hoverShadow: "hover:shadow-amber-600/10",
      hoverArrow: "group-hover:text-amber-500",
    },
  },
  {
    title: "AI Store Analytics & Insights",
    description:
      "Merchant-facing BI copilot — ask plain-English questions about sales, orders, and customers. RAG over 30 days of store data with inline charts.",
    tech: ["GPT-4o", "RAG", "Analytics", "Vercel AI SDK", "Charts"],
    href: "/projects/ai-store-analytics-insights",
    status: "Live",
    accent: {
      dot: "bg-emerald-500",
      hoverBorder: "hover:border-emerald-300 dark:hover:border-emerald-500/40",
      hoverShadow: "hover:shadow-emerald-600/10",
      hoverArrow: "group-hover:text-emerald-500",
    },
  },
  {
    title: "Smart Cart Recovery Agent",
    description:
      "Proactive AI that automatically recovers abandoned carts with personalized offers, urgency, and style-based incentives — no user action needed to start.",
    tech: ["GPT-4o", "Proactive AI", "Vercel AI SDK", "Recovery"],
    href: "/projects/smart-cart-recovery-agent",
    status: "Live",
    accent: {
      dot: "bg-red-500",
      hoverBorder: "hover:border-red-300 dark:hover:border-red-500/40",
      hoverShadow: "hover:shadow-red-600/10",
      hoverArrow: "group-hover:text-red-500",
    },
  },
  {
    title: "Personalized Style Concierge",
    description:
      "AI personal stylist that profiles your taste via a multi-turn quiz, then builds complete outfits with product cards, save-this-look, and one-tap add to cart.",
    tech: ["GPT-4o", "Multi-turn", "Vercel AI SDK", "Outfit Builder"],
    href: "/projects/personalized-style-concierge",
    status: "Live",
    accent: {
      dot: "bg-violet-500",
      hoverBorder: "hover:border-violet-300 dark:hover:border-violet-500/40",
      hoverShadow: "hover:shadow-violet-600/10",
      hoverArrow: "group-hover:text-violet-500",
    },
  },
  {
    title: "Voice-Enabled Shopping Assistant",
    description:
      "Hands-free AI shopping — speak your query, hear the response. Web Speech API for STT, browser SpeechSynthesis for TTS, with full product cards and cart.",
    tech: ["Web Speech API", "TTS", "GPT-4o", "Vercel AI SDK", "A11y"],
    href: "/projects/voice-enabled-shopping-assistant",
    status: "Live",
    accent: {
      dot: "bg-sky-500",
      hoverBorder: "hover:border-sky-300 dark:hover:border-sky-500/40",
      hoverShadow: "hover:shadow-sky-600/10",
      hoverArrow: "group-hover:text-sky-500",
    },
  },
] as const;

export default function ProjectsPage() {
  return (
    <>
      <section className="bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-1 text-sm text-neutral-400 transition-colors hover:text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4"
            >
              <path
                fillRule="evenodd"
                d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z"
                clipRule="evenodd"
              />
            </svg>
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-white sm:text-5xl">
            Projects
          </h1>
          <p className="mt-4 max-w-xl text-lg text-neutral-400">
            Live demos and production work — each one with its own visual
            identity. Click any project to explore it interactively.
          </p>
        </div>
      </section>

      <section className="bg-neutral-50 py-16 dark:bg-neutral-950">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link
              key={project.title}
              href={project.href}
              className={`group relative flex overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-all duration-300 hover:shadow-xl dark:border-neutral-800 dark:bg-neutral-900 ${project.accent.hoverBorder} ${project.accent.hoverShadow}`}
            >
              {/* Coloured side stripe — instant visual cue that this card
                  represents a distinct site, even before the title is read. */}
              <span
                aria-hidden="true"
                className={`absolute inset-y-0 left-0 w-1 ${project.accent.dot}`}
              />
              <div className="flex flex-1 flex-col p-6 pl-7">
                <div className="mb-3 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    {project.status}
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className={`h-5 w-5 text-neutral-400 transition-transform group-hover:translate-x-1 ${project.accent.hoverArrow}`}
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                  {project.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                  {project.description}
                </p>
                <div className="mt-auto flex flex-wrap gap-2 pt-4">
                  {project.tech.map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-[11px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
