'use client';

type Status='CONFIRMED'|'PARTIAL'|'UNRESOLVED'|'UNAVAILABLE';
type Projection={subject:{label:string;day_range:string|null;executable_days:number;structural_state:string};canon:{status:Status;authority:string|null;note:string|null};claims:{status:Status;count:number;items:ReadonlyArray<{claim_id:string;statement:string;scope:string;status:Status;gaps:readonly string[];conflicts:readonly string[]}>};evidence:{status:Status;coverage_label:string|null;evidence_count:number;missing_requirements:readonly string[];truth_assessed:false;causal_claim_permitted:false;metaphysical_proof_permitted:false};correspondences:{status:Status;record_count:number;domains:readonly string[];traditions:readonly string[];gaps:readonly string[];conflicts:readonly string[]};limitations:readonly string[]};
const label:Record<Status,string>={CONFIRMED:'CONFIRMADO',PARTIAL:'PARCIAL',UNRESOLVED:'NÃO RESOLVIDO',UNAVAILABLE:'INDISPONÍVEL'};
function State({value}:{value:Status}){return <span className="living-knowledge-lens__status" data-status={value}>{label[value]}</span>}
function List({items}:{items:readonly string[]}){return items.length?<ul>{items.map(item=><li key={item}>{item}</li>)}</ul>:<p className="living-knowledge-lens__empty">Nenhum item confirmado para esta projeção.</p>}
export function LivingKnowledgeLens({projection}:{projection:Projection}){return <section className="living-knowledge-lens" aria-label={`Lente de conhecimento · ${projection.subject.label}`}>
 <header><p>LENTE DE CONHECIMENTO</p><h3>{projection.subject.label}</h3><span>{projection.subject.day_range??'sem faixa executável'} · {projection.subject.executable_days} Days</span></header>
 <div className="living-knowledge-lens__grid">
  <section><h4>CÂNONE</h4><State value={projection.canon.status}/>{projection.canon.authority?<p>{projection.canon.authority}</p>:<p className="living-knowledge-lens__empty">Autoridade canônica não vinculada.</p>}{projection.canon.note?<p>{projection.canon.note}</p>:null}</section>
  <section><h4>CLAIMS</h4><State value={projection.claims.status}/><p>{projection.claims.count} claim(s) vinculada(s)</p>{projection.claims.items.map(item=><article key={item.claim_id}><strong>{item.statement}</strong><small>{item.scope} · {label[item.status]}</small>{item.gaps.length?<List items={item.gaps}/>:null}{item.conflicts.length?<List items={item.conflicts}/>:null}</article>)}</section>
  <section><h4>EVIDÊNCIA</h4><State value={projection.evidence.status}/><p>{projection.evidence.coverage_label??'Cobertura não vinculada'} · {projection.evidence.evidence_count} registro(s)</p><List items={projection.evidence.missing_requirements}/><p className="living-knowledge-lens__boundary">Cobertura não determina verdade, causalidade ou prova metafísica.</p></section>
  <section><h4>CORRESPONDÊNCIAS</h4><State value={projection.correspondences.status}/><p>{projection.correspondences.record_count} registro(s)</p><List items={[...projection.correspondences.domains,...projection.correspondences.traditions,...projection.correspondences.gaps,...projection.correspondences.conflicts]}/></section>
  <section className="living-knowledge-lens__limits"><h4>LIMITES</h4><List items={projection.limitations}/></section>
 </div>
 </section>}
