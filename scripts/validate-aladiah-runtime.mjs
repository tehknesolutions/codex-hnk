import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const exists = (p) => fs.existsSync(path.join(root, p));
const has = (s, needle) => s.includes(needle);
let failed = 0;

function check(label, ok) {
  console.log(`${ok ? 'PASS' : 'FAIL'} ALADIAH · ${label}`);
  if (!ok) failed += 1;
}

const journey = read('apps/mobile/src/features/chokmah/ChokmahJourney.tsx');
const cycle = read('apps/mobile/src/features/chokmah/ChokmahCycle03Aladiah.tsx');
const defs = read('apps/mobile/src/features/chokmah/runtime-definitions/aladiah.ts');
const d47 = read('apps/mobile/src/features/chokmah/AladiahDay047VisualExperience.tsx');
const d48 = read('apps/mobile/src/features/chokmah/AladiahDay048NarrativeLoopsExperience.tsx');
const d49 = read('apps/mobile/src/features/chokmah/AladiahDay049InteroceptionExperience.tsx');
const d50 = read('apps/mobile/src/features/chokmah/AladiahDay050ContourExperience.tsx');
const d51 = read('apps/mobile/src/features/chokmah/AladiahDay051SigilExperience.tsx');
const m47 = read('supabase/migrations/20260909190500_enforce_aladiah_047_scalar_evidence.sql');
const m48 = read('supabase/migrations/20260909192000_enforce_aladiah_048_scalar_evidence.sql');
const m49 = read('supabase/migrations/20260909193500_enforce_aladiah_049_scalar_evidence.sql');
const m50 = read('supabase/migrations/20260909195000_enforce_aladiah_050_scalar_evidence.sql');
const m51 = read('supabase/migrations/20260909200500_enforce_aladiah_051_scalar_evidence.sql');

check('Chokmah routes Cycle03 through Day 051', /currentDay\s*<=\s*51[\s\S]*ChokmahCycle03Aladiah/.test(journey));
check('Cycle03 mounts all five Aladiah runtimes', ['AladiahDay047VisualExperience','AladiahDay048NarrativeLoopsExperience','AladiahDay049InteroceptionExperience','AladiahDay050ContourExperience','AladiahDay051SigilExperience'].every((x) => has(cycle, x)));
check('Aladiah definitions are continuous 047-051', [47,48,49,50,51].every((d) => has(defs, `ALADIAH_DAY_0${d}`)) && has(defs, 'cycleLength: 5'));
check('canonical successor contains Aladiah 047-051', [47,48,49,50,51].every((d) => exists(`content/canon/atziluth/chokmah/dia-${String(d).padStart(3,'0')}.md`)));

check('Day047 runs four 300s visual blocks', ['black_seconds: 300','white_seconds: 300','bright_black_seconds: 300','bright_white_seconds: 300'].every((x) => has(defs, x)) && has(d47, 'const CONDITION_SECONDS = 300'));
check('Day047 preserves absence of visual effect', has(d47, 'NENHUM EFEITO VISUAL') && has(defs, 'primary_effect_present') && has(defs, 'control_effect_present'));
check('Day047 forbids diagnostic use of halo/color', has(d47, 'NÃO USEI COR/HALO PARA DIAGNOSTICAR HUMOR, SAÚDE OU CARÁTER'));
check('Day047 server binds canonical source and durations', has(m47, '74d2be4a84f4818729bb069ac7642c7e51ff6f14') && (m47.match(/::integer < 300/g)?.length ?? 0) === 4 && has(m47, 'day047_evidence_unknown_field'));

check('Day048 enforces 1→2→3 / 3→2→1 loop closure', has(d48, 'SUSPENDER 1 · ABRIR 2') && has(d48, 'SUSPENDER 2 · ABRIR 3') && has(d48, 'FECHAR HISTÓRIA 3') && has(d48, 'FECHAR HISTÓRIA 2') && has(d48, 'FECHAR HISTÓRIA 1'));
check('Day048 stores narrative prose only in encrypted Vault', has(d48, 'encryptVaultText') && has(d48, 'saveEncryptedVaultEntry') && has(d48, "kind: 'narrative-loops'") && has(d48, 'localRecordHash: encrypted.checksumSha256'));
check('Day048 operational evidence is 3/3/3 and ethical', has(d48, 'loops_opened: 3') && has(d48, 'loops_closed: 3') && has(d48, 'linear_stories_completed: 3') && has(d48, 'coercion_not_used: coercionNotUsed'));
check('Day048 server binds canonical source and strict counts', has(m48, 'ff8cae22023e70359768023dfc927ce94c1a27d5') && (m48.match(/::integer < 3/g)?.length ?? 0) === 3 && has(m48, 'day048_evidence_unknown_field'));

check('Day049 uses 300s rest + 30s manual count in both conditions', has(defs, 'active_rest_seconds: 300') && has(defs, 'active_count_seconds: 30') && has(defs, 'control_rest_seconds: 300') && has(defs, 'control_count_seconds: 30') && has(d49, 'NÃO É MONITOR CARDÍACO'));
check('Day049 does not calculate or classify BPM', !has(d49, 'bpm') && !has(d49, 'BPM') && has(d49, 'NÃO USEI O PROTOCOLO COMO DIAGNÓSTICO, TRATAMENTO OU SUBSTITUTO CLÍNICO'));
check('Day049 exposes clinical safety stop language from canon', has(d49, 'Dor no peito, desmaio, falta de ar importante ou palpitações persistentes'));
check('Day049 server accepts observational pulse counts and binds source', has(m49, '63932dceb3e412a5f6a067049d8a57e0374ed68e') && has(m49, 'day049_pulse_count_invalid') && has(m49, 'day049_duration_incomplete'));

check('Day050 supports self-reflection without third-party data', has(d50, 'USAR MEU PRÓPRIO REFLEXO') && has(d50, 'O app não pede nome, foto, rosto nem interpretação pessoal de terceiros'));
check('Day050 requires explicit consent for third party', has(d50, 'A PESSOA DEU CONSENTIMENTO EXPLÍCITO') && has(m50, "p_evidence->'third_party_used' = 'true'::jsonb") && has(m50, 'day050_third_party_consent_required'));
check('Day050 sends no identity/image/prose fields', !/TextInput/.test(d50) && has(d50, 'third_party_used: thirdPartyUsed') && has(d50, 'privacy_preserved: privacyPreserved'));
check('Day050 server binds canonical source and 300/300 durations', has(m50, '99f56677fb57d8ddfe191b081cae44734b38ae50') && (m50.match(/::integer < 300/g)?.length ?? 0) === 2);

check('Day051 provides a private vector drawing canvas', has(d51, 'PanResponder.create') && has(d51, "from 'react-native-svg'") && has(d51, 'strokes.length > 0'));
check('Day051 does not impose an invented reduction algorithm', has(d51, 'NÃO HÁ ALGORITMO IMPOSTO PELO CODEX') && has(d51, 'REGRA DE REDUÇÃO USADA'));
check('Day051 encrypts phrase, reduction and drawing into Vault', has(d51, "kind: 'discernment-sigil'") && has(d51, 'reduction_rule: reductionRule.trim()') && has(d51, 'strokes })') && has(d51, 'saveEncryptedVaultEntry'));
check('Day051 requires 180s observation and text control', has(defs, 'sigil_observation_seconds: 180') && has(d51, 'target={180}') && has(d51, 'text_control_completed: textControlCompleted'));
check('Day051 refuses guaranteed protection claims', has(d51, 'NÃO TRATEI O SIGILO COMO PROTEÇÃO GARANTIDA CONTRA ENTIDADES, ACIDENTES OU DOENÇAS') && has(defs, 'no_guaranteed_protection_claim'));
check('Day051 server binds canonical source and strict observation', has(m51, 'e70910495dbbe0c70cece9b694271ded7799c7fd') && has(m51, "'sigil_observation_seconds')::integer < 180") && has(m51, 'day051_evidence_unknown_field'));

check('All Aladiah private validator functions are revoked from clients', [m47,m48,m49,m50,m51].every((m) => has(m, 'revoke all on function hnk_private.validate_day')));
check('All Aladiah trigger functions are revoked from clients', [m47,m48,m49,m50,m51].every((m) => has(m, 'revoke all on function hnk_private.enforce_aladiah_')));

if (failed) process.exit(1);
console.log('PASS ALADIAH · Days 047-051 runtime, Vault/privacy/safety and fail-closed evidence contracts valid');
