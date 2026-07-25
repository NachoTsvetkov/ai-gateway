/**
 * Dense embeddings via Vercel AI Gateway (+ TF-IDF fallback).
 */

import "server-only";

import { embed, embedMany } from "ai";
import { readFileSync, existsSync } from "fs";
import path from "path";
import { tfidfSearch } from "./tfidf";
import type { Chunk } from "./types";
import { cosineSimilarity } from "./embeddings-math";

export { cosineSimilarity };

export const EMBEDDING_MODEL = "openai/text-embedding-3-small";
export const EMBEDDING_DIMENSIONS = 256;

export type EmbeddingIndex = {
  model: string;
  dimensions: number;
  vectors: Record<string, number[]>;
  chunkIds: string[];
};

let cachedIndex: EmbeddingIndex | null | undefined;

function indexPath() {
  return path.join(process.cwd(), "data", "rag", "embeddings.json");
}

export function loadEmbeddingIndex(): EmbeddingIndex | null {
  if (cachedIndex !== undefined) return cachedIndex;
  const file = indexPath();
  if (!existsSync(file)) {
    cachedIndex = null;
    return null;
  }
  try {
    cachedIndex = JSON.parse(readFileSync(file, "utf8")) as EmbeddingIndex;
    return cachedIndex;
  } catch {
    cachedIndex = null;
    return null;
  }
}

export async function embedQuery(text: string): Promise<{
  vector: number[];
  ms: number;
} | null> {
  try {
    const t0 = Date.now();
    const { embedding } = await embed({
      model: EMBEDDING_MODEL,
      value: text,
      providerOptions: {
        openai: { dimensions: EMBEDDING_DIMENSIONS },
      },
    });
    return { vector: embedding, ms: Date.now() - t0 };
  } catch {
    return null;
  }
}

export async function embedDocuments(texts: string[]): Promise<number[][]> {
  const BATCH = 64;
  const out: number[][] = [];
  for (let i = 0; i < texts.length; i += BATCH) {
    const batch = texts.slice(i, i + BATCH);
    const { embeddings } = await embedMany({
      model: EMBEDDING_MODEL,
      values: batch,
      providerOptions: {
        openai: { dimensions: EMBEDDING_DIMENSIONS },
      },
    });
    out.push(...embeddings);
  }
  return out;
}

export function denseSearch(
  index: EmbeddingIndex,
  chunks: Chunk[],
  queryVector: number[],
  topK: number,
): Array<{ chunk: Chunk; score: number }> {
  const byId = new Map(chunks.map((c) => [c.id, c]));
  const scored: Array<{ chunk: Chunk; score: number }> = [];
  for (const chunkId of index.chunkIds) {
    const vec = index.vectors[chunkId];
    const chunk = byId.get(chunkId);
    if (!vec || !chunk) continue;
    scored.push({ chunk, score: cosineSimilarity(queryVector, vec) });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}

/** Prefer OpenAI index; otherwise TF-IDF cosine (offline). */
export async function denseRetrieve(
  query: string,
  chunks: Chunk[],
  topK: number,
): Promise<{
  hits: Array<{ chunk: Chunk; score: number }>;
  embeddingMs: number;
  backend: "openai" | "tfidf";
}> {
  const embIndex = loadEmbeddingIndex();
  if (embIndex) {
    const q = await embedQuery(query);
    if (q) {
      return {
        hits: denseSearch(embIndex, chunks, q.vector, topK),
        embeddingMs: q.ms,
        backend: "openai",
      };
    }
  }
  const t0 = Date.now();
  return {
    hits: tfidfSearch(query, topK),
    embeddingMs: Date.now() - t0,
    backend: "tfidf",
  };
}

export function hasEmbeddingIndex(): boolean {
  return loadEmbeddingIndex() !== null;
}
