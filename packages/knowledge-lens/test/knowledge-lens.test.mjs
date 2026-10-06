import test from 'node:test';
import assert from 'node:assert/strict';
import { projectKnowledgeLens } from '../src/index.mjs';

test('projects KETHER structural context but leaves unbound knowledge unavailable', () => {
  const projection = projectKnowledgeLens({ level_id: 'keter' });
  assert.equal(projection.subject.level_id, 'keter'); assert.equal(projection.subject.label, 'KETHER'); assert.equal(projection.subject.executable_days, 36);
  assert.equal(projection.canon.status, 'UNAVAILABLE'); assert.equal(projection.claims.status, 'UNAVAILABLE'); assert.equal(projection.evidence.status, 'UNAVAILABLE'); assert.equal(projection.correspondences.status, 'UNAVAILABLE');
  assert.equal(projection.evidence.truth_assessed, false); assert.equal(projection.evidence.causal_claim_permitted, false); assert.equal(projection.evidence.metaphysical_proof_permitted, false);
  assert.ok(projection.limitations.includes('NO_CONFIRMED_CANON_BINDING')); assert.ok(projection.limitations.includes('NO_CONFIRMED_CORRESPONDENCE_BINDING'));
});

test('fails closed for an unknown level id', () => {
  const projection = projectKnowledgeLens({ level_id: 'unknown-level' });
  assert.equal(projection.subject.level_id, null); assert.equal(projection.subject.executable_days, 0); assert.equal(projection.canon.status, 'UNAVAILABLE'); assert.equal(projection.correspondences.status, 'UNAVAILABLE'); assert.ok(projection.limitations.includes('UNKNOWN_TREE_LEVEL'));
});

test('does not query a correspondence registry without an explicit binding', () => {
  let queried=false; const registry={validate:()=>({ok:true,issues:[]}),query:()=>{queried=true;return[]},conflicts:()=>[],coverage:()=>({gaps:[]})};
  const projection=projectKnowledgeLens({level_id:'keter',correspondence_registry:registry,bindings:{}}); assert.equal(queried,false); assert.equal(projection.correspondences.status,'UNAVAILABLE'); assert.ok(projection.limitations.includes('NO_CONFIRMED_CORRESPONDENCE_BINDING'));
});

test('projects only an explicit correspondence subject binding', () => {
  const registry={validate:()=>({ok:true,issues:[]}),query:({subject_id})=>subject_id==='VERIFIED_SUBJECT'?[{id:'R1',subject_id,domain:'ELEMENT',tradition_id:'T1'},{id:'R2',subject_id,domain:'PLANET',tradition_id:'T2'}]:[],conflicts:()=>[],coverage:()=>({gaps:[]})};
  const projection=projectKnowledgeLens({level_id:'keter',correspondence_registry:registry,bindings:{keter:{correspondence_subject_id:'VERIFIED_SUBJECT'}}});
  assert.equal(projection.correspondences.status,'CONFIRMED'); assert.equal(projection.correspondences.record_count,2); assert.deepEqual(projection.correspondences.domains,['ELEMENT','PLANET']); assert.deepEqual(projection.correspondences.traditions,['T1','T2']); assert.equal(projection.limitations.includes('NO_CONFIRMED_CORRESPONDENCE_BINDING'),false);
});

test('invalid registry validation can never become confirmed', () => {
  const registry={validate:()=>({ok:false,issues:['BROKEN_DATASET']}),query:()=>[{id:'R1',domain:'ELEMENT',tradition_id:'T1'}],conflicts:()=>[],coverage:()=>({gaps:[]})};
  const projection=projectKnowledgeLens({level_id:'keter',correspondence_registry:registry,bindings:{keter:{correspondence_subject_id:'VERIFIED_SUBJECT'}}}); assert.notEqual(projection.correspondences.status,'CONFIRMED'); assert.ok(projection.limitations.includes('CORRESPONDENCE_REGISTRY_INVALID'));
});

test('preserves correspondence gaps and conflicts', () => {
  const registry={validate:()=>({ok:true,issues:[]}),query:()=>[{id:'R1',domain:'ELEMENT',tradition_id:'T1'}],conflicts:()=>[{id:'C1',reason:'traditions disagree'}],coverage:()=>({gaps:[{id:'G1',reason:'missing source'}]})};
  const projection=projectKnowledgeLens({level_id:'keter',correspondence_registry:registry,bindings:{keter:{correspondence_subject_id:'VERIFIED_SUBJECT'}}}); assert.equal(projection.correspondences.status,'UNRESOLVED'); assert.deepEqual(projection.correspondences.gaps,['missing source']); assert.deepEqual(projection.correspondences.conflicts,['traditions disagree']);
});

test('projects validated claim dossier while preserving gaps conflicts and no truth inference', () => {
  const dossier={claim_id:'CLAIM-1',statement:'A bounded exploratory statement',scope:'EXPLORATORY_INTERPRETATION',gaps:['missing replication'],conflicts:['source disagreement'],evidence_links:[{relation:'CONSISTENT_WITH'}],automatic_truth_inference:false,automatic_canon_promotion:false,causal_claim_permitted:false,metaphysical_proof_permitted:false};
  const projection=projectKnowledgeLens({level_id:'keter',bindings:{keter:{claim_ids:['CLAIM-1']}},claim_dossiers:[dossier],validate_claim_dossier:()=>({ok:true,issues:[]})});
  assert.equal(projection.claims.status,'UNRESOLVED'); assert.equal(projection.claims.count,1); assert.equal(projection.claims.items[0].statement,dossier.statement); assert.deepEqual(projection.claims.items[0].gaps,['missing replication']); assert.deepEqual(projection.claims.items[0].conflicts,['source disagreement']); assert.notEqual(projection.claims.items[0].status,'CONFIRMED');
});

test('CONSISTENT_WITH never becomes truth or canon promotion', () => {
  const dossier={claim_id:'CLAIM-2',statement:'Consistent evidence is not proof',scope:'DESCRIPTIVE',gaps:[],conflicts:[],evidence_links:[{relation:'CONSISTENT_WITH'}],automatic_truth_inference:false,automatic_canon_promotion:false,causal_claim_permitted:false,metaphysical_proof_permitted:false};
  const projection=projectKnowledgeLens({level_id:'keter',bindings:{keter:{claim_ids:['CLAIM-2']}},claim_dossiers:[dossier],validate_claim_dossier:()=>({ok:true,issues:[]})});
  assert.equal(projection.claims.items[0].truth_assessed,false); assert.equal(projection.claims.items[0].canon_promotion_permitted,false); assert.equal(projection.claims.items[0].causal_claim_permitted,false); assert.equal(projection.claims.items[0].metaphysical_proof_permitted,false);
});

test('projects evidence coverage but keeps epistemic safety booleans false', () => {
  const evaluation={claim_id:'EVIDENCE-CLAIM-1',coverage_status:'COMPLETE_FOR_DECLARED_REQUIREMENTS',evidence_count:8,missing_requirements:[],truth_assessed:false,causal_claim_permitted:false,metaphysical_proof_permitted:false};
  const projection=projectKnowledgeLens({level_id:'keter',bindings:{keter:{evidence_claim_id:'EVIDENCE-CLAIM-1'}},evidence_evaluations:[evaluation]});
  assert.equal(projection.evidence.status,'CONFIRMED'); assert.equal(projection.evidence.coverage_label,'COMPLETE_FOR_DECLARED_REQUIREMENTS'); assert.equal(projection.evidence.evidence_count,8); assert.equal(projection.evidence.truth_assessed,false); assert.equal(projection.evidence.causal_claim_permitted,false); assert.equal(projection.evidence.metaphysical_proof_permitted,false);
});

test('partial or malformed evidence cannot become confirmed', () => {
  const partial={claim_id:'E1',coverage_status:'PARTIAL',evidence_count:2,missing_requirements:['REPORT_PRESENT'],truth_assessed:false,causal_claim_permitted:false,metaphysical_proof_permitted:false};
  const p1=projectKnowledgeLens({level_id:'keter',bindings:{keter:{evidence_claim_id:'E1'}},evidence_evaluations:[partial]}); assert.equal(p1.evidence.status,'PARTIAL'); assert.deepEqual(p1.evidence.missing_requirements,['REPORT_PRESENT']);
  const malformed={...partial,claim_id:'E2',coverage_status:'COMPLETE_FOR_DECLARED_REQUIREMENTS',truth_assessed:true};
  const p2=projectKnowledgeLens({level_id:'keter',bindings:{keter:{evidence_claim_id:'E2'}},evidence_evaluations:[malformed]}); assert.notEqual(p2.evidence.status,'CONFIRMED'); assert.ok(p2.limitations.includes('EVIDENCE_BOUNDARY_INVALID'));
});
