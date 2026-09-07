import type { QuestPackBlocker, QuestPackFileInput, QuestPackManifest } from "./types.js";

export type QuestPackHashProvider = (content: string) => string;

function utf8Length(value: string): number {
  return new TextEncoder().encode(value).byteLength;
}

export interface BuildQuestPackInput {
  id: string;
  version: string;
  day: number;
  questDefinitionId: string;
  completionContractId: string;
  canonicalSourceSha: string;
  files: QuestPackFileInput[];
  sha256: QuestPackHashProvider;
  blockers?: QuestPackBlocker[];
  offlineCapable?: boolean;
}

export function buildQuestPack(input: BuildQuestPackInput): QuestPackManifest {
  const seen = new Set<string>();
  const files = [...input.files]
    .sort((a, b) => a.logicalId.localeCompare(b.logicalId))
    .map((file) => {
      if (!file.logicalId.trim()) throw new Error("quest_pack_logical_id_required");
      if (seen.has(file.logicalId)) throw new Error(`quest_pack_duplicate_logical_id:${file.logicalId}`);
      seen.add(file.logicalId);
      return {
        logical_id: file.logicalId,
        path: file.path,
        role: file.role,
        required: file.required,
        algorithm: "sha256" as const,
        digest: input.sha256(file.content),
        byte_length: utf8Length(file.content),
      };
    });

  const blockers = [...(input.blockers ?? [])].sort((a, b) => a.id.localeCompare(b.id));
  return {
    id: input.id,
    kind: "hnk.quest_pack",
    version: input.version,
    day: input.day,
    quest_definition_id: input.questDefinitionId,
    completion_contract_id: input.completionContractId,
    canonical_source_sha: input.canonicalSourceSha,
    integrity_state: "PASS",
    release_state: blockers.length === 0 ? "READY" : "BLOCKED",
    offline_capable: input.offlineCapable ?? true,
    files,
    blockers,
  };
}

export function verifyQuestPackFile(
  content: string,
  expectedSha256: string,
  sha256: QuestPackHashProvider,
): boolean {
  return sha256(content) === expectedSha256;
}
