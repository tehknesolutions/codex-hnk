export interface Day001PackContracts {
  quest: any;
  canon: any;
  renderer: any;
  evidence: any;
  completion: any;
  completionService: any;
  assets: any;
  audio: any;
  safety: any;
  episteme: any;
}

function invariant(ok: unknown, message: string): asserts ok {
  if (!ok) throw new Error(`quest_pack_coherence:${message}`);
}

export function assertDay001PackCoherence(c: Day001PackContracts): void {
  const qid = c.quest.id;
  const sha = c.quest.canonical?.source_sha;
  const cid = c.quest.phases?.find((p: any) => p.id === "completion")?.completion_contract_id;

  invariant(qid === "HNK-KETHER-D001-V2", "unexpected_quest_definition");
  invariant(sha === c.canon.source?.blob_sha, "canon_sha_mismatch");
  invariant(c.renderer.quest_definition_id === qid, "renderer_quest_mismatch");
  invariant(c.evidence.properties?.protocol_version?.const === qid, "evidence_quest_mismatch");
  invariant(c.evidence.properties?.source_sha?.const === sha, "evidence_sha_mismatch");
  invariant(c.completion.properties?.quest_definition_id?.const === qid, "completion_quest_mismatch");
  invariant(c.completion.properties?.completion_contract_id?.const === cid, "completion_id_mismatch");
  invariant(c.completionService.quest_definition_id === qid, "service_quest_mismatch");
  invariant(c.completionService.completion_contract_id === cid, "service_completion_mismatch");
  invariant(c.completionService.canonical_source_sha === sha, "service_sha_mismatch");
  invariant(c.assets.quest_definition_id === qid, "assets_quest_mismatch");
  invariant(c.audio.quest_definition_id === qid, "audio_quest_mismatch");
  invariant(c.safety.quest_definition_id === qid, "safety_quest_mismatch");
  invariant(c.episteme.quest_definition_id === qid, "episteme_quest_mismatch");
  invariant(c.canon.counted_core?.word_count === 705, "canon_not_705_words");
  invariant(c.audio.profiles?.theta_432?.status === "CANONICAL_MAPPING_PENDING", "theta_mapping_was_invented");
  invariant(c.assets.release_ready === false, "assets_cannot_be_release_ready_before_resolution");
}
