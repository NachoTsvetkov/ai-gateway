/**
 * Hybrid retrieval + Naive vs Improved pipelines.
 */

import "server-only";

import { generateText, gateway } from "ai";
import { buildBm25Index, bm25Search, type Bm25Index } from "./bm25";
import { getChunkById, getChunks } from "./chunking";
import { denseRetrieve, hasEmbeddingIndex } from "./embeddings";
import type {
  Citation,
  LatencyBreakdown,
  QueryRewriteResult,
  RetrievalMode,
  RetrievalResult,
  ScoredChunk,
  SearchChannel,
} from "./types";

const RRF_K = 60;

let bm25Cache: Bm25Index | null = null;

function getBm25(): Bm25Index {
  if (!bm25Cache) bm25Cache = buildBm25Index(getChunks());
  return bm25Cache;
}

function emptyLatency(): LatencyBreakdown {
  return {
    queryRewriteMs: 0,
    embeddingMs: 0,
    sparseMs: 0,
    denseMs: 0,
    fusionMs: 0,
    rerankMs: 0,
    generationMs: 0,
    totalMs: 0,
  };
}

function toCitation(sc: ScoredChunk): Citation {
  const excerpt = sc.chunk.text.replace(/^\[[^\]]+\]\n\n/, "").slice(0, 320);
  return {
    chunkId: sc.chunk.id,
    docId: sc.chunk.docId,
    title: sc.chunk.title,
    section: sc.chunk.section,
    headingPath: sc.chunk.headingPath,
    source: sc.chunk.source,
    sourceUrl: sc.chunk.sourceUrl,
    type: sc.chunk.type,
    excerpt: excerpt + (excerpt.length >= 320 ? "…" : ""),
    score: sc.rerankScore ?? sc.rrfScore ?? sc.score,
  };
}

function reciprocalRankFusion(
  lists: Array<
    Array<{ chunkId: string; score: number; channel: "dense" | "sparse" }>
  >,
): Map<string, { rrf: number; dense?: number; sparse?: number }> {
  const merged = new Map<
    string,
    { rrf: number; dense?: number; sparse?: number }
  >();
  for (const list of lists) {
    list.forEach((item, rank) => {
      const add = 1 / (RRF_K + rank + 1);
      const cur = merged.get(item.chunkId) ?? { rrf: 0 };
      cur.rrf += add;
      if (item.channel === "dense") cur.dense = item.score;
      if (item.channel === "sparse") cur.sparse = item.score;
      merged.set(item.chunkId, cur);
    });
  }
  return merged;
}

function lexicalRerank(query: string, candidates: ScoredChunk[]): ScoredChunk[] {
  const q = query.toLowerCase();
  const terms = q.split(/\s+/).filter((t) => t.length > 2);
  return candidates
    .map((c) => {
      const text = c.chunk.text.toLowerCase();
      let hits = 0;
      for (const t of terms) if (text.includes(t)) hits += 1;
      const coverage = terms.length ? hits / terms.length : 0;
      const phraseBonus = q.length > 8 && text.includes(q) ? 0.15 : 0;
      const tagBonus = c.chunk.tags.some((tag) => q.includes(tag)) ? 0.08 : 0;
      const base = c.rrfScore ?? c.score;
      const rerankScore =
        base * 0.55 + coverage * 0.35 + phraseBonus + tagBonus;
      return {
        ...c,
        rerankScore,
        score: rerankScore,
        channel: "rerank" as const,
      };
    })
    .sort((a, b) => (b.rerankScore ?? 0) - (a.rerankScore ?? 0));
}

function expandWithNeighbors(
  scored: ScoredChunk[],
  maxTotal: number,
): ScoredChunk[] {
  const seen = new Set(scored.map((s) => s.chunk.id));
  const out = [...scored];
  for (const sc of scored) {
    for (const neighborId of [sc.chunk.prevChunkId, sc.chunk.nextChunkId]) {
      if (!neighborId || seen.has(neighborId) || out.length >= maxTotal) {
        continue;
      }
      const chunk = getChunkById(neighborId);
      if (!chunk) continue;
      seen.add(neighborId);
      out.push({
        chunk,
        score: (sc.score ?? 0) * 0.55,
        channel: sc.channel,
      });
    }
  }
  return out.slice(0, maxTotal);
}

async function rewriteQuery(query: string): Promise<{
  rewrite: QueryRewriteResult;
  ms: number;
}> {
  const t0 = Date.now();
  try {
    const { text } = await generateText({
      model: gateway("openai/gpt-4o-mini"),
      temperature: 0,
      prompt: `You rewrite search queries for a Software Engineering / DevOps knowledge base (SRE, postmortems, ADRs).

Original query:
${query}

Return JSON only:
{"rewritten":["alt1","alt2"],"rationale":"one sentence"}

Rules:
- Produce 2 alternative queries that surface complementary evidence (synonyms, related SRE terms, multi-hop angles).
- Keep each under 20 words.
- Do not answer the question.`,
    });
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("no json");
    const parsed = JSON.parse(match[0]) as {
      rewritten?: string[];
      rationale?: string;
    };
    const rewritten = (parsed.rewritten ?? [])
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 3);
    return {
      rewrite: {
        original: query,
        rewritten: rewritten.length ? rewritten : [query],
        rationale: parsed.rationale ?? "Fallback: using original query.",
      },
      ms: Date.now() - t0,
    };
  } catch {
    // Deterministic offline rewrite when the gateway is unavailable.
    const extras = [
      `${query} SRE reliability`,
      `${query} root cause postmortem`,
    ];
    return {
      rewrite: {
        original: query,
        rewritten: extras,
        rationale:
          "Heuristic rewrite (model unavailable): added SRE/postmortem angles.",
      },
      ms: Date.now() - t0,
    };
  }
}

function buildContext(scored: ScoredChunk[]): string {
  return scored
    .map((s, i) => {
      const c = s.chunk;
      return `[${i + 1}] (${c.id}) ${c.title} · ${c.headingPath}\nSource: ${c.source}${c.sourceUrl ? ` — ${c.sourceUrl}` : ""}\n${c.text}`;
    })
    .join("\n\n---\n\n");
}

export async function retrieve(options: {
  query: string;
  mode: RetrievalMode;
  channel?: SearchChannel;
  topK?: number;
}): Promise<RetrievalResult & { denseBackend?: "openai" | "tfidf" }> {
  const topK = options.topK ?? (options.mode === "naive" ? 5 : 8);
  const channel: SearchChannel =
    options.channel ?? (options.mode === "naive" ? "dense" : "hybrid");
  const latency = emptyLatency();
  const tAll = Date.now();
  const chunks = getChunks();

  let rewrite: QueryRewriteResult | undefined;
  let queries = [options.query];
  let denseBackend: "openai" | "tfidf" | undefined;

  if (options.mode === "improved") {
    const rw = await rewriteQuery(options.query);
    rewrite = rw.rewrite;
    latency.queryRewriteMs = rw.ms;
    queries = [options.query, ...rw.rewrite.rewritten];
  }

  let retrieved: ScoredChunk[] = [];

  if (channel === "sparse") {
    const t0 = Date.now();
    const index = getBm25();
    const lists = queries.map((q) =>
      bm25Search(index, q, 20).map((h) => ({
        chunkId: h.chunk.id,
        score: h.score,
        channel: "sparse" as const,
      })),
    );
    const fused = reciprocalRankFusion(lists);
    const sparseHits: ScoredChunk[] = [];
    for (const [chunkId, v] of fused) {
      const chunk = getChunkById(chunkId);
      if (!chunk) continue;
      sparseHits.push({
        chunk,
        score: v.rrf,
        sparseScore: v.sparse,
        rrfScore: v.rrf,
        channel: "sparse",
      });
    }
    retrieved = sparseHits.sort((a, b) => b.score - a.score).slice(0, Math.max(topK * 2, 12));
    latency.sparseMs = Date.now() - t0;
  } else if (channel === "dense" || options.mode === "naive") {
    const dense = await denseRetrieve(options.query, chunks, topK);
    latency.embeddingMs = dense.embeddingMs;
    denseBackend = dense.backend;
    retrieved = dense.hits.map((h) => ({
      chunk: h.chunk,
      score: h.score,
      denseScore: h.score,
      channel: "dense" as const,
    }));
    latency.denseMs = dense.embeddingMs;
  } else {
    // Hybrid
    const tSparse = Date.now();
    const index = getBm25();
    const sparseLists = queries.map((q) =>
      bm25Search(index, q, 20).map((h) => ({
        chunkId: h.chunk.id,
        score: h.score,
        channel: "sparse" as const,
      })),
    );
    latency.sparseMs = Date.now() - tSparse;

    const denseLists: Array<
      Array<{ chunkId: string; score: number; channel: "dense" }>
    > = [];
    let embMs = 0;
    for (const q of queries) {
      const dense = await denseRetrieve(q, chunks, 20);
      embMs += dense.embeddingMs;
      denseBackend = dense.backend;
      denseLists.push(
        dense.hits.map((h) => ({
          chunkId: h.chunk.id,
          score: h.score,
          channel: "dense" as const,
        })),
      );
    }
    latency.embeddingMs = embMs;
    latency.denseMs = embMs;

    const tFusion = Date.now();
    const fused = reciprocalRankFusion([...sparseLists, ...denseLists]);
    const hybridHits: ScoredChunk[] = [];
    for (const [chunkId, v] of fused) {
      const chunk = getChunkById(chunkId);
      if (!chunk) continue;
      hybridHits.push({
        chunk,
        score: v.rrf,
        denseScore: v.dense,
        sparseScore: v.sparse,
        rrfScore: v.rrf,
        channel: "hybrid",
      });
    }
    retrieved = hybridHits
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);
    latency.fusionMs = Date.now() - tFusion;
  }

  if (options.mode === "improved") {
    const tR = Date.now();
    retrieved = lexicalRerank(options.query, retrieved).slice(0, topK);
    latency.rerankMs = Date.now() - tR;
    retrieved = expandWithNeighbors(retrieved, topK + 2);
  } else {
    retrieved = retrieved.slice(0, topK);
  }

  latency.totalMs = Date.now() - tAll;

  return {
    mode: options.mode,
    channel,
    query: options.query,
    rewrite,
    retrieved,
    citations: retrieved.map(toCitation),
    latency,
    contextText: buildContext(retrieved),
    denseBackend,
  };
}

export function retrievalDiagnostics() {
  return {
    hasEmbeddings: hasEmbeddingIndex(),
    chunkCount: getChunks().length,
    bm25Ready: true,
  };
}
