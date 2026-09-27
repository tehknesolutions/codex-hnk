import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('./Day001GoldenV2Web.tsx', import.meta.url), 'utf8');
const mirrorStart = source.indexOf("{step==='mirror'?");
const sealStart = source.indexOf("{step==='seal'?");
assert.ok(mirrorStart >= 0 && sealStart > mirrorStart, 'Soul Mirror must exist before Seal');
const mirror = source.slice(mirrorStart, sealStart);

assert.match(mirror, /styles\.mirrorRite/, 'Soul Mirror must have a dedicated ritual composition');
assert.match(mirror, /DAY001_CANON\.soulMirror/, 'Soul Mirror must remain canon-backed');
assert.match(mirror, /styles\.privateVault/, 'Private Vault boundary must be visually explicit');
assert.match(mirror, /LOCAL ONLY|SOMENTE LOCAL/, 'Private plaintext must be explicitly marked local-only');
assert.match(mirror, /não entra na Evidence|nao entra na Evidence/i, 'Private plaintext must be excluded from Evidence');
assert.match(mirror, /não sincroniza plaintext|nao sincroniza plaintext/i, 'Plaintext sync must remain disabled until a proper Vault exists');
assert.match(mirror, /voluntary/, 'Seal must remain explicitly voluntary');
assert.match(mirror, /canSeal/, 'Server seal gate must remain authoritative');

// Post-seal cleanup and Evidence construction live in seal(), outside the mirror render slice.
assert.match(source, /setIntention\(''\)/, 'Intention plaintext must be cleared after sealing');
assert.match(source, /setMirror\(''\)/, 'Mirror plaintext must be cleared after sealing');
const evidenceStart = source.indexOf('evidence:{');
const evidenceEnd = source.indexOf('totalDurationSeconds', evidenceStart);
assert.ok(evidenceStart >= 0 && evidenceEnd > evidenceStart, 'Authoritative Evidence payload must exist');
const evidence = source.slice(evidenceStart, evidenceEnd);
assert.doesNotMatch(evidence, /\bintention\b|\bmirror\b/, 'Private plaintext must never be embedded in Evidence');

console.log('day001-mirror-vault-presentation: contract satisfied');
