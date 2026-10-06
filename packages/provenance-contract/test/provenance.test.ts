import assert from "node:assert/strict";
import test from "node:test";
import { queryProvenance, traceProvenance, validateProvenanceRecord, type ProvenanceRecord } from "../src/index.js";

const canon: ProvenanceRecord = {
  id:"P-CANON-001", subject_id:"HNK_RESEARCH_001", label:"Research 001", domain:"CANON",
  authority:"CANON", status:"CANON", origin:"CANON_CORE", evidence_scope:"CANON_APPROVED",
  source:{id:"CANON-RESEARCH-001",title:"research-001-symbolic-architecture-v1.json"}
};
const reference: ProvenanceRecord = {
  id:"P-REF-001", subject_id:"HEBREW_BETH", label:"Beth → Saturn", domain:"PLANET",
  authority:"HISTORICAL_REFERENCE", status:"REFERENCE", origin:"HISTORICAL_SOURCE", evidence_scope:"SOURCE_SCOPED",
  source:{id:"SRC-SY-REFERENCE-A",title:"Sefer Yetzirah"}
};

test("validates canon authority boundaries",()=>assert.deepEqual(validateProvenanceRecord(canon),[]));
test("rejects canon without canon-approved scope",()=>assert.equal(validateProvenanceRecord({...canon,evidence_scope:"SOURCE_SCOPED"}).some(i=>i.code==="INVALID_CANON_SCOPE"),true));
test("queries without collapsing authority",()=>assert.deepEqual(queryProvenance([canon,reference],{authority:"HISTORICAL_REFERENCE"}).map(r=>r.id),["P-REF-001"]));
test("traces source identity",()=>assert.deepEqual(traceProvenance([canon,reference],"HEBREW_BETH").source_ids,["SRC-SY-REFERENCE-A"]));
