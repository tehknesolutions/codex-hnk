import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const base = path.join(root, "docs", "experience", "kether", "day-001");
const quest = JSON.parse(fs.readFileSync(path.join(base, "day-001.quest.json"), "utf8"));
const profile = JSON.parse(fs.readFileSync(path.join(base, "day-001.renderer-profile.json"), "utf8"));

const errors = [];
const fail = (message) => errors.push(message);

if (profile.quest_definition_id !== quest.id) fail("renderer profile quest id mismatch");

const phaseTypes = new Set(quest.phases.map((phase) => phase.type));
for (const type of phaseTypes) {
  if (!profile.phase_renderers?.[type]) fail(`missing renderer for phase type ${type}`);
}

const completion = quest.phases.find((phase) => phase.type === "COMPLETION");
if (!completion) fail("completion phase missing");
if (profile.phase_renderers?.COMPLETION !== "CompletionBoundaryScene") {
  fail("completion must use CompletionBoundaryScene");
}
if (profile.policies?.completion?.client_may_award_xp !== false) {
  fail("client must never award XP");
}
if (profile.policies?.completion?.client_may_mark_complete_directly !== false) {
  fail("client must never mark canonical completion directly");
}
if (profile.policies?.completion?.requires_server_confirmation !== true) {
  fail("server confirmation is required for completion");
}

const voice = quest.phases.find((phase) => phase.type === "VOICE");
if (voice?.interaction?.recording_optional !== true) fail("quest voice recording must be optional");
if (profile.policies?.voice?.microphone_required !== false) fail("renderer must support voice without microphone");

const pendingAudio = quest.phases.find((phase) => phase.id === "qr_theta_432");
if (pendingAudio?.audio?.production_enabled !== false) fail("pending Theta/432 must remain disabled");
if (pendingAudio?.required_for_completion !== false) fail("pending Theta/432 must remain non-blocking");

if (profile.policies?.accessibility?.reduced_motion_required !== true) {
  fail("reduced-motion renderer policy required");
}
if (profile.policies?.accessibility?.stop_control_required_for_practice !== true) {
  fail("practice renderers must expose stop control");
}

for (const requiredId of ["kether_reveal", "jachin_practice", "soul_mirror", "first_spark"]) {
  if (!profile.signature_moments?.[requiredId]) fail(`signature moment missing: ${requiredId}`);
}

if (errors.length) {
  for (const error of errors) console.error(`DAY001 RENDERER FAIL: ${error}`);
  process.exit(1);
}
console.log("DAY001 RENDERER PASS");
