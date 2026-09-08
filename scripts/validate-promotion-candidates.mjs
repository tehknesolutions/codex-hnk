import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const candidateRoot = path.join(root, 'content/promotion-candidates/atziluth');
const reviewRoot = path.join(root, 'docs/editorial/promotions');
const expectedTargets = [137, 72, 26, 137, 72, 26, 137, 72, 26];
const wordTokens = (text) => text.match(/[\p{L}\p{N}]+(?:[-’'][\p{L}\p{N}]+)*/gu) ?? [];

const sha1Blob = (buffer) => {
  const header = Buffer.from(`blob ${buffer.length}\0`);
  return crypto.createHash('sha1').update(header).update(buffer).digest('hex');
};

const walk = (directory) => {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(absolute) : [absolute];
  });
};

const reviewCorpus = fs.existsSync(reviewRoot)
  ? walk(reviewRoot)
      .filter((file) => file.endsWith('.md'))
      .map((file) => fs.readFileSync(file, 'utf8'))
      .join('\n')
  : '';

const candidates = walk(candidateRoot).filter((file) => /^dia-\d{3}\.md$/.test(path.basename(file))).sort();

if (candidates.length === 0) {
  console.log('PASS PROMOTION · no candidates staged yet');
  process.exit(0);
}

let failed = 0;
const check = (label, ok) => {
  console.log(`${ok ? 'PASS' : 'FAIL'} PROMOTION · ${label}`);
  if (!ok) failed += 1;
};

for (const candidatePath of candidates) {
  const rel = path.relative(candidateRoot, candidatePath).replaceAll('\\', '/');
  const [sephira, filename] = rel.split('/');
  const day = Number(filename?.slice(4, 7));
  const stagingRoot = sephira === 'chokmah'
    ? path.join(root, 'content/editorial/chokmah-drafts')
    : sephira === 'binah'
      ? path.join(root, 'content/editorial/binah-drafts')
      : null;

  check(`${rel} known sephira`, Boolean(stagingRoot));
  if (!stagingRoot) continue;

  const stagingPath = path.join(stagingRoot, filename);
  check(`${rel} staging source exists`, fs.existsSync(stagingPath));
  if (!fs.existsSync(stagingPath)) continue;

  const candidate = fs.readFileSync(candidatePath);
  const staging = fs.readFileSync(stagingPath);
  const source = candidate.toString('utf8');
  const blobSha = sha1Blob(candidate);

  check(`${rel} byte-identical to staging`, candidate.equals(staging));
  check(`${rel} remains draft`, /\nstatus:\s*draft\s*\n/.test(source) && !/\nstatus:\s*canon\s*\n/.test(source));
  check(`${rel} review cites blob ${blobSha}`, reviewCorpus.includes(blobSha));
  check(`${rel} review identifies day ${day}`, reviewCorpus.includes(`Day ${String(day).padStart(3, '0')}`) || reviewCorpus.includes(`Day ${day}`) || reviewCorpus.includes(`Dia ${String(day).padStart(3, '0')}`));

  const blockRegex = /<!-- HNK:COUNT START ([^\s]+) target=(\d+) -->([\s\S]*?)<!-- HNK:COUNT END -->/g;
  const blocks = [...source.matchAll(blockRegex)];
  check(`${rel} has nine count blocks`, blocks.length === 9);
  if (blocks.length === 9) {
    const declared = blocks.map((match) => Number(match[2]));
    const actual = blocks.map((match) => wordTokens(match[3]).length);
    check(`${rel} declares 137/72/26 × 3`, declared.every((value, index) => value === expectedTargets[index]));
    check(`${rel} contains exact 137/72/26 × 3`, actual.every((value, index) => value === expectedTargets[index]));
  }
}

if (failed) process.exit(1);
console.log(`PASS PROMOTION · ${candidates.length} candidate(s) are immutable staging mirrors with review evidence`);
