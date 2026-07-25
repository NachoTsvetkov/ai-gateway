/**
 * Structure-aware chunking for the RAG demo.
 *
 * Strategy (shown in Architecture Notes):
 * 1. Split on markdown headings (## / ###) so chunks align with topical units.
 * 2. Target ~450–700 words (~1800–2800 chars). Merge undersized sections;
 *    split oversized ones on paragraph boundaries.
 * 3. 12% character overlap between adjacent chunks to reduce boundary misses.
 * 4. Prefix each chunk with "Title > Heading path" so embeddings and BM25
 *    see document context even when the section body alone is sparse.
 * 5. Link prev/next/parent for improved-mode context expansion.
 *
 * Why not fixed-size token windows alone?
 * Fixed windows bisect definitions mid-sentence and lose heading signal.
 * Structure-aware chunks retrieve cleaner evidence and cite better.
 */

import { CORPUS } from "./corpus";
import type { Chunk, CorpusDocument } from "./types";

const TARGET_CHARS = 2200;
const MAX_CHARS = 3200;
const MIN_CHARS = 600;
const OVERLAP_RATIO = 0.12;

type Section = {
  headingPath: string;
  text: string;
  startChar: number;
  endChar: number;
};

function parseSections(doc: CorpusDocument): Section[] {
  const lines = doc.content.split("\n");
  const sections: Section[] = [];
  let headingStack: string[] = [doc.section];
  let buf: string[] = [];
  let sectionStart = 0;
  let cursor = 0;

  const flush = (endChar: number) => {
    const text = buf.join("\n").trim();
    if (!text) {
      buf = [];
      return;
    }
    sections.push({
      headingPath: headingStack.join(" > "),
      text,
      startChar: sectionStart,
      endChar,
    });
    buf = [];
  };

  for (const line of lines) {
    const h2 = line.match(/^##\s+(.+)$/);
    const h3 = line.match(/^###\s+(.+)$/);
    if (h2 || h3) {
      flush(cursor);
      sectionStart = cursor;
      if (h2?.[1]) {
        headingStack = [doc.section, h2[1].trim()];
      } else if (h3?.[1]) {
        const parent = headingStack[0] ?? doc.section;
        const h2part = headingStack[1];
        headingStack = h2part
          ? [parent, h2part, h3[1].trim()]
          : [parent, h3[1].trim()];
      }
      cursor += line.length + 1;
      continue;
    }
    buf.push(line);
    cursor += line.length + 1;
  }
  flush(cursor);

  if (sections.length === 0) {
    sections.push({
      headingPath: doc.section,
      text: doc.content.trim(),
      startChar: 0,
      endChar: doc.content.length,
    });
  }
  return sections;
}

function splitOversized(text: string, maxChars: number): string[] {
  if (text.length <= maxChars) return [text];
  const paras = text.split(/\n\n+/);
  const parts: string[] = [];
  let current = "";
  for (const p of paras) {
    if (!current) {
      current = p;
      continue;
    }
    if (current.length + p.length + 2 <= maxChars) {
      current = `${current}\n\n${p}`;
    } else {
      parts.push(current);
      current = p;
    }
  }
  if (current) parts.push(current);

  // Hard-split any remaining monsters on sentence-ish boundaries.
  const refined: string[] = [];
  for (const part of parts) {
    if (part.length <= maxChars) {
      refined.push(part);
      continue;
    }
    let i = 0;
    while (i < part.length) {
      let end = Math.min(i + maxChars, part.length);
      if (end < part.length) {
        const slice = part.slice(i, end);
        const lastStop = Math.max(
          slice.lastIndexOf(". "),
          slice.lastIndexOf(".\n"),
          slice.lastIndexOf("? "),
          slice.lastIndexOf("! "),
        );
        if (lastStop > maxChars * 0.5) end = i + lastStop + 1;
      }
      refined.push(part.slice(i, end).trim());
      i = end;
    }
  }
  return refined.filter(Boolean);
}

function mergeSmallSections(sections: Section[]): Section[] {
  if (sections.length <= 1) return sections;
  const merged: Section[] = [];
  let acc: Section | null = null;

  for (const section of sections) {
    if (!acc) {
      acc = { ...section };
      continue;
    }
    if (
      acc.text.length < MIN_CHARS &&
      acc.text.length + section.text.length + 2 <= MAX_CHARS
    ) {
      acc = {
        headingPath: acc.headingPath,
        text: `${acc.text}\n\n${section.text}`,
        startChar: acc.startChar,
        endChar: section.endChar,
      };
    } else {
      merged.push(acc);
      acc = { ...section };
    }
  }
  if (acc) merged.push(acc);
  return merged;
}

function withOverlap(parts: string[]): string[] {
  if (parts.length <= 1) return parts;
  const out: string[] = [];
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (!part) continue;
    if (i === 0) {
      out.push(part);
      continue;
    }
    const prev = parts[i - 1] ?? "";
    const overlapLen = Math.floor(prev.length * OVERLAP_RATIO);
    const overlap = prev.slice(Math.max(0, prev.length - overlapLen));
    out.push(`${overlap}\n\n${part}`.trim());
  }
  return out;
}

function chunkDocument(doc: CorpusDocument): Chunk[] {
  const sections = mergeSmallSections(parseSections(doc));
  const rawPieces: Array<{
    headingPath: string;
    text: string;
    startChar: number;
    endChar: number;
  }> = [];

  for (const section of sections) {
    const pieces =
      section.text.length > TARGET_CHARS
        ? splitOversized(section.text, MAX_CHARS)
        : [section.text];
    const overlapped = withOverlap(pieces);
    let offset = section.startChar;
    for (const text of overlapped) {
      rawPieces.push({
        headingPath: section.headingPath,
        text,
        startChar: offset,
        endChar: Math.min(section.endChar, offset + text.length),
      });
      offset += Math.max(1, Math.floor(text.length * (1 - OVERLAP_RATIO)));
    }
  }

  const chunks: Chunk[] = rawPieces.map((piece, index) => {
    const prefixed = `[${doc.title} · ${piece.headingPath}]\n\n${piece.text}`;
    return {
      id: `${doc.id}#${index}`,
      docId: doc.id,
      title: doc.title,
      type: doc.type,
      source: doc.source,
      sourceUrl: doc.sourceUrl,
      section: doc.section,
      headingPath: piece.headingPath,
      tags: doc.tags,
      text: prefixed,
      startChar: piece.startChar,
      endChar: piece.endChar,
    };
  });

  for (let i = 0; i < chunks.length; i++) {
    const current = chunks[i];
    if (!current) continue;
    const prev = chunks[i - 1];
    const next = chunks[i + 1];
    if (prev) current.prevChunkId = prev.id;
    if (next) current.nextChunkId = next.id;
    const parent = chunks.find(
      (c, j) => j < i && c.headingPath === current.headingPath,
    );
    if (parent) current.parentChunkId = parent.id;
  }

  return chunks;
}

let cachedChunks: Chunk[] | null = null;

export function getChunks(): Chunk[] {
  if (cachedChunks) return cachedChunks;
  cachedChunks = CORPUS.flatMap(chunkDocument);
  return cachedChunks;
}

export function getChunkById(id: string): Chunk | undefined {
  return getChunks().find((c) => c.id === id);
}

export function getChunksByDocId(docId: string): Chunk[] {
  return getChunks().filter((c) => c.docId === docId);
}

export function corpusStats() {
  const chunks = getChunks();
  const byType: Record<string, number> = {};
  for (const doc of CORPUS) {
    byType[doc.type] = (byType[doc.type] ?? 0) + 1;
  }
  const lengths = chunks.map((c) => c.text.length);
  const avg =
    lengths.reduce((a, b) => a + b, 0) / Math.max(1, lengths.length);
  return {
    documents: CORPUS.length,
    chunks: chunks.length,
    byType,
    avgChunkChars: Math.round(avg),
    minChunkChars: Math.min(...lengths),
    maxChunkChars: Math.max(...lengths),
  };
}
