import Link from 'next/link';
import semantic from '../../../../data/library/knowledge-graph.semantic-links.v2.json';
import {labDomains,labPillars} from '../knowledge';
const points=[[50,9],[78,20],[91,49],[78,79],[50,91],[22,79],[9,49]];
export default function ConvergencePage(){
 const domainOf=(id:string)=>labDomains.find(d=>d.id===id);
 return <main className="constellation-stage"><header className="constellation-head"><Link href="/laboratorio">← Grimório</Link><div><p>HNK · KNOWLEDGE GRAPH</p><h1>Constelação de Convergência</h1></div><span>{semantic.edges.length} vínculos revisados</span></header>
 <section className="constellation-book"><article className="constellation-page"><p className="folio-kicker">SETE PILARES · VISÃO RELACIONAL</p><div className="constellation-map" aria-label="Mapa relacional dos sete pilares">
 <svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="39"/><circle cx="50" cy="50" r="25"/>{points.map((a,i)=>points.slice(i+1).map((b,j)=><line key={i+'-'+j} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} className={(i+j)%3===0?'bright':''}/>))}</svg>
 <div className="constellation-core">HNK<small>CONVERGÊNCIA</small></div>{labPillars.map((p,i)=><a key={p.id} className={"star-node star-"+(i+1)} href={"#"+p.id}><b>{p.id}</b><span>{p.name}</span></a>)}</div>
 <p className="constellation-rule">As linhas representam a superfície de exploração. Relações semânticas efetivas permanecem vinculadas às evidências revisadas abaixo; geometria visual não cria correspondência.</p></article>
 <article className="constellation-page relation-page"><p className="folio-kicker">REGISTRO SEMÂNTICO V2</p><h2>Relações materializadas</h2><div className="relation-scroll">{semantic.edges.map(e=>{const a=domainOf(e.from),b=domainOf(e.to);return <div className="relation-card" key={e.id}><header><span>{e.id}</span><b>{e.status}</b></header><div><code>{e.from}</code><strong>{e.relation.replaceAll('_',' ')}</strong><code>{e.to}</code></div><p>{e.basis}</p>{(a||b)&&<small>{a?.name??''} {b?.name??''}</small>}</div>})}</div></article></section>
 <footer className="constellation-foot">SEMANTIC CONNECTIVITY ≠ TRUTH · ZERO ≠ NO RELATION · NO INFERRED MISSING LINKS</footer></main>
}
