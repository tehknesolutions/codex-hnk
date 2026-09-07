import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const base = path.join(root, "docs", "experience", "kether", "day-001");
const fail = (message) => {
  console.error(`DAY001 EDITORIAL FAIL: ${message}`);
  process.exitCode = 1;
};
const json = (name) => JSON.parse(fs.readFileSync(path.join(base, name), "utf8"));
const countWords = (text) => (text.match(/[\p{L}\p{N}]+(?:[-'’][\p{L}\p{N}]+)*/gu) ?? []).length;

const editorial = json("day-001.editorial-reconciliation.json");
const pack = json("day-001.quest-pack.json");
const draft = fs.readFileSync(path.join(root, "docs", "editorial-drafts", "DAY001_CANONICAL_AMENDMENT_V1.md"), "utf8");

if (editorial.quest_definition_id !== "HNK-KETHER-D001-V2") fail("quest id drift");
if (editorial.canonical_source?.git_blob_sha1 !== "a01d13b43cbddb92236fc1e3b6c2a7e140d87d29") fail("canonical source SHA drift");
if (editorial.canonical_source?.counted_core_words !== 705) fail("canonical core must remain 705 words");
if (editorial.universal_entry?.state !== "RESOLVED_PRODUCT_LAYER") fail("Universal Entry product reconciliation drift");
if (editorial.universal_entry?.canonical_source_change_required !== false) fail("Universal Entry must not require counted-core rewrite");
if (editorial.middle_voice_ordalia?.state !== "CANONICAL_AMENDMENT_PREPARED_SOURCE_WRITE_PENDING") fail("voice amendment state drift");
if (editorial.middle_voice_ordalia?.target_words !== 26) fail("Middle Ordalia target must remain 26 words");
const replacement = editorial.middle_voice_ordalia?.replacement_26_words ?? "";
if (countWords(replacement) !== 26) fail(`replacement must count to 26 words, got ${countWords(replacement)}`);
if (editorial.middle_voice_ordalia?.product_invariants?.voice_recording_required !== false) fail("recording must remain optional");
if (editorial.middle_voice_ordalia?.product_invariants?.day001_first_completion_xp !== 150) fail("Day001 XP invariant drift");
if (editorial.middle_voice_ordalia?.product_invariants?.extra_xp_for_recording !== 0) fail("recording must not grant XP");
if (!draft.includes(replacement)) fail("canonical amendment draft does not contain frozen replacement");

const blockers = new Set(pack.blockers.map((entry) => entry.id));
if (blockers.has("EDITORIAL-001-UNIVERSAL-ENTRY")) fail("resolved Universal Entry blocker still present");
if (!blockers.has("EDITORIAL-001-VOICE")) fail("voice blocker must remain until canonical source write");
if (pack.editorial_reconciliation?.universal_entry !== "RESOLVED_PRODUCT_LAYER") fail("Quest Pack Universal Entry state drift");
if (pack.editorial_reconciliation?.voice_ordalia !== "CANONICAL_AMENDMENT_PREPARED_SOURCE_WRITE_PENDING") fail("Quest Pack voice state drift");

if (!process.exitCode) console.log("DAY001 EDITORIAL PASS (Universal Entry resolved; 26-word voice amendment prepared, source write pending)");
