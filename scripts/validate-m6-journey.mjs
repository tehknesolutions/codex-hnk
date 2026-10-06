import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');
const livingBook = read('apps/web/app/_components/LivingBook.tsx');
const dayBook = read('apps/web/app/_components/DayLivingBook.tsx');
const grid = fs.existsSync('apps/web/app/_components/journey/JourneyGrid.tsx') ? read('apps/web/app/_components/journey/JourneyGrid.tsx') : '';
const shell = fs.existsSync('apps/web/app/_components/journey/DayChamberShell.tsx') ? read('apps/web/app/_components/journey/DayChamberShell.tsx') : '';

const checks = [
  ['JourneyGrid exists', Boolean(grid)],
  ['JourneyGrid consumes shared registry', grid.includes('getJourneySlots')],
  ['JourneyGrid renders dormant state textually', /DORMANT|DORMENTE/.test(grid)],
  ['DayChamberShell exists', Boolean(shell)],
  ['DayChamberShell consumes chamber projection', shell.includes('projectDayChamber')],
  ['DayChamberShell consumes registry navigation', shell.includes('getJourneyNavigation')],
  ['LivingBook mounts JourneyGrid', livingBook.includes('JourneyGrid')],
  ['DayLivingBook delegates to DayChamberShell', dayBook.includes('DayChamberShell')],
  ['No arithmetic day+1 route construction in M6 shell', !/day\s*\+\s*1|\+\s*1.*day/.test(shell)],
];

const failed = checks.filter(([, ok]) => !ok);
for (const [name, ok] of checks) console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`);
if (failed.length) process.exit(1);
