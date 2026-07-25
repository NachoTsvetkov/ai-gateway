/**
 * Offline TF-IDF vectors used as a dense-channel fallback when the
 * OpenAI embedding index has not been built yet. Labeled honestly in the UI.
 */

import { getChunks } from "./chunking";
import type { Chunk } from "./types";

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s#-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2);
}

export type TfidfIndex = {
  vocab: string[];
  /** chunkId -> sparse map termIndex -> weight */
  vectors: Map<string, Map<number, number>>;
  idf: Float64Array;
  chunks: Chunk[];
};

let cached: TfidfIndex | null = null;

export function getTfidfIndex(): TfidfIndex {
  if (cached) return cached;
  const chunks = getChunks();
  const df = new Map<string, number>();
  const docsTokens = chunks.map((c) => tokenize(c.text));

  for (const tokens of docsTokens) {
    const uniq = new Set(tokens);
    for (const t of uniq) df.set(t, (df.get(t) ?? 0) + 1);
  }

  // Cap vocab to keep vectors lean — prefer mid-df terms.
  const vocab = [...df.entries()]
    .filter(([, c]) => c >= 2 && c < chunks.length * 0.6)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4096)
    .map(([t]) => t);
  const termIndex = new Map(vocab.map((t, i) => [t, i]));
  const idf = new Float64Array(vocab.length);
  const N = chunks.length;
  vocab.forEach((t, i) => {
    idf[i] = Math.log(1 + N / ((df.get(t) ?? 1) + 1));
  });

  const vectors = new Map<string, Map<number, number>>();
  chunks.forEach((chunk, di) => {
    const tokens = docsTokens[di] ?? [];
    const tf = new Map<string, number>();
    for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1);
    const sparse = new Map<number, number>();
    let norm = 0;
    for (const [t, count] of tf) {
      const idx = termIndex.get(t);
      if (idx === undefined) continue;
      const idfWeight = idf[idx] ?? 0;
      const w = (1 + Math.log(count)) * idfWeight;
      sparse.set(idx, w);
      norm += w * w;
    }
    norm = Math.sqrt(norm) || 1;
    for (const [idx, w] of sparse) sparse.set(idx, w / norm);
    vectors.set(chunk.id, sparse);
  });

  cached = { vocab, vectors, idf, chunks };
  return cached;
}

export function tfidfSearch(
  query: string,
  topK: number,
): Array<{ chunk: Chunk; score: number }> {
  const index = getTfidfIndex();
  const termIndex = new Map(index.vocab.map((t, i) => [t, i]));
  const qtf = new Map<string, number>();
  for (const t of tokenize(query)) qtf.set(t, (qtf.get(t) ?? 0) + 1);

  const qVec = new Map<number, number>();
  let qNorm = 0;
  for (const [t, count] of qtf) {
    const idx = termIndex.get(t);
    if (idx === undefined) continue;
    const idfWeight = index.idf[idx] ?? 0;
    const w = (1 + Math.log(count)) * idfWeight;
    qVec.set(idx, w);
    qNorm += w * w;
  }
  qNorm = Math.sqrt(qNorm) || 1;

  const scored: Array<{ chunk: Chunk; score: number }> = [];
  for (const chunk of index.chunks) {
    const dVec = index.vectors.get(chunk.id);
    if (!dVec) continue;
    let dot = 0;
    for (const [idx, qw] of qVec) {
      const dw = dVec.get(idx);
      if (dw) dot += (qw / qNorm) * dw;
    }
    if (dot > 0) scored.push({ chunk, score: dot });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}
