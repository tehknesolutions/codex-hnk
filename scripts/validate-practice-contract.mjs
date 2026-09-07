import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const schema = JSON.parse(
  fs.readFileSync(
    path.join(root, "docs", "experience", "kether", "day-001", "day-001.evidence.schema.json"),
    "utf8",
  ),
);
const source = fs.readFileSync(
  path.join(root, "packages", "practice-contract", "src", "day001.ts"),
  "utf8",
);

const fail = (message) => {
  console.error(`PRACTICE CONTRACT FAIL: ${message}`);
  process.exitCode = 1;
};

const questId = schema.properties?.protocol_version?.const;
const sourceSha = schema.properties?.source_sha?.const;
const boazMinimum =
  schema.properties?.boaz?.properties?.environment_distractions_count?.minimum;

if (!questId || !source.includes(`"${questId}"`)) {
  fail("Day 001 protocol_version drift");
}
if (!sourceSha || !source.includes(`"${sourceSha}"`)) {
  fail("Day 001 source_sha drift");
}
if (boazMinimum !== 3 || !source.includes("environmentDistractionsCount < 3")) {
  fail("Boaz three-distraction contract drift");
}
if (!source.includes("voiceRecorded: boolean")) {
  fail("voice recording must remain optional input state");
}
if (!source.includes('throw new Error("encrypted_voice_ref_required")')) {
  fail("recorded voice must require encrypted ref");
}
if (/freeText|journalText|dreamText|prayerText|transcript/i.test(source)) {
  fail("practice evidence builder must not accept free private prose");
}

if (!process.exitCode) console.log("PRACTICE CONTRACT PASS");
