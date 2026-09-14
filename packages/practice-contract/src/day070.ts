export const DAY070_QUEST_ID='HNK-CHOKMAH-D070-V2' as const;
export const DAY070_SOURCE_SHA='bb1e47aee510fe9df58a46f697ebafb9005e223e' as const;
export const DAY070_MASTER_ID='pantaculo-tetragrammaton-hnk-master-v1.svg' as const;
export const DAY070_MASTER_PATH='assets/canonical/chokmah/pantaculo-tetragrammaton-hnk-master-v1.svg' as const;
export const DAY070_MASTER_SHA256='16cd1d9ff1cc256f570d526bc6c6bfd249d06957d972f87f51168011cb78451b' as const;
export const DAY070_CANDIDATE_ASSET_KEY='hnk.tetragrammaton.day070.candidate.v1' as const;
export const DAY070_CANDIDATE_SHA256='bf0e187137457b969695906fbabfce876a72500c21d115e18266220fc1bb6f52' as const;
export const DAY070_LEGACY_MIN_SECONDS=1 as const;
export type Day070ReferenceGate={canonicalReferenceReady:boolean;assetKey:string|null;approvalState:string|null;checksumSha256:string|null;repoPath:string|null;upright:boolean;mirrored:boolean};
export function assertDay070CanonicalReferenceReady(gate:Day070ReferenceGate){if(!gate.canonicalReferenceReady||gate.assetKey!=='hnk.tetragrammaton.day070.v1.master'||gate.approvalState!=='approved'||gate.checksumSha256!==DAY070_MASTER_SHA256||gate.repoPath!==DAY070_MASTER_PATH||!gate.upright||gate.mirrored)throw new Error('day070_reference_locked');return true as const}
