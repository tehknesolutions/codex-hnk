import Link from 'next/link';
import {domainsForPillar,labDomains,labPillars,semanticEdgeCount} from './knowledge';
import {conceptRegistry} from './convergence';
import sources from '../../../../data/library/library.sources.registry.json';
import CodexSearch from './CodexSearch';

export default function LaboratoryPage(){
 const searchItems=[
  ...labDomains.map(d=>({id:d.id,label:d.name,kind:'DOMAIN' as const,href:'/laboratorio/dominios/'+d.id,meta:d.pillarId+' · '+d.levelId})),
  ...conceptRegistry.map(c=>({id:c.id,label:c.term??c.id,kind:'CONCEPT' as const,href:'/laboratorio/conceitos/'+c.id,meta:c.origin})),
  ...sources.sources.map(s=>({id:s.source_id,label:s.title,kind:'SOURCE' as const,href:'/laboratorio/biblioteca/fontes/'+s.source_id,meta:s.author??'AUTOR NÃO REGISTRADO'}))
 ];
 return <main className="grimoire-stage" data-hnk-theme="living-grimoire">
  <header className="grimoire-masthead"><div><span className="mast-sigil">✦</span><strong>HNK</strong><small>CODEX · LIVING GRIMOIRE</small></div><nav><Link href="/">Início</Link><a href="#pilares">Pilares</a><a href="#dominios">Domínios</a><Link href="/laboratorio/biblioteca">Biblioteca</Link></nav><span className="canon-chip">KNOWLEDGE GRAPH</span></header>
  <section className="grimoire-book">
   <div className="book-spine" aria-hidden="true"><span>H</span><span>N</span><span>K</span></div>
   <article className="grimoire-page left-page" id="pilares"><div className="page-corner corner-a"/><div className="page-corner corner-b"/><p className="folio-kicker">HNK · SETE PILARES</p><h1>Mapa do Ser, Saber e Fazer</h1><p className="folio-lead">CONSCIÊNCIA → CRIAÇÃO → TRANSFORMAÇÃO → MANIFESTAÇÃO</p>
    <div className="pillar-wheel"><div className="wheel-rings" aria-hidden="true"/><div className="wheel-core"><span>HNK</span><small>7 × 7</small></div>{labPillars.map((p,i)=><a className={"pillar-node node-"+(i+1)} key={p.id} href={"#"+p.id} title={p.definition}><span className="pillar-index">{p.id}</span><strong>{p.name}</strong><small>{p.verb}</small></a>)}</div>
    <blockquote>“O conhecimento torna-se vivo quando pode ser explorado, relacionado e manifestado.”</blockquote>
   </article>
   <article className="grimoire-page right-page" id="dominios"><div className="page-corner corner-c"/><div className="page-corner corner-d"/><p className="folio-kicker">MAPA DO CONHECIMENTO · REGISTRY V1.1</p><h2>49 Domínios Fundamentais</h2>
    <div className="grimoire-tabs"><button className="active">Domínios</button><Link href="/laboratorio/convergencia">Convergência</Link><button>Maturidade</button><Link href="/laboratorio/biblioteca">Fontes</Link></div>
    <div className="domain-ledger">{labPillars.map(p=><section id={p.id} key={p.id}><header><b>{p.id}</b><strong>{p.name}</strong><small>{p.verb}</small></header><div>{domainsForPillar(p.id).map(d=><Link className="domain-entry" key={d.id} title={d.definition} href={"/laboratorio/dominios/"+d.id}><span>{d.levelId}</span><strong>{d.name}</strong></Link>)}</div></section>)}</div>
    <div className="grimoire-stats"><div><strong>{labDomains.length}/49</strong><span>domínios canônicos carregados</span></div><div className="status-stack"><span><b className="seal approved"/> APPROVED_ARCHITECTURE_V1</span><span><b className="seal candidate"/> {semanticEdgeCount} relações semânticas revisadas</span><span><b className="seal unresolved"/> UNKNOWN permanece explícito</span></div></div>
    <p className="epistemic-note">A tela lê o registry canônico. Visualização não promove conteúdo nem cria correspondências.</p>
   </article>
  </section>
  <footer className="grimoire-command"><CodexSearch items={searchItems}/><div><span className="pulse"/> Laboratório · read-only</div></footer>
 </main>
}
