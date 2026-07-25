import { generateText, gateway, streamText } from "ai";
import { retrieve } from "lib/rag/retrieval";
import { scoreGroundedness } from "lib/rag/evaluation";
import type { RetrievalMode, SearchChannel } from "lib/rag/types";
import { z } from "zod";

export const maxDuration = 120;

const BodySchema = z.object({
  query: z.string().min(2).max(2000),
  mode: z.enum(["naive", "improved"]).default("improved"),
  channel: z.enum(["dense", "sparse", "hybrid"]).optional(),
  stream: z.boolean().optional().default(true),
  includeGroundedness: z.boolean().optional().default(false),
  /** Retrieval-only — skip generation (for the Inspector). */
  retrieveOnly: z.boolean().optional().default(false),
});

export async function POST(req: Request) {
  const json = await req.json();
  const body = BodySchema.parse(json);

  const retrieval = await retrieve({
    query: body.query,
    mode: body.mode as RetrievalMode,
    channel: body.channel as SearchChannel | undefined,
  });

  if (body.retrieveOnly) {
    return Response.json({
      retrieval: {
        mode: retrieval.mode,
        channel: retrieval.channel,
        query: retrieval.query,
        rewrite: retrieval.rewrite,
        denseBackend: retrieval.denseBackend,
        latency: retrieval.latency,
        retrieved: retrieval.retrieved.map((r) => ({
          chunkId: r.chunk.id,
          docId: r.chunk.docId,
          title: r.chunk.title,
          type: r.chunk.type,
          section: r.chunk.section,
          headingPath: r.chunk.headingPath,
          source: r.chunk.source,
          sourceUrl: r.chunk.sourceUrl,
          tags: r.chunk.tags,
          excerpt: r.chunk.text.replace(/^\[[^\]]+\]\n\n/, "").slice(0, 500),
          score: r.score,
          denseScore: r.denseScore,
          sparseScore: r.sparseScore,
          rrfScore: r.rrfScore,
          rerankScore: r.rerankScore,
          channel: r.channel,
        })),
        citations: retrieval.citations,
      },
    });
  }

  const system = `You are a senior SRE / DevOps assistant answering from a curated Software Engineering knowledge base.

RULES:
- Answer ONLY using the retrieved context below. If the context is insufficient, say what is missing.
- Cite sources inline as [n] matching the context numbering.
- Prefer concrete mechanisms (error budgets, burn rate, circuit breakers) over vague advice.
- For multi-hop questions, explicitly connect evidence across documents.
- Never invent numeric figures that are not in the context.
- Keep answers tight: short paragraphs, optional bullets.

RETRIEVED CONTEXT:
${retrieval.contextText}`;

  const genStart = Date.now();

  if (!body.stream) {
    const { text } = await generateText({
      model: gateway("openai/gpt-4o-mini"),
      system,
      prompt: body.query,
      temperature: 0.2,
    });
    const generationMs = Date.now() - genStart;
    let groundedness = null;
    if (body.includeGroundedness) {
      groundedness = await scoreGroundedness(
        body.query,
        text,
        retrieval.contextText,
      );
    }
    return Response.json({
      answer: text,
      citations: retrieval.citations,
      retrieval: {
        mode: retrieval.mode,
        channel: retrieval.channel,
        rewrite: retrieval.rewrite,
        denseBackend: retrieval.denseBackend,
        latency: { ...retrieval.latency, generationMs },
        retrieved: retrieval.retrieved.map((r) => ({
          chunkId: r.chunk.id,
          title: r.chunk.title,
          headingPath: r.chunk.headingPath,
          score: r.score,
          denseScore: r.denseScore,
          sparseScore: r.sparseScore,
          rrfScore: r.rrfScore,
          rerankScore: r.rerankScore,
          channel: r.channel,
          type: r.chunk.type,
          source: r.chunk.source,
          sourceUrl: r.chunk.sourceUrl,
          excerpt: r.chunk.text.replace(/^\[[^\]]+\]\n\n/, "").slice(0, 400),
        })),
      },
      groundedness,
    });
  }

  const result = streamText({
    model: gateway("openai/gpt-4o-mini"),
    system,
    prompt: body.query,
    temperature: 0.2,
  });

  // Attach retrieval metadata as a custom header (base64 JSON) so the
  // client can render the inspector alongside the stream.
  const meta = Buffer.from(
    JSON.stringify({
      citations: retrieval.citations,
      rewrite: retrieval.rewrite,
      denseBackend: retrieval.denseBackend,
      latency: retrieval.latency,
      mode: retrieval.mode,
      channel: retrieval.channel,
      retrieved: retrieval.retrieved.map((r) => ({
        chunkId: r.chunk.id,
        title: r.chunk.title,
        headingPath: r.chunk.headingPath,
        score: r.score,
        denseScore: r.denseScore,
        sparseScore: r.sparseScore,
        rrfScore: r.rrfScore,
        rerankScore: r.rerankScore,
        channel: r.channel,
        type: r.chunk.type,
        source: r.chunk.source,
        sourceUrl: r.chunk.sourceUrl,
        excerpt: r.chunk.text.replace(/^\[[^\]]+\]\n\n/, "").slice(0, 400),
      })),
    }),
  ).toString("base64url");

  const response = result.toTextStreamResponse({
    headers: {
      "X-RAG-Meta": meta,
    },
  });
  return response;
}
