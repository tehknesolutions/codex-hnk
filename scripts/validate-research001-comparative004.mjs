import { readFile } from 'node:fs/promises';

const FILE = 'canon/references/research-001-kabbalah-hermetica/comparative-pass-004/comparison-matrix.json';
const EXPECTED_LETTERS = [
  'ALEPH','BETH','GIMEL','DALETH','HEH','VAV','ZAIN','CHETH','TETH','YOD','KAPH',
  'LAMED','MEM','NUN','SAMEKH','AYIN','PEH','TZADDI','QOPH','RESH','SHIN','TAV',
];

function fail(message) {
  console.error(`RESEARCH001_COMPARATIVE004_FAIL: ${message}`);
  process.exit(1);
}

function assertUniqueTrumpNumbers(rows, key) {
  const numbers = rows.map((row) => row[key].trump_number).sort((a, b) => a - b);
  const expected = Array.from({ length: 22 }, (_, i) => i);
  if (JSON.stringify(numbers) !== JSON.stringify(expected)) {
    fail(`${key} must contain every trump number 0..21 exactly once`);
  }
}

const matrix = JSON.parse(await readFile(FILE, 'utf8'));

if (matrix.canon_import !== 'NONE_AUTOMATIC') fail('canon_import must remain NONE_AUTOMATIC');
if (!Array.isArray(matrix.rows) || matrix.rows.length !== 22) fail('matrix must contain exactly 22 rows');

for (let i = 0; i < EXPECTED_LETTERS.length; i += 1) {
  const row = matrix.rows[i];
  if (row.letter !== EXPECTED_LETTERS[i]) fail(`letter order mismatch at position ${i + 1}`);
  if (row.letter_position !== i + 1) fail(`letter_position mismatch for ${row.letter}`);
}

assertUniqueTrumpNumbers(matrix.rows, 'levi');
assertUniqueTrumpNumbers(matrix.rows, 'golden_dawn');
assertUniqueTrumpNumbers(matrix.rows, 'thoth');

const byLetter = Object.fromEntries(matrix.rows.map((row) => [row.letter, row]));

if (byLetter.ALEPH.levi.trump_number !== 1 || byLetter.SHIN.levi.trump_number !== 0) {
  fail('Lévi fingerprint mismatch: expected Aleph=I and Shin=0/Fool');
}

if (byLetter.ALEPH.golden_dawn.trump_number !== 0) {
  fail('Golden Dawn fingerprint mismatch: expected Aleph=0/Fool');
}

if (byLetter.TETH.golden_dawn.trump_number !== 11 || byLetter.LAMED.golden_dawn.trump_number !== 8) {
  fail('Golden Dawn Strength/Justice interchange fingerprint mismatch');
}

if (byLetter.HEH.golden_dawn.trump_number !== 4 || byLetter.TZADDI.golden_dawn.trump_number !== 17) {
  fail('Golden Dawn Heh/Tzaddi mapping mismatch');
}

if (byLetter.HEH.thoth.trump_number !== 17 || byLetter.TZADDI.thoth.trump_number !== 4) {
  fail('Thoth Heh/Tzaddi counterchange fingerprint mismatch');
}

console.log('RESEARCH001_COMPARATIVE004_PASS rows=22 systems=3 canon_import=NONE_AUTOMATIC');
