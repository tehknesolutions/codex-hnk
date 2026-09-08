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

test('web proof surface renders shared word and Sacred 10x4 adapters', () => {
  assert.match(proof, /HnkWord/);
  assert.match(proof, /HnkSacred10x4/);
  assert.match(proof, /PREPRODUCTION|HNK40_STATUS/);
});
