import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const canonRoot = path.join(root, 'content/canon/atziluth');
const candidateRoot = path.join(root, 'content/promotion-candidates/atziluth');
const expectedTargets = [137, 72, 26, 137, 72, 26, 137, 72, 26];
const wordTokens = (text) => text.match(/[\p{L}\p{N}]+(?:[-’'][\p{L}\p{N}]+)*/gu) ?? [];

const walk = (directory) => {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(absolute) : [absolute];
  });
};

const gitBlobSha = (buffer) => {
  const header = Buffer.from(`blob ${buffer.length}\0`);
  return crypto.createHash('sha1').update(header).update(buffer).digest('hex');
};

const normalizeCanonToCandidate = (canonSource) => {
  const statusNormalized = canonSource.replace(/\nstatus:\s*canon\s*\n/, '\nstatus: draft\n');
  return statusNormalized.replace(
    /<!-- CANONICAL SUCCESSOR · source plan SHA-256: ([a-f0-9]{64}) · staging blob: ([a-f0-9]{40}) -->/,
    '<!-- DRAFT ONLY · source plan SHA-256: $1 -->',
  );
};

const files = walk(canonRoot).filter((file) => /^dia-\d{3}\.md$/.test(path.basename(file))).sort();
if (files.length === 0) {
  console.log('PASS CANON · no canonical successor files yet');
  process.exit(0);
}

let failed = 0;
const check = (label, ok) => {
  console.log(`${ok ? 'PASS' : 'FAIL'} CANON · ${label}`);
  if (!ok) failed += 1;
};

for (const canonPath of files) {
  const rel = path.relative(canonRoot, canonPath).replaceAll('\\', '/');
  const candidatePath = path.join(candidateRoot, rel);
  check(`${rel} has promotion candidate`, fs.existsSync(candidatePath));
  if (!fs.existsSync(candidatePath)) continue;

  const canonBuffer = fs.readFileSync(canonPath);
  const candidateBuffer = fs.readFileSync(candidatePath);
  const canon = canonBuffer.toString('utf8');
  const candidate = candidateBuffer.toString('utf8');
  const candidateBlob = gitBlobSha(candidateBuffer);

  check(`${rel} status canon`, /\nstatus:\s*canon\s*\n/.test(canon) && !/\nstatus:\s*draft\s*\n/.test(canon));
  check(`${rel} canonical provenance marker`, canon.includes(`staging blob: ${candidateBlob}`));
  check(`${rel} only allowed metadata differs from candidate`, normalizeCanonToCandidate(canon) === candidate);

  const blockRegex = /<!-- HNK:COUNT START ([^\s]+) target=(\d+) -->([\s\S]*?)<!-- HNK:COUNT END -->/g;
  const blocks = [...canon.matchAll(blockRegex)];
  check(`${rel} nine count blocks`, blocks.length === 9);
  if (blocks.length === 9) {
    const declared = blocks.map((match) => Number(match[2]));
    const actual = blocks.map((match) => wordTokens(match[3]).length);
    check(`${rel} declares 137/72/26 × 3`, declared.every((value, index) => value === expectedTargets[index]));
    check(`${rel} exact 137/72/26 × 3`, actual.every((value, index) => value === expectedTargets[index]));
  }
}

if (failed) process.exit(1);
console.log(`PASS CANON · ${files.length} canonical successor Day(s) differ from reviewed candidates only by approved canonical metadata`);
