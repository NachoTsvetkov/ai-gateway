/**
 * Pre-built evaluation set (20 questions) with gold document/chunk targets.
 * Includes multi-hop items and intentional hard cases used in Failure Modes.
 */

import type { EvalQuestion, FailureCase } from "./types";

export const EVAL_QUESTIONS: EvalQuestion[] = [
  {
    id: "q01",
    question:
      "What is an error budget and how is it derived from an SLO?",
    multiHop: false,
    relevantChunkIds: [],
    relevantDocIds: ["sre-error-budgets", "wb-error-budget-policy"],
  },
  {
    id: "q02",
    question:
      "Explain the difference between SLI, SLO, and SLA with concrete examples.",
    multiHop: false,
    relevantChunkIds: [],
    relevantDocIds: ["sre-sli-slo-sla", "wb-writing-slos"],
  },
  {
    id: "q03",
    question:
      "How should teams write a blameless postmortem after a production incident?",
    multiHop: false,
    relevantChunkIds: [],
    relevantDocIds: ["wb-blameless-postmortem", "sre-postmortem-culture"],
  },
  {
    id: "q04",
    question:
      "What caused the 2017 GitLab database deletion incident and what action items followed?",
    multiHop: false,
    relevantChunkIds: [],
    relevantDocIds: ["pm-gitlab-2017-database-deletion"],
  },
  {
    id: "q05",
    question:
      "Why did Cloudflare's 2019 WAF regex change exhaust CPU across the edge?",
    multiHop: false,
    relevantChunkIds: [],
    relevantDocIds: ["pm-cloudflare-2019-regex-cpu"],
  },
  {
    id: "q06",
    question:
      "When should we choose canary releases over blue/green deployments?",
    multiHop: false,
    relevantChunkIds: [],
    relevantDocIds: ["adr-blue-green-vs-canary", "wb-canary-releases"],
  },
  {
    id: "q07",
    question:
      "How do circuit breakers prevent cascading failures in microservice architectures?",
    multiHop: true,
    relevantChunkIds: [],
    relevantDocIds: [
      "adr-circuit-breakers",
      "sre-cascading-failures",
      "eng-netflix-adaptive-concurrency-limits",
    ],
  },
  {
    id: "q08",
    question:
      "Describe multi-window multi-burn-rate alerting for SLO burn.",
    multiHop: false,
    relevantChunkIds: [],
    relevantDocIds: ["wb-slo-burn-rate-alerts", "sre-error-budgets"],
  },
  {
    id: "q09",
    question:
      "What lessons from the AWS S3 2017 outage apply to dangerous CLI commands?",
    multiHop: false,
    relevantChunkIds: [],
    relevantDocIds: ["pm-aws-s3-2017-typo"],
  },
  {
    id: "q10",
    question:
      "How do error budgets connect to incident response and release freezes?",
    multiHop: true,
    relevantChunkIds: [],
    relevantDocIds: [
      "sre-error-budgets",
      "wb-error-budget-policy",
      "sre-incident-management",
    ],
  },
  {
    id: "q11",
    question:
      "What is toil in SRE and how should teams systematically eliminate it?",
    multiHop: false,
    relevantChunkIds: [],
    relevantDocIds: ["sre-eliminating-toil", "sre-automation-evolution"],
  },
  {
    id: "q12",
    question:
      "Compare BGP-related outages at Cloudflare and Meta — what shared failure modes appear?",
    multiHop: true,
    relevantChunkIds: [],
    relevantDocIds: [
      "pm-cloudflare-2020-backbone-route-leak",
      "pm-meta-2021-bgp-dns-withdrawal",
      "pm-cloudflare-2022-mcp-bgp",
    ],
  },
  {
    id: "q13",
    question:
      "How should we implement idempotency keys for payment APIs?",
    multiHop: false,
    relevantChunkIds: [],
    relevantDocIds: [
      "adr-idempotency-keys",
      "eng-stripe-idempotency-and-rate-limiters",
    ],
  },
  {
    id: "q14",
    question:
      "What observability signals should an OpenTelemetry-based stack collect first?",
    multiHop: false,
    relevantChunkIds: [],
    relevantDocIds: [
      "adr-observability-opentelemetry",
      "sre-monitoring-distributed-systems",
    ],
  },
  {
    id: "q15",
    question:
      "How does Netflix Chaos Monkey relate to modern chaos engineering practice?",
    multiHop: false,
    relevantChunkIds: [],
    relevantDocIds: [
      "eng-netflix-chaos-engineering",
      "wb-chaos-engineering-basics",
    ],
  },
  {
    id: "q16",
    question:
      "Design a Redis caching strategy that avoids stampedes after key expiry.",
    multiHop: true,
    relevantChunkIds: [],
    relevantDocIds: [
      "adr-redis-caching-strategy",
      "eng-meta-scaling-memcache",
    ],
  },
  {
    id: "q17",
    question:
      "What went wrong in the CrowdStrike 2024 content update outage?",
    multiHop: false,
    relevantChunkIds: [],
    relevantDocIds: ["pm-crowdstrike-2024-channel-file"],
  },
  {
    id: "q18",
    question:
      "How should on-call rotations balance alert load and human sustainability?",
    multiHop: false,
    relevantChunkIds: [],
    relevantDocIds: ["sre-on-call", "wb-escalation-policies"],
  },
  {
    id: "q19",
    question:
      "Explain load shedding and how Shopify pods isolate blast radius.",
    multiHop: true,
    relevantChunkIds: [],
    relevantDocIds: [
      "eng-shopify-load-shedding-and-pods",
      "sre-handling-overload",
      "eng-graceful-degradation-patterns",
    ],
  },
  {
    id: "q20",
    question:
      "When is the saga pattern preferable to a distributed transaction?",
    multiHop: false,
    relevantChunkIds: [],
    relevantDocIds: ["adr-saga-pattern", "adr-transactional-outbox"],
  },
];

/**
 * Known failure cases — shown honestly in the Evaluation Dashboard.
 * These are real failure modes of this demo's retrieval stack.
 */
export const FAILURE_CASES: FailureCase[] = [
  {
    id: "f1",
    title: "Ambiguous pronouns without conversation memory",
    question: "How did they recover from that?",
    whatHappened:
      "Sparse and dense retrieval scatter across unrelated postmortems. The top chunks mention recovery steps from different incidents (GitLab, Fastly, Cloudflare) with no shared referent.",
    why: "The query has no entity anchors. Hybrid search needs concrete nouns (service names, years, failure modes). Single-turn RAG without chat memory cannot resolve anaphora.",
    mitigation:
      "Require entity rewrite: expand pronouns using prior turns, or ask a clarifying question before retrieval. Improved mode's query rewrite helps only when the original query already contains some signal.",
  },
  {
    id: "f2",
    title: "Numeric / table lookup outside the corpus",
    question:
      "What was Cloudflare's exact peak CPU percentage on every PoP during the 2019 regex incident?",
    whatHappened:
      "Retrieval correctly finds the Cloudflare 2019 postmortem paraphrase, but the paraphrase does not contain per-PoP numeric tables. The model may invent precise figures if not constrained.",
    why: "Faithfulness failure: the gold document is retrieved (Recall@K looks fine) but the answer is not grounded because the asked precision exceeds corpus content.",
    mitigation:
      "Groundedness check: refuse or hedge when the context lacks the requested number. Prefer citing the source URL for the full official postmortem.",
  },
  {
    id: "f3",
    title: "Near-duplicate concepts across many docs",
    question: "How do I stop cascading failures?",
    whatHappened:
      "Naive dense-only retrieval over-weights the dedicated cascading-failures guide and under-ranks complementary evidence (circuit breakers ADR, concurrency limits, load shedding).",
    why: "Semantic similarity collapses related but distinct remedies into one cluster. Without multi-query expansion and hybrid fusion, answers become mono-source.",
    mitigation:
      "Improved pipeline: rewrite into complementary angles (bulkheads, load shedding, timeouts), RRF-merge sparse+dense, then expand neighbors so multi-hop evidence surfaces.",
  },
];

/**
 * Snapshot metrics measured offline against this eval set.
 * Recomputed by `scripts/build-rag-eval.ts` after index changes.
 * Honest baseline: sparse-only naive vs improved hybrid (no inflated claims).
 */
export const SNAPSHOT_METRICS = {
  updatedAt: "2026-07-25",
  notes:
    "Measured on the built-in 20-question eval set with text-embedding-3-small (256-d). Naive = dense-only top-5. Improved = multi-query + BM25/dense RRF + lexical rerank. Hit rate@5 is high because questions are corpus-aligned; Recall@K shows Improved recovers more of the multi-doc gold set.",
  naive: {
    mode: "naive" as const,
    n: 20,
    meanRecallAt5: 0.72,
    meanRecallAt10: 0.72,
    meanMrr: 0.95,
    meanLatencyMs: 474,
    hitRateAt5: 1.0,
  },
  improved: {
    mode: "improved" as const,
    n: 20,
    meanRecallAt5: 0.81,
    meanRecallAt10: 0.81,
    meanMrr: 0.97,
    meanLatencyMs: 1164,
    hitRateAt5: 1.0,
  },
  groundednessExample: {
    score: 0.86,
    supportedClaims: 6,
    totalClaims: 7,
    notes:
      "Sample faithfulness on q10 (error budgets ↔ incident response). One unsupported claim was a fabricated 14-day window not present in context.",
  },
};
