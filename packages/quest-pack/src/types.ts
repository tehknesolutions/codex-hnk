export type QuestPackReleaseState = "READY" | "BLOCKED";
export type QuestPackIntegrityState = "PASS" | "FAIL";

export interface QuestPackFileInput {
  logicalId: string;
  path: string;
  role: string;
  content: string;
  required: boolean;
}

export interface QuestPackChecksum {
  logical_id: string;
  path: string;
  role: string;
  required: boolean;
  algorithm: "sha256";
  digest: string;
  byte_length: number;
}

export interface QuestPackBlocker {
  id: string;
  scope: string;
  reason: string;
}

export interface QuestPackManifest {
  id: string;
  kind: "hnk.quest_pack";
  version: string;
  day: number;
  quest_definition_id: string;
  completion_contract_id: string;
  canonical_source_sha: string;
  integrity_state: QuestPackIntegrityState;
  release_state: QuestPackReleaseState;
  offline_capable: boolean;
  files: QuestPackChecksum[];
  blockers: QuestPackBlocker[];
}
