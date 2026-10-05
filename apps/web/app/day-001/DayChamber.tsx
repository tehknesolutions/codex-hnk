import type { ReactNode } from "react";
import { CodexPage, CodexSpread } from "../_components/LivingBook";
import { MetricStrip } from "../_components/MetricStrip";

type Props = {
  children: ReactNode;
  day: string;
  title: string;
  subtitle: string;
};

export function DayChamber({ children, day, title, subtitle }: Props) {
  return (
    <main className="day-chamber day-chamber--living-book">
      <header className="day-chamber__masthead">
        <span className="kicker">CODEX · KETHER · {day}</span>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </header>

      <MetricStrip metrics={[
        { label: "Day", value: day },
        { label: "Esfera", value: "KETHER" },
        { label: "Modo", value: "JORNADA" },
      ]} />

      <div className="living-book-stage day-living-book" id={`day-${day}-codex`}>
        <CodexSpread label={`Day ${day} · ${title}`} spreadId={`day-${day}`}>
          <CodexPage side="left" eyebrow={`JORNADA · DAY ${day}`} title={title}>
            <p className="living-book__lead">{subtitle}</p>
            <div className="day-living-book__seal" aria-hidden="true"><span>{day}</span></div>
            <nav className="day-living-book__nav" aria-label={`Navegação do Day ${day}`}>
              <a href="/">← CODEX</a>
              <a href={`/?spread=pratica#living-book`}>MAPA DA JORNADA</a>
            </nav>
          </CodexPage>
          <CodexPage side="right" eyebrow="CONTEÚDO CANÔNICO" title="Câmara">
            <div className="day-chamber__content">{children}</div>
          </CodexPage>
        </CodexSpread>
      </div>
    </main>
  );
}
