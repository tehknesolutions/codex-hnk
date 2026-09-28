import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('./Day001GoldenV2Web.tsx', import.meta.url), 'utf8');
assert.match(source, /import artStyles from ['"]\.\/day001-art-pass-v2\.module\.css['"]/);
assert.match(source, /<div className=\{artStyles\.artPass\}>/);
assert.match(source, /<main className=\{styles\.shell\} data-hnk-theme="kether">/);
assert.match(source, /<\/main><\/div>;/);
console.log('PASS: Day 001 Golden V2 mounts the Art Pass without replacing the runtime.');
