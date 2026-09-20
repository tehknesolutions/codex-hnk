import Link from 'next/link';
import external from '../../../../../data/library/library.sources.registry.json';
import internal from '../../../../../data/library/internal.sources.registry.json';
import b1 from '../../../../../data/library/expansion.batch-001.json';
import b2 from '../../../../../data/library/expansion.batch-002.json';
import ib1 from '../../../../../data/library/internal.batch-001.json';
import ib2 from '../../../../../data/library/internal.batch-002.json';

const audited=new Map<string,number>();
for(const s of [...b1.sources,...b2.sources])audited.set(s.source_id,s.concepts.length);
const internalCounts=new Map<string,number>();
for(const s of [...ib1.sources,...ib2.sources])internalCounts.set(s.id,(internalCounts.get(s.id)??0)+s.concepts.length);
const clean=(s:string)=>s.replace(/\.pdf$|\.mobi$/i,'').replace(/^\d+-/,'').replaceAll('-',' ');

export default function LibraryPage(){
 return <main className="library-stage"><header className="library-head"><Link href="/laboratorio">← Grimório</Link><div><p>HNK · CORPUS</p><h1>Biblioteca do Codex</h1></div><span>{external.sources.length} fontes · {internal.sources.length} repositórios</span></header>
 <section className="library-book"><article className="library-page"><p className="folio-kicker">CORPUS EXTERNO</p><h2>Manuscritos & Fontes</h2><p className="library-intro">Fontes preservadas em seus próprios termos. Inventário não significa endosso, cânone ou auditoria completa.</p><div className="shelf">{external.sources.map(s=><Link className="book-card" href={"/laboratorio/biblioteca/fontes/"+s.source_id} key={s.source_id}><span className={"book-spine-mini "+s.format}>{s.format.toUpperCase()}</span><div><b>{s.source_id}</b><strong>{clean(s.title)}</strong><small>{audited.has(s.source_id)?audited.get(s.source_id)+" conceitos materializados":"CONTENT AUDIT PENDING"}</small></div></Link>)}</div></article>
 <article className="library-page internal-library"><p className="folio-kicker">CORPUS INTERNO</p><h2>Obras da Tehkné</h2><p className="library-intro">Produção documental e computacional do ecossistema HNK. Evidência interna não promove automaticamente conteúdo ao cânone.</p><div className="repo-shelf">{internal.sources.map(s=><article key={s.id}><span>⌘</span><div><b>{s.id}</b><strong>{s.repository}</strong><small>{s.status} · {internalCounts.get(s.id)??0} conceitos materializados</small></div></article>)}</div><div className="library-law"><b>PROVENIÊNCIA PRIMEIRO</b><p>Fonte → conceito → domínio → relação → decisão HNK.</p><small>NO AUTOMATIC CANON PROMOTION · N:N MAPPING</small></div></article></section></main>
}
