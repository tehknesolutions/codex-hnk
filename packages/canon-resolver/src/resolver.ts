import type {
  CanonBlockDescriptor,
  CanonBlockManifest,
  CanonResolutionRequest,
  ResolvedCanonBlock,
} from "./types.js";

export class CanonResolutionError extends Error {
  constructor(
    readonly code:
      | "CANON_SOURCE_SHA_MISMATCH"
      | "CANON_BLOCK_NOT_FOUND"
      | "CANON_DUPLICATE_BLOCK_ID"
      | "CANON_EMPTY_BLOCK_ID",
    message: string,
  ) {
    super(message);
    this.name = "CanonResolutionError";
  }
}

export function normalizeCanonicalText(value: string): string {
  return value.replace(/\r\n?/g, "\n").trim();
}

export function countCanonicalWords(value: string): number {
  const normalized = normalizeCanonicalText(value);
  return normalized ? normalized.split(/\s+/u).length : 0;
}

function indexBlocks(manifest: CanonBlockManifest): Map<string, CanonBlockDescriptor> {
  const index = new Map<string, CanonBlockDescriptor>();
  for (const block of manifest.blocks) {
    if (!block.id.trim()) {
      throw new CanonResolutionError("CANON_EMPTY_BLOCK_ID", "Canonical block id cannot be empty");
    }
    if (index.has(block.id)) {
      throw new CanonResolutionError(
        "CANON_DUPLICATE_BLOCK_ID",
        `Duplicate canonical block id: ${block.id}`,
      );
    }
    index.set(block.id, block);
  }
  return index;
}

/**
 * Resolves immutable canonical text from a precompiled manifest.
 *
 * The resolver never rewrites, paraphrases or merges canonical prose.
 * Guide/System copy must remain outside this return value.
 */
export function resolveCanonicalBlocks(
  manifest: CanonBlockManifest,
  request: CanonResolutionRequest,
): ResolvedCanonBlock[] {
  if (request.sourceSha !== manifest.source.blob_sha) {
    throw new CanonResolutionError(
      "CANON_SOURCE_SHA_MISMATCH",
      `Quest expects ${request.sourceSha} but manifest is pinned to ${manifest.source.blob_sha}`,
    );
  }

  const index = indexBlocks(manifest);
  return request.blockIds.map((id) => {
    const block = index.get(id);
    if (!block) {
      throw new CanonResolutionError("CANON_BLOCK_NOT_FOUND", `Canonical block not found: ${id}`);
    }
    return {
      id: block.id,
      text: block.text,
      sha256: block.sha256,
      wordCount: block.word_count,
      targetWords: block.target_words,
      source: manifest.source,
    };
  });
}

export function assertCountedCore(manifest: CanonBlockManifest): void {
  const index = indexBlocks(manifest);
  let total = 0;

  for (const id of manifest.counted_core.block_ids) {
    const block = index.get(id);
    if (!block) {
      throw new CanonResolutionError("CANON_BLOCK_NOT_FOUND", `Counted core block missing: ${id}`);
    }
    if (block.kind !== "COUNTED") {
      throw new Error(`Counted core block ${id} must be COUNTED`);
    }
    const actual = countCanonicalWords(block.text);
    if (actual !== block.word_count) {
      throw new Error(`Word-count drift for ${id}: manifest=${block.word_count}, actual=${actual}`);
    }
    if (block.target_words != null && actual !== block.target_words) {
      throw new Error(`Editorial target drift for ${id}: target=${block.target_words}, actual=${actual}`);
    }
    total += actual;
  }

  if (total !== manifest.counted_core.word_count) {
    throw new Error(
      `Counted core total drift: manifest=${manifest.counted_core.word_count}, actual=${total}`,
    );
  }
  if (total !== manifest.source.target_words) {
    throw new Error(
      `Canonical target drift: source=${manifest.source.target_words}, actual=${total}`,
    );
  }
}
