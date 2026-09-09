import { HNK40_STATUS, getGlyph, transliterationToGlyphIds } from '@hnk/glyphs';

export const HNK_MASTER_LEXICON_VERSION='1.0.0-preproduction';
export const HNK_MASTER_LEXICON_STATUS='RECOVERED_BETA_REGISTRY';
export const HNK_MASTER_LEXICON_SOURCE='PROJECT_RECOVERY_2026-09-08';
export const HNK_MASTER_LEXICON_GOVERNANCE=Object.freeze({
  glyphAuthority:'G-ID',
  visualState:HNK40_STATUS,
  visualPromotion:'HUMAN_GATE_REQUIRED',
  policy:'FROZEN, WATCH, CANDIDATE, GATE, BRIDGE and REFERENCE must remain distinct.',
});

const RAW_LEXEMES=[{"id":"LEX-001","transliteration":"VAMAKALA","meaning":{"pt":"apelido / nome familiar","en":"nickname / familiar name"},"authority":"FROZEN","legacyStatus":"BETA-FROZEN","lessons":["L01"],"certainty":"RECOVERED","notes":[]},{"id":"LEX-002","transliteration":"SARADAYA","meaning":{"pt":"origem / local de nascimento","en":"origin / birthplace"},"authority":"FROZEN","legacyStatus":"BETA-FROZEN","lessons":["L01"],"certainty":"RECOVERED","notes":[]},{"id":"LEX-003","transliteration":"VALIVAN","meaning":{"pt":"escritório","en":"office"},"authority":"FROZEN","legacyStatus":"INHERITED-BETA-FROZEN","lessons":["L01","L03"],"certainty":"RECOVERED","notes":[]},{"id":"LEX-004","transliteration":"PARAZAMO","meaning":{"pt":"escola / domínio de estudo","en":"school / study domain"},"authority":"FROZEN","legacyStatus":"BETA-FROZEN","lessons":["L01","L03"],"certainty":"RECOVERED","notes":[]},{"id":"LEX-005","transliteration":"VAMUSARO","meaning":{"pt":"descanso / período de lazer","en":"rest / leisure period"},"authority":"FROZEN","legacyStatus":"BETA-FROZEN","lessons":["L01"],"certainty":"RECOVERED","notes":[]},{"id":"LEX-006","transliteration":"SARASALA","meaning":{"pt":"tempo / duração","en":"time / duration"},"authority":"WATCH","legacyStatus":"BETA-FROZEN-WATCH","lessons":["L01"],"certainty":"RECOVERED","notes":["Lesson 1 watch set."]},{"id":"LEX-007","transliteration":"VAMAVALA","meaning":{"pt":"hobby / atividade de prazer","en":"hobby / pleasure activity"},"authority":"WATCH","legacyStatus":"BETA-FROZEN-WATCH","lessons":["L01"],"certainty":"RECOVERED","notes":["Lesson 1 watch set."]},{"id":"LEX-008","transliteration":"VAMAZAMU","meaning":{"pt":"canto / expressão harmônica","en":"singing / harmonic expression"},"authority":"WATCH","legacyStatus":"BETA-FROZEN-WATCH","lessons":["L01"],"certainty":"RECOVERED","notes":["Lesson 1 watch set."]},{"id":"LEX-009","transliteration":"TAYOVAN","meaning":{"pt":"cidade","en":"city"},"authority":"FROZEN","legacyStatus":"FROZEN-L02-H10.1","lessons":["L02"],"certainty":"RECOVERED","notes":[]},{"id":"LEX-010","transliteration":"KALOVALA","meaning":{"pt":"edifício / prédio","en":"building"},"authority":"FROZEN","legacyStatus":"FROZEN-L02-H10.1","lessons":["L02"],"certainty":"RECOVERED","notes":[]},{"id":"LEX-011","transliteration":"PAROVAN","meaning":{"pt":"biblioteca","en":"library"},"authority":"FROZEN","legacyStatus":"BETA-FROZEN","lessons":["L02"],"certainty":"RECOVERED","notes":[]},{"id":"LEX-012","transliteration":"PARAZAMI","meaning":{"pt":"estudo / estudar","en":"study"},"authority":"WATCH","legacyStatus":"BETA-FROZEN-WATCH","lessons":["L02","L03"],"certainty":"RECOVERED","notes":[]},{"id":"LEX-013","transliteration":"VALI","meaning":{"pt":"trabalho / trabalhar","en":"work"},"authority":"FROZEN","legacyStatus":"INHERITED-BETA-FROZEN","lessons":["L02","L03"],"certainty":"RECOVERED","notes":[]},{"id":"LEX-014","transliteration":"SAROSARI","meaning":{"pt":"viagem / viajar","en":"travel"},"authority":"WATCH","legacyStatus":"INHERITED-BETA-FROZEN-WATCH","lessons":["L02","L04"],"certainty":"RECOVERED","notes":[]},{"id":"LEX-015","transliteration":"PARI","meaning":{"pt":"ver","en":"see"},"authority":"WATCH","legacyStatus":"INHERITED-FUNCTIONAL-WATCH","lessons":["L02"],"certainty":"RECOVERED","notes":[]},{"id":"LEX-016","transliteration":"DAYI","meaning":{"pt":"querer / intenção","en":"want / intention"},"authority":"CANDIDATE","legacyStatus":"L03-CANDIDATE","lessons":["L03"],"certainty":"PARTIAL","notes":["Intention/planning candidate; not silently canonized."]},{"id":"LEX-017","transliteration":"SALI","meaning":{"pt":"precisar","en":"need"},"authority":"WATCH","legacyStatus":"L03-WATCH","lessons":["L03"],"certainty":"RECOVERED","notes":[]},{"id":"LEX-018","transliteration":"SARU","meaning":{"pt":"todos os dias / habitualidade","en":"every day / habituality"},"authority":"WATCH","legacyStatus":"L03-WATCH","lessons":["L03"],"certainty":"RECOVERED","notes":[]},{"id":"LEX-019","transliteration":"TA","meaning":{"pt":"destino / propósito","en":"destination / purpose"},"authority":"CANDIDATE","legacyStatus":"L03-CANDIDATE","lessons":["L03"],"certainty":"PARTIAL","notes":[]},{"id":"LEX-020","transliteration":"PA","meaning":{"pt":"ontem","en":"yesterday"},"authority":"WATCH","legacyStatus":"L02-WATCH","lessons":["L02"],"certainty":"RECOVERED","notes":[]},{"id":"LEX-021","transliteration":"PAPA","meaning":{"pt":"termo parental PAPA (uso informal em teste)","en":"PAPA parental term (informal-only gate)"},"authority":"GATE","legacyStatus":"L04-INFORMAL-ONLY","lessons":["L04"],"certainty":"PARTIAL","notes":["Do not generalize to formal parent vocabulary."]},{"id":"LEX-022","transliteration":"MAMA","meaning":{"pt":"termo parental MAMA (uso informal em teste)","en":"MAMA parental term (informal-only gate)"},"authority":"GATE","legacyStatus":"L04-INFORMAL-ONLY","lessons":["L04"],"certainty":"PARTIAL","notes":["Do not generalize to formal parent vocabulary."]},{"id":"LEX-023","transliteration":"VAMATAYA","meaning":{"pt":"festa (candidato)","en":"party (candidate)"},"authority":"CANDIDATE","legacyStatus":"CANDIDATE","lessons":[],"certainty":"PARTIAL","notes":[]},{"id":"LEX-024","transliteration":"KALIFORNIA","meaning":{"pt":"Califórnia — ponte de nome próprio","en":"California — proper-name bridge"},"authority":"BRIDGE","legacyStatus":"PROPER-NAME-BRIDGE","lessons":[],"certainty":"RECOVERED","notes":[],"glyphIdsOverride":["G23","G01","G14","G03","G25","G04","G15","G12","G03","G01"]},{"id":"LEX-025","transliteration":"VAME","meaning":{"pt":"gostar / like em leitura literal","en":"literal like"},"authority":"GATE","legacyStatus":"L04-GATE","lessons":["L04"],"certainty":"PARTIAL","notes":["Literal behavior under test."]},{"id":"LEX-026","transliteration":"ON","meaning":{"pt":"pronome / referente em teste","en":"pronoun / referent under test"},"authority":"GATE","legacyStatus":"L04-GATE","lessons":["L04"],"certainty":"PARTIAL","notes":["Gendered-pronoun and multi-referent behavior remain under test."]},{"id":"LEX-027","transliteration":"BANKA","meaning":null,"authority":"GATE","legacyStatus":"L04-SCOPE-GATE","lessons":["L04"],"certainty":"UNRECOVERED","notes":["Scope is under test; exact semantic gloss was not recovered."]},{"id":"LEX-028","transliteration":"VANUVALAKALU","meaning":null,"authority":"GATE","legacyStatus":"L04-LENGTH-FAILURE","lessons":["L04"],"certainty":"UNRECOVERED","notes":["Length failure; contrasted with VANUVALI. No gloss assigned."]},{"id":"LEX-029","transliteration":"SAROSAL","meaning":null,"authority":"GATE","legacyStatus":"OBSERVED-CONFUSION-FORM","lessons":["L04"],"certainty":"UNRECOVERED","notes":["Observed form contrasted with SARASALA; no gloss assigned."]},{"id":"LEX-030","transliteration":"VANUVALI","meaning":null,"authority":"GATE","legacyStatus":"OBSERVED-WATCH-FORM","lessons":["L02","L04"],"certainty":"UNRECOVERED","notes":["Observed/watch form; no gloss assigned."]},{"id":"LEX-031","transliteration":"VANI","meaning":null,"authority":"WATCH","legacyStatus":"L02-WATCH-FORM","lessons":["L02"],"certainty":"UNRECOVERED","notes":["Observed/watch form; no gloss assigned."]},{"id":"LEX-032","transliteration":"PITSA","meaning":{"pt":"pizza","en":"pizza"},"authority":"FROZEN","legacyStatus":"LOAN-FROZEN","lessons":["L02"],"certainty":"RECOVERED","notes":["TS is atomic G30."]},{"id":"LEX-033","transliteration":"HENUVOKODAN","meaning":{"pt":"nome do idioma / sistema HNK","en":"name of the HNK language / system"},"authority":"REFERENCE","legacyStatus":"SYSTEM-NAME","lessons":["L01"],"certainty":"RECOVERED","notes":["Reference/system name; not promoted as an ordinary frozen lexeme by this registry."]}];
const RAW_PHRASES=[{"id":"PHR-001","transliteration":"KALA YA EN ES KU KE","meaning":{"pt":"Qual é o seu nome?","en":"What is your name?"},"certainty":"APPROXIMATE","status":"RECOVERED","lessons":["L01"],"notes":[]},{"id":"PHR-002","transliteration":"AN ZAMI ZAMO","meaning":{"pt":"Eu falo / uso linguagem.","en":"I speak / use language."},"certainty":"APPROXIMATE","status":"RECOVERED","lessons":["L01"],"notes":[]},{"id":"PHR-003","transliteration":"EN ZAMI HENUVOKODAN KE","meaning":{"pt":"Você fala HENUVOKODAN?","en":"Do you speak HENUVOKODAN?"},"certainty":"APPROXIMATE","status":"RECOVERED","lessons":["L01"],"notes":[]},{"id":"PHR-004","transliteration":"EN SARI LO KU KE","meaning":null,"certainty":"UNRECOVERED","status":"RECOVERED","lessons":["L01"],"notes":["Exact gloss not recovered; phrase preserved without invention."]},{"id":"PHR-005","transliteration":"EN DA KU KE","meaning":null,"certainty":"UNRECOVERED","status":"RECOVERED","lessons":["L01"],"notes":["Exact gloss not recovered; phrase preserved without invention."]},{"id":"PHR-006","transliteration":"EN ZAMI KU ZAMO KE","meaning":null,"certainty":"UNRECOVERED","status":"RECOVERED","lessons":["L01"],"notes":["Exact gloss not recovered; phrase preserved without invention."]},{"id":"PHR-007","transliteration":"AN ZAMI HENUVOKODAN","meaning":null,"certainty":"UNRECOVERED","status":"RECOVERED","lessons":["L01"],"notes":["Exact gloss not recovered; phrase preserved without invention."]}];

function freezeMeaning(value){return value?Object.freeze({...value}):null}
function compileLexeme(raw){
  const {glyphIdsOverride,...publicRaw}=raw;
  let glyphIds,encodingMode='SAFE_TRANSLITERATION';
  if(glyphIdsOverride){
    if(raw.authority!=='BRIDGE') throw new Error(`Explicit glyph override is restricted to BRIDGE entries: ${raw.transliteration}`);
    glyphIds=glyphIdsOverride.map(glyphId=>getGlyph(glyphId).glyphId);
    encodingMode='EXPLICIT_BRIDGE';
  }else{
    glyphIds=transliterationToGlyphIds(raw.transliteration,{strict:true}).glyphIds.filter(glyphId=>glyphId!=='SPACE');
  }
  const ipaSegments=glyphIds.map(glyphId=>getGlyph(glyphId).phonemeIpa);
  return Object.freeze({...publicRaw,meaning:freezeMeaning(raw.meaning),lessons:Object.freeze([...raw.lessons]),notes:Object.freeze([...raw.notes]),glyphIds:Object.freeze(glyphIds),encodingMode,ipaSegments:Object.freeze(ipaSegments),ipa:ipaSegments.join('')});
}
function compilePhrase(raw){
  const glyphIds=Object.freeze([...transliterationToGlyphIds(raw.transliteration,{includeSpaces:true,strict:true}).glyphIds]);
  const ipa=glyphIds.map(glyphId=>glyphId==='SPACE'?' ':getGlyph(glyphId).phonemeIpa).join('');
  return Object.freeze({...raw,meaning:freezeMeaning(raw.meaning),lessons:Object.freeze([...raw.lessons]),notes:Object.freeze([...raw.notes]),glyphIds,ipa});
}

export const HNK_MASTER_LEXICON=Object.freeze(RAW_LEXEMES.map(compileLexeme));
export const HNK_MASTER_PHRASES=Object.freeze(RAW_PHRASES.map(compilePhrase));
export const HNK_MASTER_LEXICON_BY_FORM=Object.freeze(Object.fromEntries(HNK_MASTER_LEXICON.map(entry=>[entry.transliteration,entry])));
export const HNK_MASTER_PHRASES_BY_ID=Object.freeze(Object.fromEntries(HNK_MASTER_PHRASES.map(entry=>[entry.id,entry])));
export const HNK_MASTER_LEXICON_STATS=Object.freeze({
  lexemes:HNK_MASTER_LEXICON.length,
  phrases:HNK_MASTER_PHRASES.length,
  byAuthority:Object.freeze(HNK_MASTER_LEXICON.reduce((acc,entry)=>{acc[entry.authority]=(acc[entry.authority]??0)+1;return acc},{})),
  withRecoveredMeaning:HNK_MASTER_LEXICON.filter(entry=>entry.meaning!==null).length,
  withoutRecoveredMeaning:HNK_MASTER_LEXICON.filter(entry=>entry.meaning===null).length,
});

export function getLexeme(value){return typeof value==='string'?HNK_MASTER_LEXICON_BY_FORM[value.trim().toUpperCase()]:undefined}
export function getPhrase(id){return HNK_MASTER_PHRASES_BY_ID[id]}
export function filterLexemes({authority,lesson,hasMeaning}={}){
  return HNK_MASTER_LEXICON.filter(entry=>{
    if(authority&&entry.authority!==authority)return false;
    if(lesson&&!entry.lessons.includes(lesson))return false;
    if(hasMeaning===true&&entry.meaning===null)return false;
    if(hasMeaning===false&&entry.meaning!==null)return false;
    return true;
  });
}

export function validateHnkMasterLexicon(){
  const errors=[],forms=new Set(),ids=new Set();
  if(HNK40_STATUS!=='PREPRODUCTION_NOT_OFFICIAL')errors.push(`Unexpected HNK40 visual state: ${HNK40_STATUS}`);
  if(HNK_MASTER_LEXICON.length!==33)errors.push(`Expected 33 recovered lexeme/reference forms, got ${HNK_MASTER_LEXICON.length}`);
  if(HNK_MASTER_PHRASES.length!==7)errors.push(`Expected 7 recovered phrases, got ${HNK_MASTER_PHRASES.length}`);
  for(const entry of HNK_MASTER_LEXICON){
    if(forms.has(entry.transliteration))errors.push(`Duplicate form: ${entry.transliteration}`);forms.add(entry.transliteration);
    if(ids.has(entry.id))errors.push(`Duplicate id: ${entry.id}`);ids.add(entry.id);
    if(entry.transliteration!==entry.transliteration.toUpperCase())errors.push(`Non-normalized transliteration: ${entry.transliteration}`);
    if(!entry.glyphIds.length)errors.push(`No glyphs: ${entry.transliteration}`);
    if(entry.certainty==='UNRECOVERED'&&entry.meaning!==null)errors.push(`Unrecovered gloss must remain null: ${entry.transliteration}`);
    if(entry.encodingMode==='EXPLICIT_BRIDGE'&&entry.authority!=='BRIDGE')errors.push(`Explicit bridge encoding leaked outside BRIDGE: ${entry.transliteration}`);
  }
  const pitsa=getLexeme('PITSA');
  if(!pitsa||pitsa.glyphIds.join('·')!=='G21·G03·G30·G01')errors.push('PITSA must preserve atomic TS as G30.');
  const california=getLexeme('KALIFORNIA');
  if(!california||california.encodingMode!=='EXPLICIT_BRIDGE'||california.glyphIds.join('·')!=='G23·G01·G14·G03·G25·G04·G15·G12·G03·G01')errors.push('KALIFORNIA must preserve explicit bridge F as G25.');
  const bank=getLexeme('BANKA');
  if(!bank||bank.meaning!==null||bank.authority!=='GATE')errors.push('BANKA must remain an unglossed gate form.');
  const frozen=HNK_MASTER_LEXICON.filter(entry=>entry.authority==='FROZEN').length;
  if(frozen!==10)errors.push(`Expected 10 FROZEN entries, got ${frozen}`);
  for(const phrase of HNK_MASTER_PHRASES){
    if(ids.has(phrase.id))errors.push(`Duplicate id: ${phrase.id}`);ids.add(phrase.id);
    if(phrase.certainty==='UNRECOVERED'&&phrase.meaning!==null)errors.push(`Unrecovered phrase gloss must remain null: ${phrase.id}`);
  }
  return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors)});
}
