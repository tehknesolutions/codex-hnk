import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { transliterationToGlyphIds, glyphIdsToIpa } from '../packages/hnk-glyphs/src/index.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const registryPath = path.join(root, 'docs/research/chromatic-genesis/data/cg-lexical-selections.v0.1.json');
const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
const fail = (message) => { throw new Error(`[CG lexical validation] ${message}`); };

if (!Array.isArray(registry.selections) || registry.selections.length !== 10) fail('expected exactly 10 semantic slots');

const selected = registry.selections.filter((entry) => entry.lexeme !== null);
if (selected.length !== 9) fail('expected exactly 9 selected lexemes');
if (new Set(selected.map((entry) => entry.lexeme)).size !== selected.length) fail('duplicate selected lexeme');

const e6 = registry.selections.find((entry) => entry.semanticId === 'CG-ENERGY-006');
if (!e6 || e6.lexeme !== null || e6.gateState !== 'HOLD_UNRESOLVED' || e6.authorityState !== 'UNRESOLVED') {
  fail('CG-ENERGY-006 must remain explicitly unresolved');
}

for (const entry of selected) {
  if (entry.authorityState !== 'HNK:CANDIDATE') fail(`${entry.semanticId} silently promoted beyond candidate`);
  const glyphIds = transliterationToGlyphIds(entry.lexeme, { strict: true });
  if (JSON.stringify(glyphIds) !== JSON.stringify(entry.glyphIds)) fail(`${entry.lexeme} G-ID sequence drift`);
  const ipa = `/${glyphIdsToIpa(glyphIds)}/`;
  if (ipa !== entry.ipa) fail(`${entry.lexeme} IPA drift: registry=${entry.ipa} runtime=${ipa}`);
}

const solenu = selected.find((entry) => entry.lexeme === 'SOLENU');
const malora = selected.find((entry) => entry.lexeme === 'MALORA');
if (!solenu?.reviewFlags?.includes('EXTERNAL_LANGUAGE_RESONANCE_REVIEW')) fail('SOLENU review flag missing');
if (!malora?.reviewFlags?.includes('KABBALISTIC_OR_EXTERNAL_TERM_RESONANCE_REVIEW')) fail('MALORA review flag missing');
if (!Array.isArray(registry.provenance) || registry.provenance.length < 3) fail('insufficient provenance pointers');

console.log(JSON.stringify({
  status: 'PASS',
  semanticSlots: registry.selections.length,
  selectedLexemes: selected.length,
  unresolved: [e6.semanticId],
  strictEncodingValidated: selected.map((entry) => entry.lexeme),
  canonicalAutopromotion: false
}, null, 2));
