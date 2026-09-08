import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const expectedTargets = [137, 72, 26, 137, 72, 26, 137, 72, 26];
const wordTokens = (text) => text.match(/[\p{L}\p{N}]+(?:[-’'][\p{L}\p{N}]+)*/gu) ?? [];

function die(message) {
  console.error(`PROMOTION BLOCKED · ${message}`);
  process.exit(1);
}

function gitBlobSha(buffer) {
  const header = Buffer.from(`blob ${buffer.length}\0`);
  return crypto.createHash('sha1').update(header).update(buffer).digest('hex');
}

function parseArgs(argv) {
  const result = { write: false, days: [], sephira: '', review: '', expectedSourcePlanSha: '' };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--write') result.write = true;
    else if (arg === '--sephira') result.sephira = argv[++i] ?? '';
    else if (arg === '--days') result.days = (argv[++i] ?? '').split(',').filter(Boolean).map((value) => Number(value));
    else if (arg === '--review') result.review = argv[++i] ?? '';
    else if (arg === '--source-plan-sha') result.expectedSourcePlanSha = argv[++i] ?? '';
    else die(`unknown argument ${arg}`);
  }
  return result;
}

function assertCountMatrix(source, label) {
  const blockRegex = /<!-- HNK:COUNT START ([^\s]+) target=(\d+) -->([\s\S]*?)<!-- HNK:COUNT END -->/g;
  const blocks = [...source.matchAll(blockRegex)];
  if (blocks.length !== 9) die(`${label}: expected nine HNK count blocks, got ${blocks.length}`);
  const declared = blocks.map((match) => Number(match[2]));
  const actual = blocks.map((match) => wordTokens(match[3]).length);
  if (!declared.every((value, index) => value === expectedTargets[index])) die(`${label}: declared matrix is not 137/72/26 ×3`);
  if (!actual.every((value, index) => value === expectedTargets[index])) die(`${label}: actual matrix is not 137/72/26 ×3 (${actual.join('/')})`);
}

function normalizeCanonToCandidate(canon) {
  return canon
    .replace(/\nstatus:\s*canon\s*\n/, '\nstatus: draft\n')
    .replace(
      /<!-- CANONICAL SUCCESSOR · source plan SHA-256: ([a-f0-9]{64}) · staging blob: ([a-f0-9]{40}) -->/,
      '<!-- DRAFT ONLY · source plan SHA-256: $1 -->',
    );
}

const args = parseArgs(process.argv.slice(2));
if (!['chokmah', 'binah', 'kether'].includes(args.sephira)) die('--sephira must be kether, chokmah or binah');
if (!args.days.length || args.days.some((day) => !Number.isInteger(day) || day < 1 || day > 109)) die('--days must be a comma-separated list inside 1..109');
if (!args.review) die('--review is required');
if (!/^[a-f0-9]{64}$/.test(args.expectedSourcePlanSha)) die('--source-plan-sha must be a SHA-256');

const reviewPath = path.resolve(root, args.review);
if (!reviewPath.startsWith(root + path.sep) || !fs.existsSync(reviewPath)) die('review document not found inside repository');
const review = fs.readFileSync(reviewPath, 'utf8');
if (!/PROMOTION CANDIDATE/.test(review)) die('review document is not a promotion candidate record');

const candidateRoot = path.join(root, 'content/promotion-candidates/atziluth', args.sephira);
const canonRoot = path.join(root, 'content/canon/atziluth', args.sephira);
if (!fs.existsSync(candidateRoot)) die(`candidate root missing: ${candidateRoot}`);
if (args.write) fs.mkdirSync(canonRoot, { recursive: true });

const results = [];
for (const day of args.days) {
  const padded = String(day).padStart(3, '0');
  const label = `${args.sephira}/dia-${padded}.md`;
  const candidatePath = path.join(candidateRoot, `dia-${padded}.md`);
  const canonPath = path.join(canonRoot, `dia-${padded}.md`);
  if (!fs.existsSync(candidatePath)) die(`${label}: candidate missing`);
  if (fs.existsSync(canonPath)) die(`${label}: canonical file already exists; no silent overwrite allowed`);

  const gateRow = new RegExp(`\\|\\s*${padded.replace(/^0+/, '')}\\s*\\|\\s*PASS\\s*\\|\\s*PASS\\s*\\|\\s*PASS\\s*\\|\\s*(?:PASS|N\\/A)\\s*\\|`);
  if (!gateRow.test(review)) die(`${label}: review matrix does not prove G1/G2/G3 PASS and G4 PASS/N/A`);

  const candidateBuffer = fs.readFileSync(candidatePath);
  const candidate = candidateBuffer.toString('utf8');
  if (!/\nstatus:\s*draft\s*\n/.test(candidate)) die(`${label}: candidate is not status draft`);
  if (/\nstatus:\s*canon\s*\n/.test(candidate)) die(`${label}: candidate already claims canon`);
  if (!candidate.includes('epistemic_protocol: HNK-EP-1.1')) die(`${label}: HNK-EP-1.1 missing`);
  assertCountMatrix(candidate, label);

  const draftMarker = candidate.match(/<!-- DRAFT ONLY · source plan SHA-256: ([a-f0-9]{64}) -->/);
  if (!draftMarker) die(`${label}: DRAFT provenance marker missing`);
  if (draftMarker[1] !== args.expectedSourcePlanSha) die(`${label}: source-plan SHA differs from approved input`);

  const candidateBlob = gitBlobSha(candidateBuffer);
  if (!review.includes(candidateBlob)) die(`${label}: candidate blob ${candidateBlob} not cited by review`);

  const canon = candidate
    .replace(/\nstatus:\s*draft\s*\n/, '\nstatus: canon\n')
    .replace(
      `<!-- DRAFT ONLY · source plan SHA-256: ${args.expectedSourcePlanSha} -->`,
      `<!-- CANONICAL SUCCESSOR · source plan SHA-256: ${args.expectedSourcePlanSha} · staging blob: ${candidateBlob} -->`,
    );

  if (normalizeCanonToCandidate(canon) !== candidate) die(`${label}: canonical transform changed content beyond approved metadata`);
  assertCountMatrix(canon, `${label} canon`);

  const canonBuffer = Buffer.from(canon, 'utf8');
  const canonicalBlob = gitBlobSha(canonBuffer);
  results.push({ day, candidateBlob, canonicalBlob, path: path.relative(root, canonPath).replaceAll('\\', '/') });

  if (args.write) fs.writeFileSync(canonPath, canonBuffer);
}

console.log(`${args.write ? 'WRITE' : 'DRY-RUN'} PROMOTION · ${results.length} Day(s)`);
for (const row of results) console.log(`DAY ${String(row.day).padStart(3, '0')} · ${row.candidateBlob} -> ${row.canonicalBlob} · ${row.path}`);
console.log('PROMOTION OK · no commit, DB sync, runtime enablement or release action was performed automatically');
