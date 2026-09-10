import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  HNK40_ENTRIES,
  HNK40_GLYPH_IDS,
  HNK40_STATUS,
} from '../src/index.mjs';

const matrixPath = fileURLToPath(new URL('../reference/HNK40_REFERENCE_MATRIX_V1.json', import.meta.url));
const matrix = JSON.parse(readFileSync(matrixPath, 'utf8'));

const SAFE_BY_GID = Object.freeze({
  G01:'A', G02:'E', G03:'I', G04:'O', G05:'U', G07:'H',
  G11:'M', G12:'N', G14:'L', G15:'R', G18:'B', G19:'D',
  G21:'P', G22:'T', G23:'K', G26:'S', G30:'TS', G31:'V',
  G32:'Z', G40:'Y',
});

const REFERENCE_LANGUAGES = [
  'hebrew_biblical',
  'greek_koine',
  'japanese_kana',
  'esperanto',
];

test('reference matrix remains a non-canonical 40-glyph scaffold', () => {
  assert.equal(matrix.matrix_id, 'HNK40-REFERENCE-MATRIX-V1');
  assert.equal(matrix.status, 'SCAFFOLD_NO_REFERENCE_EQUIVALENCE_CLAIMS');
  assert.equal(matrix.glyph_count, 40);
  assert.deepEqual(matrix.entries.map((entry) => entry.glyph_id), HNK40_GLYPH_IDS);
  assert.equal(HNK40_STATUS, 'PREPRODUCTION_NOT_OFFICIAL');
});

test('reference matrix mirrors runtime IPA, world, column and candidate PUA exactly', () => {
  for (let index = 0; index < HNK40_ENTRIES.length; index += 1) {
    const runtime = HNK40_ENTRIES[index];
    const entry = matrix.entries[index];
    assert.equal(entry.glyph_id, runtime.glyphId);
    assert.equal(entry.phoneme_ipa, runtime.phonemeIpa);
    assert.equal(entry.world_id, runtime.worldId);
    assert.equal(entry.protoglyph_column, runtime.protoglyphColumn);
    assert.equal(entry.candidate_pua, runtime.candidatePua);
    assert.equal(entry.digital.codepoint_decimal, runtime.candidatePuaDecimal);
    assert.equal(entry.digital.codepoint_hex, runtime.candidatePua.slice(2));
    assert.equal(entry.digital.codepoint_binary, runtime.candidatePuaDecimal.toString(2));
    assert.equal(entry.safe_transliteration, SAFE_BY_GID[runtime.glyphId] ?? null);
    assert.equal(entry.digital.ascii_transport, SAFE_BY_GID[runtime.glyphId] ?? null);
  }
});

test('reference-language cells stay unresolved until evidence is authored', () => {
  for (const entry of matrix.entries) {
    for (const language of REFERENCE_LANGUAGES) {
      assert.deepEqual(entry.reference_languages[language], {
        status: 'PENDING_RESEARCH',
        forms: [],
      });
    }
    assert.deepEqual(entry.symbolic_initiatic, {
      status: 'PENDING_SEPARATE_GOVERNANCE',
      correspondences: [],
    });
  }
});

test('matrix rules preserve linguistic, symbolic and encoding boundaries', () => {
  assert.ok(matrix.rules.includes('Phonetic similarity is not semantic equivalence.'));
  assert.ok(matrix.rules.includes('Symbolic/initiatic correspondence is recorded separately from linguistic evidence.'));
  assert.ok(matrix.rules.includes('ASCII, binary and hexadecimal are transport/encoding layers, not natural-language phonetic equivalents.'));
  assert.ok(matrix.rules.includes('Unresolved mappings remain PENDING_RESEARCH rather than guessed.'));
});
