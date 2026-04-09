import { AIFeatures } from "components/ai-features";
import { Carousel } from "components/carousel";
import { ThreeItemGrid } from "components/grid/three-items";
import { Hero } from "components/hero";
import Footer from "components/layout/footer";
import { TechStack } from "components/tech-stack";
import Link from "next/link";

export const metadata = {
  title: "AI-Powered Shopify Store",
  description:
    "AI-powered headless Shopify storefront with OpenAI product recommendations and real-time chatbot. Built with Next.js 16, Vercel AI SDK, and Tailwind CSS.",
};

const AI_DEMOS = [
  {
    title: "Multi-Modal Visual Stylist",
    description:
      "Upload a photo — GPT-4o vision analyzes it, RAG matches products from a Shopify catalog.",
    href: "/projects/multi-modal-visual-stylist",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 0 1 2.25-2.25h16.5A2.25 2.25 0 0 1 22.5 6v12a2.25 2.25 0 0 1-2.25 2.25H3.75A2.25 2.25 0 0 1 1.5 18V6ZM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0 0 21 18v-1.94l-2.69-2.689a1.5 1.5 0 0 0-2.12 0l-.88.879.97.97a.75.75 0 1 1-1.06 1.06l-5.16-5.159a1.5 1.5 0 0 0-2.12 0L3 16.061Zm10.125-7.81a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Z" clipRule="evenodd" />
      </svg>
    ),
    gradient: "from-pink-500 to-rose-500",
    tags: ["Vision", "RAG"],
  },
  {
    title: "Agentic Commerce Bot",
    description:
      "Tool-calling AI that searches, compares, adds to cart, and checks out autonomously.",
    href: "/projects/autonomous-agentic-commerce-bot",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path fillRule="evenodd" d="M14.615 1.595a.75.75 0 0 1 .359.852L12.982 9.75h7.268a.75.75 0 0 1 .548 1.262l-10.5 11.25a.75.75 0 0 1-1.272-.71l1.992-7.302H3.75a.75.75 0 0 1-.548-1.262l10.5-11.25a.75.75 0 0 1 .913-.143Z" clipRule="evenodd" />
      </svg>
    ),
    gradient: "from-amber-500 to-orange-500",
    tags: ["Tools", "Agentic"],
  },
  {
    title: "Store Analytics & Insights",
    description:
      "Merchant BI copilot — ask plain-English questions about sales, orders, and customers.",
    href: "/projects/ai-store-analytics-insights",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v15.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V4.125c0-1.036-.84-1.875-1.875-1.875h-.75ZM9.75 8.625c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-.75a1.875 1.875 0 0 1-1.875-1.875V8.625ZM3 13.125c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v6.75c0 1.035-.84 1.875-1.875 1.875h-.75A1.875 1.875 0 0 1 3 19.875v-6.75Z" />
      </svg>
    ),
    gradient: "from-emerald-500 to-teal-500",
    tags: ["RAG", "Charts"],
  },
  {
    title: "Cart Recovery Agent",
    description:
      "Proactive AI that recovers abandoned carts with personalized offers and urgency.",
    href: "/projects/smart-cart-recovery-agent",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M2.25 2.25a.75.75 0 0 0 0 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 0 0-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 0 0 0-1.5H5.378A2.25 2.25 0 0 1 7.5 15h11.218a.75.75 0 0 0 .674-.421 60.358 60.358 0 0 0 2.96-7.228.75.75 0 0 0-.525-.965A60.864 60.864 0 0 0 5.68 4.509l-.232-.867A1.875 1.875 0 0 0 3.636 2.25H2.25ZM3.75 20.25a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM16.5 20.25a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z" />
      </svg>
    ),
    gradient: "from-red-500 to-pink-500",
    tags: ["Proactive", "Recovery"],
  },
  {
    title: "Style Concierge",
    description:
      "AI stylist — multi-turn quiz, outfit builder with product cards, and save-this-look.",
    href: "/projects/personalized-style-concierge",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path fillRule="evenodd" d="M20.599 1.5c-.376 0-.743.111-1.055.32l-5.08 3.385a18.747 18.747 0 0 0-3.471 2.987 10.04 10.04 0 0 1 4.815 4.815 18.748 18.748 0 0 0 2.987-3.472l3.386-5.079A1.902 1.902 0 0 0 20.599 1.5Zm-8.3 14.025a18.76 18.76 0 0 0 1.896-1.207 8.026 8.026 0 0 0-4.513-4.513A18.75 18.75 0 0 0 8.475 11.7l-.278.5a5.26 5.26 0 0 1 3.601 3.602l.5-.278ZM6.75 13.5A3.75 3.75 0 0 0 3 17.25a1.5 1.5 0 0 1-1.601 1.497.75.75 0 0 0-.7 1.123 5.25 5.25 0 0 0 9.8-2.62 3.75 3.75 0 0 0-3.75-3.75Z" clipRule="evenodd" />
      </svg>
    ),
    gradient: "from-violet-500 to-purple-500",
    tags: ["Multi-turn", "Outfits"],
  },
  {
    title: "Voice Shopping",
    description:
      "Hands-free shopping — speak your query, hear the response. STT + TTS powered.",
    href: "/projects/voice-enabled-shopping-assistant",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z" />
        <path d="M6 10.5a.75.75 0 0 1 .75.75v1.5a5.25 5.25 0 1 0 10.5 0v-1.5a.75.75 0 0 1 1.5 0v1.5a6.751 6.751 0 0 1-6 6.709v2.291h3a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5h3v-2.291a6.751 6.751 0 0 1-6-6.709v-1.5A.75.75 0 0 1 6 10.5Z" />
      </svg>
    ),
    gradient: "from-sky-500 to-blue-500",
    tags: ["Voice", "A11y"],
  },
];

export default function AIShopifyStorePage() {
  return (
    <>
      <div className="border-b border-neutral-200 bg-neutral-100 px-6 py-2.5 dark:border-neutral-800 dark:bg-neutral-800/50">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <Link
            href="/projects"
            className="inline-flex items-center gap-1 text-xs font-medium text-neutral-500 transition-colors hover:text-blue-600 dark:text-neutral-400 dark:hover:text-blue-400"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
              <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
            </svg>
            All Projects
          </Link>
          <span className="text-neutral-300 dark:text-neutral-600">/</span>
          <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
            AI-Powered Shopify Store
          </span>
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700 dark:bg-green-900/30 dark:text-green-400">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            LIVE DEMO
          </span>
        </div>
      </div>
      <Hero />
      <ThreeItemGrid />
      <Carousel />
      <AIFeatures />

      <section className="border-t border-neutral-200 bg-neutral-950 py-16 dark:border-neutral-800">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
              More AI demos
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Try every AI experience back to back
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-neutral-400">
              Each project showcases a different AI commerce capability — from
              vision to voice, proactive agents to analytics.
            </p>
          </div>
          <div className="mx-auto mt-12 grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {AI_DEMOS.map((demo) => (
              <Link
                key={demo.href}
                href={demo.href}
                className="group relative flex overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 transition-all duration-300 hover:border-blue-500/40 hover:shadow-xl hover:shadow-blue-600/10"
              >
                <div className="flex flex-1 flex-col p-5">
                  <div className="mb-3 flex items-center gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${demo.gradient} text-white shadow-lg`}>
                      {demo.icon}
                    </div>
                    <h3 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
                      {demo.title}
                    </h3>
                  </div>
                  <p className="text-xs leading-relaxed text-neutral-400">
                    {demo.description}
                  </p>
                  <div className="mt-auto flex items-center gap-2 pt-4">
                    {demo.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-neutral-800 px-2 py-0.5 text-[10px] font-medium text-neutral-400"
                      >
                        {tag}
                      </span>
                    ))}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="ml-auto h-4 w-4 text-neutral-600 transition-all group-hover:translate-x-1 group-hover:text-blue-400"
                    >
                      <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <TechStack />
      <Footer />
    </>
  );
}
