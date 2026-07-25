"use client";

import { useEffect, useState, useTransition } from "react";

type Snapshot = {
  updatedAt: string;
  notes: string;
  naive: Metrics;
  improved: Metrics;
  groundednessExample: {
    score: number;
    supportedClaims: number;
    totalClaims: number;
    notes: string;
  };
};

type Metrics = {
  mode: string;
  n: number;
  meanRecallAt5: number;
  meanRecallAt10: number;
  meanMrr: number;
  meanLatencyMs: number;
  hitRateAt5: number;
};

type Question = {
  id: string;
  question: string;
  multiHop: boolean;
  relevantDocIds: string[];
  notes?: string;
};

type FailureCase = {
  id: string;
  title: string;
  question: string;
  whatHappened: string;
  why: string;
  mitigation: string;
};

export function EvaluationDashboard() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [failures, setFailures] = useState<FailureCase[]>([]);
  const [corpus, setCorpus] = useState<{
    documents: number;
    chunks: number;
    byType: Record<string, number>;
  } | null>(null);
  const [live, setLive] = useState<{
    naive?: Metrics;
    improved?: Metrics;
    rows?: Array<{
      questionId: string;
      mode: string;
      recallAt5: number;
      mrr: number;
      latencyMs: number;
      hit: boolean;
    }>;
  } | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/rag-demo/evaluate")
      .then((r) => r.json())
      .then((data) => {
        setSnapshot(data.snapshot);
        setQuestions(data.questions ?? []);
        setFailures(data.failureCases ?? []);
        setCorpus(data.corpus ?? null);
      })
      .catch((e) => setError(String(e)));
  }, []);

  function runLive() {
    startTransition(async () => {
      setError(null);
      try {
        const res = await fetch("/api/rag-demo/evaluate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ live: true, mode: "both", limit: 5 }),
        });
        if (!res.ok) throw new Error(await res.text());
        setLive(await res.json());
      } catch (e) {
        setError((e as Error).message || "Live eval failed");
      }
    });
  }

  const naive = live?.naive ?? snapshot?.naive;
  const improved = live?.improved ?? snapshot?.improved;

  return (
    <div className="space-y-6 px-4 py-4">
      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
            Before / After retrieval quality
          </h3>
          <p className="mt-1 max-w-2xl text-xs text-neutral-500">
            {snapshot?.notes}
            {live ? " Showing live sample (first 5 questions)." : null}
          </p>
        </div>
        <button
          type="button"
          onClick={runLive}
          disabled={pending}
          className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs text-neutral-700 hover:border-cyan-500 disabled:opacity-40 dark:border-neutral-600 dark:text-neutral-200 dark:hover:border-cyan-500/40"
        >
          {pending ? "Running sample…" : "Run live sample (5 Qs)"}
        </button>
      </div>

      {corpus ? (
        <div className="flex flex-wrap gap-4 font-mono text-[11px] text-neutral-500">
          <span>{corpus.documents} docs</span>
          <span>{corpus.chunks} chunks</span>
          {Object.entries(corpus.byType).map(([k, v]) => (
            <span key={k}>
              {k}:{v}
            </span>
          ))}
        </div>
      ) : null}

      {naive && improved ? (
        <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800">
          <table className="w-full min-w-[520px] text-left text-xs">
            <thead className="bg-neutral-50 text-neutral-500 dark:bg-neutral-950">
              <tr>
                <th className="px-3 py-2 font-medium">Metric</th>
                <th className="px-3 py-2 font-medium text-amber-700 dark:text-amber-400/90">
                  Naive
                </th>
                <th className="px-3 py-2 font-medium text-cyan-700 dark:text-cyan-400/90">
                  Improved
                </th>
                <th className="px-3 py-2 font-medium">Δ</th>
              </tr>
            </thead>
            <tbody className="font-mono text-neutral-700 dark:text-neutral-300">
              {(
                [
                  ["Recall@5", naive.meanRecallAt5, improved.meanRecallAt5],
                  ["Recall@10", naive.meanRecallAt10, improved.meanRecallAt10],
                  ["MRR", naive.meanMrr, improved.meanMrr],
                  ["Hit rate@5", naive.hitRateAt5, improved.hitRateAt5],
                  [
                    "Latency ms",
                    naive.meanLatencyMs,
                    improved.meanLatencyMs,
                    true,
                  ],
                ] as Array<[string, number, number, boolean?]>
              ).map(([label, a, b, lowerBetter]) => {
                const delta = b - a;
                const good = lowerBetter ? delta < 0 : delta > 0;
                return (
                  <tr
                    key={label}
                    className="border-t border-neutral-200 dark:border-neutral-800"
                  >
                    <td className="px-3 py-2 text-neutral-500 dark:text-neutral-400">
                      {label}
                    </td>
                    <td className="px-3 py-2">{fmt(a, label)}</td>
                    <td className="px-3 py-2">{fmt(b, label)}</td>
                    <td
                      className={`px-3 py-2 ${good ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}
                    >
                      {lowerBetter ? "" : delta >= 0 ? "+" : ""}
                      {label.includes("Latency")
                        ? `${Math.round(delta)}`
                        : delta.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-xs text-neutral-500 dark:text-neutral-600">
          Loading metrics…
        </p>
      )}

      {snapshot?.groundednessExample ? (
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-3 dark:border-neutral-800 dark:bg-neutral-900/40">
          <p className="text-[11px] font-medium tracking-wide text-neutral-500 uppercase">
            Faithfulness / groundedness (sample)
          </p>
          <p className="mt-1 font-mono text-sm text-cyan-800 dark:text-cyan-300">
            score {snapshot.groundednessExample.score.toFixed(2)} ·{" "}
            {snapshot.groundednessExample.supportedClaims}/
            {snapshot.groundednessExample.totalClaims} claims supported
          </p>
          <p className="mt-1 text-xs text-neutral-500">
            {snapshot.groundednessExample.notes}
          </p>
        </div>
      ) : null}

      <div>
        <h3 className="mb-2 text-sm font-semibold text-neutral-900 dark:text-white">
          Eval questions ({questions.length})
        </h3>
        <ul className="max-h-56 space-y-1.5 overflow-y-auto text-xs text-neutral-600 dark:text-neutral-400">
          {questions.map((q) => (
            <li
              key={q.id}
              className="rounded border border-neutral-200 px-2 py-1.5 dark:border-neutral-800/80"
            >
              <span className="font-mono text-neutral-400 dark:text-neutral-600">
                {q.id}
              </span>{" "}
              {q.question}
              {q.multiHop ? (
                <span className="ml-2 rounded bg-violet-100 px-1.5 py-0.5 text-[10px] text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
                  multi-hop
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-neutral-900 dark:text-white">
          Known failure modes
        </h3>
        <div className="grid gap-3 md:grid-cols-3">
          {failures.map((f) => (
            <article
              key={f.id}
              className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-900/40"
            >
              <h4 className="text-xs font-semibold text-amber-800 dark:text-amber-200/90">
                {f.title}
              </h4>
              <p className="mt-1 font-mono text-[11px] text-neutral-500">
                “{f.question}”
              </p>
              <p className="mt-2 text-[11px] leading-relaxed text-neutral-600 dark:text-neutral-400">
                <span className="text-neutral-500">What happened: </span>
                {f.whatHappened}
              </p>
              <p className="mt-1.5 text-[11px] leading-relaxed text-neutral-600 dark:text-neutral-400">
                <span className="text-neutral-500">Why: </span>
                {f.why}
              </p>
              <p className="mt-1.5 text-[11px] leading-relaxed text-neutral-600 dark:text-neutral-400">
                <span className="text-neutral-500">Mitigation: </span>
                {f.mitigation}
              </p>
            </article>
          ))}
        </div>
      </div>

      {live?.rows ? (
        <div>
          <h3 className="mb-2 text-sm font-semibold text-neutral-900 dark:text-white">
            Live sample rows
          </h3>
          <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800">
            <table className="w-full text-left font-mono text-[11px]">
              <thead className="bg-neutral-50 text-neutral-500 dark:bg-neutral-950">
                <tr>
                  <th className="px-2 py-1.5">Q</th>
                  <th className="px-2 py-1.5">Mode</th>
                  <th className="px-2 py-1.5">R@5</th>
                  <th className="px-2 py-1.5">MRR</th>
                  <th className="px-2 py-1.5">ms</th>
                  <th className="px-2 py-1.5">Hit</th>
                </tr>
              </thead>
              <tbody className="text-neutral-700 dark:text-neutral-300">
                {live.rows.map((r) => (
                  <tr
                    key={`${r.questionId}-${r.mode}`}
                    className="border-t border-neutral-200 dark:border-neutral-800"
                  >
                    <td className="px-2 py-1.5">{r.questionId}</td>
                    <td className="px-2 py-1.5">{r.mode}</td>
                    <td className="px-2 py-1.5">{r.recallAt5.toFixed(2)}</td>
                    <td className="px-2 py-1.5">{r.mrr.toFixed(2)}</td>
                    <td className="px-2 py-1.5">{Math.round(r.latencyMs)}</td>
                    <td className="px-2 py-1.5">{r.hit ? "Y" : "N"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function fmt(n: number, label: string) {
  if (label.includes("Latency")) return `${Math.round(n)}`;
  return n.toFixed(2);
}
