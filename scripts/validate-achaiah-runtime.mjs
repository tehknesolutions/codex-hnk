import fs from 'node:fs';

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const definitions = read('apps/mobile/src/features/kether/runtime-definitions/achaiah.ts');
const experience = read('apps/mobile/src/features/kether/AchaiahDays031to035Experience.tsx');
const cycle = read('apps/mobile/src/features/kether/KetherCycle07Achaiah.tsx');
const journey = read('apps/mobile/src/features/kether/KetherJourney.tsx');
const runtime = read('apps/mobile/src/features/kether/useHnkDayRuntime.ts');
const practice = read('packages/supabase-client/src/practice-record.ts');

const count = (source, token) => source.split(token).length - 1;
const checks = [
  ['definitions cover 031-035', ['ACHAIAH_DAY_031','ACHAIAH_DAY_032','ACHAIAH_DAY_033','ACHAIAH_DAY_034','ACHAIAH_DAY_035'].every((x) => definitions.includes(x))],
  ['Day 031 requires analysis+surrender+responsibility', definitions.includes("'analysis_condition_completed'") && definitions.includes("'surrender_condition_completed'") && definitions.includes("'responsibility_resumed'")],
  ['Day 031 has two 10 minute conditions', count(experience, 'target={600}') >= 2],
  ['safety stop exists in Achaiah', experience.includes('SAFETY STOP · ENCERRAR TENTATIVA') && experience.includes('controller.interrupt()')],
  ['interrupt is persisted by default', runtime.includes('interruptPracticeSession') && runtime.includes('practice_interrupt_persist_failed') && practice.includes("state: 'interrupted'")],
  ['Day 032 uses seven levels and 180s observation', experience.includes('[1,2,3,4,5,6,7]') && experience.includes('target={180}')],
  ['Day 032 forbids pain/anesthesia testing', experience.includes('SEM TESTE DE DOR') && experience.includes('não mede anestesia')],
  ['Day 033 has two 15 minute conditions', count(experience, 'target={900}') >= 2],
  ['Day 033 preserves voluntary safety movement', experience.includes('MOVIMENTOS POR SEGURANÇA/CONFORTO') && definitions.includes("'voluntary_movement_return_confirmed'")],
  ['Day 034 requires three installations', definitions.includes('minimums: { installation_repetitions: 3 }') && experience.includes('REPETIÇÕES · {repetitions}/3')],
  ['Day 034 requires explicit cancellation', definitions.includes("'cancel_confirmed'") && experience.includes('ESTADO ENCERRADO VOLUNTARIAMENTE')],
  ['Day 035 renders three circles only', experience.includes('ThreeCircles') && experience.includes('circleOuter') && experience.includes('circleMiddle') && experience.includes('circleInner')],
  ['Day 035 does not invent pentagram', experience.includes('nenhum pentagrama inventado') && experience.includes('invented_pentagram_rendered: false')],
  ['Day 035 requires prudence checkpoint', definitions.includes("'prudence_check_completed'") && experience.includes('PRUDENCE CHECK')],
  ['cycle rail has 031-035', cycle.includes('[31, 32, 33, 34, 35]')],
  ['journey routes Achaiah then Portal', journey.includes('currentDay <= 35') && journey.includes('KetherCycle07Achaiah') && journey.includes('PORTAL 036')],
  ['Coroa 7/7 does not claim promotion', journey.includes('Coroa 7/7 não promove Grau') && journey.includes('permanece Neófito')],
];

let failed = 0;
for (const [label, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'} ACHAIAH · ${label}`);
  if (!ok) failed += 1;
}
if (failed) process.exit(1);
console.log(`PASS ACHAIAH · ${checks.length}/${checks.length} invariants`);
