import Link from 'next/link';

const pillars = [
  ['Espiritualidade', 'orientar', '✦'],
  ['Magia', 'transformar', '✧'],
  ['Ciência', 'investigar', '◈'],
  ['Filosofia', 'compreender', '◇'],
  ['Arte', 'expressar', '✺'],
  ['TEHKNE', 'instrumentalizar', '⌘'],
  ['Práxis', 'manifestar', '✥'],
] as const;

export default function LaboratoryPage() {
  return (
    <main className="grimoire-stage" data-hnk-theme="living-grimoire">
      <header className="grimoire-masthead">
        <div><span className="mast-sigil">✦</span><strong>HNK</strong><small>CODEX · LIVING GRIMOIRE</small></div>
        <nav aria-label="Navegação do Codex">
          <Link href="/">Início</Link><a href="#pilares">Pilares</a><a href="#matriz">Matriz</a><a href="#fontes">Fontes</a>
        </nav>
        <span className="canon-chip">KNOWLEDGE GRAPH</span>
      </header>

      <section className="grimoire-book" aria-label="Codex HNK aberto">
        <div className="book-spine" aria-hidden="true"><span>H</span><span>N</span><span>K</span></div>

        <article className="grimoire-page left-page" id="pilares">
          <div className="page-corner corner-a"/><div className="page-corner corner-b"/>
          <p className="folio-kicker">HNK · SETE PILARES</p>
          <h1>Mapa do Ser, Saber e Fazer</h1>
          <p className="folio-lead">CONSCIÊNCIA → CRIAÇÃO → TRANSFORMAÇÃO → MANIFESTAÇÃO</p>
          <div className="pillar-wheel">
            <div className="wheel-rings" aria-hidden="true"/>
            <div className="wheel-core"><span>HNK</span><small>7 × 7</small></div>
            {pillars.map(([name,verb,glyph],i)=>(
              <button className={"pillar-node node-"+(i+1)} key={name} title={name}>
                <span className="pillar-glyph" aria-hidden="true">{glyph}</span>
                <strong>{name}</strong><small>{verb}</small>
              </button>
            ))}
          </div>
          <blockquote>“O conhecimento torna-se vivo quando pode ser explorado, relacionado e manifestado.”</blockquote>
        </article>

        <article className="grimoire-page right-page" id="matriz">
          <div className="page-corner corner-c"/><div className="page-corner corner-d"/>
          <p className="folio-kicker">MAPA DO CONHECIMENTO</p>
          <h2>49 Domínios Fundamentais</h2>
          <div className="grimoire-tabs" role="tablist" aria-label="Visões do conhecimento">
            <button className="active">Visão</button><button>Convergência</button><button>Maturidade</button><button>Fontes</button>
          </div>
          <div className="domain-matrix" aria-label="Prévia da matriz HNK 7 por 7">
            {pillars.map(([name],r)=><div className="matrix-row" key={name}>
              <span>{name}</span>
              {pillars.map((_,c)=><i key={c} className={(r===c||Math.abs(r-c)===2)?'lit':''} aria-hidden="true"/>)}
            </div>)}
          </div>
          <div className="grimoire-stats">
            <div><strong>49/49</strong><span>cobertura documental candidata</span></div>
            <div className="status-stack">
              <span><b className="seal source"/> SOURCE_ASSERTED</span>
              <span><b className="seal candidate"/> HNK_CANDIDATE</span>
              <span><b className="seal approved"/> HNK_APPROVED</span>
              <span><b className="seal unresolved"/> UNRESOLVED</span>
            </div>
          </div>
          <p className="epistemic-note">Cobertura não é maturidade. Ausência de vínculo materializado não significa ausência de relação.</p>
        </article>
      </section>

      <footer className="grimoire-command">
        <label><span>⌕</span><input aria-label="Buscar no Codex" placeholder="Buscar conceito, domínio, fonte ou glifo…"/></label>
        <div><span className="pulse"/> Laboratório · contrato read-only</div>
      </footer>
    </main>
  );
}
