import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('./Day001GoldenV2Web.tsx', import.meta.url), 'utf8');
const sealStart = source.indexOf("{step==='seal'?");
assert.ok(sealStart >= 0, 'Final Seal step must exist');
const seal = source.slice(sealStart);

assert.match(seal, /styles\.sealRite/, 'Seal must have a dedicated ritual composition');
assert.match(seal, /styles\.sealMandorla/, 'Seal must manifest a distinct completion symbol');
assert.match(seal, /PRIMEIRA CENTELHA/, 'Seal must preserve the First Spark framing');
assert.match(seal, /sealed\?\.first_completion/, 'Seal must distinguish first completion from idempotent replay');
assert.match(seal, /sealed\.xp_awarded|sealed\?\.xp_awarded/, 'Seal must render server-authoritative awarded XP');
assert.match(seal, /sealed\.progression_events|sealed\?\.progression_events/, 'Seal must render server-authoritative progression events');
assert.match(seal, /completion_contract_id/, 'Seal must expose completion contract provenance');
assert.match(seal, /server_completed_at/, 'Seal must expose authoritative server completion time');
assert.match(seal, /VEHUIAH|Vehuiah/, 'Seal must preserve Vehuiah cycle context');
assert.match(seal, /FRAGMENTO I|Fragmento I/, 'Seal must keep Fragment I reserved');
assert.doesNotMatch(seal, /setIntention|setMirror/, 'Private plaintext must not be rendered or mutated in the final Seal presentation');

console.log('day001-final-seal-presentation: contract satisfied');
