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
const haziel045 = read('apps/mobile/src/features/chokmah/HazielDay045AudioExperience.tsx');
const haziel046 = read('apps/mobile/src/features/chokmah/HazielDay046VegetalExperience.tsx');
const mobilePackage = read('apps/mobile/package.json');
const progression = read('supabase/migrations/20260908214958_extend_atziluth_progression_v3.sql');
const sourceSync = read('supabase/migrations/20260908214808_add_immutable_atziluth_source_sync.sql');
const cahetelEvidence = read('supabase/migrations/20260908220534_fix_cahetel_040_041_required_evidence_nulls.sql');
const hazielEvidence = read('supabase/migrations/20260908225124_enforce_haziel_042_044_scalar_evidence.sql');
const haziel045Evidence = read('supabase/migrations/20260909171000_enforce_haziel_045_scalar_evidence.sql');
const haziel046Evidence = read('supabase/migrations/20260909184700_enforce_haziel_046_scalar_evidence.sql');
const audioFreeze045 = read('docs/audio/HNK_HAZIEL_D045_AUDIO_FREEZE_V1.md');

check('Atziluth routes Kether through Day 036', /currentDay\s*<=\s*36[\s\S]*KetherJourney/.test(atziluth));
check('Atziluth routes Chokmah through Day 073', /currentDay\s*<=\s*73[\s\S]*ChokmahJourney/.test(atziluth));
check('Chokmah remains server-driven', has(journey, "from('user_progress')") && has(journey, "select('current_day')"));
check('Chokmah routes Cahetel then Haziel', /currentDay\s*<=\s*41[\s\S]*ChokmahCycle01Cahetel/.test(journey) && /currentDay\s*<=\s*46[\s\S]*ChokmahCycle02Haziel/.test(journey));

check('Cahetel 037-041 remains executable', ['CAHETEL_DAY_037','CAHETEL_DAY_038','CAHETEL_DAY_039','CAHETEL_DAY_040','CAHETEL_DAY_041'].every((x) => has(cahetelDefs, x)) && has(cahetelCycle, 'CahetelDays040to041Experience'));
check('Haziel runtime definitions extend continuously through Day 046', ['HAZIEL_DAY_042','HAZIEL_DAY_043','HAZIEL_DAY_044','HAZIEL_DAY_045','HAZIEL_DAY_046'].every((x) => has(hazielDefs, x)));
check('Haziel cycle mounts 042-046 runtime', has(hazielCycle, 'HazielDays042to044Experience') && has(hazielCycle, 'HazielDay045AudioExperience') && has(hazielCycle, 'HazielDay046VegetalExperience') && has(hazielCycle, 'displayDay === 46'));
check('Chokmah next G7 gap begins after Haziel', /currentDay\s*<=\s*46[\s\S]*ChokmahCycle02Haziel/.test(journey) && has(journey, 'FRONTEIRA CANÔNICA'));

check('Day 042 requires 180s massage + 300s residual + 300s control', has(hazielDefs, 'massage_seconds: 180') && has(hazielDefs, 'residual_seconds: 300') && has(hazielDefs, 'control_seconds: 300') && has(hazielExp, 'target={180}') && has(hazielExp, 'target={300}'));
check('Day 042 preserves absence-of-sensation and interpretation boundary', has(hazielDefs, 'frontal_sensation_present') && has(hazielDefs, 'control_sensation_present') && has(hazielExp, 'AUSÊNCIA TAMBÉM É VÁLIDA') && has(hazielExp, 'SEPAREI DADO CORPORAL DE INTERPRETAÇÃO TEÚRGICA'));
check('Day 042 exposes ocular/neurological stop gate', has(hazielExp, 'Não pressione olhos ou órbitas') && has(hazielExp, 'ENCERRAR POR DESCONFORTO'));

check('Day 043 requires blue+gray 600s controls', has(hazielDefs, 'blue_seconds: 600') && has(hazielDefs, 'gray_seconds: 600') && (hazielExp.match(/target=\{600\}/g)?.length ?? 0) >= 2);
check('Day 043 preserves no-image as valid', has(hazielDefs, 'blue_content_present') && has(hazielDefs, 'gray_content_present') && has(hazielExp, 'NÃO É OBRIGATÓRIO'));
check('Day 043 refuses clairvoyance certainty', has(hazielDefs, 'clairvoyance_not_claimed') && has(hazielExp, 'NÃO TRATEI BRILHO OU NITIDEZ COMO PROVA DE CLARIVIDÊNCIA'));

check('Day 044 requires six truisms and three suggestions', has(hazielDefs, 'truisms_logged: 6') && has(hazielDefs, 'suggestions_logged: 3') && has(hazielExp, 'Array.from({ length: 6 }') && has(hazielExp, 'Array.from({ length: 3 }'));
check('Day 044 private script is encrypted in Vault', has(hazielExp, "kind: 'truism-script'") && has(hazielExp, 'saveEncryptedVaultEntry') && has(hazielExp, 'neutral_text: neutralText.trim()'));
check('Day 044 operational evidence carries no prose fields', !/evidence:\s*\{[\s\S]{0,700}(truisms:|suggestions:|neutral_text:)/.test(hazielExp));

check('Mobile consumes the canonical audio contract', has(mobilePackage, '"@hnk/audio-contract": "workspace:*"') && has(haziel045, "from '@hnk/audio-contract'"));
check('Day 045 mounts approved ACTIVE and CONTROL presets', has(haziel045, 'HNK_HAZIEL_D045_ACTIVE_PRESET_V1') && has(haziel045, 'HNK_HAZIEL_D045_CONTROL_PRESET_V1') && has(haziel045, 'createHazielD045ActiveLoopWavBytes') && has(haziel045, 'createHazielD045ControlLoopWavBytes'));
check('Day 045 materializes deterministic local WAV rather than remote ritual audio', has(haziel045, 'writeAsStringAsync') && has(haziel045, 'EncodingType.Base64') && !/https?:\/\//.test(haziel045));
check('Day 045 playback clock advances only while player is playing', has(haziel045, "phase !== 'active-audio' || !activeStatus.playing") && has(haziel045, "phase !== 'control-audio' || !controlStatus.playing"));
check('Day 045 enforces 600s ACTIVE + 600s CONTROL + 60s silence', has(hazielDefs, 'active_seconds: 600') && has(hazielDefs, 'control_seconds: 600') && has(hazielDefs, 'post_silence_seconds: 60') && has(haziel045, 'const TARGET_SECONDS = 600') && has(haziel045, 'const POST_SILENCE_SECONDS = 60'));
check('Day 045 has no autoplay and pauses on app background', has(haziel045, 'useAudioPlayer(null') && has(haziel045, "AppState.addEventListener('change'") && has(haziel045, "state !== 'active'") && has(haziel045, 'activePlayer.pause()') && has(haziel045, 'controlPlayer.pause()'));
check('Day 045 exposes user volume and immediate Safety Stop', has(haziel045, 'VOLUME DO PLAYER') && has(haziel045, 'SAFETY STOP') && has(haziel045, 'controller.interrupt'));
check('Day 045 seals only structured scalar evidence/metrics', has(haziel045, 'active_left_hz: 432') && has(haziel045, 'active_right_hz: 444') && has(haziel045, 'active_difference_hz: 12') && has(haziel045, 'comparison_completed: comparisonCompleted') && !/TextInput/.test(haziel045));
check('Day 045 canonical audio freeze remains approved but runtime QA pending', has(audioFreeze045, 'APPROVED CANONICAL AUDIO DEFINITION / RUNTIME PUBLICATION QA PENDING') && has(audioFreeze045, '432 Hz') && has(audioFreeze045, '444 Hz'));

check('Day 046 requires 420s plant + 420s control', has(hazielDefs, 'plant_seconds: 420') && has(hazielDefs, 'control_seconds: 420') && has(haziel046, 'const CONDITION_SECONDS = 420'));
check('Day 046 forces explicit sensation presence or absence recording', has(hazielDefs, 'plant_sensation_present') && has(hazielDefs, 'control_sensation_present') && has(haziel046, 'HOUVE ALGUMA SENSAÇÃO') && has(haziel046, 'NENHUMA SENSAÇÃO') && has(haziel046, 'plantRecorded') && has(haziel046, 'controlRecorded'));
check('Day 046 preserves null results and alternative explanations', has(haziel046, 'PRESERVEI RESULTADO NULO OU CONTRÁRIO À EXPECTATIVA') && has(haziel046, 'CONSIDEREI CIRCULAÇÃO, POSTURA, TEMPERATURA E MOVIMENTO DE AR'));
check('Day 046 refuses confirmed aura detection', has(hazielDefs, 'aura_not_claimed') && has(haziel046, 'NÃO TRATEI A SENSAÇÃO COMO DETECÇÃO CONFIRMADA DE AURA'));
check('Day 046 exposes Safety Stop and Return Gate', has(haziel046, 'SAFETY STOP') && has(haziel046, 'OBJETOS REAIS NOMEADOS') && has(haziel046, 'controller.setReturnConfirmed()'));
check('Day 046 operational record contains no prose fields', !/TextInput/.test(haziel046) && has(haziel046, 'approximate_distance_cm: 3') && has(haziel046, 'blind_assist_used: blindAssistUsed'));

check('canonical successor contains Haziel 042-046', [42,43,44,45,46].every((d) => exists(`content/canon/atziluth/chokmah/dia-${String(d).padStart(3,'0')}.md`)));

check('Haziel 042-044 evidence migration binds exact canonical source hashes', has(hazielEvidence, 'b7f4da850f8c724cf48e980bd30882283efbb822') && has(hazielEvidence, 'f1c8fa153f91ab0e7b3536c8b900ea438fa3b616') && has(hazielEvidence, '94e25ad0e1e4413f3b72caab6e8bd762d6e5bbd9'));
check('Haziel 042-044 evidence validators fail closed on absent required booleans', (hazielEvidence.match(/is distinct from 'true'::jsonb/g)?.length ?? 0) >= 22 && has(hazielEvidence, 'coalesce(hnk_private.jsonb_is_nonnegative_integer'));
check('Haziel 042-044 evidence validators use strict allowlists', has(hazielEvidence, 'day042_evidence_unknown_field') && has(hazielEvidence, 'day043_evidence_unknown_field') && has(hazielEvidence, 'day044_evidence_unknown_field'));
check('Haziel 042-044 first-completion validation ignores fake revisit labels', has(hazielEvidence, 'select exists(select 1 from public.day_completions') && !has(hazielEvidence, "new.mode = 'revisit'"));
check('Haziel 042-044 private validator functions are revoked from clients', ['validate_day042_scalar_evidence_v1','validate_day043_scalar_evidence_v1','validate_day044_scalar_evidence_v1'].every((x) => has(hazielEvidence, `revoke all on function hnk_private.${x}`)));

check('Day 045 evidence validator binds immutable canonical source SHA', has(haziel045Evidence, '67e6d708444ae1fd62713ebebfb8da4d79a100e5') && has(haziel045Evidence, 'day045_canonical_source_sha_mismatch'));
check('Day 045 evidence validator is strict allowlist and fail-closed', has(haziel045Evidence, 'day045_evidence_unknown_field') && (haziel045Evidence.match(/is distinct from 'true'::jsonb/g)?.length ?? 0) >= 9 && has(haziel045Evidence, 'day045_duration_incomplete'));
check('Day 045 server validates 600/600/60 durations', has(haziel045Evidence, "'active_seconds')::integer < 600") && has(haziel045Evidence, "'control_seconds')::integer < 600") && has(haziel045Evidence, "'post_silence_seconds')::integer < 60"));
check('Day 045 private validator and trigger are revoked from clients', has(haziel045Evidence, 'revoke all on function hnk_private.validate_day045_scalar_evidence_v1') && has(haziel045Evidence, 'revoke all on function hnk_private.enforce_haziel_045_scalar_evidence'));

check('Day 046 evidence validator binds immutable canonical source SHA', has(haziel046Evidence, 'e8a812598e885222d42b0ddf968fa93c83d3432b') && has(haziel046Evidence, 'day046_canonical_source_sha_mismatch'));
check('Day 046 evidence validator accepts false sensation flags but requires boolean presence', has(haziel046Evidence, "jsonb_typeof(p_evidence->'plant_sensation_present')") && has(haziel046Evidence, "jsonb_typeof(p_evidence->'control_sensation_present')") && !has(haziel046Evidence, "p_evidence->'plant_sensation_present' is distinct from 'true'::jsonb"));
check('Day 046 evidence validator is strict allowlist and fail-closed', has(haziel046Evidence, 'day046_evidence_unknown_field') && (haziel046Evidence.match(/is distinct from 'true'::jsonb/g)?.length ?? 0) >= 11 && has(haziel046Evidence, 'day046_duration_incomplete'));
check('Day 046 server validates 420/420 durations', has(haziel046Evidence, "'plant_seconds')::integer < 420") && has(haziel046Evidence, "'control_seconds')::integer < 420"));
check('Day 046 private validator and trigger are revoked from clients', has(haziel046Evidence, 'revoke all on function hnk_private.validate_day046_scalar_evidence_v1') && has(haziel046Evidence, 'revoke all on function hnk_private.enforce_haziel_046_scalar_evidence'));

check('Cahetel NULL hotfix remains fail-closed', has(cahetelEvidence, "is distinct from 'true'::jsonb") && has(cahetelEvidence, 'coalesce(hnk_private.jsonb_is_nonnegative_integer'));
check('DB progression enforces sequence beyond Kether', /p_day between 2 and 108/.test(progression) && has(progression, 'previous_day_required'));
check('Portal 073 and 109 remain server-gated', has(progression, 'chokmah_portal_locked') && has(progression, 'binah_portal_locked'));
check('immutable sync preserves allowlisted historical/successor sources', has(sourceSync, "p_source_kind = 'historical'") && has(sourceSync, "p_source_kind = 'successor'") && has(sourceSync, 'p_source_commit_sha'));

if (failed) process.exit(1);
console.log('PASS CHOKMAH-V2 · Cahetel 037-041 + Haziel 042-046 runtime and fail-closed server contracts valid');
