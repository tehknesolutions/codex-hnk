import Link from 'next/link';
import {labDomains,labPillars} from '../knowledge';
import {convergenceEdges,pillarConvergenceLinks,maxPillarMaterializedRelations} from '../convergence';
const points=[[50,9],[78,20],[91,49],[78,79],[50,91],[22,79],[9,49]];
export default function ConvergencePage(){
 const domainName=(id:string)=>labDomains.find(d=>d.id===id)?.name??id;
 return <main className="constellation-stage"><header className="constellation-head"><Link href="/laboratorio">← Grimório</Link><div><p>HNK · KNOWLEDGE GRAPH</p><h1>Constelação de Convergência</h1></div><span>{convergenceEdges.length} vínculos revisados</span></header>
 <section className="constellation-book"><article className="constellation-page"><p className="folio-kicker">SETE PILARES · VISÃO RELACIONAL</p><div className="constellation-map" aria-label="Mapa relacional dos sete pilares">
 <svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="39"/><circle cx="50" cy="50" r="25"/>{pillarConvergenceLinks.map(link=>{const ai=Number(link.a.slice(1))-1,bi=Number(link.b.slice(1))-1,a=points[ai],b=points[bi],strength=maxPillarMaterializedRelations?link.materialized_relations/maxPillarMaterializedRelations:0;return <line key={link.a+'-'+link.b} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} className={strength>=.67?'bright':''} opacity={.3+.7*strength} strokeWidth={.25+1.25*strength}><title>{link.a} ↔ {link.b}: {link.materialized_relations} relação(ões) materializada(s) · {link.semantic_edge_ids.join(', ')}</title></line>})}</svg>
 <div className="constellation-core">HNK<small>CONVERGÊNCIA</small></div>{labPillars.map((p,i)=><a key={p.id} className={"star-node star-"+(i+1)} href={"#"+p.id}><b>{p.id}</b><span>{p.name}</span></a>)}</div>
 <p className="constellation-rule">As linhas agora são projeções das relações semânticas revisadas: espessura e opacidade refletem somente a quantidade de relações materializadas entre pilares. Ausência de linha significa ausência de relação materializada neste corpus — não ausência de relação possível.</p></article>
 <article className="constellation-page relation-page"><p className="folio-kicker">REGISTRO SEMÂNTICO V2</p><h2>Relações materializadas</h2><div className="relation-scroll">{convergenceEdges.map(e=><div className="relation-card" key={e.id}><header><span>{e.id}</span><b>{e.status}</b></header><div><code>{e.from}</code><strong>{e.relation.replaceAll('_',' ')}</strong><code>{e.to}</code></div><p>{e.basis}</p><small>{e.from_domains.map(domainName).join(' · ')} → {e.to_domains.map(domainName).join(' · ')}</small></div>)}</div></article></section>
 <footer className="constellation-foot">SEMANTIC CONNECTIVITY ≠ TRUTH · ZERO ≠ NO RELATION · NO INFERRED MISSING LINKS</footer></main>
}
