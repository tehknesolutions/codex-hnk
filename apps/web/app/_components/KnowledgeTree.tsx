import Link from "next/link";
import { hnkTreeNodes } from "../../../../packages/visual-contract/src/tree";

const ranges: Record<string, string> = {
  keter: "001—036",
  chokhmah: "037—072",
  binah: "073+",
};

export function KnowledgeTree(){return <section className="knowledge-tree" id="arvore" aria-labelledby="knowledge-tree-title"><header className="knowledge-tree__header"><div><span className="kicker">KNOWLEDGE MAP · TRÍADE I</span><h2 id="knowledge-tree-title">Árvore de Conhecimento</h2></div><p>Navegação estrutural por níveis. O estado visual acompanha a disponibilidade real da Jornada e não cria rotas para câmaras inexistentes.</p></header><div className="knowledge-tree__stage" role="list" aria-label="Níveis da árvore HNK">{hnkTreeNodes.map((node)=><div className="knowledge-tree__branch" role="listitem" key={node.id}>{node.href?<Link className="knowledge-tree__node" data-state={node.state} href={node.href} aria-current={node.state==="active"?"page":undefined}><span className="knowledge-tree__index">{node.index}</span><strong>{node.label}</strong><small>{ranges[node.id]}</small></Link>:<div className="knowledge-tree__node" data-state={node.state} aria-disabled="true"><span className="knowledge-tree__index">{node.index}</span><strong>{node.label}</strong><small>{ranges[node.id]} · AGUARDA CONTEÚDO</small></div>}</div>)}</div></section>}
