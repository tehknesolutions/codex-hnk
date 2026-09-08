import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const d2 = path.join(root, 'docs', 'experience', 'kether', 'day-002');
const readJson = (name) => JSON.parse(fs.readFileSync(path.join(d2, name), 'utf8'));
const readText = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const fail = (message) => { console.error(`DAY002 AUDIO FAIL: ${message}`); process.exitCode = 1; };

const manifest = readJson('day-002.audio.manifest.json');
const quest = readJson('day-002.quest.json');
const evidence = readJson('day-002.evidence.schema.json');
const service = readJson('day-002.completion.service.json');
const pack = readJson('day-002.quest-pack.json');
const contractSource = readText('packages/audio-contract/src/index.ts');
const webAdapter = readText('apps/web/app/day-002/day002-audio-runtime.ts');
const expoAdapter = readText('apps/mobile/src/features/kether/day002-audio-runtime.ts');
const practiceContract = readText('packages/practice-contract/src/day002.ts');
const clientService = readText('packages/supabase-client/src/day002-v1.ts');
const migration = readText('supabase/migrations/20260908184234_activate_day002_audio_and_completion_v1.sql');

const EXPECTED = {
  id: 'HNK-KETHER-D002-AUDIO-V1',
  left: 432,
  right: 438,
  difference: 6,
  ritual: 528,
  binauralGain: 0.06,
  ritualGain: 0.04,
  sampleRate: 44100,
  seconds: 1,
  sha: 'f2d62825612af7e79b62965dbc28d9066dfb032e71c59d2973706d329f84cf46',
};

if (manifest.id !== EXPECTED.id || manifest.status !== 'PUBLISHED') fail('manifest identity/status drift');
const mapping = manifest.mapping ?? {};
for (const [key, value] of [
  ['left_carrier_hz', EXPECTED.left],
  ['right_carrier_hz', EXPECTED.right],
  ['binaural_difference_hz', EXPECTED.difference],
  ['ritual_tone_hz', EXPECTED.ritual],
  ['binaural_gain', EXPECTED.binauralGain],
  ['ritual_gain', EXPECTED.ritualGain],
  ['sample_rate_hz', EXPECTED.sampleRate],
  ['loop_seconds', EXPECTED.seconds],
]) if (mapping[key] !== value) fail(`manifest ${key} drift`);
if (mapping.reference_render_sha256 !== EXPECTED.sha) fail('manifest render SHA drift');
if (manifest.safety?.autoplay !== false || manifest.safety?.user_volume_control !== true || manifest.safety?.immediate_stop !== true) fail('audio safety controls drift');
if (manifest.safety?.neurological_state_claim !== false || manifest.safety?.therapeutic_claim !== false || manifest.safety?.spiritual_effect_claim !== false) fail('epistemic safety drift');

function renderReferenceWav() {
  const sampleRate = EXPECTED.sampleRate;
  const sampleCount = sampleRate * EXPECTED.seconds;
  const dataSize = sampleCount * 4;
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(2, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 4, 28);
  buffer.writeUInt16LE(4, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);
  for (let index = 0; index < sampleCount; index += 1) {
    const t = index / sampleRate;
    const ritual = Math.sin(2 * Math.PI * EXPECTED.ritual * t) * EXPECTED.ritualGain;
    const left = Math.sin(2 * Math.PI * EXPECTED.left * t) * EXPECTED.binauralGain + ritual;
    const right = Math.sin(2 * Math.PI * EXPECTED.right * t) * EXPECTED.binauralGain + ritual;
    buffer.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(left * 32767))), 44 + index * 4);
    buffer.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(right * 32767))), 46 + index * 4);
  }
  return buffer;
}

const renderedSha = crypto.createHash('sha256').update(renderReferenceWav()).digest('hex');
if (renderedSha !== EXPECTED.sha) fail(`reference WAV SHA mismatch: ${renderedSha}`);

const audioPhase = quest.phases?.find((phase) => phase.id === 'audio_528_binaural')?.audio;
if (quest.version !== '1.3.0') fail('quest version drift');
if (audioPhase?.profile_id !== EXPECTED.id || audioPhase?.production_enabled !== true) fail('quest audio profile not active');
if (audioPhase?.carrier_left_hz !== EXPECTED.left || audioPhase?.carrier_right_hz !== EXPECTED.right || audioPhase?.binaural_difference_hz !== EXPECTED.difference || audioPhase?.ritual_tone_hz !== EXPECTED.ritual) fail('quest frequency mapping drift');
if (audioPhase?.neurological_state_claim !== false) fail('quest must forbid neurological-state claim');
if ((quest.release_blockers ?? []).length !== 0) fail('quest still has release blockers');

if (evidence.properties?.audio_528_binaural?.properties?.profile_id?.const !== EXPECTED.id) fail('Evidence does not pin exact audio profile');
if (evidence.properties?.attribute_progression) fail('client Evidence must not carry attribute progression');
if (service.deployment?.registry_status !== 'active' || service.deployment?.migration !== '20260908184234_activate_day002_audio_and_completion_v1') fail('completion service activation drift');
if (service.deployment?.audio_profile_id !== EXPECTED.id) fail('completion service audio binding drift');
if ((pack.blockers ?? []).length !== 0) fail('Quest Pack still has blockers');
if (pack.audio?.profile_id !== EXPECTED.id || pack.audio?.render_sha256 !== EXPECTED.sha) fail('Quest Pack audio binding drift');

for (const [label, source, needles] of [
  ['audio contract', contractSource, [EXPECTED.id, EXPECTED.sha, 'leftHz: 432', 'rightHz: 438', 'differenceHz: 6', 'hz: 528']],
  ['web adapter', webAdapter, ['DAY002_AUDIO_PRESET_V1', 'createChannelMerger', 'immediate']],
  ['expo adapter', expoAdapter, ['createDay002AudioLoopWavBase64', 'createAudioPlayer', 'player.loop = true']],
  ['practice contract', practiceContract, [EXPECTED.id, 'buildDay002EvidenceV1']],
  ['client service', clientService, ['sealDay002V1', 'complete_codex_day_v2']],
  ['activation migration', migration, [EXPECTED.id, EXPECTED.sha, "when 'day002_v1'", "status = 'active'"]],
]) {
  for (const needle of needles) if (!source.includes(needle)) fail(`${label} missing ${needle}`);
}

if (!process.exitCode) console.log(`DAY002 AUDIO PASS: ${EXPECTED.left}/${EXPECTED.right} -> ${EXPECTED.difference} Hz + ${EXPECTED.ritual} Hz ritual; deterministic SHA ${EXPECTED.sha}; backend active`);
