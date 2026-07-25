/**
 * Public architecture notes for the RAG demo (rendered on the page).
 * Technical, direct, honest — written for prospects evaluating design choices.
 */

export const RAG_ARCHITECTURE = {
  title: "Architecture Notes",
  summary:
    "Design decisions for this demo. The goal is inspectability and a fair Naive vs Improved comparison — not a black-box chatbot.",
  decisions: [
    {
      title: "Chunking strategy",
      body: "Documents are split on markdown headings so each chunk stays a coherent topic. Target size is ~2.2k characters (hard cap ~3.2k) with 12% overlap so definitions that straddle a boundary are still recoverable. Every chunk is prefixed with title + heading path so both BM25 and embeddings see document context, not orphaned body text.",
    },
    {
      title: "Hybrid retrieval",
      body: "BM25 catches exact terms (incident names, SLOs, ADR IDs). Dense vectors catch paraphrases. The two ranked lists are fused with Reciprocal Rank Fusion (k=60), which is stable when score scales differ and does not require training a fusion model.",
    },
    {
      title: "Embedding choice",
      body: "text-embedding-3-small at 256 dimensions (Matryoshka). For a ~400-chunk demo corpus this is enough recall at much lower cost and latency than text-embedding-3-large or full 1536-d vectors. Production corpora with noisier queries may want higher dims or a stronger model — that is a measured trade-off, not a default.",
    },
    {
      title: "Improved pipeline",
      body: "Multi-query rewrite (2 alternate angles) → BM25 + dense per query → RRF merge → lexical/coverage rerank → expand adjacent chunks for section context. The Naive path is intentionally weaker: single query, dense-only, top-5, no rewrite or rerank — so the before/after is honest.",
    },
    {
      title: "Evaluation",
      body: "20 gold questions (including multi-hop) scored with Recall@K and MRR. Known failure modes are listed on the Evaluation tab. Groundedness is sampled, not claimed as perfect.",
    },
  ],
  production: {
    title: "What would change in production",
    items: [
      "Swap the in-process index for Qdrant or pgvector (persistent, filterable, multi-tenant).",
      "Raise embedding dimensions or model size only if eval metrics justify the cost.",
      "Add observability: p50/p95 retrieval and generation latency, Recall@K drift over time.",
      "Enforce document-level access control before retrieval, not after generation.",
      "Run continuous evaluation on a living question set — not a one-time snapshot.",
    ],
  },
} as const;
