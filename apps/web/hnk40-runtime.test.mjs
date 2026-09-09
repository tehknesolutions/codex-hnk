import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));
const adapter = readFileSync(new URL('./app/_runtime/HnkGlyph.tsx', import.meta.url), 'utf8');
const proof = readFileSync(new URL('./app/hnk40/page.tsx', import.meta.url), 'utf8');

test('web binds to @hnk/glyphs instead of duplicating the alphabet', () => {
  assert.equal(pkg.dependencies['@hnk/glyphs'], 'workspace:*');
  assert.match(adapter, /from '@hnk\/glyphs'/);
  assert.match(adapter, /getGlyphSvg/);
  assert.match(adapter, /transliterationToGlyphIds/);
  assert.doesNotMatch(adapter, /<path\b|<polyline\b|const\s+IPA\s*=|G01.*G40/s);
});

test('web proof surface consumes shared master lexicon', () => {
  assert.equal(pkg.dependencies['@hnk/linguas'], 'workspace:*');
  assert.match(proof, /from '@hnk\/linguas'/);
  assert.match(proof, /HNK_MASTER_LEXICON/);
  assert.match(proof, /HNK_MASTER_PHRASES/);
  assert.doesNotMatch(proof, /const\s+RECOVERED_EXAMPLES/);
});

test('web registry rendering uses audited G-ID sequences instead of retransliteration', () => {
  assert.match(adapter, /HnkGlyphSequence/);
  assert.match(proof, /HnkGlyphSequence/);
  assert.match(proof, /glyphIds=\{entry\.glyphIds\}/);
  assert.match(proof, /glyphIds=\{phrase\.glyphIds\}/);
  assert.doesNotMatch(proof, /HnkWord\s+transliteration=\{entry\.transliteration\}/);
  assert.match(proof, /HnkSacred10x4/);
  assert.match(proof, /PREPRODUCTION|HNK40_STATUS/);
});
