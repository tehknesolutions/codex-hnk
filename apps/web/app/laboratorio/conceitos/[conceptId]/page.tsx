import Link from 'next/link';
import {notFound} from 'next/navigation';
import {conceptProjection,convergenceEdges} from '../../convergence';
import {labDomains} from '../../knowledge';
export default async function ConceptFolio({params}:{params:Promise<{conceptId:string}>}){
 const {conceptId}=await params;const concept=conceptProjection(conceptId);
 const edges=convergenceEdges.filter(e=>e.from===conceptId||e.to===conceptId);
 if(concept.domains.length===0&&edges.length===0)notFound();
 return <main className="constellation-stage"><header className="constellation-head"><Link href="/laboratorio/convergencia">← Convergência</Link><div><p>HNK · CONCEPT FOLIO</p><h1>{concept.term??concept.id}</h1></div><span>{concept.id}</span></header><section className="constellation-book"><article className="constellation-page"><p className="folio-kicker">PROJEÇÃO DE PROVENIÊNCIA</p><h2>Domínios indexados</h2>{concept.domains.map(id=>{const d=labDomains.find(x=>x.id===id);return <p key={id}><Link href={'/laboratorio/dominios/'+id}><b>{id}</b> · {d?.name??id}</Link></p>})}{concept.sourceId&&<p><b>Fonte:</b> <Link href={'/laboratorio/biblioteca/fontes/'+concept.sourceId}>{concept.sourceId}</Link></p>}<p className="constellation-rule">Este fólio é uma projeção de leitura. Não promove o conceito nem suas relações ao cânone.</p></article><article className="constellation-page relation-page"><p className="folio-kicker">RELAÇÕES REVISADAS</p><h2>{edges.length} vínculo(s)</h2><div className="relation-scroll">{edges.map(e=><div className="relation-card" key={e.id}><header><span>{e.id}</span><b>{e.status}</b></header><div><code>{e.from}</code><strong>{e.relation.replaceAll('_',' ')}</strong><code>{e.to}</code></div><p>{e.basis}</p></div>)}</div></article></section></main>
}
