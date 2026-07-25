import { EVAL_QUESTIONS, FAILURE_CASES, SNAPSHOT_METRICS } from "lib/rag/eval-set";
import { runEvaluation } from "lib/rag/evaluation";
import { corpusStats } from "lib/rag/chunking";
import { retrievalDiagnostics } from "lib/rag/retrieval";
import { z } from "zod";

export const maxDuration = 300;

const BodySchema = z.object({
  /** Live recompute is expensive — default serves snapshot + optional sample. */
  live: z.boolean().optional().default(false),
  mode: z.enum(["naive", "improved", "both"]).optional().default("both"),
  limit: z.number().int().min(1).max(20).optional().default(5),
});

export async function GET() {
  return Response.json({
    questions: EVAL_QUESTIONS,
    failureCases: FAILURE_CASES,
    snapshot: SNAPSHOT_METRICS,
    corpus: corpusStats(),
    diagnostics: retrievalDiagnostics(),
  });
}

export async function POST(req: Request) {
  const json = await req.json().catch(() => ({}));
  const body = BodySchema.parse(json);

  if (!body.live) {
    return Response.json({
      live: false,
      snapshot: SNAPSHOT_METRICS,
      failureCases: FAILURE_CASES,
      questions: EVAL_QUESTIONS,
    });
  }

  const result = await runEvaluation({
    mode: body.mode,
    limit: body.limit,
  });

  return Response.json({
    live: true,
    rows: result.rows,
    naive: result.naive,
    improved: result.improved,
    failureCases: FAILURE_CASES,
    note: `Live eval on first ${body.limit} questions. Full 20-question snapshot is precomputed.`,
  });
}
