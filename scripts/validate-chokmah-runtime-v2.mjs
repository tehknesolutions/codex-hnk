import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const exists = (p) => fs.existsSync(path.join(root, p));
const has = (s, needle) => s.includes(needle);
let failed = 0;

function check(label, ok) {
  console.log(`${ok ? 'PASS' : 'FAIL'} CHOKMAH-V2 · ${label}`);
  if (!ok) failed += 1;
}

const atziluth = read('apps/mobile/src/features/atziluth/AtziluthJourney.tsx');
const journey = read('apps/mobile/src/features/chokmah/ChokmahJourney.tsx');
const cahetelCycle = read('apps/mobile/src/features/chokmah/ChokmahCycle01Cahetel.tsx');
const cahetelDefs = read('apps/mobile/src/features/chokmah/runtime-definitions/cahetel.ts');
const hazielCycle = read('apps/mobile/src/features/chokmah/ChokmahCycle02Haziel.tsx');
const hazielDefs = read('apps/mobile/src/features/chokmah/runtime-definitions/haziel.ts');
const hazielExp = read('apps/mobile/src/features/chokmah/HazielDays042to044Experience.tsx');
const progression = read('supabase/migrations/20260908214958_extend_atziluth_progression_v3.sql');
const sourceSync = read('supabase/migrations/20260908214808_add_immutable_atziluth_source_sync.sql');
const cahetelEvidence = read('supabase/migrations/20260908220534_fix_cahetel_040_041_required_evidence_nulls.sql');
const hazielEvidence = read('supabase/migrations/20260908225124_enforce_haziel_042_044_scalar_evidence.sql');

check('Atziluth routes Kether through Day 036', /currentDay\s*<=\s*36[\s\S]*KetherJourney/.test(atziluth));
check('Atziluth routes Chokmah through Day 073', /currentDay\s*<=\s*73[\s\S]*ChokmahJourney/.test(atziluth));
check('Chokmah remains server-driven', has(journey, "from('user_progress')") && has(journey, "select('current_day')"));
check('Chokmah routes Cahetel then Haziel', /currentDay\s*<=\s*41[\s\S]*ChokmahCycle01Cahetel/.test(journey) && /currentDay\s*<=\s*46[\s\S]*ChokmahCycle02Haziel/.test(journey));

check('Cahetel 037-041 remains executable', ['CAHETEL_DAY_037','CAHETEL_DAY_038','CAHETEL_DAY_039','CAHETEL_DAY_040','CAHETEL_DAY_041'].every((x) => has(cahetelDefs, x)) && has(cahetelCycle, 'CahetelDays040to041Experience'));
check('Haziel runtime definitions stop at Day 044', ['HAZIEL_DAY_042','HAZIEL_DAY_043','HAZIEL_DAY_044'].every((x) => has(hazielDefs, x)) && !has(hazielDefs, 'HAZIEL_DAY_045') && !has(hazielDefs, 'HAZIEL_DAY_046'));
check('Haziel cycle mounts 042-044 runtime', has(hazielCycle, 'HazielDays042to044Experience') && has(hazielCycle, 'displayDay <= 44'));
check('Day 045 is a hard audio blocker with no runtime mount', has(hazielCycle, 'AUDIO_PRESET_PENDING') && has(hazielCycle, 'ISSUE #10') && !/function Day045AudioBlocker[\s\S]*controller\.begin/.test(hazielCycle) && !/function Day045AudioBlocker[\s\S]*completeCodexDay/.test(hazielCycle));
check('Day 046 is sequence-blocked rather than executable', has(hazielCycle, 'SEQUENCE_BLOCKED_BY_DAY_045') && !has(hazielDefs, 'HAZIEL_DAY_046'));

check('Day 042 requires 180s massage + 300s residual + 300s control', has(hazielDefs, 'massage_seconds: 180') && has(hazielDefs, 'residual_seconds: 300') && has(hazielDefs, 'control_seconds: 300') && has(hazielExp, 'target={180}') && has(hazielExp, 'target={300}'));
check('Day 042 preserves absence-of-sensation and interpretation boundary', has(hazielDefs, 'frontal_sensation_present') && has(hazielDefs, 'control_sensation_present') && has(hazielExp, 'AUSÊNCIA TAMBÉM É VÁLIDA') && has(hazielExp, 'SEPAREI DADO CORPORAL DE INTERPRETAÇÃO TEÚRGICA'));
check('Day 042 exposes ocular/neurological stop gate', has(hazielExp, 'Não pressione olhos ou órbitas') && has(hazielExp, 'ENCERRAR POR DESCONFORTO'));

check('Day 043 requires blue+gray 600s controls', has(hazielDefs, 'blue_seconds: 600') && has(hazielDefs, 'gray_seconds: 600') && (hazielExp.match(/target=\{600\}/g)?.length ?? 0) >= 2);
check('Day 043 preserves no-image as valid', has(hazielDefs, 'blue_content_present') && has(hazielDefs, 'gray_content_present') && has(hazielExp, 'NÃO É OBRIGATÓRIO'));
check('Day 043 refuses clairvoyance certainty', has(hazielDefs, 'clairvoyance_not_claimed') && has(hazielExp, 'NÃO TRATEI BRILHO OU NITIDEZ COMO PROVA DE CLARIVIDÊNCIA'));

check('Day 044 requires six truisms and three suggestions', has(hazielDefs, 'truisms_logged: 6') && has(hazielDefs, 'suggestions_logged: 3') && has(hazielExp, 'Array.from({ length: 6 }') && has(hazielExp, 'Array.from({ length: 3 }'));
check('Day 044 private script is encrypted in Vault', has(hazielExp, "kind: 'truism-script'") && has(hazielExp, 'saveEncryptedVaultEntry') && has(hazielExp, 'neutral_text: neutralText.trim()'));
check('Day 044 operational evidence carries no prose fields', !/evidence:\s*\{[\s\S]{0,700}(truisms:|suggestions:|neutral_text:)/.test(hazielExp));

check('canonical successor contains 042-044 and 046', [42,43,44,46].every((d) => exists(`content/canon/atziluth/chokmah/dia-${String(d).padStart(3,'0')}.md`)));
check('canonical successor deliberately excludes Day 045', !exists('content/canon/atziluth/chokmah/dia-045.md'));

check('Haziel evidence migration binds exact canonical source hashes', has(hazielEvidence, 'b7f4da850f8c724cf48e980bd30882283efbb822') && has(hazielEvidence, 'f1c8fa153f91ab0e7b3536c8b900ea438fa3b616') && has(hazielEvidence, '94e25ad0e1e4413f3b72caab6e8bd762d6e5bbd9'));
check('Haziel evidence validators fail closed on absent required booleans', (hazielEvidence.match(/is distinct from 'true'::jsonb/g)?.length ?? 0) >= 22 && has(hazielEvidence, 'coalesce(hnk_private.jsonb_is_nonnegative_integer'));
check('Haziel evidence validators use strict allowlists', has(hazielEvidence, 'day042_evidence_unknown_field') && has(hazielEvidence, 'day043_evidence_unknown_field') && has(hazielEvidence, 'day044_evidence_unknown_field'));
check('Haziel first-completion validation ignores fake revisit labels', has(hazielEvidence, 'select exists(select 1 from public.day_completions') && !has(hazielEvidence, "new.mode = 'revisit'"));
check('Haziel private validator functions are revoked from clients', ['validate_day042_scalar_evidence_v1','validate_day043_scalar_evidence_v1','validate_day044_scalar_evidence_v1'].every((x) => has(hazielEvidence, `revoke all on function hnk_private.${x}`)));

check('Cahetel NULL hotfix remains fail-closed', has(cahetelEvidence, "is distinct from 'true'::jsonb") && has(cahetelEvidence, 'coalesce(hnk_private.jsonb_is_nonnegative_integer'));
check('DB progression enforces sequence beyond Kether', /p_day between 2 and 108/.test(progression) && has(progression, 'previous_day_required'));
check('Portal 073 and 109 remain server-gated', has(progression, 'chokmah_portal_locked') && has(progression, 'binah_portal_locked'));
check('immutable sync preserves allowlisted historical/successor sources', has(sourceSync, "p_source_kind = 'historical'") && has(sourceSync, "p_source_kind = 'successor'") && has(sourceSync, 'p_source_commit_sha'));

if (failed) process.exit(1);
console.log('PASS CHOKMAH-V2 · Cahetel 037-041 + Haziel 042-044 runtime, Day045 blocker, Day046 sequence gate and server contracts valid');
