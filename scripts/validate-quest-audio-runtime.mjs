import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const fail = (message) => { console.error(`QUEST AUDIO RUNTIME FAIL: ${message}`); process.exitCode = 1; };

const engineAudio = read('packages/quest-engine/src/audio-runtime.ts');
const controller = read('packages/quest-engine/src/audio-controller.ts');
const engineIndex = read('packages/quest-engine/src/index.ts');
const webAdapter = read('apps/web/app/day-002/day002-audio-runtime.ts');
const webRegistry = read('apps/web/app/_runtime/quest-audio-runtime.ts');
const webRenderer = read('apps/web/app/_runtime/QuestAudioPhase.tsx');
const mobileAdapter = read('apps/mobile/src/features/kether/day002-audio-runtime.ts');
const mobileRegistry = read('apps/mobile/src/runtime/quest-audio-runtime.ts');
const mobileRenderer = read('apps/mobile/src/runtime/QuestAudioPhase.tsx');
const quest = JSON.parse(read('docs/experience/kether/day-002/day-002.quest.json'));

for (const forbidden of ['HNK-KETHER-D002-AUDIO-V1', '432', '438', '528', 'day === 2', 'day===2']) {
  if (engineAudio.includes(forbidden) || controller.includes(forbidden)) {
    fail(`quest-engine audio layer hardcodes Day 002 detail: ${forbidden}`);
  }
}

if (!engineAudio.includes('export interface AudioRuntimePort')) fail('AudioRuntimePort missing');
if (!engineAudio.includes('export class AudioRuntimeRegistry')) fail('AudioRuntimeRegistry missing');
if (!engineAudio.includes('getAudioProfileId')) fail('profile-id resolver missing');
if (!engineAudio.includes('bindAudioPhase')) fail('audio directive binder missing');
if (!controller.includes('createQuestAudioController')) fail('generic audio controller missing');
if (!engineIndex.includes('./audio-runtime.js') || !engineIndex.includes('./audio-controller.js')) fail('audio runtime API not exported');

const audioPhase = quest.phases.find((phase) => phase.type === 'AUDIO');
if (!audioPhase) fail('Day 002 AUDIO phase missing');
if (audioPhase?.audio?.profile_id !== 'HNK-KETHER-D002-AUDIO-V1') fail('Day 002 must bind approved profile_id');
if (audioPhase?.audio?.production_enabled !== true) fail('Day 002 audio must be production enabled');

for (const [label, adapter] of [['web', webAdapter], ['mobile', mobileAdapter]]) {
  if (!adapter.includes('implements AudioRuntimePort')) fail(`${label} adapter does not implement AudioRuntimePort`);
  if (!adapter.includes('snapshot()')) fail(`${label} adapter does not expose runtime snapshot`);
  for (const method of ['start(', 'pause(', 'resume(', 'setVolume(', 'stop(']) {
    if (!adapter.includes(method)) fail(`${label} adapter missing ${method}`);
  }
}

if (!webRegistry.includes('new AudioRuntimeRegistry()') || !mobileRegistry.includes('new AudioRuntimeRegistry()')) fail('platform audio registries missing');
if (!webRegistry.includes('.register(DAY002_AUDIO_PRESET_V1.id') || !mobileRegistry.includes('.register(DAY002_AUDIO_PRESET_V1.id')) fail('approved profile not registered on both platforms');

for (const [label, renderer] of [['web', webRenderer], ['mobile', mobileRenderer]]) {
  if (!renderer.includes('createQuestAudioController')) fail(`${label} generic AUDIO renderer does not use QuestAudioController`);
  if (renderer.includes('day002-audio-runtime')) fail(`${label} generic AUDIO renderer imports Day 002 implementation directly`);
  if (!renderer.includes('headphones_required_for_binaural_difference')) fail(`${label} renderer missing headphone disclosure`);
  if (!renderer.includes('não apresenta este áudio como prova')) fail(`${label} renderer missing non-neurological-claim copy`);
  if (!renderer.includes('onSafetyStop')) fail(`${label} renderer missing Safety Stop`);
}

if (!process.exitCode) console.log('QUEST AUDIO RUNTIME PASS: profile-driven engine port; Web/Expo registries; generic AUDIO renderers; no Day-specific engine branching');
