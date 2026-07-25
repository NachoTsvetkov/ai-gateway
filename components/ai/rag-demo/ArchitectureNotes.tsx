"use client";

import { RAG_ARCHITECTURE } from "lib/rag/architecture";

/** Compact notes inside the demo shell (footer of the app card). */
export function ArchitectureNotes() {
  return (
    <div className="border-t border-neutral-200 bg-neutral-50 px-4 py-5 dark:border-neutral-800 dark:bg-neutral-950/60">
      <p className="text-[11px] font-medium tracking-widest text-cyan-700 uppercase dark:text-cyan-500/80">
        {RAG_ARCHITECTURE.title}
      </p>
      <p className="mt-1 max-w-3xl text-sm text-neutral-600 dark:text-neutral-400">
        {RAG_ARCHITECTURE.summary}
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {RAG_ARCHITECTURE.decisions.map((d) => (
          <div key={d.title}>
            <h4 className="text-xs font-semibold text-neutral-900 dark:text-neutral-200">
              {d.title}
            </h4>
            <p className="mt-1 text-[11px] leading-relaxed text-neutral-500">
              {d.body}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-5 border-t border-neutral-200 pt-4 dark:border-neutral-800">
        <h4 className="text-xs font-semibold text-neutral-900 dark:text-neutral-200">
          {RAG_ARCHITECTURE.production.title}
        </h4>
        <ul className="mt-2 space-y-1.5 text-[11px] leading-relaxed text-neutral-500">
          {RAG_ARCHITECTURE.production.items.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-cyan-600 dark:bg-cyan-500" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/**
 * Full-width page section — easier to scan than the compact shell footer.
 * Same content source so the two stay in sync.
 */
export function ArchitectureNotesSection() {
  return (
    <section className="border-t border-neutral-200 bg-white py-16 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold tracking-widest text-cyan-700 uppercase dark:text-cyan-400">
            {RAG_ARCHITECTURE.title}
          </p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl dark:text-white">
            Why it is built this way
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
            {RAG_ARCHITECTURE.summary}
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-5xl gap-6 sm:grid-cols-2">
          {RAG_ARCHITECTURE.decisions.map((d) => (
            <article
              key={d.title}
              className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5 dark:border-neutral-800 dark:bg-neutral-800/40"
            >
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                {d.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                {d.body}
              </p>
            </article>
          ))}
        </div>

        <div className="mx-auto mt-8 max-w-5xl rounded-2xl border border-cyan-200/60 bg-cyan-50/50 p-5 dark:border-cyan-900/50 dark:bg-cyan-950/20">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
            {RAG_ARCHITECTURE.production.title}
          </h3>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {RAG_ARCHITECTURE.production.items.map((item) => (
              <li
                key={item}
                className="flex gap-2 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300"
              >
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-600 dark:bg-cyan-400" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
