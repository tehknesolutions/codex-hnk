import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const draftRoot = path.join(root, 'content/editorial/chokmah-drafts');

if (!fs.existsSync(draftRoot)) {
  console.log('PASS EDITORIAL · no Chokmah draft directory yet');
  process.exit(0);
}

const files = fs.readdirSync(draftRoot).filter((name) => /^dia-\d{3}\.md$/.test(name)).sort();
const wordTokens = (text) => text.match(/[\p{L}\p{N}]+(?:[-’'][\p{L}\p{N}]+)*/gu) ?? [];
const expectedTargets = [137, 72, 26, 137, 72, 26, 137, 72, 26];
let failed = 0;

for (const name of files) {
  const source = fs.readFileSync(path.join(draftRoot, name), 'utf8');
  const checks = [];
  const day = Number(name.slice(4, 7));

  checks.push(['Chokmah day range', day >= 40 && day <= 73]);
  checks.push(['draft status only', /\nstatus:\s*draft\s*\n/.test(source) && !/\nstatus:\s*canon\s*\n/.test(source)]);
  checks.push(['chapter 2 / Chokmah / Atziluth / level 2', /\nchapter:\s*2\s*\n/.test(source) && /\nsephira:\s*Chokmah\s*\n/.test(source) && /\nworld:\s*Atziluth\s*\n/.test(source) && /\nlevel:\s*2\s*\n/.test(source)]);
  checks.push(['HNK-EP-1.1', /\nepistemic_protocol:\s*HNK-EP-1\.1\s*\n/.test(source) && source.includes('REGRA HNK-EP-1.1')]);
  checks.push(['target_words 705', /\ntarget_words:\s*705\s*\n/.test(source)]);
  checks.push(['source plan provenance', source.includes('49917dc66e8401d17d3af362d2370bf532e7388145b6d481bae18d48e95cac59')]);

  const blockRegex = /<!-- HNK:COUNT START ([^\s]+) target=(\d+) -->([\s\S]*?)<!-- HNK:COUNT END -->/g;
  const blocks = [...source.matchAll(blockRegex)];
  checks.push(['nine counted blocks', blocks.length === 9]);

  if (blocks.length === 9) {
    const declared = blocks.map((match) => Number(match[2]));
    checks.push(['137/72/26 × 3 target order', declared.every((value, index) => value === expectedTargets[index])]);
    const actual = blocks.map((match) => wordTokens(match[3]).length);
    checks.push(['exact counted words', actual.every((value, index) => value === expectedTargets[index])]);
  }

  for (const [label, ok] of checks) {
    console.log(`${ok ? 'PASS' : 'FAIL'} EDITORIAL ${name} · ${label}`);
    if (!ok) failed += 1;
  }
}

if (failed) process.exit(1);
console.log(`PASS EDITORIAL · ${files.length} Chokmah draft(s) structurally valid`);
