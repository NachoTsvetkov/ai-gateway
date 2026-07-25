"use client";

import { useRef, useState, useTransition } from "react";
import type { RagMeta } from "./RagDemoApp";
import { SourceCitation } from "./SourceCitation";

const EXAMPLES = [
  "What is an error budget and how is it derived from an SLO?",
  "Compare BGP-related outages at Cloudflare and Meta.",
  "How do circuit breakers prevent cascading failures?",
  "When should we choose canary releases over blue/green?",
];

type Mode = "naive" | "improved";

export function ChatInterface({
  onMeta,
  onOpenInspector,
}: {
  onMeta: (meta: RagMeta, query: string) => void;
  onOpenInspector: () => void;
}) {
  const [mode, setMode] = useState<Mode>("improved");
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [meta, setMeta] = useState<RagMeta | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const abortRef = useRef<AbortController | null>(null);
  const [timing, setTiming] = useState<{
    retrievalMs: number;
    totalMs: number;
  } | null>(null);

  function run(q: string) {
    const trimmed = q.trim();
    if (!trimmed) return;
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    startTransition(async () => {
      setError(null);
      setAnswer("");
      setMeta(null);
      setTiming(null);
      const t0 = performance.now();
      try {
        const res = await fetch("/api/rag-demo/query", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: trimmed,
            mode,
            stream: true,
          }),
          signal: ac.signal,
        });
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(errText || `HTTP ${res.status}`);
        }
        const metaHeader = res.headers.get("X-RAG-Meta");
        let parsedMeta: RagMeta | null = null;
        if (metaHeader) {
          try {
            const pad =
              metaHeader + "=".repeat((4 - (metaHeader.length % 4)) % 4);
            const b64 = pad.replace(/-/g, "+").replace(/_/g, "/");
            parsedMeta = JSON.parse(atob(b64)) as RagMeta;
          } catch {
            parsedMeta = null;
          }
        }
        // Headers arrive after retrieval completes and before/during generation.
        const retrievalMs =
          parsedMeta?.latency?.totalMs ?? Math.round(performance.now() - t0);
        if (parsedMeta) {
          setMeta(parsedMeta);
          onMeta(parsedMeta, trimmed);
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No response body");
        const decoder = new TextDecoder();
        let full = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          full += decoder.decode(value, { stream: true });
          setAnswer(full);
        }
        setTiming({
          retrievalMs,
          totalMs: Math.round(performance.now() - t0),
        });
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
        setError((e as Error).message || "Query failed");
      }
    });
  }

  return (
    <div className="grid gap-0 lg:grid-cols-[1fr_320px]">
      <div className="flex flex-col border-b border-neutral-200 lg:border-r lg:border-b-0 dark:border-neutral-800">
        <div className="flex flex-wrap items-center gap-2 border-b border-neutral-200 px-4 py-2.5 dark:border-neutral-800">
          <span className="text-[11px] font-medium tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
            Pipeline
          </span>
          {(["improved", "naive"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`rounded px-2.5 py-1 font-mono text-[11px] ${
                mode === m
                  ? m === "improved"
                    ? "bg-cyan-50 text-cyan-800 ring-1 ring-cyan-300 dark:bg-cyan-500/15 dark:text-cyan-300 dark:ring-cyan-500/40"
                    : "bg-amber-50 text-amber-800 ring-1 ring-amber-300 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-500/40"
                  : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300"
              }`}
            >
              {m === "improved" ? "improved (hybrid)" : "naive (dense-only)"}
            </button>
          ))}
        </div>

        <div
          className="flex-1 space-y-4 overflow-y-auto px-4 py-4"
          style={{ minHeight: 360 }}
        >
          {!answer && !pending && !error ? (
            <div className="space-y-3">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Ask the SRE / DevOps knowledge base. Answers cite retrieved
                chunks. Toggle Naive vs Improved to compare pipelines.
              </p>
              <div className="flex flex-wrap gap-2">
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex}
                    type="button"
                    onClick={() => {
                      setQuery(ex);
                      run(ex);
                    }}
                    className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-left text-xs text-neutral-700 transition hover:border-cyan-400 hover:text-cyan-800 dark:border-neutral-700 dark:bg-neutral-800/60 dark:text-neutral-300 dark:hover:border-cyan-500/40 dark:hover:text-white"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {pending && !answer ? (
            <p className="font-mono text-xs text-neutral-500">
              retrieving → generating…
            </p>
          ) : null}

          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
              {error}
            </p>
          ) : null}

          {answer ? (
            <div className="space-y-3">
              {timing ? (
                <div className="flex flex-wrap gap-2 font-mono text-[10px] text-neutral-500">
                  <span className="rounded-md border border-neutral-200 bg-neutral-50 px-2 py-0.5 dark:border-neutral-700 dark:bg-neutral-800/60">
                    retrieval {timing.retrievalMs}ms
                  </span>
                  <span className="rounded-md border border-neutral-200 bg-neutral-50 px-2 py-0.5 dark:border-neutral-700 dark:bg-neutral-800/60">
                    total {timing.totalMs}ms
                  </span>
                </div>
              ) : null}
              <div className="prose prose-neutral dark:prose-invert prose-sm max-w-none whitespace-pre-wrap text-neutral-800 dark:text-neutral-200">
                {answer}
              </div>
              {meta?.citations && meta.citations.length > 0 ? (
                <div className="space-y-2 border-t border-neutral-200 pt-3 dark:border-neutral-800">
                  <p className="text-[11px] font-medium tracking-wide text-neutral-500 uppercase">
                    Sources
                  </p>
                  {meta.citations.map((c, i) => (
                    <SourceCitation
                      key={c.chunkId}
                      index={i + 1}
                      citation={c}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        <form
          className="border-t border-neutral-200 p-3 dark:border-neutral-800"
          onSubmit={(e) => {
            e.preventDefault();
            run(query);
          }}
        >
          <div className="flex gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask about SLOs, postmortems, ADRs…"
              className="flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-cyan-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-600 dark:focus:border-cyan-500/50"
            />
            <button
              type="submit"
              disabled={pending || !query.trim()}
              className="rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-cyan-500 disabled:opacity-40"
            >
              {pending ? "…" : "Ask"}
            </button>
          </div>
        </form>
      </div>

      <aside className="bg-neutral-50 px-4 py-4 dark:bg-neutral-950/40">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[11px] font-medium tracking-wide text-neutral-500 uppercase">
            Intermediate steps
          </p>
          <button
            type="button"
            onClick={onOpenInspector}
            className="text-[11px] text-cyan-700 hover:text-cyan-600 dark:text-cyan-400 dark:hover:text-cyan-300"
          >
            Open inspector →
          </button>
        </div>
        {!meta ? (
          <p className="text-xs text-neutral-500 dark:text-neutral-600">
            Run a query to see rewrite, scores, and latency.
          </p>
        ) : (
          <div className="space-y-3 text-xs text-neutral-600 dark:text-neutral-400">
            <div>
              <p className="mb-1 text-neutral-500">Mode / channel</p>
              <p className="font-mono text-neutral-800 dark:text-neutral-200">
                {meta.mode} · {meta.channel}
                {meta.denseBackend ? ` · dense=${meta.denseBackend}` : ""}
              </p>
            </div>
            {meta.rewrite ? (
              <div>
                <p className="mb-1 text-neutral-500">Query rewrite</p>
                <ul className="space-y-1 font-mono text-[11px] text-neutral-700 dark:text-neutral-300">
                  {meta.rewrite.rewritten.map((r) => (
                    <li key={r}>→ {r}</li>
                  ))}
                </ul>
                <p className="mt-1 text-[11px] text-neutral-500 dark:text-neutral-600">
                  {meta.rewrite.rationale}
                </p>
              </div>
            ) : (
              <p className="text-neutral-500 dark:text-neutral-600">
                No rewrite (naive mode).
              </p>
            )}
            {meta.latency ? (
              <div>
                <p className="mb-1 text-neutral-500">Latency (ms)</p>
                <dl className="grid grid-cols-2 gap-x-2 gap-y-0.5 font-mono text-[11px]">
                  <dt>rewrite</dt>
                  <dd>{meta.latency.queryRewriteMs}</dd>
                  <dt>embed</dt>
                  <dd>{meta.latency.embeddingMs}</dd>
                  <dt>sparse</dt>
                  <dd>{meta.latency.sparseMs}</dd>
                  <dt>dense</dt>
                  <dd>{meta.latency.denseMs}</dd>
                  <dt>fusion</dt>
                  <dd>{meta.latency.fusionMs}</dd>
                  <dt>rerank</dt>
                  <dd>{meta.latency.rerankMs}</dd>
                  <dt className="text-neutral-800 dark:text-neutral-300">
                    total
                  </dt>
                  <dd className="text-neutral-800 dark:text-neutral-300">
                    {meta.latency.totalMs}
                  </dd>
                </dl>
              </div>
            ) : null}
            {meta.retrieved ? (
              <div>
                <p className="mb-1 text-neutral-500">
                  Top retrieved ({meta.retrieved.length})
                </p>
                <ol className="space-y-1.5">
                  {meta.retrieved.slice(0, 5).map((h, i) => (
                    <li key={h.chunkId} className="font-mono text-[11px]">
                      <span className="text-cyan-700 dark:text-cyan-500/80">
                        {i + 1}.
                      </span>{" "}
                      <span className="text-neutral-700 dark:text-neutral-300">
                        {h.title.slice(0, 42)}
                        {h.title.length > 42 ? "…" : ""}
                      </span>
                      <span className="text-neutral-400 dark:text-neutral-600">
                        {" "}
                        · {h.score.toFixed(3)}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}
          </div>
        )}
      </aside>
    </div>
  );
}
