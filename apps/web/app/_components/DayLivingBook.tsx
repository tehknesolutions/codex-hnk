import type { ReactNode } from 'react';
import { CodexPage, CodexSpread } from './LivingBook';
import { MetricStrip } from './MetricStrip';
import { DayChamberShell } from './journey/DayChamberShell';

type DayLivingBookProps = { day:string; sphere:string; title:string; subtitle?:string; children:ReactNode; previousHref?:string; nextHref?:string };

export function DayLivingBook({ day, sphere, title, subtitle, children }: DayLivingBookProps) {
  return <main className="day-chamber day-chamber--living-book">
    <header className="day-chamber__masthead"><span className="kicker">CODEX · {sphere} · {day}</span><h1>{title}</h1>{subtitle?<p>{subtitle}</p>:null}</header>
    <MetricStrip metrics={[{label:'Day',value:day},{label:'Esfera',value:sphere},{label:'Modo',value:'JORNADA'}]}/>
    <div className="living-book-stage day-living-book" id={`day-${day}-codex`}>
      <CodexSpread label={`Day ${day} · ${title}`} spreadId={`day-${day}`}>
        <CodexPage side="left" eyebrow={`JORNADA · DAY ${day}`} title={title}>{subtitle?<p className="living-book__lead">{subtitle}</p>:null}<div className="day-living-book__seal" aria-hidden="true"><span>{day}</span></div></CodexPage>
        <CodexPage side="right" eyebrow="CONTEÚDO CANÔNICO" title="Câmara"><DayChamberShell day={day}><div className="day-chamber__content">{children}</div></DayChamberShell></CodexPage>
      </CodexSpread>
    </div>
  </main>;
}
