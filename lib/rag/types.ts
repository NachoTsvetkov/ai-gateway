/**
 * Shared types for the Software Engineering / DevOps RAG demo.
 *
 * Design goals (visible in the UI):
 * - Honest metrics over inflated ones
 * - Full inspectability of retrieval before generation
 * - Clear Naive vs Improved pipeline comparison
 */

export type DocType =
  | "sre-guide"
  | "workbook"
  | "postmortem"
  | "adr"
  | "engineering-blog";

export type RetrievalMode = "naive" | "improved";

export type SearchChannel = "dense" | "sparse" | "hybrid";

export type CorpusDocument = {
  id: string;
  title: string;
  type: DocType;
  source: string;
  sourceUrl?: string;
  section: string;
  tags: string[];
  content: string;
};

export type Chunk = {
  id: string;
  docId: string;
  title: string;
  type: DocType;
  source: string;
  sourceUrl?: string;
  section: string;
  /** Heading path within the document, e.g. "Error Budgets > Burn Rate" */
  headingPath: string;
  tags: string[];
  text: string;
  /** Character offsets into the source document (for attribution). */
  startChar: number;
  endChar: number;
  /** Sibling / parent chunk ids for context expansion in improved mode. */
  parentChunkId?: string;
  prevChunkId?: string;
  nextChunkId?: string;
};

export type ScoredChunk = {
  chunk: Chunk;
  score: number;
  denseScore?: number;
  sparseScore?: number;
  rrfScore?: number;
  rerankScore?: number;
  channel: SearchChannel | "rerank";
};

export type LatencyBreakdown = {
  queryRewriteMs: number;
  embeddingMs: number;
  sparseMs: number;
  denseMs: number;
  fusionMs: number;
  rerankMs: number;
  generationMs: number;
  totalMs: number;
};

export type Citation = {
  chunkId: string;
  docId: string;
  title: string;
  section: string;
  headingPath: string;
  source: string;
  sourceUrl?: string;
  type: DocType;
  excerpt: string;
  score: number;
};

export type QueryRewriteResult = {
  original: string;
  rewritten: string[];
  rationale: string;
};

export type RetrievalResult = {
  mode: RetrievalMode;
  channel: SearchChannel;
  query: string;
  rewrite?: QueryRewriteResult;
  retrieved: ScoredChunk[];
  citations: Citation[];
  latency: LatencyBreakdown;
  contextText: string;
};

export type EvalQuestion = {
  id: string;
  question: string;
  /** Multi-hop questions need evidence from ≥2 distinct docs. */
  multiHop: boolean;
  /** Gold chunk ids (or doc ids prefixed with "doc:") that should be retrieved. */
  relevantChunkIds: string[];
  relevantDocIds: string[];
  notes?: string;
};

export type EvalMetrics = {
  questionId: string;
  mode: RetrievalMode;
  recallAt5: number;
  recallAt10: number;
  mrr: number;
  latencyMs: number;
  retrievedChunkIds: string[];
  hit: boolean;
};

export type AggregateEvalMetrics = {
  mode: RetrievalMode;
  n: number;
  meanRecallAt5: number;
  meanRecallAt10: number;
  meanMrr: number;
  meanLatencyMs: number;
  hitRateAt5: number;
};

export type FailureCase = {
  id: string;
  title: string;
  question: string;
  whatHappened: string;
  why: string;
  mitigation: string;
};

export type GroundednessResult = {
  score: number;
  supportedClaims: number;
  totalClaims: number;
  notes: string;
};
