/**
 * Offline sparse+tfidf eval to refresh honest snapshot metrics.
 * Usage: npx tsx scripts/eval-rag-offline.ts
 */

import { buildBm25Index, bm25Search } from "../lib/rag/bm25";
import { getChunks } from "../lib/rag/chunking";
import { EVAL_QUESTIONS } from "../lib/rag/eval-set";
import { tfidfSearch } from "../lib/rag/tfidf";

function rrfMerge(
  lists: Array<Array<{ id: string }>>,
): string[] {
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

function docIdsFromChunks(chunkIds: string[], byChunk: Map<string, string>) {
  return [...new Set(chunkIds.map((id) => byChunk.get(id)).filter(Boolean))] as string[];
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

function evalMode(mode: "naive" | "improved") {
  const chunks = getChunks();
  const byChunk = new Map(chunks.map((c) => [c.id, c.docId]));
  const bm25 = buildBm25Index(chunks);
  const rows = EVAL_QUESTIONS.map((q) => {
    let rankedChunkIds: string[];
    if (mode === "naive") {
      rankedChunkIds = tfidfSearch(q.question, 10).map((h) => h.chunk.id);
    } else {
      const queries = [
        q.question,
        `${q.question} SRE reliability`,
        `${q.question} root cause postmortem`,
      ];
      const sparse = queries.map((query) =>
        bm25Search(bm25, query, 20).map((h) => ({ id: h.chunk.id })),
      );
      const dense = queries.map((query) =>
        tfidfSearch(query, 20).map((h) => ({ id: h.chunk.id })),
      );
      rankedChunkIds = rrfMerge([...sparse, ...dense]).slice(0, 10);
    }
    const docs = docIdsFromChunks(rankedChunkIds, byChunk);
    return {
      recallAt5: recall(docs, q.relevantDocIds, 5),
      recallAt10: recall(docs, q.relevantDocIds, 10),
      mrr: mrr(docs, q.relevantDocIds),
      hit: q.relevantDocIds.some((id) => docs.slice(0, 5).includes(id)),
    };
  });
  const n = rows.length;
  const mean = (fn: (r: (typeof rows)[0]) => number) =>
    rows.reduce((a, r) => a + fn(r), 0) / n;
  return {
    mode,
    n,
    meanRecallAt5: mean((r) => r.recallAt5),
    meanRecallAt10: mean((r) => r.recallAt10),
    meanMrr: mean((r) => r.mrr),
    hitRateAt5: mean((r) => (r.hit ? 1 : 0)),
  };
}

const naive = evalMode("naive");
const improved = evalMode("improved");
console.log(JSON.stringify({ naive, improved }, null, 2));
