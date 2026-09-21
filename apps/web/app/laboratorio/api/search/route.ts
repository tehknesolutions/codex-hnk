import {NextRequest,NextResponse} from 'next/server';
import {labDomains} from '../../knowledge';
import {conceptRegistry} from '../../convergence';
import sources from '../../../../../../data/library/library.sources.registry.json';
import glyphs from '../../../../../../packages/hnk-glyphs/reference/HNK40_REFERENCE_MATRIX_V1.json';
import glyphSemantics from '../../../../../../data/library/hnk40.approved-semantic-relations.v1.json';
const norm=(v:string)=>v.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR');
export function GET(req:NextRequest){
 const q=(req.nextUrl.searchParams.get('q')??'').trim();const needle=norm(q);
 const items=[
  ...labDomains.map(d=>({id:d.id,label:d.name,kind:'DOMAIN',href:'/laboratorio/dominios/'+d.id,meta:d.pillarId+' · '+d.levelId})),
  ...conceptRegistry.map(c=>({id:c.id,label:c.term??c.id,kind:'CONCEPT',href:'/laboratorio/conceitos/'+c.id,meta:c.origin})),
  ...sources.sources.map(s=>({id:s.source_id,label:s.title,kind:'SOURCE',href:'/laboratorio/biblioteca/fontes/'+s.source_id,meta:s.author??'AUTOR NÃO REGISTRADO'})),
  ...glyphs.entries.map(g=>{const s=glyphSemantics.entries.find(x=>x.glyph_id===g.glyph_id);return {id:g.glyph_id,label:g.safe_transliteration??g.glyph_id,kind:'GLYPH',href:'/laboratorio/glifos/'+g.glyph_id,meta:[g.phoneme_ipa,g.world_id,s?.role,s?.sigil,s?.light,s?.shadow].filter(Boolean).join(' · ')}})
 ];
 const results=needle?items.filter(x=>norm(x.id+' '+x.label+' '+x.meta).includes(needle)).slice(0,24):[];
 return NextResponse.json({schema_version:'HNK-LAB-SEARCH-V1',authority:'READ_ONLY_PROJECTION',query:q,results,summary:{matched:results.length,limit:24},coverage:{domains:labDomains.length,concepts:conceptRegistry.length,sources:sources.sources.length,glyphs:glyphs.entries.length},rules:['NO_INFERENCE','NO_CANON_PROMOTION','EMPTY_RESULT_MEANS_NO_MATERIALIZED_MATCH','GLYPH_STRUCTURE_FROM_HNK40_REFERENCE_MATRIX_ONLY','GLYPH_SEMANTICS_FROM_HNK40_APPROVED_RELATIONS_ONLY']});
}
