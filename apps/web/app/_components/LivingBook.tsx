import type { ReactNode } from 'react';

type BookPageProps = {
  side: 'left' | 'right';
  eyebrow?: string;
  title: string;
  children: ReactNode;
};

export function CodexPage({ side, eyebrow, title, children }: BookPageProps) {
  return (
    <section className="living-book__page" data-side={side}>
      <div className="living-book__page-frame" aria-hidden="true" />
      <header className="living-book__page-head">
        {eyebrow ? <p>{eyebrow}</p> : null}
        <h2>{title}</h2>
      </header>
      <div className="living-book__page-content">{children}</div>
      <span className="living-book__folio" aria-hidden="true">HNK</span>
    </section>
  );
}

export function CodexSpread({ children, label }: { children: ReactNode; label: string }) {
  return (
    <article className="living-book" aria-label={label}>
      <div className="living-book__cover" aria-hidden="true" />
      <div className="living-book__paper">
        <div className="living-book__spread">{children}</div>
        <div className="living-book__gutter" aria-hidden="true" />
      </div>
    </article>
  );
}

export function CodexPageTabs({ tabs }: { tabs: Array<{ label: string; href: string; active?: boolean }> }) {
  return (
    <nav className="living-book__tabs" aria-label="Seções desta abertura">
      {tabs.map((tab) => (
        <a key={tab.label} href={tab.href} aria-current={tab.active ? 'page' : undefined}>{tab.label}</a>
      ))}
    </nav>
  );
}

export function LivingBookPrototype() {
  return (
    <div className="living-book-stage" id="living-book">
      <CodexPageTabs tabs={[
        { label: 'VISÃO', href: '#living-book', active: true },
        { label: 'MAPA', href: '#arvore' },
        { label: 'FONTES', href: '#arquivo' },
        { label: 'PRÁTICA', href: '/day-001' },
      ]} />
      <CodexSpread label="Abertura inicial do Codex HNK">
        <CodexPage side="left" eyebrow="CODEX HNK · ABERTURA" title="O Códice Vivo">
          <p className="living-book__lead">Uma superfície para atravessar conhecimento, relações, fontes e prática sem abandonar o mesmo artefato.</p>
          <div className="living-book__sigil" aria-hidden="true"><span>HNK</span></div>
          <blockquote>“Todo conhecimento é um portal.”</blockquote>
        </CodexPage>
        <CodexPage side="right" eyebrow="NAVEGAÇÃO DO SISTEMA" title="Do mapa à manifestação">
          <div className="living-book__routes">
            <a href="#arvore"><b>ÁRVORE HNK</b><span>estrutura e relações</span></a>
            <a href="/day-001"><b>JORNADA</b><span>109 Days em prática</span></a>
            <a href="#arquivo"><b>BIBLIOTECA</b><span>fontes e proveniência</span></a>
          </div>
          <p className="living-book__note">Esta abertura é uma primitive estrutural M2. Conteúdo ainda não confirmado permanece fora do cânone.</p>
        </CodexPage>
      </CodexSpread>
    </div>
  );
}