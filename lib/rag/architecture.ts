/**
 * Public architecture notes for the RAG demo (rendered on the page).
 */

export const RAG_ARCHITECTURE = {
  title: "Architecture Notes",
  summary:
    "Production-shaped RAG over a Software Engineering / DevOps knowledge base — hybrid retrieval, inspectable intermediate steps, and honest evaluation.",
  decisions: [
    {
      title: "Corpus",
      body: "79 original documents (~66k words): SRE guides, workbooks, paraphrased public postmortems with source URLs, ADRs, and engineering-blog distillations. No verbatim copyrighted book text.",
    },
    {
      title: "Chunking",
      body: "Structure-aware splits on markdown headings, target ~2.2k chars, 12% overlap, title+heading prefixes on every chunk. Adjacent chunks linked for context expansion.",
    },
    {
      title: "Hybrid search",
      body: "BM25 (sparse) + dense vectors fused with Reciprocal Rank Fusion (k=60). Dense prefers text-embedding-3-small (256-d); TF-IDF cosine is the offline fallback.",
    },
    {
      title: "Improved pipeline",
      body: "Multi-query rewrite → hybrid RRF → lexical/coverage rerank → neighbor expansion. Naive path is single-query dense-only top-5 for a fair before/after.",
    },
    {
      title: "Evaluation",
      body: "20 gold questions (including multi-hop) scored with Recall@K and MRR. Failure cases are documented, not hidden. Groundedness judged on sample answers.",
    },
    {
      title: "Hosting",
      body: "Next.js App Router on Vercel. In-process BM25/TF-IDF index (no external vector DB required for the demo). Swap the dense store for Qdrant/pgvector in production.",
    },
  ],
} as const;
