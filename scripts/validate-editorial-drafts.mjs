import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const wordTokens = (text) => text.match(/[\p{L}\p{N}]+(?:[-’'][\p{L}\p{N}]+)*/gu) ?? [];
const expectedTargets = [137, 72, 26, 137, 72, 26, 137, 72, 26];

const stagingSets = [
  {
    label: 'Chokmah',
    directory: 'content/editorial/chokmah-drafts',
    dayMin: 40,
    dayMax: 73,
    chapter: 2,
    sephira: 'Chokmah',
    level: 2,
    planSha: '49917dc66e8401d17d3af362d2370bf532e7388145b6d481bae18d48e95cac59',
  },
  {
    label: 'Binah',
    directory: 'content/editorial/binah-drafts',
    dayMin: 74,
    dayMax: 109,
    chapter: 3,
    sephira: 'Binah',
    level: 3,
    planSha: '79cf5b61f0dfb0e67bcba0afcb4ec534e21d5303fc135b9638519022fdecd832',
  },
];

let failed = 0;
let totalFiles = 0;

for (const config of stagingSets) {
  const draftRoot = path.join(root, config.directory);
  if (!fs.existsSync(draftRoot)) {
    console.log(`PASS EDITORIAL · no ${config.label} draft directory yet`);
    continue;
  }

  const files = fs.readdirSync(draftRoot).filter((name) => /^dia-\d{3}\.md$/.test(name)).sort();
  totalFiles += files.length;

  for (const name of files) {
    const source = fs.readFileSync(path.join(draftRoot, name), 'utf8');
    const checks = [];
    const day = Number(name.slice(4, 7));

    checks.push([`${config.label} day range`, day >= config.dayMin && day <= config.dayMax]);
    checks.push(['frontmatter day matches filename', new RegExp(`\\nday:\\s*${day}\\s*\\n`).test(source) && new RegExp(`\\npage:\\s*${day}\\s*\\n`).test(source)]);
    checks.push(['draft status only', /\nstatus:\s*draft\s*\n/.test(source) && !/\nstatus:\s*canon\s*\n/.test(source)]);
    checks.push([
      `chapter ${config.chapter} / ${config.sephira} / Atziluth / level ${config.level}`,
      new RegExp(`\\nchapter:\\s*${config.chapter}\\s*\\n`).test(source)
        && new RegExp(`\\nsephira:\\s*${config.sephira}\\s*\\n`).test(source)
        && /\nworld:\s*Atziluth\s*\n/.test(source)
        && new RegExp(`\\nlevel:\\s*${config.level}\\s*\\n`).test(source),
    ]);
    checks.push(['HNK-EP-1.1', /\nepistemic_protocol:\s*HNK-EP-1\.1\s*\n/.test(source) && source.includes('REGRA HNK-EP-1.1')]);
    checks.push(['target_words 705', /\ntarget_words:\s*705\s*\n/.test(source)]);
    checks.push(['source plan provenance', source.includes(config.planSha)]);

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
      console.log(`${ok ? 'PASS' : 'FAIL'} EDITORIAL ${config.label} ${name} · ${label}`);
      if (!ok) failed += 1;
    }
  }

  console.log(`PASS EDITORIAL · ${files.length} ${config.label} draft(s) inspected`);
}

if (failed) process.exit(1);
console.log(`PASS EDITORIAL · ${totalFiles} staged Atziluth draft(s) structurally valid`);
