import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const base = path.join(root, "docs", "experience", "kether", "day-001");

const read = (name) => JSON.parse(fs.readFileSync(path.join(base, name), "utf8"));
const quest = read("day-001.quest.json");
const evidence = read("day-001.evidence.schema.json");
const completion = read("day-001.completion.schema.json");

const fail = (message) => {
  console.error(`DAY001 CONTRACT FAIL: ${message}`);
  process.exitCode = 1;
};

if (quest.id !== "HNK-KETHER-D001-V2") fail("unexpected quest id");
if (quest.canonical?.xp !== 150) fail("canonical XP must be 150");
if (quest.canonical?.source_sha !== evidence.properties?.source_sha?.const) fail("source SHA mismatch");
if (completion.properties?.quest_definition_id?.const !== quest.id) fail("completion quest id mismatch");
if (completion.properties?.completion_contract_id?.const !== "HNK-KETHER-D001-COMP-V2") {
  fail("unexpected completion contract id");
}

const phases = new Map(quest.phases.map((phase) => [phase.id, phase]));
for (const required of [
  "jachin_practice",
  "ritual_tone_528",
  "jachin_return",
  "boaz_practice",
  "boaz_ordalia",
  "boaz_return",
  "middle_voice_practice",
  "middle_return",
  "soul_mirror",
  "completion",
]) {
  if (!phases.get(required)?.required_for_completion) fail(`${required} must be required`);
}

if (phases.get("qr_theta_432")?.audio?.production_enabled !== false) {
  fail("Theta/432 must remain production-disabled until mapping is approved");
}
if (phases.get("qr_theta_432")?.audio?.binaural_difference_hz !== null) {
  fail("Theta/432 difference must remain null until approved");
}
if (phases.get("middle_voice_practice")?.interaction?.recording_optional !== true) {
  fail("voice recording must remain optional");
}
if (evidence.properties?.boaz?.properties?.environment_distractions_count?.minimum !== 3) {
  fail("Boaz must require three distractions in structured evidence");
}

if (!process.exitCode) console.log("DAY001 CONTRACT PASS");
