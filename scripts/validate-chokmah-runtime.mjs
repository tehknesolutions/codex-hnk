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
const exp = read('apps/mobile/src/features/chokmah/CahetelDays037to039Experience.tsx');
const defs = read('apps/mobile/src/features/chokmah/runtime-definitions/cahetel.ts');
const migration = read('supabase/migrations/20260908120500_extend_atziluth_progression.sql');

check('Atziluth routes Kether through Day 036', /currentDay\s*<=\s*36[\s\S]*KetherJourney/.test(atziluth));
check('Atziluth routes Chokmah through Day 073', /currentDay\s*<=\s*73[\s\S]*ChokmahJourney/.test(atziluth));
check('Atziluth recognizes Binah threshold after Day 073', has(atziluth, 'Binah') && has(atziluth, 'currentDay'));
check('Chokmah is server-driven', has(journey, "from('user_progress')") && has(journey, "select('current_day')"));

check('only canonical Days 037-039 have runtime definitions', has(defs, 'CAHETEL_DAY_037') && has(defs, 'CAHETEL_DAY_038') && has(defs, 'CAHETEL_DAY_039') && !has(defs, 'CAHETEL_DAY_040') && !has(defs, 'CAHETEL_DAY_041'));
check('Days 040-041 stay behind editorial draft gate', has(cycle, 'EDITORIAL_DRAFT_PENDING_CANON') && has(cycle, '<= 39 ? <CahetelDays037to039Experience'));
check('draft gate does not mount Day runtime', !/function EditorialDraftGate[\s\S]*controller\.begin/.test(cycle) && !/function EditorialDraftGate[\s\S]*completeCodexDay/.test(cycle));

check('Day 037 requires 20 perceptions and 420 seconds', has(defs, 'perceptions_logged: 20') && has(defs, 'vakog_seconds: 420') && has(exp, 'Array.from({ length: 20 }'));
check('Day 037 private perceptions go to encrypted Vault', has(exp, "kind: 'vakog'") && has(exp, 'saveEncryptedVaultEntry') && has(exp, 'perceptions: items.map'));
check('Day 038 requires 10 thoughts and 360 seconds', has(defs, 'thoughts_paced: 10') && has(defs, 'pacing_seconds: 360') && has(exp, 'Array.from({ length: 10 }'));
check('Day 038 preserves voluntary suggestion choice', has(defs, 'voluntary_choice_preserved') && has(exp, 'MANTIVE LIBERDADE PARA ACEITAR OU RECUSAR'));
check('Day 039 preserves 180s neutral + 240s symbolic control', has(defs, 'neutral_seconds: 180') && has(defs, 'symbolic_seconds: 240') && has(exp, 'target={180}') && has(exp, 'target={240}'));
check('Day 039 refuses telepathy certainty', has(defs, 'telepathy_not_claimed') && has(exp, 'NÃO CLASSIFIQUEI IMPRESSÃO SUBJETIVA COMO TELEPATIA CONFIRMADA'));

check('DB accepts current client canonical practice mode', /check \(mode in \('first_completion','canonical','revisit','control'\)\)/.test(migration));
check('DB enforces sequential progression beyond Kether', /p_day between 2 and 108/.test(migration) && has(migration, 'previous_day_required'));
check('Portal 073 requires all Chokmah Days 037-072', /p_day = 73/.test(migration) && /day between 37 and 72/.test(migration) && has(migration, 'chokmah_portal_locked'));
check('Portal 073 promotes Iniciado to Teurgo and opens Binah', has(migration, "initiatory_grade = 3") && has(migration, "initiatory_title = 'Teurgo'") && has(migration, "current_day = 74") && has(migration, "current_sephira = 'Binah'"));
check('Day 109 already has all-Binah gate without inventing post-Binah grade', /p_day = 109/.test(migration) && /day between 74 and 108/.test(migration) && has(migration, 'binah_portal_locked') && !/p_day = 109[\s\S]{0,500}initiatory_grade\s*=\s*4/.test(migration));

if (failed) process.exit(1);
console.log('PASS CHOKMAH · runtime/canon boundary and Atziluth progression contract valid');
