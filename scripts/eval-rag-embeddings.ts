/**
 * Eval using precomputed OpenAI embeddings (honest Naive vs Improved).
 * Usage: npx tsx scripts/eval-rag-embeddings.ts
 */

import { readFileSync } from "fs";
import path from "path";
import { config } from "dotenv";
import { embed } from "ai";
import { buildBm25Index, bm25Search } from "../lib/rag/bm25";
import { getChunks } from "../lib/rag/chunking";
import { EVAL_QUESTIONS } from "../lib/rag/eval-set";
import { cosineSimilarity } from "../lib/rag/embeddings-math";

config({ path: ".env.local" });

type EmbIndex = {
  vectors: Record<string, number[]>;
  chunkIds: string[];
};

function denseTopK(
  index: EmbIndex,
  chunkById: Map<string, { id: string; docId: string }>,
  queryVec: number[],
  k: number,
) {
  const scored: Array<{ id: string; score: number }> = [];
  for (const id of index.chunkIds) {
    const vec = index.vectors[id];
    if (!vec || !chunkById.has(id)) continue;
    scored.push({ id, score: cosineSimilarity(queryVec, vec) });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, k);
}

function rrf(lists: Array<Array<{ id: string }>>) {
  const scores = new Map<string, number>();
  for (const list of lists) {
    list.forEach((item, rank) => {
      scores.set(item.id, (scores.get(item.id) ?? 0) + 1 / (60 + rank + 1));
    });
  }
  return [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id);
}

function docsFrom(chunkIds: string[], chunkById: Map<string, { docId: string }>) {
  return [
    ...new Set(
      chunkIds
        .map((id) => chunkById.get(id)?.docId)
        .filter((x): x is string => Boolean(x)),
    ),
  ];
}

function recall(docs: string[], gold: string[], k: number) {
  if (!gold.length) return 0;
  const top = new Set(docs.slice(0, k));
  let hits = 0;
  for (const g of gold) if (top.has(g)) hits += 1;
  return hits / gold.length;
}

function mrr(docs: string[], gold: string[]) {
  for (let i = 0; i < docs.length; i++) {
    if (gold.includes(docs[i]!)) return 1 / (i + 1);
  }
  return 0;
}

async function main() {
  const raw = JSON.parse(
    readFileSync(path.join("data", "rag", "embeddings.json"), "utf8"),
  ) as EmbIndex;
  const chunks = getChunks();
  const chunkById = new Map(chunks.map((c) => [c.id, c]));
  const bm25 = buildBm25Index(chunks);

  async function embedQ(q: string) {
    const { embedding } = await embed({
      model: "openai/text-embedding-3-small",
      value: q,
      providerOptions: { openai: { dimensions: 256 } },
    });
    return embedding;
  }

  type Row = {
    recallAt5: number;
    recallAt10: number;
    mrr: number;
    hit: boolean;
    latencyMs: number;
  };
  const naiveRows: Row[] = [];
  const improvedRows: Row[] = [];

  for (const q of EVAL_QUESTIONS) {
    const t0 = Date.now();
    const qVec = await embedQ(q.question);
    const naiveChunks = denseTopK(raw, chunkById, qVec, 5).map((h) => h.id);
    const naiveDocs = docsFrom(naiveChunks, chunkById);
    naiveRows.push({
      recallAt5: recall(naiveDocs, q.relevantDocIds, 5),
      recallAt10: recall(naiveDocs, q.relevantDocIds, 10),
      mrr: mrr(naiveDocs, q.relevantDocIds),
      hit: q.relevantDocIds.some((id) => naiveDocs.slice(0, 5).includes(id)),
      latencyMs: Date.now() - t0,
    });

    const t1 = Date.now();
    const alts = [
      q.question,
      `${q.question} SRE reliability practices`,
      `${q.question} incident postmortem root cause`,
    ];
    const sparseLists = alts.map((a) =>
      bm25Search(bm25, a, 20).map((h) => ({ id: h.chunk.id })),
    );
    const denseLists = [];
    for (const a of alts) {
      const v = await embedQ(a);
      denseLists.push(
        denseTopK(raw, chunkById, v, 20).map((h) => ({ id: h.id })),
      );
    }
    const fused = rrf([...sparseLists, ...denseLists]).slice(0, 8);
    // lexical coverage rerank
    const terms = q.question.toLowerCase().split(/\s+/).filter((t) => t.length > 2);
    const reranked = fused
      .map((id) => {
        const text = (chunkById.get(id)?.text ?? "").toLowerCase();
        let hits = 0;
        for (const t of terms) if (text.includes(t)) hits += 1;
        return { id, score: hits / Math.max(1, terms.length) };
      })
      .sort((a, b) => b.score - a.score)
      .map((x) => x.id);
    const improvedDocs = docsFrom(reranked, chunkById);
    improvedRows.push({
      recallAt5: recall(improvedDocs, q.relevantDocIds, 5),
      recallAt10: recall(improvedDocs, q.relevantDocIds, 10),
      mrr: mrr(improvedDocs, q.relevantDocIds),
      hit: q.relevantDocIds.some((id) => improvedDocs.slice(0, 5).includes(id)),
      latencyMs: Date.now() - t1,
    });
    process.stdout.write(".");
  }
  console.log("");

  const agg = (rows: typeof naiveRows, mode: string) => {
    const n = rows.length;
    const mean = (fn: (r: (typeof rows)[0]) => number) =>
      rows.reduce((a, r) => a + fn(r), 0) / n;
    return {
      mode,
      n,
      meanRecallAt5: Number(mean((r) => r.recallAt5).toFixed(2)),
      meanRecallAt10: Number(mean((r) => r.recallAt10).toFixed(2)),
      meanMrr: Number(mean((r) => r.mrr).toFixed(2)),
      meanLatencyMs: Math.round(mean((r) => r.latencyMs)),
      hitRateAt5: Number(mean((r) => (r.hit ? 1 : 0)).toFixed(2)),
    };
  };

  console.log(
    JSON.stringify(
      { naive: agg(naiveRows, "naive"), improved: agg(improvedRows, "improved") },
      null,
      2,
    ),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
