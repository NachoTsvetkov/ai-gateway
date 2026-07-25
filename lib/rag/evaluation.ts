/**
 * Retrieval evaluation helpers: Recall@K, MRR, optional groundedness.
 */

import "server-only";

import { generateText, gateway } from "ai";
import { EVAL_QUESTIONS } from "./eval-set";
import { retrieve } from "./retrieval";
import type {
  AggregateEvalMetrics,
  EvalMetrics,
  EvalQuestion,
  GroundednessResult,
  RetrievalMode,
} from "./types";

function docHit(retrievedDocIds: Set<string>, gold: EvalQuestion): boolean {
  return gold.relevantDocIds.some((id) => retrievedDocIds.has(id));
}

function recallAtK(
  retrievedDocIds: string[],
  gold: EvalQuestion,
  k: number,
): number {
  if (gold.relevantDocIds.length === 0) return 0;
  const top = new Set(retrievedDocIds.slice(0, k));
  let hits = 0;
  for (const id of gold.relevantDocIds) if (top.has(id)) hits += 1;
  return hits / gold.relevantDocIds.length;
}

function mrr(retrievedDocIds: string[], gold: EvalQuestion): number {
  for (let i = 0; i < retrievedDocIds.length; i++) {
    const id = retrievedDocIds[i];
    if (id && gold.relevantDocIds.includes(id)) {
      return 1 / (i + 1);
    }
  }
  return 0;
}

export async function evaluateQuestion(
  question: EvalQuestion,
  mode: RetrievalMode,
): Promise<EvalMetrics> {
  const t0 = Date.now();
  const result = await retrieve({
    query: question.question,
    mode,
    topK: mode === "naive" ? 5 : 10,
  });
  const retrievedDocIds = result.retrieved.map((r) => r.chunk.docId);
  const retrievedChunkIds = result.retrieved.map((r) => r.chunk.id);
  const uniqueDocs = [...new Set(retrievedDocIds)];

  return {
    questionId: question.id,
    mode,
    recallAt5: recallAtK(uniqueDocs, question, 5),
    recallAt10: recallAtK(uniqueDocs, question, 10),
    mrr: mrr(uniqueDocs, question),
    latencyMs: Date.now() - t0,
    retrievedChunkIds,
    hit: docHit(new Set(uniqueDocs.slice(0, 5)), question),
  };
}

export function aggregateMetrics(
  rows: EvalMetrics[],
  mode: RetrievalMode,
): AggregateEvalMetrics {
  const subset = rows.filter((r) => r.mode === mode);
  const n = subset.length || 1;
  const sum = (fn: (r: EvalMetrics) => number) =>
    subset.reduce((a, r) => a + fn(r), 0);
  return {
    mode,
    n: subset.length,
    meanRecallAt5: sum((r) => r.recallAt5) / n,
    meanRecallAt10: sum((r) => r.recallAt10) / n,
    meanMrr: sum((r) => r.mrr) / n,
    meanLatencyMs: sum((r) => r.latencyMs) / n,
    hitRateAt5: sum((r) => (r.hit ? 1 : 0)) / n,
  };
}

export async function runEvaluation(options?: {
  mode?: RetrievalMode | "both";
  limit?: number;
}): Promise<{
  rows: EvalMetrics[];
  naive?: AggregateEvalMetrics;
  improved?: AggregateEvalMetrics;
}> {
  const mode = options?.mode ?? "both";
  const questions = EVAL_QUESTIONS.slice(0, options?.limit ?? EVAL_QUESTIONS.length);
  const rows: EvalMetrics[] = [];

  for (const q of questions) {
    if (mode === "naive" || mode === "both") {
      rows.push(await evaluateQuestion(q, "naive"));
    }
    if (mode === "improved" || mode === "both") {
      rows.push(await evaluateQuestion(q, "improved"));
    }
  }

  return {
    rows,
    naive:
      mode === "improved"
        ? undefined
        : aggregateMetrics(rows, "naive"),
    improved:
      mode === "naive"
        ? undefined
        : aggregateMetrics(rows, "improved"),
  };
}

/**
 * Lightweight faithfulness / groundedness estimate via LLM judge.
 * Used sparingly (demo sample) — not run on every chat turn.
 */
export async function scoreGroundedness(
  question: string,
  answer: string,
  context: string,
): Promise<GroundednessResult> {
  try {
    const { text } = await generateText({
      model: gateway("openai/gpt-4o-mini"),
      temperature: 0,
      prompt: `You are a faithfulness judge for a RAG system.

Question: ${question}

Context:
${context.slice(0, 6000)}

Answer:
${answer.slice(0, 3000)}

Split the answer into factual claims. Count how many are supported by the context.
Return JSON only:
{"supportedClaims":N,"totalClaims":N,"score":0-1,"notes":"one sentence"}`,
    });
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("no json");
    const parsed = JSON.parse(match[0]) as GroundednessResult;
    return {
      score: Number(parsed.score) || 0,
      supportedClaims: Number(parsed.supportedClaims) || 0,
      totalClaims: Number(parsed.totalClaims) || 0,
      notes: parsed.notes || "",
    };
  } catch {
    return {
      score: 0,
      supportedClaims: 0,
      totalClaims: 0,
      notes: "Groundedness judge unavailable.",
    };
  }
}
