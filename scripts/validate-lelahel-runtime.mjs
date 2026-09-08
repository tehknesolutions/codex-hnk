import fs from 'node:fs';

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const definitions = read('apps/mobile/src/features/kether/runtime-definitions/lelahel.ts');
const executable = read('apps/mobile/src/features/kether/LelahelExecutableExperience.tsx');
const blocked = read('apps/mobile/src/features/kether/LelahelBlockedGate.tsx');
const cycle = read('apps/mobile/src/features/kether/KetherCycle06Lelahel.tsx');
const journey = read('apps/mobile/src/features/kether/KetherJourney.tsx');

const checks = [
  ['definitions cover 026-030', ['LELAHEL_DAY_026','LELAHEL_DAY_027','LELAHEL_DAY_028','LELAHEL_DAY_029','LELAHEL_DAY_030'].every((x) => definitions.includes(x))],
  ['Day 026 requires ACTIVE + CONTROL', definitions.includes("'active_condition_completed'") && definitions.includes("'control_condition_completed'")],
  ['Day 027 requires BLUE + GREY', definitions.includes("'blue_condition_completed'") && definitions.includes("'grey_control_completed'")],
  ['Day 028 remains reference pending', blocked.includes('REFERENCE_PENDING') && blocked.includes('Issue') === false],
  ['Day 030 remains audio pending', blocked.includes('AUDIO_PENDING')],
  ['blocked gates do not start Practice Session', !blocked.includes('.begin(') && !blocked.includes('.seal(') && !blocked.includes('completeCodexDay')],
  ['Day 026 has two 7 minute conditions', (executable.match(/target=\{420\}/g) ?? []).length >= 2],
  ['Day 027 has two 10 minute conditions', (executable.match(/target=\{600\}/g) ?? []).length >= 2],
  ['Day 029 writes private text to encrypted Vault', executable.includes('encryptVaultText') && executable.includes('saveEncryptedVaultEntry') && executable.includes('hnk-day029-pattern-separation-v1')],
  ['Day 029 server evidence is structured', executable.includes('patterns_defined: 3') && executable.includes('replacement_behaviors_defined: 3') && executable.includes('private_text_saved_to_vault: true')],
  ['Day 029 does not send pattern strings as evidence', !/evidence:\s*\{[^}]*patterns\s*:/s.test(executable) && !/metrics:\s*\{[^}]*patterns\s*:/s.test(executable)],
  ['cycle rail has five Lelahel days', cycle.includes('[26, 27, 28, 29, 30]')],
  ['cycle routes blockers separately', cycle.includes('displayDay === 28 || displayDay === 30') && cycle.includes('LelahelBlockedGate')],
  ['journey routes through Day 030', journey.includes('currentDay <= 30') && journey.includes('KetherCycle06Lelahel')],
];

let failed = 0;
for (const [label, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'} LELAHEL · ${label}`);
  if (!ok) failed += 1;
}
if (failed) process.exit(1);
console.log(`PASS LELAHEL · ${checks.length}/${checks.length} invariants`);
