/**
 * Offline script: chunk corpus → embed → write data/rag/embeddings.json
 * Usage: pnpm rag:index
 */

import { config } from "dotenv";
import { mkdirSync, writeFileSync } from "fs";
import path from "path";
import { embedMany } from "ai";

config({ path: ".env.local" });
config();

const EMBEDDING_MODEL = "openai/text-embedding-3-small";
const EMBEDDING_DIMENSIONS = 256;

async function main() {
  const { getChunks, corpusStats } = await import("../lib/rag/chunking");

  const stats = corpusStats();
  console.log("Corpus stats:", stats);

  const chunks = getChunks();
  console.log(
    `Embedding ${chunks.length} chunks (${EMBEDDING_MODEL}, ${EMBEDDING_DIMENSIONS}d)…`,
  );

  const BATCH = 64;
  const vectorsList: number[][] = [];
  for (let i = 0; i < chunks.length; i += BATCH) {
    const batch = chunks.slice(i, i + BATCH);
    console.log(`  batch ${i / BATCH + 1} (${batch.length} chunks)`);
    const { embeddings } = await embedMany({
      model: EMBEDDING_MODEL,
      values: batch.map((c) => c.text),
      providerOptions: {
        openai: { dimensions: EMBEDDING_DIMENSIONS },
      },
    });
    vectorsList.push(...embeddings);
  }

  const vectors: Record<string, number[]> = {};
  const chunkIds: string[] = [];
  chunks.forEach((c, i) => {
    const vec = vectorsList[i];
    if (!vec) return;
    chunkIds.push(c.id);
    vectors[c.id] = vec;
  });

  const outDir = path.join(process.cwd(), "data", "rag");
  mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, "embeddings.json");
  writeFileSync(
    outFile,
    JSON.stringify({
      model: EMBEDDING_MODEL,
      dimensions: EMBEDDING_DIMENSIONS,
      chunkIds,
      vectors,
      builtAt: new Date().toISOString(),
      chunkCount: chunks.length,
    }),
  );
  console.log(`Wrote ${outFile}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
