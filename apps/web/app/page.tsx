import { PortalHome } from "./_components/PortalHome";
import { KnowledgeTree } from "./_components/KnowledgeTree";
import { LivingBookPrototype } from "./_components/LivingBook";

export default function Home() {
  return (
    <main className="codex-shell">
      <div className="grain" aria-hidden="true" />
      <header className="topbar">
        <a className="brand" href="/" aria-label="HNK Codex — início">
          <span className="brand-mark">HNK</span>
          <span>CODEX · 365</span>
        </a>
        <nav className="topnav" aria-label="Navegação principal">
          <a href="#arvore">ÁRVORE</a>
          <a href="/day-001">JORNADA</a>
          <a href="#arquivo">ARQUIVO</a>
        </nav>
        <span className="edition">FÓLIO 1096 · VII</span>
      </header>

      <section className="hero" aria-labelledby="codex-title">
        <div className="hero-copy">
          <p className="kicker">HNK · SACRED EDITORIAL FANTASY</p>
          <h1 id="codex-title"><span>CODEX</span><em>HNK</em></h1>
          <p className="hero-lead">Um códice vivo. Uma arquitetura de conhecimento, prática e transformação percorrida como experiência — não como slideshow.</p>
          <div className="hero-actions">
            <a className="primary" href="#living-book">ABRIR O CODEX <span>↗</span></a>
            <a className="secondary" href="#arvore">VER O MAPA</a>
          </div>
        </div>

        <div className="sigil-stage" aria-label="Árvore HNK — tríade inicial">
          <div className="orbit orbit-a" />
          <div className="orbit orbit-b" />
          <div className="axis" />
          <div className="sphere sphere-k"><b>Ⅰ</b><span>KETHER</span></div>
          <div className="sphere sphere-c"><b>Ⅱ</b><span>CHOKHMAH</span></div>
          <div className="sphere sphere-b"><b>Ⅲ</b><span>BINAH</span></div>
          <div className="seal">H<br/>N<br/>K</div>
        </div>
      </section>

      <LivingBookPrototype />
      <PortalHome />
      <KnowledgeTree />

      <section className="archive" id="arquivo">
        <p className="archive-number">365</p>
        <div><p className="kicker">OPERATIO · UM CICLO COMPLETO</p><h2>Conhecimento que se atravessa.</h2><p>Cada Day é uma câmara. Manuscrito, mapa, artefato, laboratório, oráculo, quest, espelho e revelação compõem uma experiência contínua de estudo e prática.</p></div>
      </section>

      <footer><span>HNK CODEX INTERATIVO</span><span>705 LUX · 26 VERBUM · 365 OPERATIO</span><span>MMXXVI</span></footer>
    </main>
  );
}
