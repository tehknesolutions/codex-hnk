import { existsSync, readFileSync } from 'node:fs';

const required = [
  'packages/ui/package.json',
  'packages/ui/tsconfig.json',
  'packages/ui/src/index.ts',
  'packages/ui/src/tokens/kether.ts',
  'packages/ui/styles/kether.css',
  'packages/ui/README.md',
  'apps/web/package.json',
  'apps/web/app/layout.tsx',
  'apps/web/app/boards/_components/HnkBoardRenderer.tsx',
  'apps/web/app/boards/_components/kether-token-bridge.module.css',
];

const missing = required.filter((path) => !existsSync(path));
if (missing.length) {
  console.error('Missing required HNK UI token files:');
  for (const path of missing) console.error(`- ${path}`);
  process.exit(1);
}

const tokenSource = readFileSync('packages/ui/src/tokens/kether.ts', 'utf8');
const tokenCss = readFileSync('packages/ui/styles/kether.css', 'utf8');
const uiPackage = readFileSync('packages/ui/package.json', 'utf8');
const webPackage = readFileSync('apps/web/package.json', 'utf8');
const layoutSource = readFileSync('apps/web/app/layout.tsx', 'utf8');
const rendererSource = readFileSync(
  'apps/web/app/boards/_components/HnkBoardRenderer.tsx',
  'utf8',
);
const tokenBridge = readFileSync(
  'apps/web/app/boards/_components/kether-token-bridge.module.css',
  'utf8',
);

const invariants = [
  ['UI package identity', uiPackage.includes('"name": "@hnk/ui"')],
  ['Kether direction frozen role', tokenSource.includes('HNK SACRED EDITORIAL FANTASY')],
  [
    'Token values explicitly provisional',
    tokenSource.includes("status: 'direction-frozen-values-provisional'"),
  ],
  ['Rhythm 3', tokenSource.includes('r3: 3')],
  ['Rhythm 6', tokenSource.includes('r6: 6')],
  ['Rhythm 12', tokenSource.includes('r12: 12')],
  ['Rhythm 24', tokenSource.includes('r24: 24')],
  ['Rhythm 36', tokenSource.includes('r36: 36')],
  ['Rhythm 72', tokenSource.includes('r72: 72')],
  ['Sacred display role', tokenSource.includes("role: 'sacred-display'")],
  ['Editorial body role', tokenSource.includes("role: 'editorial-body'")],
  ['System typography role', tokenSource.includes("role: 'system'")],
  ['Origin geometry primitive', tokenSource.includes("'origin-point'")],
  ['Axis geometry primitive', tokenSource.includes("'axis'")],
  ['Ring geometry primitive', tokenSource.includes("'ring'")],
  ['Node geometry primitive', tokenSource.includes("'node'")],
  ['Threshold geometry primitive', tokenSource.includes("'threshold'")],
  ['Reduced-motion contract', tokenSource.includes('reducedMotion')],
  ['Scoped Kether CSS theme', tokenCss.includes("[data-hnk-theme='kether']")],
  ['CSS material-gold role', tokenCss.includes('--hnk-kether-gold-material')],
  ['CSS origin-white role', tokenCss.includes('--hnk-kether-origin-white')],
  ['CSS rhythm 72 role', tokenCss.includes('--hnk-rhythm-72')],
  ['Web depends on @hnk/ui', webPackage.includes('"@hnk/ui": "workspace:*"')],
  ['Web loads shared Kether CSS', layoutSource.includes("@hnk/ui/styles/kether.css")],
  ['Renderer activates Kether theme', rendererSource.includes("data-hnk-theme={ketherTheme ? 'kether' : undefined}")],
  ['Renderer uses token bridge', rendererSource.includes('kether-token-bridge.module.css')],
  ['Token bridge consumes primary text role', tokenBridge.includes('var(--hnk-kether-text-primary)')],
  ['Token bridge consumes sacred typography role', tokenBridge.includes('var(--hnk-font-sacred-display)')],
];

const failed = invariants.filter(([, ok]) => !ok);
if (failed.length) {
  console.error('HNK Kether UI token validation failed:');
  for (const [name] of failed) console.error(`- ${name}`);
  process.exit(1);
}

console.log('HNK Kether UI tokens: valid');
