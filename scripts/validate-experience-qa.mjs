import { existsSync, readFileSync } from 'node:fs';

const paths = {
  policy: 'docs/experience/HNK_EXPERIENCE_QA_GATE_V1.md',
  mobileLayout: 'apps/mobile/src/app/_layout.tsx',
  mobileAlias: 'apps/mobile/src/features/kether/Day001LiveVerticalSlice.tsx',
  mobile: 'apps/mobile/src/features/kether/Day001ImmersiveMobileVerticalSlice.tsx',
  nativeRelic: 'apps/mobile/src/features/kether/KetherOriginRelicNative.tsx',
  mobileLegacy: 'apps/mobile/src/features/kether/Day001MasterVerticalSlice.tsx',
  webPage: 'apps/web/app/day-001/page.tsx',
  web: 'apps/web/app/day-001/Day001ImmersiveExperience.tsx',
  relic: 'apps/web/app/day-001/KetherOriginRelicLayer.tsx',
  relicCss: 'apps/web/app/day-001/kether-origin-relic.module.css',
  transitionsCss: 'apps/web/app/day-001/day001-transitions-v1.module.css',
};

const missing = Object.values(paths).filter((path) => !existsSync(path));
if (missing.length) {
  console.error('HNK Experience QA: required files missing');
  for (const path of missing) console.error(`- ${path}`);
  process.exit(1);
}

const policy = readFileSync(paths.policy, 'utf8');
const mobileLayout = readFileSync(paths.mobileLayout, 'utf8');
const mobileAlias = readFileSync(paths.mobileAlias, 'utf8');
const mobile = readFileSync(paths.mobile, 'utf8');
const nativeRelic = readFileSync(paths.nativeRelic, 'utf8');
const mobileLegacy = readFileSync(paths.mobileLegacy, 'utf8');
const webPage = readFileSync(paths.webPage, 'utf8');
const web = readFileSync(paths.web, 'utf8');
const relic = readFileSync(paths.relic, 'utf8');
const relicCss = readFileSync(paths.relicCss, 'utf8');
const transitionsCss = readFileSync(paths.transitionsCss, 'utf8');

const acts = ['limiar', 'revelacao', 'jachin', 'boaz', 'meio', 'selo'];

function tokensInOrder(source, tokens) {
  let cursor = -1;
  for (const token of tokens) {
    const next = source.indexOf(`'${token}'`, cursor + 1);
    if (next < 0) return false;
    cursor = next;
  }
  return true;
}

const checks = [
  ['Policy freezes living-experience axiom', policy.includes('ESTRUTURA RÍGIDA POR BAIXO. EXPERIÊNCIA VIVA POR CIMA.')],
  ['Policy explicitly rejects slide-click-through', policy.includes('frase curta → botão CONTINUAR → nova frase curta')],
  ['Policy requires human video gate', policy.includes('Gate humano para vídeo/review')],

  ['Native root provides safe-area context', mobileLayout.includes("import { SafeAreaProvider } from 'react-native-safe-area-context';") && mobileLayout.includes('<SafeAreaProvider>')],
  ['Native active alias points to immersive V2', mobileAlias.includes('Day001ImmersiveMobileVerticalSlice as Day001LiveVerticalSlice')],
  ['Native active alias does not point to legacy 20-state component', !mobileAlias.includes('Day001MasterVerticalSlice as Day001LiveVerticalSlice')],
  ['Legacy component remains comparison-only', mobileLegacy.includes('const SCENES: Scene[]')],
  ['Native visible grammar is six macroacts', tokensInOrder(mobile, acts) && mobile.includes('Mapa ritual do Dia 001')],
  ['Native does not expose 20-screen counter', !mobile.includes('SCENES.length') && !mobile.includes('/ 20') && !mobile.includes('01 / 20')],
  ['Native has canonical educational matter', mobile.includes('day.jachinDoctrine') && mobile.includes('day.boazDoctrine') && mobile.includes('day.middleDoctrine')],
  ['Native has symbolic revelation', mobile.includes("id: 'louco'") && mobile.includes("id: 'fehu'") && mobile.includes("id: 'iching'")],
  ['Native has three practice timers', mobile.includes('targetSeconds={600}') && mobile.includes('targetSeconds={300}') && mobile.includes('targetSeconds={180}')],
  ['Native has laboratory and reflection', mobile.includes('DISTRAÇÃO') && mobile.includes('ESPELHO DA ALMA') && mobile.includes('INTENÇÃO DO NEÓFITO')],
  ['Native has transformation/progression consequence', mobile.includes('TreeField') && mobile.includes('1 DE 36 TRAVESSIAS DE KETHER')],
  ['Native keeps server/Vault runtime', mobile.includes('encryptVaultText') && mobile.includes('saveEncryptedVaultEntry') && mobile.includes('savePracticeRecord') && mobile.includes('completeCodexDay')],
  ['Native does not create off-grid rhythm token r18', !mobile.includes('R.r18')],
  ['Native keeps audio unresolved instead of inventing preset', mobile.includes('PRESET_PENDING')],
  ['Native keeps Day 005 Fragment boundary', mobile.includes('Fragmento I de Vehuiah') && mobile.includes('Dia 005')],

  ['Native Revelation mounts Origin Lens without seventh macroact', mobile.includes("import { KetherOriginRelicNative } from './KetherOriginRelicNative';") && mobile.includes('<KetherOriginRelicNative reduceMotion={reduceMotion} />') && acts.length === 6],
  ['Native Relic has exactly three pedagogical layers', nativeRelic.includes("label: 'PONTO'") && nativeRelic.includes("label: 'EMANAÇÃO'") && nativeRelic.includes("label: 'EIXO'")],
  ['Native Relic uses safe-area-context rather than core SafeAreaView', nativeRelic.includes("import { SafeAreaView } from 'react-native-safe-area-context';") && !nativeRelic.match(/\n\s*SafeAreaView,\n\s*ScrollView/)],
  ['Native Relic uses full-screen modal and platform back close', nativeRelic.includes('<Modal') && nativeRelic.includes('presentationStyle="fullScreen"') && nativeRelic.includes('onRequestClose={closeRelic}')],
  ['Native Relic offers optional touch response', nativeRelic.includes('onStagePress') && nativeRelic.includes('onPress={onStagePress}') && nativeRelic.includes('O GESTO NÃO É OBRIGATÓRIO')],
  ['Native Relic preserves reduced motion', nativeRelic.includes("animationType={reduceMotion ? 'none' : 'fade'}") && nativeRelic.includes('if (reduceMotion) return;')],
  ['Native Relic explicitly denies canonical-sigil identity', nativeRelic.includes('Não é o Sigilo canônico de Kether')],
  ['Native Relic explicitly denies detection/scientific proof', nativeRelic.includes('não detecta fenômenos') && nativeRelic.includes('prova científica, biomédica')],
  ['Native Relic does not add audio or haptics', !nativeRelic.includes('expo-av') && !nativeRelic.includes('expo-audio') && !nativeRelic.includes('Haptics') && !nativeRelic.includes('Vibration')],

  ['Web route points to immersive V2', webPage.includes('<Day001ImmersiveExperience />') && !webPage.includes('<Day001WebExperience />')],
  ['Web visible grammar is six macroacts', tokensInOrder(web, acts) && web.includes('Mapa ritual do Dia 001')],
  ['Web does not expose slide counter', !web.includes('SCENES.length') && !web.includes('/ 20') && !web.includes('01 / 20')],
  ['Web has canonical educational matter', web.includes('jachinDoctrine') && web.includes('boazDoctrine') && web.includes('middleDoctrine')],
  ['Web has symbolic revelation', web.includes("id: 'louco'") && web.includes("id: 'fehu'") && web.includes("id: 'iching'")],
  ['Web has practice, laboratory and reflection', web.includes('<RitualTimer') && web.includes('DISTRAÇÃO') && web.includes('ESPELHO DA ALMA')],
  ['Web has first-spark consequence', web.includes('1 de 36 travessias de Kether') && web.includes('Fragmento I de Vehuiah')],
  ['Web keeps audio unresolved', web.includes('PRESET_PENDING')],

  ['Web route mounts Relic Moment without creating a seventh macroact', webPage.includes('<KetherOriginRelicLayer />') && acts.length === 6],
  ['Relic exists only in Revelation', relic.includes("activeAct !== 'revelacao'")],
  ['Relic has exactly three pedagogical layers', relic.includes("label: 'PONTO'") && relic.includes("label: 'EMANAÇÃO'") && relic.includes("label: 'EIXO'")],
  ['Relic explicitly denies canonical-sigil identity', relic.includes('Não é o Sigilo canônico de Kether')],
  ['Relic explicitly denies detection/scientific proof', relic.includes('não detecta fenômenos') && relic.includes('prova científica, biomédica')],
  ['Relic supports pointer/touch response', relic.includes('onPointerMove={handlePointerMove}') && relic.includes('data-testid="kether-origin-relic-stage"')],
  ['Relic supports Escape close', relic.includes("event.key === 'Escape'")],
  ['Relic CSS preserves reduced motion', relicCss.includes('@media (prefers-reduced-motion: reduce)')],

  ['Transition choreography is data-act driven', transitionsCss.includes("main[data-act='revelacao']") && transitionsCss.includes("main[data-act='jachin']") && transitionsCss.includes("main[data-act='boaz']") && transitionsCss.includes("main[data-act='meio']") && transitionsCss.includes("main[data-act='selo']")],
  ['Transitions preserve reduced motion', transitionsCss.includes('@media (prefers-reduced-motion: reduce)') && transitionsCss.includes('animation: none !important')],
  ['Web page mounts transition layer', webPage.includes('transitionStyles.transitions')],

  ['Both surfaces expose HNK-EP boundary', mobile.includes('HNK-EP') && web.includes('HNK-EP')],
  ['Both surfaces state scientific/biomedical distinction', mobile.includes('afirmação científica ou biomédica') && web.includes('afirmação científica ou biomédica')],
];

const failed = checks.filter(([, ok]) => !ok);
if (failed.length) {
  console.error('HNK Experience QA Gate V1 failed:');
  for (const [name] of failed) console.error(`- ${name}`);
  process.exit(1);
}

console.log(`HNK Experience QA Gate V1: valid (${checks.length} checks)`);
