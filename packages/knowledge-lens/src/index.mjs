import { getExecutableDays, hnkTreeLevels } from '../../visual-contract/src/tree.mjs';
import { VERIFIED_KNOWLEDGE_LENS_BINDINGS, correspondenceSubjectBinding } from './bindings.mjs';

const freezeStrings=(values)=>Object.freeze([...new Set(values.filter(Boolean))].sort());
const reasonStrings=(values=[])=>freezeStrings(values.map((item)=>typeof item==='string'?item:item?.reason??item?.id));
const unavailableEvidence=()=>Object.freeze({status:'UNAVAILABLE',coverage_label:null,evidence_count:0,missing_requirements:Object.freeze([]),truth_assessed:false,causal_claim_permitted:false,metaphysical_proof_permitted:false});
const unavailableCorrespondences=()=>Object.freeze({status:'UNAVAILABLE',record_count:0,domains:Object.freeze([]),traditions:Object.freeze([]),gaps:Object.freeze([]),conflicts:Object.freeze([])});
const unavailableClaims=()=>Object.freeze({status:'UNAVAILABLE',count:0,items:Object.freeze([])});

function projectCorrespondences({levelId,registry,bindings,limitations}){
 const subjectId=correspondenceSubjectBinding(bindings,levelId); if(!subjectId||!registry)return unavailableCorrespondences();
 const validation=registry.validate?.(); if(!validation?.ok){limitations.push('CORRESPONDENCE_REGISTRY_INVALID');return Object.freeze({...unavailableCorrespondences(),status:'UNRESOLVED'});}
 const records=registry.query?.({subject_id:subjectId})??[]; const conflicts=reasonStrings(registry.conflicts?.({subject_id:subjectId})??[]); const gaps=reasonStrings(registry.coverage?.({subject_id:subjectId})?.gaps??[]);
 const status=conflicts.length?'UNRESOLVED':gaps.length?'PARTIAL':records.length?'CONFIRMED':'UNAVAILABLE';
 return Object.freeze({status,record_count:records.length,domains:freezeStrings(records.map(r=>r.domain)),traditions:freezeStrings(records.map(r=>r.tradition_id)),gaps,conflicts});
}

function projectClaims({levelId,bindings,dossiers,validate,limitations}){
 const ids=bindings?.[levelId]?.claim_ids; if(!Array.isArray(ids)||!ids.length){limitations.push('NO_CONFIRMED_CLAIM_BINDING');return unavailableClaims();}
 const selected=ids.map(id=>dossiers.find(d=>d?.claim_id===id)).filter(Boolean); if(!selected.length){limitations.push('CLAIM_BINDING_SOURCE_MISSING');return unavailableClaims();}
 const items=[]; let unresolved=false; let partial=false;
 for(const dossier of selected){const validation=validate?.(dossier); if(!validation?.ok){limitations.push('CLAIM_DOSSIER_INVALID');unresolved=true;continue;}
  const gaps=freezeStrings(dossier.gaps??[]), conflicts=freezeStrings(dossier.conflicts??[]); const unresolvedLink=(dossier.evidence_links??[]).some(l=>l.relation==='UNRESOLVED');
  const boundaryValid=dossier.automatic_truth_inference===false&&dossier.automatic_canon_promotion===false&&dossier.causal_claim_permitted===false&&dossier.metaphysical_proof_permitted===false;
  if(!boundaryValid){limitations.push('CLAIM_BOUNDARY_INVALID');unresolved=true;continue;}
  const status=conflicts.length||unresolvedLink?'UNRESOLVED':gaps.length?'PARTIAL':'PARTIAL'; if(status==='UNRESOLVED')unresolved=true; else partial=true;
  items.push(Object.freeze({claim_id:dossier.claim_id,statement:dossier.statement,scope:dossier.scope,status,gaps,conflicts,truth_assessed:false,canon_promotion_permitted:false,causal_claim_permitted:false,metaphysical_proof_permitted:false}));
 }
 return Object.freeze({status:unresolved?'UNRESOLVED':items.length?(partial?'PARTIAL':'PARTIAL'):'UNAVAILABLE',count:items.length,items:Object.freeze(items)});
}

function projectEvidence({levelId,bindings,evaluations,limitations}){
 const id=bindings?.[levelId]?.evidence_claim_id; if(!id){limitations.push('NO_CONFIRMED_EVIDENCE_BINDING');return unavailableEvidence();}
 const evaluation=evaluations.find(e=>e?.claim_id===id); if(!evaluation){limitations.push('EVIDENCE_BINDING_SOURCE_MISSING');return unavailableEvidence();}
 const boundaryValid=evaluation.truth_assessed===false&&evaluation.causal_claim_permitted===false&&evaluation.metaphysical_proof_permitted===false;
 if(!boundaryValid){limitations.push('EVIDENCE_BOUNDARY_INVALID');return Object.freeze({...unavailableEvidence(),status:'UNRESOLVED'});}
 const coverage=evaluation.coverage_status; const status=coverage==='COMPLETE_FOR_DECLARED_REQUIREMENTS'?'CONFIRMED':coverage==='PARTIAL'?'PARTIAL':'UNRESOLVED';
 return Object.freeze({status,coverage_label:coverage??null,evidence_count:Number.isInteger(evaluation.evidence_count)?evaluation.evidence_count:0,missing_requirements:freezeStrings(evaluation.missing_requirements??[]),truth_assessed:false,causal_claim_permitted:false,metaphysical_proof_permitted:false});
}

export function projectKnowledgeLens({level_id,correspondence_registry,bindings=VERIFIED_KNOWLEDGE_LENS_BINDINGS,claim_dossiers=[],validate_claim_dossier,evidence_evaluations=[]}={}){
 const level=hnkTreeLevels.find(c=>c.id===level_id); const limitations=level?['NO_CONFIRMED_CANON_BINDING']:['UNKNOWN_TREE_LEVEL','NO_CONFIRMED_CANON_BINDING'];
 const correspondences=level?projectCorrespondences({levelId:level.id,registry:correspondence_registry,bindings,limitations}):unavailableCorrespondences(); if(level&&!correspondenceSubjectBinding(bindings,level.id))limitations.push('NO_CONFIRMED_CORRESPONDENCE_BINDING');
 const claims=level?projectClaims({levelId:level.id,bindings,dossiers:claim_dossiers,validate:validate_claim_dossier,limitations}):unavailableClaims();
 const evidence=level?projectEvidence({levelId:level.id,bindings,evaluations:evidence_evaluations,limitations}):unavailableEvidence();
 return Object.freeze({subject:Object.freeze(level?{level_id:level.id,label:level.label,day_range:level.dayRange,executable_days:getExecutableDays(level.id).length,structural_state:level.state}:{level_id:null,label:'UNAVAILABLE',day_range:null,executable_days:0,structural_state:'unavailable'}),canon:Object.freeze({status:'UNAVAILABLE',authority:null,note:null}),claims,evidence,correspondences,limitations:Object.freeze([...new Set(limitations)])});
}
