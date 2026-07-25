import { RagDemoApp } from "components/ai/rag-demo/RagDemoApp";
import Footer from "components/layout/footer";
import { corpusStats } from "lib/rag/chunking";
import Link from "next/link";

export const metadata = {
  title: "Production RAG Demo — SRE / DevOps Knowledge Base",
  description:
    "Hybrid search, retrieval inspector, and honest evaluation over a Software Engineering knowledge base. Built as a production-shaped RAG reference.",
};

export default function RagDemoPage() {
  const stats = corpusStats();

  return (
    <>
      <div className="border-b border-neutral-200 bg-neutral-100 px-6 py-2.5 dark:border-neutral-800 dark:bg-neutral-800/50">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <Link
            href="/projects"
            className="inline-flex items-center gap-1 text-xs font-medium text-neutral-500 transition-colors hover:text-cyan-600 dark:text-neutral-400 dark:hover:text-cyan-400"
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
            Production RAG Demo
          </span>
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700 dark:bg-green-900/30 dark:text-green-400">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            LIVE DEMO
          </span>
        </div>
      </div>

      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-cyan-950 to-neutral-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-500/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-slate-500/15 via-transparent to-transparent" />

        <div className="relative mx-auto max-w-7xl px-6 py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-sm text-cyan-200">
              Hybrid RAG · Vercel AI SDK
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Software Engineering Knowledge Base
            </h1>
            <p className="mt-4 text-lg font-medium text-neutral-200 sm:text-xl">
              Ask your company docs — get answers you can trust
            </p>

            <div className="mt-10 grid grid-cols-2 gap-4 border-t border-neutral-700/50 pt-8 sm:grid-cols-4 sm:gap-8 sm:pt-10">
              <div>
                <p className="text-2xl font-bold text-white sm:text-4xl">
                  {stats.documents}
                </p>
                <p className="mt-1 text-xs text-neutral-400 sm:text-sm">
                  Documents
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white sm:text-4xl">
                  {stats.chunks}
                </p>
                <p className="mt-1 text-xs text-neutral-400 sm:text-sm">
                  Chunks
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white sm:text-4xl">
                  Hybrid
                </p>
                <p className="mt-1 text-xs text-neutral-400 sm:text-sm">
                  BM25 + dense
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white sm:text-4xl">20</p>
                <p className="mt-1 text-xs text-neutral-400 sm:text-sm">
                  Eval questions
                </p>
              </div>
            </div>
          </div>

          <div className="mx-auto mt-12 max-w-3xl rounded-2xl border border-white/15 bg-white/10 px-6 py-5 text-left backdrop-blur-sm">
            <p className="text-sm font-semibold text-white">
              What this example is for
            </p>
            <p className="mt-2 text-sm leading-relaxed text-neutral-200">
              This is a smart search over a real knowledge base — guides about
              reliable software, past outage reports, and team decision notes.
              You can ask things like “What is an error budget?”, “Why did
              GitLab’s database go down in 2017?”, or “When should we use a
              canary release?” It finds the right pages first, then answers
              from those pages and shows you the sources.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-neutral-300">
              That is better than asking a normal chat model alone. A normal
              model can guess or make things up. This one sticks to your docs,
              so you can check where each answer came from — useful for
              handbooks, support help, and policies where being right matters.
            </p>
          </div>

          <div className="mx-auto mt-10 max-w-6xl">
            <RagDemoApp />
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
