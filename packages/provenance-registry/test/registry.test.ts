import assert from "node:assert/strict";
import test from "node:test";
import { m7ProvenanceRegistry } from "../src/index.js";

test("registry validates",()=>assert.equal(m7ProvenanceRegistry.validate().ok,true));
test("preserves Beth conflict across traditions",()=>{
  const trace=m7ProvenanceRegistry.trace("HEBREW_BETH");
  assert.equal(trace.records.length,2);
  assert.deepEqual(new Set(trace.records.map(r=>r.claim)),new Set(["Consulted reference text maps Beth to Saturn; recension-sensitive.","Golden Dawn lineage maps Beth to Mercury."]));
});
test("keeps source-derived candidates separate from canon",()=>{
  assert.equal(m7ProvenanceRegistry.query({authority:"SOURCE_DERIVED"})[0]?.status,"CANDIDATE");
  assert.equal(m7ProvenanceRegistry.query({authority:"CANON"}).every(r=>r.evidence_scope==="CANON_APPROVED"),true);
});
