import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('./Day001GoldenV2Web.tsx', import.meta.url), 'utf8');

const middleStart = source.indexOf("{step==='middle'?");
const mirrorStart = source.indexOf("{step==='mirror'?");
assert.ok(middleStart >= 0 && mirrorStart > middleStart, 'Middle Pillar step must exist before Soul Mirror');
const middle = source.slice(middleStart, mirrorStart);

assert.match(middle, /styles\.middleRite/, 'Middle Pillar must have a dedicated ritual composition');
assert.match(middle, /styles\.middleAxis/, 'Middle Pillar must render a central convergence axis');
assert.match(middle, /styles\.middleDoctrineAct/, 'Middle Pillar must expose Act I — Doctrine');
assert.match(middle, /DAY001_CANON\.middleDoctrine/, 'Doctrine must remain canon-backed');
assert.match(middle, /styles\.middleKavanahAct/, 'Middle Pillar must expose Act II — Kavanah');
assert.match(middle, /DAY001_CANON\.middleKavanah/, 'Kavanah must remain canon-backed');
assert.match(middle, /target=\{180\}/, 'Middle Pillar practice must preserve 180 seconds / 3 minutes');
assert.match(middle, /styles\.middleOrdealAct/, 'Middle Pillar must expose Act III — Ordeal');
assert.match(middle, /DAY001_CANON\.middleOrdalia/, 'Ordeal must remain canon-backed');
assert.match(middle, /CANON EM RECONCILIAÇÃO EDITORIAL/, 'Editorial reconciliation warning must remain explicit');
assert.match(middle, /returns\.middle/, 'Middle Pillar must preserve its return gate');
assert.match(middle, /advance\('mirror'\)/, 'Middle Pillar must converge into Soul Mirror');
assert.doesNotMatch(middle, /getUserMedia|MediaRecorder|SpeechRecognition|webkitSpeechRecognition/, 'Middle Pillar must not introduce microphone, recording, or transcription APIs');

console.log('day001-middle-presentation: contract satisfied');
