import { AgenticCommerceChat } from "components/ai/agentic-commerce-chat";
import Footer from "components/layout/footer";
import Link from "next/link";

export const metadata = {
  title: "Autonomous Agentic Commerce Bot",
  description:
    "Tool-calling AI that searches, compares, adds to cart, and checks out autonomously. Built with OpenAI function calling and Vercel AI SDK.",
};

export default function AgenticCommerceBotPage() {
  return (
    <>
      <div className="border-b border-neutral-200 bg-neutral-100 px-6 py-2.5 dark:border-neutral-800 dark:bg-neutral-800/50">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <Link
            href="/projects"
            className="inline-flex items-center gap-1 text-xs font-medium text-neutral-500 transition-colors hover:text-blue-600 dark:text-neutral-400 dark:hover:text-blue-400"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-3.5 w-3.5"
            >
              <path
                fillRule="evenodd"
                d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z"
                clipRule="evenodd"
              />
            </svg>
            All Projects
          </Link>
          <span className="text-neutral-300 dark:text-neutral-600">/</span>
          <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
            Autonomous Agentic Commerce Bot
          </span>
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700 dark:bg-green-900/30 dark:text-green-400">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            LIVE DEMO
          </span>
        </div>
      </div>

      <section className="relative overflow-hidden bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-violet-600/10 via-transparent to-transparent" />

        <div className="relative mx-auto max-w-7xl px-6 py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-sm text-blue-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-4 w-4"
              >
                <path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
              </svg>
              OpenAI Tool Calling + Vercel AI SDK
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Autonomous Agentic Commerce Bot
            </h1>
            <p className="mt-4 text-lg font-medium text-neutral-200 sm:text-xl">
              The chatbot that doesn&apos;t just talk — it acts
            </p>
            <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-neutral-400">
              Tool-calling AI that searches, compares, adds to cart, and checks
              out autonomously.
            </p>

            <div className="mt-10 grid grid-cols-3 gap-4 border-t border-neutral-700/50 pt-8 sm:gap-8 sm:pt-10">
              <div>
                <p className="text-2xl font-bold text-white sm:text-4xl">5</p>
                <p className="mt-1 text-xs text-neutral-400 sm:text-sm">
                  Live tools the AI calls
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white sm:text-4xl">
                  Auto
                </p>
                <p className="mt-1 text-xs text-neutral-400 sm:text-sm">
                  Multi-step chains
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white sm:text-4xl">
                  Real
                </p>
                <p className="mt-1 text-xs text-neutral-400 sm:text-sm">
                  Shopify cart &amp; checkout
                </p>
              </div>
            </div>
          </div>

          <div className="mx-auto mt-14 max-w-4xl">
            <AgenticCommerceChat />
          </div>
        </div>
      </section>

      <section className="border-t border-neutral-200 bg-white py-16 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">
              Under the hood
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl dark:text-white">
              Five real tools the AI calls autonomously
            </h2>
          </div>

          <div className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "searchProducts",
                body: "Queries the Shopify catalog by keyword and returns matching products with prices.",
              },
              {
                title: "getProductDetails",
                body: "Fetches full details, variants, and images for a specific product handle.",
              },
              {
                title: "addToCart",
                body: "Adds a product variant to the real Shopify cart and confirms the running total.",
              },
              {
                title: "getCart",
                body: "Retrieves current cart contents, quantities, and the total amount.",
              },
              {
                title: "initiateCheckout",
                body: "Returns the Shopify checkout URL so the user can complete their purchase.",
              },
              {
                title: "Safety & handoff",
                body: "Confirms cart before checkout, declines non-shopping requests, and offers human handoff.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-800 dark:bg-neutral-800/50"
              >
                <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
                  <code className="rounded bg-neutral-200 px-1.5 py-0.5 text-sm dark:bg-neutral-700">
                    {item.title}
                  </code>
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
