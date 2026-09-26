import { getGlyph, transliterationToGlyphIds, HNK40_ENTRIES } from '@hnk/glyphs';
import { HNK_MASTER_LEXICON, HNK_MASTER_PHRASES } from './index.mjs';
import { HNK_AUTHORED_REGISTRY } from './authored.mjs';
import { HNK_PARENT_LEXEME_CANDIDATES } from './parent-lexemes.mjs';

export const HNK_PHONOLOGICAL_CENSUS_VERSION = '0.1.0-research';
export const HNK_PHONOLOGICAL_CENSUS_STATUS = 'RESEARCH_NON_CANONICAL';
export const HNK_SAFE_SURFACE_UNITS = Object.freeze(['A','E','I','O','U','H','M','N','L','R','B','D','P','T','K','S','TS','V','Z','Y']);

const VOWEL_IPA = new Set(['/a/','/e/','/i/','/o/','/u/','/y/','/ə/']);
const BRIDGE_ONLY = new Set(['/f/']);

function glyphIdsFor(form, override) {
  if (override) return [...override];
  return transliterationToGlyphIds(form, { strict:true }).glyphIds.filter(x=>x!=='SPACE');
}
function classifySegment(ipa, sourceClass) {
  if (sourceClass==='BRIDGE') return 'BRIDGE';
  if (BRIDGE_ONLY.has(ipa)) return 'BRIDGE_OR_EXTENSION';
  return 'CORE_SURFACE_AUDIT';
}
function shapeOf(ids) {
  return ids.map(id=>VOWEL_IPA.has(getGlyph(id).phonemeIpa)?'V':'C').join('');
}
function record({id,form,authority,certainty,sourceClass,glyphIdsOverride=null,meaning=null}) {
  const glyphIds=glyphIdsFor(form,glyphIdsOverride);
  const ipaSegments=glyphIds.map(id=>getGlyph(id).phonemeIpa);
  return Object.freeze({id,form,authority,certainty,sourceClass,meaning,glyphIds:Object.freeze(glyphIds),ipaSegments:Object.freeze(ipaSegments),ipa:ipaSegments.join(''),shape:shapeOf(glyphIds),segmentClasses:Object.freeze(ipaSegments.map(ipa=>classifySegment(ipa,sourceClass))),flags:Object.freeze([...(form.includes('Y')?['Y_PRONUNCIATION_REVIEW']:[]),...(sourceClass==='BRIDGE'?['BRIDGE_NOT_CORE']:[])])});
}

const recovered = HNK_MASTER_LEXICON.map(x=>record({id:x.id,form:x.transliteration,authority:x.authority,certainty:x.certainty,sourceClass:x.authority==='BRIDGE'?'BRIDGE':'MASTER_LEXICON',glyphIdsOverride:x.encodingMode==='EXPLICIT_BRIDGE'?x.glyphIds:null,meaning:x.meaning}));
const authored = HNK_AUTHORED_REGISTRY.map(x=>record({id:x.id,form:x.transliteration,authority:x.authority,certainty:x.certainty,sourceClass:'AUTHORED_CANDIDATE',meaning:x.meaning}));
const parents = HNK_PARENT_LEXEME_CANDIDATES.map(x=>record({id:x.id,form:x.transliteration,authority:x.authority,certainty:x.certainty,sourceClass:'PARENT_CANDIDATE',meaning:x.meaning}));

export const HNK_PHONOLOGICAL_CENSUS_RECORDS = Object.freeze([...recovered,...authored,...parents]);

function frequencies(records) {
  const byIpa={},byGlyph={};
  for(const r of records) for(let i=0;i<r.glyphIds.length;i++) {
    byGlyph[r.glyphIds[i]]=(byGlyph[r.glyphIds[i]]??0)+1;
    byIpa[r.ipaSegments[i]]=(byIpa[r.ipaSegments[i]]??0)+1;
  }
  return {byIpa:Object.freeze(byIpa),byGlyph:Object.freeze(byGlyph)};
}
function coverage(records) { return Object.freeze([...new Set(records.flatMap(r=>r.ipaSegments))].sort()); }

const recoveredOnly=HNK_PHONOLOGICAL_CENSUS_RECORDS.filter(r=>r.sourceClass==='MASTER_LEXICON');
const bridge=HNK_PHONOLOGICAL_CENSUS_RECORDS.filter(r=>r.sourceClass==='BRIDGE');
const candidates=HNK_PHONOLOGICAL_CENSUS_RECORDS.filter(r=>r.sourceClass==='AUTHORED_CANDIDATE'||r.sourceClass==='PARENT_CANDIDATE');
const fullRuntime=Object.freeze([...new Set(HNK40_ENTRIES.map(x=>x.phonemeIpa))]);
const governedCoverage=coverage([...recoveredOnly,...candidates]);

export const HNK_PHONOLOGICAL_CENSUS = Object.freeze({
  version:HNK_PHONOLOGICAL_CENSUS_VERSION,status:HNK_PHONOLOGICAL_CENSUS_STATUS,
  counts:Object.freeze({records:HNK_PHONOLOGICAL_CENSUS_RECORDS.length,recovered:recoveredOnly.length,candidates:candidates.length,bridge:bridge.length,phrases:HNK_MASTER_PHRASES.length,runtimeSlots:HNK40_ENTRIES.length,safeSurfaceUnits:HNK_SAFE_SURFACE_UNITS.length}),
  coverage:Object.freeze({recoveredOnly:coverage(recoveredOnly),governed:governedCoverage,bridge:coverage(bridge),fullRuntime,unattestedRuntime:Object.freeze(fullRuntime.filter(ipa=>!governedCoverage.includes(ipa)&&!coverage(bridge).includes(ipa)))}),
  frequencies:frequencies(HNK_PHONOLOGICAL_CENSUS_RECORDS),
  review:Object.freeze({yForms:Object.freeze(HNK_PHONOLOGICAL_CENSUS_RECORDS.filter(r=>r.flags.includes('Y_PRONUNCIATION_REVIEW')).map(r=>r.form)),bridgeForms:Object.freeze(bridge.map(r=>r.form))})
});

export function validateHnkPhonologicalCensus(){
  const errors=[];
  if(HNK_SAFE_SURFACE_UNITS.length!==20) errors.push('Safe surface cardinality drift');
  if(HNK40_ENTRIES.length!==40) errors.push('Legacy runtime cardinality drift');
  for(const r of HNK_PHONOLOGICAL_CENSUS_RECORDS){
    if(r.glyphIds.length!==r.ipaSegments.length) errors.push(`Encoding length mismatch: ${r.id}`);
  }
  if(!HNK_PHONOLOGICAL_CENSUS.review.bridgeForms.includes('KALIFORNIA')) errors.push('KALIFORNIA bridge evidence missing');
  return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors)});
}
