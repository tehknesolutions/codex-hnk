import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const has = (s, needle) => s.includes(needle);
let failed = 0;
function check(label, ok) { console.log(`${ok ? 'PASS' : 'FAIL'} IEZALEL · ${label}`); if (!ok) failed += 1; }

const journey = read('apps/mobile/src/features/chokmah/ChokmahJourney.tsx');
const cycle = read('apps/mobile/src/features/chokmah/ChokmahCycle06Iezalel.tsx');
const defs = read('apps/mobile/src/features/chokmah/runtime-definitions/iezalel.ts');
const primitives = read('apps/mobile/src/features/kether/KetherRuntimePrimitives.tsx');
const gneo = read('apps/mobile/src/features/chokmah/GneoGeoMasterV1.tsx');
const d62 = read('apps/mobile/src/features/chokmah/IezalelDay062InnerListeningExperience.tsx');
const d63 = read('apps/mobile/src/features/chokmah/IezalelDay063CriticExperience.tsx');
const d64 = read('apps/mobile/src/features/chokmah/IezalelDay064AutomaticWritingExperience.tsx');
const d65 = read('apps/mobile/src/features/chokmah/IezalelDay065IntercessionExperience.tsx');
const d66 = read('apps/mobile/src/features/chokmah/IezalelDay066GneoGeoExperience.tsx');
const db = read('supabase/migrations/20260909222500_enforce_iezalel_062_066_scalar_evidence.sql');

check('Journey routes Iezalel through Day 066', has(journey, 'ChokmahCycle06Iezalel') && /currentDay\s*<=\s*66/.test(journey));
check('Cycle mounts all five Iezalel experiences', ['IezalelDay062InnerListeningExperience','IezalelDay063CriticExperience','IezalelDay064AutomaticWritingExperience','IezalelDay065IntercessionExperience','IezalelDay066GneoGeoExperience'].every((x) => has(cycle, x)));
check('Definitions are continuous 062-066', [62,63,64,65,66].every((d) => has(defs, `IEZALEL_DAY_0${d}`)));
check('Open timer exists for canonically unspecified durations', has(primitives, 'export function RuntimeOpenTimer') && has(primitives, 'SEM META NUMÉRICA CANÔNICA'));

check('Day062 uses open timing and preserves auditory epistemic boundary', has(d62, 'RuntimeOpenTimer') && has(d62, 'external_message_not_claimed') && has(d62, 'persistent_voice_not_reinforced') && has(d62, 'ear_safety_respected') && has(d62, 'risk_context_avoided'));
check('Day063 encrypts private criticism/reframe and does not put prose in evidence', has(d63, 'saveEncryptedVaultEntry') && has(d63, "kind: 'inner-critic-reframe'") && has(d63, 'external_voice_not_reinforced') && !/evidence:\s*\{[\s\S]{0,900}(criticism:|fact:|judgment:|respectfulPhrase:)/.test(d63));
check('Day064 enforces 5m writing blocks and keeps prose in Vault', has(d64, 'target={300}') && (d64.match(/target=\{300\}/g)?.length ?? 0) >= 2 && has(d64, 'allowEarlyStop') && has(d64, 'saveEncryptedVaultEntry') && has(d64, 'automatic_authority_not_claimed') && has(d64, 'high_impact_decision_suspended'));
check('Day065 never uploads photo/third-party data and models conditional consent', has(d65, 'photo_not_uploaded') && has(d65, 'third_party_identity_not_stored') && has(d65, 'third_party_symptoms_not_collected') && has(d65, 'consent_applicable') && has(d65, 'consent_confirmed_if_applicable') && !has(d65, 'expo-image-picker'));
check('Day066 renders exact frozen Gneo Geo master and preserves node/circuit distinction', has(d66, 'GneoGeoMasterV1') && has(d66, 'GNEO_GEO_MASTER_ID') && has(d66, 'nodes_circuits_kept_distinct') && has(d66, 'no_route_invented') && has(d66, 'external_travel_not_claimed'));
check('Gneo renderer pins canonical asset ID and checksum', has(gneo, "cockpit-gneo-geo-hnk-master-v1.svg") && has(gneo, '9b3c8f3f8292100d148e7a698e8a8d978adee6f1779412a1ba833603c7fc62e6'));
check('Gneo renderer preserves frozen coordinates', ['250,27 335,178 165,178','250,237 165,86 335,86','cx="290"','cy="100"','cx="250" cy="132"'].every((x) => has(gneo, x)));

check('DB binds immutable canonical SHAs 062-066', [
  '56a8aaafbd2d602324ecfb9c06da39563fefaaf6',
  'b9c9872ddf618aff3f515f601b3abfd611dace46',
  'fb05d22be494099a5a1d3e1e0f5480ecc6c072cb',
  '8d8cd2a39fb05be283b8326fa258ed547b40f442',
  'a6d48785ee355f734cadda61b0bb3810b125bf5e',
].every((sha) => has(db, sha)));
check('DB uses strict per-day allowlists', [62,63,64,65,66].every((d) => has(db, `day0${d}_evidence_unknown_field`)));
check('Day064 server caps vocalization at 600s and requires both 300s writings', has(db, 'v_vocal > 600') && has(db, 'v_active < 300') && has(db, 'v_control < 300'));
check('Day065 server enforces consent when applicable', has(db, "p_evidence->'consent_applicable' = 'true'::jsonb") && has(db, 'day065_consent_required'));
check('Day066 server requires exact canonical master ID', has(db, "cockpit-gneo-geo-hnk-master-v1.svg") && has(db, 'day066_gneo_master_mismatch'));
check('DB validators and trigger are private', [62,63,64,65,66].every((d) => has(db, `revoke all on function hnk_private.validate_day0${d}_scalar_evidence_v1`)) && has(db, 'revoke all on function hnk_private.enforce_iezalel_062_066_scalar_evidence'));
check('First-completion gate ignores later revisits', has(db, 'select exists(select 1 from public.day_completions'));

if (failed) process.exit(1);
console.log('PASS IEZALEL · Days 062-066 runtime and server contracts valid');
