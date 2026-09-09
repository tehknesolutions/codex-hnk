import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));
const adapter = readFileSync(new URL('./src/runtime/HnkGlyph.tsx', import.meta.url), 'utf8');
const proof = readFileSync(new URL('./src/app/hnk40.tsx', import.meta.url), 'utf8');

test('Expo binds to shared HNK40 runtime through SvgXml', () => {
  assert.equal(pkg.dependencies['@hnk/glyphs'], 'workspace:*');
  assert.equal(pkg.dependencies['react-native-svg'], '15.15.4');
  assert.match(adapter, /from '@hnk\/glyphs'/);
  assert.match(adapter, /from 'react-native-svg'/);
  assert.match(adapter, /SvgXml/);
  assert.match(adapter, /getGlyphSvg/);
  assert.match(adapter, /transliterationToGlyphIds/);
  assert.doesNotMatch(adapter, /<Path\b|<Polyline\b|const\s+IPA\s*=|G01.*G40/s);
});

test('Expo proof surface consumes shared master lexicon', () => {
  assert.equal(pkg.dependencies['@hnk/linguas'], 'workspace:*');
  assert.match(proof, /from '@hnk\/linguas'/);
  assert.match(proof, /HNK_MASTER_LEXICON/);
  assert.match(proof, /HNK_MASTER_PHRASES/);
  assert.doesNotMatch(proof, /const\s+RECOVERED_EXAMPLES/);
});

test('Expo registry rendering uses audited G-ID sequences instead of retransliteration', () => {
  assert.match(adapter, /HnkGlyphSequence/);
  assert.match(proof, /HnkGlyphSequence/);
  assert.match(proof, /glyphIds=\{entry\.glyphIds\}/);
  assert.match(proof, /glyphIds=\{phrase\.glyphIds\}/);
  assert.doesNotMatch(proof, /HnkWord\s+transliteration=\{entry\.transliteration\}/);
  assert.match(proof, /HnkSacred10x4/);
  assert.match(proof, /PREPRODUCTION|HNK40_STATUS/);
});
