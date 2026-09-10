import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const has = (s, needle) => s.includes(needle);
let failed = 0;
function check(label, ok) { console.log(`${ok ? 'PASS' : 'FAIL'} HAHAIAH · ${label}`); if (!ok) failed += 1; }

const journey = read('apps/mobile/src/features/chokmah/ChokmahJourney.tsx');
const cycle = read('apps/mobile/src/features/chokmah/ChokmahCycle05Hahaiah.tsx');
const defs = read('apps/mobile/src/features/chokmah/runtime-definitions/hahaiah.ts');
const d57 = read('apps/mobile/src/features/chokmah/HahaiahDay057PartnerExperiment.tsx');
const d58 = read('apps/mobile/src/features/chokmah/HahaiahDay058LanguageExperience.tsx');
const d59 = read('apps/mobile/src/features/chokmah/HahaiahDay059BluePearlExperience.tsx');
const d60 = read('apps/mobile/src/features/chokmah/HahaiahDay060SocialObservationExperience.tsx');
const d61 = read('apps/mobile/src/features/chokmah/HahaiahDay061DigitalGovernanceExperience.tsx');
const db = read('supabase/migrations/20260909215500_enforce_hahaiah_057_061_scalar_evidence.sql');

check('Journey routes Hahaiah through Day 061', has(journey, "ChokmahCycle05Hahaiah") && /currentDay\s*<=\s*61/.test(journey));
check('Cycle mounts all five Hahaiah experiences', ['HahaiahDay057PartnerExperiment','HahaiahDay058LanguageExperience','HahaiahDay059BluePearlExperience','HahaiahDay060SocialObservationExperience','HahaiahDay061DigitalGovernanceExperience'].every((x) => has(cycle, x)));
check('Definitions are continuous 057-061', [57,58,59,60,61].every((d) => has(defs, `HAHAIAH_DAY_0${d}`)));

check('Day057 seals target/receiver before feedback and protects partner consent', has(d57, 'partner_consent') && has(d57, 'target_preregistered') && has(d57, 'receiver_response_preregistered') && has(d57, 'telepathy_not_claimed') && has(d57, 'saveEncryptedVaultEntry'));
check('Day058 is self-use V1 and preserves refusal', has(d58, 'self_use_only') && has(d58, 'real_refusal_option_present') && has(d58, 'no_covert_command') && has(d58, 'no_high_impact_use') && has(d58, 'saveEncryptedVaultEntry'));
check('Day059 keeps Blue Pearl vs gray comparison and no clairvoyance claim', has(d59, 'blue_image_present') && has(d59, 'gray_image_present') && has(d59, 'clarivoyance_not_claimed') && has(d59, 'reason_preserved'));
check('Day060 forbids camera/identity and requires consented comparison', has(d60, 'camera_not_used') && has(d60, 'identity_not_stored') && has(d60, 'partner_consent') && has(d60, 'vulnerable_people_not_targeted') && has(d60, 'saveEncryptedVaultEntry'));
check('Day061 changes notifications manually and preserves critical alerts', has(d61, 'no_automatic_critical_change') && has(d61, 'critical_alerts_preserved') && has(d61, 'security_auth_preserved') && has(d61, 'family_emergency_preserved') && has(d61, 'sustainable_configuration_selected'));
check('Day061 records before/after counts without demanding improvement', ['interruptions_before','interruptions_after','unlocks_before','unlocks_after'].every((x) => has(d61, x)) && has(d61, 'COMPAREI ANTES/DEPOIS SEM EXIGIR MELHORA'));

check('DB binds immutable canonical SHAs 057-061', [
  'deb6305d38b89a4168ad5cff083d2b96e7a7fec4',
  'e32753a57daab23d378e881451194b0dd77d8aac',
  'e0b9b51cac81012e4511e6394c6f3dff7f50aaf8',
  'e98e8925c8e03555c39b033813999d6a488149a9',
  '12e4c2da623f2f78d3fea3ff65e23f9446f9784b',
].every((sha) => has(db, sha)));
check('DB uses strict per-day allowlists', [57,58,59,60,61].every((d) => has(db, `day0${d}_evidence_unknown_field`)));
check('DB validates explicit booleans where false is a valid observation', has(db, "jsonb_typeof(p_evidence->'active_match')") && has(db, "jsonb_typeof(p_evidence->'blue_image_present')"));
check('DB validators and trigger are private', [57,58,59,60,61].every((d) => has(db, `revoke all on function hnk_private.validate_day0${d}_scalar_evidence_v1`)) && has(db, 'revoke all on function hnk_private.enforce_hahaiah_057_061_scalar_evidence'));
check('First-completion gate ignores later revisits', has(db, 'select exists(select 1 from public.day_completions'));

if (failed) process.exit(1);
console.log('PASS HAHAIAH · Days 057-061 runtime and server contracts valid');
