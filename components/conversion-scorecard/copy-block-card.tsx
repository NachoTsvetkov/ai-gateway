"use client";

import { useState } from "react";
import type { CopyBlock } from "lib/conversion-scorecard/content";
import { AutoLinkedText } from "components/conversion-scorecard/auto-linked-text";

export function CopyBlockCard({ block }: { block: CopyBlock }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(block.body);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex flex-col gap-3 border-b border-neutral-100 bg-neutral-50 px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-5 dark:border-neutral-800 dark:bg-neutral-950/50">
        <div>
          <h2 className="font-bold text-neutral-900 dark:text-white">
            {block.title}
          </h2>
          <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
            {block.placement}
          </p>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
        >
          {copied ? "Copied ✓" : "Copy text"}
        </button>
      </div>
      <pre className="overflow-x-auto whitespace-pre-wrap p-4 font-sans text-sm leading-relaxed text-neutral-800 sm:p-5 dark:text-neutral-200">
        <AutoLinkedText text={block.body} />
      </pre>
    </article>
  );
}
