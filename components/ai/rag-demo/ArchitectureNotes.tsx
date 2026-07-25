"use client";

import { RAG_ARCHITECTURE } from "lib/rag/architecture";

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
    </div>
  );
}
