import { existsSync, readFileSync } from 'node:fs';

const required = [
  'apps/mobile/package.json',
  'apps/mobile/src/features/kether/Day001ImmersiveMobileVerticalSlice.tsx',
  'apps/mobile/src/features/kether/Day001MasterVerticalSlice.tsx',
  'apps/mobile/src/features/kether/Day001LiveVerticalSlice.tsx',
  'apps/mobile/src/features/kether/day001-data.ts',
  'apps/web/package.json',
  'apps/web/app/day-001/Day001ImmersiveExperience.tsx',
  'apps/web/app/day-001/Day001WebExperience.tsx',
  'apps/web/app/day-001/WebDay001Runtime.tsx',
  'apps/web/app/day-001/day001-immersive.module.css',
  'apps/web/app/day-001/web-runtime.module.css',
  'apps/web/app/day-001/page.tsx',
  'docs/experience/kether/HNK_KETHER_FREEZE_V1.md',
];

const missing = required.filter((path) => !existsSync(path));
if (missing.length) {
  console.error('Missing Day 001 vertical-slice files:');
  for (const path of missing) console.error(`- ${path}`);
  process.exit(1);
}

const mobilePackage = readFileSync('apps/mobile/package.json', 'utf8');
const mobileImmersive = readFileSync('apps/mobile/src/features/kether/Day001ImmersiveMobileVerticalSlice.tsx', 'utf8');
const mobileLegacy = readFileSync('apps/mobile/src/features/kether/Day001MasterVerticalSlice.tsx', 'utf8');
const mobileAlias = readFileSync('apps/mobile/src/features/kether/Day001LiveVerticalSlice.tsx', 'utf8');
const mobileData = readFileSync('apps/mobile/src/features/kether/day001-data.ts', 'utf8');
const webPackage = readFileSync('apps/web/package.json', 'utf8');
const webImmersive = readFileSync('apps/web/app/day-001/Day001ImmersiveExperience.tsx', 'utf8');
const webRuntime = readFileSync('apps/web/app/day-001/WebDay001Runtime.tsx', 'utf8');
const webCss = readFileSync('apps/web/app/day-001/day001-immersive.module.css', 'utf8');
const webRuntimeCss = readFileSync('apps/web/app/day-001/web-runtime.module.css', 'utf8');
const webPage = readFileSync('apps/web/app/day-001/page.tsx', 'utf8');
const freeze = readFileSync('docs/experience/kether/HNK_KETHER_FREEZE_V1.md', 'utf8');

const immersiveActs = ['limiar', 'revelacao', 'jachin', 'boaz', 'meio', 'selo'];

function tokensInOrder(source, tokens) {
  let cursor = -1;
  for (const token of tokens) {
    const next = source.indexOf(`'${token}'`, cursor + 1);
    if (next < 0) return false;
    cursor = next;
  }
  return true;
}

const invariants = [
  ['Freeze contains approved Day 001 grammar', freeze.includes('vazio') && freeze.includes('Manuscrito') && freeze.includes('Relic Moment') && freeze.includes('Átrio transformado')],
  ['Freeze says movements are grammar, not mechanical screens', freeze.includes('gramática de experiência, não template mecânico')],

  ['Mobile consumes @hnk/ui', mobilePackage.includes('"@hnk/ui": "workspace:*"')],
  ['Mobile active alias routes to immersive V2', mobileAlias.includes('Day001ImmersiveMobileVerticalSlice as Day001LiveVerticalSlice') && !mobileAlias.includes('Day001MasterVerticalSlice as Day001LiveVerticalSlice')],
  ['Mobile immersive acts follow ritual order', tokensInOrder(mobileImmersive, immersiveActs)],
  ['Mobile active experience has ritual map instead of 20-step counter', mobileImmersive.includes('Mapa ritual do Dia 001') && mobileImmersive.includes('ACTS.map') && !mobileImmersive.includes('SCENES.length') && !mobileImmersive.includes('/ 20')],
  ['Mobile teaches with canonical doctrine fields', mobileImmersive.includes('day.jachinDoctrine') && mobileImmersive.includes('day.boazDoctrine') && mobileImmersive.includes('day.middleDoctrine')],
  ['Mobile data snapshot loads doctrine from canonical count blocks', mobileData.includes("extractBlock(rawMarkdown, 'jachin-doctrine')") && mobileData.includes("extractBlock(rawMarkdown, 'boaz-doctrine')") && mobileData.includes("extractBlock(rawMarkdown, 'middle-doctrine')")],
  ['Mobile offline bundle contains educational doctrine fallback', mobileData.includes('O abismo silencioso de Kether') && mobileData.includes('A descida da força exige um vaso') && mobileData.includes('No pilar central de Tiphereth')],
  ['Mobile has three symbolic keys', mobileImmersive.includes("id: 'louco'") && mobileImmersive.includes("id: 'fehu'") && mobileImmersive.includes("id: 'iching'")],
  ['Mobile contextualizes symbolic keys', mobileImmersive.includes('não é uma definição universal')],
  ['Mobile exposes HNK epistemic boundary', mobileImmersive.includes('HNK-EP') && mobileImmersive.includes('afirmação científica ou biomédica')],
  ['Mobile has Jachin Boaz Middle timers', mobileImmersive.includes('targetSeconds={600}') && mobileImmersive.includes('targetSeconds={300}') && mobileImmersive.includes('targetSeconds={180}')],
  ['Mobile does not reward discomfort or intensity', mobileImmersive.includes('Nenhum bônus é concedido por desconforto ou intensidade subjetiva')],
  ['Mobile does not invent Dai Koo Myo visual', mobileImmersive.includes('master visual HNK continua pendente')],
  ['Mobile keeps audio unresolved', mobileImmersive.includes('PRESET_PENDING')],
  ['Mobile implements three-distraction laboratory', mobileImmersive.includes("useState(['', '', ''])") && mobileImmersive.includes('DISTRAÇÃO') && mobileImmersive.includes('3 / 3')],
  ['Mobile has intention Mirror and voluntary contract', mobileImmersive.includes('INTENÇÃO DO NEÓFITO') && mobileImmersive.includes('ESPELHO DA ALMA') && mobileImmersive.includes('PRÁTICA VOLUNTÁRIA · RETORNO PRESERVADO')],
  ['Mobile voice practice does not require recording', mobileImmersive.includes('SEM GRAVAÇÃO AUTOMÁTICA') && mobileImmersive.includes('Nenhuma gravação, análise da voz ou upload é necessário')],
  ['Mobile preserves real practice session write', mobileImmersive.includes('startPracticeSession') && mobileImmersive.includes("mode: 'canonical'")],
  ['Mobile preserves encrypted Vault write', mobileImmersive.includes('saveEncryptedVaultEntry') && mobileImmersive.includes('encryptVaultText')],
  ['Mobile preserves structured Practice Record write', mobileImmersive.includes('savePracticeRecord') && mobileImmersive.includes('distraction_count')],
  ['Mobile preserves idempotent completion path', mobileImmersive.includes('completeCodexDay') && mobileImmersive.includes('firstCompletion')],
  ['Mobile clears private fields after live seal', mobileImmersive.includes("setIntention('')") && mobileImmersive.includes("setMirror('')") && mobileImmersive.includes("setDistractions(['', '', ''])")],
  ['Mobile Tree keeps Day 005 Fragment boundary', mobileImmersive.includes('Fragmento I de Vehuiah continua reservado') && mobileImmersive.includes('Dia 005')],
  ['Mobile preserves reduced-motion support', mobileImmersive.includes('reduceMotionChanged') && mobileImmersive.includes('reduceMotion')],
  ['Legacy mobile file remains non-routed for comparison only', mobileLegacy.includes("const SCENES: Scene[]") && !mobileAlias.includes('Day001MasterVerticalSlice')],

  ['Web depends on shared Supabase runtime', webPackage.includes('"@hnk/supabase-client": "workspace:*"')],
  ['Web route renders immersive experience V2', webPage.includes('<Day001ImmersiveExperience />') && !webPage.includes('<Day001WebExperience />')],
  ['Web immersive acts follow ritual order', tokensInOrder(webImmersive, immersiveActs)],
  ['Web no longer exposes 20-scene slideshow array', !webImmersive.includes('const SCENES') && !webImmersive.includes('01 / 20') && !webImmersive.includes("SCENES.length")],
  ['Web exposes ritual map instead of slide counter', webImmersive.includes('Mapa ritual do Dia 001') && webImmersive.includes('ACTS.map')],
  ['Web teaches through canonical manuscript matter', webImmersive.includes('jachinDoctrine') && webImmersive.includes('boazDoctrine') && webImmersive.includes('middleDoctrine')],
  ['Web validates live raw markdown and parses count blocks', webImmersive.includes('raw_markdown') && webImmersive.includes('HNK:COUNT START') && webImmersive.includes('parseBlocks')],
  ['Web carries explicit offline educational fallback', webImmersive.includes('FALLBACK EDUCACIONAL') && webImmersive.includes('O abismo silencioso de Kether')],
  ['Web has three symbolic keys', webImmersive.includes("id: 'louco'") && webImmersive.includes("id: 'fehu'") && webImmersive.includes("id: 'iching'")],
  ['Web contextualizes symbolic keys rather than claiming universality', webImmersive.includes('não é uma definição universal')],
  ['Web preserves HNK epistemic boundary', webImmersive.includes('HNK-EP') && webImmersive.includes('afirmação científica ou biomédica')],
  ['Web has real ritual timers', webImmersive.includes('<RitualTimer seconds={600}') && webImmersive.includes('<RitualTimer seconds={300}')],
  ['Web never rewards discomfort or loss of control', webImmersive.includes('não recompensa desconforto, perda de controle')],
  ['Web keeps Dai Koo Myo visual reference pending', webImmersive.includes('master visual HNK continua em revisão')],
  ['Web keeps audio unresolved', webImmersive.includes('PRESET_PENDING')],
  ['Web implements three-distraction laboratory', webImmersive.includes("useState(['', '', ''])") && webImmersive.includes('DISTRAÇÃO') && webImmersive.includes('3 / 3')],
  ['Web private proof fields are declared local only', webImmersive.includes('somente na memória da página') && webImmersive.includes('Vault final continuará bloqueado')],
  ['Web has optional voice practice without auto upload', webImmersive.includes('getUserMedia') && webImmersive.includes('PRATICAR SEM GRAVAR') && webImmersive.includes('Nenhuma gravação ou upload acontece automaticamente')],
  ['Web has intention and Mirror of the Soul', webImmersive.includes('INTENÇÃO DO NEÓFITO') && webImmersive.includes('ESPELHO DA ALMA')],
  ['Web has voluntary Neophyte contract', webImmersive.includes('PRÁTICA VOLUNTÁRIA · RETORNO PRESERVADO')],
  ['Web visually rehearses reward without falsely awarding XP', webImmersive.includes('O produto não concede XP neste proof web') && webImmersive.includes('RECOMPENSA CANÔNICA PREVISTA')],
  ['Web has Tree of Life first-spark consequence', webImmersive.includes('1 de 36 travessias de Kether') && webImmersive.includes('Fragmento I de Vehuiah só existe depois do Dia 005')],
  ['Web still opens real practice session when authenticated', webImmersive.includes('startPracticeSession') && webImmersive.includes("mode: 'canonical'")],
  ['Web live path still cannot write final Vault/completion from this proof', !webImmersive.includes('saveEncryptedVaultEntry') && !webImmersive.includes('savePracticeRecord') && !webImmersive.includes('completeCodexDay')],
  ['Web runtime still uses explicit shared auth client', webRuntime.includes('createHnkSupabaseClient') && webRuntime.includes('parseAuthCallbackUrl')],
  ['Web runtime consumes exact public env roles', webRuntime.includes('NEXT_PUBLIC_SUPABASE_URL') && webRuntime.includes('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY')],
  ['Web auth storage is browser-local but immersive experience does not use localStorage', webRuntime.includes('window.localStorage') && !webImmersive.includes('localStorage')],

  ['Immersive CSS consumes semantic Kether void token', webCss.includes('var(--hnk-kether-void')],
  ['Immersive CSS consumes material gold token', webCss.includes('var(--hnk-kether-gold-material')],
  ['Immersive CSS consumes sacred display role', webCss.includes('var(--hnk-font-sacred-display')],
  ['Immersive CSS consumes editorial body role', webCss.includes('var(--hnk-font-editorial-body')],
  ['Immersive CSS consumes system role', webCss.includes('var(--hnk-font-system')],
  ['Immersive CSS provides mobile composition', webCss.includes('@media (max-width: 640px)')],
  ['Immersive CSS provides reduced-motion behavior', webCss.includes('@media (prefers-reduced-motion: reduce)')],
  ['Immersive CSS creates distinct experiential fields', webCss.includes('.thresholdAct') && webCss.includes('.revelationAct') && webCss.includes('.jachinAct') && webCss.includes('.boazAct') && webCss.includes('.middleAct') && webCss.includes('.sealAct')],
  ['Immersive CSS has no external image dependency', !webCss.includes('url(') && !webImmersive.includes('<img')],
  ['Web auth gate continues to use semantic tokens', webRuntimeCss.includes('var(--hnk-kether-void)') && webRuntimeCss.includes('var(--hnk-font-sacred-display)')],
];

const failed = invariants.filter(([, ok]) => !ok);
if (failed.length) {
  console.error('HNK Day 001 immersive vertical-slice validation failed:');
  for (const [name] of failed) console.error(`- ${name}`);
  process.exit(1);
}

console.log(`HNK Day 001 immersive vertical slice: valid (${invariants.length} invariants)`);
