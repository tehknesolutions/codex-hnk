'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

const primaryNav = [
  ['INÍCIO', '/'],
  ['JORNADA', '/day-001'],
  ['ÁRVORE HNK', '/#arvore'],
] as const;

function sectionFor(pathname: string) {
  if (pathname.startsWith('/day-')) return 'JORNADA';
  return 'INÍCIO';
}

export function CodexShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const active = sectionFor(pathname);

  return (
    <div className="codex-app-shell" data-section={active.toLowerCase()}>
      <header className="codex-app-topbar">
        <a className="codex-app-brand" href="/" aria-label="CODEX HNK — início">
          <span className="codex-app-brand__seal" aria-hidden="true">HNK</span>
          <span><b>CODEX HNK</b><small>TEHKNE SOLUTIONS</small></span>
        </a>
        <div className="codex-app-location" aria-label="Localização atual">
          <small>VOCÊ ESTÁ EM</small><strong>{active}</strong>
        </div>
        <a className="codex-app-search" href="/#arquivo" aria-label="Abrir busca e arquivo do Codex">⌕ <span>BUSCAR NO CODEX</span></a>
      </header>

      <aside className="codex-app-nav" aria-label="Navegação do Codex">
        <div className="codex-app-nav__mark" aria-hidden="true">◇</div>
        <nav>
          {primaryNav.map(([label, href]) => (
            <a key={label} href={href} aria-current={active === label ? 'page' : undefined}>
              <span aria-hidden="true">✦</span>{label}
            </a>
          ))}
          <a href="/#arquivo"><span aria-hidden="true">▤</span>FÓLIO 1096</a>
          <a href="/#arquivo"><span aria-hidden="true">◫</span>BIBLIOTECA</a>
          <a href="/#arquivo"><span aria-hidden="true">✧</span>HENUVOKODAN</a>
          <a href="/#arquivo"><span aria-hidden="true">△</span>LABS</a>
        </nav>
        <div className="codex-app-nav__formula">705 · 26 · 365</div>
      </aside>

      <main className="codex-app-viewport" id="codex-viewport">{children}</main>

      <aside className="codex-app-context" aria-label="Contexto do Codex">
        <p className="codex-app-context__eyebrow">SISTEMA HNK</p>
        <h2>{active}</h2>
        <p>O contexto desta câmara será revelado por dados canônicos à medida que o Living Book Engine for conectado.</p>
        <div className="codex-app-context__rule" />
        <small>“Todo conhecimento é um portal.”</small>
      </aside>
    </div>
  );
}