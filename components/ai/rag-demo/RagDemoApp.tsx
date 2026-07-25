"use client";

import { useState } from "react";
import { ChatInterface } from "./ChatInterface";
import { RetrievalInspector } from "./RetrievalInspector";
import { EvaluationDashboard } from "./EvaluationDashboard";
import { ArchitectureNotes } from "./ArchitectureNotes";

type Tab = "chat" | "inspector" | "eval";

const TABS: { id: Tab; label: string }[] = [
  { id: "chat", label: "Chat / Query" },
  { id: "inspector", label: "Retrieval Inspector" },
  { id: "eval", label: "Evaluation" },
];

export type RetrievedHit = {
  chunkId: string;
  docId?: string;
  title: string;
  type?: string;
  section?: string;
  headingPath: string;
  source?: string;
  sourceUrl?: string;
  tags?: string[];
  excerpt: string;
  score: number;
  denseScore?: number;
  sparseScore?: number;
  rrfScore?: number;
  rerankScore?: number;
  channel: string;
};

export type RagMeta = {
  citations?: Array<{
    chunkId: string;
    title: string;
    headingPath: string;
    source: string;
    sourceUrl?: string;
    excerpt: string;
    score: number;
  }>;
  rewrite?: {
    original: string;
    rewritten: string[];
    rationale: string;
  };
  denseBackend?: "openai" | "tfidf";
  latency?: {
    queryRewriteMs: number;
    embeddingMs: number;
    sparseMs: number;
    denseMs: number;
    fusionMs: number;
    rerankMs: number;
    generationMs: number;
    totalMs: number;
  };
  mode?: string;
  channel?: string;
  retrieved?: RetrievedHit[];
};

export function RagDemoApp() {
  const [tab, setTab] = useState<Tab>("chat");
  const [lastMeta, setLastMeta] = useState<RagMeta | null>(null);
  const [lastQuery, setLastQuery] = useState("");

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-700 dark:bg-neutral-900">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 bg-neutral-50 px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900/80">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] tracking-wider text-cyan-700 uppercase dark:text-cyan-400/90">
            rag://sre-kb
          </span>
          <span className="hidden text-neutral-300 dark:text-neutral-600 sm:inline">
            ·
          </span>
          <span className="hidden text-xs text-neutral-500 dark:text-neutral-400 sm:inline">
            Hybrid · Inspectable · Evaluated
          </span>
        </div>
        <div className="flex rounded-lg bg-white p-0.5 ring-1 ring-neutral-200 dark:bg-neutral-950 dark:ring-neutral-700">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                tab === t.id
                  ? "bg-neutral-900 text-white dark:bg-neutral-800"
                  : "text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-[560px]">
        {tab === "chat" ? (
          <ChatInterface
            onMeta={(meta, query) => {
              setLastMeta(meta);
              setLastQuery(query);
            }}
            onOpenInspector={() => setTab("inspector")}
          />
        ) : null}
        {tab === "inspector" ? (
          <RetrievalInspector
            initialQuery={lastQuery}
            seedMeta={lastMeta}
            onMeta={(meta, query) => {
              setLastMeta(meta);
              setLastQuery(query);
            }}
          />
        ) : null}
        {tab === "eval" ? <EvaluationDashboard /> : null}
      </div>

      <ArchitectureNotes />
    </div>
  );
}
