import Link from "next/link";

export const metadata = {
  title: "Projects",
  description: "Portfolio projects by Nacho Tsvetkov – Full-Stack AI Engineer.",
};

const projects = [
  {
    title: "AI-Powered Shopify Store",
    description:
      "Headless Next.js storefront with real-time AI product recommendations, intelligent chatbot with Add to Cart, and seamless Shopify integration. Fullscreen chat mode, streaming responses, product cards inside chat.",
    tech: ["Next.js 16", "Shopify", "OpenAI", "Vercel AI SDK", "Tailwind 4"],
    href: "/projects/ai-shopify-store",
    status: "Live",
  },
  {
    title: "Multi-Modal Visual Stylist",
    description:
      "Upload any photo — GPT-4o vision analyzes the scene, RAG pulls similar and complementary products from a Shopify catalog, with an in-chat grid and one-tap add to cart.",
    tech: ["GPT-4o", "Vercel AI SDK", "Vision", "RAG", "Next.js"],
    href: "/projects/multi-modal-visual-stylist",
    status: "Live",
  },
  {
    title: "Autonomous Agentic Commerce Bot",
    description:
      "The chatbot that doesn't just talk — it acts. Tool-calling AI that searches, compares, adds to cart, and checks out autonomously via OpenAI function calling.",
    tech: ["OpenAI Tools", "Vercel AI SDK", "Shopify", "Agentic AI"],
    href: "/projects/autonomous-agentic-commerce-bot",
    status: "Live",
  },
  {
    title: "AI Store Analytics & Insights",
    description:
      "Merchant-facing BI copilot — ask plain-English questions about sales, orders, and customers. RAG over 30 days of store data with inline charts.",
    tech: ["GPT-4o", "RAG", "Analytics", "Vercel AI SDK", "Charts"],
    href: "/projects/ai-store-analytics-insights",
    status: "Live",
  },
  {
    title: "Smart Cart Recovery Agent",
    description:
      "Proactive AI that automatically recovers abandoned carts with personalized offers, urgency, and style-based incentives — no user action needed to start.",
    tech: ["GPT-4o", "Proactive AI", "Vercel AI SDK", "Recovery"],
    href: "/projects/smart-cart-recovery-agent",
    status: "Live",
  },
  {
    title: "Personalized Style Concierge",
    description:
      "AI personal stylist that profiles your taste via a multi-turn quiz, then builds complete outfits with product cards, save-this-look, and one-tap add to cart.",
    tech: ["GPT-4o", "Multi-turn", "Vercel AI SDK", "Outfit Builder"],
    href: "/projects/personalized-style-concierge",
    status: "Live",
  },
  {
    title: "Voice-Enabled Shopping Assistant",
    description:
      "Hands-free AI shopping — speak your query, hear the response. Web Speech API for STT, browser SpeechSynthesis for TTS, with full product cards and cart.",
    tech: ["Web Speech API", "TTS", "GPT-4o", "Vercel AI SDK", "A11y"],
    href: "/projects/voice-enabled-shopping-assistant",
    status: "Live",
  },
];

export default function ProjectsPage() {
  return (
    <>
      <section className="bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-1 text-sm text-neutral-400 transition-colors hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
            </svg>
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-white sm:text-5xl">Projects</h1>
          <p className="mt-4 max-w-xl text-lg text-neutral-400">
            Live demos and production work. Click any project to explore it
            interactively.
          </p>
        </div>
      </section>

      <section className="bg-neutral-50 py-16 dark:bg-neutral-950">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link
              key={project.title}
              href={project.href}
              className="group relative flex overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-all duration-300 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-600/10 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-blue-500/30"
            >
              <div className="flex flex-1 flex-col p-6">
                <div className="mb-3 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    {project.status}
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-5 w-5 text-neutral-400 transition-transform group-hover:translate-x-1 group-hover:text-blue-500"
                  >
                    <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
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
