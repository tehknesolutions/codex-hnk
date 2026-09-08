import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const has = (s, needle) => s.includes(needle);
let failed = 0;

function check(label, ok) {
  console.log(`${ok ? 'PASS' : 'FAIL'} CHOKMAH · ${label}`);
  if (!ok) failed += 1;
}

const atziluth = read('apps/mobile/src/features/atziluth/AtziluthJourney.tsx');
const journey = read('apps/mobile/src/features/chokmah/ChokmahJourney.tsx');
const cycle = read('apps/mobile/src/features/chokmah/ChokmahCycle01Cahetel.tsx');
const exp037039 = read('apps/mobile/src/features/chokmah/CahetelDays037to039Experience.tsx');
const exp040041 = read('apps/mobile/src/features/chokmah/CahetelDays040to041Experience.tsx');
const defs = read('apps/mobile/src/features/chokmah/runtime-definitions/cahetel.ts');
const progression = read('supabase/migrations/20260908214958_extend_atziluth_progression_v3.sql');
const sourceSync = read('supabase/migrations/20260908214808_add_immutable_atziluth_source_sync.sql');

check('Atziluth routes Kether through Day 036', /currentDay\s*<=\s*36[\s\S]*KetherJourney/.test(atziluth));
check('Atziluth routes Chokmah through Day 073', /currentDay\s*<=\s*73[\s\S]*ChokmahJourney/.test(atziluth));
check('Atziluth recognizes Binah threshold after Day 073', has(atziluth, 'Binah') && has(atziluth, 'currentDay'));
check('Chokmah is server-driven', has(journey, "from('user_progress')") && has(journey, "select('current_day')"));

check(
  'Cahetel 037-041 all have canonical runtime definitions',
  ['CAHETEL_DAY_037', 'CAHETEL_DAY_038', 'CAHETEL_DAY_039', 'CAHETEL_DAY_040', 'CAHETEL_DAY_041'].every((needle) => has(defs, needle)),
);
check('Cycle mounts canonical 040-041 runtime instead of editorial draft gate', has(cycle, 'CahetelDays040to041Experience') && !has(cycle, 'EDITORIAL_DRAFT_PENDING_CANON'));
check('Day 042 remains outside executable cycle', /currentDay\s*<=\s*41/.test(journey) && has(journey, 'próximo ciclo'));

check('Day 037 requires 20 perceptions and 420 seconds', has(defs, 'perceptions_logged: 20') && has(defs, 'vakog_seconds: 420') && has(exp037039, 'Array.from({ length: 20 }'));
check('Day 037 private perceptions go to encrypted Vault', has(exp037039, "kind: 'vakog'") && has(exp037039, 'saveEncryptedVaultEntry') && has(exp037039, 'perceptions: items.map'));
check('Day 038 requires 10 thoughts and 360 seconds', has(defs, 'thoughts_paced: 10') && has(defs, 'pacing_seconds: 360') && has(exp037039, 'Array.from({ length: 10 }'));
check('Day 038 preserves voluntary suggestion choice', has(defs, 'voluntary_choice_preserved') && has(exp037039, 'MANTIVE LIBERDADE PARA ACEITAR OU RECUSAR'));
check('Day 039 preserves 180s neutral + 240s symbolic control', has(defs, 'neutral_seconds: 180') && has(defs, 'symbolic_seconds: 240') && has(exp037039, 'target={180}') && has(exp037039, 'target={240}'));
check('Day 039 refuses telepathy certainty', has(defs, 'telepathy_not_claimed') && has(exp037039, 'NÃO CLASSIFIQUEI IMPRESSÃO SUBJETIVA COMO TELEPATIA CONFIRMADA'));

check('Day 040 requires verbal and silent six-minute conditions', has(defs, 'verbal_seconds: 360') && has(defs, 'silent_seconds: 360') && has(exp040041, 'target={360}'));
check('Day 040 requires three truisms and one permissive suggestion', has(defs, 'truisms_logged: 3') && has(defs, 'suggestions_logged: 1') && has(exp040041, "useState(['', '', ''])"));
check('Day 040 explicitly preserves ocular autonomy and stop gate', has(defs, 'autonomy_preserved') && has(exp040041, 'ABRIR OS OLHOS CONTINUOU SENDO UMA ESCOLHA SIMPLES') && has(exp040041, 'ENCERRAR POR DESCONFORTO'));
check('Day 040 private wording is encrypted in Vault', has(exp040041, "kind: 'ocular-autoinduction'") && has(exp040041, 'permissive_suggestion: suggestion.trim()'));

check('Day 041 requires active and open seven-minute reception', has(defs, 'active_reception_seconds: 420') && has(defs, 'open_reception_seconds: 420') && has(exp040041, 'target={420}'));
check('Day 041 treats no response as valid', has(exp040041, 'NENHUMA RESPOSTA / SILÊNCIO TAMBÉM É UM RESULTADO VÁLIDO') && has(exp040041, 'NENHUMA OCORRÊNCIA / SILÊNCIO TAMBÉM É VÁLIDO'));
check('Day 041 delays interpretation and requires alternative plus verification', has(defs, 'interpretation_delayed') && has(defs, 'alternative_recorded') && has(defs, 'verification_defined') && has(exp040041, 'REGISTREI A EXPERIÊNCIA ANTES DE INTERPRETAR'));
check('Day 041 private question and interpretations stay encrypted', has(exp040041, "kind: 'intuition-zoe'") && has(exp040041, 'question: question.trim()') && has(exp040041, 'alternative: alternative.trim()'));
check('Day 041 blocks high-impact certainty in UI', has(exp040041, 'segurança, saúde, finanças, acusações') && has(exp040041, 'Nenhuma impressão interna substitui avaliação concreta'));

check('DB accepts canonical/control practice modes used by current client', /check \(mode in \('first_completion','canonical','revisit','control'\)\)/.test(progression));
check('DB enforces sequential progression beyond Kether', /p_day between 2 and 108/.test(progression) && has(progression, 'previous_day_required'));
check('Portal 073 requires all Chokmah Days 037-072', /p_day = 73/.test(progression) && /day between 37 and 72/.test(progression) && has(progression, 'chokmah_portal_locked'));
check('Portal 073 promotes Iniciado to Teurgo and opens Binah', has(progression, "initiatory_grade = 3") && has(progression, "initiatory_title = 'Teurgo'") && has(progression, "current_day = 74") && has(progression, "current_sephira = 'Binah'"));
check('Day 109 has all-Binah gate without inventing post-Binah grade', /p_day = 109/.test(progression) && /day between 74 and 108/.test(progression) && has(progression, 'binah_portal_locked') && !/p_day = 109[\s\S]{0,500}initiatory_grade\s*=\s*4/.test(progression));

check('immutable source sync supports historical and successor allowlisted origins', has(sourceSync, "p_source_kind = 'historical'") && has(sourceSync, "p_source_kind = 'successor'") && has(sourceSync, "v_repo := 'Tehkne-Solutions/hnk-codex-365'") && has(sourceSync, "v_repo := 'tehknesolutions/codex-hnk'"));
check('successor sync fetches exact commit and requires canon status', has(sourceSync, "p_source_commit_sha") && has(sourceSync, "content/canon/atziluth/chokmah") && has(sourceSync, "v_source_status <> 'canon'"));
check('authenticated client cannot be granted private sync by migration', has(sourceSync, 'revoke all on function hnk_private.sync_codex_successor_range') && has(sourceSync, 'from public, anon, authenticated'));

if (failed) process.exit(1);
console.log('PASS CHOKMAH · Cahetel 037-041 canon/runtime boundary and Atziluth server contract valid');
