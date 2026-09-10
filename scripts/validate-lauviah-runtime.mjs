import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const has = (s, n) => s.includes(n);
let failed = 0;
const check = (label, ok) => { console.log(`${ok ? 'PASS' : 'FAIL'} LAUVIAH · ${label}`); if (!ok) failed += 1; };

const journey = read('apps/mobile/src/features/chokmah/ChokmahJourney.tsx');
const cycle = read('apps/mobile/src/features/chokmah/ChokmahCycle04Lauviah.tsx');
const defs = read('apps/mobile/src/features/chokmah/runtime-definitions/lauviah.ts');
const d52 = read('apps/mobile/src/features/chokmah/LauviahDay052ExpansionExperience.tsx');
const d53 = read('apps/mobile/src/features/chokmah/LauviahDay053BlindTargetExperience.tsx');
const d54 = read('apps/mobile/src/features/chokmah/LauviahDay054VoiceExperience.tsx');
const d55 = read('apps/mobile/src/features/chokmah/LauviahDay055VakogExperience.tsx');
const d56 = read('apps/mobile/src/features/chokmah/LauviahDay056ReturnExperience.tsx');
const dbA = read('supabase/migrations/20260909211000_enforce_lauviah_052_053_scalar_evidence.sql');
const dbB = read('supabase/migrations/20260909212500_enforce_lauviah_054_056_scalar_evidence.sql');

check('Journey routes Lauviah through Day 056', has(journey, 'ChokmahCycle04Lauviah') && /currentDay\s*<=\s*56/.test(journey));
check('Cycle mounts all five Lauviah experiences', ['LauviahDay052ExpansionExperience','LauviahDay053BlindTargetExperience','LauviahDay054VoiceExperience','LauviahDay055VakogExperience','LauviahDay056ReturnExperience'].every((x) => has(cycle, x)));
check('Runtime definitions cover 052-056 continuously', [52,53,54,55,56].every((day) => has(defs, `LAUVIAH_DAY_0${day}`)));

check('Day 052 requires 600/600 comparison and orientation safety', has(d52, 'target={600}') && has(d52, 'outside_brain_claim_not_made') && has(d52, 'orientation_preserved'));
check('Day 053 encrypts preregistration before feedback', has(d53, 'encryptVaultText') && has(d53, 'saveEncryptedVaultEntry') && has(d53, 'feedback_after_preregister') && has(d53, 'six_digit_id_used'));
check('Day 054 records locally with metering and deletes raw audio', has(d54, 'useAudioRecorder') && has(d54, 'isMeteringEnabled: true') && has(d54, 'deleteAsync') && has(d54, 'raw_audio_not_uploaded'));
check('Day 054 does not claim pitch or subconscious measurement', has(d54, 'Não é análise de pitch') && has(d54, 'subconscious_access_not_claimed'));
check('Day 055 seals VAKOG before verification and keeps risk boundary', has(d55, 'vakog-primary-preregister') && has(d55, 'verification_after_preregister') && has(d55, 'risk_decision_not_used') && has(d55, 'primary_seconds: primarySeconds'));
check('Day 056 forbids hyperventilation/retention and preserves null result', has(d56, 'no_hyperventilation') && has(d56, 'no_prolonged_retention') && has(d56, 'null_results_preserved') && has(d56, 'entity_contamination_not_reinforced'));

check('DB 052/053 binds immutable canonical SHAs', has(dbA, '88ae2a1dc163f474b3afc82f2bcacdf4069c8f5e') && has(dbA, '0bb908ec27feeed2023a3a93d7f481328e5056c2'));
check('DB 054-056 binds immutable canonical SHAs', has(dbB, '5ea33f99975868290d5371c8c1ac67f6de4b9c69') && has(dbB, '03dce9f662c05cb720bce4419f58126031ca9be6') && has(dbB, '9eb847d460768615d2e6fb9173c2557a21c705c7'));
check('DB validators reject unknown fields', ['day052_evidence_unknown_field','day053_evidence_unknown_field'].every((x) => has(dbA, x)) && ['day054_evidence_unknown_field','day055_evidence_unknown_field','day056_evidence_unknown_field'].every((x) => has(dbB, x)));
check('DB private validators revoked from clients', (dbA.match(/revoke all on function hnk_private\.validate_day05[23]/g)?.length ?? 0) >= 2 && (dbB.match(/revoke all on function hnk_private\.validate_day05[456]/g)?.length ?? 0) >= 3);

if (failed) process.exit(1);
console.log('PASS LAUVIAH · Days 052-056 runtime and fail-closed evidence contracts valid');
