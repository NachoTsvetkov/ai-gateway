"use client";

import { useState, useTransition } from "react";
import type { RagMeta, RetrievedHit } from "./RagDemoApp";

type Channel = "hybrid" | "dense" | "sparse";

export function RetrievalInspector({
  initialQuery,
  seedMeta,
  onMeta,
}: {
  initialQuery: string;
  seedMeta: RagMeta | null;
  onMeta: (meta: RagMeta, query: string) => void;
}) {
  const [query, setQuery] = useState(initialQuery || "");
  const [channel, setChannel] = useState<Channel>("hybrid");
  const [mode, setMode] = useState<"naive" | "improved">("improved");
  const [hits, setHits] = useState<RetrievedHit[]>(seedMeta?.retrieved ?? []);
  const [meta, setMeta] = useState<RagMeta | null>(seedMeta);
  const [compare, setCompare] = useState<{
    dense: RetrievedHit[];
    hybrid: RetrievedHit[];
  } | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function inspect(opts?: { compare?: boolean }) {
    const q = query.trim();
    if (!q) return;
    startTransition(async () => {
      setError(null);
      try {
        if (opts?.compare) {
          const [denseRes, hybridRes] = await Promise.all([
            fetch("/api/rag-demo/query", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                query: q,
                mode: "naive",
                channel: "dense",
                retrieveOnly: true,
              }),
            }).then((r) => r.json()),
            fetch("/api/rag-demo/query", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                query: q,
                mode: "improved",
                channel: "hybrid",
                retrieveOnly: true,
              }),
            }).then((r) => r.json()),
          ]);
          setCompare({
            dense: denseRes.retrieval.retrieved,
            hybrid: hybridRes.retrieval.retrieved,
          });
          setHits(hybridRes.retrieval.retrieved);
          const m = hybridRes.retrieval as RagMeta;
          setMeta(m);
          onMeta(m, q);
          return;
        }

        const res = await fetch("/api/rag-demo/query", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: q,
            mode,
            channel,
            retrieveOnly: true,
          }),
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setHits(data.retrieval.retrieved);
        setMeta(data.retrieval);
        setCompare(null);
        onMeta(data.retrieval, q);
      } catch (e) {
        setError((e as Error).message || "Inspect failed");
      }
    });
  }

  return (
    <div className="px-4 py-4">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex-1 text-xs text-neutral-500 dark:text-neutral-400">
          Query
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-cyan-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:focus:border-cyan-500/50"
            placeholder="Inspect retrieval without generation…"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as "naive" | "improved")}
            className="rounded-lg border border-neutral-300 bg-white px-2 py-2 text-xs text-neutral-800 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-200"
          >
            <option value="improved">improved</option>
            <option value="naive">naive</option>
          </select>
          <select
            value={channel}
            onChange={(e) => setChannel(e.target.value as Channel)}
            className="rounded-lg border border-neutral-300 bg-white px-2 py-2 text-xs text-neutral-800 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-200"
          >
            <option value="hybrid">hybrid</option>
            <option value="dense">dense</option>
            <option value="sparse">sparse / BM25</option>
          </select>
          <button
            type="button"
            disabled={pending || !query.trim()}
            onClick={() => inspect()}
            className="rounded-lg bg-cyan-600 px-3 py-2 text-xs font-medium text-white hover:bg-cyan-500 disabled:opacity-40"
          >
            {pending ? "…" : "Retrieve"}
          </button>
          <button
            type="button"
            disabled={pending || !query.trim()}
            onClick={() => inspect({ compare: true })}
            className="rounded-lg border border-neutral-300 px-3 py-2 text-xs text-neutral-700 hover:border-cyan-500 dark:border-neutral-600 dark:text-neutral-200 dark:hover:border-cyan-500/40 disabled:opacity-40"
          >
            Compare dense vs hybrid
          </button>
        </div>
      </div>

      {error ? (
        <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </p>
      ) : null}

      {meta?.rewrite ? (
        <div className="mb-4 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs dark:border-neutral-800 dark:bg-neutral-900/50">
          <p className="mb-1 text-neutral-500">Rewritten queries</p>
          <ul className="space-y-0.5 font-mono text-neutral-700 dark:text-neutral-300">
            {meta.rewrite.rewritten.map((r) => (
              <li key={r}>→ {r}</li>
            ))}
          </ul>
          <p className="mt-1 text-neutral-500 dark:text-neutral-600">
            {meta.rewrite.rationale}
          </p>
        </div>
      ) : null}

      {meta?.latency ? (
        <div className="mb-4 flex flex-wrap gap-3 font-mono text-[11px] text-neutral-500">
          <span>rewrite {meta.latency.queryRewriteMs}ms</span>
          <span>embed {meta.latency.embeddingMs}ms</span>
          <span>sparse {meta.latency.sparseMs}ms</span>
          <span>dense {meta.latency.denseMs}ms</span>
          <span>fusion {meta.latency.fusionMs}ms</span>
          <span>rerank {meta.latency.rerankMs}ms</span>
          <span className="text-neutral-800 dark:text-neutral-300">
            total {meta.latency.totalMs}ms
          </span>
          {meta.denseBackend ? (
            <span className="text-cyan-700 dark:text-cyan-600">
              dense={meta.denseBackend}
            </span>
          ) : null}
        </div>
      ) : null}

      {compare ? (
        <div className="mb-6 grid gap-4 lg:grid-cols-2">
          <HitColumn
            title="Dense-only (naive)"
            hits={compare.dense}
            accent="amber"
          />
          <HitColumn
            title="Hybrid + rerank (improved)"
            hits={compare.hybrid}
            accent="cyan"
          />
        </div>
      ) : (
        <HitColumn title="Retrieved chunks" hits={hits} accent="cyan" />
      )}
    </div>
  );
}

function HitColumn({
  title,
  hits,
  accent,
}: {
  title: string;
  hits: RetrievedHit[];
  accent: "cyan" | "amber";
}) {
  const ring =
    accent === "cyan"
      ? "border-cyan-200 dark:border-cyan-500/20"
      : "border-amber-200 dark:border-amber-500/20";
  const score =
    accent === "cyan"
      ? "text-cyan-700 dark:text-cyan-400/80"
      : "text-amber-700 dark:text-amber-400/80";
  return (
    <div>
      <p className="mb-2 text-[11px] font-medium tracking-wide text-neutral-500 uppercase">
        {title}
      </p>
      {hits.length === 0 ? (
        <p className="text-xs text-neutral-500 dark:text-neutral-600">
          No hits yet — run a retrieve.
        </p>
      ) : (
        <ol className="space-y-2">
          {hits.map((h, i) => (
            <li
              key={`${title}-${h.chunkId}`}
              className={`rounded-lg border bg-neutral-50 px-3 py-2 dark:bg-neutral-900/60 ${ring}`}
            >
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-xs font-medium text-neutral-900 dark:text-neutral-200">
                  <span className={`font-mono ${score}`}>{i + 1}.</span>{" "}
                  {h.title}
                </p>
                <span className={`shrink-0 font-mono text-[10px] ${score}`}>
                  {(h.rerankScore ?? h.rrfScore ?? h.score).toFixed(4)}
                </span>
              </div>
              <p className="mt-0.5 text-[11px] text-neutral-500">
                {h.headingPath}
                {h.type ? ` · ${h.type}` : ""}
                {h.channel ? ` · ${h.channel}` : ""}
              </p>
              <div className="mt-1 flex flex-wrap gap-2 font-mono text-[10px] text-neutral-500 dark:text-neutral-600">
                {h.denseScore != null ? (
                  <span>dense {h.denseScore.toFixed(3)}</span>
                ) : null}
                {h.sparseScore != null ? (
                  <span>bm25 {h.sparseScore.toFixed(3)}</span>
                ) : null}
                {h.rrfScore != null ? (
                  <span>rrf {h.rrfScore.toFixed(4)}</span>
                ) : null}
              </div>
              <p className="mt-1.5 text-[11px] leading-relaxed text-neutral-600 dark:text-neutral-400">
                {h.excerpt}
              </p>
              {h.sourceUrl ? (
                <a
                  href={h.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block text-[10px] text-cyan-700 hover:text-cyan-600 dark:text-cyan-600 dark:hover:text-cyan-400"
                >
                  {h.source}
                </a>
              ) : h.source ? (
                <p className="mt-1 text-[10px] text-neutral-500 dark:text-neutral-600">
                  {h.source}
                </p>
              ) : null}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
