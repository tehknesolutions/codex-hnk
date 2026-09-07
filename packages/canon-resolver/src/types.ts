export type CanonBlockKind = "COUNTED" | "SECTION";

export interface CanonSourceIdentity {
  repository: string;
  path: string;
  blob_sha: string;
  editorial_version: string;
  day: number;
  target_words: number;
}

export interface CanonBlockDescriptor {
  id: string;
  kind: CanonBlockKind;
  target_words?: number;
  word_count: number;
  sha256: string;
  text: string;
}

export interface CanonBlockManifest {
  id: string;
  kind: "hnk.canon_block_manifest";
  version: string;
  source: CanonSourceIdentity;
  normalization: {
    line_endings: "LF";
    trim_outer_whitespace: boolean;
    preserve_internal_whitespace: boolean;
    word_count: "split_on_unicode_whitespace";
  };
  counted_core: {
    block_ids: string[];
    word_count: number;
  };
  blocks: CanonBlockDescriptor[];
}

export interface ResolvedCanonBlock {
  id: string;
  text: string;
  sha256: string;
  wordCount: number;
  targetWords?: number;
  source: CanonSourceIdentity;
}

export interface CanonResolutionRequest {
  sourceSha: string;
  blockIds: string[];
}
