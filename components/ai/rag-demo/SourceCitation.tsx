"use client";

export function SourceCitation({
  index,
  citation,
}: {
  index: number;
  citation: {
    chunkId: string;
    title: string;
    headingPath: string;
    source: string;
    sourceUrl?: string;
    excerpt: string;
    score: number;
  };
}) {
  return (
    <details className="group rounded-lg border border-neutral-200 bg-neutral-50 open:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900/50 dark:open:border-neutral-700">
      <summary className="cursor-pointer list-none px-3 py-2 text-xs text-neutral-700 marker:content-none dark:text-neutral-300 [&::-webkit-details-marker]:hidden">
        <span className="mr-2 font-mono text-cyan-700 dark:text-cyan-500/90">
          [{index}]
        </span>
        <span className="font-medium text-neutral-900 dark:text-neutral-200">
          {citation.title}
        </span>
        <span className="text-neutral-400 dark:text-neutral-600">
          {" "}
          · {citation.headingPath}
        </span>
        <span className="float-right font-mono text-[10px] text-neutral-400 dark:text-neutral-600">
          {citation.score.toFixed(3)}
        </span>
      </summary>
      <div className="space-y-2 border-t border-neutral-200 px-3 py-2 text-[11px] leading-relaxed text-neutral-600 dark:border-neutral-800 dark:text-neutral-400">
        <p>{citation.excerpt}</p>
        <p className="text-neutral-500 dark:text-neutral-600">
          {citation.source}
          {citation.sourceUrl ? (
            <>
              {" "}
              —{" "}
              <a
                href={citation.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-700 hover:text-cyan-600 dark:text-cyan-500 dark:hover:text-cyan-400"
              >
                source
              </a>
            </>
          ) : null}
        </p>
        <p className="font-mono text-[10px] text-neutral-400 dark:text-neutral-700">
          {citation.chunkId}
        </p>
      </div>
    </details>
  );
}
