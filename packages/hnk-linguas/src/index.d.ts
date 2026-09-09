import type { GlyphId } from '@hnk/glyphs';

export type LexiconAuthority = 'FROZEN'|'WATCH'|'CANDIDATE'|'GATE'|'BRIDGE'|'REFERENCE';
export type MeaningCertainty = 'RECOVERED'|'PARTIAL'|'UNRECOVERED';
export type PhraseCertainty = 'APPROXIMATE'|'UNRECOVERED';
export type HnkEncodingMode = 'SAFE_TRANSLITERATION'|'EXPLICIT_BRIDGE';
export type HnkMeaning = Readonly<{ pt:string; en:string }>;

export type HnkLexeme = Readonly<{
  id:string;
  transliteration:string;
  meaning:HnkMeaning|null;
  authority:LexiconAuthority;
  legacyStatus:string;
  lessons:readonly string[];
  certainty:MeaningCertainty;
  notes:readonly string[];
  glyphIds:readonly GlyphId[];
  encodingMode:HnkEncodingMode;
  ipaSegments:readonly string[];
  ipa:string;
}>;

export type HnkPhrase = Readonly<{
  id:string;
  transliteration:string;
  meaning:HnkMeaning|null;
  certainty:PhraseCertainty;
  status:'RECOVERED';
  lessons:readonly string[];
  notes:readonly string[];
  glyphIds:readonly (GlyphId|'SPACE')[];
  ipa:string;
}>;

export const HNK_MASTER_LEXICON_VERSION:'1.0.0-preproduction';
export const HNK_MASTER_LEXICON_STATUS:'RECOVERED_BETA_REGISTRY';
export const HNK_MASTER_LEXICON_SOURCE:'PROJECT_RECOVERY_2026-09-08';
export const HNK_MASTER_LEXICON_GOVERNANCE:Readonly<{
  glyphAuthority:'G-ID';
  visualState:'PREPRODUCTION_NOT_OFFICIAL';
  visualPromotion:'HUMAN_GATE_REQUIRED';
  policy:string;
}>;
export const HNK_MASTER_LEXICON:readonly HnkLexeme[];
export const HNK_MASTER_PHRASES:readonly HnkPhrase[];
export const HNK_MASTER_LEXICON_BY_FORM:Readonly<Record<string,HnkLexeme>>;
export const HNK_MASTER_PHRASES_BY_ID:Readonly<Record<string,HnkPhrase>>;
export const HNK_MASTER_LEXICON_STATS:Readonly<{
  lexemes:number;
  phrases:number;
  byAuthority:Readonly<Record<string,number>>;
  withRecoveredMeaning:number;
  withoutRecoveredMeaning:number;
}>;
export function getLexeme(transliteration:unknown):HnkLexeme|undefined;
export function getPhrase(id:string):HnkPhrase|undefined;
export function filterLexemes(options?:{
  authority?:LexiconAuthority;
  lesson?:string;
  hasMeaning?:boolean;
}):HnkLexeme[];
export function validateHnkMasterLexicon():Readonly<{ok:boolean;errors:readonly string[]}>;
