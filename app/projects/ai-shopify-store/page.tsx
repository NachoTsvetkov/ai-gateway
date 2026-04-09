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
      <TechStack />
      <Footer />
    </>
  );
}
