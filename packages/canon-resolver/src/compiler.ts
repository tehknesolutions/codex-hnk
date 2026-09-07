import type { CanonBlockDescriptor } from "./types.js";
import { countCanonicalWords, normalizeCanonicalText } from "./resolver.js";

const COUNTED_BLOCK_RE =
  /<!-- HNK:COUNT START ([\w-]+) target=(\d+) -->\n([\s\S]*?)\n<!-- HNK:COUNT END -->/g;

export interface ExtractedCountedBlock {
  id: string;
  targetWords: number;
  text: string;
  wordCount: number;
}

/**
 * Build-time helper. Extracts only explicit HNK COUNT blocks.
 * It intentionally does not infer semantic blocks from arbitrary paragraphs.
 */
export function extractCountedBlocks(markdown: string): ExtractedCountedBlock[] {
  const normalized = markdown.replace(/\r\n?/g, "\n");
  const result: ExtractedCountedBlock[] = [];

  for (const match of normalized.matchAll(COUNTED_BLOCK_RE)) {
    const id = match[1];
    const targetWords = Number(match[2]);
    const text = normalizeCanonicalText(match[3] ?? "");
    result.push({
      id,
      targetWords,
      text,
      wordCount: countCanonicalWords(text),
    });
  }

  return result;
}

/**
 * Converts an extracted block into a manifest-compatible shape after a
 * build system supplies its SHA-256 digest.
 */
export function toCountedDescriptor(
  block: ExtractedCountedBlock,
  sha256: string,
): CanonBlockDescriptor {
  return {
    id: block.id,
    kind: "COUNTED",
    target_words: block.targetWords,
    word_count: block.wordCount,
    sha256,
    text: block.text,
  };
}
