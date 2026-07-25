/**
 * Okapi BM25 sparse retrieval — no external dependencies.
 */

import type { Chunk } from "./types";

const K1 = 1.5;
const B = 0.75;

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s#-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

export type Bm25Index = {
  N: number;
  avgdl: number;
  docLens: number[];
  postings: Map<string, Map<number, number>>;
  df: Map<string, number>;
  chunks: Chunk[];
};

export function buildBm25Index(chunks: Chunk[]): Bm25Index {
  const postings = new Map<string, Map<number, number>>();
  const df = new Map<string, number>();
  const docLens: number[] = [];
  let totalLen = 0;

  chunks.forEach((chunk, i) => {
    const tokens = tokenize(chunk.text);
    docLens.push(tokens.length);
    totalLen += tokens.length;
    const tf = new Map<string, number>();
    for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1);
    for (const [term, count] of tf) {
      let posting = postings.get(term);
      if (!posting) {
        posting = new Map();
        postings.set(term, posting);
      }
      posting.set(i, count);
      df.set(term, (df.get(term) ?? 0) + 1);
    }
  });

  return {
    N: chunks.length,
    avgdl: totalLen / Math.max(1, chunks.length),
    docLens,
    postings,
    df,
    chunks,
  };
}

export function bm25Search(
  index: Bm25Index,
  query: string,
  topK: number,
): Array<{ chunk: Chunk; score: number; index: number }> {
  const qTerms = tokenize(query);
  if (qTerms.length === 0) return [];

  const scores = new Float64Array(index.N);
  for (const term of qTerms) {
    const posting = index.postings.get(term);
    if (!posting) continue;
    const documentFrequency = index.df.get(term) ?? 0;
    const idf = Math.log(
      1 + (index.N - documentFrequency + 0.5) / (documentFrequency + 0.5),
    );
    for (const [docIndex, tf] of posting) {
      const dl = index.docLens[docIndex] ?? 0;
      const denom = tf + K1 * (1 - B + (B * dl) / index.avgdl);
      scores[docIndex] = (scores[docIndex] ?? 0) + idf * ((tf * (K1 + 1)) / denom);
    }
  }

  const ranked: Array<{ chunk: Chunk; score: number; index: number }> = [];
  for (let i = 0; i < index.N; i++) {
    const score = scores[i] ?? 0;
    const chunk = index.chunks[i];
    if (score > 0 && chunk) {
      ranked.push({ chunk, score, index: i });
    }
  }
  ranked.sort((a, b) => b.score - a.score);
  return ranked.slice(0, topK);
}
